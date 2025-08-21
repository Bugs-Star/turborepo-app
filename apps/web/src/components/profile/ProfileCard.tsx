"use client";

import React, { memo } from "react";
import { User } from "lucide-react";

interface ProfileCardProps {
  user: {
    _id: string;
    name: string;
    email: string;
    profileImg?: string;
  };
}

const ProfileCard: React.FC<ProfileCardProps> = memo(({ user }) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center space-x-4">
        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
          {user.profileImg ? (
            <img
              src={user.profileImg}
              alt={user.name}
              className="w-16 h-16 rounded-full object-cover"
            />
          ) : (
            <User className="w-8 h-8 text-gray-500" />
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-semibold text-gray-800">{user.name}</h2>
          <p className="text-gray-600">{user.email}</p>
        </div>
      </div>
    </div>
  );
});

ProfileCard.displayName = "ProfileCard";

export default ProfileCard;
