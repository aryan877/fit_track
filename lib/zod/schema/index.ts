import { z } from "zod";

export const newWorkoutSchema = z.object({
  name: z.string().min(1, "Exercise name is required"),
  sets: z.number().int().positive().optional(),
  reps: z.number().int().positive().optional(),
  weight: z.number().positive().optional(),
  date: z.date(),
});

export type NewWorkout = z.infer<typeof newWorkoutSchema>;
