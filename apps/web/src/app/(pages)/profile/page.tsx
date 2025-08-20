"use client";

import { User, Clock } from "lucide-react";
import {
  ProfileCard,
  ProfileMenuItem,
  LogoutButton,
} from "@/components/profile";
import { BottomNavigation } from "@/components/layout";
import { useAuthStore } from "@/stores/authStore";
import { AsyncWrapper, PageHeader, AuthGuard } from "@/components/ui";
import { useEffect, useCallback } from "react";

export default function ProfilePage() {
  const { user, isLoading, checkAuth } = useAuthStore();

  // 컴포넌트 마운트 시 인증 상태 확인
  const verifyAuth = useCallback(async () => {
    await checkAuth();
  }, [checkAuth]);

  useEffect(() => {
    verifyAuth();
  }, [verifyAuth]);

  return (
    <AuthGuard backgroundColor="bg-gray-50" title="내 프로필" showHeader={true}>
      <AsyncWrapper
        loading={isLoading}
        error={null}
        loadingMessage="프로필 정보를 불러오는 중..."
        errorMessage="잠시 후 다시 시도해주세요."
        onRetry={verifyAuth}
      >
        <div className="min-h-screen bg-gray-50 flex flex-col pb-20">
          <PageHeader title="내 프로필" />
          {/* Main Content */}
          <div className="flex-1 px-4 py-6">
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
              <LogoutButton />
            </div>
          </div>

          {/* Bottom Navigation */}
          <BottomNavigation />
        </div>
      </AsyncWrapper>
    </AuthGuard>
  );
}
