import React, { useState } from 'react';
import { CopyToClipboard } from "react-copy-to-clipboard";


const FeedUrlExtractor = () => {
  const [url, setUrl] = useState('');
  const [feedUrls, setFeedUrls] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setFeedUrls([]);

    try {
      const response = await fetch(`/.netlify/functions/feedExtractor?url=${encodeURIComponent(url)}`);
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to fetch feed URLs');
      }

      setFeedUrls(data.feedUrls);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-4">Feed URL Extractor</h1>
      <form onSubmit={handleSubmit} className="mb-4">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Enter website URL"
          required
          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          type="submit"
          disabled={isLoading}
          className="mt-2 w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {isLoading ? 'Loading...' : 'Extract Feed URLs'}
        </button>
      </form>

      {error && (
        <div>
          {error}
        </div>
      )}

      {feedUrls.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold mb-2">Found Feed URLs:</h2>
          <ul className="list-disc pl-5">
            {feedUrls.map((feedUrl, index) => (
              <li key={index} className="mb-1">
                <a href={feedUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
                  {feedUrl}
                </a>
                <CopyToClipboard text={feedUrl}>
            <button>Copy to Clipboard</button>
          </CopyToClipboard>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FeedUrlExtractor;