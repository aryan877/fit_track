import type { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { workouts, NewWorkout } from "@/lib/schema";
import axios from "axios";

export async function POST(request: NextRequest) {
  try {
    const data: NewWorkout = await request.json();

    // Convert the date string to a Date object
    const workoutData = {
      ...data,
      date: new Date(data.date),
    };

    const result = await db.insert(workouts).values(workoutData).returning();

    return new Response(JSON.stringify({ success: true, data: result[0] }), {
      status: 201,
      headers: { "Content-Type": "application/json" },
    });
  } catch (error) {
    console.error("Error saving workout:", error);

    if (axios.isAxiosError(error)) {
      console.error("Axios error:", error.message);
      console.error("Axios error details:", error.toJSON());
    } else {
      console.error(error);
    }

    return new Response(
      JSON.stringify({ success: false, message: "Error saving workout" }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}
