# Entwicklungs-Tools & Integrationen

Dieses Dokument bietet einen Überblick über alle professionellen Entwicklungs-Tools, die im Website Rescue Agent Projekt integriert sind.

## Übersicht

| Tool | Zweck | Status | Dokumentation |
|------|-------|--------|---------------|
| [Superpowers](./SUPERPOWERS.md) | Entwicklungs-Workflow & Skills | ⚠️ Plugin-Installation erforderlich | [SUPERPOWERS.md](./SUPERPOWERS.md) |
| [Playwright](./PLAYWRIGHT.md) | E2E Testing | ✅ Einsatzbereit | [PLAYWRIGHT.md](./PLAYWRIGHT.md) |
| [Sentry](./SENTRY.md) | Error Monitoring & Tracing | ⚠️ DSN Konfiguration erforderlich | [SENTRY.md](./SENTRY.md) |
| [BullMQ](./BULLMQ.md) | Queue System + Redis | ✅ Produktionsbereit | [BULLMQ.md](./BULLMQ.md) |

## Legende

| Symbol | Bedeutung |
|--------|-----------|
| ✅ | Vollständig einsatzbereit |
| ⚠️ | Installation/Konfiguration erforderlich |
| ❌ | Noch nicht implementiert |

## Quick Start

### Entwicklung starten

```bash
# 1. Dependencies installieren
npm install

# 2. Docker Services starten (Postgres + Redis)
docker-compose up -d

# 3. Datenbank migrieren
npm run db:push

# 4. Dev Server starten
npm run dev

# 5. Worker starten (anderes Terminal)
npm run worker:dev
```

### Testing

```bash
# Unit Tests
npm run test

# E2E Tests
npm run test:e2e

# Mit UI
npm run test:e2e:ui
```

### Production Build

```bash
# Clean Build
npm run build:clean

# Worker für Production
npm run worker
```

## Konfiguration

Alle Tools werden über Umgebungsvariablen konfiguriert. Siehe [`.env.example`](../../.env.example) für alle verfügbaren Optionen.

### Wichtige Variablen

```bash
# Datenbank
DATABASE_URL="postgresql://..."

# Redis (für BullMQ)
REDIS_URL="redis://localhost:6379"
USE_MOCK_QUEUE="false"

# Sentry
NEXT_PUBLIC_SENTRY_DSN=""
SENTRY_AUTH_TOKEN=""

# Playwright
PLAYWRIGHT_BASE_URL="http://localhost:3000"
```

## Support & Dokumentation

| Tool | Offizielle Doku | Support |
|------|-----------------|---------|
| Superpowers | [GitHub](https://github.com/obra/superpowers) | [Discord](https://discord.gg/Jd8Vphy9jq) |
| Playwright | [playwright.dev](https://playwright.dev) | [GitHub Issues](https://github.com/microsoft/playwright/issues) |
| Sentry | [docs.sentry.io](https://docs.sentry.io) | [Help Center](https://help.sentry.io) |
| BullMQ | [docs.bullmq.io](https://docs.bullmq.io) | [GitHub Issues](https://github.com/taskforcesh/bullmq/issues) |

---

**Stand:** März 2026
