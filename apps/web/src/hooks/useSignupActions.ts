import { useCallback } from "react";
import { useAnalytics } from "./useAnalytics";
import { useNavigation } from "./useNavigation";
import { logger } from "@/lib/logger";

export const useSignupActions = () => {
  const {
    trackSignupAttempt,
    trackSignupSuccess,
    trackSignupFailure,
    trackLoginLinkClick,
  } = useAnalytics();
  const { goToLogin } = useNavigation();

  // 회원가입 시도 핸들러
  const handleSignupAttempt = useCallback(
    (email: string, name: string) => {
      trackSignupAttempt(email, name);
    },
    [trackSignupAttempt]
  );

  // 회원가입 성공 핸들러
  const handleSignupSuccess = useCallback(
    async (email: string, name: string) => {
      trackSignupSuccess(email, name);

      // 큐에 있는 모든 로그를 강제로 전송
      await logger.forceFlush();
    },
    [trackSignupSuccess]
  );

  // 회원가입 실패 핸들러
  const handleSignupFailure = useCallback(
    (email: string, name: string, errorMessage: string) => {
      trackSignupFailure(email, name, errorMessage);
    },
    [trackSignupFailure]
  );

  // 로그인 링크 클릭 핸들러
  const handleLoginLinkClick = useCallback(() => {
    trackLoginLinkClick();
    goToLogin();
  }, [trackLoginLinkClick, goToLogin]);

  return {
    handleSignupAttempt,
    handleSignupSuccess,
    handleSignupFailure,
    handleLoginLinkClick,
  };
};
