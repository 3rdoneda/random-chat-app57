import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BottomNavBar from "../components/BottomNavBar";
import UltraBottomNavBar from "../components/UltraBottomNavBar";
import { UltraPageTransition } from "../components/UltraBottomNavBar";
import { usePremium } from "../context/PremiumProvider";
import { useSocket } from "../context/SocketProvider";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { ArrowLeft, Send, MessageCircle, Crown, Users } from "lucide-react";

interface Message {
  id: string;
  text: string;
  timestamp: Date;
  isOwnMessage: boolean;
}

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const { isUltraPremium } = usePremium();
  const socketContext = useSocket();
  const socket = (socketContext as any).socket || socketContext;
  
  const [messages, setMessages] = useState<Message[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isConnected, setIsConnected] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [partnerConnected, setPartnerConnected] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const handleBackClick = () => {
    navigate(-1);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (!socket) return;

    socket.on("chat-connected", () => {
      setIsConnected(true);
      setPartnerConnected(true);
      setMessages([]);
    });

    socket.on("chat-message", (data: { message: string; timestamp: string }) => {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: data.message,
        timestamp: new Date(data.timestamp),
        isOwnMessage: false
      };
      setMessages(prev => [...prev, newMessage]);
    });

    socket.on("partner-disconnected", () => {
      setPartnerConnected(false);
      const systemMessage: Message = {
        id: Date.now().toString(),
        text: "Your chat partner has disconnected. Looking for a new partner...",
        timestamp: new Date(),
        isOwnMessage: false
      };
      setMessages(prev => [...prev, systemMessage]);
    });

    socket.on("partner-typing", () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 3000);
    });

    socket.on("chat-disconnected", () => {
      setIsConnected(false);
      setPartnerConnected(false);
    });

    return () => {
      socket.off("chat-connected");
      socket.off("chat-message");
      socket.off("partner-disconnected");
      socket.off("partner-typing");
      socket.off("chat-disconnected");
    };
  }, [socket]);

  const handleStartChat = () => {
    if (socket) {
      socket.emit("start-text-chat");
      setIsConnected(true);
    }
  };

  const handleSendMessage = () => {
    if (!messageText.trim() || !socket || !partnerConnected) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
      timestamp: new Date(),
      isOwnMessage: true
    };

    setMessages(prev => [...prev, newMessage]);
    socket.emit("send-chat-message", messageText);
    setMessageText("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessageText(e.target.value);
    if (socket && partnerConnected) {
      socket.emit("typing");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  };

  const handleStopChat = () => {
    if (socket) {
      socket.emit("stop-chat");
      setIsConnected(false);
      setPartnerConnected(false);
      setMessages([]);
    }
  };

  return (
    <>
      <Helmet>
        <title>AjnabiCam - Text Chat</title>
      </Helmet>
      <UltraPageTransition>
        <main className={`flex flex-col min-h-screen w-full ${
          isUltraPremium() ? 'max-w-full' : 'max-w-md'
        } mx-auto ${
          isUltraPremium() 
            ? 'bg-gradient-to-br from-white/95 via-purple-50/90 to-pink-50/90' 
            : 'bg-white'
        } relative`}>
          
          <div className={`w-full flex items-center p-4 ${
            isUltraPremium() 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
              : 'bg-gradient-to-r from-rose-500 to-pink-600'
          } text-white font-bold text-xl shadow-lg`}>
            <button 
              onClick={handleBackClick} 
              className="mr-3 text-white font-bold text-xl hover:scale-110 transition-transform"
            >
              <ArrowLeft size={24} />
            </button>
            <h1 className="flex-grow text-center">Text Chat</h1>
            <MessageCircle className="h-6 w-6" />
          </div>

          <div className="p-4 bg-white border-b border-gray-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className={`w-3 h-3 rounded-full ${
                  partnerConnected ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="text-sm font-medium">
                  {partnerConnected ? 'Connected to stranger' : 'Not connected'}
                </span>
              </div>
              {isConnected && (
                <Button
                  onClick={handleStopChat}
                  variant="outline"
                  size="sm"
                  className="text-red-600 border-red-600 hover:bg-red-50"
                >
                  Stop Chat
                </Button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
            {!isConnected ? (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <h2 className="text-2xl font-bold text-rose-600 mb-2">Text Chat</h2>
                <p className="text-gray-600 mb-6">
                  Connect with strangers through anonymous text conversations
                </p>
                
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-4 mb-6 border border-purple-200 max-w-sm mx-auto">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Crown className="h-5 w-5 text-purple-600" />
                    <span className="font-semibold text-purple-700">Premium Feature</span>
                  </div>
                  <p className="text-sm text-purple-600">
                    Text chat is available for all users. Premium users get priority matching!
                  </p>
                </div>

                <Button
                  onClick={handleStartChat}
                  className="w-full max-w-sm py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
                >
                  <Users className="h-5 w-5 mr-2" />
                  Start Text Chat
                </Button>
              </div>
            ) : (
              <>
                {messages.length === 0 && partnerConnected && (
                  <div className="text-center text-gray-500 py-8">
                    <MessageCircle className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                    <p>Start your conversation! Say hello 👋</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex ${message.isOwnMessage ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`max-w-xs px-4 py-2 rounded-2xl ${
                        message.isOwnMessage
                          ? 'bg-gradient-to-r from-rose-500 to-pink-600 text-white'
                          : 'bg-white text-gray-800 border border-gray-200'
                      } shadow-sm`}
                    >
                      <p className="text-sm">{message.text}</p>
                      <p className={`text-xs mt-1 ${
                        message.isOwnMessage ? 'text-rose-100' : 'text-gray-400'
                      }`}>
                        {message.timestamp.toLocaleTimeString()}
                      </p>
                    </div>
                  </div>
                ))}
                
                {isTyping && (
                  <div className="flex justify-start">
                    <div className="bg-white text-gray-800 border border-gray-200 rounded-2xl px-4 py-2 shadow-sm">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {isConnected && partnerConnected && (
            <div className="p-4 bg-white border-t border-gray-200">
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  placeholder="Type your message..."
                  value={messageText}
                  onChange={handleInputChange}
                  onKeyPress={handleKeyPress}
                  className="flex-1 rounded-full border-gray-300 focus:border-rose-500"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!messageText.trim()}
                  className="rounded-full w-12 h-12 p-0 bg-gradient-to-r from-rose-500 to-pink-600 hover:shadow-lg transition-all duration-200"
                >
                  <Send className="h-5 w-5" />
                </Button>
              </div>
            </div>
          )}
          
          {!isConnected && (
            <div className="pb-20">
              {isUltraPremium() ? <UltraBottomNavBar /> : <BottomNavBar />}
            </div>
          )}
        </main>
      </UltraPageTransition>
    </>
  );
};

export { ChatPage as default };
