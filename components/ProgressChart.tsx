"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const data = [
  { date: "2023-06-01", calories: 2000 },
  { date: "2023-06-02", calories: 1800 },
  { date: "2023-06-03", calories: 1900 },
  { date: "2023-06-04", calories: 1700 },
  { date: "2023-06-05", calories: 1800 },
  { date: "2023-06-06", calories: 2100 },
  { date: "2023-06-07", calories: 1950 },
];

export default function ProgressChart() {
  return (
    <ResponsiveContainer width="100%" height={400}>
      <LineChart
        data={data}
        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        <Line
          type="monotone"
          dataKey="calories"
          stroke="#8884d8"
          strokeWidth={3}
          dot={{ r: 5 }}
          activeDot={{ r: 8 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
