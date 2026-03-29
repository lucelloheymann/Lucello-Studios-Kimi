# Finishing a Development Branch Skill

## Beschreibung

Abschluss-Workflow für Feature-Branches: Verifikation, Merge-Entscheidung und Cleanup.

## Ablauf

### 1. Pre-Flight Checks (MANDATORISCH)

Vor dem Merge müssen ALLE Checks grün sein:

```bash
# 1. Code aktuell?
git fetch origin
git rebase origin/main

# 2. Tests
git checkout feature/[name]
npm run test
npm run test:e2e

# 3. Typecheck & Build
npm run typecheck
npm run build

# 4. Lint
npm run lint

# 5. Review Checkliste
# Siehe requesting-code-review SKILL.md
```

### 2. Merge-Strategie wählen

**Option A: Fast-Forward Merge (empfohlen für kleine Features)**
```bash
git checkout main
git merge feature/[name] --ff-only
```

**Option B: Merge Commit (für komplexe Features)**
```bash
git checkout main
git merge feature/[name] --no-ff -m "feat: [feature description]"
```

**Option C: Squash Merge (für viele kleine Commits)**
```bash
git checkout main
git merge --squash feature/[name]
git commit -m "feat: [feature description]"
```

### 3. Post-Merge Verifikation

```bash
# Auf main wechseln
git checkout main

# Pull latest
git pull origin main

# Tests laufen lassen
npm run test
npm run build

# Dev-Server starten und manuell prüfen
npm run dev
```

### 4. Cleanup

```bash
# Lokale Branch löschen
git branch -d feature/[name]

# Remote Branch löschen (falls gepusht)
git push origin --delete feature/[name]

# Worktree aufräumen (falls verwendet)
git worktree remove ../wra-[feature-name]
git worktree prune

# Dependencies bereinigen
npm prune
```

## Merge-Entscheidung

**Agent:** "Alle Checks sind grün. Wie möchtest du mergen?

1. **Fast-Forward** - Lineare History, gut für kleine Features
2. **Merge Commit** - Erhalt der Branch-History, gut für komplexe Features  
3. **Squash** - Alles in einen Commit, gut für viele kleine Commits

Empfehlung: Option [X] - [Begründung]

Bitte wähle mit `/merge 1`, `/merge 2` oder `/merge 3`"

## Post-Merge Checkliste

- [ ] Main Branch aktualisiert (`git pull`)
- [ ] Tests auf main grün
- [ ] Build auf main erfolgreich
- [ ] Feature-Branch gelöscht (lokal + remote)
- [ ] Worktree aufgeräumt (falls verwendet)
- [ ] Staging/Production Deployment getriggert (falls automatisch)

## Rollback-Plan

Falls nach Merge Probleme auftreten:

```bash
# Revert des Merge-Commits
git revert -m 1 <merge-commit-hash>

# Oder: Reset (nur wenn noch nicht gepusht!)
git reset --hard HEAD~1

# Hotfix-Branch erstellen
git checkout -b hotfix/[issue]
```

## Abschluss-Bericht

Nach dem Merge erstelle einen kurzen Bericht:

```markdown
## Feature: [Name] - MERGED ✅

- **Branch:** feature/[name]
- **Merge-Strategie:** [Fast-Forward/Merge Commit/Squash]
- **Commit:** [hash]
- **Tests:** [X/X] passing
- **Zeitaufwand:** [X Stunden]

### Zusammenfassung
[Kurze Beschreibung was implementiert wurde]

### Technische Details
- [Wichtige Architektur-Entscheidungen]
- [Neue Dependencies]
- [Datenbank-Migrationen]

### Nächste Schritte
- [ ] Monitoring
- [ ] Dokumentation aktualisieren
- [ ] Team informieren
```

## Verboten

❌ Merge ohne grüne Tests
❌ Force-push nach Merge
❌ Branch behalten nach Merge
❌ Ungetestete Änderungen direkt auf main
