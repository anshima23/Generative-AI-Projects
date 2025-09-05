"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Card } from "./ui/card"
import { Download, FileText, File } from "lucide-react"
import { useChatHistoryContext } from "./chat-history-provider"

interface ExportChatProps {
  onClose: () => void
}

export function ExportChat({ onClose }: ExportChatProps) {
  const [selectedFormat, setSelectedFormat] = useState<"txt" | "json">("txt")
  const [selectedChats, setSelectedChats] = useState<string[]>([])
  const [isExporting, setIsExporting] = useState(false)

  const { getRecentSessions } = useChatHistoryContext()
  const recentChats = getRecentSessions(20)

  const handleChatToggle = (chatId: string) => {
    setSelectedChats((prev) => (prev.includes(chatId) ? prev.filter((id) => id !== chatId) : [...prev, chatId]))
  }

  const handleSelectAll = () => {
    if (selectedChats.length === recentChats.length) {
      setSelectedChats([])
    } else {
      setSelectedChats(recentChats.map((chat) => chat.id))
    }
  }

  const exportChats = async () => {
    if (selectedChats.length === 0) return

    setIsExporting(true)

    try {
      const chatsToExport = recentChats.filter((chat) => selectedChats.includes(chat.id))

      if (selectedFormat === "txt") {
        exportAsTxt(chatsToExport)
      } else {
        exportAsJson(chatsToExport)
      }
    } catch (error) {
      console.error("Export failed:", error)
    } finally {
      setIsExporting(false)
    }
  }

  const exportAsTxt = (chats: any[]) => {
    let content = "DSA & Coding AI Chatbot - Chat Export\n"
    content += "=".repeat(50) + "\n\n"

    chats.forEach((chat, index) => {
      content += `Chat ${index + 1}: ${chat.title}\n`
      content += `Created: ${chat.createdAt.toLocaleString()}\n`
      content += `Language: ${chat.language} | Difficulty: ${chat.difficulty}\n`
      content += "-".repeat(30) + "\n\n"

      chat.messages.forEach((message: any) => {
        const sender = message.role === "user" ? "You" : "AI Assistant"
        content += `${sender} (${message.timestamp.toLocaleTimeString()}):\n`
        content += `${message.content}\n\n`
      })

      content += "\n" + "=".repeat(50) + "\n\n"
    })

    downloadFile(content, `dsa-chat-export-${Date.now()}.txt`, "text/plain")
  }

  const exportAsJson = (chats: any[]) => {
    const exportData = {
      exportDate: new Date().toISOString(),
      totalChats: chats.length,
      chats: chats.map((chat) => ({
        id: chat.id,
        title: chat.title,
        createdAt: chat.createdAt.toISOString(),
        updatedAt: chat.updatedAt.toISOString(),
        language: chat.language,
        difficulty: chat.difficulty,
        messages: chat.messages.map((msg: any) => ({
          id: msg.id,
          role: msg.role,
          content: msg.content,
          timestamp: msg.timestamp.toISOString(),
        })),
      })),
    }

    const content = JSON.stringify(exportData, null, 2)
    downloadFile(content, `dsa-chat-export-${Date.now()}.json`, "application/json")
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  const formatRelativeTime = (date: Date) => {
    const now = new Date()
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours}h ago`
    if (diffInHours < 48) return "Yesterday"
    return `${Math.floor(diffInHours / 24)}d ago`
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Export Chat History
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Format Selection */}
          <div className="space-y-3">
            <h3 className="font-medium">Export Format</h3>
            <div className="flex gap-3">
              <button
                onClick={() => setSelectedFormat("txt")}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                  selectedFormat === "txt" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <FileText className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">Text File (.txt)</div>
                  <div className="text-sm text-muted-foreground">Human-readable format</div>
                </div>
              </button>

              <button
                onClick={() => setSelectedFormat("json")}
                className={`flex items-center gap-2 p-3 rounded-lg border transition-colors ${
                  selectedFormat === "json" ? "border-primary bg-primary/5" : "border-border"
                }`}
              >
                <File className="h-5 w-5" />
                <div className="text-left">
                  <div className="font-medium">JSON File (.json)</div>
                  <div className="text-sm text-muted-foreground">Structured data format</div>
                </div>
              </button>
            </div>
          </div>

          {/* Chat Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Select Chats to Export</h3>
              <Button variant="outline" size="sm" onClick={handleSelectAll}>
                {selectedChats.length === recentChats.length ? "Deselect All" : "Select All"}
              </Button>
            </div>

            <div className="max-h-64 overflow-y-auto space-y-2">
              {recentChats.map((chat) => (
                <Card
                  key={chat.id}
                  className={`p-3 cursor-pointer transition-colors ${
                    selectedChats.includes(chat.id) ? "border-primary bg-primary/5" : ""
                  }`}
                  onClick={() => handleChatToggle(chat.id)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{chat.title}</p>
                      <p className="text-sm text-muted-foreground">
                        {chat.messages.length} messages • {formatRelativeTime(chat.updatedAt)}
                      </p>
                    </div>
                    <div
                      className={`w-5 h-5 rounded border-2 flex items-center justify-center ml-3 ${
                        selectedChats.includes(chat.id) ? "border-primary bg-primary" : "border-muted-foreground"
                      }`}
                    >
                      {selectedChats.includes(chat.id) && (
                        <div className="w-2 h-2 bg-primary-foreground rounded-full" />
                      )}
                    </div>
                  </div>
                </Card>
              ))}

              {recentChats.length === 0 && (
                <p className="text-center text-muted-foreground py-8">No chat history to export</p>
              )}
            </div>
          </div>

          {/* Export Button */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={exportChats} disabled={selectedChats.length === 0 || isExporting}>
              {isExporting
                ? "Exporting..."
                : `Export ${selectedChats.length} Chat${selectedChats.length !== 1 ? "s" : ""}`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
