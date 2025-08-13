"use client";

import { User, Clock } from "lucide-react";
import {
  ProfileCard,
  ProfileMenuItem,
  LogoutButton,
} from "@/components/profile";
import { BottomNavigation } from "@/components/layout";

// 더미 데이터
const dummyUser = {
  name: "이정관",
  email: "jungkwan.lee@example.com",
  profileImage: "/images/user.png", // 기본 사용자 이미지
};

export default function ProfilePage() {
  const handleLogout = () => {
    // 로그아웃 로직
    console.log("로그아웃 처리");
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
      {/* Main Content */}
      <div className="flex-1 px-4 py-6">
        {/* 제목 */}
        <h1 className="text-2xl font-bold text-gray-900 mb-6 text-center">
          내 프로필
        </h1>

        {/* 프로필 카드 */}
        <div className="mb-6">
          <ProfileCard
            name={dummyUser.name}
            email={dummyUser.email}
            profileImage={dummyUser.profileImage}
          />
        </div>

        {/* 메뉴 아이템들 */}
        <div className="space-y-3 mb-8">
          <ProfileMenuItem
            icon={User}
            title="프로필 편집"
            href="/profile/edit"
            variant="default"
          />
          <ProfileMenuItem
            icon={Clock}
            title="결제 내역"
            href="/order-history"
            variant="default"
          />
        </div>

        {/* 로그아웃 버튼 */}
        <div className="px-4">
          <LogoutButton onLogout={handleLogout} />
        </div>
      </div>

      {/* Bottom Navigation */}
      <BottomNavigation />
    </div>
  );
}
