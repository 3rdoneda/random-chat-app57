import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAuth } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { firebaseApp, db, storage } from '../firebaseConfig';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Card } from '../components/ui/card';
import { useLanguage, languages } from '../context/LanguageProvider';
import { Globe, User, Users, ChevronDown, Camera, Upload, X, Plus, Star } from 'lucide-react';

interface PhotoSlot {
  id: number;
  file: File | null;
  preview: string | null;
  isProfile: boolean;
}

export default function OnboardingScreen() {
  const [username, setUsername] = useState('');
  const [gender, setGender] = useState('');
  const [bio, setBio] = useState('');
  const [photos, setPhotos] = useState<PhotoSlot[]>([
    { id: 1, file: null, preview: null, isProfile: true },
    { id: 2, file: null, preview: null, isProfile: false },
    { id: 3, file: null, preview: null, isProfile: false },
  ]);
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const { language, setLanguage, t } = useLanguage();
  const navigate = useNavigate();
  const auth = getAuth(firebaseApp);

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>, photoId: number) => {
    const file = event.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        if (e.target?.result) {
          setPhotos(prev => prev.map(photo => 
            photo.id === photoId 
              ? { ...photo, file, preview: e.target?.result as string }
              : photo
          ));
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const removePhoto = (photoId: number) => {
    setPhotos(prev => prev.map(photo => 
      photo.id === photoId 
        ? { ...photo, file: null, preview: null }
        : photo
    ));
  };

  const setAsProfilePicture = (photoId: number) => {
    setPhotos(prev => prev.map(photo => ({
      ...photo,
      isProfile: photo.id === photoId
    })));
  };

  const uploadImageToFirebase = async (file: File, userId: string): Promise<string | null> => {
    try {
      const imageRef = ref(storage, `profile-images/${userId}_${Date.now()}`);
      const snapshot = await uploadBytes(imageRef, file);
      const downloadURL = await getDownloadURL(snapshot.ref);
      return downloadURL;
    } catch (error) {
      console.error('Error uploading image:', error);
      return null;
    }
  };

  const uploadMultipleImages = async (photos: PhotoSlot[], userId: string): Promise<{profileImage: string | null, additionalImages: string[]}> => {
    const results = { profileImage: null as string | null, additionalImages: [] as string[] };
    
    for (const photo of photos) {
      if (photo.file) {
        const imageUrl = await uploadImageToFirebase(photo.file, userId);
        if (imageUrl) {
          if (photo.isProfile) {
            results.profileImage = imageUrl;
          } else {
            results.additionalImages.push(imageUrl);
          }
        }
      }
    }
    
    return results;
  };

  const handleContinue = async () => {
    if (!username.trim()) {
      alert('Please enter a username');
      return;
    }
    
    if (!gender) {
      alert('Please select your gender');
      return;
    }

    const hasProfilePhoto = photos.some(photo => photo.isProfile && photo.file);
    if (!hasProfilePhoto) {
      alert('Please upload at least one photo and set it as your profile picture');
      return;
    }
    
    if (!isLoading) {
      setIsLoading(true);
      setUploadProgress(0);
      
      try {
        const user = auth.currentUser;
        if (!user) {
          throw new Error('No authenticated user found');
        }

        // Upload all images
        setUploadProgress(30);
        const uploadResults = await uploadMultipleImages(photos, user.uid);
        
        if (!uploadResults.profileImage) {
          throw new Error('Failed to upload profile image');
        }
        
        setUploadProgress(70);

        // Save user data to Firestore and mark onboarding as complete
        const userDocRef = doc(db, "users", user.uid);
        await setDoc(userDocRef, {
          username: username.trim(),
          gender,
          bio: bio.trim(),
          profileImageUrl: uploadResults.profileImage,
          additionalImages: uploadResults.additionalImages,
          language,
          onboardingComplete: true,
          coins: 100, // Initialize with coins
          createdAt: new Date(),
          updatedAt: new Date()
        }, { merge: true });

        setUploadProgress(100);
        console.log('User onboarding data saved to Firestore');
        
        // Small delay to show completion
        setTimeout(() => {
          navigate('/');
        }, 500);
      } catch (error) {
        console.error('Error saving onboarding data:', error);
        alert('Error saving your information. Please try again.');
      } finally {
        setIsLoading(false);
        setUploadProgress(0);
      }
    }
  };

  const handleSkip = async () => {
    if (isLoading) return;
    
    setIsLoading(true);
    
    try {
      const user = auth.currentUser;
      if (!user) {
        throw new Error('No authenticated user found');
      }

      // Save minimal data to Firestore and mark onboarding as complete
      const userDocRef = doc(db, "users", user.uid);
      await setDoc(userDocRef, {
        username: 'User',
        gender: 'other',
        bio: '',
        profileImageUrl: '', // No image for skipped onboarding
        additionalImages: [],
        language,
        onboardingComplete: true,
        coins: 100, // Initialize with coins
        createdAt: new Date(),
        updatedAt: new Date()
      }, { merge: true });

      console.log('User skipped onboarding, minimal data saved to Firestore');
      navigate('/');
    } catch (error) {
      console.error('Error saving skip data:', error);
      alert('Error completing setup. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const genderOptions = [
    { value: 'male', label: t('onboarding.gender.male'), emoji: '👨' },
    { value: 'female', label: t('onboarding.gender.female'), emoji: '👩' },
  ];

  const currentLanguage = languages.find(lang => lang.code === language);

  return (
    <div className="min-h-screen bg-gradient-to-br from-peach-100 via-cream-50 to-blush-100 flex items-center justify-center px-4 py-8">
      <Card className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 relative">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">💕</div>
          <h1 className="text-3xl font-bold bg-gradient-to-r from-peach-600 to-coral-600 bg-clip-text text-transparent mb-2">
            {t('onboarding.welcome')}
          </h1>
          <p className="text-gray-600">{t('onboarding.subtitle')}</p>
        </div>

        <div className="space-y-6">
          {/* Photo Upload Section - Bumble Style */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Camera className="h-4 w-4" />
              Add Photos (Up to 3)
            </label>
            
            {/* Photo Grid - Bumble Style */}
            <div className="grid grid-cols-3 gap-3 mb-4">
              {photos.map((photo, index) => (
                <div key={photo.id} className="relative aspect-[3/4] group">
                  {photo.preview ? (
                    <div className="relative w-full h-full">
                      <img
                        src={photo.preview}
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover rounded-xl border-2 border-gray-200 shadow-md"
                      />
                      
                      {/* Profile Picture Badge */}
                      {photo.isProfile && (
                        <div className="absolute top-2 left-2 bg-gradient-to-r from-yellow-400 to-orange-500 text-white text-xs px-2 py-1 rounded-full font-bold flex items-center gap-1">
                          <Star className="h-3 w-3" />
                          Main
                        </div>
                      )}
                      
                      {/* Action Buttons */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-2">
                        {!photo.isProfile && (
                          <Button
                            size="sm"
                            onClick={() => setAsProfilePicture(photo.id)}
                            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs px-2 py-1"
                            disabled={isLoading}
                          >
                            <Star className="h-3 w-3" />
                          </Button>
                        )}
                        <Button
                          size="sm"
                          onClick={() => removePhoto(photo.id)}
                          className="bg-red-500 hover:bg-red-600 text-white text-xs px-2 py-1"
                          disabled={isLoading}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="w-full h-full border-2 border-dashed border-gray-300 rounded-xl flex flex-col items-center justify-center bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer group">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleImageUpload(e, photo.id)}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                        disabled={isLoading}
                      />
                      <Plus className="h-6 w-6 text-gray-400 group-hover:text-gray-600 mb-1" />
                      <span className="text-xs text-gray-500 text-center px-1">
                        {index === 0 ? 'Main Photo' : `Photo ${index + 1}`}
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            
            <div className="text-center">
             <p className="text-xs text-gray-500 mb-2">
  📸 Add up to 3 photos • First photo will be your main profile picture
</p>
<p className="text-xs text-gray-500 mt-2 text-center">
  💡 Tip: Tap the star to set a photo as your main profile picture
</p>

            </div>
          </div>

          {/* Language Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Globe className="h-4 w-4" />
              {t('onboarding.language')}
            </label>
            <div className="relative">
              <button
                onClick={() => setShowLanguageDropdown(!showLanguageDropdown)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-peach-500 focus:border-transparent bg-white flex items-center justify-between hover:border-peach-300 transition-colors"
                disabled={isLoading}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{currentLanguage?.flag}</span>
                  <span className="font-medium">{currentLanguage?.name}</span>
                </div>
                <ChevronDown className={`h-4 w-4 transition-transform ${showLanguageDropdown ? 'rotate-180' : ''}`} />
              </button>
              
              {showLanguageDropdown && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                        setShowLanguageDropdown(false);
                      }}
                      className={`w-full px-4 py-3 text-left hover:bg-peach-50 flex items-center gap-3 transition-colors ${
                        language === lang.code ? 'bg-peach-100 text-peach-700' : 'text-gray-700'
                      }`}
                      disabled={isLoading}
                    >
                      <span className="text-xl">{lang.flag}</span>
                      <span className="font-medium">{lang.name}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Username Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              {t('onboarding.username')}
            </label>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder={t('onboarding.username.placeholder')}
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-peach-500 focus:border-transparent"
              maxLength={20}
              disabled={isLoading}
            />
          </div>

          {/* Bio Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <User className="h-4 w-4" />
              About You
            </label>
            <Textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people a bit about yourself... What makes you unique? What are you looking for?"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-peach-500 focus:border-transparent resize-none"
              rows={4}
              maxLength={500}
              disabled={isLoading}
            />
            <div className="flex justify-between items-center mt-1">
              <p className="text-xs text-gray-500">
                💭 Share your interests, hobbies, or what you're looking for
              </p>
              <span className="text-xs text-gray-400">{bio.length}/500</span>
            </div>
          </div>

          {/* Gender Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
              <Users className="h-4 w-4" />
              {t('onboarding.gender')}
            </label>
            <div className="grid grid-cols-1 gap-3">
              {genderOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => setGender(option.value)}
                  className={`py-3 px-4 rounded-xl border-2 transition-all flex items-center gap-3 ${
                    gender === option.value 
                      ? 'border-peach-500 bg-peach-50 text-peach-700' 
                      : 'border-gray-300 text-gray-700 hover:border-peach-300 hover:bg-peach-25'
                  }`}
                  disabled={isLoading}
                >
                  <span className="text-2xl">{option.emoji}</span>
                  <span className="font-medium">{option.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Progress Bar (shown during upload) */}
          {isLoading && uploadProgress > 0 && (
            <div className="w-full">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-peach-500 to-coral-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="space-y-3 pt-4">
            <Button
              onClick={handleContinue}
              disabled={!username.trim() || !gender || !photos.some(p => p.isProfile && p.file) || isLoading}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-peach-500 via-coral-500 to-blush-600 hover:from-peach-600 hover:via-coral-600 hover:to-blush-700 text-white font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-200"
            >
              {isLoading ? (
                <div className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  {uploadProgress > 0 ? `Uploading... ${uploadProgress}%` : 'Saving...'}
                </div>
              ) : (
                t('onboarding.continue')
              )}
            </Button>
            
            <Button
              onClick={handleSkip}
              variant="outline"
              disabled={isLoading}
              className="w-full py-3 rounded-xl border-2 border-peach-300 text-peach-700 hover:bg-peach-50 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Processing...' : t('onboarding.skip')}
            </Button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            🔒 Your information is kept private and secure
          </p>
        </div>
      </Card>
    </div>
  );
}
