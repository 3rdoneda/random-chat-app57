import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Heart, Clock, Coins, Users, X, Loader, MessageCircle, MapPin } from "lucide-react";
import { useCoin } from "../context/CoinProvider";

interface FriendRequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept: () => void;
  onDecline: () => void;
  partnerName: string;
  partnerAge?: number;
  partnerLocation?: string;
  partnerImage?: string;
  isWaitingForPartner: boolean;
  partnerAccepted?: boolean | null;
  timeLeft: number;
}

export default function FriendRequestModal({
  isOpen,
  onClose,
  onAccept,
  onDecline,
  partnerName,
  partnerAge = 25,
  partnerLocation = "Unknown Location",
  partnerImage,
  isWaitingForPartner,
  partnerAccepted,
  timeLeft,
}: FriendRequestModalProps) {
  const { coins } = useCoin();
  const [myChoice, setMyChoice] = useState<boolean | null>(null);
  const friendshipCost = 20;
  const hasEnoughCoins = coins >= friendshipCost;

  if (!isOpen) return null;

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleAccept = () => {
    setMyChoice(true);
    onAccept();
  };

  const handleDecline = () => {
    setMyChoice(false);
    onDecline();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-sm bg-white shadow-2xl border-0 overflow-hidden relative">
        {/* Profile Card - Dating App Style */}
        <div className="relative h-96 bg-gradient-to-b from-transparent to-black/60 overflow-hidden">
          {/* Background Image */}
          <div className="absolute inset-0">
            {partnerImage ? (
              <img
                src={partnerImage}
                alt={partnerName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-passion-400 via-romance-500 to-royal-600 flex items-center justify-center">
                <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center text-6xl text-white">
                  {partnerName.charAt(0)}
                </div>
              </div>
            )}
          </div>

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-10 h-10 bg-black/40 backdrop-blur-sm rounded-full flex items-center justify-center text-white hover:bg-black/60 transition-colors z-10"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Timer */}
          <div className="absolute top-4 left-4 bg-black/40 backdrop-blur-sm rounded-full px-3 py-1 flex items-center gap-2 text-white text-sm">
            <Clock className="w-4 h-4" />
            <span>{formatTime(timeLeft)}</span>
          </div>

          {/* Profile Info */}
          <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">
                {partnerName}, {partnerAge}
              </h2>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            <div className="flex items-center gap-1 text-white/80 text-sm mb-4">
              <MapPin className="w-4 h-4" />
              <span>{partnerLocation}</span>
            </div>

            {!isWaitingForPartner && myChoice === null && (
              <>
                {/* Action Buttons - Dating App Style */}
                <div className="flex items-center justify-center gap-6 mb-4">
                  {/* Decline Button */}
                  <button
                    onClick={handleDecline}
                    className="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110"
                  >
                    <X className="w-6 h-6 text-white" />
                  </button>

                  {/* Message Button */}
                  <button
                    className="w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center hover:bg-white/30 transition-all duration-200 hover:scale-110"
                  >
                    <MessageCircle className="w-5 h-5 text-white" />
                  </button>

                  {/* Accept Button */}
                  <button
                    onClick={handleAccept}
                    className="w-14 h-14 bg-gradient-to-r from-passion-500 to-romance-600 rounded-full flex items-center justify-center hover:from-passion-600 hover:to-romance-700 transition-all duration-200 hover:scale-110 shadow-lg"
                  >
                    <Heart className="w-6 h-6 text-white fill-current" />
                  </button>
                </div>

                {/* View Profile Button */}
                <Button
                  className="w-full bg-white/90 backdrop-blur-sm text-gray-800 hover:bg-white font-semibold py-3 rounded-xl border-0"
                >
                  Add as Friend
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Bottom Content */}
        <CardContent className="p-6">
          {!isWaitingForPartner && myChoice === null && (
            <div className="space-y-4">
              {/* Coin Cost Info */}
              <div className="bg-gradient-to-r from-romance-50 to-passion-50 rounded-xl p-4 border border-romance-200">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-8 h-8 bg-romance-500 rounded-full flex items-center justify-center">
                    <Coins className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-gray-800">Friendship Cost</p>
                    <p className="text-sm text-gray-600">20 coins will be deducted</p>
                  </div>
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Your balance:</span>
                  <div className="flex items-center gap-2">
                    <Coins className="w-4 h-4 text-yellow-500" />
                    <span className={`font-bold ${hasEnoughCoins ? 'text-green-600' : 'text-red-500'}`}>
                      {coins} coins
                    </span>
                  </div>
                </div>
                
                {!hasEnoughCoins && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm font-medium mb-2">
                      💰 YOU DON'T HAVE ENOUGH BALANCE, RECHARGE NOW
                    </p>
                    <p className="text-red-600 text-xs">
                      OR, Watch 2 ads after the call to continue
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {isWaitingForPartner && (
            <div className="text-center space-y-4">
              <div className="w-16 h-16 mx-auto bg-gradient-to-r from-romance-100 to-passion-100 rounded-full flex items-center justify-center">
                <Loader className="w-8 h-8 text-romance-500 animate-spin" />
              </div>
              
              {myChoice === true ? (
                <div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">
                    Waiting for {partnerName}...
                  </p>
                  <p className="text-gray-600 text-sm">
                    You chose to be friends! Let's see what {partnerName} decides.
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-semibold text-gray-800 mb-2">
                    You declined the friendship
                  </p>
                  <p className="text-gray-600 text-sm">
                    Waiting for {partnerName}'s response to end the call.
                  </p>
                </div>
              )}
            </div>
          )}

          {partnerAccepted !== null && !isWaitingForPartner && (
            <div className="text-center space-y-4">
              {partnerAccepted && myChoice === true ? (
                <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                  <div className="w-16 h-16 mx-auto bg-green-500 rounded-full flex items-center justify-center mb-4">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-green-700 mb-2">
                    🎉 You're Now Friends!
                  </h3>
                  <p className="text-green-600">
                    Both of you agreed! Continue chatting and find {partnerName} in your friends list.
                  </p>
                  {hasEnoughCoins && (
                    <p className="text-sm text-green-600 mt-2">
                      20 coins have been deducted from your account.
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                  <div className="w-16 h-16 mx-auto bg-gray-400 rounded-full flex items-center justify-center mb-4">
                    <X className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-700 mb-2">
                    Friendship Declined
                  </h3>
                  <p className="text-gray-600">
                    {myChoice === false 
                      ? "You chose not to be friends." 
                      : `${partnerName} declined the friendship request.`
                    }
                  </p>
                  <p className="text-sm text-gray-500 mt-2">
                    The call will end now.
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}