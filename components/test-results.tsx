"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getAuth } from "firebase/auth";
import { supabaseClient } from '@/utils/supabase/client';
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
  timeSeconds?: number;
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
        <Button onClick={() => { setSaveStatus('idle'); onRestart(); }} variant="outline" className="w-full sm:w-auto">
          Restart Test
        </Button>
        <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
          <Button 
            onClick={saveResult} 
            className="w-full sm:w-auto"
            disabled={saveStatus === 'saving' || saveStatus === 'saved'}
            variant={saveStatus === 'saved' ? 'outline' : 'default'}
          >
            {saveStatus === 'saving' && 'Saving...'}
            {saveStatus === 'saved' && 'Saved ✓'}
            {saveStatus === 'failed' && 'Retry Save'}
            {saveStatus === 'idle' && 'Save Result'}
          </Button>
          <Button onClick={() => router.push('/dashboard')} variant="outline" className="w-full sm:w-auto">
            View Dashboard
          </Button>
          <Button onClick={() => router.push('/profile')} variant="outline" className="w-full sm:w-auto">
            View Profile
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
} 