import React from 'react';

export interface ProgressIndicatorProps {
  step: number;
  steps: string[];
}

export default function ProgressIndicator({ step, steps }: ProgressIndicatorProps) {
  return (
    <ol className="flex items-center w-full mb-4">
      {steps.map((label, idx) => (
        <li key={label} className="flex-1 flex items-center">
          <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${idx <= step ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-200 border-gray-300 text-gray-500'}`}>{idx + 1}</div>
          <span className={`ml-2 text-sm ${idx <= step ? 'text-blue-700 font-semibold' : 'text-gray-500'}`}>{label}</span>
          {idx < steps.length - 1 && <div className="flex-1 h-1 mx-2 bg-gray-300" />}
        </li>
      ))}
    </ol>
  );
} 