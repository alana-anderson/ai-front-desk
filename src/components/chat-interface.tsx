"use client";

import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, Suspense } from "react";

type User = { id: string; name: string; role: string; organization: { name: string } | null };

function ChatContent({ user }: { user: User }) {
  const searchParams = useSearchParams();
  const initialQuestion = searchParams.get("q");
  const [hasInitialized, setHasInitialized] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "streaming" || status === "submitted";

  useEffect(() => {
    if (initialQuestion && !hasInitialized && status === "ready") {
      setHasInitialized(true);
      sendMessage({ parts: [{ type: "text", text: initialQuestion }], role: "user" });
    }
  }, [initialQuestion, hasInitialized, status, sendMessage]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;
    sendMessage({ parts: [{ type: "text", text: inputValue }], role: "user" });
    setInputValue("");
  }

  const suggestions = [
    "Are you open on Veterans Day?",
    "What is the sick policy?",
    "What's for lunch today?",
    "How do I schedule a tour?",
  ];

  return (
    <div className="flex flex-col h-screen">
      <div className="border-b border-slate-100 px-6 py-4 bg-white">
        <h2 className="font-semibold text-slate-800">
          Chat with {user.organization?.name || "123 Preschool"}
        </h2>
        <p className="text-xs text-slate-400">AI-powered front desk assistant</p>
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-indigo-50 mb-4">
              <svg className="w-7 h-7 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456Z" />
              </svg>
            </div>
            <p className="text-slate-500 mb-6">
              Ask me anything about {user.organization?.name || "123 Preschool"}
            </p>
            <div className="flex flex-wrap gap-2 justify-center max-w-md mx-auto">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => sendMessage({ parts: [{ type: "text", text: s }], role: "user" })}
                  className="px-3 py-2 text-sm rounded-xl border border-indigo-100 bg-indigo-50/50 text-indigo-700 hover:bg-indigo-100 transition-colors"
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m) => (
          <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                m.role === "user"
                  ? "bg-indigo-500 text-white rounded-br-md"
                  : "bg-white border border-slate-100 text-slate-700 rounded-bl-md shadow-sm"
              }`}
            >
              <div className="whitespace-pre-wrap">
                {m.parts?.map((part, i) =>
                  part.type === "text" ? <span key={i}>{part.text}</span> : null
                )}
              </div>
            </div>
          </div>
        ))}

        {isLoading && messages.length > 0 && messages[messages.length - 1]?.role === "user" && (
          <div className="flex justify-start">
            <div className="bg-white border border-slate-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
              <div className="flex gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce [animation-delay:0ms]" />
                <span className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce [animation-delay:150ms]" />
                <span className="w-2 h-2 rounded-full bg-indigo-300 animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="border-t border-slate-100 bg-white px-4 py-4">
        <form onSubmit={handleSubmit} className="max-w-3xl mx-auto">
          <div className="relative group">
            <div className="absolute -inset-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-300 blur-sm" />
            <div className="relative flex items-center gap-2 bg-white rounded-2xl border-2 border-slate-200 focus-within:border-transparent p-2">
              <input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={`Ask ${user.organization?.name || "123 Preschool"} a question...`}
                className="flex-1 px-3 py-2 text-base focus:outline-none bg-transparent"
                disabled={isLoading}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="w-10 h-10 rounded-xl bg-indigo-500 hover:bg-indigo-600 disabled:bg-slate-200 disabled:opacity-50 flex items-center justify-center transition-colors shrink-0"
              >
                <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 10.5 12 3m0 0 7.5 7.5M12 3v18" />
                </svg>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}

export function ChatInterface({ user }: { user: User }) {
  return (
    <Suspense fallback={<div className="flex items-center justify-center h-screen text-slate-400">Loading chat...</div>}>
      <ChatContent user={user} />
    </Suspense>
  );
}
