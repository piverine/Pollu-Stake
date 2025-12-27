import { NextRequest, NextResponse } from 'next/server'

const GEMINI_API_KEY = process.env.NEXT_PUBLIC_GEMINI_API_KEY || process.env.GEMINI_API_KEY

export async function POST(request: NextRequest) {
  try {
    const { message, context, userData, userInfo, language = 'english' } = await request.json()

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    if (!GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not configured in environment variables')
      return NextResponse.json(
        {
          error: 'Chatbot service not configured. Please add NEXT_PUBLIC_GEMINI_API_KEY to your .env.local file.',
          response: 'I apologize, but the chatbot is not properly configured. Please contact the administrator to set up the Gemini API key.'
        },
        { status: 500 }
      )
    }

    // Get language-specific instructions
    const languageInstructions: Record<string, string> = {
      english: 'Respond in English.',
      hindi: 'Respond in Hindi (Devanagari script). Use simple Hindi words that common people understand.',
      hinglish: 'Respond in Hinglish (Hindi words written in English/Roman script). Mix Hindi and English naturally. Example: "Aapka stake 50 ETH hai aur compliance 85% hai."',
    }

    // System prompt for the chatbot with strict project-only restrictions and concise answers
    const systemPrompt = `You are a helpful assistant ONLY for the Pollu-Stake platform - an environmental compliance and green credits system.

${userData ? `USER INFORMATION:\n${userData}\n` : ''}

LANGUAGE: ${languageInstructions[language] || languageInstructions.english}

STRICT RULES:
1. ONLY answer questions related to Pollu-Stake, environmental compliance, pollution monitoring, staking, green credits, DAO governance, or blockchain
2. If a question is NOT related to Pollu-Stake or the topics above, respond with a message in the selected language saying you only help with Pollu-Stake questions
3. Do NOT answer questions about: politics, sports, entertainment, general knowledge, personal advice, or any non-Pollu-Stake topics
4. Do NOT help with: coding (unless it's about using the Pollu-Stake API), hacking, illegal activities, or anything unrelated to the platform

RESPONSE STYLE - VERY IMPORTANT:
- Keep answers to 1-2 sentences MAXIMUM
- Use ONLY simple, everyday words in the selected language
- NO technical jargon or complex terms
- NO long explanations
- Be direct and clear
- Use short sentences
- Use analogies that anyone can understand
- When answering about user's data (stake, factories, compliance), reference the user information provided above

Your role is to:
1. Explain Pollu-Stake features in simple language
2. Help users understand staking, compliance, penalties, and green credits
3. Guide users through the platform
4. Answer questions about pollution and forecasting
5. Explain DAO governance and voting
6. Help with factory registration
7. Answer questions about the user's account, stake, factories, and compliance status

SIMPLE EXPLANATIONS (use these in the selected language):
- "Staking" = You put money down to promise you'll follow the rules
- "Penalty/Slash" = You lose some money if you break the rules
- "Compliance" = Following the pollution limits
- "Green Credits" = Rewards you get for being clean
- "DAO Governance" = Everyone votes on big decisions
- "Forecasting" = Guessing future pollution to stop problems
- "PM2.5" = Tiny dust in the air that's bad for you
- "Factory" = A place that makes things
- "Breach" = Breaking the pollution limit
- "Monitoring" = Checking pollution levels all the time`

    // Call Gemini API with API key in URL (using gemini-2.0-flash model - latest)
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: `${systemPrompt}\n\nUser question: ${message}`,
                },
              ],
            },
          ],
          generationConfig: {
            temperature: 0.5,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 100,
          },
          safetySettings: [
            {
              category: 'HARM_CATEGORY_HARASSMENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_HATE_SPEECH',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_SEXUALLY_EXPLICIT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
            {
              category: 'HARM_CATEGORY_DANGEROUS_CONTENT',
              threshold: 'BLOCK_MEDIUM_AND_ABOVE',
            },
          ],
        }),
        next: { revalidate: 0 },
      }
    )

    if (!response.ok) {
      const errorData = await response.json()
      console.error('Gemini API error:', errorData)

      // Handle specific error cases
      if (response.status === 403) {
        return NextResponse.json(
          {
            error: 'API key is invalid or has insufficient permissions',
            response: 'The chatbot API key is invalid. Please check your NEXT_PUBLIC_GEMINI_API_KEY in .env.local'
          },
          { status: 403 }
        )
      }

      if (response.status === 429) {
        return NextResponse.json(
          {
            error: 'Rate limit exceeded',
            response: 'Too many requests. Please wait a moment and try again.'
          },
          { status: 429 }
        )
      }

      return NextResponse.json(
        {
          error: 'Failed to generate response from Gemini API',
          response: 'Sorry, I encountered an error. Please try again later.'
        },
        { status: response.status }
      )
    }

    const data = await response.json()

    // Extract the response text
    const responseText =
      data.candidates?.[0]?.content?.parts?.[0]?.text ||
      'Sorry, I could not generate a response. Please try again.'

    return NextResponse.json({
      response: responseText,
      success: true,
    })
  } catch (error) {
    console.error('Chatbot API error:', error)
    return NextResponse.json(
      {
        error: 'Internal server error',
        response: 'An unexpected error occurred. Please try again later.'
      },
      { status: 500 }
    )
  }
}
