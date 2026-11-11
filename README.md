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

`APP_ENV` says where the backend runs: `development` (the default), `demo`
(public, fictional data only), `staging` or `production`. The last two are
inside a hospital, where patient data is real, so the backend refuses to
start there unless the model is the hospital's own (`LLM_BASE_URL`, with its
host listed in `LLM_ALLOWED_HOSTS`) and sign-in and patient records are the
real ones. Neither exists yet, so no hospital setup can start for now.

To use a local model with [Ollama](https://ollama.com), pull it
(`ollama pull qwen3.5:4b`), then set in `backend/.env`:

```bash
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
npm test           # tests, for logic such as auto-delete
```

## Docker

The app as it runs on a server: an nginx proxy in front of the frontend and
the backend. The proxy sends `/api` straight to the backend.

```bash
cd deploy
cp .env.example .env   # the backend's settings; the example uses Ollama
docker compose up --build   # http://localhost:8080
```
