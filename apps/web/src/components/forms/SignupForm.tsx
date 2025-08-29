"use client";

import Link from "next/link";
import { Input, Button } from "@repo/ui";
import { useSignupForm, useToast } from "@/hooks";
import { useAuthStore } from "@/stores/authStore";
import { useSignupActions } from "@/hooks/useSignupActions";
import { handleError, getUserFriendlyMessage } from "@/lib/errorHandler";

export default function SignupForm() {
  const {
    data: formData,
    errors,
    validateForm,
    setFieldValue,
    setSubmitting,
    state,
  } = useSignupForm();
  const { showSuccess, showError } = useToast();
  const { signup, isLoading } = useAuthStore();
  const {
    handleSignupAttempt,
    handleSignupSuccess,
    handleSignupFailure,
    handleLoginLinkClick,
  } = useSignupActions();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      // 회원가입 시도 로그
      handleSignupAttempt(formData.email, formData.name);

      setSubmitting(true);
      try {
        await signup(formData.name, formData.email, formData.password);

        // 회원가입 성공 로그
        await handleSignupSuccess(formData.email, formData.name);

        showSuccess("회원가입이 완료되었습니다! 자동으로 로그인되었습니다.");

        // 로그 전송 완료 후 홈 페이지로 리다이렉트
        setTimeout(() => {
          window.location.href = "home";
        }, 1500);
      } catch (error: unknown) {
        // 통합 에러 핸들러로 에러 처리
        handleError(error as Error, "SIGNUP_FORM");

        // 사용자에게 친화적인 메시지 표시
        const errorMessage = getUserFriendlyMessage(error);
        handleSignupFailure(formData.email, formData.name, errorMessage);
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
          label="이름"
          placeholder="이름을 입력하세요"
          variant="default"
          size="md"
          value={formData.name}
          onChange={(e) => setFieldValue("name", e.target.value)}
          error={errors.name}
          disabled={isFormLoading}
        />

        <Input
          label="이메일"
          type="email"
          placeholder="이메일 주소를 입력하세요"
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
          placeholder="비밀번호를 입력하세요"
          variant="default"
          size="md"
          value={formData.password}
          onChange={(e) => setFieldValue("password", e.target.value)}
          error={errors.password}
          disabled={isFormLoading}
        />

        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          variant="default"
          size="md"
          value={formData.confirmPassword}
          onChange={(e) => setFieldValue("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
          disabled={isFormLoading}
        />

        <Button
          type="submit"
          variant="green"
          size="md"
          fullWidth
          className="rounded-full"
          disabled={isFormLoading}
        >
          {isFormLoading ? "가입 중..." : "가입하기"}
        </Button>

        <div className="text-center">
          <p className="text-gray-600">
            계정이 없으신가요?{" "}
            <Link
              href="login"
              className="text-green-800 hover:underline font-bold"
              onClick={handleLoginLinkClick}
            >
              로그인
            </Link>
          </p>
        </div>
      </form>
    </>
  );
}
