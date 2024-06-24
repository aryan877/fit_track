"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const data = [
  { date: "2023-06-01", calories: 2000, protein: 150, carbs: 250, fat: 70 },
  { date: "2023-06-02", calories: 1800, protein: 130, carbs: 200, fat: 60 },
  { date: "2023-06-03", calories: 1900, protein: 140, carbs: 220, fat: 65 },
  { date: "2023-06-04", calories: 1700, protein: 120, carbs: 180, fat: 55 },
  { date: "2023-06-05", calories: 1800, protein: 130, carbs: 200, fat: 60 },
  { date: "2023-06-06", calories: 2100, protein: 160, carbs: 270, fat: 75 },
  { date: "2023-06-07", calories: 1950, protein: 145, carbs: 240, fat: 70 },
];

export default function ProgressChart() {
  return (
    <div style={{ width: "100%", height: 400 }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="calories"
            stroke="#8884d8"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="protein"
            stroke="#82ca9d"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="carbs"
            stroke="#ffc658"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
          <Line
            type="monotone"
            dataKey="fat"
            stroke="#ff7300"
            strokeWidth={3}
            dot={{ r: 5 }}
            activeDot={{ r: 8 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
