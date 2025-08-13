"use client";

import Link from "next/link";
import { Input, Button } from "@repo/ui";
import { Toast } from "@/components/ui";
import { useSignupValidation, useToast } from "@/hooks";

export default function SignupForm() {
  const { formData, errors, validateForm, handleInputChange } =
    useSignupValidation();
  const { toast, showSuccess, showError, hideToast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validateForm()) {
      showSuccess("회원가입이 완료되었습니다!");
      // 여기에 실제 회원가입 API 호출 로직 추가
      console.log("회원가입 데이터:", formData);
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
          label="이름"
          placeholder="이름을 입력하세요"
          variant="default"
          size="md"
          value={formData.name}
          onChange={(e) => handleInputChange("name", e.target.value)}
          error={errors.name}
        />

        <Input
          label="이메일"
          type="email"
          placeholder="이메일 주소를 입력하세요"
          variant="default"
          size="md"
          value={formData.email}
          onChange={(e) => handleInputChange("email", e.target.value)}
          error={errors.email}
        />

        <Input
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요"
          variant="default"
          size="md"
          value={formData.password}
          onChange={(e) => handleInputChange("password", e.target.value)}
          error={errors.password}
        />

        <Input
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          variant="default"
          size="md"
          value={formData.confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
        />

        <Button
          type="submit"
          variant="green"
          size="md"
          fullWidth
          className="rounded-full"
        >
          가입하기
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

      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.isVisible}
        onClose={hideToast}
      />
    </>
  );
}
