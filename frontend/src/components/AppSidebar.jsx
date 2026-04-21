import * as React from "react"
import {
    LayoutDashboard,
    MessageSquare,
    Settings,
    LogOut,
    Users,
    ChevronUp,
    User2,
    Calendar,
    MessageCircle
} from "lucide-react"


import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupContent,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarRail,
    SidebarSeparator,
} from "@/components/ui/sidebar"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Logo } from "@/components/Logo"
import { useNavigate } from "react-router-dom"
import { logout } from "@/services/authService"



export function AppSidebar({ onNewChat, activeChatId, onSelectChat, chatHistory = [] }) {
    const navigate = useNavigate();
    const [user, setUser] = React.useState({ full_name: "User Account", email: "" });

    React.useEffect(() => {
        const fetchUser = async () => {
            try {
                const data = await import("@/services/userService").then(m => m.getMe());
                setUser(data);
            } catch (error) {
                console.error("Failed to fetch user in sidebar", error);
            }
        };
        fetchUser();
    }, []);

    const handleLogout = () => {
        logout();
        navigate("/login");
    };

    const handleNewChatClick = () => {
        navigate("/dashboard");
        if (onNewChat) {
            onNewChat();
        }
    };

    return (
        <Sidebar collapsible="icon" className="border-r border-border/50 bg-sidebar-background shadow-sm">
            <SidebarHeader className="px-4 py-6">
                <div
                    onClick={handleNewChatClick}
                    className="flex items-center justify-between mb-2 group-data-[collapsible=icon]:justify-center cursor-pointer transition-all duration-300 hover:translate-x-1"
                >
                    <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            <Logo className="h-6 w-auto" />
                        </div>
                        <span className="text-2xl font-black tracking-tight bg-gradient-to-br from-foreground to-foreground/70 bg-clip-text text-transparent">Veridoc</span>
                    </div>
                    <div className="group-data-[collapsible=icon]:flex hidden p-2 rounded-xl bg-primary/10 text-primary">
                        <Logo className="h-6 w-auto" />
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent className="px-2">
                <SidebarGroup>
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground/50 mb-3 px-4">
                        Recent Chats
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {chatHistory.map((chat) => (
                                <SidebarMenuItem key={chat.id}>
                                    <SidebarMenuButton
                                        isActive={activeChatId === chat.id}
                                        onClick={() => onSelectChat(chat.id)}
                                        tooltip={chat.title}
                                        className={cn(
                                            "h-10 px-4 rounded-xl transition-all duration-200 group-data-[collapsible=icon]:justify-center",
                                            activeChatId === chat.id 
                                                ? "bg-primary/15 text-primary font-semibold shadow-sm" 
                                                : "hover:bg-muted/50 text-muted-foreground hover:text-foreground"
                                        )}
                                    >
                                        <MessageCircle className={cn("h-4 w-4 shrink-0", activeChatId === chat.id ? "text-primary" : "opacity-70")} />
                                        <span className="truncate group-data-[collapsible=icon]:hidden">{chat.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <div className="px-4 my-4">
                    <SidebarSeparator className="opacity-50" />
                </div>

                <SidebarGroup>
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden uppercase text-[10px] font-black tracking-[0.2em] text-muted-foreground/50 mb-3 px-4">
                        Library
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            {[
                                { icon: Users, label: "Community Q&A", tooltip: "Community" },
                                { icon: LayoutDashboard, label: "Analysis Trends", tooltip: "Dashboard" }
                            ].map((item, idx) => (
                                <SidebarMenuItem key={idx}>
                                    <SidebarMenuButton 
                                        tooltip={item.tooltip}
                                        className="h-10 px-4 rounded-xl hover:bg-muted/50 text-muted-foreground hover:text-foreground transition-all group-data-[collapsible=icon]:justify-center"
                                    >
                                        <item.icon className="h-4 w-4 opacity-70" />
                                        <span className="group-data-[collapsible=icon]:hidden">{item.label}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="p-4">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-muted h-14 rounded-2xl border border-border/40 hover:border-primary/30 transition-all shadow-sm bg-card/50"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10 text-primary border border-primary/20 shadow-inner overflow-hidden shrink-0">
                                        {user.picture_url ? (
                                            <img src={user.picture_url} alt={user.full_name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User2 className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start text-xs group-data-[collapsible=icon]:hidden ml-3 overflow-hidden">
                                        <span className="font-bold text-foreground truncate w-full">{user.full_name || "User Account"}</span>
                                        <span className="text-[10px] text-muted-foreground/70 truncate w-full">{user.email}</span>
                                    </div>
                                    <ChevronUp className="ml-auto h-4 w-4 text-muted-foreground/50 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                align="end"
                                className="w-56 rounded-2xl shadow-2xl border-border/50 p-1 backdrop-blur-xl bg-background/95"
                            >
                                <DropdownMenuItem className="rounded-xl h-10 cursor-pointer" onClick={() => navigate("/profile")}>
                                    <User2 className="mr-3 h-4 w-4 opacity-70" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-xl h-10 cursor-pointer" onClick={() => navigate("/settings")}>
                                    <Settings className="mr-3 h-4 w-4 opacity-70" />
                                    Settings
                                </DropdownMenuItem>
                                <div className="my-1 border-t border-border/50" />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-xl h-10 cursor-pointer">
                                    <LogOut className="mr-3 h-4 w-4" />
                                    Log out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
            <SidebarRail />
        </Sidebar >
    )
}
