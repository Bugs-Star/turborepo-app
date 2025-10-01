"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LabelList,
} from "recharts";
import { NUM, fmtIntLabel } from "@/lib/chartFormat";
import type { ChartDatum } from "@/hooks/dashboard/useUserActivityChart";

const SERIES = [
  {
    key: "totalVisitors",
    fill: "#1E7D32",
    label: "총 방문자 수",
    cls: "fill-[#1E7D32]",
  },
  {
    key: "uniqueVisitors",
    fill: "#1F4E79",
    label: "순 방문자 수",
    cls: "fill-[#1F4E79]",
  },
  {
    key: "activeVisitors",
    fill: "#C28E00",
    label: "활성 방문자 수",
    cls: "fill-[#C28E00]",
  },
  { key: "bounce", fill: "#C0392B", label: "이탈자 수", cls: "fill-[#C0392B]" },
] as const;

export function legendLabel(key: string) {
  const m = SERIES.find((s) => s.key === key);
  return m?.label ?? key;
}

/** Tooltip payload에서 tooltipLabel 안전 추출 */
function getTooltipLabelFromPayload(payload: unknown): string | undefined {
  if (!Array.isArray(payload) || payload.length === 0) return undefined;
  const first = payload[0] as unknown;
  if (
    typeof first === "object" &&
    first !== null &&
    "payload" in (first as Record<string, unknown>)
  ) {
    const inner = (first as { payload?: unknown }).payload;
    if (
      typeof inner === "object" &&
      inner !== null &&
      "tooltipLabel" in (inner as Record<string, unknown>)
    ) {
      const tl = (inner as { tooltipLabel?: unknown }).tooltipLabel;
      return typeof tl === "string" ? tl : undefined;
    }
  }
  return undefined;
}

export default function UserActivityBars({
  data,
  xKey,
  yMax,
  isSingleCategory,
  weeklyDayMode, // 주 선택(일자 뷰) 여부
  month,
  height = 300,
}: {
  data: ChartDatum[];
  xKey: "name" | "rangeLabel";
  yMax: number;
  isSingleCategory: boolean;
  weeklyDayMode: boolean;
  month?: number;
  height?: number;
}) {
  return (
    <div
      className={`${isSingleCategory ? "max-w-[560px] mx-auto" : ""}`}
      style={{ width: "100%", height }}
    >
      <ResponsiveContainer>
        <BarChart
          data={data}
          margin={{ top: 8, right: 8, bottom: 0, left: 0 }}
          barCategoryGap={isSingleCategory ? 64 : 28}
        >
          <CartesianGrid strokeDasharray="3 3" opacity={0.35} />
          <XAxis dataKey={xKey} tickLine={false} axisLine={false} />
          <YAxis
            domain={[0, yMax]}
            allowDecimals={false}
            tickFormatter={(v) => NUM.format(v as number)}
            tickLine={false}
            axisLine={false}
            width={40}
          />
          <Tooltip
            labelFormatter={(label, payload) => {
              if (weeklyDayMode) {
                const tl = getTooltipLabelFromPayload(payload);
                if (tl) return tl;
                const n =
                  typeof label === "string" ? parseInt(label, 10) : undefined;
                return month && n ? `${month}/${n}` : String(label ?? "");
              }
              return typeof label === "string" ? label : "";
            }}
            formatter={(val: number, key: string) => [
              NUM.format(val),
              legendLabel(key),
            ]}
            labelClassName="text-sm"
            contentStyle={{ borderRadius: 12 }}
          />

          {SERIES.map((s) => (
            <Bar
              key={s.key}
              dataKey={s.key}
              radius={[6, 6, 0, 0]}
              fill={s.fill}
            >
              <LabelList
                dataKey={s.key}
                position="top"
                formatter={fmtIntLabel}
                className={s.cls}
              />
            </Bar>
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
