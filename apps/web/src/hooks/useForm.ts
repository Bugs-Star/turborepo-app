import { useCallback, useEffect, useMemo } from "react";
import { useFormStore } from "@/stores/formStore";
import { FormFieldValue, ValidationRule } from "@/types";

// 기본 폼 훅
export const useForm = <T extends Record<string, FormFieldValue>>(
  formKey: string,
  initialData: T,
  validationRules?: Record<string, ValidationRule>
) => {
  const {
    formData,
    formErrors,
    formStates,
    setFormData,
    setFormErrors,
    setFormState,
    initializeForm,
    resetForm,
    clearForm,
  } = useFormStore();

  // 폼 데이터와 에러 상태 구독
  const data = useMemo(
    () => (formData[formKey] || {}) as T,
    [formData, formKey]
  );
  const errors = useMemo(
    () => formErrors[formKey] || {},
    [formErrors, formKey]
  );
  const state = formStates[formKey] || {
    isSubmitting: false,
    isDirty: false,
    isValid: false,
  };

  // 폼 초기화
  useEffect(() => {
    initializeForm(formKey, initialData);
  }, [formKey, initialData, initializeForm]);

  // 필드 값 변경
  const setFieldValue = useCallback(
    (field: keyof T, value: FormFieldValue) => {
      setFormData(formKey, field as string, value);

      // 실시간 에러 제거
      if (errors[field as string]) {
        setFormErrors(formKey, field as string, undefined);
      }
    },
    [formKey, setFormData, setFormErrors, errors]
  );

  // 필드 에러 설정
  const setFieldError = useCallback(
    (field: keyof T, error: string | undefined) => {
      setFormErrors(formKey, field as string, error);
    },
    [formKey, setFormErrors]
  );

  // 필드 유효성 검사
  const validateField = useCallback(
    (
      field: keyof T,
      value: FormFieldValue,
      allData?: Record<string, FormFieldValue>
    ): string | undefined => {
      if (!validationRules || !validationRules[field as string]) {
        return undefined;
      }
      return validationRules[field as string](value, allData);
    },
    [validationRules]
  );

  // 전체 폼 유효성 검사
  const validateForm = useCallback((): boolean => {
    if (!validationRules) return true;

    const newErrors: Record<string, string | undefined> = {};
    let isValid = true;

    Object.keys(data).forEach((field) => {
      const error = validateField(field as keyof T, data[field], data);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    // 에러 상태 업데이트
    Object.keys(newErrors).forEach((field) => {
      setFormErrors(formKey, field, newErrors[field]);
    });

    // 유효성 상태 업데이트
    setFormState(formKey, { isValid });

    return isValid;
  }, [
    formKey,
    data,
    validationRules,
    validateField,
    setFormErrors,
    setFormState,
  ]);

  // 폼 제출 상태 관리
  const setSubmitting = useCallback(
    (isSubmitting: boolean) => {
      setFormState(formKey, { isSubmitting });
    },
    [formKey, setFormState]
  );

  // 폼 리셋
  const reset = useCallback(() => {
    resetForm(formKey);
  }, [formKey, resetForm]);

  // 폼 클리어
  const clear = useCallback(() => {
    clearForm(formKey);
  }, [formKey, clearForm]);

  return {
    // 데이터
    data,
    errors,
    state,

    // 액션들
    setFieldValue,
    setFieldError,
    validateField,
    validateForm,
    setSubmitting,
    reset,
    clear,
  };
};

// 로그인 폼 전용 훅
export const useLoginForm = () => {
  const validationRules = {
    email: (value: FormFieldValue): string | undefined => {
      if (typeof value !== "string" || !value.trim()) {
        return "이메일을 입력해주세요.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "올바른 이메일 형식을 입력해주세요.";
      }
      return undefined;
    },
    password: (value: FormFieldValue): string | undefined => {
      if (typeof value !== "string" || !value.trim()) {
        return "비밀번호를 입력해주세요.";
      }
      return undefined;
    },
  };

  return useForm("login", { email: "", password: "" }, validationRules);
};

// 회원가입 폼 전용 훅
export const useSignupForm = () => {
  const validationRules = {
    name: (value: FormFieldValue): string | undefined => {
      if (typeof value !== "string" || !value.trim()) {
        return "이름을 입력해주세요.";
      }
      if (value.length < 2) {
        return "이름은 2글자 이상 입력해주세요.";
      }
      if (value.length > 15) {
        return "이름은 15글자 이하로 입력해주세요.";
      }
      return undefined;
    },
    email: (value: FormFieldValue): string | undefined => {
      if (typeof value !== "string" || !value.trim()) {
        return "이메일을 입력해주세요.";
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        return "올바른 이메일 형식을 입력해주세요.";
      }
      return undefined;
    },
    password: (value: FormFieldValue): string | undefined => {
      if (typeof value !== "string" || !value.trim()) {
        return "비밀번호를 입력해주세요.";
      }
      if (value.length < 5) {
        return "비밀번호는 5글자 이상 입력해주세요.";
      }
      if (value.length > 15) {
        return "비밀번호는 15글자 이하로 입력해주세요.";
      }
      return undefined;
    },
    confirmPassword: (
      value: FormFieldValue,
      allData?: Record<string, FormFieldValue>
    ): string | undefined => {
      if (typeof value !== "string" || !value.trim()) {
        return "비밀번호 확인을 입력해주세요.";
      }
      if (allData && value !== allData.password) {
        return "비밀번호가 일치하지 않습니다.";
      }
      return undefined;
    },
  };

  return useForm(
    "signup",
    { name: "", email: "", password: "", confirmPassword: "" },
    validationRules
  );
};

// 프로필 편집 폼 전용 훅
export const useProfileForm = () => {
  const validationRules = {
    name: (value: FormFieldValue): string | undefined => {
      if (typeof value !== "string" || !value.trim()) {
        return "이름을 입력해주세요.";
      }
      if (value.length < 2) {
        return "이름은 2글자 이상 입력해주세요.";
      }
      if (value.length > 15) {
        return "이름은 15글자 이하로 입력해주세요.";
      }
      return undefined;
    },
    currentPassword: (
      value: FormFieldValue,
      allData?: Record<string, FormFieldValue>
    ): string | undefined => {
      const { newPassword } = allData || {};

      // 새 비밀번호를 변경하려는 경우에만 현재 비밀번호 필수
      if (newPassword && !value) {
        return "현재 비밀번호를 입력해주세요.";
      }

      return undefined;
    },
    newPassword: (
      value: FormFieldValue,
      allData?: Record<string, FormFieldValue>
    ): string | undefined => {
      const { currentPassword } = allData || {};

      if (typeof value === "string" && value && value.length < 5) {
        return "비밀번호는 5글자 이상 입력해주세요.";
      }
      if (typeof value === "string" && value && value.length > 15) {
        return "비밀번호는 15글자 이하로 입력해주세요.";
      }

      // 새 비밀번호가 현재 비밀번호와 동일한지 검증
      if (
        typeof value === "string" &&
        value &&
        currentPassword &&
        value === currentPassword
      ) {
        return "새 비밀번호는 현재 비밀번호와 달라야 합니다.";
      }

      return undefined;
    },
    confirmPassword: (
      value: FormFieldValue,
      allData?: Record<string, FormFieldValue>
    ): string | undefined => {
      const { newPassword } = allData || {};

      // 새 비밀번호가 입력되지 않았는데 확인 비밀번호가 입력된 경우
      if (!newPassword && value) {
        return "새 비밀번호를 먼저 입력해주세요.";
      }

      // 새 비밀번호가 입력되었는데 확인 비밀번호가 없는 경우
      if (newPassword && !value) {
        return "비밀번호 확인을 입력해주세요.";
      }

      // 두 비밀번호가 다른 경우
      if (newPassword && value && value !== newPassword) {
        return "비밀번호가 일치하지 않습니다.";
      }

      return undefined;
    },
  };

  return useForm(
    "profile",
    { name: "", currentPassword: "", newPassword: "", confirmPassword: "" },
    validationRules
  );
};
