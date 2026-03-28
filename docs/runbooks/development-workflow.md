# Runbook: Development Workflow

> Dieser Guide beschreibt den vollständigen Entwicklungs-Workflow für Lucello Studio.
> Ziel: Jedes Teammitglied — und Kimi Code CLI — soll konsistent und reibungslos arbeiten können.

---

## Täglicher Workflow

### 1. Vorbereitung

```bash
# Auf aktuellem Stand bleiben
git fetch origin
git pull origin develop

# Neuen Feature-Branch erstellen
git checkout -b feature/mein-feature
```

### 2. Entwickeln

```bash
# Abhängigkeiten installieren (nach Pull, falls nötig)
npm install

# Dev-Server starten
npm run dev

# Tests parallel im Watch-Mode
npm run test:watch
```

### 3. Vor dem Commit

```bash
# Linting und Type-Check
npm run lint
npm run typecheck

# Tests ausführen
npm run test

# Staged Changes reviewen
git diff --staged
```

### 4. Committen

Wir verwenden **Conventional Commits**:

```
<type>(<scope>): <kurze Beschreibung>

[optionaler längerer Body]

[optionale Footer, z. B. Closes #123]
```

**Typen:**
- `feat` — neues Feature
- `fix` — Bugfix
- `docs` — nur Dokumentation
- `chore` — Housekeeping (Dependencies, Config)
- `refactor` — Code-Umstrukturierung ohne Feature-/Fix
- `test` — Tests hinzufügen oder anpassen
- `perf` — Performance-Verbesserung

**Beispiele:**
```bash
git commit -m "feat(auth): add OAuth2 login with Google"
git commit -m "fix(api): handle null response from payment service"
git commit -m "docs: update architecture overview"
```

### 5. Pull Request erstellen

```bash
git push origin feature/mein-feature
```

Dann auf GitHub:
- Base-Branch: `develop`
- Titel: kurz und präzise (Conventional Commit-Format)
- Beschreibung: Was, Warum, wie testen?
- Mindestens 1 Reviewer assignen
- Labels setzen (feature, bugfix, ...)

---

## Git-Branching-Modell

```
main          ←── Produktion, nur via Release-PR
  │
develop       ←── Integrations-Branch, immer deploybar
  │
feature/*     ←── Feature-Entwicklung
fix/*         ←── Bugfixes
chore/*       ←── Maintenance
docs/*        ←── Dokumentation
```

**Regeln:**
- Direkte Commits auf `main` sind verboten.
- `develop` muss immer grüne CI-Pipeline haben.
- Feature-Branches werden nach dem Merge gelöscht.

---

## Code-Review-Checkliste

Als Reviewer prüfen:
- [ ] Logik korrekt und verständlich?
- [ ] Tests vorhanden und aussagekräftig?
- [ ] Keine Secrets oder hardgecodeten Werte?
- [ ] Performance-Probleme (N+1, große Loops)?
- [ ] Fehlerbehandlung sinnvoll?
- [ ] Naming klar und konsistent?
- [ ] Dokumentation aktualisiert falls nötig?

---

## Releases

1. Release-Branch aus `develop` erstellen: `release/1.2.0`
2. Version in `package.json` bumpen
3. `CHANGELOG.md` aktualisieren
4. PR auf `main` erstellen
5. Nach Merge: Git-Tag setzen: `git tag v1.2.0`
6. `main` zurück in `develop` mergen

---

## Häufige Probleme

### Merge-Konflikte lösen

```bash
git fetch origin
git rebase origin/develop
# Konflikte manuell lösen
git add .
git rebase --continue
```

### Lokale Änderungen temporär sichern

```bash
git stash push -m "WIP: mein Feature"
# ...anderes erledigen...
git stash pop
```

### Falschen Commit rückgängig machen (lokal, noch nicht gepusht)

```bash
git reset HEAD~1          # behält Änderungen in Working Directory
# NICHT: git reset --hard (löscht Änderungen!)
```

---

## CI/CD Pipeline

| Stage | Was passiert |
|---|---|
| `lint` | ESLint + Prettier-Check |
| `typecheck` | TypeScript-Kompilierung |
| `test` | Unit- und Integrationstests |
| `build` | Production Build |
| `deploy:staging` | Auto-Deploy auf Staging (develop) |
| `deploy:prod` | Manueller Deploy auf Produktion (main) |
