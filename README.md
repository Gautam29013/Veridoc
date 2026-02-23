# Veridoc - AI-Powered Document Analysis

## Project Structure
- **/backend**: FastAPI server with MongoDB integration.
- **/frontend**: React + Vite + Shadcn UI + Tailwind CSS.

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
