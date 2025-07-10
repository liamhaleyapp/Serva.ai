import { NextApiRequest, NextApiResponse } from 'next';
import { generateNTL } from '@/lib/gpt';
import { generateCodeFromNTL } from '@/lib/codegen';
import { deployToVercel } from '@/lib/vercel';
import { logProjectToSupabase } from '@/lib/supabase';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { prompt, agent_json, api_key } = req.body;
  
  if (!prompt || !agent_json || !api_key) {
    return res.status(400).json({ error: 'Missing required fields: prompt, agent_json, api_key' });
  }

  try {
    // 1. Convert prompt + agent JSON to structured plan
    console.log('Generating NTL from prompt and agent data...');
    const ntl = await generateNTL(prompt, agent_json);

    // 2. Generate full React app source code
    console.log('Generating code from NTL...');
    const projectPath = await generateCodeFromNTL(ntl, api_key);

    // 3. Deploy to Vercel
    console.log('Deploying to Vercel...');
    const deployedUrl = await deployToVercel(projectPath);

    if (!deployedUrl) {
      throw new Error('Failed to get deployment URL from Vercel');
    }

    // 4. Log to Supabase
    console.log('Logging project to Supabase...');
    await logProjectToSupabase({ prompt, url: deployedUrl, ntl });

    res.status(200).json({ 
      success: true,
      url: deployedUrl,
      message: 'Site generated and deployed successfully'
    });
  } catch (err) {
    console.error('Error in generate-site API:', err);
    res.status(500).json({ 
      error: 'Internal server error',
      message: err instanceof Error ? err.message : 'Unknown error occurred'
    });
  }
} 