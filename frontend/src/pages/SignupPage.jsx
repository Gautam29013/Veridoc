import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { googleLogin as googleLoginService, signup } from "@/services/authService";
import { Loader2, Eye, EyeOff, ArrowLeft } from "lucide-react";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";
import { useTheme } from "@/context/ThemeContext";
import { useGoogleLogin } from "@react-oauth/google";

export default function SignupPage() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
        full_name: "",
    });
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { theme } = useTheme();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await signup(formData);
            if (data.user?.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Failed to create account. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            setError("");
            setLoading(true);
            try {
                const data = await googleLoginService(tokenResponse.access_token);
                if (data.user?.role === "admin") {
                    navigate("/admin");
                } else {
                    navigate("/dashboard");
                }
            } catch (err) {
                setError(err.response?.data?.detail || "Google authentication failed.");
            } finally {
                setLoading(false);
            }
        },
        onError: () => {
            setError("Google login was cancelled or failed.");
        },
    });

    return (
        <div className="flex items-center justify-center min-h-screen bg-background p-4 relative overflow-hidden">
            {/* Background Orbs */}
            <div className="absolute top-[-10%] left-[-10%] w-[45%] h-[45%] bg-primary/10 blur-[130px] rounded-full -z-10" />
            <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] bg-accent/10 blur-[130px] rounded-full -z-10" />

            <div className="absolute top-6 left-6 z-50">
                <Link to="/">
                    <Button variant="ghost" className="flex items-center gap-2 font-medium text-sm text-muted-foreground hover:text-primary transition-all">
                        <ArrowLeft className="h-4 w-4" />
                        Back
                    </Button>
                </Link>
            </div>

            <div className="absolute top-4 right-4 flex items-center gap-2 z-50">
                <ThemeToggle />
            </div>

            <Card className="w-full max-w-md shadow-2xl border-border/50 bg-card/50 backdrop-blur-xl rounded-[2rem] overflow-hidden relative z-10">
                <CardHeader className="space-y-2 pt-12">
                    <div className="flex justify-center mb-6">
                        <Link to="/" className="flex items-center gap-3 transition-transform hover:scale-105">
                            <div className="p-2.5 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-sm">
                                <Logo className="h-8 w-auto" />
                            </div>
                            <span className="text-3xl font-black tracking-tighter bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Veridoc</span>
                        </Link>
                    </div>
                    <CardTitle className="text-3xl font-black tracking-tight text-center">Join Veridoc</CardTitle>
                    <CardDescription className="text-center font-medium text-muted-foreground/70 text-base">
                        Start your journey with intelligent analysis
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-5 pt-4">
                        {error && (
                            <div className="p-4 text-sm font-bold text-destructive bg-destructive/10 border border-destructive/20 rounded-2xl animate-in shake duration-500">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="full_name" className="font-bold text-xs uppercase tracking-widest text-muted-foreground/80 ml-1">Full Name</Label>
                            <Input
                                id="full_name"
                                placeholder="John Doe"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="h-12 bg-background/50 border-border/50 rounded-xl focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-bold text-xs uppercase tracking-widest text-muted-foreground/80 ml-1">Email Address</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@company.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="h-12 bg-background/50 border-border/50 rounded-xl focus:ring-primary/20 focus:border-primary/50 transition-all font-medium"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password" className="font-bold text-xs uppercase tracking-widest text-muted-foreground/80 ml-1">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="h-12 bg-background/50 border-border/50 rounded-xl focus:ring-primary/20 focus:border-primary/50 transition-all font-medium pr-12"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-primary transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-5 w-5" />
                                    ) : (
                                        <Eye className="h-5 w-5" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-6 pt-8 pb-12">
                        <Button 
                            className="w-full h-14 text-xl" 
                            type="submit" 
                            disabled={loading}
                        >
                            {loading && <Loader2 className="mr-3 h-5 w-5 animate-spin" />}
                            Create Account
                        </Button>

                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border/50"></span>
                            </div>
                            <div className="relative flex justify-center text-[10px] font-black uppercase tracking-[0.2em]">
                                <span className="bg-transparent backdrop-blur-md px-4 text-muted-foreground/50">Rapid Deployment</span>
                            </div>
                        </div>

                        <div className="flex justify-center w-full">
                            <Button 
                                type="button"
                                onClick={handleGoogleLogin}
                                variant="outline" 
                                className="w-full h-14 rounded-2xl border-border/50 bg-background/50 hover:bg-background transition-all flex items-center justify-center gap-3 group relative overflow-hidden"
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                                <img 
                                    src="https://www.gstatic.com/images/branding/product/1x/gsa_512dp.png" 
                                    alt="Google" 
                                    className="w-5 h-5 relative z-10"
                                />
                                <span className="font-medium text-base relative z-10">Continue with Google</span>
                            </Button>
                        </div>

                        <div className="text-center text-sm font-medium text-muted-foreground">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary hover:text-primary/80 transition-colors font-bold underline underline-offset-4 decoration-primary/30">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
