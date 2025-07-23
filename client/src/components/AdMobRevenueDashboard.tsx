import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { TrendingUp, DollarSign, Target, Zap, RefreshCw, Gamepad2 } from 'lucide-react';
import { adMobService } from '../lib/adMobMediationService';
import { unityAdsService } from '../lib/unityAdsService';

export default function AdMobRevenueDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [insights, setInsights] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const loadData = async () => {
    setLoading(true);
    try {
      const metricsData = adMobService.getMediationMetrics();
      const insightsData = adMobService.getRevenueInsights();
      
      setMetrics(metricsData);
      setInsights(insightsData);
    } catch (error) {
      console.error('Failed to load AdMob data:', error);
    } finally {
      setLoading(false);
    }
  };

  const optimizeWaterfall = () => {
    adMobService.optimizeMediationWaterfall();
    alert('🎯 Mediation waterfall optimized! Networks reordered by performance.');
    loadData();
  };

  useEffect(() => {
    loadData();
  }, []);

  if (!metrics || !insights) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mr-3"></div>
          <span>Loading AdMob revenue data...</span>
        </div>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          💰 AdMob Mediation Dashboard
          <TrendingUp className="w-6 h-6 text-green-600" />
        </h2>
        <div className="flex gap-2">
          <Button onClick={loadData} disabled={loading} size="sm">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button onClick={optimizeWaterfall} variant="outline" size="sm">
            <Zap className="w-4 h-4 mr-2" />
            Optimize
          </Button>
        </div>
      </div>

      {/* Revenue Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Today's Revenue</p>
              <p className="text-2xl font-bold text-green-800">
                ${insights.todayRevenue.toFixed(2)}
              </p>
            </div>
            <DollarSign className="w-8 h-8 text-green-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-blue-50 to-cyan-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Monthly Projection</p>
              <p className="text-2xl font-bold text-blue-800">
                ${insights.projectedMonthly.toFixed(0)}
              </p>
            </div>
            <TrendingUp className="w-8 h-8 text-blue-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-purple-50 to-violet-50 border-purple-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-purple-600 font-medium">Best Ad Type</p>
              <p className="text-xl font-bold text-purple-800 capitalize">
                {insights.bestPerformingAdType}
              </p>
            </div>
            <Target className="w-8 h-8 text-purple-600" />
          </div>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-orange-50 to-amber-50 border-orange-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">Mediation Lift</p>
              <p className="text-2xl font-bold text-orange-800">
                {insights.mediationLift}
              </p>
            </div>
            <Zap className="w-8 h-8 text-orange-600" />
          </div>
        </Card>
      </div>

      {/* Network Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">📊 Network Performance</h3>
        <div className="space-y-4">
          {Object.entries(metrics.networkPerformance).map(([network, data]: [string, any]) => (
            <div key={network} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-3">
                <div className={`w-3 h-3 rounded-full ${
                  network === metrics.bestPerformingNetwork ? 'bg-green-500' : 'bg-gray-400'
                }`}></div>
                <span className="font-medium">{network}</span>
                {network === metrics.bestPerformingNetwork && (
                  <span className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                    🏆 Top Performer
                  </span>
                )}
              </div>
              <div className="text-right">
                <div className="text-sm font-semibold">
                  ${data.revenue.toFixed(2)} | eCPM: ${data.ecpm.toFixed(2)}
                </div>
                <div className="text-xs text-gray-600">
                  {data.impressions} impressions | {(data.fillRate * 100).toFixed(1)}% fill
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Ad Type Performance */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">🎯 Ad Type Revenue</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(metrics.adTypePerformance).map(([adType, revenue]: [string, any]) => (
            <div key={adType} className="text-center p-4 bg-gradient-to-br from-indigo-50 to-blue-50 rounded-lg">
              <div className="text-2xl mb-2">
                {adType === 'banner' && '📱'}
                {adType === 'interstitial' && '🎬'}
                {adType === 'rewarded' && '💰'}
                {adType === 'native' && '📰'}
              </div>
              <div className="capitalize font-medium text-gray-700">{adType}</div>
              <div className="text-lg font-bold text-indigo-800">${revenue.toFixed(2)}</div>
            </div>
          ))}
        </div>
      </Card>

      {/* Optimization Recommendations */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">💡 Revenue Optimization Tips</h3>
        <div className="space-y-3">
          {insights.recommendations.map((tip: string, index: number) => (
            <div key={index} className="flex items-start gap-3 p-3 bg-blue-50 rounded-lg">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                {index + 1}
              </div>
              <span className="text-blue-800">{tip}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Quick Actions */}
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">⚡ Quick Actions</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Button 
            className="bg-green-600 hover:bg-green-700 text-white"
            onClick={() => alert('🎯 A/B testing new ad placements...')}
          >
            <Target className="w-4 h-4 mr-2" />
            Test New Placements
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => alert('📊 Generating detailed revenue report...')}
          >
            <TrendingUp className="w-4 h-4 mr-2" />
            Download Report
          </Button>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => alert('🔄 Refreshing mediation waterfall...')}
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh Mediation
          </Button>
        </div>
      </Card>
    </div>
  );
}
