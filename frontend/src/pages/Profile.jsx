import React, { useState, useEffect, useRef } from "react";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { ThemeToggle } from "@/components/ThemeToggle";
import { User2, Mail, Phone, FileText, Save, Loader2, Camera } from "lucide-react";
import { getMe, updateMe, uploadProfilePhoto } from "@/services/userService";
import { useToast } from "@/hooks/use-toast";

export default function Profile() {
    const [user, setUser] = useState({
        full_name: "",
        email: "",
        phone: "",
        bio: ""
    });
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef(null);

    const { toast } = useToast();

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const data = await getMe();
                setUser({
                    full_name: data.full_name || "",
                    email: data.email || "",
                    phone: data.phone || "",
                    bio: data.bio || "",
                    picture_url: data.picture_url || ""
                });
            } catch (error) {
                console.error("Failed to fetch user data:", error);
                toast({
                    title: "Error",
                    description: "Failed to load user profile.",
                    variant: "destructive",
                });
            } finally {
                setIsLoading(false);
            }
        };
        fetchUserData();
    }, [toast]);

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validations
        if (file.size > 5 * 1024 * 1024) {
            toast({
                title: "File too large",
                description: "Maximum file size is 5MB.",
                variant: "destructive",
            });
            return;
        }

        setIsUploading(true);
        try {
            const data = await uploadProfilePhoto(file);

            if (data.picture_url) {
                setUser(prev => ({ ...prev, picture_url: data.picture_url }));
                toast({
                    title: "Success",
                    description: "Profile picture updated.",
                });
            } else {
                throw new Error("Upload failed");
            }
        } catch (error) {
            console.error("Upload error:", error);
            const errorMessage = error.response?.data?.detail || "Could not upload your image.";
            toast({
                title: "Upload Failed",
                description: errorMessage,
                variant: "destructive",
            });
        } finally {
            setIsUploading(false);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            await updateMe({
                full_name: user.full_name,
                phone: user.phone,
                bio: user.bio
            });
            toast({
                title: "Success",
                description: "Your profile has been updated.",
            });
        } catch (error) {
            console.error("Failed to update profile:", error);
            toast({
                title: "Update Failed",
                description: "There was a problem saving your changes.",
                variant: "destructive",
            });
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset className="bg-background flex flex-col h-svh overflow-hidden">
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b border-border/50 px-6 bg-background/80 backdrop-blur-md z-30">
                    <div className="flex items-center gap-4">
                        <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-primary transition-colors" />
                        <Separator orientation="vertical" className="h-4 bg-border/50" />
                        <h1 className="text-sm font-bold text-muted-foreground/80 tracking-tight">Profile Settings</h1>
                    </div>
                    <ThemeToggle />
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-12 bg-gradient-to-b from-background to-background/50">
                    <div className="max-w-3xl mx-auto space-y-12 pb-20">
                        <div className="space-y-2">
                            <h2 className="text-5xl font-black tracking-tight text-foreground/90">Identity</h2>
                            <p className="text-muted-foreground/70 text-lg font-medium">Manage your digital presence and contact details.</p>
                        </div>

                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center p-24 space-y-4">
                                <Loader2 className="h-12 w-12 animate-spin text-primary/50" />
                                <p className="text-sm font-bold text-muted-foreground/50 uppercase tracking-widest">Securing Connection...</p>
                            </div>
                        ) : (
                            <form onSubmit={handleUpdate} className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                                <Card className="border-border/50 shadow-2xl shadow-primary/5 overflow-hidden rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
                                    <CardHeader className="bg-primary/5 border-b border-border/30 pb-10 pt-10 px-10">
                                        <div className="flex flex-col md:flex-row items-center gap-8">
                                            <div className="relative group" onClick={() => fileInputRef.current?.click()}>
                                                <div className="w-32 h-32 rounded-[2rem] bg-background flex items-center justify-center text-primary border-[6px] border-card shadow-2xl overflow-hidden relative cursor-pointer ring-1 ring-primary/20 transition-all group-hover:ring-primary/50">
                                                    {isUploading ? (
                                                        <div className="absolute inset-0 bg-background/80 flex items-center justify-center z-10 backdrop-blur-sm">
                                                            <Loader2 className="h-10 w-10 animate-spin text-primary" />
                                                        </div>
                                                    ) : null}
                                                    {user.picture_url ? (
                                                        <img src={user.picture_url} alt={user.full_name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110" />
                                                    ) : (
                                                        <User2 className="h-16 w-16 opacity-50" />
                                                    )}

                                                    {/* Camera Overlay */}
                                                    <div className="absolute inset-0 bg-primary/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 backdrop-blur-[2px]">
                                                        <Camera className="h-10 w-10 text-white drop-shadow-lg" />
                                                    </div>
                                                </div>
                                                <input
                                                    type="file"
                                                    ref={fileInputRef}
                                                    className="hidden"
                                                    accept="image/*"
                                                    onChange={handleImageUpload}
                                                />
                                            </div>
                                            <div className="text-center md:text-left space-y-2">
                                                <CardTitle className="text-4xl font-black tracking-tight">{user.full_name || "New Explorer"}</CardTitle>
                                                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground/70 font-medium">
                                                    <Mail className="h-4 w-4" />
                                                    {user.email}
                                                </div>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-12 px-10 pb-12 space-y-10">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Full Name</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-primary/5 text-primary/50 group-focus-within:text-primary transition-colors">
                                                        <User2 className="h-4 w-4" />
                                                    </div>
                                                    <Input
                                                        className="h-14 pl-14 bg-background/50 border-border/50 rounded-2xl focus:ring-primary/20 focus:border-primary/50 transition-all font-bold text-base"
                                                        value={user.full_name}
                                                        onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                                                        placeholder="Your legal name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Mobile Contact</label>
                                                <div className="relative group">
                                                    <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-accent/5 text-accent/50 group-focus-within:text-accent transition-colors">
                                                        <Phone className="h-4 w-4" />
                                                    </div>
                                                    <Input
                                                        className="h-14 pl-14 bg-background/50 border-border/50 rounded-2xl focus:ring-accent/20 focus:border-accent/50 transition-all font-bold text-base"
                                                        value={user.phone}
                                                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Primary Email</label>
                                            <div className="relative opacity-70">
                                                <div className="absolute left-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg bg-muted-foreground/5 text-muted-foreground/30">
                                                    <Mail className="h-4 w-4" />
                                                </div>
                                                <Input
                                                    disabled
                                                    className="h-14 pl-14 bg-muted/20 border-border/30 rounded-2xl cursor-not-allowed font-bold text-base"
                                                    value={user.email}
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground/40 ml-1 font-bold italic">Email identity is immutable for security compliance.</p>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase tracking-[0.2em] text-muted-foreground/60 ml-1">Professional Bio</label>
                                            <div className="relative group">
                                                <div className="absolute left-4 top-5 p-1.5 rounded-lg bg-primary/5 text-primary/50 group-focus-within:text-primary transition-colors">
                                                    <FileText className="h-4 w-4" />
                                                </div>
                                                <textarea
                                                    className="w-full min-h-[160px] bg-background/50 rounded-[1.5rem] border border-border/50 pl-14 pr-6 py-5 text-base font-medium focus:ring-2 focus:ring-primary/20 focus:border-primary/50 transition-all outline-none resize-none"
                                                    value={user.bio}
                                                    onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                                    placeholder="Synthesize your background..."
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-8 flex justify-end">
                                            <Button type="submit" disabled={isSaving} className="h-16 rounded-[1.5rem] px-12 font-black text-lg shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all">
                                                {isSaving ? (
                                                    <Loader2 className="mr-3 h-6 w-6 animate-spin" />
                                                ) : (
                                                    <Save className="mr-3 h-6 w-6" />
                                                )}
                                                Update Profile
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>
                            </form>
                        )}
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    );
}