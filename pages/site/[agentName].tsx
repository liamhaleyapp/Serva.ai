import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

// --- Types (reuse from index.tsx if possible) ---
type InputOption = { value: string; label: string };
type InputDefinition = {
  name: string;
  label: string;
  type: string;
  required: boolean;
  hint?: string;
  options?: InputOption[];
  placeholder?: string;
  examples?: any;
};

// --- Extraction logic: Only user-facing fields ---
function extractUserInputs(openApiJson: any): InputDefinition[] {
  if (!openApiJson || typeof openApiJson !== 'object') return [];
  const postPath = Object.entries(openApiJson.paths || {}).find(
    ([, methods]) => (methods as Record<string, any>).post
  );
  if (!postPath) return [];
  const postOp = (postPath[1] as Record<string, any>).post;
  const schema = postOp?.requestBody?.content?.['application/json']?.schema;
  if (!schema || !schema.properties) return [];

  // Prefer 'params', but fallback to top-level properties if not present
  let paramProps: any = {};
  let paramsRequired: string[] = [];
  if (schema.properties.params && schema.properties.params.properties) {
    paramProps = schema.properties.params.properties;
    paramsRequired = schema.properties.params.required || [];
  } else {
    paramProps = schema.properties;
    paramsRequired = schema.required || [];
    // Remove system/internal fields if present
    delete paramProps['params'];
  }

  return Object.entries(paramProps).map(([name, prop]) => {
    const p = prop as Record<string, any>;
    // Heuristics for input type
    let inputType = 'text';
    const desc = (p.description || '').toLowerCase();
    if (p.format === 'binary' || /upload|file/.test(desc)) inputType = 'file';
    else if (name.toLowerCase().includes('keywords')) inputType = 'text';
    else if (name.toLowerCase().includes('tone')) inputType = 'dropdown';
    else if (name.toLowerCase().includes('length') || name.toLowerCase().includes('count')) inputType = 'number';
    else if (name.toLowerCase().includes('query') || desc.includes('question') || desc.includes('inquiry')) inputType = 'textarea';
    else if (p.type === 'number') inputType = 'number';
    else if (p.type === 'string' && p.maxLength && p.maxLength > 200) inputType = 'textarea';

    // Placeholder/help text from description
    const placeholder = p.description || '';

    // Label: prettify name or use description
    let label = p.title || name.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase());
    if (desc && desc.length < 60 && !label.toLowerCase().includes(desc)) {
      label = desc.charAt(0).toUpperCase() + desc.slice(1);
    }

    return {
      name,
      label,
      type: inputType,
      required: paramsRequired.includes(name),
      placeholder,
      hint: p.description || '',
    };
  });
}

// --- DynamicAgentForm ---
function DynamicAgentForm({ inputDefinitions, onSubmit }: { inputDefinitions: InputDefinition[]; onSubmit: (formData: Record<string, any>) => void }) {
  const [formState, setFormState] = useState<Record<string, any>>({});
  const [submitted, setSubmitted] = useState(false);

  const handleChange = (name: string, value: any) => {
    setFormState(prev => ({ ...prev, [name]: value }));
  };
  const handleFileChange = (name: string, file: File | null) => {
    setFormState(prev => ({ ...prev, [name]: file }));
  };
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitted(true);
    onSubmit(formState);
  };
  return (
    <form onSubmit={handleSubmit} className="space-y-6 mt-8 max-w-xl mx-auto">
      {inputDefinitions.map((input: InputDefinition) => (
        <div key={input.name} className="space-y-1">
          <label className="block font-medium text-gray-700">
            {input.label}
            {input.required && <span className="text-red-500 ml-1">*</span>}
          </label>
          {input.hint && (
            <div className="text-xs text-gray-500 mb-1">{input.hint}</div>
          )}
          {input.examples && input.examples.length > 0 && (
            <div className="text-xs text-gray-400 mb-1">Examples: {input.examples.join(', ')}</div>
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
              placeholder={input.placeholder || ''}
            />
          ) : input.type === 'number' ? (
            <input
              type="number"
              required={input.required}
              value={formState[input.name] || ''}
              onChange={e => handleChange(input.name, (e.target as HTMLInputElement).value)}
              className="w-full border border-gray-300 rounded-lg p-2"
              placeholder={input.placeholder || ''}
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
              placeholder={input.placeholder || ''}
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
      {submitted && (
        <div className="mt-4 text-green-700 text-center">Form submitted! (Demo only)</div>
      )}
    </form>
  );
}

export default function AgentSite() {
  const router = useRouter();
  const { agentName } = router.query;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agent, setAgent] = useState<any>(null);
  const [openApi, setOpenApi] = useState<any>(null);
  useEffect(() => {
    if (!agentName) return;
    // Try to fetch agent info from backend (or localStorage/sessionStorage for demo)
    async function fetchAgent() {
      setLoading(true);
      setError(null);
      try {
        // For demo, try to get from localStorage/sessionStorage
        const cached = window.sessionStorage.getItem(`agent_${agentName}`);
        if (cached) {
          const parsed = JSON.parse(cached);
          setAgent(parsed.agent);
          setOpenApi(parsed.ntl);
          setLoading(false);
          return;
        }
        // Otherwise, fetch from backend (not implemented, fallback to error)
        setError('Agent info not found. Please generate the agent again.');
        setLoading(false);
      } catch (err: any) {
        setError('Failed to load agent info.');
        setLoading(false);
      }
    }
    fetchAgent();
  }, [agentName]);

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-xl">Loading...</div>;
  }
  if (error) {
    return <div className="min-h-screen flex items-center justify-center text-red-600 text-xl">{error}</div>;
  }
  const inputDefs = extractUserInputs(openApi);
  return (
    <>
      <Head>
        <title>{agent?.name || agentName} - Agent Site</title>
      </Head>
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 py-8">
          <header className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">{agent?.name || agentName}</h1>
            <p className="text-gray-600 mb-2">{agent?.description || 'AI Agent'}</p>
            {agent?.capabilities && (
              <div className="text-xs text-gray-500 mb-2">Capabilities: {agent.capabilities.join(', ')}</div>
            )}
          </header>
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-semibold mb-4">Agent Input Form</h2>
            <DynamicAgentForm
              inputDefinitions={inputDefs}
              onSubmit={(formData) => {
                // TODO: Call agent endpoint with formData
                // For now, just show a success message
                alert('Form submitted! (Demo only)\n' + JSON.stringify(formData, null, 2));
              }}
            />
          </div>
        </div>
      </div>
    </>
  );
} 