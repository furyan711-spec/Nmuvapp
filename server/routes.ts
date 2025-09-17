import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateKeywords } from "./services/anthropic";
import { analyzeTrends } from "./services/trends";
import { generateContentForIdeas } from "./services/content";
import { insertBusinessSchema } from "@shared/schema";
import { z } from "zod";

const generateKeywordsSchema = z.object({
  businessName: z.string().min(1),
  businessType: z.string().min(1),
  ukCity: z.string().min(1),
  industry: z.string().min(1),
  targetAudience: z.string().min(1),
  servicesOffered: z.string().min(1),
});

const analyzeTrendsSchema = z.object({
  businessData: generateKeywordsSchema,
  keywords: z.array(z.string()).min(1),
});

const generatePostsSchema = z.object({
  analysisId: z.string(),
  businessData: generateKeywordsSchema,
  selectedIdeas: z.array(z.string()).min(1),
  selectedPlatforms: z.array(z.string()).min(1),
});

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Generate keywords endpoint
  app.post("/api/generate-keywords", async (req, res) => {
    try {
      const businessData = generateKeywordsSchema.parse(req.body);
      
      // Store business data
      const business = await storage.createBusiness(businessData);
      
      // Generate keywords using AI
      const keywords = await generateKeywords(businessData);
      
      res.json({
        businessId: business.id,
        keywords,
        success: true
      });
    } catch (error) {
      console.error("Error generating keywords:", error);
      res.status(500).json({
        error: "Failed to generate keywords",
        message: error instanceof Error ? error.message : "Unknown error",
        success: false
      });
    }
  });

  // Analyze trends endpoint
  app.post("/api/analyze-trends", async (req, res) => {
    try {
      const { businessData, keywords } = analyzeTrendsSchema.parse(req.body);
      
      // Check for cached analysis
      const cachedAnalysis = await storage.getLatestTrendAnalysisByKeywords(keywords);
      if (cachedAnalysis) {
        return res.json({
          analysisId: cachedAnalysis.id,
          ...cachedAnalysis,
          cached: true,
          success: true
        });
      }

      // Perform fresh analysis
      const trendData = await analyzeTrends(businessData, keywords);
      
      // Store analysis results
      const business = await storage.createBusiness(businessData);
      const analysis = await storage.createTrendAnalysis({
        businessId: business.id,
        keywords,
        googleTrends: trendData.googleTrends,
        xcomTrends: trendData.xcomTrends,
        redditDiscussions: trendData.redditDiscussions,
        bbcArticles: trendData.bbcArticles,
        postIdeas: trendData.postIdeas,
        processingTime: trendData.processingTime,
        cached: false
      });

      res.json({
        analysisId: analysis.id,
        ...trendData,
        success: true
      });
    } catch (error) {
      console.error("Error analyzing trends:", error);
      res.status(500).json({
        error: "Failed to analyze trends",
        message: error instanceof Error ? error.message : "Unknown error",
        success: false
      });
    }
  });

  // Generate posts endpoint
  app.post("/api/generate-posts", async (req, res) => {
    try {
      const { analysisId, businessData, selectedIdeas, selectedPlatforms } = generatePostsSchema.parse(req.body);
      
      // Get analysis data
      const analysis = await storage.getTrendAnalysis(analysisId);
      if (!analysis) {
        return res.status(404).json({
          error: "Analysis not found",
          success: false
        });
      }

      // Generate content for selected ideas and platforms
      const content = await generateContentForIdeas(
        analysisId,
        businessData,
        selectedIdeas,
        selectedPlatforms,
        analysis.postIdeas as any[]
      );

      res.json({
        content,
        success: true
      });
    } catch (error) {
      console.error("Error generating posts:", error);
      res.status(500).json({
        error: "Failed to generate posts",
        message: error instanceof Error ? error.message : "Unknown error",
        success: false
      });
    }
  });

  // Get analysis status endpoint
  app.get("/api/analysis/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const analysis = await storage.getTrendAnalysis(id);
      
      if (!analysis) {
        return res.status(404).json({
          error: "Analysis not found",
          success: false
        });
      }

      res.json({
        analysis,
        success: true
      });
    } catch (error) {
      console.error("Error getting analysis:", error);
      res.status(500).json({
        error: "Failed to get analysis",
        message: error instanceof Error ? error.message : "Unknown error",
        success: false
      });
    }
  });

  // Get generated content endpoint
  app.get("/api/content/:analysisId", async (req, res) => {
    try {
      const { analysisId } = req.params;
      const content = await storage.getGeneratedContentByAnalysis(analysisId);
      
      res.json({
        content,
        success: true
      });
    } catch (error) {
      console.error("Error getting content:", error);
      res.status(500).json({
        error: "Failed to get content",
        message: error instanceof Error ? error.message : "Unknown error",
        success: false
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
