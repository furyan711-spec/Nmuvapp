import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { BusinessData, TrendAnalysis } from "@/types/api";
import { Search, Plus, X, BrainCircuit } from "lucide-react";

interface KeywordEditorProps {
  initialKeywords: string[];
  businessData: BusinessData;
  onKeywordsUpdate: (keywords: string[]) => void;
  onAnalysisComplete: (data: TrendAnalysis) => void;
}

export function KeywordEditor({ initialKeywords, businessData, onKeywordsUpdate, onAnalysisComplete }: KeywordEditorProps) {
  const [keywords, setKeywords] = useState<string[]>(initialKeywords);
  const [newKeyword, setNewKeyword] = useState("");
  const { toast } = useToast();

  const analyzeTrendsMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/analyze-trends", {
        businessData,
        keywords,
      });
      return response.json();
    },
    onSuccess: (result) => {
      if (result.success) {
        toast({
          title: "Analysis Complete",
          description: `Found ${result.postIdeas?.length || 0} content ideas`,
        });
        onAnalysisComplete(result);
      } else {
        toast({
          title: "Error",
          description: result.message || "Failed to analyze trends",
          variant: "destructive",
        });
      }
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to analyze trends. Please try again.",
        variant: "destructive",
      });
    },
  });

  const removeKeyword = (keywordToRemove: string) => {
    const updatedKeywords = keywords.filter(k => k !== keywordToRemove);
    setKeywords(updatedKeywords);
    onKeywordsUpdate(updatedKeywords);
  };

  const addKeyword = () => {
    if (newKeyword.trim() && !keywords.includes(newKeyword.trim())) {
      const updatedKeywords = [...keywords, newKeyword.trim()];
      setKeywords(updatedKeywords);
      onKeywordsUpdate(updatedKeywords);
      setNewKeyword("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      addKeyword();
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl font-semibold text-foreground">Review Generated Keywords</CardTitle>
          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
            <BrainCircuit className="w-4 h-4" />
            <span>AI Generated</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        <p className="text-sm text-muted-foreground">
          These keywords will be used to analyze current trends. Click to remove or add your own.
        </p>
        
        <div className="flex flex-wrap gap-2" data-testid="keywords-container">
          {keywords.map((keyword) => (
            <span
              key={keyword}
              className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-primary/10 text-primary border border-primary/20 cursor-pointer hover:bg-primary/20 transition-colors"
              data-testid={`keyword-${keyword}`}
            >
              {keyword}
              <X 
                className="w-3 h-3 ml-1 cursor-pointer" 
                onClick={() => removeKeyword(keyword)}
                data-testid={`remove-keyword-${keyword}`}
              />
            </span>
          ))}
        </div>
        
        <div className="flex items-center space-x-2">
          <Input
            value={newKeyword}
            onChange={(e) => setNewKeyword(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Add custom keyword..."
            className="flex-1"
            data-testid="input-new-keyword"
          />
          <Button
            onClick={addKeyword}
            variant="secondary"
            size="icon"
            data-testid="button-add-keyword"
          >
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        
        <Button
          onClick={() => analyzeTrendsMutation.mutate()}
          className="w-full"
          disabled={analyzeTrendsMutation.isPending || keywords.length === 0}
          data-testid="button-analyze-trends"
        >
          <Search className="w-4 h-4 mr-2" />
          {analyzeTrendsMutation.isPending ? "Analyzing Trends..." : "Analyze Trends"}
        </Button>
      </CardContent>
    </Card>
  );
}
