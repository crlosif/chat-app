'use client'

import { useState, useEffect, useRef } from 'react'
import { config } from '@/lib/config'

interface Message {
  type: string
  username?: string
  message: string
  timestamp?: string
  users?: string[]
}

export default function Home() {
  const [username, setUsername] = useState<string>('')
  const [usernameSubmitted, setUsernameSubmitted] = useState<boolean>(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [inputMessage, setInputMessage] = useState<string>('')
  const [connectedUsers, setConnectedUsers] = useState<string[]>([])
  const [isConnected, setIsConnected] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  
  const wsRef = useRef<WebSocket | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleUsernameSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedUsername = username.trim()
    
    if (!trimmedUsername) {
      setError('Username cannot be empty')
      return
    }

    // Connect to WebSocket using configuration from environment variable
    const ws = new WebSocket(config.wsUrl)
    wsRef.current = ws

    ws.onopen = () => {
      // Send username to server
      ws.send(JSON.stringify({
        type: 'join',
        username: trimmedUsername
      }))
    }

    ws.onmessage = (event) => {
      const data: Message = JSON.parse(event.data)
      
      if (data.type === 'error') {
        setError(data.message)
        ws.close()
        return
      }

      if (data.type === 'system') {
        setIsConnected(true)
        setError(null)
        setUsernameSubmitted(true)
      }

      if (data.type === 'users') {
        setConnectedUsers(data.users || [])
      }

      if (data.type === 'message' || data.type === 'join' || data.type === 'leave' || data.type === 'system') {
        setMessages(prev => [...prev, data])
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setError('Failed to connect to server. Make sure the backend is running.')
    }

    ws.onclose = () => {
      setIsConnected(false)
      if (usernameSubmitted) {
        setError('Connection lost. Please refresh the page.')
      }
    }
  }

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmedMessage = inputMessage.trim()
    
    if (!trimmedMessage || !wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      return
    }

    wsRef.current.send(JSON.stringify({
      type: 'message',
      message: trimmedMessage
    }))

    setInputMessage('')
  }

  const formatTime = (timestamp?: string) => {
    if (!timestamp) return ''
    try {
      const date = new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    } catch {
      return ''
    }
  }

  // Cleanup WebSocket on unmount
  useEffect(() => {
    return () => {
      if (wsRef.current) {
        wsRef.current.close()
      }
    }
  }, [])

  if (!usernameSubmitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl w-full max-w-md">
          <h1 className="text-3xl font-bold text-center mb-6 text-gray-800 dark:text-white">
            Welcome to Chat
          </h1>
          <form onSubmit={handleUsernameSubmit} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Enter your username
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Your username"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
                autoFocus
              />
            </div>
            {error && (
              <div className="text-red-600 dark:text-red-400 text-sm">{error}</div>
            )}
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition duration-200"
            >
              Join Chat
            </button>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-md p-4">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-white">
            Chat App
          </h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {isConnected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              <span className="font-semibold">{username}</span>
              {connectedUsers.length > 0 && (
                <span className="ml-2">
                  ({connectedUsers.length} {connectedUsers.length === 1 ? 'user' : 'users'})
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="max-w-4xl mx-auto space-y-4">
          {messages.map((msg, index) => {
            if (msg.type === 'system') {
              return (
                <div key={index} className="text-center text-gray-500 dark:text-gray-400 text-sm italic">
                  {msg.message}
                </div>
              )
            }

            if (msg.type === 'join' || msg.type === 'leave') {
              return (
                <div key={index} className="text-center text-gray-500 dark:text-gray-400 text-sm italic">
                  {msg.message}
                </div>
              )
            }

            if (msg.type === 'message') {
              const isOwnMessage = msg.username === username
              return (
                <div
                  key={index}
                  className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                      isOwnMessage
                        ? 'bg-blue-600 text-white'
                        : 'bg-white dark:bg-gray-700 text-gray-800 dark:text-white'
                    }`}
                  >
                    {!isOwnMessage && (
                      <div className="font-semibold text-sm mb-1">
                        {msg.username}
                      </div>
                    )}
                    <div className="text-sm">{msg.message}</div>
                    {msg.timestamp && (
                      <div className={`text-xs mt-1 ${isOwnMessage ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'}`}>
                        {formatTime(msg.timestamp)}
                      </div>
                    )}
                  </div>
                </div>
              )
            }

            return null
          })}
          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Input Area */}
      <div className="bg-white dark:bg-gray-800 shadow-lg p-4">
        <div className="max-w-4xl mx-auto">
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm mb-2">{error}</div>
          )}
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <input
              type="text"
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Type a message..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:border-gray-600 dark:text-white dark:placeholder-gray-400"
              disabled={!isConnected}
            />
            <button
              type="submit"
              disabled={!isConnected || !inputMessage.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed text-white font-semibold py-2 px-6 rounded-lg transition duration-200"
            >
              Send
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
