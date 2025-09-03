import { useCallback } from "react";
import { useFormStore } from "@/stores/formStore";
import { FormFieldValue } from "@/types";

// 특정 폼 데이터만 구독하는 훅
export const useFormDataSelector = <T = FormFieldValue>(
  formKey: string,
  field: string
): T => {
  const formData = useFormStore((state) => state.formData[formKey]?.[field]);
  return formData as T;
};

// 특정 폼 에러만 구독하는 훅
export const useFormErrorSelector = (
  formKey: string,
  field: string
): string | undefined => {
  const error = useFormStore((state) => state.formErrors[formKey]?.[field]);
  return error;
};

// 특정 폼 상태만 구독하는 훅
export const useFormStateSelector = (
  formKey: string,
  stateKey: "isSubmitting" | "isDirty" | "isValid"
): boolean => {
  const state = useFormStore((state) => state.formStates[formKey]?.[stateKey]);
  return state ?? false;
};

// 폼 액션들을 안정적으로 제공하는 훅
export const useFormActions = (formKey: string) => {
  const { setFormData, setFormErrors, setFormState } = useFormStore();

  const setFieldValue = useCallback(
    (field: string, value: FormFieldValue) => {
      setFormData(formKey, field, value);
    },
    [formKey, setFormData]
  );

  const setFieldError = useCallback(
    (field: string, error: string | undefined) => {
      setFormErrors(formKey, field, error);
    },
    [formKey, setFormErrors]
  );

  const setFormSubmitting = useCallback(
    (isSubmitting: boolean) => {
      setFormState(formKey, { isSubmitting });
    },
    [formKey, setFormState]
  );

  return {
    setFieldValue,
    setFieldError,
    setFormSubmitting,
  };
};
