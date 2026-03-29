# Subagent-Driven Development Skill

## Beschreibung

Für größere Features (> 5 Tasks) werden frische Subagents pro Task eingesetzt mit zweistufigem Review.

## Wann einsetzen?

- Feature hat mehr als 5 Tasks
- Geschätzte Dauer > 1 Stunde
- Parallele Entwicklung möglich

## Workflow

### 1. Task vorbereiten

Für jeden Task erstelle eine Task-Datei:

```markdown
# Task: [Name]

## Kontext
[Design-Dokument Referenz]
[Abhängigkeiten von vorherigen Tasks]

## Ziel
[Konkretes Ziel dieses Tasks]

## Spezifikation
```
[Code-Spec oder Interface-Definition]
```

## Akzeptanzkriterien
- [ ] Kriterium 1
- [ ] Kriterium 2

## Verifikation
```bash
# Wie wird geprüft, ob der Task erfolgreich war?
npm run test:specific
```
```

### 2. Subagent dispatch

Starte einen frischen Subagent mit:
- Keinem vorherigen Kontext
- Nur dem aktuellen Task-Dokument
- Verweis auf relevante Projekt-Dateien

**Prompt für Subagent:**
```
Du bist ein frischer Subagent ohne vorherigen Kontext.

AUFGABE:
Implementiere exakt diese Spezifikation:
[Task-Spezifikation]

REGELN:
1. Halte dich STRICT an die Spezifikation
2. Keine "Verbesserungen" oder "Optimierungen" hinzufügen
3. Keine Annahmen treffen - bei Unklarheiten fragen
4. TDD: Test zuerst, dann Implementation
5. Nach Fertigstellung: Zeige Verifikations-Ergebnisse

ERLAUBTE TOOLS:
- ReadFile, WriteFile, StrReplaceFile
- Shell (für Tests)

VERBOTEN:
- Git-Operationen
- Änderungen außerhalb des Task-Scopes
- Architektur-Änderungen
```

### 3. Zwei-Stufen Review

#### Review 1: Spec Compliance
Prüfe vom Subagent gelieferten Code:

**Checkliste:**
- [ ] Implementiert der Code exakt die Spezifikation?
- [ ] Gibt es "Feature Creep" (nicht geforderte Features)?
- [ ] Sind alle Akzeptanzkriterien erfüllt?
- [ ] Gibt es Seiteneffekte auf andere Teile?

**Bei Ablehnung:**
- Zurück an Subagent mit konkreten Korrekturen
- Nicht selbst fixen!

#### Review 2: Code Quality
Prüfe Code-Qualität:

**Checkliste:**
- [ ] TDD Zyklus eingehalten?
- [ ] Klare Namen und Struktur?
- [ ] Keine Duplikation?
- [ ] Error Handling vorhanden?
- [ ] TypeScript Typen korrekt?

### 4. Integration

Nach erfolgreichem Review:
- Code in Haupt-Branch integrieren
- Tests laufen lassen
- Nächsten Task starten

## Parallelisierung

Unabhängige Tasks können parallel bearbeitet werden:

```
Task 1 ──┐
Task 2 ──┼──► Review ──► Integration
Task 3 ──┘
```

**ACHTUNG:** Bei Merge-Konflikten:
1. Ursprüngliche Specs prüfen
2. Manuelle Integration durch Haupt-Agent
3. Beide Subagents informieren

## Fehlerbehandlung

Wenn Subagent scheitert:
1. Fehler analysieren
2. Spezifikation klarer formulieren
3. Neuen Subagent starten
4. ODER: Auf manuelle Implementierung umschalten

## Metriken

Pro Task tracken:
- Zeitaufwand
- Anzahl Review-Zyklen
- Anzahl Bugs nach Integration
