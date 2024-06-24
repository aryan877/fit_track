import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { workouts, nutritionEntries } from "@/lib/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { auth } from "@clerk/nextjs/server";
import {
  startOfMonth,
  endOfMonth,
  startOfYear,
  endOfYear,
  parseISO,
} from "date-fns";

export async function GET(request: NextRequest) {
  const { userId } = auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const searchParams = request.nextUrl.searchParams;
  const timeframe = searchParams.get("timeframe");
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");

  let startDateTime, endDateTime;

  if (startDate && endDate) {
    startDateTime = parseISO(startDate);
    endDateTime = parseISO(endDate);
  } else {
    const now = new Date();
    switch (timeframe) {
      case "month":
        startDateTime = startOfMonth(now);
        endDateTime = endOfMonth(now);
        break;
      case "year":
        startDateTime = startOfYear(now);
        endDateTime = endOfYear(now);
        break;
      default:
        startDateTime = startOfMonth(now);
        endDateTime = endOfMonth(now);
    }
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

  return NextResponse.json({ nutrition: nutritionData, workouts: workoutData });
}
