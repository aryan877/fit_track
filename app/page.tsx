import Image from "next/image";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl">
          Welcome to Gym Fitness Tracker and Progress Visualization
        </h1>
        <p className="leading-7 [&:not(:first-child)]:mt-6">
          Track your workouts, nutrition, and progress with ease!
        </p>
        <div className="mt-8 flex justify-center space-x-4">
          <Button asChild>
            <Link href="/signup">Get Started</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/signin">Log In</Link>
          </Button>
        </div>
      </div>

      <div className="mt-24 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Track Workouts</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Easily log your workouts, including exercises, sets, reps, and
              weights.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Nutrition Tracking</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Track your nutrition intake and get accurate data using the Edamam
              Nutrition Analysis API.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Progress Visualization</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Visualize your progress with interactive charts and graphs powered
              by Chart.js.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Calories Burned</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Get an estimate of calories burned based on your logged exercises.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Historical Data</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              View your historical data for weight, nutrition intake, and
              workout progress.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Secure Authentication</CardTitle>
          </CardHeader>
          <CardContent>
            <p>
              Your data is protected with secure user authentication and profile
              management using Clerk.
            </p>
          </CardContent>
        </Card>
      </div>

      <footer className="mt-24 text-center text-muted-foreground">
        &copy; 2023 Gym Fitness Tracker and Progress Visualization. All rights
        reserved.
      </footer>
    </main>
  );
}
