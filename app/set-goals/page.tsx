"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2, Check, CalendarIcon } from "lucide-react";
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
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import axios from "axios";
import Back from "@/components/Back";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import dayjs from "dayjs";

const SetGoals: React.FC = () => {
  const [goal, setGoal] = useState<any | null>(null);
  const [newGoal, setNewGoal] = useState<Partial<any>>({
    currentWeight: undefined,
    desiredWeight: undefined,
    startDate: dayjs().startOf("month").toDate(),
    endDate: dayjs().endOf("month").toDate(),
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);

  const { toast } = useToast();

  const fetchGoal = useCallback(async () => {
    try {
      const response = await axios.get("/api/goals");
      setGoal(response.data.data);
    } catch (error) {
      console.error("Error fetching goal:", error);
      toast({
        title: "Error",
        description: "Failed to fetch goal. Please try again.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    const loadData = async () => {
      setIsPageLoading(true);
      await fetchGoal();
      setIsPageLoading(false);
    };
    loadData();
  }, [fetchGoal]);

  const handleGoalChange = (
    field: keyof Partial<any>,
    value: string | number | Date
  ) => {
    setNewGoal((prevGoal) => ({ ...prevGoal, [field]: value }));
  };

  const calculateGoals = async () => {
    const { currentWeight, desiredWeight } = newGoal;
    if (currentWeight && desiredWeight) {
      setIsLoading(true);
      try {
        const response = await axios.post("/api/goals", {
          action: "calculate",
          currentWeight,
          desiredWeight,
        });

        const data = response.data.data;
        setNewGoal((prevGoal) => ({
          ...prevGoal,
          dailyCalories: data.dailyCalories,
          dailyExerciseMinutes: data.dailyExerciseMinutes,
        }));
      } catch (error) {
        console.error("Error calculating goals:", error);
        toast({
          title: "Error",
          description: "Failed to calculate goals. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    } else {
      toast({
        title: "Missing Fields",
        description: "Please enter the current weight and desired weight.",
        variant: "destructive",
      });
    }
  };

  const saveGoal = async () => {
    if (
      newGoal.currentWeight &&
      newGoal.desiredWeight &&
      newGoal.startDate &&
      newGoal.endDate &&
      newGoal.dailyCalories &&
      newGoal.dailyExerciseMinutes
    ) {
      setIsSaving(true);
      try {
        const response = await axios.post("/api/goals", newGoal);
        setGoal(response.data.data);
        setNewGoal({
          currentWeight: undefined,
          desiredWeight: undefined,
          startDate: dayjs().startOf("month").toDate(),
          endDate: dayjs().endOf("month").toDate(),
        });
        setIsOpen(false);
        toast({
          title: "Success",
          description: "Your goal has been saved successfully!",
        });
      } catch (error) {
        console.error("Error saving goal:", error);
        toast({
          title: "Error",
          description: "Failed to save goal. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsSaving(false);
      }
    } else {
      toast({
        title: "Missing Fields",
        description: "Please fill all fields before saving.",
        variant: "destructive",
      });
    }
  };

  const removeGoal = async () => {
    try {
      await axios.delete("/api/goals");
      setGoal(null);
      toast({
        title: "Success",
        description: "Goal removed successfully",
      });
    } catch (error) {
      console.error("Error removing goal:", error);
      toast({
        title: "Error",
        description: "Failed to remove goal. Please try again.",
        variant: "destructive",
      });
    }
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
      <main className="container mx-auto max-w-4xl py-12 px-4 sm:px-6 lg:px-8">
        <Back />
        <div className="space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold tracking-tight">
              Calorie Goal Tracker
            </h1>
            <p className="mt-2 text-lg text-muted-foreground">
              Set your weight loss goals and track your progress.
            </p>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Your Goal</CardTitle>
            </CardHeader>
            <CardContent>
              {goal ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Current Weight
                    </p>
                    <p className="text-2xl font-bold">
                      {goal.currentWeight} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Target Weight
                    </p>
                    <p className="text-2xl font-bold">
                      {goal.desiredWeight} kg
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Daily Calories
                    </p>
                    <p className="text-2xl font-bold">
                      {goal.dailyCalories} kcal
                    </p>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">
                      Daily Exercise
                    </p>
                    <p className="text-2xl font-bold">
                      {goal.dailyExerciseMinutes} minutes
                    </p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm font-medium text-muted-foreground">
                      Goal Period
                    </p>
                    <p className="text-lg font-semibold">
                      {dayjs(goal.startDate).format("MMMM D, YYYY")} -{" "}
                      {dayjs(goal.endDate).format("MMMM D, YYYY")}
                    </p>
                  </div>

                  <div className="col-span-2">
                    <Button
                      variant="outline"
                      onClick={removeGoal}
                      className="w-full"
                    >
                      Remove Goal
                    </Button>
                  </div>
                </div>
              ) : (
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      <Plus className="w-4 h-4 mr-2" />
                      Set New Goal
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Set Your Goal</DialogTitle>
                      <DialogDescription>
                        Enter your current weight, desired weight, and the
                        timeframe for achieving your goal.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="currentWeight" className="text-right">
                          Current Weight (kg)
                        </Label>
                        <Input
                          id="currentWeight"
                          type="number"
                          value={newGoal.currentWeight || ""}
                          onChange={(e) =>
                            handleGoalChange(
                              "currentWeight",
                              Number(e.target.value)
                            )
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="desiredWeight" className="text-right">
                          Target Weight (kg)
                        </Label>
                        <Input
                          id="desiredWeight"
                          type="number"
                          value={newGoal.desiredWeight || ""}
                          onChange={(e) =>
                            handleGoalChange(
                              "desiredWeight",
                              Number(e.target.value)
                            )
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="startDate" className="text-right">
                          Start Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`col-span-3 justify-start text-left font-normal ${
                                !newGoal.startDate && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newGoal.startDate
                                ? dayjs(newGoal.startDate).format(
                                    "MMMM D, YYYY"
                                  )
                                : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newGoal.startDate}
                              onSelect={(date) =>
                                handleGoalChange("startDate", date as Date)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="endDate" className="text-right">
                          End Date
                        </Label>
                        <Popover>
                          <PopoverTrigger asChild>
                            <Button
                              variant="outline"
                              className={`col-span-3 justify-start text-left font-normal ${
                                !newGoal.endDate && "text-muted-foreground"
                              }`}
                            >
                              <CalendarIcon className="mr-2 h-4 w-4" />
                              {newGoal.endDate
                                ? dayjs(newGoal.endDate).format("MMMM D, YYYY")
                                : "Select date"}
                            </Button>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0">
                            <Calendar
                              mode="single"
                              selected={newGoal.endDate}
                              onSelect={(date) =>
                                handleGoalChange("endDate", date as Date)
                              }
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                      </div>
                    </div>
                    <div className="py-4">
                      <Button
                        onClick={calculateGoals}
                        disabled={isLoading}
                        className="w-full"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Calculating...
                          </>
                        ) : (
                          "Calculate Goals"
                        )}
                      </Button>
                    </div>
                    {newGoal.dailyCalories && newGoal.dailyExerciseMinutes && (
                      <div className="py-4 space-y-4">
                        <h3 className="text-lg font-bold">Calculated Goals</h3>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="calculatedCalories">
                              Daily Calories (kcal)
                            </Label>
                            <Input
                              id="calculatedCalories"
                              type="number"
                              value={newGoal.dailyCalories || ""}
                              onChange={(e) =>
                                handleGoalChange(
                                  "dailyCalories",
                                  Number(e.target.value)
                                )
                              }
                              className="mt-1"
                            />
                          </div>
                          <div>
                            <Label htmlFor="calculatedExercise">
                              Daily Exercise (minutes)
                            </Label>
                            <Input
                              id="calculatedExercise"
                              type="number"
                              value={newGoal.dailyExerciseMinutes || ""}
                              onChange={(e) =>
                                handleGoalChange(
                                  "dailyExerciseMinutes",
                                  Number(e.target.value)
                                )
                              }
                              className="mt-1"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                    <DialogFooter>
                      <Button
                        onClick={saveGoal}
                        disabled={
                          !newGoal.dailyCalories ||
                          !newGoal.dailyExerciseMinutes ||
                          isSaving
                        }
                        className="w-full"
                      >
                        {isSaving ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Check className="mr-2 h-4 w-4" />
                            Save Goal
                          </>
                        )}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default SetGoals;
