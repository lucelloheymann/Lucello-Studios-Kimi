# Writing Plans Skill

## Beschreibung

Nachdem ein Design akzeptiert wurde, erstellt dieser Skill einen detaillierten Implementierungsplan.

## Aktivierungsbedingungen

Aktiviert nach `/accept design` oder expliziter Freigabe des Designs durch den Nutzer.

## Output-Format

Der Plan MUSS folgendes Format haben:

```markdown
# Implementierungsplan: [Feature-Name]

## Übersicht
- Geschätzte Dauer: [X Stunden]
- Anzahl Tasks: [N]
- Risiko: [Niedrig/Mittel/Hoch]

## Tasks

### Task 1: [Name] (~X Min)
**Ziel:** [Was soll erreicht werden]

**Dateien:**
- `src/.../file.ts` - [Was passiert hier]

**Schritte:**
1. [Konkreter Schritt]
2. [Konkreter Schritt]

**Verifikation:**
- [ ] Kriterium 1
- [ ] Kriterium 2

---

### Task 2: [Name] (~X Min)
...
```

## Regeln für Tasks

1. **Klein genug:** Max 5 Minuten pro Task für einen Subagent
2. **Unabhängig:** Jeder Task sollte alleine ausführbar sein
3. **Verifizierbar:** Jedes Task hat klare Akzeptanzkriterien
4. **Vollständig:** Keine impliziten Annahmen, alle Details im Task

## Task-Kategorien

### Type: Create
Neue Datei erstellen
```
**Aktion:** CREATE
**Pfad:** `src/components/new-component.tsx`
**Inhalt:** [Kompletter Code]
```

### Type: Modify
Bestehende Datei ändern
```
**Aktion:** MODIFY
**Pfad:** `src/lib/utils.ts`
**Änderungen:**
- Zeile 10-15: Neue Funktion hinzufügen
- Zeile 42: Parameter ändern zu `options: Options`
```

### Type: Delete
Datei löschen
```
**Aktion:** DELETE
**Pfad:** `src/old/file.ts`
**Grund:** Wird ersetzt durch neue Implementierung
```

## Plan-Review

Nach Erstellung des Plans:

**Agent:** "Hier ist der Implementierungsplan mit X Tasks.

Zusammenfassung:
- Task 1-3: Setup & Datenmodell
- Task 4-6: UI Komponenten
- Task 7: Integration & Tests

Soll ich:
1. Alle Tasks auf einmal ausführen (empfohlen für kleine Features)
2. In Batches ausführen (empfohlen für große Features)
3. Task für Task mit deiner Freigabe

Bitte wähle mit `/plan 1`, `/plan 2` oder `/plan 3`"
