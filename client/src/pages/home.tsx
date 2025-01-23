import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { CardList } from "@/components/cards/card-list";
import { ClassicCardList } from "@/components/cards/classic-card-list";
import { CreateCardDialog } from "@/components/cards/create-card-dialog";
import { CreateDeckDialog } from "@/components/decks/create-deck-dialog";
import { ShareDeckDialog } from "@/components/decks/share-deck-dialog";
import { ProgressStats } from "@/components/stats/progress-stats";
import { StudyStats } from "@/components/stats/study-stats";
import type { Card, Deck } from "@db/schema";
import { Plus, Share2, ChevronDown, ChevronUp, PanelLeftClose, PanelLeft, LayoutGrid, Layers } from "lucide-react";

export default function Home() {
  const [selectedDeck, setSelectedDeck] = useState<Deck | null>(null);
  const [isCreateCardDialogOpen, setIsCreateCardDialogOpen] = useState(false);
  const [isCreateDeckDialogOpen, setIsCreateDeckDialogOpen] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [isDecksCollapsed, setIsDecksCollapsed] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'classic'>('grid');

  const { data: decks } = useQuery<(Deck & { cards: Card[] })[]>({
    queryKey: ["/api/decks"],
  });

  const { data: cards } = useQuery<Card[]>({
    queryKey: [`/api/decks/${selectedDeck?.id}/cards`],
    enabled: !!selectedDeck,
  });

  const isDeckCompleted = (deck: Deck & { cards: Card[] }) => {
    return deck.cards.length > 0 && deck.cards.every(card => card.isKnown);
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="h-full flex">
        {/* Sidebar */}
        <div className={`bg-muted/50 p-8 transition-all duration-300 ${isDecksCollapsed ? 'w-[72px]' : 'w-[332px]'}`}>
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              {!isDecksCollapsed && <h2 className="text-xl font-semibold">Decks</h2>}
              <Button
                size="icon"
                variant="ghost"
                onClick={() => setIsDecksCollapsed(!isDecksCollapsed)}
                className="shrink-0"
              >
                {isDecksCollapsed ? <PanelLeft className="h-4 w-4" /> : <PanelLeftClose className="h-4 w-4" />}
              </Button>
            </div>

            {!isDecksCollapsed && (
              <div className="space-y-2">
                <Button
                  onClick={() => setIsCreateDeckDialogOpen(true)}
                  variant="outline"
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  New Deck
                </Button>

                {decks?.map((deck) => (
                  <div key={deck.id} className="flex gap-2">
                    <Button
                      variant={selectedDeck?.id === deck.id ? "default" : "outline"}
                      className={`flex-1 justify-start ${isDeckCompleted(deck) ? 'border-green-500' : ''}`}
                      onClick={() => setSelectedDeck(deck)}
                    >
                      {deck.name}
                    </Button>
                    {selectedDeck?.id === deck.id && (
                      <Button
                        size="icon"
                        variant="outline"
                        onClick={() => setIsShareDialogOpen(true)}
                      >
                        <Share2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {!decks?.length && (
                  <p className="text-sm text-muted-foreground">
                    No decks yet. Create your first deck to get started!
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 space-y-8">
          <div className="flex justify-end">
            <Button 
              onClick={() => setIsCreateCardDialogOpen(true)}
              disabled={!selectedDeck}
            >
              Add Card
            </Button>
          </div>

          <div className="space-y-6">
            {selectedDeck && (
              <>
                <div className="space-y-2">
                  <h1 className="text-3xl font-bold">{selectedDeck.name}</h1>
                  {selectedDeck.description && (
                    <p className="text-muted-foreground">{selectedDeck.description}</p>
                  )}
                </div>

                <div className="flex justify-between items-center">
                  <Button
                    variant="outline"
                    className="w-[200px]"
                    onClick={() => setShowStats(!showStats)}
                  >
                    {showStats ? (
                      <ChevronUp className="h-4 w-4 mr-2" />
                    ) : (
                      <ChevronDown className="h-4 w-4 mr-2" />
                    )}
                    {showStats ? "Hide Stats" : "Show Stats"}
                  </Button>

                  <div className="flex gap-2">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('grid')}
                    >
                      <LayoutGrid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'classic' ? 'default' : 'outline'}
                      size="icon"
                      onClick={() => setViewMode('classic')}
                    >
                      <Layers className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className={`space-y-6 transition-all duration-300 ease-in-out ${
                  showStats ? 'max-h-[1000px]' : 'max-h-0 overflow-hidden'
                }`}>
                  <ProgressStats cards={cards || []} />
                  {selectedDeck && <StudyStats deckId={selectedDeck.id} />}
                </div>

                {viewMode === 'grid' ? (
                  <CardList cards={cards || []} deckId={selectedDeck.id} />
                ) : (
                  <ClassicCardList cards={cards || []} deckId={selectedDeck.id} />
                )}
              </>
            )}
          </div>
        </div>
      </div>

      <CreateCardDialog
        open={isCreateCardDialogOpen}
        onOpenChange={setIsCreateCardDialogOpen}
        decks={decks || []}
      />

      <CreateDeckDialog
        open={isCreateDeckDialogOpen}
        onOpenChange={setIsCreateDeckDialogOpen}
      />

      {selectedDeck && (
        <ShareDeckDialog
          deck={selectedDeck}
          open={isShareDialogOpen}
          onOpenChange={setIsShareDialogOpen}
        />
      )}
    </div>
  );
}