import { Handler, HandlerEvent, HandlerContext } from "@netlify/functions";
import Parser from "@postlight/parser";

const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  const params = event.queryStringParameters;

  if (!params) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing query parameters" }),
    };
  }

  const { url } = params;

  if (!url) {
    return {
      statusCode: 400,
      body: JSON.stringify({ error: "Missing required parameters" }),
    };
  }

  try {
    const result = await Parser.parse(url);
    console.log(result);
    return {
      statusCode: 200,
      headers: {
        "Content-Type": "application/rss+xml",
      },
      body: JSON.stringify(result),
    };
  } catch (error) {
    console.error("Error generating RSS feed:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "Failed to generate RSS feed" }),
    };
  }
};

export { handler };
