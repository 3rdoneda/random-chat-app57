import { useState, useEffect } from "react";
import { Calendar, AlertTriangle, Shield, Check } from "lucide-react";
import { Button } from "./ui/button";

interface AgeVerificationProps {
  onVerified: (isVerified: boolean, age: number) => void;
}

export default function AgeVerification({ onVerified }: AgeVerificationProps) {
  const [birthDate, setBirthDate] = useState({
    month: '',
    day: '',
    year: ''
  });
  const [showVerification, setShowVerification] = useState(false);
  const [error, setError] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);

  useEffect(() => {
    // Check if user has already been verified
    const ageVerified = localStorage.getItem('age-verified');
    const verificationDate = localStorage.getItem('age-verification-date');
    
    if (ageVerified === 'true' && verificationDate) {
      const daysSinceVerification = (Date.now() - parseInt(verificationDate)) / (1000 * 60 * 60 * 24);
      
      // Re-verify every 30 days for security
      if (daysSinceVerification < 30) {
        const storedAge = localStorage.getItem('user-age');
        onVerified(true, parseInt(storedAge || '18'));
        return;
      }
    }
    
    // Show verification modal after a short delay
    setTimeout(() => setShowVerification(true), 1000);
  }, [onVerified]);

  const calculateAge = (birthDate: { month: string; day: string; year: string }) => {
    const today = new Date();
    const birth = new Date(
      parseInt(birthDate.year),
      parseInt(birthDate.month) - 1,
      parseInt(birthDate.day)
    );
    
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return age;
  };

  const validateDate = () => {
    const { month, day, year } = birthDate;
    
    if (!month || !day || !year) {
      setError('Please fill in all fields');
      return false;
    }
    
    const monthNum = parseInt(month);
    const dayNum = parseInt(day);
    const yearNum = parseInt(year);
    
    if (monthNum < 1 || monthNum > 12) {
      setError('Invalid month');
      return false;
    }
    
    if (dayNum < 1 || dayNum > 31) {
      setError('Invalid day');
      return false;
    }
    
    const currentYear = new Date().getFullYear();
    if (yearNum < 1900 || yearNum > currentYear) {
      setError('Invalid year');
      return false;
    }
    
    // Check if date exists
    const date = new Date(yearNum, monthNum - 1, dayNum);
    if (date.getMonth() !== monthNum - 1 || 
        date.getDate() !== dayNum || 
        date.getFullYear() !== yearNum) {
      setError('Invalid date');
      return false;
    }
    
    // Check if date is in the future
    if (date > new Date()) {
      setError('Birth date cannot be in the future');
      return false;
    }
    
    return true;
  };

  const handleVerification = async () => {
    setError('');
    
    if (!validateDate()) {
      return;
    }
    
    setIsVerifying(true);
    
    // Simulate verification process
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const age = calculateAge(birthDate);
    
    if (age < 13) {
      setError('You must be at least 13 years old to use AjnabiCam');
      setIsVerifying(false);
      onVerified(false, age);
      return;
    }
    
    // Store verification
    localStorage.setItem('age-verified', 'true');
    localStorage.setItem('age-verification-date', Date.now().toString());
    localStorage.setItem('user-age', age.toString());
    localStorage.setItem('requires-parental-consent', age < 18 ? 'true' : 'false');
    
    setIsVerifying(false);
    setShowVerification(false);
    onVerified(true, age);
  };

  const handleDecline = () => {
    onVerified(false, 0);
  };

  if (!showVerification) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[200] bg-black/80 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 text-center relative overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 to-purple-50 opacity-50" />
        
        <div className="relative z-10">
          {/* Icon */}
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Shield className="h-8 w-8 text-blue-600" />
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            Age Verification Required
          </h2>
          
          <p className="text-gray-600 mb-6">
            To ensure a safe environment, please verify that you're at least 13 years old to use AjnabiCam.
          </p>

          {/* Date Input */}
          <div className="space-y-4 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-700 font-medium">Enter your birth date:</span>
            </div>
            
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Month</label>
                <select
                  value={birthDate.month}
                  onChange={(e) => setBirthDate({...birthDate, month: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">MM</option>
                  {Array.from({length: 12}, (_, i) => (
                    <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Day</label>
                <select
                  value={birthDate.day}
                  onChange={(e) => setBirthDate({...birthDate, day: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">DD</option>
                  {Array.from({length: 31}, (_, i) => (
                    <option key={i + 1} value={i + 1}>{String(i + 1).padStart(2, '0')}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-xs text-gray-500 mb-1">Year</label>
                <select
                  value={birthDate.year}
                  onChange={(e) => setBirthDate({...birthDate, year: e.target.value})}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">YYYY</option>
                  {Array.from({length: 100}, (_, i) => {
                    const year = new Date().getFullYear() - i;
                    return <option key={year} value={year}>{year}</option>;
                  })}
                </select>
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
              <AlertTriangle className="h-4 w-4 text-red-500 flex-shrink-0" />
              <span className="text-sm text-red-700">{error}</span>
            </div>
          )}

          {/* Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleVerification}
              disabled={isVerifying}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
            >
              {isVerifying ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Verifying...
                </div>
              ) : (
                <div className="flex items-center justify-center gap-2">
                  <Check className="h-4 w-4" />
                  Verify Age
                </div>
              )}
            </Button>
            
            <Button
              onClick={handleDecline}
              variant="outline"
              className="w-full py-3 rounded-lg font-semibold"
            >
              I'm under 13
            </Button>
          </div>

          {/* Legal Note */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg">
            <p className="text-xs text-gray-600 leading-relaxed">
              <strong>Privacy Notice:</strong> Your birth date is used only for age verification and is stored locally on your device. 
              Users under 18 may require parental consent. By proceeding, you agree to our{' '}
              <span className="text-blue-600 underline cursor-pointer">Terms of Service</span> and{' '}
              <span className="text-blue-600 underline cursor-pointer">Privacy Policy</span>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
