import { auth } from "@clerk/nextjs/server";
import { db } from "@/lib/db";
import { goals, nutritionEntries } from "@/lib/schema";
import axios from "axios";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import { and, eq, gte, lte } from "drizzle-orm";

dayjs.extend(utc);
dayjs.extend(timezone);

async function fetchNutritionData(mealName: string, portion: string) {
  const prompt = `Calculate the approximate calories, protein, carbs, and fat for a meal consisting of ${mealName} with a portion size of ${portion} grams. Provide the values in the following format:
  Calories: <value>
  Protein: <value>
  Carbs: <value>
  Fat: <value>`;

  const completionResponse = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      max_tokens: 100,
      n: 1,
      stop: null,
      temperature: 0.7,
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

  const caloriesRegex = /Calories:\s*(\d+)/i;
  const proteinRegex = /Protein:\s*(\d+)/i;
  const carbsRegex = /Carbs:\s*(\d+)/i;
  const fatRegex = /Fat:\s*(\d+)/i;

  const caloriesMatch = completionText.match(caloriesRegex);
  const proteinMatch = completionText.match(proteinRegex);
  const carbsMatch = completionText.match(carbsRegex);
  const fatMatch = completionText.match(fatRegex);

  return {
    calories: caloriesMatch ? parseInt(caloriesMatch[1], 10) : undefined,
    protein: proteinMatch ? parseInt(proteinMatch[1], 10) : undefined,
    carbs: carbsMatch ? parseInt(carbsMatch[1], 10) : undefined,
    fat: fatMatch ? parseInt(fatMatch[1], 10) : undefined,
  };
}

export async function POST(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { meals } = await request.json();
    if (!meals || !Array.isArray(meals)) {
      return Response.json(
        { success: false, message: "Invalid meals data" },
        { status: 400 }
      );
    }

    const now = dayjs().tz(dayjs.tz.guess());
    const existingMeals = meals.filter((meal) => meal.id);
    const newMeals = meals.filter((meal) => !meal.id);

    const results = [];

    if (existingMeals.length > 0) {
      for (const meal of existingMeals) {
        const {
          id,
          mealType,
          mealName,
          portion,
          calories,
          protein,
          carbs,
          fat,
        } = meal;
        const result = await db
          .update(nutritionEntries)
          .set({
            mealType,
            mealName,
            portion,
            calories,
            protein,
            carbs,
            fat,
            date: now.toDate(),
          })
          .where(
            and(
              eq(nutritionEntries.id, id),
              eq(nutritionEntries.userId, userId)
            )
          )
          .returning();
        results.push(result[0]);
      }
    }

    // Insert new meals
    if (newMeals.length > 0) {
      const newEntries = newMeals.map((meal) => ({
        userId,
        date: now.toDate(),
        mealType: meal.mealType,
        mealName: meal.mealName,
        portion: meal.portion,
        calories: meal.calories,
        protein: meal.protein,
        carbs: meal.carbs,
        fat: meal.fat,
      }));

      const insertResult = await db
        .insert(nutritionEntries)
        .values(newEntries)
        .returning();
      results.push(...insertResult);
    }

    return Response.json(
      { success: true, data: results },
      {
        status: 201,
      }
    );
  } catch (error) {
    console.error("Error saving nutrition entries:", error);
    return Response.json(
      {
        success: false,
        message: "Error saving nutrition entries",
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return Response.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  const { searchParams } = new URL(request.url);
  const mealName = searchParams.get("mealName");
  const portion = searchParams.get("portion");

  if (mealName && portion) {
    // AI for fetching nutrition data
    try {
      const nutritionData = await fetchNutritionData(mealName, portion);
      return Response.json(
        {
          success: true,
          data: [{ mealName, portion, ...nutritionData }],
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching nutrition data:", error);
      return Response.json(
        {
          success: false,
          message: "Error fetching nutrition data",
        },
        { status: 500 }
      );
    }
  } else {
    // fetching today's meals and user's goal
    try {
      const now = dayjs().tz(dayjs.tz.guess());
      const startOfDay = now.startOf("day").toDate();
      const endOfDay = now.endOf("day").toDate();

      const todaysMeals = await db
        .select()
        .from(nutritionEntries)
        .where(
          and(
            eq(nutritionEntries.userId, userId),
            gte(nutritionEntries.date, startOfDay),
            lte(nutritionEntries.date, endOfDay)
          )
        )
        .orderBy(nutritionEntries.date);

      const userGoal = await db
        .select()
        .from(goals)
        .where(eq(goals.userId, userId))
        .limit(1);

      return Response.json(
        {
          success: true,
          data: {
            meals: todaysMeals,
            goal: userGoal[0] || null,
          },
        },
        { status: 200 }
      );
    } catch (error) {
      console.error("Error fetching today's meals and goal:", error);
      return Response.json(
        {
          success: false,
          message: "Error fetching today's meals and goal",
        },
        { status: 500 }
      );
    }
  }
}

export async function DELETE(request: Request) {
  try {
    const { userId } = auth();
    if (!userId) {
      return Response.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await request.json();

    if (typeof id !== "number") {
      return Response.json(
        { success: false, message: "Invalid ID" },
        { status: 400 }
      );
    }

    const result = await db
      .delete(nutritionEntries)
      .where(eq(nutritionEntries.id, id))
      .returning();

    if (result.length === 0) {
      return Response.json(
        { success: false, message: "Meal not found" },
        { status: 404 }
      );
    }

    return Response.json({ success: true, data: result[0] }, { status: 200 });
  } catch (error) {
    console.error("Error deleting meal:", error);
    return Response.json(
      { success: false, message: "Error deleting meal" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  const { userId } = auth();
  if (!userId) {
    return new Response(
      JSON.stringify({ success: false, message: "Unauthorized" }),
      { status: 401 }
    );
  }

  const { id, mealName, portion, mealType, calories, protein, carbs, fat } =
    await request.json();

  if (!id || !mealName || !portion || !mealType) {
    return new Response(
      JSON.stringify({ success: false, message: "Invalid data" }),
      { status: 400 }
    );
  }

  try {
    const result = await db
      .update(nutritionEntries)
      .set({
        mealName,
        portion,
        mealType,
        calories,
        protein,
        carbs,
        fat,
      })
      .where(eq(nutritionEntries.id, id))
      .returning();

    return new Response(JSON.stringify({ success: true, data: result[0] }), {
      status: 200,
    });
  } catch (error) {
    console.error("Error updating meal:", error);
    return new Response(
      JSON.stringify({ success: false, message: "Error updating meal" }),
      { status: 500 }
    );
  }
}
