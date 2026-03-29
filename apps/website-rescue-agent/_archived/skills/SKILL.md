# Superpowers für Website Rescue Agent

## Überblick

Dieses Verzeichnis enthält professionelle Entwicklungs-Skills für den Website Rescue Agent.

## Verfügbare Skills

| Skill | Verwendung |
|-------|------------|
| [brainstorming](./brainstorming/SKILL.md) | Vor jedem Feature: Design klären |
| [writing-plans](./writing-plans/SKILL.md) | Nach Design-Freigabe: Implementierungsplan |
| [test-driven-development](./test-driven-development/SKILL.md) | Während Implementierung: RED-GREEN-REFACTOR |
| [subagent-driven-development](./subagent-driven-development/SKILL.md) | Für große Features: Parallele Entwicklung |
| [requesting-code-review](./requesting-code-review/SKILL.md) | Vor jedem Commit: Code Review |
| [using-git-worktrees](./using-git-worktrees/SKILL.md) | Für Features: Isolierte Branches |
| [finishing-a-development-branch](./finishing-a-development-branch/SKILL.md) | Nach Fertigstellung: Merge & Cleanup |

## Workflow-Übersicht

```
┌─────────────────┐
│  Brainstorming  │ ◄── Nutzer sagt "Ich möchte..."
│  (Design klären)│
└────────┬────────┘
         │ /accept design
         ▼
┌─────────────────┐
│  Writing Plans  │ ◄── Implementierungsplan erstellen
│  (Tasks planen) │
└────────┬────────┘
         │ /plan 1/2/3
         ▼
┌─────────────────┐     ┌──────────────────┐
│      TDD        │◄────┤ Subagent-Driven  │ (alternativ)
│  RED-GREEN-REF  │     │  (Parallel Dev)  │
└────────┬────────┘     └──────────────────┘
         │
         ▼
┌─────────────────┐
│  Code Review    │ ◄── Vor jedem Commit
│  (Qualität)     │
└────────┬────────┘
         │ approve
         ▼
┌─────────────────┐
│    Git Merge    │ ◄── Merge & Cleanup
│   (Abschluss)   │
└─────────────────┘
```

## Aktivierung

Skills aktivieren sich automatisch basierend auf dem Kontext:

- **Brainstorming** → Bei Feature-Requests
- **Writing Plans** → Nach `/accept design`
- **TDD** → Beim Schreiben von Code
- **Code Review** → Vor Commits
- **Finishing** → Nach Feature-Fertigstellung

## Erweiterung

Neue Skills können hinzugefügt werden:

1. Neues Verzeichnis unter `skills/[skill-name]/`
2. `SKILL.md` mit Anweisungen erstellen
3. In dieser Datei verlinken

## Dokumentation

- Original: https://github.com/obra/superpowers
- Lizenz: MIT
