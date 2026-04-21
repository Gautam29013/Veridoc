import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ThemeToggle } from "../components/ThemeToggle";
import { Logo } from "../components/Logo";
import { CheckCircle, Zap, Lock, Globe, FileText, Sparkles } from "lucide-react";

const LandingPage = () => {
    return (
        <div className="flex flex-col min-h-screen bg-background">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-xl">
                <div className="container flex h-20 items-center justify-between mx-auto px-6">
                    <div className="flex items-center gap-3 transition-transform hover:scale-105 cursor-pointer">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                            <Logo className="h-7 w-auto" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Veridoc</span>
                    </div>
                    <div className="flex items-center gap-6">

                        <div className="flex items-center gap-4">
                            <Link to="/login">
                                <Button variant="ghost" className="font-bold text-sm uppercase tracking-widest hover:bg-primary/5 hover:text-primary">Sign In</Button>
                            </Link>
                            <Link to="/signup">
                                <Button className="font-black px-6 h-11 rounded-xl shadow-lg shadow-primary/20 hover:scale-105 transition-all">Get Started</Button>
                            </Link>
                            <ThemeToggle />
                        </div>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-24 pb-24 md:pt-40 md:pb-40">
                {/* Background Orbs */}
                <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/15 blur-[150px] rounded-full -z-10 animate-pulse" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-accent/10 blur-[150px] rounded-full -z-10" />

                <div className="container mx-auto px-6 text-center relative">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/5 border border-primary/10 text-primary text-[10px] font-black uppercase tracking-[0.2em] mb-8 animate-in fade-in slide-in-from-bottom-4 duration-1000">
                        <Sparkles className="h-3 w-3" />
                        Next-Gen RAG Engine
                    </div>
                    <h1 className="text-5xl md:text-8xl font-black tracking-tight mb-8 bg-gradient-to-br from-foreground via-foreground to-foreground/60 bg-clip-text text-transparent pb-2 lg:leading-[1.1] animate-in fade-in slide-in-from-bottom-8 duration-1000">
                        Intelligent AI <br className="hidden md:block" /> with <span className="italic text-primary">Zero Hallucinations</span>
                    </h1>
                    <p className="text-xl md:text-2xl text-muted-foreground/70 max-w-3xl mx-auto mb-14 leading-relaxed font-medium animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-200">
                        Get instant, accurate answers sourced strictly from your verified internal documents. Enterprise-grade knowledge retrieval at your fingertips.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-in fade-in slide-in-from-bottom-16 duration-1000 delay-300">
                        <Link to="/signup">
                            <Button size="lg" className="px-10 h-16 text-lg font-black rounded-2xl shadow-2xl shadow-primary/30 hover:scale-105 active:scale-95 transition-all group">
                                Start Your Journey
                                <Zap className="ml-3 h-5 w-5 group-hover:text-accent transition-colors" />
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="px-10 h-16 text-lg font-bold rounded-2xl border-border/50 bg-card/30 backdrop-blur hover:bg-card hover:border-primary/30 transition-all">
                            Live Demo
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="py-32 bg-muted/30 relative">
                <div className="container mx-auto px-6">
                    <div className="text-center mb-24 max-w-2xl mx-auto">
                        <h2 className="text-4xl md:text-5xl font-black mb-6 tracking-tight">Built for Reliability</h2>
                        <p className="text-muted-foreground/70 text-lg font-medium leading-relaxed">Veridoc combines state-of-the-art vector search with military-grade security to power your intelligence workflow.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                        <FeatureCard
                            icon={<div className="p-4 rounded-2xl bg-yellow-500/10 text-yellow-500 border border-yellow-500/20 shadow-inner"><Zap className="h-8 w-8" /></div>}
                            title="Lightning Fast RAG"
                            description="Query millions of pages and get sub-second responses with zero latency bottlenecks."
                        />
                        <FeatureCard
                            icon={<div className="p-4 rounded-2xl bg-blue-500/10 text-blue-500 border border-blue-500/20 shadow-inner"><Lock className="h-8 w-8" /></div>}
                            title="Encrypted Isolation"
                            description="Your documents are isolated and encrypted at rest with enterprise-grade keys."
                        />
                        <FeatureCard
                            icon={<div className="p-4 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-inner"><FileText className="h-8 w-8" /></div>}
                            title="Semantic Intelligence"
                            description="Deep contextual understanding of your data structure and internal relationships."
                        />
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 md:py-32">
                <div className="container mx-auto px-4">
                    <Card className="bg-primary text-primary-foreground overflow-hidden">
                        <CardHeader className="text-center pt-12 pb-8">
                            <CardTitle className="text-3xl md:text-4xl font-bold mb-4">Ready to secure your documents?</CardTitle>
                            <CardDescription className="text-primary-foreground/80 text-lg">
                                Join thousands of users who trust Veridoc for their document needs.
                            </CardDescription>
                        </CardHeader>
                    </Card>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t mt-auto">
                <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <Logo className="h-6 w-auto text-primary" />
                        <span className="text-lg font-bold">Veridoc</span>
                        <span className="text-sm text-muted-foreground ml-2">© 2024 Veridoc Inc.</span>
                    </div>
                    <div className="flex gap-8 text-sm text-muted-foreground">
                        <a href="#" className="hover:text-foreground transition-colors">Privacy</a>
                        <a href="#" className="hover:text-foreground transition-colors">Terms</a>
                        <a href="#" className="hover:text-foreground transition-colors">Contact</a>
                    </div>
                </div>
            </footer>
        </div>
    );
};

const FeatureCard = ({ icon, title, description }) => (
    <Card className="border-none shadow-md hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
        <CardHeader>
            <div className="mb-4">{icon}</div>
            <CardTitle className="text-xl font-bold">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            <p className="text-muted-foreground leading-relaxed">{description}</p>
        </CardContent>
    </Card>
);

export default LandingPage;
