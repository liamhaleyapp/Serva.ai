import fs from 'fs-extra';
import path from 'path';
import { AgentData } from './neuralseek';

export interface CodegenOptions {
  agent: AgentData;
  ntlPlan: any;
  outDir?: string;
}

const defaultOutDir = '/tmp';

export async function generateCodeFromNTL(ntlPlan: any, apiKey: string, agent?: AgentData): Promise<string> {
  const outDir = path.join(defaultOutDir, `project-${Date.now()}`);
  await fs.mkdirp(outDir);
  await fs.mkdirp(path.join(outDir, 'src'));

  // 1. Write package.json
  await fs.writeFile(path.join(outDir, 'package.json'), generatePackageJson());

  // 2. Write tsconfig.json
  await fs.writeFile(path.join(outDir, 'tsconfig.json'), generateTSConfig());

  // 3. Write tailwind.config.js
  await fs.writeFile(path.join(outDir, 'tailwind.config.js'), generateTailwindConfig());

  // 4. Write postcss.config.js
  await fs.writeFile(path.join(outDir, 'postcss.config.js'), generatePostCSSConfig());

  // 5. Write index.html
  await fs.writeFile(path.join(outDir, 'index.html'), generateIndexHtml());

  // 6. Write src/main.tsx
  await fs.writeFile(path.join(outDir, 'src/main.tsx'), generateMainTSX());

  // 7. Write src/App.tsx
  await fs.writeFile(path.join(outDir, 'src/App.tsx'), generateAppTSX(ntlPlan, agent));

  // 8. Write src/index.css
  await fs.writeFile(path.join(outDir, 'src/index.css'), generateIndexCSS());

  // 9. Write agent-specific components
  if (ntlPlan.components && Array.isArray(ntlPlan.components)) {
    for (const comp of ntlPlan.components) {
      const code = await generateAgentComponent(comp, ntlPlan, agent, apiKey);
      await fs.writeFile(path.join(outDir, `src/${comp}.tsx`), code);
    }
  }

  // 10. Write vercel.json
  await fs.writeFile(path.join(outDir, 'vercel.json'), generateVercelConfig());

  return outDir;
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

function generateIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Agent Site</title>
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

function generateAppTSX(ntlPlan: any, agent?: AgentData): string {
  const components = Array.isArray(ntlPlan.components) ? ntlPlan.components : [];
  return `import React from 'react';
${components.map((c: string) => `import ${c} from './${c}';`).join('\n')}

export default function App() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">${agent?.name || 'AI Agent Site'}</h1>
          <p className="text-gray-600">${agent?.capabilities?.join(', ') || ''}</p>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        ${components.map((c: string) => `<${c} />`).join('\n        ')}
      </main>
    </div>
  );
}`;
}

function generateIndexCSS(): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;
`;
}

function generateVercelConfig(): string {
  return JSON.stringify({
    buildCommand: 'npm run build',
    outputDirectory: 'dist',
    framework: 'vite'
  }, null, 2);
}

// --- Agent-aware component generation ---
async function generateAgentComponent(name: string, ntlPlan: any, agent: AgentData | undefined, apiKey: string): Promise<string> {
  // For now, just a placeholder. In a real system, use GPT or templates based on agent capabilities.
  // You can later enhance this to use GPT-4 or import from lib/componentTemplates.
  return `import React from 'react';

export default function ${name}() {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-2">${name}</h2>
      <p className="text-gray-600">This is a placeholder for the ${name} component.</p>
    </div>
  );
}
`;
} 