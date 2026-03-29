# E-Mail-Versand Test-Checkliste

**Wann:** Nachdem du Mailtrap-Credentials hast  
**Dauer:** 10-15 Minuten  
**Ziel:** Echten E-Mail-Versand verifizieren

---

## Vorbereitung (2 Min)

### 1. Mailtrap Setup
- [ ] https://mailtrap.io/signup
- [ ] Neue Inbox erstellen
- [ ] SMTP Settings → "Show Credentials"
- [ ] Host, Port, User, Pass kopieren

### 2. ENV konfigurieren
```bash
# apps/website-rescue-agent/.env.local

SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT="587"
SMTP_USER="dein-mailtrap-user"
SMTP_PASS="dein-mailtrap-pass"
SMTP_FROM="test@website-rescue-agent.local"
SMTP_FROM_NAME="Test User"
```

### 3. Dev-Server starten
```bash
cd apps/website-rescue-agent
npm run dev
```

---

## Test 1: SMTP Health Check (1 Min)

```bash
curl http://localhost:3000/api/smtp-health
```

**Erwartet:**
```json
{
  "status": "HEALTHY",
  "configured": true,
  "connected": true
}
```

**Falls FAILED:**
- Credentials prüfen
- Port prüfen (587 für Mailtrap)
- Firewall prüfen

---

## Test 2: Erfolgreicher Versand (5 Min)

### Setup
- [ ] Im Browser: http://localhost:3000/outreach
- [ ] Filter auf "Freigegeben" setzen
- [ ] Einen Lead mit approved Outreach wählen

### Aktion
- [ ] "Senden" Button klicken
- [ ] Loading-State beobachten ("⏳ Sende...")
- [ ] Warten auf Reload

### Prüfung UI
- [ ] Status zeigt "Versendet" ✅
- [ ] Message-ID sichtbar (8 Zeichen)
- [ ] Keine Fehlermeldung

### Prüfung Mailtrap
- [ ] Mailtrap Inbox öffnen
- [ ] Neue E-Mail vorhanden?
- [ ] Betreff korrekt?
- [ ] Body enthält Lead-Link?
- [ ] Absender = SMTP_FROM?

### Prüfung Datenbank
```bash
# SQLite CLI öffnen
npx prisma studio

# Oder query:
SELECT id, sentStatus, sentAt, messageId, sentError 
FROM OutreachDraft 
WHERE id = 'deine-outreach-id';
```

**Erwartet:**
```
sentStatus: SENT
sentAt: 2026-03-29T...
messageId: <...>
sentError: null
```

---

## Test 3: Fehlgeschlagener Versand (3 Min)

### Setup
```bash
# .env.local - Falsche Credentials
SMTP_PASS="falsches-passwort"
```

- [ ] Dev-Server neu starten (für ENV-Reload)

### Aktion
- [ ] Anderen Lead mit approved Outreach wählen
- [ ] "Senden" klicken

### Prüfung UI
- [ ] Fehlermeldung sichtbar?
- [ ] Text enthält "Versand fehlgeschlagen"?
- [ ] Details zur Fehlerursache?
- [ ] Hinweis "Du kannst es erneut versuchen"?

### Prüfung Datenbank
```sql
SELECT sentStatus, sentError FROM OutreachDraft WHERE id = '...';
```

**Erwartet:**
```
sentStatus: FAILED
sentError: "Invalid login: 535 5.7.0..."
```

### Retry
- [ ] Credentials wieder korrigieren
- [ ] Server neu starten
- [ ] Gleichen Lead nochmal senden
- [ ] Jetzt erfolgreich?

---

## Test 4: Guardrails (5 Min)

### 4.1 Nicht freigegeben
- [ ] Lead mit Status "Entwurf" öffnen
- [ ] Kein "Senden"-Button sichtbar ✅

### 4.2 Blockiert
- [ ] Lead mit Red Flags erstellen (oder DB manipulieren)
- [ ] Status auf APPROVED setzen
- [ ] `isBlockedForSend = true`
- [ ] Versuch: POST /api/outreach/:id/send
- [ ] Ergebnis: 400 "Versand blockiert: ..." ✅

### 4.3 Platzhalter offen
- [ ] Outreach mit `hasUnreviewedPlaceholders = true`
- [ ] Status APPROVED
- [ ] Versand versuchen
- [ ] Ergebnis: 400 "Unreviewte Platzhalter..." ✅

### 4.4 Bereits versendet
- [ ] Bereits versendeten Outreach öffnen
- [ ] Kein "Senden"-Button ✅
- [ ] Oder: POST manuell
- [ ] Ergebnis: 400 "Bereits gesendet" ✅

### 4.5 Kein Empfänger
- [ ] Lead ohne E-Mail (company.email = null, contacts = [])
- [ ] Outreach freigeben
- [ ] Versand versuchen
- [ ] Ergebnis: 400 "Keine Empfänger-E-Mail" ✅

---

## Test 5: UI-Zustände (2 Min)

### Loading
- [ ] "Senden" klicken
- [ ] Button zeigt "⏳ Sende..."
- [ ] Button ist disabled
- [ ] Nach Reload: Normaler Zustand

### Success
- [ ] Nach erfolgreichem Versand
- [ ] Status-Badge: "Versendet" (blau)
- [ ] Message-ID sichtbar

### Failed
- [ ] Nach fehlgeschlagenem Versand
- [ ] Rote Fehlerbox oben
- [ ] Konkrete Fehlermeldung
- [ ] Button bleibt aktiv

### Blocked
- [ ] Bei blockiertem Outreach
- [ ] "Prüfen"-Button statt "Senden"
- [ ] Rote Hintergrund-Färbung

---

## Ergebnis dokumentieren

### Hat alles funktioniert?
- [ ] Ja → E-Mail-Versand ist produktionsreif 🎉
- [ ] Nein → Siehe Troubleshooting unten

### Gefundene Bugs
| Bug | Beschreibung | Severity |
|-----|--------------|----------|
| | | |

---

## Troubleshooting

### "SMTP not configured"
```bash
# Prüfen
cat apps/website-rescue-agent/.env.local | grep SMTP

# Muss enthalten:
SMTP_HOST, SMTP_USER, SMTP_PASS
```

### "Invalid login"
- Credentials kopieren (keine Leerzeichen)
- User vs. API-Key unterscheiden
- Bei Gmail: App-Passwort nutzen, nicht Hauptpasswort

### "Connection timeout"
- Port 587 (TLS) oder 465 (SSL)?
- Firewall blockiert SMTP?
- VPN aktiv?

### E-Mail kommt nicht an
- Mailtrap Inbox prüfen (nicht Spam!)
- Verschiedene Inbox in Mailtrap?
- Message-ID in DB gesetzt?

---

## Sign-Off

**Getestet von:** _______________  
**Datum:** _______________  
**Ergebnis:** ☐ Alle Tests bestanden ☐ Mit Einschränkungen ☐ Nicht bestanden

**Anmerkungen:**
_______________________________________________________________
_______________________________________________________________

---

**Nach erfolgreichem Test:**
→ Sentry aktivieren (Monitoring)
→ Oder Worker/Redis testen
→ Oder Produktions-SMTP einrichten
