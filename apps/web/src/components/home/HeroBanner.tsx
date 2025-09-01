"use client";

import Image from "next/image";
import { useAuthStore } from "@/stores/authStore";
import { useHydration, useScrollPosition } from "@/hooks";

export default function HeroBanner() {
  const { user, isAuthenticated } = useAuthStore();
  const isClient = useHydration();
  const { isHeroHidden } = useScrollPosition();

  // 인사말 생성 함수
  const getGreetingMessage = () => {
    // 서버 사이드 렌더링 중이거나 클라이언트가 아직 로드되지 않았을 때
    if (!isClient) {
      return (
        <>
          고객님,
          <br />
          따뜻한 향기 속에서 잠시 쉬어가세요.
        </>
      );
    }

    // 로그인된 사용자의 경우
    if (isAuthenticated && user) {
      const userName = user.name || "고객";
      return (
        <>
          {userName}님,
          <br />
          따뜻한 향기 속에서 잠시 쉬어가세요.
        </>
      );
    }

    // 비로그인 상태이거나 사용자 정보가 없는 경우
    return (
      <>
        고객님,
        <br />
        따뜻한 향기 속에서 잠시 쉬어가세요.
      </>
    );
  };

  return (
    <div
      className={`relative h-50 overflow-hidden transition-opacity duration-500 ${
        isHeroHidden ? "opacity-0" : "opacity-100"
      }`}
    >
      {/* 배경 이미지 - homeImage.png 사용 */}
      <Image
        src="/images/homeImage.png"
        alt="카페 배경 이미지"
        fill
        className="object-cover"
        priority
      />

      {/* 그라데이션 오버레이 */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-white/100 via-white/50 to-transparent" />

      {/* 콘텐츠 */}
      <div className="relative z-10 h-full flex flex-col justify-start p-6">
        <div className="text-white">
          {/* 제목 */}
          <h2 className="text-2xl font-bold mb-2 leading-tight">
            {getGreetingMessage()}
          </h2>
        </div>
      </div>
    </div>
  );
}
