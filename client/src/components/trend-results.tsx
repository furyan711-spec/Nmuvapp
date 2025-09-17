import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BusinessData, TrendAnalysis, PostIdea, GeneratedContent, PLATFORMS } from "@/types/api";
import { Globe, Twitter, MessageCircle, Newspaper, Wand2, Check } from "lucide-react";

interface TrendResultsProps {
  analysisData: TrendAnalysis;
  businessData: BusinessData;
  onContentGenerated: (content: GeneratedContent) => void;
}

export function TrendResults({ analysisData, businessData, onContentGenerated }: TrendResultsProps) {
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<string[]>(["twitter", "instagram"]);
  const { toast } = useToast();

  const generateContentMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/generate-posts", {
        analysisId: analysisData.analysisId,
        businessData,
        selectedIdeas,
        selectedPlatforms,
      });
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Content Generated",
          description: `Created content for ${selectedIdeas.length} ideas across ${selectedPlatforms.length} platforms`,
        });
        onContentGenerated(result.content);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to generate content",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate content. Please try again.",
        variant: "destructive",
      });
    },
  });

  const toggleIdea = (ideaId: string) => {
    setSelectedIdeas(prev =>
      prev.includes(ideaId)
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId]
    );
  };

  const togglePlatform = (platformId: string) => {
    setSelectedPlatforms(prev =>
      prev.includes(platformId)
        ? prev.filter(id => id !== platformId)
        : [...prev, platformId]
    );
  };

  const getScoreColor = (score: number) => {
    if (score >= 0.8) return "bg-green-100 text-green-800";
    if (score >= 0.6) return "bg-yellow-100 text-yellow-800";
    return "bg-blue-100 text-blue-800";
  };

  return (
    <div className="space-y-6">
      {/* Trend Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-semibold text-foreground">Trending Topics Found</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Globe className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">Google Trends</span>
              </div>
              <p className="text-2xl font-bold text-green-600" data-testid="google-trends-count">
                {analysisData.googleTrends?.length || 0}
              </p>
              <p className="text-xs text-green-600">suggestions</p>
            </div>
            
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Twitter className="w-4 h-4 text-blue-600" />
                <span className="text-sm font-medium text-blue-800">X.com Trends</span>
              </div>
              <p className="text-2xl font-bold text-blue-600" data-testid="xcom-trends-count">
                {analysisData.xcomTrends?.length || 0}
              </p>
              <p className="text-xs text-blue-600">hashtags</p>
            </div>
            
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <MessageCircle className="w-4 h-4 text-orange-600" />
                <span className="text-sm font-medium text-orange-800">Reddit UK</span>
              </div>
              <p className="text-2xl font-bold text-orange-600" data-testid="reddit-discussions-count">
                {analysisData.redditDiscussions?.length || 0}
              </p>
              <p className="text-xs text-orange-600">discussions</p>
            </div>
            
            <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Newspaper className="w-4 h-4 text-purple-600" />
                <span className="text-sm font-medium text-purple-800">BBC News</span>
              </div>
              <p className="text-2xl font-bold text-purple-600" data-testid="bbc-articles-count">
                {analysisData.bbcArticles?.length || 0}
              </p>
              <p className="text-xs text-purple-600">articles</p>
            </div>
          </div>

          <div className="bg-muted/30 p-4 rounded-lg">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Processing completed in:</span>
              <span className="font-medium text-foreground">
                {analysisData.processingTime?.toFixed(1) || 0} seconds
              </span>
            </div>
            <div className="flex items-center justify-between text-sm mt-1">
              <span className="text-muted-foreground">Cache status:</span>
              <span className="font-medium text-foreground">
                {analysisData.cached ? "Cached data" : "Fresh data"}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Post Ideas Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Content Ideas</CardTitle>
          <p className="text-sm text-muted-foreground">
            Select the ideas you'd like to create content for. Each idea is connected to current trending topics.
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6" data-testid="post-ideas-grid">
            {analysisData.postIdeas?.map((idea: PostIdea) => (
              <div
                key={idea.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                  selectedIdeas.includes(idea.id) ? 'bg-accent border-primary' : ''
                }`}
                onClick={() => toggleIdea(idea.id)}
                data-testid={`post-idea-${idea.id}`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h4 className="font-medium text-foreground mb-2">{idea.concept}</h4>
                    <p className="text-sm text-muted-foreground mb-2">{idea.trendSource}</p>
                    <div className="flex items-center space-x-2">
                      <div className={`px-2 py-1 text-xs rounded-full font-medium ${getScoreColor(idea.relevanceScore)}`}>
                        {idea.relevanceScore.toFixed(1)} relevance
                      </div>
                    </div>
                  </div>
                  <div className="w-5 h-5 border-2 border-primary rounded-md flex items-center justify-center">
                    {selectedIdeas.includes(idea.id) && <Check className="w-3 h-3 text-primary" />}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Platform Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg font-semibold text-foreground">Choose Platforms</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {PLATFORMS.map((platform) => (
              <div
                key={platform.id}
                className={`flex items-center space-x-2 p-3 border rounded-lg cursor-pointer transition-colors hover:bg-accent ${
                  selectedPlatforms.includes(platform.id) ? 'bg-accent border-primary' : ''
                }`}
                onClick={() => togglePlatform(platform.id)}
                data-testid={`platform-${platform.id}`}
              >
                <div className={`w-6 h-6 ${platform.color} rounded text-white flex items-center justify-center text-xs font-bold`}>
                  {platform.id === 'twitter' && <Twitter className="w-4 h-4" />}
                  {platform.id === 'instagram' && <span>IG</span>}
                  {platform.id === 'facebook' && <span>FB</span>}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-foreground">{platform.name}</div>
                  <div className="text-sm text-muted-foreground">{platform.description}</div>
                </div>
                <div className="w-5 h-5 border-2 border-primary rounded-md flex items-center justify-center">
                  {selectedPlatforms.includes(platform.id) && <Check className="w-3 h-3 text-primary" />}
                </div>
              </div>
            ))}
          </div>
          
          <Button
            onClick={() => generateContentMutation.mutate()}
            className="w-full"
            disabled={generateContentMutation.isPending || selectedIdeas.length === 0 || selectedPlatforms.length === 0}
            data-testid="button-generate-content"
          >
            <Wand2 className="w-4 h-4 mr-2" />
            {generateContentMutation.isPending ? "Generating Content..." : "Generate Content"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
