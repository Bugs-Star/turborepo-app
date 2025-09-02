"use client";

import BaseForm from "@/components/BaseForm";
import { X } from "lucide-react";
import { useState, useMemo } from "react";
import { useEditPromo } from "@/hooks/promo/useEditPromo";
import { notify } from "@/lib/notify";

export interface EditPromoInitialData {
  title?: string;
  description?: string;
  // 서버에서 내려오는 기존 이미지는 URL(string)
  // 새로 업로드할 이미지는 File
  promotionImgUrl?: string;
  startDate?: string; // ISO
  endDate?: string; // ISO
}

interface EditPromoProps {
  promotionId: string;
  initialData?: EditPromoInitialData;
  onClose: () => void;
}

function toLocalInputValue(iso?: string) {
  if (!iso) return "";
  // datetime-local용 YYYY-MM-DDTHH:mm
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  const yyyy = d.getFullYear();
  const mm = pad(d.getMonth() + 1);
  const dd = pad(d.getDate());
  const hh = pad(d.getHours());
  const mi = pad(d.getMinutes());
  return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
}

const EditPromo = ({ promotionId, initialData, onClose }: EditPromoProps) => {
  const { mutate, isPending } = useEditPromo(promotionId);

  // 파일 입력(새 이미지) + 미리보기
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(
    initialData?.description ?? ""
  );
  const [start, setStart] = useState(toLocalInputValue(initialData?.startDate));
  const [end, setEnd] = useState(toLocalInputValue(initialData?.endDate));

  const previewUrl = useMemo(() => {
    if (imageFile) return URL.createObjectURL(imageFile);
    return initialData?.promotionImgUrl ?? "";
  }, [imageFile, initialData?.promotionImgUrl]);

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();

    const fd = new FormData();

    // 텍스트 필드: 비어있으면 전송 생략(선택적)
    if (title.trim()) fd.append("title", title.trim());
    if (description.trim()) fd.append("description", description.trim());

    // 날짜: datetime-local -> ISO로 변환
    const toIso = (v: string) => (v ? new Date(v).toISOString() : "");
    if (start) fd.append("startDate", toIso(start));
    if (end) fd.append("endDate", toIso(end));

    // 이미지: 새 파일을 선택한 경우에만 전송
    if (imageFile) {
      fd.append("promotionImg", imageFile);
    }

    mutate(fd, {
      onSuccess: () => {
        notify.success("광고가 성공적으로 수정되었습니다.");
        onClose();
      },
    });
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center"
      onClick={onClose}
    >
      <div
        className="relative bg-white rounded-2xl shadow-lg w-full max-w-2xl p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 닫기 버튼 */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-gray-800 cursor-pointer"
        >
          <X size={24} />
        </button>

        <BaseForm
          title="프로모션 수정"
          uploadLabel="프로모션 이미지"
          buttonLabel={isPending ? "수정 중..." : "수정 저장"}
          imageFile={imageFile}
          onImageChange={setImageFile}
          imagePreviewUrl={previewUrl}
          onSubmit={handleSubmit}
        >
          {/* 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              제목
            </label>
            <input
              type="text"
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="예) 버그스 스타 가을 프로모션"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
            />
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              name="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="프로모션 상세 설명을 입력하세요"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14] min-h-[100px]"
            />
          </div>

          {/* 기간 */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                시작 일시
              </label>
              <input
                type="datetime-local"
                name="startDate"
                value={start}
                onChange={(e) => setStart(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                종료 일시
              </label>
              <input
                type="datetime-local"
                name="endDate"
                value={end}
                onChange={(e) => setEnd(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2"
              />
            </div>
          </div>

          {/* 안내 */}
          <p className="text-xs text-gray-500">
            * 이미지는 새 파일을 선택한 경우에만 변경됩니다.
          </p>
        </BaseForm>
      </div>
    </div>
  );
};

export default EditPromo;
