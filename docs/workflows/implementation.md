# Workflow: Implementation

**Wann:** Nach Planning-Freigabe  
**Ziel:** Code umsetzen gemäß Plan  
**Auslöser:** Nutzer sagt "Los geht's mit Batch X"

---

## Prinzipien

### TDD (Test-Driven Development)

**Für jeden Task:**

1. **RED** - Schreibe/Teste den Test first (oder prüfe ob Test existiert)
2. **GREEN** - Schreibe minimalen Code damit Test passed
3. **REFACTOR** - Optimiere, aber behalte Tests grün

**Ausnahme:** UI-Only Changes (z.B. CSS, Layout) → manuelle Verifikation statt Unit-Tests

### Batch-Struktur

```
┌─────────────────────────────────────┐
│  Batch Start                        │
│  - Todo-List aktualisieren          │
│  - "in_progress" markieren          │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Für jeden Task:                    │
│  1. Test schreiben/prüfen           │
│  2. Code implementieren             │
│  3. Verifikation (Tests passing)    │
│  4. Todo aktualisieren              │
└─────────────┬───────────────────────┘
              │
              ▼
┌─────────────────────────────────────┐
│  Batch Ende                         │
│  - Typecheck: npm run typecheck     │
│  - Lint: npm run lint               │
│  - Tests: npm run test:e2e (relevant)│
│  - Todo: "done" markieren           │
└─────────────────────────────────────┘
```

---

## Schritte für Kimi

### Vor dem ersten Batch

1. **Todo-Liste erstellen:**
   ```typescript
   // SetTodoList verwenden
   todos: [
     { title: "Batch 1: ...", status: "in_progress" },
     { title: "Batch 2: ...", status: "pending" },
     ...
   ]
   ```

2. **Plan einlesen:** `docs/plans/[feature]-plan.md`

### Pro Task

1. **Test first** (wenn sinnvoll):
   - E2E-Test in `e2e/` für User-Flows
   - Unit-Test nur für komplexe Logik

2. **Code schreiben:**
   - Minimale Änderungen
   - Typ-Safety (`npm run typecheck`)
   - Keine Business-Logik in UI

3. **Verifikation:**
   ```bash
   npm run typecheck
   npm run lint
   # Bei E2E-Änderungen:
   npx playwright test e2e/[relevant].spec.ts
   ```

4. **Todo aktualisieren:** Task auf "done"

### Nach jedem Batch

1. **Qualitäts-Check:**
   ```bash
   npm run typecheck
   npm run lint
   ```

2. **Nutzer-Update:**
   ```
   "Batch X fertig. Enthält:
   - [Was wurde gemacht]
   - [Status der Tests]
   
   Soll ich fortfahren mit Batch Y?"
   ```

3. **Freigabe abwarten** vor nächstem Batch

---

## Kommunikation

- **Bei Erfolg:** Kurze Zusammenfassung, was erreicht wurde
- **Bei Fehler:** Sofort stoppen, Problem erklären, Lösungsvorschläge
- **Bei Unklarheit:** Nicht raten, Nutzer fragen

---

## Output

- Code in `apps/website-rescue-agent/src/`
- Aktualisierte Todo-Liste
- Nach jedem Batch: Nutzer-Freigabe für nächsten Batch
