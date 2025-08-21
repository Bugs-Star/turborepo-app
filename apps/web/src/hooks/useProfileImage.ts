import { useState, useCallback } from "react";
import { optimizeImage, createImagePreview } from "@/utils/imageOptimization";

interface UseProfileImageReturn {
  profileImg: File | null;
  imagePreview: string;
  imageError: string | undefined;
  isOptimizing: boolean;
  handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  resetImage: () => void;
  setImagePreview: (preview: string) => void;
}

export const useProfileImage = (
  initialPreview: string = "/images/user.png"
): UseProfileImageReturn => {
  const [profileImg, setProfileImg] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>(initialPreview);
  const [imageError, setImageError] = useState<string | undefined>();
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);

  const handleImageChange = useCallback(
    async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        // 파일 타입 검증
        const allowedTypes = [
          "image/jpeg",
          "image/png",
          "image/gif",
          "image/webp",
        ];
        if (!allowedTypes.includes(file.type)) {
          setImageError("JPG, PNG, GIF, WebP 파일만 업로드 가능합니다.");
          return;
        }

        // 파일 크기 검증 (10MB)
        if (file.size > 10 * 1024 * 1024) {
          setImageError("파일 크기는 10MB 이하여야 합니다.");
          return;
        }

        // 에러 제거
        setImageError(undefined);
        setIsOptimizing(true);

        try {
          // 이미지 최적화
          const optimizedFile = await optimizeImage(file, {
            maxWidth: 300,
            maxHeight: 300,
            quality: 0.8,
            format: "jpeg",
          });

          // 최적화된 파일 저장
          setProfileImg(optimizedFile);

          // 미리보기 생성
          const preview = await createImagePreview(optimizedFile);
          setImagePreview(preview);
        } catch (error) {
          console.error("이미지 최적화 실패:", error);
          setImageError("이미지 최적화에 실패했습니다.");
        } finally {
          setIsOptimizing(false);
        }
      }
    },
    []
  );

  const resetImage = useCallback(() => {
    setProfileImg(null);
    setImagePreview(initialPreview);
    setImageError(undefined);
    setIsOptimizing(false);
  }, [initialPreview]);

  return {
    profileImg,
    imagePreview,
    imageError,
    isOptimizing,
    handleImageChange,
    resetImage,
    setImagePreview,
  };
};
