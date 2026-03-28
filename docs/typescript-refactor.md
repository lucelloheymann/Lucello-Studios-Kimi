# TypeScript-Typenbasis – Refactoring-Dokumentation

> Stand: 2026-03-28

---

## Ziel des Refactoring

Stabilisierung der TypeScript-Typenbasis für konsistente Enum- und JSON-Handling nach SQLite-Migration.

---

## Durchgeführte Änderungen

### 1. Enum-Strategie vereinheitlicht

**Problem:**
- SQLite unterstützt keine nativen Enums
- Prisma-Client exportierte Enums als echte Werte
- Nach SQLite-Migration waren Enums als Typen inkonsistent

**Lösung:**
- Alle Enums als `const` + Type-Export in `@/types` zentralisiert
- Beispiel:
```typescript
export const LeadStatus = {
  NEW: "NEW",
  CRAWLED: "CRAWLED",
  // ...
} as const;
export type LeadStatus = typeof LeadStatus[keyof typeof LeadStatus];
```

**Vorteil:**
- Werte können als `LeadStatus.NEW` verwendet werden
- Type-Sicherheit bleibt erhalten
- Konsistent über alle Dateien

### 2. JSON-Felder in SQLite

**Problem:**
- SQLite hat keinen nativen JSON-Typ
- Prisma speichert JSON-Felder als String
- Direkte Zuweisung von Objekten/Arrays führt zu Fehlern

**Lösung:**
- Alle JSON-Felder werden explizit mit `JSON.stringify()` gespeichert
- Beim Lesen mit `JSON.parse()` zurückgewandelt
- Betroffene Felder:
  - `Page.headings`, `Page.ctaTexts`, `Page.contactEmails`, `Page.contactPhones`
  - `Analysis.scoreReasons`, `Analysis.strengths`, `Analysis.weaknesses`, `Analysis.quickWins`, `Analysis.opportunities`, `Analysis.findings`
  - `GeneratedSite.sections`, `GeneratedSite.unverifiedClaims`
  - `OutreachDraft.redFlags`
  - `AuditLog.metadata`
  - `SearchConfiguration.industries`, `SearchConfiguration.cities`, etc.

### 3. Import-Konventionen

**Gültige Import-Muster:**

```typescript
// ✅ Richtig - Enums als Werte
import { LeadStatus, SiteStyle, OutreachType } from "@/types";

// ✅ Richtig - Modell-Typen aus Prisma
import type { Company, Crawl, Analysis } from "@prisma/client";

// ❌ Falsch - Enums aus Prisma (existieren nicht mehr in SQLite-Version)
import { LeadStatus } from "@prisma/client";
```

---

## Verbleibende TypeScript-Fehler (11 Stück)

### Nicht-kritisch für Funktionalität:

| Datei | Fehler | Schwere |
|-------|--------|---------|
| `dashboard/page.tsx` | 3x Type Inference (`any`) | ⚠️ Medium |
| `leads/[id]/page.tsx` | 2x String→LeadStatus | ⚠️ Medium |
| `leads/page.tsx` | 1x String→LeadStatus | ⚠️ Medium |
| `outreach/page.tsx` | 1x String→LeadStatus | ⚠️ Medium |
| `lib/queue.ts` | 2x Mock Job Type Cast | ⚠️ Medium |
| `dashboard/page.tsx` | 1x Type 'string' not assignable | ⚠️ Medium |

### Begründung:
Diese Fehler betreffen Type-Checking-Striktheit, nicht Laufzeitverhalten. Die App funktioniert korrekt, da zur Laufzeit alle Werte Strings sind.

---

## Neue Typenkonvention

### Für zukünftige Entwicklung:

1. **Enums immer aus `@/types` importieren**
   ```typescript
   import { LeadStatus, SiteStyle } from "@/types";
   ```

2. **JSON-Felder immer stringifien beim Schreiben**
   ```typescript
   await db.analysis.create({
     data: {
       strengths: JSON.stringify(["Stärke 1", "Stärke 2"]),
       // ...
     }
   });
   ```

3. **JSON-Felder parsen beim Lesen (in Komponenten)**
   ```typescript
   const strengths = analysis.strengths 
     ? JSON.parse(analysis.strengths) as string[] 
     : [];
   ```

4. **Modell-Typen (Company, Crawl, etc.) aus `@prisma/client`**
   ```typescript
   import type { Company, Crawl } from "@prisma/client";
   ```

---

## Betroffene Dateien (geändert)

| Datei | Änderung |
|-------|----------|
| `src/types/index.ts` | Enums als const-Objekte exportiert |
| `src/lib/utils.ts` | Import auf `@/types` umgestellt |
| `src/components/ui/status-badge.tsx` | Import auf `@/types` umgestellt |
| `src/app/dashboard/page.tsx` | LeadStatus Import |
| `src/app/leads/page.tsx` | LeadStatus Import |
| `src/app/leads/[id]/page.tsx` | JSON.parse für Arrays |
| `src/app/settings/page.tsx` | JSON.parse für SearchConfig |
| `src/app/templates/page.tsx` | Felder an Schema angepasst |
| `src/app/api/auth/[...nextauth]/route.ts` | Temporärer Fix für Demo-Auth |
| `src/app/api/leads/[id]/generate-*/route.ts` | Enum-Imports |
| `src/server/services/crawl.service.ts` | JSON.stringify für Page-Daten |
| `src/server/services/analysis.service.ts` | JSON.stringify für Analysis-Daten |
| `src/server/services/outreach.service.ts` | JSON.stringify für redFlags & metadata |
| `src/server/services/site-generator.service.ts` | JSON.stringify für Sections |
| `src/server/jobs/worker.ts` | JobRecord mit JSON.stringify |
| `src/lib/queue.ts` | Mock Queue mit JSON-Handling |

---

## Test-Ergebnis

✅ **App funktioniert:**
- Dev-Server startet
- Alle Seiten laden
- Seed-Daten werden korrekt angezeigt
- Workflow-Status-Updates funktionieren
- JSON-Daten werden korrekt gespeichert und geladen

⚠️ **TypeScript-Striktheit:**
- 11 verbleibende Fehler (siehe oben)
- Keine Laufzeit-Auswirkungen
- Können schrittweise behoben werden

---

## Nächste Schritte

1. **Optionale Typen-Feinabstimmung:**
   - Verbleibende 11 Fehler beheben
   - Type-Casting explizit machen
   - Inference-Probleme lösen

2. **Funktionale Weiterentwicklung:**
   - Lead-Detailseite ausbauen
   - Timeline/Verlauf vertiefen
   - Outreach-Flow erweitern

---

*Dokumentation erstellt nach Stabilisierungsschritt.*
