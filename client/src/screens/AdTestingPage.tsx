import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TestTube, Gamepad2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import MobileAdTester from '../components/MobileAdTester';
import UnityAdsTestPanel from '../components/UnityAdsTestPanel';
import BottomNavBar from '../components/BottomNavBar';
import { useState } from 'react';

export default function AdTestingPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'admob' | 'unity'>('unity');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 text-white p-6 shadow-xl">
        <div className="max-w-4xl mx-auto flex items-center gap-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-white/20 transition-colors"
          >
            <ArrowLeft size={24} />
          </button>
          <div className="flex items-center gap-3">
            <TestTube className="h-8 w-8" />
            <div>
              <h1 className="text-2xl font-bold">Ad Mediation Testing</h1>
              <p className="text-sm text-blue-100">
                Test Unity Ads + AdMob mediation integration
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="max-w-4xl mx-auto mt-6">
          <div className="flex gap-2">
            <Button
              onClick={() => setActiveTab('unity')}
              className={`${
                activeTab === 'unity'
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <Gamepad2 className="w-4 h-4 mr-2" />
              Unity Ads
            </Button>
            <Button
              onClick={() => setActiveTab('admob')}
              className={`${
                activeTab === 'admob'
                  ? 'bg-white text-purple-600'
                  : 'bg-white/20 text-white hover:bg-white/30'
              }`}
            >
              <TestTube className="w-4 h-4 mr-2" />
              AdMob Testing
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 pb-24">
        {activeTab === 'unity' ? (
          <UnityAdsTestPanel />
        ) : (
          <MobileAdTester />
        )}
      </div>

      <BottomNavBar />
    </div>
  );
}
