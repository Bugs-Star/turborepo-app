"use client";
import { useState } from "react";
import { Calendar } from "lucide-react";
import BaseForm from "@/components/BaseForm";
import type { AddEventPayload } from "@/lib/events";
import { useAddEvent } from "@/hooks/useAddEvent";

const AddEvent = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState(""); // YYYY-MM-DD
  const [endDate, setEndDate] = useState(""); // YYYY-MM-DD
  const [imageFile, setImageFile] = useState<File | null>(null);

  // 서버 전송에 필요한 기본값 (UI 노출 없이 내부에서 관리)
  const [isActive] = useState(true);
  const [eventOrder] = useState(0);

  const { addEvent, isLoading, error } = useAddEvent();

  const toISOStartOfDay = (yyyyMmDd: string) =>
    yyyyMmDd ? `${yyyyMmDd}T00:00:00.000Z` : "";

  const handleSubmit = async () => {
    // 기본 유효성 검사
    if (!title.trim()) return alert("이벤트 제목을 입력하세요.");
    if (!startDate || !endDate) return alert("이벤트 기간을 선택하세요.");
    if (new Date(endDate) < new Date(startDate))
      return alert("종료일은 시작일 이후여야 합니다.");
    if (!imageFile) return alert("이벤트 배너 이미지를 업로드하세요.");

    const payload: AddEventPayload = {
      title: title.trim(),
      description: description.trim(),
      eventImg: imageFile,
      startDate: toISOStartOfDay(startDate),
      endDate: toISOStartOfDay(endDate),
      isActive,
      eventOrder,
    };

    try {
      await addEvent(payload);
      alert("이벤트가 등록되었습니다!");
      // 폼 초기화
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setImageFile(null);
    } catch {
      // useAddEvents에서 error 세팅됨
      if (error) alert(error);
      else alert("이벤트 등록 중 오류가 발생했습니다.");
    }
  };

  return (
    <BaseForm
      title="새 이벤트 업로드"
      uploadLabel="이벤트 배너 이미지"
      imageFile={imageFile}
      onImageChange={setImageFile}
      onSubmit={handleSubmit}
      buttonLabel={isLoading ? "등록 중..." : "이벤트 등록"}
    >
      {/* 이벤트 제목 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이벤트 제목
        </label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="이벤트 제목을 입력하세요"
          className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
        />
      </div>

      {/* 이벤트 기간 */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          이벤트 기간
        </label>
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <Calendar className="absolute left-3 top-2.5 text-gray-400 w-5 h-5" />
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
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
            />
          </div>
        </div>

        {/* 이벤트 설명 */}
        <div className="mt-5">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            이벤트 설명
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="이벤트 설명을 입력하세요"
            rows={4}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
          />
        </div>
      </div>

      {/* 에러 메시지 */}
      {error && <p className="text-sm text-red-600 mt-3">에러: {error}</p>}
    </BaseForm>
  );
};

export default AddEvent;
