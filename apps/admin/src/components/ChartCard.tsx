"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface ChartCardProps {
  title: string;
  subtitle: string;
  data: { name: string; value: number }[];
  label: string;
  fillColor?: string;
}

const ChartCard = ({
  title,
  subtitle,
  data,
  fillColor,
  label,
}: ChartCardProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm p-4 flex-1">
      <h2 className="text-lg font-semibold">{title}</h2>
      <p className="text-sm text-gray-500 mb-4">{subtitle}</p>
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={data}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar
            dataKey="value"
            fill={fillColor}
            name={label}
            barSize="30"
            radius={[5, 5, 5, 5]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ChartCard;
