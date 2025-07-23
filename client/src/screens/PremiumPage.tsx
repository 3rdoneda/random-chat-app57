import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card";
import { Crown, Check, X, ArrowLeft, Heart, Star, Sparkles, Zap, Shield, Users, Video, MessageCircle } from "lucide-react";
import { Camera } from "lucide-react";
import { Helmet } from "react-helmet-async";
import { usePremium } from "../context/PremiumProvider";

// Razorpay integration for premium purchase
const RAZORPAY_KEY_ID = "rzp_test_1234567890"; // Use test key for development

interface PremiumPageProps {
  onPurchase?: (plan: string) => void;
}

export default function PremiumPage({ onPurchase }: PremiumPageProps) {
  const navigate = useNavigate();
  const { setPremium } = usePremium();
  const [selectedPlan, setSelectedPlan] = useState<string>("vip-weekly");

  // Razorpay handler
  const handleRazorpay = async (): Promise<void> => {
    const plan = plans.find(p => p.id === selectedPlan);
    if (!plan) return;
    
    // Check if Razorpay is loaded
    if (typeof window.Razorpay === 'undefined') {
      console.error('Razorpay SDK not loaded');
      // Fallback to direct purchase
      handlePurchaseSuccess(selectedPlan);
      return;
    }
    
    const amount = plan.id === "vip-weekly" ? 9900 : 
                   plan.id === "pro-monthly" ? 29900 : 
                   plan.id === "ultra-quarterly" ? 89900 : 9900; // in paise
    const options = {
      key: RAZORPAY_KEY_ID,
      amount,
      currency: "INR",
      name: "AjnabiCam Premium",
      description: plan.name,
      image: "/logo.png",
      handler: function (response: any) {
        // On successful payment
        console.log('Payment successful:', response);
        handlePurchaseSuccess(selectedPlan);
      },
      modal: {
        ondismiss: function() {
          console.log('Payment modal closed');
        }
      },
      prefill: {},
      theme: { color: "#ff6b6b" },
    };
    
    try {
      // @ts-ignore
      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (error) {
      console.error('Error opening Razorpay:', error);
      // Fallback to direct purchase
      handlePurchaseSuccess(selectedPlan);
    }
  };

  const handlePurchaseSuccess = (plan: string) => {
    const now = new Date();
    let expiry: Date;
    
    if (plan === "vip-weekly") {
      expiry = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    } else if (plan === "pro-monthly") {
      expiry = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    } else {
      expiry = new Date(now.getTime() + 90 * 24 * 60 * 60 * 1000);
    }
    
    // Store the premium plan type for feature access
    localStorage.setItem('ajnabicam_premium_plan', plan);
    
    setPremium(true, expiry, plan);
    
    if (onPurchase) {
      onPurchase(plan);
    }
    
    alert(`🎉 Welcome to Premium! Your ${plan} subscription is now active until ${expiry.toLocaleDateString()}!`);
    navigate("/");
  };

  const plans = [
    {
      id: "vip-weekly",
      name: "VIP Weekly",
      price: "₹99",
      duration: "/week",
      originalPrice: "₹199",
      savings: "50% OFF First Week!",
      popular: false,
      description: "Then ₹199/week",
      badge: "🎯 Trial Offer",
      color: "from-sindoor-400 to-coral-500"
    },
    {
      id: "pro-monthly",
      name: "Pro Monthly", 
      price: "₹299",
      duration: "/month",
      savings: "Most Popular!",
      popular: true,
      description: "Best value for regular users",
      badge: "⭐ Recommended",
      color: "from-peach-500 to-blush-500"
    },
    {
      id: "ultra-quarterly",
      name: "ULTRA+ (3 Months)",
      price: "₹899",
      duration: "/3 months",
      originalPrice: "₹897",
      savings: "Save ₹498!",
      popular: false,
      description: "Maximum savings & features",
      badge: "💎 Premium",
      color: "from-gulmohar-500 to-henna-500"
    }
  ];

  const features = [
    {
      icon: Shield,
      title: "Ad-Free Experience",
      description: "No interruptions, pure chatting bliss",
      color: "text-sindoor-500"
    },
    {
      icon: Video,
      title: "Voice-Only Mode",
      description: "Audio calls without video pressure",
      color: "text-henna-500"
    },
    {
      icon: Users,
      title: "Gender Filter",
      description: "Choose who you want to chat with",
      color: "text-jasmine-500"
    },
    {
      icon: Zap,
      title: "Unlimited Chat Time",
      description: "No more frustrating time limits!",
      color: "text-gulmohar-500"
    },
    {
      icon: Crown,
      title: "Premium Badge",
      description: "Show off your exclusive status",
      color: "text-passion-500"
    },
          {
        color: "text-royal-500"
      }, // ← comma added here
      {
        icon: Camera,
        title: "Face Filters",
        description: "Apply Instagram-style filters to your partner's video (ULTRA+ only)",
      },

    {
      icon: Camera,
      title: "Face Filters",
      description: "Apply Instagram-style filters to your partner's video (ULTRA+ only)",
      color: "text-purple-500"
    },
  ];

  return (
    <>
      <Helmet>
        <title>Premium Membership - AjnabiCam</title>
        <meta name="description" content="Upgrade to Premium for unlimited chat time, ad-free experience, and exclusive features" />
      </Helmet>

      <div className="min-h-screen bg-gradient-to-br from-peach-25 via-cream-50 to-blush-50 relative overflow-hidden">
        {/* Animated Background Elements - Same as Home */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-16 left-8 w-32 h-32 bg-gradient-to-br from-peach-200 to-coral-300 rounded-full opacity-20 animate-pulse"></div>
          <div className="absolute top-64 right-12 w-24 h-24 bg-gradient-to-br from-blush-200 to-passion-300 rounded-full opacity-15 animate-bounce" style={{ animationDelay: "1s" }}></div>
          <div className="absolute bottom-48 left-16 w-20 h-20 bg-gradient-to-br from-jasmine-200 to-gulmohar-300 rounded-full opacity-25 animate-pulse" style={{ animationDelay: "2s" }}></div>
          <div className="absolute bottom-64 right-8 w-16 h-16 bg-gradient-to-br from-henna-200 to-sindoor-300 rounded-full opacity-30 animate-bounce" style={{ animationDelay: "0.5s" }}></div>
          
          {/* Romantic symbols */}
          <div className="absolute top-20 right-20 text-sindoor-400 text-2xl opacity-40 animate-pulse" style={{ animationDelay: "0.5s" }}>💕</div>
          <div className="absolute bottom-80 left-16 text-henna-400 text-xl opacity-35 animate-bounce" style={{ animationDelay: "1.5s" }}>🌸</div>
          <div className="absolute top-60 left-8 text-jasmine-400 text-lg opacity-30 animate-pulse" style={{ animationDelay: "2.5s" }}>✨</div>
          <div className="absolute top-80 right-6 text-gulmohar-400 text-base opacity-25 animate-bounce" style={{ animationDelay: "3s" }}>🪷</div>
        </div>

        {/* Header with same styling as Home */}
        <header className="w-full bg-gradient-to-r from-peach-400 via-coral-400 to-blush-500 shadow-lg px-4 sm:px-6 lg:px-8 py-4 sm:py-5 border-b border-peach-200 relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-white/15 via-jasmine-100/25 to-white/15 backdrop-blur-sm"></div>
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-transparent via-henna-200/15 to-transparent"></div>
          
          <div className="relative z-10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button
                onClick={() => navigate("/")}
                className="bg-white/20 backdrop-blur-sm hover:bg-white/30 text-white font-semibold p-2.5 rounded-full shadow-lg transform hover:scale-105 transition-all duration-200 border border-white/30"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm shadow-lg">
                  <Crown className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight drop-shadow-lg">
                  Premium Membership
                </h1>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <div className="relative z-10 px-4 sm:px-6 lg:px-8 py-8 max-w-6xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            
            {/* Left Column - Features */}
            <div className="space-y-6">
              <div className="text-center lg:text-left">
                <h2 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-peach-600 via-coral-600 to-blush-600 bg-clip-text text-transparent mb-4">
                  Unlock Premium Features ✨
                </h2>
                <p className="text-gray-600 text-lg">
                  Experience AjnabiCam like never before with our premium membership
                </p>
              </div>

              <div className="grid gap-4">
                {features.map((feature, index) => (
                  <Card key={index} className="bg-white/80 backdrop-blur-sm border-2 border-peach-200 hover:border-coral-300 transition-all duration-300 hover:shadow-lg hover:scale-[1.02]">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-4">
                        <div className={`bg-gradient-to-br from-peach-100 to-coral-100 p-3 rounded-full shadow-md`}>
                          {feature.icon && <feature.icon className={`h-6 w-6 ${feature.color}`} />}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-bold text-gray-800 text-lg">{feature.title}</h3>
                          <p className="text-gray-600 text-sm">{feature.description}</p>
                        </div>
                        <Check className="h-5 w-5 text-green-500" />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Social Proof */}
              <Card className="bg-gradient-to-r from-cream-100 to-peach-100 border-2 border-peach-300 shadow-lg">
                <CardContent className="p-4 text-center">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Users className="h-5 w-5 text-peach-600" />
                    <span className="text-peach-800 font-bold">Join 2,847+ Premium Users</span>
                  </div>
                  <p className="text-peach-700 text-sm">💕 92% say Premium changed their chat experience completely!</p>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Pricing */}
            <div className="space-y-6">
              <Card className="bg-white/90 backdrop-blur-sm border-2 border-peach-200 shadow-2xl sticky top-8">
                <CardHeader className="text-center pb-4">
                  <div className="flex justify-center mb-4">
                    <div className="w-20 h-20 bg-gradient-to-br from-peach-400 via-coral-500 to-blush-400 rounded-2xl relative overflow-hidden shadow-2xl border-3 border-peach-300 flex items-center justify-center">
                      <Crown className="h-10 w-10 text-white drop-shadow-lg" />
                      <div className="absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-black/10 rounded-2xl"></div>
                    </div>
                  </div>
                  <CardTitle className="text-2xl font-bold bg-gradient-to-r from-peach-600 via-coral-600 to-blush-600 bg-clip-text text-transparent">
                    Choose Your Plan
                  </CardTitle>
                  <CardDescription className="text-gray-600">
                    Start your premium journey today
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Pricing Plans */}
                  <div className="space-y-3">
                    {plans.map((plan) => (
                      <div
                        key={plan.id}
                        className={`relative p-4 rounded-xl border-2 cursor-pointer transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl ${
                          selectedPlan === plan.id
                            ? "border-peach-500 bg-gradient-to-br from-peach-50 to-coral-50 shadow-lg ring-2 ring-peach-200"
                            : "border-gray-300 bg-white hover:border-peach-300"
                        } ${plan.popular ? "ring-2 ring-coral-400" : ""}`}
                        onClick={() => setSelectedPlan(plan.id)}
                      >
                        {plan.popular && (
                          <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-peach-500 to-coral-500 text-white text-xs px-3 py-1 rounded-full font-bold animate-pulse">
                            Most Popular! 🔥
                          </span>
                        )}
                        
                        {plan.badge && !plan.popular && (
                          <span className="absolute -top-2 left-1/2 transform -translate-x-1/2 bg-gradient-to-r from-gulmohar-500 to-henna-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                            {plan.badge}
                          </span>
                        )}
                        
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <h4 className="font-bold text-gray-800 text-lg">{plan.name}</h4>
                            {plan.description && (
                              <p className="text-xs text-gray-600 mt-1">{plan.description}</p>
                            )}
                            {plan.savings && (
                              <p className="text-sm text-green-600 font-medium mt-1">{plan.savings}</p>
                            )}
                          </div>
                          <div className="text-right">
                            {plan.originalPrice && (
                              <div className="text-sm text-gray-500 line-through">{plan.originalPrice}</div>
                            )}
                            <span className="text-2xl font-bold text-peach-600">{plan.price}</span>
                            <span className="text-gray-500 text-sm block">{plan.duration}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Purchase Button */}
                  <Button
                    onClick={handleRazorpay}
                    className="w-full bg-gradient-to-r from-peach-500 via-coral-500 to-blush-500 hover:from-peach-600 hover:via-coral-600 hover:to-blush-600 text-white font-bold py-4 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300 text-lg"
                  >
                    <Crown className="h-5 w-5 mr-2" />
                    🚀 Get Premium Now - {plans.find(p => p.id === selectedPlan)?.price}
                  </Button>

                  <div className="text-center space-y-2">
                    <p className="text-xs text-gray-500">
                      💳 Pay with <span className="font-semibold text-peach-700">UPI, Cards, Wallets</span> or Netbanking
                    </p>
                    <p className="text-xs text-gray-500">
                      🔒 Secure payment • Cancel anytime • 💯 30-day money-back guarantee
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
