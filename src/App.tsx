import React, { useState, useRef, useEffect } from "react";
import { AppModel, ChatMessage } from "./types";
import { getAppPyCode, getRequirementsTxt, getReadmeMd, getGitignore } from "./components/CodeGenerator";
import { 
  Send, 
  Trash2, 
  Terminal, 
  Info, 
  Clipboard, 
  Check, 
  FileCode, 
  X, 
  Power, 
  AlertTriangle, 
  AlertOctagon,
  Github,
  Laptop
} from "lucide-react";

export default function App() {
  // Simulator State Toggles
  const [ollamaState, setOllamaState] = useState<"running" | "offline" | "missing_model">("running");
  
  // Chat History
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      content: "Hello! I am Llama 3.2, running locally on your machine. Ask me any question about studies, coding, resumes, or interviews, and I will respond completely offline!",
      timestamp: new Date(),
    },
  ]);
  
  // Input
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  
  // Deliverables Modal
  const [showCodeModal, setShowCodeModal] = useState(false);
  const [activeCodeTab, setActiveCodeTab] = useState<"app" | "req" | "readme" | "gitignore">("app");
  const [copiedCodeFlag, setCopiedCodeFlag] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // Auto-Scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  // Deliverables contents
  const appPyCodeContents = getAppPyCode(AppModel.LLAMA3_2, "general-conversation" as any, "You are Llama 3.2, a lightweight locally hosted AI assistant powered by Ollama.");
  const requirementsTxtContents = getRequirementsTxt();
  const readmeMdContents = getReadmeMd(AppModel.LLAMA3_2);
  const gitignoreContents = getGitignore();

  const getSelectedCodeString = () => {
    switch (activeCodeTab) {
      case "app":
        return appPyCodeContents;
      case "req":
        return requirementsTxtContents;
      case "readme":
        return readmeMdContents;
      case "gitignore":
        return gitignoreContents;
    }
  };

  const getSelectedFileName = () => {
    switch (activeCodeTab) {
      case "app":
        return "app.py";
      case "req":
        return "requirements.txt";
      case "readme":
        return "README.md";
      case "gitignore":
        return ".gitignore";
    }
  };

  const handleCopyCode = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCodeFlag(true);
    setTimeout(() => {
      setCopiedCodeFlag(false);
    }, 2000);
  };

  // Quick suggestion chips
  const sampleSuggestions = [
    { text: "What is AI?", label: "Study" },
    { text: "Explain Machine Learning.", label: "Study" },
    { text: "Write a Python loop.", label: "Code" },
    { text: "Explain recursion.", label: "Code" },
    { text: "What should I include in my resume?", label: "Resume" },
    { text: "How can I improve my resume?", label: "Resume" },
    { text: "How do I prepare for interviews?", label: "Job Prep" },
    { text: "Tell me a joke", label: "General" },
  ];

  // Send message
  const handleSendMessage = async (textToSend?: string) => {
    const rawText = textToSend || inputText;
    if (!rawText.trim() || isTyping) return;

    const userMsg: ChatMessage = {
      id: "user-" + Date.now(),
      role: "user",
      content: rawText,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputText("");
    setIsTyping(true);

    // Custom Greeting check
    const cleanText = rawText.trim().toLowerCase().replace(/[!.?]$/, "");
    if (cleanText === "hi" || cleanText === "hello" || cleanText === "hey") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "ai-" + Date.now(),
            role: "assistant",
            content: "Hello! I am Jahnavi's AI Assistant, powered by Llama 3.2 and running locally through Ollama.\n\nHow can I help you today?",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 400);
      return;
    }

    // Simulate connection failure (Ollama is not running)
    if (ollamaState === "offline") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "err-offline-" + Date.now(),
            role: "assistant",
            content: "⚠️ **Ollama is not running.**\nPlease start Ollama and try again.",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 600);
      return;
    }

    // Simulate missing model (llama3.2 tag not pulled yet)
    if (ollamaState === "missing_model") {
      setTimeout(() => {
        setMessages((prev) => [
          ...prev,
          {
            id: "err-missing-" + Date.now(),
            role: "assistant",
            content: "⚠️ **Model not found.**\n\nRun:\n```bash\nollama pull llama3.2\n```",
            timestamp: new Date(),
          },
        ]);
        setIsTyping(false);
      }, 600);
      return;
    }

    // Normal Simulated Route calling backend Gemini API Proxy
    try {
      const chatHistory = [...messages, userMsg].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: chatHistory,
          systemInstruction: "You are Llama 3.2, a lightweight locally hosted AI assistant powered by Ollama. Answer in a fast, concise, professional tone. If the message mentions studies, coding, resumes, or jobs, provide helpful actionable explanations or clean sample scripts.",
        }),
      });

      if (!res.ok) {
        throw new Error("Backend simulator offline");
      }

      const data = await res.json();
      setMessages((prev) => [
        ...prev,
        {
          id: "ai-" + Date.now(),
          role: "assistant",
          content: data.content,
          timestamp: new Date(),
        },
      ]);
    } catch (e) {
      console.error(e);
      setMessages((prev) => [
        ...prev,
        {
          id: "err-network-" + Date.now(),
          role: "assistant",
          content: "❌ **Failed to connect to Ollama service.**\nEnsure `ollama run llama3.2` is active on port 11434.",
          timestamp: new Date(),
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        id: "chat-reset-" + Date.now(),
        role: "assistant",
        content: "Chat cleared! Ask me anything, I am listening.",
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] antialiased flex flex-col justify-between font-sans">
      
      {/* Visual Streamlit Red Top accent bar */}
      <div className="h-1 w-full bg-gradient-to-r from-red-500 via-orange-500 to-yellow-500"></div>

      {/* Main Container */}
      <div className="max-w-3xl w-full mx-auto px-4 sm:px-6 py-8 flex-1 flex flex-col">
        
        {/* Header Section */}
        <header className="border-b border-gray-200 pb-6 mb-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 id="page-title-id" className="text-3xl font-extrabold tracking-tight text-slate-900 flex items-center gap-2">
                <span>💬</span> Local AI Chatbot
              </h1>
              <p className="text-gray-500 text-sm mt-1">
                Ask any question and get AI-powered responses locally using Ollama.
              </p>
            </div>

            {/* Simulated Status Indicators */}
            <div className="flex flex-col gap-1 sm:items-end">
              <span className="text-[10px] font-bold font-mono uppercase text-gray-400 tracking-wider">
                OLLAMA STATUS SIMULATOR
              </span>
              <div className="flex bg-white border border-gray-200 rounded-lg p-0.5 shadow-2xs divide-x divide-gray-100">
                <button
                  type="button"
                  onClick={() => setOllamaState("running")}
                  className={`text-[10px] font-semibold px-2 py-1 rounded transition-all flex items-center gap-1 ${
                    ollamaState === "running"
                      ? "bg-emerald-55 text-emerald-800 font-bold"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Simulate Ollama running normally"
                >
                  <Power className="w-2.5 h-2.5 text-emerald-500" />
                  <span>Online</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOllamaState("offline")}
                  className={`text-[10px] font-semibold px-2 py-1 rounded transition-all flex items-center gap-1 ${
                    ollamaState === "offline"
                      ? "bg-amber-55 text-amber-800 font-bold"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Simulate Ollama offline/not running"
                >
                  <AlertTriangle className="w-2.5 h-2.5 text-amber-500" />
                  <span>Offline</span>
                </button>
                <button
                  type="button"
                  onClick={() => setOllamaState("missing_model")}
                  className={`text-[10px] font-semibold px-2 py-1 rounded transition-all flex items-center gap-1 ${
                    ollamaState === "missing_model"
                      ? "bg-rose-55 text-rose-800 font-bold"
                      : "text-gray-400 hover:text-gray-700"
                  }`}
                  title="Simulate missing llama3.2 weights model error"
                >
                  <AlertOctagon className="w-2.5 h-2.5 text-rose-500" />
                  <span>No Model</span>
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Chat Area Panel */}
        <div className="flex-1 bg-white border border-gray-200 rounded-2xl shadow-xs flex flex-col overflow-hidden min-h-[440px] max-h-[640px]">
          
          {/* Top Panel Streamlit Mimic Head */}
          <div className="bg-gray-50 border-b border-gray-100 px-5 py-3 flex items-center justify-between text-xs font-mono text-gray-500 select-none">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span>streamlit_app.py (Llama 3.2 3B)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${ollamaState === "running" ? "bg-emerald-500 animate-pulse" : "bg-red-500"}`}></span>
              <span className="text-[10px] uppercase font-bold text-gray-600">
                {ollamaState === "running" ? "Ollama Active" : "Ollama Stopped"}
              </span>
            </div>
          </div>

          {/* Messages Log Container */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-5 select-text bg-[#FCFDFE]">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex flex-col ${
                  message.role === "user" ? "items-end" : "items-start"
                }`}
              >
                {/* Header Speaker Info */}
                <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold font-mono text-gray-450 uppercase tracking-wider px-1">
                  <span>{message.role === "user" ? "👤 YOU" : "🤖 AI (Llama 3.2)"}</span>
                  <span className="text-gray-300 font-normal">•</span>
                  <span className="font-normal text-[10px]">
                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* Message Box */}
                <div
                  className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                    message.role === "user"
                      ? "bg-slate-900 text-white rounded-tr-none shadow-3xs"
                      : "bg-gray-100 text-slate-800 rounded-tl-none border border-gray-200/50"
                  }`}
                >
                  <p className="whitespace-pre-wrap font-sans font-medium">{message.content}</p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex flex-col items-start">
                <div className="flex items-center gap-1.5 mb-1 text-[11px] font-bold font-mono text-gray-450 uppercase tracking-wider px-1">
                  <span>🤖 AI (Llama 3.2)</span>
                  <span className="text-gray-300 font-normal">•</span>
                  <span className="font-normal text-[10px] italic">Generating tokens...</span>
                </div>
                <div className="bg-gray-100 text-slate-800 rounded-2xl rounded-tl-none border border-gray-200/50 px-4 py-3 flex items-center gap-1.5 shadow-2xs">
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2.5 h-2.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Quick Suggestions block inside chatbot */}
          <div className="p-4 bg-gray-50 border-t border-gray-100/80">
            <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 select-none">
              Quick Query Ideas:
            </div>
            <div className="flex flex-wrap gap-2">
              {sampleSuggestions.map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setInputText(suggestion.text);
                  }}
                  className="bg-white hover:bg-gray-100 text-slate-700 text-xs px-2.5 py-1.5 rounded-lg border border-gray-200 transition-all font-medium text-left shadow-3xs"
                >
                  <span className="text-[9px] text-sky-600 font-bold mr-1 bg-sky-50 px-1 py-0.5 rounded uppercase">
                    {suggestion.label}
                  </span>
                  <span>{suggestion.text}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Chat Controller Form Box */}
          <div className="p-4 border-t border-gray-150 bg-white">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <div className="relative flex-1">
                <input
                  type="text"
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder="Ask any question..."
                  className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 focus:border-slate-800 focus:bg-white text-slate-900 rounded-xl py-3 px-4 text-sm outline-none transition-all font-medium pr-10"
                />
              </div>

              {/* Action Buttons */}
              <button
                type="submit"
                disabled={!inputText.trim() || isTyping}
                className="bg-slate-900 hover:bg-slate-800 disabled:bg-gray-200 disabled:text-gray-400 text-white font-bold text-xs uppercase px-5 py-3 h-11 rounded-xl transition-all shadow-3xs flex items-center gap-1.5 flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>

              <button
                type="button"
                onClick={handleClearChat}
                className="bg-white border border-gray-200 hover:border-gray-300 text-gray-600 font-bold text-xs uppercase px-4 py-3 h-11 rounded-xl transition-all shadow-3xs flex items-center gap-1.5 flex-shrink-0"
                title="Clear current stream session history"
              >
                <Trash2 className="w-3.5 h-3.5 text-gray-400" />
                <span>Clear Chat</span>
              </button>
            </form>
          </div>
        </div>

        {/* Footer with Deliverable trigger links */}
        <footer className="mt-8 pt-4 border-t border-gray-200/60 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4 select-none">
          <div className="font-medium">
            <span>Powered by </span>
            <code className="bg-gray-150 text-gray-700 px-1 py-0.5 rounded font-mono text-[11px]">Streamlit v1.35</code>
            <span> & </span>
            <code className="bg-gray-150 text-gray-700 px-1 py-0.5 rounded font-mono text-[11px]">Ollama 0.2</code>
          </div>

          {/* Core Code Assets Trigger Button */}
          <button
            type="button"
            onClick={() => setShowCodeModal(true)}
            className="text-slate-800 hover:text-slate-950 font-bold flex items-center gap-1.5 border border-gray-200 bg-white hover:bg-gray-50 px-3.5 py-2 rounded-xl shadow-3xs transition-all text-xs"
          >
            <FileCode className="w-4 h-4 text-sky-600" />
            <span>📂 View Python Code Deliverables</span>
          </button>
        </footer>
      </div>

      {/* RENDER DELIVERABLES CODE MODAL DIALOG OVERLAY */}
      {showCodeModal && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs select-text">
          <div className="bg-white rounded-2xl w-full max-w-4xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200 animate-in fade-in-80 duration-150">
            
            {/* Modal Header */}
            <div className="border-b border-gray-250/60 px-6 py-4 flex items-center justify-between bg-slate-950 text-white">
              <div className="flex items-center gap-2">
                <FileCode className="w-5 h-5 text-sky-400" />
                <div>
                  <h3 className="font-bold text-sm uppercase tracking-wide">
                    Student Project Deliverables Asset Pack
                  </h3>
                  <p className="text-[11px] text-slate-400">
                    Deploy this structural code natively on your local laptop to run the fully-functional python app!
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowCodeModal(false)}
                className="text-slate-400 hover:text-white transition-all bg-slate-800/80 p-1.5 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Navigation tabs */}
            <div className="bg-gray-50 border-b border-gray-150 px-6 py-2 flex justify-between items-center select-none">
              <div className="flex gap-2">
                {[
                  { id: "app", label: "app.py" },
                  { id: "req", label: "requirements.txt" },
                  { id: "readme", label: "README.md" },
                  { id: "gitignore", label: ".gitignore" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveCodeTab(tab.id as any)}
                    className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                      activeCodeTab === tab.id
                        ? "bg-slate-900 text-white font-extrabold"
                        : "text-gray-400 hover:text-gray-700 font-semibold"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Copy Code Button inside Modal */}
              <button
                type="button"
                onClick={() => handleCopyCode(getSelectedCodeString())}
                className="text-xs bg-white hover:bg-gray-50 hover:shadow-2xs border border-gray-200 rounded-lg px-3 py-1.5 font-sans font-semibold text-slate-700 flex items-center gap-1.5 transition-all"
              >
                {copiedCodeFlag ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-700 font-bold">COPIED</span>
                  </>
                ) : (
                  <>
                    <Clipboard className="w-3.5 h-3.5 text-gray-400" />
                    <span>COPY CODE</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Body Area */}
            <div className="p-6 flex-1 overflow-y-auto space-y-3 bg-[#FCFDFE]">
              <div className="text-xs text-gray-400 font-medium">
                📄 Dynamic Source File: <span className="font-mono text-black font-extrabold">{getSelectedFileName()}</span>. Ready for physical copy paste into VS Code:
              </div>
              <div className="rounded-xl border border-gray-250 bg-gray-50 p-4 font-mono text-xs leading-relaxed text-black max-h-[460px] overflow-y-auto select-all whitespace-pre">
                {getSelectedCodeString()}
              </div>
            </div>

            {/* Modal Bottom tip bar */}
            <div className="bg-sky-50 border-t border-sky-100 px-6 py-3 flex items-center gap-2 text-xs text-sky-800">
              <Laptop className="w-4 h-4 text-sky-600 flex-shrink-0" />
              <span>
                Tip: Copy the code above. Put them in your workspace folder, startup your terminal, type <code>pip install -r requirements.txt</code> followed by <code>streamlit run app.py</code> to see it active!
              </span>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
