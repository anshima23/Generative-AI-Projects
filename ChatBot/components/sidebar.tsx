"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Badge } from "./ui/badge"
import {
  Plus,
  History,
  Upload,
  Settings,
  Code,
  Brain,
  X,
  ChevronRight,
  FileText,
  Trash2,
  Trophy,
  Download,
} from "lucide-react"
import { PDFUpload } from "./pdf-upload"
import { PracticeMode } from "./practice-mode"
import { QuizMode } from "./quiz-mode"
import { ExportChat } from "./export-chat"
import { SettingsModal } from "./settings-modal"
import { useChatHistoryContext } from "./chat-history-provider"
import { usePDFStorage } from "../hooks/use-pdf-storage"

interface SidebarProps {
  onClose?: () => void
}

export function Sidebar({ onClose }: SidebarProps) {
  const [showPDFUpload, setShowPDFUpload] = useState(false)
  const [showPracticeMode, setShowPracticeMode] = useState(false)
  const [showQuizMode, setShowQuizMode] = useState(false)
  const [showExportChat, setShowExportChat] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const { uploadedPDFs, addPDF, removePDF } = usePDFStorage()

  const { currentSessionId, setCurrentSessionId, createNewSession, deleteSession, getRecentSessions } =
    useChatHistoryContext()

  const recentChats = getRecentSessions(10)

  const programmingLanguages = ["Python", "Java", "C++", "JavaScript"]

  const handleDeletePDF = (pdfId: string) => {
    console.log("[v0] Deleting PDF:", pdfId)
    removePDF(pdfId)
  }

  const handleNewChat = () => {
    const newSessionId = createNewSession()
    setCurrentSessionId(newSessionId)
  }

  const handleChatSelect = (chatId: string) => {
    setCurrentSessionId(chatId)
  }

  const handleDeleteChat = (chatId: string, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteSession(chatId)
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
    <div className="h-full bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Brain className="h-6 w-6 text-sidebar-primary" />
            <span className="font-semibold text-sidebar-foreground">DSA Bot</span>
          </div>
          {onClose && (
            <Button variant="ghost" size="sm" onClick={onClose} className="lg:hidden">
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* New Chat Button */}
      <div className="p-4">
        <Button className="w-full justify-start gap-2" variant="default" onClick={handleNewChat}>
          <Plus className="h-4 w-4" />
          New Chat
        </Button>
      </div>

      {/* Language Selector */}
      <div className="px-4 pb-4">
        <h3 className="text-sm font-medium text-sidebar-foreground mb-2">Programming Language</h3>
        <div className="grid grid-cols-2 gap-2">
          {programmingLanguages.map((lang) => (
            <Badge key={lang} variant="secondary" className="justify-center cursor-pointer hover:bg-sidebar-accent">
              {lang}
            </Badge>
          ))}
        </div>
      </div>

      {/* PDF Upload Section */}
      <div className="px-4 pb-4 border-b border-sidebar-border">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-medium text-sidebar-foreground flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Uploaded PDFs
          </h3>
          <Button variant="ghost" size="sm" onClick={() => setShowPDFUpload(true)} className="h-6 w-6 p-0">
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        <div className="space-y-2 max-h-32 overflow-y-auto">
          {uploadedPDFs.map((pdf) => (
            <Card key={pdf.id} className="p-2 bg-sidebar-accent/50">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium text-sidebar-foreground truncate">{pdf.name}</p>
                  <p className="text-xs text-sidebar-foreground/60">
                    {pdf.pages} pages • {pdf.uploadDate}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDeletePDF(pdf.id)}
                  className="h-5 w-5 p-0 text-sidebar-foreground/60 hover:text-red-500"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>
            </Card>
          ))}
          {uploadedPDFs.length === 0 && (
            <p className="text-xs text-sidebar-foreground/60 text-center py-2">No PDFs uploaded yet</p>
          )}
        </div>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-4 pb-2">
          <h3 className="text-sm font-medium text-sidebar-foreground mb-2 flex items-center gap-2">
            <History className="h-4 w-4" />
            Recent Chats
          </h3>
        </div>

        <div className="space-y-1 px-2">
          {recentChats.map((chat) => (
            <Card
              key={chat.id}
              className={`p-3 cursor-pointer transition-colors hover:bg-sidebar-accent group ${
                currentSessionId === chat.id ? "bg-sidebar-accent" : ""
              }`}
              onClick={() => handleChatSelect(chat.id)}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-sidebar-foreground truncate">{chat.title}</p>
                  <p className="text-xs text-sidebar-foreground/60 mt-1">{formatRelativeTime(chat.updatedAt)}</p>
                </div>
                <div className="flex items-center gap-1 ml-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => handleDeleteChat(chat.id, e)}
                    className="h-5 w-5 p-0 text-sidebar-foreground/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                  <ChevronRight className="h-4 w-4 text-sidebar-foreground/40 flex-shrink-0" />
                </div>
              </div>
            </Card>
          ))}
          {recentChats.length === 0 && (
            <p className="text-sm text-sidebar-foreground/60 text-center py-4">No chat history yet</p>
          )}
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="p-4 border-t border-sidebar-border space-y-2">
        <Button variant="ghost" className="w-full justify-start gap-2" size="sm" onClick={() => setShowPDFUpload(true)}>
          <Upload className="h-4 w-4" />
          Upload PDF
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          size="sm"
          onClick={() => setShowPracticeMode(true)}
        >
          <Code className="h-4 w-4" />
          Practice Mode
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2" size="sm" onClick={() => setShowQuizMode(true)}>
          <Trophy className="h-4 w-4" />
          Quiz Mode
        </Button>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          size="sm"
          onClick={() => setShowExportChat(true)}
        >
          <Download className="h-4 w-4" />
          Export Chats
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-2" size="sm" onClick={() => setShowSettings(true)}>
          <Settings className="h-4 w-4" />
          Settings
        </Button>
      </div>

      {/* Modals */}
      {showPDFUpload && (
        <PDFUpload
          onClose={() => setShowPDFUpload(false)}
          onUploadSuccess={(pdfData) => {
            console.log("[v0] PDF upload success, adding to sidebar:", pdfData)
            addPDF(pdfData)
            setShowPDFUpload(false)
          }}
        />
      )}

      {showPracticeMode && <PracticeMode onClose={() => setShowPracticeMode(false)} />}

      {showQuizMode && <QuizMode onClose={() => setShowQuizMode(false)} />}

      {showExportChat && <ExportChat onClose={() => setShowExportChat(false)} />}

      {showSettings && <SettingsModal onClose={() => setShowSettings(false)} />}
    </div>
  )
}
