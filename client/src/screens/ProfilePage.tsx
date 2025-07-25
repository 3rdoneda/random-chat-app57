import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import UltraProfileEnhancements from "../components/UltraProfileEnhancements";
import UltraBottomNavBar from "../components/UltraBottomNavBar";
import { UltraPageTransition } from "../components/UltraBottomNavBar";
import {
  Camera,
  ArrowLeft,
  MapPin,
  Briefcase,
  Eye,
  Star,
  Edit3,
  Settings,
  Crown,
  Heart,
  Users,
  MessageCircle,
  Calendar,
  Coffee,
  Music,
  Book,
  Plane,
  Camera as CameraIcon,
  Plus,
  Sparkles,
  Zap,
  Trophy,
  Award,
  Target,
  TrendingUp,
  Clock,
  MapPin as LocationIcon,
  Phone,
  Mail,
  Instagram,
  Twitter,
  Share2,
  MoreHorizontal,
  Verified,
  Shield,
  Gift,
  Flame,
  Activity,
  Bell,
  Download,
  Upload,
  Link,
  Copy,
  ChevronRight,
  ChevronDown,
  ChevronUp,
  Image as ImageIcon,
  Video,
  Mic,
  HeartHandshake,
  Smile,
  ThumbsUp,
  Send,
  Bookmark
} from "lucide-react";
import {
  doc,
  getDoc,
  setDoc,
  updateDoc,
  onSnapshot,
  increment
} from "firebase/firestore";
import { auth, db } from "../firebaseConfig";
import { uploadProfileImage } from "../lib/storageUtils";
import { usePremium } from "../context/PremiumProvider";
import { useCoin } from "../context/CoinProvider";
import BottomNavBar from "../components/BottomNavBar";
import WhoLikedMeModal from "../components/WhoLikedMeModal";

// Add click outside handler
function useClickOutside(ref: React.RefObject<HTMLElement>, handler: () => void) {
  useEffect(() => {
    const listener = (event: any) => {
      if (!ref.current || ref.current.contains(event.target)) {
        return;
      }
      handler();
    };
    document.addEventListener('mousedown', listener);
    document.addEventListener('touchstart', listener);
    return () => {
      document.removeEventListener('mousedown', listener);
      document.removeEventListener('touchstart', listener);
    };
  }, [ref, handler]);
}

export default function ProfilePage() {
  const shareMenuRef = useRef<HTMLDivElement>(null);
  useClickOutside(shareMenuRef, () => setShowShareMenu(false));
  const navigate = useNavigate();
  const [name, setName] = useState("Love");
  const [age, setAge] = useState(25);
  const [location, setLocation] = useState("Beverly Hills, CA");
  const [profession, setProfession] = useState("Model & Influencer");
  const [bio, setBio] = useState("Life is an adventure, let's explore it together! ✨");
  const [interests, setInterests] = useState(["Often", "Sociale drinker", "Never", "Pisces"]);
  const [profileImage, setProfileImage] = useState<string | null>("https://cdn.builder.io/api/v1/image/assets%2Fe142673ab78f4d70a642f0b5825a4793%2F9ca3a7221ed04dfaaa8b4de10c2f495e?format=webp&width=800");
  const [profileViews, setProfileViews] = useState(247);
  const [loading, setLoading] = useState(true);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showActivity, setShowActivity] = useState(false);
  const [selectedTab, setSelectedTab] = useState('overview');
  const [animationKey, setAnimationKey] = useState(0);
  const [showShareMenu, setShowShareMenu] = useState(false);
  const [showFloatingMenu, setShowFloatingMenu] = useState(false);
  const [currentMood, setCurrentMood] = useState('great');
  const [showMoodSelector, setShowMoodSelector] = useState(false);
  const [notifications, setNotifications] = useState([
    { id: 1, text: 'Sarah liked your profile!', time: Date.now() - 3600000, read: false },
    { id: 2, text: 'You have a new match!', time: Date.now() - 7200000, read: false },
  ]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentActivity] = useState([
    { id: 1, type: 'match', user: 'Sarah', time: '2 hours ago', avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: 2, type: 'like', user: 'Priya', time: '5 hours ago', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
    { id: 3, type: 'view', user: 'Anonymous', time: '8 hours ago', avatar: null },
    { id: 4, type: 'chat', user: 'Anjali', time: '1 day ago', avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop' },
  ]);
  const [achievements] = useState([
    { id: 1, title: 'First Impression', description: 'Uploaded your first photo', icon: Camera, completed: true, date: '2024-01-15' },
    { id: 2, title: 'Social Butterfly', description: 'Made 10 new friends', icon: Users, completed: true, date: '2024-01-20' },
    { id: 3, title: 'Conversation Starter', description: 'Sent 50 messages', icon: MessageCircle, completed: true, date: '2024-01-25' },
    { id: 4, title: 'Popular Profile', description: 'Get 100 profile views', icon: Eye, completed: false, progress: 85 },
    { id: 5, title: 'Heart Collector', description: 'Receive 25 likes', icon: Heart, completed: false, progress: 60 },
    { id: 6, title: 'Premium Explorer', description: 'Use premium features', icon: Crown, completed: isPremium, progress: isPremium ? 100 : 0 },
  ]);

  const { isPremium, isUltraPremium, setPremium } = usePremium();
  const { coins } = useCoin();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const user = auth.currentUser;
  const [showLikesModal, setShowLikesModal] = useState(false);
  const [likesData, setLikesData] = useState([
    {
      id: '1',
      name: 'Sarah',
      age: 24,
      location: 'Mumbai, India',
      avatar: 'https://images.pexels.com/photos/415829/pexels-photo-415829.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      timeAgo: '2 hours ago',
      isRevealed: false
    },
    {
      id: '2',
      name: 'Priya',
      age: 22,
      location: 'Delhi, India',
      avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      timeAgo: '1 day ago',
      isRevealed: false
    },
    {
      id: '3',
      name: 'Anjali',
      age: 26,
      location: 'Bangalore, India',
      avatar: 'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=150&h=150&fit=crop',
      timeAgo: '3 days ago',
      isRevealed: false
    }
  ]);

  useEffect(() => {
    if (!user) return;

    const userRef = doc(db, "users", user.uid);

    // Real-time listener
    const unsubscribe = onSnapshot(userRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setName(data.username || data.name || "Love");
        setAge(data.age || 25);
        setLocation(data.location || "Beverly Hills, CA");
        setProfession(data.profession || "Model & Influencer");
        setBio(data.bio || "Life is an adventure, let's explore it together! ✨");
        setInterests(data.interests || ["Often", "Sociale drinker", "Never", "Pisces"]);
        if (data.profileImage) {
          setProfileImage(data.profileImage);
        }
        setProfileViews(data.profileViews || Math.floor(Math.random() * 300) + 100);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Increment profile views for the current user (simulate views)
  useEffect(() => {
    if (user) {
      const timer = setTimeout(() => {
        const userRef = doc(db, "users", user.uid);
        updateDoc(userRef, {
          profileViews: increment(1)
        }).catch(() => {
          // Silently fail if document doesn't exist
        });
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    setUploadingImage(true);
    setUploadProgress(0);

    try {
      const result = await uploadProfileImage(
        file,
        user.uid,
        (progress) => setUploadProgress(progress)
      );

      setProfileImage(result.url);

      const userRef = doc(db, "users", user.uid);
      await updateDoc(userRef, {
        profileImage: result.url,
        profileImagePath: result.path,
        updatedAt: new Date()
      });

      console.log("Profile image uploaded successfully!");
    } catch (error) {
      console.error("Error uploading profile image:", error);
      alert("Failed to upload image. Please try again.");
    } finally {
      setUploadingImage(false);
      setUploadProgress(0);
    }
  };

  const handleRevealLike = (likeId: string) => {
    setLikesData(prev => prev.map(like =>
      like.id === likeId ? { ...like, isRevealed: true } : like
    ));
  };

  const handleShowLikes = () => {
    if (isPremium) {
      // Premium users can see all likes immediately
      setLikesData(prev => prev.map(like => ({ ...like, isRevealed: true })));
    }
    setShowLikesModal(true);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-passion-50 via-romance-25 to-bollywood-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-bold text-gray-600 mb-4">Please log in first</h2>
          <Button onClick={() => navigate("/onboarding")} className="bg-romance-500 text-white">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-passion-50 via-romance-25 to-bollywood-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-romance-500 mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <UltraPageTransition>
      <div className={`min-h-screen ${
        isUltraPremium() 
          ? 'bg-gradient-to-br from-white/95 via-purple-50/90 to-pink-50/90' 
          : 'bg-gradient-to-br from-peach-25 via-cream-50 to-blush-50'
      } pb-24 relative overflow-hidden`}>
      {/* Enhanced Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-6 left-6 w-16 h-16 bg-gradient-to-br from-sindoor-300 to-henna-400 opacity-15 animate-float rounded-full blur-sm"></div>
        <div className="absolute top-32 right-8 w-12 h-12 bg-gradient-to-br from-royal-300 to-gulmohar-400 opacity-25 animate-pulse rounded-full"></div>
        <div className="absolute bottom-40 left-8 w-10 h-10 bg-gradient-to-br from-jasmine-300 to-sindoor-400 opacity-20 animate-bounce rounded-full" style={{ animationDelay: '1s' }}></div>
        <div className="absolute bottom-64 right-12 w-8 h-8 bg-gradient-to-br from-passion-400 to-royal-400 opacity-15 animate-float rounded-full" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-48 left-12 w-6 h-6 bg-gradient-to-br from-coral-400 to-blush-400 opacity-30 animate-pulse rounded-full" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute top-72 right-16 w-14 h-14 bg-gradient-to-br from-peach-300 to-coral-400 opacity-10 animate-bounce rounded-full blur-sm" style={{ animationDelay: '1.5s' }}></div>
      </div>

      {/* Enhanced Header with floating elements */}
      <div className={`${
        isUltraPremium()
          ? 'bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700'
          : 'bg-gradient-to-r from-peach-400 via-coral-400 to-blush-500'
      } px-6 py-4 flex items-center justify-between border-b ${
        isUltraPremium() ? 'border-purple-300' : 'border-peach-200'
      } sticky top-0 z-50 shadow-xl relative overflow-hidden backdrop-blur-md`}>
        {/* Floating header particles */}
        <div className="absolute top-2 left-20 w-1 h-1 bg-white/60 rounded-full animate-pulse"></div>
        <div className="absolute top-6 right-32 w-1.5 h-1.5 bg-white/40 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
        <div className="absolute bottom-2 left-1/3 w-1 h-1 bg-white/50 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-jasmine-100/25 to-white/15 backdrop-blur-sm"></div>
        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-b from-transparent via-white/5 to-transparent"></div>
        
        <button
          onClick={() => navigate(-1)}
          className="relative z-10 p-3 hover:bg-white/20 transition-all duration-200 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center group"
        >
          <ArrowLeft size={22} className="text-white group-hover:scale-110 transition-transform" />
        </button>

        <h1 className="relative z-10 text-xl font-bold text-white drop-shadow-lg tracking-wide">My Profile</h1>

        <div className="relative" ref={shareMenuRef}>
          <button
            onClick={() => setShowShareMenu(!showShareMenu)}
            className="relative z-10 p-3 hover:bg-white/20 transition-all duration-200 rounded-full min-h-[44px] min-w-[44px] flex items-center justify-center group"
          >
            <MoreHorizontal size={22} className="text-white group-hover:scale-110 transition-transform" />
          </button>

          {/* Share Menu Dropdown */}
          {showShareMenu && (
            <div className="absolute right-0 top-full mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 p-2 min-w-[200px] z-50 animate-slideDown">
              <button
                onClick={() => {
                  navigate('/premium');
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Settings className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Settings</span>
              </button>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(window.location.href);
                  alert('Profile link copied!');
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Copy className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Copy Link</span>
              </button>
              <button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'My Profile',
                      text: `Check out my profile on AjnabiCam!`,
                      url: window.location.href
                    });
                  }
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Share2 className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Share Profile</span>
              </button>
              <button
                onClick={() => {
                  alert('Profile saved!');
                  setShowShareMenu(false);
                }}
                className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl transition-colors"
              >
                <Bookmark className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-800">Save Profile</span>
              </button>
            </div>
          )}
        </div>
      </div>

      <div className={`${
        isUltraPremium() ? 'max-w-2xl' : 'max-w-sm'
      } mx-auto px-6 py-8 space-y-8`}>
        {/* Enhanced Profile Image Section */}
        <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-0 overflow-hidden relative group hover:shadow-3xl transition-all duration-500">
          <div className="relative h-[55vh] overflow-hidden">
            {/* Gradient overlay for better text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20 z-10"></div>
            
            {profileImage ? (
              <img
                src={profileImage}
                alt="Profile"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-romance-300 via-passion-300 to-royal-300 flex items-center justify-center">
                <div className="text-center text-white z-20 relative">
                  <div className="w-24 h-24 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4 backdrop-blur-sm border border-white/30">
                    <span className="text-4xl font-bold">{name.charAt(0)}</span>
                  </div>
                  <p className="text-white/90 font-medium">Tap to add photo</p>
                  <p className="text-white/70 text-sm mt-1">Show your best self!</p>
                </div>
              </div>
            )}

            {/* Enhanced Upload overlay */}
            {uploadingImage && (
              <div className="absolute inset-0 bg-black/70 flex items-center justify-center z-30">
                <div className="text-center text-white bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/20">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-white/30 border-t-white mx-auto mb-4"></div>
                  <p className="text-lg font-semibold mb-2">Uploading...</p>
                  <div className="w-32 h-2 bg-white/20 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-peach-400 to-coral-500 rounded-full transition-all duration-300"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-sm text-white/80 mt-2">{uploadProgress}% complete</p>
                </div>
              </div>
            )}

            {/* Enhanced Camera button */}
            <button
              onClick={() => fileInputRef.current?.click()}
              className="absolute top-6 right-6 bg-black/30 backdrop-blur-md p-3 rounded-full hover:bg-black/50 transition-all duration-200 border border-white/20 z-20 group/camera shadow-lg"
              disabled={uploadingImage}
            >
              <Camera size={20} className="text-white group-hover/camera:scale-110 transition-transform" />
            </button>
            
            {/* Add Photo hint for empty profile */}
            {!profileImage && (
              <div className="absolute bottom-6 left-6 right-6 z-20">
                <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                      <Plus size={20} className="text-white" />
                    </div>
                    <div>
                      <p className="text-white font-semibold">Add your first photo</p>
                      <p className="text-white/80 text-sm">Stand out with a great profile picture</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Enhanced Profile Views Badge */}
            {isPremium && (
              <div className="absolute top-6 left-6 bg-black/30 backdrop-blur-md px-4 py-2 rounded-full flex items-center gap-2 border border-white/20 z-20">
                <Eye size={16} className="text-white" />
                <span className="text-white text-sm font-bold">{profileViews.toLocaleString()}</span>
                <span className="text-white/80 text-xs">views</span>
              </div>
            )}

            {/* Enhanced Premium Badge */}
            {isPremium && (
              <div className="absolute top-20 left-6 bg-gradient-to-r from-yellow-400 via-yellow-500 to-amber-500 px-3 py-1.5 rounded-full flex items-center gap-2 shadow-lg z-20">
                <Crown className="w-4 h-4 text-yellow-900 animate-bounce" />
                <span className="text-yellow-900 text-xs font-bold tracking-wide">PREMIUM</span>
              </div>
            )}

            {/* Mood Indicator */}
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 z-20">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span className="text-white text-sm font-medium">Feeling Great</span>
                <Smile className="w-4 h-4 text-white" />
              </div>
            </div>

            {/* Streak Counter */}
            <div className="absolute bottom-6 left-6 bg-orange-500/20 backdrop-blur-md px-3 py-2 rounded-full border border-orange-300/30 z-20">
              <div className="flex items-center gap-2">
                <Flame className="w-4 h-4 text-orange-400" />
                <span className="text-white text-sm font-bold">7 Day Streak</span>
              </div>
            </div>
            
            {/* Profile completion indicator with animation */}
            <div className="absolute bottom-6 right-6 z-20 group cursor-pointer">
              <div className="bg-white/10 backdrop-blur-md p-3 rounded-full border border-white/20 group-hover:bg-white/20 transition-all duration-300">
                <div className="relative w-8 h-8">
                  <svg className="w-8 h-8 transform -rotate-90" viewBox="0 0 32 32">
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="rgba(255,255,255,0.3)"
                      strokeWidth="2"
                      fill="none"
                    />
                    <circle
                      cx="16"
                      cy="16"
                      r="14"
                      stroke="white"
                      strokeWidth="2"
                      fill="none"
                      strokeDasharray={`${85 * 0.85} 85`}
                      className="transition-all duration-500 group-hover:stroke-yellow-300"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-white text-xs font-bold group-hover:scale-110 transition-transform">85%</span>
                </div>
              </div>
              {/* Completion tooltip */}
              <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 text-white px-3 py-1 rounded-lg text-xs whitespace-nowrap">
                Complete your profile
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleImageChange}
            />
          </div>
        </Card>

        {/* Enhanced User Information Section */}
        <Card className="bg-white/95 backdrop-blur-md shadow-2xl border-0 relative z-10 hover:shadow-3xl transition-all duration-300">
          <CardContent className="p-8">
            {/* Enhanced Name and Age */}
            <div className="flex items-start justify-between mb-6">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-gray-900 text-4xl font-bold tracking-tight">{name}</h2>
                  <span className="text-gray-600 text-2xl font-light">{age}</span>
                  {isPremium && (
                    <div className="bg-gradient-to-r from-yellow-400 to-amber-500 p-1 rounded-full">
                      <Crown size={16} className="text-yellow-900" />
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-2 text-gray-600 mb-3">
                  <MapPin size={18} className="text-coral-500" />
                  <span className="text-base font-medium">{location}</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-600 font-medium">Online now</span>
                </div>
              </div>

              <button className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 p-3 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md">
                <Edit3 size={18} className="text-gray-600" />
              </button>
            </div>

            {/* Enhanced Bio */}
            <div className="bg-gradient-to-r from-peach-50 to-coral-50 p-4 rounded-2xl mb-6 border border-peach-100">
              <p className="text-gray-800 text-base leading-relaxed italic">"{bio}"</p>
            </div>

            {/* Enhanced Profession */}
            <div className="flex items-center gap-3 text-gray-700 mb-6 bg-gray-50 p-3 rounded-xl">
              <div className="bg-blue-100 p-2 rounded-lg">
                <Briefcase size={18} className="text-blue-600" />
              </div>
              <div>
                <span className="text-base font-semibold">{profession}</span>
                <p className="text-sm text-gray-500">Professional</p>
              </div>
            </div>

            {/* Enhanced Interest Tags */}
            <div className="mb-6">
              <h3 className="text-gray-800 font-semibold mb-3 flex items-center gap-2">
                <Heart size={16} className="text-coral-500" />
                Interests
              </h3>
              <div className="flex flex-wrap gap-3">
                {interests.map((interest, index) => (
                  <span
                    key={index}
                    className="bg-gradient-to-r from-peach-100 to-coral-100 px-4 py-2 text-coral-700 text-sm font-semibold rounded-full border border-coral-200 hover:shadow-md transition-all duration-200 cursor-default"
                  >
                    {interest}
                  </span>
                ))}
                <button className="bg-gray-100 hover:bg-gray-200 px-4 py-2 text-gray-500 text-sm font-medium rounded-full border-2 border-dashed border-gray-300 transition-all duration-200">
                  <Plus size={14} className="inline mr-1" />
                  Add more
                </button>
              </div>
            </div>

            {/* Enhanced Action Buttons */}
            <div className="flex gap-4">
              <Button
                onClick={() => {
                  // Edit profile functionality
                  alert('Edit profile feature coming soon!');
                }}
                className="flex-1 bg-gradient-to-r from-peach-500 via-coral-500 to-blush-600 hover:from-peach-600 hover:via-coral-600 hover:to-blush-700 text-white font-bold py-4 border-0 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Edit3 className="w-5 h-5 mr-2" />
                Edit Profile
              </Button>

              <Button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({
                      title: 'My Profile',
                      text: `Check out my profile on AjnabiCam!`,
                      url: window.location.href
                    });
                  } else {
                    navigator.clipboard.writeText(window.location.href);
                    alert('Profile link copied to clipboard!');
                  }
                }}
                className="bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 text-gray-700 font-bold px-6 py-4 border-0 rounded-2xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <Users className="w-5 h-5" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Enhanced Profile Stats Cards */}
        <div className="grid grid-cols-2 gap-4">
          <Card className="bg-white/95 backdrop-blur-md shadow-lg border-0 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              {isPremium ? (
                <>
                  <div className="w-14 h-14 bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center mx-auto mb-3 rounded-2xl shadow-md">
                    <Eye className="w-6 h-6 text-blue-600" />
                  </div>
                  <div className="text-2xl font-bold text-blue-700 mb-1">{profileViews.toLocaleString()}</div>
                  <div className="text-sm text-blue-600 font-medium">Profile Views</div>
                  <div className="text-xs text-blue-500 mt-1">+12 today</div>
                </>
              ) : (
                <>
                  <div className="w-14 h-14 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mx-auto mb-3 rounded-2xl shadow-md relative">
                    <Eye className="w-6 h-6 text-gray-400" />
                    <Crown className="w-4 h-4 text-yellow-500 absolute -top-1 -right-1 animate-bounce" />
                  </div>
                  <div className="text-2xl font-bold text-gray-400 mb-1">***</div>
                  <div className="text-sm text-gray-400 font-medium">Premium Only</div>
                  <div className="text-xs text-yellow-600 mt-1">Upgrade to see</div>
                </>
              )}
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md shadow-lg border-0 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center mx-auto mb-3 rounded-2xl shadow-md">
                <Users className="w-6 h-6 text-green-600" />
              </div>
              <div className="text-2xl font-bold text-green-700 mb-1">23</div>
              <div className="text-sm text-green-600 font-medium">Friends</div>
              <div className="text-xs text-green-500 mt-1">+2 this week</div>
            </CardContent>
          </Card>

          <Card
            className="bg-white/95 backdrop-blur-md shadow-lg border-0 cursor-pointer hover:shadow-xl transform hover:scale-105 transition-all duration-300 group"
            onClick={handleShowLikes}
          >
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-pink-100 to-rose-200 flex items-center justify-center mx-auto mb-3 rounded-2xl shadow-md relative group-hover:scale-110 transition-transform">
                <Heart className="w-6 h-6 text-pink-600 group-hover:animate-pulse" />
                {!isPremium && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full animate-pulse flex items-center justify-center">
                    <span className="text-white text-xs font-bold">!</span>
                  </div>
                )}
              </div>
              <div className="text-2xl font-bold text-pink-700 mb-1">
                {isPremium ? likesData.length : '?'}
              </div>
              <div className="text-sm text-pink-600 font-medium">
                {isPremium ? 'Secret Likes' : 'Tap to Reveal'}
              </div>
              <div className="text-xs text-pink-500 mt-1">
                {isPremium ? 'New matches!' : 'Premium feature'}
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/95 backdrop-blur-md shadow-lg border-0 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-6 text-center">
              <div className="w-14 h-14 bg-gradient-to-br from-yellow-100 to-amber-200 flex items-center justify-center mx-auto mb-3 rounded-2xl shadow-md">
                <Star className="w-6 h-6 text-yellow-600" />
              </div>
              <div className="text-2xl font-bold text-yellow-700 mb-1">{coins.toLocaleString()}</div>
              <div className="text-sm text-yellow-600 font-medium">Coins</div>
              <div className="text-xs text-yellow-500 mt-1">Earn more!</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Activity Stats */}
        <div className="grid grid-cols-3 gap-3">
          <Card className="bg-white/95 backdrop-blur-md shadow-lg border-0 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 flex items-center justify-center mx-auto mb-2 rounded-xl shadow-sm">
                <MessageCircle className="w-5 h-5 text-purple-600" />
              </div>
              <div className="text-lg font-bold text-purple-700">156</div>
              <div className="text-xs text-purple-600 font-medium">Chats</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/95 backdrop-blur-md shadow-lg border-0 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 flex items-center justify-center mx-auto mb-2 rounded-xl shadow-sm">
                <Calendar className="w-5 h-5 text-orange-600" />
              </div>
              <div className="text-lg font-bold text-orange-700">7</div>
              <div className="text-xs text-orange-600 font-medium">Days</div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/95 backdrop-blur-md shadow-lg border-0 hover:shadow-xl transform hover:scale-105 transition-all duration-300">
            <CardContent className="p-4 text-center">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-100 to-emerald-200 flex items-center justify-center mx-auto mb-2 rounded-xl shadow-sm">
                <Zap className="w-5 h-5 text-emerald-600" />
              </div>
              <div className="text-lg font-bold text-emerald-700">98%</div>
              <div className="text-xs text-emerald-600 font-medium">Match</div>
            </CardContent>
          </Card>
        </div>

        {/* Enhanced Additional Actions */}
        <div className="space-y-6">
          {!isPremium && (
            <Button
              onClick={() => navigate('/premium')}
              className="w-full bg-gradient-to-r from-purple-600 via-pink-600 to-purple-700 hover:from-purple-700 hover:via-pink-700 hover:to-purple-800 text-white font-bold py-5 shadow-2xl rounded-2xl transform hover:scale-105 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent animate-shimmer"></div>
              <Crown className="w-6 h-6 mr-3 animate-bounce" />
              <span className="text-lg">Unlock Premium Features</span>
              <Sparkles className="w-5 h-5 ml-3" />
            </Button>
          )}
          
          <div className="grid grid-cols-2 gap-4">
            <Button
              onClick={() => navigate('/chat')}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <MessageCircle className="w-5 h-5 mr-2" />
              Messages
            </Button>
            
            <Button
              onClick={() => navigate('/')}
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg transform hover:scale-105 transition-all duration-200"
            >
              <Users className="w-5 h-5 mr-2" />
              Discover
            </Button>
          </div>
          
          {/* Navigation Tabs */}
          <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-lg border border-gray-100 p-2">
            <div className="flex space-x-2">
              {[
                { id: 'overview', label: 'Overview', icon: User },
                { id: 'achievements', label: 'Achievements', icon: Trophy },
                { id: 'activity', label: 'Activity', icon: Activity },
                { id: 'social', label: 'Social', icon: Share2 }
              ].map((tab) => {
                const IconComponent = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => {
                      setSelectedTab(tab.id);
                      setAnimationKey(prev => prev + 1);
                    }}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm transition-all duration-300 ${
                      selectedTab === tab.id
                        ? 'bg-gradient-to-r from-coral-500 to-peach-500 text-white shadow-lg transform scale-105'
                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
                    }`}
                  >
                    <IconComponent size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content */}
          <div key={animationKey} className="animate-fadeIn">
            {selectedTab === 'overview' && (
              <div className="space-y-6">
                {/* Quick Interest Actions */}
                <div className="bg-gradient-to-r from-gray-50 to-gray-100 p-6 rounded-2xl">
                  <h3 className="text-gray-800 font-bold mb-4 text-center">Quick Actions</h3>
                  <div className="grid grid-cols-4 gap-3">
                    <button className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-center group">
                      <Coffee className="w-6 h-6 text-amber-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-gray-600 font-medium">Coffee</span>
                    </button>
                    <button className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-center group">
                      <Music className="w-6 h-6 text-purple-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-gray-600 font-medium">Music</span>
                    </button>
                    <button className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-center group">
                      <Book className="w-6 h-6 text-blue-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-gray-600 font-medium">Books</span>
                    </button>
                    <button className="bg-white p-3 rounded-xl shadow-sm hover:shadow-md transition-all duration-200 text-center group">
                      <Plane className="w-6 h-6 text-green-600 mx-auto mb-1 group-hover:scale-110 transition-transform" />
                      <span className="text-xs text-gray-600 font-medium">Travel</span>
                    </button>
                  </div>
                </div>

                {/* Profile Strength */}
                <Card className="bg-white/95 backdrop-blur-md shadow-lg border-0">
                  <CardContent className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-gray-800 font-bold flex items-center gap-2">
                        <Shield className="w-5 h-5 text-green-500" />
                        Profile Strength
                      </h3>
                      <span className="text-2xl font-bold text-green-600">85%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
                      <div className="bg-gradient-to-r from-green-500 to-emerald-500 h-3 rounded-full" style={{ width: '85%' }}></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Profile Photo</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Bio Added</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Interests</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-gray-300 rounded-full"></div>
                        <span className="text-gray-400">Verification</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {selectedTab === 'achievements' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-800 font-bold text-lg">Achievements</h3>
                  <span className="text-sm text-gray-600">{achievements.filter(a => a.completed).length}/{achievements.length} unlocked</span>
                </div>
                {achievements.map((achievement) => {
                  const IconComponent = achievement.icon;
                  return (
                    <Card key={achievement.id} className={`bg-white/95 backdrop-blur-md shadow-lg border-0 transition-all duration-300 ${
                      achievement.completed ? 'border-l-4 border-l-green-500' : 'opacity-75'
                    }`}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                            achievement.completed
                              ? 'bg-gradient-to-br from-yellow-100 to-amber-200'
                              : 'bg-gray-100'
                          }`}>
                            <IconComponent className={`w-6 h-6 ${
                              achievement.completed ? 'text-yellow-600' : 'text-gray-400'
                            }`} />
                          </div>
                          <div className="flex-1">
                            <h4 className={`font-semibold ${
                              achievement.completed ? 'text-gray-800' : 'text-gray-500'
                            }`}>{achievement.title}</h4>
                            <p className="text-sm text-gray-600">{achievement.description}</p>
                            {achievement.completed && achievement.date && (
                              <p className="text-xs text-green-600 mt-1">Completed on {achievement.date}</p>
                            )}
                            {!achievement.completed && achievement.progress && (
                              <div className="mt-2">
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div
                                    className="bg-gradient-to-r from-coral-500 to-peach-500 h-2 rounded-full transition-all duration-500"
                                    style={{ width: `${achievement.progress}%` }}
                                  ></div>
                                </div>
                                <p className="text-xs text-gray-500 mt-1">{achievement.progress}% complete</p>
                              </div>
                            )}
                          </div>
                          {achievement.completed && (
                            <div className="text-green-500">
                              <Verified size={20} />
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {selectedTab === 'activity' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-gray-800 font-bold text-lg">Recent Activity</h3>
                  <button className="text-coral-500 text-sm font-medium">View All</button>
                </div>
                {recentActivity.map((activity) => (
                  <Card key={activity.id} className="bg-white/95 backdrop-blur-md shadow-lg border-0">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        {activity.avatar ? (
                          <img src={activity.avatar} alt={activity.user} className="w-10 h-10 rounded-full object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                            <Eye className="w-5 h-5 text-gray-500" />
                          </div>
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            {activity.type === 'match' && <Heart className="w-4 h-4 text-red-500" />}
                            {activity.type === 'like' && <ThumbsUp className="w-4 h-4 text-blue-500" />}
                            {activity.type === 'view' && <Eye className="w-4 h-4 text-gray-500" />}
                            {activity.type === 'chat' && <MessageCircle className="w-4 h-4 text-green-500" />}
                            <span className="text-sm font-medium text-gray-800">
                              {activity.type === 'match' && `New match with ${activity.user}`}
                              {activity.type === 'like' && `${activity.user} liked your profile`}
                              {activity.type === 'view' && 'Someone viewed your profile'}
                              {activity.type === 'chat' && `New message from ${activity.user}`}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500">{activity.time}</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-gray-400" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {selectedTab === 'social' && (
              <div className="space-y-6">
                {/* Social Links */}
                <Card className="bg-white/95 backdrop-blur-md shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="text-gray-800 font-bold mb-4">Connect Your Socials</h3>
                    <div className="space-y-3">
                      <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl border border-pink-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <Instagram className="w-5 h-5 text-pink-600" />
                          <span className="font-medium text-gray-800">Instagram</span>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400" />
                      </button>
                      <button className="w-full flex items-center justify-between p-3 bg-gradient-to-r from-blue-50 to-sky-50 rounded-xl border border-blue-200 hover:shadow-md transition-all duration-200">
                        <div className="flex items-center gap-3">
                          <Twitter className="w-5 h-5 text-blue-600" />
                          <span className="font-medium text-gray-800">Twitter</span>
                        </div>
                        <Plus className="w-4 h-4 text-gray-400" />
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Share Profile */}
                <Card className="bg-white/95 backdrop-blur-md shadow-lg border-0">
                  <CardContent className="p-6">
                    <h3 className="text-gray-800 font-bold mb-4">Share Your Profile</h3>
                    <div className="grid grid-cols-3 gap-3">
                      <button className="flex flex-col items-center gap-2 p-4 bg-blue-50 rounded-xl hover:bg-blue-100 transition-colors">
                        <Link className="w-6 h-6 text-blue-600" />
                        <span className="text-xs font-medium text-blue-600">Copy Link</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 p-4 bg-green-50 rounded-xl hover:bg-green-100 transition-colors">
                        <Send className="w-6 h-6 text-green-600" />
                        <span className="text-xs font-medium text-green-600">Share</span>
                      </button>
                      <button className="flex flex-col items-center gap-2 p-4 bg-purple-50 rounded-xl hover:bg-purple-100 transition-colors">
                        <Download className="w-6 h-6 text-purple-600" />
                        <span className="text-xs font-medium text-purple-600">QR Code</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>

                {/* Profile Analytics */}
                {isPremium && (
                  <Card className="bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200">
                    <CardContent className="p-6">
                      <h3 className="text-gray-800 font-bold mb-4 flex items-center gap-2">
                        <TrendingUp className="w-5 h-5 text-purple-600" />
                        Profile Analytics
                      </h3>
                      <div className="grid grid-cols-2 gap-4 text-center">
                        <div>
                          <div className="text-2xl font-bold text-purple-700">2.3K</div>
                          <div className="text-sm text-purple-600">Total Reach</div>
                        </div>
                        <div>
                          <div className="text-2xl font-bold text-pink-700">86%</div>
                          <div className="text-sm text-pink-600">Engagement</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ULTRA+ Profile Enhancements */}
      {isUltraPremium() && (
        <UltraProfileEnhancements
          isUltraPremium={true}
          userProfile={{
            name: name,
            bio: bio,
            profileImage: profileImage || undefined,
            premiumSince: new Date('2024-01-15'), // Example date
            totalFriends: 25,
            totalChats: 150,
            premiumFeatureUsage: {
              reactionsUsed: 89,
              filtersUsed: 15,
              adsFree: 45,
              unlimitedTime: 120
            }
          }}
          onProfileUpdate={(updates) => {
            console.log('Profile updates:', updates);
            // Handle profile updates
          }}
        />
      )}

      {/* Debug: Test ULTRA+ Features */}
      {!isUltraPremium() && (
        <div className="px-4 mb-4">
          <Button
            onClick={() => {
              const expiry = new Date();
              expiry.setMonth(expiry.getMonth() + 3);
              setPremium(true, expiry, 'ultra-quarterly');
              alert('🎉 ULTRA+ activated for testing! Refresh to see changes.');
              window.location.reload();
            }}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white py-3 px-4 rounded-lg shadow-md transition-colors"
          >
            <Crown className="h-4 w-4 mr-2" />
            🧪 Test ULTRA+ Features (Debug)
          </Button>
        </div>
      )}

      {/* Use UltraBottomNavBar for ULTRA+ users, regular for others */}
      {isUltraPremium() ? <UltraBottomNavBar /> : <BottomNavBar />}

      {/* Who Liked Me Modal */}
      <WhoLikedMeModal
        isOpen={showLikesModal}
        onClose={() => setShowLikesModal(false)}
        likes={likesData}
        onRevealLike={handleRevealLike}
      />
      </div>
    </UltraPageTransition>
  );
}
