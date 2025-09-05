# 🚀 DSA & Coding AI Chatbot  

An **AI-powered full-stack web app** to solve **DSA (Data Structures & Algorithms) and coding queries** with interactive explanations, multi-language code snippets, and integrated PDF knowledge retrieval.  

Built with **React.js (frontend)**, **Node.js + Express (backend)**, **LangChain (AI pipeline)**, and **MongoDB (database)**.  

---

## ✨ Features  

### 🔹 Chatbot Core  
- 💬 Chat UI with **user & AI messages**  
- 📂 Sidebar with **chat history**  
- 🌙 **Dark/Light mode** toggle  
- 🧠 **Context memory** (remembers previous messages in a session)  

### 🔹 AI Coding Assistant  
- 📚 Explains **DSA concepts & algorithms step-by-step**  
- 🖥️ Provides code snippets in **Python, Java, C++**  
- ⏱️ Analyzes **time & space complexity**  
- 🎚️ **Difficulty Levels**: Beginner / Intermediate / Advanced  
- 🔀 **Code Mode Selector**: Choose output language  

### 🔹 PDF Knowledge Integration  
- 📤 Upload **college notes, question banks, or PDFs**  
- 📖 PDFs parsed into embeddings (LangChain retriever)  
- 🤖 Chatbot answers queries from **PDF + AI knowledge**  

### 🔹 Extra Tools  
- 📝 **Practice Question Generator** (custom DSA problems)  
- 🎯 **Quiz Mode**: AI asks coding/DSA questions & checks answers  
- 📦 **Export Chats** as `.pdf` or `.txt`  
- 🎙️ **Voice Input/Output**: Ask questions & listen to answers  

---

## 🛠️ Tech Stack  

**Frontend**  
- React.js  
- TailwindCSS  

**Backend**  
- Node.js + Express  
- LangChain (RetrievalQA)  
- Groq (LLaMA-3.1-8B-Instant) / OpenAI GPT-3.5  

**Database**  
- MongoDB (for chat history & uploaded PDFs)  

---

## 📂 Project Structure  

```bash
dsa-coding-chatbot/
│── client/                  # React frontend
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatWindow.jsx
│   │   │   ├── Sidebar.jsx
│   │   │   ├── PDFUpload.jsx
│   │   │   ├── Settings.jsx
│   │   ├── App.jsx
│   │   ├── index.css
│   │   └── main.jsx
│   └── package.json
│
│── server/                  # Node.js backend
│   ├── routes/
│   │   ├── chat.js          # /chat → AI responses
│   │   ├── upload.js        # /upload → PDF upload + embedding
│   │   ├── history.js       # /history → Fetch chat history
│   ├── utils/
│   │   ├── langchain.js     # LangChain config
│   │   ├── pdfParser.js     # PDF → text → embeddings
│   ├── server.js
│   └── package.json
│
│── .env                     # API keys (Groq/OpenAI, MongoDB)
│── README.md
