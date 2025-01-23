import { useQuery } from "@tanstack/react-query";
import { useParams } from "wouter";
import { CardList } from "@/components/cards/card-list";
import { ProgressStats } from "@/components/stats/progress-stats";
import type { Card, Deck } from "@db/schema";
import { AlertCircle } from "lucide-react";

interface SharedDeckResponse extends Deck {
  cards: Card[];
}

export default function SharedDeck() {
  const { shareId } = useParams();

  const { data: deck, isError, isLoading } = useQuery<SharedDeckResponse>({
    queryKey: [`/api/shared/${shareId}`],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <p className="text-muted-foreground">Loading shared deck...</p>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-5 w-5" />
            <p>This deck doesn't exist or is no longer shared.</p>
          </div>
        </div>
      </div>
    );
  }

  if (!deck) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-4xl font-bold">{deck.name}</h1>
          {deck.description && (
            <p className="mt-2 text-muted-foreground">{deck.description}</p>
          )}
        </div>

        <div className="space-y-6">
          <ProgressStats cards={deck.cards} />
          <CardList cards={deck.cards} />
        </div>
      </div>
    </div>
  );
}