import { Progress } from "@/components/ui/progress";
import type { Card } from "@db/schema";

interface ProgressStatsProps {
  cards: Card[];
}

export function ProgressStats({ cards }: ProgressStatsProps) {
  const totalCards = cards.length;
  const knownCards = cards.filter((card) => card.isKnown).length;
  const progressPercentage = totalCards > 0 ? (knownCards / totalCards) * 100 : 0;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <h3 className="font-medium">Progress</h3>
        <span className="text-sm text-muted-foreground">
          {knownCards} / {totalCards} cards known
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2" />
    </div>
  );
}
