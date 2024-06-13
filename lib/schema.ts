import { pgTable, serial, varchar, integer, date } from "drizzle-orm/pg-core";

export const workouts = pgTable("workouts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 256 }).notNull(),
  sets: integer("sets").notNull(),
  reps: integer("reps").notNull(),
  weight: integer("weight").notNull(),
  date: date("date").notNull(),
});

export type Workout = typeof workouts.$inferSelect;
export type NewWorkout = typeof workouts.$inferInsert;
