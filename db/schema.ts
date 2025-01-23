import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";

export const decks = pgTable("decks", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  shareId: text("share_id").unique(),
  isPublic: boolean("is_public").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cards = pgTable("cards", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id").references(() => decks.id).notNull(),
  front: text("front").notNull(),
  back: text("back").notNull(),
  isKnown: boolean("is_known").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastReviewed: timestamp("last_reviewed"),
});

export const studySessions = pgTable("study_sessions", {
  id: serial("id").primaryKey(),
  deckId: integer("deck_id").references(() => decks.id).notNull(),
  startTime: timestamp("start_time").defaultNow().notNull(),
  endTime: timestamp("end_time"),
  cardsReviewed: integer("cards_reviewed").default(0).notNull(),
  cardsLearned: integer("cards_learned").default(0).notNull(),
});

export const decksRelations = relations(decks, ({ many }) => ({
  cards: many(cards),
  studySessions: many(studySessions),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  deck: one(decks, {
    fields: [cards.deckId],
    references: [decks.id],
  }),
}));

export const studySessionsRelations = relations(studySessions, ({ one }) => ({
  deck: one(decks, {
    fields: [studySessions.deckId],
    references: [decks.id],
  }),
}));

export const insertDeckSchema = createInsertSchema(decks);
export const selectDeckSchema = createSelectSchema(decks);
export const insertCardSchema = createInsertSchema(cards);
export const selectCardSchema = createSelectSchema(cards);
export const insertStudySessionSchema = createInsertSchema(studySessions);
export const selectStudySessionSchema = createSelectSchema(studySessions);

export type Deck = typeof decks.$inferSelect;
export type InsertDeck = typeof decks.$inferInsert;
export type Card = typeof cards.$inferSelect;
export type InsertCard = typeof cards.$inferInsert;
export type StudySession = typeof studySessions.$inferSelect;
export type InsertStudySession = typeof studySessions.$inferInsert;