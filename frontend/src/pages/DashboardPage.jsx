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

export default function DashboardPage() {
    const navigate = useNavigate();
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
            />
            <SidebarInset className="bg-background flex flex-col h-svh overflow-hidden relative">
                {/* Header */}
                <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 z-30">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mx-2 h-4" />

                    </div>
                    <div className="flex items-center gap-3">
                        <ThemeToggle />
                    </div>
                </header>

                {/* Main Content Area */}
                <div className="flex-1 relative flex flex-col min-h-0 overflow-hidden">
                    {/* Chat Area (Scrollable) */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth"
                    >
                        {isFetchingHistory ? (
                            <div className="min-h-full flex flex-col items-center justify-center py-12 md:py-20 text-muted-foreground gap-4">
                                <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full" />
                                <p className="text-sm font-medium">Loading chat history...</p>
                            </div>
                        ) : messages.length === 0 ? (
                            <div className="min-h-full flex flex-col items-center justify-center text-center space-y-6 py-12 md:py-20">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center animate-pulse">
                                    <Bot className="h-8 w-8 text-primary" />
                                </div>
                                <div className="space-y-2 max-w-md">
                                    <h2 className="text-3xl font-bold tracking-tight">How can I help you today?</h2>
                                    <p className="text-muted-foreground px-4">
                                        Ask me anything about Air India policies, documents, and guidelines.
                                        Powered by RAG for accurate, source-backed answers.
                                    </p>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl px-4 mt-8 pb-32">
                                    {[
                                        "Summarize the latest document",
                                        "What is the current policy?",
                                        "Check the key details",
                                        "Provide an overview"
                                    ].map((suggestion, i) => (
                                        <button
                                            key={i}
                                            onClick={() => {
                                                setInputValue(suggestion);
                                            }}
                                            className="text-left p-4 rounded-xl border border-border/50 hover:bg-muted/50 transition-all text-sm group"
                                        >
                                            <span className="font-medium text-foreground block">{suggestion}</span>
                                            <span className="text-xs text-muted-foreground">Ask AI to help with this...</span>
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="max-w-3xl mx-auto w-full space-y-6 pb-40">
                                {messages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={cn(
                                            "flex w-full gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300",
                                            msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                            msg.role === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-foreground"
                                        )}>
                                            {msg.role === "user" ? <User2 className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                        </div>
                                        <div className={cn(
                                            "flex flex-col gap-1 max-w-[85%]",
                                            msg.role === "user" ? "items-end" : "items-start"
                                        )}>
                                            <div className={cn(
                                                "px-4 py-3 rounded-2xl text-[15px] leading-relaxed shadow-sm",
                                                msg.role === "user"
                                                    ? "bg-primary text-primary-foreground rounded-tr-none"
                                                    : "bg-muted/50 border border-border/50 rounded-tl-none font-medium text-foreground dark:text-gray-200"
                                            )}>
                                                {msg.content}
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase px-1">
                                                {msg.timestamp}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex w-full gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300 flex-row">
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm bg-muted text-foreground">
                                            <Bot className="h-4 w-4" />
                                        </div>
                                        <div className="flex flex-col gap-1 max-w-[85%] items-start">
                                            <div className="px-4 py-4 rounded-2xl text-[15px] leading-relaxed shadow-sm bg-muted/50 border border-border/50 rounded-tl-none font-medium text-foreground dark:text-gray-200 flex items-center h-[46px]">
                                                <div className="flex items-center gap-1.5 h-full">
                                                    <span className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '0ms' }} />
                                                    <span className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '150ms' }} />
                                                    <span className="w-2 h-2 rounded-full bg-foreground/50 animate-bounce" style={{ animationDelay: '300ms' }} />
                                                </div>
                                            </div>
                                            <span className="text-[10px] text-muted-foreground font-medium uppercase px-1">
                                                Typing...
                                            </span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Input Area (Floating) */}
                    <div className="absolute bottom-0 left-0 right-0 p-4 md:p-8 bg-gradient-to-t from-background via-background/95 to-transparent pt-12 z-20 pointer-events-none">
                        <div className="max-w-3xl mx-auto relative group pointer-events-auto">
                            <div className="absolute inset-0 bg-primary/20 blur-3xl opacity-0 group-focus-within:opacity-30 transition-opacity pointer-events-none" />
                            <div className="relative flex items-end gap-2 bg-muted/50 backdrop-blur border border-border/50 rounded-2xl p-2 pl-4 shadow-xl ring-offset-background group-focus-within:ring-2 group-focus-within:ring-primary/20 group-focus-within:border-primary/50 transition-all">
                                <textarea
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === "Enter" && !e.shiftKey) {
                                            e.preventDefault();
                                            handleSendMessage();
                                        }
                                    }}
                                    placeholder="Message Veridoc AI..."
                                    className="flex-1 bg-transparent border-none focus:ring-0 py-3 text-[15px] resize-none max-h-40 overflow-y-auto leading-relaxed scrollbar-hide"
                                    rows={1}
                                    style={{ height: 'auto' }}
                                    onInput={(e) => {
                                        e.target.style.height = 'auto';
                                        e.target.style.height = e.target.scrollHeight + 'px';
                                    }}
                                />
                                <div className="flex items-center gap-1 pr-1 pb-1">
                                    <button className="p-2 text-muted-foreground hover:text-primary transition-colors">
                                        <Mic className="h-5 w-5" />
                                    </button>
                                    <Button
                                        size="icon"
                                        onClick={handleSendMessage}
                                        disabled={!inputValue.trim() || isLoading}
                                        className={cn(
                                            "h-9 w-9 rounded-xl transition-all duration-300 flex items-center justify-center",
                                            inputValue.trim() && !isLoading ? "bg-primary scale-100" : "bg-muted-foreground opacity-30 scale-90"
                                        )}
                                    >
                                        {isLoading ? <div className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" /> : <Send className="h-4 w-4" />}
                                    </Button>
                                </div>
                            </div>
                            <p className="text-[10px] text-center mt-3 text-muted-foreground/60 font-medium">
                                Veridoc AI can make mistakes. Check important info.
                            </p>
                        </div>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}
