import axios from 'axios';

// --- TypeScript Interfaces ---
export interface NeuralSeekAgentRequest {
  prompt: string;
  context?: string;
  [key: string]: any;
}

export interface NeuralSeekAgentResponse {
  agent_name: string;
  ntl_script: string;
  capabilities: string[];
  raw: any;
}

export interface AgentData {
  name: string;
  ntl: string;
  capabilities: string[];
  neuralSeekRaw: any;
}

const NEURALSEEK_API_URL = process.env.NEURALSEEK_API_URL || 'https://stagingapi.neuralseek.com/v1/Liam-demo/maistro';
const NEURALSEEK_API_KEY = process.env.NEURALSEEK_API_KEY || '452d320e-5d4fac0e-b0382a8f-f276aebb';

// --- Main NeuralSeek Integration ---
export async function createAgentWithNeuralSeek(prompt: string, context?: string): Promise<AgentData> {
  try {
    const payload: NeuralSeekAgentRequest = { prompt };
    if (context) payload.context = context;

    const response = await axios.post(
      NEURALSEEK_API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': NEURALSEEK_API_KEY,
        },
        timeout: 30000,
      }
    );

    // Defensive: Try to parse and extract agent data
    let agent_name = '';
    let ntl_script = '';
    let capabilities: string[] = [];
    try {
      agent_name = response.data.agent_name || '';
      ntl_script = response.data.ntl_script || '';
      // Try to extract capabilities from NTL or response
      if (Array.isArray(response.data.capabilities)) {
        capabilities = response.data.capabilities;
      } else if (ntl_script) {
        capabilities = extractCapabilitiesFromNTL(ntl_script);
      }
    } catch (err) {
      // fallback: just use empty/defaults
    }

    return {
      name: agent_name,
      ntl: ntl_script,
      capabilities,
      neuralSeekRaw: response.data,
    };
  } catch (error: any) {
    // Robust error handling
    return {
      name: '',
      ntl: '',
      capabilities: [],
      neuralSeekRaw: { error: error?.message || 'Unknown error', data: error?.response?.data },
    };
  }
}

// --- Utility: Extract capabilities from NTL script (simple regex or JSON parse) ---
export function extractCapabilitiesFromNTL(ntl: string): string[] {
  try {
    // Try to parse as JSON first
    const ntlObj = JSON.parse(ntl);
    if (Array.isArray(ntlObj.capabilities)) {
      return ntlObj.capabilities;
    }
  } catch {
    // fallback: regex for common capability keywords
    const matches = ntl.match(/capabilities\s*[:=]\s*\[(.*?)\]/i);
    if (matches && matches[1]) {
      return matches[1].split(',').map(s => s.replace(/['"\s]/g, '').trim()).filter(Boolean);
    }
  }
  return [];
} 