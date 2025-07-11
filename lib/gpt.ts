import OpenAI from 'openai';
import { AgentData } from './neuralseek';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export interface NTLPlan {
  components: string[];
  layout: string[];
  actions: string[];
  user_inputs: string[];
  theme: string;
  api_endpoints: string[];
  [key: string]: any;
}

// --- Generate a detailed NTL plan using agent context ---
export async function generateNTL(prompt: string, agent: AgentData): Promise<NTLPlan> {
  const fullPrompt = `You are an expert AI web architect. Given the following agent metadata and user prompt, design a detailed UI plan for a production-ready React web app. 

Prompt: "${prompt}"

Agent Metadata:
${JSON.stringify(agent, null, 2)}

Requirements:
- Output a valid JSON object with keys: components[], layout[], actions[], user_inputs[], theme, api_endpoints[]
- Select components based on agent capabilities (e.g., ChatInterface for chat, FileUpload for file processing, DataTable for analytics, etc.)
- Add user flows and describe the main UI layout
- Suggest a color theme based on agent purpose
- Include all required API endpoints
- Be concise but comprehensive

Example output:
{
  "components": ["ChatInterface", "MessageHistory", "TypingIndicator"],
  "layout": ["Header", "Main", "Sidebar"],
  "actions": ["SendMessage", "UploadFile"],
  "user_inputs": ["MessageInput"],
  "theme": "blue/white, modern, accessible",
  "api_endpoints": ["/api/send-message", "/api/upload"]
}
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: fullPrompt }],
      temperature: 0.5,
      max_tokens: 2000,
    });
    const planText = completion.choices[0]?.message?.content;
    if (!planText) throw new Error('No response from OpenAI');
    // Try to extract JSON from the response
    const jsonMatch = planText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : planText;
    return JSON.parse(jsonString);
  } catch (error) {
    // Fallback: minimal plan
    return {
      components: ['FallbackComponent'],
      layout: ['Main'],
      actions: [],
      user_inputs: [],
      theme: 'gray/white',
      api_endpoints: [],
      error: (error as Error).message || 'Unknown error',
    };
  }
}

// --- Generate a React component using agent and NTL context ---
export async function generateComponent(name: string, ntlPlan: NTLPlan, agent: AgentData, apiKey: string): Promise<string> {
  const componentPrompt = `Generate a modern, production-ready React TypeScript component named "${name}" for the following agent and UI plan:

Agent Metadata:
${JSON.stringify(agent, null, 2)}

NTL Plan:
${JSON.stringify(ntlPlan, null, 2)}

Requirements:
- Use functional components and hooks
- Use Tailwind CSS utility classes only
- Add ARIA labels and accessibility features
- Add loading and error states
- Add TypeScript interfaces for props
- Make it responsive and mobile-first
- Add comments for key logic
- Return only the code, no explanations
`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: componentPrompt }],
      temperature: 0.3,
      max_tokens: 3000,
    });
    const code = completion.choices[0]?.message?.content;
    if (!code) throw new Error('No component code generated');
    // Basic code validation: ensure it exports a React component
    if (!/export\s+default\s+function|export\s+default\s+\w+/i.test(code)) {
      throw new Error('Generated code does not export a default React component');
    }
    return code;
  } catch (error) {
    // Fallback: simple placeholder
    return `import React from 'react';

export default function ${name}() {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-2">${name}</h2>
      <p className="text-gray-600">Component placeholder (generation failed)</p>
    </div>
  );
}`;
  }
} 