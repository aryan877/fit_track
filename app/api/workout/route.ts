import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { workouts, NewWorkout } from "@/lib/schema";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { and, eq, gte, lte } from "drizzle-orm";

dayjs.extend(utc);
dayjs.extend(timezone);

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return new Response(
        JSON.stringify({ success: false, message: "Unauthorized" }),
        { status: 401 }
      );
    }

    const { exercises } = await request.json();

    if (!exercises || !Array.isArray(exercises)) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid exercises data" }),
        { status: 400 }
      );
    }

    const now = dayjs().tz(dayjs.tz.guess());
    const workoutData = exercises.map((exercise) => ({
      userId,
      date: now.toDate(),
      ...exercise,
    }));

    const result = await db.insert(workouts).values(workoutData).returning();

    return new Response(JSON.stringify({ success: true, data: result }), {
      status: 201,
    });
  } catch (error) {
    console.error("Error saving workout entries:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error saving workout entries",
      }),
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      { status: 401 }
    );
  }

  try {
    const now = dayjs().tz(dayjs.tz.guess());
    const startOfDay = now.startOf("day").toDate();
    const endOfDay = now.endOf("day").toDate();

    const todaysWorkouts = await db
      .select()
      .from(workouts)
      .where(
        and(
          eq(workouts.userId, userId),
          gte(workouts.date, startOfDay),
          lte(workouts.date, endOfDay)
        )
      )
      .orderBy(workouts.date);

    return new Response(
      JSON.stringify({ success: true, data: todaysWorkouts }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching today's workouts:", error);
    return new Response(
      JSON.stringify({
        success: false,
        message: "Error fetching today's workouts",
      }),
      { status: 500 }
    );
  }
}
