# Website Rescue Agent – MVP Status

> Stand: 2026-03-28
> Ziel: Funktionaler End-to-End-Workflow mit lokalem SQLite

---

## ✅ Implementiert & Funktionsfähig

### Datenbank & Infrastruktur
- [x] SQLite-Datenbank (kein PostgreSQL/Redis nötig)
- [x] Prisma Schema angepasst für SQLite (Strings statt Enums, JSON als String)
- [x] Mock-Queue für lokale Entwicklung (kein Redis nötig)
- [x] Automatische Job-Verarbeitung mit simulierten Delays

### Kern-Workflow (End-to-End)
- [x] **Lead anlegen** – Via UI oder Seed-Daten
- [x] **Crawl starten** – API + Mock-Verarbeitung (2s Delay)
- [x] **Analyse erzeugen** – API + Mock-Verarbeitung (3s Delay) mit simulierten Scores
- [x] **Lead qualifizieren** – Automatisch basierend auf Score (< 55 = qualifiziert)
- [x] **Demo-Website generieren** – API + Mock-Verarbeitung (4s Delay)
- [x] **Outreach-Entwurf erzeugen** – API + Mock-Verarbeitung (2.5s Delay)
- [x] **Freigabe** – Mit Guardrails (Platzhalter, Blockierung)
- [x] **Senden** – Mit SMTP-Integration (oder simuliert)
- [x] **Verlauf** – Pipeline-State-Tracking

### Status-Logik & Gating
- [x] Klare Status-Workflows: NEW → CRAWLED → ANALYZED → QUALIFIED → SITE_GENERATED → OUTREACH_DRAFT_READY → SENT
- [x] Button-Disabling basierend auf Voraussetzungen
- [x] Fehlermeldungen bei fehlenden Voraussetzungen
- [x] Guardrails: Kein Versand ohne Freigabe, Blockierung bei Platzhaltern

### UI-Seiten
- [x] Dashboard mit KPIs und Action-Center
- [x] Leads-Liste mit Filterung
- [x] Lead-Detailseite – Operativer Workflow-Hub:
  - [x] Gating-Logik: Buttons mit klaren Disabled-States
  - [x] "Nächste Aktion"-Banner mit Kontext
  - [x] Timeline mit Audit-Logs (crawl, analyse, outreach events)
  - [x] Fehlerzustände für failed crawls/analyses
  - [x] Manuelle Qualifizierung/Disqualifizierung
  - [x] Vollständiger Workflow: Crawl → Analyze → Qualify → Demo → Outreach → Approve → Send
- [x] Outreach-Übersicht mit Freigabe-Flow
- [x] Templates-Seite
- [x] Settings mit Queue-Status

### Seed-Daten (Test-Szenarien)
- [x] 10 Demo-Leads mit verschiedenen Zuständen:
  - NEW (keine Aktion)
  - CRAWLED (wartet auf Analyse)
  - ANALYZED (wartet auf Qualifizierung)
  - QUALIFIED (bereit für Demo)
  - SITE_GENERATED (bereit für Outreach)
  - OUTREACH_DRAFT_READY (wartet auf Freigabe)
  - SENT (abgeschlossen)
  - WON ( erfolgreich)

---

## ⚠️ Mock/Seed-basiert (simuliert)

### Was passiert wirklich?
| Feature | Real | Mock-Verhalten |
|---------|------|----------------|
| **Crawling** | ❌ Playwright nicht aktiv | Simuliert mit zufälliger PageCount |
| **Analyse** | ❌ Kein LLM-Call | Zufälliger Score 20-80 |
| **Demo-Generierung** | ❌ Kein LLM-Call | Statisches HTML-Template |
| **Outreach-Generierung** | ❌ Kein LLM-Call | Template-Text mit Platzhaltern |
| **E-Mail-Versand** | ⚠️ SMTP wenn konfiguriert | Sonst Console-Log |
| **Queue** | ❌ Kein Redis | In-Memory Mock mit Delay |

### Worker-Prozess
- Ohne Redis läuft der Worker nicht (npm run worker)
- Stattdessen: Mock-Queue verarbeitet Jobs automatisch im Hauptprozess
- Für Produktion: Redis starten + `npm run worker` in separatem Terminal

---

## 🔧 Konfiguration für echte Features

Um echtes Crawling/Analyse zu aktivieren:

```bash
# 1. Redis starten (Docker)
docker run -d -p 6379:6379 redis:alpine

# 2. Worker starten (separates Terminal)
npm run worker:dev

# 3. LLM API-Key setzen (.env)
OPENAI_API_KEY=sk-...
# oder
LLM_PROVIDER=anthropic
ANTHROPIC_API_KEY=...

# 4. Echte Queue aktivieren
# In .env: USE_MOCK_QUEUE=false (oder löschen)
```

---

## 🚀 Test-Anleitung

### Lokaler Start (SQLite + Mock)
```bash
cd apps/website-rescue-agent
npm run dev
```

### Was du testen kannst:
1. **Dashboard öffnen** – Siehe 10 Demo-Leads
2. **Lead-Detail öffnen** – z.B. "Fitness Center Nordlicht" (Status: NEW)
3. **Aktionen ausführen:**
   - "Crawlen" → Status ändert sich nach ~2s zu CRAWLED
   - "Analysieren" → Score wird generiert, Status ANALYZED
   - "Demo erstellen" → Status SITE_GENERATED
   - "Outreach erstellen" → Status OUTREACH_DRAFT_READY
4. **Freigabe testen** – Bei Outreach mit Platzhaltern → Blockierung
5. **Senden testen** – Nach Freigabe → Status SENT

### Fehlerzustände testen:
- Demo erstellen ohne Analyse → Fehlermeldung
- Outreach erstellen ohne Analyse → Fehlermeldung
- Senden ohne Freigabe → Fehlermeldung

---

## 📋 Nächste Schritte (Priorisiert)

### P0 (Kritisch für echte Nutzung)
1. **LLM-Integration** – OpenAI/Anthropic API-Key eintragen
2. **Playwright** – `npx playwright install chromium` für echtes Crawling
3. **Redis** – Für Background-Jobs in Produktion

### P1 (Wichtig)
4. **Fehlerbehandlung im UI** – Retry, Timeout, Netzwerkfehler
5. **Echtzeit-Updates** – WebSocket oder Polling für Job-Status
6. **Bilder/Screenshots** – Speicherung und Anzeige

### P2 (Nice-to-have)
7. **Echte E-Mail-Versand** – SMTP konfigurieren
8. **PDF-Export** – Angebots-PDFs generieren
9. **Multi-User** – Authentifizierung ausbauen

---

## 📝 Technische Dokumentation

### Architektur
```
Frontend (Next.js App Router)
    ↓
Server Actions / API Routes
    ↓
Services (crawl, analyze, outreach, site-gen)
    ↓
Queue (BullMQ mit Redis ODER Mock)
    ↓
Worker (separater Prozess ODER inline)
    ↓
SQLite Datenbank
```

### Wichtige Dateien
| Datei | Zweck |
|-------|-------|
| `src/lib/queue.ts` | Queue-Abstraktion (Redis oder Mock) |
| `src/server/jobs/worker.ts` | Worker-Prozess für Background-Jobs |
| `src/server/services/*.ts` | Business-Logik |
| `prisma/seed.ts` | Demo-Daten |

### Datenbank-Schema
- Alle Enums sind Strings (SQLite-Kompatibilität)
- JSON-Felder werden als Strings gespeichert (JSON.stringify/parse)
- Relations: Company → Crawl → Analysis → GeneratedSite → OutreachDraft

---

*MVP-Status: Funktional testbar mit simulierten Daten. Für echte Nutzung: Redis + LLM-Keys konfigurieren.*


### Typenstrategie
- **Enums:** Aus `@/types` importieren (nicht `@prisma/client`)
- **Modelle:** Aus `@prisma/client` importieren  
- **JSON-Felder:** Immer `JSON.stringify()` beim Schreiben, `JSON.parse()` beim Lesen

Siehe: `docs/typescript-refactor.md` für Details

---

## ⚠️ Bekannte Einschränkungen

### TypeScript (11 verbleibende Fehler)
- Type-Inference in Dashboard-Page
- String→Enum Zuweisungen (keine Laufzeit-Auswirkungen)
- Mock-Job Type-Casting

**Wichtig:** Diese Fehler betreffen nur Type-Checking, nicht die Funktionalität.

---

*MVP-Status: Funktional testbar mit simulierten Daten. Für echte Nutzung: Redis + LLM-Keys konfigurieren.*
