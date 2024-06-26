import { Handler } from '@netlify/functions'
import https from 'https'
import { URL } from 'url'

const handler: Handler = async (event) => {
  const url = event.queryStringParameters?.url

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: 'URL parameter is required' }),
    }
  }

  try {
    const html = await fetchHtml(url)
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

function fetchHtml(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', (chunk) => data += chunk)
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

function extractFeedUrls(html: string, baseUrl: string): string[] {
  const regex = /<link[^>]*type=["'](application\/rss\+xml|application\/atom\+xml)["'][^>]*href=["']([^"']+)["'][^>]*>/gi
  const feedUrls: string[] = []
  let match

  while ((match = regex.exec(html)) !== null) {
    const feedUrl = new URL(match[2], baseUrl).href
    feedUrls.push(feedUrl)
  }

  return feedUrls
}

export { handler }