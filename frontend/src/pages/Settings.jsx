import React, { useState } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Bell, Lock, Globe, Shield, Trash2, ChevronRight, Settings as SettingsIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Settings() {
    const [notifications, setNotifications] = useState(true);

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background flex flex-col h-svh overflow-hidden">
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/50 px-6 bg-background/80 backdrop-blur-md z-30">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-primary transition-colors" />
                        <Separator orientation="vertical" className="h-4 bg-border/50" />
                        <h1 className="text-sm font-bold text-muted-foreground/80 tracking-tight">Settings</h1>
                    </div>
                    <ThemeToggle />
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-gradient-to-b from-background to-background/50">
                    <div className="max-w-3xl mx-auto space-y-12 pb-20">
                        <div className="space-y-2">
                            <h2 className="text-5xl font-black tracking-tight text-foreground/90">Settings</h2>
                            <p className="text-muted-foreground/70 text-lg font-medium">Customize your workspace and security preferences.</p>
                        </div>

                        {/* Preferences */}
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">System Preferences</h3>
                            <Card className="border-border/50 shadow-2xl shadow-primary/5 overflow-hidden rounded-[2rem] bg-card/50 backdrop-blur-sm">
                                <div className="divide-y divide-border/30">
                                    <div className="p-6 flex items-center justify-between group hover:bg-muted/40 transition-all duration-300">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20 transition-transform group-hover:scale-110">
                                                <Bell className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[16px] font-bold text-foreground">Interactive Notifications</p>
                                                <p className="text-xs font-medium text-muted-foreground/70">Get real-time updates on analysis progress.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setNotifications(!notifications)}
                                            className={cn(
                                                "w-14 h-7 rounded-full transition-all duration-500 relative shadow-inner p-1",
                                                notifications ? "bg-primary" : "bg-muted-foreground/20"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-5 h-5 rounded-full bg-white transition-all duration-500 shadow-xl",
                                                notifications ? "translate-x-7" : "translate-x-0"
                                            )} />
                                        </button>
                                    </div>
                                    <div className="p-6 flex items-center justify-between group hover:bg-muted/40 transition-all duration-300 cursor-pointer">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-[1.25rem] bg-accent/10 flex items-center justify-center text-accent shadow-inner border border-accent/20 transition-transform group-hover:scale-110">
                                                <Globe className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[16px] font-bold text-foreground">Workspace Language</p>
                                                <p className="text-xs font-medium text-muted-foreground/70">English (United States)</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            </Card>
                        </section>

                        {/* Security */}
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/50 ml-1">Privacy & Security</h3>
                            <Card className="border-border/50 shadow-2xl shadow-primary/5 overflow-hidden rounded-[2rem] bg-card/50 backdrop-blur-sm">
                                <div className="divide-y divide-border/30">
                                    <div className="p-6 flex items-center justify-between group hover:bg-muted/40 transition-all duration-300 cursor-pointer">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-[1.25rem] bg-primary/10 flex items-center justify-center text-primary shadow-inner border border-primary/20 transition-transform group-hover:scale-110">
                                                <Lock className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[16px] font-bold text-foreground">Advanced 2FA</p>
                                                <p className="text-xs font-medium text-muted-foreground/70">Biometric and hardware key support.</p>
                                            </div>
                                        </div>
                                        <div className="px-4 py-1.5 bg-destructive/10 text-destructive text-[10px] font-black uppercase tracking-widest rounded-full border border-destructive/20 shadow-sm">
                                            Not Enabled
                                        </div>
                                    </div>
                                    <div className="p-6 flex items-center justify-between group hover:bg-muted/40 transition-all duration-300 cursor-pointer">
                                        <div className="flex items-center gap-5">
                                            <div className="w-12 h-12 rounded-[1.25rem] bg-green-500/10 flex items-center justify-center text-green-500 shadow-inner border border-green-500/20 transition-transform group-hover:scale-110">
                                                <Shield className="h-6 w-6" />
                                            </div>
                                            <div>
                                                <p className="text-[16px] font-bold text-foreground">Data Governance</p>
                                                <p className="text-xs font-medium text-muted-foreground/70">Review document retention policies.</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-5 w-5 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                                    </div>
                                </div>
                            </Card>
                        </section>

                        {/* Danger Zone */}
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive/50 ml-1">Danger Zone</h3>
                            <Card className="border-destructive/20 bg-destructive/5 shadow-2xl shadow-destructive/5 overflow-hidden rounded-[2rem] backdrop-blur-sm">
                                <div className="p-8 flex flex-col md:flex-row items-center justify-between gap-6">
                                    <div className="flex items-center gap-6 text-center md:text-left">
                                        <div className="w-16 h-16 rounded-[1.5rem] bg-destructive/10 flex items-center justify-center text-destructive shadow-inner border border-destructive/20">
                                            <Trash2 className="h-8 w-8" />
                                        </div>
                                        <div>
                                            <p className="text-xl font-black text-destructive">Terminate Account</p>
                                            <p className="text-sm font-medium text-destructive/70">This action is permanent and irreversible.</p>
                                        </div>
                                    </div>
                                    <Button variant="destructive" size="lg" className="rounded-2xl px-10 h-14 text-sm font-black uppercase tracking-widest shadow-xl shadow-destructive/20 hover:scale-105 active:scale-95 transition-all">
                                        Terminate
                                    </Button>
                                </div>
                            </Card>
                        </section>
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}