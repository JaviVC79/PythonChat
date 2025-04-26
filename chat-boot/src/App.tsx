import { useState } from 'react';
import { Send } from 'lucide-react';

import { Buffer } from 'buffer';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

function App() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;
    const idUser = crypto.randomUUID();
    const username = import.meta.env.VITE_REACT_APP_USERNAME;
    const password = import.meta.env.VITE_REACT_APP_PASSWORD;
    const url = import.meta.env.VITE_REACT_APP_URL;
  
    // Codificar las credenciales en Base64
    const credentials = Buffer.from(`${username}:${password}`).toString('base64'); // Codifica a Base64

    const userMessage: Message = { id: idUser, role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Content-Type': 'application/json',
          'Authorization': `Basic ${credentials}`
        },
        body: JSON.stringify({
          model: "gemma3:4b",
          messages: [
            {
              role: "system",
              content: "You are a coding assistant specialized in Python programming. Your goal is to provide accurate, clear, and helpful responses to all Python-related inquiries. Always respond in Spanish. Whenever possible, include the sources where you obtained the information in your answers."
            },
            {
              role: "user",
              content: input
            }
          ],
          stream: false,
          options: {
            temperature: 1,
            top_p: 0.95,
            top_k: 64,
            max_tokens: 512
          }
        })
      });

      const data = await response.json();
      const idAssistant = crypto.randomUUID();
      const assistantMessage: Message = { id: idAssistant, role: 'assistant', content: data.message.content };
      setMessages(prev => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="p-4 bg-blue-600">
          <h1 className="text-xl font-bold text-white">Chat con IA</h1>
        </div>
        
        <div className="h-[500px] overflow-y-auto p-4 space-y-4">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${
                message.role === 'user' ? 'justify-end' : 'justify-start'
              }`}

            >
              <div
                className={`max-w-[80%] rounded-lg p-3 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-800'
                }`}

              >


                {message.content}
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-gray-100 rounded-lg p-3 text-gray-800">
                Escribiendo...
              </div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="p-4 border-t">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Escribe tu mensaje..."
              className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            >
              <Send size={20} />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default App;
