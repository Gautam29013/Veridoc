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
import { Upload, FileText, Trash2, ShieldAlert, Loader2, Search, LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function AdminPanel() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [user, setUser] = useState(null);
    const [documents, setDocuments] = useState([]);
    const [isUploading, setIsUploading] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

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
            const res = await api.get("/api/v1/documents/list");
            setDocuments(res.data.documents || []);
        } catch (err) {
            console.error("Failed to fetch documents", err);
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
            const response = await api.post("/api/v1/documents/upload", formData, {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            });
            
            toast({
                title: "Success!",
                description: `Document indexed successfully into ${response.data.chunks_created} chunks.`,
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

    const handleDelete = async (docId) => {
        try {
            await api.delete(`/api/v1/documents/${docId}`);
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
            {/* Header */}
            <header className="border-b bg-muted/30 px-6 py-4 flex items-center justify-between z-10 sticky top-0 backdrop-blur-md">
                <div className="flex items-center gap-2">
                    <ShieldAlert className="w-6 h-6 text-primary" />
                    <h1 className="text-xl font-bold tracking-tight">Veridoc Admin Center</h1>
                </div>
                <div className="flex items-center gap-3">
                    <ThemeToggle />
                    <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground hover:text-destructive flex items-center gap-2">
                        <LogOut className="w-4 h-4" />
                        <span>Logout</span>
                    </Button>
                </div>
            </header>

            <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-12 space-y-12">
                
                {/* Upload Section */}
                <Card className="relative overflow-hidden group border-border shadow-sm rounded-2xl">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    <CardHeader className="relative z-10">
                        <CardTitle className="text-2xl font-bold">Knowledge Base Upload</CardTitle>
                        <CardDescription className="max-w-xl">
                            Automatically slice and embed organization documents. Uploading a PDF here instantly writes it to the Vector Database, meaning the AI will immediately start answering based on this new policy.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="relative z-10">
                        <div className="flex flex-col md:flex-row items-center gap-8">
                            <div className="flex-1 hidden md:block" />
                            <div className="shrink-0 relative">
                                {isUploading && (
                                    <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4 text-center">
                                        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
                                        <span className="text-sm font-semibold animate-pulse text-primary px-2">Embedding with Bedrock...</span>
                                    </div>
                                )}
                                <div className="border-2 border-dashed border-primary/40 rounded-xl p-8 flex flex-col items-center justify-center text-center bg-primary/5 hover:bg-primary/10 transition-colors w-72 h-44 cursor-pointer relative">
                                    <Upload className="w-8 h-8 text-primary mb-3" />
                                    <span className="font-semibold text-sm">Select PDF File</span>
                                    <span className="text-xs text-muted-foreground mt-1">.pdf files only</span>
                                    <input 
                                        type="file" 
                                        accept=".pdf"
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        onChange={handleFileUpload}
                                        disabled={isUploading}
                                    />
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Documents Table Section */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Indexed Documents Snapshot</h3>
                    </div>

                    <Card className="rounded-xl overflow-hidden border-border bg-card">
                        {documents.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
                                <Search className="w-10 h-10 mb-3 opacity-20" />
                                <p className="font-medium">No documents dynamically indexed yet.</p>
                                <p className="text-sm opacity-70">Upload your first PDF via the panel above.</p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader className="bg-muted/50">
                                    <TableRow>
                                        <TableHead className="w-[40%] px-6">Filename</TableHead>
                                        <TableHead className="px-6">Upload Date</TableHead>
                                        <TableHead className="px-6">Status</TableHead>
                                        <TableHead className="px-6 text-center">AI Chunks</TableHead>
                                        <TableHead className="px-6 text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {documents.map((doc) => (
                                        <TableRow key={doc._id} className="transition-colors">
                                            <TableCell className="px-6 py-4 font-medium max-w-[300px] truncate" title={doc.filename}>
                                                {doc.filename}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-muted-foreground">
                                                {new Date(doc.created_at).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell className="px-6 py-4">
                                                <Badge variant="default" className="bg-emerald-100 text-emerald-800 hover:bg-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 capitalize">
                                                    Indexed
                                                </Badge>
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-center font-mono text-muted-foreground">
                                                {doc.chunk_count}
                                            </TableCell>
                                            <TableCell className="px-6 py-4 text-right">
                                                <Button 
                                                    variant="ghost" 
                                                    size="icon" 
                                                    onClick={() => handleDelete(doc._id)} 
                                                    className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </Card>
                </section>
            </main>
            
            {isUploading && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                   <Card className="p-8 rounded-2xl shadow-2xl flex flex-col items-center border border-border/50 max-w-sm w-full mx-4 bg-card">
                       <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
                       <h3 className="font-bold text-lg mb-2">Processing Document</h3>
                       <p className="text-sm text-muted-foreground text-center leading-relaxed">
                           Please wait while AWS Bedrock reads, splits, and embeds your document into the ChromaDB vector store.
                       </p>
                   </Card>
               </div> 
            )}
        </div>
    );
}
