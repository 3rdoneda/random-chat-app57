import { useNavigate } from "react-router-dom";
import { Shield, FileText, Cookie, Mail, Globe } from "lucide-react";

export default function LegalFooter() {
  const navigate = useNavigate();

  const legalLinks = [
    {
      title: "Privacy Policy",
      icon: Shield,
      path: "/privacy-policy",
      description: "How we protect your data"
    },
    {
      title: "Terms of Service", 
      icon: FileText,
      path: "/terms-of-service",
      description: "Our terms and conditions"
    },
    {
      title: "Cookie Policy",
      icon: Cookie,
      path: "/privacy-policy#cookies",
      description: "How we use cookies"
    }
  ];

  return (
    <div className="bg-gray-50 border-t border-gray-200 mt-8">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Legal Links */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {legalLinks.map((link) => (
            <button
              key={link.path}
              onClick={() => navigate(link.path)}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-200 hover:border-gray-300 hover:shadow-sm transition-all duration-200 text-left"
            >
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                <link.icon className="h-5 w-5 text-blue-600" />
              </div>
              <div className="min-w-0 flex-1">
                <h3 className="font-semibold text-gray-900 text-sm">{link.title}</h3>
                <p className="text-xs text-gray-600">{link.description}</p>
              </div>
            </button>
          ))}
        </div>

        {/* Company Info */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
              <Globe className="h-4 w-4 text-white" />
            </div>
            <span className="font-bold text-gray-900">AjnabiCam</span>
          </div>
          
          <div className="space-y-2 text-sm text-gray-600">
            <p>© {new Date().getFullYear()} AjnabiCam. All rights reserved.</p>
            <p>Safe, secure, and fun video chat experience.</p>
          </div>

          {/* Contact Info */}
          <div className="flex items-center justify-center gap-4 text-xs text-gray-500">
            <a 
              href="mailto:support@ajnabicam.com"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <Mail className="h-3 w-3" />
              Support
            </a>
            <span>•</span>
            <a 
              href="mailto:legal@ajnabicam.com"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <FileText className="h-3 w-3" />
              Legal
            </a>
            <span>•</span>
            <a 
              href="mailto:privacy@ajnabicam.com"
              className="flex items-center gap-1 hover:text-blue-600 transition-colors"
            >
              <Shield className="h-3 w-3" />
              Privacy
            </a>
          </div>

          {/* Age Requirement Notice */}
          <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <div className="flex items-center gap-2 justify-center text-sm text-yellow-800">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Age Requirement:</span>
            </div>
            <p className="text-xs text-yellow-700 mt-1">
              You must be at least 13 years old to use AjnabiCam. Users under 18 require parental consent.
            </p>
          </div>

          {/* Safety Notice */}
          <div className="mt-4 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 justify-center text-sm text-blue-800">
              <Shield className="h-4 w-4" />
              <span className="font-medium">Safety First:</span>
            </div>
            <p className="text-xs text-blue-700 mt-1">
              Never share personal information with strangers. Report inappropriate behavior immediately.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
