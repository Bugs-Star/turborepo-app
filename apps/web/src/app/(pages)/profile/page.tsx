"use client";

import { useState, useEffect } from "react";
import { User, Clock } from "lucide-react";
import {
  ProfileCard,
  ProfileMenuItem,
  LogoutButton,
} from "@/components/profile";
import { BottomNavigation } from "@/components/layout";
import { userService, User as UserType } from "@/lib";

export default function ProfilePage() {
  const [user, setUser] = useState<UserType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const userData = await userService.getProfile();
      setUser(userData);
    } catch (error) {
      console.error("사용자 정보를 가져오는데 실패했습니다:", error);
      // 에러 시 기본 사용자 정보 사용
      setUser({
        _id: "",
        name: "사용자",
        email: "user@example.com",
        profileImage: "/images/user.png",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // 로그아웃 로직은 LogoutButton 컴포넌트에서 처리됨
    console.log("로그아웃 처리");
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-gray-600">로딩 중...</div>
        </div>
        <BottomNavigation />
      </div>
    );
  }

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
            name={user?.name || "사용자"}
            email={user?.email || "user@example.com"}
            profileImage={user?.profileImage || "/images/user.png"}
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
