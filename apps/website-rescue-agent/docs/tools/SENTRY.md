# Sentry Error Monitoring & Tracing

## Installation Status

| Komponente | Status |
|------------|--------|
| @sentry/nextjs | ✅ Installiert |
| @vercel/otel | ✅ Installiert (für OTel) |
| Client Config | ✅ instrumentation-client.ts |
| Server Config | ✅ sentry.server.config.ts |
| Edge Config | ✅ sentry.edge.config.ts |
| Next.js Config | ✅ Mit withSentryConfig |

## Einrichtung

### 1. Sentry Account & Projekt

1. Registriere dich auf [sentry.io](https://sentry.io)
2. Erstelle ein neues Projekt: **Next.js**
3. Kopiere die DSN

### 2. Environment Variables

Füge zur `.env.local` hinzu:

```bash
NEXT_PUBLIC_SENTRY_DSN="https://xxx@yyy.ingest.sentry.io/zzz"
SENTRY_ORG="your-org"
SENTRY_PROJECT="your-project"
SENTRY_AUTH_TOKEN="your-auth-token"  # Für Source Maps (CI only)
```

### 3. Source Maps Upload (CI)

Für automatischen Source Map Upload in CI/CD:

```bash
# GitHub Actions Beispiel
- name: Build with Sentry
  env:
    SENTRY_AUTH_TOKEN: ${{ secrets.SENTRY_AUTH_TOKEN }}
    SENTRY_RELEASE: ${{ github.sha }}
  run: npm run build
```

## Konfiguration

### Client-Side (Browser)

`instrumentation-client.ts`:
- Error Monitoring ✅
- Performance Tracing ✅ (10% in Prod, 100% in Dev)
- Session Replay ❌ (kann aktiviert werden)

### Server-Side (Node.js)

`sentry.server.config.ts`:
- API Error Tracking ✅
- Server-side Tracing ✅
- Worker Error Reporting ✅

### Edge Runtime

`sentry.edge.config.ts`:
- Middleware Error Tracking ✅

## Verwendung

### Manuelles Error Reporting

```typescript
import * as Sentry from '@sentry/nextjs';

// Capture exception
try {
  riskyOperation();
} catch (error) {
  Sentry.captureException(error);
}

// Capture message
Sentry.captureMessage('Something went wrong', 'warning');

// With context
Sentry.withScope((scope) => {
  scope.setTag('section', 'checkout');
  scope.setExtra('cart', cartData);
  Sentry.captureException(error);
});
```

### In React Components

```typescript
import { ErrorBoundary } from '@sentry/nextjs';

<ErrorBoundary fallback={<ErrorPage />}>
  <MyComponent />
</ErrorBoundary>
```

## Features

| Feature | Status | Config |
|---------|--------|--------|
| Error Monitoring | ✅ | `dsn` |
| Performance Tracing | ✅ | `tracesSampleRate` |
| Release Tracking | ✅ | `SENTRY_RELEASE` env |
| Source Maps | ✅ | Automatisch in CI |
| Session Replay | ❌ | Kann aktiviert werden |
| Logs | ❌ | Kann aktiviert werden |

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| Keine Fehler in Sentry | DSN prüfen, `debug: true` setzen |
| Source Maps fehlen | `SENTRY_AUTH_TOKEN` prüfen |
| Performance Overhead | `tracesSampleRate` reduzieren |

---

**Status:** ✅ Installiert, Konfiguration erforderlich (DSN)
