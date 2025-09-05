"use client"

import { useState, useEffect } from "react"

interface UploadedPDF {
  id: string
  name: string
  pages: number
  uploadDate: string
  size: number
  uploadedAt: string
  extractedText?: string
  chunks?: string[]
  textChunks?: number
}

export function usePDFStorage() {
  const [uploadedPDFs, setUploadedPDFs] = useState<UploadedPDF[]>([])

  // Load PDFs from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("dsa-chatbot-pdfs")
    if (stored) {
      try {
        const parsedPDFs = JSON.parse(stored)
        console.log("[v0] Loaded PDFs from localStorage:", parsedPDFs)
        setUploadedPDFs(parsedPDFs)
      } catch (error) {
        console.error("[v0] Error loading PDFs from localStorage:", error)
        setUploadedPDFs([])
      }
    }
  }, [])

  // Save PDFs to localStorage whenever the list changes
  useEffect(() => {
    if (uploadedPDFs.length > 0) {
      localStorage.setItem("dsa-chatbot-pdfs", JSON.stringify(uploadedPDFs))
      console.log("[v0] Saved PDFs to localStorage:", uploadedPDFs)
    }
  }, [uploadedPDFs])

  const addPDF = (pdfData: UploadedPDF) => {
    console.log("[v0] Adding PDF to storage:", pdfData)
    setUploadedPDFs((prev) => [...prev, pdfData])
  }

  const removePDF = (pdfId: string) => {
    console.log("[v0] Removing PDF from storage:", pdfId)
    setUploadedPDFs((prev) => {
      const updated = prev.filter((pdf) => pdf.id !== pdfId)
      if (updated.length === 0) {
        localStorage.removeItem("dsa-chatbot-pdfs")
      }
      return updated
    })
  }

  const clearAllPDFs = () => {
    console.log("[v0] Clearing all PDFs from storage")
    setUploadedPDFs([])
    localStorage.removeItem("dsa-chatbot-pdfs")
  }

  const getPDFContent = (pdfId?: string): string => {
    if (!pdfId) {
      // Return all PDF content if no specific ID provided
      return uploadedPDFs.map((pdf) => `Document: ${pdf.name}\n${pdf.extractedText || ""}`).join("\n\n---\n\n")
    }

    const pdf = uploadedPDFs.find((p) => p.id === pdfId)
    return pdf?.extractedText || ""
  }

  const getAllPDFContent = (): string => {
    if (uploadedPDFs.length === 0) return ""

    return uploadedPDFs
      .map((pdf) => `Document: ${pdf.name}\nContent: ${pdf.extractedText || "No content extracted"}`)
      .join("\n\n---\n\n")
  }

  return {
    uploadedPDFs,
    addPDF,
    removePDF,
    clearAllPDFs,
    getPDFContent,
    getAllPDFContent,
  }
}
