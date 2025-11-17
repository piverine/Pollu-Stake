# Chatbot Setup Guide - Gemini API Integration

## Overview
The chatbot uses Google's Gemini API to provide intelligent, context-aware responses about the Pollu-Stake platform. It explains complex terminology in simple language and helps users navigate the platform.

---

## 1. Get Gemini API Key

### Step 1: Go to Google AI Studio
1. Visit: https://aistudio.google.com/app/apikeys
2. Sign in with your Google account

### Step 2: Create API Key
1. Click "Create API key"
2. Select "Create API key in new project"
3. Copy the generated API key

---

## 2. Configure Environment Variables

### Frontend (.env.local)
Add the API key to your frontend `.env.local` file:

```env
NEXT_PUBLIC_GEMINI_API_KEY=your_api_key_here
```

**OR** use it as a secret (recommended for production):

```env
GEMINI_API_KEY=your_api_key_here
```

### Restart Frontend
```bash
npm run dev
```

---

## 3. File Structure

```
frontend/
├── src/
│   ├── components/
│   │   └── ChatBot.tsx          # Main chatbot component
│   ├── app/
│   │   ├── api/
│   │   │   └── chatbot/
│   │   │       └── route.ts     # Chatbot API endpoint
│   │   └── layout.tsx           # Updated to include ChatBot
```

---

## 4. Features

✅ **Floating Chat Icon**
- Fixed position in bottom-right corner
- Gradient background (primary to teal)
- Hover effect with scale animation

✅ **Chat Window**
- Clean, modern UI
- Message history with timestamps
- User and bot message differentiation
- Auto-scroll to latest message

✅ **Smart Responses**
- Context-aware answers
- Explains complex terms simply
- Uses analogies and examples
- Temperature: 0.7 (balanced creativity)
- Max tokens: 200 (concise responses)

✅ **Safety Features**
- Blocks harassment, hate speech, explicit content
- Error handling and fallback messages
- Input validation

---

## 5. How It Works

### User Flow
1. User clicks chat icon (bottom-right)
2. Chat window opens
3. User types a question
4. Message sent to `/api/chatbot` endpoint
5. Frontend calls Gemini API with system prompt
6. Response displayed in chat window
7. User can continue conversation

### API Endpoint
**POST** `/api/chatbot`

Request:
```json
{
  "message": "What does staking mean?",
  "context": "Pollu-Stake Environmental Compliance Platform"
}
```

Response:
```json
{
  "response": "Staking is like putting down a deposit to show you're serious about following environmental rules...",
  "success": true
}
```

---

## 6. Customization

### Change Chat Icon Position
Edit `ChatBot.tsx` line 56:
```tsx
className="fixed bottom-6 right-6 z-50 ..." // Change bottom-6 and right-6
```

### Change Chat Window Size
Edit `ChatBot.tsx` line 69:
```tsx
className="fixed bottom-24 right-6 z-50 w-96 max-h-[600px]" // Change w-96 and max-h-[600px]
```

### Customize System Prompt
Edit `route.ts` lines 30-45 to change how the bot responds.

### Adjust Response Length
Edit `route.ts` line 52:
```typescript
maxOutputTokens: 200, // Increase for longer responses
```

---

## 7. Testing

### Test the Chatbot
1. Open your app in browser
2. Click the chat icon (bottom-right)
3. Ask a question like:
   - "What is staking?"
   - "What does compliance mean?"
   - "How do penalties work?"
   - "What are green credits?"

### Expected Behavior
- Chat window opens/closes smoothly
- Messages appear with timestamps
- Bot responds within 2-3 seconds
- Responses are simple and easy to understand

---

## 8. Troubleshooting

### Chatbot not responding
**Problem:** API key not configured
**Solution:** 
- Check `.env.local` has `NEXT_PUBLIC_GEMINI_API_KEY` or `GEMINI_API_KEY`
- Restart dev server: `npm run dev`
- Check browser console for errors

### Slow responses
**Problem:** API latency
**Solution:**
- Reduce `maxOutputTokens` in `route.ts`
- Reduce `temperature` for faster responses
- Check internet connection

### Messages not appearing
**Problem:** Component not rendering
**Solution:**
- Verify `ChatBot` is imported in `layout.tsx`
- Check browser console for errors
- Clear browser cache and refresh

### API quota exceeded
**Problem:** Too many requests
**Solution:**
- Check Gemini API usage in Google AI Studio
- Implement rate limiting if needed
- Consider upgrading API plan

---

## 9. API Limits & Pricing

### Free Tier
- 60 requests per minute
- 1,500 requests per day
- Limited to `gemini-pro` model

### Paid Tier
- Higher rate limits
- Access to premium models
- Better support

Check: https://ai.google.dev/pricing

---

## 10. Example Questions Users Can Ask

✅ **About Terminology**
- "What does PM2.5 mean?"
- "What is a penalty or slash?"
- "What are green credits?"
- "What does compliance mean?"

✅ **About Features**
- "How do I stake ETH?"
- "How does forecasting work?"
- "What happens if I breach compliance?"
- "How do I earn green credits?"

✅ **About Platform**
- "How do I register my factory?"
- "What is the DAO governance?"
- "How do I vote on proposals?"
- "How do I check my compliance status?"

---

## 11. Security Best Practices

✅ **Never commit API key**
- Use `.env.local` (gitignored)
- Use `NEXT_PUBLIC_` prefix only for non-sensitive keys
- Consider using backend-only API key for production

✅ **Rate Limiting**
- Implement rate limiting on `/api/chatbot` endpoint
- Add user authentication if needed
- Monitor API usage

✅ **Content Filtering**
- Safety settings enabled (harassment, hate speech, explicit content)
- Input validation on message length
- Error handling for malicious inputs

---

## 12. Production Deployment

### Environment Variables
Set in your deployment platform (Vercel, Netlify, etc.):
```
GEMINI_API_KEY=your_production_key
```

### Monitoring
- Monitor API usage in Google AI Studio
- Set up alerts for quota limits
- Log errors for debugging

### Performance
- Cache common responses if possible
- Implement message pagination for long conversations
- Consider adding typing indicators

---

## 13. Future Enhancements

- [ ] Add conversation history persistence
- [ ] Implement multi-language support
- [ ] Add quick reply buttons
- [ ] Add sentiment analysis
- [ ] Implement user feedback system
- [ ] Add analytics dashboard
- [ ] Support file uploads for context
- [ ] Add voice input/output
