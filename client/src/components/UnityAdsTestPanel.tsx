import React, { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Gamepad2, Play, Gift, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { unityAdsService } from '../lib/unityAdsService';
import { adMobService } from '../lib/adMobMediationService';

export default function UnityAdsTestPanel() {
  const [unityStatus, setUnityStatus] = useState<any>(null);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadStatus = async () => {
    setIsLoading(true);
    try {
      const status = unityAdsService.getMetrics();
      const mediationStatus = adMobService.getUnityAdsStatus();
      setUnityStatus({ ...status, ...mediationStatus });
    } catch (error) {
      console.error('Failed to load Unity status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStatus();
  }, []);

  const addTestResult = (message: string) => {
    setTestResults(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  const testUnityInitialization = async () => {
    addTestResult('🎮 Testing Unity Ads initialization...');
    try {
      const success = await unityAdsService.initialize();
      if (success) {
        addTestResult('✅ Unity Ads initialized successfully');
        loadStatus();
      } else {
        addTestResult('❌ Unity Ads initialization failed');
      }
    } catch (error) {
      addTestResult(`❌ Unity initialization error: ${error}`);
    }
  };

  const testRewardedAd = async () => {
    addTestResult('💰 Testing Unity rewarded ad...');
    try {
      const result = await unityAdsService.showRewardedAd();
      if (result.success) {
        addTestResult(`✅ Rewarded ad completed! Earned ${result.rewardAmount} coins`);
      } else {
        addTestResult(`❌ Rewarded ad failed: ${result.error}`);
      }
    } catch (error) {
      addTestResult(`❌ Rewarded ad error: ${error}`);
    }
  };

  const testInterstitialAd = async () => {
    addTestResult('🎬 Testing Unity interstitial ad...');
    try {
      const success = await unityAdsService.showInterstitialAd();
      if (success) {
        addTestResult('✅ Interstitial ad completed successfully');
      } else {
        addTestResult('❌ Interstitial ad failed');
      }
    } catch (error) {
      addTestResult(`❌ Interstitial ad error: ${error}`);
    }
  };

  const testMediationWaterfall = async () => {
    addTestResult('🔄 Testing mediation waterfall...');
    try {
      const result = await adMobService.showMediatedRewardedAd();
      if (result.success) {
        addTestResult(`✅ Mediation successful via ${result.network}! Earned ${result.reward} coins`);
      } else {
        addTestResult('❌ Mediation waterfall failed');
      }
    } catch (error) {
      addTestResult(`❌ Mediation error: ${error}`);
    }
  };

  if (!unityStatus) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full mr-3"></div>
          <span>Loading Unity Ads status...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          🎮 Unity Ads Test Panel
          <Gamepad2 className="w-6 h-6 text-orange-600" />
        </h2>
        <Button onClick={loadStatus} disabled={isLoading} size="sm">
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Unity Status Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-orange-50 to-red-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">SDK Status</p>
              <p className={`text-2xl font-bold ${unityStatus.isInitialized ? 'text-green-600' : 'text-red-600'}`}>
                {unityStatus.isInitialized ? '✅ Ready' : '❌ Not Ready'}
              </p>
            </div>
            {unityStatus.isInitialized ? (
              <CheckCircle className="w-8 h-8 text-green-600" />
            ) : (
              <XCircle className="w-8 h-8 text-red-600" />
            )}
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Game ID</p>
              <p className="text-sm font-bold text-blue-800 break-all">
                {unityStatus.gameId || 'Not Set'}
              </p>
            </div>
            <Gamepad2 className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Fill Rate</p>
              <p className="text-2xl font-bold text-purple-800">
                {((unityStatus.fillRate || 0) * 100).toFixed(1)}%
              </p>
            </div>
            <RefreshCw className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Test Mode</p>
              <p className="text-xl font-bold text-green-800">
                {unityStatus.testMode ? '🧪 Test' : '🚀 Live'}
              </p>
            </div>
            <Play className="w-8 h-8 text-green-600" />
          </div>
        </Card>
      </div>

      {/* Placement Status */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📱 Ad Placement Status</h3>
        <div className="grid grid-cols-3 gap-4">
          {Object.entries(unityStatus.placementStates || {}).map(([placement, ready]: [string, any]) => (
            <div key={placement} className={`text-center p-4 rounded-lg border-2 ${
              ready 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-gray-50 border-gray-200 text-gray-600'
            }`}>
              <div className="text-2xl mb-2">
                {placement === 'banner' && '📱'}
                {placement === 'interstitial' && '🎬'}
                {placement === 'rewarded' && '💰'}
              </div>
              <div className="capitalize font-medium">{placement}</div>
              <div className={`text-sm ${ready ? 'text-green-600' : 'text-gray-500'}`}>
                {ready ? '✅ Ready' : '⏳ Loading'}
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Test Controls */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🧪 Test Controls</h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Button 
            onClick={testUnityInitialization}
            className="bg-orange-600 hover:bg-orange-700 text-white"
          >
            <Gamepad2 className="w-4 h-4 mr-2" />
            Test Init
          </Button>
          
          <Button 
            onClick={testRewardedAd}
            className="bg-green-600 hover:bg-green-700 text-white"
            disabled={!unityStatus.isInitialized}
          >
            <Gift className="w-4 h-4 mr-2" />
            Test Rewarded
          </Button>
          
          <Button 
            onClick={testInterstitialAd}
            className="bg-blue-600 hover:bg-blue-700 text-white"
            disabled={!unityStatus.isInitialized}
          >
            <Play className="w-4 h-4 mr-2" />
            Test Interstitial
          </Button>
          
          <Button 
            onClick={testMediationWaterfall}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Test Mediation
          </Button>
        </div>
      </Card>

      {/* Test Results Log */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📋 Test Results</h3>
        <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm max-h-64 overflow-y-auto">
          {testResults.length === 0 ? (
            <div className="text-gray-500">No tests run yet. Click buttons above to test Unity Ads.</div>
          ) : (
            testResults.map((result, index) => (
              <div key={index} className="mb-1">
                {result}
              </div>
            ))
          )}
        </div>
        {testResults.length > 0 && (
          <Button 
            onClick={() => setTestResults([])}
            variant="outline"
            size="sm"
            className="mt-2"
          >
            Clear Log
          </Button>
        )}
      </Card>

      {/* Configuration Info */}
      <Card className="p-6 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
        <h3 className="text-lg font-semibold mb-4 text-blue-800">⚙️ Current Configuration</h3>
        <div className="space-y-2 text-sm">
          <div><strong>Unity Game ID:</strong> {unityStatus.gameId}</div>
          <div><strong>Test Mode:</strong> {unityStatus.testMode ? 'Enabled' : 'Disabled'}</div>
          <div><strong>SDK Loaded:</strong> {unityStatus.isSDKLoaded ? 'Yes' : 'No'}</div>
          <div><strong>Mediation Priority:</strong> #2 (after Facebook Audience Network)</div>
          <div><strong>Expected eCPM:</strong> $2.50-6.00</div>
        </div>
      </Card>
    </div>
  );
}
