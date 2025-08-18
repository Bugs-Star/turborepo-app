import { AlertCircle } from "lucide-react";

const StockAlert = () => {
  const items = [
    { name: "프리미엄 녹차 티백 (20개)", stock: 12 },
    { name: "스마트 체중계", stock: 5 },
    { name: "친환경 주방 세제 (리필)", stock: 40 },
  ];

  return (
    <div className="bg-green-50 p-4 rounded-md p-10 mt-5 mb-10">
      {/* 헤더 */}
      <div className="flex flex-col items-start gap-2 mb-3">
        <div className="flex">
          <AlertCircle className="text-red-500 mt-1" size={18} />
          <div className="font-semibold ml-2">재고 부족 알림</div>
        </div>
        <div className="text-sm text-gray-700">
          다음 제품들의 재고가 부족합니다. 빠른 시일 내에 재고를 보충해주세요.
        </div>
      </div>

      {/* 품목 리스트 */}
      <div className="space-y-1 text-sm mt-5">
        {items.map((item, idx) => (
          <div key={idx} className="flex justify-between mt-3">
            <span>{item.name}</span>
            <span className="text-red-500">현재 재고: {item.stock}개</span>
          </div>
        ))}
      </div>

      {/* 버튼 */}
      <button className="mt-5 px-3 py-1 border border-green-600 text-green-700 rounded hover:bg-green-100 text-sm ">
        모두 보기
      </button>
    </div>
  );
};

export default StockAlert;
