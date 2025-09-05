import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { 
  insertConversationSchema, 
  insertMessageSchema,
  insertReminderSchema,
  insertTaskSchema
} from "@shared/schema";
import { getChatCompletion } from "./services/openai.js";
import { getWeatherData } from "./services/weather.js";
import { getNewsData } from "./services/news.js";
import { scheduleReminder } from "./services/reminders.js";

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Conversations
  app.get("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const conversations = await storage.getUserConversations(req.user!.id);
      res.json(conversations);
    } catch (error) {
      console.error("Error fetching conversations:", error);
      res.status(500).json({ message: "Failed to fetch conversations" });
    }
  });

  app.post("/api/conversations", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const data = insertConversationSchema.parse(req.body);
      const conversation = await storage.createConversation(req.user!.id, data);
      res.status(201).json(conversation);
    } catch (error) {
      console.error("Error creating conversation:", error);
      res.status(500).json({ message: "Failed to create conversation" });
    }
  });

  app.get("/api/conversations/:id/messages", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const conversation = await storage.getConversation(req.params.id);
      if (!conversation || conversation.userId !== req.user!.id) {
        return res.status(404).json({ message: "Conversation not found" });
      }
      
      const messages = await storage.getConversationMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Chat endpoint
  app.post("/api/chat", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const { message, conversationId, isVoice = false } = req.body;
      
      if (!message || !conversationId) {
        return res.status(400).json({ message: "Message and conversation ID are required" });
      }

      // Save user message
      const userMessage = await storage.createMessage({
        conversationId,
        content: message,
        role: "user",
        isVoice,
      });

      // Get conversation history for context
      const messages = await storage.getConversationMessages(conversationId);
      
      // Check for special commands
      let aiResponse: string;
      
      if (message.toLowerCase().includes("weather")) {
        const location = extractLocation(message) || "current location";
        const weatherData = await getWeatherData(location);
        aiResponse = `The weather in ${weatherData.location} is ${weatherData.temperature} and ${weatherData.condition}. Humidity is ${weatherData.humidity}%.`;
      } else if (message.toLowerCase().includes("news") || message.toLowerCase().includes("headlines")) {
        const category = extractCategory(message) || "technology";
        const newsData = await getNewsData(category);
        aiResponse = `Here are the top ${category} headlines:\n\n${newsData.map((article: any, i: number) => 
          `${i + 1}. ${article.title} - ${article.source}`
        ).join('\n')}`;
      } else if (message.toLowerCase().includes("remind me")) {
        const reminderInfo = extractReminderInfo(message);
        if (reminderInfo) {
          await storage.createReminder(req.user!.id, {
            title: reminderInfo.task,
            description: `Reminder created from voice command`,
            scheduledAt: reminderInfo.time,
          });
          scheduleReminder(reminderInfo.task, reminderInfo.time);
          aiResponse = `I've set a reminder for you to ${reminderInfo.task} at ${reminderInfo.time.toLocaleString()}.`;
        } else {
          aiResponse = "I'd be happy to set a reminder for you. Could you please specify what you'd like to be reminded about and when?";
        }
      } else {
        // Regular ChatGPT conversation
        const conversationHistory = messages.map(msg => ({
          role: msg.role as "user" | "assistant",
          content: msg.content
        }));
        
        aiResponse = await getChatCompletion([
          ...conversationHistory,
          { role: "user", content: message }
        ]);
      }

      // Save AI response
      const assistantMessage = await storage.createMessage({
        conversationId,
        content: aiResponse,
        role: "assistant",
        isVoice: false,
      });

      // Update conversation timestamp
      await storage.updateConversation(conversationId, { updatedAt: new Date() });

      res.json({
        userMessage,
        assistantMessage,
        shouldSpeak: true
      });
    } catch (error) {
      console.error("Error processing chat:", error);
      res.status(500).json({ message: "Failed to process message" });
    }
  });

  // Reminders
  app.get("/api/reminders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const reminders = await storage.getUserReminders(req.user!.id);
      res.json(reminders);
    } catch (error) {
      console.error("Error fetching reminders:", error);
      res.status(500).json({ message: "Failed to fetch reminders" });
    }
  });

  app.post("/api/reminders", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const data = insertReminderSchema.parse(req.body);
      const reminder = await storage.createReminder(req.user!.id, data);
      scheduleReminder(reminder.title, reminder.scheduledAt);
      res.status(201).json(reminder);
    } catch (error) {
      console.error("Error creating reminder:", error);
      res.status(500).json({ message: "Failed to create reminder" });
    }
  });

  app.patch("/api/reminders/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      await storage.updateReminder(req.params.id, req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error updating reminder:", error);
      res.status(500).json({ message: "Failed to update reminder" });
    }
  });

  // Tasks
  app.get("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const tasks = await storage.getUserTasks(req.user!.id);
      res.json(tasks);
    } catch (error) {
      console.error("Error fetching tasks:", error);
      res.status(500).json({ message: "Failed to fetch tasks" });
    }
  });

  app.post("/api/tasks", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      const data = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(req.user!.id, data);
      res.status(201).json(task);
    } catch (error) {
      console.error("Error creating task:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    
    try {
      await storage.updateTask(req.params.id, req.body);
      res.sendStatus(200);
    } catch (error) {
      console.error("Error updating task:", error);
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  // Weather API
  app.get("/api/weather", async (req, res) => {
    try {
      const location = req.query.location as string || "current location";
      const weatherData = await getWeatherData(location);
      res.json(weatherData);
    } catch (error) {
      console.error("Error fetching weather:", error);
      res.status(500).json({ message: "Failed to fetch weather data" });
    }
  });

  // News API
  app.get("/api/news", async (req, res) => {
    try {
      const category = req.query.category as string || "technology";
      const newsData = await getNewsData(category);
      res.json(newsData);
    } catch (error) {
      console.error("Error fetching news:", error);
      res.status(500).json({ message: "Failed to fetch news data" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

// Helper functions for extracting information from messages
function extractLocation(message: string): string | null {
  const locationMatch = message.match(/(?:in|at|for)\s+([a-zA-Z\s]+)(?:\s|$)/i);
  return locationMatch ? locationMatch[1].trim() : null;
}

function extractCategory(message: string): string | null {
  if (message.toLowerCase().includes("tech")) return "technology";
  if (message.toLowerCase().includes("business")) return "business";
  if (message.toLowerCase().includes("sports")) return "sports";
  if (message.toLowerCase().includes("health")) return "health";
  return null;
}

function extractReminderInfo(message: string): { task: string; time: Date } | null {
  // Try multiple reminder patterns
  let reminderMatch = message.match(/remind me to (.+?) (?:at|in) (.+)/i);
  if (!reminderMatch) {
    reminderMatch = message.match(/set (?:a )?reminder (?:to )?(.+?) (?:at|for|in) (.+)/i);
  }
  if (!reminderMatch) {
    reminderMatch = message.match(/reminder (.+?) (?:at|in) (.+)/i);
  }
  
  if (!reminderMatch) return null;
  
  const task = reminderMatch[1].trim();
  const timeStr = reminderMatch[2].trim().toLowerCase();
  
  console.log(`Parsing reminder: "${task}" at "${timeStr}"`);
  
  const now = new Date();
  let reminderTime = new Date();
  
  // Handle relative times like "in 5 minutes", "in 1 hour"
  if (timeStr.includes("minute")) {
    const minutes = parseInt(timeStr.match(/(\d+)/)?.[1] || "5");
    reminderTime = new Date(now.getTime() + minutes * 60 * 1000);
    return { task, time: reminderTime };
  }
  
  if (timeStr.includes("hour")) {
    const hours = parseInt(timeStr.match(/(\d+)/)?.[1] || "1");
    reminderTime = new Date(now.getTime() + hours * 60 * 60 * 1000);
    return { task, time: reminderTime };
  }
  
  // Handle absolute times like "7pm", "7:30pm", "19:00"
  const timeMatch = timeStr.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)?/i);
  if (timeMatch) {
    let hour = parseInt(timeMatch[1]);
    const minute = parseInt(timeMatch[2] || "0");
    const ampm = timeMatch[3]?.toLowerCase();
    
    if (ampm === "pm" && hour !== 12) {
      hour += 12;
    } else if (ampm === "am" && hour === 12) {
      hour = 0;
    } else if (!ampm && hour < 12) {
      // Default to PM for hours like "7" without AM/PM
      hour += 12;
    }
    
    reminderTime.setHours(hour, minute, 0, 0);
    
    // If the time has passed today, schedule for tomorrow
    if (reminderTime <= now) {
      reminderTime.setDate(reminderTime.getDate() + 1);
    }
    
    console.log(`Scheduled reminder for: ${reminderTime.toLocaleString()}`);
    return { task, time: reminderTime };
  }
  
  console.log("Could not parse time:", timeStr);
  return null;
}
