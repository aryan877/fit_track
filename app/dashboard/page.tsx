"use client";

import React from "react";
import { Activity, FileText, SaladIcon, Target } from "lucide-react";
import { BentoGrid, BentoCard } from "@/components/magicui/bento-grid";

const features = [
  {
    Icon: Activity,
    name: "Log Workout",
    description: "Track your workouts",
    href: "/log-workout",
    cta: "Log Workout",
    className: "col-span-1 sm:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-500 opacity-40 rounded-lg flex items-center justify-center"></div>
    ),
  },
  {
    Icon: SaladIcon,
    name: "Log Diet",
    description: "Track your nutrition intake",
    href: "/log-diet",
    cta: "Log Diet",
    className: "col-span-1 sm:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-teal-500 opacity-40 rounded-lg flex items-center justify-center"></div>
    ),
  },
  {
    Icon: Target,
    name: "Set Goals",
    description: "Set your daily calorie goals",
    href: "/set-goals",
    cta: "Set Goals",
    className: "col-span-1 sm:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-r from-yellow-500 to-orange-500 opacity-40 rounded-lg flex items-center justify-center"></div>
    ),
  },
  {
    Icon: FileText,
    name: "Track Record",
    description: "View your past track record",
    href: "/track-record",
    cta: "View Track Record",
    className: "col-span-1 sm:col-span-1",
    background: (
      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-pink-500 opacity-40 rounded-lg flex items-center justify-center"></div>
    ),
  },
];

export default function Dashboard() {
  return (
    <div className="container mx-auto p-4">
      <h1 className="text-4xl font-bold mb-8 text-center sm:text-left">
        Dashboard
      </h1>
      <div className="flex flex-col gap-32">
        <BentoGrid className="grid-cols-1 sm:grid-cols-2 gap-8">
          {features.map((feature, idx) => (
            <BentoCard
              key={idx}
              name={feature.name}
              description={feature.description}
              className={feature.className}
              Icon={feature.Icon}
              href={feature.href}
              cta={feature.cta}
              background={feature.background}
            />
          ))}
        </BentoGrid>
      </div>
    </div>
  );
}
