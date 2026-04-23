import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { logout } from "@/services/authService";
import { ThemeToggle } from "@/components/ThemeToggle";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { Send, Plus, User2, Bot, Sparkles, Paperclip, Mic } from "lucide-react";
import { cn } from "@/lib/utils";
import api from "@/services/api";
import { getUserRole } from "@/services/authService";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export default function DashboardPage() {
    const navigate = useNavigate();
    
    useEffect(() => {
        if (getUserRole() === "admin") {
            navigate("/admin");
        }
    }, [navigate]);

    const [messages, setMessages] = useState([]);
    const [inputValue, setInputValue] = useState("");
    const [activeChatId, setActiveChatId] = useState(null);
    const [chatHistoryList, setChatHistoryList] = useState([]);
    const scrollRef = useRef(null);

    const [isLoading, setIsLoading] = useState(false);
    const [isFetchingHistory, setIsFetchingHistory] = useState(false);

    const fetchChats = async () => {
        try {
            const response = await api.get("/chat");
            setChatHistoryList(response.data);
        } catch (error) {
            console.error("Failed to fetch chats", error);
        }
    };

    useEffect(() => {
        fetchChats();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() || isLoading) return;

        const newUserMessage = {
            id: Date.now(),
            role: "user",
            content: inputValue,
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        };

        const currentInput = inputValue;
        const currentHistory = [...messages];

        setMessages(prev => [...prev, newUserMessage]);
        setInputValue("");
        setIsLoading(true);

        try {
            const apiHistory = currentHistory.map(msg => ({ role: msg.role, content: msg.content }));
            const response = await api.post("/chat", {
                message: currentInput,
                chat_id: activeChatId,
                history: apiHistory
            });

            if (!activeChatId && response.data.chat_id) {
                setActiveChatId(response.data.chat_id);
            }

            const botResponse = {
                id: Date.now() + 1,
                role: "assistant",
                content: response.data.response || "Sorry, an error occurred processing your request.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, botResponse]);

            // Re-fetch side bar chats
            fetchChats();
        } catch (error) {
            console.error("Chat error:", error);
            const errorResponse = {
                id: Date.now() + 1,
                role: "assistant",
                content: "I'm sorry, I was unable to connect to the backend engine.",
                timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            };
            setMessages(prev => [...prev, errorResponse]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleNewChat = () => {
        setMessages([]);
        setActiveChatId(null);
    };

    const handleDeleteChat = async (id) => {
        try {
            await api.delete(`/chat/${id}`);
            if (activeChatId === id) {
                handleNewChat();
            }
            fetchChats();
        } catch (error) {
            console.error("Failed to delete chat", error);
        }
    };

    const handleRenameChat = async (id, newTitle) => {
        try {
            await api.patch(`/chat/${id}`, { title: newTitle });
            fetchChats();
        } catch (error) {
            console.error("Failed to rename chat", error);
        }
    };

    const handlePinChat = async (id, isPinned) => {
        try {
            await api.patch(`/chat/${id}`, { is_pinned: isPinned });
            fetchChats();
        } catch (error) {
            console.error("Failed to pin/unpin chat", error);
        }
    };

    const handleSelectChat = async (id) => {
        setActiveChatId(id);
        setMessages([]); // clear current messages while loading
        setIsFetchingHistory(true);

        try {
            const response = await api.get(`/chat/${id}`);
            if (response.data && response.data.messages) {
                // messages come from DB
                const formattedMessages = response.data.messages.map(msg => ({
                    id: msg.id || Date.now() + Math.random(),
                    role: msg.role,
                    content: msg.content,
                    timestamp: msg.timestamp || ""
                }));
                setMessages(formattedMessages);
            }
        } catch (error) {
            console.error("Failed to load chat history", error);
        } finally {
            setIsFetchingHistory(false);
        }
    };

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    return (
        <SidebarProvider>
            <AppSidebar
                onNewChat={handleNewChat}
                activeChatId={activeChatId}
                onSelectChat={handleSelectChat}
                chatHistory={chatHistoryList}
                onDeleteChat={handleDeleteChat}
                onRenameChat={handleRenameChat}
                onPinChat={handlePinChat}
            />
            <SidebarInset className="bg-background flex flex-col h-svh overflow-hidden relative">
                {/* Header */}
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/50 px-6 bg-background/80 backdrop-blur-md z-30">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-primary transition-colors" />
                        <Separator orientation="vertical" className="h-4 bg-border/50" />
                        <h1 className="text-sm font-bold text-muted-foreground/80 tracking-tight">Dashboard</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="hidden md:flex items-center bg-muted/50 rounded-full px-3 py-1 border border-border/50 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                            <Sparkles className="h-3 w-3 mr-2 text-primary" />
                            Premium Access
                        </div>
                        <ThemeToggle />
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
                    {/* Chat Area (Scrollable) */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 md:p-12 scroll-smooth bg-gradient-to-b from-background to-background/50"
                    >
                        {isFetchingHistory ? (
                            <div className="min-h-full flex flex-col items-center justify-center py-12 md:py-20 text-muted-foreground gap-4">
                                <div className="animate-spin h-10 w-10 border-[3px] border-primary border-t-transparent rounded-full shadow-lg shadow-primary/20" />
                                <p className="text-sm font-bold tracking-tight text-primary/80">Syncing with Brain...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="min-h-full flex flex-col items-center justify-center text-center space-y-8 py-12 md:py-20">
                                <div className="relative">
                                    <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse" />
                                    <div className="relative w-20 h-20 bg-gradient-to-br from-primary/20 to-primary/5 rounded-[2.5rem] flex items-center justify-center shadow-2xl border border-primary/20">
                                        <Bot className="h-10 w-10 text-primary" />
                                    </div>
                                </div>
                                <div className="space-y-3 max-w-lg">
                                    <h2 className="text-4xl md:text-5xl font-black tracking-tight text-foreground/90 leading-tight">
                                        How can I help you <span className="text-primary italic">today?</span>
                                    </h2>
                                    <p className="text-muted-foreground/80 text-lg font-medium px-4">
                                        I'm your AI-powered assistant for policy analysis and document verification.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full max-w-3xl px-4 mt-12 pb-32">
                                    {[
                                        { q: "Summarize the latest document", desc: "Get a quick brief of your files" },
                                        { q: "What is the current policy?", desc: "Check specific compliance rules" },
                                        { q: "Check the key details", desc: "Extract important information" },
                                        { q: "Provide an overview", desc: "General summary of everything" }
                                    ].map((item, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setInputValue(item.q);
                                            }}
                                            className="text-left p-5 rounded-2xl border border-border/50 bg-card/50 hover:bg-muted/80 hover:border-primary/30 hover:translate-y-[-2px] transition-all duration-300 group shadow-sm hover:shadow-md"
                                        >
                                            <span className="font-bold text-foreground block text-[15px] group-hover:text-primary transition-colors">{item.q}</span>
                                            <span className="text-xs text-muted-foreground/70 font-medium mt-1 block">{item.desc}</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-4xl mx-auto w-full space-y-8 pb-48">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex w-full gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-4 duration-500",
                                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg transition-transform hover:scale-110",
                                            msg.role === "user" 
                                                ? "bg-primary text-primary-foreground shadow-primary/20" 
                                                : "bg-muted border border-border/50 text-primary shadow-sm"
                                        )}>
                                            {msg.role === "user" ? <User2 className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                        </div>
                                        <div className={cn(
                                            "flex flex-col gap-2 max-w-[85%] md:max-w-[75%]",
                                            msg.role === "user" ? "items-end" : "items-start"
                                        )}>
                                            <div className={cn(
                                                "px-5 py-4 rounded-[1.5rem] text-[16px] leading-relaxed shadow-sm font-medium",
                                                msg.role === "user"
                                                    ? "bg-primary text-primary-foreground rounded-tr-none shadow-md shadow-primary/10"
                                                    : "bg-muted/30 border border-border/40 rounded-tl-none text-foreground backdrop-blur-sm"
                                            )}>
                                                {msg.role === "user" ? (
                                                    msg.content
                                                ) : (
                                                    <div className="prose prose-sm dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:bg-muted/50 prose-pre:border prose-pre:border-border/50">
                                                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                            {msg.content}
                                                        </ReactMarkdown>
                                                    </div>
                                                )}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest px-2">
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex w-full gap-4 md:gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300 flex-row">
                                        <div className="w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-sm bg-muted border border-border/50 text-primary">
                                            <Bot className="h-5 w-5" />
                                        </div>
                                        <div className="flex flex-col gap-2 max-w-[85%] items-start">
                                            <div className="px-6 py-5 rounded-[1.5rem] shadow-sm bg-muted/30 border border-border/40 rounded-tl-none flex items-center h-[54px] backdrop-blur-sm">
                                                <div className="flex items-center gap-1.5 h-full">
                                                    <span className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-2.5 h-2.5 rounded-full bg-primary/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground/60 font-black uppercase tracking-widest px-2">
                                                Synthesizing Response...
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Input Area (Floating) */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-10 bg-gradient-to-t from-background via-background/95 to-transparent pt-20 z-20 pointer-events-none">
                        <div className="max-w-4xl mx-auto relative group pointer-events-auto">
                            <div className="absolute inset-0 bg-primary/10 blur-3xl opacity-0 group-focus-within:opacity-40 transition-opacity duration-500 pointer-events-none" />
                            <div className="relative flex items-end gap-3 bg-card/80 backdrop-blur-xl border border-border/50 rounded-3xl p-3 pl-6 shadow-[0_20px_50px_-12px_rgba(0,0,0,0.1)] ring-offset-background group-focus-within:ring-2 group-focus-within:ring-primary/20 group-focus-within:border-primary/40 transition-all duration-300">
                                <div className="pb-3 pr-2">
                                    <button className="p-2.5 rounded-xl bg-muted/50 text-muted-foreground hover:text-primary hover:bg-primary/10 transition-all">
                                        <Paperclip className="h-5 w-5" />
                                    </button>
                                </div>
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Ask anything about your documents..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 py-3.5 text-[16px] resize-none max-h-40 overflow-y-auto leading-relaxed scrollbar-hide font-medium placeholder:text-muted-foreground/40"
                                    rows={1}
                                    style={{ height: 'auto' }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                />
                                <div className="flex items-center gap-2 pr-1 pb-1">
                                    <button className="p-3 text-muted-foreground/60 hover:text-primary transition-colors hidden md:block">
                                        <Mic className="h-5 w-5" />
                                    </button>
                                    <Button
                                        size="icon"
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || isLoading}
                                        className={cn(
                                            "h-12 w-12 rounded-2xl transition-all duration-500 flex items-center justify-center shadow-lg",
                                            inputValue.trim() && !isLoading 
                                                ? "bg-primary text-primary-foreground scale-100 hover:scale-105 shadow-primary/20" 
                                                : "bg-muted text-muted-foreground/30 opacity-50 scale-90"
                                        )}
                                    >
                                        {isLoading ? (
                                            <div className="animate-spin h-5 w-5 border-[3px] border-primary-foreground border-t-transparent rounded-full" />
                                        ) : (
                                            <Send className="h-5 w-5" />
                                        )}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-[10px] text-center mt-4 text-muted-foreground/40 font-black uppercase tracking-[0.2em]">
                                Veridoc AI Engine • Powered by RAG 2.0
                            </p>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
