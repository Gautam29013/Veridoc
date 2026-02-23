import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { logout } from "@/services/authService";

export default function DashboardPage() {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    return (
        <div className="p-8">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle>Welcome to Veridoc</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">You have successfully logged in.</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
