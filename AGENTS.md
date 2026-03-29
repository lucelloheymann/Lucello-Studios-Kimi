# AGENTS.md — Team-Memory für Kimi Code CLI

> Dieses Dokument gilt für das gesamte Team (Luis + Marcel).  
> Letzte Überarbeitung: 2026-03-29  
> Status: Ehrliche Dokumentation — keine Marketing-Sprache

---

## Projekt-Überblick

| | |
|---|---|
| **Projekt** | Website Rescue Agent |
| **Zweck** | Internes Tool für Website-Analyse, Demo-Generierung und Akquise |
| **Stack** | Next.js 15, React 19, TypeScript, Tailwind, shadcn/ui, Prisma, SQLite |
| **Ort** | `apps/website-rescue-agent/` |

---

## Was ist WIRKLICH integriert

### ✅ Voll integriert & funktionierend

| Feature | Status | Nachweis |
|---------|--------|----------|
| **Playwright E2E** | 27 Tests passing | `e2e/*.spec.ts`, `npm run test:e2e` |
| **Next.js App** | Läuft lokal | `npm run dev` auf Port 3000 |
| **Prisma/SQLite** | Funktioniert | `prisma/schema.prisma`, `npm run db:push` |
| **Conversation Feature** | MVP fertig | Siehe `docs/reviews/CONVERSATION_FEATURE_REVIEW.md` |

### ⚠️ Code vorhanden, braucht Aktivierung

| Feature | Status | Was fehlt |
|---------|--------|-----------|
| **Sentry** | Config existiert | `SENTRY_DSN` in `.env.local` |
| **BullMQ Worker** | Worker-Code fertig | Redis-Server + `REDIS_URL` |
| **LLM-Analyse** | Code vorhanden | `OPENAI_API_KEY` oder `ANTHROPIC_API_KEY` |

### ❌ Nicht integriert (nur Daten/Referenz)

| Feature | Was wirklich existiert | Was behauptet wurde |
|---------|------------------------|---------------------|
| **UI UX Pro Max** | CSV-Dateien + Python-Scripts in `src/ui-ux-pro-max/` | "Integriert" — ist aber nur kopiert |
| **Superpowers Skills** | Markdown-Dateien in `skills/` für Claude-CLI | "Automatische Aktivierung" — funktioniert nicht mit Kimi |

---

## Kimi-Workflow (manuell, verbindlich)

Kimi hat **keine automatische Skill-Aktivierung**. Stattdessen folgender manueller Workflow:

### Phase 1: Brainstorming
**Wann:** Bei neuem Feature-Request  
**Was:** Design & Scope klären  
**Ort:** `docs/workflows/brainstorming.md`  
**Trigger:** Nutzer sagt "Ich möchte..." → Kimi liest Workflow → führt durch

### Phase 2: Planning
**Wann:** Nach Design-Freigabe  
**Was:** Implementierungsplan mit Tasks  
**Ort:** `docs/workflows/planning.md`  
**Output:** `docs/plans/[feature]-plan.md`

### Phase 3: Implementation
**Wann:** Nach Plan-Freigabe  
**Was:** Umsetzung in Batches  
**Ort:** `docs/workflows/implementation.md`  
**Regel:** Tests first (RED-GREEN-REFACTOR)

### Phase 4: Review
**Wann:** Nach Code-Fertigstellung  
**Was:** Qualitätsprüfung vor Commit  
**Ort:** `docs/workflows/review.md`  
**Pflicht:** `npm run typecheck && npm run lint`

### Phase 5: Finish
**Wann:** Nach Review-Approval  
**Was:** Commit, Merge, Cleanup  
**Ort:** `docs/workflows/finish.md`

---

## Was Kimi tun darf (ohne Rückfrage)

- Dateien lesen/schreiben/bearbeiten
- Tests ausführen (`npm run test:e2e`, `npm run typecheck`)
- Web-Suche
- Subagents für parallele Aufgaben spawnen
- Lokalen Python/Node-Code ausführen

## Was Kimi VORHER fragen muss

- `git push` auf main
- `git reset --hard`, force push
- Prisma-Migrationen auf Produktion
- Externe API-Calls mit echten Credentials
- Dateien außerhalb des Projekt-Ordners

---

## Wichtige Dateipfade

```
apps/website-rescue-agent/
├── prisma/schema.prisma      # Datenbank-Schema
├── src/app/                  # Next.js App Router
├── src/server/               # API Routes, Services
├── src/lib/                  # DB, Queue, Auth, LLM
├── e2e/                      # Playwright Tests
└── src/ui-ux-pro-max/        # Design-Daten (CSV, Python)

docs/
├── workflows/                # Kimi-Workflows (neu)
├── reviews/                  # Feature-Reviews
├── architecture/             # ADRs
└── tools/                    # Tool-Doku (Sentry, etc.)

scripts/                      # UI UX Pro Max Python
```

---

## Tool-Status (ehrlich)

| Tool | Status | Nutzung |
|------|--------|---------|
| **Playwright** | ✅ Funktioniert | `npm run test:e2e` |
| **Sentry** | ⚠️ Config ready | Braucht `SENTRY_DSN` in ENV |
| **Worker** | ⚠️ Code ready | Braucht Redis + `npm run worker:dev` |
| **UI UX Pro Max** | ⚠️ Daten vorhanden | Python-Scripts manuell oder npm wrapper |
| **Superpowers** | ❌ Nicht nutzbar | Claude-Only Slash-Commands |

---

## Bekannte Fallstricke

- **Playwright:** `npx playwright install chromium` nach `npm install` nicht vergessen
- **Worker:** Muss in separatem Terminal laufen (`npm run worker:dev`)
- **SQLite:** File-basiert, kein Docker nötigt
- **Git:** Direkte Pushes auf main sind blockiert (Branch protection)

---

## Änderungshistorie

| Datum | Was geändert |
|-------|--------------|
| 2026-03-29 | Ehrliche Dokumentation: Tool-Status korrigiert, Kimi-Workflow definiert |
| 2026-03-28 | Konvertierung zu Kimi Code CLI (vorherige Version) |
| 2026-03-27 | Initiale Version |

---

*Dieses Dokument enthält keine Marketing-Sprache mehr.  
Status-Angaben sind hart nachprüfbar.*
