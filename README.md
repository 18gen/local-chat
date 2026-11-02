# local-chat

A hospital AI assistant: a Next.js frontend (`frontend/`) and a FastAPI
backend (`backend/`) that talks to the model.

## Backend

Python 3.12, FastAPI. Talks to any OpenAI-compatible model: the OpenAI API
or a local server such as Ollama. Only fictional data while testing with the
OpenAI API.

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
cp .env.example .env   # then paste the API key into LLM_API_KEY
.venv/bin/uvicorn app.main:app --reload   # http://127.0.0.1:8000
.venv/bin/pytest                    # tests, without calling the model
```

To use a local model with [Ollama](https://ollama.com), pull it
(`ollama pull qwen3.5:4b`), then set in `backend/.env`:

```bash
LLM_API_KEY=ollama
LLM_MODELS=["qwen3.5:4b"]
LLM_BASE_URL=http://127.0.0.1:11434/v1
LLM_REASONING_EFFORT=none
LLM_PRESENCE_PENALTY=1
LLM_MAX_TOKENS=1500
```

## Frontend

Next.js (App Router, TypeScript, Tailwind CSS). Requests to `/api` are
forwarded to the backend (`BACKEND_URL`, default `http://127.0.0.1:8000`).

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```
