"use client";

import Image from "next/image";

interface ProfileCardProps {
  name: string;
  email: string;
  profileImage?: string;
}

export default function ProfileCard({
  name,
  email,
  profileImage,
}: ProfileCardProps) {
  return (
    <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-100">
      <div className="flex items-center space-x-4">
        {/* 프로필 이미지 */}
        <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200 flex items-center justify-center">
          {profileImage ? (
            <Image
              src={profileImage}
              alt={name}
              width={64}
              height={64}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-green-100 flex items-center justify-center">
              <span className="text-green-600 text-xl font-bold">
                {name.charAt(0)}
              </span>
            </div>
          )}
        </div>

        {/* 사용자 정보 */}
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-900">{name}</h3>
          <p className="text-gray-500 text-sm">{email}</p>
        </div>
      </div>
    </div>
  );
}
