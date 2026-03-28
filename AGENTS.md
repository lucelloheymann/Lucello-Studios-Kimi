# AGENTS.md — Gemeinsames Team-Memory für Kimi

> Dieses Dokument wird von allen Teammitgliedern geteilt.
> Änderungen erfordern einen PR und Team-Review.
> Letzte Überarbeitung: 2026-03-28
> Konvertiert von Claude Code zu Kimi Code CLI.

---

## Projekt-Überblick

**Projektname**: Lucello Studio — Website Rescue Agent
**Zweck**: Internes KI-gestütztes Tool für Website-Analyse, Demo-Generierung und seriöse Akquise. Findet Unternehmen mit schwachem Webauftritt, analysiert sie, erstellt bessere Demo-Websites und bereitet Outreach vor — alles nur nach manueller Freigabe.
**Team**: Luis + Marcel (je 1 PC + 1 Laptop, 4 Geräte gesamt)
**Hauptsprachen / Frameworks**: TypeScript, Next.js 15, React 19, Tailwind CSS, shadcn/ui

---

## Architektur-Überblick

Das Hauptprodukt ist eine interne Web-App unter `apps/website-rescue-agent/`.
Details in `apps/website-rescue-agent/README.md` und `docs/architecture/README.md`.

Wichtige Komponenten:
- **Frontend**: Next.js 15 App Router, React 19, Tailwind CSS, shadcn/ui
- **Backend**: Next.js API Routes + Server Actions, Node.js Worker-Prozess
- **Datenbank**: PostgreSQL + Prisma ORM
- **Queue**: BullMQ + Redis (für Crawl-, Analyse-, Generierungs-Jobs)
- **Crawling**: Playwright (Chromium, headless)
- **LLM**: Vercel AI SDK — modular austauschbar (OpenAI GPT-4o default, Anthropic optional)
- **Auth**: NextAuth v5 (Credentials für internes Tool)

---

## Entwicklungs-Konventionen

### Coding Style
- TypeScript strict mode, Zod für Validierung
- Conventional Commits: `feat:`, `fix:`, `docs:`, `chore:`, `refactor:`
- Keine Business-Logik in UI-Komponenten
- Services in `src/server/services/`, Prompts in `src/server/prompts/`

### Branch-Strategie
- `main` — stabile Version, direkte Pushes verboten
- `develop` — Integrations-Branch
- `feature/<name>` — Feature-Branches
- `fix/<name>` — Bugfix-Branches

### Code-Review
- Mindestens 1 Approval vor dem Merge
- CI muss grün sein
- Squash-Merge auf `develop`, Merge-Commit auf `main`

---

## Teamweite Regeln für Kimi

### Verhalten
- Antworten auf **Deutsch**, außer Code-Kommentare (Englisch)
- Kurze, direkte Antworten bevorzugt
- Vor Änderungen an bestehenden Dateien: erst lesen, dann ändern
- Keine unnötigen Abstractions oder Over-Engineering

### Was Kimi tun darf (ohne Rückfrage)
- Dateien lesen und durchsuchen (Read, Glob, Grep)
- Lokale Tests ausführen
- Code schreiben und bearbeiten (WriteFile, StrReplaceFile)
- `npm run typecheck`, `npm run lint` ausführen
- Web-Suche durchführen (SearchWeb, FetchURL)
- Subagents für parallele Aufgaben spawnen (Task)

### Was Kimi vorher fragen muss
- Destructive Git-Operationen (force push, reset --hard)
- Branches löschen
- Externe APIs aufrufen
- Prisma-Migrationen auf Prod ausführen
- Secrets oder Credentials verwenden

### Was Kimi nie tun darf
- `.env`-Dateien committen
- Direkt auf `main` pushen
- Outreach-Versand ohne explizite User-Freigabe auslösen
- Daten in den Outreach-Entwürfen erfinden (Guardrail!)

---

## Bekannte Fallstricke / Wichtige Hinweise

- **Worker muss separat laufen**: `npm run worker:dev` in eigenem Terminal
- **Playwright-Browser**: `npx playwright install chromium` nach `npm install`
- **LLM-Analyse ist optional**: Auch ohne API-Key läuft die heuristische Analyse
- **Keine echten Daten erfinden**: LLM-Prompts enthalten Guardrails gegen Halluzinationen
- **Outreach-Guardrails sind hart**: `isBlockedForSend: true` kann nicht durch API umgangen werden

---

## Wichtige Dateipfade

| Pfad | Beschreibung |
|---|---|
| `apps/website-rescue-agent/` | Haupt-Anwendung (Next.js) |
| `apps/website-rescue-agent/prisma/schema.prisma` | Vollständiges Datenmodell |
| `apps/website-rescue-agent/src/server/` | Business-Logik, Services, Prompts |
| `apps/website-rescue-agent/src/lib/` | Shared Utilities, DB, Queue, LLM, Auth |
| `docs/architecture/README.md` | Architektur-Details |
| `docs/decisions/` | Architektur-Entscheidungen (ADRs) |
| `docs/runbooks/development-workflow.md` | Dev-Workflow |
| `docs/prompts/team-prompts.md` | Wiederverwendbare Prompts |
| `apps/website-rescue-agent/src/ui-ux-pro-max/` | UI UX Pro Max Design-Daten |
| `scripts/` | UI UX Pro Max Python Scripts |

---

## Externe Ressourcen

| Ressource | URL / Ort |
|---|---|
| Issue-Tracker | GitHub Issues |
| CI/CD | GitHub Actions (geplant) |
| Staging | lokal (kein Staging-Server bisher) |
| Produktion | noch nicht deployed |

---

## UI UX Pro Max Integration

Ab sofort ist **UI UX Pro Max** in das Projekt integriert. Das bietet:
- **67 UI Styles** (Glassmorphism, Minimalism, Brutalism, etc.)
- **161 Color Palettes** für verschiedene Branchen
- **57 Font Pairings** mit Google Fonts
- **161 Reasoning Rules** für automatische Design-System-Generierung

### Verwendung

**Python Scripts ausführen:**
```bash
# Design-System für ein Projekt generieren
python3 scripts/search.py "beauty spa wellness" --design-system -p "Serenity Spa"

# Farbpaletten suchen
python3 scripts/search.py "luxury brand" --domain color

# UI Styles suchen
python3 scripts/search.py "glassmorphism" --domain style

# Fonts suchen
python3 scripts/search.py "elegant serif" --domain typography
```

**In Node.js/TypeScript nutzen:**
Die CSV-Dateien unter `src/ui-ux-pro-max/data/` können direkt importiert werden:
- `products.csv` - 161 Produktkategorien
- `styles.csv` - 67 UI Styles
- `colors.csv` - 161 Farbpaletten
- `typography.csv` - 57 Font-Paarungen

### Integration in Website Rescue Agent

Für die Demo-Website-Generierung können wir jetzt:
1. Automatisch passende Styles basierend auf der Branche vorschlagen
2. Farbpaletten für das Redesign auswählen
3. Typography-Paarungen empfehlen
4. Komplette Design-Systeme generieren

---

## Kimi Code CLI Referenz

### Verfügbare Tools
- **Shell**: PowerShell-Befehle ausführen
- **ReadFile**: Dateien lesen
- **WriteFile**: Dateien schreiben
- **StrReplaceFile**: Dateien bearbeiten
- **Glob**: Dateien suchen
- **Grep**: Inhaltssuche
- **SearchWeb**: Websuche
- **FetchURL**: URL-Inhalt abrufen
- **Task**: Subagents spawnen
- **AskUserQuestion**: Benutzer fragen

### Background Tasks
- `Shell(run_in_background=true)` für langlaufende Prozesse
- `TaskList` zum Anzeigen aktiver Tasks
- `TaskOutput` zum Prüfen von Task-Status
- `TaskStop` zum Abbrechen

---

## Änderungshistorie

| Datum | Autor | Änderung |
|---|---|---|
| 2026-03-27 | Team | Initiale Version erstellt (für Claude Code) |
| 2026-03-27 | Marcel + Claude | Projektdetails Website Rescue Agent eingepflegt |
| 2026-03-28 | Marcel + Kimi | Konvertierung zu Kimi Code CLI |
| 2026-03-28 | Marcel + Kimi | UI UX Pro Max Integration |
