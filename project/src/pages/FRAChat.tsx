import React, { useMemo, useRef, useState } from 'react';
import axios from 'axios';

type ChatMessage = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
};

const FRAChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([{
    id: 'welcome',
    role: 'assistant',
    content: 'Namaste! I am your Van Adhikar Assistant. Ask me about FRA 2006 or how to use this app.'
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  const apiBase = useMemo(() => {
    const envBase = (import.meta.env.VITE_API_BASE as string) || '';
    if (envBase) return envBase.replace(/\/$/, '');
    const loc = typeof window !== 'undefined' ? window.location : null;
    if (loc && loc.port) {
      // If running vite dev on 5173, backend likely on 5050
      return `http://${loc.hostname}:5050`;
    }
    return 'http://localhost:5050';
  }, []);

  async function handleSend() {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    const newUser: ChatMessage = { id: crypto.randomUUID(), role: 'user', content: text };
    setMessages((prev) => [...prev, newUser]);
    setLoading(true);
    try {
      const history = messages.map((m) => ({ role: m.role, content: m.content }));
      const { data } = await axios.post(`${apiBase}/fra-chat`, { message: text, history }, { timeout: 20000 });
      const answer = (data && data.answer) ? String(data.answer) : 'Sorry, something went wrong.';
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: answer }]);
    } catch (e) {
      setMessages((prev) => [...prev, { id: crypto.randomUUID(), role: 'assistant', content: 'Network error. Please check connection and backend server.' }]);
    } finally {
      setLoading(false);
      queueMicrotask(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }));
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gray-50">
      <div className="mx-auto max-w-7xl px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Dashboard-like menu */}
          <div className="bg-white rounded-xl shadow border p-4">
            <h2 className="text-xl font-semibold text-green-800 mb-4">Dashboard</h2>
            <div className="space-y-3">
              <button onClick={() => setMessages((prev)=>[...prev,{id:crypto.randomUUID(),role:'assistant',content:`FRA Rules (2008 Rules, amendments):\n- Recognition of rights: Individual & Community Forest Rights\n- Gram Sabha: primary authority to initiate, verify claims\n- Committees: FRC, SDLC, DLC roles and timelines\n- Evidence: maps, statements, traditional rights, govt records\n- Appeals & review: provisions for reconsideration\n- Protection from eviction until process completion\n- Minor forest produce rights; community rights; habitat rights` }])} className="w-full text-left p-4 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 cursor-pointer">📜 FRA Rules</button>
              <button onClick={() => setMessages((prev)=>[...prev,{id:crypto.randomUUID(),role:'assistant',content:`Community Rights under FRA:\n- Right to use and collect minor forest produce\n- Rights over community forest resources (CFR)\n- Rights to protect, regenerate, conserve, manage forests\n- Rights over traditional knowledge and biodiversity\n- Rights for community infrastructure and development` }])} className="w-full text-left p-4 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 cursor-pointer">👥 Community Rights</button>
              <button onClick={() => setMessages((prev)=>[...prev,{id:crypto.randomUUID(),role:'assistant',content:`Forest Land Claims process:\n1) Gram Sabha resolution and claim filing\n2) FRC verification and mapping\n3) SDLC appraisal\n4) DLC final decision and title issuance\nTimelines vary by state; evidence includes maps, testimonies, govt records.` }])} className="w-full text-left p-4 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 cursor-pointer">🏞️ Forest Land Claims</button>
              <button onClick={() => setMessages((prev)=>[...prev,{id:crypto.randomUUID(),role:'assistant',content:`Role of Gram Sabha:\n- Initiate and verify claims\n- Constitute FRCs\n- Prepare maps and records of rights\n- Protect against illegal eviction\n- Manage and conserve community forest resources` }])} className="w-full text-left p-4 rounded-lg bg-green-50 border border-green-200 hover:bg-green-100 cursor-pointer">⚖️ Gram Sabha Role</button>
            </div>
          </div>

          {/* Right: Chatbot */}
          <div className="relative rounded-xl shadow border overflow-hidden">
            {/* Jungle / adivasi themed background */}
            <div
              className="absolute inset-0 bg-cover bg-center opacity-20"
              style={{ backgroundImage: "url('https://images.unsplash.com/photo-1523978591478-c753949ff840?q=80&w=1600&auto=format&fit=crop')" }}
            />
            <div className="relative flex flex-col h-full min-h-[28rem]">
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {messages.map((m) => (
                  <div key={m.id} className={`max-w-[85%] md:max-w-[75%] rounded-xl px-4 py-3 shadow ${m.role === 'user' ? 'bg-green-200 text-green-900 self-end ml-auto' : 'bg-yellow-100 text-yellow-900'}`}>
                    {m.content}
                  </div>
                ))}
                {loading && (
                  <div className="bg-yellow-100 text-yellow-900 rounded-xl px-4 py-3 shadow inline-block">Thinking…</div>
                )}
                <div ref={chatEndRef} />
              </div>
              <div className="border-t bg-white p-3">
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="flex-1 rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="Ask about FRA or how to use the app…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                  />
                  <button
                    onClick={handleSend}
                    disabled={loading}
                    className="px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FRAChat;


