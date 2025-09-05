"use client"

import { useState, useEffect } from "react"

export interface ChatMessage {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

export interface ChatSession {
  id: string
  title: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
  language: string
  difficulty: string
}

export function useChatHistory() {
  const [sessions, setSessions] = useState<ChatSession[]>([])
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)

  // Load chat history from localStorage on mount
  useEffect(() => {
    const savedSessions = localStorage.getItem("dsa-chat-sessions")
    if (savedSessions) {
      try {
        const parsed = JSON.parse(savedSessions)
        const sessionsWithDates = parsed.map((session: any) => ({
          ...session,
          createdAt: new Date(session.createdAt),
          updatedAt: new Date(session.updatedAt),
          messages: session.messages.map((msg: any) => ({
            ...msg,
            timestamp: new Date(msg.timestamp),
          })),
        }))
        setSessions(sessionsWithDates)
      } catch (error) {
        console.error("Failed to load chat history:", error)
      }
    }
  }, [])

  // Save to localStorage whenever sessions change
  useEffect(() => {
    if (sessions.length > 0) {
      localStorage.setItem("dsa-chat-sessions", JSON.stringify(sessions))
    }
  }, [sessions])

  const createNewSession = (language = "Python", difficulty = "Intermediate"): string => {
    const newSession: ChatSession = {
      id: `session_${Date.now()}`,
      title: "New Chat",
      messages: [
        {
          id: "welcome",
          role: "assistant",
          content: `Hello! I'm your DSA & Coding AI assistant. I can help you with:

• Algorithm explanations and implementations
• Data structure concepts  
• Code optimization and complexity analysis
• Practice problems and solutions

Current settings: ${language} | ${difficulty} level

What would you like to learn about today?`,
          timestamp: new Date(),
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
      language,
      difficulty,
    }

    setSessions((prev) => [newSession, ...prev])
    setCurrentSessionId(newSession.id)
    return newSession.id
  }

  const updateSessionTitle = (sessionId: string, title: string) => {
    setSessions((prev) =>
      prev.map((session) => (session.id === sessionId ? { ...session, title, updatedAt: new Date() } : session)),
    )
  }

  const addMessageToSession = (sessionId: string, message: ChatMessage) => {
    setSessions((prev) =>
      prev.map((session) => {
        if (session.id === sessionId) {
          const updatedSession = {
            ...session,
            messages: [...session.messages, message],
            updatedAt: new Date(),
          }

          // Auto-generate title from first user message
          if (session.title === "New Chat" && message.role === "user") {
            const title = message.content.slice(0, 50) + (message.content.length > 50 ? "..." : "")
            updatedSession.title = title
          }

          return updatedSession
        }
        return session
      }),
    )
  }

  const deleteSession = (sessionId: string) => {
    setSessions((prev) => prev.filter((session) => session.id !== sessionId))
    if (currentSessionId === sessionId) {
      setCurrentSessionId(null)
    }
  }

  const getCurrentSession = (): ChatSession | null => {
    return sessions.find((session) => session.id === currentSessionId) || null
  }

  const getRecentSessions = (limit = 10): ChatSession[] => {
    return sessions.sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()).slice(0, limit)
  }

  return {
    sessions,
    currentSessionId,
    setCurrentSessionId,
    createNewSession,
    updateSessionTitle,
    addMessageToSession,
    deleteSession,
    getCurrentSession,
    getRecentSessions,
  }
}
