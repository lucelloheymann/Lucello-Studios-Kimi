# Lucello Rescue Agent – Design Audit

> **Analyse aller Seiten gegen das Design-System**  
> Stand: 2026-03-28

---

## Zusammenfassung

| Seite | Status | Kritische Issues | Warnings |
|-------|--------|------------------|----------|
| Dashboard | ⚠️ Partial | 3 | 4 |
| Leads | ⚠️ Partial | 2 | 5 |
| Lead-Detail | ❌ Non-Compliant | 8 | 6 |
| Outreach | ⚠️ Partial | 2 | 3 |
| Templates | ✅ Compliant | 0 | 2 |
| Settings | ✅ Compliant | 0 | 2 |

---

## 1. Dashboard (`/dashboard`)

### Was passt ✅
- Page Header Struktur korrekt
- KPI Cards verwenden korrekte Metrik-Darstellung
- Action Center zeigt Handlungsbedarf korrekt an
- Pipeline-Visualisierung nutzt Progress Bars
- Neueste Leads nutzen ListCard-Pattern
- Empty States sind vorhanden

### Was nicht passt ❌

#### Kritisch (muss gefixt werden)
| Issue | Location | Design-System | Current |
|-------|----------|---------------|---------|
| **1. Primary Button hat Border Radius** | "Neuer Lead" Button | `rounded-none` (0px) | `rounded-lg` (8px) |
| **2. ScorePill falscher Orange-Threshold** | Neueste Leads Score | `31-50 = Orange` | `>= 35 = Orange` |
| **3. KPI Card Accents inkonsistent** | KPI Cards | Accent nur auf Icon | Ganze Card farblich abgesetzt |

#### Warnings (sollte gefixt werden)
| Issue | Location | Empfohlen |
|-------|----------|-----------|
| 4. Pipeline Farben nicht aus Design-System | Funnel-Bars | `score-*` Color Tokens nutzen |
| 5. Action Center Badge zu klein | Handlungsbedarf Count | `rounded-full` statt `rounded-md` |
| 6. Top-Branchen Bar Color hardcoded | Branchen-Progress | `bg-blue-500/60` → Design-System |
| 7. ScorePill in Lead-Liste nicht wiederverwendet | `ScorePill` Komponente | Shared Component nutzen |

### Empfohlene Änderungen
```diff
- className="... rounded-lg bg-white ..."
+ className="... bg-white ..."  // Kein rounded für Primary

- if (score >= 35) cls = "orange"
+ if (score >= 31) cls = "orange"  // Design-System Threshold
```

---

## 2. Leads (`/leads`)

### Was passt ✅
- FilterChips korrekt implementiert
- DataTable Struktur passt
- EmptyState vorhanden
- Pagination korrekt
- Avatar mit Initials funktioniert
- Action-Needed Dot implementiert

### Was nicht passt ❌

#### Kritisch
| Issue | Location | Design-System | Current |
|-------|----------|---------------|---------|
| **1. Primary Button hat Border Radius** | "Lead hinzufügen" | `rounded-none` | `rounded-lg` |
| **2. ScorePill falscher Orange-Threshold** | Tabelle Score | `31-50 = Orange` | `>= 35 = Orange` |

#### Warnings
| Issue | Location | Empfohlen |
|-------|----------|-----------|
| 3. Filter-Button Primary Stil | "Filtern" Button | Secondary Stil (border) |
| 4. Score Column zu breit | Score Spalte (110px) | 80px ausreichend |
| 5. Status Badge nicht zentriert | Status Spalte | `flex justify-center` |
| 6. Opportunity Score zu klein | Zap Icon + Score | Größer oder entfernen |
| 7. Table Header Text zu hell | `text-zinc-600` | `text-zinc-500` |

---

## 3. Lead-Detail (`/leads/[id]`) – Priorität 1

### Was passt ✅
- Hero-Struktur grundsätzlich korrekt
- ScoreBlock ist korrekt implementiert
- InfoRow Pattern wird genutzt
- Action Buttons haben korrekte States
- Pipeline-Verlauf sichtbar

### Was nicht passt ❌

#### Kritisch
| Issue | Location | Design-System | Current |
|-------|----------|---------------|---------|
| **1. Hero Score Block Abweichung** | Score-Anzeige | Abgerundete Ecken | `rounded-xl` statt scharf |
| **2. Action Buttons inkonsistent** | 4 Action Buttons | Einheitliches Pattern | Mix von Formen |
| **3. Teil-Scores Grid falsch** | 9 Dimensionen | 3x3 Grid | 3-spaltig aber kompakt |
| **4. Stärken/Schwächen Cards** | Split Cards | DataCard Variante | Custom Styling |
| **5. Quick Wins Numbering** | 1, 2, 3... | Design-System Pattern | Custom Amber Box |
| **6. Demo/Outreach Cards** | Preview Cards | ActionCard Pattern | Custom Implementation |
| **7. Pipeline-Verlauf Timeline** | Status-History | Timeline Komponente | Einfache Liste |
| **8. Score Grades falsch** | "Gut/Mittel/Schwach/Kritisch" | Design-System Labels | Eigene Labels |

#### Warnings
| Issue | Location | Empfohlen |
|-------|----------|-----------|
| 9. Kontakt-Icons zu klein | Phone, Mail | 16px statt 14px |
| 10. Screenshot Border fehlt | Original-Website | `border border-zinc-800` |
| 11. "Qualifiziert" Badge doppelt | Hero + Scorecard | Einmal anzeigen |
| 12. "Freigeben" Button Farbe | Outreach Section | `bg-emerald-600` → Design-System |
| 13. Back Link Größe | "Zurück zu Leads" | 14px statt 14px (OK) |
| 14. Action Button Hints | Tooltips | Konsistente Position |

### Score Grade Mapping (korrekt laut Design-System)
```
Design-System          Current (falsch)
─────────────────────────────────────────
86-100: Excellent      70+: Gut
71-85:  Good           50+: Mittel
51-70:  Average        30+: Schwach
31-50:  Poor           <30: Kritisch
0-30:   Critical
```

---

## 4. Outreach (`/outreach`)

### Was passt ✅
- PageHeader korrekt
- MiniKPIs vorhanden
- Workflow-Stepper implementiert
- Guardrails-Status sichtbar
- Section-Cards für Status-Gruppen
- EmptyState ausführlich

### Was nicht passt ❌

#### Kritisch
| Issue | Location | Design-System | Current |
|-------|----------|---------------|---------|
| **1. MiniKPI nicht aus Component Library** | 4 KPI Cards | MetricCard Variante | Custom MiniKpi |
| **2. "Senden" Button in Tabelle** | Approved Section | SecondaryButton | Custom Styling |

#### Warnings
| Issue | Location | Empfohlen |
|-------|----------|-----------|
| 3. Workflow Stepper überbreit | Freigabeprozess | Mobile-optimiert |
| 4. Section Headers inkonsistent | 4 Status-Sections | Einheitliches Pattern |
| 5. Red Flag Badge zu klein | Blocked Status | Sichtbarer machen |

---

## 5. Templates (`/templates`)

### Was passt ✅
- Grid-Layout korrekt (2x2)
- Template-Cards konsistent
- Counter in Cards vorhanden
- EmptyStates für jede Section
- Info-Banner korrekt platziert

### Warnings
| Issue | Location | Empfohlen |
|-------|----------|-----------|
| 1. "Neues Template" Button disabled | Header | Entfernen oder aktivieren |
| 2. System-Prompts Monospace | Dateinamen | Konsistente Schriftgröße |

---

## 6. Settings (`/settings`)

### Was passt ✅
- Section-Cards konsistent
- DataTables korrekt
- Status-Badges (Worker Online)
- Grid-Layout für System-Params
- Expandable-Cards für Suchgebiete

### Warnings
| Issue | Location | Empfohlen |
|-------|----------|-----------|
| 1. Queue-Tabelle nicht sortierbar | Queue Stats | Sortierbar machen |
| 2. Suchgebiete Grid ungleichmäßig | Branchen/Städte | Einheitliche Höhe |

---

## Priorisierte Fix-Liste

### P0 (Sofort – Blocker für Consistency)
1. **Lead-Detail**: Score Grades an Design-System anpassen
2. **Alle Seiten**: Primary Button `rounded-none` (nicht `rounded-lg`)
3. **Dashboard + Leads**: ScorePill Orange-Threshold auf 31 senken

### P1 (High – Wichtig für UX)
4. **Lead-Detail**: Teil-Scores Grid auf Design-System Pattern ändern
5. **Lead-Detail**: Stärken/Schwächen Cards vereinheitlichen
6. **Lead-Detail**: Quick Wins Numbering Style anpassen
7. **Outreach**: MiniKPIs auf MetricCard umstellen
8. **Leads**: Filter-Button auf Secondary Stil ändern

### P2 (Medium – Nice to have)
9. **Dashboard**: Pipeline Farben auf Score-System umstellen
10. **Lead-Detail**: Timeline Komponente einführen
11. **Alle Seiten**: Farben konsolidieren (keine Hardcoded Colors)

### P3 (Low – Polishing)
12. Icon-Größen vereinheitlichen
13. Spacing-Varianten reduzieren
14. Typography-Hierarchie durchgängig anwenden

---

## Komponenten-Extraktion

Folgende Komponenten müssen extrahiert werden:

| Komponente | Nutzung | Priorität |
|------------|---------|-----------|
| `ScorePill` | Dashboard, Leads, Lead-Detail | P0 |
| `ScoreBlock` | Lead-Detail | P0 |
| `StatusBadge` | Alle Seiten | P0 |
| `MetricCard` | Dashboard, Outreach | P1 |
| `ActionButton` | Lead-Detail | P1 |
| `FilterChip` | Leads | P1 |
| `DataTable` | Leads, Outreach, Settings | P1 |
| `EmptyState` | Alle Seiten | P1 |
| `SectionHeader` | Alle Seiten | P2 |
| `InfoRow` | Lead-Detail, Settings | P2 |

---

*Dieses Audit ist Grundlage für den Refactoring-Plan. Jede Änderung muss gegen dieses Dokument validiert werden.*
