from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from typing import List, Dict
import json
from datetime import datetime

app = FastAPI()

# CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Connection manager to handle multiple WebSocket connections
class ConnectionManager:
    def __init__(self):
        # Dictionary to store active connections: {websocket: username}
        self.active_connections: Dict[WebSocket, str] = {}
    
    async def connect(self, websocket: WebSocket, username: str):
        # Note: websocket.accept() should be called before this method
        self.active_connections[websocket] = username
    
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
                    # Handle disconnected clients
                    pass

manager = ConnectionManager()

@app.get("/")
async def root():
    return {"message": "Chat API is running", "status": "ok"}

@app.get("/health")
async def health():
    return {"status": "healthy", "connections": len(manager.active_connections)}

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Accept the WebSocket connection first
    await websocket.accept()
    
    username = None
    try:
        # Wait for initial message with username
        data = await websocket.receive_text()
        message_data = json.loads(data)
        
        if message_data.get("type") == "join" and message_data.get("username"):
            username = message_data["username"].strip()
            
            if not username:
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Username cannot be empty"
                }))
                await websocket.close()
                return
            
            # Check if username is already taken
            if username in manager.active_connections.values():
                await websocket.send_text(json.dumps({
                    "type": "error",
                    "message": "Username already taken"
                }))
                await websocket.close()
                return
            
            # Add to active connections (accept was already called)
            manager.active_connections[websocket] = username
            
            # Get updated user list
            users = list(manager.active_connections.values())
            
            # Notify all other users that someone joined
            await manager.broadcast({
                "type": "join",
                "username": username,
                "message": f"{username} joined the chat",
                "timestamp": datetime.now().isoformat()
            }, exclude_websocket=websocket)
            
            # Broadcast updated user list to ALL users (including the new one)
            await manager.broadcast({
                "type": "users",
                "users": users,
                "timestamp": datetime.now().isoformat()
            })
            
            # Send welcome message to the new user
            await manager.send_personal_message({
                "type": "system",
                "message": f"Welcome to the chat, {username}!",
                "timestamp": datetime.now().isoformat()
            }, websocket)
            
        else:
            await websocket.send_text(json.dumps({
                "type": "error",
                "message": "Invalid initial message. Please send username."
            }))
            await websocket.close()
            return
        
        # Listen for messages
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if message_data.get("type") == "message":
                message_text = message_data.get("message", "").strip()
                
                if message_text:
                    # Broadcast message to all users
                    await manager.broadcast({
                        "type": "message",
                        "username": username,
                        "message": message_text,
                        "timestamp": datetime.now().isoformat()
                    })
    
    except WebSocketDisconnect:
        # User disconnected
        if username:
            disconnected_username = manager.disconnect(websocket)
            if disconnected_username:
                # Get updated user list after disconnect
                users = list(manager.active_connections.values())
                
                # Notify others that user left
                await manager.broadcast({
                    "type": "leave",
                    "username": disconnected_username,
                    "message": f"{disconnected_username} left the chat",
                    "timestamp": datetime.now().isoformat()
                })
                
                # Broadcast updated user list to all remaining users
                await manager.broadcast({
                    "type": "users",
                    "users": users,
                    "timestamp": datetime.now().isoformat()
                })
    except Exception as e:
        print(f"Error: {e}")
        if websocket in manager.active_connections:
            manager.disconnect(websocket)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

