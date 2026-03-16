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
                <header className="flex h-14 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background/95 backdrop-blur z-30">
                    <div className="flex items-center gap-2">
                        <SidebarTrigger className="-ml-1" />
                        <Separator orientation="vertical" className="mx-2 h-4" />
                        <h1 className="text-sm font-medium">Profile Settings</h1>
                    </div>
                    <ThemeToggle />
                </header>

                <div className="flex-1 overflow-y-auto p-4 md:p-8">
                    <div className="max-w-2xl mx-auto space-y-8">
                        <div>
                            <h2 className="text-3xl font-bold tracking-tight">Profile</h2>
                            <p className="text-muted-foreground text-sm">Manage your personal information and how it's displayed.</p>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center p-12">
                                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                            </div>
                        ) : (
                            <form onSubmit={handleUpdate} className="space-y-6">
                                <Card className="border-sidebar-border/50 shadow-sm overflow-hidden">
                                    <CardHeader className="bg-muted/30 pb-8">
                                        <div className="flex items-center gap-6">
                                            <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                                                <div className="w-24 h-24 rounded-full bg-primary/10 flex items-center justify-center text-primary border-4 border-background shadow-xl overflow-hidden relative">
                                                    {isUploading ? (
                                                        <div className="absolute inset-0 bg-background/60 flex items-center justify-center z-10">
                                                            <Loader2 className="h-8 w-8 animate-spin" />
                                                        </div>
                                                    ) : null}
                                                    {user.picture_url ? (
                                                        <img src={user.picture_url} alt={user.full_name} className="h-full w-full object-cover transition-transform group-hover:scale-110" />
                                                    ) : (
                                                        <User2 className="h-12 w-12" />
                                                    )}

                                                    {/* Camera Overlay */}
                                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <Camera className="h-8 w-8 text-white" />
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
                                            <div>
                                                <CardTitle className="text-2xl">{user.full_name || "User Name"}</CardTitle>
                                                <CardDescription>{user.email}</CardDescription>
                                            </div>
                                        </div>
                                    </CardHeader>
                                    <CardContent className="pt-8 space-y-6">
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Full Name</label>
                                                <div className="relative">
                                                    <User2 className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        className="pl-9 bg-muted/20"
                                                        value={user.full_name}
                                                        onChange={(e) => setUser({ ...user, full_name: e.target.value })}
                                                        placeholder="Your full name"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Phone Number</label>
                                                <div className="relative">
                                                    <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                    <Input
                                                        className="pl-9 bg-muted/20"
                                                        value={user.phone}
                                                        onChange={(e) => setUser({ ...user, phone: e.target.value })}
                                                        placeholder="+1 (555) 000-0000"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Email Address</label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    disabled
                                                    className="pl-9 bg-muted/50 cursor-not-allowed"
                                                    value={user.email}
                                                />
                                            </div>
                                            <p className="text-[10px] text-muted-foreground ml-1 italic">Email cannot be changed after registration.</p>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground ml-1">Bio</label>
                                            <div className="relative">
                                                <FileText className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                                <textarea
                                                    className="w-full min-h-[120px] bg-muted/20 rounded-lg border border-input pl-9 pr-3 py-3 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                                                    value={user.bio}
                                                    onChange={(e) => setUser({ ...user, bio: e.target.value })}
                                                    placeholder="Tell us a little about yourself..."
                                                />
                                            </div>
                                        </div>

                                        <div className="pt-4 flex justify-end gap-3">
                                            <Button type="submit" disabled={isSaving} className="rounded-full px-8 shadow-lg shadow-primary/20">
                                                {isSaving ? (
                                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                ) : (
                                                    <Save className="mr-2 h-4 w-4" />
                                                )}
                                                Save Changes
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