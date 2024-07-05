import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workouts, nutritionEntries } from "@/lib/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import dayjs from "dayjs";

export async function GET(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let startDateTime, endDateTime;

  if (startDate && endDate) {
    startDateTime = dayjs(startDate).startOf("month").toDate();
    endDateTime = dayjs(endDate).endOf("month").toDate();
  } else {
    const now = dayjs();
    startDateTime = now.startOf("month").toDate();
    endDateTime = now.endOf("month").toDate();
  }

  const nutritionData = await db
    .select()
    .from(nutritionEntries)
    .where(
      and(
        eq(nutritionEntries.userId, userId),
        gte(nutritionEntries.date, startDateTime),
        lte(nutritionEntries.date, endDateTime)
      )
    );

  const workoutData = await db
    .select()
    .from(workouts)
    .where(
      and(
        eq(workouts.userId, userId),
        gte(workouts.date, startDateTime),
        lte(workouts.date, endDateTime)
      )
    );

  console.log(nutritionData, workoutData);

  return NextResponse.json({ nutrition: nutritionData, workouts: workoutData });
}
