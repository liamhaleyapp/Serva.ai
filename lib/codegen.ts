import fs from 'fs-extra';
import path from 'path';
import { generateComponent, NTLPlan } from './gpt';

export async function generateCodeFromNTL(ntl: NTLPlan, apiKey: string): Promise<string> {
  const folder = path.join('/tmp', `project-${Date.now()}`);
  await fs.mkdirp(folder);
  
  const components = ntl.components || [];

  // Generate component files
  for (const name of components) {
    const code = await generateComponent(name, ntl, apiKey);
    await fs.writeFile(path.join(folder, `${name}.tsx`), code);
  }

  // Generate package.json
  await fs.writeFile(path.join(folder, 'package.json'), generatePackageJson());

  // Generate App.tsx
  await fs.writeFile(path.join(folder, 'App.tsx'), generateAppWrapper(components));

  // Generate index.html
  await fs.writeFile(path.join(folder, 'index.html'), generateIndexHtml());

  // Generate tailwind.config.js
  await fs.writeFile(path.join(folder, 'tailwind.config.js'), generateTailwindConfig());

  // Generate vercel.json
  await fs.writeFile(path.join(folder, 'vercel.json'), generateVercelConfig());

  console.log(`Generated project at: ${folder}`);
  return folder;
}

function generatePackageJson(): string {
  return JSON.stringify({
    name: "ai-generated-site",
    version: "1.0.0",
    private: true,
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview"
    },
    dependencies: {
      "react": "^18.2.0",
      "react-dom": "^18.2.0"
    },
    devDependencies: {
      "@types/react": "^18.2.0",
      "@types/react-dom": "^18.2.0",
      "@vitejs/plugin-react": "^4.0.0",
      "autoprefixer": "^10.4.0",
      "postcss": "^8.4.0",
      "tailwindcss": "^3.3.0",
      "typescript": "^5.0.0",
      "vite": "^4.4.0"
    }
  }, null, 2);
}

function generateAppWrapper(components: string[]): string {
  return `import React from 'react';
${components.map(c => `import ${c} from './${c}';`).join('\n')}

export default function App() {
  return (
    <div className="min-h-screen bg-white text-black">
      <header className="bg-gray-50 border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">AI Generated Site</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-8">
        ${components.map(c => `<${c} />`).join('\n        ')}
      </main>
    </div>
  );
}`;
}

function generateIndexHtml(): string {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>AI Generated Site</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>`;
}

function generateTailwindConfig(): string {
  return `/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}`;
}

function generateVercelConfig(): string {
  return JSON.stringify({
    buildCommand: "npm run build",
    outputDirectory: "dist",
    framework: "vite"
  }, null, 2);
} 