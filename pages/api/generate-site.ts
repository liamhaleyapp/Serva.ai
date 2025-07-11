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
      agentData = await createAgentWithNeuralSeek(prompt);
      neuralSeekResponse = agentData.neuralSeekRaw;
      if (!agentData.ntl) {
        throw new Error('NeuralSeek did not return a valid NTL script.');
      }
      ntl = agentData.ntl;
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
    if (typeof ntl === 'string') {
      try {
        ntlPlan = JSON.parse(ntl);
      } catch {
        ntlPlan = await generateNTL(prompt, ntl);
      }
    }

    // Step 3: Generate code from NTL
    errorStep = 'Code generation';
    projectPath = await generateCodeFromNTL(ntlPlan, openaiApiKey);
    componentCount = Array.isArray(ntlPlan.components) ? ntlPlan.components.length : 0;

    // Step 4: Deploy to Vercel
    errorStep = 'Vercel deployment';
    deployedUrl = await deployToVercel(projectPath);

    // Step 5: Log to Supabase
    errorStep = 'Supabase logging';
    await logProjectToSupabase({
      prompt,
      url: deployedUrl,
      ntl: ntlPlan,
      agent_name: agentData?.name,
      agent_capabilities: agentData?.capabilities,
      neural_seek_response: neuralSeekResponse,
      generation_time: Date.now() - startTime,
      component_count: componentCount,
    });

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