import { groq } from "@ai-sdk/groq"
import { generateText } from "ai"

export async function POST(req: Request) {
  try {
    const { problemId, solution } = await req.json()

    const result = await generateText({
      model: groq("llama-3.1-8b-instant"),
      prompt: `Analyze this coding solution and provide feedback:

Problem ID: ${problemId}
Solution:
${solution}

Please provide:
1. Whether the solution is correct
2. Time and space complexity analysis
3. Suggestions for improvement
4. Alternative approaches if applicable

Be constructive and educational in your feedback.`,
      maxTokens: 500,
    })

    return Response.json({
      feedback: result.text,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("Solution check error:", error)
    return new Response("Failed to check solution", { status: 500 })
  }
}
