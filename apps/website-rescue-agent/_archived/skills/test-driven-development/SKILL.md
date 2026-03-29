# Test-Driven Development Skill

## Beschreibung

Dieser Skill erzwingt den RED-GREEN-REFACTOR Zyklus für alle Code-Änderungen.

## Ablauf

### 1. RED - Test schreiben

BEVOR Produktivcode geschrieben wird:

1. Schreibe einen FAILING Test
2. Zeige, dass der Test fehlschlägt
3. Commit: `test: add test for [feature]`

### 2. GREEN - Minimaler Code

Schreibe den MINIMALEN Code, um den Test zum Passen zu bringen:

1. Einfachste Implementierung
2. Hardcoding ist erlaubt (wird im Refactor entfernt)
3. Zeige, dass der Test besteht
4. Commit: `feat: make test pass for [feature]`

### 3. REFACTOR - Verbessern

Verbessere den Code OHNE das Verhalten zu ändern:

1. Duplikation entfernen
2. Namen verbessern
3. Struktur bereinigen
4. Alle Tests müssen weiterhin bestehen
5. Commit: `refactor: improve [feature] implementation`

## Verboten

❌ Code vor dem Test schreiben
❌ Mehrere Features gleichzeitig implementieren
❌ Refactoring während GREEN Phase
❌ Tests überspringen bei "einfachen" Änderungen

## Test-Struktur

```typescript
// 1. Arrange
const input = { /* ... */ };
const expected = { /* ... */ };

// 2. Act  
const result = functionUnderTest(input);

// 3. Assert
expect(result).toEqual(expected);
```

## Code-Coverage

- Mindestens 80% für neue Features
- 100% für kritische Business-Logik
- Edge Cases müssen abgedeckt sein

## Test-Arten

### Unit Tests
- Einzelne Funktionen/Komponenten
- Mock externe Dependencies
- Schnell (< 100ms pro Test)

### Integration Tests  
- Zusammenspiel mehrerer Komponenten
- Datenbank/Queue mit einbeziehen
- Realistischere Szenarien

### E2E Tests (Playwright)
- Kritische User Flows
- Happy Path + wichtige Error Cases
- Langsamer, aber realistisch

## Test-Datei Konventionen

```
src/
  lib/
    utils.ts
    utils.test.ts          # Unit Tests
    utils.integration.test.ts  # Integration Tests
  
e2e/
  dashboard.spec.ts        # E2E Tests
```

## Beispiel

**RED:**
```typescript
// utils.test.ts
import { calculateScore } from './utils';

test('calculateScore returns 0 for empty input', () => {
  expect(calculateScore([])).toBe(0);
});
// → FAILS (Function does not exist)
```

**GREEN:**
```typescript
// utils.ts
export function calculateScore(items: any[]): number {
  return 0; // Minimal implementation
}
// → PASSES
```

**REFACTOR:**
```typescript
// utils.ts
export function calculateScore(items: Scorable[]): number {
  if (items.length === 0) return 0;
  return items.reduce((sum, item) => sum + item.score, 0) / items.length;
}
// → PASSES (with more tests)
```
