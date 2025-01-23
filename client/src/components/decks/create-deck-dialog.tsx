import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import type { InsertDeck } from "@db/schema";

interface CreateDeckDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateDeckDialog({ open, onOpenChange }: CreateDeckDialogProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const createDeckMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch("/api/decks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
        }),
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/decks"] });
      onOpenChange(false);
      setName("");
      setDescription("");
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Deck</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <Input
            placeholder="Deck name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          
          <Textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          
          <Button
            className="w-full"
            onClick={() => createDeckMutation.mutate()}
            disabled={!name}
          >
            Create Deck
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
