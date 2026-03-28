# Lucello Studio — Kimi Code CLI Team Repo

Dieses Repository dient als gemeinsames Arbeitsgerüst für das Team. Es enthält das geteilte Kontext-Memory für Kimi Code CLI, Architekturentscheidungen, Runbooks und wiederverwendbare Prompts.

> **Hinweis**: Dieses Repository wurde von Claude Code zu Kimi Code CLI migriert.

## Zweck

- **Geteiltes Memory**: Alle Teammitglieder arbeiten mit demselben Kimi-Kontext.
- **Dokumentation**: ADRs, Runbooks und Prompt-Bibliothek an einem Ort.

---

## Schnellstart

```bash
git clone <repo-url>
cd lucello-studios-kimi
```

Kimi Code CLI liest `AGENTS.md` automatisch beim Start.

**Lokale Überschreibungen** (nicht committen):
```
.kimi/settings.local.json   ← persönliche Einstellungen, Pfade, Secrets
```

---

## Team-Workflow

### Neues Teammitglied einrichten

1. Repo klonen.
2. `AGENTS.md` lesen — das ist der gemeinsame Kontext.
3. Bei Fragen: `docs/runbooks/development-workflow.md`.

### Änderungen am geteilten Kontext

- **`AGENTS.md`** ändern → PR erstellen → Team-Review → merge.
- **ADRs** (`docs/decisions/`) für alle architektonischen Entscheidungen anlegen.
- **Neue Prompts** in `docs/prompts/team-prompts.md` ergänzen.

### Was committen, was nicht?

| Datei / Ordner | Committen? |
|---|---|
| `AGENTS.md` | Ja |
| `.kimi/settings.local.json` | **Nein** |
| `.env` | **Nein** |

---

## Verzeichnisstruktur

```
/
  README.md                         ← diese Datei
  AGENTS.md                         ← gemeinsames Team-Memory für Kimi
  .gitignore
  docs/
    architecture/
      README.md                     ← Architektur-Übersicht
    decisions/
      0000-adr-template.md          ← ADR-Vorlage
    runbooks/
      development-workflow.md       ← Dev-Workflow
    prompts/
      team-prompts.md               ← wiederverwendbare Prompts
  apps/
    website-rescue-agent/           ← Haupt-Anwendung
```

---

## Unterschiede zu Claude Code

| Feature | Claude Code | Kimi Code CLI |
|---------|-------------|---------------|
| Config-Datei | `.claude/settings.json` | Nicht erforderlich |
| Memory-Datei | `CLAUDE.md` | `AGENTS.md` |
| Shell | Bash/Zsh | PowerShell |
| Background Tasks | Eingebaut | Via `Shell(run_in_background=true)` |

---

## Beitragen

Pull Requests für Änderungen an geteiltem Kontext, ADRs und Runbooks sind willkommen.
Bitte kurze PR-Beschreibung: Was wurde geändert und warum?
