import Link from 'next/link';
import { Card, CardBody } from '@/components/ui/Card';
import { TeamFlag } from '@/components/cards/TeamFlag';
import { ChampionRankBar } from '@/components/charts/ChampionRankBar';
import { routes } from '@/lib/routes';
import { teamName } from '@/lib/formatters';
import type { ChampionPredictionEntry } from '@/types/api';

export function ChampionEntryCard({ entry }: { entry: ChampionPredictionEntry }) {
  return (
    <Card>
      <CardBody className="flex items-center gap-4">
        <span className="w-8 text-center text-xl font-bold text-brand-700">#{entry.rank}</span>
        <Link href={routes.team(entry.team.id)} className="flex items-center gap-2">
          <TeamFlag team={entry.team} size={28} />
          <span className="font-semibold text-slate-900">{teamName(entry.team)}</span>
        </Link>
        <div className="ml-auto w-40">
          <ChampionRankBar score={entry.championScore} />
        </div>
      </CardBody>
    </Card>
  );
}
