#!/usr/bin/env python3
"""Valide findings.json d'un audit /seo-audit -- stdlib seule.

Controle le contrat de references/findings-contract.md (et findings_schema.json) :
  - forme et enumerations de chaque finding ;
  - un finding CONFIRME porte au moins une preuve directe (OBSERVE, MESURE ou
    FOURNI_PAR_UTILISATEUR) avec source, date et detail ;
  - P0 seulement sur un finding CONFIRME ; INVESTIGUER jamais CONFIRME ;
  - un finding CONFIRME n'est pas REJETE par la revue contradictoire ;
  - toute action sur noindex, robots, canonical, redirection, hreflang ou
    balisage transverse exige human_review_required = true ;
  - pas de valeur d'exemple laissee telle quelle ;
  - une preuve qui cite un fichier local du run doit exister.

Usage : python3 -I validate_findings.py <dossier-du-run | findings.json>
Code de sortie : 0 valide, 1 invalide, 2 fichier absent ou illisible.
"""
import json
import os
import re
import sys

ENUMS = {
    "status": {"CONFIRME", "SUSPECTE", "NON_VERIFIABLE", "REJETE"},
    "evidence_level": {"OBSERVE", "MESURE", "INFERE", "FOURNI_PAR_UTILISATEUR", "NON_VERIFIABLE"},
    "confidence": {"elevee", "moyenne", "faible"},
    "priority": {"P0", "P1", "P2", "P3", "INVESTIGUER"},
    "scope": {"page", "template", "site", "inconnu"},
    "owner_role": {"contenu", "developpeur", "SEO", "administrateur", "metier"},
    "review_status": {"ACCEPTE", "A_VERIFIER", "REJETE", "RISQUE_MAJEUR"},
}
EVIDENCE_SOURCES = {"HTTP", "HTML", "DOM", "robots", "sitemap", "CrUX", "Lighthouse",
                    "GSC", "analytics", "Git", "utilisateur", "autre"}
REQUIRED_STR = ["id", "category", "observation", "impact_hypothesis", "action",
                "implementation_location", "effort", "risk", "verification"]
DIRECT = {"OBSERVE", "MESURE", "FOURNI_PAR_UTILISATEUR"}
RISKY = re.compile(r"\b(noindex|nofollow|robots\.txt|disallow|canonical|canonique|"
                   r"redirect\w*|redirig\w*|redirection\w*|30[1278]\b|hreflang|"
                   r"x-robots-tag|sitewide|transverse|migration)", re.I)
PLACEHOLDERS = ("https://example.com/page", "Fait descriptif, sans surinterpr",
                "Mecanisme possible et limites", "Geste precis",
                "test reproductible et resultat attendu", "preuve expurgee",
                "chemin local ou URL")
ISO = re.compile(r"^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:?\d{2})?)?$")
SECRET = re.compile(r"(authorization:|bearer\s+[a-z0-9._-]{20,}|-----BEGIN [A-Z ]*PRIVATE KEY|"
                    r"(api[_-]?key|token|secret|password)=[^&\s]{8,}|set-cookie:)", re.I)


def check(data, run_dir=None):
    errors, warnings = [], []
    if isinstance(data, dict):
        meta = data
        findings = data.get("findings")
        if not isinstance(meta.get("audited_url"), str):
            errors.append("racine : audited_url manquant")
        if not isinstance(meta.get("generated_at"), str) or not ISO.match(meta.get("generated_at", "")):
            errors.append("racine : generated_at ISO-8601 manquant")
    else:
        findings = data
    if not isinstance(findings, list):
        return ["racine : 'findings' doit etre une liste"], warnings

    seen = set()
    for i, f in enumerate(findings):
        where = f"finding[{i}]"
        if not isinstance(f, dict):
            errors.append(f"{where} : objet attendu")
            continue
        fid = f.get("id")
        where = f"{fid or where}"
        if not isinstance(fid, str) or not re.fullmatch(r"SEO-\d{3,4}", fid):
            errors.append(f"{where} : id au format SEO-NNN attendu")
        elif fid in seen:
            errors.append(f"{where} : id en double")
        seen.add(fid)
        for k in REQUIRED_STR:
            v = f.get(k)
            if not isinstance(v, str) or not v.strip():
                errors.append(f"{where} : champ '{k}' vide ou absent")
        for k, allowed in ENUMS.items():
            if f.get(k) not in allowed:
                errors.append(f"{where} : '{k}' = {f.get(k)!r}, attendu un de {sorted(allowed)}")
        if not isinstance(f.get("url_examples"), list):
            errors.append(f"{where} : url_examples doit etre une liste")
        if not isinstance(f.get("dependencies", []), list):
            errors.append(f"{where} : dependencies doit etre une liste")
        if not isinstance(f.get("human_review_required"), bool):
            errors.append(f"{where} : human_review_required (booleen) absent")

        ev = f.get("evidence")
        if not isinstance(ev, list):
            errors.append(f"{where} : evidence doit etre une liste")
            ev = []
        for j, e in enumerate(ev):
            if not isinstance(e, dict):
                errors.append(f"{where}.evidence[{j}] : objet attendu")
                continue
            if e.get("source") not in EVIDENCE_SOURCES:
                errors.append(f"{where}.evidence[{j}] : source {e.get('source')!r} inconnue")
            if not isinstance(e.get("captured_at"), str) or not ISO.match(e.get("captured_at", "")):
                errors.append(f"{where}.evidence[{j}] : captured_at ISO-8601 attendu")
            if not isinstance(e.get("detail"), str) or not e["detail"].strip():
                errors.append(f"{where}.evidence[{j}] : detail vide")
            ref = e.get("reference")
            if isinstance(ref, str) and run_dir and not re.match(r"^https?://", ref):
                path = os.path.normpath(os.path.join(run_dir, ref))
                if not path.startswith(os.path.abspath(run_dir)):
                    errors.append(f"{where}.evidence[{j}] : reference hors du dossier du run")
                elif not os.path.exists(path):
                    errors.append(f"{where}.evidence[{j}] : reference introuvable : {ref}")

        status, level, prio = f.get("status"), f.get("evidence_level"), f.get("priority")
        if status == "CONFIRME":
            if level not in DIRECT:
                errors.append(f"{where} : CONFIRME exige une preuve directe (pas {level})")
            if not ev:
                errors.append(f"{where} : CONFIRME sans aucune preuve")
            if f.get("review_status") == "REJETE":
                errors.append(f"{where} : CONFIRME mais REJETE par la revue contradictoire")
        if prio == "P0" and status != "CONFIRME":
            errors.append(f"{where} : P0 reserve a un constat CONFIRME")
        if prio == "INVESTIGUER" and status == "CONFIRME":
            warnings.append(f"{where} : CONFIRME mais INVESTIGUER -- choisir")
        if status == "NON_VERIFIABLE" and prio in ("P0", "P1"):
            errors.append(f"{where} : NON_VERIFIABLE ne peut pas etre {prio}")
        # NON_VERIFIABLE et REJETE ne proposent aucun changement (collecte de
        # preuve, ou constat ecarte) : la regle vise les actions a appliquer.
        if status not in ("NON_VERIFIABLE", "REJETE") and RISKY.search(f.get("action", "") or "")                 and f.get("human_review_required") is not True:
            errors.append(f"{where} : action a risque (robots/noindex/canonical/redirection/"
                          f"hreflang/transverse) sans human_review_required = true")

        blob = json.dumps(f, ensure_ascii=False)
        for ph in PLACEHOLDERS:
            if ph in blob:
                errors.append(f"{where} : valeur d'exemple laissee telle quelle ({ph!r})")
        if SECRET.search(blob):
            errors.append(f"{where} : ressemble a un secret (en-tete, cle, jeton) -- expurger")
    return errors, warnings


def main(argv):
    if len(argv) != 2:
        print(__doc__)
        return 2
    target = argv[1]
    run_dir = target if os.path.isdir(target) else os.path.dirname(os.path.abspath(target))
    path = os.path.join(target, "findings.json") if os.path.isdir(target) else target
    try:
        with open(path, encoding="utf-8") as fh:
            data = json.load(fh)
    except (OSError, ValueError) as e:
        print(f"INVALIDE : {path} illisible : {e}")
        return 2
    errors, warnings = check(data, run_dir)
    for w in warnings:
        print(f"  avertissement : {w}")
    for e in errors:
        print(f"  erreur : {e}")
    n = len(data.get("findings", data) if isinstance(data, dict) else data)
    if errors:
        print(f"INVALIDE : {len(errors)} erreur(s) sur {n} finding(s)")
        return 1
    print(f"VALIDE : {n} finding(s), {len(warnings)} avertissement(s)")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
