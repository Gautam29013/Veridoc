from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.api.auth_routes import router as auth_router
from backend.models.database import connect_to_mongo, close_mongo_connection
from backend.config import API_PORT, API_HOST

app = FastAPI(title="Veridoc API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("startup")
async def startup_db_client():
    await connect_to_mongo()

@app.on_event("shutdown")
async def shutdown_db_client():
    await close_mongo_connection()

# Include routers
app.include_router(auth_router)

@app.get("/")
async def root():
    return {"message": "Welcome to Veridoc API"}
