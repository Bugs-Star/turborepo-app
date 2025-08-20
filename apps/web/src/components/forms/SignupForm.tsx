"use client";

import Link from "next/link";
import { Input, Button } from "@repo/ui";
import { useSignupForm, useToast } from "@/hooks";
import { useAuthStore } from "@/stores/authStore";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setSubmitting(true);
      try {
        await signup(formData.name, formData.email, formData.password);

        showSuccess("회원가입이 완료되었습니다!");

        // 회원가입 성공 후 로그인 페이지로 리다이렉트
        setTimeout(() => {
          window.location.href = "/login";
        }, 1500);
      } catch (error: any) {
        showError(error.response?.data?.message || "회원가입에 실패했습니다.");
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
              href="/login"
              className="text-green-700 hover:underline font-bold"
            >
              로그인
            </Link>
          </p>
        </div>
      </form>
    </>
  );
}
