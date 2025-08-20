"use client";

import { useState, useEffect } from "react";
import { Button } from "@repo/ui";
import { Input } from "@repo/ui";
import { useProfileForm, useLoading } from "@/hooks";
import { LoadingIndicator } from "@/components/ui";
import { userService } from "@/lib/services";
import { useToast } from "@/hooks";

interface ProfileEditFormProps {
  onCancel: () => void;
}

export default function ProfileEditForm({ onCancel }: ProfileEditFormProps) {
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>("/images/user.png");
  const [profileImgError, setProfileImgError] = useState<string | undefined>();
  const { showToast } = useToast();

  // 로딩 훅들 사용
  const {
    isLoading: isInitialLoading,
    startLoading: startInitialLoading,
    stopLoading: stopInitialLoading,
  } = useLoading("profile-initial");
  const { isLoading, startLoading, stopLoading } = useLoading("profile-edit");

  const {
    data: formData,
    errors,
    setFieldValue,
    setFieldError,
    validateForm,
    setSubmitting,
    state,
  } = useProfileForm();

  // 기존 사용자 정보 불러오기
  useEffect(() => {
    const loadUserProfile = async () => {
      startInitialLoading();
      try {
        const user = await userService.getProfile();

        // 기존 정보로 폼 채우기
        setFieldValue("name", user.name || "");

        // 프로필 이미지 설정
        if (user.profileImg) {
          setImagePreview(user.profileImg);
        }
      } catch (error: any) {
        console.error("프로필 정보 로드 오류:", error);
        showToast(
          error.response?.data?.message ||
            "프로필 정보를 불러오는데 실패했습니다.",
          "error"
        );
      } finally {
        stopInitialLoading();
      }
    };

    loadUserProfile();
  }, []);

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // 파일 타입 검증
      const allowedTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!allowedTypes.includes(file.type)) {
        setProfileImgError("JPG, PNG, GIF 파일만 업로드 가능합니다.");
        return;
      }

      // 파일 크기 검증 (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setProfileImgError("파일 크기는 5MB 이하여야 합니다.");
        return;
      }

      // 에러 제거
      setProfileImgError(undefined);

      // 파일 저장
      setProfileImg(file);

      // 미리보기 생성
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    // 전체 폼 유효성 검사
    const isValid = validateForm();

    if (isValid) {
      setSubmitting(true);
      startLoading();

      try {
        // FormData를 사용하여 이미지와 함께 서버로 전송
        const formDataToSend = new FormData();
        formDataToSend.append("name", formData.name);
        if (formData.newPassword) {
          formDataToSend.append("newPassword", formData.newPassword);
        }
        if (profileImg) {
          formDataToSend.append("profileImg", profileImg);
        }

        // API 호출
        await userService.updateProfile(formDataToSend);

        showToast("프로필이 성공적으로 업데이트되었습니다.", "success");
        onCancel();
      } catch (error: any) {
        console.error("프로필 업데이트 오류:", error);
        showToast(
          error.response?.data?.message ||
            "프로필 업데이트 중 오류가 발생했습니다.",
          "error"
        );
      } finally {
        setSubmitting(false);
        stopLoading();
      }
    }
  };

  const isFormLoading = isLoading || state.isSubmitting;

  return (
    <LoadingIndicator
      loadingKey="profile-initial"
      fallback={
        <div className="flex items-center justify-center py-8">
          <div className="text-gray-500">프로필 정보를 불러오는 중...</div>
        </div>
      }
    >
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
          {profileImgError && (
            <p className="text-red-500 text-sm mt-2">{profileImgError}</p>
          )}
        </div>

        {/* Form Fields */}
        <div className="space-y-6">
          {/* Name Field */}
          <Input
            label="이름"
            placeholder="이름을 입력하세요"
            value={formData.name}
            onChange={(e) => setFieldValue("name", e.target.value)}
            error={errors.name}
          />

          {/* New Password Field */}
          <Input
            label="새로운 패스워드"
            type="password"
            placeholder="패스워드를 입력하세요"
            value={formData.newPassword}
            onChange={(e) => setFieldValue("newPassword", e.target.value)}
            error={errors.newPassword}
          />

          {/* Confirm Password Field */}
          <Input
            label="새로운 패스워드 확인"
            type="password"
            placeholder="같은 패스워드를 입력하세요"
            value={formData.confirmPassword}
            onChange={(e) => setFieldValue("confirmPassword", e.target.value)}
            error={errors.confirmPassword}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-4 mt-8">
          <Button
            variant="green"
            fullWidth
            onClick={handleSave}
            disabled={isFormLoading}
          >
            {isFormLoading ? "저장 중..." : "저장"}
          </Button>
          <Button
            variant="white"
            fullWidth
            onClick={onCancel}
            disabled={isFormLoading}
          >
            취소
          </Button>
        </div>
      </>
    </LoadingIndicator>
  );
}
