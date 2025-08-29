"use client";
import { UploadCloud } from "lucide-react";
import { ReactNode, ChangeEvent, useEffect, useState } from "react";

interface BaseFormProps {
  title: string; // Form 제목
  uploadLabel: string;
  buttonLabel?: string;
  headerExtra?: ReactNode;
  children?: ReactNode;

  imageFile: File | null;
  onImageChange: (file: File | null) => void;

  // ✨ form 이벤트를 받도록 변경
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void | Promise<void>;
}

const BaseForm = ({
  title,
  uploadLabel,
  buttonLabel = "추가",
  headerExtra,
  children,
  imageFile,
  onImageChange,
  onSubmit,
}: BaseFormProps) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // 미리보기 로직
  useEffect(() => {
    if (!imageFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files?.[0]) onImageChange(e.target.files[0]);
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(e);
      }}
      className="max-w-5xl mx-auto mt-5 bg-white p-8 rounded-lg"
    >
      <h1 className="text-xl font-bold mb-6">{title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 이미지 업로드 */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {uploadLabel}
          </label>
          <label className="flex flex-col relative items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-64 cursor-pointer hover:bg-gray-50">
            {previewUrl ? (
              <img
                src={previewUrl}
                alt="미리보기"
                className="object-contain w-full h-full"
              />
            ) : (
              <>
                <UploadCloud className="text-gray-400 w-8 h-8 mb-2" />
                <span className="text-gray-500">
                  {imageFile ? imageFile.name : "이미지 업로드"}
                </span>
              </>
            )}
            <input
              type="file"
              name="image" // ← FormData로 수집되도록 name 부여
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* 입력 영역 */}
        <div className="space-y-4">
          {headerExtra && <div className="mb-4">{headerExtra}</div>}
          {children}

          {/* 제출 버튼 */}
          <button
            type="submit"
            className="w-full bg-[#005C14] hover:bg-green-900 text-white font-bold py-3 rounded-lg cursor-pointer"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </form>
  );
};

export default BaseForm;
