"use client";

import BaseForm from "@/components/BaseForm";
import { Calendar } from "lucide-react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAddPromo } from "@/hooks/promo/useAddPromo";
import { notify } from "@/lib/notify";
import { AxiosError } from "axios";

function getAxiosMessage(err: unknown) {
  const ax = err as AxiosError<{ message?: string }>;
  if (ax?.isAxiosError)
    return ax.response?.data?.message || ax.message || "요청 오류";
  if (err instanceof Error) return err.message;
  return "요청 오류";
}

const AddPromo = () => {
  const router = useRouter();
  const { mutate: addPromo, isPending } = useAddPromo();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError("");

    // 유효성 검사
    if (!title.trim()) {
      setError("광고 제목을 입력해주세요.");
      return;
    }
    if (!startDate || !endDate) {
      setError("광고 기간을 설정해주세요.");
      return;
    }
    if (new Date(startDate) > new Date(endDate)) {
      setError("종료일은 시작일 이후여야 합니다.");
      return;
    }
    if (!imageFile) {
      setError("광고 이미지를 업로드해주세요.");
      return;
    }

    // API 호출 (position 제거)
    addPromo(
      {
        title: title.trim(),
        description: description.trim(),
        promotionImg: imageFile,
        startDate,
        endDate,
      },
      {
        onSuccess: () => {
          notify.success("광고가 성공적으로 등록되었습니다.");
          router.push("/promo-management");
        },
        onError: (err: unknown) => {
          notify.error(getAxiosMessage(err));
        },
      }
    );
  };

  return (
    <BaseForm
      title="새 광고 항목 추가"
      uploadLabel="광고 이미지"
      onSubmit={handleSubmit}
      buttonLabel={isPending ? "등록 중..." : "광고 등록"}
      imageFile={imageFile}
      onImageChange={setImageFile}
      // headerExtra 제거됨 (포지션 UI 삭제)
    >
      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      {/* 광고 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          광고 제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="예: 여름 시즌 프로모션"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
          disabled={isPending}
        />
      </div>

      {/* 광고 기간 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          광고 기간
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
              disabled={isPending}
            />
          </div>
          <span className="text-gray-500">~</span>
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
              disabled={isPending}
            />
          </div>
        </div>
      </div>

      {/* 설명 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          설명
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="광고에 대한 자세한 설명을 입력하세요."
          rows={4}
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
          disabled={isPending}
        />
      </div>
    </BaseForm>
  );
};

export default AddPromo;
