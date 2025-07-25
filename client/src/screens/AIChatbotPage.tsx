import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BottomNavBar from '../components/BottomNavBar';
import UltraBottomNavBar from '../components/UltraBottomNavBar';
import { UltraPageTransition } from '../components/UltraBottomNavBar';
import { usePremium } from '../context/PremiumProvider';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { ArrowLeft, Bot, Send, Sparkles, Heart, Settings } from 'lucide-react';
import { aiChatbot } from '../lib/aiChatbot';

const AIChatbotPage: React.FC = () => {
  const navigate = useNavigate();
  const { isUltraPremium } = usePremium();
  const [messages, setMessages] = useState<Array<{ text: string; isUser: boolean; timestamp: Date }>>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [conversationStyle, setConversationStyle] = useState<'casual' | 'friendly' | 'flirty' | 'supportive'>('friendly');
  const [showPersonalityMenu, setShowPersonalityMenu] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isInitialized, setIsInitialized] = useState(false);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!isInitialized) {
      // Send initial greeting
      const initializeChat = async () => {
        setIsTyping(true);
        try {
          const response = await aiChatbot.generateResponse("", {
            messages: [],
            userPreferences: { conversationStyle }
          });
          const aiMessage = {
            text: response,
            isUser: false,
            timestamp: new Date()
          };
          setMessages([aiMessage]);
        } catch (error) {
          console.error('Error getting AI response:', error);
          const fallbackMessage = {
            text: "Hello! I'm your AI assistant. How can I help you today? 💕",
            isUser: false,
            timestamp: new Date()
          };
          setMessages([fallbackMessage]);
        } finally {
          setIsTyping(false);
          setIsInitialized(true);
        }
      };
      initializeChat();
    }
  }, [isInitialized, conversationStyle]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleSendMessage = async () => {
    if (!inputMessage.trim() || isTyping) return;

    const userMessage = {
      text: inputMessage.trim(),
      isUser: true,
      timestamp: new Date()
    };

    const currentInput = inputMessage.trim();
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);

    try {
      // Get AI response with context
      const response = await aiChatbot.generateResponse(currentInput, {
        messages: [...messages, userMessage],
        userPreferences: { conversationStyle }
      });

      const aiResponse = {
        text: response,
        isUser: false,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, aiResponse]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      const errorResponse = {
        text: "Oops! I'm having a little trouble thinking right now. Can you try asking me again? 😅",
        isUser: false,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handlePersonalityChange = (style: 'casual' | 'friendly' | 'flirty' | 'supportive') => {
    setConversationStyle(style);
    setShowPersonalityMenu(false);

    // Add a system message about personality change
    const systemMessage = {
      text: `I've switched to a more ${style} conversation style! Let's keep chatting! 😊`,
      isUser: false,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, systemMessage]);
  };

  const getPersonalityEmoji = (style: string) => {
    switch (style) {
      case 'casual': return '😎';
      case 'friendly': return '😊';
      case 'flirty': return '😘';
      case 'supportive': return '🤗';
      default: return '😊';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <>
      <Helmet>
        <title>AjnabiCam - AI Chat Assistant</title>
      </Helmet>
      <UltraPageTransition>
        <main className={`flex flex-col min-h-screen w-full ${
          isUltraPremium()
            ? 'bg-gradient-to-br from-white/95 via-purple-50/90 to-pink-50/90'
            : 'bg-gradient-to-br from-peach-25 via-cream-50 to-blush-50'
        } px-4 sm:px-6 md:px-8 lg:px-12 py-2 sm:py-4 relative pb-20 sm:pb-24 max-w-full sm:max-w-lg md:max-w-2xl lg:max-w-4xl xl:max-w-6xl mx-auto`}>
        {/* Enhanced Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-6 left-6 w-12 h-12 bg-gradient-to-br from-peach-300 to-coral-400 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-20 right-4 w-10 h-10 bg-gradient-to-br from-coral-300 to-blush-400 rounded-full opacity-30 animate-bounce"></div>
          <div
            className="absolute bottom-32 left-4 w-8 h-8 bg-gradient-to-br from-blush-300 to-peach-400 rounded-full opacity-25 animate-pulse"
            style={{ animationDelay: "1s" }}
          ></div>
          <div
            className="absolute bottom-48 right-8 w-6 h-6 bg-gradient-to-br from-cream-400 to-coral-400 rounded-full opacity-20 animate-bounce"
            style={{ animationDelay: "2s" }}
          ></div>
          {/* Add romantic symbols */}
          <div
            className="absolute top-16 right-16 text-coral-400 text-lg opacity-40 animate-pulse"
            style={{ animationDelay: "0.5s" }}
          >
            💕
          </div>
          <div
            className="absolute bottom-64 left-12 text-peach-400 text-base opacity-35 animate-bounce"
            style={{ animationDelay: "1.5s" }}
          >
            🌸
          </div>
          <div
            className="absolute top-48 left-6 text-blush-400 text-sm opacity-30 animate-pulse"
            style={{ animationDelay: "2.5s" }}
          >
            ✨
          </div>
        </div>

        {/* Header */}
        <div className={`w-full flex items-center p-4 sm:p-5 md:p-6 ${
          isUltraPremium()
            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700'
            : 'bg-gradient-to-r from-peach-400 via-coral-400 to-blush-500'
        } text-white font-bold text-lg sm:text-xl md:text-2xl rounded-t-3xl sm:rounded-t-2xl shadow-lg relative overflow-hidden`}>
          {/* Header Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-cream-100/25 to-white/15 backdrop-blur-sm"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-peach-200/15 to-transparent"></div>

          <button
            onClick={handleBackClick}
            className="relative z-10 mr-3 sm:mr-4 text-white font-bold text-xl hover:scale-110 transition-transform p-3 sm:p-2 rounded-full hover:bg-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center"
          >
            <ArrowLeft size={20} className="sm:w-6 sm:h-6" />
          </button>
          <h1 className="relative z-10 flex-grow text-center drop-shadow-lg font-semibold">AI Chat Assistant</h1>
          <div className="relative z-10 flex items-center gap-2">
            <span className="text-sm">{getPersonalityEmoji(conversationStyle)}</span>
            <button
              onClick={() => setShowPersonalityMenu(!showPersonalityMenu)}
              className="p-3 sm:p-2 rounded-full hover:bg-white/20 transition-all min-h-[44px] min-w-[44px] flex items-center justify-center"
            >
              <Settings size={18} className="sm:w-5 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Personality Selection Menu */}
        {showPersonalityMenu && (
          <div className="w-full bg-white/95 backdrop-blur-sm border-x border-peach-200 shadow-lg relative z-10">
            <div className="p-4 sm:p-5">
              <h3 className="text-sm sm:text-base font-semibold text-gray-700 mb-4">Choose Conversation Style:</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-2">
                {[
                  { style: 'friendly' as const, label: 'Friendly', emoji: '😊', desc: 'Warm and welcoming' },
                  { style: 'flirty' as const, label: 'Flirty', emoji: '😘', desc: 'Playful and charming' },
                  { style: 'casual' as const, label: 'Casual', emoji: '😎', desc: 'Relaxed and chill' },
                  { style: 'supportive' as const, label: 'Supportive', emoji: '🤗', desc: 'Caring and understanding' }
                ].map((option) => (
                  <button
                    key={option.style}
                    onClick={() => handlePersonalityChange(option.style)}
                    className={`p-4 sm:p-3 rounded-xl border transition-all text-left min-h-[60px] sm:min-h-[auto] touch-manipulation ${
                      conversationStyle === option.style
                        ? 'bg-peach-100 border-peach-400 text-peach-700'
                        : 'bg-white border-gray-200 text-gray-600 hover:bg-peach-50 active:bg-peach-50'
                    }`}
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <span className="text-lg">{option.emoji}</span>
                      <span className="text-base sm:text-sm font-medium">{option.label}</span>
                    </div>
                    <div className="text-sm sm:text-xs text-gray-500">{option.desc}</div>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        <div className="w-full flex flex-col romantic-card rounded-b-3xl sm:rounded-b-2xl border border-peach-200 shadow-xl mb-4 sm:mb-6 overflow-hidden flex-1 relative z-10">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 md:p-6 space-y-4 sm:space-y-5 max-h-[65vh] sm:max-h-[60vh] md:max-h-[55vh] min-h-[50vh]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'} animate-[fadeIn_0.3s_ease-in]`}
              >
                <div
                  className={`max-w-[280px] sm:max-w-xs lg:max-w-md px-4 sm:px-5 py-3 sm:py-4 rounded-2xl sm:rounded-3xl shadow-md transition-all hover:shadow-lg touch-manipulation ${
                    message.isUser
                      ? 'bg-gradient-to-r from-peach-500 via-coral-500 to-blush-600 text-white transform hover:scale-105'
                      : 'bg-gradient-to-r from-gray-50 to-white text-gray-800 border border-gray-200 hover:border-peach-300'
                  }`}
                >
                  {!message.isUser && (
                    <div className="flex items-center gap-2 mb-2">
                      <div className="flex items-center justify-center w-5 h-5 bg-coral-100 rounded-full">
                        <Heart className="h-3 w-3 text-coral-600" />
                      </div>
                      <span className="text-xs font-semibold text-coral-600">AI Assistant</span>
                    </div>
                  )}
                  <div className="leading-relaxed whitespace-pre-wrap text-sm sm:text-base">{message.text}</div>
                  <div className={`text-xs text-right mt-2 ${
                    message.isUser ? 'text-white/90' : 'text-gray-500'
                  }`}>
                    {formatTime(message.timestamp)}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start animate-[fadeIn_0.3s_ease-in]">
                <div className="bg-gradient-to-r from-gray-50 to-white text-gray-800 border border-gray-200 max-w-xs px-4 py-3 rounded-2xl shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="flex items-center justify-center w-5 h-5 bg-coral-100 rounded-full">
                      <Heart className="h-3 w-3 text-coral-600 animate-pulse" />
                    </div>
                    <span className="text-xs font-semibold text-coral-600">AI Assistant</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 bg-coral-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-coral-500 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                    <div className="w-2 h-2 bg-coral-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="p-4 sm:p-5 bg-white/90 backdrop-blur-sm border-t border-peach-100">
            <div className="flex items-center gap-3 sm:gap-4">
              <Input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message to AI..."
                className="flex-1 px-4 sm:px-5 py-3 sm:py-4 rounded-full border border-peach-300 focus:ring-2 focus:ring-coral-400 bg-peach-50/50 backdrop-blur-sm text-base min-h-[44px] touch-manipulation"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-peach-500 via-coral-500 to-blush-600 hover:from-peach-600 hover:via-coral-600 hover:to-blush-700 text-white px-6 sm:px-7 py-3 sm:py-4 rounded-full font-semibold shadow-md transform hover:scale-105 transition-all duration-200 min-h-[44px] min-w-[44px] touch-manipulation"
              >
                <Send size={18} className="sm:w-4 sm:h-4" />
              </Button>
            </div>
          </div>
        </div>
        
        {/* Use UltraBottomNavBar for ULTRA+ users, regular for others */}
        {isUltraPremium() ? <UltraBottomNavBar /> : <BottomNavBar />}
        </main>
      </UltraPageTransition>
    </>
  );
};

export default AIChatbotPage;
