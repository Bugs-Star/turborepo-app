import { create } from "zustand";

interface FormState {
  // 폼 데이터들
  formData: Record<string, Record<string, unknown>>;

  // 폼 에러들
  formErrors: Record<string, Record<string, string | undefined>>;

  // 폼 상태들 (제출 중, 초기화 중 등)
  formStates: Record<
    string,
    {
      isSubmitting: boolean;
      isDirty: boolean;
      isValid: boolean;
    }
  >;

  // 액션들
  setFormData: (formKey: string, field: string, value: unknown) => void;
  setFormErrors: (
    formKey: string,
    field: string,
    error: string | undefined
  ) => void;
  setFormState: (
    formKey: string,
    state: Partial<{
      isSubmitting: boolean;
      isDirty: boolean;
      isValid: boolean;
    }>
  ) => void;

  // 폼 초기화
  initializeForm: (
    formKey: string,
    initialData: Record<string, unknown>
  ) => void;
  resetForm: (formKey: string) => void;
  clearForm: (formKey: string) => void;

  // 유틸리티 함수들
  getFormData: (formKey: string) => Record<string, unknown>;
  getFormErrors: (formKey: string) => Record<string, string | undefined>;
  getFormState: (formKey: string) => {
    isSubmitting: boolean;
    isDirty: boolean;
    isValid: boolean;
  };

  // 전체 클리어
  clearAllForms: () => void;
}

export const useFormStore = create<FormState>((set, get) => ({
  formData: {},
  formErrors: {},
  formStates: {},

  setFormData: (formKey: string, field: string, value: unknown) => {
    set((state) => ({
      formData: {
        ...state.formData,
        [formKey]: {
          ...state.formData[formKey],
          [field]: value,
        },
      },
      formStates: {
        ...state.formStates,
        [formKey]: {
          ...state.formStates[formKey],
          isDirty: true,
        },
      },
    }));
  },

  setFormErrors: (
    formKey: string,
    field: string,
    error: string | undefined
  ) => {
    set((state) => ({
      formErrors: {
        ...state.formErrors,
        [formKey]: {
          ...state.formErrors[formKey],
          [field]: error,
        },
      },
    }));
  },

  setFormState: (
    formKey: string,
    newState: Partial<{
      isSubmitting: boolean;
      isDirty: boolean;
      isValid: boolean;
    }>
  ) => {
    set((state) => ({
      formStates: {
        ...state.formStates,
        [formKey]: {
          ...state.formStates[formKey],
          ...newState,
        },
      },
    }));
  },

  initializeForm: (formKey: string, initialData: Record<string, unknown>) => {
    set((state) => ({
      formData: {
        ...state.formData,
        [formKey]: initialData,
      },
      formErrors: {
        ...state.formErrors,
        [formKey]: {},
      },
      formStates: {
        ...state.formStates,
        [formKey]: {
          isSubmitting: false,
          isDirty: false,
          isValid: false,
        },
      },
    }));
  },

  resetForm: (formKey: string) => {
    set((state) => {
      const newFormData = { ...state.formData };
      const newFormErrors = { ...state.formErrors };
      const newFormStates = { ...state.formStates };

      delete newFormData[formKey];
      delete newFormErrors[formKey];
      delete newFormStates[formKey];

      return {
        formData: newFormData,
        formErrors: newFormErrors,
        formStates: newFormStates,
      };
    });
  },

  clearForm: (formKey: string) => {
    set((state) => ({
      formData: {
        ...state.formData,
        [formKey]: {},
      },
      formErrors: {
        ...state.formErrors,
        [formKey]: {},
      },
      formStates: {
        ...state.formStates,
        [formKey]: {
          isSubmitting: false,
          isDirty: false,
          isValid: false,
        },
      },
    }));
  },

  getFormData: (formKey: string) => {
    return get().formData[formKey] || {};
  },

  getFormErrors: (formKey: string) => {
    return get().formErrors[formKey] || {};
  },

  getFormState: (formKey: string) => {
    return (
      get().formStates[formKey] || {
        isSubmitting: false,
        isDirty: false,
        isValid: false,
      }
    );
  },

  clearAllForms: () => {
    set({
      formData: {},
      formErrors: {},
      formStates: {},
    });
  },
}));
