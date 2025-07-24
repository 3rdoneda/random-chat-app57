import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, Database, Cookie, UserCheck, Globe } from "lucide-react";
import { Button } from "../components/ui/button";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="flex items-center gap-3 px-4 py-3">
          <Button
            onClick={() => navigate(-1)}
            variant="ghost"
            size="sm"
            className="p-2"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-lg font-bold text-gray-900">Privacy Policy</h1>
            <p className="text-sm text-gray-600">Last updated: {new Date().toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 space-y-8">
        
        {/* Introduction */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Introduction</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            AjnabiCam ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, and safeguard your information when you use our video chat application.
          </p>
        </div>

        {/* Information We Collect */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Database className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Information We Collect</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Account Information</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Profile information (username, age, gender, bio)</li>
                <li>Profile pictures you upload</li>
                <li>Preferences and settings</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Usage Data</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Chat sessions and connection logs</li>
                <li>Feature usage and interactions</li>
                <li>Device information and IP address</li>
                <li>App performance and error logs</li>
              </ul>
            </div>

            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Media Content</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Video and audio streams (not recorded or stored)</li>
                <li>Photos shared during chats (temporarily stored)</li>
              </ul>
            </div>
          </div>
        </div>

        {/* How We Use Information */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <UserCheck className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">How We Use Your Information</h2>
          </div>
          
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li>Provide and maintain our video chat service</li>
            <li>Match you with other users based on preferences</li>
            <li>Improve app performance and user experience</li>
            <li>Ensure safety and prevent abuse</li>
            <li>Process premium subscriptions and payments</li>
            <li>Send notifications about your account or service updates</li>
          </ul>
        </div>

        {/* Data Storage & Security */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Data Storage & Security</h2>
          </div>
          
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Video Calls:</strong> All video and audio streams are peer-to-peer and not recorded or stored on our servers.
            </p>
            <p>
              <strong>Chat Photos:</strong> Images shared during chats are temporarily stored and automatically deleted after 24 hours.
            </p>
            <p>
              <strong>Security:</strong> We use industry-standard encryption and security measures to protect your data.
            </p>
            <p>
              <strong>Data Location:</strong> Your data is stored securely using Firebase services with appropriate security rules.
            </p>
          </div>
        </div>

        {/* Cookies & Tracking */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
              <Cookie className="h-5 w-5 text-orange-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Cookies & Tracking</h2>
          </div>
          
          <div className="space-y-3 text-gray-700">
            <p>We use local storage and cookies to:</p>
            <ul className="list-disc list-inside space-y-1">
              <li>Remember your preferences and settings</li>
              <li>Keep you logged in</li>
              <li>Analyze app usage patterns</li>
              <li>Provide personalized experiences</li>
            </ul>
          </div>
        </div>

        {/* Your Rights */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Globe className="h-5 w-5 text-indigo-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Your Rights</h2>
          </div>
          
          <ul className="list-disc list-inside text-gray-700 space-y-2">
            <li><strong>Access:</strong> Request access to your personal data</li>
            <li><strong>Correction:</strong> Update or correct your information</li>
            <li><strong>Deletion:</strong> Request deletion of your account and data</li>
            <li><strong>Portability:</strong> Request a copy of your data</li>
            <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
          </ul>
        </div>

        {/* Age Requirements */}
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Age Requirements</h2>
          <p className="text-gray-700">
            You must be at least 13 years old to use AjnabiCam. Users under 18 should have parental consent. We do not knowingly collect personal information from children under 13.
          </p>
        </div>

        {/* Third-Party Services */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Third-Party Services</h2>
          <p className="text-gray-700 mb-3">We use the following third-party services:</p>
          <ul className="list-disc list-inside text-gray-700 space-y-1">
            <li><strong>Firebase:</strong> Database, authentication, and file storage</li>
            <li><strong>AdMob:</strong> Advertising (for free users)</li>
            <li><strong>Analytics:</strong> App usage and performance monitoring</li>
          </ul>
        </div>

        {/* Contact Information */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Us</h2>
          <p className="text-gray-700 mb-3">
            If you have questions about this Privacy Policy or your data, contact us:
          </p>
          <div className="space-y-1 text-gray-700">
            <p><strong>Email:</strong> privacy@ajnabicam.com</p>
            <p><strong>Website:</strong> https://ajnabicam.com</p>
          </div>
        </div>

        {/* Updates */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Policy Updates</h2>
          <p className="text-gray-700">
            We may update this Privacy Policy periodically. We will notify you of significant changes through the app or via email. Your continued use of AjnabiCam after changes become effective constitutes acceptance of the updated policy.
          </p>
        </div>
      </div>
    </div>
  );
}
