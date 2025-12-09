# Real-Time Chat Application

A modern real-time chat application built with **FastAPI** (Python backend) and **Next.js** (TypeScript frontend). This application demonstrates real-time bidirectional communication using WebSockets.

## 🚀 Features

- ✅ **Real-time messaging** using WebSockets
- ✅ **Username-based authentication** with duplicate prevention
- ✅ **Join/leave notifications** for all users
- ✅ **Live user count** that updates in real-time
- ✅ **Connection status indicator** (connected/disconnected)
- ✅ **Message timestamps** for all messages
- ✅ **Responsive design** with Tailwind CSS
- ✅ **Environment variable configuration** for easy deployment

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern, fast Python web framework
- **WebSockets** - Real-time bidirectional communication
- **Uvicorn** - Lightning-fast ASGI server
- **Python 3.8+** - Programming language

### Frontend
- **Next.js 16** - React framework with App Router
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **React 19** - UI library

## 📋 Prerequisites

Before you begin, ensure you have the following installed:

- **Python 3.8+** - [Download Python](https://www.python.org/downloads/)
- **Node.js 18+** and npm - [Download Node.js](https://nodejs.org/)
- **Git** - [Download Git](https://git-scm.com/downloads)

## 🚀 Quick Start

### Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment:**
   ```bash
   python3 -m venv venv
   ```

3. **Activate the virtual environment:**
   ```bash
   # On Linux/Mac:
   source venv/bin/activate
   
   # On Windows:
   venv\Scripts\activate
   ```

4. **Install dependencies:**
   ```bash
   pip install -r requirements.txt
   ```

5. **Run the server:**
   ```bash
   uvicorn main:app --reload --host 0.0.0.0 --port 8000
   ```

   The backend will be available at `http://localhost:8000`

### Frontend Setup

1. **Navigate to the frontend directory** (in a new terminal):
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   # Copy the example file
   cp .env.example .env.local
   ```

   The `.env.local` file should contain:
   ```env
   NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws
   NEXT_PUBLIC_API_URL=http://localhost:8000
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```

   The frontend will be available at `http://localhost:3000`

## 💻 Usage

1. **Start both servers:**
   - Backend: `uvicorn main:app --reload --port 8000` (in `backend/` directory)
   - Frontend: `npm run dev` (in `frontend/` directory)

2. **Open your browser** and navigate to `http://localhost:3000`

3. **Enter a username** and click "Join Chat"

4. **Test with multiple users:**
   - Open multiple browser tabs/windows
   - Enter different usernames in each tab
   - Send messages and watch them appear in real-time across all tabs

5. **Observe features:**
   - User count updates when users join/leave
   - Connection status indicator shows connection state
   - Messages appear with timestamps
   - Join/leave notifications appear for all users

## 📁 Project Structure

```
chat-app/
├── backend/
│   ├── main.py              # FastAPI application with WebSocket endpoint
│   ├── requirements.txt     # Python dependencies
│   └── .gitignore           # Git ignore rules
│
├── frontend/
│   ├── app/
│   │   ├── page.tsx         # Main chat page component
│   │   ├── layout.tsx       # Root layout with fonts
│   │   └── globals.css      # Global styles with Tailwind
│   ├── lib/
│   │   └── config.ts        # Environment variable configuration
│   ├── .env.example         # Environment variables template
│   ├── .env.local           # Local environment variables (gitignored)
│   ├── package.json         # Node.js dependencies
│   ├── tsconfig.json        # TypeScript configuration
│   ├── next.config.ts       # Next.js configuration
│   ├── postcss.config.mjs   # PostCSS configuration
│   └── .gitignore           # Git ignore rules
│
└── README.md                # This file
```

## 🔌 API Documentation

### WebSocket Endpoint

- **URL**: `ws://localhost:8000/ws`
- **Protocol**: WebSocket
- **Message Format**: JSON

#### Client → Server Messages

**Join Request:**
```json
{
  "type": "join",
  "username": "your_username"
}
```

**Send Message:**
```json
{
  "type": "message",
  "message": "Hello everyone!"
}
```

#### Server → Client Messages

**System Message:**
```json
{
  "type": "system",
  "message": "Welcome to the chat, username!",
  "timestamp": "2024-01-01T12:00:00"
}
```

**Chat Message:**
```json
{
  "type": "message",
  "username": "sender_username",
  "message": "Hello everyone!",
  "timestamp": "2024-01-01T12:00:00"
}
```

**User Joined:**
```json
{
  "type": "join",
  "username": "new_user",
  "message": "new_user joined the chat",
  "timestamp": "2024-01-01T12:00:00"
}
```

**User Left:**
```json
{
  "type": "leave",
  "username": "leaving_user",
  "message": "leaving_user left the chat",
  "timestamp": "2024-01-01T12:00:00"
}
```

**User List Update:**
```json
{
  "type": "users",
  "users": ["user1", "user2", "user3"],
  "timestamp": "2024-01-01T12:00:00"
}
```

**Error:**
```json
{
  "type": "error",
  "message": "Error description"
}
```

### REST Endpoints

- **`GET /`** - API status
  ```json
  {
    "message": "Chat API is running",
    "status": "ok"
  }
  ```

- **`GET /health`** - Health check with connection count
  ```json
  {
    "status": "healthy",
    "connections": 3
  }
  ```

## ⚙️ Environment Variables

### Frontend Environment Variables

The frontend uses environment variables prefixed with `NEXT_PUBLIC_` to make them accessible in the browser.

**`.env.local`** (create this file from `.env.example`):
```env
# WebSocket Server URL
# For local development: ws://localhost:8000/ws
# For production: wss://your-domain.com/ws
NEXT_PUBLIC_WS_URL=ws://localhost:8000/ws

# Backend API URL (for future REST endpoints)
NEXT_PUBLIC_API_URL=http://localhost:8000
```


## 📄 License

This project is created for demonstration purposes and technical interview assessment.

---

**Happy Chatting! 💬**
