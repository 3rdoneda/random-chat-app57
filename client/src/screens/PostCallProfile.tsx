// src/screens/PostCallProfile.tsx
import ProfileCard from "../components/ProfileCard";

const PostCallProfile = () => {
  const dummyUser = {
    name: "Shafa Asadel",
    age: 20,
    distance: "2 km away",
    commonInterests: 4,
    bio: "Music enthusiast, always on the lookout for new tunes and ready to share playlists...",
    about: ["Woman", "Muslims", "Taurus", "Never", "Sometimes"],
    interests: ["Pop Punk", "Camping", "Coffee", "Boxing", "Fifa Mobile", "Real Madrid"],
    imageUrl: "/assets/shafa.png", // replace with actual URL or Firebase path
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <ProfileCard {...dummyUser} />
    </div>
  );
};

export default PostCallProfile;
