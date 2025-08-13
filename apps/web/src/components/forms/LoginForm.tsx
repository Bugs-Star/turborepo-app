"use client";

import Link from "next/link";
import { Input, Button } from "@repo/ui";
import { Toast } from "@/components/ui";
import { useLoginValidation, useToast } from "@/hooks";
import { authService } from "@/lib";

export default function LoginForm() {
  const { formData, errors, validateForm, handleInputChange } =
    useLoginValidation();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      try {
        const response = await authService.login({
          email: formData.email,
          password: formData.password,
        });

        showSuccess(response.message || "로그인이 완료되었습니다!");

        // 로그인 성공 후 홈 페이지로 리다이렉트
        setTimeout(() => {
          window.location.href = "/home";
        }, 1500);
      } catch (error: any) {
        showError(error.response?.data?.message || "로그인에 실패했습니다.");
      }
    } else {
      showError("입력 정보를 확인해주세요.");
    }
  };

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
          onChange={(e) => handleInputChange("email", e.target.value)}
          error={errors.email}
        />

        <Input
          label="비밀번호"
          type="password"
          placeholder="비밀번호"
          variant="default"
          size="md"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          error={errors.password}
        />

        <Button
          type="submit"
          variant="green"
          size="md"
          fullWidth
          className="rounded-full"
        >
          로그인
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

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
}
