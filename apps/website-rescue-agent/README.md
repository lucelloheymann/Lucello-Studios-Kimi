# Website Rescue Agent

> Internes KI-gestütztes Tool für Website-Analyse, Demo-Generierung und seriöse Akquise.
> Entwickelt von Lucello Studio — Luis & Marcel.

---

## Überblick

Website Rescue Agent findet Unternehmen mit schwachem Web-Auftritt, analysiert deren Websites automatisiert, erstellt eine sichtbar bessere Demo und bereitet seriöse Kontaktaufnahmen vor — **alles nur nach manueller Freigabe**.

```
Lead finden/importieren
→ Website crawlen & analysieren
→ Opportunity bewerten
→ Demo-Website generieren
→ Intern reviewen & freigeben
→ Outreach vorbereiten
→ NUR nach Freigabe senden
→ Follow-up-Prozess
```

---

## Setup

### Voraussetzungen
- Node.js 20+
- PostgreSQL 16+
- Redis 7+
- Playwright-Browser (wird automatisch installiert)

### Installation

```bash
cd apps/website-rescue-agent

# 1. Abhängigkeiten installieren
npm install

# 2. Playwright-Browser installieren
npx playwright install chromium

# 3. Umgebungsvariablen konfigurieren
cp .env.example .env
# .env bearbeiten: DATABASE_URL, REDIS_URL, AUTH_SECRET, OPENAI_API_KEY

# 4. Datenbank einrichten
npm run db:push

# 5. Seed-Daten einspielen
npm run db:seed

# 6. Entwicklungsserver starten
npm run dev

# 7. Worker starten (separates Terminal!)
npm run worker:dev
```

**App:** http://localhost:3000
**Login:** Credentials aus .env (AUTH_USER_LUIS_EMAIL / _PASSWORD)

---

## Architektur

```
apps/website-rescue-agent/
├── prisma/
│   ├── schema.prisma       ← Vollständiges Datenmodell
│   └── seed.ts             ← 10 Demo-Leads mit Pipeline-Daten
├── src/
│   ├── app/                ← Next.js App Router
│   │   ├── api/            ← REST-API-Endpunkte
│   │   ├── dashboard/      ← Dashboard
│   │   ├── leads/          ← Lead-Liste + Detail
│   │   ├── outreach/       ← Outreach-Übersicht
│   │   ├── generated-sites/← Demo-Website-Vorschau
│   │   ├── settings/       ← Systemkonfiguration
│   │   └── logs/           ← Audit-Trail + Jobs
│   ├── components/
│   │   ├── layout/         ← Sidebar, Header
│   │   └── ui/             ← StatusBadge, ScoreRing, ...
│   ├── lib/
│   │   ├── db.ts           ← Prisma-Client
│   │   ├── queue.ts        ← BullMQ-Integration
│   │   ├── llm.ts          ← LLM-Abstraktion (OpenAI/Anthropic)
│   │   ├── auth.ts         ← NextAuth v5
│   │   ├── heuristics.ts   ← Heuristische Website-Analyse
│   │   └── utils.ts        ← Shared Utilities
│   ├── server/
│   │   ├── services/       ← Business-Logik
│   │   │   ├── crawl.service.ts
│   │   │   ├── analysis.service.ts
│   │   │   ├── site-generator.service.ts
│   │   │   └── outreach.service.ts
│   │   ├── prompts/        ← LLM-Prompts (versioniert)
│   │   │   ├── analysis.prompt.ts
│   │   │   ├── site-generation.prompt.ts
│   │   │   └── outreach.prompt.ts
│   │   └── jobs/
│   │       └── worker.ts   ← BullMQ Worker (separater Prozess)
│   └── types/
│       └── index.ts        ← Zentrale Typen
└── .env.example
```

---

## Kern-Flow

### 1. Lead hinzufügen
- Manuell über UI: `/leads` → "Lead hinzufügen"
- CSV-Import: API `POST /api/leads` (bulk)
- Zukünftig: automatische Discovery

### 2. Crawlen
`POST /api/leads/:id/crawl` — enqueued Playwright-Job:
- Lädt Startseite + wichtige Unterseiten
- Erstellt Screenshots
- Extrahiert Text, Headings, CTAs, Kontaktinfos
- Erkennt Seitentypen (Home, Services, About, Contact, ...)

### 3. Analysieren
`POST /api/leads/:id/analyze`:
- Heuristische Analyse (auch ohne LLM)
- Optional: LLM-Analyse (strukturiertes JSON)
- Kombinierter Gesamt-Score (0–100)
- Opportunity-Score + Kaufwahrscheinlichkeit

### 4. Demo generieren
`POST /api/leads/:id/generate-site`:
- LLM erstellt Struktur + Inhalte
- HTML wird gerendert und gespeichert
- Platzhalter werden markiert
- Vorschau per iframe in App

### 5. Outreach erstellen
`POST /api/leads/:id/generate-outreach`:
- Basiert auf echten Analyse-Daten
- Red-Flag-Prüfung (Platzhalter, ungeprüfte Aussagen)
- Bei Problemen: `isBlockedForSend: true`

### 6. Freigeben & Senden
`POST /api/outreach/:id/approve` → `POST /api/outreach/:id/send`

**Kein Versand ohne:**
- Status `APPROVED`
- Keine blockierenden Red Flags
- Keine ungeprüften Platzhalter

---

## Datenmodell-Überblick

| Modell | Beschreibung |
|---|---|
| `Company` | Firma / Lead mit vollständigem Pipeline-Status |
| `Contact` | Kontaktpersonen zur Firma |
| `Crawl` | Crawl-Session mit Metadaten |
| `Page` | Gecrawlte Einzelseite mit extrahierten Daten |
| `Analysis` | Heuristik + LLM-Analyse, alle Scores |
| `CompetitorSnapshot` | Wettbewerber-Vergleichsdaten |
| `GeneratedSite` | Generierte Demo-Website (versioniert) |
| `OutreachDraft` | Outreach-Entwurf mit Red-Flag-Prüfung |
| `PipelineState` | Pipeline-Verlauf (wer hat wann was geändert) |
| `AuditLog` | Vollständiger Audit-Trail |
| `SearchConfiguration` | Suchgebiet-Konfiguration |
| `IndustryTemplate` | Branchenspezifische Templates |
| `OfferTemplate` | Angebots-Pakete |
| `JobRecord` | Queue-Job-Protokoll |

---

## LLM-Architektur

Alle LLM-Calls laufen über `src/lib/llm.ts` — austauschbar zwischen:
- **OpenAI** (default): GPT-4o für Analyse/Generierung, GPT-4o-mini für Outreach
- **Anthropic**: Claude Opus 4.6 / Claude Sonnet 4.6
- Erweiterbar auf Ollama, Azure OpenAI, etc.

Provider-Wechsel via `.env`:
```
LLM_PROVIDER=anthropic
```

Alle Prompts sind versioniert in `src/server/prompts/` und geben strukturiertes JSON zurück (Zod-validiert).

---

## Guardrails — Was nie passiert

- Kein Versand ohne explizite Freigabe
- Keine erfundenen Referenzen, Bewertungen, Zertifikate
- Keine Massenmail-Logik
- Keine Blacklist-Einträge werden kontaktiert
- Duplicate-Schutz aktiv

---

## Umgebungsvariablen

Alle Variablen: siehe `.env.example`

Pflichtfelder:
- `DATABASE_URL` — PostgreSQL
- `REDIS_URL` — Redis für BullMQ
- `AUTH_SECRET` — NextAuth Secret
- `OPENAI_API_KEY` (oder `ANTHROPIC_API_KEY`)

---

## Scripts

```bash
npm run dev          # Next.js Dev-Server
npm run worker:dev   # BullMQ Worker (separates Terminal)
npm run db:studio    # Prisma Studio (Datenbank-GUI)
npm run db:seed      # Demo-Daten einspielen
npm run typecheck    # TypeScript-Check
npm run lint         # ESLint
npm run test         # Vitest Unit Tests
```

---

## Phasierung

| Phase | Status | Inhalt |
|---|---|---|
| 1 | ✅ MVP | Setup, Auth, Datenmodell, Basis-UI, Leads CRUD, Jobs |
| 2 | ✅ MVP | Crawl, Heuristik, LLM-Analyse, Scorecard |
| 3 | 🔄 Nächstes | Opportunity Qualification, Wettbewerbsvergleich |
| 4 | 🔄 Nächstes | Demo-Generator Verbesserungen, Varianten |
| 5 | Geplant | Review Dashboard, vollständige Editierbarkeit |
| 6 | Geplant | Outreach Engine, Angebotslogik, Follow-ups |
| 7 | Geplant | Polishing, Tests, Templates-UI, Discovery |

---

## Offene Punkte (Phase 2+)

- [ ] Vollständige Lead-Discovery-Logik (Google Places, Yelp, lokale Verzeichnisse)
- [ ] Wettbewerbsvergleich-Modul
- [ ] CSV-Import-UI
- [ ] Outreach-Template-Editor in der App
- [ ] Follow-up-Automatisierung
- [ ] Angebotsseiten-Generator (PDF-fähig)
- [ ] E2E-Tests mit Playwright
- [ ] Dark Mode
