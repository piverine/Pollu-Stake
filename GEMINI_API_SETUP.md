# Gemini API Setup - Quick Guide

## Problem
You're getting a 403 Forbidden error from the chatbot API. This means the Gemini API key is not configured.

## Solution

### Step 1: Get Your Gemini API Key
1. Go to: https://aistudio.google.com/app/apikeys
2. Sign in with your Google account
3. Click **"Create API key"**
4. Select **"Create API key in new project"**
5. Copy the generated API key

### Step 2: Add to Environment Variables

**For Development:**

Create or edit `frontend/.env.local`:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

Replace `your_api_key_here` with the actual API key from Step 1.

**Example:**
```env
NEXT_PUBLIC_GEMINI_API_KEY=AIzaSyDxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### Step 3: Restart Frontend Server

```bash
# Stop the current server (Ctrl+C)
# Then restart it:
npm run dev
```

### Step 4: Test the Chatbot

1. Open your app in browser: http://localhost:3000
2. Click the chat icon (bottom-right corner)
3. Ask a question like: "What is staking?"
4. You should get a helpful response

---

## Troubleshooting

### Still getting 403 error?
- ✅ Check that `.env.local` has the correct API key
- ✅ Make sure there are no extra spaces or quotes around the key
- ✅ Restart the dev server after adding the key
- ✅ Clear browser cache (Ctrl+Shift+Delete)
- ✅ Hard refresh the page (Ctrl+Shift+R)

### Getting rate limit error (429)?
- ✅ Wait a few minutes and try again
- ✅ Check your API usage at: https://aistudio.google.com/app/apikeys
- ✅ Free tier has limits: 60 requests/minute, 1,500 requests/day

### Chatbot not responding?
- ✅ Check browser console for errors (F12)
- ✅ Verify API key is valid
- ✅ Check internet connection
- ✅ Try a different question

### "Chatbot service not configured" message?
- ✅ This means `.env.local` is missing the API key
- ✅ Follow Step 2 above to add it
- ✅ Restart the dev server

---

## File Locations

- **Chatbot Component:** `frontend/src/components/ChatBot.tsx`
- **API Route:** `frontend/src/app/api/chatbot/route.ts`
- **Environment File:** `frontend/.env.local` (create if doesn't exist)

---

## What the Chatbot Does

✅ Explains complex environmental terms
✅ Helps with platform features
✅ Answers questions about staking, compliance, penalties
✅ Available on all pages (bottom-right corner)
✅ Uses Google's Gemini AI

---

## Security Notes

⚠️ **Never commit `.env.local` to git** - it's already in `.gitignore`
⚠️ **Keep your API key secret** - don't share it
⚠️ **Use `NEXT_PUBLIC_` prefix** only for non-sensitive keys
⚠️ For production, consider using a backend-only API key

---

## API Key Limits

**Free Tier:**
- 60 requests per minute
- 1,500 requests per day
- Limited to `gemini-pro` model

**Paid Tier:**
- Higher limits
- Better support
- Access to premium models

Check pricing: https://ai.google.dev/pricing

---

## Example Questions to Ask

- "What does PM2.5 mean?"
- "What is staking?"
- "What happens if I breach compliance?"
- "How do green credits work?"
- "What is a penalty or slash?"
- "How do I register my factory?"
- "What is the DAO governance?"

---

## Need Help?

1. Check the error message in the chat window
2. Look at browser console (F12) for detailed errors
3. Verify API key is correct
4. Restart dev server
5. Clear browser cache and refresh

If issues persist, check the detailed setup guide in `CHATBOT_SETUP.md`
