import { useState } from "react";
import { BusinessForm } from "@/components/BusinessForm";
import { KeywordEditor } from "@/components/KeywordEditor";
import { AnalysisProgress } from "@/components/AnalysisProgress";
import { TrendResults } from "@/components/TrendResults";
import { ContentResults } from "@/components/ContentResults";
import { Card, CardContent } from "@/components/ui/card";
import { useKeywordGeneration, useTrendAnalysis, useContentGeneration } from "@/hooks/useBusinessAnalysis";
import { useToast } from "@/hooks/use-toast";
import type { BusinessData, AnalysisResult, ContentGenerationResult, AnalysisStep, Platform } from "@/types/business";

export default function Home() {
  const [currentStep, setCurrentStep] = useState<AnalysisStep>('input');
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<AnalysisResult | null>(null);
  const [contentResult, setContentResult] = useState<ContentGenerationResult | null>(null);
  const [selectedIdeas, setSelectedIdeas] = useState<string[]>([]);
  const [selectedPlatforms, setSelectedPlatforms] = useState<Platform[]>(['twitter', 'instagram']);

  const { toast } = useToast();
  const keywordGeneration = useKeywordGeneration();
  const trendAnalysis = useTrendAnalysis();
  const contentGeneration = useContentGeneration();

  const handleBusinessFormSubmit = async (formData: Omit<BusinessData, 'keywords'>) => {
    try {
      const result = await keywordGeneration.mutateAsync(formData);
      const generatedKeywords = result.keywords || [];
      
      setBusinessData({ ...formData, keywords: generatedKeywords });
      setKeywords(generatedKeywords);
      setCurrentStep('keywords');
      
      toast({
        title: "Keywords generated",
        description: `Generated ${generatedKeywords.length} relevant keywords for your business`,
      });
    } catch (error) {
      toast({
        title: "Error generating keywords",
        description: error instanceof Error ? error.message : "Failed to generate keywords",
        variant: "destructive",
      });
    }
  };

  const handleStartAnalysis = async () => {
    if (!businessData) return;

    const dataWithKeywords = { ...businessData, keywords };
    
    try {
      setCurrentStep('analyzing');
      
      const result = await trendAnalysis.mutateAsync(dataWithKeywords);
      setAnalysisResult(result);
      setCurrentStep('results');
      
      toast({
        title: "Analysis complete",
        description: `Generated ${result.post_ideas.length} post ideas from trending data`,
      });
    } catch (error) {
      setCurrentStep('keywords');
      toast({
        title: "Analysis failed",
        description: error instanceof Error ? error.message : "Failed to analyze trends",
        variant: "destructive",
      });
    }
  };

  const handleIdeaToggle = (ideaId: string) => {
    setSelectedIdeas(prev => 
      prev.includes(ideaId) 
        ? prev.filter(id => id !== ideaId)
        : [...prev, ideaId]
    );
  };

  const handlePlatformToggle = (platform: Platform) => {
    setSelectedPlatforms(prev =>
      prev.includes(platform)
        ? prev.filter(p => p !== platform)
        : [...prev, platform]
    );
  };

  const handleGenerateContent = async () => {
    if (!analysisResult || selectedIdeas.length === 0 || selectedPlatforms.length === 0) return;

    try {
      const result = await contentGeneration.mutateAsync({
        businessRequestId: analysisResult.request_id,
        selectedIdeas,
        platforms: selectedPlatforms,
      });
      
      setContentResult(result);
      setCurrentStep('content');
      
      toast({
        title: "Content generated",
        description: `Created content for ${selectedIdeas.length} ideas across ${selectedPlatforms.length} platforms`,
      });
    } catch (error) {
      toast({
        title: "Content generation failed",
        description: error instanceof Error ? error.message : "Failed to generate content",
        variant: "destructive",
      });
    }
  };

  const handleStartNewAnalysis = () => {
    setCurrentStep('input');
    setBusinessData(null);
    setKeywords([]);
    setAnalysisResult(null);
    setContentResult(null);
    setSelectedIdeas([]);
    setSelectedPlatforms(['twitter', 'instagram']);
  };

  const getStepNumber = (step: AnalysisStep): number => {
    const steps = { input: 1, keywords: 2, analyzing: 2, results: 3, content: 3 };
    return steps[step];
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-primary-foreground font-bold text-lg">N</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Nmuvapp</h1>
                <p className="text-sm text-muted-foreground">Business Content Trend Analysis</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-sm text-muted-foreground">
                <span className="font-medium">API Status:</span>
                <span className="text-green-600">● Active</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-8">
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  getStepNumber(currentStep) >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>1</div>
                <span className={`text-sm font-medium ${
                  getStepNumber(currentStep) >= 1 ? 'text-primary' : 'text-muted-foreground'
                }`}>Business Details</span>
              </div>
              <div className="w-16 h-0.5 bg-muted"></div>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  getStepNumber(currentStep) >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>2</div>
                <span className={`text-sm font-medium ${
                  getStepNumber(currentStep) >= 2 ? 'text-primary' : 'text-muted-foreground'
                }`}>Trend Analysis</span>
              </div>
              <div className="w-16 h-0.5 bg-muted"></div>
              <div className="flex items-center space-x-2">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  getStepNumber(currentStep) >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                }`}>3</div>
                <span className={`text-sm font-medium ${
                  getStepNumber(currentStep) >= 3 ? 'text-primary' : 'text-muted-foreground'
                }`}>Content Generation</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Business Input Form */}
            {currentStep === 'input' && (
              <BusinessForm 
                onSubmit={handleBusinessFormSubmit}
                isLoading={keywordGeneration.isPending}
              />
            )}

            {/* Keywords Section */}
            {currentStep === 'keywords' && (
              <KeywordEditor
                keywords={keywords}
                onKeywordsChange={setKeywords}
                onStartAnalysis={handleStartAnalysis}
                isAnalyzing={trendAnalysis.isPending}
              />
            )}

            {/* Analysis Progress */}
            {currentStep === 'analyzing' && (
              <AnalysisProgress isVisible={true} />
            )}

            {/* Trend Results */}
            {currentStep === 'results' && analysisResult && (
              <TrendResults
                analysisResult={analysisResult}
                selectedIdeas={selectedIdeas}
                onIdeaToggle={handleIdeaToggle}
                selectedPlatforms={selectedPlatforms}
                onPlatformToggle={handlePlatformToggle}
                onGenerateContent={handleGenerateContent}
                isGenerating={contentGeneration.isPending}
              />
            )}

            {/* Content Results */}
            {currentStep === 'content' && contentResult && analysisResult && (
              <ContentResults
                contentResult={contentResult}
                postIdeas={analysisResult.post_ideas}
                onStartNewAnalysis={handleStartNewAnalysis}
              />
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How It Works */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">How It Works</h3>
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold mt-0.5">1</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Smart Analysis</p>
                      <p className="text-xs text-muted-foreground">AI analyzes your business details and generates relevant keywords</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold mt-0.5">2</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Trend Research</p>
                      <p className="text-xs text-muted-foreground">Scans Google Trends, X.com, Reddit, and BBC News for relevant topics</p>
                    </div>
                  </div>
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center text-xs font-bold mt-0.5">3</div>
                    <div>
                      <p className="text-sm font-medium text-foreground">Content Ideas</p>
                      <p className="text-xs text-muted-foreground">Generates post concepts that connect trends to your business</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Data Sources */}
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">Data Sources</h3>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-foreground">Google Trends (UK)</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-foreground">X.com UK Trends</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-foreground">Reddit UK Communities</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-sm text-foreground">BBC Business News</span>
                    <span className="text-xs text-muted-foreground">(Limited)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
