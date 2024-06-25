"use client";

import React, { useState, useEffect, useCallback } from "react";
import dayjs from "dayjs";
import axios from "axios";
import { Line, Bar } from "react-chartjs-2";
import { Loader2, Calendar, ChevronLeft, ChevronRight } from "lucide-react";
import { NutritionEntry, Workout } from "@/lib/schema";
import { Button } from "@/components/ui/button";
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
  const [currentDate, setCurrentDate] = useState(dayjs());
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
          startDate: currentDate.startOf("month").format("YYYY-MM-DD"),
          endDate: currentDate.endOf("month").format("YYYY-MM-DD"),
        },
      });
      setNutritionEntries(response.data.nutrition);
      setWorkoutEntries(response.data.workouts);
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setIsLoading(false);
    }
  }, [currentDate]);

  useEffect(() => {
    fetchData();
  }, [currentDate, fetchData]);

  const handlePreviousMonth = () => {
    setCurrentDate(currentDate.subtract(1, "month"));
  };

  const handleNextMonth = () => {
    setCurrentDate(currentDate.add(1, "month"));
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

  const baseChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top" as const,
        labels: {
          font: {
            size: 14,
            weight: "bold" as const,
          },
        },
      },
      title: {
        display: true,
        text: `${currentDate.format("MMMM YYYY")}`,
        font: {
          size: 20,
          weight: "bold" as const,
        },
        padding: {
          top: 10,
          bottom: 30,
        },
      },
      tooltip: {
        titleFont: {
          size: 16,
        },
        bodyFont: {
          size: 14,
        },
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: "Date",
          font: {
            size: 16,
            weight: "bold" as const,
          },
        },
        ticks: {
          font: {
            size: 12,
          },
        },
      },
      y: {
        title: {
          display: true,
          text: "Calories",
          font: {
            size: 16,
            weight: "bold" as const,
          },
        },
        ticks: {
          font: {
            size: 12,
          },
        },
        beginAtZero: true,
      },
    },
  };

  const calorieChartOptions = {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      tooltip: {
        ...baseChartOptions.plugins.tooltip,
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
  };

  const workoutChartOptions = {
    ...baseChartOptions,
    plugins: {
      ...baseChartOptions.plugins,
      tooltip: {
        ...baseChartOptions.plugins.tooltip,
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
      ...baseChartOptions.scales,
      y: {
        ...baseChartOptions.scales.y,
        title: {
          ...baseChartOptions.scales.y.title,
          text: "Sets",
        },
      },
    },
  };
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
        <Button
          variant="outline"
          size="icon"
          onClick={handlePreviousMonth}
          className="text-gray-600 hover:text-gray-800"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <div className="text-2xl font-semibold text-gray-800 flex items-center">
          <Calendar className="w-6 h-6 mr-2" />
          {currentDate.format("MMMM YYYY")}
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={handleNextMonth}
          className="text-gray-600 hover:text-gray-800"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      {labels.length > 0 ? (
        <>
          <div className="bg-white rounded-lg p-6 mb-10">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Calories and Macronutrients Over Time
            </h2>
            <div className="h-[500px]">
              <Line data={calorieData} options={calorieChartOptions} />
            </div>
          </div>
          <div className="bg-white rounded-lg p-6 mb-10">
            <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">
              Workout Volume by Body Part
            </h2>
            <div className="h-[500px]">
              <Bar data={workoutData} options={workoutChartOptions} />
            </div>
          </div>
        </>
      ) : (
        <div className="h-[500px] flex items-center justify-center">
          <p className="text-center text-gray-500 text-xl">
            No data available for the selected period.
          </p>
        </div>
      )}
    </div>
  );
};

export default TrackRecord;
