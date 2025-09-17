export interface BusinessData {
  businessName: string;
  businessType: string;
  ukCity: string;
  industry: string;
  targetAudience: string;
  servicesOffered: string;
}

export interface TrendAnalysis {
  analysisId: string;
  googleTrends: any[];
  xcomTrends: any[];
  redditDiscussions: any[];
  bbcArticles: any[];
  postIdeas: PostIdea[];
  processingTime: number;
  cached: boolean;
}

export interface PostIdea {
  id: string;
  concept: string;
  trendSource: string;
  relevanceScore: number;
  reasoning: string;
}

export interface GeneratedContent {
  [ideaId: string]: {
    [platform: string]: string;
  };
}

export const UK_CITIES = [
  "London", "Manchester", "Birmingham", "Liverpool", "Leeds", "Sheffield", 
  "Bristol", "Newcastle", "Edinburgh", "Glasgow", "Cardiff", "Belfast", 
  "Brighton", "Cambridge", "Oxford", "Bath", "York", "Canterbury", 
  "Chester", "Exeter", "Nottingham", "Leicester", "Coventry"
];

export const BUSINESS_TYPES = [
  "Cafe", "Restaurant", "Pub", "Salon", "Barber", "Plumber", "Electrician",
  "Boutique", "Gym", "Dentist", "Veterinary", "Bookshop", "Bakery", 
  "Florist", "Garage", "Solicitor", "Accountant", "Estate Agent"
];

export const INDUSTRIES = [
  "Hospitality", "Retail", "Professional Services", "Health & Beauty", 
  "Technology", "Education", "Construction", "Finance", "Automotive",
  "Legal", "Healthcare", "Food & Beverage", "Personal Services"
];

export const PLATFORMS = [
  { id: "twitter", name: "Twitter", description: "280 characters", icon: "twitter", color: "bg-blue-500" },
  { id: "instagram", name: "Instagram", description: "Engaging captions", icon: "instagram", color: "bg-pink-500" },
  { id: "facebook", name: "Facebook", description: "Longer posts", icon: "facebook", color: "bg-blue-600" }
];
