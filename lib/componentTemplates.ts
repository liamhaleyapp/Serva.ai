// All keys in componentTemplates must be strings. If you see a type error about 'number' not assignable to 'Record<string, ComponentTemplate>', check for accidental numeric keys below. This file is type-safe as written.
export interface ComponentTemplate {
  name: string;
  description: string;
  code: string;
}

export const componentTemplates: Record<string, ComponentTemplate> = {
  ChatInterface: {
    name: 'ChatInterface',
    description: 'A chat UI for conversational agents',
    code: 'import React, { useState } from \'react\';\n\ninterface Message {\n  sender: \'user\' | \'agent\';\n  text: string;\n}\n\nexport default function ChatInterface() {\n  const [messages, setMessages] = useState<Message[]>([]);\n  const [input, setInput] = useState(\'\');\n\n  const sendMessage = () => {\n    if (!input.trim()) return;\n    setMessages([...messages, { sender: \'user\', text: input }]);\n    setInput(\'\');\n    // Simulate agent reply\n    setTimeout(() => setMessages(msgs => [...msgs, { sender: \'agent\', text: \'Agent reply...\' }]), 500);\n  };\n\n  return (\n    <div className="w-full max-w-lg mx-auto bg-white rounded shadow p-4">\n      <div className="h-64 overflow-y-auto mb-2 border rounded p-2 bg-gray-50">\n        {messages.map((msg, i) => (\n          <div key={i} className={"mb-1 text-sm " + (msg.sender === \'user\' ? \'text-right\' : \'text-left\')}>{msg.text}</div>\n        ))}\n      </div>\n      <div className="flex gap-2">\n        <input\n          className="flex-1 border rounded px-2 py-1"\n          value={input}\n          onChange={e => setInput(e.target.value)}\n          onKeyDown={e => e.key === \'Enter\' && sendMessage()}\n          placeholder="Type a message..."\n          aria-label="Message input"\n        />\n        <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={sendMessage}>Send</button>\n      </div>\n    </div>\n  );\n}\n',
  },
  FileUpload: {
    name: 'FileUpload',
    description: 'A file upload component for document processing agents',
    code: 'import React, { useRef } from \'react\';\n\nexport default function FileUpload() {\n  const fileInput = useRef<HTMLInputElement>(null);\n  const handleUpload = () => {\n    if (fileInput.current?.files?.length) {\n      // Handle file upload logic\n      alert(\'File uploaded: \' + fileInput.current.files[0].name);\n    }\n  };\n  return (\n    <div className="p-4 border rounded-lg">\n      <input type="file" ref={fileInput} className="mb-2" aria-label="Upload file" />\n      <button className="bg-blue-600 text-white px-3 py-1 rounded" onClick={handleUpload}>Upload</button>\n    </div>\n  );\n}\n',
  },
  DataVisualization: {
    name: 'DataVisualization',
    description: 'A data visualization component for analytics agents',
    code: 'import React from \'react\';\n\nexport default function DataVisualization() {\n  // Placeholder for chart or data viz\n  return (\n    <div className="p-4 border rounded-lg">\n      <h2 className="text-xl font-bold mb-2">Data Visualization</h2>\n      <div className="h-32 bg-gray-100 flex items-center justify-center text-gray-400">[Chart Placeholder]</div>\n    </div>\n  );\n}\n',
  },
  FormBuilder: {
    name: 'FormBuilder',
    description: 'A form builder for data collection agents',
    code: 'import React, { useState } from \'react\';\n\nexport default function FormBuilder() {\n  const [fields, setFields] = useState([{ label: \'Name\', value: \'\' }]);\n  return (\n    <form className="p-4 border rounded-lg space-y-2">\n      {fields.map((f, i) => (\n        <div key={i} className="flex gap-2 items-center">\n          <label className="w-24">{f.label}</label>\n          <input className="flex-1 border rounded px-2 py-1" value={f.value} onChange={e => {\n            const newFields = [...fields];\n            newFields[i].value = e.target.value;\n            setFields(newFields);\n          }} />\n        </div>\n      ))}\n      <button type="submit" className="bg-blue-600 text-white px-3 py-1 rounded">Submit</button>\n    </form>\n  );\n}\n',
  },
  Dashboard: {
    name: 'Dashboard',
    description: 'A dashboard for monitoring agents',
    code: 'import React from \'react\';\n\nexport default function Dashboard() {\n  return (\n    <div className="p-4 border rounded-lg">\n      <h2 className="text-xl font-bold mb-2">Dashboard</h2>\n      <div className="grid grid-cols-2 gap-4">\n        <div className="bg-green-100 p-4 rounded">Metric 1</div>\n        <div className="bg-blue-100 p-4 rounded">Metric 2</div>\n        <div className="bg-yellow-100 p-4 rounded">Metric 3</div>\n        <div className="bg-red-100 p-4 rounded">Metric 4</div>\n      </div>\n    </div>\n  );\n}\n',
  },
}; 