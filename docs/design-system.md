# Lucello Rescue Agent – Design System

> **Verbindliches Design-System für das gesamte Produkt**  
> Basierend auf UI UX Pro Max – Minimalism & Swiss Style + B2B Service Palette  
> Version: 1.0 | Letzte Aktualisierung: 2026-03-28

---

## 1. Markencharakter & Visuelle Richtung

### Markenidentität
- **Name**: Lucello Studio – Website Rescue Agent
- **Charakter**: Professionell, analytisch, vertrauenswürdig, modern
- **Zielgruppe**: B2B – Unternehmen mit schwachem Webauftritt
- **Emotion**: Sicherheit durch Daten, Professionalität, Effizienz

### Design-Philosophie
```
┌─────────────────────────────────────────────────────────┐
│  LUCELLO RESCUE AGENT DESIGN PRINCIPLES                 │
├─────────────────────────────────────────────────────────┤
│  1. CLARITY FIRST      → Daten klar, keine Dekoration   │
│  2. FUNCTION OVER FORM → Jedes Element hat einen Zweck  │
│  3. TRUST THROUGH DATA → Visualisierungen > Floskeln    │
│  4. EFFICIENCY         → Schnelle Scans, klare CTAs     │
│  5. PROFESSIONAL       → Seriös, nicht verspielt        │
└─────────────────────────────────────────────────────────┘
```

### Visuelle Richtung
- **Style**: Minimalism & Swiss Style (aus UI UX Pro Max #1)
- **Ausrichtung**: Daten-dicht, funktional, high-contrast
- **Vibe**: "Seriöses Analytics-Tool" – nicht "kreatives Studio"

---

## 2. Farb-System

### Primäre Farbpalette (B2B Service aus UI UX Pro Max)

| Rolle | Farbe | Hex | Usage |
|-------|-------|-----|-------|
| **Primary** | Navy | `#0F172A` | Header, Primary Buttons, Logo |
| **Primary Hover** | Slate 800 | `#1E293B` | Hover-States |
| **On Primary** | White | `#FFFFFF` | Text auf Primary |
| **Secondary** | Slate 600 | `#475569` | Secondary Buttons |
| **On Secondary** | White | `#FFFFFF` | Text auf Secondary |
| **Accent** | Blue 600 | `#2563EB` | Links, Active States, Highlights |
| **On Accent** | White | `#FFFFFF` | Text auf Accent |
| **Background** | Slate 50 | `#F8FAFC` | Page Background |
| **Foreground** | Slate 900 | `#0F172A` | Primary Text |
| **Card** | White | `#FFFFFF` | Cards, Modals, Popovers |
| **Card Foreground** | Slate 900 | `#0F172A` | Text auf Cards |
| **Muted** | Slate 200 | `#E2E8F0` | Disabled, Borders, Dividers |
| **Muted Foreground** | Slate 500 | `#64748B` | Placeholder, Meta-Text |
| **Border** | Slate 200 | `#E2E8F0` | Card Borders, Inputs |
| **Destructive** | Red 600 | `#DC2626` | Delete, Errors, Alerts |
| **On Destructive** | White | `#FFFFFF` | Text auf Destructive |
| **Success** | Green 600 | `#16A34A` | Success States, Positive |
| **Warning** | Amber 600 | `#D97706` | Warnings, Caution |
| **Info** | Blue 500 | `#3B82F6` | Information, Tips |

### Score-Farben (Website-Qualität)
| Score | Farbe | Hex | Usage |
|-------|-------|-----|-------|
| **0-30 (Critical)** | Red 600 | `#DC2626` | Sehr schlechte Websites |
| **31-50 (Poor)** | Orange 500 | `#F97316` | Verbesserungswürdig |
| **51-70 (Average)** | Amber 500 | `#F59E0B` | Durchschnitt |
| **71-85 (Good)** | Blue 500 | `#3B82F6` | Gut |
| **86-100 (Excellent)** | Green 600 | `#16A34A` | Hervorragend |

### Status-Farben
| Status | Farbe | Hex |
|--------|-------|-----|
| **New** | Slate 400 | `#94A3B8` |
| **Crawled** | Blue 400 | `#60A5FA` |
| **Analyzed** | Indigo 500 | `#6366F1` |
| **Site Generated** | Purple 500 | `#A855F7` |
| **Outreach Ready** | Green 500 | `#22C55E` |
| **Sent** | Emerald 600 | `#059669` |
| **Error/Failed** | Red 600 | `#DC2626` |

---

## 3. Dark Theme

### Dark Mode Variablen

| Rolle | Farbe | Hex |
|-------|-------|-----|
| **Background** | Slate 950 | `#020617` |
| **Foreground** | Slate 50 | `#F8FAFC` |
| **Card** | Slate 900 | `#0F172A` |
| **Card Foreground** | Slate 50 | `#F8FAFC` |
| **Primary** | Blue 500 | `#3B82F6` |
| **On Primary** | White | `#FFFFFF` |
| **Secondary** | Slate 700 | `#334155` |
| **Muted** | Slate 800 | `#1E293B` |
| **Muted Foreground** | Slate 400 | `#94A3B8` |
| **Border** | Slate 800 | `#1E293B` |
| **Accent** | Blue 400 | `#60A5FA` |

### Dark Mode Regeln
1. **Background**: Immer tief dunkel (`#020617`), nicht nur grau
2. **Cards**: Eine Stufe heller als Background (`#0F172A`)
3. **Text**: Hoher Kontrast (Slate 50/100 auf dunklem BG)
4. **Borders**: Subtil (Slate 800)
5. **Accent**: Blau heller als im Light Mode für Sichtbarkeit
6. **Score-Farben**: Gleiche Hue, aber höhere Sättigung im Dark Mode

---

## 4. Typografie

### Font Family
**Primary**: `Plus Jakarta Sans` (aus UI UX Pro Max #13 - Friendly SaaS)
- Google Fonts: https://fonts.google.com/specimen/Plus+Jakarta+Sans
- Weights: 300 (Light), 400 (Regular), 500 (Medium), 600 (SemiBold), 700 (Bold)

```css
@font-face {
  font-family: 'Plus Jakarta Sans';
  src: url('https://fonts.gstatic.com/s/plusjakartasans/v8/LDIoa08Z8wHBIkCqoBvn3U8qooQGGpQ8fE0.woff2');
}
```

### Type Scale

| Level | Size | Line Height | Weight | Usage |
|-------|------|-------------|--------|-------|
| **Display** | 48px / 3rem | 1.1 | 700 | Hero-Seiten, Willkommen |
| **H1** | 36px / 2.25rem | 1.2 | 700 | Seiten-Titel |
| **H2** | 30px / 1.875rem | 1.25 | 600 | Section Headers |
| **H3** | 24px / 1.5rem | 1.3 | 600 | Card Titles |
| **H4** | 20px / 1.25rem | 1.4 | 600 | Subsection |
| **H5** | 18px / 1.125rem | 1.5 | 500 | Labels |
| **H6** | 16px / 1rem | 1.5 | 500 | Small Headers |
| **Body** | 16px / 1rem | 1.6 | 400 | Fließtext |
| **Body Small** | 14px / 0.875rem | 1.6 | 400 | Sekundärer Text |
| **Caption** | 12px / 0.75rem | 1.5 | 400 | Meta, Timestamps |
| **Button** | 14px / 0.875rem | 1 | 600 | Button-Text |
| **Badge** | 12px / 0.75rem | 1 | 600 | Labels, Tags |

### Typografie-Regeln
1. **Max 3 Größen pro Seite**: Vermeide zu viele Hierarchie-Ebenen
2. **Kontrast durch Weight**: Nicht nur Size, auch Weight nutzen
3. **Line Height**: 1.5-1.6 für Body, 1.2-1.3 für Headlines
4. **Letter Spacing**: -0.02em für große Headlines, 0.05em für Caps
5. **Max Width**: 65ch für Body-Text (Lesbarkeit)

---

## 5. Spacing & Grid

### Spacing Scale (4px Base)

| Token | Wert | Usage |
|-------|------|-------|
| `space-0` | 0px | Kein Abstand |
| `space-1` | 4px | Icon-Spacing, Tight |
| `space-2` | 8px | Inline-Elemente, Badge-Padding |
| `space-3` | 12px | Button-Padding Y, Small Gaps |
| `space-4` | 16px | Standard-Gap, Card-Padding |
| `space-5` | 20px | Section-Padding Small |
| `space-6` | 24px | Section-Padding, Large Gaps |
| `space-8` | 32px | Section-Padding Medium |
| `space-10` | 40px | Section-Padding Large |
| `space-12` | 48px | Page-Padding |
| `space-16` | 64px | Large Sections |
| `space-20` | 80px | Hero-Sections |

### Grid System
- **Container Max-Width**: 1400px ( centered )
- **Grid**: 12-Spalten
- **Gap**: 24px (Desktop), 16px (Tablet), 12px (Mobile)
- **Padding**: 48px (Desktop), 24px (Tablet), 16px (Mobile)

### Layout-Prinzipien
1. **Whitespace**: Große Bereiche für Data-Dense Dashboards
2. **Konsistenz**: Gleiche Abstände auf allen Seiten
3. **Alignment**: Alles auf 4px Grid alignen
4. **Proximity**: Verwandte Elemente näher zusammen

---

## 6. Border Radius

| Token | Wert | Usage |
|-------|------|-------|
| `radius-none` | 0px | Buttons (Primary), Data Tables |
| `radius-sm` | 4px | Inputs, Small Elements |
| `radius-md` | 8px | Cards, Buttons (Secondary) |
| `radius-lg` | 12px | Modals, Large Cards |
| `radius-xl` | 16px | Feature Cards, Empty States |
| `radius-full` | 9999px | Pills, Avatars, Circular |

### Radius-Regeln
1. **Schweizer Stil**: Primär scharfe Kanten (0px) für Professionalität
2. **Cards**: 8-12px für leichte Auflockerung
3. **Buttons**: Primary 0px, Secondary 8px
4. **Avatars**: Immer circular (full)

---

## 7. Shadows

| Token | Wert | Usage |
|-------|------|-------|
| `shadow-none` | none | Flat Design |
| `shadow-sm` | `0 1px 2px rgba(0,0,0,0.05)` | Subtle Elevation |
| `shadow-md` | `0 4px 6px -1px rgba(0,0,0,0.1)` | Cards, Dropdowns |
| `shadow-lg` | `0 10px 15px -3px rgba(0,0,0,0.1)` | Modals, Popovers |
| `shadow-xl` | `0 20px 25px -5px rgba(0,0,0,0.1)` | Full-Screen Overlays |

### Shadow-Regeln
1. **Minimal**: Schweizer Stil = wenige Schatten
2. **Elevation**: Nur für überlappende Elemente (Modals, Dropdowns)
3. **Cards**: Entweder Border ODER Shadow, nicht beides
4. **Dark Mode**: Schatten dezenter (40% Opacity)

---

## 8. Transitions

| Token | Dauer | Usage |
|-------|-------|-------|
| `duration-instant` | 0ms | Keine Animation |
| `duration-fast` | 100ms | Micro-interactions |
| `duration-normal` | 200ms | Hover, Focus |
| `duration-slow` | 300ms | Page Transitions |

### Easing
- **Standard**: `cubic-bezier(0.4, 0, 0.2, 1)` (ease-out)
- **Enter**: `cubic-bezier(0, 0, 0.2, 1)` (decelerate)
- **Exit**: `cubic-bezier(0.4, 0, 1, 1)` (accelerate)
- **Bounce**: `cubic-bezier(0.34, 1.56, 0.64, 1)` (Playful - sparsam)

### Animations-Regeln
1. **Subtle**: Fast nicht sichtbar, aber spürbar
2. **Functional**: Animation hat Zweck (Feedback, Loading)
3. **Reduced Motion**: `@media (prefers-reduced-motion)` beachten
4. **GPU**: `transform` und `opacity` bevorzugen

---

## 9. Z-Index Scale

| Token | Wert | Usage |
|-------|------|-------|
| `z-base` | 0 | Normal content |
| `z-dropdown` | 10 | Dropdowns, Selects |
| `z-sticky` | 20 | Sticky headers |
| `z-drawer` | 30 | Side panels |
| `z-modal` | 40 | Modals, Dialogs |
| `z-popover` | 50 | Popovers, Tooltips |
| `z-toast` | 60 | Notifications |
| `z-max` | 100 | Overlays, Full-screen |

---

## 10. Breakpoints

| Name | Breite | Usage |
|------|--------|-------|
| `sm` | 640px | Mobile Landscape |
| `md` | 768px | Tablet |
| `lg` | 1024px | Desktop |
| `xl` | 1280px | Large Desktop |
| `2xl` | 1536px | Extra Large |

---

## 11. Token-Zusammenfassung (Tailwind Config)

```javascript
// tailwind.config.ts Erweiterung
const lucelloTheme = {
  colors: {
    border: "hsl(var(--border))",
    input: "hsl(var(--input))",
    ring: "hsl(var(--ring))",
    background: "hsl(var(--background))",
    foreground: "hsl(var(--foreground))",
    primary: {
      DEFAULT: "hsl(var(--primary))",
      foreground: "hsl(var(--primary-foreground))",
    },
    secondary: {
      DEFAULT: "hsl(var(--secondary))",
      foreground: "hsl(var(--secondary-foreground))",
    },
    destructive: {
      DEFAULT: "hsl(var(--destructive))",
      foreground: "hsl(var(--destructive-foreground))",
    },
    muted: {
      DEFAULT: "hsl(var(--muted))",
      foreground: "hsl(var(--muted-foreground))",
    },
    accent: {
      DEFAULT: "hsl(var(--accent))",
      foreground: "hsl(var(--accent-foreground))",
    },
    popover: {
      DEFAULT: "hsl(var(--popover))",
      foreground: "hsl(var(--popover-foreground))",
    },
    card: {
      DEFAULT: "hsl(var(--card))",
      foreground: "hsl(var(--card-foreground))",
    },
    // Score colors
    score: {
      critical: "#DC2626",
      poor: "#F97316",
      average: "#F59E0B",
      good: "#3B82F6",
      excellent: "#16A34A",
    },
  },
  fontFamily: {
    sans: ['Plus Jakarta Sans', 'system-ui', 'sans-serif'],
  },
  borderRadius: {
    lg: "var(--radius)",
    md: "calc(var(--radius) - 2px)",
    sm: "calc(var(--radius) - 4px)",
  },
}
```

---

## 12. Design-Prinzipien (Zusammenfassung)

### DO ✅
- **Whitespace nutzen**: Daten brauchen Raum zum Atmen
- **Konsistente Spacing**: 4px Grid strikt einhalten
- **High Contrast**: WCAG AA Minimum, AAA bevorzugen
- **Klare Hierarchie**: Weight > Size > Color für Hierarchie
- **Funktionale Farben**: Score-Farben nur für Scores nutzen
- **Scharfe Kanten**: Primary Buttons ohne Radius
- **Max 3 Farben**: Primary + Neutral + Accent reichen

### DON'T ❌
- **Keine Dekoration**: Keine Gradients, keine Schatten ohne Grund
- **Keine Verspieltheit**: Keine abgerundeten Ecken überall
- **Keine Farb-Explosion**: Score-Farben nicht für UI nutzen
- **Keine komplexen Animationen**: Subtle > Showy
- **Keine Serifen**: Sans-Serif für alles
- **Keine Schatten auf Cards**: Border oder Shadow, nicht beides
- **Keine überladenen Dashboards**: Whitespace ist Feature

---

## 13. Referenzen

- **UI UX Pro Max Style #1**: Minimalism & Swiss Style
- **UI UX Pro Max Color #5**: B2B Service Palette  
- **UI UX Pro Max Typography #13**: Friendly SaaS (Plus Jakarta Sans)
- **Inspiration**: Linear, Vercel, Raycast, Supabase Dashboard

---

*Dieses Design-System ist verbindlich für alle Lucello Rescue Agent Entwicklung.*
