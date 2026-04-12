import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { signup, googleLogin } from "@/services/authService";
import { Loader2, Eye, EyeOff } from "lucide-react";
import { GoogleLogin } from "@react-oauth/google";
import { ThemeToggle } from "@/components/ThemeToggle";
import { Logo } from "@/components/Logo";

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

    const handleGoogleSuccess = async (credentialResponse) => {
        setLoading(true);
        setError("");
        try {
            const data = await googleLogin(credentialResponse.credential);
            if (data.user?.role === "admin") {
                navigate("/admin");
            } else {
                navigate("/dashboard");
            }
        } catch (err) {
            setError(err.response?.data?.detail || "Google login failed.");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleError = () => {
        setError("Google login failed. Please try again.");
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50 dark:bg-slate-950 p-4 transition-colors duration-300">
            <div className="absolute top-4 right-4 flex items-center gap-2">
                <ThemeToggle />
            </div>

            <Card className="w-full max-w-md shadow-lg border-slate-200 dark:border-slate-800">
                <CardHeader className="space-y-1">
                    <div className="flex justify-center mb-4">
                        <Link to="/" className="flex items-center gap-2">
                            <Logo className="h-10 w-auto text-primary" />
                            <span className="text-2xl font-bold tracking-tight">Veridoc</span>
                        </Link>
                    </div>
                    <CardTitle className="text-2xl font-bold tracking-tight text-center">Create an account</CardTitle>
                    <CardDescription className="text-center">
                        Enter your details below to create your account
                    </CardDescription>
                </CardHeader>
                <form onSubmit={handleSubmit}>
                    <CardContent className="space-y-4 pt-4">
                        {error && (
                            <div className="p-3 text-sm font-medium text-destructive bg-destructive/10 rounded-md">
                                {error}
                            </div>
                        )}
                        <div className="space-y-2">
                            <Label htmlFor="full_name">Full Name</Label>
                            <Input
                                id="full_name"
                                placeholder="John Doe"
                                value={formData.full_name}
                                onChange={handleChange}
                                className="bg-white dark:bg-slate-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="m@example.com"
                                value={formData.email}
                                onChange={handleChange}
                                required
                                className="bg-white dark:bg-slate-900"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                    className="bg-white dark:bg-slate-900 pr-10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {showPassword ? (
                                        <EyeOff className="h-4 w-4" />
                                    ) : (
                                        <Eye className="h-4 w-4" />
                                    )}
                                </button>
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex flex-col space-y-4 pt-6">
                        <Button className="w-full h-11 font-semibold" type="submit" disabled={loading}>
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create account
                        </Button>

                        <div className="relative w-full">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-slate-200 dark:border-slate-800"></span>
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-white dark:bg-slate-950 px-2 text-muted-foreground">Or continue with</span>
                            </div>
                        </div>

                        <div className="flex justify-center w-full">
                            <GoogleLogin
                                onSuccess={handleGoogleSuccess}
                                onError={handleGoogleError}
                                useOneTap
                                theme="outline"
                                shape="pill"
                                width="100%"
                            />
                        </div>

                        <div className="text-center text-sm text-muted-foreground">
                            Already have an account?{" "}
                            <Link to="/login" className="text-primary hover:underline font-medium">
                                Sign in
                            </Link>
                        </div>
                    </CardFooter>
                </form>
            </Card>
        </div>
    );
}
