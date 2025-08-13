"use client";

import { BottomNavigation } from "@/components/layout";
import { ProfileEditForm } from "@/components/forms";

export default function ProfileEditPage() {
  const handleCancel = () => {
    // 취소 시 이전 페이지로 이동
    window.history.back();
  };

  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      {/* Main Content */}
      <div className="flex-1 flex flex-col px-6 py-8">
        <h1 className="text-2xl font-bold mb-8 text-center text-gray-800">
          프로필 편집
        </h1>

        <ProfileEditForm onCancel={handleCancel} />
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
