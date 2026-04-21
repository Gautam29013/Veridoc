import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { 
    Card, 
    CardContent, 
    CardDescription, 
    CardHeader, 
    CardTitle 
} from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ThemeToggle } from "@/components/ThemeToggle";
import { logout } from "@/services/authService";
import { 
    Upload, 
    FileText, 
    Trash2, 
    ShieldAlert, 
    Loader2, 
    Search, 
    LogOut, 
    Users, 
    UserPlus, 
    UserMinus,
    Mail
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getAllUsers, deleteUser, updateUserRole } from "@/services/userService";

export default function AdminPanel() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [users, setUsers] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingUsers, setIsLoadingUsers] = useState(false);

    useEffect(() => {
        const verifyAdmin = async () => {
            try {
                const response = await api.get("/auth/me");
                if (response.data.role !== "admin") {
                    toast({
                        variant: "destructive",
                        title: "Access Denied",
                        description: "You do not have administrator privileges.",
                    });
                    navigate("/dashboard");
                } else {
                    setUser(response.data);
                    fetchDocuments();
                    fetchUsers();
                }
            } catch (err) {
                navigate("/login");
            } finally {
                setIsLoading(false);
            }
        };
        verifyAdmin();
    }, [navigate, toast]);

    const fetchDocuments = async () => {
        try {
            const res = await api.get("/documents/list");
            setDocuments(res.data.documents || []);
        } catch (err) {
            console.error("Failed to fetch documents", err);
        }
    };

    const fetchUsers = async () => {
        setIsLoadingUsers(true);
        try {
            const data = await getAllUsers();
            setUsers(data);
        } catch (err) {
            console.error("Failed to fetch users", err);
            toast({
                variant: "destructive",
                title: "Error",
                description: "Failed to load users list.",
            });
        } finally {
            setIsLoadingUsers(false);
        }
    };

    const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (!file) return;

        if (file.type !== "application/pdf") {
            toast({
                variant: "destructive",
                title: "Invalid file type",
                description: "Only PDF documents are supported for the RAG pipeline.",
            });
            return;
        }

        const formData = new FormData();
        formData.append("file", file);

        setIsUploading(true);
        toast({
            title: "Indexing Document...",
            description: "Uploading and embedding with AWS Bedrock. This might take a minute.",
        });

        try {
            const response = await api.post("/documents/upload", formData);
            
            toast({
                title: "Success!",
                description: response.data.message || "Document uploaded successfully.",
            });
            fetchDocuments();
        } catch (error) {
            console.error(error);
            toast({
                variant: "destructive",
                title: "Upload Failed",
                description: error.response?.data?.detail || "An error occurred during indexing.",
            });
        } finally {
            setIsUploading(false);
            event.target.value = null;
        }
    };

    const handleDeleteDoc = async (docId) => {
        try {
            await api.delete(`/documents/${docId}`);
            setDocuments(documents.filter(doc => doc._id !== docId));
            toast({
                title: "Document Removed",
                description: "The document metadata has been removed.",
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Delete Failed",
                description: "Could not remove the document.",
            });
        }
    };

    const handleDeleteUser = async (userId, userEmail) => {
        if (!window.confirm(`Are you sure you want to delete user ${userEmail}?`)) return;
        
        try {
            await deleteUser(userId);
            setUsers(users.filter(u => u._id !== userId));
            toast({
                title: "User Deleted",
                description: `${userEmail} has been removed.`,
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Action Failed",
                description: err.response?.data?.detail || "Could not delete user.",
            });
        }
    };

    const handleToggleAdmin = async (userId, currentRole, userEmail) => {
        const newRole = currentRole === "admin" ? "user" : "admin";
        const actionText = newRole === "admin" ? "make admin" : "remove admin";
        
        if (!window.confirm(`Are you sure you want to ${actionText} ${userEmail}?`)) return;

        try {
            await updateUserRole(userId, newRole);
            setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
            toast({
                title: "Role Updated",
                description: `${userEmail} is now a ${newRole}.`,
            });
        } catch (err) {
            toast({
                variant: "destructive",
                title: "Update Failed",
                description: err.response?.data?.detail || "Could not update user role.",
            });
        }
    };

    const handleLogout = () => {
        logout();
        navigate("/login");
        toast({
            title: "Logged Out",
            description: "You have been successfully signed out.",
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-background flex flex-col p-6 md:p-12 space-y-12 max-w-6xl mx-auto">
                <div className="flex items-center justify-between pb-4 border-b">
                    <Skeleton className="h-8 w-64" />
                    <Skeleton className="h-10 w-40" />
                </div>
                <Skeleton className="h-[200px] w-full rounded-2xl" />
                <div className="space-y-4">
                    <Skeleton className="h-6 w-48" />
                    <Skeleton className="h-[300px] w-full rounded-xl" />
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background relative flex flex-col">
            {/* Background Decor */}
            <div className="absolute top-0 right-0 w-[40%] h-[40%] bg-primary/5 blur-[120px] rounded-full -z-10" />
            <div className="absolute bottom-0 left-0 w-[40%] h-[40%] bg-accent/5 blur-[120px] rounded-full -z-10" />

            {/* Header */}
            <header className="border-b border-border/50 bg-background/80 px-8 py-5 flex items-center justify-between z-30 sticky top-0 backdrop-blur-xl">
                <div className="flex items-center gap-4 transition-transform hover:scale-105 cursor-pointer">
                    <div className="p-2 rounded-xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                        <ShieldAlert className="w-5 h-5" />
                    </div>
                    <h1 className="text-2xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Veridoc <span className="text-primary/70">Admin</span></h1>
                </div>
                <div className="flex items-center gap-6">
                    <ThemeToggle />
                    <div className="h-6 w-[1px] bg-border/50" />
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="font-bold text-xs uppercase tracking-widest text-muted-foreground hover:text-destructive hover:bg-destructive/5 transition-all gap-2">
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                    </Button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-7xl mx-auto p-6 md:p-12 space-y-10">
                <Tabs defaultValue="documents" className="w-full">
                    <TabsList className="bg-muted/50 p-1 rounded-2xl mb-8">
                        <TabsTrigger value="documents" className="rounded-xl px-8 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg">
                            <FileText className="w-4 h-4 mr-2" />
                            Knowledge Base
                        </TabsTrigger>
                        <TabsTrigger value="users" className="rounded-xl px-8 font-bold text-xs uppercase tracking-widest data-[state=active]:bg-background data-[state=active]:shadow-lg">
                            <Users className="w-4 h-4 mr-2" />
                            User Management
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="documents" className="space-y-16 animate-in fade-in duration-500">
                        {/* Hero / Upload Section */}
                        <div className="space-y-10">
                            <div className="space-y-3">
                                <h2 className="text-5xl font-black tracking-tight text-foreground/90">Knowledge Base</h2>
                                <p className="text-muted-foreground/70 text-lg font-medium max-w-2xl">Orchestrate your organization's collective intelligence. Upload PDFs to instantly vectorize and deploy across the RAG pipeline.</p>
                            </div>

                            <Card className="relative overflow-hidden group border-border/50 shadow-2xl shadow-primary/5 rounded-[2.5rem] bg-card/50 backdrop-blur-sm">
                                <CardHeader className="p-10 pb-6">
                                    <CardTitle className="text-3xl font-black tracking-tight">Rapid Ingestion</CardTitle>
                                    <CardDescription className="text-base font-medium">
                                        Drag and drop files to start the automated embedding process.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className="p-10 pt-0">
                                    <div className="flex flex-col md:flex-row items-center gap-12">
                                        <div className="shrink-0 relative group/upload">
                                            {isUploading && (
                                                <div className="absolute inset-0 z-20 bg-background/90 backdrop-blur-md rounded-[2rem] flex flex-col items-center justify-center p-6 text-center shadow-2xl border border-primary/20">
                                                    <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
                                                    <span className="text-sm font-black uppercase tracking-widest text-primary animate-pulse">Vectorizing...</span>
                                                </div>
                                            )}
                                            <div className="border-[3px] border-dashed border-primary/20 rounded-[2rem] p-10 flex flex-col items-center justify-center text-center bg-primary/5 hover:bg-primary/10 hover:border-primary/40 transition-all w-80 h-56 cursor-pointer relative group-hover/upload:scale-[1.02]">
                                                <div className="p-5 rounded-2xl bg-primary/10 text-primary mb-4 shadow-inner">
                                                    <Upload className="w-10 h-10" />
                                                </div>
                                                <span className="font-black text-sm uppercase tracking-widest">Select PDF File</span>
                                                <span className="text-[10px] font-bold text-muted-foreground/50 mt-2 uppercase tracking-tight">Max Size: 50MB</span>
                                                <input 
                                                    type="file" 
                                                    accept=".pdf"
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    onChange={handleFileUpload}
                                                    disabled={isUploading}
                                                />
                                            </div>
                                        </div>
                                        <div className="flex-1 space-y-6">
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="p-4 rounded-2xl bg-background/50 border border-border/50">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Embedding Engine</p>
                                                    <p className="text-sm font-bold">AWS Bedrock (Titan V2)</p>
                                                </div>
                                                <div className="p-4 rounded-2xl bg-background/50 border border-border/50">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground/50 mb-1">Vector Store</p>
                                                    <p className="text-sm font-bold">ChromaDB / AWS OpenSearch</p>
                                                </div>
                                            </div>
                                            <p className="text-xs font-medium text-muted-foreground/60 leading-relaxed italic">
                                                Note: All documents are automatically chunked with a 10% overlap to preserve semantic context during retrieval.
                                            </p>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Documents Table Section */}
                        <section className="space-y-6">
                            <div className="flex items-center justify-between px-2">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 rounded-lg bg-accent/10 text-accent">
                                        <FileText className="w-5 h-5" />
                                    </div>
                                    <h3 className="text-xl font-black tracking-tight">Active Repositories</h3>
                                </div>
                                <Badge variant="outline" className="px-4 py-1 rounded-full font-bold text-[10px] uppercase tracking-widest bg-muted/20 border-border/50">
                                    {documents.length} Indexed Objects
                                </Badge>
                            </div>

                            <Card className="rounded-[2rem] overflow-hidden border-border/50 shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
                                {documents.length === 0 ? (
                                    <div className="p-24 text-center flex flex-col items-center justify-center text-muted-foreground/30">
                                        <div className="p-6 rounded-3xl bg-muted/20 mb-6">
                                            <Search className="w-16 h-16 opacity-20" />
                                        </div>
                                        <p className="font-black text-xl text-muted-foreground/50 uppercase tracking-tighter">Repository Empty</p>
                                        <p className="text-sm font-medium opacity-70 mt-2">Initialize your knowledge base by uploading a PDF.</p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto">
                                        <Table>
                                            <TableHeader className="bg-muted/40 border-b border-border/50">
                                                <TableRow className="hover:bg-transparent">
                                                    <TableHead className="w-[40%] px-8 h-16 font-black uppercase text-[10px] tracking-widest">Document Registry</TableHead>
                                                    <TableHead className="px-8 h-16 font-black uppercase text-[10px] tracking-widest">Ingestion Date</TableHead>
                                                    <TableHead className="px-8 h-16 font-black uppercase text-[10px] tracking-widest">Pipeline Status</TableHead>
                                                    <TableHead className="px-8 h-16 font-black uppercase text-[10px] tracking-widest text-center">Vectors</TableHead>
                                                    <TableHead className="px-8 h-16 font-black uppercase text-[10px] tracking-widest text-right">Actions</TableHead>
                                                </TableRow>
                                            </TableHeader>
                                            <TableBody>
                                                {documents.map((doc) => (
                                                    <TableRow key={doc._id} className="transition-all hover:bg-muted/20 border-b border-border/20 group">
                                                        <TableCell className="px-8 py-6 font-bold text-base max-w-[300px] truncate" title={doc.filename}>
                                                            {doc.filename}
                                                        </TableCell>
                                                        <TableCell className="px-8 py-6 text-sm font-medium text-muted-foreground/70">
                                                            {new Date(doc.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                        </TableCell>
                                                        <TableCell className="px-8 py-6">
                                                            <Badge variant="default" className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold uppercase text-[9px] tracking-widest px-3 py-1 rounded-full border border-emerald-500/20">
                                                                Live In RAG
                                                            </Badge>
                                                        </TableCell>
                                                        <TableCell className="px-8 py-6 text-center font-mono font-black text-xs text-primary/70">
                                                            {doc.chunk_count}
                                                        </TableCell>
                                                        <TableCell className="px-8 py-6 text-right">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleDeleteDoc(doc._id)} 
                                                                className="h-10 w-10 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all opacity-0 group-hover:opacity-100"
                                                            >
                                                                <Trash2 className="w-5 h-5" />
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </div>
                                )}
                            </Card>
                        </section>
                    </TabsContent>

                    <TabsContent value="users" className="space-y-10 animate-in fade-in duration-500">
                        <div className="space-y-3">
                            <h2 className="text-5xl font-black tracking-tight text-foreground/90">User Directory</h2>
                            <p className="text-muted-foreground/70 text-lg font-medium max-w-2xl">Manage access levels and oversee user accounts across the platform.</p>
                        </div>

                        <Card className="rounded-[2.5rem] overflow-hidden border-border/50 shadow-2xl shadow-primary/5 bg-card/50 backdrop-blur-sm">
                            {isLoadingUsers ? (
                                <div className="p-24 space-y-4">
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                    <Skeleton className="h-12 w-full" />
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-muted/40 border-b border-border/50">
                                            <TableRow className="hover:bg-transparent">
                                                <TableHead className="px-8 h-16 font-black uppercase text-[10px] tracking-widest">User Profile</TableHead>
                                                <TableHead className="px-8 h-16 font-black uppercase text-[10px] tracking-widest">Role</TableHead>
                                                <TableHead className="px-8 h-16 font-black uppercase text-[10px] tracking-widest">Joined Date</TableHead>
                                                <TableHead className="px-8 h-16 font-black uppercase text-[10px] tracking-widest text-right">Administrative Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {users.map((u) => (
                                                <TableRow key={u._id} className="transition-all hover:bg-muted/20 border-b border-border/20 group">
                                                    <TableCell className="px-8 py-6">
                                                        <div className="flex items-center gap-4">
                                                            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black overflow-hidden border border-primary/20">
                                                                {u.picture_url ? (
                                                                    <img src={u.picture_url} alt={u.full_name} className="w-full h-full object-cover" />
                                                                ) : (
                                                                    u.full_name?.charAt(0) || u.email.charAt(0).toUpperCase()
                                                                )}
                                                            </div>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-base">{u.full_name || "Unidentified User"}</span>
                                                                <span className="text-xs text-muted-foreground/60 flex items-center gap-1">
                                                                    <Mail className="w-3 h-3" />
                                                                    {u.email}
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-6">
                                                        <Badge variant={u.role === "admin" ? "default" : "secondary"} className={`font-black uppercase text-[9px] tracking-widest px-3 py-1 rounded-full border ${u.role === "admin" ? "bg-primary text-primary-foreground border-primary/20" : "bg-muted text-muted-foreground border-border/50"}`}>
                                                            {u.role}
                                                        </Badge>
                                                    </TableCell>
                                                    <TableCell className="px-8 py-6 text-sm font-medium text-muted-foreground/70">
                                                        {new Date(u.created_at).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </TableCell>
                                                    <TableCell className="px-8 py-6 text-right">
                                                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <Button 
                                                                variant="ghost" 
                                                                size="sm" 
                                                                onClick={() => handleToggleAdmin(u._id, u.role, u.email)}
                                                                disabled={u._id === user?._id}
                                                                className="font-bold text-[10px] uppercase tracking-widest gap-2 hover:bg-primary/10 hover:text-primary transition-all h-9 px-4 rounded-xl"
                                                            >
                                                                {u.role === "admin" ? (
                                                                    <><UserMinus className="w-4 h-4" /> Demote</>
                                                                ) : (
                                                                    <><UserPlus className="w-4 h-4" /> Make Admin</>
                                                                )}
                                                            </Button>
                                                            <Button 
                                                                variant="ghost" 
                                                                size="icon" 
                                                                onClick={() => handleDeleteUser(u._id, u.email)}
                                                                disabled={u._id === user?._id}
                                                                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </Button>
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </div>
                            )}
                        </Card>
                    </TabsContent>
                </Tabs>
            </main>
            
            {isUploading && (
               <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-xl animate-in fade-in duration-500">
                   <Card className="p-12 rounded-[3rem] shadow-2xl flex flex-col items-center border-border/50 max-w-md w-full mx-6 bg-card/50 backdrop-blur-2xl">
                       <div className="relative mb-10">
                           <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full animate-pulse" />
                           <Loader2 className="w-20 h-20 animate-spin text-primary relative z-10" />
                       </div>
                       <h3 className="font-black text-3xl mb-4 tracking-tighter">Orchestrating Intelligence</h3>
                       <p className="text-base font-medium text-muted-foreground/70 text-center leading-relaxed">
                           AWS Bedrock is currently distilling and embedding your document into our high-dimensional vector space. 
                       </p>
                       <div className="mt-10 flex gap-2">
                           <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-0" />
                           <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-150" />
                           <div className="w-2 h-2 rounded-full bg-primary animate-bounce delay-300" />
                       </div>
                   </Card>
               </div> 
            )}
        </div>
    );
}
