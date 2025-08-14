import { useQuery } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { userService, User } from "@/lib";
import { tokenManager } from "@/lib/api";

export function useProfileFetch() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  const {
    data: user,
    isLoading: loading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: async (): Promise<User> => {
      try {
        // 토큰이 없으면 기본 사용자 정보 반환 (비로그인 상태)
        if (!tokenManager.hasTokens()) {
          return {
            _id: "",
            name: "고객",
            email: "",
            profileImg: "/images/user.png",
          };
        }

        const userData = await userService.getProfile();
        return userData;
      } catch (error) {
        console.error("사용자 정보를 가져오는데 실패했습니다:", error);
        // 에러 시 기본 사용자 정보 반환
        return {
          _id: "",
          name: "고객",
          email: "",
          profileImg: "/images/user.png",
        };
      }
    },
    staleTime: 5 * 60 * 1000, // 5분간 데이터를 fresh로 유지
    gcTime: 10 * 60 * 1000, // 10분간 캐시 유지
    retry: 1, // 실패 시 1번만 재시도
    retryDelay: 1000, // 1초 후 재시도
    // 클라이언트에서만 쿼리 활성화
    enabled: isClient && tokenManager.hasTokens(),
    // 네트워크 에러나 서버 에러 시에도 기본값 반환
    throwOnError: false,
  });

  return {
    user: user || {
      _id: "",
      name: "고객",
      email: "",
      profileImg: "/images/user.png",
    },
    loading: !isClient || loading,
    error: error ? "사용자 정보를 불러오는데 실패했습니다." : null,
    refetch,
  };
}
