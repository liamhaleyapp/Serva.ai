import React, { useState } from 'react';
import Head from 'next/head';

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [agentJson, setAgentJson] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ url?: string; error?: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch('/api/generate-site', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          agent_json: JSON.parse(agentJson),
          api_key: apiKey,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setResult({ url: data.url });
      } else {
        setResult({ error: data.message || 'Failed to generate site' });
      }
    } catch (error) {
      setResult({ error: error instanceof Error ? error.message : 'Unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Serva.ai - Agent Site Builder</title>
        <meta name="description" content="AI-powered agent website builder" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Serva.ai Agent Site Builder
            </h1>
            <p className="text-xl text-gray-600">
              Generate custom websites for your AI agents with a simple prompt
            </p>
          </header>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="prompt" className="block text-sm font-medium text-gray-700 mb-2">
                  Describe your website
                </label>
                <textarea
                  id="prompt"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe the website you want to create for your agent..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  rows={4}
                  required
                />
              </div>

              <div>
                <label htmlFor="agentJson" className="block text-sm font-medium text-gray-700 mb-2">
                  Agent JSON Configuration
                </label>
                <textarea
                  id="agentJson"
                  value={agentJson}
                  onChange={(e) => setAgentJson(e.target.value)}
                  placeholder='{"name": "My Agent", "capabilities": ["chat", "search"], "description": "A helpful AI assistant"}'
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent font-mono text-sm"
                  rows={6}
                  required
                />
              </div>

              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Generating Site...' : 'Generate Site'}
              </button>
            </form>

            {result && (
              <div className="mt-8 p-4 rounded-md">
                {result.url ? (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <h3 className="text-lg font-medium text-green-800 mb-2">Success!</h3>
                    <p className="text-green-700 mb-4">Your site has been generated and deployed.</p>
                    <a
                      href={result.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                    >
                      View Site
                    </a>
                  </div>
                ) : (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
                    <p className="text-red-700">{result.error}</p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 