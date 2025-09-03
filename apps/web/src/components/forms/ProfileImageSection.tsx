import React from "react";
import Image from "next/image";

interface ProfileImageSectionProps {
  imagePreview: string;
  imageError?: string;
  isOptimizing?: boolean;
  onImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfileImageSection: React.FC<ProfileImageSectionProps> = ({
  imagePreview,
  imageError,
  isOptimizing = false,
  onImageChange,
}) => {
  return (
    <div className="flex flex-col items-center mb-8">
      <div className="relative w-24 h-24 mb-4 group">
        <Image
          src={imagePreview}
          alt="프로필 이미지"
          width={96}
          height={96}
          className={`w-full h-full rounded-full object-cover transition-opacity duration-200 ${
            isOptimizing ? "opacity-50" : "opacity-100"
          }`}
        />
        {isOptimizing && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
          </div>
        )}
        <label
          className={`absolute inset-0 flex items-center justify-center cursor-pointer ${
            isOptimizing ? "pointer-events-none" : ""
          }`}
        >
          <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
            {isOptimizing ? "최적화 중..." : "사진 변경"}
          </span>
          <input
            type="file"
            accept="image/*"
            onChange={onImageChange}
            className="hidden"
            disabled={isOptimizing}
          />
        </label>
      </div>
      {imageError && <p className="text-red-500 text-sm mt-2">{imageError}</p>}
    </div>
  );
};

export default ProfileImageSection;
