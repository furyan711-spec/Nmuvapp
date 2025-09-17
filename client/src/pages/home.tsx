import { useState } from "react";
import { BusinessForm } from "@/components/business-form";
import { KeywordEditor } from "@/components/keyword-editor";
import { AnalysisProgress } from "@/components/analysis-progress";
import { TrendResults } from "@/components/trend-results";
import { ContentResults } from "@/components/content-results";
import { BusinessData, TrendAnalysis, GeneratedContent } from "@/types/api";
import { Globe, Twitter, MessageCircle, Newspaper } from "lucide-react";

export default function Home() {
  const [currentStep, setCurrentStep] = useState(1);
  const [businessData, setBusinessData] = useState<BusinessData | null>(null);
  const [keywords, setKeywords] = useState<string[]>([]);
  const [analysisData, setAnalysisData] = useState<TrendAnalysis | null>(null);
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);

  const steps = [
    { number: 1, title: "Business Details", active: currentStep >= 1 },
    { number: 2, title: "Trend Analysis", active: currentStep >= 2 },
    { number: 3, title: "Content Generation", active: currentStep >= 3 },
  ];

  const handleBusinessSubmit = (data: BusinessData, generatedKeywords: string[]) => {
    setBusinessData(data);
    setKeywords(generatedKeywords);
    setCurrentStep(2);
  };

  const handleAnalysisComplete = (data: TrendAnalysis) => {
    setAnalysisData(data);
    setCurrentStep(3);
  };

  const handleContentGenerated = (content: GeneratedContent) => {
    setGeneratedContent(content);
  };

  const handleStartNewAnalysis = () => {
    setCurrentStep(1);
    setBusinessData(null);
    setKeywords([]);
    setAnalysisData(null);
    setGeneratedContent(null);
  };

  return (
    <div className="bg-background text-foreground min-h-screen">
      {/* Header */}
      <header className="border-b bg-card shadow-sm">
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
              <div className="flex items-center space-x-2">
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" title="Google Trends API"></div>
                  <span className="text-xs text-muted-foreground">GT</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" title="X.com Trends Scraper"></div>
                  <span className="text-xs text-muted-foreground">X</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" title="Reddit API"></div>
                  <span className="text-xs text-muted-foreground">R</span>
                </div>
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" title="BBC News API"></div>
                  <span className="text-xs text-muted-foreground">BBC</span>
                </div>
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
              {steps.map((step, index) => (
                <div key={step.number} className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                    step.active ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
                  }`}>
                    {step.number}
                  </div>
                  <span className={`text-sm font-medium ${
                    step.active ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {step.title}
                  </span>
                  {index < steps.length - 1 && (
                    <div className="w-16 h-0.5 bg-muted ml-8"></div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {currentStep === 1 && (
              <BusinessForm onSubmit={handleBusinessSubmit} />
            )}
            
            {currentStep === 2 && businessData && (
              <>
                <KeywordEditor
                  initialKeywords={keywords}
                  businessData={businessData}
                  onKeywordsUpdate={setKeywords}
                  onAnalysisComplete={handleAnalysisComplete}
                />
                {analysisData && (
                  <AnalysisProgress analysisData={analysisData} />
                )}
              </>
            )}
            
            {currentStep === 3 && analysisData && businessData && (
              <>
                <TrendResults
                  analysisData={analysisData}
                  businessData={businessData}
                  onContentGenerated={handleContentGenerated}
                />
                {generatedContent && (
                  <ContentResults
                    content={generatedContent}
                    analysisData={analysisData}
                    onStartNewAnalysis={handleStartNewAnalysis}
                  />
                )}
              </>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* How It Works */}
            <div className="bg-card p-6 rounded-lg border shadow-sm">
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
            </div>

            {/* Data Sources */}
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Data Sources</h3>
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-foreground">Google Trends (UK)</span>
                  <span className="text-xs text-muted-foreground ml-auto">suggestqueries.google.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-foreground">X.com UK Trends</span>
                  <span className="text-xs text-muted-foreground ml-auto">getdaytrends.com</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-foreground">Reddit UK Communities</span>
                  <span className="text-xs text-muted-foreground ml-auto">API OAuth</span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-sm text-foreground">BBC Business News</span>
                  <span className="text-xs text-muted-foreground ml-auto">NewsAPI.org</span>
                </div>
              </div>
            </div>

            {/* Caching Strategy */}
            <div className="bg-card p-6 rounded-lg border shadow-sm">
              <h3 className="text-lg font-semibold text-foreground mb-4">Caching Strategy</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Trend data:</span>
                  <span className="font-medium">2 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">News articles:</span>
                  <span className="font-medium">4 hours</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Generated ideas:</span>
                  <span className="font-medium">1 hour</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Target response:</span>
                  <span className="font-medium">&lt;30 seconds</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
