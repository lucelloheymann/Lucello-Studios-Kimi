# BullMQ Worker Setup Guide

**Status:** Code integriert, wartet auf Redis  
**Aufwand:** 10 Minuten

---

## Aktueller Status

| Komponente | Status |
|------------|--------|
| BullMQ installiert | ✅ `bullmq` in dependencies |
| ioredis installiert | ✅ `ioredis` in dependencies |
| Worker-Datei | ✅ `src/server/jobs/worker.ts` (314 Zeilen) |
| Queue-Config | ✅ `src/lib/queue.ts`, `queue-config.ts` |
| NPM Scripts | ✅ `npm run worker`, `npm run worker:dev` |

**Was fehlt:** Laufender Redis-Server + `REDIS_URL` in `.env.local`

---

## Redis starten (3 Optionen)

### Option 1: Docker (empfohlen)

```bash
# Redis Container starten
docker run -d -p 6379:6379 --name redis redis:alpine

# Prüfen ob läuft
docker ps
```

### Option 2: Redis Windows (nativ)

```powershell
# Chocolatey
choco install redis-64

# Oder Memurai (Windows-native Redis)
# https://www.memurai.com/
```

### Option 3: Cloud Redis

```bash
# Redis Cloud (kostenloser Tier)
# Upstash, Redis Cloud, etc.
# REDIS_URL="redis://username:password@host:port"
```

---

## Aktivierung in 3 Schritten

### 1. Redis starten (Docker)

```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

### 2. ENV Variable setzen

```bash
# apps/website-rescue-agent/.env.local
REDIS_URL="redis://localhost:6379"
```

### 3. Worker starten

```bash
cd apps/website-rescue-agent

# Production Mode
npm run worker

# Development Mode (mit Watch)
npm run worker:dev
```

---

## Was dann funktioniert

### Automatische Job-Verarbeitung

```
Lead wird angelegt
    ↓
Job in Queue "crawl" eingestellt
    ↓
Worker verarbeitet Crawl
    ↓
Automatisch nächster Job: "analyze"
    ↓
Worker verarbeitet Analyse
    ↓
Fertig
```

### Verfügbare Queues

| Queue | Aufgabe | Concurrency |
|-------|---------|-------------|
| `crawl` | Website crawlen | 3 parallel |
| `analyze` | KI-Analyse | 2 parallel |
| `generate-site` | Demo-Site generieren | 2 parallel |
| `generate-outreach` | Outreach-Entwurf | 2 parallel |
| `send-outreach` | E-Mail versenden | 1 parallel |
| `qualify` | Lead qualifizieren | 2 parallel |

### Job Status Tracking

Jobs werden in `JobRecord` Tabelle geloggt:
- Status: PENDING → RUNNING → COMPLETED/FAILED
- Retry-Count
- Error Messages

---

## Troubleshooting

### "ECONNREFUSED 127.0.0.1:6379"

```bash
# Redis läuft nicht
docker ps  # Prüfen ob Container läuft
docker start redis  # Falls gestoppt
```

### "Redis connection timeout"

```bash
# Firewall prüfen
# Redis läuft auf Port 6379
telnet localhost 6379
```

### Worker crasht sofort

```bash
# Logs prüfen
npm run worker 2>&1

# Häufige Ursachen:
# - REDIS_URL nicht gesetzt
# - Database URL falsch
# - Fehlende ENV Variablen
```

---

## Produktions-Setup

```bash
# Redis mit Auth
REDIS_URL="redis://username:password@redis.example.com:6379"

# Worker als Service (systemd, pm2, etc.)
pm install -g pm2
pm2 start "npm run worker" --name "wra-worker"
```

---

## Ohne Redis (Fallback)

Falls Redis nicht verfügbar:

```typescript
// Jobs werden synchron im Request verarbeitet
// Nicht empfohlen für Production, aber für Tests OK
```

---

## Fazit

**In 10 Minuten aktivierbar:**
1. Docker installieren (falls nicht vorhanden) ~5 Min
2. Redis Container starten ~1 Min  
3. ENV setzen + Worker starten ~2 Min

Dann läuft die vollständige Background-Job-Verarbeitung.
