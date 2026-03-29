# Workflow: Brainstorming

**Wann:** Bei jedem neuen Feature-Request oder größeren Change  
**Ziel:** Design & Scope klar definieren, bevor Code geschrieben wird  
**Auslöser:** Nutzer sagt "Ich möchte..." oder beschreibt ein Problem

---

## Schritte für Kimi

### 1. Anforderungen klären (5 Min)

Stelle dem Nutzer diese Fragen:

```
- Was genau soll das Feature tun?
- Wer ist der Nutzer (Admin, Endkunde, intern)?
- Was ist das gewünschte Ergebnis?
- Was ist explizit NICHT im Scope?
- Gibt es Zeitdruck oder Deadline?
```

### 2. Bestehende Lösungen prüfen (5 Min)

- Suche im Code nach ähnlichen Features (`Grep`)
- Prüfe `prisma/schema.prisma` ob Datenstruktur passt
- Prüfe API-Routes ob ähnliche Endpunkte existieren

### 3. Design-Vorschlag erstellen (10 Min)

Erstelle eine Zusammenfassung in diesem Format:

```markdown
## Design-Vorschlag: [Feature-Name]

### Scope
- **In Scope:** [Konkrete Features]
- **Out of Scope:** [Was wir bewusst nicht machen]

### Technischer Ansatz
- **Neue Dateien:** [Liste]
- **Geänderte Dateien:** [Liste]
- **Datenbank:** Schema-Änderung nötig? ja/nein

### Geschätzter Aufwand
- **Komplexität:** [Niedrig/Mittel/Hoch]
- **Geschätzte Zeit:** [X Stunden]
- **Risiken:** [Falls vorhanden]

### Offene Fragen
- [Falls noch unklar]
```

### 4. Freigabe einholen

Frage den Nutzer:
```
Design-Vorschlag ist ready. Soll ich:
1. Planung starten (Implementierungsplan erstellen)
2. Design anpassen (was ändern?)
3. Abbrechen
```

---

## Output

- Entweder: `docs/plans/[feature]-design.md` (bei komplexen Features)
- Oder: Direkter Übergang zu Planning (bei einfachen Features)

---

## Regeln

- **Kein Code** in dieser Phase
- **Keine Dateien erstellen** außer der Design-Doku
- **Explizite Freigabe** einholen bevor weitergegangen wird
- Wenn Nutzer "einfach machen" sagt → trotzdem kurzes Design absprechen
