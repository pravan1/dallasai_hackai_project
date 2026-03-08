# 🔧 Fixing the 401 Auth Errors

## The Problem
The backend was rejecting requests with **401 Unauthorized** errors because the Auth0 access tokens being sent didn't have the correct `audience` claim (`https://api.learnflow.ai`).

## The Fix

### What Changed:
1. **Updated `src/lib/auth0.ts`** - Added `audience` parameter to Auth0Client configuration
2. **Improved `src/app/api/auth/token/route.ts`** - Added error logging 
3. **Enhanced `src/hooks/useAccessToken.ts`** - Added console logging for debugging

### The Root Cause:
When Auth0Client gets an access token for the frontend, it wasn't requesting tokens with the correct `audience` claim. The backend (correctly) rejects tokens that don't match the expected audience `https://api.learnflow.ai`.

## How to Verify the Fix

### Step 1: Restart the Frontend
The frontend needs to be restarted to pick up the new Auth0 configuration:

```bash
# Kill the current frontend process (Ctrl+C in the terminal running "npm run dev")
# Then restart:
cd frontend
npm run dev
```

### Step 2: Clear Browser Cache (Important!)
Auth0 caches auth tokens in your browser. Clear them:

1. Open DevTools (F12)
2. Go to **Application** tab
3. Left sidebar → **Cookies** → Select `localhost:3000`
4. Delete all cookies
5. Refresh the page (F5)

Alternatively, restart in an **incognito/private window**:
- Opens with fresh auth state
- No cached tokens

### Step 3: Log Back In
1. Refresh http://localhost:3000
2. You'll be redirected to Auth0 login
3. Log in again with your credentials
4. This time, the token will be requested with the correct `audience`

### Step 4: Test Voice
Now try the voice component:
1. Click the voice button 🎤
2. You should **NOT** get a 401 error anymore
3. You should hear the greeting
4. Speak something
5. You should hear the response spoken back ✨

## How to Debug If It Still Doesn't Work

### Check 1: Verify Backend Auth Config
```bash
# Backend logs should show this when it starts:
# auth0_configured: true
curl http://localhost:8000/health
# Should output: {"status":"ok","gemini_configured":true,"auth0_configured":true}
```

### Check 2: Check the Token Being Sent
Open browser DevTools and run in Console:

```javascript
// Check what token is being sent
const response = await fetch('/api/auth/token')
const data = await response.json()
console.log('Token:', data.token)

// Decode the token to see its claims (use jwt.io if you want to see it pretty-printed)
// Or decode manually:
const parts = data.token.split('.')
const payload = JSON.parse(atob(parts[1]))
console.log('Token payload:', payload)
console.log('Token audience:', payload.aud)
// Should show: "aud": "https://api.learnflow.ai"
```

### Check 3: Monitor Backend Logs
The backend should log:
- Token verification happening
- If audience mismatch: `"Invalid token: ..."`
- If successful: voice message being processed

### Check 4: Check Network Requests
In DevTools Network tab:
1. Click voice button
2. Look for `/api/auth/token` request
   - Should return `{"token": "eyJ..."}`
3. Look for `/api/chat` request
   - Request should have header: `Authorization: Bearer eyJ...`
   - Response should **not** be 401 (should be 200)

## Key Changes Made

### Frontend - `src/lib/auth0.ts`
```typescript
// ADDED: audience parameter so tokens include the correct audience claim
authorizationParameters: {
  audience: 'https://api.learnflow.ai',
}
```

### Frontend - `src/app/api/auth/token/route.ts`
```typescript
// ADDED: Better error logging so we can see what went wrong
console.log('[auth/token] Token fetched successfully')
console.error('[auth/token] Error fetching token:', error)
```

### Frontend - `src/hooks/useAccessToken.ts`
```typescript
// ADDED: Console logging to track token fetching
console.log('[useAccessToken] Token received')
console.warn('[useAccessToken] No token in response')
```

## The Voice Flow Now Looks Like

```
1. User clicks voice button 🎤
   ↓
2. ChatInput.tsx requests token via useAccessToken
   ↓
3. Frontend calls /api/auth/token
   ↓
4. Auth0 returns access token WITH audience claim ✨
   ↓
5. Token is passed to VoiceButton via accessToken prop
   ↓
6. VoiceButton passes token to assistantApiClient
   ↓
7. assistantApiClient sends to /api/chat with Authorization header
   ↓
8. Backend validates token - NOW SUCCESSFUL! ✨
   ↓
9. Gemini processes the message
   ↓
10. Response comes back and is spoken to user 🔊
```

## Testing Checklist

- [ ] Frontend restarted
- [ ] Browser cache/cookies cleared
- [ ] Logged back in to Auth0
- [ ] Click voice button → No 401 error
- [ ] You hear the greeting
- [ ] You can speak
- [ ] You hear the response spoken back
- [ ] Backend logs show `/api/chat` succeeding (no 401)

## If You Still Get 401 Errors

The 401 means the backend is rejecting the token. Check:

1. **Is Auth0 configured on frontend?**
   ```bash
   cat frontend/.env.local | grep AUTH0_
   ```
   Should show: `AUTH0_ISSUER_BASE_URL`, `AUTH0_CLIENT_ID`, `AUTH0_CLIENT_SECRET`

2. **Is Auth0 configured on backend?**
   ```bash
   cat backend/.env | grep AUTH0_
   ```
   Should show: `AUTH0_DOMAIN` and `AUTH0_AUDIENCE`

3. **Do they match?**
   - Frontend: `AUTH0_ISSUER_BASE_URL=https://dev-hoesmwswkblce476.us.auth0.com`
   - Backend: `AUTH0_DOMAIN=dev-hoesmwswkblce476.us.auth0.com` ✓ (same, without https://)
   - Backend: `AUTH0_AUDIENCE=https://api.learnflow.ai` ← This is what the token needs

4. **Restart both frontend and backend** to pick up any `.env` changes

## Token Claims Explained

After the fix, your Auth0 token should have these claims:

```json
{
  "iss": "https://dev-hoesmwswkblce476.us.auth0.com/",    // Issuer
  "sub": "auth0|123456789",                                // User ID
  "aud": "https://api.learnflow.ai",                       // AUDIENCE ✨ (added by our fix!)
  "exp": 1678999999,                                       // Expiration time
  "iat": 1678899999                                        // Issued at time
}
```

The backend checks that `aud` (audience) matches `https://api.learnflow.ai`. If it doesn't match → 401 error.

## Quick Fix Summary

| Before | After |
|--------|-------|
| Auth0 tokens had no audience | Tokens now include `aud: "https://api.learnflow.ai"` |
| Backend rejects tokens | Backend accepts tokens with correct audience |
| 401 Unauthorized errors | Voice works! 🎉 |

---

**The fix is now deployed!** Restart your frontend and test again. The voice should work seamlessly now.
