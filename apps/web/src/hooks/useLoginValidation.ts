import { useState } from "react";

interface LoginFormData {
  email: string;
  password: string;
}

interface LoginFormErrors {
  email?: string;
  password?: string;
}

interface LoginValidationRules {
  email: {
    pattern: RegExp;
  };
  password: {
    minLength: number;
  };
}

const loginValidationRules: LoginValidationRules = {
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    minLength: 1,
  },
};

export const useLoginValidation = () => {
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
        if (!loginValidationRules.email.pattern.test(value)) {
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

  const clearErrors = () => {
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
    validateForm,
    handleInputChange,
    clearErrors,
    resetForm,
  };
};
