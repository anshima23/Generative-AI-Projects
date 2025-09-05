import Groq from "groq-sdk";

const groq = new Groq({ 
  apiKey: process.env.GROQ_API_KEY || "default_key"
});

export async function getChatCompletion(
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>
): Promise<string> {
  try {
    // Using Groq's latest supported model for fast inference
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: "You are a helpful AI assistant. Provide clear, concise, and helpful responses. When appropriate, use emojis to make your responses more engaging. Keep responses conversational and friendly."
        },
        ...messages
      ],
      max_tokens: 500,
      temperature: 0.7,
    });

    return response.choices[0].message.content || "I'm sorry, I couldn't generate a response.";
  } catch (error) {
    console.error("Groq API error:", error);
    throw new Error("Failed to get AI response");
  }
}

export async function analyzeUserIntent(message: string): Promise<{
  intent: string;
  entities: Record<string, any>;
  confidence: number;
}> {
  try {
    const response = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `Analyze the user's message and determine their intent. Respond with JSON in this format:
          {
            "intent": "weather|news|reminder|task|calendar|general",
            "entities": {
              "location": "string if mentioned",
              "time": "string if mentioned",
              "task": "string if task mentioned",
              "category": "string if news category mentioned"
            },
            "confidence": number between 0 and 1
          }`
        },
        {
          role: "user",
          content: message
        }
      ],
    });

    return JSON.parse(response.choices[0].message.content || "{}");
  } catch (error) {
    console.error("Intent analysis error:", error);
    return {
      intent: "general",
      entities: {},
      confidence: 0.5
    };
  }
}
