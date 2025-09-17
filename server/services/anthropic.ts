import Anthropic from '@anthropic-ai/sdk';

/*
The newest Anthropic model is "claude-sonnet-4-20250514", not "claude-3-7-sonnet-20250219", "claude-3-5-sonnet-20241022" nor "claude-3-sonnet-20240229". 
If the user doesn't specify a model, always prefer using "claude-sonnet-4-20250514" as it is the latest model.
*/

// <important_do_not_delete>
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
// </important_do_not_delete>

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || process.env.CLAUDE_API_KEY || process.env.AI_API_KEY,
});

export async function generateKeywords(businessData: {
  businessName: string;
  businessType: string;
  ukCity: string;
  industry: string;
  targetAudience: string;
  servicesOffered: string;
}): Promise<string[]> {
  // AI functionality disabled - generate basic keywords based on business data
  console.log('Generating basic keywords (AI disabled) for:', businessData.businessName);
  
  const basicKeywords = [
    businessData.businessType.toLowerCase(),
    `${businessData.ukCity.toLowerCase()} ${businessData.businessType.toLowerCase()}`,
    businessData.industry.toLowerCase(),
    'local business',
    'uk business',
    `${businessData.businessType.toLowerCase()} near me`,
    businessData.ukCity.toLowerCase(),
    `${businessData.industry.toLowerCase()} uk`
  ];
  
  // Remove duplicates and filter out empty strings
  const uniqueKeywords = [...new Set(basicKeywords.filter(k => k.trim().length > 0))];
  
  return uniqueKeywords;
}

export async function generatePostIdeas(
  businessData: any,
  trendData: {
    googleTrends: any[];
    xcomTrends: any[];
    redditDiscussions: any[];
    bbcArticles: any[];
  }
): Promise<any[]> {
  // AI functionality disabled - return basic template ideas based on trend data
  console.log('Generating basic post ideas (AI disabled) for:', businessData.businessName);
  
  const basicIdeas = [
    {
      id: "idea_1",
      concept: `Highlight ${businessData.businessName}'s unique ${businessData.businessType} offerings in ${businessData.ukCity}`,
      trendSource: "Local Business Focus",
      relevanceScore: 0.8,
      reasoning: "Showcasing local business strengths appeals to community-focused customers"
    },
    {
      id: "idea_2", 
      concept: `Share customer testimonials and success stories from ${businessData.targetAudience}`,
      trendSource: "Customer Engagement",
      relevanceScore: 0.7,
      reasoning: "Social proof helps build trust with potential customers"
    },
    {
      id: "idea_3",
      concept: `Showcase behind-the-scenes content of ${businessData.servicesOffered}`,
      trendSource: "Authenticity Trend",
      relevanceScore: 0.75,
      reasoning: "Transparency in business operations builds customer connection"
    }
  ];
  
  // Add trend-specific ideas if we have trend data
  if (trendData.googleTrends && trendData.googleTrends.length > 0) {
    basicIdeas.push({
      id: "idea_4",
      concept: `Create content around trending searches related to ${businessData.businessType}`,
      trendSource: "Google Trends",
      relevanceScore: 0.6,
      reasoning: "Leveraging search trends can increase visibility"
    });
  }
  
  if (trendData.bbcArticles && trendData.bbcArticles.length > 0) {
    basicIdeas.push({
      id: "idea_5",
      concept: `Share insights on how current UK news affects ${businessData.industry}`,
      trendSource: "BBC News",
      relevanceScore: 0.65,
      reasoning: "Connecting business to current events shows industry awareness"
    });
  }
  
  return basicIdeas;
}

export async function generatePlatformContent(
  businessData: any,
  idea: any,
  platform: string
): Promise<string> {
  // AI functionality disabled - return basic template content
  console.log('Generating basic platform content (AI disabled) for:', platform);
  
  const businessName = businessData.businessName;
  const city = businessData.ukCity;
  const businessType = businessData.businessType;
  
  const templates = {
    twitter: `🎯 ${idea.concept}\n\nVisit ${businessName} in ${city} for quality ${businessType} services!\n\n#${city} #${businessType.replace(' ', '')} #LocalBusiness #UK`,
    
    instagram: `✨ ${idea.concept} ✨\n\n📍 Located in ${city}\n🏢 Specializing in ${businessData.servicesOffered}\n👥 Perfect for ${businessData.targetAudience}\n\nCome and experience what makes ${businessName} special!\n\n#${city} #${businessType.replace(' ', '')} #LocalBusiness #UK #Quality #Service`,
    
    facebook: `${idea.concept}\n\nAt ${businessName}, we're proud to serve the ${city} community with our ${businessData.servicesOffered}. Our focus on ${businessData.targetAudience} means we understand what you need.\n\nWhy choose us?\n✓ Local ${city} business\n✓ Experienced in ${businessData.industry}\n✓ Committed to quality service\n\nVisit us today and see the difference! Contact us for more information.\n\n#${city}Business #${businessType} #LocalSupport`
  };
  
  return templates[platform as keyof typeof templates] || `Template content for ${platform}: ${idea.concept} - ${businessName} in ${city}`;
}
