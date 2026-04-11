import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "@/services/api";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Trash2, ShieldAlert, Loader2, Search } from "lucide-react";
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
                if (!response.data.is_admin) {
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
            // Overriding the default application/json header for multipart/form-data
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
            // reset the file input
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

    if (isLoading) {
        return (
            <div className="flex h-screen items-center justify-center bg-background">
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
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
                <Button variant="outline" onClick={() => navigate("/dashboard")}>
                    Back to Dashboard
                </Button>
            </header>

            <main className="flex-1 w-full max-w-6xl mx-auto p-6 md:p-12 space-y-12">
                
                {/* Upload Section */}
                <section className="bg-card border border-border shadow-sm rounded-2xl p-8 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                        <div className="flex-1 space-y-2 text-center md:text-left">
                            <h2 className="text-2xl font-bold">Knowledge Base Upload</h2>
                            <p className="text-muted-foreground text-sm max-w-xl">
                                Automatically slice and embed organization documents. Uploading a PDF here instantly writes it to the Vector Database, meaning the AI will immediately start answering based on this new policy.
                            </p>
                        </div>

                        <div className="shrink-0 relative">
                            {isUploading && (
                                <div className="absolute inset-0 z-20 bg-background/80 backdrop-blur-sm rounded-xl flex flex-col items-center justify-center p-4">
                                    <Loader2 className="w-6 h-6 animate-spin text-primary mb-2" />
                                    <span className="text-xs font-semibold animate-pulse text-primary">Embedding with Bedrock...</span>
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
                </section>

                {/* Documents Table */}
                <section className="space-y-4">
                    <div className="flex items-center gap-2">
                        <FileText className="w-5 h-5 text-muted-foreground" />
                        <h3 className="text-lg font-semibold">Indexed Documents Snapshot</h3>
                    </div>

                    <div className="border border-border rounded-xl overflow-hidden bg-card">
                        {documents.length === 0 ? (
                            <div className="p-12 text-center flex flex-col items-center justify-center text-muted-foreground">
                                <Search className="w-10 h-10 mb-3 opacity-20" />
                                <p className="font-medium">No documents dynamically indexed yet.</p>
                                <p className="text-sm opacity-70">Upload your first PDF via the panel above.</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm text-left">
                                    <thead className="text-xs font-medium bg-muted/50 uppercase tracking-widest text-muted-foreground">
                                        <tr>
                                            <th className="px-6 py-4">Filename</th>
                                            <th className="px-6 py-4">Upload Date</th>
                                            <th className="px-6 py-4">Status</th>
                                            <th className="px-6 py-4 text-center">AI Chunks</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-border">
                                        {documents.map((doc) => (
                                            <tr key={doc._id} className="hover:bg-muted/30 transition-colors">
                                                <td className="px-6 py-4 font-medium text-foreground max-w-xs truncate" title={doc.filename}>{doc.filename}</td>
                                                <td className="px-6 py-4 text-muted-foreground">
                                                    {new Date(doc.created_at).toLocaleDateString()}
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400">
                                                        Indexed
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-center font-mono text-muted-foreground">
                                                    {doc.chunk_count}
                                                </td>
                                                <td className="px-6 py-4 text-right">
                                                    <Button variant="ghost" size="icon" onClick={() => handleDelete(doc._id)} className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10">
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                </section>
            </main>
            
            {isUploading && (
               <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/60 backdrop-blur-sm">
                   <div className="bg-card p-8 rounded-2xl shadow-2xl flex flex-col items-center border border-border/50 max-w-sm w-full mx-4">
                       <Loader2 className="w-12 h-12 animate-spin text-primary mb-6" />
                       <h3 className="font-bold text-lg mb-2">Processing Document</h3>
                       <p className="text-sm text-muted-foreground text-center">
                           Please wait while AWS Bedrock reads, splits, and embeds your document into the ChromaDB vector store.
                       </p>
                   </div>
               </div> 
            )}
        </div>
    );
}
