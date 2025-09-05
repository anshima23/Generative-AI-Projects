import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { useSpeechRecognition } from "@/hooks/use-speech";
import { Sidebar } from "@/components/sidebar";
import { Dashboard } from "@/components/dashboard";
import { ChatMessage } from "@/components/chat-message";
import { VoiceModal } from "@/components/voice-modal";
import { NotificationToast } from "@/components/notification-toast";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Mic, Send, Menu, Activity, CloudSun, Newspaper, Bell, Calendar } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

export default function HomePage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const isMobile = useIsMobile();

  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const [messageInput, setMessageInput] = useState("");
  const [showVoiceModal, setShowVoiceModal] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  // speech recognition hook
  const { isListening, transcript, startListening, stopListening, speechSupported } =
    useSpeechRecognition();

  // Quick Actions
  const quickActions = [
    { icon: CloudSun, title: "Weather", description: "Check today's forecast", message: "What's the weather today?" },
    { icon: Newspaper, title: "News", description: "Latest headlines", message: "Show me today's tech news" },
    { icon: Bell, title: "Reminder", description: "Schedule a task", message: "Set a reminder" },
    { icon: Calendar, title: "Calendar", description: "Manage events", message: "Add meeting to calendar" },
  ];

  const handleNewConversation = () => {
    console.log("New conversation created");
  };

  const handleSelectConversation = (conversationId: string) => {
    setCurrentConversationId(conversationId);
    if (isMobile) setIsSidebarOpen(false);
  };

  const handleSendMessage = () => {
    if (!messageInput.trim() || !currentConversationId) return;
    console.log("Send:", messageInput);
    setMessageInput("");
  };

  const handleVoiceInput = () => {
    if (!speechSupported) {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
      return;
    }
    if (isListening) {
      stopListening();
    } else {
      setShowVoiceModal(true);
      startListening();
    }
  };

  useEffect(() => {
    if (transcript && !isListening) {
      setMessageInput(transcript);
      setShowVoiceModal(false);
    }
  }, [transcript, isListening]);

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <Sidebar
        onNewConversation={handleNewConversation}
        currentConversationId={currentConversationId || undefined}
        onSelectConversation={handleSelectConversation}
        isMobileOpen={isSidebarOpen}
        onMobileToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      {/* Chat Section (center) */}
      <div className="flex flex-col flex-1 mx-8 xl:mx-16 justify-center items-center relative">
        {/* Top Bar */}
        <div className="bg-card border-b border-border p-4 flex items-center justify-between w-full">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              className="lg:hidden"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-accent rounded-full animate-pulse"></div>
              <span className="text-sm font-medium text-foreground">Assistant Active</span>
            </div>
          </div>
          <div className="flex items-center space-x-2 px-3 py-2 bg-muted rounded-lg">
            <Activity className="w-3 h-3 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              {isListening ? "Listening..." : "Ready"}
            </span>
          </div>
        </div>

        {/* Chat container */}
        <div className="h-full flex flex-col justify-between w-full">
          <div className="flex flex-col items-center justify-center my-auto w-full">
            <div
              ref={messagesContainerRef}
              className="overflow-y-auto p-4 space-y-4 scrollbar-visible h-[400px] max-h-[60vh] border rounded-lg bg-white text-base w-full"
            >
              {/* Placeholder messages */}
              <div className="text-muted-foreground text-center">Start a conversation...</div>
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-6 w-full">
              <div className="flex items-end space-x-3">
                <div className="flex-1 relative">
                  <Textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message or click the mic..."
                    className="w-full resize-none pr-12"
                    rows={1}
                  />
                  <Button
                    size="sm"
                    className="absolute right-3 top-3"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                  >
                    <Send className="w-3 h-3" />
                  </Button>
                </div>
                <Button
                  size="lg"
                  className={`w-12 h-12 rounded-full ${isListening ? "bg-red-500 hover:bg-red-600" : ""}`}
                  onClick={handleVoiceInput}
                  disabled={!speechSupported}
                >
                  <Mic className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Dashboard - Desktop only */}
        <div className="hidden xl:block absolute right-0 top-0 h-full">
          <Dashboard />
        </div>

        {/* Voice Modal */}
        <VoiceModal
          isOpen={showVoiceModal}
          onClose={() => {
            setShowVoiceModal(false);
            stopListening();
          }}
          isListening={isListening}
          transcript={transcript}
          onToggleListening={handleVoiceInput}
        />

        {/* Notification Toast */}
        {notification && (
          <NotificationToast
            title={notification.title}
            message={notification.message}
            isVisible={!!notification}
            onDismiss={() => setNotification(null)}
            onMarkDone={() => {
              toast({ title: "Task Completed", description: "Great job! Task marked as done." });
              setNotification(null);
            }}
            onSnooze={() => {
              toast({ title: "Reminder Snoozed", description: "I'll remind you again in 10 minutes." });
              setNotification(null);
            }}
          />
        )}
      </div>
    </div>
  );
}
