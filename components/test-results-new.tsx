"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getAuth } from "firebase/auth";
import { supabaseClient } from '@/utils/supabase/client';
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

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
  testType = "standard",
  testMode = "time",
  wpmHistory = [],
  onRestart,
}: TestResultsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { theme } = useTheme();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  
  // Reset save status when test results change (new test)
  useEffect(() => {
    setSaveStatus('idle');
  }, [wpm, accuracy, characters, duration]);
  
  // Prepare chart data from WPM history
  const chartData = wpmHistory.map((wpmValue, index) => ({
    time: index + 1,
    wpm: Math.round(wpmValue),
  }));

  // Calculate additional stats
  const correctChars = characters - errors;
  const cpm = Math.round(wpm * 5); // Characters per minute
  const averageWpm = wpmHistory.length > 0 
    ? Math.round(wpmHistory.reduce((sum, w) => sum + w, 0) / wpmHistory.length)
    : Math.round(wpm);

  const isDark = theme === 'dark';

  const saveResult = async () => {
    if (saveStatus === 'saving' || saveStatus === 'saved') return;

    setSaveStatus('saving');
    
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        throw new Error('You must be logged in to save results.');
      }

      const testData = {
        firebase_uid: user.uid,
        wpm: Math.round(wpm * 100) / 100,
        accuracy: Math.round(accuracy * 100) / 100,
        consistency: Math.round(consistency * 100) / 100,
        duration: Math.round(duration),
        characters,
        errors,
        test_type: testMode,
        text_content: '',
        created_at: new Date().toISOString()
      };

      console.log('Saving test data:', testData);

      const res = await fetch('/api/tests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testData)
      });
      
      const json = await res.json();
      
      if (!res.ok || !json?.success) {
        console.error('Save failed:', json);
        let errorMessage = json?.error || 'Failed to save';
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

      {/* Chart Section - Simple SVG Chart */}
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
            <div className="w-full h-64 relative bg-transparent rounded-lg overflow-hidden">
              <svg className="w-full h-full" viewBox="0 0 400 200">
                {/* Grid lines */}
                <defs>
                  <pattern id="grid" width="40" height="20" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 20" fill="none" stroke={isDark ? "#374151" : "#e5e7eb"} strokeWidth="0.5" opacity="0.5"/>
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                
                {/* Chart line */}
                {chartData.length > 1 && (
                  <polyline
                    fill="none"
                    stroke={isDark ? "#fbbf24" : "#f59e0b"}
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    points={chartData.map((point, index) => {
                      const x = (index / (chartData.length - 1)) * 380 + 10;
                      const maxWpm = Math.max(...chartData.map(p => p.wpm));
                      const y = 190 - (point.wpm / Math.max(maxWpm, 1)) * 180;
                      return `${x},${y}`;
                    }).join(' ')}
                  />
                )}
                
                {/* Data points */}
                {chartData.map((point, index) => {
                  const x = (index / (chartData.length - 1)) * 380 + 10;
                  const maxWpm = Math.max(...chartData.map(p => p.wpm));
                  const y = 190 - (point.wpm / Math.max(maxWpm, 1)) * 180;
                  return (
                    <circle
                      key={index}
                      cx={x}
                      cy={y}
                      r="4"
                      fill={isDark ? "#fbbf24" : "#f59e0b"}
                      className="hover:r-6 transition-all"
                    />
                  );
                })}
              </svg>
              
              {/* Y-axis labels */}
              <div className="absolute left-0 top-0 h-full flex flex-col justify-between text-xs py-2">
                <span className={cn(isDark ? "text-gray-400" : "text-gray-600")}>
                  {Math.max(...chartData.map(p => p.wpm))}
                </span>
                <span className={cn(isDark ? "text-gray-400" : "text-gray-600")}>
                  {Math.round(Math.max(...chartData.map(p => p.wpm)) / 2)}
                </span>
                <span className={cn(isDark ? "text-gray-400" : "text-gray-600")}>0</span>
              </div>
            </div>
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
