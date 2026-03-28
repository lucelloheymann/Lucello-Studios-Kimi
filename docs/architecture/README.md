# Architektur-Übersicht

> Dieses Dokument beschreibt die technische Architektur von Lucello Studio.
> Änderungen an der Architektur → neues ADR in `docs/decisions/`.

---

## System-Übersicht

```
[Diagram hier eintragen — z. B. ASCII-Art oder Link zu einer Excalidraw-Datei]

┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Frontend  │────▶│   Backend   │────▶│  Datenbank  │
│  (React/TS) │     │  (Node.js)  │     │ (Postgres)  │
└─────────────┘     └─────────────┘     └─────────────┘
```

---

## Komponenten

### Frontend
- **Technologie**: [z. B. React 18, TypeScript, Vite]
- **Zuständigkeit**: [Beschreibung]
- **Hauptpfade**: `src/`

### Backend / API
- **Technologie**: [z. B. Node.js, Express / Fastify, TypeScript]
- **Zuständigkeit**: [Beschreibung]
- **Hauptpfade**: `server/` oder `api/`

### Datenbank
- **Technologie**: [z. B. PostgreSQL 16]
- **ORM / Query-Builder**: [z. B. Prisma, Drizzle, Knex]
- **Migrationen**: [Pfad und Tool]

### Authentifizierung
- **Methode**: [z. B. JWT, OAuth 2.0, Session-Cookies]
- **Provider**: [z. B. Auth0, Supabase Auth, eigene Implementierung]

---

## Datenfluss

[Beschreibung des typischen Request-Response-Zyklus]

1. Client sendet Request an `POST /api/...`
2. Middleware validiert Auth-Token
3. Controller ruft Service-Layer auf
4. Service interagiert mit Datenbank
5. Response wird zurückgegeben

---

## Deployment

| Umgebung | Branch | URL | Deploy-Trigger |
|---|---|---|---|
| Lokal | beliebig | `localhost:3000` | manuell |
| Staging | `develop` | [URL] | auto bei merge |
| Produktion | `main` | [URL] | manuell / tag |

---

## Sicherheit

- [Wichtige Sicherheitsaspekte, z. B. CORS-Konfiguration]
- [Rate-Limiting]
- [Input-Validierung]
- [Secret-Management]

---

## Offene Architektur-Fragen

- [ ] [Offene Frage 1]
- [ ] [Offene Frage 2]

---

## Verwandte ADRs

- [ADR-0001: ...]
- [ADR-0002: ...]
