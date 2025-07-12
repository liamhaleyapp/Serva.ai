// API Service for BlogCraftAI

const API_BASE_URL = 'https://stagingapi.neuralseek.com/v1/{instance}';

export interface ChatRequest {
  message: string;
  context?: string;
}

export interface ChatResponse {
  response: string;
  confidence?: number;
  sources?: string[];
}

export class APIService {
  private apiKey: string;

  constructor(apiKey?: string) {
    this.apiKey = apiKey || '';
  }

  async sendMessage(request: ChatRequest): Promise<ChatResponse> {
    try {
      const response = await fetch(`${API_BASE_URL}/maistro`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({
          agent: 'BlogCraftAI',
          params: [
            { name: 'message', value: request.message }
          ],
          options: {
            returnVariables: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(`API request failed: ${response.status}`);
      }

      const data = await response.json();
      return {
        response: data.answer || 'No response received',
        confidence: data.confidence,
        sources: data.sourceParts
      };
    } catch (error) {
      console.error('API call failed:', error);
      throw error;
    }
  }
}

export const apiService = new APIService();
