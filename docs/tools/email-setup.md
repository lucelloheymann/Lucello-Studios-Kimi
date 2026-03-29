# E-Mail-Versand Setup

**Status:** Implementiert ✅  
**Feature:** Echter SMTP-Versand für Outreach  
**Letzte Änderung:** 2026-03-29

---

## Übersicht

Outreach-Entwürfe können nach Freigabe per E-Mail versendet werden.

| Modus | Beschreibung |
|-------|--------------|
| **SMTP** | Echter Versand über konfigurierten Server |
| **Simuliert** | Ohne SMTP-Config — nur Logging (Dev-Modus) |

---

## Schnellstart (Development)

### 1. Mailtrap Account erstellen (kostenlos)

```
https://mailtrap.io/signup
```

### 2. Inbox erstellen → SMTP Settings kopieren

```bash
# apps/website-rescue-agent/.env.local

SMTP_HOST="sandbox.smtp.mailtrap.io"
SMTP_PORT="587"
SMTP_USER="your-mailtrap-user"
SMTP_PASS="your-mailtrap-password"
SMTP_FROM="outreach@website-rescue-agent.local"
SMTP_FROM_NAME="Website Rescue Agent"
```

### 3. Datenbank migrieren (neue Felder)

```bash
cd apps/website-rescue-agent
npm install  # nodemailer wird installiert
npx prisma migrate dev --name add_email_tracking
```

### 4. Test-Versand durchführen

```bash
# 1. Dev-Server starten
npm run dev

# 2. Im Browser:
# - Leads öffnen
# - Lead mit freigegebenem Outreach wählen
# - "Senden" klicken

# 3. Mailtrap Dashboard prüfen
# → E-Mail sollte im Inbox erscheinen
```

---

## Guardrails (werden strikt geprüft)

Versand wird BLOCKIERT wenn:

| Bedingung | Fehlermeldung |
|-----------|---------------|
| Nicht freigegeben | "Versand nur nach expliziter Freigabe möglich" |
| Blockiert | "Versand blockiert: [Grund]" |
| Unreviewte Platzhalter | "Unreviewte Platzhalter vorhanden" |
| Blacklist | "Firma ist auf der Blacklist" |
| Bereits kontaktiert | "Firma wurde bereits kontaktiert" |
| Bereits versendet | "Diese Nachricht wurde bereits gesendet" |
| Kein Empfänger | "Keine Empfänger-E-Mail-Adresse vorhanden" |

---

## Versand-Status

| Status | Bedeutung |
|--------|-----------|
| `null` | Noch nicht versucht |
| `PENDING` | Wartet auf Versand |
| `SENDING` | Wird gerade gesendet |
| `SENT` | Erfolgreich versendet ✅ |
| `FAILED` | Fehlgeschlagen ❌ (retrybar) |

### Gespeicherte Daten bei Versand:

```typescript
sentAt: DateTime      // Zeitpunkt
sentBy: string        // User-ID
sentStatus: string    // SENT / FAILED
sentError: string     // Fehlermeldung (bei FAILED)
messageId: string     // SMTP Message-ID
sentProvider: string  // "smtp" oder "simulated"
```

---

## Fehlerbehandlung

### Versand fehlgeschlagen

- Status wird auf `FAILED` gesetzt
- Fehlermeldung wird gespeichert
- **Kann erneut versucht werden** — Button bleibt aktiv

### SMTP nicht konfiguriert

- Versand wird simuliert (nur Console-Log)
- Status wird trotzdem auf `SENT` gesetzt
- Hinweis in UI: "Simuliert (SMTP nicht konfiguriert)"

---

## Production Setup

### Option A: Gmail (nur für kleine Volumen)

```bash
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="deine-email@gmail.com"
SMTP_PASS="app-spezifisches-passwort"  # Nicht dein Gmail-Passwort!
```

[Google App Passwords Guide](https://support.google.com/accounts/answer/185833)

### Option B: Transactional Email Service (empfohlen)

**SendGrid:**
```bash
SMTP_HOST="smtp.sendgrid.net"
SMTP_PORT="587"
SMTP_USER="apikey"
SMTP_PASS="dein-sendgrid-api-key"
```

**Mailgun:**
```bash
SMTP_HOST="smtp.mailgun.org"
SMTP_PORT="587"
SMTP_USER="postmaster@deine-domain.com"
SMTP_PASS="dein-mailgun-password"
```

---

## Test-Checkliste

- [ ] Mailtrap Account erstellt
- [ ] ENV-Variablen gesetzt
- [ ] `npm install` ausgeführt
- [ ] Prisma Migration durchgeführt
- [ ] Lead mit freigegebenem Outreach
- [ ] "Senden" Button geklickt
- [ ] Mailtrap Inbox geprüft
- [ ] Status in UI: "Versendet"
- [ ] Message-ID sichtbar

---

## Troubleshooting

### "SMTP not configured"

```bash
# Prüfen ob .env.local existiert und Werte hat
cat apps/website-rescue-agent/.env.local | grep SMTP
```

### "Versand blockiert"

- Entwurf auf Red Flags prüfen
- Platzhalter reviewen
- Freigabe-Status checken

### E-Mail kommt nicht an

1. Mailtrap Inbox prüfen (nicht Spam!)
2. SMTP-Credentials prüfen
3. Dev-Server Logs prüfen
4. Netzwerk-Firewall prüfen

---

## Architektur

```
┌─────────────────┐
│  User klickt    │
│   "Senden"      │
└────────┬────────┘
         │
         ▼
┌─────────────────┐     ┌──────────────────┐
│  POST           │────▶│  Guardrails      │
│  /api/outreach  │     │  (8 Prüfungen)   │
│  /:id/send      │     └────────┬─────────┘
└─────────────────┘              │
                                 ▼
                        ┌──────────────────┐
                        │  SMTP-Config?    │
                        └────────┬─────────┘
                                 │
                    ┌────────────┼────────────┐
                    ▼            ▼            ▼
              ┌─────────┐  ┌──────────┐  ┌──────────┐
              │  SMTP   │  │  Simuliert│  │  Fehler  │
              │  Send   │  │  (Dev)    │  │          │
              └────┬────┘  └────┬─────┘  └────┬─────┘
                   │            │             │
                   ▼            ▼             ▼
              ┌─────────┐  ┌──────────┐  ┌──────────┐
              │ Status: │  │ Status:  │  │ Status:  │
              │  SENT   │  │  SENT    │  │  FAILED  │
              │ +msgId  │  │ +simId   │  │ +error   │
              └─────────┘  └──────────┘  └──────────┘
```

---

**Nächster Schritt nach Setup:** Worker/Redis für Background-Job-Verarbeitung.
