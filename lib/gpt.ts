import OpenAI from 'openai';

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY 
});

export interface NTLPlan {
  components: string[];
  layout: string[];
  actions: string[];
  user_inputs: string[];
  theme: string;
  api_endpoints: string[];
}

export async function generateNTL(prompt: string, agentJson: any): Promise<NTLPlan> {
  const fullPrompt = `You are an AI web architect. Based on the following user prompt and agent metadata, output a structured plan for a web UI that interacts with the agent.

Prompt: "${prompt}"

Agent Metadata:
${JSON.stringify(agentJson, null, 2)}

Return a valid JSON object with the following structure:
{
  "components": ["array of component names"],
  "layout": ["array of layout instructions"],
  "actions": ["array of action descriptions"],
  "user_inputs": ["array of user input fields needed"],
  "theme": "theme description",
  "api_endpoints": ["array of required API endpoints"]
}

Make sure the response is valid JSON only.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: fullPrompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const planText = completion.choices[0]?.message?.content;
    if (!planText) {
      throw new Error('No response from OpenAI');
    }

    // Try to extract JSON from the response
    const jsonMatch = planText.match(/\{[\s\S]*\}/);
    const jsonString = jsonMatch ? jsonMatch[0] : planText;
    
    const plan = JSON.parse(jsonString);
    return plan as NTLPlan;
  } catch (error) {
    console.error('Error generating NTL:', error);
    throw new Error(`Failed to generate NTL: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function generateComponent(componentName: string, ntl: NTLPlan, apiKey: string): Promise<string> {
  const componentPrompt = `Generate a React TypeScript component named "${componentName}" based on this NTL plan:

${JSON.stringify(ntl, null, 2)}

Requirements:
- Use modern React with hooks
- Include proper TypeScript types
- Use Tailwind CSS for styling
- Make it responsive and accessible
- Include proper error handling
- Add loading states where appropriate

Return only the component code, no explanations.`;

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'user', content: componentPrompt }],
      temperature: 0.3,
      max_tokens: 3000,
    });

    const code = completion.choices[0]?.message?.content;
    if (!code) {
      throw new Error('No component code generated');
    }

    return code;
  } catch (error) {
    console.error(`Error generating component ${componentName}:`, error);
    // Return a fallback component
    return `import React from 'react';

interface ${componentName}Props {
  // Add props as needed
}

export default function ${componentName}(props: ${componentName}Props) {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-2">${componentName}</h2>
      <p className="text-gray-600">Component placeholder</p>
    </div>
  );
}`;
  }
} 