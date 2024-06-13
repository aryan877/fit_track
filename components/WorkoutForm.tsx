import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { NewWorkout } from "@/lib/schema";

export function WorkoutForm() {
  const handleSubmit = async () => {
    // e.preventDefault();
    // Implement workout form submission logic
  };

  return (
    <form onSubmit={handleSubmit}>
      <div className="mb-4">
        <Label htmlFor="exercise">Exercise</Label>
        <Input id="exercise" type="text" />
      </div>
      <div className="mb-4">
        <Label htmlFor="sets">Sets</Label>
        <Input id="sets" type="number" />
      </div>
      <div className="mb-4">
        <Label htmlFor="reps">Reps</Label>
        <Input id="reps" type="number" />
      </div>
      <div className="mb-4">
        <Label htmlFor="weight">Weight (kg)</Label>
        <Input id="weight" type="number" />
      </div>
      <Button type="submit">Log Workout</Button>
    </form>
  );
}
