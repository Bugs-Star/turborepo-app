"use client";

import Link from "next/link";
import { Input, Button } from "@repo/ui";
import { useLoginForm, useToast } from "@/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useLoginActions } from "@/hooks/useLoginActions";
import { logger } from "@/lib/logger";
import { handleError, getUserFriendlyMessage } from "@/lib/errorHandler";

export default function LoginForm() {
  const {
    data: formData,
    errors,
    validateForm,
    setFieldValue,
    setSubmitting,
    state,
  } = useLoginForm();
  const { showSuccess, showError } = useToast();
  const { login, isLoading } = useAuthStore();
  const {
    handleLoginAttempt,
    handleLoginSuccess,
    handleLoginFailure,
    handleSignupLinkClick,
  } = useLoginActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // 로그인 시도 로그
      handleLoginAttempt();

      setSubmitting(true);
      try {
        await login(formData.email, formData.password);

        // 로그인 성공 로그
        handleLoginSuccess();

        // 큐에 있는 모든 로그를 강제로 전송
        await logger.forceFlush();

        showSuccess("로그인이 완료되었습니다!");

        // 로그 전송 완료 후 홈 페이지로 리다이렉트
        setTimeout(() => {
          window.location.href = "home";
        }, 1500);
      } catch (error: unknown) {
        // 통합 에러 핸들러로 에러 처리
        handleError(error as Error, "LOGIN_FORM");

        // 사용자에게 친화적인 메시지 표시
        const errorMessage = getUserFriendlyMessage(error);
        handleLoginFailure(formData.email, errorMessage);
        showError(errorMessage);
      } finally {
        setSubmitting(false);
      }
    } else {
      showError("입력 정보를 확인해주세요.");
    }
  };

  const isFormLoading = isLoading || state.isSubmitting;

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-md space-y-4"
        noValidate
      >
        <Input
          label="이메일"
          type="email"
          placeholder="이메일"
          variant="default"
          size="md"
          value={formData.email}
          onChange={(e) => setFieldValue("email", e.target.value)}
          error={errors.email}
          disabled={isFormLoading}
        />

        <Input
          label="비밀번호"
          type="password"
          placeholder="비밀번호"
          variant="default"
          size="md"
          value={formData.password}
          onChange={(e) => setFieldValue("password", e.target.value)}
          error={errors.password}
          disabled={isFormLoading}
        />

        <div className="pt-8">
          <Button
            type="submit"
            variant="green"
            size="md"
            fullWidth
            className="rounded-full"
            disabled={isFormLoading}
          >
            {isFormLoading ? "로그인 중..." : "로그인"}
          </Button>
        </div>

        <div className="text-center">
          <p className="text-gray-600">
            계정이 없으신가요?{" "}
            <Link
              href="signup"
              className="text-green-800 hover:underline font-bold"
              onClick={handleSignupLinkClick}
            >
              가입하기
            </Link>
          </p>
        </div>
      </form>
    </>
  );
}
