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

// Mock Chat History
const chatHistory = [
    { id: 1, title: "Analyzing medical reports...", date: "Today" },
    { id: 2, title: "Diabetes symptoms check", date: "Yesterday" },
    { id: 3, title: "Diet plan for hypertension", date: "2 days ago" },
    { id: 4, title: "Vaccination schedule 2024", date: "Last week" },
]

export function AppSidebar({ onNewChat, activeChatId, onSelectChat }) {
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
        <Sidebar collapsible="icon" className="border-r border-sidebar-border/40 bg-background">
            <SidebarHeader className="px-4 py-4">
                <div
                    onClick={handleNewChatClick}
                    className="flex items-center justify-between mb-4 group-data-[collapsible=icon]:justify-center cursor-pointer hover:opacity-80 transition-opacity"
                >
                    <div className="flex items-center gap-3 group-data-[collapsible=icon]:hidden">
                        <Logo className="h-6 w-auto text-primary" />
                        <span className="text-xl font-bold tracking-tight">Veridoc</span>
                    </div>
                    <div className="group-data-[collapsible=icon]:flex hidden">
                        <Logo className="h-6 w-auto text-primary" />
                    </div>
                </div>
            </SidebarHeader>

            <SidebarContent>
                <SidebarGroup>
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden uppercase text-[10px] font-bold tracking-wider text-muted-foreground/70 mb-2">
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
                                        className="hover:bg-sidebar-accent/50 group-data-[collapsible=icon]:justify-center"
                                    >
                                        <MessageCircle className="h-4 w-4 shrink-0" />
                                        <span className="truncate group-data-[collapsible=icon]:hidden">{chat.title}</span>
                                    </SidebarMenuButton>
                                </SidebarMenuItem>
                            ))}
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>

                <SidebarSeparator className="mx-4 opacity-50" />

                <SidebarGroup>
                    <SidebarGroupLabel className="group-data-[collapsible=icon]:hidden uppercase text-[10px] font-bold tracking-wider text-muted-foreground/70 mb-2">
                        Library
                    </SidebarGroupLabel>
                    <SidebarGroupContent>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Community">
                                    <Users className="h-4 w-4" />
                                    <span>Community Q&A</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                            <SidebarMenuItem>
                                <SidebarMenuButton tooltip="Dashboard">
                                    <LayoutDashboard className="h-4 w-4" />
                                    <span>Analysis Trends</span>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarGroupContent>
                </SidebarGroup>
            </SidebarContent>

            <SidebarFooter className="border-t border-sidebar-border/40 p-2">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <SidebarMenuButton
                                    size="lg"
                                    className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground border border-sidebar-border/20 rounded-xl"
                                >
                                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sidebar-accent/50 text-foreground border border-sidebar-border/50 shadow-sm transition-all group-hover:scale-110 overflow-hidden">
                                        {user.picture_url ? (
                                            <img src={user.picture_url} alt={user.full_name} className="h-full w-full object-cover" />
                                        ) : (
                                            <User2 className="h-5 w-5" />
                                        )}
                                    </div>
                                    <div className="flex flex-col items-start text-xs group-data-[collapsible=icon]:hidden ml-3 overflow-hidden">
                                        <span className="font-bold truncate w-full">{user.full_name || "User Account"}</span>
                                        <span className="text-[10px] text-muted-foreground truncate w-full">{user.email}</span>
                                    </div>
                                    <ChevronUp className="ml-auto h-4 w-4 group-data-[collapsible=icon]:hidden" />
                                </SidebarMenuButton>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                side="top"
                                className="w-[--radix-popper-anchor-width] min-w-56 rounded-xl shadow-xl border-sidebar-border/40"
                            >
                                <DropdownMenuItem className="rounded-lg" onClick={() => navigate("/profile")}>
                                    <User2 className="mr-2 h-4 w-4" />
                                    Profile
                                </DropdownMenuItem>
                                <DropdownMenuItem className="rounded-lg" onClick={() => navigate("/settings")}>
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </DropdownMenuItem>
                                <SidebarSeparator className="my-1" />
                                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:bg-destructive/10 focus:text-destructive rounded-lg">
                                    <LogOut className="mr-2 h-4 w-4" />
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
