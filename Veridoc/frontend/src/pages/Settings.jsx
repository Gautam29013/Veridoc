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
                <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background/95 backdrop-blur z-30">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mx-2 h-4" />
                        <h1 className="text-sm font-medium">System Settings</h1>
                    </div>
                    <ThemeToggle />
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-2xl mx-auto space-y-8 pb-12">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
                            <p className="text-muted-foreground text-sm">Configure your preferences and account security.</p>
                        </div>

                        {/* Preferences */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Preferences</h3>
                            <Card className="border-sidebar-border/50 shadow-sm overflow-hidden">
                                <div className="divide-y divide-sidebar-border/30">
                                    <div className="p-4 flex items-center justify-between group hover:bg-muted/30 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500 shadow-sm border border-blue-500/20">
                                                <Bell className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">Enable Notifications</p>
                                                <p className="text-xs text-muted-foreground">Receive alerts for new documents and updates.</p>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => setNotifications(!notifications)}
                                            className={cn(
                                                "w-11 h-6 rounded-full transition-all duration-300 relative",
                                                notifications ? "bg-primary" : "bg-muted-foreground/30"
                                            )}
                                        >
                                            <div className={cn(
                                                "absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow-md",
                                                notifications ? "left-6" : "left-1"
                                            )} />
                                        </button>
                                    </div>
                                    <div className="p-4 flex items-center justify-between group hover:bg-muted/30 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-orange-500/10 flex items-center justify-center text-orange-500 shadow-sm border border-orange-500/20">
                                                <Globe className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">Language Preference</p>
                                                <p className="text-xs text-muted-foreground text-foreground/70">English (United States)</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                                    </div>
                                </div>
                            </Card>
                        </section>

                        {/* Security */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Security</h3>
                            <Card className="border-sidebar-border/50 shadow-sm overflow-hidden">
                                <div className="divide-y divide-sidebar-border/30">
                                    <div className="p-4 flex items-center justify-between group hover:bg-muted/30 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-500 shadow-sm border border-purple-500/20">
                                                <Lock className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">Two-Factor Authentication</p>
                                                <p className="text-xs text-muted-foreground">Add an extra layer of security to your account.</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-red-500/10 text-red-600 text-[10px] font-bold uppercase tracking-widest rounded-full border border-red-500/20">
                                            Disabled
                                        </div>
                                    </div>
                                    <div className="p-4 flex items-center justify-between group hover:bg-muted/30 transition-colors cursor-pointer">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500 shadow-sm border border-green-500/20">
                                                <Shield className="h-5 w-5" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-semibold">Privacy Policy</p>
                                                <p className="text-xs text-muted-foreground">Learn how we handle your medical documents.</p>
                                            </div>
                                        </div>
                                        <ChevronRight className="h-4 w-4 text-muted-foreground/50 group-hover:text-foreground transition-colors" />
                                    </div>
                                </div>
                            </Card>
                        </section>

                        {/* Danger Zone */}
                        <section className="space-y-4">
                            <h3 className="text-xs font-bold uppercase tracking-wider text-red-500/70 ml-1">Danger Zone</h3>
                            <Card className="border-red-500/20 bg-red-500/5 shadow-sm overflow-hidden">
                                <div className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-red-500/10 flex items-center justify-center text-red-500 shadow-sm border border-red-500/20">
                                            <Trash2 className="h-5 w-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-semibold text-red-600">Delete Account</p>
                                            <p className="text-xs text-red-500/70">Permanently remove all your documents and data.</p>
                                        </div>
                                    </div>
                                    <Button variant="destructive" size="sm" className="rounded-full px-4 text-xs font-bold uppercase tracking-widest shadow-lg shadow-red-500/20 hover:shadow-red-500/30 transition-all">
                                        Delete Now
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