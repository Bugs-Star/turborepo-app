import React, { memo, useCallback } from "react";
import { Input } from "@repo/ui";
import {
  useFormDataSelector,
  useFormErrorSelector,
  useFormActions,
} from "@/hooks/useFormSelectors";

interface ProfileFieldProps {
  field: "name" | "newPassword" | "confirmPassword";
  label: string;
  placeholder: string;
  type?: "text" | "password";
}

const ProfileField: React.FC<ProfileFieldProps> = memo(
  ({ field, label, placeholder, type = "text" }) => {
    // 선택적 구독으로 필요한 데이터만 가져오기
    const value = useFormDataSelector<string>("profile", field) || "";
    const error = useFormErrorSelector("profile", field);
    const { setFieldValue } = useFormActions("profile");

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        setFieldValue(field, e.target.value);
      },
      [setFieldValue, field]
    );

    return (
      <Input
        label={label}
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={handleChange}
        error={error}
      />
    );
  }
);

ProfileField.displayName = "ProfileField";

export default ProfileField;
