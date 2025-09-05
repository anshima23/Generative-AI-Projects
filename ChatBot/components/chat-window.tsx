"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Textarea } from "./ui/textarea"
import { Badge } from "./ui/badge"
import { Send, Bot, User, Copy, ThumbsUp, ThumbsDown } from "lucide-react"
import { useChatHistoryContext } from "./chat-history-provider"
import { usePDFStorage } from "../hooks/use-pdf-storage"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export function ChatWindow() {
  const [language, setLanguage] = useState("Python")
  const [difficulty, setDifficulty] = useState("Intermediate")
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const { currentSessionId, getCurrentSession, addMessageToSession, createNewSession } = useChatHistoryContext()
  const { getAllPDFContent, uploadedPDFs } = usePDFStorage()

  const currentSession = getCurrentSession()

  // Ensure new session is created if none exists
  useEffect(() => {
    if (!currentSessionId) {
      const newId = createNewSession(language, difficulty)

      // Add welcome message immediately after creating session
      const welcomeMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: "Hello! 👋 I’m your coding assistant. Ask me anything about algorithms, data structures, or programming!",
        timestamp: new Date(),
      }

      setMessages([welcomeMessage])
      addMessageToSession(newId, welcomeMessage)
    }
  }, [currentSessionId, createNewSession, language, difficulty, addMessageToSession])

  useEffect(() => {
    if (currentSession) {
      setMessages(currentSession.messages)
      setLanguage(currentSession.language)
      setDifficulty(currentSession.difficulty)
    }
  }, [currentSession])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: `user_${Date.now()}`,
      role: "user",
      content: input.trim(),
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    if (currentSessionId) {
      addMessageToSession(currentSessionId, userMessage)
    }

    const currentInput = input.trim()
    setInput("")
    setIsLoading(true)

    try {
      const pdfContent = getAllPDFContent()

      const requestBody = {
        messages: [...messages, userMessage].map((m) => ({
          role: m.role,
          content: m.content,
        })),
        language,
        difficulty,
        pdfContent: pdfContent || null,
      }

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const assistantMessage: Message = {
        id: `assistant_${Date.now()}`,
        role: "assistant",
        content: "",
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, assistantMessage])

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()

      if (reader) {
        let accumulatedContent = ""

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value, { stream: true })
          accumulatedContent += chunk

          setMessages((prev) =>
            prev.map((msg) =>
              msg.id === assistantMessage.id ? { ...msg, content: accumulatedContent } : msg,
            ),
          )
        }

        if (currentSessionId) {
          addMessageToSession(currentSessionId, { ...assistantMessage, content: accumulatedContent })
        }
      }
    } catch (error) {
      console.error("[v0] Chat error:", error)
      const errorMessage: Message = {
        id: `error_${Date.now()}`,
        role: "assistant",
        content: "Sorry, I encountered an error. Please try again.",
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSubmit(e as any)
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Settings Bar */}
      <div className="border-b border-border p-3">
        <div className="flex gap-4 items-center">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Language:</span>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-sm border border-border rounded px-2 py-1 bg-background"
            >
              <option value="Python">Python</option>
              <option value="Java">Java</option>
              <option value="C++">C++</option>
              <option value="JavaScript">JavaScript</option>
            </select>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Difficulty:</span>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
              className="text-sm border border-border rounded px-2 py-1 bg-background"
            >
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>
          {uploadedPDFs.length > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">
                📄 {uploadedPDFs.length} PDF{uploadedPDFs.length > 1 ? "s" : ""} loaded
              </Badge>
            </div>
          )}
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div key={message.id} className={`flex gap-3 ${message.role === "user" ? "justify-end" : "justify-start"}`}>
            {message.role === "assistant" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              </div>
            )}

            <Card
              className={`max-w-[80%] p-4 ${
                message.role === "user" ? "bg-primary text-primary-foreground" : "bg-card"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex gap-2 mb-2">
                  <Badge variant="secondary" className="text-xs">
                    {language}
                  </Badge>
                  <Badge variant="outline" className="text-xs">
                    {difficulty}
                  </Badge>
                </div>
              )}

              <div className="whitespace-pre-wrap text-sm leading-relaxed">{message.content}</div>

              {message.role === "assistant" && (
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-border/20">
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <Copy className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <ThumbsUp className="h-3 w-3" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 px-2">
                    <ThumbsDown className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </Card>

            {message.role === "user" && (
              <div className="flex-shrink-0">
                <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                  <User className="h-4 w-4 text-secondary-foreground" />
                </div>
              </div>
            )}
          </div>
        ))}

        {isLoading && (
          <div className="flex gap-3 justify-start">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
            </div>
            <Card className="max-w-[80%] p-4 bg-card">
              <div className="flex items-center gap-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.1s" }}></div>
                  <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }}></div>
                </div>
                <span className="text-sm text-muted-foreground">AI is thinking...</span>
              </div>
            </Card>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t border-border p-4">
        <form onSubmit={handleSubmit} className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about algorithms, data structures, or coding problems..."
            className="flex-1 min-h-[44px] max-h-32 resize-none"
            disabled={isLoading}
          />
          <Button type="submit" disabled={!input.trim() || isLoading} className="px-3">
            <Send className="h-4 w-4" />
          </Button>
        </form>
        <p className="text-xs text-muted-foreground mt-2">Press Enter to send, Shift+Enter for new line</p>
      </div>
    </div>
  )
}
