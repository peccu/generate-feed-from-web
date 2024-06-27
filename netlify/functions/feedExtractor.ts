import { Handler } from '@netlify/functions'

const handler: Handler = async (event) => {
  const url = event.queryStringParameters?.url

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'URL parameter is required' }),
    }
  }

  console.log(`Fetching ${url}`);

  try {
    const html = await fetchHtml(url)
    if (html.length === 0) {
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Cannot fetch HTML' }),
      }
    }

    const feedUrls = extractFeedUrls(html, url)

    return {
      statusCode: 200,
      body: JSON.stringify({ feedUrls }),
    }
  } catch (error) {
    console.error('Error:', error)
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to fetch or parse the webpage' }),
    }
  }
}

async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url)
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`)
  }
  return await response.text()
}

function extractFeedUrls(html: string, baseUrl: string): string[] {
  const regex = /<link[^>]*type=["'](application\/rss\+xml|application\/atom\+xml)["'][^>]*href=["']([^"']+)["'][^>]*>/gi
  const feedUrls: string[] = []
  let match: RegExpExecArray | null;

  while ((match = regex.exec(html)) !== null) {
    const feedUrl = new URL(match[2], baseUrl).href
    feedUrls.push(feedUrl)
  }

  return feedUrls
}

export { handler }