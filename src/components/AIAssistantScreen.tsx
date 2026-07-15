import React, { useState, useRef, useEffect } from 'react';
import { Settings, ArrowLeft, Mic, Send, Sparkles, Loader2, ImagePlus, X } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

type Message = {
  role: 'user' | 'model';
  content: string;
  timestamp: string;
  image?: string;
};

export default function AIAssistantScreen({ onBack }: { onBack: () => void }) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'user',
      content: 'What should I photograph tonight?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      role: 'model',
      content: `The Andromeda Galaxy (M31) is perfectly positioned tonight 🌌\n\n* **Best window:** 11:40 PM - 2:15 AM\n* **Visibility:** Excellent (97%)\n* **Moon:** 78% (manageable)\n* **Bortle:** 2 (dark skies)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      role: 'user',
      content: 'Best camera settings for M31?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
    {
      role: 'model',
      content: `Recommended settings:\n\n* **ISO:** 1600\n* **Exposure:** 120-180s\n* **Aperture:** f/2.8\n* **Focal Length:** 135mm\n* **Focus:** Manual (live view)`,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);
  
  const [input, setInput] = useState('');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setSelectedImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleSend = async (e?: React.FormEvent, textOverride?: string) => {
    e?.preventDefault();
    const textToSend = textOverride || input;
    if ((!textToSend.trim() && !selectedImage) || isLoading) return;

    const newMessages: Message[] = [
      ...messages,
      {
        role: 'user',
        content: textToSend.trim(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        ...(selectedImage && { image: selectedImage })
      }
    ];

    setMessages(newMessages);
    setInput('');
    setSelectedImage(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: newMessages }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'API Error');
      }

      const data = await response.json();
      
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: data.message,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } catch (error) {
      console.error('Failed to get AI response:', error);
      const errorMessage = error instanceof Error && error.message !== 'API Error'
        ? `Neural network error: ${error.message}`
        : 'Sorry, I am having trouble connecting to my neural network right now. Please try again later or check if your GEMINI_API_KEY is configured and restart your server.';
        
      setMessages((prev) => [
        ...prev,
        {
          role: 'model',
          content: errorMessage,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-[#0B0F17] text-white relative">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 pt-14 md:pt-8 pb-4 bg-[#0B0F17]/80 backdrop-blur-md z-20 border-b border-white/5">
        <div className="max-w-4xl mx-auto w-full flex justify-between items-center">
          <button onClick={onBack} className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition">
            <ArrowLeft size={20} />
          </button>
          <div className="flex flex-col items-center">
            <h2 className="text-lg md:text-xl font-bold flex items-center gap-2">
              <Sparkles size={18} className="text-[#A855F7]" />
              AI Assistant
            </h2>
            <span className="text-xs md:text-sm text-[#A2A9B3]">Your astrophotography guide</span>
          </div>
          <button className="w-10 h-10 rounded-full glass flex items-center justify-center hover:bg-white/10 transition">
            <Settings size={20} />
          </button>
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 overflow-y-auto px-6 pt-32 md:pt-28 pb-[200px] flex flex-col gap-6 no-scrollbar">
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-6">
          {messages.map((msg, index) => (
            <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              {msg.role === 'user' ? (
                <div className="bg-[#A855F7] text-white px-5 py-3 rounded-2xl rounded-tr-sm max-w-[85%] md:max-w-[70%] text-sm md:text-base shadow-[0_4px_15px_rgba(168,85,247,0.3)]">
                  {msg.image && (
                    <img src={msg.image} alt="Uploaded" className="max-w-full h-auto rounded-lg mb-3 border border-white/20" />
                  )}
                  {msg.content}
                  <div className="text-[10px] md:text-xs text-white/70 text-right mt-1">{msg.timestamp}</div>
                </div>
              ) : (
                <div className="glass-panel p-4 md:p-6 rounded-2xl rounded-tl-sm max-w-[95%] md:max-w-[80%] border border-[#A855F7]/30 relative overflow-hidden group hover:border-[#A855F7]/50 transition-colors">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-[#A855F7]/10 blur-3xl rounded-full"></div>
                  <div className="relative z-10 text-sm md:text-base leading-relaxed prose prose-invert max-w-none prose-p:my-2 prose-ul:my-2 prose-li:my-0.5 prose-strong:text-[#D9A441] marker:text-[#4ADE80]">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                  <div className="flex justify-end items-center gap-3 mt-4 text-[#A2A9B3] relative z-10 opacity-70 group-hover:opacity-100 transition-opacity">
                     <button className="hover:text-white transition"><Settings size={16} /></button>
                     <button className="hover:text-white transition"><span className="text-sm">👍</span></button>
                  </div>
                  <div className="text-[10px] md:text-xs text-[#A2A9B3] text-right mt-2 relative z-10">{msg.timestamp}</div>
                </div>
              )}
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="glass-panel p-4 rounded-2xl rounded-tl-sm border border-[#A855F7]/30 flex items-center gap-3">
                <Loader2 size={18} className="text-[#A855F7] animate-spin" />
                <span className="text-sm md:text-base text-[#A2A9B3]">Thinking...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#0B0F17] via-[#0B0F17] to-transparent z-20 pb-8 md:pb-10 pointer-events-none">
        <div className="max-w-4xl mx-auto w-full pointer-events-auto">
          {/* Suggestion Chips */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-4 pb-2">
            {['Focus tips', 'Gear checklist', 'Light pollution'].map((chip) => (
              <button 
                key={chip}
                onClick={() => handleSend(undefined, chip)}
                className="glass px-4 py-2 md:py-2.5 rounded-full text-xs md:text-sm font-medium text-[#A2A9B3] whitespace-nowrap border border-white/10 hover:text-white hover:border-[#A855F7]/50 hover:bg-white/5 transition-colors shadow-lg"
              >
                {chip}
              </button>
            ))}
          </div>

          {/* Image Preview */}
          {selectedImage && (
            <div className="relative inline-block mb-4 ml-4">
              <img src={selectedImage} alt="Preview" className="h-20 w-auto rounded-lg border-2 border-[#A855F7]/50" />
              <button 
                onClick={() => setSelectedImage(null)}
                className="absolute -top-2 -right-2 bg-black text-white p-1 rounded-full border border-white/20 hover:bg-white/10"
              >
                <X size={14} />
              </button>
            </div>
          )}

          {/* Input Field */}
          <form onSubmit={handleSend} className="glass rounded-full flex items-center px-2 py-2 pr-2 border border-white/10 focus-within:border-[#A855F7]/50 transition-colors bg-[#0B0F17]/90 backdrop-blur-xl shadow-2xl">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
            />
            <button 
              type="button" 
              onClick={() => fileInputRef.current?.click()}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center text-[#A2A9B3] mx-1 hover:text-white transition disabled:opacity-50 hover:bg-white/5" 
              disabled={isLoading}
            >
              <ImagePlus size={20} />
            </button>
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading}
              placeholder="Ask anything or upload a photo of the sky..." 
              className="bg-transparent border-none outline-none text-sm md:text-base flex-1 text-white placeholder-[#A2A9B3] px-2 py-2 md:py-3 disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={(!input.trim() && !selectedImage) || isLoading}
              className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-[#A855F7] flex items-center justify-center text-white glow-purple shrink-0 disabled:opacity-50 disabled:glow-none transition-all hover:scale-105"
            >
              {isLoading ? <Loader2 size={20} className="animate-spin ml-[-2px]" /> : <Send size={20} className="ml-[-2px]" />}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
