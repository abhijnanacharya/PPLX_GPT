"use client";
import { useState, useRef, useEffect } from "react";

type Source = {
  title: string;
  url: string;
  snippet: string;
};

type ChatEntry = {
  question: string;
  answer: string;
  sources: Source[];
};

export default function ChatBox() {
  const [question, setQuestion] = useState("");
  const [loading, setLoading] = useState(false);
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (chatHistory.length > 0) {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [chatHistory.length]);

  const askQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim()) return;

    setLoading(true);
    const newEntry: ChatEntry = {
      question,
      answer: "",
      sources: [],
    };
    setChatHistory((prev) => [...prev, newEntry]);
    setQuestion("");

    try {
      // Get sources
      const sourcesRes = await fetch("http://localhost:8000/ask/sources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });
      const sourcesData = await sourcesRes.json();

      setChatHistory((prev) => {
        const lastEntry = prev[prev.length - 1];
        return [
          ...prev.slice(0, -1),
          { ...lastEntry, sources: sourcesData.sources },
        ];
      });

      // Get streaming answer
      const answerResRaw = await fetch("http://localhost:8000/ask/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question }),
      });

      if (!(answerResRaw instanceof Response)) {
        throw new Error("Invalid response object returned from fetch.");
      }

      const answerRes = answerResRaw;

      if (!answerRes.body || typeof answerRes.body.getReader !== "function") {
        throw new Error("Stream not supported or malformed response.");
      }

      const reader = answerRes.body.getReader();
      const decoder = new TextDecoder();
      let answer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        answer += chunk;

        setChatHistory((prev) => {
          const lastEntry = prev[prev.length - 1];
          return [...prev.slice(0, -1), { ...lastEntry, answer }];
        });
      }
    } catch (err: any) {
      setChatHistory((prev) => {
        const lastEntry = prev[prev.length - 1];
        return [
          ...prev.slice(0, -1),
          { ...lastEntry, answer: `❌ Error: ${err.message}` },
        ];
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="flex flex-col h-screen bg-gray-50">
      {/* Chat history */}
      <div className="flex-1 overflow-y-auto px-8 py-6">
        <div className="max-w-4xl mx-auto space-y-8">
          {chatHistory.map((entry, index) => (
            <div key={index} className="bg-white p-4 rounded-lg shadow">
              <div className="mb-2">
                <strong className="text-gray-800">You:</strong>
                <p className="text-gray-700 whitespace-pre-wrap">
                  {entry.question}
                </p>
              </div>
              <div className="mb-2">
                <strong className="text-blue-600">Answer:</strong>
                <p className="text-gray-900 whitespace-pre-wrap">
                  {entry.answer ||
                    (loading && index === chatHistory.length - 1
                      ? "Thinking..."
                      : "")}
                </p>
              </div>
              {entry.sources.length > 0 && (
                <div className="mt-2">
                  <strong className="text-green-700">Sources:</strong>
                  <ul className="list-disc list-inside text-sm text-gray-600">
                    {entry.sources.map((source, i) => (
                      <li key={i} className="mb-1">
                        <a
                          href={source.url}
                          className="text-blue-500 hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {source.title}
                        </a>
                        <p className="text-gray-500">{source.snippet}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
      </div>

      {/* Question input form */}
      <form
        onSubmit={askQuestion}
        className="flex items-center p-4 border-t bg-white shadow"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-400 text-gray-950"
          placeholder="Ask a question..."
        />
        <button
          type="submit"
          className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-md disabled:opacity-50"
          disabled={loading}
        >
          {loading ? "Loading..." : "Ask"}
        </button>
      </form>
    </section>
  );
}
