# Kimi Workflows

**Für:** Website Rescue Agent  
**Nutzer:** Kimi Code CLI + menschliches Team  
**Ziel:** Reproduzierbarer Entwicklungsprozess

---

## Warum diese Workflows?

Die ursprünglichen "Superpowers" waren für Claude Code konzipiert (mit Slash-Commands wie `/accept design`). Kimi hat diese Automatismen nicht.

**Diese Workflows sind:**
- Manuell ausgelöst (keine Magie)
- Klare Schritte (Checklisten)
- Ehrlich dokumentiert (keine "automatische Aktivierung")

---

## Die 5 Phasen

| Phase | Wann | Output |
|-------|------|--------|
| [1. Brainstorming](./brainstorming.md) | Feature-Request | Design-Entscheidungen |
| [2. Planning](./planning.md) | Nach Design-Freigabe | `docs/plans/[feature]-plan.md` |
| [3. Implementation](./implementation.md) | Nach Plan-Freigabe | Code in Batches |
| [4. Review](./review.md) | Nach Code-Fertig | Qualitätsprüfung |
| [5. Finish](./finish.md) | Nach Review-OK | Commit & Push |

---

## Wie Kimi diese nutzt

**Nicht:** Automatische Aktivierung
**Sondern:** Explizite Anweisung durch Nutzer

Beispiel:
```
Nutzer: "Ich möchte ein neues Feature..."
Kimi:   [liest docs/workflows/brainstorming.md]
        "Lass uns zuerst das Design klären..."
        [führt Brainstorming durch]
        
Nutzer: "Design ist gut"
Kimi:   [liest docs/workflows/planning.md]
        "Ich erstelle einen Implementierungsplan..."
```

---

## Was Kimi automatisch macht

- **Todo-Listen:** SetTodoList für Tracking
- **Qualitäts-Checks:** `npm run typecheck`, `npm run lint`
- **Tests:** `npm run test:e2e` wenn relevant
- **Verifikation:** Dateien prüfen vor Abschluss

Was Kimi **nicht** automatisch macht:
- Nicht entscheiden ob Design gut ist (Nutzer-Entscheidung)
- Nicht ohne Freigabe committen (explizites "go")
- Nicht raten bei Unklarheiten (nachfragen)

---

## Erweiterung

Neue Workflows hinzufügen:

1. Datei erstellen: `docs/workflows/[name].md`
2. In dieser README verlinken
3. In AGENTS.md erwähnen falls relevant

---

## Unterschied zu "Superpowers"

| | Superpowers (Claude) | Kimi Workflows |
|---------------------|----------------------|
| Aktivierung | Automatisch via Slash-Commands | Manuell via Prompt |
| Dateien | In `skills/` Ordner | In `workflows/` Ordner |
| Integration | Tief (Claude liest automatisch) | Explizit (Kimi liest auf Anfrage) |
| Realität | Funktioniert nur mit Claude | Funktioniert mit Kimi |

**Ehrliche Aussage:** Die alten Superpowers-Skills existieren noch in `apps/website-rescue-agent/skills/`, aber Kimi kann sie nicht automatisch nutzen. Diese Workflows hier sind der Ersatz.
