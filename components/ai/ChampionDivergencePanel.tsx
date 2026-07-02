import { Card, CardBody, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Table, THead, TBody, TR, TH, TD } from '@/components/ui/Table';
import type { ChampionDivergence, ChampionTeamDelta } from '@/types/api';

// Phase 3 §2: NVIDIA vs Qwen ranking divergence. Rendered only when
// `divergence.computable === true` (mock mode / old runs are always false, and
// the caller hides this panel then). Larger rank gaps are emphasised.
export function ChampionDivergencePanel({ divergence }: { divergence: ChampionDivergence }) {
  const rows = [...divergence.teamDeltas].sort(
    (a, b) => (b.rankDelta ?? -1) - (a.rankDelta ?? -1),
  );

  return (
    <Card data-testid="champion-divergence">
      <CardHeader>
        <CardTitle>模型分歧（NVIDIA vs Qwen）</CardTitle>
      </CardHeader>
      <CardBody className="flex flex-col gap-4">
        {divergence.summary && (
          <p className="text-sm leading-relaxed text-slate-700">{divergence.summary}</p>
        )}

        {rows.length > 0 && (
          <div className="rounded-lg border border-slate-200">
            <Table>
              <THead>
                <TR>
                  <TH>球隊</TH>
                  <TH className="text-center">NVIDIA 名次</TH>
                  <TH className="text-center">Qwen 名次</TH>
                  <TH className="text-center">名次差</TH>
                </TR>
              </THead>
              <TBody>
                {rows.map((delta) => (
                  <DeltaRow key={delta.teamName} delta={delta} />
                ))}
              </TBody>
            </Table>
          </div>
        )}
      </CardBody>
    </Card>
  );
}

function rankText(rank?: number | null): string {
  return rank == null ? '—' : `#${rank}`;
}

// Colour the gap: 0 gray, 1-2 amber, 3+ red (bigger disagreement = louder).
function deltaTone(delta?: number | null): 'neutral' | 'warning' | 'danger' {
  if (delta == null) return 'neutral';
  if (delta >= 3) return 'danger';
  if (delta >= 1) return 'warning';
  return 'neutral';
}

function DeltaRow({ delta }: { delta: ChampionTeamDelta }) {
  const bothRanked = delta.nvidiaRank != null && delta.qwenRank != null;
  return (
    <TR>
      <TD className="font-medium text-slate-900">{delta.teamName}</TD>
      <TD className="text-center">{rankText(delta.nvidiaRank)}</TD>
      <TD className="text-center">{rankText(delta.qwenRank)}</TD>
      <TD className="text-center">
        {bothRanked && delta.rankDelta != null ? (
          <Badge tone={deltaTone(delta.rankDelta)}>{delta.rankDelta}</Badge>
        ) : (
          <span className="text-xs text-slate-400">單邊</span>
        )}
      </TD>
    </TR>
  );
}
