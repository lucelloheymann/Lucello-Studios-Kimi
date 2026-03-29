# BullMQ + Redis Queue System

## Installation Status

| Komponente | Status |
|------------|--------|
| bullmq | ✅ Installiert |
| ioredis | ✅ Installiert |
| Redis (Docker) | ✅ In docker-compose.yml |
| Queue Config | ✅ src/lib/queue-config.ts |
| Queue System | ✅ src/lib/queue.ts |
| Worker Process | ✅ src/server/jobs/worker.ts |

## Architektur

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Next.js   │────▶│    Redis    │◀────│   Worker    │
│   (API)     │     │   (BullMQ)  │     │  (Process)  │
└─────────────┘     └─────────────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │  SQLite DB  │
                    │ (Job Logs)  │
                    └─────────────┘
```

## Redis Starten

```bash
# Mit Docker Compose (empfohlen)
docker-compose up -d redis

# Oder lokal
docker run -d -p 6379:6379 redis:7-alpine
```

## Modi

### 1. Mock Queue (Entwicklung ohne Redis)

```bash
USE_MOCK_QUEUE=true npm run dev
```

- Jobs werden im Memory verarbeitet
- Auto-processing nach 2-5 Sekunden
- Keine Persistenz

### 2. Redis Queue (Produktion)

```bash
# Mit Redis
REDIS_URL=redis://localhost:6379 npm run dev

# Ohne Mock
USE_MOCK_QUEUE=false npm run dev
```

## Worker Starten

```bash
# Production
npm run worker

# Development (mit Auto-Reload)
npm run worker:dev
```

## Queue Konfiguration

| Queue | Timeout | Retries | Concurrency |
|-------|---------|---------|-------------|
| crawl | 2 min | 2 | 3 (env: CRAWL_CONCURRENCY) |
| analyze | 5 min | 2 | 2 (env: LLM_CONCURRENCY) |
| generate-site | 10 min | 2 | 2 (env: LLM_CONCURRENCY) |
| generate-outreach | 3 min | 2 | 2 (env: LLM_CONCURRENCY) |
| send-outreach | 1 min | 3 | 1 (env: EMAIL_CONCURRENCY) |

## Environment Variables

```bash
# Connection
REDIS_URL="redis://localhost:6379"
USE_MOCK_QUEUE="false"

# Concurrency
CRAWL_CONCURRENCY="3"
LLM_CONCURRENCY="2"
EMAIL_CONCURRENCY="1"
WORKER_CONCURRENCY="4"

# Rate Limiting
WORKER_RATE_LIMIT_MAX="10"
WORKER_RATE_LIMIT_DURATION="1000"
```

## Verwendung im Code

### Job einreihen

```typescript
import { enqueueJob, enqueuePipeline } from '@/lib/queue';

// Einzelner Job
await enqueueJob('crawl', { companyId: '123' }, { priority: 5 });

// Ganze Pipeline
await enqueuePipeline('123'); // crawl → analyze
```

### Status prüfen

```typescript
import { getQueueStats, getAllQueueStats } from '@/lib/queue';

// Einzelne Queue
const stats = await getQueueStats('crawl');
// { waiting: 5, active: 2, completed: 100, failed: 3, delayed: 0 }

// Alle Queues
const allStats = await getAllQueueStats();
```

### Redis Health Check

```typescript
import { checkRedisHealth } from '@/lib/queue-config';

const { healthy, message } = await checkRedisHealth();
```

## Monitoring

### Dashboard

Das Settings-Dashboard zeigt Queue-Stats:
- `/settings` → Queue-Status
- Job-Counts pro Queue
- Redis-Verbindungsstatus

### Logs

```bash
# Worker Logs
npm run worker

# Mit Sentry Integration
# Fehler werden automatisch an Sentry gesendet
```

## Troubleshooting

| Problem | Lösung |
|---------|--------|
| "Redis connection refused" | Redis starten: `docker-compose up -d redis` |
| Jobs werden nicht verarbeitet | Worker starten: `npm run worker` |
| Jobs hängen | Worker neustarten (graceful shutdown) |
| Hohe Memory-Nutzung | `removeOnComplete`/`removeOnFail` prüfen |

---

**Status:** ✅ Produktionsbereit (Redis erforderlich)
