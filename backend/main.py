from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import json
from datetime import datetime

app = FastAPI()

# Connection manager to handle multiple WebSocket connections
class ConnectionManager:
    def __init__(self):
        # Dictionary to store active connections: {websocket: username}
        self.active_connections: Dict[WebSocket, str] = {}
    
    async def connect(self, websocket: WebSocket, username: str):
        await websocket.accept()
        
        await self.broadcast({
            "type": "join",
            "username": username,
            "message": f"{username} joined the chat",
            "timestamp": datetime.now().isoformat()
        }, exclude_websocket=websocket)
    
    def disconnect(self, websocket: WebSocket):
        if websocket in self.active_connections:
            username = self.active_connections[websocket]
            del self.active_connections[websocket]
            return username
        return None
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        await websocket.send_text(json.dumps(message))
    
    async def broadcast(self, message: dict, exclude_websocket: WebSocket = None):
        message_json = json.dumps(message)
        for connection in self.active_connections:
            if connection != exclude_websocket:
                try:
                    await connection.send_text(message_json)
                except:
                    pass

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "Chat API is running", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy", "connections": len(manager.active_connections)}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

