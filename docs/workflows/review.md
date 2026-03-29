# Workflow: Review

**Wann:** Nach Fertigstellung aller Batches  
**Ziel:** Qualitätsprüfung vor Commit  
**Auslöser:** Nutzer sagt "Review bitte" oder alle Batches sind done

---

## Review-Checkliste

Kimi muss diese Punkte ABHAKEBEN (nicht nur im Kopf):

```markdown
## Code Review: [Feature-Name]

### Funktionalität
- [ ] Feature tut was es soll (laut Plan)
- [ ] Edge Cases behandelt
- [ ] Fehlerfälle sinnvoll behandelt

### Code-Qualität
- [ ] `npm run typecheck` - keine Errors
- [ ] `npm run lint` - keine Errors
- [ ] Keine `any`-Typen ohne Begründung
- [ ] Keine Business-Logik in UI-Komponenten

### Tests
- [ ] E2E-Tests passing (wenn relevant)
- [ ] Neue Features haben Test-Abdeckung
- [ ] Keine flaky Tests eingeführt

### Datenbank
- [ ] Schema-Änderungen in `prisma/schema.prisma`
- [ ] Migration nötig? → `npm run db:migrate`
- [ ] Keine Breaking Changes ohne Absprache

### Dokumentation
- [ ] Neue API-Routes dokumentiert (JSDoc)
- [ ] Komplexe Logik hat Kommentare
- [ ] Plan aktualisiert falls abgewichen

### Security
- [ ] Keine Secrets im Code
- [ ] API-Routes haben Auth-Checks
- [ ] Input validiert (Zod)

### Performance
- [ ] Keine N+1 Queries
- [ ] Keine unnötigen Re-renders
```

---

## Schritte für Kimi

### 1. Automatische Checks (5 Min)

```bash
npm run typecheck
npm run lint
```

**Falls Fehler:** Sofort beheben oder Nutzer fragen

### 2. Manuelle Prüfung (10 Min)

- Code durchlesen
- Checkliste abarbeiten
- Unklare Stellen markieren

### 3. Review-Ergebnis

**Falls alles OK:**
```
✅ Review bestanden

Alle Checks grün:
- Typecheck: OK
- Lint: OK  
- Tests: OK
- [Weitere Punkte]

Soll ich commiten und pushen?
```

**Falls Probleme:**
```
⚠️ Review gefunden:

Probleme:
1. [Beschreibung] → Lösung: [Vorschlag]
2. [Beschreibung] → Lösung: [Vorschlag]

Soll ich:
1. Probleme beheben
2. Trotzdem commiten (nicht empfohlen)
3. Nutzer entscheiden lassen
```

---

## Wann ist Review NICHT nötig?

- Nur Dokumentation geändert
- Nur Kommentare hinzugefügt
- Nur CSS/Lint-Fixes
- Emergency-Hotfix (dann aber danach Review nachholen)

---

## Output

- Review-Bestätigung oder Liste von Problemen
- Bei OK: Freigabe für Finish-Workflow
