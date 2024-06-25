import {
  pgTable,
  serial,
  varchar,
  integer,
  numeric,
  timestamp,
  text,
  date,
} from "drizzle-orm/pg-core";

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  exercise: varchar("exercise", { length: 256 }).notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: numeric("weight").notNull(),
  date: date("date", { mode: "date" }).notNull(),
});

export const nutritionEntries = pgTable("nutrition_entries", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  date: timestamp("date").notNull(),
  mealType: text("meal_type").notNull(),
  mealName: varchar("meal_name", { length: 256 }).notNull(),
  portion: numeric("portion").notNull(),
  calories: numeric("calories"),
  protein: numeric("protein"),
  carbs: numeric("carbs"),
  fat: numeric("fat"),
});

export const goals = pgTable("goals", {
  id: serial("id").primaryKey(),
  userId: varchar("user_id", { length: 256 }).notNull(),
  currentWeight: numeric("current_weight").notNull(),
  desiredWeight: numeric("desired_weight").notNull(),
  dailyCalories: numeric("daily_calories").notNull(),
  dailyExerciseMinutes: integer("daily_exercise_minutes").notNull(),
  startDate: date("start_date").notNull(),
  endDate: date("end_date").notNull(),
});

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
export type NutritionEntry = typeof nutritionEntries.$inferSelect;
export type NewNutritionEntry = typeof nutritionEntries.$inferInsert;
export type Goal = typeof goals.$inferSelect;
export type NewGoal = typeof goals.$inferInsert;
