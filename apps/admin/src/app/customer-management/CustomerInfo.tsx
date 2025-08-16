import { Users, UserPlus, ArrowUpRight, ArrowDownLeft } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: React.ReactNode; // 아이콘 props로 받기
}

const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  change,
  icon,
}) => {
  const isNegative = change !== undefined && change < 0;

  return (
    <div className="flex flex-col bg-white rounded-2xl shadow p-10 w-full mb-10">
      {/* 제목 + 오른쪽 아이콘 */}
      <div className="flex justify-between items-center mb-4 text-gray-700">
        <span className="text-sm">{title}</span>
        {icon}
      </div>

      {/* 값 + 변화율 */}
      <div className="flex flex-col gap-2">
        <span className="text-2xl font-bold">{value}명</span>
        {change !== undefined && (
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`flex items-center gap-1 text-sm font-medium px-2 py-0.5 rounded-2xl 
              ${isNegative ? "bg-red-500 text-white w-16" : "bg-green-700 text-white w-17"}`}
            >
              {isNegative ? (
                <>
                  <ArrowDownLeft size={14} /> {change}%
                </>
              ) : (
                <>
                  <ArrowUpRight size={14} /> +{change}%
                </>
              )}
            </span>
            <span className="text-xs text-gray-500">전달 대비</span>
          </div>
        )}
      </div>
    </div>
  );
};

const CustomerInfo = () => {
  return (
    <div className="flex gap-4">
      <StatsCard
        title="총 회원 수"
        value={1200}
        change={-5}
        icon={<Users className="text-gray-400" size={20} />}
      />
      <StatsCard
        title="신규 회원 수"
        value={45}
        change={12}
        icon={<UserPlus className="text-gray-400" size={20} />}
      />
    </div>
  );
};

export default CustomerInfo;
