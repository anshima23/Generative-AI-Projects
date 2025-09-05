# AI-Powered Voice Assistant Web App

## Overview

This is a full-stack AI-powered voice assistant web application that enables users to interact with an AI assistant through both voice and text input. The application integrates with ChatGPT API for intelligent responses and includes features like conversation history, task management, reminders, and smart integrations with weather and news APIs. Users can speak to the assistant, receive spoken responses, and manage their interactions through a modern web interface.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture
- **Framework**: React with TypeScript for type safety and component-based development
- **Routing**: Wouter for lightweight client-side routing
- **UI Framework**: Shadcn/ui components built on Radix UI primitives with Tailwind CSS for styling
- **State Management**: TanStack Query (React Query) for server state management and caching
- **Build Tool**: Vite for fast development and optimized production builds
- **Speech Integration**: Browser APIs (Web Speech API for speech recognition, SpeechSynthesis for text-to-speech)

### Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Authentication**: Passport.js with local strategy using session-based authentication
- **Session Management**: Express sessions with PostgreSQL session store
- **API Design**: RESTful API endpoints with proper error handling and logging middleware

### Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Design**: Relational model with users, conversations, messages, reminders, and tasks tables
- **Migrations**: Drizzle Kit for database schema management and migrations
- **Development Storage**: In-memory storage implementation for development/testing

### Authentication and Authorization
- **Strategy**: Session-based authentication using Passport.js local strategy
- **Password Security**: Scrypt hashing with salt for secure password storage
- **Route Protection**: Middleware-based authentication checks on protected routes
- **Session Persistence**: PostgreSQL-backed session store for scalable session management

## External Dependencies

### AI and Language Processing
- **OpenAI API**: GPT-5 model integration for natural language processing and intelligent responses
- **Intent Analysis**: AI-powered user intent detection and entity extraction

### Third-Party APIs
- **Weather Service**: OpenWeatherMap API for real-time weather data and forecasts
- **News Service**: NewsAPI for fetching current news articles and headlines
- **Speech Services**: Browser-native Web Speech API and SpeechSynthesis API

### Database and Infrastructure
- **Database Provider**: Neon Database (PostgreSQL-compatible serverless database)
- **Session Storage**: PostgreSQL with connect-pg-simple for session persistence

### Development and Deployment
- **Replit Integration**: Replit-specific plugins for development environment and error handling
- **Hosting**: Configured for Replit deployment with proper environment variable management

### Task Scheduling
- **Cron Jobs**: Node-cron for scheduling reminders and recurring tasks
- **Background Processing**: In-memory task scheduling with extensible architecture for external queue systems