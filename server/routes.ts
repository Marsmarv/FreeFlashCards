import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { cards, decks, studySessions } from "@db/schema";
import { eq, asc } from "drizzle-orm";
import { nanoid } from "nanoid";

export function registerRoutes(app: Express): Server {
  app.get("/api/decks", async (_req, res) => {
    const allDecks = await db.query.decks.findMany({
      with: {
        cards: true,
      },
    });
    res.json(allDecks);
  });

  app.post("/api/decks", async (req, res) => {
    const deck = await db.insert(decks).values(req.body).returning();
    res.json(deck[0]);
  });

  app.get("/api/decks/:id/cards", async (req, res) => {
    const deckCards = await db.query.cards.findMany({
      where: eq(cards.deckId, parseInt(req.params.id)),
      orderBy: [asc(cards.id)], // Ensure consistent ordering by ID
    });
    res.json(deckCards);
  });

  app.post("/api/cards", async (req, res) => {
    const card = await db.insert(cards).values(req.body).returning();
    res.json(card[0]);
  });

  app.patch("/api/cards/:id", async (req, res) => {
    const card = await db
      .update(cards)
      .set(req.body)
      .where(eq(cards.id, parseInt(req.params.id)))
      .returning();
    res.json(card[0]);
  });

  // Study session endpoints
  app.post("/api/decks/:id/start-session", async (req, res) => {
    const session = await db
      .insert(studySessions)
      .values({
        deckId: parseInt(req.params.id),
        startTime: new Date(),
      })
      .returning();
    res.json(session[0]);
  });

  app.patch("/api/study-sessions/:id/end", async (req, res) => {
    const { cardsReviewed, cardsLearned } = req.body;
    const session = await db
      .update(studySessions)
      .set({
        endTime: new Date(),
        cardsReviewed,
        cardsLearned,
      })
      .where(eq(studySessions.id, parseInt(req.params.id)))
      .returning();
    res.json(session[0]);
  });

  app.get("/api/decks/:id/statistics", async (req, res) => {
    const deckStats = await db.query.studySessions.findMany({
      where: eq(studySessions.deckId, parseInt(req.params.id)),
      orderBy: (studySessions, { desc }) => [desc(studySessions.startTime)],
    });
    res.json(deckStats);
  });

  // Share functionality endpoints
  app.post("/api/decks/:id/share", async (req, res) => {
    const shareId = nanoid(10);
    const deck = await db
      .update(decks)
      .set({ shareId, isPublic: true })
      .where(eq(decks.id, parseInt(req.params.id)))
      .returning();
    res.json(deck[0]);
  });

  app.post("/api/decks/:id/unshare", async (req, res) => {
    const deck = await db
      .update(decks)
      .set({ shareId: null, isPublic: false })
      .where(eq(decks.id, parseInt(req.params.id)))
      .returning();
    res.json(deck[0]);
  });

  app.get("/api/shared/:shareId", async (req, res) => {
    const sharedDeck = await db.query.decks.findFirst({
      where: eq(decks.shareId, req.params.shareId),
      with: {
        cards: true,
      },
    });

    if (!sharedDeck || !sharedDeck.isPublic) {
      return res.status(404).json({ message: "Deck not found" });
    }

    res.json(sharedDeck);
  });

  const httpServer = createServer(app);
  return httpServer;
}