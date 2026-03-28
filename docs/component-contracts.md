# Lucello Rescue Agent – Component Contracts

> **Verbindliche Komponenten-Spezifikationen**  
> Jede Komponente muss diesen Contracts folgen. Props, Styling und Verhalten sind verbindlich.

---

## 1. Core Components

### 1.1 Card

#### BaseCard
```typescript
interface BaseCardProps {
  children: React.ReactNode;
  className?: string;
  hover?: boolean;
  onClick?: () => void;
}
```

**Styling (verbindlich):**
```
- Background: bg-zinc-900 (dark), bg-white (light)
- Border: border border-zinc-800
- Border Radius: rounded-xl (12px)
- Padding: p-5 (20px)
- Hover (optional): hover:border-zinc-700 hover:bg-zinc-800/50
```

**Usage:**
```tsx
<div className="rounded-xl bg-zinc-900 border border-zinc-800 p-5">
  {children}
</div>
```

---

### 1.2 DataCard

```typescript
interface DataCardProps {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  action?: { label: string; href: string };
}
```

**Styling:**
```
┌─────────────────────────────────────┐
│ [Icon] Title              [Action]  │  ← Header: border-b border-zinc-800 pb-3 mb-4
│ ─────────────────────────────────── │
│                                     │
│ Content                             │
│                                     │
└─────────────────────────────────────┘
```

**Required Classes:**
```tsx
<div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
  <div className="flex items-center justify-between px-5 py-4 border-b border-zinc-800">
    <div className="flex items-center gap-2">
      {icon && <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-{accent}-500/10">
        {icon}
      </div>}
      <h3 className="text-sm font-semibold text-white">{title}</h3>
    </div>
    {action && <Link href={action.href} className="text-xs text-zinc-500 hover:text-white">{action.label}</Link>}
  </div>
  <div className="p-5">{children}</div>
</div>
```

---

### 1.3 MetricCard

```typescript
interface MetricCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  context?: string;      // Subtext unter dem Wert
  trend?: {             // Optional: Trend-Indikator
    value: number;
    direction: 'up' | 'down';
  };
  href?: string;        // Optional: Clickable
  accent: 'zinc' | 'emerald' | 'teal' | 'sky' | 'amber' | 'violet';
}
```

**Styling:**
```
┌─────────────────────────────┐
│ LABEL                 [Icon]│  ← text-xs font-medium text-zinc-500 uppercase tracking-wider
│ ─────────────────────────── │
│ 47                          │  ← text-3xl font-black text-white tabular-nums
│ 12% der Leads               │  ← text-xs text-zinc-600
└─────────────────────────────┘
```

**Required Classes:**
```tsx
const accentMap = {
  zinc:    "text-zinc-400 bg-zinc-800",
  emerald: "text-emerald-400 bg-emerald-500/10",
  teal:    "text-teal-400 bg-teal-500/10",
  sky:     "text-sky-400 bg-sky-500/10",
  amber:   "text-amber-400 bg-amber-500/10",
  violet:  "text-violet-400 bg-violet-500/10",
};

<div className="rounded-xl bg-zinc-900 border border-zinc-800 p-4 hover:border-zinc-700 transition-colors">
  <div className="flex items-center justify-between mb-2.5">
    <span className="text-xs font-medium text-zinc-500 uppercase tracking-wider">{label}</span>
    <div className={`flex h-7 w-7 items-center justify-center rounded-lg ${accentMap[accent]}`}>
      {icon}
    </div>
  </div>
  <p className="text-3xl font-black text-white tabular-nums leading-none">{value}</p>
  {context && <p className="mt-1.5 text-xs text-zinc-600">{context}</p>}
</div>
```

---

### 1.4 StatusBadge

```typescript
interface StatusBadgeProps {
  status: LeadStatus | 'DRAFT' | 'APPROVED' | 'SENT' | 'REPLIED';
  size?: 'sm' | 'md';  // default: md
}
```

**Styling:**
```
● New           ○ Crawling      ◐ Analyzed
● Ready         ● Sent          ● Error
```

**Color Mapping:**
| Status | Dot | Text |
|--------|-----|------|
| NEW | bg-zinc-500 | text-zinc-400 |
| CRAWLED | bg-blue-500 | text-blue-400 |
| ANALYZED | bg-violet-500 | text-violet-400 |
| QUALIFIED | bg-emerald-500 | text-emerald-400 |
| SITE_GENERATED | bg-teal-500 | text-teal-400 |
| OUTREACH_DRAFT_READY | bg-sky-500 | text-sky-400 |
| SENT | bg-sky-600 | text-sky-500 |
| WON | bg-amber-500 | text-amber-400 |
| ERROR | bg-red-500 | text-red-400 |

**Required Classes:**
```tsx
const statusConfig = {
  NEW: { dot: "bg-zinc-500", text: "text-zinc-400" },
  CRAWLED: { dot: "bg-blue-500", text: "text-blue-400" },
  // ... etc
};

<span className={`inline-flex items-center gap-1.5 text-xs ${size === 'sm' ? 'text-[10px]' : ''}`}>
  <span className={`h-1.5 w-1.5 rounded-full ${config.dot}`} />
  <span className={config.text}>{LABELS[status]}</span>
</span>
```

---

### 1.5 ScorePill

```typescript
interface ScorePillProps {
  score: number;  // 0-100
  size?: 'sm' | 'md';  // default: md
  showLabel?: boolean; // CRIT/POOR/AVG/GOOD/EXCL
}
```

**Color Mapping:**
| Score | Text | Background | Border |
|-------|------|------------|--------|
| 0-30 | text-red-400 | bg-red-500/10 | border-red-500/20 |
| 31-50 | text-orange-400 | bg-orange-500/10 | border-orange-500/20 |
| 51-70 | text-amber-400 | bg-amber-500/10 | border-amber-500/20 |
| 71-85 | text-blue-400 | bg-blue-500/10 | border-blue-500/20 |
| 86-100 | text-emerald-400 | bg-emerald-500/10 | border-emerald-500/20 |

**Required Classes:**
```tsx
function getScoreClasses(score: number) {
  if (score >= 86) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
  if (score >= 71) return "text-blue-400 bg-blue-500/10 border-blue-500/20";
  if (score >= 51) return "text-amber-400 bg-amber-500/10 border-amber-500/20";
  if (score >= 31) return "text-orange-400 bg-orange-500/10 border-orange-500/20";
  return "text-red-400 bg-red-500/10 border-red-500/20";
}

<span className={`inline-flex items-center rounded-md border px-1.5 py-0.5 text-xs font-bold tabular-nums ${getScoreClasses(score)}`}>
  {score}
</span>
```

---

### 1.6 ScoreBlock

```typescript
interface ScoreBlockProps {
  score: number | null;
  size?: 'sm' | 'md' | 'lg';  // default: md
}
```

**Styling:**
```
┌─────────────┐
│     73      │  ← text-4xl font-black (md)
│   von 100   │  ← text-xs text-zinc-500
│    Gut      │  ← text-xs font-semibold (score color)
└─────────────┘
```

**Required Classes:**
```tsx
<div className={`flex flex-col items-center justify-center rounded-xl border px-6 py-4 min-w-[120px] ${
  score !== null ? scoreBg(score) : "bg-zinc-800/50 border-zinc-700"
}`}>
  {score !== null ? (
    <>
      <span className={`text-4xl font-black tabular-nums leading-none ${scoreColor(score)}`}>
        {Math.round(score)}
      </span>
      <span className="text-xs text-zinc-500 mt-1">von 100</span>
      <span className={`mt-2 text-xs font-semibold ${scoreColor(score)}`}>
        {scoreGrade(score)}
      </span>
    </>
  ) : (
    <>
      <span className="text-3xl font-black text-zinc-700">—</span>
      <span className="text-xs text-zinc-600 mt-1">Kein Score</span>
    </>
  )}
</div>
```

---

## 2. Action Components

### 2.1 PrimaryButton

```typescript
interface PrimaryButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  href?: string;        // Rendert als Link wenn vorhanden
  type?: 'button' | 'submit';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  size?: 'sm' | 'md';   // default: md
}
```

**Styling (VERBINDLICH):**
```
┌─────────────────────────────┐
│   [Icon] Label              │
└─────────────────────────────┘
```

**Required Classes:**
```tsx
const baseClasses = "inline-flex items-center gap-1.5 font-medium transition-colors";
const sizeClasses = size === 'sm' 
  ? "px-3 py-1.5 text-sm" 
  : "px-4 py-2 text-sm";
const stateClasses = disabled 
  ? "bg-zinc-800 text-zinc-600 cursor-not-allowed" 
  : "bg-white text-zinc-900 hover:bg-zinc-100";

// WICHTIG: Border Radius 0px (scharfe Kanten) für Primary!
<button className={`${baseClasses} ${sizeClasses} ${stateClasses}`}>
  {loading && <Spinner className="h-4 w-4" />}
  {!loading && icon}
  {children}
</button>
```

---

### 2.2 SecondaryButton

**Required Classes:**
```tsx
// Border Radius 8px für Secondary
<button className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 
                   text-zinc-300 px-3 py-1.5 text-sm font-medium
                   hover:bg-zinc-700 hover:text-white hover:border-zinc-600
                   disabled:opacity-50 disabled:cursor-not-allowed
                   transition-colors">
  {icon}
  {children}
</button>
```

---

### 2.3 GhostButton

**Required Classes:**
```tsx
<button className="inline-flex items-center gap-1 text-sm text-zinc-400 
                   hover:text-white transition-colors">
  {children}
  <ArrowRight className="h-3 w-3" />
</button>
```

---

### 2.4 ActionButton (Lead-Detail)

```typescript
interface ActionButtonProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  hint: string;
  primary?: boolean;    // Nächster Schritt
  disabled?: boolean;   // Voraussetzung nicht erfüllt
  done?: boolean;       // Bereits ausgeführt
}
```

**States:**
| State | Visual |
|-------|--------|
| Default | bg-zinc-800 text-zinc-300 border-zinc-700 |
| Primary | bg-white text-zinc-900 |
| Disabled | bg-zinc-800/50 text-zinc-700 border-zinc-800 |
| Done | bg-zinc-800/50 text-zinc-600 + Checkmark |

---

## 3. Data Components

### 3.1 DataTable

```typescript
interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  rowHeight?: 48 | 56;  // default: 56
  hover?: boolean;      // default: true
  onRowClick?: (row: T) => void;
}

interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  render?: (row: T) => React.ReactNode;
}
```

**Required Classes:**
```tsx
<div className="rounded-xl bg-zinc-900 border border-zinc-800 overflow-hidden">
  {/* Header */}
  <div className="grid grid-cols-[...] items-center gap-4 px-4 py-2.5 border-b border-zinc-800 bg-zinc-950/50">
    {columns.map(col => (
      <span key={col.key} className="text-xs font-medium text-zinc-600 uppercase tracking-wider">
        {col.header}
      </span>
    ))}
  </div>
  
  {/* Rows */}
  <div className="divide-y divide-zinc-800/60">
    {data.map(row => (
      <div key={row.id} className="grid grid-cols-[...] items-center gap-4 px-4 py-3 
                                  hover:bg-zinc-800/50 transition-colors">
        {columns.map(col => col.render ? col.render(row) : row[col.key])}
      </div>
    ))}
  </div>
</div>
```

---

### 3.2 EmptyState

```typescript
interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  action?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
  secondaryAction?: {
    label: string;
    href: string;
  };
}
```

**Required Classes:**
```tsx
<div className="flex flex-col items-center justify-center py-16 text-center">
  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-zinc-800 mb-3">
    {icon}
  </div>
  <p className="text-sm font-medium text-zinc-300">{title}</p>
  <p className="text-xs text-zinc-600 mt-1 max-w-xs">{description}</p>
  {action && (
    <Link href={action.href} className="mt-4 inline-flex items-center gap-1.5 
      text-sm font-medium text-white bg-zinc-800 hover:bg-zinc-700 
      px-4 py-2 rounded-lg transition-colors">
      {action.icon}
      {action.label}
    </Link>
  )}
</div>
```

---

### 3.3 InfoRow

```typescript
interface InfoRowProps {
  label: string;
  value: string | React.ReactNode;
  truncate?: boolean;
}
```

**Required Classes:**
```tsx
<div className="flex items-center justify-between gap-2">
  <span className="text-xs text-zinc-600 shrink-0">{label}</span>
  <span className={`text-xs font-medium text-zinc-300 text-right 
    ${truncate ? 'truncate' : ''}`}>{value}</span>
</div>
```

---

## 4. Feedback Components

### 4.1 AlertCard

```typescript
interface AlertCardProps {
  type: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: React.ReactNode;
  icon?: React.ReactNode;
}
```

**Color Mapping:**
| Type | Icon BG | Icon | Border | Background |
|------|---------|------|--------|------------|
| info | bg-blue-500/10 | text-blue-400 | border-blue-500/20 | bg-blue-500/5 |
| success | bg-emerald-500/10 | text-emerald-400 | border-emerald-500/20 | bg-emerald-500/5 |
| warning | bg-amber-500/10 | text-amber-400 | border-amber-500/20 | bg-amber-500/5 |
| error | bg-red-500/10 | text-red-400 | border-red-500/20 | bg-red-500/5 |

---

### 4.2 LoadingState

```typescript
interface LoadingStateProps {
  text: string;
  progress?: number;  // 0-100, zeigt ProgressBar wenn vorhanden
}
```

**Required Classes:**
```tsx
<div className="flex flex-col items-center justify-center py-8">
  <Spinner className="h-8 w-8 text-zinc-600 animate-spin mb-3" />
  <p className="text-sm text-zinc-400">{text}</p>
  {progress !== undefined && (
    <div className="w-48 h-1.5 bg-zinc-800 rounded-full mt-3 overflow-hidden">
      <div className="h-full bg-blue-500 rounded-full transition-all" style={{ width: `${progress}%` }} />
    </div>
  )}
</div>
```

---

## 5. Layout Components

### 5.1 PageHeader

```typescript
interface PageHeaderProps {
  title: string;
  subtitle?: string;
  action?: {
    label: string;
    href: string;
    icon?: React.ReactNode;
  };
}
```

**Required Classes:**
```tsx
<div className="flex items-start justify-between">
  <div>
    <h1 className="text-xl font-semibold text-white tracking-tight">{title}</h1>
    {subtitle && <p className="text-sm text-zinc-500 mt-0.5">{subtitle}</p>}
  </div>
  {action && (
    <Link href={action.href} className="inline-flex items-center gap-1.5 
      rounded-lg bg-white text-zinc-900 px-3 py-1.5 text-sm font-medium 
      hover:bg-zinc-100 transition-colors">
      {action.icon}
      {action.label}
    </Link>
  )}
</div>
```

---

### 5.2 SectionHeader

```typescript
interface SectionHeaderProps {
  title: string;
  count?: number;
  icon?: React.ReactNode;
  accent?: 'default' | 'amber' | 'emerald' | 'sky';
}
```

**Required Classes:**
```tsx
<div className="flex items-center gap-2 mb-3">
  {icon && <Icon className={`h-4 w-4 ${accentColor}`} />}
  <h2 className="text-sm font-semibold text-white">{title}</h2>
  {count !== undefined && (
    <span className={`rounded-full text-xs font-semibold px-2 py-0.5 ${badgeClasses}`}>
      {count}
    </span>
  )}
</div>
```

---

## 6. Specialized Components

### 6.1 ProgressBar

```typescript
interface ProgressBarProps {
  value: number;        // 0-100
  max?: number;         // default: 100
  size?: 'sm' | 'md';   // default: md
  color?: string;       // Tailwind color class
  showLabel?: boolean;
}
```

**Required Classes:**
```tsx
<div className="flex-1 h-4 bg-zinc-800 rounded-full overflow-hidden">
  <div 
    className={`h-full rounded-full ${color} opacity-70`}
    style={{ width: `${Math.max((value/max)*100, value > 0 ? 3 : 0)}%` }}
  />
</div>
```

---

### 6.2 FilterChip

```typescript
interface FilterChipProps {
  label: string;
  count: number;
  active: boolean;
  href: string;
  accent?: 'default' | 'amber' | 'emerald' | 'teal' | 'sky';
  dot?: boolean;        // Pulsierender Dot
}
```

**Required Classes:**
```tsx
<Link href={href} className={`flex items-center gap-1.5 rounded-full border px-3 py-1 
  text-xs font-medium transition-colors ${
    active 
      ? (accentActiveStyle || "text-white border-zinc-600 bg-zinc-800")
      : (accentStyle || "text-zinc-400 border-zinc-800 bg-zinc-900 hover:border-zinc-700")
  }`}>
  {dot && <span className={`h-1.5 w-1.5 rounded-full ${active ? 'bg-amber-400 animate-pulse' : 'bg-amber-500/60'}`} />}
  {label}
  <span className={`tabular-nums ${active ? 'opacity-80' : 'opacity-60'}`}>{count}</span>
</Link>
```

---

### 6.3 InitialsAvatar

```typescript
interface InitialsAvatarProps {
  name: string;
  size?: 'sm' | 'md' | 'lg';  // default: md
  showIndicator?: boolean;     // z.B. Action-Needed Dot
}
```

**Required Classes:**
```tsx
<div className={`relative flex items-center justify-center rounded-lg bg-zinc-800 
  border border-zinc-700 font-bold text-zinc-400 ${sizeClasses}`}>
  {getInitials(name)}
  {showIndicator && (
    <span className="absolute -top-0.5 -right-0.5 h-2 w-2 rounded-full bg-amber-400 border border-zinc-900" />
  )}
</div>
```

---

## Component Usage Matrix

| Page | Components Used |
|------|-----------------|
| Dashboard | PageHeader, MetricCard, AlertCard, ProgressBar, ListCard, EmptyState |
| Leads | PageHeader, FilterChip, DataTable, EmptyState, ScorePill, StatusBadge, InitialsAvatar |
| Lead-Detail | PageHeader, ScoreBlock, ActionButton, DataCard, InfoRow, ScoreGrid, AlertCard, Timeline |
| Outreach | PageHeader, MiniKpi, Stepper, SectionCard, ActionList, DataTable |
| Templates | PageHeader, AlertCard, GridCard, ListRow |
| Settings | PageHeader, DataCard, DataTable, StatusBadge, GridCard |

---

*Diese Contracts sind verbindlich. Änderungen erfordern Design-System-Update und Team-Review.*
