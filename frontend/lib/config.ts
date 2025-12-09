export const config = {
  wsUrl: process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:8000/ws',
  
  apiUrl: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
} as const

if (typeof window !== 'undefined') {
  if (!config.wsUrl) {
    console.warn('NEXT_PUBLIC_WS_URL is not set. Using default: ws://localhost:8000/ws')
  }
}

