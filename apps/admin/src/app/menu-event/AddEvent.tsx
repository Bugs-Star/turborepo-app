"use client";
import { useState } from "react";
import { Calendar, UploadCloud } from "lucide-react";

const AddEvent = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  return (
    <div className="max-w-5xl mx-auto mt-5 bg-white p-8 rounded-lg">
      <h1 className="text-xl font-bold mb-6">새 이벤트 업로드</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* 이벤트 배너 이미지 업로드 */}
        <div className="flex flex-col">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            이벤트 배너 이미지
          </label>
          <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-lg h-64 cursor-pointer hover:bg-gray-50">
            <UploadCloud className="text-gray-400 w-8 h-8 mb-2" />
            <span className="text-gray-500">이미지 업로드</span>
          </div>
        </div>

        {/* 이벤트 입력 필드 */}
        <div className="space-y-4">
          {/* 이벤트 제목 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              이벤트 제목
            </label>
            <input
              type="text"
              placeholder="예: 벚꽃 시즌 한정 음료 출시!"
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14]"
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
                  className="w-full border border-gray-300 rounded-lg pl-10 pr-3 py-2 focus:outline-none focus:ring focus:border-[#005C14] "
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
          </div>

          {/* 설명 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              설명
            </label>
            <textarea
              placeholder="이벤트에 대한 자세한 설명을 입력하세요."
              className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring focus:border-[#005C14] min-h-[100px]"
            />
          </div>

          {/* 업로드 버튼 */}
          <button
            type="button"
            className="w-full bg-[#005C14] hover:bg-green-900 text-white font-bold py-3 rounded-lg cursor-pointer"
          >
            이벤트 업로드
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddEvent;
