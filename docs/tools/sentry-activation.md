# Sentry Aktivierung - Schritt für Schritt

**Status:** Code ready, wartet auf DSN  
**Zeitaufwand:** 5 Minuten

---

## Schritt 1: Sentry Account erstellen (2 Min)

### Option A: Neuer Account
1. Öffne https://sentry.io/signup/
2. Registriere dich (Email + Passwort oder GitHub)
3. Wähle "Create new organization"
4. Organization Name: z.B. "lucello-studio"

### Option B: Existierender Account
1. Login auf https://sentry.io
2. Wähle deine Organization

---

## Schritt 2: Next.js Projekt erstellen (2 Min)

1. In Sentry: **"Create Project"**
2. Platform: **Next.js**
3. Project Name: **"website-rescue-agent"**
4. Klicke: **"Create Project"**

**Sentry zeigt dir jetzt eine DSN:**
```
https://abc123def456@o123456.ingest.sentry.io/7890123
```

---

## Schritt 3: DSN in ENV eintragen (30 Sek)

Öffne: `apps/website-rescue-agent/.env.local`

Ersetze:
```bash
# SENTRY_DSN="https://xxxx@yyyy.ingest.de.sentry.io/zzzz"
```

Mit deiner echten DSN:
```bash
SENTRY_DSN="https://abc123def456@o123456.ingest.sentry.io/7890123"
```

**WICHTIG:** Ohne Anführungszeichen ändern, nur den Wert einfügen!

---

## Schritt 4: Server neu starten (30 Sek)

```bash
cd apps/website-rescue-agent
# Stoppe laufenden Server (Ctrl+C)
npm run dev
```

---

## Schritt 5: Test durchführen (1 Min)

### A. Health-Check
```bash
curl http://localhost:3000/api/sentry-health
```

**Sollte anzeigen:**
```json
{
  "status": "HEALTHY",
  "dsn_configured": true,
  "message": "Sentry is configured and ready"
}
```

### B. Test-Event senden
```bash
curl http://localhost:3000/api/sentry-test
```

**Sollte anzeigen:**
```json
{
  "status": "SENTRY TEST SENT",
  "message": "Test errors sent to Sentry",
  "next_step": "Check your Sentry dashboard"
}
```

### C. Dashboard prüfen
1. Gehe zu: https://sentry.io/issues/
2. Wähle dein Projekt "website-rescue-agent"
3. Du solltest "Sentry Test Error" sehen

---

## Was jetzt überwacht wird

| Bereich | Status |
|---------|--------|
| **API Routes** | ✅ Alle Fehler werden erfasst |
| **Server Errors** | ✅ Automatisch via `sentry.server.config.ts` |
| **Edge Functions** | ✅ Automatisch via `sentry.edge.config.ts` |
| **Frontend Errors** | ✅ Automatisch via `sentry.client.config.ts` |
| **E-Mail-Versand** | ✅ Fehler werden an Sentry gesendet |
| **Worker/Jobs** | ✅ Fehler werden an Sentry gesendet |

---

## Teste echte Fehler-Erfassung

### API-Fehler testen
```bash
# Dieser Endpoint wirft absichtlich einen Fehler
curl -X POST http://localhost:3000/api/sentry-test
# → Sollte 500er Fehler erzeugen
```

### E-Mail-Versand-Fehler testen
1. Falsche SMTP-Credentials in `.env.local` setzen
2. Versuch einen Outreach zu senden
3. Sentry sollte den Fehler zeigen

### Frontend-Fehler testen
1. Öffne Dev-Tools (F12)
2. Konsole: `throw new Error("Test Frontend Error")`
3. Sentry sollte den Fehler erfassen

---

## Troubleshooting

### "SENTRY NOT CONFIGURED"
- `.env.local` prüfen
- Server neu starten
- DSN-Format prüfen (muss mit https:// beginnen)

### "Test sent" aber nicht im Dashboard
- Warte 30 Sekunden (Verarbeitung braucht Zeit)
- Prüfe Filter im Dashboard
- Stelle sicher dass du das richtige Projekt ausgewählt hast

### Too many requests
- Sentry Free Tier hat Limits
- Keine Sorge, für Development ausreichend

---

## Nächster Schritt nach Aktivierung

**Option A: Worker/Redis testen**
- Background-Jobs mit Sentry-Monitoring
- 10 Minuten Aufwand

**Option B: Production vorbereiten**
- SendGrid/Mailgun für echte E-Mails
- Production-Sentry-DSN

---

**Status nach dieser Anleitung:**
- ☐ Sentry Account erstellt
- ☐ Projekt "website-rescue-agent" angelegt
- ☐ DSN kopiert
- ☐ DSN in `.env.local` eingetragen
- ☐ Server neu gestartet
- ☐ Test-Event gesendet
- ☐ Dashboard geprüft

**Wenn alle Checkboxen ✅ → Sentry ist aktiv!**
