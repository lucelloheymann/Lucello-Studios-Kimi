# Playwright E2E Testing

## Installation Status

| Komponente | Status |
|------------|--------|
| @playwright/test | ✅ Installiert |
| Chromium Browser | ✅ Installiert |
| playwright.config.ts | ✅ Konfiguriert |
| E2E Test Directory | ✅ Erstellt |

## Konfiguration

Die Playwright-Konfiguration befindet sich in `playwright.config.ts`:

- **Test Directory:** `./e2e`
- **Base URL:** `http://localhost:3000` (via env `PLAYWRIGHT_BASE_URL` überschreibbar)
- **Browser:** Chromium (Firefox/WebKit können aktiviert werden)
- **Parallel:** Ja (außer in CI)
- **Retries:** 2x in CI, 0x lokal
- **Reporting:** HTML + List

## Verwendung

### Tests ausführen

```bash
# Alle Tests (headless)
npm run test:e2e

# Mit UI-Modus (für Entwicklung)
npm run test:e2e:ui

# Mit sichtbarem Browser
npm run test:e2e:headed

# Debug-Modus
npm run test:e2e:debug

# Report anzeigen
npm run test:e2e:report
```

### Neue Tests schreiben

Tests werden im `e2e/` Verzeichnis erstellt:

```typescript
import { test, expect } from '@playwright/test';

test('should display dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible();
});
```

### Best Practices

1. **Base URL nutzen:** `await page.goto('/dashboard')` statt volle URL
2. **Semantic Selectors:** `getByRole`, `getByLabel` statt CSS-Selektoren
3. **Test Isolation:** Jeder Test startet frisch
4. ** Fixtures:** Für wiederholende Setups (Auth, etc.)

## CI/CD Integration

Für GitHub Actions (automatisch erkannt):

```yaml
- name: Run Playwright tests
  run: npm run test:e2e
  
- name: Upload report
  if: failure()
  uses: actions/upload-artifact@v3
  with:
    name: playwright-report
    path: playwright-report/
```

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| Browser nicht gefunden | `npx playwright install chromium` |
| Tests flaky | Retries erhöhen oder stabilere Selektoren nutzen |
| Timeout | `timeout` in config erhöhen |

---

**Status:** ✅ Einsatzbereit
