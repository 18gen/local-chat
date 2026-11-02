# local-chat

A hospital AI assistant: a Next.js frontend (`frontend/`) and a FastAPI
backend (`backend/`) that talks to the model.

## Backend

Python 3.12, FastAPI. Talks to any OpenAI-compatible model: the OpenAI API
while testing, a local server later. Only fictional data while testing with
the OpenAI API.

```bash
cd backend
python3 -m venv .venv
.venv/bin/pip install -r requirements-dev.txt
cp .env.example .env   # then paste the API key into LLM_API_KEY
.venv/bin/fastapi dev app/main.py   # http://127.0.0.1:8000
.venv/bin/pytest                    # tests, without calling the model
```

## Frontend

Next.js (App Router, TypeScript, Tailwind CSS). Requests to `/api` are
forwarded to the backend (`BACKEND_URL`, default `http://127.0.0.1:8000`).

```bash
cd frontend
npm install
npm run dev        # http://localhost:3000
```
