import { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';
import Parser from '@postlight/parser';

// CORSヘッダーを定義
const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // すべてのオリジンからのアクセスを許可
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
};

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // CORS headers for OPTIONS (pre-flight)
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: corsHeaders,
      body: '',
    };
  }

  const params = event.queryStringParameters;
  if (!params) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Missing query parameters" }),
    };
  }

  const { url } = params;
  if (!url) {
    return {
      statusCode: 400,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Missing required parameters" }),
    };
  }

  try {
    const result = await Parser.parse(url);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return {
      statusCode: 500,
      headers: corsHeaders,
      body: JSON.stringify({ error: "Failed to generate RSS feed" }),
    };
  }
};

export { handler };
