export async function POST(req: Request) {
  try {
    const { messages, language = "Python", difficulty = "Intermediate", pdfContent } = await req.json()

    let systemPrompt = `You are an expert DSA (Data Structures and Algorithms) and coding tutor. Your role is to:

1. Explain algorithms and data structures clearly with step-by-step breakdowns
2. Provide code implementations in ${language} (unless specifically asked for another language)
3. Analyze time and space complexity for all solutions
4. Adapt explanations to ${difficulty} level
5. Use practical examples and analogies to make concepts clear
6. Always include working code snippets when relevant
7. Break down complex problems into smaller, manageable parts

Guidelines:
- For Beginner: Use simple language, basic examples, focus on understanding concepts
- For Intermediate: Include optimization techniques, multiple approaches, complexity analysis
- For Advanced: Discuss edge cases, advanced optimizations, system design considerations

Always format code blocks properly and explain the logic behind each solution.`

    if (pdfContent && pdfContent.trim()) {
      systemPrompt += `

🚨 CRITICAL INSTRUCTION: The user has uploaded PDF documents and you HAVE ACCESS to their content. DO NOT say you cannot read PDFs or access files. You MUST use the following document content to answer questions:

--- UPLOADED DOCUMENT CONTENT ---
${pdfContent}
--- END DOCUMENT CONTENT ---

MANDATORY BEHAVIOR:
- You CAN and MUST reference this document content
- When users ask about the uploaded PDF, provide specific information from the content above
- Never claim you cannot access or read the uploaded documents
- Use the document content as your primary source for relevant questions
- If asked about the PDF, acknowledge you have access to it and use its content`

      console.log("[v0] Including PDF content in chat context")
      console.log("[v0] PDF content length:", pdfContent.length)
    }

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemma2-9b-it",
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.7,
        max_tokens: 1000,
        stream: true,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const encoder = new TextEncoder()
    const decoder = new TextDecoder()

    const stream = new ReadableStream({
      async start(controller) {
        const reader = response.body?.getReader()
        if (!reader) {
          controller.close()
          return
        }

        try {
          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value)
            const lines = chunk.split("\n")

            for (const line of lines) {
              if (line.startsWith("data: ")) {
                const data = line.slice(6)
                if (data === "[DONE]") {
                  controller.close()
                  return
                }

                try {
                  const parsed = JSON.parse(data)
                  const content = parsed.choices?.[0]?.delta?.content
                  if (content) {
                    controller.enqueue(encoder.encode(content))
                  }
                } catch (e) {
                  // Skip invalid JSON lines
                }
              }
            }
          }
        } catch (error) {
          controller.error(error)
        } finally {
          reader.releaseLock()
        }
      },
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
      },
    })
  } catch (error) {
    console.error("Chat API error:", error)
    return new Response(JSON.stringify({ error: "Failed to generate response" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
