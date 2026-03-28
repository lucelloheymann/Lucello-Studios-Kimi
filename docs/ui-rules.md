# Lucello Rescue Agent – UI Rules

> **Verbindliche UI-Regeln für alle Komponenten**  
> Jede Komponente muss diesen Regeln folgen. Keine Ausnahmen.

---

## 1. Card-System

### Card-Varianten

#### Data Card (Standard)
```
┌─────────────────────────────────────┐
│                                     │
│  [Icon]  Title                      │  ← H4, SemiBold
│          Meta text                  │  ← Caption, Muted
│                                     │
│  ─────────────────────────────────  │  ← Border 1px Slate-200
│                                     │
│  Primary Value                      │  ← H2, Bold
│  +12.5% vs last month               │  ← Caption, Color-coded
│                                     │
└─────────────────────────────────────┘
```
- **Background**: White (Light) / Slate-900 (Dark)
- **Border**: 1px Slate-200 (kein Shadow!)
- **Border Radius**: 8px (`radius-md`)
- **Padding**: 24px (`space-6`)
- **Hover**: Border-Color → Slate-300, Cursor pointer

#### Metric Card
```
┌─────────────────┐
│                 │
│  Value          │  ← H2, 36px, Bold
│  Label          │  ← Caption, Muted
│                 │
│  ▲ 12%          │  ← Caption, Green/Red
│                 │
└─────────────────┘
```
- **Min Width**: 200px
- **Text Align**: Left (nicht center!)
- **Trend**: Pfeil + Prozent, Color-coded

#### List Card
```
┌─────────────────────────────────────┐
│  Title                          [→] │  ← H5, Border-bottom
├─────────────────────────────────────┤
│  ● Item 1                      [→] │  ← Row mit Hover
│  ● Item 2                      [→] │
│  ● Item 3                      [→] │
│                                     │
│  View all →                         │  ← Link, Accent
└─────────────────────────────────────┘
```
- **Row Height**: 56px (min)
- **Row Hover**: Background Slate-50
- **Icon**: 16px, Muted
- **Chevron**: Rechts, Accent auf Hover

#### Empty State Card
```
┌─────────────────────────────────────┐
│                                     │
│           [Icon 48px]               │  ← Muted, Ghost-style
│                                     │
│      No leads found                 │  ← H4, Center
│                                     │
│  Add your first lead to get         │  ← Body Small, Muted
│  started with the analysis          │
│                                     │
│      [+ Add Lead]                   │  ← Button Primary
│                                     │
└─────────────────────────────────────┘
```
- **Icon**: Outline-Style, Muted-Foreground
- **Text**: Center aligned
- **Action**: Primary Button
- **Background**: Subtle Muted (Slate-50)

---

## 2. Badge-System

### Status Badges

| Status | Background | Text | Border |
|--------|------------|------|--------|
| **New** | Slate-100 | Slate-700 | None |
| **Crawling** | Blue-100 | Blue-700 | None |
| **Analyzed** | Indigo-100 | Indigo-700 | None |
| **Generating** | Purple-100 | Purple-700 | None |
| **Ready** | Green-100 | Green-700 | None |
| **Sent** | Emerald-100 | Emerald-700 | None |
| **Error** | Red-100 | Red-700 | None |

### Score Badges

```
┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐
│  23    │  │  45    │  │  62    │  │  78    │  │  91    │
│ CRIT   │  │ POOR   │  │ AVG    │  │ GOOD   │  │ EXCL   │
└────────┘  └────────┘  └────────┘  └────────┘  └────────┘
   Red        Orange      Amber       Blue       Green
```

- **Size**: 48px x 48px (circular)
- **Font**: 14px Bold (Score), 10px (Label)
- **Colors**: Score-Farben (siehe Design-System)

### Label Badges

```
┌─────────────┐
│  Industry   │
└─────────────┘
```
- **Background**: Slate-100
- **Text**: Slate-700
- **Padding**: 4px 12px
- **Radius**: 9999px (pill)
- **Font**: 12px Medium

---

## 3. Score-System

### Score Ring (Circular Progress)

```
     ╭──────╮
    ╱   73   ╲
   │    ▓▓▓   │
    ╲   ▓▓   ╱
     ╰──────╯
```

- **Size**: 64px (default), 48px (small), 96px (large)
- **Stroke Width**: 6px
- **Track**: Slate-200
- **Fill**: Score-Farbe (Gradient bei Hover)
- **Text**: 18px Bold, Center
- **Animation**: 600ms ease-out bei Load

### Score Bar (Linear)

```
Score: 73/100
███████████████░░░░░░░░░░░░░░░░░░  73%
```

- **Height**: 8px (default), 12px (large)
- **Track**: Slate-200, Radius-full
- **Fill**: Score-Farbe, Radius-full
- **Label**: Rechts, 14px Medium
- **Segments**: Optional (für Kategorien)

### Score Breakdown

```
Overall Score: 73/100

Design        ████████████████░░░░░  78
Performance   ███████████░░░░░░░░░░  52
Accessibility ██████████████████░░░  88
SEO           ██████████████░░░░░░░  70
```

- **Layout**: Label links, Bar mitte, Value rechts
- **Gap**: 12px zwischen Items
- **Bar Width**: 120px (konsistent)

---

## 4. Button-System

### Primary Button
```
┌────────────────┐
│   Analyze Now  │
└────────────────┘
```
- **Background**: Navy (`#0F172A`)
- **Text**: White
- **Border Radius**: 0px (scharfe Kanten!)
- **Padding**: 12px 24px
- **Font**: 14px SemiBold
- **Hover**: Background Slate-800
- **Active**: Scale 0.98
- **Loading**: Spinner + "Loading..."

### Secondary Button
```
┌────────────────┐
│   Cancel       │
└────────────────┘
```
- **Background**: White
- **Border**: 1px Slate-300
- **Text**: Slate-900
- **Border Radius**: 8px
- **Hover**: Background Slate-50

### Ghost Button
```
  View details →
```
- **Background**: Transparent
- **Text**: Accent (Blue-600)
- **Hover**: Text-Underline
- **Icon**: Chevron-Right, animiert bei Hover

### Destructive Button
```
┌────────────────┐
│   Delete       │
└────────────────┘
```
- **Background**: Red-600
- **Text**: White
- **Border Radius**: 0px
- **Hover**: Red-700

### Icon Button
```
┌────┐
│ 🗑 │
└────┘
```
- **Size**: 40px x 40px
- **Border Radius**: 8px
- **Icon**: 20px
- **Hover**: Background Slate-100

### Button-States

| State | Visual |
|-------|--------|
| **Default** | Wie oben |
| **Hover** | Background dunkler, Cursor pointer |
| **Active** | Scale 0.98, Schatten (nur hier!) |
| **Disabled** | Opacity 50%, Cursor not-allowed |
| **Loading** | Spinner links, Text "Loading..." |
| **Focus** | Ring 2px Offset, Accent-Farbe |

---

## 5. Tabellen-/Listen-Stil

### Data Table

```
┌─────────────────────────────────────────────────────────┐
│ Company          │ Status   │ Score │ Actions          │
├──────────────────┼──────────┼───────┼──────────────────┤
│ Müller Bau       │ ● New    │  --   │ [View] [Edit]    │
│ Schmidt Immo     │ ● Ready  │  38   │ [View] [Edit]    │
│ Klein & Partner  │ ● Analy..│  42   │ [View] [Edit]    │
└──────────────────┴──────────┴───────┴──────────────────┘
```

- **Header**: Background Slate-100, Text Slate-700, 14px SemiBold
- **Row Height**: 56px
- **Row Hover**: Background Slate-50
- **Border**: Horizontal nur 1px Slate-200
- **Cell Padding**: 16px
- **Score**: Badge oder Ring
- **Status**: Badge mit Dot
- **Actions**: Icon Buttons

### Sortable Table

```
┌──────────────────────────────────────┐
│ Company    ▲ │ Status │ Score ▼      │  ← Sort-Icons
├──────────────────────────────────────┤
```

- **Sort Icon**: 16px, Accent bei aktiv
- **Hover**: Header-Text unterstrichen
- **Cursor**: Pointer auf Header

### Paginated Table

```
Showing 1-10 of 47 results
                    [<] [1] [2] [3] ... [5] [>]
```

- **Info**: Caption, Muted, links
- **Pagination**: Ghost Buttons, Active = Primary

---

## 6. Empty States

### Universal Empty State Pattern

```
┌─────────────────────────────────────┐
│                                     │
│     [Icon 64px, Ghost style]        │
│                                     │
│     No leads yet                    │  ← H4
│                                     │
│     Add your first lead to start    │  ← Body Small, Muted
│     analyzing websites              │
│                                     │
│     [+ Add Lead]                    │  ← Primary Button
│                                     │
│     Or import from CSV              │  ← Ghost Link
│                                     │
└─────────────────────────────────────┘
```

### Empty State Variants

| Context | Icon | Title | Description | Action |
|---------|------|-------|-------------|--------|
| **No Leads** | Users | No leads yet | Add your first lead | + Add Lead |
| **No Results** | Search | No matches | Try different filters | Clear filters |
| **No Data** | BarChart | No analytics | Analysis pending | Run analysis |
| **Error** | Alert | Something wrong | Try again later | Retry |
| **Success** | Check | All done! | No pending tasks | View completed |

### Empty State Regeln
1. **Icon**: 48-64px, Outline-Stil, Muted
2. **Background**: Subtle (Slate-50)
3. **Text**: Center aligned
4. **Action**: Primary Button (wenn möglich)
5. **Secondary**: Ghost Link für Alternative

---

## 7. Action-Hierarchie

### Primary Actions (Nur eine pro View!)
- **+ Add Lead** (Dashboard)
- **Analyze Now** (Lead Detail)
- **Generate Demo** (Analyzed Lead)
- **Approve & Send** (Outreach)

### Secondary Actions
- Cancel
- Save Draft
- Skip
- Back

### Tertiary Actions
- View details →
- Edit
- Delete
- Export

### Action-Gruppierung
```
[Cancel]  [Save Draft]  [Analyze Now →]
          ↑ Secondary   ↑ Primary (rechts!)
```

- **Reihenfolge**: Primary immer rechts
- **Gap**: 12px zwischen Buttons
- **Alignment**: Rechts in Modals, links in Forms

---

## 8. Status-Zustände

### Status Indicators

```
● New           ○ Crawling      ◐ Analyzed
● Ready         ● Sent          ● Error
```

- **Dot**: 8px, gefüllt, Farbe = Status
- **Ring**: 8px, Outline, animiert bei In-Progress
- **Text**: 14px, Regular, neben Dot

### Progress States

| State | Visual |
|-------|--------|
| **Pending** | Dot grau, kein Text |
| **Queued** | Dot grau, "Queued" |
| **Running** | Spinner + "Analyzing..." |
| **Completed** | Checkmark grün |
| **Failed** | X rot + Tooltip |

### Loading States

```
Analysiere Website...
██████████░░░░░░░░░░  52%
```

- **Label**: Aktion im Präsens
- **Progress Bar**: Wenn Fortschritt bekannt
- **Spinner**: Wenn unbestimmt
- **Cancel**: Optional, wenn unterbrechbar

---

## 9. Hover-, Focus-, Disabled-Zustände

### Hover States

| Element | Hover-Effekt |
|---------|--------------|
| **Card** | Border-Color + Cursor pointer |
| **Table Row** | Background Slate-50 |
| **Button Primary** | Background Slate-800 |
| **Button Secondary** | Background Slate-50 |
| **Link** | Underline + Accent |
| **Icon Button** | Background Slate-100 |
| **Badge** | Scale 1.02 |

### Focus States (Keyboard Navigation)

```
┌────────────────┐
│   [Focused]    │  ← Ring 2px offset, Blue
└────────────────┘
```

- **Ring**: 2px solid Accent
- **Offset**: 2px
- **Nur bei**: Keyboard (Tab), nicht bei Click
- **Transition**: 200ms ease-out

### Disabled States

```
┌────────────────┐
│   Disabled     │  ← 50% Opacity
└────────────────┘
```

- **Opacity**: 50%
- **Cursor**: not-allowed
- **Keine Hover-Effekte**
- **Erklärung**: Tooltip bei Hover (warum disabled)

---

## 10. Formular-Elemente

### Input
```
┌──────────────────────────────┐
│ Label                        │
├──────────────────────────────┤
│ Placeholder text            │
└──────────────────────────────┘
```

- **Border**: 1px Slate-300
- **Radius**: 4px
- **Padding**: 12px 16px
- **Focus**: Border Accent + Ring
- **Error**: Border Red + Error-Text darunter

### Select/Dropdown
```
┌──────────────────────────────┐
│ Selected option           [▼]│
└──────────────────────────────┘
```

- **Icon**: Chevron-Down rechts
- **Dropdown**: Card-Style, Shadow-lg
- **Item Hover**: Slate-50

### Checkbox
```
☑ Label
☐ Label
```

- **Size**: 20px
- **Checked**: Primary Fill + White Check
- **Indeterminate**: Horizontal Line

### Toggle
```
  [████░░] Label
```

- **Track**: 40px x 20px
- **Thumb**: 16px circle
- **Animation**: 200ms

---

## 11. Anti-Patterns (VERBOTEN)

### ❌ Niemals tun

1. **Keine verlaufenden Farben** (Gradients)
   - Verwende nur solid colors
   - Keine Gradient-Buttons
   - Keine Gradient-Backgrounds

2. **Keine Schatten auf Cards**
   - Entweder Border ODER Shadow
   - Default: Border (kein Shadow)

3. **Keine Serifen**
   - Plus Jakarta Sans für alles
   - Keine Überschriften in Serif

4. **Keine abgerundeten Primary Buttons**
   - Primary: 0px Radius
   - Secondary: 8px Radius

5. **Keine bunten UI-Elemente**
   - Score-Farben nur für Scores
   - Keine bunten Buttons (nur Navy)

6. **Keine Animationen ohne Zweck**
   - Kein Bounce
   - Kein Parallax
   - Nur Functional Animationen

7. **Keine zentrierte Tabellen-Texte**
   - Alles linksbündig
   - Nur Numbers rechtsbündig

8. **Keine überladenen Leads-Listen**
   - Max 7 Spalten
   - Actions immer sichtbar

9. **Keine versteckten Primary Actions**
   - Primary immer sichtbar
   - Kein "Mehr"-Menü für wichtige Actions

10. **Keine unterschiedlichen Styles pro Seite**
    - Alle Seiten aus einem System
    - Keine "kreativen" Abweichungen

---

## 12. Responsive Verhalten

### Desktop (>1024px)
- Full Table mit allen Spalten
- Sidebar sichtbar
- 3-4 Columns Grid

### Tablet (768-1024px)
- Table: Wichtige Spalten nur
- Sidebar: Collapsible
- 2 Columns Grid

### Mobile (<768px)
- Table → Cards
- Sidebar → Bottom Sheet
- 1 Column Grid
- Actions: FAB (Floating Action Button)

---

*Diese UI Rules sind verbindlich. Keine Ausnahmen ohne Team-Review.*
