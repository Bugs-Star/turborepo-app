"use client";
import { UploadCloud } from "lucide-react";
import { ReactNode, useState, ChangeEvent } from "react";

interface BaseFormProps {
  title: string;
  uploadLabel: string;
  onSubmit?: (formData: FormData) => void; // FormData 전달
  buttonLabel?: string;
  children?: ReactNode;
  headerExtra?: ReactNode;
}

const BaseForm = ({
  title,
  uploadLabel,
  onSubmit,
  buttonLabel = "추가",
  children,
  headerExtra,
}: BaseFormProps) => {
  const [titleValue, setTitleValue] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = () => {
    if (!onSubmit) return;

    const formData = new FormData();
    formData.append("title", titleValue);
    formData.append("description", description);
    if (imageFile) formData.append("image", imageFile);

    onSubmit(formData);
  };

  return (
    <div className="max-w-5xl mx-auto mt-5 bg-white p-8 rounded-lg">
      <h1 className="text-xl font-bold mb-6">{title}</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 이미지 업로드 */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {uploadLabel}
          </label>
          <label className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-64 cursor-pointer hover:bg-gray-50">
            <UploadCloud className="text-gray-400 w-8 h-8 mb-2" />
            <span className="text-gray-500">
              {imageFile ? imageFile.name : "이미지 업로드"}
            </span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        </div>

        {/* 입력 영역 */}
        <div className="space-y-4">
          {headerExtra && <div className="mb-4">{headerExtra}</div>}

          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              placeholder="제목을 입력하세요."
              value={titleValue}
              onChange={(e) => setTitleValue(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
            />
          </div>

          {/* children → 추가 필드 */}
          {children}

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              placeholder="자세한 설명을 입력하세요."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14] min-h-[100px]"
            />
          </div>

          {/* 업로드 버튼 */}
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-[#005C14] hover:bg-green-900 text-white font-bold py-3 rounded-lg cursor-pointer"
          >
            {buttonLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default BaseForm;
