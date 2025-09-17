import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendAnalysis } from "@/types/api";
import { Loader2, Globe, Twitter, MessageCircle, Newspaper } from "lucide-react";

interface AnalysisProgressProps {
  analysisData: TrendAnalysis;
}

export function AnalysisProgress({ analysisData }: AnalysisProgressProps) {
  if (!analysisData.cached) return null;

  return (
    <Card>
      <CardContent className="p-6">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
          <h2 className="text-xl font-semibold text-foreground mb-2">Analysis Complete</h2>
          <p className="text-muted-foreground mb-6">
            {analysisData.cached ? "Using cached results" : `Completed in ${analysisData.processingTime?.toFixed(1)} seconds`}
          </p>
          
          <div className="space-y-4" data-testid="analysis-progress">
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Google Trends (UK)</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-green-600">Complete</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Twitter className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">X.com UK Trends</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-green-600">Complete</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <MessageCircle className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">Reddit UK Communities</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-green-600">Complete</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Newspaper className="w-5 h-5 text-primary" />
                <span className="text-sm font-medium">BBC Business News</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-sm text-green-600">Complete</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
