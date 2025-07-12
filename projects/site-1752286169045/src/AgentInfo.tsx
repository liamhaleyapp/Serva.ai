import React from 'react';
import { Bot, Zap, Shield, Globe } from 'lucide-react';

export default function AgentInfo({ agentName, agentDescription }: { agentName: string, agentDescription: string }) {
  return (
    <div className="bg-white rounded shadow p-6 mb-6">
      <h2 className="text-2xl font-bold mb-2">{agentName}</h2>
      <p className="text-gray-700">{agentDescription}</p>
    </div>
  );
}
