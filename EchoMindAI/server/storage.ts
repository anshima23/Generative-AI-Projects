import { 
  type User, 
  type InsertUser, 
  type Conversation, 
  type InsertConversation,
  type Message,
  type InsertMessage,
  type Reminder,
  type InsertReminder,
  type Task,
  type InsertTask
} from "@shared/schema";
import { randomUUID } from "crypto";
import session from "express-session";
import createMemoryStore from "memorystore";

const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Users
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Conversations
  getUserConversations(userId: string): Promise<Conversation[]>;
  getConversation(id: string): Promise<Conversation | undefined>;
  createConversation(userId: string, conversation: InsertConversation): Promise<Conversation>;
  updateConversation(id: string, updates: Partial<Conversation>): Promise<void>;

  // Messages
  getConversationMessages(conversationId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;

  // Reminders
  getUserReminders(userId: string): Promise<Reminder[]>;
  createReminder(userId: string, reminder: InsertReminder): Promise<Reminder>;
  updateReminder(id: string, updates: Partial<Reminder>): Promise<void>;
  deleteReminder(id: string): Promise<void>;

  // Tasks
  getUserTasks(userId: string): Promise<Task[]>;
  createTask(userId: string, task: InsertTask): Promise<Task>;
  updateTask(id: string, updates: Partial<Task>): Promise<void>;
  deleteTask(id: string): Promise<void>;

  sessionStore: session.Store;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private conversations: Map<string, Conversation>;
  private messages: Map<string, Message>;
  private reminders: Map<string, Reminder>;
  private tasks: Map<string, Task>;
  public sessionStore: session.Store;

  constructor() {
    this.users = new Map();
    this.conversations = new Map();
    this.messages = new Map();
    this.reminders = new Map();
    this.tasks = new Map();
    this.sessionStore = new MemoryStore({
      checkPeriod: 86400000,
    });
  }

  // Users
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date()
    };
    this.users.set(id, user);
    return user;
  }

  // Conversations
  async getUserConversations(userId: string): Promise<Conversation[]> {
    return Array.from(this.conversations.values())
      .filter(conv => conv.userId === userId)
      .sort((a, b) => (b.updatedAt || b.createdAt)!.getTime() - (a.updatedAt || a.createdAt)!.getTime());
  }

  async getConversation(id: string): Promise<Conversation | undefined> {
    return this.conversations.get(id);
  }

  async createConversation(userId: string, conversation: InsertConversation): Promise<Conversation> {
    const id = randomUUID();
    const newConversation: Conversation = {
      ...conversation,
      id,
      userId,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.conversations.set(id, newConversation);
    return newConversation;
  }

  async updateConversation(id: string, updates: Partial<Conversation>): Promise<void> {
    const conversation = this.conversations.get(id);
    if (conversation) {
      const updated = { ...conversation, ...updates, updatedAt: new Date() };
      this.conversations.set(id, updated);
    }
  }

  // Messages
  async getConversationMessages(conversationId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.conversationId === conversationId)
      .sort((a, b) => a.timestamp!.getTime() - b.timestamp!.getTime());
  }

  async createMessage(message: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const newMessage: Message = {
      ...message,
      id,
      timestamp: new Date(),
      isVoice: message.isVoice ?? false,
    };
    this.messages.set(id, newMessage);
    return newMessage;
  }

  // Reminders
  async getUserReminders(userId: string): Promise<Reminder[]> {
    return Array.from(this.reminders.values())
      .filter(reminder => reminder.userId === userId)
      .sort((a, b) => a.scheduledAt.getTime() - b.scheduledAt.getTime());
  }

  async createReminder(userId: string, reminder: InsertReminder): Promise<Reminder> {
    const id = randomUUID();
    const newReminder: Reminder = {
      ...reminder,
      id,
      userId,
      isCompleted: false,
      createdAt: new Date(),
      description: reminder.description ?? null,
    };
    this.reminders.set(id, newReminder);
    return newReminder;
  }

  async updateReminder(id: string, updates: Partial<Reminder>): Promise<void> {
    const reminder = this.reminders.get(id);
    if (reminder) {
      const updated = { ...reminder, ...updates };
      this.reminders.set(id, updated);
    }
  }

  async deleteReminder(id: string): Promise<void> {
    this.reminders.delete(id);
  }

  // Tasks
  async getUserTasks(userId: string): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.userId === userId)
      .sort((a, b) => {
        if (a.isCompleted !== b.isCompleted) {
          return a.isCompleted ? 1 : -1;
        }
        if (a.dueDate && b.dueDate) {
          return a.dueDate.getTime() - b.dueDate.getTime();
        }
        if (a.dueDate) return -1;
        if (b.dueDate) return 1;
        return a.createdAt!.getTime() - b.createdAt!.getTime();
      });
  }

  async createTask(userId: string, task: InsertTask): Promise<Task> {
    const id = randomUUID();
    const newTask: Task = {
      ...task,
      id,
      userId,
      isCompleted: false,
      createdAt: new Date(),
      description: task.description ?? null,
      dueDate: task.dueDate ?? null,
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: string, updates: Partial<Task>): Promise<void> {
    const task = this.tasks.get(id);
    if (task) {
      const updated = { ...task, ...updates };
      this.tasks.set(id, updated);
    }
  }

  async deleteTask(id: string): Promise<void> {
    this.tasks.delete(id);
  }
}

export const storage = new MemStorage();
