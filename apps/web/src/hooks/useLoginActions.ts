import { useCallback } from "react";
import { useAnalytics } from "./useAnalytics";
import { useNavigation } from "./useNavigation";

export const useLoginActions = () => {
  const { trackLoginSubmit, trackSignupSubmit } = useAnalytics();
  const { goToSignup } = useNavigation();

  // 로그인 시도 핸들러
  const handleLoginAttempt = useCallback(() => {
    trackLoginSubmit();
  }, [trackLoginSubmit]);

  // 로그인 성공 핸들러
  const handleLoginSuccess = useCallback(() => {
    // 로그인 성공은 별도 로깅 없이 처리
  }, []);

  // 로그인 실패 핸들러
  const handleLoginFailure = useCallback(() => {
    // 로그인 실패는 별도 로깅 없이 처리
  }, []);

  // 회원가입 링크 클릭 핸들러
  const handleSignupLinkClick = useCallback(() => {
    trackSignupSubmit();
    goToSignup();
  }, [trackSignupSubmit, goToSignup]);

  return {
    handleLoginAttempt,
    handleLoginSuccess,
    handleLoginFailure,
    handleSignupLinkClick,
  };
};
