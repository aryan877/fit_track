"use client";

import { useSignIn } from "@clerk/nextjs";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Eye, EyeOff } from "lucide-react";

const signInSchema = z.object({
  identifier: z.string().min(1, "Email/Username is required"),
  password: z.string().min(1, "Password is required"),
});

export default function LogInForm() {
  const router = useRouter();
  const { signIn, isLoaded, setActive } = useSignIn();
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });
  const [errors, setErrors] = useState({
    identifier: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const validationResult = signInSchema.safeParse(formData);

    if (!validationResult.success) {
      const validationErrors = validationResult.error.flatten().fieldErrors;
      setErrors({
        identifier: validationErrors.identifier?.[0] || "",
        password: validationErrors.password?.[0] || "",
      });
      return;
    }

    if (!isLoaded) return;

    try {
      const completeSignIn = await signIn.create({
        identifier: formData.identifier,
        password: formData.password,
      });

      if (completeSignIn.status === "complete") {
        await setActive({ session: completeSignIn.createdSessionId });
        router.push("/dashboard");
      } else {
        console.error("Sign-in incomplete:", completeSignIn.status);
        alert("Sign-in incomplete. Please try again.");
      }
    } catch (error) {
      console.error("Sign-in error:", error);
      alert(`Sign-in error: ${error}`);
    }
  };

  return (
    <div className="flex justify-center items-center bg-base-200">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome Back to FitTrack</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sign in to access and manage your fitness data
          </p>
          <form onSubmit={onSubmit} className="space-y-4 py-4">
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="identifier">Email/Username</Label>
              <Input
                id="identifier"
                type="text"
                name="identifier"
                value={formData.identifier}
                onChange={handleChange}
                className={errors.identifier ? "input-error" : ""}
              />
              {errors.identifier && (
                <p className="text-sm text-red-500">{errors.identifier}</p>
              )}
            </div>
            <div className="grid w-full items-center gap-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className={errors.password ? "input-error pr-10" : "pr-10"}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-primary"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {errors.password && (
                <p className="text-sm text-red-500">{errors.password}</p>
              )}
            </div>
            <Button type="submit">Sign In</Button>
          </form>
          <div className="text-center">
            <p className="text-sm">
              Not a member yet?{" "}
              <Link href="/signup" className="underline">
                Sign up
              </Link>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
