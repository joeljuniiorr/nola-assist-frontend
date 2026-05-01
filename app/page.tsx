"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Message = {
  id: string;
  role: "assistant" | "user";
  text: string;
};

const quickQuestions = [
  "Como abrir e fechar caixa no PDV?",
  "Como acompanhar fluxo de caixa e DRE?",
  "Como cadastrar ficha técnica e acompanhar CMV?",
];

function extractResponse(raw: string) {
  try {
    const parsed = JSON.parse(raw);

    if (typeof parsed === "string") return parsed;
    if (parsed?.text) return parsed.text;
    if (parsed?.output) return parsed.output;
    if (parsed?.response) return parsed.response;
    if (parsed?.resposta_gerada) return parsed.resposta_gerada;

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
              className="chat-link"
            >
              {part}
            </a>
          );
        }

        return (
          <span key={index} style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
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
      id: "welcome-1",
      role: "assistant",
      text: "Olá! Sou o Nola Assist.",
    },
    {
      id: "welcome-2",
      role: "assistant",
      text: "Posso ajudar com dúvidas operacionais, suporte e uso da plataforma.",
    },
  ]);

  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState("");
  const [chatOpen, setChatOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let savedSession = localStorage.getItem("nola_assist_session");

    if (!savedSession) {
      savedSession =
        typeof crypto !== "undefined" && "randomUUID" in crypto
          ? crypto.randomUUID()
          : `session-${Date.now()}`;

      localStorage.setItem("nola_assist_session", savedSession);
    }

    setSessionId(savedSession);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading, chatOpen]);

  async function sendMessage(question: string) {
  const cleanQuestion = question.trim();
  if (!cleanQuestion || loading) return;

  setChatOpen(true);

  const currentSessionId =
    sessionId ||
    (typeof crypto !== "undefined" && "randomUUID" in crypto
      ? crypto.randomUUID()
      : `session-${Date.now()}`);

  if (!sessionId) {
    setSessionId(currentSessionId);
    localStorage.setItem("nola_assist_session", currentSessionId);
  }

  setMessages((prev) => [
    ...prev,
    {
      id: `user-${Date.now()}`,
      role: "user",
      text: cleanQuestion,
    },
  ]);

  setInput("");
  setLoading(true);

  try {
    const response = await fetch(process.env.NEXT_PUBLIC_N8N_CHAT_URL || "", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "sendMessage",
        sessionId: currentSessionId,
        chatInput: cleanQuestion,
      }),
    });

    const raw = await response.text();
    const answer = extractResponse(raw);

    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-${Date.now()}`,
        role: "assistant",
        text: answer || "Não foi possível gerar a resposta no momento.",
      },
    ]);
  } catch {
    setMessages((prev) => [
      ...prev,
      {
        id: `assistant-error-${Date.now()}`,
        role: "assistant",
        text: "Ocorreu um erro ao consultar o assistente. Tente novamente.",
      },
    ]);
  } finally {
    setLoading(false);
  }
}

  async function handleSend(e?: FormEvent) {
  e?.preventDefault();
  await sendMessage(input);


    const question = input.trim();
    if (!question || loading) return;

    const currentSessionId =
      sessionId ||
      (typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `session-${Date.now()}`);

    if (!sessionId) {
      setSessionId(currentSessionId);
      localStorage.setItem("nola_assist_session", currentSessionId);
    }

    setMessages((prev) => [
      ...prev,
      {
        id: `user-${Date.now()}`,
        role: "user",
        text: question,
      },
    ]);

    setInput("");
    setLoading(true);

    try {
      const response = await fetch(process.env.NEXT_PUBLIC_N8N_CHAT_URL || "", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "sendMessage",
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
          role: "assistant",
          text: answer || "Não foi possível gerar a resposta no momento.",
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `assistant-error-${Date.now()}`,
          role: "assistant",
          text: "Ocorreu um erro ao consultar o assistente. Tente novamente.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="nola-page">
      <header className="topbar">
        <div className="container topbar-inner">
          <div className="brand">
            <img src="/nola-logo-preto.svg" alt="Nola" className="brand-logo" />
          </div>

          <nav className="topbar-nav">
            <a href="#">Ecossistema</a>
            <a href="#">Para seu negócio</a>
            <a href="#">Franqueadoras</a>
            <a href="#">Parceiros</a>
            <a href="#">Planos</a>
            <a href="#">Blog</a>
          </nav>

          <a href="#" className="demo-btn">
            Agendar Demo →
          </a>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-grid" />

        <div className="container hero-content">
          <div className="hero-left">
            <img src="/nola-logo-preto.svg" alt="Nola" className="hero-logo" />

            <p className="hero-kicker">
              De donos de restaurante, para donos de restaurante.
            </p>

            <h1 className="hero-title">
              Agora seu restaurante <span>pensa</span>
            </h1>

            <p className="hero-description">
              O Nola integra PDV, financeiro, estoque, equipe e inteligência em
              um único ecossistema, criado por quem já viveu essas dores.
            </p>

            <a href="#" className="hero-outline-btn">
              Conhecer o Ecossistema
            </a>
          </div>

          <div className="hero-right">
            <div className="phone-showcase">
              <div className="phone-card phone-card-left">
                <div className="phone-top">nola</div>
                <div className="phone-body">
                  <div className="phone-line big" />
                  <div className="phone-line" />
                  <div className="phone-line" />
                  <div className="phone-button" />
                </div>
              </div>

              <div className="phone-card phone-card-center">
                <div className="phone-top">Painel</div>
                <div className="phone-body">
                  <div className="mini-grid">
                    <div className="mini-box" />
                    <div className="mini-box" />
                    <div className="mini-box" />
                    <div className="mini-box" />
                  </div>
                  <div className="phone-chart bars" />
                  <div className="phone-chart line" />
                </div>
              </div>

              <div className="hero-stats-card">
                <div className="stat-item">
                  <strong>500+</strong>
                  <span>restaurantes atendidos</span>
                </div>
                <div className="stat-item">
                  <strong>R$ 26 mi</strong>
                  <span>gerenciados por mês</span>
                </div>
                <div className="stat-item">
                  <strong>340 mil+</strong>
                  <span>pedidos por dia</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <button
        className={`chat-fab ${chatOpen ? "hidden" : ""}`}
        onClick={() => setChatOpen(true)}
        aria-label="Abrir chat"
      >
        <span className="chat-fab-icon">💬</span>
      </button>

      <div className={`chat-widget ${chatOpen ? "open" : ""}`}>
        <div className="chat-widget-header">
          <div className="chat-widget-brand">
            <div className="chat-widget-dot" />
            <div>
              <h2>Nola Assist</h2>
              <p>Atendimento rápido e dúvidas operacionais</p>
            </div>
          </div>

          <button
            className="chat-close-btn"
            onClick={() => setChatOpen(false)}
            aria-label="Fechar chat"
          >
            ✕
          </button>
        </div>

        <div className="chat-widget-quick">
          <div className="quick-list">
            {quickQuestions.map((question) => (
              <button
                key={question}
                type="button"
                className="quick-chip"
                onClick={() => sendMessage(question)}
              >
                {question}
              </button>
            ))}
          </div>
        </div>

        <div className="chat-widget-body">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`message-row ${message.role === "user" ? "user" : "assistant"}`}
            >
              <div className={`message-bubble ${message.role}`}>
                <LinkifiedText text={message.text} />
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row assistant">
              <div className="message-bubble assistant">Pensando...</div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        <form className="chat-widget-input" onSubmit={handleSend}>
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Digite sua dúvida aqui"
          />
          <button type="submit" disabled={loading}>
            ➤
          </button>
        </form>
      </div>
    </main>
  );
}