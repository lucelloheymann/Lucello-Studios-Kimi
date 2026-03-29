# Empfehlung: Nächster Feature-Block

**Datum:** 2026-03-29  
**Basis:** Praktische Verifikation der aktuellen Features

---

## Aktueller Stand (ehrlich)

| Feature | Status | Blocker |
|---------|--------|---------|
| Conversation Management | ✅ MVP fertig | Keiner |
| Playwright Tests | ✅ 27 Tests passing | Keiner |
| Sentry | ⚠️ Code ready | Braucht DSN |
| Worker/Queues | ⚠️ Code ready | Braucht Redis |
| **E-Mail Versand** | ❌ **TODO-Stub** | **Nicht implementiert** |
| **Reply-Automation** | ❌ **Nicht begonnen** | **Braucht IMAP** |

---

## Die 3 Optionen

### Option 1: Echter E-Mail-Versand 🎯 **EMPFOHLEN**

**Was:** SMTP-Integration für den "send-outreach" Job  
**Aufwand:** 4-6 Stunden  
**Impact:** ⭐⭐⭐ SEHR HOCH

**Warum das wichtig ist:**
- Der Worker hat einen `send-outreach` Job (Zeile 92-102 in `worker.ts`)
- Aktuell nur ein TODO-Kommentar: `// TODO: Implement actual email sending`
- **Ohne E-Mail-Versand ist das gesamte Outreach-Feature nutzlos**
- Nutzer können zwar Conversations managen, aber keine E-Mails senden

**Was implementiert werden müsste:**
```typescript
// SMTP-Config in .env.local
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="..."
SMTP_PASS="..."

// Nodemailer Integration
// Template-System für E-Mails
// Attachment-Support (Demo-Site)
// Retry-Logik bei Fehlern
```

**Verifikation möglich:**
- Ja, mit Test-SMTP (Gmail, Mailtrap, etc.)
- Echte E-Mails senden und empfangen

---

### Option 2: Reply-Automation

**Was:** IMAP-Integration für automatische Reply-Erkennung  
**Aufwand:** 12-16 Stunden  
**Impact:** ⭐⭐ HOCH (aber erst nach Option 1 sinnvoll)

**Warum erst nach Option 1:**
- Automation macht nur Sinn wenn E-Mails auch VERSCHICKT werden
- Erst senden, dann empfangen

**Was implementiert werden müsste:**
```typescript
// IMAP-Client (imap-simple oder ähnlich)
// Polling-Job: Neue E-Mails checken
// Parser: Antworten zuordnen (In-Reply-To Header)
// Sentiment-Analyse (KI oder Regeln)
// Conversation-Reply automatisch anlegen
```

**Verifikation schwierig:**
- Braucht echtes E-Mail-Konto
- Braucht eingehende Test-Antworten
- OAuth für Gmail komplex

---

### Option 3: Neues Produktfeature

**Mögliche Features:**

A) **Analytics Dashboard** (Aufwand: 6-8h)
- Conversion-Raten tracken
- Pipeline-Statistiken
- **Impact:** Mittel (nice-to-have)

B) **Bulk-Actions** (Aufwand: 4-6h)
- Mehrere Leads gleichzeitig qualifizieren
- Massen-Outreach
- **Impact:** Mittel (Zeitersparnis)

C) **Team-Management** (Aufwand: 8-12h)
- Mehrere Nutzer mit Rollen
- Lead-Zuweisung
- **Impact:** Niedrig (aktuell 2-Personen-Team)

---

## Meine klare Empfehlung

### 🎯 Option 1: Echter E-Mail-Versand

**Begründung:**

1. **Core-Feature:** Ohne E-Mail-Versand ist das Tool nicht produktiv nutzbar
2. **Worker wartet:** Der Code ist schon da, nur der Versand fehlt
3. **Realistisch:** 4-6h Aufwand, klar definiert, gut testbar
4. **Business-Value:** Erst dann kannst du wirklich Leads kontaktieren

**Reihenfolge nach Option 1:**
```
1. E-Mail-Versand (jetzt)
2. Sentry aktivieren (5 Min danach)
3. Redis/Worker testen (wenn Redis verfügbar)
4. Reply-Automation (später, wenn nötig)
```

---

## Wenn du NEIN zu E-Mail-Versand sagst

**Alternative:** Redis/Worker live testen
- Docker installieren
- Redis starten
- Worker laufen lassen
- Dann hast du Background-Job-Verarbeitung

**Aber:** Bringt wenig wenn die Jobs nichts Sinnvolles tun (kein E-Mail-Versand).

---

## Entscheidungsmatrix

| Wenn du... | Dann nimm... |
|------------|--------------|
| Willst das Tool wirklich NUTZEN | Option 1 (E-Mail-Versand) |
| Willst erstmal alles stabil haben | Option 2 (Redis + Worker testen) |
| Brauchst mehr Reporting | Option 3A (Analytics) |
| Hast viele Leads zu verarbeiten | Option 3B (Bulk-Actions) |

---

## Mein Vorschlag für sofort

**Sage mir:**
1. **Soll ich E-Mail-Versand implementieren?** (4-6h, höchster Impact)
2. **Oder Redis/Worker zuerst stabilisieren?** (2-3h, Infrastruktur)
3. **Oder willst du erst Sentry aktivieren?** (5 Min, Monitoring)

Ich warte auf deine Entscheidung.

---

*Diese Empfehlung basiert auf echter Verifikation, nicht auf Spekulation.*
