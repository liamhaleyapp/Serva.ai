import type { NextApiRequest, NextApiResponse } from 'next';
import { createAgentWithNeuralSeek, AgentData } from '@/lib/neuralseek';
import { generateNTL, generateComponent } from '@/lib/gpt';
import { generateCodeFromNTL } from '@/lib/codegen';
import { deployToVercel } from '@/lib/vercel';
import { logProjectToSupabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const startTime = Date.now();
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, agent_json, api_key, use_neuralseek } = req.body;
  const openaiApiKey = api_key || process.env.OPENAI_API_KEY;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing required field: prompt' });
  }

  let agentData: AgentData | null = null;
  let neuralSeekResponse: any = null;
  let ntl: any = null;
  let projectPath = '';
  let deployedUrl = '';
  let errorStep = '';
  let componentCount = 0;

  try {
    // Step 1: Create agent with NeuralSeek (if enabled)
    if (use_neuralseek !== false) {
      errorStep = 'NeuralSeek agent creation';
      try {
        agentData = await createAgentWithNeuralSeek(prompt);
        neuralSeekResponse = agentData.neuralSeekRaw;
        if (!agentData.agentOpenApi) {
          throw new Error('NeuralSeek did not return a valid OpenAPI spec.');
        }
        ntl = agentData.agentOpenApi; // ntl now holds the OpenAPI spec
      } catch (neuralSeekError: any) {
        // If NeuralSeek fails, fall back to manual generation
        console.error('NeuralSeek failed, falling back to manual generation:', neuralSeekError.message);
        errorStep = 'Manual fallback generation';
        
        // Create a simple fallback agent
        agentData = {
          name: `FallbackAgent-${Date.now()}`,
          ntl: JSON.stringify({ type: 'fallback', prompt }),
          capabilities: ['basic_response'],
          neuralSeekRaw: null,
        };
        
        // Generate a simple NTL plan using GPT
        ntl = await generateNTL(prompt, agentData);
      }
    } else {
      // Fallback: use provided agent_json
      errorStep = 'Manual agent JSON';
      if (!agent_json) {
        throw new Error('No agent_json provided and NeuralSeek is disabled.');
      }
      ntl = agent_json;
      agentData = {
        name: agent_json.name || 'ManualAgent',
        ntl: JSON.stringify(agent_json),
        capabilities: agent_json.capabilities || [],
        neuralSeekRaw: null,
      };
    }

    // Step 2: Generate NTL plan (if not already structured)
    errorStep = 'NTL plan generation';
    let ntlPlan = ntl;
    // For OpenAPI, just pass through; for manual, parse if string
    if (!use_neuralseek && typeof ntl === 'string') {
      try {
        ntlPlan = JSON.parse(ntl);
      } catch {
        ntlPlan = await generateNTL(prompt, agentData || { name: 'ManualAgent', ntl: ntl, capabilities: [], neuralSeekRaw: null });
      }
    }

    // Step 3: Generate code from NTL (now OpenAPI)
    errorStep = 'Code generation';
    projectPath = await generateCodeFromNTL(ntlPlan as any, openaiApiKey, agentData || undefined);
    // For OpenAPI specs, components might not exist, so default to 0
    componentCount = ntlPlan.components && Array.isArray(ntlPlan.components) ? ntlPlan.components.length : 0;

    // Step 4: Deploy to Vercel
    errorStep = 'Vercel deployment';
    deployedUrl = await deployToVercel(projectPath, agentData?.name);

    // Step 5: Log to Supabase
    errorStep = 'Supabase logging';
    try {
      await logProjectToSupabase({
        prompt,
        url: deployedUrl,
        ntl: typeof ntlPlan === 'string' ? ntlPlan : JSON.stringify(ntlPlan),
        agent_name: agentData?.name,
        agent_capabilities: agentData?.capabilities,
        neural_seek_response: neuralSeekResponse,
        generation_time: Date.now() - startTime,
        component_count: componentCount,
      });
    } catch (loggingError) {
      console.error('Supabase logging failed, but continuing with response:', loggingError);
      // Don't fail the entire request if logging fails
    }

    res.status(200).json({
      success: true,
      url: deployedUrl,
      agent: agentData,
      ntl: ntlPlan,
      component_count: componentCount,
      message: 'Site generated and deployed successfully',
    });
  } catch (err: any) {
    console.error('Error during', errorStep, err);
    res.status(500).json({
      error: 'Internal server error',
      step: errorStep,
      message: err instanceof Error ? err.message : 'Unknown error occurred',
      agent: agentData,
      neural_seek_response: neuralSeekResponse,
    });
  }
} 