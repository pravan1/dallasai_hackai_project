# LearnFlow — Implementation Specification

This document is the authoritative spec for auth, voice, gesture, and AI integration.
Follow it when adding features or swapping providers.

---

## 1. API Choices and Rationale

| Layer | Choice | Why |
|---|---|---|
| Auth | Auth0 (`@auth0/nextjs-auth0`) | Handles OAuth, session, JWTs, and user metadata out of the box. No rolling your own token refresh. |
| Frontend | Next.js 14 + TypeScript | App Router, RSC, and built-in API routes cover most edge-case needs without extra infra. |
| Backend | FastAPI (Python) | Async-first, auto-generated OpenAPI docs, Pydantic validation. Pairs naturally with pgvector and Gemini SDK. |
| LLM / Multimodal | Gemini API (`google-generativeai`) | Gemini 2.0 Flash supports text, images, and audio in one call. Also provides text-embedding-004 for pgvector ingestion. |
| Gesture Detection | MediaPipe Hand Landmarker Web (`@mediapipe/tasks-vision`) | Browser-native WASM, no server round-trip, GPU-accelerated. Gives per-frame landmark coordinates. |
| STT (MVP) | Web Speech API (`SpeechRecognition`) | Zero dependencies, works offline in Chrome/Edge. Wrapped behind `speechService` so it can be replaced. |
| STT (Production) | Deepgram / AssemblyAI | Better accuracy, background noise robustness, streaming. Swap only inside `speechService`. |
| TTS (MVP) | Browser `speechSynthesis` | Zero dependencies. Wrapped behind `ttsService`. |
| TTS (Upgrade) | Gemini TTS / ElevenLabs | Higher naturalness. Swap only inside `ttsService`. |
| Vector DB | PostgreSQL + pgvector | Co-located with user/session data, no extra infra. Used for RAG over uploaded sources. |
| Primary DB | PostgreSQL | User profiles, learning history, implicit signals, recommendations, practice attempts. |

---

## 2. Backend Service Boundaries (FastAPI)

Each domain is its own router. No cross-domain imports — services talk through the DB or explicit function calls.

```
backend/
├── app/
│   ├── main.py                   # FastAPI app, CORS, Auth0 middleware
│   ├── routers/
│   │   ├── chat.py               # POST /chat, streaming response
│   │   ├── recommendations.py    # GET/POST /recommendations
│   │   ├── sources.py            # POST /sources (upload + embed)
│   │   ├── profile.py            # GET/PATCH /profile/{user_id}
│   │   └── practice.py           # GET/POST /practice
│   ├── services/
│   │   ├── gemini_service.py     # Wraps google-generativeai, chat + embed
│   │   ├── vector_service.py     # pgvector search, chunk storage
│   │   ├── recommendation_service.py
│   │   └── auth_service.py       # Auth0 JWT verification
│   ├── models/
│   │   ├── user.py
│   │   ├── conversation.py
│   │   ├── source.py
│   │   └── recommendation.py
│   ├── db/
│   │   ├── session.py            # SQLAlchemy async engine
│   │   └── migrations/           # Alembic migrations
│   └── core/
│       ├── config.py             # Settings from env
│       └── security.py           # Auth0 token decode
```

### Auth0 JWT Verification (FastAPI)

```python
# app/core/security.py
from jose import jwt
import httpx

AUTH0_DOMAIN = settings.AUTH0_DOMAIN
AUTH0_AUDIENCE = settings.AUTH0_AUDIENCE

async def verify_token(token: str) -> dict:
    jwks_url = f"https://{AUTH0_DOMAIN}/.well-known/jwks.json"
    async with httpx.AsyncClient() as client:
        jwks = (await client.get(jwks_url)).json()
    payload = jwt.decode(
        token,
        jwks,
        algorithms=["RS256"],
        audience=AUTH0_AUDIENCE,
    )
    return payload  # contains sub (user id), email, etc.
```

### Gemini Chat Endpoint

```python
# app/routers/chat.py
from fastapi import APIRouter, Depends
from app.services.gemini_service import GeminiService
from app.core.security import verify_token

router = APIRouter(prefix="/api/chat", tags=["chat"])

@router.post("")
async def chat(
    payload: ChatRequest,
    user: dict = Depends(verify_token),
    gemini: GeminiService = Depends(),
):
    context = await vector_service.retrieve(payload.message, user["sub"])
    response = await gemini.chat(
        message=payload.message,
        context=context,
        history=payload.history,
    )
    return {"content": response.text, "sources": context.sources}
```

---

## 3. Frontend Hook Structure

The key principle: **UI components never call browser APIs directly**.

```
UI Component
    │
    ▼
useVoiceAssistant()   ←── manages state machine
    │         │
    ▼         ▼
speechService   ttsService
(STT)           (TTS)
    │
    ▼
assistantApiClient   ←── calls FastAPI backend
```

```
UI Component
    │
    ▼
useGestureNavigation()   ←── manages MediaPipe + keyboard
    │
    ▼
MediaPipe HandLandmarker (loaded dynamically, no SSR)
+ keyboard fallback (ArrowLeft / ArrowRight)
```

### File locations

```
frontend/src/
├── services/
│   ├── speechService.ts        # STT abstraction (Web Speech API now, Deepgram later)
│   ├── ttsService.ts           # TTS abstraction (speechSynthesis now, Gemini TTS later)
│   └── assistantApiClient.ts   # Typed API calls to FastAPI backend
├── hooks/
│   ├── useVoiceAssistant.ts    # Voice state machine
│   ├── useGestureNavigation.ts # Gesture + keyboard navigation
│   ├── useChat.ts              # Message list, send, optimistic update
│   ├── useVoice.ts             # (legacy — replaced by useVoiceAssistant)
│   └── useGesture.ts           # (legacy — replaced by useGestureNavigation)
├── components/
│   ├── chat/
│   │   ├── VoiceButton.tsx     # Mic button, consumes useVoiceAssistant
│   │   ├── ChatInput.tsx
│   │   └── VoiceRecorder.tsx   # Live transcript display
│   └── gesture/
│       └── GestureOverlay.tsx  # Webcam preview + toast feedback
└── lib/
    └── auth0.ts                # Auth0 client helpers
```

---

## 4. Voice Button State Machine

```
                        [click]
     idle ──────────────────────────► requesting-permission
      ▲                                       │
      │                           mic granted │  mic denied
      │                                       ▼         ▼
      │                                  greeting     error
      │                                       │
      │                        greeting ends  │
      │                                       ▼
      │                                  listening ◄─── retry
      │                                       │
      │                          final result │  no speech / error
      │                                       ▼         ▼
      │                                  processing   error
      │                                       │
      │                         API responds  │
      │                                       ▼
      │                                  speaking
      │                                       │
      └───────────────────────────────────────┘
                          done speaking

[cancel] at any state → idle
```

### States exposed by `useVoiceAssistant`

| State | What's happening |
|---|---|
| `idle` | Button inactive, ready to start |
| `requesting-permission` | Checking/requesting microphone permission |
| `greeting` | TTS is playing the greeting |
| `listening` | SpeechRecognition is active, showing interim transcript |
| `processing` | Transcript sent to API, waiting for response |
| `speaking` | TTS is playing the AI response |
| `error` | Something failed — errorMessage contains the reason |

---

## 5. Example Code References

All live code is in the repo. This section describes each file's purpose.

### Auth0 — `frontend/src/lib/auth0.ts`
Re-exports the `@auth0/nextjs-auth0` client configured from env vars.
Use `getSession()` in Server Components and `useUser()` in Client Components.

### Auth0 Route — `frontend/src/app/api/auth/[auth0]/route.ts`
Single catch-all route that handles `/api/auth/login`, `/api/auth/logout`,
`/api/auth/callback`, and `/api/auth/me` automatically.

### `speechService` — `frontend/src/services/speechService.ts`
Wraps `window.SpeechRecognition` behind a stable interface with `start(options)`,
`stop()`, and `abort()`. Swap this file alone to move to Deepgram streaming.

### `ttsService` — `frontend/src/services/ttsService.ts`
Wraps `window.speechSynthesis` and returns a `Promise` that resolves when speech
ends. Swap this file to move to Gemini TTS or ElevenLabs.

### `assistantApiClient` — `frontend/src/services/assistantApiClient.ts`
Typed `fetch` wrappers for every FastAPI endpoint. Attaches Auth0 access token
to `Authorization: Bearer` header automatically.

### `useVoiceAssistant` — `frontend/src/hooks/useVoiceAssistant.ts`
Full state machine (useReducer) driving the voice button flow described above.
Calls `speechService`, `ttsService`, and `assistantApiClient` — never raw APIs.

### `useGestureNavigation` — `frontend/src/hooks/useGestureNavigation.ts`
Loads MediaPipe `HandLandmarker` dynamically (no SSR). Tracks wrist X position
across frames to detect left/right swipes. Keyboard fallback runs in parallel.

### `VoiceButton` — `frontend/src/components/chat/VoiceButton.tsx`
Mic button with 7 visual states driven entirely by `useVoiceAssistant`. Shows
live interim transcript and error/retry UI.

---

## 6. Full File/Folder Structure

```
learnflow/
├── IMPLEMENTATION.md
├── README.md
├── pnpm-workspace.yaml
│
├── frontend/                           # Next.js 14 App Router
│   ├── .env.example
│   ├── next.config.js
│   ├── tailwind.config.ts
│   └── src/
│       ├── app/
│       │   ├── layout.tsx              # Auth0UserProvider wrapper
│       │   ├── page.tsx                # Landing / redirect
│       │   ├── api/
│       │   │   └── auth/
│       │   │       └── [auth0]/
│       │   │           └── route.ts    # Auth0 catch-all handler
│       │   └── (dashboard)/
│       │       ├── layout.tsx
│       │       └── learn/
│       │           └── page.tsx
│       ├── components/
│       │   ├── chat/
│       │   │   ├── ChatContainer.tsx
│       │   │   ├── ChatInput.tsx
│       │   │   ├── MessageBubble.tsx
│       │   │   ├── MessageList.tsx
│       │   │   ├── VoiceButton.tsx     # NEW — replaces raw mic logic
│       │   │   └── VoiceRecorder.tsx
│       │   ├── gesture/
│       │   │   └── GestureOverlay.tsx
│       │   ├── layout/
│       │   │   ├── AppShell.tsx
│       │   │   ├── CenterPanel.tsx
│       │   │   ├── LeftPanel.tsx
│       │   │   └── RightPanel.tsx
│       │   └── ui/                     # shadcn/ui primitives
│       ├── hooks/
│       │   ├── useVoiceAssistant.ts    # NEW — voice state machine
│       │   ├── useGestureNavigation.ts # NEW — MediaPipe + keyboard
│       │   ├── useChat.ts
│       │   ├── useVoice.ts             # legacy (kept for reference)
│       │   └── useGesture.ts           # legacy (kept for reference)
│       ├── services/
│       │   ├── speechService.ts        # NEW — STT abstraction
│       │   ├── ttsService.ts           # NEW — TTS abstraction
│       │   └── assistantApiClient.ts   # NEW — API client
│       ├── lib/
│       │   ├── auth0.ts                # NEW — Auth0 helpers
│       │   └── utils.ts
│       └── types/
│           └── index.ts
│
└── backend/                            # FastAPI (Python) — target architecture
    ├── .env.example
    ├── requirements.txt
    ├── pyproject.toml
    └── app/
        ├── main.py
        ├── core/
        │   ├── config.py
        │   └── security.py
        ├── routers/
        │   ├── chat.py
        │   ├── recommendations.py
        │   ├── sources.py
        │   ├── profile.py
        │   └── practice.py
        ├── services/
        │   ├── gemini_service.py
        │   ├── vector_service.py
        │   └── recommendation_service.py
        ├── models/
        │   └── *.py                    # SQLAlchemy models
        └── db/
            ├── session.py
            └── migrations/
```

---

## 7. MVP-First Implementation Order

Work in this order. Each step is independently shippable.

### Phase 1 — Auth Foundation
1. Install `@auth0/nextjs-auth0`
2. Add Auth0 env vars (see `.env.example`)
3. Create `src/app/api/auth/[auth0]/route.ts`
4. Wrap root `layout.tsx` with `UserProvider`
5. Gate the dashboard route with `withPageAuthRequired` or `getSession()` check

### Phase 2 — Voice Services (no UI yet)
6. Create `speechService.ts` — Web Speech API wrapper
7. Create `ttsService.ts` — speechSynthesis wrapper
8. Create `assistantApiClient.ts` — fetch wrappers with auth token
9. Create `useVoiceAssistant.ts` — state machine, wires the three services together
10. Manual test: call `activate()` in browser console, confirm greeting plays

### Phase 3 — Voice Button UI
11. Create `VoiceButton.tsx` using `useVoiceAssistant`
12. Integrate into `ChatInput.tsx` (replace existing raw mic button)
13. Add settings toggles: voice replies on/off, auto-listen after greeting on/off

### Phase 4 — Gesture Navigation
14. `npm install @mediapipe/tasks-vision`
15. Create `useGestureNavigation.ts` with keyboard fallback first (no camera yet)
16. Test `ArrowLeft` / `ArrowRight` triggers `onBack` / `onNext`
17. Add MediaPipe camera path behind the `enabled` flag
18. Update `GestureOverlay.tsx` to consume `useGestureNavigation`

### Phase 5 — Backend FastAPI Migration (if starting from Express)
19. Scaffold FastAPI app with Pydantic settings
20. Port Auth0 JWT verification to `core/security.py`
21. Port Gemini service to `services/gemini_service.py`
22. Add pgvector RAG to chat endpoint
23. Update `assistantApiClient.ts` base URL to point at FastAPI

### Phase 6 — Production Speech Upgrade (post-MVP)
24. Add Deepgram WebSocket streaming inside `speechService.ts` behind a flag
25. Add Gemini TTS inside `ttsService.ts` behind a flag
26. Expose toggle in user settings

---

## Settings Schema

Voice and gesture toggles live in the user's profile (stored in PostgreSQL).

```typescript
interface UserSettings {
  voiceRepliesEnabled: boolean       // default: true
  autoListenAfterGreeting: boolean   // default: true
  gestureNavigationEnabled: boolean  // default: false
  preferredSTTProvider: 'web-speech' | 'deepgram'  // default: 'web-speech'
  preferredTTSProvider: 'web-speech' | 'gemini'    // default: 'web-speech'
}
```

---

## Environment Variables

### Frontend (`frontend/.env.local`)
```bash
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:8000

# Auth0
AUTH0_SECRET=                        # openssl rand -hex 32
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://YOUR_DOMAIN.auth0.com
AUTH0_CLIENT_ID=
AUTH0_CLIENT_SECRET=
AUTH0_AUDIENCE=                      # your FastAPI API identifier in Auth0

# Optional analytics
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_SENTRY_DSN=
```

### Backend (`backend/.env`)
```bash
NODE_ENV=development
PORT=8000
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/learnflow

# Auth0
AUTH0_DOMAIN=YOUR_DOMAIN.auth0.com
AUTH0_AUDIENCE=                      # matches frontend AUTH0_AUDIENCE

# Gemini
GOOGLE_AI_API_KEY=

# Optional production STT/TTS
DEEPGRAM_API_KEY=
ELEVENLABS_API_KEY=
```
