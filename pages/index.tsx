import React, { useState } from 'react';
import Head from 'next/head';
import ProgressIndicator from '../components/ProgressIndicator';

const GENERATION_STEPS = [
  'Creating AI Agent',
  'Designing Interface',
  'Generating Code',
  'Deploying Site',
  'Finalizing',
];

const EXAMPLE_PROMPTS = [
  'Create an AI customer support agent for an e-commerce store',
  'Build an agent that analyzes CSV files and creates insights',
  'Make an AI writing assistant for blog posts',
  'Create an agent that summarizes academic papers',
];

export default function Home() {
  const [prompt, setPrompt] = useState('');
  const [agentJson, setAgentJson] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [useNeuralSeek, setUseNeuralSeek] = useState(true);
  const [loadingStep, setLoadingStep] = useState<number | null>(null);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExample = (example: string) => {
    setPrompt(example);
    setResult(null);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setResult(null);
    setError(null);
    setLoadingStep(0);

    try {
      // Step 1: Creating AI Agent
      setLoadingStep(0);
      const response = await fetch('/api/generate-site', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt,
          agent_json: !useNeuralSeek ? JSON.parse(agentJson) : undefined,
          api_key: apiKey,
          use_neuralseek: useNeuralSeek,
        }),
      });
      setLoadingStep(1);
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || 'Failed to generate site');
        setLoadingStep(null);
        return;
      }
      // Step 2-5: Simulate progress
      setLoadingStep(2);
      await new Promise(r => setTimeout(r, 500));
      setLoadingStep(3);
      await new Promise(r => setTimeout(r, 500));
      setLoadingStep(4);
      await new Promise(r => setTimeout(r, 500));
      setResult(data);
      setLoadingStep(null);
    } catch (err: any) {
      setError(err.message || 'Unknown error occurred');
      setLoadingStep(null);
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
            <p className="text-xl text-gray-600 mb-4">
              Generate custom websites for your AI agents with a simple prompt
            </p>
            <div className="flex flex-wrap gap-2 justify-center mb-2">
              {EXAMPLE_PROMPTS.map((ex) => (
                <button
                  key={ex}
                  onClick={() => handleExample(ex)}
                  className="bg-blue-100 text-blue-700 px-3 py-1 rounded hover:bg-blue-200 text-sm"
                >
                  {ex}
                </button>
              ))}
            </div>
          </header>

          <div className="bg-white rounded-lg shadow-lg p-8">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="flex items-center gap-4 mb-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={useNeuralSeek}
                    onChange={() => setUseNeuralSeek(v => !v)}
                  />
                  <span className="text-sm">Use NeuralSeek (recommended)</span>
                </label>
                <span className="text-xs text-gray-400">or provide agent JSON manually</span>
              </div>
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
              {!useNeuralSeek && (
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
              )}
              <div>
                <label htmlFor="apiKey" className="block text-sm font-medium text-gray-700 mb-2">
                  OpenAI API Key (optional)
                </label>
                <input
                  type="password"
                  id="apiKey"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="sk-..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                type="submit"
                disabled={loadingStep !== null}
                className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingStep !== null ? 'Generating Site...' : 'Generate Site'}
              </button>
            </form>

            {loadingStep !== null && (
              <div className="mt-8">
                <ProgressIndicator step={loadingStep} steps={GENERATION_STEPS} />
                <div className="text-center text-blue-700 mt-2">{GENERATION_STEPS[loadingStep]}</div>
              </div>
            )}

            {error && (
              <div className="mt-8 bg-red-50 border border-red-200 rounded-md p-4">
                <h3 className="text-lg font-medium text-red-800 mb-2">Error</h3>
                <p className="text-red-700">{error}</p>
              </div>
            )}

            {result && (
              <div className="mt-8 p-4 rounded-md bg-green-50 border border-green-200">
                <h3 className="text-lg font-medium text-green-800 mb-2">Success!</h3>
                <p className="text-green-700 mb-2">Your site has been generated and deployed.</p>
                <a
                  href={result.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 mb-4"
                >
                  View Site
                </a>
                {result.agent && (
                  <div className="mb-2">
                    <div className="font-semibold text-green-900">Agent Name: <span className="font-normal">{result.agent.name}</span></div>
                    <div className="font-semibold text-green-900">Capabilities: <span className="font-normal">{result.agent.capabilities?.join(', ') || 'N/A'}</span></div>
                  </div>
                )}
                <div className="text-xs text-gray-500">Components generated: {result.component_count}</div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 