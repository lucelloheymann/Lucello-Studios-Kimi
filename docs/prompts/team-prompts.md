# Team Prompt-Bibliothek

> Wiederverwendbare Prompts für häufige Aufgaben im Projekt.
> Einfach kopieren, ggf. anpassen und in Kimi Code CLI einfügen.
> Neue Prompts bitte via PR ergänzen.

---

## Code-Review

```
Reviewe die folgenden Änderungen als erfahrener Entwickler:
- Prüfe auf Bugs und logische Fehler
- Prüfe auf Sicherheitslücken (OWASP Top 10)
- Prüfe auf Performance-Probleme
- Prüfe ob Tests die Logik abdecken
- Prüfe ob Naming klar und konsistent ist

Gib konkrete, umsetzbare Verbesserungsvorschläge.
Beginne mit den kritischsten Problemen.

[Code hier einfügen]
```

---

## Feature implementieren

```
Implementiere folgendes Feature in diesem Projekt:

Feature: [Beschreibung]
Akzeptanzkriterien:
- [Kriterium 1]
- [Kriterium 2]

Vorgehensweise:
1. Lies zuerst die relevanten bestehenden Dateien
2. Plane die Änderungen, bevor du sie umsetzt
3. Implementiere mit minimalem Footprint
4. Füge Tests hinzu
5. Erkläre kurz was du geändert hast und warum
```

---

## Bug debuggen

```
Analysiere diesen Bug und schlage eine Lösung vor:

Symptom: [Was passiert]
Erwartet: [Was sollte passieren]
Umgebung: [Local / Staging / Production, Browser, OS]
Reproduzierbar mit: [Schritte]

Fehler-Output / Stack Trace:
[Stack Trace hier]

Relevanter Code:
[Code hier, falls bekannt]

Bitte:
1. Identifiziere die Ursache
2. Erkläre warum dieser Fehler auftritt
3. Schlage eine Lösung vor
4. Überlege ob es weitere Stellen gibt, die denselben Bug haben könnten
```

---

## Refactoring

```
Refactore den folgenden Code. Ziele:
- Lesbarkeit verbessern
- Duplikate entfernen
- [Spezifisches Ziel, z. B. "Performance verbessern"]

Constraints:
- Externes Verhalten darf sich nicht ändern
- Bestehende Tests müssen weiterhin grün sein
- Kein Over-Engineering, keine neuen Abstraktionen ohne klaren Nutzen

[Code hier]
```

---

## Tests schreiben

```
Schreibe Tests für den folgenden Code.

Test-Framework: [z. B. Vitest, Jest, pytest]
Testtyp: [Unit / Integration / E2E]

Anforderungen:
- Happy Path abdecken
- Edge Cases und Fehlerfälle abdecken
- Tests sollen die Absicht des Codes dokumentieren
- Keine Implementierungs-Details testen, sondern Verhalten

[Code hier]
```

---

## ADR erstellen

```
Erstelle ein Architecture Decision Record (ADR) für folgende Entscheidung.
Nutze die Vorlage aus docs/decisions/0000-adr-template.md.

Entscheidung: [Was wurde entschieden]
Kontext: [Warum war eine Entscheidung nötig]
Alternativen, die wir betrachtet haben: [Liste]
Gewählte Option: [Welche und warum]

Nummeriere das ADR als nächste verfügbare Nummer in docs/decisions/.
```

---

## Dokumentation schreiben

```
Schreibe eine Dokumentation für [Komponente / Funktion / API-Endpoint].

Zielgruppe: [Entwickler im Team / neue Entwickler / externe Nutzer]
Format: Markdown

Decke ab:
- Zweck und Verantwortlichkeit
- Parameter / Props / API-Signatur
- Beispiel-Usage
- Wichtige Hinweise / Fallstricke
- Verwandte Komponenten / Endpoints

[Relevanter Code]
```

---

## PR-Beschreibung generieren

```
Generiere eine PR-Beschreibung für die folgenden Änderungen.

Format:
## Was wurde geändert?
[1-3 Bullet Points]

## Warum?
[Kontext und Motivation]

## Wie testen?
[Schritte zum Testen der Änderung]

## Checkliste
- [ ] Tests hinzugefügt / aktualisiert
- [ ] Dokumentation aktualisiert (falls nötig)
- [ ] Breaking Changes: Ja / Nein

Git-Diff:
[git diff hier einfügen]
```

---

## Performance-Analyse

```
Analysiere den folgenden Code auf Performance-Probleme:

- Suche nach N+1-Queries
- Suche nach unnötigen Re-Renders (falls React)
- Suche nach blockierenden Operationen
- Suche nach Memory-Leaks
- Schlage konkrete Optimierungen vor mit erwarteter Wirkung

[Code hier]
```

---

## Security-Review

```
Führe einen Security-Review durch für den folgenden Code.
Fokus auf OWASP Top 10:

1. Injection (SQL, Command, etc.)
2. Broken Authentication
3. Sensitive Data Exposure
4. Security Misconfiguration
5. XSS
6. Insecure Deserialization
7. Missing Input Validation

Für jeden gefundenen Issue:
- Severity: Critical / High / Medium / Low
- Beschreibung des Problems
- Konkreter Fix

[Code hier]
```
