import { businesses, trendAnalyses, generatedContent, type Business, type InsertBusiness, type TrendAnalysis, type InsertTrendAnalysis, type GeneratedContent, type InsertGeneratedContent } from "@shared/schema";
import { db } from "./db";
import { eq, sql } from "drizzle-orm";

export interface IStorage {
  createBusiness(business: InsertBusiness): Promise<Business>;
  getBusiness(id: string): Promise<Business | undefined>;
  createTrendAnalysis(analysis: InsertTrendAnalysis): Promise<TrendAnalysis>;
  getTrendAnalysis(id: string): Promise<TrendAnalysis | undefined>;
  createGeneratedContent(content: InsertGeneratedContent): Promise<GeneratedContent>;
  getGeneratedContentByAnalysis(analysisId: string): Promise<GeneratedContent[]>;
  getLatestTrendAnalysisByKeywords(keywords: string[]): Promise<TrendAnalysis | undefined>;
}

export class DatabaseStorage implements IStorage {
  async createBusiness(insertBusiness: InsertBusiness): Promise<Business> {
    const [business] = await db
      .insert(businesses)
      .values(insertBusiness)
      .returning();
    return business;
  }

  async getBusiness(id: string): Promise<Business | undefined> {
    const [business] = await db.select().from(businesses).where(eq(businesses.id, id));
    return business || undefined;
  }

  async createTrendAnalysis(insertAnalysis: InsertTrendAnalysis): Promise<TrendAnalysis> {
    const [analysis] = await db
      .insert(trendAnalyses)
      .values(insertAnalysis)
      .returning();
    return analysis;
  }

  async getTrendAnalysis(id: string): Promise<TrendAnalysis | undefined> {
    const [analysis] = await db.select().from(trendAnalyses).where(eq(trendAnalyses.id, id));
    return analysis || undefined;
  }

  async createGeneratedContent(insertContent: InsertGeneratedContent): Promise<GeneratedContent> {
    const [content] = await db
      .insert(generatedContent)
      .values(insertContent)
      .returning();
    return content;
  }

  async getGeneratedContentByAnalysis(analysisId: string): Promise<GeneratedContent[]> {
    return await db.select().from(generatedContent).where(eq(generatedContent.analysisId, analysisId));
  }

  async getLatestTrendAnalysisByKeywords(keywords: string[]): Promise<TrendAnalysis | undefined> {
    // Temporarily disable caching to avoid SQL issues - return null to force fresh analysis
    return undefined;
  }
}

export const storage = new DatabaseStorage();
