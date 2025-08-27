"use client";

import { useEffect } from "react";
import { Button } from "@repo/ui";
import {
  useProfileForm,
  useLoading,
  useErrorHandler,
  useProfileImage,
  useFormDataSelector,
  useFormActions,
} from "@/hooks";
import { LoadingIndicator } from "@/components/ui";
import ProfileImageSection from "./ProfileImageSection";
import ProfileField from "./ProfileField";
import { userService } from "@/lib/services";
import { useToast } from "@/hooks";
import { useAuthStore } from "@/stores/authStore";

interface ProfileEditFormProps {
  onCancel: () => void;
}

export default function ProfileEditForm({ onCancel }: ProfileEditFormProps) {
  const { showToast } = useToast();
  const { handleError } = useErrorHandler();
  const { setUser } = useAuthStore();

  // 이미지 상태 관리 훅 사용
  const {
    profileImg,
    imagePreview,
    imageError: profileImgError,
    isOptimizing,
    handleImageChange,
    setImagePreview,
  } = useProfileImage();

  // 로딩 훅들 사용
  const { startLoading: startInitialLoading, stopLoading: stopInitialLoading } =
    useLoading("profile-initial");
  const { isLoading, startLoading, stopLoading } = useLoading("profile-edit");

  const { validateForm, setSubmitting, state } = useProfileForm();

  // 선택적 구독으로 필요한 데이터만 가져오기
  const name = useFormDataSelector<string>("profile", "name") || "";
  const currentPassword =
    useFormDataSelector<string>("profile", "currentPassword") || "";
  const newPassword =
    useFormDataSelector<string>("profile", "newPassword") || "";
  const { setFieldValue } = useFormActions("profile");

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
      } catch (error: unknown) {
        console.error("프로필 정보 로드 오류:", error);
        handleError(error as Error, "프로필 정보를 불러오는데 실패했습니다.");
      } finally {
        stopInitialLoading();
      }
    };

    loadUserProfile();
  }, [
    setFieldValue,
    startInitialLoading,
    stopInitialLoading,
    handleError,
    setImagePreview,
  ]);

  const handleSave = async () => {
    // 전체 폼 유효성 검사
    const isValid = validateForm();

    if (isValid) {
      setSubmitting(true);
      startLoading();

      try {
        // FormData를 사용하여 이미지와 함께 서버로 전송
        const formDataToSend = new FormData();
        formDataToSend.append("name", name);
        if (newPassword) {
          formDataToSend.append("currentPassword", currentPassword);
          formDataToSend.append("newPassword", newPassword);
        }
        if (profileImg) {
          formDataToSend.append("profileImg", profileImg);
        }

        // API 호출
        await userService.updateProfile(formDataToSend);

        // ✅ 상태 동기화: authStore의 사용자 정보 업데이트
        const currentUser = useAuthStore.getState().user;
        if (currentUser) {
          setUser({
            ...currentUser,
            name: name,
            profileImg: profileImg
              ? URL.createObjectURL(profileImg)
              : currentUser.profileImg,
          });
        }

        showToast("프로필이 성공적으로 업데이트되었습니다.", "success");
        onCancel();
      } catch (error: unknown) {
        console.error("프로필 업데이트 오류:", error);

        // 백엔드에서 전달된 에러 메시지가 있으면 사용, 없으면 기본 메시지
        const errorMessage =
          (error as any)?.response?.data?.message ||
          "프로필 업데이트 중 오류가 발생했습니다.";
        showToast(errorMessage, "error");
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
        <ProfileImageSection
          imagePreview={imagePreview}
          imageError={profileImgError}
          isOptimizing={isOptimizing}
          onImageChange={handleImageChange}
        />

        {/* Form Fields */}
        <div className="space-y-6">
          <ProfileField
            field="name"
            label="이름"
            placeholder="이름을 입력하세요"
          />

          <ProfileField
            field="currentPassword"
            label="현재 패스워드"
            type="password"
            placeholder="현재 패스워드를 입력하세요"
          />

          <ProfileField
            field="newPassword"
            label="새로운 패스워드"
            type="password"
            placeholder="새 패스워드를 입력하세요"
          />

          <ProfileField
            field="confirmPassword"
            label="새로운 패스워드 확인"
            type="password"
            placeholder="새 패스워드를 다시 입력하세요"
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
