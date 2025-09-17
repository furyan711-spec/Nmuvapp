import { generatePlatformContent } from './anthropic';
import { storage } from '../storage';

export async function generateContentForIdeas(
  analysisId: string,
  businessData: any,
  selectedIdeas: string[],
  selectedPlatforms: string[],
  postIdeas: any[]
): Promise<any> {
  const results: any = {};

  try {
    for (const ideaId of selectedIdeas) {
      const idea = postIdeas.find(p => p.id === ideaId);
      if (!idea) continue;

      results[ideaId] = {};

      for (const platform of selectedPlatforms) {
        try {
          const content = await generatePlatformContent(businessData, idea, platform);
          
          // Store in database
          await storage.createGeneratedContent({
            analysisId,
            ideaId,
            platform,
            content
          });

          results[ideaId][platform] = content;
        } catch (error) {
          console.error(`Error generating ${platform} content for ${ideaId}:`, error);
          results[ideaId][platform] = `Error generating content for ${platform}. Please try again.`;
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error generating content:', error);
    throw new Error('Failed to generate content. Please try again.');
  }
}
