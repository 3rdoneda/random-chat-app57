// src/components/ProfileCard.tsx
import { FC } from "react";
import { Button } from "../components/ui/button";

interface ProfileProps {
  name: string;
  age: number;
  distance: string;
  commonInterests: number;
  bio: string;
  about: string[];
  interests: string[];
  imageUrl: string;
}

const ProfileCard: FC<ProfileProps> = ({
  name,
  age,
  distance,
  commonInterests,
  bio,
  about,
  interests,
  imageUrl,
}) => {
  return (
    <div className="max-w-sm mx-auto bg-white rounded-xl shadow-lg overflow-hidden">
      <img src={imageUrl} className="w-full h-64 object-cover" alt="profile" />
      <div className="p-4">
        <h2 className="text-xl font-semibold">{name}, {age}</h2>
        <div className="flex gap-4 text-gray-500 text-sm mt-1">
          <span>📍 {distance}</span>
          <span>⚡ {commonInterests} Common Interests</span>
        </div>
        <p className="text-sm mt-3">{bio}</p>

        <h3 className="mt-4 font-medium">About Me</h3>
        <div className="flex flex-wrap gap-2 mt-1">
          {about.map((item, idx) => (
            <span key={idx} className="text-sm bg-gray-100 px-2 py-1 rounded-full">{item}</span>
          ))}
        </div>

        <h3 className="mt-4 font-medium">Interests</h3>
        <div className="flex flex-wrap gap-2 mt-1">
          {interests.map((item, idx) => (
            <span key={idx} className="text-sm border border-gray-300 px-2 py-1 rounded-full">{item}</span>
          ))}
        </div>

        <div className="flex justify-around mt-6">
          <Button className="rounded-full text-red-500 border border-red-500" variant="outline">❌</Button>
          <Button className="rounded-full text-white bg-pink-500 hover:bg-pink-600">❤️</Button>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
