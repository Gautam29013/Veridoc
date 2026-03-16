import React from "react";
import { Link } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { ThemeToggle } from "../components/ThemeToggle";
import { Logo } from "../components/Logo";
import { CheckCircle, Zap, Lock, Globe, FileText } from "lucide-react";

const LandingPage = () => {
    return (
        <div className="flex flex-col min-h-screen">
            {/* Navbar */}
            <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
                <div className="container flex h-16 items-center justify-between mx-auto px-4">
                    <div className="flex items-center gap-2">
                        <Logo className="h-8 w-auto text-primary" />
                        <span className="text-xl font-bold tracking-tight">Veridoc</span>
                    </div>
                    <div className="flex items-center gap-4">
                        <Link to="/login">
                            <Button variant="ghost" className="font-medium">Sign In</Button>
                        </Link>
                        <Link to="/signup">
                            <Button className="font-medium">Get Started</Button>
                        </Link>
                        <ThemeToggle />
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="relative overflow-hidden pt-20 pb-20 md:pt-32 md:pb-32">
                <div className="absolute inset-0 -z-10 bg-[radial-gradient(45%_45%_at_50%_50%,rgba(var(--primary-rgb),0.1),transparent)]"></div>
                <div className="container mx-auto px-4 text-center">
                    <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-foreground via-foreground/80 to-foreground/60 bg-clip-text text-transparent">
                        Secure Document Verification <br className="hidden md:block" /> Powered by Intelligence
                    </h1>
                    <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-10">
                        Veridoc provides state-of-the-art AI-driven tools to verify, manage, and secure your most important documents with confidence.
                    </p>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                        <Link to="/signup">
                            <Button size="lg" className="px-8 h-12 text-lg font-semibold rounded-full shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all">
                                Start for Free
                            </Button>
                        </Link>
                        <Button size="lg" variant="outline" className="px-8 h-12 text-lg font-semibold rounded-full">
                            Live Demo
                        </Button>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-muted/50">
                <div className="container mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-4">Why Choose Veridoc?</h2>
                        <p className="text-muted-foreground">Built for speed, security, and enterprise-grade reliability.</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Zap className="h-8 w-8 text-yellow-500" />}
                            title="Lightning Fast"
                            description="Verify documents in seconds with our optimized processing engines."
                        />
                        <FeatureCard
                            icon={<Lock className="h-8 w-8 text-blue-500" />}
                            title="Military Grade Security"
                            description="Your data is encrypted end-to-end using industry-leading protocols."
                        />
                        <FeatureCard
                            icon={<FileText className="h-8 w-8 text-green-500" />}
                            title="Smart Analysis"
                            description="AI-powered metadata extraction and anomaly detection for every file."
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
