"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getAuth } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

interface TestResultsProps {
  wpm: number;
  rawWpm?: number;
  accuracy: number;
  consistency?: number;
  characters: number;
  errors: number;
  duration: number;
  textContent?: string;
  testType?: string;
  testMode?: string;
  onRestart: () => void;
}

export function TestResults({
  wpm,
  rawWpm = 0,
  accuracy,
  consistency = 0,
  characters,
  errors,
  duration,
  textContent,
  testType = "standard",
  testMode = "time",
  onRestart,
}: TestResultsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { theme } = useTheme();
  
  // Calculate correct characters and CPM
  const correctChars = Math.max(0, characters - errors);
  const cpm = Math.round((characters / Math.max(duration, 1)) * 60);
  
  // Save result to user profile
  const saveResult = () => {
    // This would typically save to a database
    toast({
      title: "Result Saved",
      description: "Your test result has been saved to your profile.",
    });
  };

  // Helper classes for dark mode
  const darkModeText = theme === 'dark' ? 'text-white' : '';
  const darkModeSubText = theme === 'dark' ? 'text-gray-300' : '';
  const darkModeCard = theme === 'dark' ? 'bg-zinc-900' : 'bg-card';
  const darkModeInnerCard = theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-card';
  
  return (
    <Card className={`w-full max-w-3xl mx-auto ${darkModeCard}`}>
      <CardHeader className={`${darkModeCard} rounded-t-lg`}>
        <CardTitle className={`text-3xl font-bold ${darkModeText}`}>Test Results</CardTitle>
        <CardDescription className={darkModeSubText}>Your typing performance</CardDescription>
      </CardHeader>
      <CardContent className={`grid grid-cols-2 md:grid-cols-3 gap-4 ${darkModeCard}`}>
        <div className={`flex flex-col items-center p-4 border rounded-lg ${darkModeInnerCard}`}>
          <span className={`text-sm text-muted-foreground ${darkModeSubText}`}>WPM</span>
          <span className={`text-4xl font-bold ${darkModeText}`}>{Math.round(wpm)}</span>
        </div>
        <div className={`flex flex-col items-center p-4 border rounded-lg ${darkModeInnerCard}`}>
          <span className={`text-sm text-muted-foreground ${darkModeSubText}`}>CPM</span>
          <span className={`text-4xl font-bold ${darkModeText}`}>{cpm}</span>
        </div>
        <div className={`flex flex-col items-center p-4 border rounded-lg ${darkModeInnerCard}`}>
          <span className={`text-sm text-muted-foreground ${darkModeSubText}`}>Accuracy</span>
          <span className={`text-4xl font-bold ${darkModeText}`}>{accuracy.toFixed(1)}%</span>
        </div>
        <div className={`flex flex-col items-center p-4 border rounded-lg ${darkModeInnerCard}`}>
          <span className={`text-sm text-muted-foreground ${darkModeSubText}`}>Consistency</span>
          <span className={`text-4xl font-bold ${darkModeText}`}>{consistency.toFixed(1)}%</span>
        </div>
        <div className={`flex flex-col items-center p-4 border rounded-lg ${darkModeInnerCard}`}>
          <span className={`text-sm text-muted-foreground ${darkModeSubText}`}>Characters</span>
          <span className={`text-4xl font-bold ${darkModeText}`}>{characters}</span>
          <span className={`text-xs text-muted-foreground mt-1 ${darkModeSubText}`}>
            {correctChars} correct / {errors} errors
          </span>
        </div>
        <div className={`flex flex-col items-center p-4 border rounded-lg ${darkModeInnerCard}`}>
          <span className={`text-sm text-muted-foreground ${darkModeSubText}`}>Time</span>
          <span className={`text-4xl font-bold ${darkModeText}`}>{Math.round(duration)}s</span>
        </div>
      </CardContent>
      <CardFooter className={`flex flex-col sm:flex-row justify-between gap-4 ${darkModeCard} rounded-b-lg`}>
        <Button onClick={onRestart} variant="outline" className="w-full sm:w-auto">
          Restart Test
        </Button>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button onClick={saveResult} className="w-full sm:w-auto">
            Save Result
          </Button>
          <Button onClick={() => router.push('/profile')} className="w-full sm:w-auto">
            View Profile
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 