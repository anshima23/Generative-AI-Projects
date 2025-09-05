import { Message } from "@shared/schema";
import { Mic, Volume2, User, Bot } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useSpeechSynthesis } from "@/hooks/use-speech";

interface ChatMessageProps {
  message: Message;
  onSpeak?: (text: string) => void;
}

export function ChatMessage({ message, onSpeak }: ChatMessageProps) {
  const { speak } = useSpeechSynthesis();
  
  const isUser = message.role === "user";
  const isVoice = message.isVoice;

  const handleSpeak = () => {
    if (onSpeak) {
      onSpeak(message.content);
    } else {
      speak(message.content);
    }
  };

  return (
    <div 
      className={`flex ${isUser ? "justify-end" : "justify-start"}`}
      data-testid={`chat-message-${message.role}`}
    >
      <div className="max-w-xs lg:max-w-2xl">
        <div
          className={`rounded-2xl px-4 py-3 shadow-sm ${
            isUser
              ? "bg-gradient-to-r from-primary to-primary/80 text-primary-foreground rounded-br-sm"
              : "bg-gradient-to-br from-card to-card border border-border rounded-bl-sm"
          }`}
          data-testid={`chat-bubble-${message.role}`}
        >
          <div className="flex items-start space-x-2">
            <div className="flex-shrink-0">
              {isUser ? (
                <User className="w-4 h-4 mt-0.5" />
              ) : (
                <Bot className="w-4 h-4 mt-0.5" />
              )}
            </div>
            <div className="flex-1">
              <p 
                className={`text-sm ${
                  isUser ? "text-primary-foreground" : "text-card-foreground"
                }`}
                data-testid="message-content"
              >
                {message.content}
              </p>
            </div>
          </div>
        </div>
        
        <div className={`flex items-center space-x-2 mt-2 ${isUser ? "justify-end" : "justify-start"}`}>
          <div className="flex items-center space-x-2">
            {isVoice && <Mic className="text-muted-foreground w-3 h-3" />}
            {!isUser && (
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSpeak}
                className="h-6 px-1"
                data-testid="button-speak-message"
              >
                <Volume2 className="w-3 h-3" />
              </Button>
            )}
            <span className="text-xs text-muted-foreground" data-testid="message-timestamp">
              {isVoice ? "Voice" : "Text"} • {new Date(message.timestamp!).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
