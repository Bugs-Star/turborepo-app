"use client";

import React, { memo, useState } from "react";
import Image from "next/image";
import { User } from "lucide-react";
import { ImageModal } from "@/components/ui";

interface ProfileCardProps {
  user: {
    _id: string;
    name: string;
    email: string;
    profileImg?: string;
  };
}

const ProfileCard: React.FC<ProfileCardProps> = memo(({ user }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleImageClick = () => {
    if (user.profileImg) {
      setIsModalOpen(true);
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center space-x-4">
          <div
            className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center"
            onClick={handleImageClick}
          >
            {user.profileImg ? (
              <Image
                src={user.profileImg}
                alt={user.name}
                width={64}
                height={64}
                className="w-16 h-16 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity"
              />
            ) : (
              <User className="w-8 h-8 text-gray-500" />
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-xl font-semibold text-gray-800 cursor-default">
              {user.name}
            </h2>
            <p className="text-gray-600 cursor-default">{user.email}</p>
          </div>
        </div>
      </div>

      {/* 이미지 확대 모달 */}
      {user.profileImg && (
        <ImageModal
          isOpen={isModalOpen}
          onClose={handleCloseModal}
          src={user.profileImg}
          alt={user.name}
        />
      )}
    </>
  );
});

ProfileCard.displayName = "ProfileCard";

export default ProfileCard;
