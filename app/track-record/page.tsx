"use client";

import React, { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import { Loader2, Calendar } from "lucide-react";
import { NutritionEntry, Workout } from "@/lib/schema";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import Back from "@/components/Back";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { exerciseList } from "@/data/exerciseList";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const colorMap: Record<string, string> = {
  chest: "rgba(255, 99, 132, 0.6)",
  back: "rgba(54, 162, 235, 0.6)",
  legs: "rgba(255, 206, 86, 0.6)",
  shoulders: "rgba(75, 192, 192, 0.6)",
  arms: "rgba(153, 102, 255, 0.6)",
  core: "rgba(255, 159, 64, 0.6)",
};

const TrackRecord: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState(dayjs().format("MMMM"));
  const [selectedYear, setSelectedYear] = useState(dayjs().format("YYYY"));
  const [startDate, setStartDate] = useState(dayjs().startOf("month").toDate());
  const [endDate, setEndDate] = useState(dayjs().endOf("month").toDate());
  const [nutritionEntries, setNutritionEntries] = useState<NutritionEntry[]>(
    []
  );
  const [workoutEntries, setWorkoutEntries] = useState<Workout[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await axios.get("/api/fitness", {
        params: {
          startDate: dayjs(startDate).format("YYYY-MM-DD"),
          endDate: dayjs(endDate).format("YYYY-MM-DD"),
        },
      });
      setNutritionEntries(response.data.nutrition);
      setWorkoutEntries(response.data.workouts);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [startDate, endDate]);

  useEffect(() => {
    fetchData();
  }, [startDate, endDate, fetchData]);

  const handleMonthChange = (month: string) => {
    const newDate = dayjs(`${selectedYear}-${month}-01`);
    setSelectedMonth(month);
    setStartDate(newDate.startOf("month").toDate());
    setEndDate(newDate.endOf("month").toDate());
  };

  const handleYearChange = (year: string) => {
    const newDate = dayjs(`${year}-${selectedMonth}-01`);
    setSelectedYear(year);
    setStartDate(newDate.startOf("month").toDate());
    setEndDate(newDate.endOf("month").toDate());
  };

  const processNutritionData = (entries: NutritionEntry[]) => {
    return entries.reduce(
      (
        acc: {
          [key: string]: {
            totalCalories: number;
            protein: number;
            carbs: number;
            fat: number;
          };
        },
        entry
      ) => {
        const date = dayjs(entry.date).format("YYYY-MM-DD");
        if (!acc[date]) {
          acc[date] = { totalCalories: 0, protein: 0, carbs: 0, fat: 0 };
        }
        acc[date].totalCalories += Number(entry.calories || 0);
        acc[date].protein += Number(entry.protein || 0);
        acc[date].carbs += Number(entry.carbs || 0);
        acc[date].fat += Number(entry.fat || 0);
        return acc;
      },
      {}
    );
  };

  const processWorkoutData = (entries: Workout[]) => {
    const bodyPartSets: {
      [key: string]: { totalSets: number; exercises: Set<string> };
    } = {};
    for (const entry of entries) {
      for (const bodyPart in exerciseList) {
        if (
          exerciseList[bodyPart as keyof typeof exerciseList].includes(
            entry.exercise
          )
        ) {
          if (!bodyPartSets[bodyPart]) {
            bodyPartSets[bodyPart] = {
              totalSets: 0,
              exercises: new Set<string>(),
            };
          }
          bodyPartSets[bodyPart].totalSets += entry.sets;
          bodyPartSets[bodyPart].exercises.add(entry.exercise);
        }
      }
    }
    return bodyPartSets;
  };

  const processedNutritionData = processNutritionData(nutritionEntries);
  const processedWorkoutData = processWorkoutData(workoutEntries);
  const labels = Object.keys(processedNutritionData);

  const calorieData = {
    labels,
    datasets: [
      {
        label: "Calories",
        data: labels.map((date) => processedNutritionData[date].totalCalories),
        borderColor: "#FF6363",
        backgroundColor: "rgba(255, 99, 99, 0.2)",
        fill: true,
        pointHoverBackgroundColor: "#FF6363",
        pointHoverBorderColor: "#FF6363",
      },
    ],
  };

  const workoutLabels = Object.keys(processedWorkoutData);
  const workoutData = {
    labels: workoutLabels,
    datasets: [
      {
        label: "Total Sets",
        data: workoutLabels.map(
          (bodyPart) => processedWorkoutData[bodyPart].totalSets
        ),
        backgroundColor: workoutLabels.map((bodyPart) => colorMap[bodyPart]),
      },
    ],
  };

  const workoutOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Workout Volume by Body Part - ${dayjs(startDate).format(
          "MMMM YYYY"
        )}`,
      },
      tooltip: {
        callbacks: {
          label: (context: any) => {
            const bodyPart = context.label;
            const data = processedWorkoutData[bodyPart];
            return [
              `Total Sets: ${data.totalSets}`,
              `Exercises: ${Array.from(data.exercises).join(", ")}`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Body Part",
        },
      },
      y: {
        title: {
          display: true,
          text: "Sets",
        },
        beginAtZero: true,
      },
    },
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        position: "top" as const,
      },
      title: {
        display: true,
        text: `Calories and Macronutrients Over Time - ${dayjs(
          startDate
        ).format("MMMM YYYY")}`,
      },
      tooltip: {
        callbacks: {
          title: (context: any) =>
            dayjs(context[0].label).format("dddd, MMMM D"),
          label: (context: any) => {
            const date = context.label;
            const data = processedNutritionData[date];
            return [
              `Calories: ${data.totalCalories} kcal`,
              `Protein: ${data.protein} g`,
              `Carbs: ${data.carbs} g`,
              `Fat: ${data.fat} g`,
            ];
          },
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
        },
      },
      y: {
        title: {
          display: true,
          text: "Calories",
        },
        beginAtZero: true,
      },
    },
  };

  const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  const years = Array.from(
    { length: 10 },
    (_, i) => dayjs().year() - 5 + i
  ).map(String);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 bg-white">
      <Back />
      <h1 className="text-4xl font-bold mb-10 text-center text-gray-800">
        Nutrition & Workout Track Record
      </h1>

      <div className="flex justify-center items-center mb-10 space-x-4">
        <Select onValueChange={handleMonthChange} value={selectedMonth}>
          <SelectTrigger className="w-32">
            <SelectValue placeholder="Select month" />
          </SelectTrigger>
          <SelectContent>
            {months.map((month) => (
              <SelectItem key={month} value={month}>
                {month}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select onValueChange={handleYearChange} value={selectedYear}>
          <SelectTrigger className="w-20">
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {years.map((year) => (
              <SelectItem key={year} value={year}>
                {year}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {labels.length > 0 ? (
        <>
          <div className="h-[500px] mb-20">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {dayjs(startDate).format("MMMM YYYY")} Calories and Macronutrients
              Over Time
            </h2>
            <Line data={calorieData} options={options} />
          </div>
          <div className="h-[500px] mb-20">
            <h2 className="text-2xl font-bold mb-6 text-center">
              {dayjs(startDate).format("MMMM YYYY")} Workout Volume by Body Part
            </h2>
            <Bar data={workoutData} options={workoutOptions} />
          </div>
        </>
      ) : (
        <div className="h-[500px] mb-10">
          <p className="text-center text-gray-500">
            No data available for the selected period.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrackRecord;
