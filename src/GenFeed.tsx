import React, { useState } from 'react';
import { CopyToClipboard } from 'react-copy-to-clipboard';

const GenFeed = () => {
  const [formData, setFormData] = useState({
    url: '',
    articleSelector: '',
    titleSelector: '',
    linkSelector: '',
    descriptionSelector: '',
    pubDateSelector: '',
    channelTitle: '',
    channelLink: '',
    channelDescription: ''
  });
  const [generatedFeed, setGeneratedFeed] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setGeneratedFeed('');

    const params = new URLSearchParams(formData);
    const apiUrl = `/.netlify/functions/rss-generator?${params.toString()}`;

    try {
      const response = await fetch(apiUrl);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const rssContent = await response.text();
      setGeneratedFeed(rssContent);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-4">GenFeed - RSS Feed Generator</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        {Object.keys(formData).map((key) => (
          <div key={key}>
            <label htmlFor={key} className="block text-sm font-medium text-gray-700">
              {key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, ' $1')}:
            </label>
            <input
              type={key.includes('url') ? 'url' : 'text'}
              id={key}
              name={key}
              value={formData[key]}
              onChange={handleChange}
              required
              className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
                focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
            />
          </div>
        ))}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-zinc-950 text-white py-2 px-4 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {isLoading ? 'Generating...' : 'Generate RSS Feed'}
        </button>
      </form>

      {error && (
        <div className="mt-4 text-red-600">
          Error: {error}
        </div>
      )}

      {generatedFeed && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Generated RSS Feed:</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="whitespace-pre-wrap break-all">{generatedFeed}</pre>
          </div>
          <CopyToClipboard text={generatedFeed}>
            <button className="mt-2 bg-zinc-950 text-white py-1 px-4 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              Copy to Clipboard
            </button>
          </CopyToClipboard>
        </div>
      )}
    </div>
  );
};

export default GenFeed;