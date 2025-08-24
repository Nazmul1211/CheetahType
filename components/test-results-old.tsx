"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getAuth } from "firebase/auth";
import { supabaseClient } from '@/utils/supabase/client';
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';

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
  timeSeconds?: number;
  wpmHistory?: number[];
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
  timeSeconds,
  wpmHistory = [],
  onRestart,
}: TestResultsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { theme } = useTheme();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle'); // Default to idle since no auto-save
  
  // Reset save status when test results change (new test)
  useEffect(() => {
    setSaveStatus('idle');
  }, [wpm, accuracy, characters, duration]);
  
  // Calculate correct characters and CPM
  const correctChars = Math.max(0, characters - errors);
  const cpm = Math.round((characters / Math.max(duration, 1)) * 60);
  
  // Calculate word-related statistics
  const totalWords = Math.max(1, Math.round(characters / 5)); // Average 5 characters per word
  const correctWords = Math.max(0, Math.round(correctChars / 5));
  const incorrectWords = Math.max(0, totalWords - correctWords);
  
  // Manual save result (prevent multiple saves)
  const saveResult = async () => {
    // Prevent multiple saves
    if (saveStatus === 'saving' || saveStatus === 'saved') {
      return;
    }

    setSaveStatus('saving');
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user) {
        toast({ title: "Sign in required", description: "Please sign in to save results.", variant: "destructive" });
        setSaveStatus('failed');
        return;
      }

      // Save the test result - fixed data format with proper validation
      const testData = {
        firebase_uid: user.uid,
        user_email: user.email,
        wpm: Math.max(0, Math.min(1000, Math.round(wpm))), // Ensure WPM is within valid range
        raw_wpm: Math.max(0, Math.min(1000, Math.round(rawWpm || wpm))), // Ensure raw WPM is within valid range
        accuracy: Math.max(0, Math.min(1, accuracy / 100)), // Convert percentage to decimal (0-1) and ensure valid range
        consistency: Math.max(0, Math.min(1, (consistency || 0) / 100)), // Convert percentage to decimal (0-1) and ensure valid range
        total_characters: Math.max(0, Math.round(characters)),
        correct_characters: Math.max(0, Math.round(correctChars)),
        incorrect_characters: Math.max(0, Math.round(errors)),
        total_words: totalWords, // Add required word field
        correct_words: correctWords, // Add required word field
        incorrect_words: incorrectWords, // Add required word field
        actual_duration: Math.max(1, Math.round(duration)), // Ensure duration is at least 1 second
        test_mode: testMode || 'time',
        time_limit: testMode === 'time' ? (timeSeconds ?? Math.round(duration)) : null,
        word_limit: testMode === 'words' ? Math.max(1, Math.round(characters / 5)) : null,
        language: 'english',
        text_content: textContent || null,
      };

      // Debug logging to help identify issues
      console.log('Saving test data:', testData);
      console.log('Original values - WPM:', wpm, 'Accuracy:', accuracy, 'Consistency:', consistency, 'Duration:', duration);

      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      const json = await res.json();
      
      if (!res.ok || !json?.success) {
        console.error('Save failed:', json);
        let errorMessage = json?.error || 'Failed to save';
        
        // Provide more specific error messages
        if (errorMessage.includes('numeric field overflow')) {
          errorMessage = 'Invalid data values detected. Please try again with a new test.';
        } else if (errorMessage.includes('Duplicate test result')) {
          errorMessage = 'This result was already saved. Please take a new test to save again.';
        }
        
        throw new Error(errorMessage);
      }

      console.log('Save successful:', json);
      setSaveStatus('saved');
      toast({ title: "Result Saved", description: "Your test result has been saved to your profile." });
      
    } catch (err: any) {
      console.error('Failed to save result', err);
      setSaveStatus('failed');
      toast({ 
        title: "Save failed", 
        description: err.message || 'Could not save result. Please try again.', 
        variant: "destructive" 
      });
    }
  };

  // Helper classes for dark mode
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Prepare chart data from WPM history
  const chartData = wpmHistory.map((wpm, index) => ({
    time: index + 1,
    wpm: Math.round(wpm),
    accuracy: accuracy, // Could be improved to track accuracy over time
  }));

  // Calculate additional stats
  const correctChars = characters - errors;
  const cpm = Math.round(wpm * 5); // Characters per minute
  const averageWpm = wpmHistory.length > 0 
    ? Math.round(wpmHistory.reduce((sum, w) => sum + w, 0) / wpmHistory.length)
    : Math.round(wpm);
  
  return (
    <div className="w-full max-w-6xl mx-auto space-y-6">
      {/* Main Stats Row - MonkeyType style */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="text-center">
          <div className={cn(
            "text-6xl font-bold mb-1",
            isDark ? "text-amber-400" : "text-amber-600"
          )}>
            {Math.round(wpm)}
          </div>
          <div className={cn(
            "text-sm font-medium",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            wpm
          </div>
        </div>
        
        <div className="text-center">
          <div className={cn(
            "text-6xl font-bold mb-1",
            isDark ? "text-blue-400" : "text-blue-600"
          )}>
            {accuracy.toFixed(1)}%
          </div>
          <div className={cn(
            "text-sm font-medium",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            acc
          </div>
        </div>
        
        <div className="text-center">
          <div className={cn(
            "text-6xl font-bold mb-1",
            isDark ? "text-green-400" : "text-green-600"
          )}>
            {consistency.toFixed(1)}%
          </div>
          <div className={cn(
            "text-sm font-medium",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            consistency
          </div>
        </div>
        
        <div className="text-center">
          <div className={cn(
            "text-6xl font-bold mb-1",
            isDark ? "text-purple-400" : "text-purple-600"
          )}>
            {Math.round(duration)}s
          </div>
          <div className={cn(
            "text-sm font-medium",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            time
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {chartData.length > 1 && (
        <Card className={cn(
          "border-0 shadow-sm",
          isDark ? "bg-gray-900/50" : "bg-gray-50/50"
        )}>
          <CardHeader>
            <CardTitle className={cn(
              "text-lg font-semibold",
              isDark ? "text-gray-200" : "text-gray-800"
            )}>
              WPM over time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                <defs>
                  <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={isDark ? "#fbbf24" : "#f59e0b"} stopOpacity={0.3}/>
                    <stop offset="95%" stopColor={isDark ? "#fbbf24" : "#f59e0b"} stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid 
                  strokeDasharray="3 3" 
                  stroke={isDark ? "#374151" : "#e5e7eb"}
                  opacity={0.5}
                />
                <XAxis 
                  dataKey="time" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                />
                <Tooltip 
                  contentStyle={{
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                    border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                    borderRadius: "8px",
                    boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                  }}
                  labelStyle={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
                />
                <Area
                  type="monotone"
                  dataKey="wpm"
                  stroke={isDark ? "#fbbf24" : "#f59e0b"}
                  strokeWidth={2}
                  fill="url(#wpmGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Detailed Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card className={cn(
          "border-0 shadow-sm p-4",
          isDark ? "bg-gray-900/30" : "bg-gray-50/30"
        )}>
          <div className={cn(
            "text-2xl font-bold mb-1",
            isDark ? "text-gray-200" : "text-gray-800"
          )}>
            {cpm}
          </div>
          <div className={cn(
            "text-xs",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            characters
          </div>
        </Card>
        
        <Card className={cn(
          "border-0 shadow-sm p-4",
          isDark ? "bg-gray-900/30" : "bg-gray-50/30"
        )}>
          <div className={cn(
            "text-2xl font-bold mb-1",
            isDark ? "text-gray-200" : "text-gray-800"
          )}>
            {correctChars}
          </div>
          <div className={cn(
            "text-xs",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            correct
          </div>
        </Card>
        
        <Card className={cn(
          "border-0 shadow-sm p-4",
          isDark ? "bg-gray-900/30" : "bg-gray-50/30"
        )}>
          <div className={cn(
            "text-2xl font-bold mb-1",
            isDark ? "text-gray-200" : "text-gray-800"
          )}>
            {errors}
          </div>
          <div className={cn(
            "text-xs",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            incorrect
          </div>
        </Card>

        <Card className={cn(
          "border-0 shadow-sm p-4",
          isDark ? "bg-gray-900/30" : "bg-gray-50/30"
        )}>
          <div className={cn(
            "text-2xl font-bold mb-1",
            isDark ? "text-gray-200" : "text-gray-800"
          )}>
            {averageWpm}
          </div>
          <div className={cn(
            "text-xs",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            avg wpm
          </div>
        </Card>

        <Card className={cn(
          "border-0 shadow-sm p-4",
          isDark ? "bg-gray-900/30" : "bg-gray-50/30"
        )}>
          <div className={cn(
            "text-2xl font-bold mb-1",
            isDark ? "text-gray-200" : "text-gray-800"
          )}>
            {Math.round(rawWpm)}
          </div>
          <div className={cn(
            "text-xs",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            raw wpm
          </div>
        </Card>

        <Card className={cn(
          "border-0 shadow-sm p-4",
          isDark ? "bg-gray-900/30" : "bg-gray-50/30"
        )}>
          <div className={cn(
            "text-2xl font-bold mb-1",
            isDark ? "text-gray-200" : "text-gray-800"
          )}>
            {testMode}
          </div>
          <div className={cn(
            "text-xs",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            test type
          </div>
        </Card>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap justify-center gap-3">
        <Button 
          onClick={() => { setSaveStatus('idle'); onRestart(); }} 
          variant="outline" 
          className={cn(
            "px-8 py-2 border-2 font-medium transition-colors",
            isDark 
              ? "border-gray-600 hover:border-amber-500 hover:text-amber-400" 
              : "border-gray-300 hover:border-amber-600 hover:text-amber-600"
          )}
        >
          next test
        </Button>
        
        <Button 
          onClick={saveResult} 
          disabled={saveStatus === 'saving' || saveStatus === 'saved'}
          variant={saveStatus === 'saved' ? 'outline' : 'default'}
          className={cn(
            "px-8 py-2 font-medium transition-colors",
            saveStatus === 'saved' 
              ? "bg-green-600 hover:bg-green-700" 
              : "bg-amber-600 hover:bg-amber-700"
          )}
        >
          {saveStatus === 'saving' && 'saving...'}
          {saveStatus === 'saved' && 'saved ✓'}
          {saveStatus === 'failed' && 'retry save'}
          {saveStatus === 'idle' && 'save result'}
        </Button>
        
        <Button 
          onClick={() => router.push('/profile')} 
          variant="outline"
          className={cn(
            "px-8 py-2 border-2 font-medium transition-colors",
            isDark 
              ? "border-gray-600 hover:border-blue-500 hover:text-blue-400" 
              : "border-gray-300 hover:border-blue-600 hover:text-blue-600"
          )}
        >
          view profile
        </Button>
      </div>
    </div>
  );
} 