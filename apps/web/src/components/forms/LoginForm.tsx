"use client";

import Link from "next/link";
import { Input, Button } from "@repo/ui";
import { useLoginForm, useToast } from "@/hooks";
import { useAuthStore } from "@/stores/authStore";

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      setSubmitting(true);
      try {
        await login(formData.email, formData.password);

        showSuccess("로그인이 완료되었습니다!");

        // 로그인 성공 후 홈 페이지로 리다이렉트
        setTimeout(() => {
          window.location.href = "/home";
        }, 1500);
      } catch (error: any) {
        showError(error.response?.data?.message || "로그인에 실패했습니다.");
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

        <div className="text-center">
          <p className="text-gray-600">
            계정이 없으신가요?{" "}
            <Link
              href="/signup"
              className="text-green-700 hover:underline font-bold"
            >
              가입하기
            </Link>
          </p>
        </div>
      </form>
    </>
  );
}
