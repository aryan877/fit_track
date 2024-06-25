import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { goals, NewGoal } from "@/lib/schema";
import axios from "axios";
import dayjs from "dayjs";
import { and, eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      { status: 401 }
    );
  }

  const { action, currentWeight, desiredWeight, startDate, endDate } =
    await request.json();

  if (action === "calculate") {
    if (!currentWeight || !desiredWeight) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid data" }),
        { status: 400 }
      );
    }

    try {
      const dailyCalories = await calculateDailyCalories(
        currentWeight,
        desiredWeight
      );
      const dailyExerciseMinutes = await calculateDailyExerciseMinutes(
        currentWeight,
        desiredWeight
      );

      return new Response(
        JSON.stringify({
          success: true,
          data: { dailyCalories, dailyExerciseMinutes },
        }),
        { status: 200 }
      );
    } catch (error) {
      console.error("Error calculating goals:", error);
      return new Response(
        JSON.stringify({
          success: false,
          message: "Failed to calculate goals",
        }),
        { status: 500 }
      );
    }
  } else {
    if (!currentWeight || !desiredWeight || !startDate || !endDate) {
      return new Response(
        JSON.stringify({ success: false, message: "Invalid data" }),
        { status: 400 }
      );
    }

    try {
      const dailyCalories = await calculateDailyCalories(
        currentWeight,
        desiredWeight
      );
      const dailyExerciseMinutes = await calculateDailyExerciseMinutes(
        currentWeight,
        desiredWeight
      );

      // Check if a goal already exists for the user
      const existingGoal = await db
        .select()
        .from(goals)
        .where(eq(goals.userId, userId));

      let result;
      if (existingGoal.length > 0) {
        // Update existing goal
        result = await db
          .update(goals)
          .set({
            currentWeight: currentWeight.toString(),
            desiredWeight: desiredWeight.toString(),
            dailyCalories: dailyCalories.toString(),
            dailyExerciseMinutes,
            startDate: dayjs(startDate).format("YYYY-MM-DD"),
            endDate: dayjs(endDate).format("YYYY-MM-DD"),
          })
          .where(eq(goals.userId, userId))
          .returning();
      } else {
        // Insert new goal
        const newGoal: NewGoal = {
          userId,
          currentWeight: currentWeight.toString(),
          desiredWeight: desiredWeight.toString(),
          dailyCalories: dailyCalories.toString(),
          dailyExerciseMinutes,
          startDate: dayjs(startDate).format("YYYY-MM-DD"),
          endDate: dayjs(endDate).format("YYYY-MM-DD"),
        };
        result = await db.insert(goals).values(newGoal).returning();
      }

      return new Response(JSON.stringify({ success: true, data: result[0] }), {
        status: 201,
      });
    } catch (error) {
      console.error("Error saving goal:", error);
      return new Response(
        JSON.stringify({ success: false, message: "Error saving goal" }),
        { status: 500 }
      );
    }
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
    const userGoal = await db
      .select()
      .from(goals)
      .where(eq(goals.userId, userId));
    return new Response(
      JSON.stringify({ success: true, data: userGoal[0] || null }),
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching goal:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error fetching goal" }),
      { status: 500 }
    );
  }
}

export async function DELETE(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      { status: 401 }
    );
  }

  try {
    const result = await db
      .delete(goals)
      .where(eq(goals.userId, userId))
      .returning();
    if (result.length === 0) {
      return new Response(
        JSON.stringify({ success: false, message: "Goal not found" }),
        { status: 404 }
      );
    }
    return new Response(JSON.stringify({ success: true, data: result[0] }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error deleting goal:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error deleting goal" }),
      { status: 500 }
    );
  }
}

async function calculateDailyCalories(
  currentWeight: number,
  desiredWeight: number
): Promise<number> {
  const prompt = `Calculate the daily calorie intake for a person who currently weighs ${currentWeight} kg and wants to reach ${desiredWeight} kg. Provide only a single numeric value rounded to the nearest whole number, with no additional text or units.`;

  return await getNumericValueFromGPT(prompt, "daily calorie intake");
}

async function calculateDailyExerciseMinutes(
  currentWeight: number,
  desiredWeight: number
): Promise<number> {
  const prompt = `Calculate the recommended daily exercise minutes for a person who currently weighs ${currentWeight} kg and wants to reach ${desiredWeight} kg. Provide only a single numeric value rounded to the nearest whole number, with no additional text or units.`;

  return await getNumericValueFromGPT(prompt, "daily exercise minutes");
}

async function getNumericValueFromGPT(
  prompt: string,
  valueType: string
): Promise<number> {
  const maxRetries = 3;
  let retries = 0;

  while (retries < maxRetries) {
    try {
      const completionResponse = await axios.post(
        "https://api.openai.com/v1/chat/completions",
        {
          model: "gpt-3.5-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a helpful assistant that provides only numeric answers without any additional text.",
            },
            { role: "user", content: prompt },
          ],
          max_tokens: 20,
          n: 1,
          stop: null,
          temperature: 0.3,
        },
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
          },
        }
      );

      const completionText =
        completionResponse.data.choices[0].message.content.trim();
      const numericValue = parseInt(completionText, 10);

      if (!isNaN(numericValue) && numericValue > 0) {
        return numericValue;
      } else {
        throw new Error(`Invalid ${valueType} value: ${completionText}`);
      }
    } catch (error) {
      console.error(
        `Error calculating ${valueType} (Attempt ${
          retries + 1
        }/${maxRetries}):`,
        error
      );
      retries++;

      if (retries >= maxRetries) {
        throw new Error(
          `Failed to calculate ${valueType} after ${maxRetries} attempts`
        );
      }
    }
  }

  throw new Error(`Unexpected error in calculating ${valueType}`);
}
