# Workflow: Planning

**Wann:** Nach Brainstorming-Freigabe  
**Ziel:** Detaillierter Implementierungsplan mit Tasks  
**Auslöser:** Nutzer sagt "Design ist gut, planen wir es"

---

## Schritte für Kimi

### 1. Batches definieren (10 Min)

Teile das Feature in logische Batches:

```
Batch 1: Datenmodell + Backend API
Batch 2: Frontend Components  
Batch 3: Integration & Tests
Batch 4: Review & Polish
```

**Regel:** Max. 4 Batches, jeder Batch sollte < 2h sein

### 2. Pro Batch Tasks erstellen (15 Min)

Für jeden Batch, erstelle konkrete Tasks:

```markdown
## Implementierungsplan: [Feature-Name]

### Batch 1: [Name] (~X Min)

**Ziel:** [Was wird erreicht]

**Tasks:**

#### Task 1.1: [Name] (~X Min)
**Dateien:**
- `src/.../file.ts` - [Was passiert]

**Schritte:**
1. [Konkreter Schritt]
2. [Konkreter Schritt]

**Verifikation:**
- [ ] Kriterium erfüllt
- [ ] Tests passing

---

#### Task 1.2: [Name] (~X Min)
...

### Batch 2: [Name] (~X Min)
...
```

### 3. Datei speichern

Speichere als: `docs/plans/[feature]-plan.md`

### 4. Freigabe einholen

Frage den Nutzer:
```
Implementierungsplan ist ready mit X Batches.

Soll ich starten mit:
1. Batch 1 umsetzen
2. Plan anpassen
3. Abbruch
```

---

## Regeln für Tasks

- **Klein:** Max 30 Min pro Task
- **Unabhängig:** Jeder Task sollte allein funktionieren
- **Verifizierbar:** Klare Akzeptanzkriterien
- **Vollständig:** Keine impliziten Annahmen

## Regeln für Batches

- **Isolation:** Batch N sollte ohne Batch N+1 funktionieren
- **Testbar:** Jeder Batch hat klare Testkriterien
- **Commit-fähig:** Nach jedem Batch könnte man commiten

---

## Output

- Datei: `docs/plans/[feature]-plan.md`
- Freigabe: Nutzer bestätigt Plan
- Nächster Schritt: Implementation
