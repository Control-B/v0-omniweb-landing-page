FROM python:3.11-slim

COPY --from=ghcr.io/astral-sh/uv:0.7.20 /uv /uvx /bin/

WORKDIR /app

ENV UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy \
    UV_PROJECT_ENVIRONMENT=/app/.venv \
    PATH="/app/.venv/bin:$PATH"

# Install dependencies first (cached layer)
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev

# Copy application code (after deps, so code changes don't bust the dep cache)
COPY . .

EXPOSE 8000
CMD ["python", "start.py"]
