"use client"

import { useState } from "react"
import { Sidebar } from "./sidebar"
import { ChatWindow } from "./chat-window"
import { ThemeToggle } from "./theme-toggle"
import { Button } from "./ui/button"
import { Menu } from "lucide-react"
import { ChatHistoryProvider } from "./chat-history-provider"

export function ChatInterface() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <ChatHistoryProvider>
      <div className="flex h-full bg-background">
        {/* Mobile sidebar overlay */}
        {sidebarOpen && (
          <div className="fixed inset-0 z-40 bg-black/50 lg:hidden" onClick={() => setSidebarOpen(false)} />
        )}

        {/* Sidebar */}
        <div
          className={`
          fixed inset-y-0 left-0 z-50 w-64 transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full"}
        `}
        >
          <Sidebar onClose={() => setSidebarOpen(false)} />
        </div>

        {/* Main content */}
        <div className="flex-1 flex flex-col min-w-0">
          {/* Header */}
          <header className="flex items-center justify-between p-4 border-b border-border bg-card">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="sm" className="lg:hidden" onClick={() => setSidebarOpen(true)}>
                <Menu className="h-5 w-5" />
              </Button>
              <h1 className="text-xl font-semibold text-foreground">DSA & Coding AI Chatbot</h1>
            </div>
            <ThemeToggle />
          </header>

          {/* Chat window */}
          <div className="flex-1 overflow-hidden">
            <ChatWindow />
          </div>
        </div>
      </div>
    </ChatHistoryProvider>
  )
}
