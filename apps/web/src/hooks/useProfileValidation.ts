import { useState } from "react";

interface ProfileFormData {
  nickname: string;
  newPassword: string;
  confirmPassword: string;
  profileImage?: File | null;
}

interface ValidationErrors {
  nickname?: string;
  newPassword?: string;
  confirmPassword?: string;
  profileImage?: string;
}

export function useProfileValidation() {
  const [errors, setErrors] = useState<ValidationErrors>({});

  const validateField = (
    field: string,
    value: string,
    formData?: ProfileFormData
  ): string | undefined => {
    switch (field) {
      case "nickname":
        if (!value.trim()) {
          return "닉네임을 입력해주세요.";
        }
        if (value.length < 2) {
          return "닉네임은 2글자 이상 입력해주세요.";
        }
        if (value.length > 15) {
          return "닉네임은 15글자 이하로 입력해주세요.";
        }
        break;

      case "newPassword":
        if (value && value.length < 6) {
          return "패스워드는 6글자 이상 입력해주세요.";
        }
        if (value && value.length > 20) {
          return "패스워드는 20글자 이하로 입력해주세요.";
        }
        break;

      case "confirmPassword":
        if (formData?.newPassword && value !== formData.newPassword) {
          return "패스워드가 일치하지 않습니다.";
        }
        break;
    }
    return undefined;
  };

  const validateImage = (file: File): string | undefined => {
    if (!file.type.startsWith("image/")) {
      return "이미지 파일만 업로드 가능합니다.";
    }
    return undefined;
  };

  const clearFieldError = (field: keyof ValidationErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const setFieldError = (field: keyof ValidationErrors, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const validateForm = (formData: ProfileFormData): boolean => {
    const newErrors: ValidationErrors = {};

    // 각 필드별 유효성 검사
    const nicknameError = validateField("nickname", formData.nickname);
    const newPasswordError = validateField("newPassword", formData.newPassword);
    const confirmPasswordError = validateField(
      "confirmPassword",
      formData.confirmPassword,
      formData
    );

    if (nicknameError) newErrors.nickname = nicknameError;
    if (newPasswordError) newErrors.newPassword = newPasswordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  return {
    errors,
    validateField,
    validateImage,
    clearFieldError,
    setFieldError,
    validateForm,
    clearAllErrors,
  };
}
