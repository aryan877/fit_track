import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Activity, SaladIcon, BarChart2 } from "lucide-react";
import dynamic from "next/dynamic";

import Link from "next/link";
const ProgressChartComponent = dynamic(
  () => import("@/components/ProgressChart"),
  {
    ssr: false,
  }
);

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8">Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Card className="bg-primary text-primary-foreground">
          <Link href="/log-workout">
            <CardHeader>
              <CardTitle>Log Workout</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <Activity className="h-6 w-6 mr-2" />
                <span>Track your workouts</span>
              </div>
            </CardContent>
          </Link>
        </Card>
        <Card className="bg-primary text-primary-foreground">
          <Link href="/log-diet">
            <CardHeader>
              <CardTitle>Log Diet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center">
                <SaladIcon className="h-6 w-6 mr-2" />
                <span>Track your nutrition intake</span>
              </div>
            </CardContent>
          </Link>
        </Card>
      </div>
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-4 flex items-center">
          <BarChart2 className="h-6 w-6 mr-2" />
          <span>Progress Chart</span>
        </h2>
        <ProgressChartComponent />
      </div>
    </div>
  );
}
