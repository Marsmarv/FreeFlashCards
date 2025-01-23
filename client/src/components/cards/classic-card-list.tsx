import { useState, useEffect } from "react";
import { Flashcard } from "./flashcard";
import { Button } from "@/components/ui/button";
import { Shuffle } from "lucide-react";
import type { Card } from "@db/schema";

interface ClassicCardListProps {
  cards: Card[];
  deckId: number;
  onReview?: (cardId: number, isKnown: boolean) => void;
}

export function ClassicCardList({ cards, deckId, onReview }: ClassicCardListProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cardOrder, setCardOrder] = useState(() => cards.map((_, index) => index));

  // Update cardOrder when cards change
  useEffect(() => {
    setCardOrder(cards.map((_, index) => index));
  }, [cards.length]);

  const shuffleCards = () => {
    setCardOrder(prevOrder => {
      const newOrder = [...prevOrder];
      for (let i = newOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newOrder[i], newOrder[j]] = [newOrder[j], newOrder[i]];
      }
      return newOrder;
    });
    setCurrentIndex(0);
  };

  if (!cards.length) {
    return <p className="text-muted-foreground">No cards in this deck.</p>;
  }

  const currentCard = cards[cardOrder[currentIndex]];

  if (!currentCard) {
    return <p className="text-muted-foreground">No cards in this deck.</p>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          Card {currentIndex + 1} of {cards.length}
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={shuffleCards}
        >
          <Shuffle className="h-4 w-4 mr-2" />
          Shuffle
        </Button>
      </div>

      <div className="max-w-xl mx-auto">
        <Flashcard
          key={currentCard.id}
          card={currentCard}
          onReview={onReview}
        />
      </div>

      <div className="flex justify-between mt-4">
        <Button
          variant="outline"
          onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
        >
          Previous
        </Button>
        <Button
          onClick={() => setCurrentIndex(i => Math.min(cards.length - 1, i + 1))}
          disabled={currentIndex === cards.length - 1}
        >
          Next
        </Button>
      </div>
    </div>
  );
}
