import { useNavigate } from "react-router-dom";
import { ArrowLeft, FileText, AlertTriangle, Crown, Shield, Ban } from "lucide-react";
import { Button } from "../components/ui/button";

export default function TermsOfServicePage() {
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
            <h1 className="text-lg font-bold text-gray-900">Terms of Service</h1>
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
              <FileText className="h-5 w-5 text-blue-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Agreement to Terms</h2>
          </div>
          <p className="text-gray-700 leading-relaxed">
            By accessing and using AjnabiCam, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
          </p>
        </div>

        {/* Service Description */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Service Description</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              AjnabiCam is a video chat platform that connects users randomly for conversations. Our service includes:
            </p>
            <ul className="list-disc list-inside space-y-1">
              <li>Random video and audio chat connections</li>
              <li>User profiles and friend systems</li>
              <li>Premium subscription features</li>
              <li>In-app coin system and rewards</li>
              <li>AI-powered chat assistance</li>
            </ul>
          </div>
        </div>

        {/* User Eligibility */}
        <div className="bg-yellow-50 rounded-xl p-6 border border-yellow-200">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">User Eligibility & Age Requirements</h2>
          </div>
          <div className="space-y-3 text-gray-700">
            <p><strong>Minimum Age:</strong> You must be at least 13 years old to use AjnabiCam.</p>
            <p><strong>Parental Consent:</strong> Users under 18 must have parental or guardian consent.</p>
            <p><strong>Verification:</strong> We reserve the right to verify age and may request identification.</p>
            <p><strong>Prohibited Users:</strong> Individuals banned from similar platforms or with history of abuse are prohibited.</p>
          </div>
        </div>

        {/* User Conduct */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
              <Ban className="h-5 w-5 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">User Conduct & Prohibited Activities</h2>
          </div>
          
          <div className="space-y-4">
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Prohibited Content</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Nudity, sexual content, or adult material</li>
                <li>Harassment, bullying, or threatening behavior</li>
                <li>Hate speech, discrimination, or offensive content</li>
                <li>Violence, self-harm, or dangerous activities</li>
                <li>Spam, scams, or fraudulent activities</li>
                <li>Copyright infringement or unauthorized content</li>
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold text-gray-800 mb-2">Prohibited Actions</h3>
              <ul className="list-disc list-inside text-gray-700 space-y-1">
                <li>Recording or saving video calls without consent</li>
                <li>Sharing personal information of other users</li>
                <li>Creating multiple accounts or fake profiles</li>
                <li>Attempting to hack or disrupt the service</li>
                <li>Using bots, scripts, or automated tools</li>
                <li>Commercial activities or advertisements</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Privacy & Safety */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-green-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Privacy & Safety</h2>
          </div>
          
          <div className="space-y-3 text-gray-700">
            <p><strong>No Recording:</strong> Video and audio calls are not recorded or stored by AjnabiCam.</p>
            <p><strong>Report System:</strong> Users can report inappropriate behavior or content.</p>
            <p><strong>Blocking:</strong> Users can block others to prevent future connections.</p>
            <p><strong>Moderation:</strong> We employ automated and human moderation systems.</p>
            <p><strong>Safety Tips:</strong> Never share personal information with strangers.</p>
          </div>
        </div>

        {/* Premium Services */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
              <Crown className="h-5 w-5 text-purple-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Premium Services & Payments</h2>
          </div>
          
          <div className="space-y-3 text-gray-700">
            <p><strong>Subscription Plans:</strong> We offer various premium subscription tiers with enhanced features.</p>
            <p><strong>Billing:</strong> Subscriptions are billed according to the plan you select.</p>
            <p><strong>Cancellation:</strong> You may cancel your subscription at any time through your account settings.</p>
            <p><strong>Refunds:</strong> Refunds are handled according to platform policies (App Store/Google Play).</p>
            <p><strong>Coins System:</strong> Virtual coins can be earned or purchased for premium features.</p>
          </div>
        </div>

        {/* Intellectual Property */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Intellectual Property</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Our Content:</strong> All AjnabiCam branding, logos, and app features are our intellectual property.
            </p>
            <p>
              <strong>User Content:</strong> You retain ownership of content you create but grant us license to use it for service operation.
            </p>
            <p>
              <strong>Copyright:</strong> We respect intellectual property rights and will remove infringing content when notified.
            </p>
          </div>
        </div>

        {/* Account Termination */}
        <div className="bg-red-50 rounded-xl p-6 border border-red-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Account Termination</h2>
          <div className="space-y-3 text-gray-700">
            <p><strong>Violations:</strong> Accounts may be suspended or terminated for violating these terms.</p>
            <p><strong>Immediate Termination:</strong> Serious violations may result in immediate permanent bans.</p>
            <p><strong>Data Deletion:</strong> Terminated accounts will have their data deleted according to our privacy policy.</p>
            <p><strong>Appeal Process:</strong> Users may appeal account actions through our support system.</p>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Disclaimers & Limitations</h2>
          <div className="space-y-3 text-gray-700">
            <p>
              <strong>Service Availability:</strong> We strive for 99.9% uptime but cannot guarantee uninterrupted service.
            </p>
            <p>
              <strong>User Interactions:</strong> We are not responsible for user behavior or interactions outside our platform.
            </p>
            <p>
              <strong>Third-Party Content:</strong> Links or references to external content are not our responsibility.
            </p>
            <p>
              <strong>Limitation of Liability:</strong> Our liability is limited to the maximum extent permitted by law.
            </p>
          </div>
        </div>

        {/* Changes to Terms */}
        <div className="bg-blue-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Changes to Terms</h2>
          <p className="text-gray-700">
            We reserve the right to modify these terms at any time. Users will be notified of significant changes through the app or email. Continued use after changes constitutes acceptance of new terms.
          </p>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Governing Law</h2>
          <p className="text-gray-700">
            These terms are governed by applicable laws. Any disputes will be resolved through binding arbitration in accordance with platform policies.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gray-50 rounded-xl p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-3">Contact Information</h2>
          <p className="text-gray-700 mb-3">
            Questions about these Terms of Service? Contact us:
          </p>
          <div className="space-y-1 text-gray-700">
            <p><strong>Email:</strong> legal@ajnabicam.com</p>
            <p><strong>Support:</strong> support@ajnabicam.com</p>
            <p><strong>Website:</strong> https://ajnabicam.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}
