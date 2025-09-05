"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Progress } from "./ui/progress"
import { Upload, FileText, CheckCircle, AlertCircle } from "lucide-react"

interface PDFUploadProps {
  onClose: () => void
  onUploadSuccess: (pdfData: any) => void
}

export function PDFUpload({ onClose, onUploadSuccess }: PDFUploadProps) {
  const [dragActive, setDragActive] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    const files = e.dataTransfer.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      handleFile(files[0])
    }
  }

  const handleFile = async (file: File) => {
    if (file.type !== "application/pdf") {
      setUploadStatus("error")
      setErrorMessage("Please upload a PDF file only.")
      return
    }

    if (file.size > 10 * 1024 * 1024) {
      // 10MB limit
      setUploadStatus("error")
      setErrorMessage("File size must be less than 10MB.")
      return
    }

    setUploading(true)
    setUploadStatus("idle")
    setUploadProgress(0)

    try {
      const formData = new FormData()
      formData.append("pdf", file)

      console.log("[v0] Starting PDF upload for file:", file.name)

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 200)

      const response = await fetch("/api/upload-pdf", {
        method: "POST",
        body: formData,
      })

      clearInterval(progressInterval)
      setUploadProgress(100)

      if (!response.ok) {
        throw new Error("Upload failed")
      }

      const result = await response.json()
      console.log("[v0] PDF upload API response:", result)

      setTimeout(() => {
        setUploadStatus("success")
        const pdfData = {
          id: result.id,
          name: result.filename,
          pages: result.pages,
          uploadDate: "Just now",
          size: result.size,
          uploadedAt: result.uploadedAt,
          extractedText: result.extractedText,
          chunks: result.chunks,
          textChunks: result.textChunks,
        }
        console.log("[v0] Calling onUploadSuccess with:", pdfData)
        onUploadSuccess(pdfData)
      }, 500)
    } catch (error) {
      console.error("[v0] PDF upload error:", error)
      setUploadStatus("error")
      setErrorMessage("Failed to upload PDF. Please try again.")
      setUploading(false)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Upload PDF Document
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {uploadStatus === "success" ? (
            <div className="text-center py-8">
              <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Upload Successful!</h3>
              <p className="text-sm text-muted-foreground">
                Your PDF has been processed and is ready to use in conversations.
              </p>
            </div>
          ) : uploadStatus === "error" ? (
            <div className="text-center py-8">
              <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-foreground mb-2">Upload Failed</h3>
              <p className="text-sm text-muted-foreground">{errorMessage}</p>
              <Button variant="outline" onClick={() => setUploadStatus("idle")} className="mt-4">
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <Card
                className={`border-2 border-dashed p-8 text-center transition-colors ${
                  dragActive ? "border-primary bg-primary/5" : "border-muted-foreground/25"
                } ${uploading ? "pointer-events-none opacity-50" : "cursor-pointer hover:border-primary/50"}`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => !uploading && fileInputRef.current?.click()}
              >
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium text-foreground mb-2">
                  {uploading ? "Processing PDF..." : "Drop your PDF here"}
                </h3>
                <p className="text-sm text-muted-foreground mb-4">
                  {uploading ? "Extracting text content for AI analysis..." : "or click to browse files"}
                </p>
                <p className="text-xs text-muted-foreground">Supports PDF files up to 10MB</p>
              </Card>

              {uploading && (
                <div className="space-y-2">
                  <Progress value={uploadProgress} className="w-full" />
                  <p className="text-sm text-muted-foreground text-center">
                    {uploadProgress < 90 ? "Uploading..." : "Processing text content..."}
                  </p>
                </div>
              )}

              <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileInput} className="hidden" />
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
