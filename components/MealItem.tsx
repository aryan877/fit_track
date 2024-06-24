import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Utensils } from "lucide-react";
import { NewNutritionEntry } from "@/lib/schema";
import { Progress } from "@/components/ui/progress";

interface MealItemProps {
  meal: NewNutritionEntry;
  onRemove: () => void;
}

const MealItem: React.FC<MealItemProps> = ({ meal, onRemove }) => {
  const proteinGrams = parseFloat(meal.protein?.toString() || "0");
  const carbsGrams = parseFloat(meal.carbs?.toString() || "0");
  const fatGrams = parseFloat(meal.fat?.toString() || "0");
  const totalCalories = parseFloat(meal.calories?.toString() || "0");

  const macros = [
    { label: "Protein", value: proteinGrams, color: "bg-primary" },
    { label: "Carbs", value: carbsGrams, color: "bg-secondary" },
    { label: "Fat", value: fatGrams, color: "bg-accent" },
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-4">
            <div className="bg-muted p-2 rounded-md">
              <Utensils className="h-5 w-5 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">{meal.mealName}</h3>
              <p className="text-sm text-muted-foreground">
                {meal.portion} grams
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <p className="text-2xl font-bold">
              {totalCalories.toFixed(0)}
              <span className="text-sm font-normal text-muted-foreground ml-1">
                kcal
              </span>
            </p>
            <Button
              variant="ghost"
              size="icon"
              className="rounded-full"
              onClick={onRemove}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="mt-6 space-y-4">
          {macros.map((macro) => (
            <MacroItem
              key={macro.label}
              label={macro.label}
              value={macro.value}
              totalCalories={totalCalories}
              color={macro.color}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

interface MacroItemProps {
  label: string;
  value: number;
  totalCalories: number;
  color: string;
}

const MacroItem: React.FC<MacroItemProps> = ({
  label,
  value,
  totalCalories,
  color,
}) => {
  const caloriesFromMacro = value * (label === "Fat" ? 9 : 4);
  const percentage = (caloriesFromMacro / totalCalories) * 100;

  return (
    <div className="space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-sm font-semibold">
          {value.toFixed(1)}g
          <span className="text-muted-foreground font-normal ml-1">
            ({percentage.toFixed(1)}%)
          </span>
        </p>
      </div>
      <Progress value={percentage} className="h-2" />
    </div>
  );
};

export default MealItem;
