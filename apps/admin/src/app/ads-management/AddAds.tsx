"use client";

import BaseForm from "@/components/BaseForm";
import { ArrowDown, ArrowUp, Calendar } from "lucide-react";
import { useState } from "react";

type CategoryType = "topPosition" | "bottomPosition";

const categoryOptions: {
  key: CategoryType;
  icon: React.ElementType;
  label: string;
}[] = [
  { key: "topPosition", icon: ArrowUp, label: "상단 위치" },
  { key: "bottomPosition", icon: ArrowDown, label: "하단 위치" },
];

const AddAds = () => {
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [category, setCategory] = useState<CategoryType>("topPosition");

  return (
    <BaseForm
      title="새 광고 항목 추가"
      uploadLabel="광고 이미지"
      onSubmit={() => console.log("광고 업로드")}
      buttonLabel="광고 등록"
      headerExtra={
        <div className="flex gap-3 mb-6">
          {categoryOptions.map(({ key, icon: Icon, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setCategory(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border cursor-pointer ${
                category === key
                  ? "bg-[#005C14] text-white"
                  : "bg-white border-gray-300"
              }`}
            >
              <span>{label}</span>
              <Icon />
            </button>
          ))}
        </div>
      }
    >
      {/* children → 이벤트 기간 */}
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
    </BaseForm>
  );
};

export default AddAds;
