import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, jsonb, real, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const businesses = pgTable("businesses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessName: text("business_name").notNull(),
  businessType: text("business_type").notNull(),
  ukCity: text("uk_city").notNull(),
  industry: text("industry").notNull(),
  targetAudience: text("target_audience").notNull(),
  servicesOffered: text("services_offered").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const trendAnalyses = pgTable("trend_analyses", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  businessId: varchar("business_id").references(() => businesses.id).notNull(),
  keywords: jsonb("keywords").$type<string[]>().notNull(),
  googleTrends: jsonb("google_trends").$type<any[]>().notNull(),
  xcomTrends: jsonb("xcom_trends").$type<any[]>().notNull(),
  redditDiscussions: jsonb("reddit_discussions").$type<any[]>().notNull(),
  bbcArticles: jsonb("bbc_articles").$type<any[]>().notNull(),
  postIdeas: jsonb("post_ideas").$type<any[]>().notNull(),
  processingTime: real("processing_time").notNull(),
  cached: boolean("cached").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const generatedContent = pgTable("generated_content", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  analysisId: varchar("analysis_id").references(() => trendAnalyses.id).notNull(),
  ideaId: text("idea_id").notNull(),
  platform: text("platform").notNull(),
  content: text("content").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertBusinessSchema = createInsertSchema(businesses).omit({
  id: true,
  createdAt: true,
});

export const insertTrendAnalysisSchema = createInsertSchema(trendAnalyses).omit({
  id: true,
  createdAt: true,
});

export const insertGeneratedContentSchema = createInsertSchema(generatedContent).omit({
  id: true,
  createdAt: true,
});

export type Business = typeof businesses.$inferSelect;
export type InsertBusiness = z.infer<typeof insertBusinessSchema>;
export type TrendAnalysis = typeof trendAnalyses.$inferSelect;
export type InsertTrendAnalysis = z.infer<typeof insertTrendAnalysisSchema>;
export type GeneratedContent = typeof generatedContent.$inferSelect;
export type InsertGeneratedContent = z.infer<typeof insertGeneratedContentSchema>;
