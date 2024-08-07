import React, { useState, useEffect } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";

const GenFeed = () => {
  const [formData, setFormData] = useState({
    url: "",
    articleSelector: "",
    titleSelector: "",
    linkSelector: "",
    descriptionSelector: "",
    pubDateSelector: "",
    channelTitle: "",
    channelLink: "",
    channelDescription: "",
  });
  const [generatedFeed, setGeneratedFeed] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [apiUrl, setApiUrl] = useState("");
  const required = ["url", "articleSelector", "linkSelector", "channelTitle"];
  const groups = {
    basic: {
      title: "Basic Information",
      description: "Where to pickup articles",
      keys: ["url", "articleSelector"],
    },
    selectors: {
      title: "Selectors",
      description: "The each article's information",
      keys: [
        "titleSelector",
        "linkSelector",
        "descriptionSelector",
        "pubDateSelector",
      ],
    },
    channel: {
      title: "Channel Information",
      description: "Feed information",
      keys: ["channelTitle", "channelLink", "channelDescription"],
    },
  };
  const [copyFeedback, setCopyFeedback] = useState("");

  useEffect(() => {
    updateApiUrl();
  }, [formData]);

  const updateApiUrl = () => {
    const params = new URLSearchParams(formData);
    const newApiUrl = `/.netlify/functions/rss-generator?${params.toString()}`;
    setApiUrl(newApiUrl);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleApiUrlChange = (e) => {
    setApiUrl(e.target.value);
    try {
      const fullUrl =
        location.protocol + "//" + location.host + "/" + e.target.value;
      const url = new URL(fullUrl);
      const params = new URLSearchParams(url.search);
      const newFormData = {};
      for (const [key, value] of params.entries()) {
        if (key in formData) {
          newFormData[key] = value;
        }
      }
      setFormData({ ...formData, ...newFormData });
    } catch (err) {
      console.error("Invalid URL:", err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setGeneratedFeed("");

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

  const handleCopy = (_text: string, result: any) => {
    if (result) {
      setCopyFeedback("Copied!");
      setTimeout(() => setCopyFeedback(""), 2000);
    } else {
      setCopyFeedback("Failed to copy");
      setTimeout(() => setCopyFeedback(""), 2000);
    }
  };

  const InputField = ({ name, isRequired = false }) => (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700">
        {name.charAt(0).toUpperCase() + name.slice(1).replace(/([A-Z])/g, " $1")}:{" "}
        {isRequired && <span className="text-red-500">*</span>}
      </label>
      <input
        type={name.includes("url") ? "url" : "text"}
        id={name}
        name={name}
        value={formData[name]}
        onChange={handleChange}
        required={isRequired}
        className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
          focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
      />
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto mt-10 p-6 bg-white rounded-lg shadow-xl">
      <h1 className="text-2xl font-bold mb-4">GenFeed - RSS Feed Generator</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label
            htmlFor="apiUrl"
            className="block text-sm font-medium text-gray-700"
          >
            API URL:
          </label>
          <input
            type="text"
            id="apiUrl"
            name="apiUrl"
            value={apiUrl}
            onChange={handleApiUrlChange}
            className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-sm shadow-sm placeholder-gray-400
              focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-500"
          />
        </div>
        {Object.keys(groups).map((group) => (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">
              {groups[group].title}{" "}
              <span className="text-sm text-gray-700">
                {groups[group].description}
              </span>
            </h2>
            {groups[group].keys.map((key: string) => (
              <InputField name={key} isRequired={required.indexOf(key) >= 0} />
            ))}
          </div>
        ))}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-zinc-950 text-white py-2 px-4 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-50"
        >
          {isLoading ? "Generating..." : "Generate RSS Feed"}
        </button>
      </form>

      {error && <div className="mt-4 text-red-600">Error: {error}</div>}

      {generatedFeed && (
        <div className="mt-6">
          <h2 className="text-xl font-semibold mb-2">Generated RSS Feed:</h2>
          <div className="bg-gray-100 p-4 rounded-md">
            <pre className="whitespace-pre-wrap break-all">{generatedFeed}</pre>
          </div>
          <div className="mt-2 flex items-center">
            <CopyToClipboard text={generatedFeed} onCopy={handleCopy}>
              <button className="bg-zinc-950 text-white py-1 px-4 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
                Copy RSS to Clipboard
              </button>
            </CopyToClipboard>
            {copyFeedback && (
              <span className="ml-2 text-green-600">{copyFeedback}</span>
            )}
          </div>
        </div>
      )}

      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-2">API URL:</h2>
        <div className="bg-gray-100 p-4 rounded-md">
          <pre className="whitespace-pre-wrap break-all">
            {location.protocol + "//" + location.host + apiUrl}
          </pre>
        </div>
        <div className="mt-2 flex items-center">
          <CopyToClipboard
            text={location.protocol + "//" + location.host + apiUrl}
            onCopy={handleCopy}
          >
            <button className="bg-zinc-950 text-white py-1 px-4 rounded-md hover:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
              Copy API URL to Clipboard
            </button>
          </CopyToClipboard>
          {copyFeedback && (
            <span className="ml-2 text-green-600">{copyFeedback}</span>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenFeed;
