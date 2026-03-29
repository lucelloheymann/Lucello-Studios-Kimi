# UI UX Pro Max - Nutzungsanleitung

**Was es ist:** Design-Datenbank mit 67 UI Styles, 161 Farbpaletten, 57 Fonts  
**Ort:** `apps/website-rescue-agent/src/ui-ux-pro-max/`  
**Status:** Lokale Datenquelle, manuelle Nutzung

---

## Schnellstart

### Voraussetzungen

```bash
# Python 3 muss installiert sein
python --version  # oder python3 --version
```

### NPM Scripts (empfohlen)

```bash
# Allgemeine Suche
cd apps/website-rescue-agent
npm run uiux:search -- "<query>" [--domain <domain>]

# Kurzbefehle für häufige Domains
npm run uiux:style "glassmorphism"      # UI Styles
npm run uiux:colors "luxury brand"      # Farbpaletten
npm run uiux:fonts "elegant serif"      # Typography
npm run uiux:landing "saas"             # Landing Page Patterns
npm run uiux:product "dashboard"        # Product UI Patterns

# Design-System generieren
npm run uiux:design "beauty spa" -p "Project Name"
npm run uiux:design "beauty spa" -p "Project Name" --persist
```

### Verfügbare Domains

| Domain | Befehl | Beschreibung |
|--------|--------|--------------|
| `style` | `npm run uiux:style` | UI Styles (Glassmorphism, Brutalism, etc.) |
| `color` | `npm run uiux:colors` | Farbpaletten für Branchen |
| `typography` | `npm run uiux:fonts` | Google Fonts Pairings |
| `landing` | `npm run uiux:landing` | Landing Page Patterns |
| `product` | `npm run uiux:product` | Product UI Patterns |
| `ux` | `npm run uiux:search -- "<query>" --domain ux` | UX Guidelines |
| `chart` | - | Chart/Graph Patterns |

---

## Beispiele

### Farbpalette für Beauty-Spa finden

```bash
npm run uiux:colors -- "spa wellness beauty"
```

**Output:**
```
🔍 UI UX Pro Max Search
───────────────────────
## UI Pro Max Search Results
**Domain:** color | **Query:** spa wellness beauty
**Source:** colors.csv | **Found:** 3 results

### Result 1
- **Name:** Serenity Spa
- **Primary:** #8B9D83
- **Secondary:** #E8D5C4
- **Accent:** #D4A574
...
```

### UI Style für FinTech finden

```bash
npm run uiux:style -- "fintech minimal dark"
```

### Komplettes Design-System generieren

```bash
npm run uiux:design -- "luxury real estate" -p "Braun Immobilien"
```

Mit Persistenz (speichert in `design-system/MASTER.md`):

```bash
npm run uiux:design -- "luxury real estate" -p "Braun Immobilien" --persist
```

---

## Für Kimi-Nutzung

Kimi kann diese Scripts automatisch aufrufen wenn Design-Entscheidungen anstehen:

**Beispiel-Workflow:**

1. Nutzer: "Wir brauchen ein Design für eine Zahnarztpraxis"
2. Kimi: 
   ```bash
   npm run uiux:colors -- "medical dental health"
   npm run uiux:fonts -- "professional clean"
   npm run uiux:style -- "medical minimal"
   ```
3. Kimi: Präsentiert Ergebnisse + Empfehlung

**Hinweis:** Die Scripts sind deterministisch - gleiche Query = gleiches Ergebnis.

---

## Datenquellen

| Datei | Inhalt | Anzahl |
|-------|--------|--------|
| `data/styles.csv` | UI Styles | 67 |
| `data/colors.csv` | Farbpaletten | 161 |
| `data/typography.csv` | Font-Pairings | 57 |
| `data/landing.csv` | Landing Patterns | 50+ |
| `data/products.csv` | Product Categories | 161 |

---

## Troubleshooting

### "python: command not found"

```bash
# Windows (PowerShell)
python3 --version

# Oder Python-Pfad explizit angeben
npm config set python python3
```

### "No module named 'core'"

```bash
# Muss im richtigen Verzeichnis ausgeführt werden
cd apps/website-rescue-agent
npm run uiux:search ...
```

### Keine Ergebnisse

- Query verallgemeinern (statt "Zahnarztpraxis Dr. Müller" → "medical dental")
- Andere Domain probieren
- `--max-results 5` erhöhen

---

## Integration in Demo-Generierung

Für zukünftige Automatisierung (nicht jetzt implementiert):

```typescript
// Mögliche Integration
const designSystem = await searchUiUxProMax({
  industry: lead.industry,
  mood: "professional",
  output: "design-system"
});
```

**Aktueller Status:** Manuelle Nutzung via npm scripts.
