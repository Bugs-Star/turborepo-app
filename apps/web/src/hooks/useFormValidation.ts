import { useState } from "react";

interface FormData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

interface FormErrors {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
}

interface ValidationRules {
  name: {
    minLength: number;
    maxLength: number;
  };
  email: {
    pattern: RegExp;
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
  email: {
    pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
  },
  password: {
    minLength: 5,
    maxLength: 15,
  },
};

export const useFormValidation = () => {
  const [formData, setFormData] = useState<FormData>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [errors, setErrors] = useState<FormErrors>({});

  const validateField = (
    field: keyof FormData,
    value: string
  ): string | undefined => {
    switch (field) {
      case "name":
        if (value.length < validationRules.name.minLength) {
          return `이름은 ${validationRules.name.minLength}글자 이상 입력해주세요.`;
        }
        if (value.length > validationRules.name.maxLength) {
          return `이름은 ${validationRules.name.maxLength}글자 이하로 입력해주세요.`;
        }
        break;

      case "email":
        if (!validationRules.email.pattern.test(value)) {
          return "올바른 이메일 형식을 입력해주세요.";
        }
        break;

      case "password":
        if (value.length < validationRules.password.minLength) {
          return `비밀번호는 ${validationRules.password.minLength}글자 이상 입력해주세요.`;
        }
        if (value.length > validationRules.password.maxLength) {
          return `비밀번호는 ${validationRules.password.maxLength}글자 이하로 입력해주세요.`;
        }
        break;

      case "confirmPassword":
        if (value !== formData.password) {
          return "비밀번호가 일치하지 않습니다.";
        }
        break;
    }
    return undefined;
  };

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 각 필드별 유효성 검사
    Object.keys(formData).forEach((field) => {
      const key = field as keyof FormData;
      const error = validateField(key, formData[key]);
      if (error) {
        newErrors[key] = error;
      }
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof FormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));

    // 실시간 에러 제거
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }

    // 비밀번호 확인 필드의 경우, 비밀번호가 변경되면 다시 검증
    if (field === "password" && formData.confirmPassword) {
      const confirmError = validateField(
        "confirmPassword",
        formData.confirmPassword
      );
      setErrors((prev) => ({ ...prev, confirmPassword: confirmError }));
    }
  };

  const clearErrors = () => {
    setErrors({});
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
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
