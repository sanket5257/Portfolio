"use client";

import { useState, useRef, useEffect } from "react";
import GridOverlay from "./GridOverlay";

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function Contact() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([]);
  const [isTyping, setIsTyping] = useState(false);
  const chatRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatRef.current) {
      chatRef.current.scrollTop = chatRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const handleSubmit = async () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setIsTyping(true);

    const updatedMessages = [...messages, { role: "user" as const, content: trimmed }];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: updatedMessages }),
      });
      const data = await res.json();
      setMessages((prev) => [...prev, { role: "assistant", content: data.content }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, something went wrong. Feel free to email Sanket at chougulesanket30@gmail.com!" },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <section
      id="contact"
      className="relative"
      style={{ background: "#eef2f7", padding: "80px 0" }}
    >
      <GridOverlay />
      <div style={{ maxWidth: "72rem", margin: "0 auto", padding: "0 24px" }}>
        {/* Header row */}
        <div className="grid grid-cols-1 md:grid-cols-6 gap-x-6" style={{ marginBottom: 12 }}>
          <div className="md:col-span-2">
            <span
              className="uppercase"
              style={{
                fontSize: 12,
                fontWeight: 400,
                color: "#64748b",
                letterSpacing: "1.2px",
                lineHeight: "16px",
              }}
            >
              PICK MY BRAIN
            </span>
          </div>
        </div>

        {/* Separator line */}
        <div
          style={{ borderTop: "1px solid rgba(148, 163, 184, 0.4)", marginBottom: 48 }}
        />

        {/* Centered chat UI */}
        <div style={{ maxWidth: 640, margin: "0 auto" }}>
          <h2
            className="text-center font-light"
            style={{ fontSize: 32, color: "#1e293b", marginBottom: 12 }}
          >
            Pick my brain!
          </h2>
          <p
            className="text-center"
            style={{ fontSize: 14, color: "#64748b", marginBottom: 32 }}
          >
            Ask anything about frontend development, React, UI/UX, or creative
            coding. You&apos;ll get an instant answer based on my notes, projects,
            and real work.
          </p>

          {/* Chat messages */}
          {messages.length > 0 && (
            <div
              ref={chatRef}
              className="flex flex-col gap-4"
              style={{
                marginBottom: 24,
                maxHeight: 400,
                overflowY: "auto",
                padding: "0 4px",
              }}
            >
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className="flex"
                  style={{
                    justifyContent: msg.role === "user" ? "flex-end" : "flex-start",
                  }}
                >
                  <div
                    style={{
                      maxWidth: "80%",
                      padding: "12px 16px",
                      borderRadius: msg.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                      background: msg.role === "user" ? "white" : "#3b82f6",
                      color: msg.role === "user" ? "#1e293b" : "white",
                      border: msg.role === "user" ? "1px solid rgba(148, 163, 184, 0.3)" : "none",
                      fontSize: 14,
                      lineHeight: 1.6,
                    }}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex" style={{ justifyContent: "flex-start" }}>
                  <div
                    style={{
                      padding: "12px 20px",
                      borderRadius: "16px 16px 16px 4px",
                      background: "#3b82f6",
                      color: "white",
                      fontSize: 14,
                    }}
                  >
                    <span className="inline-flex gap-1">
                      <span className="animate-bounce" style={{ animationDelay: "0ms" }}>&bull;</span>
                      <span className="animate-bounce" style={{ animationDelay: "150ms" }}>&bull;</span>
                      <span className="animate-bounce" style={{ animationDelay: "300ms" }}>&bull;</span>
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input */}
          <div
            data-cursor-target="contact-input"
            className="flex items-center gap-3 rounded-full"
            style={{
              border: "1px solid rgba(148, 163, 184, 0.3)",
              background: "white",
              height: 52,
              padding: "0 10px 0 22px",
              transition: "border-color 0.2s",
            }}
          >
            <input
              type="text"
              placeholder="Ask me about React, animations, UI systems..."
              value={input}
              onChange={(e) => setInput(e.target.value.slice(0, 500))}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              onFocus={(e) => {
                const wrapper = e.target.closest("div");
                if (wrapper) wrapper.style.borderColor = "#3b82f6";
              }}
              onBlur={(e) => {
                const wrapper = e.target.closest("div");
                if (wrapper)
                  wrapper.style.borderColor = "rgba(148, 163, 184, 0.3)";
              }}
              className="flex-1 text-sm outline-none bg-transparent text-slate-800 placeholder:text-slate-400"
            />
            <button
              onClick={handleSubmit}
              disabled={!input.trim()}
              className="rounded-full transition-all shrink-0 flex items-center justify-center"
              style={{
                width: 34,
                height: 34,
                background: input.trim() ? "#3b82f6" : "#e2e8f0",
              }}
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke={input.trim() ? "white" : "#94a3b8"}
                strokeWidth="2"
              >
                <path d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          <div
            className="flex flex-col-reverse md:flex-row justify-between items-start md:items-center gap-1 md:gap-0"
            style={{ marginTop: 10, padding: "0 10px" }}
          >
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              AI powered answers, trained on my knowledge base. It can be wrong sometimes.
            </span>
            <span className="self-end md:self-auto" style={{ fontSize: 11, color: "#94a3b8" }}>
              {input.length}/500
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
