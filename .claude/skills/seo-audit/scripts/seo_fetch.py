#!/usr/bin/env python3
"""Collecte bornee et gardee pour /seo-audit -- stdlib seule.

Ce que fait ce script, et rien d'autre :
  - valide l'URL (http/https, sans identifiants, ports 80/443/8080/8443) ;
  - resout le nom, REFUSE toute destination non publique (loopback, RFC1918,
    CGNAT/tailnet, link-local, metadonnees cloud, multicast, ULA, NAT64/6to4
    vers une IPv4 interne...) et se connecte A L'IP VALIDEE (pas de seconde
    resolution : pas de DNS rebinding) ; recommence a chaque redirection ;
  - lit robots.txt et le respecte pour son propre agent ;
  - echantillonne au plus --max-pages pages HTML, par familles d'URL ;
  - une requete a la fois, avec un delai ; s'arrete sur 429/503 ;
  - ecrit les preuves dans --out (umask 077).

Il n'execute rien de ce qu'il lit. Aucun en-tete d'authentification, aucun
cookie n'est envoye ni conserve.

Usage :
  python3 -I seo_fetch.py <URL> --out <dossier> [--max-pages 50] [--delay 1.0]
"""
import argparse
import gzip
import hashlib
import http.client
import io
import ipaddress
import json
import os
import random
import re
import socket
import ssl
import string
import sys
import time
import urllib.robotparser
import xml.etree.ElementTree as ET
from datetime import datetime, timezone
from urllib.parse import urljoin, urlsplit, urlunsplit, parse_qsl, urlencode

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from seo_extract import extract  # noqa: E402

VERSION = "1.0.0"
UA_TOKEN = "SEO-Architect-Audit"
UA = f"Mozilla/5.0 (compatible; {UA_TOKEN}/{VERSION}; audit ponctuel)"
ALLOWED_PORTS = {80, 443, 8080, 8443}
MAX_REDIRECTS = 5
TIMEOUT = 15
MAX_HTML_BYTES = 5 * 1024 * 1024
MAX_SITEMAP_BYTES = 10 * 1024 * 1024
MAX_SITEMAP_URLS = 5000
MAX_CHILD_SITEMAPS = 3
NON_HTML_EXT = re.compile(
    r"\.(pdf|jpe?g|png|gif|webp|avif|svg|ico|css|js|mjs|json|xml|txt|zip|gz|"
    r"rar|7z|mp[34]|m4a|webm|mov|avi|woff2?|ttf|eot|docx?|xlsx?|pptx?|csv)$", re.I)
# Chemins a ne jamais visiter : actions, administration, comptes, API.
UNSAFE_PATH = re.compile(
    r"(^|/)(wp-admin|wp-login\.php|admin|administrator|login|logout|signin|"
    r"sign-in|signout|register|account|my-account|cart|checkout|panier|"
    r"commande|basket|api|graphql|delete|remove|unsubscribe|xmlrpc\.php|"
    r"cgi-bin|\.git|\.env)(/|$|\?)", re.I)
SENSITIVE_PARAMS = re.compile(
    r"^(token|access_token|auth|key|api_key|apikey|sig|signature|session|"
    r"sessionid|sid|phpsessid|jsessionid|password|pwd|code|state|"
    r"x-amz-.*|x-goog-.*)$", re.I)
AI_BOTS = ["GPTBot", "OAI-SearchBot", "ChatGPT-User", "ClaudeBot",
           "Claude-SearchBot", "Claude-User", "PerplexityBot",
           "Google-Extended", "CCBot", "Applebot-Extended"]


class Blocked(Exception):
    """Destination refusee par le garde -- aucune connexion n'a eu lieu."""


# ---------------------------------------------------------------------------
# Garde reseau
# ---------------------------------------------------------------------------
def _embedded_v4(ip):
    """IPv4 cachees dans une IPv6 : ::ffff:a.b.c.d, NAT64, 6to4, Teredo."""
    out = []
    if ip.version != 6:
        return out
    if ip.ipv4_mapped:
        out.append(ip.ipv4_mapped)
    if ip.sixtofour:
        out.append(ip.sixtofour)
    if ip.teredo:
        out.extend(ip.teredo)
    if ip in ipaddress.ip_network("64:ff9b::/96") or ip in ipaddress.ip_network("64:ff9b:1::/48"):
        out.append(ipaddress.IPv4Address(int(ip) & 0xFFFFFFFF))
    return out


def ip_is_public(ip):
    ip = ipaddress.ip_address(ip)
    for v4 in _embedded_v4(ip):
        if not ip_is_public(v4):
            return False
    if ip.is_multicast or ip.is_unspecified or ip.is_reserved or ip.is_loopback \
            or ip.is_link_local or ip.is_private:
        return False
    return ip.is_global


def check_url(url):
    """Valide la forme d'une URL. Rend (scheme, host, port, chemin+requete)."""
    if not isinstance(url, str) or len(url) > 2048 or any(c in url for c in "\r\n\t\x00 "):
        raise Blocked("URL mal formee")
    p = urlsplit(url)
    if p.scheme not in ("http", "https"):
        raise Blocked(f"schema refuse : {p.scheme or 'aucun'}")
    if p.username is not None or p.password is not None or "@" in p.netloc:
        raise Blocked("identifiants dans l'URL refuses")
    host = (p.hostname or "").rstrip(".").lower()
    if not host:
        raise Blocked("hote absent")
    try:
        port = p.port or (443 if p.scheme == "https" else 80)
    except ValueError:
        raise Blocked("port invalide")
    if port not in ALLOWED_PORTS:
        raise Blocked(f"port refuse : {port}")
    if host == "localhost" or host.endswith((".localhost", ".local", ".internal",
                                             ".lan", ".home.arpa", ".ts.net")):
        raise Blocked(f"nom non public : {host}")
    try:
        host.encode("idna")
    except UnicodeError:
        raise Blocked("nom d'hote invalide")
    path = p.path or "/"
    if p.query:
        path += "?" + p.query
    return p.scheme, host, port, path


def resolve_public(host, port, resolver=None):
    """Resout `host` ; TOUTES les adresses doivent etre publiques. Rend l'IP
    a laquelle se connecter."""
    try:
        literal = ipaddress.ip_address(host.strip("[]"))
        addrs = [str(literal)]
    except ValueError:
        resolver = resolver or (lambda h, p: [ai[4][0] for ai in socket.getaddrinfo(
            h, p, type=socket.SOCK_STREAM)])
        try:
            addrs = list(dict.fromkeys(resolver(host, port)))
        except (socket.gaierror, UnicodeError, OSError) as e:
            raise Blocked(f"resolution DNS impossible : {e}")
    if not addrs:
        raise Blocked("aucune adresse")
    bad = [a for a in addrs if not ip_is_public(a.split("%")[0])]
    if bad:
        raise Blocked(f"destination non publique : {', '.join(bad)}")
    return addrs[0]


class _PinnedHTTP(http.client.HTTPConnection):
    def __init__(self, host, ip, port, timeout):
        super().__init__(host, port, timeout=timeout)
        self._ip = ip

    def connect(self):
        self.sock = socket.create_connection((self._ip, self.port), self.timeout)


class _PinnedHTTPS(http.client.HTTPSConnection):
    def __init__(self, host, ip, port, timeout):
        super().__init__(host, port, timeout=timeout, context=ssl.create_default_context())
        self._ip = ip

    def connect(self):
        sock = socket.create_connection((self._ip, self.port), self.timeout)
        self.sock = self._context.wrap_socket(sock, server_hostname=self.host)


def default_transport(scheme, host, ip, port, path, max_bytes):
    cls = _PinnedHTTPS if scheme == "https" else _PinnedHTTP
    conn = cls(host, ip, port, TIMEOUT)
    try:
        conn.request("GET", path, headers={
            "User-Agent": UA,
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.5",
            "Accept-Language": "fr,en;q=0.8",
            "Accept-Encoding": "identity",
        })
        r = conn.getresponse()
        headers = [(k.lower(), v) for k, v in r.getheaders()]
        ctype = r.getheader("content-type", "") or ""
        body = b""
        if r.status < 300 or r.status >= 400:
            if any(t in ctype.lower() for t in ("html", "xml", "text", "gzip", "octet")) or not ctype:
                body = r.read(max_bytes + 1)
        return r.status, headers, body
    finally:
        conn.close()


def redact_url(url):
    """Retire les parametres sensibles d'une URL avant de l'ecrire."""
    p = urlsplit(url)
    if not p.query:
        return url
    q = [(k, "REDACTED" if SENSITIVE_PARAMS.match(k) else v)
         for k, v in parse_qsl(p.query, keep_blank_values=True)]
    return urlunsplit((p.scheme, p.netloc, p.path, urlencode(q), p.fragment))


# ---------------------------------------------------------------------------
# Recuperation d'une URL, redirections gardees
# ---------------------------------------------------------------------------
class Fetcher:
    def __init__(self, scope_hosts, transport=None, resolver=None, delay=1.0,
                 clock=time.monotonic, sleep=time.sleep):
        self.scope = set(scope_hosts)
        self.transport = transport or default_transport
        self.resolver = resolver
        self.delay = delay
        self.clock, self.sleep = clock, sleep
        self._last = None
        self.requests = 0
        self.stop_reason = None

    def _pace(self):
        if self._last is not None:
            wait = self.delay - (self.clock() - self._last)
            if wait > 0:
                self.sleep(wait)
        self._last = self.clock()

    def get(self, url, max_bytes=MAX_HTML_BYTES, follow=True):
        """Rend un enregistrement de preuve. Ne leve jamais : un refus ou une
        erreur devient un champ `error` / `blocked`."""
        rec = {"requested_url": redact_url(url), "chain": [], "status": None,
               "final_url": None, "headers": {}, "blocked": None, "error": None,
               "elapsed_ms": None, "truncated": False,
               "captured_at": datetime.now(timezone.utc).isoformat(timespec="seconds")}
        current = url
        for hop in range(MAX_REDIRECTS + 1):
            try:
                scheme, host, port, path = check_url(current)
                if host not in self.scope:
                    raise Blocked(f"hors perimetre : {host}")
                ip = resolve_public(host, port, self.resolver)
            except Blocked as e:
                rec["blocked"] = str(e)
                return rec, b""
            if self.stop_reason:
                rec["error"] = f"collecte arretee : {self.stop_reason}"
                return rec, b""
            self._pace()
            t0 = time.monotonic()
            try:
                status, headers, body = self.transport(scheme, host, ip, port, path, max_bytes)
            except (OSError, http.client.HTTPException, ssl.SSLError) as e:
                rec["error"] = f"{type(e).__name__}: {str(e)[:200]}"
                return rec, b""
            finally:
                self.requests += 1
            rec["elapsed_ms"] = int((time.monotonic() - t0) * 1000)
            hdr = {}
            for k, v in headers:
                if k in ("set-cookie", "authorization", "www-authenticate", "cookie"):
                    continue
                hdr[k] = (hdr[k] + ", " + v) if k in hdr else v
            rec["chain"].append({"url": redact_url(current), "status": status,
                                 "location": hdr.get("location")})
            rec["status"], rec["headers"] = status, _keep_headers(hdr)
            if status in (429, 503):
                ra = hdr.get("retry-after")
                self.stop_reason = f"HTTP {status}" + (f", Retry-After {ra}" if ra else "")
            if status in (301, 302, 303, 307, 308) and hdr.get("location") and follow:
                if hop == MAX_REDIRECTS:
                    rec["error"] = f"plus de {MAX_REDIRECTS} redirections"
                    return rec, b""
                current = urljoin(current, hdr["location"].strip())
                continue
            rec["final_url"] = redact_url(current)
            if len(body) > max_bytes:
                body, rec["truncated"] = body[:max_bytes], True
            return rec, body
        return rec, b""


KEPT_HEADERS = ("content-type", "content-language", "x-robots-tag", "link", "location",
            "cache-control", "vary", "server", "strict-transport-security",
            "content-length", "last-modified", "etag", "retry-after", "refresh")


def _keep_headers(h):
    return {k: v[:500] for k, v in h.items() if k in KEPT_HEADERS}


# ---------------------------------------------------------------------------
# robots.txt et sitemaps
# ---------------------------------------------------------------------------
def parse_robots(text):
    rp = urllib.robotparser.RobotFileParser()
    rp.parse(text.splitlines())
    return rp


def robots_summary(rp, home):
    out = {"googlebot_home": rp.can_fetch("Googlebot", home),
           "bingbot_home": rp.can_fetch("Bingbot", home),
           "self_home": rp.can_fetch(UA_TOKEN, home),
           "ai_bots_home": {b: rp.can_fetch(b, home) for b in AI_BOTS}}
    return out


def parse_sitemap(data):
    """Rend (type, [loc], nb_lastmod, erreur). Refuse DOCTYPE/ENTITY."""
    head = data[:4096].lower()
    if b"<!doctype" in head or b"<!entity" in data.lower():
        return None, [], 0, "DOCTYPE/ENTITY refuse (XML non sur)"
    locs, lastmod, kind = [], 0, None
    try:
        for _, el in ET.iterparse(io.BytesIO(data), events=("end",)):
            tag = el.tag.rsplit("}", 1)[-1]
            if kind is None and tag in ("urlset", "sitemapindex"):
                kind = tag
            if tag == "loc" and el.text and len(locs) < MAX_SITEMAP_URLS:
                locs.append(el.text.strip())
            elif tag == "lastmod":
                lastmod += 1
            elif tag in ("url", "sitemap"):
                el.clear()
    except ET.ParseError as e:
        return kind, locs, lastmod, f"XML invalide : {e}"
    return kind or "inconnu", locs, lastmod, None


def maybe_gunzip(body, url):
    if url.endswith(".gz") or body[:2] == b"\x1f\x8b":
        try:
            with gzip.GzipFile(fileobj=io.BytesIO(body)) as g:
                return g.read(MAX_SITEMAP_BYTES + 1)[:MAX_SITEMAP_BYTES]
        except OSError:
            return b""
    return body


# ---------------------------------------------------------------------------
# Echantillonnage
# ---------------------------------------------------------------------------
def family(url):
    p = urlsplit(url)
    segs = [s for s in p.path.split("/") if s]
    first = segs[0] if segs else ""
    if re.fullmatch(r"[a-z]{2}(-[a-z]{2})?", first, re.I) and len(segs) > 1:
        first = f"{first}/{segs[1]}"          # /fr/blog -> fr/blog
    return first + ("?" if p.query else "")


def candidate_ok(url, scope):
    p = urlsplit(url)
    if p.scheme not in ("http", "https") or (p.hostname or "") not in scope:
        return False
    if NON_HTML_EXT.search(p.path) or UNSAFE_PATH.search(p.path + ("?" if p.query else "")):
        return False
    if p.query and any(SENSITIVE_PARAMS.match(k) for k, _ in parse_qsl(p.query)):
        return False
    if p.query.count("&") >= 3:              # facettes profondes : piege de crawl
        return False
    return True


class Sampler:
    """Choisit la prochaine URL : d'abord l'accueil, puis la navigation, puis
    tour a tour par famille la moins representee. Rend l'ordre explicable."""

    def __init__(self):
        self.pool = {}        # url -> {"depth":, "source":, "order":}
        self.done = set()
        self.per_family = {}
        self._n = 0

    def add(self, url, depth, source, nav=False):
        if url in self.done:
            return
        cur = self.pool.get(url)
        if cur is None:
            self._n += 1
            self.pool[url] = {"depth": depth, "source": source, "nav": nav, "order": self._n}
        else:
            if depth is not None and (cur["depth"] is None or depth < cur["depth"]):
                cur["depth"] = depth
            cur["nav"] = cur["nav"] or nav

    def next(self):
        if not self.pool:
            return None
        def key(item):
            url, m = item
            fam = family(url)
            return (0 if m["nav"] and self.per_family.get(fam, 0) == 0 else 1,
                    self.per_family.get(fam, 0), m["order"])
        url, meta = min(self.pool.items(), key=key)
        del self.pool[url]
        self.done.add(url)
        fam = family(url)
        self.per_family[fam] = self.per_family.get(fam, 0) + 1
        return url, meta


# ---------------------------------------------------------------------------
# Collecte
# ---------------------------------------------------------------------------
def www_toggle(host):
    return host[4:] if host.startswith("www.") else "www." + host


def run(start_url, out_dir, max_pages=50, delay=1.0, transport=None, resolver=None,
        sleep=time.sleep):
    os.umask(0o077)
    started = datetime.now(timezone.utc)
    os.makedirs(os.path.join(out_dir, "evidence", "pages"), exist_ok=True)
    os.makedirs(os.path.join(out_dir, "evidence", "html"), exist_ok=True)
    manifest = {
        "tool": "seo_fetch.py", "version": VERSION, "python": sys.version.split()[0],
        "user_agent": UA, "start_url": redact_url(start_url),
        "started_at_utc": started.isoformat(timespec="seconds"),
        "started_at_local": started.astimezone().isoformat(timespec="seconds"),
        "limits": {"max_pages": max_pages, "delay_s": delay, "concurrency": 1,
                   "max_redirects": MAX_REDIRECTS, "timeout_s": TIMEOUT,
                   "max_html_bytes": MAX_HTML_BYTES, "max_sitemap_bytes": MAX_SITEMAP_BYTES},
        "not_done": ["rendu JavaScript (DOM) : seo_fetch lit le HTML initial seulement",
                     "Core Web Vitals terrain (CrUX/RUM)", "Search Console / analytics",
                     "liens internes non echantillonnes : statut non verifie"],
        # Ces en-tetes sont TOUJOURS conserves quand la reponse les porte : leur
        # absence d'un enregistrement est donc une observation, pas un oubli.
        "headers_recorded_when_present": list(KEPT_HEADERS),
    }

    def write_manifest(**extra):
        manifest.update(extra)
        manifest["finished_at_utc"] = datetime.now(timezone.utc).isoformat(timespec="seconds")
        _dump(os.path.join(out_dir, "manifest.json"), manifest)

    # https://site.fr et https://site.fr/ sont la meme ressource : sans ce
    # chemin "/", l'accueil etait collecte deux fois (faux titre duplique).
    try:
        p0 = urlsplit(start_url)
        if p0.scheme in ("http", "https") and not p0.path:
            start_url = urlunsplit((p0.scheme, p0.netloc, "/", p0.query, p0.fragment))
    except ValueError:
        pass
    try:
        _, host, _, _ = check_url(start_url)
    except Blocked as e:
        write_manifest(status="NON_VERIFIABLE", blocked=str(e), pages_fetched=0, requests=0)
        _dump(os.path.join(out_dir, "signals.json"), {"site": {"start_blocked": str(e)}, "pages": []})
        return manifest

    scope = {host, www_toggle(host)}
    f = Fetcher(scope, transport=transport, resolver=resolver, delay=delay, sleep=sleep)
    site = {"scope_hosts": sorted(scope)}

    # 1. Accueil -- valide aussi le garde avant toute autre requete.
    home_rec, home_body = f.get(start_url)
    if home_rec["blocked"] or home_rec["error"] or home_rec["status"] is None:
        _dump(os.path.join(out_dir, "evidence", "pages", "0000.json"), home_rec)
        write_manifest(status="NON_VERIFIABLE", pages_fetched=0, requests=f.requests,
                       blocked=home_rec["blocked"], error=home_rec["error"])
        _dump(os.path.join(out_dir, "signals.json"),
              {"site": {"start": home_rec}, "pages": []})
        return manifest
    home_final = home_rec["final_url"] or start_url
    origin = "{0.scheme}://{0.netloc}".format(urlsplit(home_final))

    # 2. robots.txt (de l'origine finale)
    rrec, rbody = f.get(origin + "/robots.txt", max_bytes=512 * 1024)
    robots = {"url": origin + "/robots.txt", "status": rrec["status"],
              "blocked": rrec["blocked"], "error": rrec["error"], "sitemaps": []}
    rp = None
    if rrec["status"] == 200:
        text = rbody.decode("utf-8", errors="replace")
        with open(os.path.join(out_dir, "evidence", "robots.txt"), "w", encoding="utf-8") as fh:
            fh.write(text)
        rp = parse_robots(text)
        robots.update(robots_summary(rp, home_final))
        robots["sitemaps"] = list(rp.site_maps() or [])
        cd = rp.crawl_delay(UA_TOKEN) or rp.crawl_delay("*")
        if cd:
            f.delay = max(f.delay, min(float(cd), 30.0))
            robots["crawl_delay_applied_s"] = f.delay
        robots["interpretation"] = "fichier lu et applique a ce crawler"
    elif rrec["status"] and 400 <= rrec["status"] < 500:
        robots["interpretation"] = ("4xx : Google traite l'absence de robots.txt comme "
                                    "aucune restriction ; ce n'est pas une erreur en soi")
    else:
        robots["interpretation"] = ("robots.txt illisible (5xx/erreur) : collecte limitee a "
                                    "l'accueil par prudence ; Google suspend l'exploration "
                                    "dans ce cas")
        max_pages = 1
    site["robots"] = robots

    def allowed(url):
        return rp is None or rp.can_fetch(UA_TOKEN, url)

    # 3. Sitemaps : declares, sinon /sitemap.xml plausible (une tentative).
    sm_urls = robots["sitemaps"][:5] or [origin + "/sitemap.xml"]
    sitemaps, sm_locs = [], []
    queue = list(sm_urls)
    children = 0
    while queue and not f.stop_reason:
        su = queue.pop(0)
        srec, sbody = f.get(su, max_bytes=MAX_SITEMAP_BYTES)
        entry = {"url": redact_url(su), "status": srec["status"], "blocked": srec["blocked"],
                 "error": srec["error"], "declared_in_robots": su in robots["sitemaps"]}
        if srec["status"] == 200 and sbody:
            kind, locs, nlast, err = parse_sitemap(maybe_gunzip(sbody, su))
            entry.update({"type": kind, "loc_count_read": len(locs), "lastmod_count": nlast,
                          "parse_error": err, "truncated": srec["truncated"]})
            out_scope = [u for u in locs if (urlsplit(u).hostname or "") not in scope]
            entry["loc_out_of_scope"] = len(out_scope)
            if kind == "sitemapindex":
                for child in locs[:MAX_CHILD_SITEMAPS]:
                    if children < MAX_CHILD_SITEMAPS:
                        queue.append(child)
                        children += 1
                entry["children_read"] = min(len(locs), MAX_CHILD_SITEMAPS)
                entry["children_declared"] = len(locs)
            else:
                sm_locs.extend(u for u in locs if (urlsplit(u).hostname or "") in scope)
        sitemaps.append(entry)
    site["sitemaps"] = sitemaps
    sm_set = set(sm_locs)

    # 4. Variantes d'acces (http/https, www/non-www) -- 4 requetes au plus.
    #    Le corps est compare a celui de l'accueil (empreinte) : « meme contenu »
    #    devient une observation au lieu d'une supposition.
    home_sha = hashlib.sha256(home_body).hexdigest() if home_body else None
    variants = {}
    p0 = urlsplit(home_final)
    for sch in ("http", "https"):
        for h in sorted(scope):
            u = f"{sch}://{h}/"
            if u == home_final:
                continue
            vr, vbody = f.get(u, max_bytes=512 * 1024)
            variants[u] = {"status": vr["status"], "final_url": vr["final_url"],
                           "chain": vr["chain"], "blocked": vr["blocked"], "error": vr["error"],
                           "headers": vr["headers"],
                           "body_sha256": hashlib.sha256(vbody).hexdigest() if vbody else None,
                           "same_body_as_home": (hashlib.sha256(vbody).hexdigest() == home_sha)
                           if vbody and home_sha else None}
    site["variants"] = variants

    # 5. Sonde soft-404 : une URL qui ne peut pas exister.
    rnd = "".join(random.choice(string.ascii_lowercase) for _ in range(12))
    probe = f"{origin}/seo-audit-404-{rnd}"
    if allowed(probe):
        pr, pbody = f.get(probe, max_bytes=256 * 1024)
        site["soft404_probe"] = {"url": probe, "status": pr["status"],
                                 "final_url": pr["final_url"], "error": pr["error"],
                                 "body_bytes": len(pbody)}

    # 6. Echantillon de pages.
    sampler = Sampler()
    pages, inlinks = [], {}
    excluded = {"robots": 0, "unsafe_or_non_html": 0}

    def ingest(url, rec, body, meta):
        idx = len(pages)
        ctype = rec["headers"].get("content-type", "")
        page = {"id": f"{idx:04d}", "url": url, "depth": meta.get("depth"),
                "source": meta.get("source"), "in_sitemap": url in sm_set, **rec}
        if body and "html" in ctype.lower():
            html = body.decode(_charset(ctype), errors="replace")
            with open(os.path.join(out_dir, "evidence", "html", f"{idx:04d}.html"),
                      "w", encoding="utf-8") as fh:
                fh.write(html)
            page["html_sha256"] = hashlib.sha256(body).hexdigest()
            ex = extract(html, rec["final_url"] or url)
            links = ex.pop("links")
            page["extract"] = ex
            for l in links:
                if candidate_ok(l["href"], scope):
                    inlinks.setdefault(l["href"], set()).add(url)
                    d = (meta.get("depth") or 0) + 1 if meta.get("depth") is not None else None
                    if allowed(l["href"]):
                        sampler.add(l["href"], d, "lien", nav=l["in_nav"])
        _dump(os.path.join(out_dir, "evidence", "pages", f"{idx:04d}.json"), page)
        pages.append(page)

    # Marquer l'accueil visite AVANT d'en lire les liens : sinon un lien vers
    # "/" le remettait en file et il etait collecte deux fois.
    sampler.done.update({home_final, start_url})
    sampler.per_family[family(home_final)] = 1
    ingest(home_final, home_rec, home_body, {"depth": 0, "source": "depart"})
    for u in sm_locs:
        if candidate_ok(u, scope):
            if allowed(u):
                sampler.add(u, None, "sitemap")
            else:
                excluded["robots"] += 1
        else:
            excluded["unsafe_or_non_html"] += 1

    while len(pages) < max_pages and not f.stop_reason:
        nxt = sampler.next()
        if nxt is None:
            break
        url, meta = nxt
        rec, body = f.get(url)
        ingest(url, rec, body, meta)

    # 7. Signaux deterministes (faits, pas verdicts).
    # sans robots.txt (4xx) : aucune restriction ; illisible (5xx) : inconnu
    no_robots = True if (robots["status"] and 400 <= robots["status"] < 500) else None
    if rp is None:
        robots["googlebot_home"] = no_robots
    by_url = {p["final_url"] or p["url"]: p for p in pages}
    compact = []
    for p in pages:
        ex = p.get("extract") or {}
        canon = (ex.get("canonicals") or [None])[0]
        robots_meta = " ".join(m["content"].lower() for m in ex.get("meta_robots", []))
        xrt = (p["headers"].get("x-robots-tag") or "").lower()
        compact.append({
            "id": p["id"], "url": p["url"], "final_url": p["final_url"], "status": p["status"],
            "redirects": len(p["chain"]) - 1 if p["chain"] else 0, "depth": p["depth"],
            "source": p["source"], "in_sitemap": p["in_sitemap"],
            "googlebot_allowed": rp.can_fetch("Googlebot", p["url"]) if rp else no_robots,
            "noindex": "noindex" in robots_meta or "noindex" in xrt or "none" in robots_meta.split(),
            "noindex_source": ("meta" if "noindex" in robots_meta else "") + ("+header" if "noindex" in xrt else ""),
            "canonical": canon, "canonical_count": len(ex.get("canonicals", [])),
            "canonical_self": canon is not None and _same(canon, p["final_url"] or p["url"]),
            "title": ex.get("title"), "title_count": len(ex.get("titles", [])),
            "title_length": ex.get("title_length"),
            "meta_description_length": ex.get("meta_description_length"),
            "h1_count": (ex.get("heading_counts") or {}).get("h1", 0),
            "lang": ex.get("lang"), "hreflang_count": len(ex.get("hreflang", [])),
            "jsonld_types": ex.get("jsonld_types"), "jsonld_errors": len(ex.get("jsonld_errors", [])),
            "words": ex.get("visible_word_count"), "links_internal": ex.get("links_internal"),
            "images_without_alt": ex.get("images_without_alt"),
            "viewport": bool(ex.get("viewport")), "elapsed_ms": p["elapsed_ms"],
            "inlinks_in_sample": len(inlinks.get(p["url"], ())),
            "error": p["error"], "blocked": p["blocked"], "truncated": p["truncated"],
        })
    site["duplicate_titles"] = _dupes(compact, "title")
    site["hreflang_non_reciprocal"] = _hreflang_check(pages, by_url)
    site["broken_in_sample"] = [{"url": c["url"], "status": c["status"],
                                 "linked_from": sorted(inlinks.get(c["url"], ()))[:10]}
                                for c in compact if c["status"] and c["status"] >= 400]
    site["sitemap_urls_not_linked_in_sample"] = sum(
        1 for c in compact if c["source"] == "sitemap" and c["inlinks_in_sample"] == 0)
    site["families_sampled"] = sampler.per_family
    site["candidates_left_unvisited"] = len(sampler.pool)
    site["excluded_candidates"] = excluded
    _dump(os.path.join(out_dir, "signals.json"), {"site": site, "pages": compact})
    _write_summary(out_dir, start_url, site, compact, f)
    write_manifest(status="PARTIEL" if f.stop_reason else "OK", pages_fetched=len(pages),
                   requests=f.requests, stop_reason=f.stop_reason,
                   coverage=("echantillon de %d pages HTML sur %d familles d'URL ; "
                             "%d candidates non visitees" % (len(pages), len(sampler.per_family),
                                                             len(sampler.pool))))
    return manifest


def _charset(ctype):
    import codecs
    m = re.search(r"charset=([\w-]+)", ctype or "", re.I)
    if m:
        try:
            return codecs.lookup(m.group(1)).name
        except LookupError:
            pass
    return "utf-8"


def _same(a, b):
    def n(u):
        p = urlsplit(u)
        return (p.scheme, (p.hostname or "").lower(), p.path.rstrip("/") or "/", p.query)
    try:
        return n(a) == n(b)
    except ValueError:
        return False


def _dupes(rows, key):
    seen = {}
    for r in rows:
        v = r.get(key)
        if v and r.get("status") == 200 and not r.get("noindex"):
            seen.setdefault(v, []).append(r["url"])
    return [{"value": k, "urls": v} for k, v in seen.items() if len(v) > 1]


def _hreflang_check(pages, by_url):
    """Reciprocite, limitee aux pages DE L'ECHANTILLON (signal partiel)."""
    issues = []
    for p in pages:
        ex = p.get("extract") or {}
        me = p["final_url"] or p["url"]
        for alt in ex.get("hreflang", []):
            target = by_url.get(alt["href"])
            if target is None or _same(alt["href"], me):
                continue
            back = [a["href"] for a in (target.get("extract") or {}).get("hreflang", [])]
            if not any(_same(b, me) for b in back):
                issues.append({"from": me, "to": alt["href"], "hreflang": alt["hreflang"]})
    return issues[:100]


def _dump(path, obj):
    with open(path, "w", encoding="utf-8") as fh:
        json.dump(obj, fh, ensure_ascii=False, indent=2, default=list)
        fh.write("\n")


def _write_summary(out_dir, start_url, site, rows, f):
    L = [f"# Collecte -- {redact_url(start_url)}", "",
         "Faits OBSERVES par seo_fetch.py (HTML initial, sans rendu JavaScript).",
         "Ce ne sont pas des constats : chacun reste a qualifier.", ""]
    r = site.get("robots", {})
    L += [f"- robots.txt : HTTP {r.get('status')} -- {r.get('interpretation', '')}",
          f"- Googlebot autorise sur l'accueil : {r.get('googlebot_home')}",
          f"- sitemaps lus : {len(site.get('sitemaps', []))} "
          f"({', '.join(str(s.get('status')) for s in site.get('sitemaps', []))})",
          f"- requetes : {f.requests} ; arret : {f.stop_reason or 'non'}",
          f"- soft-404 (URL inventee) : HTTP {site.get('soft404_probe', {}).get('status')}",
          f"- titres dupliques : {len(site.get('duplicate_titles', []))} ; "
          f"hreflang non reciproques (echantillon) : {len(site.get('hreflang_non_reciprocal', []))} ; "
          f"4xx/5xx dans l'echantillon : {len(site.get('broken_in_sample', []))}", "",
          "## Variantes d'acces", ""]
    for u, v in site.get("variants", {}).items():
        same = v.get("same_body_as_home")
        L.append(f"- `{u}` -> {v.get('status')} -> {v.get('final_url') or v.get('blocked') or v.get('error')}"
                 + ("" if same is None else f" ; corps identique a l'accueil : {same}"))
    L += ["", "## Pages", "",
          "| id | statut | prof. | noindex | canonical=soi | H1 | titre (car.) | mots | src | URL |",
          "|---|---|---|---|---|---|---|---|---|---|"]
    for c in rows:
        L.append(f"| {c['id']} | {c['status']} | {c['depth']} | {c['noindex']} | "
                 f"{c['canonical_self'] if c['canonical'] else '-'} | {c['h1_count']} | "
                 f"{c['title_length']} | {c['words']} | {c['source']} | {c['url']} |")
    with open(os.path.join(out_dir, "crawl-summary.md"), "w", encoding="utf-8") as fh:
        fh.write("\n".join(L) + "\n")


def main(argv=None):
    ap = argparse.ArgumentParser(description=__doc__.split("\n")[0])
    ap.add_argument("url")
    ap.add_argument("--out", required=True)
    ap.add_argument("--max-pages", type=int, default=50)
    ap.add_argument("--delay", type=float, default=1.0)
    a = ap.parse_args(argv)
    if not 1 <= a.max_pages <= 200:
        ap.error("--max-pages entre 1 et 200")
    if a.delay < 0.5:
        ap.error("--delay >= 0.5 s")
    m = run(a.url, a.out, a.max_pages, a.delay)
    print(json.dumps({k: m.get(k) for k in ("status", "pages_fetched", "requests",
                                           "stop_reason", "blocked", "error", "coverage")},
                     ensure_ascii=False))
    return 0 if m.get("status") in ("OK", "PARTIEL") else 2


if __name__ == "__main__":
    sys.exit(main())
