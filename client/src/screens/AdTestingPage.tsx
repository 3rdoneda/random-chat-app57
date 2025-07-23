import { useNavigate } from 'react-router-dom';
import { ArrowLeft, TestTube, Gamepad2 } from 'lucide-react';
import { Button } from '../components/ui/button';
import MobileAdTester from '../components/MobileAdTester';
import UnityAdsTestPanel from '../components/UnityAdsTestPanel';
import BottomNavBar from '../components/BottomNavBar';
import { useState } from 'react';

export default function AdTestingPage() {
  const navigate = useNavigate();

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
              <h1 className="text-2xl font-bold">AdMob Testing</h1>
              <p className="text-sm text-blue-100">
                Test your mobile ads before going live
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto p-6 pb-24">
        <MobileAdTester />
      </div>

      <BottomNavBar />
    </div>
  );
}
