import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Conversation } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Bot, 
  Plus, 
  CheckSquare, 
  Bell, 
  Settings, 
  Moon, 
  Sun,
  User,
  Menu,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface SidebarProps {
  onNewConversation: () => void;
  currentConversationId?: string;
  onSelectConversation: (conversationId: string) => void;
  isMobileOpen?: boolean;
  onMobileToggle?: () => void;
}

export function Sidebar({
  onNewConversation,
  currentConversationId,
  onSelectConversation,
  isMobileOpen = false,
  onMobileToggle,
}: SidebarProps) {
  const { user, logoutMutation } = useAuth();
  const [location] = useLocation();
  const [isDarkMode, setIsDarkMode] = useState(false);

  const { data: conversations = [] } = useQuery<Conversation[]>({
    queryKey: ["/api/conversations"],
  });

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle("dark", !isDarkMode);
  };

  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <>
      {/* Mobile overlay */}
      {isMobileOpen && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={onMobileToggle}
        />
      )}
      
      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border flex flex-col transition-transform lg:static lg:translate-x-0 lg:block text-xs p-1",
          isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
        )}
        data-testid="sidebar"
      >
        {/* Header */}
  <div className="p-2 border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Bot className="text-primary-foreground w-4 h-4" />
              </div>
              <h1 className="text-lg font-semibold text-foreground">VoiceAI</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm"
                onClick={toggleDarkMode}
                data-testid="button-toggle-theme"
              >
                {isDarkMode ? (
                  <Sun className="w-4 h-4" />
                ) : (
                  <Moon className="w-4 h-4" />
                )}
              </Button>
              {onMobileToggle && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={onMobileToggle}
                  className="lg:hidden"
                  data-testid="button-close-sidebar"
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* User Profile */}
  <div className="p-2 border-b border-border">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <User className="text-primary-foreground w-5 h-5" />
            </div>
            <div>
              <p className="font-medium text-foreground" data-testid="user-name">
                {user?.name || user?.username || "User"}
              </p>
              <p className="text-sm text-muted-foreground">Premium Plan</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
  <div className="p-2 space-y-1">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">QUICK ACTIONS</h3>
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={onNewConversation}
            data-testid="button-new-conversation"
          >
            <Plus className="mr-2 w-4 h-4" />
            New Conversation
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            data-testid="button-view-tasks"
          >
            <CheckSquare className="mr-2 w-4 h-4" />
            View Tasks
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            data-testid="button-view-reminders"
          >
            <Bell className="mr-2 w-4 h-4" />
            Reminders
          </Button>
          <Button 
            variant="ghost" 
            className="w-full justify-start"
            data-testid="button-settings"
          >
            <Settings className="mr-2 w-4 h-4" />
            Settings
          </Button>
        </div>

        {/* Conversation History */}
  <div className="flex-1 p-2 overflow-y-auto">
          <h3 className="text-sm font-medium text-muted-foreground mb-3">
            RECENT CONVERSATIONS
          </h3>
          <ScrollArea className="h-full">
            <div className="space-y-2">
              {conversations.map((conversation) => (
                <Button
                  key={conversation.id}
                  variant={currentConversationId === conversation.id ? "secondary" : "ghost"}
                  className="w-full justify-start text-left h-auto p-3"
                  onClick={() => onSelectConversation(conversation.id)}
                  data-testid={`conversation-${conversation.id}`}
                >
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-foreground truncate">
                      {conversation.title}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(conversation.updatedAt || conversation.createdAt!).toLocaleDateString()}
                    </p>
                  </div>
                </Button>
              ))}
              {conversations.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No conversations yet
                </p>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Logout */}
        <div className="p-6 border-t border-border">
          <Button 
            variant="outline" 
            className="w-full"
            onClick={handleLogout}
            disabled={logoutMutation.isPending}
            data-testid="button-logout"
          >
            {logoutMutation.isPending ? "Signing out..." : "Sign Out"}
          </Button>
        </div>
      </div>
    </>
  );
}
