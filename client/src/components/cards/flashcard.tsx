import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Card as CardType } from "@db/schema";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";

interface FlashcardProps {
  card: CardType;
  onReview?: (isKnown: boolean) => void;
}

export function Flashcard({ card, onReview }: FlashcardProps) {
  const [isFlipped, setIsFlipped] = useState(false);

  const toggleKnownMutation = useMutation({
    mutationFn: async (isKnown: boolean) => {
      const res = await fetch(`/api/cards/${card.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isKnown }),
      });
      return res.json();
    },
    onSuccess: (data) => {
      // Invalidate both the cards query for the specific deck and the general decks query
      queryClient.invalidateQueries({ queryKey: [`/api/decks/${card.deckId}/cards`] });
      queryClient.invalidateQueries({ queryKey: ["/api/decks"] });
      onReview?.(data.isKnown);
      // Auto flip the card back after marking
      setIsFlipped(false);
    },
  });

  const cardBorderClass = card.isKnown ? "border-green-500" : "";

  return (
    <div 
      className={`flip-card h-[200px] ${isFlipped ? 'flipped' : ''}`}
      onClick={() => setIsFlipped(!isFlipped)}
    >
      <div className="flip-card-inner">
        <Card className={`flip-card-front p-6 ${cardBorderClass}`}>
          <div className="text-lg font-medium">{card.front}</div>
        </Card>

        <Card className={`flip-card-back p-6 ${cardBorderClass}`}>
          <div className="h-full flex flex-col justify-between">
            <div className="text-lg">{card.back}</div>
            <Button
              onClick={(e) => {
                e.stopPropagation();
                toggleKnownMutation.mutate(!card.isKnown);
              }}
            >
              {card.isKnown ? "Mark as Unknown" : "Mark as Known"}
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}