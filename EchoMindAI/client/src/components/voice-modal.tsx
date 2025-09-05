import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Mic, MicOff } from "lucide-react";

interface VoiceModalProps {
  isOpen: boolean;
  onClose: () => void;
  isListening: boolean;
  transcript: string;
  onToggleListening: () => void;
}

export function VoiceModal({
  isOpen,
  onClose,
  isListening,
  transcript,
  onToggleListening,
}: VoiceModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md" data-testid="voice-modal">
        <div className="text-center p-6">
          <div className="relative mb-6">
            <div className="w-20 h-20 bg-primary rounded-full flex items-center justify-center mx-auto relative">
              <Mic className="text-primary-foreground text-2xl" />
              {isListening && (
                <div className="absolute inset-0 -z-10">
                  <div className="absolute inset-0 bg-primary/30 rounded-full animate-pulse"></div>
                  <div 
                    className="absolute inset-0 bg-primary/30 rounded-full animate-pulse" 
                    style={{ animationDelay: "0.5s" }}
                  ></div>
                </div>
              )}
            </div>
          </div>

          <h3 className="text-lg font-semibold text-foreground mb-2" data-testid="voice-modal-title">
            {isListening ? "Listening..." : "Voice Input"}
          </h3>
          
          <p className="text-muted-foreground mb-6" data-testid="voice-modal-description">
            {isListening 
              ? "Speak now or tap to stop" 
              : "Click the microphone to start speaking"
            }
          </p>

          {transcript && (
            <div className="mb-6 p-4 bg-muted rounded-lg" data-testid="voice-transcript">
              <p className="text-sm text-muted-foreground mb-1">Transcript:</p>
              <p className="text-foreground">{transcript}</p>
            </div>
          )}

          {/* Voice Visualization */}
          {isListening && (
            <div className="flex justify-center space-x-1 mb-6" data-testid="voice-visualization">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-2 h-8 bg-primary rounded-full animate-pulse"
                  style={{ 
                    animationDelay: `${i * 0.1}s`,
                    animationDuration: "1.5s"
                  }}
                />
              ))}
            </div>
          )}

          <div className="flex gap-3 justify-center">
            <Button
              onClick={onToggleListening}
              variant={isListening ? "destructive" : "default"}
              size="lg"
              data-testid={`button-${isListening ? "stop" : "start"}-listening`}
            >
              {isListening ? (
                <>
                  <MicOff className="mr-2 h-4 w-4" />
                  Stop Listening
                </>
              ) : (
                <>
                  <Mic className="mr-2 h-4 w-4" />
                  Start Listening
                </>
              )}
            </Button>
            
            <Button 
              variant="outline" 
              onClick={onClose}
              data-testid="button-close-voice-modal"
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
