import React, { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import BottomNavBar from "../components/BottomNavBar";
import UltraBottomNavBar from "../components/UltraBottomNavBar";
import { UltraPageTransition } from "../components/UltraBottomNavBar";
import { usePremium } from "../context/PremiumProvider";
import { useCoin } from "../context/CoinProvider";
import { useFriends } from "../context/FriendsProvider";
import { useSocket } from "../context/SocketProvider";
import { useInterstitialAd } from "../hooks/useInterstitialAd";
import { useFaceFilters } from "../hooks/useFaceFilters";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import Messages from "../components/Messages";
import ChatTimer from "../components/ChatTimer";
import VoiceOnlyToggle from "../components/VoiceOnlyToggle";
import FriendRequestModal from "../components/FriendRequestModal";
import StayConnectedModal from "../components/StayConnectedModal";
import FaceFilterPanel from "../components/FaceFilterPanel";
import PhotoSharingInput from "../components/PhotoSharingInput";
import PremiumReactions from "../components/PremiumReactions";
import ReportUserModal from "../components/ReportUserModal";
import BlockUserModal from "../components/BlockUserModal";
import PendingAdsModal from "../components/PendingAdsModal";
import {
  ArrowLeft,
  Video,
  VideoOff,
  Mic,
  MicOff,
  PhoneOff,
  RotateCcw,
  Camera,
  Flag,
  UserX,
  Heart,
  Users,
  Crown,
  Sparkles,
  Zap,
  Filter,
  Image as ImageIcon,
  Loader,
  AlertTriangle,
  CheckCircle,
  Clock,
  Gift,
  Play,
  Gamepad2,
} from "lucide-react";
import peerService from "../service/peer";
import MockWebRTC from "../lib/mockWebRTC";
import { playSound } from "../lib/audio";
import { Analytics } from "../hooks/useAnalytics";
import { FaceFilter } from "../lib/faceFilters";
import "../css/VideoChat.css";

interface LocationState {
  friendCall?: boolean;
  friendId?: string;
  friendName?: string;
  genderFilter?: string;
  voiceOnly?: boolean;
  isSearching?: boolean;
}

const VideoChat: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;
  const { socket, isUsingMockMode } = useSocket();
  const { isPremium, isUltraPremium, isProMonthly } = usePremium();
  const { coins, deductCoins, pendingAds, setPendingAds } = useCoin();
  const { addFriend } = useFriends();
  const { showOnVideoCallEnd } = useInterstitialAd();

  // Video and audio refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const localStreamRef = useRef<MediaStream | null>(null);
  const remoteStreamRef = useRef<MediaStream | null>(null);

  // Face filters
  const { currentFilter, applyFilter, removeFilter } = useFaceFilters(remoteVideoRef.current);

  // Component state
  const [isConnected, setIsConnected] = useState(false);
  const [isSearching, setIsSearching] = useState(state?.isSearching || false);
  const [remoteChatToken, setRemoteChatToken] = useState<string | null>(null);
  const [messagesArray, setMessagesArray] = useState<Array<{ sender: string; message: string; id?: string; isSecret?: boolean; timestamp?: number; isRead?: boolean }>>([]);
  const [isVideoEnabled, setIsVideoEnabled] = useState(true);
  const [isAudioEnabled, setIsAudioEnabled] = useState(true);
  const [isVoiceOnly, setIsVoiceOnly] = useState(state?.voiceOnly || false);
  const [partnerPremium, setPartnerPremium] = useState(false);
  const [connectionError, setConnectionError] = useState<string>("");
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 3;

  // Modal states
  const [showFriendRequest, setShowFriendRequest] = useState(false);
  const [showStayConnected, setShowStayConnected] = useState(false);
  const [showFaceFilters, setShowFaceFilters] = useState(false);
  const [showPhotoSharing, setShowPhotoSharing] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [showBlockModal, setShowBlockModal] = useState(false);
  const [showPendingAds, setShowPendingAds] = useState(false);

  // Friend request state
  const [friendRequestState, setFriendRequestState] = useState<{
    isWaiting: boolean;
    partnerAccepted: boolean | null;
    timeLeft: number;
  }>({
    isWaiting: false,
    partnerAccepted: null,
    timeLeft: 30,
  });

  // Partner info
  const [partnerInfo, setPartnerInfo] = useState({
    name: state?.friendName || "Stranger",
    age: 25,
    location: "Unknown Location",
    image: "",
  });

  // Initialize media stream
  useEffect(() => {
    initializeMedia();
    return () => {
      cleanup();
    };
  }, []);

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    const handleUserConnect = (partnerId: string) => {
      console.log("🔗 Connected to partner:", partnerId);
      setRemoteChatToken(partnerId);
      setIsConnected(true);
      setIsSearching(false);
      setConnectionError("");
      setRetryCount(0);
      playSound("match");
      Analytics.chatStarted(state?.friendCall ? 'friend' : 'random');
    };

    const handleOffer = async ({ offer, from }: { offer: RTCSessionDescriptionInit; from: string }) => {
      console.log("📨 Received offer from:", from);
      try {
        const answer = await peerService.getAnswer(offer);
        if (answer && socket) {
          socket.emit("answer", { answer, to: from });
        }
      } catch (error) {
        console.error("Error handling offer:", error);
        setConnectionError("Failed to establish connection");
      }
    };

    const handleAnswer = async ({ answer }: { answer: RTCSessionDescriptionInit }) => {
      console.log("📨 Received answer");
      try {
        await peerService.setRemoteDescription(answer);
      } catch (error) {
        console.error("Error handling answer:", error);
        setConnectionError("Failed to complete connection");
      }
    };

    const handleIceCandidate = async ({ candidate }: { candidate: RTCIceCandidateInit }) => {
      try {
        await peerService.peer.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (error) {
        console.error("Error adding ICE candidate:", error);
      }
    };

    const handlePartnerDisconnected = () => {
      console.log("💔 Partner disconnected");
      handleCallEnd();
    };

    const handleSkipped = () => {
      console.log("⏭️ Partner skipped");
      handleCallEnd();
    };

    const handlePremiumStatus = ({ isPremium }: { isPremium: boolean }) => {
      setPartnerPremium(isPremium);
    };

    // Register socket listeners
    socket.on("user:connect", handleUserConnect);
    socket.on("offer", handleOffer);
    socket.on("answer", handleAnswer);
    socket.on("ice-candidate", handleIceCandidate);
    socket.on("partnerDisconnected", handlePartnerDisconnected);
    socket.on("skipped", handleSkipped);
    socket.on("partner:premium:status", handlePremiumStatus);

    // Setup peer connection events
    if (peerService.peer) {
      peerService.peer.ontrack = (event) => {
        console.log("🎥 Received remote stream");
        const [remoteStream] = event.streams;
        remoteStreamRef.current = remoteStream;
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream;
        }
      };

      peerService.peer.onicecandidate = (event) => {
        if (event.candidate && socket && remoteChatToken) {
          socket.emit("ice-candidate", {
            candidate: event.candidate,
            to: remoteChatToken,
          });
        }
      };
    }

    return () => {
      socket.off("user:connect", handleUserConnect);
      socket.off("offer", handleOffer);
      socket.off("answer", handleAnswer);
      socket.off("ice-candidate", handleIceCandidate);
      socket.off("partnerDisconnected", handlePartnerDisconnected);
      socket.off("skipped", handleSkipped);
      socket.off("partner:premium:status", handlePremiumStatus);
    };
  }, [socket, remoteChatToken]);

  // Auto-search for match
  useEffect(() => {
    if (isSearching && socket && !isConnected) {
      console.log("🔍 Starting search for match...");
      socket.emit("find:match");
      
      // Set timeout for search
      const searchTimeout = setTimeout(() => {
        if (!isConnected) {
          if (retryCount < maxRetries) {
            console.log(`🔄 Retrying search... (${retryCount + 1}/${maxRetries})`);
            setRetryCount(prev => prev + 1);
            socket.emit("find:match");
          } else {
            setConnectionError("Unable to find a match. Please try again.");
            setIsSearching(false);
          }
        }
      }, 10000); // 10 second timeout

      return () => clearTimeout(searchTimeout);
    }
  }, [isSearching, socket, isConnected, retryCount]);

  // Mock WebRTC for testing
  useEffect(() => {
    if (isUsingMockMode && isSearching && !isConnected) {
      console.log("🤖 Using mock mode - simulating connection");
      setTimeout(() => {
        setIsConnected(true);
        setIsSearching(false);
        setRemoteChatToken("mock_partner");
        
        // Simulate remote stream
        MockWebRTC.simulateConnection((stream) => {
          remoteStreamRef.current = stream;
          if (remoteVideoRef.current) {
            remoteVideoRef.current.srcObject = stream;
          }
        });
      }, 2000);
    }
  }, [isUsingMockMode, isSearching, isConnected]);

  const initializeMedia = async () => {
    try {
      const constraints = {
        video: !isVoiceOnly,
        audio: true,
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      // Add stream to peer connection
      if (peerService.peer) {
        stream.getTracks().forEach((track) => {
          peerService.peer.addTrack(track, stream);
        });
      }

      console.log("📹 Local media initialized");
    } catch (error) {
      console.error("❌ Error accessing media devices:", error);
      setConnectionError("Unable to access camera/microphone. Please check permissions.");
    }
  };

  const cleanup = () => {
    // Stop local stream
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }

    // Stop remote stream
    if (remoteStreamRef.current) {
      remoteStreamRef.current.getTracks().forEach((track) => track.stop());
      remoteStreamRef.current = null;
    }

    // Close peer connection
    if (peerService.peer) {
      peerService.peer.close();
      peerService.initPeer();
    }
  };

  const handleCallEnd = useCallback(async () => {
    console.log("📞 Ending call...");
    
    // Show interstitial ad after call ends (for non-premium users)
    if (!isPremium) {
      await showOnVideoCallEnd();
    }

    // Cleanup connections
    cleanup();
    
    // Reset state
    setIsConnected(false);
    setRemoteChatToken(null);
    setMessagesArray([]);
    setShowFriendRequest(false);
    setShowStayConnected(false);
    
    // Navigate back
    navigate("/");
  }, [navigate, isPremium, showOnVideoCallEnd]);

  const handleSkip = useCallback(() => {
    if (socket && remoteChatToken) {
      socket.emit("skip");
    }
    handleCallEnd();
  }, [socket, remoteChatToken, handleCallEnd]);

  const toggleVideo = useCallback(() => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoEnabled(videoTrack.enabled);
      }
    }
  }, []);

  const toggleAudio = useCallback(() => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioEnabled(audioTrack.enabled);
      }
    }
  }, []);

  const handleVoiceOnlyToggle = (voiceOnly: boolean) => {
    setIsVoiceOnly(voiceOnly);
    // Reinitialize media with new constraints
    cleanup();
    setTimeout(() => {
      initializeMedia();
    }, 100);
  };

  const handleTimeUp = () => {
    alert("⏰ Time's up! Upgrade to Premium for unlimited chat time.");
    handleCallEnd();
  };

  const handleUpgrade = () => {
    navigate("/premium");
  };

  const handleFriendRequest = async () => {
    const friendshipCost = 20;
    
    if (coins >= friendshipCost) {
      const success = await deductCoins(friendshipCost);
      if (success) {
        setShowFriendRequest(true);
        setFriendRequestState({
          isWaiting: false,
          partnerAccepted: null,
          timeLeft: 30,
        });
      }
    } else {
      // Not enough coins, show pending ads modal
      setPendingAds(2);
      setShowPendingAds(true);
    }
  };

  const handleFriendRequestResponse = (wantToStay: boolean) => {
    setFriendRequestState(prev => ({
      ...prev,
      isWaiting: true,
    }));

    if (socket && remoteChatToken) {
      socket.emit("stay:connected:response", {
        wantToStay,
        targetChatToken: remoteChatToken,
      });
    }

    // Simulate partner response after 3 seconds
    setTimeout(() => {
      const partnerAccepted = Math.random() > 0.3; // 70% chance of acceptance
      setFriendRequestState(prev => ({
        ...prev,
        isWaiting: false,
        partnerAccepted,
      }));

      if (wantToStay && partnerAccepted) {
        // Add friend
        addFriend(remoteChatToken!, partnerInfo.name, partnerInfo.image);
        setTimeout(() => {
          setShowFriendRequest(false);
          alert("🎉 You're now friends! Find them in your friends list.");
        }, 2000);
      } else {
        setTimeout(() => {
          setShowFriendRequest(false);
          handleCallEnd();
        }, 2000);
      }
    }, 3000);
  };

  const handleFilterSelect = (filter: FaceFilter) => {
    applyFilter(filter);
  };

  const handlePhotoShare = (photoUrl: string) => {
    setShowPhotoSharing(false);
    // Add photo message to chat
    const photoMessage = {
      sender: "You",
      message: "📷 Photo",
      id: Date.now().toString(),
      timestamp: Date.now(),
      photoUrl,
    };
    setMessagesArray(prev => [...prev, photoMessage]);
    
    // Send to partner via socket
    if (socket && remoteChatToken) {
      socket.emit("send:message", {
        message: "📷 Photo",
        targetChatToken: remoteChatToken,
        photoUrl,
      });
    }
  };

  const handleReport = (reason: string) => {
    console.log("🚨 Reporting user for:", reason);
    Analytics.userReported(reason);
    setShowReportModal(false);
    alert("✅ User reported. Thank you for keeping AjnabiCam safe!");
    handleCallEnd();
  };

  const handleBlock = () => {
    console.log("🚫 Blocking user");
    setShowBlockModal(false);
    alert("✅ User blocked. You won't be matched with them again.");
    handleCallEnd();
  };

  const handlePendingAdsComplete = () => {
    setShowPendingAds(false);
    // Continue with friend request
    setShowFriendRequest(true);
  };

  const handleFlairSend = () => {
    console.log("💖 Sending premium flair");
    Analytics.premiumFeatureUsed('premium_reactions');
  };

  const handleSuperEmoji = () => {
    console.log("⭐ Sending super emoji");
    Analytics.premiumFeatureUsed('super_emoji');
  };

  const startSearch = () => {
    setIsSearching(true);
    setConnectionError("");
    setRetryCount(0);
    
    if (socket) {
      socket.emit("find:match");
    }
  };

  const retryConnection = () => {
    setConnectionError("");
    startSearch();
  };

  return (
    <>
      <Helmet>
        <title>AjnabiCam - Video Chat</title>
      </Helmet>
      <UltraPageTransition>
        <main className={`flex flex-col min-h-screen w-full ${
          isUltraPremium() 
            ? 'max-w-full' 
            : 'max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl'
        } mx-auto ${
          isUltraPremium() 
            ? 'bg-gradient-to-br from-white/95 via-purple-50/90 to-pink-50/90' 
            : 'bg-white'
        } relative`}>

          {/* Header */}
          <div className={`w-full flex items-center justify-between p-4 ${
            isUltraPremium() 
              ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
              : 'bg-gradient-to-r from-rose-500 to-pink-600'
          } text-white shadow-lg relative z-10`}>
            <button
              onClick={handleCallEnd}
              className="text-white hover:scale-110 transition-transform p-2 rounded-full hover:bg-white/20 min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
            >
              <ArrowLeft size={24} />
            </button>

            <div className="flex-1 text-center">
              <h1 className="font-bold text-lg">
                {state?.friendCall ? `Call with ${partnerInfo.name}` : "Video Chat"}
              </h1>
              {isConnected && (
                <div className="flex items-center justify-center gap-2 text-sm">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span>Connected</span>
                </div>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isConnected && (
                <>
                  <button
                    onClick={() => setShowReportModal(true)}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                  >
                    <Flag size={20} />
                  </button>
                  <button
                    onClick={() => setShowBlockModal(true)}
                    className="p-2 rounded-full hover:bg-white/20 transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center touch-manipulation"
                  >
                    <UserX size={20} />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 flex flex-col">
            {!isConnected && !isSearching ? (
              /* Waiting Screen */
              <div className="flex-1 flex items-center justify-center p-6">
                <Card className="w-full max-w-md text-center">
                  <CardContent className="p-8">
                    <div className="text-6xl mb-4">📹</div>
                    <h2 className="text-2xl font-bold text-gray-800 mb-4">
                      Ready to Connect?
                    </h2>
                    <p className="text-gray-600 mb-6">
                      Start a video chat with someone new from around the world
                    </p>
                    
                    {connectionError && (
                      <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                        <div className="flex items-center gap-2 text-red-700">
                          <AlertTriangle className="h-4 w-4" />
                          <span className="text-sm">{connectionError}</span>
                        </div>
                      </div>
                    )}

                    <div className="space-y-4">
                      <VoiceOnlyToggle
                        isPremium={isPremium}
                        isVoiceOnly={isVoiceOnly}
                        onToggle={handleVoiceOnlyToggle}
                        onUpgrade={handleUpgrade}
                      />

                      <Button
                        onClick={connectionError ? retryConnection : startSearch}
                        className="w-full py-4 text-lg font-bold rounded-2xl bg-gradient-to-r from-rose-500 to-pink-600 text-white shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 min-h-[56px] touch-manipulation"
                      >
                        <Video className="h-5 w-5 mr-2" />
                        {connectionError ? "Retry Connection" : "Start Video Chat"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : isSearching ? (
              /* Searching Screen */
              <div className="flex-1 flex items-center justify-center p-6">
                <Card className="w-full max-w-md text-center">
                  <CardContent className="p-8">
                    <div className="relative mb-6">
                      <div className="w-20 h-20 mx-auto bg-gradient-to-r from-rose-500 to-pink-600 rounded-full flex items-center justify-center">
                        <Loader className="h-10 w-10 text-white animate-spin" />
                      </div>
                      <div className="absolute inset-0 w-20 h-20 mx-auto border-4 border-rose-200 rounded-full animate-ping"></div>
                    </div>
                    
                    <h2 className="text-2xl font-bold text-gray-800 mb-2">
                      Finding Your Match...
                    </h2>
                    <p className="text-gray-600 mb-4">
                      Looking for someone awesome to chat with
                    </p>
                    
                    <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      <span>This usually takes 5-10 seconds</span>
                    </div>

                    <Button
                      onClick={handleCallEnd}
                      variant="outline"
                      className="w-full mt-6 min-h-[44px] touch-manipulation"
                    >
                      Cancel Search
                    </Button>
                  </CardContent>
                </Card>
              </div>
            ) : (
              /* Video Chat Interface */
              <div className="flex-1 flex flex-col">
                {/* Video Container */}
                <div className="relative flex-1 bg-black">
                  {/* Remote Video */}
                  <video
                    ref={remoteVideoRef}
                    autoPlay
                    playsInline
                    className="w-full h-full object-cover"
                    style={{ transform: currentFilter ? 'none' : 'scaleX(-1)' }}
                  />

                  {/* Local Video (Picture-in-Picture) */}
                  <div className="absolute top-4 right-4 w-24 h-32 sm:w-32 sm:h-40 bg-gray-800 rounded-lg overflow-hidden shadow-lg">
                    <video
                      ref={localVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                      style={{ transform: 'scaleX(-1)' }}
                    />
                  </div>

                  {/* Controls Overlay */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-3 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
                    <button
                      onClick={toggleAudio}
                      className={`p-3 rounded-full transition-all min-h-[48px] min-w-[48px] touch-manipulation ${
                        isAudioEnabled 
                          ? 'bg-white/20 text-white hover:bg-white/30' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {isAudioEnabled ? <Mic size={20} /> : <MicOff size={20} />}
                    </button>

                    <button
                      onClick={toggleVideo}
                      className={`p-3 rounded-full transition-all min-h-[48px] min-w-[48px] touch-manipulation ${
                        isVideoEnabled 
                          ? 'bg-white/20 text-white hover:bg-white/30' 
                          : 'bg-red-500 text-white hover:bg-red-600'
                      }`}
                    >
                      {isVideoEnabled ? <Video size={20} /> : <VideoOff size={20} />}
                    </button>

                    <button
                      onClick={handleCallEnd}
                      className="p-3 rounded-full bg-red-500 text-white hover:bg-red-600 transition-all min-h-[48px] min-w-[48px] touch-manipulation"
                    >
                      <PhoneOff size={20} />
                    </button>

                    <button
                      onClick={handleSkip}
                      className="p-3 rounded-full bg-gray-500 text-white hover:bg-gray-600 transition-all min-h-[48px] min-w-[48px] touch-manipulation"
                    >
                      <RotateCcw size={20} />
                    </button>
                  </div>

                  {/* ULTRA+ Face Filters Button */}
                  {isUltraPremium() && (
                    <button
                      onClick={() => setShowFaceFilters(true)}
                      className="absolute top-4 left-4 p-3 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all min-h-[48px] min-w-[48px] touch-manipulation"
                    >
                      <Filter size={20} />
                    </button>
                  )}

                  {/* Premium Reactions */}
                  {(isUltraPremium() || isProMonthly()) && (
                    <div className="absolute bottom-20 right-4">
                      <PremiumReactions
                        onFlairSend={handleFlairSend}
                        onSuperEmoji={handleSuperEmoji}
                        disabled={false}
                        isVisible={true}
                      />
                    </div>
                  )}

                  {/* Photo Sharing Button */}
                  <button
                    onClick={() => setShowPhotoSharing(true)}
                    className="absolute bottom-4 left-4 p-3 bg-blue-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all min-h-[48px] min-w-[48px] touch-manipulation"
                  >
                    <ImageIcon size={20} />
                  </button>

                  {/* Friend Request Button (appears after 7 minutes) */}
                  {!state?.friendCall && (
                    <button
                      onClick={handleFriendRequest}
                      className="absolute top-1/2 right-4 transform -translate-y-1/2 p-3 bg-gradient-to-r from-pink-500 to-rose-500 text-white rounded-full shadow-lg hover:shadow-xl transition-all min-h-[48px] min-w-[48px] touch-manipulation"
                    >
                      <Heart size={20} />
                    </button>
                  )}
                </div>

                {/* Chat Timer */}
                <ChatTimer
                  isPremium={isPremium}
                  isConnected={isConnected}
                  partnerPremium={partnerPremium}
                  onTimeUp={handleTimeUp}
                  onUpgrade={handleUpgrade}
                  onFriendRequestTime={handleFriendRequest}
                  isFriendCall={state?.friendCall}
                  isUltraPremium={isUltraPremium()}
                />

                {/* Messages */}
                <div className="h-64 border-t border-gray-200">
                  <Messages
                    remoteChatToken={remoteChatToken}
                    messagesArray={messagesArray}
                    setMessagesArray={setMessagesArray}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation */}
          {!isConnected && (isUltraPremium() ? <UltraBottomNavBar /> : <BottomNavBar />)}
        </main>
      </UltraPageTransition>

      {/* Modals */}
      <FriendRequestModal
        isOpen={showFriendRequest}
        onClose={() => setShowFriendRequest(false)}
        onAccept={() => handleFriendRequestResponse(true)}
        onDecline={() => handleFriendRequestResponse(false)}
        partnerName={partnerInfo.name}
        partnerAge={partnerInfo.age}
        partnerLocation={partnerInfo.location}
        partnerImage={partnerInfo.image}
        isWaitingForPartner={friendRequestState.isWaiting}
        partnerAccepted={friendRequestState.partnerAccepted}
        timeLeft={friendRequestState.timeLeft}
      />

      <StayConnectedModal
        isOpen={showStayConnected}
        onClose={() => setShowStayConnected(false)}
        onStayConnected={handleFriendRequestResponse}
        partnerName={partnerInfo.name}
      />

      <FaceFilterPanel
        isOpen={showFaceFilters}
        onClose={() => setShowFaceFilters(false)}
        onFilterSelect={handleFilterSelect}
        currentFilter={currentFilter}
        isUltraPremium={isUltraPremium()}
        onUpgrade={handleUpgrade}
      />

      <PhotoSharingInput
        isOpen={showPhotoSharing}
        onClose={() => setShowPhotoSharing(false)}
        onPhotoSelected={handlePhotoShare}
        chatId={remoteChatToken || "default"}
        userId="current-user"
      />

      <ReportUserModal
        isOpen={showReportModal}
        onClose={() => setShowReportModal(false)}
        onSubmit={handleReport}
      />

      <BlockUserModal
        isOpen={showBlockModal}
        onClose={() => setShowBlockModal(false)}
        onBlock={handleBlock}
      />

      <PendingAdsModal
        isOpen={showPendingAds}
        onAllAdsWatched={handlePendingAdsComplete}
        reason="friendship"
        partnerName={partnerInfo.name}
      />
    </>
  );
};

export default VideoChat;