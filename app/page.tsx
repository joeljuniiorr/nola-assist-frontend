"use client";

import { useEffect } from "react";
import "@n8n/chat/style.css";
import { createChat } from "@n8n/chat";

const stats = [
  { value: "500+", label: "restaurantes atendidos" },
  { value: "R$ 26 mi", label: "gerenciados por mês" },
  { value: "340 mil+", label: "pedidos por dia" },
];

const modules = [
  {
    tag: "Operação & PDV",
    title: "Frente de caixa, mesas e delivery integrados",
    description: "Organize o atendimento e ganhe agilidade na operação.",
  },
  {
    tag: "Financeiro",
    title: "DRE, fluxo de caixa e conciliação",
    description: "Mais controle financeiro e menos dependência de planilhas.",
  },
  {
    tag: "Compras & Estoque",
    title: "Gestão de insumos e CMV",
    description: "Tenha mais previsibilidade e reduza desperdícios.",
  },
  {
    tag: "Pessoas",
    title: "Padronização e performance da equipe",
    description: "Mais consistência operacional no dia a dia.",
  },
  {
    tag: "Dados",
    title: "Indicadores, alertas e inteligência",
    description: "Transforme dados da operação em decisões melhores.",
  },
];

const quickQuestions = [
  "Como cadastrar uma impressora?",
  "Meu pedido não está imprimindo. O que fazer?",
  "Como abrir e fechar caixa?",
  "Como cadastrar um produto novo?",
  "Como consultar relatórios financeiros?",
  "Como falar com o suporte?",
];

export default function Home() {
  useEffect(() => {
    const target = document.getElementById("n8n-chat");

    if (target) {
      target.innerHTML = "";
    }

    createChat({
      webhookUrl: process.env.NEXT_PUBLIC_N8N_CHAT_URL || "",
      target: "#n8n-chat",
      mode: "fullscreen",
      showWelcomeScreen: true,
      loadPreviousSession: false,
      enableStreaming: false,
      defaultLanguage: "en",
      initialMessages: [
        "Olá! Sou o Nola Assist.",
        "Posso ajudar com dúvidas operacionais e de suporte.",
      ],
      i18n: {
        en: {
          title: "Nola Assist",
          subtitle: "Assistente de suporte e dúvidas operacionais",
          getStarted: "Nova conversa",
          inputPlaceholder: "Digite sua dúvida aqui",
          closeButtonTooltip: "Fechar chat",
          footer: "",
        },
      },
    });
  }, []);

  function fillChatInput(text: string) {
    const input = document.querySelector(
      "#n8n-chat textarea, #n8n-chat input"
    ) as HTMLTextAreaElement | HTMLInputElement | null;

    if (!input) return;

    const prototype =
      input instanceof HTMLTextAreaElement
        ? HTMLTextAreaElement.prototype
        : HTMLInputElement.prototype;

    const descriptor = Object.getOwnPropertyDescriptor(prototype, "value");
    descriptor?.set?.call(input, text);

    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.focus();
  }

  return (
    <main className="page">
      <div className="background-orb orb-1" />
      <div className="background-orb orb-2" />

      <section className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Protótipo funcional</span>

          <img
            src="/nola-logo-preto.svg"
            alt="Logo da Nola"
            className="brand-logo"
          />

          <h1>Assistente inteligente para a operação do restaurante</h1>

          <p>
            Um front mais visual para o Nola Assist, com identidade alinhada à
            marca e chat conectado ao n8n, Groq e Google Sheets.
          </p>

          <div className="stat-grid">
            {stats.map((item) => (
              <div className="stat-card" key={item.label}>
                <strong className="stat-value">{item.value}</strong>
                <span className="stat-label">{item.label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="hero-panel">
          <div className="panel-header">
            <span className="panel-badge">Ecossistema Nola</span>
            <h2>Módulos que o suporte pode orientar</h2>
            <p>
              Organize a experiência do usuário com base nos principais pilares
              da operação.
            </p>
          </div>

          <div className="module-grid">
            {modules.map((item) => (
              <article className="module-card" key={item.title}>
                <span>{item.tag}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="chat-shell">
        <div className="chat-header">
          <div>
            <span className="panel-badge">Atalhos rápidos</span>
            <h2>Faça um teste com perguntas prontas</h2>
            <p>
              Clique em uma sugestão para preencher automaticamente o campo do
              chat.
            </p>
          </div>
        </div>

        <div className="quick-actions">
          {quickQuestions.map((question) => (
            <button
              key={question}
              type="button"
              className="quick-btn"
              onClick={() => fillChatInput(question)}
            >
              {question}
            </button>
          ))}
        </div>

        <div className="chat-card">
          <div id="n8n-chat" />
        </div>

        <p className="footer-note">
          Ambiente de demonstração do Nola Assist.
        </p>
      </section>
    </main>
  );
}