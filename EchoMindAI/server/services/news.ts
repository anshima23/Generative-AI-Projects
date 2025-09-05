export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
}

export async function getNewsData(category: string = "technology"): Promise<NewsArticle[]> {
  const apiKey = process.env.NEWS_API_KEY || process.env.NEWSAPI_KEY || "default_key";
  
  try {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=${category}&language=en&pageSize=5&apiKey=${apiKey}`
    );
    
    if (!response.ok) {
      throw new Error(`News API error: ${response.statusText}`);
    }
    
    const data = await response.json();
    
    return data.articles.map((article: any) => ({
      title: article.title,
      description: article.description,
      url: article.url,
      source: article.source.name,
      publishedAt: article.publishedAt
    }));
  } catch (error) {
    console.error("News API error:", error);
    
    // Fallback news data if API fails
    return [
      {
        title: "AI Technology Advances in Natural Language Processing",
        description: "Recent breakthroughs in AI continue to push the boundaries of what's possible.",
        url: "#",
        source: "Tech News",
        publishedAt: new Date().toISOString()
      },
      {
        title: "New JavaScript Framework Gains Popularity",
        description: "Developers are embracing new tools for better web development experiences.",
        url: "#",
        source: "Dev Community",
        publishedAt: new Date().toISOString()
      }
    ];
  }
}
