"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Plus, Loader2 } from "lucide-react";
import { NewWorkout } from "@/lib/schema";
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
import { useRouter } from "next/navigation";
import { exerciseList } from "@/data/exerciseList";
import ExerciseCard from "@/components/ExerciseCard";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Back from "@/components/Back";

const LogWorkout: React.FC = () => {
  const [exercises, setExercises] = useState<NewWorkout[]>([]);
  const [newExercise, setNewExercise] = useState<Partial<NewWorkout>>({
    exercise: "",
    sets: undefined,
    reps: undefined,
    weight: undefined,
  });
  const [isOpen, setIsOpen] = useState(false);
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [removingExerciseId, setRemovingExerciseId] = useState<number | null>(
    null
  );
  const [selectedBodyPart, setSelectedBodyPart] = useState<string>("");

  const { toast } = useToast();
  const router = useRouter();

  const fetchTodaysWorkouts = useCallback(async () => {
    try {
      const response = await axios.get("/api/workout");
      setExercises(response.data.data);
    } catch (error) {
      console.error("Error fetching today's workouts:", error);
      toast({
        title: "Error",
        description: "Failed to fetch today's workouts. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsPageLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    fetchTodaysWorkouts();
  }, [fetchTodaysWorkouts]);

  const handleExerciseChange = (
    field: keyof Partial<NewWorkout>,
    value: string | number
  ) => {
    setNewExercise((prevExercise) => ({ ...prevExercise, [field]: value }));
  };

  const addExercise = () => {
    if (
      newExercise.exercise &&
      newExercise.sets &&
      newExercise.reps &&
      newExercise.weight
    ) {
      const exerciseWithDate = {
        ...newExercise,
        date: new Date(),
      } as NewWorkout;
      setExercises((prevExercises) => [...prevExercises, exerciseWithDate]);
      setNewExercise({
        exercise: "",
        sets: undefined,
        reps: undefined,
        weight: undefined,
      });
      setIsOpen(false);
    }
  };

  const removeExercise = async (exerciseToRemove: NewWorkout) => {
    if (!exerciseToRemove.id) return;

    setRemovingExerciseId(exerciseToRemove.id);
    try {
      await axios.delete("/api/workout", {
        data: { id: exerciseToRemove.id },
      });
      setExercises((prevExercises) =>
        prevExercises.filter((exercise) => exercise !== exerciseToRemove)
      );
      toast({
        title: "Success",
        description: "Exercise removed successfully",
      });
    } catch (error) {
      console.error("Error removing exercise:", error);
      toast({
        title: "Error",
        description: "Failed to remove exercise. Please try again.",
        variant: "destructive",
      });
    } finally {
      setRemovingExerciseId(null);
    }
  };

  const handleSubmit = async () => {
    if (exercises.length === 0) {
      toast({
        title: "No Exercises",
        description: "Please add at least one exercise before saving.",
        variant: "destructive",
      });
      return;
    }

    setIsSaving(true);
    try {
      const exercisesWithValidDates = exercises.map((exercise) => ({
        ...exercise,
        date: exercise.date instanceof Date ? exercise.date : new Date(),
      }));

      const response = await axios.post("/api/workout", {
        exercises: exercisesWithValidDates,
      });

      if (response.data.success) {
        toast({
          title: "Success",
          description: "Your workout has been logged successfully!",
        });
        fetchTodaysWorkouts();
      } else {
        toast({
          title: "Error",
          description: "Failed to save workout. Please try again.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error saving workout:", error);
      toast({
        title: "Error",
        description: "An error occurred while saving the workout.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
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
      <main className="container mx-auto py-8 px-6">
        <Back />
        <h2 className="text-3xl font-bold mb-6">{`Log Today's Workout`}</h2>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Exercises</CardTitle>
              </CardHeader>
              <CardContent>
                <Dialog open={isOpen} onOpenChange={setIsOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="w-full mb-6">
                      <Plus className="w-5 h-5 mr-2" />
                      Add Exercise
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                      <DialogTitle>Add Exercise</DialogTitle>
                      <DialogDescription>
                        Enter the details of the exercise you want to add.
                      </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="bodyPart" className="text-right">
                          Body Part
                        </Label>
                        <Select
                          onValueChange={(value: string) =>
                            setSelectedBodyPart(value)
                          }
                          value={selectedBodyPart}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select body part" />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.keys(exerciseList).map((bodyPart) => (
                              <SelectItem key={bodyPart} value={bodyPart}>
                                {bodyPart.charAt(0).toUpperCase() +
                                  bodyPart.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="exercise" className="text-right">
                          Exercise
                        </Label>
                        <Select
                          onValueChange={(value: string) =>
                            handleExerciseChange("exercise", value)
                          }
                          value={newExercise.exercise}
                        >
                          <SelectTrigger className="col-span-3">
                            <SelectValue placeholder="Select exercise" />
                          </SelectTrigger>
                          <SelectContent>
                            {selectedBodyPart &&
                              exerciseList[
                                selectedBodyPart as keyof typeof exerciseList
                              ].map((exercise) => (
                                <SelectItem key={exercise} value={exercise}>
                                  {exercise}
                                </SelectItem>
                              ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="sets" className="text-right">
                          Sets
                        </Label>
                        <Input
                          id="sets"
                          type="number"
                          value={newExercise.sets || ""}
                          onChange={(e) =>
                            handleExerciseChange("sets", Number(e.target.value))
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="reps" className="text-right">
                          Reps
                        </Label>
                        <Input
                          id="reps"
                          type="number"
                          value={newExercise.reps || ""}
                          onChange={(e) =>
                            handleExerciseChange("reps", Number(e.target.value))
                          }
                          className="col-span-3"
                        />
                      </div>
                      <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="weight" className="text-right">
                          Weight (kg)
                        </Label>
                        <Input
                          id="weight"
                          type="number"
                          value={newExercise.weight || ""}
                          onChange={(e) =>
                            handleExerciseChange(
                              "weight",
                              Number(e.target.value)
                            )
                          }
                          className="col-span-3"
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button
                        onClick={addExercise}
                        disabled={!newExercise.exercise}
                      >
                        Add Exercise
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
                {exercises.length === 0 ? (
                  <p className="text-center text-gray-500">
                    No exercises added yet. Start logging your workout now!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {exercises.map((exercise) => (
                      <ExerciseCard
                        key={exercise.id || exercise.exercise}
                        exercise={exercise}
                        onRemove={() => removeExercise(exercise)}
                        isRemoving={removingExerciseId === exercise.id}
                      />
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          <div>
            <Card>
              <CardHeader>
                <CardTitle>Workout Summary</CardTitle>
              </CardHeader>
              <CardContent>
                {exercises.length > 0 ? (
                  <div className="space-y-4">
                    <p>Total Exercises: {exercises.length}</p>
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
                        "Save Workout"
                      )}
                    </Button>
                  </div>
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    No exercises logged yet. Add exercises to see your workout
                    summary.
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

export default LogWorkout;
