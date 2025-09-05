const ProblemSchema = {
  type: "object",
  properties: {
    id: { type: "string" },
    title: { type: "string" },
    difficulty: { type: "string", enum: ["Easy", "Medium", "Hard"] },
    category: { type: "string" },
    description: { type: "string" },
    examples: {
      type: "array",
      items: {
        type: "object",
        properties: {
          input: { type: "string" },
          output: { type: "string" },
          explanation: { type: "string" },
        },
      },
    },
    constraints: { type: "array", items: { type: "string" } },
    hints: { type: "array", items: { type: "string" } },
  },
}

export async function POST(req: Request) {
  try {
    const { difficulty, category } = await req.json()

    console.log("[v0] Generating problem for:", { difficulty, category })

    const prompt = `Generate a ${difficulty} level coding problem for the ${category} category.

Requirements:
- Create a realistic DSA problem that tests understanding of ${category}
- Include 2-3 examples with clear input/output
- Provide 3-4 helpful hints
- Add appropriate constraints
- Make it educational and engaging

The problem should be suitable for a ${difficulty} level programmer and focus on ${category} concepts.

Please respond with a valid JSON object matching this schema:
{
  "id": "unique_problem_id",
  "title": "Problem Title",
  "difficulty": "${difficulty}",
  "category": "${category}",
  "description": "Detailed problem description",
  "examples": [
    {
      "input": "example input",
      "output": "expected output",
      "explanation": "why this output"
    }
  ],
  "constraints": ["constraint 1", "constraint 2"],
  "hints": ["hint 1", "hint 2", "hint 3"]
}`

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gemma2-9b-it",
        messages: [
          {
            role: "system",
            content:
              "You are a coding problem generator. Always respond with valid JSON only, no additional text or formatting.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    })

    if (!response.ok) {
      throw new Error(`Groq API error: ${response.status}`)
    }

    const data = await response.json()
    const content = data.choices[0]?.message?.content

    if (!content) {
      throw new Error("No content received from Groq API")
    }

    console.log("[v0] Raw Groq response:", content)

    // Parse the JSON response
    let problemObject
    try {
      problemObject = JSON.parse(content)
    } catch (parseError) {
      console.error("[v0] JSON parse error:", parseError)
      // Fallback problem if parsing fails
      problemObject = {
        id: `problem_${Date.now()}`,
        title: `${difficulty} ${category} Problem`,
        difficulty,
        category,
        description: `A ${difficulty.toLowerCase()} level problem focusing on ${category} concepts. This problem will test your understanding of fundamental algorithms and data structures.`,
        examples: [
          {
            input: "Example input",
            output: "Expected output",
            explanation: "Explanation of the solution approach",
          },
        ],
        constraints: ["1 ≤ n ≤ 1000", "All inputs are valid"],
        hints: [
          `Consider using ${category} data structures`,
          "Think about the time complexity",
          "Start with a brute force approach, then optimize",
        ],
      }
    }

    console.log("[v0] Generated problem:", problemObject)
    return Response.json(problemObject)
  } catch (error) {
    console.error("[v0] Problem generation error:", error)
    return new Response(JSON.stringify({ error: "Failed to generate problem" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
}
