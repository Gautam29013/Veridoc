# Use python 3.12 slim image according to pyproject.toml requirements
FROM python:3.12-slim

# Install uv from the official image
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Set the working directory
WORKDIR /app

# Optimization: Enable bytecode compilation for faster app startups
ENV UV_COMPILE_BYTECODE=1
# Optimization: Ensure uv copies files instead of hardlinking, which is safer in Docker
ENV UV_LINK_MODE=copy

# Copy the workspace definitions first to leverage Docker's layer caching
COPY pyproject.toml uv.lock ./
# Copy the workspace members' pyproject files
COPY backend/pyproject.toml backend/pyproject.toml

# Install dependencies before copying the rest of the code. 
# --no-install-project ensures we only download and install the third-party deps.
RUN uv sync --frozen --no-install-project

# Now copy the rest of the application code
COPY . .

# Final sync to install the project itself
RUN uv sync --frozen

# Expose the API port
EXPOSE 8000

# Set the entrypoint to run the backend
# Please ensure you run your docker build from the root of the project:
# docker build -f docker/Dockerfile -t veridoc-backend .
CMD ["uv", "run", "uvicorn", "backend.app:app", "--host", "0.0.0.0", "--port", "8000"]