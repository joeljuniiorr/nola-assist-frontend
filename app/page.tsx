'use client';

import { FormEvent, useEffect, useRef, useState } from 'react';

type Message = {
  id: string;
  role: 'assistant' | 'user';
  text: string;
};

function extractResponse(raw: string) {
  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed === 'string') return parsed;
    if (parsed?.text) return parsed.text;
    if (parsed?.output) return parsed.output;
    if (parsed?.response) return parsed.response;

    return raw;
  } catch {
    return raw;
  }
}

function LinkifiedText({ text }: { text: string }) {
  const parts = text.split(/(https?:\/\/[^\s]+)/g);

  return (
    <>
      {parts.map((part, index) => {
        const isUrl = /^https?:\/\/[^\s]+$/.test(part);

        if (isUrl) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                color: '#1d4ed8',
                textDecoration: 'underline',
                wordBreak: 'break-word',
              }}
            >
              {part}
            </a>
          );
        }

        return (
          <span
            key={index}
            style={{
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-word',
            }}
          >
            {part}
          </span>
        );
      })}
    </>
  );
}

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'assistant',
      text: 'Olá! Sou o Nola Assist.',
    },
    {
      id: 'welcome-2',
      role: 'assistant',
      text: 'Posso ajudar com dúvidas operacionais e de suporte.',
    },
  ]);

  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let savedSession = localStorage.getItem('nola_assist_session');

    if (!savedSession) {
      savedSession =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `session-${Date.now()}`;

      localStorage.setItem('nola_assist_session', savedSession);
    }

    setSessionId(savedSession);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  async function handleSend(e?: FormEvent) {
    e?.preventDefault();

    const question = input.trim();
    if (!question || loading) return;

    const currentSessionId =
      sessionId ||
      (typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `session-${Date.now()}`);

    if (!sessionId) {
      setSessionId(currentSessionId);
      localStorage.setItem('nola_assist_session', currentSessionId);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: 'user',
        text: question,
      },
    ]);

    setInput('');
    setLoading(true);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_N8N_CHAT_URL || '', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'sendMessage',
          sessionId: currentSessionId,
          chatInput: question,
        }),
      });

      const raw = await response.text();
      const answer = extractResponse(raw);

      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-${Date.now()}`,
          role: 'assistant',
          text: answer || 'Não foi possível gerar a resposta no momento.',
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: 'assistant',
          text: 'Ocorreu um erro ao consultar o assistente. Tente novamente.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="page">
      <div className="shell">
        <div className="hero">
          <span className="badge">Protótipo funcional</span>
          <h1>Nola Assist</h1>
          <p>
            Chat de suporte orientado por IA, conectado ao n8n, Groq e Google
            Sheets.
          </p>
        </div>

        <div
          style={{
            background: '#fff',
            borderRadius: 24,
            boxShadow: '0 20px 50px rgba(16, 24, 40, 0.12)',
            overflow: 'hidden',
            minHeight: '70vh',
            display: 'flex',
            flexDirection: 'column',
          }}
        >
          <div
            style={{
              background: '#0b1c5a',
              color: '#fff',
              padding: '28px 24px',
            }}
          >
            <h2
              style={{
                margin: '0 0 10px',
                fontSize: 24,
              }}
            >
              Nola Assist
            </h2>
            <p
              style={{
                margin: 0,
                opacity: 0.95,
              }}
            >
              Assistente de suporte e dúvidas operacionais
            </p>
          </div>

          <div
            style={{
              background: '#e5e7eb',
              padding: 16,
              flex: 1,
              maxHeight: '55vh',
              overflowY: 'auto',
            }}
          >
            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
            >
              {messages.map((message) => (
                <div
                  key={message.id}
                  style={{
                    alignSelf:
                      message.role === 'user' ? 'flex-end' : 'flex-start',
                    maxWidth: '82%',
                    background:
                      message.role === 'user' ? '#20c5b3' : '#ffffff',
                    color: message.role === 'user' ? '#ffffff' : '#111827',
                    borderRadius: 12,
                    padding: '16px 18px',
                    lineHeight: 1.7,
                    fontSize: 15,
                    boxShadow:
                      message.role === 'user'
                        ? 'none'
                        : '0 1px 2px rgba(0,0,0,0.04)',
                  }}
                >
                  <LinkifiedText text={message.text} />
                </div>
              ))}

              {loading && (
                <div
                  style={{
                    alignSelf: 'flex-start',
                    maxWidth: '82%',
                    background: '#ffffff',
                    color: '#111827',
                    borderRadius: 12,
                    padding: '16px 18px',
                    lineHeight: 1.7,
                    fontSize: 15,
                  }}
                >
                  Pensando...
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </div>

          <form
            onSubmit={handleSend}
            style={{
              display: 'flex',
              gap: 12,
              padding: 14,
              background: '#fff',
              borderTop: '1px solid #d1d5db',
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Digite sua dúvida aqui"
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                fontSize: 16,
                color: '#111827',
                background: 'transparent',
              }}
            />

            <button
              type="submit"
              disabled={loading}
              style={{
                border: 'none',
                background: 'transparent',
                color: '#98a2b3',
                fontSize: 22,
                cursor: 'pointer',
              }}
            >
              ➤
            </button>
          </form>
        </div>
      </div>
    </main>
  );
}