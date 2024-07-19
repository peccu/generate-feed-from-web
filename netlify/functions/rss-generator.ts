import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import { create } from 'xmlbuilder2';
import * as cheerio from 'cheerio';
import { URL } from 'url';

interface Article {
  title: string;
  link: string;
  description: string;
  pubDate: Date;
}

interface Selectors {
  title: string;
  link: string;
  description: string;
  pubDate: string;
}

async function fetchHTML(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return await response.text();
}

function generateRSSFeed(articles: Article[], channelInfo: { title: string; link: string; description: string }): string {
  const feed = create({ version: '1.0', encoding: 'UTF-8' })
    .ele('rss', { version: '2.0' })
      .ele('channel')
        .ele('title').txt(channelInfo.title).up()
        .ele('link').txt(channelInfo.link).up()
        .ele('description').txt(channelInfo.description).up();

  articles.forEach(article => {
    feed.ele('item')
      .ele('title').txt(article.title).up()
      .ele('link').txt(article.link).up()
      .ele('description').txt(article.description).up()
      .ele('pubDate').txt(article.pubDate.toUTCString()).up();
  });

  return feed.end({ prettyPrint: true });
}

function extractArticleFromHTML(html: string, selectors: Selectors, baseUrl: string): Article {
  const $ = cheerio.load(html);

  const title = $(selectors.title).text().trim();
  const relativeLink = $(selectors.link).attr('href') || '';
  const link = new URL(relativeLink, baseUrl).href;
  const description = $(selectors.description).text().trim();
  const pubDateString = $(selectors.pubDate).text().trim();

  const pubDate = new Date(pubDateString);

  return {
    title,
    link,
    description,
    pubDate
  };
}

function extractArticlesFromPage(html: string, articleSelector: string): string[] {
  const $ = cheerio.load(html);
  const articles: string[] = [];

  $(articleSelector).each((_, element) => {
    articles.push($.html(element));
  });

  return articles;
}

async function generateRSSFeedFromURL(url: string, articleSelector: string, articleSelectors: Selectors, channelInfo: { title: string; link: string; description: string }): Promise<string> {
  const html = await fetchHTML(url);
  const extractedArticleHTMLs = extractArticlesFromPage(html, articleSelector);
  const extractedArticles = extractedArticleHTMLs.map(articleHTML => 
    extractArticleFromHTML(articleHTML, articleSelectors, url)
  );
  return generateRSSFeed(extractedArticles, channelInfo);
}

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const params = event.queryStringParameters;

  if (!params) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing query parameters" })
    };
  }

  const { 
    url, articleSelector, titleSelector, linkSelector, 
    descriptionSelector, pubDateSelector, 
    channelTitle, channelLink, channelDescription 
  } = params;

  if (!url || !articleSelector || !linkSelector || 
      !channelTitle) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required parameters" })
    };
  }

  const articleSelectors: Selectors = {
    title: titleSelector,
    link: linkSelector,
    description: descriptionSelector,
    pubDate: pubDateSelector
  };

  const channelInfo = {
    title: channelTitle,
    link: channelLink,
    description: channelDescription
  };

  try {
    const rssFeed = await generateRSSFeedFromURL(url, articleSelector, articleSelectors, channelInfo);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/rss+xml"
      },
      body: rssFeed
    };
  } catch (error) {
    console.error('Error generating RSS feed:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate RSS feed" })
    };
  }
};

export { handler };