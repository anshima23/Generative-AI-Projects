"use client"

import type React from "react"
import { createContext, useContext } from "react"
import { useChatHistory, type ChatSession, type ChatMessage } from "../hooks/use-chat-history"

interface ChatHistoryContextType {
  sessions: ChatSession[]
  currentSessionId: string | null
  setCurrentSessionId: (id: string | null) => void
  createNewSession: (language?: string, difficulty?: string) => string
  updateSessionTitle: (sessionId: string, title: string) => void
  addMessageToSession: (sessionId: string, message: ChatMessage) => void
  deleteSession: (sessionId: string) => void
  getCurrentSession: () => ChatSession | null
  getRecentSessions: (limit?: number) => ChatSession[]
}

const ChatHistoryContext = createContext<ChatHistoryContextType | undefined>(undefined)

export function ChatHistoryProvider({ children }: { children: React.ReactNode }) {
  const chatHistory = useChatHistory()

  return <ChatHistoryContext.Provider value={chatHistory}>{children}</ChatHistoryContext.Provider>
}

export function useChatHistoryContext() {
  const context = useContext(ChatHistoryContext)
  if (context === undefined) {
    throw new Error("useChatHistoryContext must be used within a ChatHistoryProvider")
  }
  return context
}
