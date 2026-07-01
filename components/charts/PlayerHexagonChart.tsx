import { cn } from '@/lib/utils';

export type HexAxis = { label: string; value?: number | null };

export type PlayerHexagonChartProps = {
  axes: HexAxis[]; // expects 6 axes
  max?: number;
  className?: string;
};

// Geometry in a fixed viewBox; CSS scales it. Pure SVG — no third-party chart lib
// (per 05_FRONTEND_AI_UI_REQUIREMENTS.md §Player Hexagon Chart).
const CX = 140;
const CY = 130;
const R = 90;
const RINGS = [0.34, 0.67, 1] as const;

function vertex(frac: number, i: number, count: number): [number, number] {
  const angle = (-90 + (360 / count) * i) * (Math.PI / 180);
  return [CX + R * frac * Math.cos(angle), CY + R * frac * Math.sin(angle)];
}

function polygonPoints(fracs: number[]): string {
  return fracs.map((frac, i) => vertex(frac, i, fracs.length).join(',')).join(' ');
}

export function PlayerHexagonChart({ axes, max = 100, className }: PlayerHexagonChartProps) {
  const count = axes.length;
  const clamp = (v?: number | null) => Math.max(0, Math.min(1, (v ?? 0) / max));
  const dataFracs = axes.map((a) => clamp(a.value));

  return (
    <svg
      viewBox="0 0 280 260"
      className={cn('h-auto w-full max-w-sm', className)}
      role="img"
      aria-label="球員六邊能力雷達圖"
      data-testid="player-hexagon"
    >
      {/* Grid rings */}
      {RINGS.map((ring) => (
        <polygon
          key={ring}
          points={polygonPoints(axes.map(() => ring))}
          className="fill-none stroke-slate-200"
          strokeWidth={1}
        />
      ))}

      {/* Axis spokes */}
      {axes.map((axis, i) => {
        const [x, y] = vertex(1, i, count);
        return (
          <line key={axis.label} x1={CX} y1={CY} x2={x} y2={y} className="stroke-slate-200" strokeWidth={1} />
        );
      })}

      {/* Data polygon */}
      <polygon
        points={polygonPoints(dataFracs)}
        className="fill-brand-500/25 stroke-brand-500"
        strokeWidth={2}
      />
      {dataFracs.map((frac, i) => {
        const [x, y] = vertex(frac, i, count);
        return <circle key={axes[i].label} cx={x} cy={y} r={3} className="fill-brand-600" />;
      })}

      {/* Axis labels + values just outside each tip */}
      {axes.map((axis, i) => {
        const [x, y] = vertex(1.22, i, count);
        const anchor = Math.abs(x - CX) < 6 ? 'middle' : x > CX ? 'start' : 'end';
        return (
          <text
            key={`label-${axis.label}`}
            x={x}
            y={y}
            textAnchor={anchor}
            dominantBaseline="middle"
            className="fill-slate-600 text-[11px]"
          >
            <tspan fontWeight={600}>{axis.label}</tspan>
            <tspan className="fill-slate-400" dx={4}>
              {axis.value ?? '—'}
            </tspan>
          </text>
        );
      })}
    </svg>
  );
}
