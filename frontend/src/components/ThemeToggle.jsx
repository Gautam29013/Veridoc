import React from "react";
import { Moon, Sun } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { useTheme } from "../context/ThemeContext";

export function ThemeToggle() {
    const { theme, toggleTheme } = useTheme();

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-xl w-10 h-10 transition-all duration-500 hover:bg-primary/10 group"
        >
            <div className="relative w-5 h-5">
                <Sun className={cn(
                    "h-5 w-5 absolute inset-0 transition-all duration-500",
                    theme === "light" ? "rotate-90 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100 text-primary"
                )} />
                <Moon className={cn(
                    "h-5 w-5 absolute inset-0 transition-all duration-500",
                    theme === "light" ? "rotate-0 scale-100 opacity-100 text-primary" : "-rotate-90 scale-0 opacity-0"
                )} />
            </div>
            <span className="sr-only">Toggle theme</span>
        </Button>
    );
}
