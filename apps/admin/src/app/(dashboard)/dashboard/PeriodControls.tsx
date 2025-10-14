"use client";

type PeriodType = "yearly" | "monthly" | "weekly";

type PeriodParams = {
  periodType: PeriodType;
  year: number;
  month?: number;
  week?: number;
};

type Props = {
  value: PeriodParams;
  onChange: (next: PeriodParams) => void;
  className?: string;
};

const years = (() => {
  const now = new Date().getFullYear();
  return [now, now - 1, now - 2, now - 3];
})();

const months = Array.from({ length: 12 }, (_, i) => i + 1);
const weeks = [1, 2, 3, 4, 5];

const PeriodControls = ({ value, onChange, className = "" }: Props) => {
  const setType = (t: PeriodType) => {
    onChange({
      periodType: t,
      year: value.year,
      month:
        t !== "yearly" ? (value.month ?? new Date().getMonth() + 1) : undefined,
      week: t === "weekly" ? (value.week ?? 1) : undefined,
    });
  };

  const setYear = (y: number) => onChange({ ...value, year: y });
  const setMonth = (m: number) => onChange({ ...value, month: m });
  const setWeek = (w: number) => onChange({ ...value, week: w });

  const baseSelect =
    "px-3 py-2 border border-border rounded-lg text-sm cursor-pointer " +
    "bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-brand focus:border-brand";

  return (
    <div
      className={`flex flex-col md:flex-row md:items-center md:justify-between gap-4 ${className}`}
    >
      {/* 라디오 토글 */}
      <fieldset className="flex items-center gap-4">
        <legend className="sr-only">기간 선택</legend>

        <label className="inline-flex items-center gap-2 cursor-pointer text-foreground">
          <input
            type="radio"
            className="accent-brand"
            checked={value.periodType === "yearly"}
            onChange={() => setType("yearly")}
          />
          <span className="text-sm">연 통계(간편분석)</span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer text-foreground">
          <input
            type="radio"
            className="accent-brand"
            checked={value.periodType === "monthly"}
            onChange={() => setType("monthly")}
          />
          <span className="text-sm">월 통계(주간분석)</span>
        </label>

        <label className="inline-flex items-center gap-2 cursor-pointer text-foreground">
          <input
            type="radio"
            className="accent-brand"
            checked={value.periodType === "weekly"}
            onChange={() => setType("weekly")}
          />
          <span className="text-sm">주 통계(일간분석)</span>
        </label>
      </fieldset>

      {/* 선택 드롭다운 */}
      <div className="flex flex-wrap items-center gap-2">
        {/* 연도 */}
        <label className="text-sm text-muted-foreground">
          <select
            className={baseSelect}
            value={value.year}
            onChange={(e) => setYear(Number(e.target.value))}
          >
            {years.map((y) => (
              <option key={y} value={y}>
                {y}년
              </option>
            ))}
          </select>
        </label>

        {/* 월: yearly가 아닐 때만 */}
        {value.periodType !== "yearly" && (
          <label className="text-sm text-muted-foreground">
            <select
              className={baseSelect}
              value={value.month}
              onChange={(e) => setMonth(Number(e.target.value))}
            >
              {months.map((m) => (
                <option key={m} value={m}>
                  {m}월
                </option>
              ))}
            </select>
          </label>
        )}

        {/* 주: weekly일 때만 */}
        {value.periodType === "weekly" && (
          <label className="text-sm text-muted-foreground">
            <select
              className={baseSelect}
              value={value.week}
              onChange={(e) => setWeek(Number(e.target.value))}
            >
              {weeks.map((w) => (
                <option key={w} value={w}>
                  {w}주
                </option>
              ))}
            </select>
          </label>
        )}
      </div>
    </div>
  );
};

export default PeriodControls;
