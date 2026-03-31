"use client";

import { useState, useRef, useEffect } from "react";
import GridOverlay from "./GridOverlay";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const KNOWLEDGE: Record<string, string> = {
  default:
    "I'm Sanket Chougule, a creative web developer based in Maharashtra, India. I specialize in frontend development, UI/UX design, and crafting immersive digital experiences with React.js, Next.js, GSAP, and Tailwind CSS. Ask me anything about my work, skills, or experience!",
  skills:
    "My core stack includes HTML, CSS, JavaScript, React.js, Next.js, TypeScript, Tailwind CSS, Bootstrap, GSAP, Framer Motion, and Figma. I also work with Git, GitHub, WordPress, and have foundational knowledge of C, C++, and Java. I'm passionate about creative animations and pixel-perfect UI.",
  experience:
    "I'm currently a Frontend Developer at Shivneri Systems (June 2025–Present), working with WordPress, React.js, Tailwind CSS, and UI/UX principles. Before that, I was at RS Soft Tech (March–May 2025) building modern sites with React.js, Next.js, and Tailwind. I started my career as an intern at Stormsofts Technology (June–August 2024) where I learned responsive design fundamentals.",
  projects:
    "My key projects include: 1) This portfolio — built with Next.js, TypeScript, and Tailwind CSS with interactive draggable elements and custom cursor systems. 2) My previous portfolio — a cinematic experience using Next.js, GSAP scroll-triggered animations, and Tailwind CSS. 3) A Zentry Clone — a high-fidelity recreation of a motion-heavy homepage using React, Framer Motion, and Tailwind CSS.",
  work:
    "I specialize in web design and development for clients who care about details. Building upon my experiences in digital design across various projects, my goal is to create high-end web experiences that make your brand go from a 'meh' to a 'woah'. I design to impress and build to convert.",
  contact:
    "You can reach me at sanket.chougule@outlook.com. Find me on LinkedIn (linkedin.com/in/sanket-chougule5257), Dribbble (dribbble.com/sanket-chougule), and Instagram (@ft.leo_o). I'm always open to freelance opportunities and interesting collaborations!",
  hire:
    "I'd love to work with you! I bring expertise in React.js, Next.js, creative animations with GSAP, and pixel-perfect UI implementation. I'm currently open to frontend developer roles, freelance projects, and creative collaborations. Let's connect — email me at sanket.chougule@outlook.com or message me on LinkedIn!",
};

function getResponse(input: string): string {
  const q = input.toLowerCase();
  if (q.includes("skill") || q.includes("tech") || q.includes("stack") || q.includes("know") || q.includes("tool"))
    return KNOWLEDGE.skills;
  if (q.includes("experience") || q.includes("work at") || q.includes("company") || q.includes("job"))
    return KNOWLEDGE.experience;
  if (q.includes("project") || q.includes("portfolio") || q.includes("built") || q.includes("made") || q.includes("build"))
    return KNOWLEDGE.projects;
  if (q.includes("do") || q.includes("about") || q.includes("who") || q.includes("what"))
    return KNOWLEDGE.work;
  if (q.includes("contact") || q.includes("email") || q.includes("reach") || q.includes("linkedin") || q.includes("social"))
    return KNOWLEDGE.contact;
  if (q.includes("hire") || q.includes("freelance") || q.includes("available") || q.includes("open") || q.includes("collaborate"))
    return KNOWLEDGE.hire;
  return KNOWLEDGE.default;
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

  const handleSubmit = () => {
    const trimmed = input.trim();
    if (!trimmed) return;

    setMessages((prev) => [...prev, { role: "user", content: trimmed }]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      const response = getResponse(trimmed);
      setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      setIsTyping(false);
    }, 800 + Math.random() * 700);
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
            className="flex justify-between items-center"
            style={{ marginTop: 10, padding: "0 10px" }}
          >
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              AI powered answers, trained on my knowledge base. It can be wrong sometimes.
            </span>
            <span style={{ fontSize: 11, color: "#94a3b8" }}>
              {input.length}/500
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}
