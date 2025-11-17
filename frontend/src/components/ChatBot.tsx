'use client'

import { useState, useRef, useEffect } from 'react'
import { useUser } from '@clerk/nextjs'
import { MessageCircle, X, Send, Loader, Mic, MicOff, Volume2, VolumeX } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

interface Message {
  id: string
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

interface UserData {
  factories?: any[]
  stake_balance?: number
  status?: string
  compliance_score?: number
  risk_level?: string
  [key: string]: any
}

type Language = 'english' | 'hindi' | 'chhattisgarhi' | 'hinglish'

const greetings: Record<Language, string> = {
  english: 'Hello! 👋 I\'m your Pollu-Stake assistant. I can help explain complex terms, guide you through the platform, and answer your questions about your account. What would you like to know?',
  hindi: 'नमस्ते! 👋 मैं आपका Pollu-Stake सहायक हूँ। मैं जटिल शब्दों को समझाने, प्लेटफॉर्म के माध्यम से आपको गाइड करने, और आपके खाते के बारे में सवालों के जवाब देने में मदद कर सकता हूँ। आप क्या जानना चाहते हैं?',
  chhattisgarhi: 'नमस्कार! 👋 मैं आपका Pollu-Stake सहायक हूँ। मैं मुश्किल शब्दों के बारे में बताने, प्लेटफॉर्म में आपकी मदद करने, और आपके खाते के बारे में सवालों का जवाब देने में मदद कर सकता हूँ। आप क्या जानना चाहते हैं?',
  hinglish: 'Hello! 👋 Main aapka Pollu-Stake assistant hoon. Main complex terms ko samjha sakta hoon, platform ke through guide kar sakta hoon, aur aapke account ke baare mein questions ka jawab de sakta hoon. Aap kya jaanna chahte ho?',
}

export function ChatBot() {
  const { user } = useUser()
  const [isOpen, setIsOpen] = useState(false)
  const [language, setLanguage] = useState<Language>('english')
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: greetings.english,
      sender: 'bot',
      timestamp: new Date(),
    },
  ])
  const [inputValue, setInputValue] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [voiceEnabled, setVoiceEnabled] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesisUtterance | null>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = false

        recognitionRef.current.onstart = () => setIsListening(true)
        recognitionRef.current.onend = () => setIsListening(false)

        recognitionRef.current.onresult = (event: any) => {
          let transcript = ''
          for (let i = event.resultIndex; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript
          }
          setInputValue(transcript)
        }

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error)
          toast.error(`Voice error: ${event.error}`)
        }
      }
    }
  }, [])

  // Fetch user data on component mount
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await fetch('http://localhost:8000/api/dashboard-data')
        if (response.ok) {
          const data = await response.json()
          setUserData(data)
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
      }
    }

    if (isOpen) {
      fetchUserData()
    }
  }, [isOpen])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Start voice recognition
  const startListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.lang = language === 'hindi' ? 'hi-IN' : language === 'chhattisgarhi' ? 'hi-IN' : 'en-US'
      recognitionRef.current.start()
    } else {
      toast.error('Voice recognition not supported in your browser')
    }
  }

  // Stop voice recognition
  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
    }
  }

  // Speak bot response
  const speakText = (text: string) => {
    if (!voiceEnabled) return

    window.speechSynthesis.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    
    // Set language for speech
    if (language === 'hindi' || language === 'chhattisgarhi') {
      utterance.lang = 'hi-IN'
    } else if (language === 'hinglish') {
      utterance.lang = 'en-IN'
    } else {
      utterance.lang = 'en-US'
    }
    
    utterance.rate = 0.9
    utterance.pitch = 1
    utterance.volume = 1

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    window.speechSynthesis.speak(utterance)
  }

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInputValue('')
    setIsLoading(true)

    try {
      // Format user data for context
      const userDataContext = userData ? `
User Account Data:
- Total Stake: ${userData.admin_fund || 'N/A'} ETH
- Factories: ${userData.factories?.length || 0}
${userData.factories?.map((f: any) => `  • ${f.name}: ${f.stakeBalance} ETH, Status: ${f.status}, Compliance: ${f.complianceScore}%`).join('\n') || ''}
` : ''

      const response = await fetch('/api/chatbot', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: inputValue,
          context: 'Pollu-Stake Environmental Compliance Platform',
          userData: userDataContext,
          userInfo: {
            userId: user?.id,
            userName: user?.fullName,
          },
          language: language,
        }),
      })

      const data = await response.json()

      // Add bot response (use response field if available, otherwise use error message)
      const responseText = data.response || data.error || 'Sorry, I could not generate a response. Please try again.'
      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: responseText,
        sender: 'bot',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, botMessage])

      // Speak the response if voice is enabled
      if (voiceEnabled) {
        speakText(responseText)
      }

      // Show error toast if there was an error
      if (!response.ok) {
        toast.error(data.error || 'Failed to get chatbot response')
      }
    } catch (error) {
      console.error('Chatbot error:', error)
      toast.error('Failed to get chatbot response')

      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: 'Sorry, I encountered an error. Please try again later.',
        sender: 'bot',
        timestamp: new Date(),
      }

      setMessages((prev) => [...prev, errorMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <>
      {/* Chat Button - Fixed Bottom Right */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-br from-primary-500 to-teal-600 text-white shadow-lg transition-all duration-300 hover:scale-110 hover:shadow-xl"
        aria-label="Open chatbot"
      >
        {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 w-96 max-w-[calc(100vw-2rem)] rounded-2xl border border-charcoal-200 bg-white shadow-2xl flex flex-col max-h-[600px]">
          {/* Header */}
          <div className="bg-gradient-to-r from-primary-500 to-teal-600 px-6 py-4 rounded-t-2xl">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="font-semibold text-white">Pollu-Stake Assistant</h3>
                <p className="text-xs text-teal-100">Always here to help</p>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:bg-white/20 rounded-lg p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            {/* Language Selector */}
            <div className="flex gap-2 flex-wrap">
              {(['english', 'hindi', 'hinglish', 'chhattisgarhi'] as Language[]).map((lang) => (
                <button
                  key={lang}
                  onClick={() => {
                    setLanguage(lang)
                    setMessages([
                      {
                        id: '1',
                        text: greetings[lang],
                        sender: 'bot',
                        timestamp: new Date(),
                      },
                    ])
                  }}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                    language === lang
                      ? 'bg-white text-primary-600'
                      : 'bg-white/20 text-white hover:bg-white/30'
                  }`}
                >
                  {lang.charAt(0).toUpperCase() + lang.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-charcoal-50">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs rounded-lg px-4 py-2 text-sm ${
                    message.sender === 'user'
                      ? 'bg-primary-500 text-white rounded-br-none'
                      : 'bg-white text-charcoal-900 border border-charcoal-200 rounded-bl-none'
                  }`}
                >
                  <p className="whitespace-pre-wrap break-words">{message.text}</p>
                  <span
                    className={`text-xs mt-1 block ${
                      message.sender === 'user'
                        ? 'text-primary-100'
                        : 'text-charcoal-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </span>
                </div>
              </div>
            ))}

            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white text-charcoal-900 border border-charcoal-200 rounded-lg rounded-bl-none px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader className="h-4 w-4 animate-spin" />
                    <span className="text-sm">Thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="border-t border-charcoal-200 bg-white p-4 rounded-b-2xl">
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything..."
                disabled={isLoading || isListening}
                className="flex-1 rounded-lg border border-charcoal-200 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 disabled:bg-charcoal-50"
              />
              <Button
                size="sm"
                onClick={handleSendMessage}
                disabled={isLoading || !inputValue.trim()}
                className="rounded-lg"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
            
            {/* Voice Controls */}
            <div className="flex gap-2 justify-between">
              <div className="flex gap-2">
                <button
                  onClick={isListening ? stopListening : startListening}
                  className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                    isListening
                      ? 'bg-red-500 text-white'
                      : 'bg-blue-500 text-white hover:bg-blue-600'
                  }`}
                  title="Click to speak"
                >
                  {isListening ? (
                    <>
                      <MicOff className="h-3 w-3" />
                      Stop
                    </>
                  ) : (
                    <>
                      <Mic className="h-3 w-3" />
                      Speak
                    </>
                  )}
                </button>
              </div>
              
              <button
                onClick={() => setVoiceEnabled(!voiceEnabled)}
                className={`flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium transition-all ${
                  voiceEnabled
                    ? 'bg-green-500 text-white'
                    : 'bg-gray-500 text-white'
                }`}
                title="Toggle voice output"
              >
                {voiceEnabled ? (
                  <>
                    <Volume2 className="h-3 w-3" />
                    Voice On
                  </>
                ) : (
                  <>
                    <VolumeX className="h-3 w-3" />
                    Voice Off
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
