"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewWorkout } from "@/lib/schema";
import { newWorkoutSchema } from "@/lib/zod/schema";
import { useState } from "react";
import { z } from "zod";

export default function WorkoutForm() {
  const [name, setName] = useState("");
  const [sets, setSets] = useState("");
  const [reps, setReps] = useState("");
  const [weight, setWeight] = useState("");
  const [errors, setErrors] = useState<z.ZodIssue[]>([]);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const newWorkout: NewWorkout = {
      name,
      sets: sets ? parseInt(sets, 10) : 0,
      reps: reps ? parseInt(reps, 10) : 0,
      weight: weight ? parseFloat(weight) : 0,
      date: new Date(),
    };

    const result = newWorkoutSchema.safeParse(newWorkout);

    if (result.success) {
      try {
        const response = await fetch("/api/workout", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(result.data),
        });

        if (response.ok) {
          // Workout saved successfully
          console.log("Workout saved successfully");
          // Reset form fields
          setName("");
          setSets("");
          setReps("");
          setWeight("");
          setErrors([]);
        } else {
          // Handle error case
          console.error("Error saving workout:", response.statusText);
        }
      } catch (error) {
        console.error("Error saving workout:", error);
      }
    } else {
      setErrors(result.error.issues);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <Label htmlFor="exercise">Exercise</Label>
        <Input
          id="exercise"
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="sets">Sets</Label>
        <Input
          id="sets"
          type="number"
          value={sets}
          onChange={(e) => setSets(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="reps">Reps</Label>
        <Input
          id="reps"
          type="number"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="weight">Weight (kg)</Label>
        <Input
          id="weight"
          type="number"
          value={weight}
          onChange={(e) => setWeight(e.target.value)}
        />
      </div>
      {errors.length > 0 && (
        <div className="text-red-500 mb-4">
          {errors.map((error) => (
            <p key={error.path[0]}>{error.message}</p>
          ))}
        </div>
      )}
      <Button type="submit">Log Workout</Button>
    </form>
  );
}
