#!/usr/bin/env python3
"""Compare deux runs /seo-audit du meme site -- stdlib seule.

Compare les SIGNAUX deterministes (signals.json), pas la prose : par URL
presente dans les deux echantillons, et au niveau du site. Classe chaque
ecart en resolu / nouveau / non reproduit (URL absente d'un echantillon).

Un signal passe au vert ne prouve aucun gain de classement ou de trafic.

Usage : python3 -I compare_runs.py <run-avant> <run-apres>
"""
import json
import os
import sys

# signal -> fonction "est un probleme ?"
CHECKS = {
    "statut 4xx/5xx": lambda p: bool(p.get("status")) and p["status"] >= 400,
    "noindex": lambda p: bool(p.get("noindex")),
    "Googlebot bloque par robots.txt": lambda p: p.get("googlebot_allowed") is False,
    "canonical vers une autre URL": lambda p: bool(p.get("canonical")) and not p.get("canonical_self"),
    "plusieurs canonical": lambda p: (p.get("canonical_count") or 0) > 1,
    "sans title": lambda p: p.get("status") == 200 and not p.get("title"),
    "H1 absent": lambda p: p.get("status") == 200 and p.get("h1_count") == 0,
    "plusieurs H1": lambda p: (p.get("h1_count") or 0) > 1,
    "JSON-LD invalide": lambda p: (p.get("jsonld_errors") or 0) > 0,
    "redirection (chaine)": lambda p: (p.get("redirects") or 0) > 1,
}


def load(run):
    with open(os.path.join(run, "signals.json"), encoding="utf-8") as fh:
        return json.load(fh)


def issues(sig):
    out = set()
    for p in sig.get("pages", []):
        for name, fn in CHECKS.items():
            if fn(p):
                out.add((p["url"], name))
    s = sig.get("site", {})
    for d in s.get("duplicate_titles", []):
        out.add(("(site)", f"titre duplique : {d['value'][:60]}"))
    for h in s.get("hreflang_non_reciprocal", []):
        out.add((h["from"], f"hreflang sans retour vers {h['to']}"))
    probe = s.get("soft404_probe", {})
    if probe.get("status") == 200:
        out.add(("(site)", "URL inexistante en HTTP 200 (soft 404 suspecte)"))
    return out


def main(argv):
    if len(argv) != 3:
        print(__doc__)
        return 2
    a, b = load(argv[1]), load(argv[2])
    ua = {p["url"] for p in a.get("pages", [])} | {"(site)"}
    ub = {p["url"] for p in b.get("pages", [])} | {"(site)"}
    ia, ib = issues(a), issues(b)
    resolved = sorted(x for x in ia - ib if x[0] in ub)
    new = sorted(x for x in ib - ia if x[0] in ua)
    unrepro = sorted(x for x in ia - ib if x[0] not in ub)
    unseen = sorted(x for x in ib - ia if x[0] not in ua)
    print(f"# Comparaison\n\n- avant : {argv[1]}\n- apres : {argv[2]}\n"
          f"- URL communes aux deux echantillons : {len((ua & ub) - {'(site)'})}\n")
    for title, rows in (("Resolus", resolved), ("Nouveaux", new),
                        ("Non reproduits (URL absente du second echantillon)", unrepro),
                        ("Non comparables (URL absente du premier echantillon)", unseen),
                        ("Persistants", sorted(ia & ib))):
        print(f"## {title} ({len(rows)})\n")
        for url, name in rows:
            print(f"- {name} -- {url}")
        print()
    print("Rappel : un signal corrige ne prouve ni gain de classement ni gain de trafic.")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
