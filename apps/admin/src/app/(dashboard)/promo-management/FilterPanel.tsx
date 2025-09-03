"use client";

const FilterPanel = () => {
  return (
    <div className="w-64 space-y-4">
      {/* 조회 기간 + 조회하기 박스 */}
      <div className="bg-white rounded-2xl shadow-sm p-4">
        <label className="block text-sm font-medium mb-3">조회 기간(월)</label>
        <div className="flex gap-2 mb-4">
          <select className="border rounded-md px-2 py-1 cursor-pointer">
            <option>2025년</option>
          </select>
          <select className="border rounded-md px-2 py-1 cursor-pointer">
            <option>1월</option>
          </select>
        </div>
        <button className="w-full bg-[#005C14] text-white py-2 rounded-lg cursor-pointer">
          조회하기
        </button>
      </div>

      {/* 등록한 광고 박스 */}
      <div className="bg-white rounded-2xl shadow-sm p-4 mt-5">
        <h3 className="text-sm font-medium mb-2">등록한 광고</h3>
        <ul className="space-y-2 text-sm">
          <li className="truncate">썸머 프로모션</li>
          <li className="truncate">새로 출시! 음료</li>
          <li className="truncate">새로운 시즌 광고</li>
        </ul>
      </div>
    </div>
  );
};

export default FilterPanel;
