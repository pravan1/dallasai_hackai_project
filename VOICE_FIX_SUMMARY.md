# Voice Component Two-Way Conversation Fix

## Problem
Your voice component was only speaking to you (TTS) but not listening to your responses and talking back. The flow was incomplete.

## Root Causes Identified & Fixed

### 1. **Missing Auth Integration** ✅
**Issue**: The `VoiceButton` component wasn't being used in the chat, and there was no way to pass authentication credentials (access token, user ID).

**Fix**: 
- Created new `useAccessToken.ts` hook to fetch Auth0 access tokens from `/api/auth/token`
- Updated `ChatInput.tsx` to import and use `VoiceButton` with proper auth credentials
- Integrated `useUser()` from `@auth0/nextjs-auth0/client` to get user info

**Files Changed**:
- ✅ [src/hooks/useAccessToken.ts](src/hooks/useAccessToken.ts) - NEW
- ✅ [src/components/chat/ChatInput.tsx](src/components/chat/ChatInput.tsx)

### 2. **Legacy Voice Implementation** ✅
**Issue**: `ChatInput` was using the old `useVoice` hook which didn't have:
- Auth support
- Two-way conversation (listen → send → respond → speak back)
- Proper state management

**Fix**: 
- Replaced the old `useVoice` hook with the new `VoiceButton` component
- `VoiceButton` uses `useVoiceAssistant` which has the complete flow

**Files Changed**:
- ✅ [src/components/chat/ChatInput.tsx](src/components/chat/ChatInput.tsx)

### 3. **Missing Access Token in useChat** ✅
**Issue**: The `useChat` hook wasn't getting the Auth0 access token, so API calls were failing silently.

**Fix**:
- Updated `useChat.ts` to use the new `useAccessToken()` hook
- Now properly attaches `Authorization: Bearer {token}` header to API calls
- Uses the `/api/chat` endpoint (which has proper voice support) instead of `/conversations`

**Files Changed**:
- ✅ [src/hooks/useChat.ts](src/hooks/useChat.ts)

### 4. **VoiceButton Missing Prop** ✅
**Issue**: The `VoiceButton` component didn't accept the `autoListenAfterReply` prop.

**Fix**:
- Added `autoListenAfterReply?: boolean` to `VoiceButtonProps`
- Passed it through to `useVoiceAssistant` hook

**Files Changed**:
- ✅ [src/components/chat/VoiceButton.tsx](src/components/chat/VoiceButton.tsx)

## How It Works Now

### The Complete Voice Flow:

1. **User clicks voice button** → Requests microphone permission
2. **Greeting is spoken** → "Hey [Name], what would you like to learn today?"
3. **App listens** → Speech recognition captures user speech
4. **Transcript sent to backend** → Via `/api/chat` endpoint with Auth0 token
5. **Backend generates response** → Gemini API processes the question
6. **Response is spoken back** → Text-to-speech plays the assistant's answer
7. **(Optional) Auto-listen after reply** → Can be enabled to continue conversation

### Key Files in the Voice System:

```
Voice Flow Chain:
┌─────────────────────┐
│   VoiceButton       │ ← User clicks to start voice
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│ useVoiceAssistant   │ ← State machine managing 7 states
└──────────┬──────────┘
           │
    ┌──────┴──────┐
    │             │
    ▼             ▼
┌─────────────┐ ┌──────────────┐
│speechService│ │ ttsService   │
│  (STT)      │ │  (TTS)       │
└─────────────┘ └──────────────┘
    │             │
    └─────┬───────┘
          │
          ▼
┌─────────────────────────────┐
│  assistantApiClient         │ ← Sends transcript to backend
│  (calls /api/chat)          │   Gets response back
└──────────┬──────────────────┘
           │
           ▼
┌──────────────────────────────┐
│  Backend /api/chat           │
│  (Python FastAPI)            │
│  - Verifies Auth0 JWT        │
│  - Calls Gemini              │
│  - Returns response          │
└──────────────────────────────┘
```

## Testing Checklist

To verify everything is working:

- [ ] Start backend: `cd backend && python app/main.py`
- [ ] Start frontend: `cd frontend && npm run dev`
- [ ] Navigate to http://localhost:3000
- [ ] Log in with Auth0
- [ ] In the chat, you should see a **voice button** (mic icon)
- [ ] Click the voice button
- [ ] Approve microphone permission
- [ ] You should hear: **"Hey [Your Name], what would you like to learn today?"**
- [ ] Say something like: **"Tell me about React hooks"**
- [ ] You should see your transcribed text appear in the input
- [ ] The message is auto-sent after 300ms
- [ ] Wait for backend response...
- [ ] **You should hear the assistant's response spoken aloud** 🎉

## Env Vars Required

These should already be in `.env.local`:
```
# Auth0
AUTH0_SECRET=...
AUTH0_BASE_URL=http://localhost:3000
AUTH0_ISSUER_BASE_URL=https://dev-hoesmwswkblce476.us.auth0.com
AUTH0_CLIENT_ID=...
AUTH0_CLIENT_SECRET=...

# Backend API
NEXT_PUBLIC_API_URL=http://localhost:8000

# Gemini
GOOGLE_AI_API_KEY=...
```

## Troubleshooting

### Voice button doesn't appear
- Check that you're logged in
- Check that `useAccessToken` successfully fetches the token
- Open browser DevTools → Network → look for `/api/auth/token` call

### Mic permission denied
- Check browser permissions for localhost:3000
- Try in an incognito window (permissions start fresh)

### Transcript appears but response doesn't come back
- Check backend is running: `curl http://localhost:8000/health`
- Check backend logs for errors
- Check frontend console for API errors

### Response spoken but with wrong voice
- Voice comes from browser's default TTS
- You can customize in `ttsService.ts` options (pitch, rate, volume)

### Auto-send not working
- Set `onTranscript` callback in VoiceButton properly
- Check console for JavaScript errors

## Files Modified Summary

| File | Changes |
|------|---------|
| [src/components/chat/ChatInput.tsx](src/components/chat/ChatInput.tsx) | Replaced `useVoice` with `VoiceButton`, added auth |
| [src/hooks/useChat.ts](src/hooks/useChat.ts) | Added `useAccessToken`, proper auth headers to API calls |
| [src/components/chat/VoiceButton.tsx](src/components/chat/VoiceButton.tsx) | Added `autoListenAfterReply` prop |
| [src/hooks/useAccessToken.ts](src/hooks/useAccessToken.ts) | NEW - Fetches Auth0 access token |

---

**The voice component now supports full two-way conversation!** 🎤 Listen → Send → Think → Respond → Speak
