import type { Card, Deck, InsertCard, InsertDeck } from "@db/schema";

export async function createDeck(deck: InsertDeck): Promise<Deck> {
  const res = await fetch("/api/decks", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(deck),
  });
  return res.json();
}

export async function createCard(card: InsertCard): Promise<Card> {
  const res = await fetch("/api/cards", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(card),
  });
  return res.json();
}

export async function updateCard(id: number, updates: Partial<Card>): Promise<Card> {
  const res = await fetch(`/api/cards/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updates),
  });
  return res.json();
}
