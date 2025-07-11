import fs from 'fs-extra';
import path from 'path';
import { AgentData } from './neuralseek';

export interface CodegenOptions {
  agent: AgentData;
  ntlPlan: any;
  outDir?: string;
}

const defaultOutDir = '/tmp';

export async function generateCodeFromNTL(openApiSpec: any, apiKey: string, agent?: AgentData): Promise<string> {
  const outDir = path.join(defaultOutDir, `project-${Date.now()}`);
  await fs.mkdirp(outDir);
  await fs.mkdirp(path.join(outDir, 'src'));

  // Parse OpenAPI spec to extract endpoints and generate components
  const components = generateComponentsFromOpenAPI(openApiSpec, agent);

  // 1. Write package.json
  await fs.writeFile(path.join(outDir, 'package.json'), generatePackageJson());

  // 2. Write tsconfig.json
  await fs.writeFile(path.join(outDir, 'tsconfig.json'), generateTSConfig());

  // 3. Write tailwind.config.js
  await fs.writeFile(path.join(outDir, 'tailwind.config.js'), generateTailwindConfig());

  // 4. Write postcss.config.js
  await fs.writeFile(path.join(outDir, 'postcss.config.js'), generatePostCSSConfig());

  // 5. Write index.html
  await fs.writeFile(path.join(outDir, 'index.html'), generateIndexHtml(agent));

  // 6. Write src/main.tsx
  await fs.writeFile(path.join(outDir, 'src/main.tsx'), generateMainTSX());

  // 7. Write src/App.tsx
  await fs.writeFile(path.join(outDir, 'src/App.tsx'), generateAppTSX(components, agent, openApiSpec));

  // 8. Write src/index.css
  await fs.writeFile(path.join(outDir, 'src/index.css'), generateIndexCSS());

  // 9. Write agent-specific components
  for (const component of components) {
    await fs.writeFile(path.join(outDir, `src/${component.name}.tsx`), component.code);
  }

  // 10. Write API service
  await fs.writeFile(path.join(outDir, 'src/api.ts'), generateAPIService(openApiSpec, agent));

  // 11. Write vercel.json
  await fs.writeFile(path.join(outDir, 'vercel.json'), generateVercelConfig());

  // 12. Write vite.config.ts
  await fs.writeFile(path.join(outDir, 'vite.config.ts'), generateViteConfig());

  return outDir;
}

interface ComponentInfo {
  name: string;
  code: string;
}

function generateComponentsFromOpenAPI(openApiSpec: any, agent?: AgentData): ComponentInfo[] {
  const components: ComponentInfo[] = [];
  
  // Extract API info
  const apiTitle = openApiSpec.info?.title || agent?.name || 'AI Agent';
  const apiDescription = openApiSpec.info?.description || 'AI Agent Interface';
  const baseUrl = openApiSpec.servers?.[0]?.url || 'https://api.example.com';
  
  // Generate main chat interface for NeuralSeek agents
  if (openApiSpec.paths?.['/maistro']) {
    components.push({
      name: 'ChatInterface',
      code: generateChatInterface(apiTitle, apiDescription)
    });
  }
  
  // Generate agent info component
  components.push({
    name: 'AgentInfo',
    code: generateAgentInfo(apiTitle, apiDescription, agent)
  });
  
  return components;
}

function generateChatInterface(agentName: string, description: string): string {
  return `import React, { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'agent';
  timestamp: Date;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: \`Hello! I'm \${agentName}. \${description}\`,
      sender: 'agent',
      timestamp: new Date()
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!inputText.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      sender: 'user',
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');
    setIsLoading(true);

    try {
      // TODO: Replace with actual API call to your agent
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: inputText })
      });

      const data = await response.json();
      
      const agentMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: data.response || 'I received your message. This is a placeholder response.',
        sender: 'agent',
        timestamp: new Date()
      };

      setMessages(prev => [...prev, agentMessage]);
    } catch (error) {
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again.',
        sender: 'agent',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg">
      <div className="p-6 border-b">
        <h2 className="text-2xl font-bold text-gray-900">Chat with {agentName}</h2>
        <p className="text-gray-600 mt-1">{description}</p>
      </div>
      
      <div className="h-96 overflow-y-auto p-6 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={\`flex \${message.sender === 'user' ? 'justify-end' : 'justify-start'}\`}
          >
            <div
              className={\`flex items-start space-x-2 max-w-xs lg:max-w-md \${message.sender === 'user' ? 'flex-row-reverse space-x-reverse' : ''}\`}
            >
              <div className={\`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center \${message.sender === 'user' ? 'bg-blue-500' : 'bg-gray-500'}\`}>
                {message.sender === 'user' ? (
                  <User className="w-5 h-5 text-white" />
                ) : (
                  <Bot className="w-5 h-5 text-white" />
                )}
              </div>
              <div
                className={\`px-4 py-2 rounded-lg \${message.sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-900'}\`}
              >
                <p className="text-sm">{message.text}</p>
                <p className={\`text-xs mt-1 \${message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'}\`}>
                  {message.timestamp.toLocaleTimeString()}
                </p>
              </div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="flex items-start space-x-2">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-500 flex items-center justify-center">
                <Bot className="w-5 h-5 text-white" />
              </div>
              <div className="px-4 py-2 rounded-lg bg-gray-100">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-6 border-t">
        <div className="flex space-x-4">
          <input
            type="text"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputText.trim() || isLoading}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            <Send className="w-4 h-4" />
            <span>Send</span>
          </button>
        </div>
      </div>
    </div>
  );
}`;
}

function generateAgentInfo(agentName: string, description: string, agent?: AgentData): string {
  return `import React from 'react';
import { Bot, Zap, Shield, Globe } from 'lucide-react';

export default function AgentInfo() {
  return (
    <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg p-6">
      <div className="flex items-center space-x-3 mb-4">
        <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center">
          <Bot className="w-6 h-6 text-white" />
        </div>
        <div>
          <h3 className="text-xl font-bold text-gray-900">{agentName}</h3>
          <p className="text-gray-600">{description}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="flex items-center space-x-2">
          <Zap className="w-5 h-5 text-blue-500" />
          <span className="text-sm text-gray-700">AI-Powered</span>
        </div>
        <div className="flex items-center space-x-2">
          <Shield className="w-5 h-5 text-green-500" />
          <span className="text-sm text-gray-700">Secure</span>
        </div>
        <div className="flex items-center space-x-2">
          <Globe className="w-5 h-5 text-purple-500" />
          <span className="text-sm text-gray-700">Always Available</span>
        </div>
      </div>
      
      {agent?.capabilities && agent.capabilities.length > 0 && (
        <div className="mt-4">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Capabilities:</h4>
          <div className="flex flex-wrap gap-2">
            {agent.capabilities.map((capability, index) => (
              <span
                key={index}
                className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
              >
                {capability}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}`;
}

function generateAPIService(openApiSpec: any, agent?: AgentData): string {
  const baseUrl = openApiSpec.servers?.[0]?.url || 'https://api.example.com';
  
  return `// API Service for ${agent?.name || 'AI Agent'}

const API_BASE_URL = '${baseUrl}';

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
      const response = await fetch(\`\${API_BASE_URL}/maistro\`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': this.apiKey,
        },
        body: JSON.stringify({
          agent: '${agent?.name || 'QueryResponderBot'}',
          params: [
            { name: 'message', value: request.message }
          ],
          options: {
            returnVariables: true
          }
        })
      });

      if (!response.ok) {
        throw new Error(\`API request failed: \${response.status}\`);
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
`;
}

function generatePackageJson(): string {
  return JSON.stringify({
    name: 'ai-agent-site',
    version: '1.0.0',
    private: true,
    scripts: {
      dev: 'vite',
      build: 'vite build',
      preview: 'vite preview'
    },
    dependencies: {
      react: '^18.2.0',
      'react-dom': '^18.2.0',
      'lucide-react': '^0.263.1',
      clsx: '^2.0.0',
      'class-variance-authority': '^0.7.0'
    },
    devDependencies: {
      typescript: '^5.0.0',
      vite: '^4.4.0',
      '@vitejs/plugin-react': '^4.0.0',
      tailwindcss: '^3.3.0',
      autoprefixer: '^10.4.0',
      postcss: '^8.4.0',
      '@types/react': '^18.2.0',
      '@types/react-dom': '^18.2.0'
    }
  }, null, 2);
}

function generateTSConfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target: 'esnext',
      lib: ['dom', 'dom.iterable', 'esnext'],
      allowJs: true,
      skipLibCheck: true,
      strict: true,
      forceConsistentCasingInFileNames: true,
      noEmit: true,
      esModuleInterop: true,
      module: 'esnext',
      moduleResolution: 'node',
      resolveJsonModule: true,
      isolatedModules: true,
      jsx: 'react-jsx',
      baseUrl: '.',
      paths: {}
    },
    include: ['src']
  }, null, 2);
}

function generateTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};`;
}

function generatePostCSSConfig(): string {
  return `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};`;
}

function generateIndexHtml(agent?: AgentData): string {
  const title = agent?.name || 'AI Agent Site';
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${title}</title>
    <link rel="icon" href="/favicon.ico" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

function generateMainTSX(): string {
  return `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
}

function generateAppTSX(components: ComponentInfo[], agent?: AgentData, openApiSpec?: any): string {
  const componentImports = components.map(c => `import ${c.name} from './${c.name}';`).join('\n');
  const componentElements = components.map(c => `<${c.name} />`).join('\n        ');
  
  return `import React from 'react';
${componentImports}

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">${agent?.name || 'AI Agent'}</h1>
          <p className="text-gray-600 mt-2">${openApiSpec?.info?.description || 'AI-powered assistant'}</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <AgentInfo />
        ${componentElements}
      </main>
      
      <footer className="bg-white border-t mt-16">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <p className="text-center text-gray-500 text-sm">
            Powered by AI • Built with React & Tailwind CSS
          </p>
        </div>
      </footer>
    </div>
  );
}`;
}

function generateIndexCSS(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Custom scrollbar for chat */
.overflow-y-auto::-webkit-scrollbar {
  width: 6px;
}

.overflow-y-auto::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

.overflow-y-auto::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}
`;
}

function generateVercelConfig(): string {
  return JSON.stringify({
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    framework: 'vite'
  }, null, 2);
}

function generateViteConfig(): string {
  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: true
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})`;
} 