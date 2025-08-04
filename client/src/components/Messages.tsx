import { useCallback, useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { useSocket } from "../context/SocketProvider"
import { usePremium } from "../context/PremiumProvider"
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Send, Eye, Palette, Check, CheckCheck, Clock } from "lucide-react";
import SecretChatModal from "./SecretChatModal";
import WallpaperSelector from "./WallpaperSelector";
// import PremiumPaywall from "./PremiumPaywall"; // Now using separate page

interface MessageProps{
    remoteChatToken: string | null;
    messagesArray: Array<{ sender: string; message: string; id?: string; isSecret?: boolean; timestamp?: number; isRead?: boolean }>;
    setMessagesArray: React.Dispatch<React.SetStateAction<Array<{ sender: string; message: string; id?: string; isSecret?: boolean; timestamp?: number; isRead?: boolean }>>>;
}

interface ReceivedMessageProps {
    message: string;
    from: string;
    isSecret?: boolean;
    messageId?: string;
}

const wallpaperGradients: Record<string, string> = {
  'default': 'from-white to-gray-50',
  'sunset': 'from-orange-100 to-pink-100',
  'ocean': 'from-blue-100 to-cyan-100',
  'forest': 'from-green-100 to-emerald-100',
  'lavender': 'from-purple-100 to-pink-100',
  'mint': 'from-teal-100 to-green-100',
  'rose': 'from-rose-100 to-pink-100',
  'cosmic': 'from-indigo-100 to-purple-100',
};

export default function Messages({remoteChatToken, messagesArray, setMessagesArray}: MessageProps) {
    const navigate = useNavigate();
    const {socket} = useSocket();
    const { isPremium, isUltraPremium, isProMonthly } = usePremium();
    const [message, setMessage] = useState<string>('');
    const [isSecretMode, setIsSecretMode] = useState<boolean>(false);
    const [showSecretModal, setShowSecretModal] = useState<boolean>(false);
    const [showWallpaperSelector, setShowWallpaperSelector] = useState<boolean>(false);
    const [currentWallpaper, setCurrentWallpaper] = useState<string>('default');
    const [isTyping, setIsTyping] = useState<boolean>(false);
    const [partnerTyping, setPartnerTyping] = useState<boolean>(false);
    const [typingTimeout, setTypingTimeout] = useState<NodeJS.Timeout | null>(null);
    // const [showPaywall, setShowPaywall] = useState<boolean>(false); // Now using separate page

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messagesArray]);

    // Load saved wallpaper
    useEffect(() => {
        const savedWallpaper = localStorage.getItem('ajnabicam_chat_wallpaper');
        if (savedWallpaper) {
            setCurrentWallpaper(savedWallpaper);
        }
    }, []);

    // Auto-delete secret messages
    useEffect(() => {
        if (isSecretMode) {
            const secretMessages = messagesArray.filter(msg => msg.isSecret);
            secretMessages.forEach(msg => {
                if (msg.timestamp && Date.now() - msg.timestamp > 3000) {
                    setMessagesArray(prev => prev.filter(m => m.id !== msg.id));
                }
            });
        }
    }, [messagesArray, isSecretMode]);

    const handleSendMessage = () => {
        if (!message.trim() || !remoteChatToken) return;

        // Rate limiting check
        const lastMessageTime = localStorage.getItem('last_message_time');
        const now = Date.now();
        if (lastMessageTime && now - parseInt(lastMessageTime) < 1000) {
            console.warn('Message rate limited');
            return;
        }
        localStorage.setItem('last_message_time', now.toString());

        const messageId = Date.now().toString();
        const newMessage = {
            sender: 'You',
            message: message.trim(),
            id: messageId,
            isSecret: isSecretMode,
            timestamp: Date.now()
        };

        setMessagesArray((prev) => [...prev, newMessage]);
        setMessage('');
        
        try {
            socket?.emit("send:message", {
                message: message.trim(),
                targetChatToken: remoteChatToken,
                isSecret: isSecretMode,
                messageId
            });
        } catch (error) {
            console.error('Error sending message:', error);
            // Remove message from UI if sending failed
            setMessagesArray((prev) => prev.filter(msg => msg.id !== messageId));
        }

        // Send typing status end for premium users
        if (isUltraPremium() || isProMonthly()) {
            socket?.emit("typing:end", { targetChatToken: remoteChatToken });
            setIsTyping(false);
        }

        // Auto-delete secret message after 3 seconds
        if (isSecretMode) {
            setTimeout(() => {
                setMessagesArray(prev => prev.filter(msg => msg.id !== messageId));
            }, 3000);
        }

        inputRef.current?.focus();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === "Enter") {
          handleSendMessage();
        }
    };

    const handleMessageReceived = useCallback(({message, isSecret = false, messageId}: ReceivedMessageProps) => {
        const newMessage = {
            sender: 'Stranger',
            message,
            id: messageId || Date.now().toString(),
            isSecret,
            timestamp: Date.now()
        };

        setMessagesArray((prev) => [...prev, newMessage]);

        // Send read receipt for premium users
        if ((isUltraPremium() || isProMonthly()) && messageId) {
            socket?.emit("message:read", {
                messageId,
                targetChatToken: remoteChatToken
            });
        }

        // Auto-delete secret message after 3 seconds
        if (isSecret) {
            setTimeout(() => {
                setMessagesArray(prev => prev.filter(msg => msg.id !== newMessage.id));
            }, 3000);
        }
    }, [setMessagesArray, remoteChatToken, socket, isUltraPremium, isProMonthly]);

    const handleSecretModeToggle = (enabled: boolean) => {
        setIsSecretMode(enabled);
        setShowSecretModal(false);
        
        // Notify partner about secret mode change
        socket?.emit("secret:mode:toggle", {
            targetChatToken: remoteChatToken,
            enabled
        });
    };

    const handleWallpaperSelect = (wallpaper: string) => {
        setCurrentWallpaper(wallpaper);
        localStorage.setItem('ajnabicam_chat_wallpaper', wallpaper);
    };

    const handleUpgrade = useCallback(() => {
        navigate('/premium');
        setShowSecretModal(false);
        setShowWallpaperSelector(false);
    }, [navigate]);

    const handlePremiumPurchase = useCallback((plan: string) => {
        console.log(`Processing payment for ${plan} plan`);
        // setShowPaywall(false); // Now handled in PremiumPage
        // Don't show alert here as it's handled by the parent component
        console.log(`🎉 Welcome to Premium! Your ${plan} subscription is now active!`);
    }, []);

    // Handle typing status for premium users
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setMessage(e.target.value);

        // Typing indicator for premium users
        if (isUltraPremium() || isProMonthly()) {
            if (!isTyping) {
                setIsTyping(true);
                socket?.emit("typing:start", { targetChatToken: remoteChatToken });
            }

            // Clear existing timeout
            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }

            // Set new timeout
            const timeout = setTimeout(() => {
                setIsTyping(false);
                socket?.emit("typing:end", { targetChatToken: remoteChatToken });
            }, 2000);

            setTypingTimeout(timeout);
        }
    };

    useEffect(() => {
        socket?.on("message:recieved", handleMessageReceived);
        socket?.on("secret:mode:changed", ({ enabled }: { enabled: boolean }) => {
            setIsSecretMode(enabled);
        });

        // Read receipt events for premium users
        socket?.on("message:read", ({ messageId }: { messageId: string }) => {
            setMessagesArray(prev => prev.map(msg =>
                msg.id === messageId ? { ...msg, isRead: true } : msg
            ));
        });

        // Typing status events for premium users
        socket?.on("typing:start", () => {
            setPartnerTyping(true);
        });

        socket?.on("typing:end", () => {
            setPartnerTyping(false);
        });

        return () => {
            socket?.off("message:recieved", handleMessageReceived);
            socket?.off("secret:mode:changed");
            socket?.off("message:read");
            socket?.off("typing:start");
            socket?.off("typing:end");

            if (typingTimeout) {
                clearTimeout(typingTimeout);
            }
        }
    }, [handleMessageReceived, socket, typingTimeout]);

    return (
        <div className="flex flex-1 flex-col h-full">
            {/* Messages Area with Wallpaper */}
            <div className={`h-full overflow-y-auto p-4 bg-gradient-to-br ${wallpaperGradients[currentWallpaper]} scrollbar-hide relative`}>
                {/* Secret Mode Indicator */}
                {isSecretMode && (
                    <div className="sticky top-0 z-10 bg-purple-500 text-white text-center py-2 rounded-lg mb-4 shadow-md">
                        <div className="flex items-center justify-center gap-2">
                            <Eye className="h-4 w-4" />
                            <span className="text-sm font-semibold">Secret Mode Active - Messages disappear in 3s</span>
                        </div>
                    </div>
                )}

                {messagesArray.map((msg, ind) => (
                    <div key={msg.id || ind} className={`mb-2 ${msg.isSecret ? 'animate-pulse' : ''}`}>
                        <div className={`inline-block max-w-xs px-3 py-2 rounded-lg ${
                            msg.sender === 'You'
                                ? 'bg-rose-500 text-white ml-auto'
                                : 'bg-white text-gray-800 border border-gray-200'
                        } ${msg.isSecret ? 'border-purple-300 shadow-purple-200 shadow-md' : ''}`}>
                            <div className="flex items-center gap-2 mb-1">
                                <strong className={`text-xs ${msg.sender === 'You' ? 'text-rose-100' : 'text-rose-500'}`}>
                                    {msg.sender}
                                </strong>
                                {msg.isSecret && (
                                    <Eye className="h-3 w-3 text-purple-500" />
                                )}
                            </div>
                            <div className="mb-1">{msg.message}</div>
                            {/* Read receipt for own messages (premium users only) */}
                            {msg.sender === 'You' && (isUltraPremium() || isProMonthly()) && (
                                <div className="flex justify-end">
                                    {msg.isRead ? (
                                        <CheckCheck className="h-3 w-3 text-blue-300" />
                                    ) : (
                                        <Check className="h-3 w-3 text-gray-300" />
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ))}

                {/* Typing indicator for premium users */}
                {partnerTyping && (isUltraPremium() || isProMonthly()) && (
                    <div className="mb-2">
                        <div className="inline-block max-w-xs px-3 py-2 rounded-lg bg-gray-200 text-gray-600">
                            <div className="flex items-center gap-2">
                                <strong className="text-xs text-gray-500">Stranger</strong>
                                <div className="flex gap-1">
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Last seen indicator for premium users */}
                {(isUltraPremium() || isProMonthly()) && !partnerTyping && messagesArray.length > 0 && (
                    <div className="mb-2 flex justify-center">
                        <div className="bg-gray-100 px-3 py-1 rounded-full">
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                                <Clock className="h-3 w-3" />
                                <span>Active now</span>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={messagesEndRef} />
            </div>

            {/* Input Area with Premium Controls */}
            <div className="sticky bottom-0 left-0 w-full bg-white border-t border-gray-200 p-4">
                {/* Premium Controls */}
                <div className="flex gap-2 mb-3">
                    <Button
                        onClick={() => setShowSecretModal(true)}
                        size="sm"
                        variant={isSecretMode ? "default" : "outline"}
                        className={`flex items-center gap-1 ${
                            isSecretMode 
                                ? 'bg-purple-500 text-white' 
                                : isPremium 
                                    ? 'border-purple-300 text-purple-600 hover:bg-purple-50' 
                                    : 'border-gray-300 text-gray-400'
                        }`}
                        disabled={!isPremium && !isSecretMode}
                    >
                        <Eye className="h-3 w-3" />
                        Secret
                    </Button>
                    
                    <Button
                        onClick={() => setShowWallpaperSelector(true)}
                        size="sm"
                        variant="outline"
                        className={`flex items-center gap-1 ${
                            isPremium 
                                ? 'border-purple-300 text-purple-600 hover:bg-purple-50' 
                                : 'border-gray-300 text-gray-400'
                        }`}
                        disabled={!isPremium}
                    >
                        <Palette className="h-3 w-3" />
                        Theme
                    </Button>
                </div>

                {/* Message Input */}
                <div className="flex gap-2">
                    <Input
                        ref={inputRef}
                        placeholder={isSecretMode ? "Secret message..." : "Type a message..."}
                        value={message}
                        onChange={handleInputChange}
                        onKeyDown={handleKeyDown}
                        aria-label="Message input"
                        disabled={!remoteChatToken}
                        className={`flex-1 ${
                            isSecretMode
                                ? 'border-purple-300 focus:ring-purple-400 bg-purple-50'
                                : 'bg-gray-50'
                        }`}
                    />
                    <Button 
                        className={`gap-2 ${
                            isSecretMode 
                                ? 'bg-purple-500 hover:bg-purple-600' 
                                : 'bg-rose-500 hover:bg-rose-600'
                        } text-white`}
                        onClick={handleSendMessage} 
                        disabled={!remoteChatToken || !message.trim()}
                        aria-label="Send message"
                    >
                        <Send size={18} /> Send
                    </Button>
                </div>
            </div>

            {/* Modals */}
            <SecretChatModal
                isOpen={showSecretModal}
                onClose={() => setShowSecretModal(false)}
                onToggle={handleSecretModeToggle}
                isEnabled={isSecretMode}
                isPremium={isPremium}
                onUpgrade={handleUpgrade}
            />

            <WallpaperSelector
                isOpen={showWallpaperSelector}
                onClose={() => setShowWallpaperSelector(false)}
                onSelect={handleWallpaperSelect}
                currentWallpaper={currentWallpaper}
                isPremium={isPremium}
                onUpgrade={handleUpgrade}
            />

            {/* PremiumPaywall now moved to separate /premium page */}
        </div>
    );
}