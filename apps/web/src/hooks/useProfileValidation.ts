import { useState } from "react";

interface ProfileFormData {
  name: string;
  newPassword: string;
  confirmPassword: string;
  profileImg?: File | null;
}

interface ProfileFormErrors {
  name?: string;
  newPassword?: string;
  confirmPassword?: string;
  profileImg?: string;
}

interface ValidationRules {
  name: {
    minLength: number;
    maxLength: number;
  };
  password: {
    minLength: number;
    maxLength: number;
  };
}

const validationRules: ValidationRules = {
  name: {
    minLength: 2,
    maxLength: 15,
  },
  password: {
    minLength: 5,
    maxLength: 15,
  },
};

export function useProfileValidation() {
  const [formData, setFormData] = useState<ProfileFormData>({
    name: "",
    newPassword: "",
    confirmPassword: "",
    profileImg: null,
  });

  const [errors, setErrors] = useState<ProfileFormErrors>({});

  const validateField = (
    field: keyof ProfileFormData,
    value: string,
    currentFormData?: ProfileFormData
  ): string | undefined => {
    const data = currentFormData || formData;

    switch (field) {
      case "name":
        if (!value.trim()) {
          return "이름을 입력해주세요.";
        }
        if (value.length < validationRules.name.minLength) {
          return `이름은 ${validationRules.name.minLength}글자 이상 입력해주세요.`;
        }
        if (value.length > validationRules.name.maxLength) {
          return `이름은 ${validationRules.name.maxLength}글자 이하로 입력해주세요.`;
        }
        break;

      case "newPassword":
        if (value && value.length < validationRules.password.minLength) {
          return `패스워드는 ${validationRules.password.minLength}글자 이상 입력해주세요.`;
        }
        if (value && value.length > validationRules.password.maxLength) {
          return `패스워드는 ${validationRules.password.maxLength}글자 이하로 입력해주세요.`;
        }
        break;

      case "confirmPassword":
        if (data.newPassword && value !== data.newPassword) {
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

  const validateForm = (): boolean => {
    const newErrors: ProfileFormErrors = {};

    // 각 필드별 유효성 검사
    const nameError = validateField("name", formData.name);
    const newPasswordError = validateField("newPassword", formData.newPassword);
    const confirmPasswordError = validateField(
      "confirmPassword",
      formData.confirmPassword
    );

    if (nameError) newErrors.name = nameError;
    if (newPasswordError) newErrors.newPassword = newPasswordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof ProfileFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 실시간 에러 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // 패스워드 확인 필드의 경우, 새 패스워드가 변경되면 다시 검증
    if (field === "newPassword" && formData.confirmPassword) {
      const confirmError = validateField(
        "confirmPassword",
        formData.confirmPassword,
        {
          ...formData,
          newPassword: value,
        }
      );
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const clearFieldError = (field: keyof ProfileFormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const setFieldError = (field: keyof ProfileFormErrors, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const resetForm = () => {
    setFormData({
      name: "",
      newPassword: "",
      confirmPassword: "",
      profileImg: null,
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    validateField,
    validateImage,
    validateForm,
    handleInputChange,
    clearFieldError,
    setFieldError,
    clearAllErrors,
    resetForm,
  };
}
