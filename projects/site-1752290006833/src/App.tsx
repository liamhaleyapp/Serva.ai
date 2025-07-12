import React from 'react';
import Postmaistro from './Postmaistro';
import AgentInfo from './AgentInfo';

export default function App() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-gray-900">DataInsightBot</h1>
          <p className="text-gray-600 mt-2">NeuralSeek - The business LLM accelerator</p>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <AgentInfo agentName="DataInsightBot" agentDescription="NeuralSeek - The business LLM accelerator" />
        <Postmaistro />
        <AgentInfo />
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
}