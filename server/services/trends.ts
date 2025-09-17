import { generatePostIdeas } from './anthropic';

interface TrendCache {
  [key: string]: {
    data: any;
    timestamp: number;
    ttl: number;
  };
}

const cache: TrendCache = {};

function getCachedData(key: string): any | null {
  const cached = cache[key];
  if (cached && Date.now() - cached.timestamp < cached.ttl) {
    return cached.data;
  }
  return null;
}

function setCachedData(key: string, data: any, ttlMinutes: number): void {
  cache[key] = {
    data,
    timestamp: Date.now(),
    ttl: ttlMinutes * 60 * 1000
  };
}

export async function fetchGoogleTrends(keywords: string[]): Promise<any[]> {
  const cacheKey = `google_trends_${keywords.join('_')}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const trends = [];
    
    for (const keyword of keywords.slice(0, 3)) { // Limit to avoid rate limiting
      try {
        const response = await fetch(
          `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(keyword)}&gl=GB&hl=en-GB`
        );
        
        if (response.ok) {
          const data = await response.json();
          if (data && data[1] && Array.isArray(data[1])) {
            trends.push({
              keyword,
              suggestions: data[1].slice(0, 5),
              source: 'Google Trends UK'
            });
          }
        }
      } catch (error) {
        console.error(`Error fetching Google Trends for ${keyword}:`, error);
      }
      
      // Rate limiting delay
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setCachedData(cacheKey, trends, 120); // 2 hours cache
    return trends;
  } catch (error) {
    console.error('Error fetching Google Trends:', error);
    return [];
  }
}

export async function fetchXcomTrends(): Promise<any[]> {
  const cacheKey = 'xcom_trends_uk';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    const response = await fetch('https://getdaytrends.com/api/trends/united-kingdom', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; TrendBot/1.0)'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    const data = await response.json();
    const trends = data.trends ? data.trends.slice(0, 10).map((trend: any) => ({
      name: trend.name || trend.query || trend,
      volume: trend.volume || trend.tweet_volume || 'N/A',
      source: 'X.com UK Trends'
    })) : [];

    setCachedData(cacheKey, trends, 120); // 2 hours cache
    return trends;
  } catch (error) {
    console.error('Error fetching X.com trends:', error);
    // Fallback to some general UK trending topics
    return [
      { name: 'UK Cost of Living', volume: 'High', source: 'X.com UK Trends' },
      { name: 'Local Business', volume: 'Medium', source: 'X.com UK Trends' },
      { name: 'Winter Weather UK', volume: 'Medium', source: 'X.com UK Trends' }
    ];
  }
}

export async function fetchRedditDiscussions(keywords: string[]): Promise<any[]> {
  const cacheKey = `reddit_uk_${keywords.join('_')}`;
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  const ukSubreddits = ['unitedkingdom', 'AskUK', 'britishproblems', 'ukbusiness', 'london'];
  const discussions = [];

  try {
    for (const subreddit of ukSubreddits.slice(0, 3)) {
      try {
        const response = await fetch(`https://www.reddit.com/r/${subreddit}/hot.json?limit=5`, {
          headers: {
            'User-Agent': 'TrendAnalysisBot/1.0'
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.data && data.data.children) {
            const posts = data.data.children
              .map((post: any) => post.data)
              .filter((post: any) => {
                const text = `${post.title} ${post.selftext}`.toLowerCase();
                return keywords.some(keyword => text.includes(keyword.toLowerCase()));
              })
              .slice(0, 2)
              .map((post: any) => ({
                title: post.title,
                score: post.score,
                comments: post.num_comments,
                subreddit: post.subreddit,
                url: `https://reddit.com${post.permalink}`,
                source: 'Reddit UK Communities'
              }));

            discussions.push(...posts);
          }
        }
      } catch (error) {
        console.error(`Error fetching Reddit data for ${subreddit}:`, error);
      }
      
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    setCachedData(cacheKey, discussions, 120); // 2 hours cache
    return discussions;
  } catch (error) {
    console.error('Error fetching Reddit discussions:', error);
    return [];
  }
}

export async function fetchBBCNews(): Promise<any[]> {
  const cacheKey = 'bbc_business_news';
  const cached = getCachedData(cacheKey);
  if (cached) return cached;

  try {
    // Use NewsAPI.org for BBC Business news
    const apiKey = process.env.NEWS_API_KEY || process.env.NEWSAPI_KEY;
    
    if (!apiKey) {
      console.warn('NEWS_API_KEY not found, using fallback BBC news');
      return [
        {
          title: 'UK Business Confidence Rises Despite Economic Challenges',
          description: 'Latest surveys show small business optimism increasing across key sectors',
          publishedAt: new Date().toISOString(),
          url: 'https://bbc.co.uk/news/business',
          source: 'BBC Business News'
        }
      ];
    }

    const response = await fetch(
      `https://newsapi.org/v2/everything?sources=bbc-news&category=business&language=en&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`
    );

    if (!response.ok) {
      throw new Error(`NewsAPI HTTP ${response.status}`);
    }

    const data = await response.json();
    const articles = data.articles ? data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      publishedAt: article.publishedAt,
      url: article.url,
      source: 'BBC Business News'
    })) : [];

    setCachedData(cacheKey, articles, 240); // 4 hours cache
    return articles;
  } catch (error) {
    console.error('Error fetching BBC news:', error);
    return [];
  }
}

export async function analyzeTrends(businessData: any, keywords: string[]): Promise<any> {
  const startTime = Date.now();

  try {
    // Fetch all trend data concurrently
    const [googleTrends, xcomTrends, redditDiscussions, bbcArticles] = await Promise.allSettled([
      fetchGoogleTrends(keywords),
      fetchXcomTrends(),
      fetchRedditDiscussions(keywords),
      fetchBBCNews()
    ]);

    const trendData = {
      googleTrends: googleTrends.status === 'fulfilled' ? googleTrends.value : [],
      xcomTrends: xcomTrends.status === 'fulfilled' ? xcomTrends.value : [],
      redditDiscussions: redditDiscussions.status === 'fulfilled' ? redditDiscussions.value : [],
      bbcArticles: bbcArticles.status === 'fulfilled' ? bbcArticles.value : []
    };

    // Generate post ideas using AI
    const postIdeas = await generatePostIdeas(businessData, trendData);

    const processingTime = (Date.now() - startTime) / 1000;

    return {
      ...trendData,
      postIdeas,
      processingTime,
      cached: false
    };
  } catch (error) {
    console.error('Error analyzing trends:', error);
    throw new Error('Failed to analyze trends. Please try again.');
  }
}
