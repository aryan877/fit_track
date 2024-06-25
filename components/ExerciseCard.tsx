import React from "react";
import { NewWorkout } from "@/lib/schema";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface ExerciseCardProps {
  exercise: NewWorkout;
  onRemove: () => void;
  isLoading: boolean;
}

const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onRemove,
  isLoading,
}) => {
  return (
    <Card className="bg-gray-50">
      <CardContent className="p-4 flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold">{exercise.exercise}</h3>
          <p className="text-sm text-gray-500">
            {exercise.sets} sets x {exercise.reps} reps @ {exercise.weight} kg
          </p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onRemove}
          disabled={isLoading}
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Remove"}
        </Button>
      </CardContent>
    </Card>
  );
};

export default ExerciseCard;
