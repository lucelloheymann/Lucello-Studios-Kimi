import { cn } from "@/lib/utils";
import { scoreToHex, scoreToLabel } from "@/lib/utils";

interface ScoreRingProps {
  score: number | null;
  size?: "sm" | "md" | "lg";
  showLabel?: boolean;
  className?: string;
}

const SIZES = {
  sm: { svg: 48, stroke: 5, r: 19, fontSize: "text-xs" },
  md: { svg: 72, stroke: 6, r: 29, fontSize: "text-sm" },
  lg: { svg: 100, stroke: 7, r: 41, fontSize: "text-base" },
};

export function ScoreRing({
  score,
  size = "md",
  showLabel = false,
  className,
}: ScoreRingProps) {
  const { svg, stroke, r, fontSize } = SIZES[size];
  const circumference = 2 * Math.PI * r;
  const s = score ?? 0;
  const dashOffset = circumference - (s / 100) * circumference;
  const color = score !== null ? scoreToHex(s) : "#e5e7eb";
  const center = svg / 2;

  return (
    <div className={cn("flex flex-col items-center gap-1", className)}>
      <svg width={svg} height={svg} viewBox={`0 0 ${svg} ${svg}`}>
        {/* Track */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke="#f3f4f6"
          strokeWidth={stroke}
        />
        {/* Progress */}
        <circle
          cx={center}
          cy={center}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={dashOffset}
          transform={`rotate(-90 ${center} ${center})`}
          className="transition-all duration-500"
        />
        {/* Score Text */}
        <text
          x={center}
          y={center}
          textAnchor="middle"
          dominantBaseline="central"
          className={cn("font-bold fill-gray-900", fontSize)}
          style={{ fontFamily: "inherit" }}
        >
          {score !== null ? Math.round(s) : "—"}
        </text>
      </svg>
      {showLabel && score !== null && (
        <span className="text-xs text-muted-foreground">{scoreToLabel(s)}</span>
      )}
    </div>
  );
}
