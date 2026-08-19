import asyncio
import json
import logging
from typing import Dict, List, Set
import os

import psycopg2
import psycopg2.extensions
import psycopg2.extras
from fastapi import FastAPI, WebSocket, WebSocketDisconnect, Depends, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
import uvicorn
from datetime import datetime

# Setup logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="WebSocket Service", description="Real-time WebSocket service for skill gap simulator")

# Security
security = HTTPBearer()

# PostgreSQL connection for notifications
def get_db_connection():
    return psycopg2.connect(
        host=os.getenv("POSTGRES_HOST", "localhost"),
        port=int(os.getenv("POSTGRES_PORT", "5432")),
        database=os.getenv("POSTGRES_DB", "skillgap"),
        user=os.getenv("POSTGRES_USER", "skillgap_user"),
        password=os.getenv("POSTGRES_PASSWORD", "skillgap_pass")
    )

# Connection manager for WebSocket connections
class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: str):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)
        logger.info(f"User {user_id} connected. Total connections: {len(self.active_connections.get(user_id, []))}")

    def disconnect(self, websocket: WebSocket, user_id: str):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]
        logger.info(f"User {user_id} disconnected")

    async def send_personal_message(self, message: dict, user_id: str):
        if user_id in self.active_connections:
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Failed to send message to user {user_id}: {e}")
                    # Remove broken connection
                    self.active_connections[user_id].remove(connection)

    async def broadcast(self, message: dict):
        """Broadcast message to all connected users"""
        for user_id, connections in self.active_connections.items():
            for connection in connections:
                try:
                    await connection.send_text(json.dumps(message))
                except Exception as e:
                    logger.error(f"Failed to broadcast to user {user_id}: {e}")

manager = ConnectionManager()

# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: str):
    await manager.connect(websocket, user_id)
    try:
        while True:
            # Keep connection alive and handle incoming messages
            data = await websocket.receive_text()
            # Echo back for now - in real app, handle specific message types
            await websocket.send_text(f"Message received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        logger.error(f"WebSocket error for user {user_id}: {e}")
        manager.disconnect(websocket, user_id)

# PostgreSQL listener for database changes
async def listen_to_database_changes():
    """Listen for PostgreSQL notifications and broadcast to WebSocket clients"""
    conn = None
    try:
        conn = get_db_connection()
        conn.set_isolation_level(psycopg2.extensions.ISOLATION_LEVEL_AUTOCOMMIT)
        cursor = conn.cursor()

        # Listen to relevant channels
        cursor.execute("LISTEN skill_gap_updates;")
        cursor.execute("LISTEN roadmap_updates;")
        cursor.execute("LISTEN verification_updates;")
        cursor.execute("LISTEN profile_updates;")

        logger.info("Started listening to PostgreSQL notifications")

        while True:
            # Wait for notifications
            conn.poll()
            while conn.notifies:
                notify = conn.notifies.pop(0)
                channel = notify.channel
                payload = notify.payload

                logger.info(f"Received notification on channel {channel}: {payload}")

                # Parse payload and send to appropriate users
                try:
                    data = json.loads(payload)
                    user_id = data.get("user_id")
                    if user_id:
                        await manager.send_personal_message({
                            "type": channel.replace("_updates", ""),
                            "data": data,
                            "timestamp": datetime.now().isoformat()
                        }, user_id)
                except json.JSONDecodeError:
                    logger.error(f"Failed to parse notification payload: {payload}")
                except Exception as e:
                    logger.error(f"Error processing notification: {e}")

            await asyncio.sleep(0.1)  # Small delay to prevent busy loop

    except Exception as e:
        logger.error(f"Database listener error: {e}")
    finally:
        if conn:
            conn.close()

# Background task to start database listener
@app.on_event("startup")
async def startup_event():
    asyncio.create_task(listen_to_database_changes())
    logger.info("WebSocket service started")

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "service": "websocket", "timestamp": datetime.now().isoformat()}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8007, reload=True)