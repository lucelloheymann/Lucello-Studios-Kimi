# Using Git Worktrees Skill

## Beschreibung

Für jedes Feature wird ein isolierter Git Worktree erstellt, um die main-Branch sauber zu halten.

## Was ist ein Worktree?

Ein Git Worktree ist ein verlinkter Checkout einer Branch in einem separaten Verzeichnis:

```
project/
├── main/           # main branch (clean)
├── feature-auth/   # feature/auth branch
└── feature-api/    # feature/api branch
```

Alle Worktrees teilen sich das gleiche Git-Repository (.git), haben aber separate Working Directories.

## Workflow

### 1. Worktree erstellen

```bash
# Feature-Branch erstellen
git checkout -b feature/[name]

# Worktree erstellen (optional für langlebige Features)
git worktree add ../wra-[feature-name] feature/[name]
```

### 2. Im Worktree arbeiten

```bash
# In Worktree wechseln
cd ../wra-[feature-name]

# Setup ausführen
npm install

# Tests baseline verifizieren
npm run test
npm run typecheck

# Mit Feature beginnen
```

### 3. Regelmäßig syncen

```bash
# Updates von main holen
git fetch origin
git rebase origin/main

# Bei Konflikten: manuell lösen und Test-DB reset
npm run db:reset
npm run db:seed
```

## Worktree Commands

```bash
# Liste aller Worktrees
git worktree list

# Neuen Worktree erstellen
git worktree add <path> <branch>

# Worktree entfernen (nach Merge)
git worktree remove <path>

# Worktree prunen (aufräumen)
git worktree prune
```

## Wann Worktrees nutzen?

**Empfohlen für:**
- Features > 2 Stunden Aufwand
- Langlebige Branches (mehrere Tage)
- Parallele Arbeit an mehreren Features
- Experimente/R&D

**Nicht nötig für:**
- Hotfixes (< 30 Min)
- Dokumentation
- Konfigurations-Änderungen

## Vorteile

1. **Isolation** - Main bleibt immer funktionsfähig
2. **Parallel** - Mehrere Features gleichzeitig
3. **Clean** - Keine uncommitted changes in main
4. **Testbar** - Jedes Feature separat testen

## Integration mit Subagent Development

Jeder Subagent arbeitet in einem eigenen Worktree:

```
# Haupt-Agent erstellt Worktrees für parallele Tasks
git worktree add ../task-1 task/1-export-csv
git worktree add ../task-2 task/2-ui-button

# Subagent 1 arbeitet in ../task-1
# Subagent 2 arbeitet in ../task-2

# Nach Fertigstellung: Cherry-pick oder Merge
git checkout main
git merge task/1-export-csv
git merge task/2-ui-button
```

## Cleanup nach Merge

```bash
# Nach erfolgreichem Merge
git checkout main
git branch -d feature/[name]
git worktree remove ../wra-[feature-name]

# Verifizieren
git worktree list
```

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| Worktree existiert bereits | `git worktree remove <path>` |
| Branch existiert bereits | `git branch -m <old> <new>` |
| Konflikte beim Rebase | Manuell lösen, dann `git rebase --continue` |
| Node_modules fehlt | `npm install` im Worktree ausführen |

## Best Practices

1. **Immer Tests vorher laufen lassen** - Sicherstellen, dass Baseline grün ist
2. **Regelmäßig rebasen** - Konflikte früh erkennen
3. **Kleine Commits** - Leichter zu reviewen und zu cherry-picken
4. **Cleanup** - Nach Merge Worktree aufräumen
