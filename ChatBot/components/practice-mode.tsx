"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { Card } from "./ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog"
import { Badge } from "./ui/badge"
import { Textarea } from "./ui/textarea"
import { Code, Brain, RotateCcw, Lightbulb } from "lucide-react"

interface PracticeModeProps {
  onClose: () => void
}

interface PracticeProblem {
  id: string
  title: string
  difficulty: "Easy" | "Medium" | "Hard"
  category: string
  description: string
  examples: Array<{ input: string; output: string; explanation?: string }>
  constraints: string[]
  hints: string[]
}

export function PracticeMode({ onClose }: PracticeModeProps) {
  const [currentProblem, setCurrentProblem] = useState<PracticeProblem | null>(null)
  const [userSolution, setUserSolution] = useState("")
  const [showHints, setShowHints] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedDifficulty, setSelectedDifficulty] = useState<"Easy" | "Medium" | "Hard">("Medium")
  const [selectedCategory, setSelectedCategory] = useState("Arrays")

  const categories = ["Arrays", "Strings", "Linked Lists", "Trees", "Graphs", "Dynamic Programming", "Sorting"]

  const generateProblem = async () => {
    setIsGenerating(true)

    try {
      const response = await fetch("/api/generate-problem", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          difficulty: selectedDifficulty,
          category: selectedCategory,
        }),
      })

      if (response.ok) {
        const problem = await response.json()
        setCurrentProblem(problem)
        setUserSolution("")
        setShowHints(false)
      }
    } catch (error) {
      console.error("Failed to generate problem:", error)
    } finally {
      setIsGenerating(false)
    }
  }

  const checkSolution = async () => {
    if (!currentProblem || !userSolution.trim()) return

    try {
      const response = await fetch("/api/check-solution", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemId: currentProblem.id,
          solution: userSolution,
        }),
      })

      const result = await response.json()
      // Handle solution feedback
      console.log("Solution feedback:", result)
    } catch (error) {
      console.error("Failed to check solution:", error)
    }
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Code className="h-5 w-5" />
            Practice Mode
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {!currentProblem ? (
            <div className="text-center py-8">
              <Brain className="h-16 w-16 text-primary mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-4">Generate a Practice Problem</h3>

              <div className="flex gap-4 justify-center mb-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Difficulty</label>
                  <select
                    value={selectedDifficulty}
                    onChange={(e) => setSelectedDifficulty(e.target.value as any)}
                    className="border border-border rounded px-3 py-2 bg-background"
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="border border-border rounded px-3 py-2 bg-background"
                  >
                    {categories.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <Button onClick={generateProblem} disabled={isGenerating} size="lg">
                {isGenerating ? "Generating..." : "Generate Problem"}
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Problem Header */}
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{currentProblem.title}</h3>
                  <div className="flex gap-2">
                    <Badge
                      variant={
                        currentProblem.difficulty === "Easy"
                          ? "secondary"
                          : currentProblem.difficulty === "Medium"
                            ? "default"
                            : "destructive"
                      }
                    >
                      {currentProblem.difficulty}
                    </Badge>
                    <Badge variant="outline">{currentProblem.category}</Badge>
                  </div>
                </div>
                <Button variant="outline" onClick={() => setCurrentProblem(null)}>
                  <RotateCcw className="h-4 w-4 mr-2" />
                  New Problem
                </Button>
              </div>

              {/* Problem Description */}
              <Card className="p-4">
                <h4 className="font-medium mb-2">Problem Description</h4>
                <p className="text-sm leading-relaxed whitespace-pre-wrap">{currentProblem.description}</p>
              </Card>

              {/* Examples */}
              <Card className="p-4">
                <h4 className="font-medium mb-3">Examples</h4>
                <div className="space-y-3">
                  {currentProblem.examples.map((example, index) => (
                    <div key={index} className="bg-muted p-3 rounded text-sm">
                      <div>
                        <strong>Input:</strong> {example.input}
                      </div>
                      <div>
                        <strong>Output:</strong> {example.output}
                      </div>
                      {example.explanation && (
                        <div className="mt-1 text-muted-foreground">
                          <strong>Explanation:</strong> {example.explanation}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </Card>

              {/* Constraints */}
              <Card className="p-4">
                <h4 className="font-medium mb-2">Constraints</h4>
                <ul className="text-sm space-y-1">
                  {currentProblem.constraints.map((constraint, index) => (
                    <li key={index} className="flex items-start gap-2">
                      <span className="text-muted-foreground">•</span>
                      {constraint}
                    </li>
                  ))}
                </ul>
              </Card>

              {/* Solution Input */}
              <Card className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Your Solution</h4>
                  <Button variant="outline" size="sm" onClick={() => setShowHints(!showHints)}>
                    <Lightbulb className="h-4 w-4 mr-2" />
                    {showHints ? "Hide" : "Show"} Hints
                  </Button>
                </div>

                {showHints && (
                  <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-950/20 rounded border-l-4 border-blue-500">
                    <h5 className="font-medium text-blue-700 dark:text-blue-300 mb-2">Hints</h5>
                    <ul className="text-sm text-blue-600 dark:text-blue-400 space-y-1">
                      {currentProblem.hints.map((hint, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span>•</span>
                          {hint}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                <Textarea
                  value={userSolution}
                  onChange={(e) => setUserSolution(e.target.value)}
                  placeholder="Write your solution here..."
                  className="min-h-[200px] font-mono text-sm"
                />

                <div className="flex gap-2 mt-3">
                  <Button onClick={checkSolution} disabled={!userSolution.trim()}>
                    Check Solution
                  </Button>
                  <Button variant="outline" onClick={() => setUserSolution("")}>
                    Clear
                  </Button>
                </div>
              </Card>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
