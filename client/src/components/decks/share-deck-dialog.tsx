import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Share2, Copy, X } from "lucide-react";
import type { Deck } from "@db/schema";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface ShareDeckDialogProps {
  deck: Deck;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareDeckDialog({ deck, open, onOpenChange }: ShareDeckDialogProps) {
  const { toast } = useToast();
  const shareUrl = deck.shareId 
    ? `${window.location.origin}/shared/${deck.shareId}`
    : null;

  const shareMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/decks/${deck.id}/share`, {
        method: "POST",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/decks"] });
    },
  });

  const unshareMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch(`/api/decks/${deck.id}/unshare`, {
        method: "POST",
      });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/decks"] });
    },
  });

  const copyToClipboard = () => {
    if (shareUrl) {
      navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Copied to clipboard",
        description: "Share link has been copied to your clipboard",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Share Deck</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {deck.shareId ? (
            <>
              <div className="flex gap-2">
                <Input value={shareUrl || ""} readOnly />
                <Button size="icon" onClick={copyToClipboard}>
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
              <Button
                variant="destructive"
                className="w-full"
                onClick={() => unshareMutation.mutate()}
              >
                <X className="h-4 w-4 mr-2" />
                Stop Sharing
              </Button>
            </>
          ) : (
            <Button
              className="w-full"
              onClick={() => shareMutation.mutate()}
            >
              <Share2 className="h-4 w-4 mr-2" />
              Generate Share Link
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
