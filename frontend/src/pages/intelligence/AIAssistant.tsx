import { useState, useRef, useEffect } from "react";
import { glassClasses, motionVariants } from "@/lib/glass";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Sparkles, Send, Mic, Paperclip, Bot, User as UserIcon, BarChart3, TrendingUp, Users } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { api } from "@/lib/api";

type Message = {
  id: string;
  type: "user" | "ai";
  content: React.ReactNode;
};

const suggestedPrompts = [
  "Show revenue forecast for next month",
  "Which tenants have overdue payments > ₹10k?",
  "Show occupancy trends across all properties",
  "Which rooms are vacant at Kormangala?",
];

export function AIAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "init",
      type: "ai",
      content: (
        <div className="space-y-4">
          <p className="text-lg font-medium text-gray-900">Hello! I am your PhrydlPG Intelligence Assistant.</p>
          <p className="text-gray-600">I can analyze your portfolio, forecast revenue, and identify operational risks. How can I help you today?</p>
        </div>
      )
    }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;

    const newMsg: Message = { id: Date.now().toString(), type: "user", content: text };
    setMessages(prev => [...prev, newMsg]);
    setInput("");
    setIsTyping(true);

    // Call AI backend
    api.post("/intelligence/assistant/query", { query: text })
      .then(res => {
        const data = res.data.data;
        let response: React.ReactNode = "";
        
        if (data.type === "overdue") {
          response = (
            <div className="space-y-4 w-full">
              <p className="text-gray-900">I found <strong>{data.count} tenants</strong> with overdue payments exceeding ₹10,000.</p>
              <div className="grid gap-3">
                {data.data.map((t: any, i: number) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl p-3 flex justify-between items-center shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-red-50 flex items-center justify-center text-red-600 font-bold text-xs">{t.name[0]}</div>
                      <div>
                        <p className="font-semibold text-sm text-gray-900">{t.name}</p>
                        <p className="text-xs text-gray-500">{t.room}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-red-600">{t.amount}</p>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">{t.risk}</p>
                    </div>
                  </div>
                ))}
              </div>
              <Button size="sm" className="bg-accent text-accent-foreground hover:bg-accent/90 w-full rounded-lg shadow-sm">Send Bulk Reminders</Button>
            </div>
          );
        } else if (data.type === "forecast") {
          response = (
            <div className="space-y-4">
              <p className="text-gray-900">Based on current occupancy and upcoming renewals, here is the revenue forecast for the next 3 months.</p>
              <div className="flex gap-4">
                {data.data.map((f: any, i: number) => (
                 <div key={i} className="bg-white border border-gray-200 p-4 rounded-xl flex-1 text-center shadow-sm">
                   <p className="text-xs text-gray-500 font-medium uppercase mb-1">{f.month}</p>
                   <p className={cn("text-xl font-bold", f.trend === "up" ? "text-green-600" : "text-red-500")}>{f.value}</p>
                 </div>
                ))}
              </div>
              <p className="text-sm text-gray-600 border-l-2 border-accent pl-3">Notice: {data.notice}</p>
            </div>
          );
        } else {
          response = data.text;
        }

        setMessages(prev => [...prev, { id: Date.now().toString(), type: "ai", content: response }]);
      })
      .catch(() => {
        setMessages(prev => [...prev, { id: Date.now().toString(), type: "ai", content: "Sorry, I encountered an error while processing your request." }]);
      })
      .finally(() => {
        setIsTyping(false);
      });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)]">
      <div className="mb-4 shrink-0">
        <h1 className="text-3xl font-black tracking-tight mb-1 text-gray-900 flex items-center gap-3">
          Phrydl Intelligence <Sparkles className="w-6 h-6 text-accent" />
        </h1>
        <p className="text-gray-500">Your AI co-pilot for property operations and financial insights.</p>
      </div>

      <Card className={cn("flex-1 flex flex-col border-gray-200 bg-white overflow-hidden shadow-sm", glassClasses.panel)}>
        {/* Chat History */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-6">
          <AnimatePresence>
            {messages.map((msg) => (
              <motion.div 
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={cn("flex gap-4 max-w-3xl", msg.type === "user" ? "ml-auto flex-row-reverse" : "")}
              >
                <div className={cn("w-10 h-10 shrink-0 rounded-xl flex items-center justify-center", 
                  msg.type === "user" ? "bg-gray-100 text-gray-600" : "bg-accent text-accent-foreground shadow-lg shadow-accent/20"
                )}>
                  {msg.type === "user" ? <UserIcon size={20} /> : <Bot size={20} />}
                </div>
                <div className={cn("rounded-2xl p-4 sm:p-5", 
                  msg.type === "user" ? "bg-gray-50 border border-gray-100 text-gray-900" : "bg-white border border-gray-100 shadow-sm"
                )}>
                  {msg.content}
                </div>
              </motion.div>
            ))}
            {isTyping && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-4 max-w-3xl">
                <div className="w-10 h-10 shrink-0 rounded-xl bg-accent text-accent-foreground shadow-lg flex items-center justify-center">
                  <Bot size={20} />
                </div>
                <div className="rounded-2xl p-5 bg-white border border-gray-100 shadow-sm flex gap-1 items-center">
                  <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "0ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "150ms" }}></div>
                  <div className="w-2 h-2 rounded-full bg-accent animate-bounce" style={{ animationDelay: "300ms" }}></div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 sm:p-6 bg-gray-50/50 border-t border-gray-100">
          <div className="flex gap-2 overflow-x-auto pb-4 no-scrollbar">
            {suggestedPrompts.map((prompt, i) => (
              <button 
                key={i}
                onClick={() => handleSend(prompt)}
                className="shrink-0 px-4 py-2 bg-white border border-gray-200 text-gray-600 text-sm rounded-full hover:border-accent hover:text-accent transition-colors shadow-sm"
              >
                {prompt}
              </button>
            ))}
          </div>
          
          <div className="relative flex items-center">
            <div className="absolute left-3 flex gap-2">
              <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-gray-900 rounded-full">
                <Paperclip className="w-4 h-4" />
              </Button>
            </div>
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend(input)}
              placeholder="Ask anything about your properties, tenants, or revenue..."
              className="w-full h-14 pl-14 pr-24 rounded-2xl border border-gray-200 bg-white focus-visible:ring-2 focus-visible:ring-accent focus-visible:outline-none text-gray-900 shadow-sm"
            />
            <div className="absolute right-2 flex gap-1">
              <Button variant="ghost" size="icon" className="h-10 w-10 text-gray-400 hover:text-gray-900 rounded-xl">
                <Mic className="w-5 h-5" />
              </Button>
              <Button 
                onClick={() => handleSend(input)}
                className="h-10 w-10 bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl shadow-md"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <p className="text-center text-[10px] text-gray-400 mt-3 font-medium uppercase tracking-widest">
            Phrydl Intelligence can make mistakes. Verify critical financial data.
          </p>
        </div>
      </Card>
    </div>
  );
}
