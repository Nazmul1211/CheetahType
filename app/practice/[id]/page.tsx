"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/auth-context";
import { TypingTest } from "@/components/typing-test";

interface PracticeText {
  id: string;
  target_character: string;
  practice_text: string;
  difficulty_level: number;
  character_frequency: number;
  word_count: number;
  created_at: string;
}

export default function PracticeSessionPage() {
  const params = useParams();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [practiceText, setPracticeText] = useState<PracticeText | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTest, setShowTest] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && params.id) {
      fetchPracticeText(params.id as string);
    }
  }, [user, authLoading, params.id, router]);

  const fetchPracticeText = async (textId: string) => {
    try {
      const response = await fetch(`/api/practice-text?firebase_uid=${user?.uid}&limit=100`);
      const data = await response.json();
      
      if (data.success) {
        const text = data.data.find((t: PracticeText) => t.id === textId);
        if (text) {
          setPracticeText(text);
        } else {
          router.push('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error fetching practice text:', error);
      router.push('/dashboard');
    } finally {
      setLoading(false);
    }
  };

  const startPractice = () => {
    setShowTest(true);
  };

  const handleTestComplete = (stats: any) => {
    // Handle test completion - could save specific practice session data
    console.log('Practice session completed:', stats);
    
    // Navigate back to dashboard after a short delay
    setTimeout(() => {
      router.push('/dashboard');
    }, 3000);
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading practice session...</p>
        </div>
      </div>
    );
  }

  if (!practiceText) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Practice Text Not Found</h1>
          <Button onClick={() => router.push('/dashboard')}>
            Return to Dashboard
          </Button>
        </div>
      </div>
    );
  }

  if (showTest) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="mb-6">
            <Button 
              variant="outline" 
              onClick={() => setShowTest(false)}
              className="mb-4"
            >
              ← Back to Practice Setup
            </Button>
            
            <div className="flex items-center space-x-4 mb-4">
              <Badge variant="outline" className="font-mono text-lg px-3 py-1">
                {practiceText.target_character}
              </Badge>
              <Badge variant="secondary">
                Level {practiceText.difficulty_level}
              </Badge>
              <span className="text-sm text-muted-foreground">
                Focusing on '{practiceText.target_character}' ({practiceText.character_frequency.toFixed(1)}% frequency)
              </span>
            </div>
          </div>

          <TypingTest
            customText={practiceText.practice_text}
            initialTestMode="custom"
            initialTimeOption={60}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Button 
            variant="outline" 
            onClick={() => router.push('/dashboard')}
            className="mb-4"
          >
            ← Back to Dashboard
          </Button>
          
          <h1 className="text-4xl font-bold mb-2">Practice Session Setup</h1>
          <p className="text-muted-foreground">
            Focused practice for improving your typing performance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Practice Text Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Practice Text Preview</CardTitle>
                <div className="flex items-center space-x-2">
                  <Badge variant="outline" className="font-mono">
                    Target: {practiceText.target_character}
                  </Badge>
                  <Badge variant="secondary">
                    Level {practiceText.difficulty_level}
                  </Badge>
                  <span className="text-sm text-muted-foreground">
                    {practiceText.word_count} words
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-muted p-4 rounded-lg font-mono text-sm leading-relaxed mb-4">
                  {practiceText.practice_text}
                </div>
                
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Character frequency: {practiceText.character_frequency.toFixed(1)}%
                  </div>
                  <Button onClick={startPractice} size="lg">
                    Start Practice Session
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Session Info */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Session Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold mb-2">Target Character</h4>
                  <div className="flex items-center space-x-2">
                    <div className="h-12 w-12 bg-primary text-primary-foreground rounded-lg flex items-center justify-center font-mono font-bold text-lg">
                      {practiceText.target_character}
                    </div>
                    <div>
                      <p className="text-sm font-medium">'{practiceText.target_character.toUpperCase()}'</p>
                      <p className="text-xs text-muted-foreground">Focus character</p>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Difficulty Level</h4>
                  <div className="flex items-center space-x-2">
                    <Progress value={practiceText.difficulty_level * 20} className="flex-1" />
                    <span className="text-sm font-medium">{practiceText.difficulty_level}/5</span>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Text Statistics</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Word Count:</span>
                      <span className="font-medium">{practiceText.word_count}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Character Frequency:</span>
                      <span className="font-medium">{practiceText.character_frequency.toFixed(1)}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Estimated Time:</span>
                      <span className="font-medium">1-2 minutes</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Practice Tips</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3 text-sm">
                <div className="p-3 bg-blue-50 dark:bg-blue-950 rounded-lg">
                  <h5 className="font-semibold text-blue-700 dark:text-blue-300 mb-1">Focus on Accuracy</h5>
                  <p className="text-blue-600 dark:text-blue-400">
                    Prioritize correct keystrokes over speed. Muscle memory develops through repetition.
                  </p>
                </div>
                
                <div className="p-3 bg-green-50 dark:bg-green-950 rounded-lg">
                  <h5 className="font-semibold text-green-700 dark:text-green-300 mb-1">Proper Finger Placement</h5>
                  <p className="text-green-600 dark:text-green-400">
                    Ensure you're using the correct finger for '{practiceText.target_character}'. Check hand position.
                  </p>
                </div>
                
                <div className="p-3 bg-purple-50 dark:bg-purple-950 rounded-lg">
                  <h5 className="font-semibold text-purple-700 dark:text-purple-300 mb-1">Rhythm & Flow</h5>
                  <p className="text-purple-600 dark:text-purple-400">
                    Maintain steady rhythm. Don't rush - consistency beats speed.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
