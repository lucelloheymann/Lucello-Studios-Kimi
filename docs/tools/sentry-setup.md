# Sentry Setup Guide

**Status:** Code integriert, wartet auf Aktivierung  
**Aufwand:** 5 Minuten

---

## Aktueller Status

| Komponente | Status |
|------------|--------|
| Sentry SDK installiert | ✅ `@sentry/nextjs` |
| Next.js Config | ✅ `withSentryConfig()` in `next.config.ts` |
| Server Config | ✅ `sentry.server.config.ts` |
| Edge Config | ✅ `sentry.edge.config.ts` |
| Worker Integration | ✅ Sentry in `worker.ts` |

**Was fehlt:** `SENTRY_DSN` in `.env.local`

---

## Aktivierung in 3 Schritten

### 1. Sentry Project erstellen

```bash
# Option A: Sentry Web UI
1. Gehe zu https://sentry.io
2. Erstelle neues Project "website-rescue-agent"
3. Wähle "Next.js" als Platform
4. Kopiere den DSN

# Option B: Sentry CLI (falls installiert)
npx @sentry/wizard@latest -i nextjs
```

### 2. ENV Variable setzen

```bash
# apps/website-rescue-agent/.env.local
SENTRY_DSN="https://xxx@yyy.ingest.de.sentry.io/zzz"
```

### 3. Testen

```bash
# Fehler produzieren (lokal)
npm run dev
# Dann im Browser: http://localhost:3000/api/test-error

# Oder im Code einen Test-Fehler werfen:
# throw new Error("Sentry Test");
```

---

## Was dann automatisch funktioniert

- **Error Tracking:** Alle Exceptions in Sentry
- **Performance Monitoring:** API Route Timings
- **Release Tracking:** Verknüpft mit Git Commits
- **Source Maps:** Automatisch hochgeladen bei Build

---

## Troubleshooting

### "Sentry DSN not found"

```bash
# Prüfen ob .env.local existiert
ls -la apps/website-rescue-agent/.env.local

# Sentry DSN Format prüfen
SENTRY_DSN="https://abc123@o123456.ingest.sentry.io/7890123"
```

### Source Maps nicht da

```bash
# Production Build nötig
npm run build
# Source Maps werden nur bei Production-Build hochgeladen
```

---

## Kosten

Sentry Free Tier:
- 5.000 Errors/Monat
- 10M Performance Units/Monat
- Für kleines Team ausreichend

---

## Fazit

**In 5 Minuten aktivierbar** sobald Sentry Account + DSN vorhanden sind.
