import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { GeneratedContent, TrendAnalysis, PLATFORMS } from "@/types/api";
import { RefreshCw, Copy, Twitter } from "lucide-react";

interface ContentResultsProps {
  content: GeneratedContent;
  analysisData: TrendAnalysis;
  onStartNewAnalysis: () => void;
}

export function ContentResults({ content, analysisData, onStartNewAnalysis }: ContentResultsProps) {
  const { toast } = useToast();

  const copyToClipboard = async (text: string, platform: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied to clipboard",
        description: `${platform} content copied successfully`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      });
    }
  };

  const getPlatformIcon = (platformId: string) => {
    switch (platformId) {
      case 'twitter':
        return <Twitter className="w-3 h-3" />;
      case 'instagram':
        return <span className="text-xs font-bold">IG</span>;
      case 'facebook':
        return <span className="text-xs font-bold">FB</span>;
      default:
        return null;
    }
  };

  const getPlatformColor = (platformId: string) => {
    switch (platformId) {
      case 'twitter':
        return 'bg-blue-50 text-blue-600 hover:bg-blue-100';
      case 'instagram':
        return 'bg-pink-50 text-pink-600 hover:bg-pink-100';
      case 'facebook':
        return 'bg-blue-50 text-blue-800 hover:bg-blue-100';
      default:
        return 'bg-gray-50 text-gray-600 hover:bg-gray-100';
    }
  };

  const getIdeaTitle = (ideaId: string) => {
    const idea = analysisData.postIdeas?.find((p: any) => p.id === ideaId);
    return idea?.concept || ideaId;
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl font-semibold text-foreground">Generated Content</CardTitle>
            <Button 
              onClick={onStartNewAnalysis} 
              variant="secondary"
              data-testid="button-new-analysis"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              New Analysis
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-8" data-testid="generated-content">
            {Object.entries(content).map(([ideaId, platformContent]) => (
              <div key={ideaId} className="border rounded-lg p-6">
                <h3 className="font-semibold text-foreground mb-4" data-testid={`content-idea-${ideaId}`}>
                  {getIdeaTitle(ideaId)}
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {Object.entries(platformContent).map(([platform, contentText]) => {
                    const platformData = PLATFORMS.find(p => p.id === platform);
                    return (
                      <div key={platform} className="space-y-3">
                        <div className="flex items-center space-x-2 mb-2">
                          <div className={`w-5 h-5 ${platformData?.color || 'bg-gray-500'} rounded text-white flex items-center justify-center`}>
                            {getPlatformIcon(platform)}
                          </div>
                          <span className="text-sm font-medium">{platformData?.name || platform}</span>
                        </div>
                        
                        <div className="p-4 bg-secondary/30 rounded-lg border max-h-48 overflow-y-auto">
                          <p className="text-sm whitespace-pre-wrap" data-testid={`content-${ideaId}-${platform}`}>
                            {contentText}
                          </p>
                          {platform === 'twitter' && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Characters: {contentText.length}/280
                            </div>
                          )}
                        </div>
                        
                        <Button
                          onClick={() => copyToClipboard(contentText, platformData?.name || platform)}
                          className={`w-full text-sm ${getPlatformColor(platform)}`}
                          variant="outline"
                          size="sm"
                          data-testid={`button-copy-${ideaId}-${platform}`}
                        >
                          <Copy className="w-3 h-3 mr-1" />
                          Copy {platformData?.name || platform}
                        </Button>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
