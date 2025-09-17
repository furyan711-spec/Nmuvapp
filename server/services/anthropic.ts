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
  const prompt = `You are a UK marketing expert specializing in social media trends and content creation. Given the following business information, generate 6-8 highly relevant keywords that would be useful for trend analysis and social media content creation.

Business Details:
- Name: ${businessData.businessName}
- Type: ${businessData.businessType}
- Location: ${businessData.ukCity}, UK
- Industry: ${businessData.industry}
- Target Audience: ${businessData.targetAudience}
- Services: ${businessData.servicesOffered}

Generate keywords that are:
1. Relevant to the business and industry
2. Include location-specific terms when appropriate
3. Mix general industry terms with specific service offerings
4. Consider current UK market trends and consumer behavior
5. Include both broad and niche keywords

Return only a JSON array of keyword strings, no other text.`;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const keywords = JSON.parse(content.text);
      return Array.isArray(keywords) ? keywords : [];
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error generating keywords:', error);
    // Fallback keywords based on business type and location
    return [
      businessData.businessType.toLowerCase(),
      `${businessData.ukCity.toLowerCase()} ${businessData.businessType.toLowerCase()}`,
      businessData.industry.toLowerCase(),
      'local business',
      'uk business',
      `${businessData.businessType.toLowerCase()} near me`
    ];
  }
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
  const prompt = `You are a UK social media content strategist. Based on the business information and current trend data, generate 5-7 content ideas that connect trending topics to business opportunities.

Business: ${businessData.businessName} (${businessData.businessType}) in ${businessData.ukCity}
Industry: ${businessData.industry}
Target Audience: ${businessData.targetAudience}
Services: ${businessData.servicesOffered}

Current Trends:
Google Trends: ${JSON.stringify(trendData.googleTrends.slice(0, 5))}
X.com Trends: ${JSON.stringify(trendData.xcomTrends.slice(0, 5))}
Reddit Discussions: ${JSON.stringify(trendData.redditDiscussions.slice(0, 3))}
BBC Articles: ${JSON.stringify(trendData.bbcArticles.slice(0, 3))}

Generate content ideas that:
1. Connect current trends to the business naturally
2. Provide genuine value to the target audience
3. Are timely and relevant to UK market
4. Consider seasonal or cultural factors
5. Include a relevance score (0.1-1.0)

Return a JSON array with this structure:
[
  {
    "id": "idea_1",
    "concept": "Brief idea description",
    "trendSource": "Which trend/source inspired this",
    "relevanceScore": 0.8,
    "reasoning": "Why this connects trends to business"
  }
]`;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 2048,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      const ideas = JSON.parse(content.text);
      return Array.isArray(ideas) ? ideas : [];
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error generating post ideas:', error);
    return [];
  }
}

export async function generatePlatformContent(
  businessData: any,
  idea: any,
  platform: string
): Promise<string> {
  const platformSpecs = {
    twitter: 'Twitter: 280 characters max, engaging, uses relevant hashtags, conversational tone',
    instagram: 'Instagram: Longer caption with emojis, multiple hashtags, storytelling approach, line breaks for readability',
    facebook: 'Facebook: Longer form content, community-focused, detailed information, call-to-action'
  };

  const prompt = `Create ${platform} content for this business and idea:

Business: ${businessData.businessName} (${businessData.businessType}) in ${businessData.ukCity}
Target Audience: ${businessData.targetAudience}
Services: ${businessData.servicesOffered}

Content Idea: ${idea.concept}
Trend Connection: ${idea.trendSource}
Reasoning: ${idea.reasoning}

Platform Requirements: ${platformSpecs[platform as keyof typeof platformSpecs]}

Create engaging, authentic content that:
1. Connects the trend to the business naturally
2. Speaks directly to the target audience
3. Includes appropriate UK spelling and terminology
4. Maintains professional but approachable tone
5. Includes relevant hashtags and calls-to-action
6. Follows platform best practices

Return only the final content text, no explanations or quotes.`;

  try {
    const response = await anthropic.messages.create({
      model: DEFAULT_MODEL_STR,
      max_tokens: 1024,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content[0];
    if (content.type === 'text') {
      return content.text.trim();
    }
    
    throw new Error('Invalid response format');
  } catch (error) {
    console.error('Error generating platform content:', error);
    return `Error generating content for ${platform}. Please try again.`;
  }
}
