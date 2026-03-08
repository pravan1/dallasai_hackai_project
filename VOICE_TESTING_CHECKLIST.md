# Voice Component Testing Checklist

## Pre-Flight Checks ✈️

- [ ] Backend `/api/chat` endpoint is implemented and working
- [ ] `GOOGLE_AI_API_KEY` is set in backend `/.env`
- [ ] Auth0 credentials are configured in frontend `/.env.local`
- [ ] Both backend and frontend can start without errors

## Startup 🚀

- [ ] Terminal 1: `cd backend && python app/main.py`
  - Expected: FastAPI server starts on `http://localhost:8000`
  - Check: `curl http://localhost:8000/health` returns `{"status":"ok"}`

- [ ] Terminal 2: `cd frontend && npm run dev`
  - Expected: Next.js dev server starts on `http://localhost:3000`
  - Check: No console errors in terminal

## Login Flow 🔐

- [ ] Open `http://localhost:3000` in browser
- [ ] Redirected to Auth0 login page
- [ ] Can log in with Auth0 credentials
- [ ] Redirected back to app after login
- [ ] User name shows in header or nav (indicates successful auth)
- [ ] Browser DevTools Network tab shows successful `/api/auth/token` call
  - Should return `{"token": "eyJ..."}`

## Voice Component Visibility 👀

- [ ] Navigate to chat page
- [ ] You can see the text input area
- [ ] You can see a **🎤 microphone button** next to send button
  - If missing: Check browser console for errors
  - If missing: Check that `VoiceButton` is being rendered in `ChatInput`
  - If missing: Refresh page (might be a loading issue)

## Voice Permissions 🎙️

- [ ] Click the voice button
- [ ] Browser shows microphone permission prompt
- [ ] Grant microphone access
- [ ] Permission prompt disappears

## Greeting Audio 🔊

- [ ] After granting permission, you hear audio playing
- [ ] Audio says: "Hey [Your Name], what would you like to learn today?"
  - Your name should come from Auth0 profile
  - If wrong name: Check `given_name` field in Auth0 token
  - If no audio: Check browser volume, mute state, speaker settings

## Listening State 👂

- [ ] After greeting finishes, button shows "Listening..." status
- [ ] Button is green/active (visual feedback)
- [ ] Microphone should be active and ready to capture audio

## Speech Recognition 🗣️

- [ ] Speak clearly into microphone
  - Try: "Tell me about React"
  - Try: "What is machine learning"
  - Try: "Explain neural networks"

- [ ] You see text appearing in the input field
  - Text should show as you speak (interim results)
  - Text should finalize when you pause

- [ ] After you stop speaking:
  - Speech recognition stops automatically
  - Button shows "Processing..." status
  - Button is orange/loading (visual feedback)

## Backend Communication ➡️

- [ ] Check backend logs for incoming request
  - Should see `POST /api/chat` with your message
  - Should see Auth0 user ID being logged
  - Should see Gemini API call being made

- [ ] Backend processes your message
  - Should take 2-10 seconds depending on question complexity
  - Should not show errors in backend logs

## Response Spoken Back 🎵

- [ ] Frontend shows "Speaking..." status
- [ ] Button is purple/active (visual feedback)
- [ ] You hear audio playing - the assistant's response
  - Audio quality should be clear
  - Words should be articulate
  - Should match what you see in chat history

- [ ] Response appears in chat
  - Your message shows from you
  - Assistant's response shows from assistant
  - Both appear with correct sender labels

## Chat Message History 💬

- [ ] After response is spoken, button returns to idle state
- [ ] Chat shows both messages
- [ ] Messages are properly formatted
- [ ] You can scroll through conversation history

## Repeat Conversation 🔄

- [ ] Click voice button again
- [ ] Process repeats (greeting → listening → sending → response → speaking)
- [ ] Each turn works smoothly
- [ ] No errors accumulate over multiple turns

## Error Handling 🛡️

Try these to test error scenarios:

- [ ] Say nothing and let timeout occur
  - Expected: Error message "No speech was detected"
  - Button shows error state
  - Can retry by clicking button again

- [ ] Stop backend (kill process)
  - Click voice button
  - Let it try to send
  - Expected: Error message about failed to reach backend
  - Can see error in chat
  - Can retry when backend is restarted

- [ ] Remove/invalid auth token
  - Expected: Error message about authentication failure
  - Can see error in chat

## Performance ⚡

- [ ] Greeting audio plays within 1 second of clicking button
- [ ] Speech recognition is responsive (text appears while speaking)
- [ ] Response comes back within 10 seconds (depends on question)
- [ ] Audio plays smoothly without stuttering or gaps
- [ ] UI remains responsive (no freezing)

## Browser Console 🔍

- [ ] Open DevTools (F12)
- [ ] Go to Console tab
- [ ] No red errors should appear during normal operation
- [ ] Warnings are OK, but note any errors

## Network Tab 🌐

- [ ] Open DevTools Network tab
- [ ] Click voice button and go through flow
- [ ] Should see:
  1. `/api/auth/token` (GET) - returns access token
  2. `/api/chat` (POST) - sends your message
  3. (Optional) audio files if TTS uses external service
  
- [ ] All requests should return 2xx status (success)
- [ ] `/api/chat` response should contain assistant's message

---

## If Something Isn't Working

1. **No voice button appears:**
   - Check browser console (F12) for JavaScript errors
   - Check that page is fully loaded
   - Refresh page
   - Clear browser cache and reload

2. **Greeting doesn't play:**
   - Check browser sound settings
   - Check system sound is not muted
   - Check speaker output in system preferences
   - Try in Chrome (better TTS support)

3. **Can't speak / Mic not working:**
   - Check OS microphone permissions
   - Try another browser tab/window
   - Restart browser
   - Test microphone with another app

4. **Response doesn't come back:**
   - Check backend is running: `curl http://localhost:8000/health`
   - Check backend logs for errors
   - Check network tab in DevTools for `/api/chat` response
   - Check that Auth0 token is valid (check `/api/auth/token`)

5. **Response doesn't speak:**
   - Same as "Greeting doesn't play" above
   - Try different text (some words may have TTS issues)
   - Check browser TTS support (all modern browsers support it)

---

## Success Criteria ✅

You have successfully fixed the voice component when:

- [x] Click voice button → Greeting is spoken
- [x] Say something → Text appears in input
- [x] Message is sent to backend → Response comes back
- [x] Response is spoken to you → You hear the answer
- [x] Can repeat multiple times without errors
- [x] All error cases handled gracefully

---

## Quick Debug Commands

Backend health:
```bash
curl http://localhost:8000/health
```

Check frontend can reach backend:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:8000/api/chat \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"message": "hello", "userId": "test"}'
```

Check Auth0 token:
```bash
curl http://localhost:3000/api/auth/token
```

Check browser WebSpeechAPI support:
```javascript
// Run in browser console
console.log('Speech Recognition:', window.SpeechRecognition || window.webkitSpeechRecognition)
console.log('Speech Synthesis:', window.speechSynthesis)
```

---

**Questions?** Check the detailed docs:
- [VOICE_FIXED.md](VOICE_FIXED.md) - Quick start
- [VOICE_FIX_SUMMARY.md](VOICE_FIX_SUMMARY.md) - Technical details
