"use client";

import { useState } from "react";
import { Input, Button } from "@repo/ui";
import { useProfileValidation } from "@/hooks";

interface ProfileEditFormProps {
  onCancel: () => void;
}

export default function ProfileEditForm({ onCancel }: ProfileEditFormProps) {
  const [nickname, setNickname] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [profileImage, setProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("/images/user.png");

  const {
    errors,
    validateField,
    validateImage,
    clearFieldError,
    setFieldError,
    validateForm,
  } = useProfileValidation();

  const handleInputChange = (field: string, value: string) => {
    // 상태 업데이트
    switch (field) {
      case "nickname":
        setNickname(value);
        break;
      case "newPassword":
        setNewPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
    }

    // 실시간 에러 제거
    clearFieldError(field as keyof typeof errors);

    // 패스워드 확인 필드의 경우, 새 패스워드가 변경되면 다시 검증
    if (field === "newPassword" && confirmPassword) {
      const confirmError = validateField("confirmPassword", confirmPassword, {
        nickname,
        newPassword: value,
        confirmPassword,
        profileImage,
      });
      if (confirmError) {
        setFieldError("confirmPassword", confirmError);
      }
    }
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 타입 검증
      const imageError = validateImage(file);
      if (imageError) {
        setFieldError("profileImage", imageError);
        return;
      }

      // 에러 제거
      clearFieldError("profileImage");

      // 파일 저장
      setProfileImage(file);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = () => {
    // 전체 폼 유효성 검사
    const isValid = validateForm({
      nickname,
      newPassword,
      confirmPassword,
      profileImage,
    });

    if (isValid) {
      // 저장 로직 구현
      console.log("프로필 저장:", {
        nickname,
        newPassword,
        profileImage: profileImage ? profileImage.name : "변경 없음",
      });

      // FormData를 사용하여 이미지와 함께 서버로 전송
      const formData = new FormData();
      formData.append("nickname", nickname);
      if (newPassword) {
        formData.append("newPassword", newPassword);
      }
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      // TODO: API 호출
      // await updateProfile(formData);
    }
  };

  return (
    <>
      {/* Profile Picture Section */}
      <div className="flex flex-col items-center mb-8">
        <div className="relative w-24 h-24 mb-4 group">
          <img
            src={imagePreview}
            alt="프로필 이미지"
            className="w-full h-full rounded-full object-cover"
          />
          <label className="absolute inset-0 flex items-center justify-center cursor-pointer">
            <span className="text-white text-sm font-medium opacity-0 group-hover:opacity-100 transition-opacity duration-200 drop-shadow-lg px-2 py-1 rounded bg-black/50 backdrop-blur-sm">
              사진 변경
            </span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
        </div>
        {errors.profileImage && (
          <p className="text-red-500 text-sm mt-2">{errors.profileImage}</p>
        )}
      </div>

      {/* Form Fields */}
      <div className="space-y-6">
        {/* Nickname Field */}
        <Input
          label="닉네임"
          placeholder="닉네임을 입력하세요"
          value={nickname}
          onChange={(e) => handleInputChange("nickname", e.target.value)}
          error={errors.nickname}
        />

        {/* New Password Field */}
        <Input
          label="새로운 패스워드"
          type="password"
          placeholder="패스워드를 입력하세요"
          value={newPassword}
          onChange={(e) => handleInputChange("newPassword", e.target.value)}
          error={errors.newPassword}
        />

        {/* Confirm Password Field */}
        <Input
          label="새로운 패스워드 확인"
          type="password"
          placeholder="같은 패스워드를 입력하세요"
          value={confirmPassword}
          onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
          error={errors.confirmPassword}
        />
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4 mt-8">
        <Button variant="green" fullWidth onClick={handleSave}>
          저장
        </Button>
        <Button variant="white" fullWidth onClick={onCancel}>
          취소
        </Button>
      </div>
    </>
  );
}
