import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import BottomNavBar from '../components/BottomNavBar';
import UltraBottomNavBar from '../components/UltraBottomNavBar';
import UltraPremiumFriendsEnhancement from '../components/UltraPremiumFriendsEnhancement';
import { UltraPageTransition } from '../components/UltraBottomNavBar';
// import PremiumPaywall from '../components/PremiumPaywall'; // Now using separate page
import { Button } from '../components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { ArrowLeft, Video, Crown, Users, Trash2, UserPlus } from 'lucide-react';
import { useFriends } from '../context/FriendsProvider';
import { usePremium } from '../context/PremiumProvider';

const FriendsPage: React.FC = () => {
  const navigate = useNavigate();
  const { friends, removeFriend, canAddMoreFriends, maxFreeLimit } = useFriends();
  const { isPremium, setPremium, isUltraPremium } = usePremium();
  // const [showPaywall, setShowPaywall] = useState(false); // Now using separate page

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleVideoCall = (friendId: string, friendName: string) => {
    // Show rewarded ad before call
    alert("🎬 Watch this ad to start your call with " + friendName);
    
    // Navigate to video chat with friend
    navigate('/video-chat', { 
      state: { 
        friendCall: true, 
        friendId, 
        friendName 
      } 
    });
  };

  const handleRemoveFriend = (friendId: string, friendName: string) => {
    if (confirm(`Remove ${friendName} from your friends list?`)) {
      removeFriend(friendId);
    }
  };

  const handleUpgrade = () => {
    navigate('/premium');
  };

  const handlePremiumPurchase = (plan: string) => {
    const now = new Date();
    const expiry = new Date(now);
    if (plan === "weekly") {
      expiry.setDate(now.getDate() + 7);
    } else {
      expiry.setMonth(now.getMonth() + 1);
    }
    
    setPremium(true, expiry);
    // setShowPaywall(false); // Now handled in PremiumPage
    alert(`🎉 Welcome to Premium! You can now add unlimited friends!`);
  };

  const formatLastSeen = (lastSeen?: Date) => {
    if (!lastSeen) return '';
    
    const now = new Date();
    const diffMs = now.getTime() - lastSeen.getTime();
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    return `${diffDays}d ago`;
  };

  return (
    <>
      <Helmet>
        <title>AjnabiCam - Friends</title>
      </Helmet>
      <UltraPageTransition>
        <main className={`flex flex-col items-center min-h-screen w-full ${
          isUltraPremium() 
            ? 'max-w-full' 
            : 'max-w-md sm:max-w-lg md:max-w-xl lg:max-w-2xl xl:max-w-4xl'
        } mx-auto ${
          isUltraPremium() 
            ? 'bg-gradient-to-br from-white/95 via-purple-50/90 to-pink-50/90' 
            : 'bg-white'
        } px-2 sm:px-4 lg:px-6 py-4 sm:py-6 lg:py-8 relative pb-20 sm:pb-24 lg:pb-28`}>
        {/* Header */}
        <div className={`w-full flex items-center p-4 ${
          isUltraPremium() 
            ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
            : 'bg-gradient-to-r from-rose-500 to-pink-600'
        } text-white font-bold text-xl rounded-t-2xl shadow-lg`}>
          <button 
            onClick={handleBackClick} 
            className="mr-3 text-white font-bold text-xl hover:scale-110 transition-transform"
          >
            <ArrowLeft size={24} />
          </button>
          <h1 className="flex-grow text-center">Friends</h1>
          <Users className="h-6 w-6" />
        </div>

        <div className={`w-full flex flex-col ${
          isUltraPremium() 
            ? 'bg-white/90 backdrop-blur-lg border border-purple-200' 
            : 'bg-white border border-pink-100'
        } rounded-b-2xl shadow-xl mb-6 overflow-hidden`}>
          {/* Friends Limit Info */}
          <div className="p-4 bg-gradient-to-r from-pink-50 to-rose-50 border-b border-pink-100">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-rose-800">Your Friends</h3>
                <p className="text-sm text-rose-600">
                  {isPremium 
                    ? `${friends.length} friends (Unlimited)` 
                    : `${friends.length}/${maxFreeLimit} friends (Free)`
                  }
                </p>
              </div>
              
              {!isPremium && (
                <Button
                  onClick={handleUpgrade}
                  size="sm"
                  className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Crown className="h-4 w-4 mr-1" />
                  Upgrade
                </Button>
              )}
            </div>
            
            {!canAddMoreFriends && (
              <div className="mt-3 p-3 bg-orange-100 rounded-lg border border-orange-200">
                <p className="text-sm text-orange-700 font-medium">
                  🚫 You've reached the free limit of {maxFreeLimit} friends. Upgrade to Premium for unlimited friends!
                </p>
              </div>
            )}
          </div>

          {/* Friends List */}
          <div className="flex-1 overflow-y-auto max-h-96">
            {friends.length > 0 ? (
              friends.map((friend) => (
                <div
                  key={friend.id}
                  className="flex items-center p-4 border-b border-pink-100 hover:bg-pink-50 transition-colors"
                >
                  <div className="relative">
                    <img
                      src={friend.avatar}
                      alt={`${friend.name} avatar`}
                      className="w-12 h-12 rounded-full object-cover border-2 border-pink-200"
                    />
                    {friend.isOnline && (
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full"></div>
                    )}
                  </div>

                  <div className="ml-3 flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-800">{friend.name}</h3>
                      {friend.isOnline && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Online
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500">
                      {friend.isOnline ? 'Active now' : `Last seen ${formatLastSeen(friend.lastSeen)}`}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      onClick={() => handleVideoCall(friend.id, friend.name)}
                      size="sm"
                      className="bg-green-500 hover:bg-green-600 text-white p-2"
                      disabled={!friend.isOnline}
                    >
                      <Video className="h-4 w-4" />
                    </Button>
                    
                    <Button
                      onClick={() => handleRemoveFriend(friend.id, friend.name)}
                      size="sm"
                      variant="outline"
                      className="text-red-500 hover:bg-red-50 p-2 border-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-12 px-6 text-center">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-lg font-semibold text-gray-600 mb-2">No Friends Yet</h3>
                <p className="text-gray-500 mb-4">
                  Make friends by staying connected after video calls!
                </p>
                <Button
                  onClick={() => navigate('/video-chat')}
                  className="bg-gradient-to-r from-rose-500 to-pink-600 hover:from-rose-600 hover:to-pink-700 text-white"
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Start Meeting People
                </Button>
              </div>
            )}
          </div>

          {/* Add Friends Tip */}
          {friends.length > 0 && canAddMoreFriends && (
            <div className="p-4 bg-gradient-to-r from-green-50 to-emerald-50 border-t border-green-100">
              <p className="text-sm text-green-700 text-center">
                💡 <strong>Tip:</strong> After video calls, choose "Stay Connected" to add them as friends!
              </p>
            </div>
          )}
        </div>

        {/* ULTRA+ Friends Enhancement */}
        {isUltraPremium() && (
          <div className="w-full mb-6">
            <UltraPremiumFriendsEnhancement
              friends={friends.map(friend => ({
                id: friend.id,
                name: friend.name,
                profileImage: friend.avatar,
                isOnline: friend.isOnline,
                lastSeen: new Date(Date.now() - Math.random() * 86400000), // Random last seen within 24h
                isPremium: Math.random() > 0.7, // 30% chance premium
                mutualFriends: Math.floor(Math.random() * 5),
                totalChats: Math.floor(Math.random() * 20) + 1,
                compatibility: Math.floor(Math.random() * 40) + 60 // 60-100% compatibility
              }))}
              isUltraPremium={true}
              onVideoCall={(friendId) => {
                const friend = friends.find(f => f.id === friendId);
                handleVideoCall(friendId, friend?.name || 'Friend');
              }}
              onMessage={(friendId) => {
                // Handle message
                console.log(`Starting chat with friend ${friendId}`);
              }}
            />
          </div>
        )}

        {/* Use UltraBottomNavBar for ULTRA+ users, regular for others */}
        {isUltraPremium() ? <UltraBottomNavBar /> : <BottomNavBar />}
        </main>
      </UltraPageTransition>

      {/* PremiumPaywall now moved to separate /premium page */}
    </>
  );
};

export default FriendsPage;
