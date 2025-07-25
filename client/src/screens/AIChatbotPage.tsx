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
        <main className={`flex flex-col items-center min-h-screen w-full ${
          isUltraPremium() ? 'max-w-full' : 'max-w-md'
        } mx-auto ${
          isUltraPremium() 
            ? 'bg-gradient-to-br from-white/95 via-purple-50/90 to-pink-50/90' 
            : 'bg-gradient-to-br from-peach-25 via-cream-50 to-blush-50'
        } px-2 py-4 relative pb-20`}>
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
        <div className={`w-full flex items-center p-4 ${
          isUltraPremium() 
            ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700' 
            : 'bg-gradient-to-r from-peach-400 via-coral-400 to-blush-500'
        } text-white font-bold text-xl rounded-t-2xl shadow-lg relative overflow-hidden`}>
          {/* Header Background Pattern */}
          <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-cream-100/25 to-white/15 backdrop-blur-sm"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-peach-200/15 to-transparent"></div>
          
          <button 
            onClick={handleBackClick} 
            className="relative z-10 mr-3 text-white font-bold text-xl hover:scale-110 transition-transform p-2 rounded-full hover:bg-white/20"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="relative z-10 flex-grow text-center drop-shadow-lg">AI Chat Assistant</h1>
          <Bot className="relative z-10 h-6 w-6 drop-shadow-lg" />
        </div>

        <div className="w-full flex flex-col romantic-card rounded-b-2xl border border-peach-200 shadow-xl mb-6 overflow-hidden flex-1 relative z-10">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[60vh]">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl shadow-md ${
                    message.isUser
                      ? 'bg-gradient-to-r from-peach-500 via-coral-500 to-blush-600 text-white'
                      : 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300'
                  }`}
                >
                  {!message.isUser && (
                    <div className="flex items-center gap-2 mb-2">
                      <Bot className="h-4 w-4 text-coral-600" />
                      <span className="text-xs font-semibold text-coral-600">AI Assistant</span>
                    </div>
                  )}
                  <div className="leading-relaxed">{message.text}</div>
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
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border border-gray-300 max-w-xs px-4 py-3 rounded-2xl shadow-md">
                  <div className="flex items-center gap-2 mb-2">
                    <Bot className="h-4 w-4 text-coral-600" />
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
          </div>

          {/* Feature Notice */}
          <div className="p-4 bg-gradient-to-r from-peach-50 to-coral-50 border-t border-peach-100">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-coral-600" />
              <span className="text-sm font-semibold text-coral-700">Coming Soon!</span>
            </div>
            <p className="text-xs text-coral-600">
              AI Chat Assistant is currently in development. This is a placeholder interface to demonstrate the feature.
            </p>
          </div>

          {/* Message Input */}
          <div className="p-4 bg-white/90 backdrop-blur-sm border-t border-peach-100">
            <div className="flex items-center gap-3">
              <Input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Type your message to AI..."
                className="flex-1 px-4 py-3 rounded-full border border-peach-300 focus:ring-2 focus:ring-coral-400 bg-peach-50/50 backdrop-blur-sm"
                disabled={isTyping}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!inputMessage.trim() || isTyping}
                className="bg-gradient-to-r from-peach-500 via-coral-500 to-blush-600 hover:from-peach-600 hover:via-coral-600 hover:to-blush-700 text-white px-6 py-3 rounded-full font-semibold shadow-md transform hover:scale-105 transition-all duration-200"
              >
                <Send size={16} />
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
