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
  name?: string;
  ntl?: string;
  capabilities?: string[];
  neuralSeekRaw: any;
  agentOpenApi?: any;
}

const NEURALSEEK_API_URL = process.env.NEURALSEEK_API_URL || 'https://stagingapi.neuralseek.com/v1/Liam-demo/maistro';
const NEURALSEEK_API_KEY = process.env.NEURALSEEK_API_KEY || '452d320e-5d4fac0e-b0382a8f-f276aebb';

// --- Main NeuralSeek Integration ---
export async function createAgentWithNeuralSeek(prompt: string, context?: string): Promise<AgentData> {
  try {
    // Build payload according to OpenAPI spec
    const payload = {
      agent: 'Create-agent',
      params: {
        use_case_summary: prompt
      },
      options: {
        returnVariables: true,
        returnVariablesExpanded: true
      }
    };
    // context is not used in the new payload structure

    const response = await axios.post(
      NEURALSEEK_API_URL,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'apikey': NEURALSEEK_API_KEY,
        },
        timeout: 60000, // Increased to 60 seconds
      }
    );

    console.log("NeuralSeek raw response:", JSON.stringify(response.data, null, 2));

    // Check if response has error structure
    if (response.data && response.data.error) {
      console.error("NeuralSeek returned error:", response.data.error);
      throw new Error(`NeuralSeek API error: ${response.data.error}`);
    }

    // Extract OpenAPI spec from the answer field
    let agentOpenApi: any = null;
    const answer = response.data?.answer;
    
    if (answer) {
      // Find the first '{' after any "OK" or whitespace
      const firstBrace = answer.indexOf('{');
      if (firstBrace !== -1) {
        const possibleJson = answer.slice(firstBrace);
        try {
          agentOpenApi = JSON.parse(possibleJson);
          console.log("Successfully parsed OpenAPI spec from answer field");
        } catch (e) {
          console.error('Failed to parse OpenAPI JSON from NeuralSeek answer:', e);
          console.error('Attempted to parse:', possibleJson);
        }
      }
    }

    // Fallback: check if response has OpenAPI structure directly
    if (!agentOpenApi && response.data && response.data.openapi) {
      agentOpenApi = response.data;
    } else if (!agentOpenApi && response.data && response.data.info && response.data.paths) {
      // Sometimes the OpenAPI spec is the root object
      agentOpenApi = response.data;
    }

    if (!agentOpenApi) {
      // Log for debugging
      console.error("Could not find OpenAPI spec in NeuralSeek response:", response.data);
      throw new Error('NeuralSeek did not return a valid OpenAPI spec. See logs for details.');
    }

    return {
      name: agentOpenApi.info?.title || "Unknown Agent",
      neuralSeekRaw: response.data,
      agentOpenApi,
    };
  } catch (error: any) {
    // Handle timeout specifically
    if (error.code === 'ECONNABORTED' || error.message.includes('timeout')) {
      console.error('NeuralSeek API timeout - the request took too long to complete');
      throw new Error('NeuralSeek API timeout. The request took longer than 60 seconds. Please try again with a simpler prompt.');
    }
    
    // Handle other errors
    console.error('NeuralSeek API error:', error?.response?.data || error?.message);
    throw error;
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