export interface BusinessData {
  businessName: string;
  businessType: string;
  ukCity: string;
  industry: string;
  targetAudience: string;
  servicesOffered: string;
  keywords: string[];
}

export interface PostIdea {
  id: string;
  concept: string;
  trend_source: string;
  relevance_score: number;
  selected?: boolean;
}

export interface TrendData {
  google_suggestions: string[];
  reddit_discussions: Array<{
    title: string;
    score: number;
    subreddit: string;
    url: string;
    comments: number;
  }>;
  bbc_articles: Array<{
    headline: string;
    url: string;
    relevance_score: number;
    description?: string;
  }>;
  xcom_trends: string[];
}

export interface AnalysisResult {
  business_data: BusinessData;
  trends_found: TrendData;
  post_ideas: PostIdea[];
  processing_time: string;
  cached: boolean;
  request_id: string;
}

export interface GeneratedContent {
  [ideaId: string]: {
    [platform: string]: string;
  };
}

export interface ContentGenerationResult {
  selected_ideas: string[];
  platforms: string[];
  generated_content: GeneratedContent;
}

export type AnalysisStep = 'input' | 'keywords' | 'analyzing' | 'results' | 'content';

export type Platform = 'twitter' | 'instagram' | 'facebook';
