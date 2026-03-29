# Brainstorming Skill

## Beschreibung

Dieser Skill aktiviert sich AUTOMATISCH, wenn der Nutzer mit einem neuen Feature oder einer komplexen Änderung beginnt.

## Aktivierungsbedingungen

Der Skill MUSS aktiviert werden, wenn:
- Ein Feature-request mit unklaren Details vorliegt
- Der Nutzer sagt "Ich möchte...", "Können wir...", "Wie wäre es wenn..."
- Eine Architektur- oder Design-Entscheidung getroffen werden muss
- Der Scope einer Aufgabe unklar ist

## Ablauf

### 1. Kontext sammeln (MANDATORISCH)

Bevor ein einziger Code-Vorschlag gemacht wird, MUSS der Agent folgende Fragen stellen:

**Ziel & Nutzen:**
- Was genau soll erreicht werden?
- Warum ist das wichtig?
- Wer nutzt das Feature?

**Scope & Grenzen:**
- Was ist IN Scope?
- Was ist EXPLIZIT NICHT in Scope?

**Prioritäten:**
- Was ist das Minimum Viable Product (MVP)?
- Was wäre "nice to have"?

**Kontext aus dem Projekt:**
- Gibt es ähnliche Features, an denen wir uns orientieren können?
- Gibt es technische Einschränkungen?

### 2. Design-Dokument erstellen

Nach dem Sammeln der Antworten, erstelle ein Design-Dokument mit folgenden Abschnitten:

```markdown
# Design: [Feature-Name]

## Ziel
[Kurze Beschreibung]

## Nutzer-Story
Als [Rolle] möchte ich [Ziel], damit [Nutzen]

## Akzeptanzkriterien
- [ ] Kriterium 1
- [ ] Kriterium 2

## Technische Spezifikation
### Datenmodell
### API/Interfaces
### UI/UX (falls relevant)

## Out of Scope
- Nicht enthaltene Features

## Offene Fragen
[Noch ungeklärte Punkte]
```

### 3. Review & Freigabe

Präsentiere das Design-Dokument dem Nutzer ABSCHNITTSWEISE (nicht alles auf einmal).

Warte auf explizite Bestätigung (`/accept design` oder "Ja, passt") bevor du mit der Implementierung beginnst.

## Verboten

❌ SOFORT mit Code beginnen
❌ Annahmen machen ohne Nachfrage
❌ "Ich denke, das ist gemeint..."
❌ Design überspringen bei "kleinen" Änderungen

## Beispiel-Dialog

**Nutzer:** "Ich möchte ein Export-Feature für Leads."

**Agent:** "Bevor wir mit der Implementierung beginnen, möchte ich das Design mit dir klären.

1. Was genau soll exportiert werden? (Alle Leads, gefilterte Listen, einzelne Leads?)
2. In welchem Format? (CSV, Excel, PDF, JSON?)
3. Wer hat Zugriff auf den Export? (Alle Nutzer, nur Admins?)
4. Gibt es sensible Daten, die besonders behandelt werden müssen?"

[NACH ANTWORTEN]

**Agent:** "Hier ist das Design-Dokument:

## Ziel
Export von gefilterten Lead-Listen als CSV für externe Analyse.

## Akzeptanzkriterien
- [ ] Export-Button in der Lead-Liste
- [ ] CSV-Format mit allen sichtbaren Spalten
- [ ] Nur für authentifizierte Nutzer
- [ ] Max 10.000 Leads pro Export

## Out of Scope
- Excel-Format
- Automatische E-Mail-Versand
- Geplante/Automatische Exports

Stimmt das so? Bitte bestätige mit `/accept design` oder markiere Änderungen."
