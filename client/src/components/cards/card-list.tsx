import { useEffect, useState } from "react";
import { Flashcard } from "./flashcard";
import type { Card } from "@db/schema";
import { useMutation, useQueryClient } from "@tanstack/react-query";

interface CardListProps {
  cards: Card[];
  deckId: number;
}

export function CardList({ cards, deckId }: CardListProps) {
  const queryClient = useQueryClient();
  const [sessionId, setSessionId] = useState<number | null>(null);
  const [cardsReviewed, setCardsReviewed] = useState(new Set<number>());
  const [cardsLearned, setCardsLearned] = useState(new Set<number>());

  const startSessionMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/decks/${deckId}/start-session`, {
        method: "POST",
      });
      return res.json();
    },
    onSuccess: (data) => {
      setSessionId(data.id);
    },
  });

  const endSessionMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) return;
      const res = await fetch(`/api/study-sessions/${sessionId}/end`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cardsReviewed: cardsReviewed.size,
          cardsLearned: cardsLearned.size,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/decks/${deckId}/statistics`] });
    },
  });

  useEffect(() => {
    // Start a new session when the component mounts or deck changes
    startSessionMutation.mutate();

    // End the session when the component unmounts or deck changes
    return () => {
      if (sessionId) {
        endSessionMutation.mutate();
      }
    };
  }, [deckId]); // Reset session when deck changes

  const onCardReview = (cardId: number, isKnown: boolean) => {
    setCardsReviewed((prev) => {
      const newSet = new Set(prev);
      newSet.add(cardId);
      return newSet;
    });

    setCardsLearned((prev) => {
      const newSet = new Set(prev);
      if (isKnown) {
        newSet.add(cardId);
      } else {
        newSet.delete(cardId);
      }
      return newSet;
    });

    // End current session and start a new one to update statistics
    if (sessionId) {
      endSessionMutation.mutate();
      startSessionMutation.mutate();
    }
  };

  // Maintain original card order from the server
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      {[...cards].map((card) => (
        <Flashcard 
          key={card.id} 
          card={card} 
          onReview={(isKnown) => onCardReview(card.id, isKnown)}
        />
      ))}
    </div>
  );
}