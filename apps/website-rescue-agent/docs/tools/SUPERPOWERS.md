# Superpowers Integration

## Was ist Superpowers?

Superpowers ist ein professioneller Entwicklungs-Workflow für Coding Agents, entwickelt von Jesse Vincent (Prime Radiant). Es bietet ein composable Skill-System für:

- **Brainstorming** - Sokratische Design-Verfeinerung vor Code-Schreiben
- **Test-Driven Development** - RED-GREEN-REFACTOR Zyklus
- **Subagent-Driven Development** - Parallele Entwicklung mit Reviews
- **Systematic Debugging** - 4-Phasen Root-Cause-Analyse
- **Git Worktrees** - Isolierte Feature-Branches
- **Code Review** - Automatisierte Qualitätsprüfungen

## Installation

### Für Claude Code (dieses Projekt)

**Option A: Offizieller Marketplace (empfohlen)**

```bash
/plugin install superpowers@claude-plugins-official
```

**Option B: Community Marketplace**

```bash
/plugin marketplace add obra/superpowers-marketplace
/plugin install superpowers@superpowers-marketplace
```

### Für andere Team-Mitglieder

| Tool | Installation |
|------|--------------|
| **Claude Code** | `/plugin install superpowers@claude-plugins-official` |
| **Cursor** | `/add-plugin superpowers` oder Marketplace suchen |
| **Codex** | Siehe `.codex/INSTALL.md` im Repo |
| **OpenCode** | Siehe `.opencode/INSTALL.md` im Repo |
| **Gemini CLI** | `gemini extensions install https://github.com/obra/superpowers` |

## Workflow-Integration

### 1. Vor jedem größeren Feature

Superpowers aktiviert sich automatisch, wenn du mit einem Feature beginnst.

### 2. Design-Review

Nach dem Brainstorming wird ein Design-Dokument erstellt:
- Spezifikation wird in lesbare Abschnitte aufgeteilt
- Du musst das Design bestätigen
- Dann wird ein Implementierungsplan erstellt

### 3. Testing

**RED-GREEN-REFACTOR Zyklus:**
1. **RED** - Test schreiben, laufen lassen, scheitern sehen
2. **GREEN** - Minimaler Code um Test bestehen zu lassen
3. **REFACTOR** - Code verbessern, Tests müssen grün bleiben

## Support

- **Discord:** https://discord.gg/Jd8Vphy9jq
- **Issues:** https://github.com/obra/superpowers/issues

---

**Status:** Nicht installiert (erfordert manuelle Plugin-Installation in Claude Code)
