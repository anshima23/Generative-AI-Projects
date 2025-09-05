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
  const [conversations, setConversations] = useState<Array<{ id: string; title: string }>>([]);
  const [messageInput, setMessageInput] = useState("");
  const [messages, setMessages] = useState<Array<{ role: string; content: string }>>([]);
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

  const handleSendMessage = async () => {
    if (!messageInput.trim() || !currentConversationId) return;
    // Add user message to chat immediately
    setMessages((prev) => [...prev, { role: "user", content: messageInput }]);
    const userMessage = messageInput;
    setMessageInput("");
    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify({
          message: userMessage,
          conversationId: currentConversationId,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.assistantMessage?.content) {
          setMessages((prev) => [...prev, { role: "assistant", content: data.assistantMessage.content }]);
        }
      } else {
        toast({ title: "Error", description: "Failed to get response from assistant.", variant: "destructive" });
      }
    } catch (err) {
      toast({ title: "Error", description: "Network error.", variant: "destructive" });
    }
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

  // Fetch conversations on mount and auto-create/select if none exists
  useEffect(() => {
    async function fetchOrCreateConversation() {
      try {
        const res = await fetch("/api/conversations", { credentials: "include" });
        if (res.ok) {
          const data = await res.json();
          setConversations(data);
          if (data.length > 0) {
            setCurrentConversationId(data[0].id);
          } else {
            // Auto-create a new conversation
            const createRes = await fetch("/api/conversations", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              credentials: "include",
              body: JSON.stringify({ title: "New Conversation" }),
            });
            if (createRes.ok) {
              const newConv = await createRes.json();
              setConversations([newConv]);
              setCurrentConversationId(newConv.id);
            }
          }
        }
      } catch (err) {
        toast({ title: "Error", description: "Failed to load or create conversation.", variant: "destructive" });
      }
    }
    fetchOrCreateConversation();
  }, []);
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
            {/* Quick Actions */}
            <div className="flex flex-wrap justify-center gap-6 mb-8 w-full xl:max-w-2xl xl:mr-auto">
              {quickActions.map((action, idx) => (
                <button
                  key={action.title}
                  className="flex flex-col items-center justify-center w-32 h-24 bg-gradient-to-br from-primary/10 to-muted border border-border rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:scale-105 cursor-pointer p-4 gap-1"
                  onClick={() => setMessageInput(action.message)}
                >
                  <action.icon className="w-7 h-7 mb-2 text-primary" />
                  <span className="font-semibold text-base mb-1 text-foreground">{action.title}</span>
                  <span className="text-xs text-muted-foreground text-center">{action.description}</span>
                </button>
              ))}
            </div>
            <div
              ref={messagesContainerRef}
              className="overflow-y-auto p-4 space-y-4 scrollbar-visible h-[400px] max-h-[60vh] border rounded-lg bg-white text-base w-full xl:max-w-2xl xl:mr-auto"
            >
              {messages.length === 0 ? (
                <div className="text-muted-foreground text-center">Start a conversation...</div>
              ) : (
                messages.map((msg, idx) => (
                  <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div className={`px-4 py-2 rounded-lg ${msg.role === "user" ? "bg-primary text-white" : "bg-muted text-foreground"}`}>
                      {msg.content}
                    </div>
                  </div>
                ))
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="border-t border-border p-6 w-full bg-muted rounded-b-xl xl:max-w-2xl xl:mr-auto">
              <div className="flex items-end gap-4 justify-start w-full">
                <div className="flex-1 relative w-full">
                  <Textarea
                    value={messageInput}
                    onChange={(e) => setMessageInput(e.target.value)}
                    placeholder="Type your message or click the mic..."
                    className="w-full resize-none pr-16 rounded-lg border border-border bg-white shadow focus:border-primary focus:ring-2 focus:ring-primary/30 transition-all"
                    rows={2}
                  />
                  <button
                    className="absolute right-4 top-1/2 -translate-y-1/2 bg-primary text-white rounded-full p-2 shadow hover:bg-primary/90 transition-all disabled:bg-muted"
                    onClick={handleSendMessage}
                    disabled={!messageInput.trim()}
                    aria-label="Send message"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
                <button
                  className={`w-12 h-12 rounded-full flex items-center justify-center bg-accent shadow hover:bg-accent/80 transition-all ${isListening ? "bg-red-500 hover:bg-red-600" : ""}`}
                  onClick={handleVoiceInput}
                  disabled={!speechSupported}
                  aria-label="Voice input"
                >
                  <Mic className="w-6 h-6 text-primary" />
                </button>
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
