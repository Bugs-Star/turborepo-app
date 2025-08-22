import { useCallback } from "react";
import { useAnalytics } from "./useAnalytics";
import { useNavigation } from "./useNavigation";
import { logger } from "@/lib/logger";

export const useProfileActions = () => {
  const { trackProfileEditClick, trackOrderHistoryClick, trackLogout } =
    useAnalytics();
  const { goToProfileEdit, goToOrderHistory } = useNavigation();

  // 프로필 편집 클릭 핸들러
  const handleProfileEditClick = useCallback(() => {
    trackProfileEditClick();
    goToProfileEdit();
  }, [trackProfileEditClick, goToProfileEdit]);

  // 결제 내역 클릭 핸들러
  const handleOrderHistoryClick = useCallback(() => {
    trackOrderHistoryClick();
    goToOrderHistory();
  }, [trackOrderHistoryClick, goToOrderHistory]);

  // 로그아웃 핸들러
  const handleLogout = useCallback(async () => {
    // 로그아웃 로그 생성
    trackLogout();

    // 큐에 있는 모든 로그를 강제로 전송
    await logger.forceFlush();
  }, [trackLogout]);

  return {
    handleProfileEditClick,
    handleOrderHistoryClick,
    handleLogout,
  };
};
