"use client";
import { useState } from "react";
import { Calendar } from "lucide-react";
import BaseForm from "@/components/BaseForm";

const AddEvent = () => {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleSubmit = () => {
    console.log({
      title,
      description,
      startDate,
      endDate,
      imageFile,
    });
    alert("이벤트가 등록되었습니다!");
  };

  return (
    <BaseForm
      title="새 이벤트 업로드"
      uploadLabel="이벤트 배너 이미지"
      imageFile={imageFile}
      onImageChange={setImageFile}
      onSubmit={handleSubmit}
      buttonLabel="이벤트 등록"
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

      {/* children → 이벤트 기간 */}
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
    </BaseForm>
  );
};

export default AddEvent;
