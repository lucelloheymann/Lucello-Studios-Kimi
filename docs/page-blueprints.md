# Lucello Rescue Agent – Page Blueprints

> **Verbindliche Seiten-Strukturen für alle Hauptseiten**  
> Jede Seite muss diesem Blueprint folgen. Keine Ausnahmen.

---

## 1. Dashboard (`/dashboard`)

### Zweck
Übersicht über die Pipeline, KPIs und Handlungsbedarf.

### Layout-Struktur
```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                  │
│ [Title] [Subtitle]                        [+ Neuer Lead]│
├─────────────────────────────────────────────────────────┤
│ KPI CARDS (4-Spalten)                                   │
│ [Leads] [Qualifiziert] [Demo erstellt] [Gesendet]       │
├─────────────────────────────────────────────────────────┤
│ ACTION CENTER (optional, wenn Handlungsbedarf)          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚡ Handlungsbedarf (n)                              │ │
│ │ [Icon] [Label] [Sub]              [CTA Button]      │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ PIPELINE + OUTREACH (2-Spalten)                         │
│ ┌─────────────────────────────┐ ┌─────────────────────┐ │
│ │ Pipeline (Funnel)           │ │ Outreach freigeben  │ │
│ │ [████████░░░░░░░░░] 47  15% │ │ [Draft 1]           │ │
│ │ [██████░░░░░░░░░░░] 32  10% │ │ [Draft 2]           │ │
│ └─────────────────────────────┘ └─────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ LEADS + BRANCHEN (2-Spalten)                            │
│ ┌─────────────────────────────┐ ┌─────────────────────┐ │
│ │ Neueste Leads               │ │ Top-Branchen        │ │
│ │ [M] Müller GmbH      42 ●   │ │ 1. Handwerk    12   │ │
│ │ [S] Schmidt KG       -- ●   │ │ 2. Einzelhandel 8   │ │
│ └─────────────────────────────┘ └─────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Komponenten
| Bereich | Komponente | Variante |
|---------|------------|----------|
| KPI Cards | MetricCard | 4-Spalten Grid |
| Action Center | AlertCard | Amber Accent |
| Pipeline | ProgressBar | Horizontal |
| Neueste Leads | ListCard | Avatar + Score + Status |
| Top-Branchen | RankedList | Numbered |

### Spezifische Regeln
1. **KPI Cards**: Immer 4, gleichgewichtet, mit Icon + Trend
2. **Action Center**: Nur anzeigen wenn `actionItems.length > 0`
3. **Pipeline**: Horizontale Bars, farbcodiert nach Status
4. **Neue Leads**: Max 6, mit Initials-Avatar
5. **Kein Handlungsbedarf**: Success-Message statt Action Center

---

## 2. Leads-Liste (`/leads`)

### Zweck
Übersicht aller Leads mit Filterung und Suche.

### Layout-Struktur
```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                  │
│ [Title] [Subtitle]                        [+ Lead]      │
├─────────────────────────────────────────────────────────┤
│ CHIP-FILTER                                             │
│ [Alle 47] [Handlungsbedarf 3] [Qualifiziert 12] ...     │
├─────────────────────────────────────────────────────────┤
│ FILTER-BAR                                              │
│ [🔍 Suche...] [Status ▼] [Branche ▼] [Bundesland ▼]     │
├─────────────────────────────────────────────────────────┤
│ LEADS-TABELLE                                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ Firma │ Branche │ Ort │ Score │ Status │ Erstellt  │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ [M] Müller │ Handwerk │ Berlin │ 42 │ ● New │ 2d  │ │
│ │ [S] Schmidt│ IT       │ Hamburg│ -- │ ● Ready│ 1w │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ PAGINATION (wenn > 25)                                  │
│ Seite 1 von 5 · 47 Einträge              [<] [1] [>]   │
└─────────────────────────────────────────────────────────┘
```

### Komponenten
| Bereich | Komponente | Variante |
|---------|------------|----------|
| Chip-Filter | FilterChip | Toggle |
| Filter-Bar | SearchInput + Selects | Inline |
| Tabelle | DataTable | 6 Spalten |
| Empty State | EmptyCard | Context-aware |
| Pagination | Pagination | Simple |

### Spezifische Regeln
1. **Chip-Filter**: "Alle" + "Handlungsbedarf" (immer anzeigen) + Status-Filter
2. **Handlungsbedarf**: Amber dot, pulsiert wenn aktiv
3. **Tabelle**: Min 56px Row-Height, Hover-Effect
4. **Score**: Pill mit Farbcodierung, "—" wenn nicht analysiert
5. **Avatar**: Initials, 8px rounded, Gruppen-Badge bei Action-Needed

---

## 3. Lead-Detail (`/leads/[id]`)

### Zweck
Vollständige Lead-Informationen, Analyse-Scores und Actions.

### Layout-Struktur
```
┌─────────────────────────────────────────────────────────┐
│ [← Zurück zu Leads]                                     │
├─────────────────────────────────────────────────────────┤
│ HERO CARD                                               │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [Status] [Qualifiziert] [Branche]                   │ │
│ │                                                     │ │
│ │ Firma Name GmbH                                     │ │
│ │ 🌐 domain.com  📍 Berlin, DE-BE                     │ │
│ │                                     ┌─────────────┐ │ │
│ │                                     │     73      │ │ │
│ │                                     │   von 100   │ │ │
│ │                                     │    Gut      │ │ │
│ │                                     └─────────────┘ │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ [Crawlen] [Analysieren] [Demo] [Outreach]    Next→  │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ MAIN GRID (1:2 Verhältnis)                              │
│ ┌─────────────────┐ ┌─────────────────────────────────┐ │
│ │ FIRMENDATEN     │ │ ANALYSE-SCORECARD               │ │
│ │ ─────────────   │ │ ─────────────────────────────── │ │
│ │ Branche: Handw. │ │ Zusammenfassung                 │ │
│ │ Ort: Berlin     │ │ "Die Website hat..."            │ │
│ │ ...             │ │                                 │ │
│ │                 │ │ TEIL-SCORES (3x3 Grid)          │ │
│ │ ─────────────   │ │ [78 Design] [52 Perf] [88 Acc]  │ │
│ │ KONTAKT         │ │ [70 SEO] [65 UX] ...            │ │
│ │ ─────────────   │ │                                 │ │
│ │ 📞 030/123456   │ │ ┌───────────┐ ┌───────────┐     │ │
│ │ ✉️ info@...     │ │ │ Stärken   │ │ Schwächen │     │ │
│ │                 │ │ │ · Punkt 1 │ │ · Punkt 1 │     │ │
│ │ ─────────────   │ │ └───────────┘ └───────────┘     │ │
│ │ SCREENSHOT      │ │                                 │ │
│ │ [Screenshot]    │ │ QUICK WINS                      │ │
│ │                 │ │ ⚡ 1. Erste Aktion...           │ │
│ └─────────────────┘ └─────────────────────────────────┘ │
│                                                         │
│ │ DEMO-WEBSITE (wenn vorhanden)                       │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ [LayoutIcon] Demo-Website v1        [Vollansicht]│ │ │
│ │ │ Stil: Modern Minimal    Erstellt: 2d ago       │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│                                                         │
│ │ OUTREACH-ENTWURF (wenn vorhanden)                   │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ [SendIcon] Outreach-Entwurf          [Blockiert]│ │ │
│ │ │ Betreff: Ihre Website...                        │ │ │
│ │ │ "Liebes Team..."                                │ │ │
│ │ │                                  [Freigeben]    │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
├─────────────────────────────────────────────────────────┤
│ PIPELINE-VERLAUF                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ● 2024-01-15 14:32    ● New      Manuell erstellt   │ │
│ │ ● 2024-01-15 15:45    ● Crawled  Crawl abgeschlossen│ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Komponenten
| Bereich | Komponente | Variante |
|---------|------------|----------|
| Hero | HeroCard | Score + Actions |
| Firmendaten | DataCard | Key-Value |
| Kontakt | DataCard | Contact-List |
| Screenshot | ImageCard | Thumbnail |
| Scorecard | AnalysisCard | Grid |
| Teil-Scores | ScoreGrid | 3x3 |
| Stärken/Schwächen | SplitCard | 50/50 |
| Quick Wins | AlertCard | Amber |
| Demo | ActionCard | Preview |
| Outreach | ActionCard | Approval |
| Verlauf | Timeline | Vertical |

### Spezifische Regeln
1. **Hero**: Score-Block rechts, zentriert, farbcodiert
2. **Action-Buttons**: 4 Steps (Crawl → Analyze → Demo → Outreach)
3. **Nächster Schritt**: Rechts im Hero als Hint
4. **Scorecard**: 3x3 Grid für Teil-Scores
5. **Stärken/Schwächen**: Side-by-Side, max 4-5 Punkte
6. **Quick Wins**: Numbered List, Amber Accent
7. **Demo/Outreach**: Nur anzeigen wenn existiert, sonst CTA

---

## 4. Outreach (`/outreach`)

### Zweck
Übersicht aller Outreach-Entwürfe mit Freigabe-Workflow.

### Layout-Struktur
```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                  │
│ [Title] [Subtitle]                      [Guardrails OK] │
├─────────────────────────────────────────────────────────┤
│ KPI CARDS (4-Spalten)                                   │
│ [Warten 3] [Freigegeben 2] [Gesendet 12] [Antworten 1]  │
├─────────────────────────────────────────────────────────┤
│ FREIGABE-PROZESS (nur wenn Entwürfe existieren)         │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [1 Entwurf] → [2 Prüfen] → [3 Freigabe] → [4 Senden]│ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ FREIGABE AUSSTEHEND (Section)                           │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ⚠ Freigabe ausstehend (3)                           │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Müller GmbH  │ Betreff: Ihre Website...              │ │
│ │ [Versand blockiert] [Platzhalter offen]    →        │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ FREIGEGEBEN (Section, collapsed wenn leer)              │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ ✓ Freigegeben — bereit zum Senden (2)               │ │
│ ├─────────────────────────────────────────────────────┤ │
│ │ Schmidt KG   │ Betreff: ...              [Ansehen] [Senden]│ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ GESENDET (Section, collapsed)                           │
│ │ Firma │ Betreff │ Gesendet │ Status                  │ │
└─────────────────────────────────────────────────────────┘
```

### Komponenten
| Bereich | Komponente | Variante |
|---------|------------|----------|
| KPI Cards | MiniKpi | 4-Spalten |
| Workflow | Stepper | Horizontal |
| Sections | SectionCard | Collapsible |
| Draft-List | ActionList | Status-Badges |
| Sent-Table | DataTable | 4 Spalten |

### Spezifische Regeln
1. **Workflow-Steps**: Immer 4 Schritte visualisieren
2. **Guardrails-Status**: Immer sichtbar (grün)
3. **Draft-Items**: Status-Badges (Blockiert, Platzhalter)
4. **Freigegeben**: Senden-Button prominent
5. **Gesendet**: Tabelle mit Sortierung

---

## 5. Templates (`/templates`)

### Zweck
Übersicht aller Templates für Outreach, Angebote und Branchen.

### Layout-Struktur
```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                  │
│ [Title] [Subtitle]                      [+ Template]    │
├─────────────────────────────────────────────────────────┤
│ INFO-BANNER                                             │
│ ℹ Templates steuern KI-Generierung... (Phase 7)         │
├─────────────────────────────────────────────────────────┤
│ TEMPLATE-GRID (2x2)                                     │
│ ┌─────────────────────┐ ┌─────────────────────────────┐ │
│ │ 📧 Outreach         │ │ 📦 Angebote                 │ │
│ │ Templates           │ │                             │ │
│ │ 5                   │ │ 3                           │ │
│ │                     │ │                             │ │
│ │ • Standard          │ │ • Basic     ab 2.500 €      │ │
│ │ • Follow-up         │ │ • Premium   ab 5.000 €      │ │
│ └─────────────────────┘ └─────────────────────────────┘ │
│ ┌─────────────────────┐ ┌─────────────────────────────┐ │
│ │ 🌍 Branchen         │ │ ⚙️ System-Prompts           │ │
│ │ Templates           │ │                             │ │
│ │ 8                   │ │ 3 aktiv                     │ │
│ │                     │ │                             │ │
│ │ • Handwerk          │ │ • Analyse-Prompt            │ │
│ │ • Einzelhandel      │ │ • Demo-Generator            │ │
│ └─────────────────────┘ └─────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Komponenten
| Bereich | Komponente | Variante |
|---------|------------|----------|
| Info-Banner | AlertCard | Info |
| Template-Cards | GridCard | 2x2 |
| List-Items | ListRow | Key-Value |

### Spezifische Regeln
1. **Grid**: Immer 2-Spalten, gleiche Höhe
2. **Counter**: Oben rechts in jeder Card
3. **Template-Liste**: Max 5 sichtbar, "..." wenn mehr
4. **System-Prompts**: Status-Dot (grün = aktiv)

---

## 6. Settings (`/settings`)

### Zweck
System-Konfiguration, Modelle, Queue-Status und Suchgebiete.

### Layout-Struktur
```
┌─────────────────────────────────────────────────────────┐
│ HEADER                                                  │
│ [Title] [Subtitle]                                      │
├─────────────────────────────────────────────────────────┤
│ LLM-MODELLE                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [🧠 Icon] LLM-Modelle                               │ │
│ │ ┌─────────────────┐ ┌─────────────────┐             │ │
│ │ │ Analysis: GPT-4 │ │ Outreach: GPT-4 │             │ │
│ │ └─────────────────┘ └─────────────────┘             │ │
│ │ Provider: openai                                    │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ QUEUE & WORKER                                          │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [📡 Icon] Queue & Worker              [Online]      │ │
│ │ Queue       Wartend  Aktiv  Fertig  Fehlgeschlagen  │ │
│ │ crawl       2        0       47      0              │ │
│ │ analysis    0        1       12      2              │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ SUCHGEBIETE                                             │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [📍 Icon] Suchgebiete                   (2)         │ │
│ │ ┌─────────────────────────────────────────────────┐ │ │
│ │ │ Berliner Handwerk                    [Aktiv]    │ │ │
│ │ │ Branchen: Handwerk, Einzelhandel                │ │ │
│ │ │ Städte: Berlin, Potsdam                         │ │ │
│ │ └─────────────────────────────────────────────────┘ │ │
│ └─────────────────────────────────────────────────────┘ │
├─────────────────────────────────────────────────────────┤
│ SYSTEM-PARAMETER                                        │
│ ┌─────────────────────────────────────────────────────┐ │
│ │ [⚙️ Icon] System-Parameter                          │ │
│ │ ┌──────────┐ ┌──────────┐ ┌──────────┐             │ │
│ │ │ Umgebung │ │ Storage  │ │ Timeout  │             │ │
│ │ │ develop  │ │ local    │ │ 30000ms  │             │ │
│ │ └──────────┘ └──────────┘ └──────────┘             │ │
│ └─────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────┘
```

### Komponenten
| Bereich | Komponente | Variante |
|---------|------------|----------|
| LLM-Modelle | DataCard | Key-Value Grid |
| Queue | DataTable | Status + Stats |
| Suchgebiete | ExpandableCard | Details |
| System-Params | GridCard | 3-Spalten |

### Spezifische Regeln
1. **Worker-Status**: Prominent, farbcodiert (grün/rot)
2. **Queue-Tabelle**: Monospace für Zahlen
3. **Suchgebiete**: Expandable, grün wenn aktiv
4. **System-Params**: Read-only, Grid-Layout

---

## Gemeinsame Layout-Regeln

### Page-Spacing
| Element | Wert |
|---------|------|
| Page Padding | `p-6` (24px) |
| Max Width | `max-w-7xl` (Lead-Detail), sonst full |
| Section Gap | `space-y-5` (20px) |
| Card Gap | `gap-5` (20px) |

### Header-Struktur (jede Seite)
```
┌─────────────────────────────────────────────────────────┐
│ [Title H1]                              [Primary Action]│
│ [Subtitle muted]                                        │
└─────────────────────────────────────────────────────────┘
```

### Responsive Breakpoints
| Breakpoint | Layout-Änderung |
|------------|-----------------|
| Desktop (>1024px) | Multi-Column Grids |
| Tablet (768-1024px) | 2-Spalten, kompakter |
| Mobile (<768px) | Single Column, gestapelte Cards |

---

*Jede Seite muss diesem Blueprint folgen. Abweichungen müssen im Design-System dokumentiert werden.*
