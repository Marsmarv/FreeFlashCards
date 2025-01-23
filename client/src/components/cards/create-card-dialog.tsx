import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { Deck } from "@db/schema";

interface CreateCardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  decks: Deck[];
}

export function CreateCardDialog({ open, onOpenChange, decks }: CreateCardDialogProps) {
  const [front, setFront] = useState("");
  const [back, setBack] = useState("");
  const [selectedDeck, setSelectedDeck] = useState<string>("");

  const createCardMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          deckId: parseInt(selectedDeck),
          front,
          back,
          isKnown: false,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/decks/${selectedDeck}/cards`] });
      onOpenChange(false);
      setFront("");
      setBack("");
      setSelectedDeck("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Flashcard</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Select value={selectedDeck} onValueChange={setSelectedDeck}>
            <SelectTrigger>
              <SelectValue placeholder="Select a deck" />
            </SelectTrigger>
            <SelectContent>
              {decks.map((deck) => (
                <SelectItem key={deck.id} value={deck.id.toString()}>
                  {deck.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Input
            placeholder="Front of card"
            value={front}
            onChange={(e) => setFront(e.target.value)}
          />
          
          <Textarea
            placeholder="Back of card"
            value={back}
            onChange={(e) => setBack(e.target.value)}
          />
          
          <Button
            className="w-full"
            onClick={() => createCardMutation.mutate()}
            disabled={!front || !back || !selectedDeck}
          >
            Create Card
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
