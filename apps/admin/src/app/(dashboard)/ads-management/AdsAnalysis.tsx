import ChartCard from "@/components/ChartCard";
import FilterPanel from "@/app/ads-management/FilterPanel";

const viewTimeData = [
  { name: "1주", value: 45 },
  { name: "2주", value: 48 },
  { name: "3주", value: 44 },
  { name: "4주", value: 47 },
  { name: "5주", value: 42 },
  { name: "6주", value: 41 },
];

const clickData = [
  { name: "1주", value: 520 },
  { name: "2주", value: 480 },
  { name: "3주", value: 510 },
  { name: "4주", value: 490 },
  { name: "5주", value: 450 },
  { name: "6주", value: 420 },
];

const AdsAnalysis = () => {
  return (
    <div className="flex gap-4 max-w-6xl mx-auto mt-10 mb-5">
      <FilterPanel />
      <ChartCard
        title="광고 시청 시간 추세"
        subtitle="사용자의 광고 시청시간 추세"
        data={viewTimeData}
        label="광고 시청 시간"
        fillColor="#8FD27F"
      />
      <ChartCard
        title="광고 클릭 추세"
        subtitle="사용자의 광고 클릭 건수"
        data={clickData}
        label="광고 클릭 건수"
        fillColor="#3F842E"
      />
    </div>
  );
};

export default AdsAnalysis;
