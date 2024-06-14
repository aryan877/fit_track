"use client";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function DietForm() {
  const [food, setFood] = useState("");
  const [calories, setCalories] = useState("");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Handle form submission logic here
    console.log("Diet form submitted:", { food, calories });
    // Reset form fields
    setFood("");
    setCalories("");
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <Label htmlFor="food">Food</Label>
        <Input
          id="food"
          type="text"
          value={food}
          onChange={(e) => setFood(e.target.value)}
        />
      </div>
      <div className="mb-4">
        <Label htmlFor="calories">Calories</Label>
        <Input
          id="calories"
          type="number"
          value={calories}
          onChange={(e) => setCalories(e.target.value)}
        />
      </div>
      <Button type="submit">Log Diet</Button>
    </form>
  );
}
