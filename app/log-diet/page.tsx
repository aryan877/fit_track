"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Check, Coffee, Sun, Moon } from "lucide-react";
import { NewNutritionEntry, Goal } from "@/lib/schema";
import { useToast } from "@/components/ui/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axios from "axios";
import MealItem from "@/components/MealItem";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import Back from "@/components/Back";

const LogDiet: React.FC = () => {
  const [meals, setMeals] = useState<NewNutritionEntry[]>([]);
  const [newMeal, setNewMeal] = useState<Partial<NewNutritionEntry>>({
    mealName: "",
    portion: undefined,
    mealType: "",
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [nutritionData, setNutritionData] = useState<NewNutritionEntry | null>(
    null
  );
  const [goal, setGoal] = useState<Goal | null>(null);

  const { toast } = useToast();
  const router = useRouter();

  const fetchTodaysMeals = useCallback(async () => {
    try {
      const response = await axios.get("/api/nutrition");
      setMeals(response.data.data.meals);
      setGoal(response.data.data.goal);
    } catch (error) {
      console.error("Error fetching today's meals and goal:", error);
      toast({
        title: "Error",
        description:
          "Failed to fetch today's meals and goal. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    const loadData = async () => {
      setIsPageLoading(true);
      await fetchTodaysMeals();
      setIsPageLoading(false);
    };
    loadData();
  }, [fetchTodaysMeals]);

  const handleMealChange = (
    field: keyof Partial<NewNutritionEntry>,
    value: string | number
  ) => {
    setNewMeal((prevMeal) => ({ ...prevMeal, [field]: value }));
  };

  const handleNutritionDataChange = (
    field: keyof NewNutritionEntry,
    value: string | number
  ) => {
    setNutritionData((prevData) => prevData && { ...prevData, [field]: value });
  };

  const calculateNutrition = async () => {
    const { mealName, portion } = newMeal;
    if (mealName && portion !== undefined) {
      setIsLoading(true);
      try {
        const response = await axios.get("/api/nutrition", {
          params: { mealName, portion },
        });

        const data = response.data.data[0];
        setNutritionData({
          userId: "",
          date: new Date(),
          mealType: newMeal.mealType || "",
          ...data,
        });
      } catch (error) {
        console.error("Error fetching nutrition data:", error);
        toast({
          title: "Error",
          description: "Failed to fetch nutrition data. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Missing Fields",
        description: "Please enter the meal name and portion size.",
        variant: "destructive",
      });
    }
  };

  const addMeal = () => {
    if (nutritionData) {
      setMeals((prevMeals) => [...prevMeals, nutritionData]);
      setNewMeal({ mealName: "", portion: undefined, mealType: "" });
      setNutritionData(null);
      setIsOpen(false);
    }
  };

  const removeMeal = async (mealToRemove: NewNutritionEntry) => {
    try {
      if (mealToRemove.id) {
        await axios.delete("/api/nutrition", { data: { id: mealToRemove.id } });
      }
      setMeals((prevMeals) =>
        prevMeals.filter((meal) => meal !== mealToRemove)
      );
      toast({
        title: "Success",
        description: "Meal removed successfully",
      });
    } catch (error) {
      console.error("Error removing meal:", error);
      toast({
        title: "Error",
        description: "Failed to remove meal. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async () => {
    if (meals.length === 0) {
      toast({
        title: "No Meals",
        description: "Please add at least one meal before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const response = await axios.post("/api/nutrition", { meals });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Your nutrition entries have been logged successfully!",
        });
        fetchTodaysMeals();
      } else {
        toast({
          title: "Error",
          description: "Failed to save nutrition entries. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving nutrition entries:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving nutrition entries.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const mealTypes = [
    { type: "breakfast", icon: Coffee, label: "Breakfast" },
    { type: "lunch", icon: Sun, label: "Lunch" },
    { type: "dinner", icon: Moon, label: "Dinner" },
  ];

  const totalNutrition = meals.reduce(
    (acc, meal) => {
      acc.calories += Number(meal.calories) || 0;
      acc.protein += Number(meal.protein) || 0;
      acc.carbs += Number(meal.carbs) || 0;
      acc.fat += Number(meal.fat) || 0;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 }
  );

  const macroPercentages = {
    protein:
      ((totalNutrition.protein * 4) / totalNutrition.calories) * 100 || 0,
    carbs: ((totalNutrition.carbs * 4) / totalNutrition.calories) * 100 || 0,
    fat: ((totalNutrition.fat * 9) / totalNutrition.calories) * 100 || 0,
  };

  if (isPageLoading) {
    return (
      <div className="flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="bg-background text-foreground">
      <main className="container mx-auto py-8 px-6">
        <Back />
        <h2 className="text-3xl font-bold mb-6">{`Log Today's Nutrition`}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Meals</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mb-6">
                      <Plus className="w-5 h-5 mr-2" />
                      Add Meal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Meal</DialogTitle>
                      <DialogDescription>
                        Enter the details of the meal you want to add.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mealType" className="text-right">
                          Meal Type
                        </Label>
                        <Select
                          onValueChange={(value: string) =>
                            handleMealChange("mealType", value)
                          }
                          value={newMeal.mealType}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select meal type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="breakfast">Breakfast</SelectItem>
                            <SelectItem value="lunch">Lunch</SelectItem>
                            <SelectItem value="dinner">Dinner</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="mealName" className="text-right">
                          Meal Name
                        </Label>
                        <Input
                          id="mealName"
                          value={newMeal.mealName || ""}
                          onChange={(e) =>
                            handleMealChange("mealName", e.target.value)
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="portion" className="text-right">
                          Portion (grams)
                        </Label>
                        <Input
                          id="portion"
                          type="number"
                          value={newMeal.portion || ""}
                          onChange={(e) =>
                            handleMealChange("portion", Number(e.target.value))
                          }
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <div className="py-4">
                      <Button
                        onClick={calculateNutrition}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          "Calculate Nutrition"
                        )}
                      </Button>
                    </div>
                    {nutritionData && (
                      <div className="py-4">
                        <h3 className="text-lg font-bold mb-2">
                          {nutritionData.mealName}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="calculatedCalories">
                              Calories (kcal)
                            </Label>
                            <Input
                              id="calculatedCalories"
                              type="number"
                              value={nutritionData.calories || ""}
                              onChange={(e) =>
                                handleNutritionDataChange(
                                  "calories",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="calculatedProtein">
                              Protein (g)
                            </Label>
                            <Input
                              id="calculatedProtein"
                              type="number"
                              value={nutritionData.protein || ""}
                              onChange={(e) =>
                                handleNutritionDataChange(
                                  "protein",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="calculatedCarbs">Carbs (g)</Label>
                            <Input
                              id="calculatedCarbs"
                              type="number"
                              value={nutritionData.carbs || ""}
                              onChange={(e) =>
                                handleNutritionDataChange(
                                  "carbs",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor="calculatedFat">Fat (g)</Label>
                            <Input
                              id="calculatedFat"
                              type="number"
                              value={nutritionData.fat || ""}
                              onChange={(e) =>
                                handleNutritionDataChange(
                                  "fat",
                                  Number(e.target.value)
                                )
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button
                        onClick={addMeal}
                        disabled={!nutritionData}
                        className="bg-green-500 text-white hover:bg-green-600"
                      >
                        <Check className="mr-2 h-4 w-4" />
                        Add Meal
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                <div className="space-y-6">
                  {mealTypes.map(({ type, icon: Icon, label }) => (
                    <Card key={type} className="bg-gray-50">
                      <CardHeader>
                        <CardTitle className="flex items-center text-xl font-semibold">
                          <Icon className="w-5 h-5 mr-2" />
                          {label}
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        {meals.filter((meal) => meal.mealType === type).length >
                        0 ? (
                          <div className="space-y-2">
                            {meals
                              .filter((meal) => meal.mealType === type)
                              .map((meal, index) => (
                                <MealItem
                                  key={index}
                                  meal={meal}
                                  onRemove={() => removeMeal(meal)}
                                />
                              ))}
                          </div>
                        ) : (
                          <div className="text-center py-6">
                            <p className="text-gray-500">
                              No {label.toLowerCase()} logged yet.
                            </p>
                            <Button
                              variant="outline"
                              size="sm"
                              className="mt-2"
                              onClick={() => {
                                setNewMeal({ ...newMeal, mealType: type });
                                setIsOpen(true);
                              }}
                            >
                              <Plus className="w-4 h-4 mr-1" />
                              Add {label}
                            </Button>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Daily Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {meals.length > 0 && goal ? (
                  <div className="space-y-4">
                    <div className="text-2xl font-bold text-center">
                      {totalNutrition.calories.toFixed(0)} /{" "}
                      {goal.dailyCalories} kcal
                    </div>
                    <Progress
                      value={
                        (totalNutrition.calories / Number(goal.dailyCalories)) *
                        100
                      }
                      className="h-2 bg-blue-100"
                    />
                    <div className="space-y-2">
                      <MacroItem
                        label="Protein"
                        value={totalNutrition.protein}
                        percentage={macroPercentages.protein}
                        color="red"
                      />
                      <MacroItem
                        label="Carbs"
                        value={totalNutrition.carbs}
                        percentage={macroPercentages.carbs}
                        color="green"
                      />
                      <MacroItem
                        label="Fat"
                        value={totalNutrition.fat}
                        percentage={macroPercentages.fat}
                        color="yellow"
                      />
                    </div>
                    <Button
                      onClick={handleSubmit}
                      disabled={isSaving}
                      className="w-full mt-4"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        "Save Nutrition"
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    {goal
                      ? "No meals logged yet. Add meals to see your daily summary."
                      : "No goal set. Please set a goal in the Goals section."}
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

interface MacroItemProps {
  label: string;
  value: number;
  percentage: number;
  color: string;
}

const MacroItem: React.FC<MacroItemProps> = ({
  label,
  value,
  percentage,
  color,
}) => (
  <div>
    <div className="flex justify-between items-center mb-1">
      <span className="text-sm font-medium">{label}</span>
      <span className="text-sm font-medium">{value.toFixed(1)}g</span>
    </div>
    <Progress value={percentage} className={`h-2 bg-${color}-100`} />
    <div className="text-xs text-right mt-1">{percentage.toFixed(1)}%</div>
  </div>
);

export default LogDiet;
