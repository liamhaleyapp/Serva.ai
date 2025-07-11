export interface ComponentTemplate {
  name: string;
  description: string;
  code: string;
}

export const componentTemplates: Record<string, ComponentTemplate> = {
  ChatInterface: {
    name: 'ChatInterface',
    description: 'A chat UI for conversational agents',
    code: `import React, { useState } from 'react';

interface Message {
  sender: 'user' | 'agent';
  text: string;
}

export default function ChatInterface() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');

  const sendMessage = () => {
    if (!input.trim()) return;
    setMessages([...messages, { sender: 'user', text: input }]);
    setInput('');
    // Simulate agent reply
    setTimeout(() => setMessages(msgs => [...msgs, { sender: 'agent', text: 'Agent reply...' }]), 500);
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded shadow p-4">
      <div className="h-64 overflow-y-auto mb-2 border rounded p-2 bg-gray-50">
        {messages.map((msg, i) => (
          <div key={i} className={`mb-1 text-sm ${msg.sender === 'user' ? 'text-right' : 'text-left'}`}>{msg.text}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          className="flex-1 border rounded px-2 py-1"
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder="Type a message..."
          aria-label="Message input"
        />
        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
}
`,
  },
  FileUpload: {
    name: 'FileUpload',
    description: 'A file upload component for document processing agents',
    code: `import React, { useRef } from 'react';

export default function FileUpload() {
  const fileInput = useRef<HTMLInputElement>(null);
  const handleUpload = () => {
    if (fileInput.current?.files?.length) {
      // Handle file upload logic
      alert('File uploaded: ' + fileInput.current.files[0].name);
    }
  };
  return (
    <div className="p-4 border rounded-lg">
      <input type="file" ref={fileInput} className="mb-2" aria-label="Upload file" />
      <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleUpload}>Upload</button>
    </div>
  );
}
`,
  },
  DataVisualization: {
    name: 'DataVisualization',
    description: 'A data visualization component for analytics agents',
    code: `import React from 'react';

export default function DataVisualization() {
  // Placeholder for chart or data viz
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-2">Data Visualization</h2>
      <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-400">[Chart Placeholder]</div>
    </div>
  );
}
`,
  },
  FormBuilder: {
    name: 'FormBuilder',
    description: 'A form builder for data collection agents',
    code: `import React, { useState } from 'react';

export default function FormBuilder() {
  const [fields, setFields] = useState([{ label: 'Name', value: '' }]);
  return (
    <form className="p-4 border rounded-lg space-y-2">
      {fields.map((f, i) => (
        <div key={i} className="flex gap-2 items-center">
          <label className="w-24">{f.label}</label>
          <input className="flex-1 border rounded px-2 py-1" value={f.value} onChange={e => {
            const newFields = [...fields];
            newFields[i].value = e.target.value;
            setFields(newFields);
          }} />
        </div>
      ))}
      <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Submit</button>
    </form>
  );
}
`,
  },
  Dashboard: {
    name: 'Dashboard',
    description: 'A dashboard for monitoring agents',
    code: `import React from 'react';

export default function Dashboard() {
  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-2">Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-green-100 p-4 rounded">Metric 1</div>
        <div className="bg-blue-100 p-4 rounded">Metric 2</div>
        <div className="bg-yellow-100 p-4 rounded">Metric 3</div>
        <div className="bg-red-100 p-4 rounded">Metric 4</div>
      </div>
    </div>
  );
}
`,
  },
}; 