from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.auth_routes import router as auth_router
from models.database import connect_to_mongo, close_mongo_connection
from config import API_PORT, API_HOST, CORS_ALLOW_ORIGINS

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_to_mongo()
    yield
    await close_mongo_connection()

app = FastAPI(title="Veridoc API", lifespan=lifespan)

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ALLOW_ORIGINS,
    allow_origin_regex=r"^https?://(localhost|127\.0\.0\.1)(:\d+)?$",
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from api.query_routes import router as query_router
from api.document_routes import router as document_router

# Include routers
app.include_router(auth_router)
app.include_router(query_router)
app.include_router(document_router, prefix="/api/v1")

@app.get("/")
async def root():
    return {"message": "Welcome to Veridoc API"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app:app", host=API_HOST, port=API_PORT, reload=True)
