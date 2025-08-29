"use client";

import { useEffect, useRef } from "react";
import { User, Clock } from "lucide-react";
import {
  ProfileCard,
  ProfileMenuItem,
  LogoutButton,
} from "@/components/profile";
import { BottomNavigation } from "@/components/layout";
import { useAuthStore } from "@/stores/authStore";
import { AsyncWrapper, PageHeader, AuthGuard } from "@/components/ui";
import { useAnalytics, useProfileActions } from "@/hooks";

export default function ProfilePage() {
  const { user, isLoading } = useAuthStore();

  // 로거 훅들
  const { trackScreenView } = useAnalytics();
  const { handleProfileEditClick, handleOrderHistoryClick, handleLogout } =
    useProfileActions();

  // 중복 로깅 방지를 위한 ref
  const hasLoggedScreenView = useRef(false);

  // 페이지 로드 시 화면 조회 로그 (브라우저에서만 실행, 한 번만)
  useEffect(() => {
    if (typeof window !== "undefined" && !hasLoggedScreenView.current) {
      trackScreenView("/profile");
      hasLoggedScreenView.current = true;
    }
  }, [trackScreenView]);

  return (
    <AuthGuard backgroundColor="bg-gray-50" title="내 프로필" showHeader={true}>
      <AsyncWrapper
        loading={isLoading}
        error={null}
        loadingMessage="프로필 정보를 불러오는 중..."
        errorMessage="잠시 후 다시 시도해주세요."
      >
        <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
          <PageHeader title="내 프로필" />
          {/* Main Content */}
          <div className="flex-1 px-6 py-6">
            {/* 프로필 카드 */}
            <div className="mb-6">
              <ProfileCard
                user={
                  user || {
                    _id: "",
                    name: "사용자",
                    email: "user@example.com",
                    profileImg: "/images/user.png",
                  }
                }
              />
            </div>

            {/* 메뉴 아이템들 */}
            <div className="space-y-3 mb-8">
              <ProfileMenuItem
                icon={User}
                title="프로필 편집"
                href="profile/edit"
                variant="default"
                onClick={handleProfileEditClick}
              />
              <ProfileMenuItem
                icon={Clock}
                title="결제 내역"
                href="order-history"
                variant="default"
                onClick={handleOrderHistoryClick}
              />
            </div>

            {/* 로그아웃 버튼 */}
            <div>
              <LogoutButton onLogoutStart={handleLogout} />
            </div>
          </div>

          {/* Bottom Navigation */}
          <BottomNavigation />
        </div>
      </AsyncWrapper>
    </AuthGuard>
  );
}
