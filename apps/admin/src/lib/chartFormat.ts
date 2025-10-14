// apps/admin/src/lib/chart/format.ts
export const NUM = new Intl.NumberFormat("ko-KR");

/** Recharts LabelList용: 0이면 숨김 */
export const fmtIntLabel = (label: unknown) => {
  const n = typeof label === "number" ? label : Number(label ?? 0);
  return n > 0 ? NUM.format(n) : "";
};

export type YMaxRow = {
  totalVisitors: number;
  uniqueVisitors: number;
  activeVisitors: number;
  bounce: number;
};

/** y축 상단 여유치 포함한 max 계산 (padRatio 기본 0.1) */
export function computeYMax<T extends YMaxRow>(rows: T[], padRatio = 0.1) {
  const max = Math.max(
    0,
    ...rows.map((d) =>
      Math.max(d.totalVisitors, d.uniqueVisitors, d.activeVisitors, d.bounce)
    )
  );
  const pad = Math.max(1, Math.ceil(max * padRatio));
  return max + pad;
}
