import React, { useState } from 'react';
import Head from 'next/head';
import ProgressIndicator from '../components/ProgressIndicator';

// --- DynamicAgentForm: Renders a form from input definitions ---
type InputOption = { value: string; label: string };
type InputDefinition = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  hint?: string;
  options?: InputOption[];
  group?: string;
};

interface DynamicAgentFormProps {
  inputDefinitions: InputDefinition[];
  onSubmit: (formData: Record<string, any>) => void;
}

function DynamicAgentForm({ inputDefinitions, onSubmit }: DynamicAgentFormProps) {
  const [formState, setFormState] = useState<Record<string, any>>({});

  const handleChange = (name: string, value: any) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (name: string, file: File | null) => {
    setFormState(prev => ({ ...prev, [name]: file }));
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    onSubmit(formState);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-8">
      {inputDefinitions.map((input: InputDefinition) => (
        <div key={input.name} className="space-y-1">
          <label className="block font-medium text-gray-700">
            {input.label}
            {input.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {input.hint && (
            <div className="text-xs text-gray-500 mb-1">{input.hint}</div>
          )}
          {input.type === 'file' ? (
            <input
              type="file"
              required={input.required}
              onChange={e => handleFileChange(input.name, e.target.files && e.target.files[0] ? e.target.files[0] : null)}
              className="block w-full"
            />
          ) : input.type === 'textarea' ? (
            <textarea
              required={input.required}
              value={formState[input.name] || ''}
              onChange={e => handleChange(input.name, (e.target as HTMLTextAreaElement).value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          ) : input.type === 'number' ? (
            <input
              type="number"
              required={input.required}
              value={formState[input.name] || ''}
              onChange={e => handleChange(input.name, (e.target as HTMLInputElement).value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          ) : input.type === 'checkbox' ? (
            <input
              type="checkbox"
              checked={!!formState[input.name]}
              onChange={e => handleChange(input.name, (e.target as HTMLInputElement).checked)}
              className="w-4 h-4"
            />
          ) : input.type === 'dropdown' && input.options ? (
            <select
              required={input.required}
              value={formState[input.name] || ''}
              onChange={e => handleChange(input.name, (e.target as HTMLSelectElement).value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            >
              <option value="">Select...</option>
              {input.options.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          ) : (
            <input
              type="text"
              required={input.required}
              value={formState[input.name] || ''}
              onChange={e => handleChange(input.name, (e.target as HTMLInputElement).value)}
              className="w-full border border-gray-300 rounded-lg p-2"
            />
          )}
        </div>
      ))}
      <button
        type="submit"
        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 rounded-lg transition"
      >
        Submit
      </button>
    </form>
  );
}

// --- Extraction logic: Get user-facing input definitions from OpenAPI JSON ---
function extractInputDefinitions(openApiJson: any) {
  if (!openApiJson || typeof openApiJson !== 'object') return [];
  // Find the POST path (usually only one for agent)
  const postPath = Object.entries(openApiJson.paths || {}).find(
    ([, methods]) => (methods as Record<string, any>).post
  );
  if (!postPath) return [];
  const postOp = (postPath[1] as Record<string, any>).post;
  // Get requestBody schema
  const schema = postOp?.requestBody?.content?.['application/json']?.schema;
  if (!schema || !schema.properties) return [];
  // Main user inputs are usually under 'params'
  const params = schema.properties.params;
  const paramsRequired = (params && params.required) || [];
  const paramProps = (params && params.properties) || {};
  // Advanced options (optional)
  const options = schema.properties.options;
  const optionsRequired = (options && options.required) || [];
  const optionProps = (options && options.properties) || {};
  // Helper to map schema prop to input definition
  function mapProp(name: string, prop: any, required: boolean) {
    let type = 'text';
    if (prop.format === 'binary') type = 'file';
    else if (prop.type === 'boolean') type = 'checkbox';
    else if (prop.type === 'integer' || prop.type === 'number') type = 'number';
    else if (prop.type === 'string' && prop.maxLength && prop.maxLength > 200) type = 'textarea';
    else if (prop.enum) type = 'dropdown';
    return {
      name,
      label: prop.title || prop.description || name.replace(/([A-Z])/g, ' $1').replace(/^\w/, c => c.toUpperCase()),
      type,
      required: required,
      hint: prop.description || '',
      options: prop.enum ? prop.enum.map((v: any) => ({ value: v, label: String(v) })) : undefined,
      group: 'main',
    };
  }
  // Main inputs
  const mainInputs = Object.entries(paramProps).map(([name, prop]) =>
    mapProp(name, prop, paramsRequired.includes(name))
  );
  // Advanced options
  const advancedInputs = Object.entries(optionProps).map(([name, prop]) =>
    ({ ...mapProp(name, prop, optionsRequired.includes(name)), group: 'advanced' })
  );
  return [...mainInputs, ...advancedInputs];
}

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
                {/* --- Dynamic Agent Form --- */}
                {result.ntl && (
                  <DynamicAgentForm
                    inputDefinitions={extractInputDefinitions(result.ntl)}
                    onSubmit={(formData) => {
                      // TODO: Handle form submission (call agent endpoint, etc.)
                      alert('Form submitted! ' + JSON.stringify(formData, null, 2));
                    }}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 