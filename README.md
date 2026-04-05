# Veridoc - AI-Powered Document Analysis

## Project Structure
- **/backend**: FastAPI server with MongoDB integration.
- **/frontend**: React + Vite + Shadcn UI + Tailwind CSS.
- **/docker**: Dockerfiles and nginx config for containerized deployment.

## Run With Docker

1. Create the env files:
   ```bash
   cp .env.example .env
   cp backend/.env.example backend/.env
   ```
2. Update the placeholder values in `backend/.env` and `.env`.
3. Start the full stack:
   ```bash
   docker compose up --build
   ```

Services:
- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:8000`
- MongoDB: uses the `MONGODB_URL` already set in `backend/.env`

## Getting Started

### Backend Setup
1. Navigate to `/backend`.
2. Ensure you have `uv` installed.
3. Run the server:
   ```bash
   uv run python main.py
   ```
   The API will be available at `http://localhost:8000`.

### Frontend Setup
1. Navigate to `/frontend`.
2. Install dependencies:
   ```bash
   pnpm install
   ```
3. Run the development server:
   ```bash
   pnpm dev
   ```
   The frontend will be available at `http://localhost:5173`.

## Authentication
- Signup: `http://localhost:5173/signup`
- Login: `http://localhost:5173/login`
- Dashboard: `http://localhost:5173/` (Protected)
