import { useCallback } from "react";
import { useAnalytics } from "./useAnalytics";
import { useNavigation } from "./useNavigation";

export const useLoginActions = () => {
  const {
    trackLoginAttempt,
    trackLoginSuccess,
    trackLoginFailure,
    trackSignupLinkClick,
  } = useAnalytics();
  const { goToSignup } = useNavigation();

  // 로그인 시도 핸들러
  const handleLoginAttempt = useCallback(
    (email: string) => {
      trackLoginAttempt(email);
    },
    [trackLoginAttempt]
  );

  // 로그인 성공 핸들러
  const handleLoginSuccess = useCallback(
    (email: string) => {
      trackLoginSuccess(email);
    },
    [trackLoginSuccess]
  );

  // 로그인 실패 핸들러
  const handleLoginFailure = useCallback(
    (email: string, errorMessage: string) => {
      trackLoginFailure(email, errorMessage);
    },
    [trackLoginFailure]
  );

  // 회원가입 링크 클릭 핸들러
  const handleSignupLinkClick = useCallback(() => {
    trackSignupLinkClick();
    goToSignup();
  }, [trackSignupLinkClick, goToSignup]);

  return {
    handleLoginAttempt,
    handleLoginSuccess,
    handleLoginFailure,
    handleSignupLinkClick,
  };
};
