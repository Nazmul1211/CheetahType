"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/contexts/auth-context";

export default function TestSavePage() {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState({
    wpm: 80,
    raw_wpm: 85,
    accuracy: 95,
    consistency: 90,
    errors: 5,
    duration_sec: 60,
    mode: "time-60"
  });
  const [isSaving, setIsSaving] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setTestResult(prev => ({
      ...prev,
      [name]: name === "mode" ? value : Number(value)
    }));
  };

  const handleSaveTest = async () => {
    if (!user) {
      setError("You must be logged in to save test results");
      return;
    }

    setIsSaving(true);
    setError(null);
    setResult(null);

    try {
      // In a real app, this would save to Firebase
      console.log("Saving test result:", {
        user_id: user.id,
        ...testResult,
        completed_at: new Date().toISOString()
      });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setResult({
        success: true,
        message: "Test result saved successfully!"
      });
    } catch (err) {
      console.error("Error saving test result:", err);
      setError("Failed to save test result");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-6">Test Result Saving</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Test Result</CardTitle>
            <CardDescription>Enter your typing test result details</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="wpm">WPM</Label>
                  <Input
                    id="wpm"
                    name="wpm"
                    type="number"
                    value={testResult.wpm}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="raw_wpm">Raw WPM</Label>
                  <Input
                    id="raw_wpm"
                    name="raw_wpm"
                    type="number"
                    value={testResult.raw_wpm}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accuracy">Accuracy (%)</Label>
                  <Input
                    id="accuracy"
                    name="accuracy"
                    type="number"
                    value={testResult.accuracy}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="consistency">Consistency (%)</Label>
                  <Input
                    id="consistency"
                    name="consistency"
                    type="number"
                    value={testResult.consistency}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="errors">Errors</Label>
                  <Input
                    id="errors"
                    name="errors"
                    type="number"
                    value={testResult.errors}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="duration_sec">Duration (sec)</Label>
                  <Input
                    id="duration_sec"
                    name="duration_sec"
                    type="number"
                    value={testResult.duration_sec}
                    onChange={handleInputChange}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="mode">Mode</Label>
                <Input
                  id="mode"
                  name="mode"
                  value={testResult.mode}
                  onChange={handleInputChange}
                  placeholder="e.g., time-60, words-50"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              onClick={handleSaveTest} 
              disabled={isSaving || !user}
              className="w-full"
            >
              {isSaving ? "Saving..." : "Save Test Result"}
            </Button>
          </CardFooter>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Status</CardTitle>
            <CardDescription>Result of the save operation</CardDescription>
          </CardHeader>
          <CardContent>
            {!user && (
              <div className="bg-yellow-100 border border-yellow-400 text-yellow-700 px-4 py-3 rounded mb-4">
                <p>You must be logged in to save test results.</p>
              </div>
            )}
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p>{error}</p>
              </div>
            )}
            
            {result && result.success && (
              <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                <p>{result.message}</p>
              </div>
            )}
            
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">Data to be saved:</h3>
              <pre className="bg-muted p-4 rounded-md overflow-auto text-sm">
                {JSON.stringify(
                  {
                    user_id: user?.id || "not logged in",
                    ...testResult,
                    completed_at: new Date().toISOString()
                  },
                  null,
                  2
                )}
              </pre>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
} 