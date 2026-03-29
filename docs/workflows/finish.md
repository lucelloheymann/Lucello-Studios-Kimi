# Workflow: Finish

**Wann:** Nach erfolgreichem Review  
**Ziel:** Commit, Push, Cleanup  
**Auslöser:** Nutzer sagt "Commit und push bitte"

---

## Schritte für Kimi

### 1. Letzte Prüfung (2 Min)

```bash
# Alles committed?
git status

# Tests nochmal laufen lassen (schnell)
npm run typecheck
```

### 2. Commit erstellen

**Commit-Message Format:**
```
<type>(<scope>): <subject>

<body>

Refs: <ticket/issue falls vorhanden>
```

**Types:**
- `feat:` - Neues Feature
- `fix:` - Bugfix
- `docs:` - Dokumentation
- `refactor:` - Code-Änderung ohne Feature-Change
- `test:` - Tests
- `chore:` - Build, Dependencies, etc.

**Beispiele:**
```
feat(conversation): add reply capture with sentiment

- Add ConversationReply model
- Add reply form in lead detail
- Add sentiment buttons (positive/neutral/negative/spam)

test(e2e): add conversation flow tests

- 27 new tests for conversation management
- Dashboard navigation tests
- Filter functionality tests
```

### 3. Push

```bash
git push origin <branch-name>
```

**Regel:** Nie direkt auf `main` pushen (außer explizit erlaubt)

### 4. Cleanup

- Todo-Liste leeren oder auf "done" setzen
- Temporäre Dateien aufräumen
- Plan-Dokument verschieben nach `docs/plans/completed/`

### 5. Zusammenfassung

Nutzer informieren:
```
✅ Feature abgeschlossen

Commit: [hash]
Branch: [branch-name]
Changes: [Zahl] files, [+/-] lines

Was wurde gemacht:
- [Punkt 1]
- [Punkt 2]

Nächste Schritte:
- [Falls PR nötig: Link erstellen]
- [Falls Deploy: Zeitpunkt klären]
```

---

## Post-Finish

Falls Feature deploy-relevant:

1. PR erstellen (wenn nicht direkt auf main)
2. Deployment planen
3. Monitoring nach Deploy

---

## Output

- Commit in Git
- Push zu Origin
- Aufgeräumtes Projekt
- Nutzer-Bestätigung
