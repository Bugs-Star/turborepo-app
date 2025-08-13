import { useState } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

interface ValidationRules {
  email: {
    pattern: RegExp;
  };
}

const validationRules: ValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
};

export function useLoginValidation() {
  const [formData, setFormData] = useState<LoginFormData>({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState<LoginFormErrors>({});

  const validateField = (
    field: keyof LoginFormData,
    value: string
  ): string | undefined => {
    switch (field) {
      case "email":
        if (!value.trim()) {
          return "이메일을 입력해주세요.";
        }
        if (!validationRules.email.pattern.test(value)) {
          return "올바른 이메일 형식을 입력해주세요.";
        }
        break;

      case "password":
        if (!value.trim()) {
          return "비밀번호를 입력해주세요.";
        }
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: LoginFormErrors = {};

    // 각 필드별 유효성 검사
    Object.keys(formData).forEach((field) => {
      const key = field as keyof LoginFormData;
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 실시간 에러 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const clearFieldError = (field: keyof LoginFormErrors) => {
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const setFieldError = (field: keyof LoginFormErrors, error: string) => {
    setErrors((prev) => ({ ...prev, [field]: error }));
  };

  const clearAllErrors = () => {
    setErrors({});
  };

  const resetForm = () => {
    setFormData({
      email: "",
      password: "",
    });
    setErrors({});
  };

  return {
    formData,
    errors,
    validateField,
    validateForm,
    handleInputChange,
    clearFieldError,
    setFieldError,
    clearAllErrors,
    resetForm,
  };
}
