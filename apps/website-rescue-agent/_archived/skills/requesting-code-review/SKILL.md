# Requesting Code Review Skill

## Beschreibung

Automatisches Code-Review vor jedem Commit/Merge.

## Review-Checkliste

### Kritisch (Muss behoben werden)

- [ ] **Spec Compliance** - Implementiert der Code exakt das Design?
- [ ] **Security** - Keine Injection-Risiken, Secrets nicht exponiert
- [ ] **Error Handling** - Alle Fehlerfälle werden abgefangen
- [ ] **Data Integrity** - Datenbank-Transaktionen korrekt
- [ ] **Type Safety** - Keine `any`-Types, alle Interfaces definiert

### Wichtig (Sollte behoben werden)

- [ ] **TDD** - Tests vorhanden und grün?
- [ ] **Naming** - Klare, beschreibende Namen?
- [ ] **DRY** - Keine unnötige Duplikation
- [ ] **Error Messages** - Verständliche Fehlermeldungen?
- [ ] **Edge Cases** - Leere Inputs, große Datenmengen?

### Optional (Kann verbessert werden)

- [ ] **Performance** - Können Queries optimiert werden?
- [ ] **Documentation** - Komplexe Logik dokumentiert?
- [ ] **Refactoring** - Gibt es Cleanup-Potenzial?

## Review-Prozess

### 1. Selbst-Review

Vor dem Commit:
```bash
# 1. Tests laufen lassen
npm run test

# 2. TypeScript prüfen
npm run typecheck

# 3. Linting
npm run lint

# 4. Eigene Änderungen reviewen
git diff --cached
```

### 2. Automated Checks

Alle Checks MÜSSEN grün sein:
- ✅ Tests passen
- ✅ Typecheck sauber
- ✅ Build erfolgreich
- ✅ Keine Lint-Fehler

### 3. Manuelles Review

Fragen für manuelles Review:

**Verständlichkeit:**
- Kann ein neuer Entwickler den Code verstehen?
- Sind die Intentions klar?

**Wartbarkeit:**
- Wie einfach ist es, diesen Code zu ändern?
- Gibt es versteckte Abhängigkeiten?

**Testbarkeit:**
- Sind alle Pfade getestet?
- Mocks notwendig - sind sie realistisch?

## Review-Ergebnis

**Wenn OK:**
```
✅ Code Review bestanden
- Alle kritischen Checks OK
- [N] Warnungen (optional zu beheben)
Bereit für Commit/Merge
```

**Wenn NICHT OK:**
```
❌ Code Review fehlgeschlagen

Kritisch:
- [Error 1] - [Beschreibung] - [Fix-Vorschlag]
- [Error 2] - [Beschreibung] - [Fix-Vorschlag]

Bitte beheben und erneut reviewen.
```

## Severitäts-Level

| Level | Bedeutung | Aktion |
|-------|-----------|--------|
| 🔴 **Critical** | Sicherheit/Data Loss | Blockiert Merge |
| 🟠 **High** | Fehler/Regression wahrscheinlich | Blockiert Merge |
| 🟡 **Medium** | Code-Qualität, Wartbarkeit | Sollte behoben werden |
| 🟢 **Low** | Stil, Optional | Kann ignoriert werden |

## Beispiel-Review

**Code:**
```typescript
async function getLeads(userId: string) {
  const leads = await db.query(`SELECT * FROM leads WHERE user_id = ${userId}`);
  return leads;
}
```

**Review:**
```
❌ CRITICAL: SQL Injection Vulnerability
   Zeile 2: Unescaped userId in SQL Query
   Fix: Verwende parametrierte Queries
   
   ❌ const leads = await db.query(`SELECT * FROM leads WHERE user_id = ${userId}`);
   ✅ const leads = await db.query('SELECT * FROM leads WHERE user_id = ?', [userId]);

🟠 HIGH: Kein Error Handling
   Datenbank-Fehler werden nicht abgefangen
   Fix: try/catch Block hinzufügen

🟡 MEDIUM: Keine Typisierung
   Rückgabewert ist any
   Fix: Return-Type definieren
```
