"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/auth-context";
import { useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { characterPracticeTexts, getPracticeText } from "@/data/character-practice-texts";

interface CharacterPerformance {
  character: string;
  total_typed: number;
  accuracy: number;
  average_speed: number;
  error_rate: number;
  difficulty_score: number;
  weakness_score: number;
  mistakes_count: number;
  last_mistake_time: string;
}

interface PracticeText {
  id: string;
  target_character: string;
  practice_text: string;
  difficulty_level: number;
  character_frequency: number;
  created_at: string;
}

export default function TypingDashboard() {
  const [characterData, setCharacterData] = useState<CharacterPerformance[]>([]);
  const [practiceTexts, setPracticeTexts] = useState<PracticeText[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCharacter, setSelectedCharacter] = useState<string | null>(null);
  const [selectedDifficulty, setSelectedDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [generatingText, setGeneratingText] = useState(false);
  const [showAlert, setShowAlert] = useState(false);
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      fetchCharacterPerformance();
      generateInitialRecommendations();
    }
  }, [user, authLoading, router]);

  const fetchCharacterPerformance = async () => {
    try {
      const response = await fetch(`/api/character-performance/local?firebase_uid=${user?.uid}`);
      const data = await response.json();
      if (data.success && data.analytics) {
        // Process the analytics to get character-level data
        const processedData = data.analytics.map((char: any) => ({
          ...char,
          mistakes_count: Math.round(char.total_typed * (char.error_rate / 100)),
          last_mistake_time: new Date().toISOString()
        }));
        setCharacterData(processedData);
      } else {
        // If no data, create sample recommendations with all letters
        generateSampleRecommendations();
      }
    } catch (error) {
      console.error('Error fetching character performance:', error);
      generateSampleRecommendations();
    } finally {
      setLoading(false);
    }
  };

  const generateSampleRecommendations = () => {
    // Create sample data for all letters if no real data exists
    const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
    const sampleData = alphabet.map((char, index) => ({
      character: char,
      total_typed: Math.floor(Math.random() * 50) + 10,
      accuracy: Math.floor(Math.random() * 40) + 60, // 60-100%
      average_speed: Math.floor(Math.random() * 30) + 20, // 20-50 CPM
      error_rate: Math.floor(Math.random() * 25) + 5, // 5-30%
      difficulty_score: Math.floor(Math.random() * 50) + 25,
      weakness_score: Math.floor(Math.random() * 80) + 20,
      mistakes_count: Math.floor(Math.random() * 10) + 1,
      last_mistake_time: new Date().toISOString()
    }));
    
    // Sort by weakness score (highest first)
    sampleData.sort((a, b) => b.weakness_score - a.weakness_score);
    setCharacterData(sampleData);
  };

  const generateInitialRecommendations = () => {
    // Generate initial practice recommendations
    const commonMistakes = ['e', 't', 'a', 'o', 'i', 'n', 's', 'h', 'r'];
    const initialTexts = commonMistakes.map((char, index) => ({
      id: `initial-${char}-${Date.now()}`,
      target_character: char,
      practice_text: getPracticeText(char, 'medium'),
      difficulty_level: 2,
      character_frequency: Math.floor(Math.random() * 20) + 10,
      created_at: new Date().toISOString()
    }));
    setPracticeTexts(initialTexts);
  };

  const practiceCharacter = (character: string, difficulty: 'easy' | 'medium' | 'hard' = 'medium') => {
    setGeneratingText(true);
    setSelectedCharacter(character);
    setSelectedDifficulty(difficulty);
    
    try {
      // Get the practice text for this character
      const practiceText = getPracticeText(character, difficulty);
      
      // Create a new practice session
      const newPractice = {
        id: `practice-${character}-${Date.now()}`,
        target_character: character,
        practice_text: practiceText,
        difficulty_level: difficulty === 'easy' ? 1 : difficulty === 'medium' ? 2 : 3,
        character_frequency: (practiceText.match(new RegExp(character, 'gi')) || []).length,
        created_at: new Date().toISOString()
      };

      setPracticeTexts(prev => [newPractice, ...prev.slice(0, 19)]); // Keep last 20
      
      // Navigate to practice with custom text
      const practiceUrl = `/?mode=custom&text=${encodeURIComponent(practiceText)}&focus=${character}`;
      setShowAlert(true);
      
      setTimeout(() => {
        router.push(practiceUrl);
      }, 1500);
      
    } catch (error) {
      console.error('Error generating practice text:', error);
    } finally {
      setGeneratingText(false);
    }
  };

  const getDifficultyColor = (score: number) => {
    if (score >= 70) return "destructive";
    if (score >= 40) return "secondary";
    return "default";
  };

  const getPerformanceLevel = (accuracy: number, speed: number) => {
    if (accuracy >= 95 && speed >= 40) return { level: "Expert", color: "bg-green-500" };
    if (accuracy >= 90 && speed >= 30) return { level: "Advanced", color: "bg-blue-500" };
    if (accuracy >= 80 && speed >= 20) return { level: "Intermediate", color: "bg-yellow-500" };
    return { level: "Beginner", color: "bg-red-500" };
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading your typing analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {showAlert && (
          <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-900/20">
            <AlertDescription>
              🎯 Practice text generated for character '{selectedCharacter}' in {selectedDifficulty} mode! 
              Redirecting to typing test...
            </AlertDescription>
          </Alert>
        )}
        
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Character Improvement Dashboard</h1>
          <p className="text-muted-foreground">
            Track your weak characters and practice with targeted exercises to improve your typing speed and accuracy
          </p>
        </div>

        <Tabs defaultValue="weaknesses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="weaknesses">Weak Characters</TabsTrigger>
            <TabsTrigger value="alphabet">All Letters</TabsTrigger>
            <TabsTrigger value="practice">Practice History</TabsTrigger>
            <TabsTrigger value="recommendations">Tips</TabsTrigger>
          </TabsList>

          <TabsContent value="weaknesses" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Total Characters Tracked</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{characterData.length}</div>
                  <p className="text-sm text-muted-foreground">Characters with typing data</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>High Priority</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">
                    {characterData.filter(c => c.weakness_score > 60).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Characters needing urgent practice</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Practice Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{practiceTexts.length}</div>
                  <p className="text-sm text-muted-foreground">Custom texts generated</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Most Problematic Characters</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click any character to start a focused practice session
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 md:grid-cols-10 lg:grid-cols-13 gap-3">
                  {characterData.slice(0, 26).map((char) => {
                    const performance = getPerformanceLevel(char.accuracy, char.average_speed);
                    return (
                      <div key={char.character} className="relative group">
                        <Button
                          variant="outline"
                          className="h-16 w-16 p-0 relative hover:scale-105 transition-transform"
                          onClick={() => practiceCharacter(char.character, 'medium')}
                          disabled={generatingText}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-bold uppercase">{char.character}</span>
                            <div className={`absolute bottom-1 left-1 w-2 h-2 rounded-full ${performance.color}`}></div>
                          </div>
                        </Button>
                        <div className="absolute top-0 right-0 -mt-1 -mr-1">
                          <Badge variant={getDifficultyColor(char.weakness_score)} className="text-xs px-1">
                            {Math.round(char.weakness_score)}
                          </Badge>
                        </div>
                        
                        {/* Tooltip on hover */}
                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-xs rounded whitespace-nowrap z-10">
                          Accuracy: {char.accuracy.toFixed(1)}%<br/>
                          Speed: {char.average_speed.toFixed(1)} CPM<br/>
                          Mistakes: {char.mistakes_count}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6 flex gap-2 flex-wrap">
                  <h4 className="font-semibold mb-2 w-full">Quick Practice Modes:</h4>
                  {characterData.slice(0, 5).map((char) => (
                    <div key={char.character} className="flex gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => practiceCharacter(char.character, 'easy')}
                        disabled={generatingText}
                      >
                        {char.character.toUpperCase()} Easy
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => practiceCharacter(char.character, 'hard')}
                        disabled={generatingText}
                      >
                        {char.character.toUpperCase()} Hard
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
      console.error('Error generating practice text:', error);
    } finally {
      setGeneratingText(false);
    }
  };

  const getDifficultyColor = (score: number) => {
    if (score >= 70) return "destructive";
    if (score >= 40) return "secondary";
    return "default";
  };

  const getPerformanceLevel = (accuracy: number, speed: number) => {
    if (accuracy >= 95 && speed >= 40) return { level: "Expert", color: "bg-green-500" };
    if (accuracy >= 90 && speed >= 30) return { level: "Advanced", color: "bg-blue-500" };
    if (accuracy >= 80 && speed >= 20) return { level: "Intermediate", color: "bg-yellow-500" };
    return { level: "Beginner", color: "bg-red-500" };
  };

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
          <p className="mt-4 text-lg">Loading your typing analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">Typing Performance Dashboard</h1>
          <p className="text-muted-foreground">
            Analyze your typing performance and get personalized improvement recommendations
          </p>
        </div>

        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="characters">Character Analysis</TabsTrigger>
            <TabsTrigger value="practice">Practice Sessions</TabsTrigger>
            <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Characters Analyzed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{characterData.length}</div>
                  <p className="text-sm text-muted-foreground">Total characters with data</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Weakest Characters</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-destructive">
                    {characterData.filter(c => c.weakness_score > 50).length}
                  </div>
                  <p className="text-sm text-muted-foreground">Need immediate attention</p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Practice Sessions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold">{practiceTexts.length}</div>
                  <p className="text-sm text-muted-foreground">Custom texts generated</p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Priority Characters</CardTitle>
                <p className="text-sm text-muted-foreground">Characters that need the most practice</p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-5 lg:grid-cols-8 gap-3">
                  {characterData.slice(0, 16).map((char) => {
                    const performance = getPerformanceLevel(char.accuracy, char.average_speed);
                    return (
                      <Button
                        key={char.character}
                        variant="outline"
                        className="h-16 w-16 p-0 relative"
                        onClick={() => generatePracticeText(char.character)}
                        disabled={generatingText}
                      >
                        <div className="text-center">
                          <div className="text-lg font-mono font-bold">{char.character}</div>
                          <div className={`absolute -top-1 -right-1 w-3 h-3 rounded-full ${performance.color}`}></div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round(char.weakness_score)}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="characters" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Character Performance Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Detailed breakdown of your performance on each character
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {characterData.map((char) => {
                    const performance = getPerformanceLevel(char.accuracy, char.average_speed);
                    return (
                      <div key={char.character} className="flex items-center space-x-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0">
                          <Button
                            variant="outline"
                            className="h-12 w-12 text-lg font-mono font-bold"
                            onClick={() => generatePracticeText(char.character)}
                            disabled={generatingText}
                          >
                            {char.character}
                          </Button>
                        </div>
                        
                        <div className="flex-1 space-y-2">
                          <div className="flex items-center justify-between">
                            <h3 className="font-semibold">Character: {char.character.toUpperCase()}</h3>
                            <Badge variant={getDifficultyColor(char.weakness_score)}>
                              {performance.level}
                            </Badge>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-muted-foreground">Accuracy:</span>
                              <div className="font-medium">{char.accuracy.toFixed(1)}%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Speed:</span>
                              <div className="font-medium">{char.average_speed.toFixed(1)} CPM</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Error Rate:</span>
                              <div className="font-medium">{(char.error_rate * 100).toFixed(1)}%</div>
                            </div>
                            <div>
                              <span className="text-muted-foreground">Times Typed:</span>
                              <div className="font-medium">{char.total_typed}</div>
                            </div>
                          </div>
                          
                          <div className="space-y-1">
                            <div className="flex justify-between text-sm">
                              <span>Weakness Score</span>
                              <span>{char.weakness_score.toFixed(1)}</span>
                            </div>
                            <Progress value={Math.min(char.weakness_score, 100)} className="h-2" />
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {characterData.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      No character data available yet. Complete some typing tests to see your analysis!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Custom Practice Texts</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Personalized practice texts based on your weak points
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {practiceTexts.map((text) => (
                    <div key={text.id} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="font-mono">
                            {text.target_character}
                          </Badge>
                          <Badge variant="secondary">
                            Level {text.difficulty_level}
                          </Badge>
                          <span className="text-sm text-muted-foreground">
                            {text.character_frequency.toFixed(1)}% frequency
                          </span>
                        </div>
                        <Button 
                          size="sm"
                          onClick={() => router.push(`/practice/${text.id}`)}
                        >
                          Practice Now
                        </Button>
                      </div>
                      <p className="text-sm bg-muted p-3 rounded font-mono leading-relaxed">
                        {text.practice_text.substring(0, 150)}
                        {text.practice_text.length > 150 && '...'}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        Created {new Date(text.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
                
                {practiceTexts.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">
                      No practice texts generated yet. Click on characters above to create custom practice sessions!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Personalized Recommendations</CardTitle>
                <p className="text-sm text-muted-foreground">
                  AI-generated suggestions to improve your typing speed and accuracy
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {characterData.slice(0, 5).map((char, index) => (
                    <div key={char.character} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold">Priority #{index + 1}: Character '{char.character}'</h3>
                        <Badge variant={getDifficultyColor(char.weakness_score)}>
                          {char.weakness_score.toFixed(1)} weakness score
                        </Badge>
                      </div>
                      
                      <div className="space-y-2 text-sm">
                        {char.accuracy < 90 && (
                          <div className="flex items-start space-x-2">
                            <Badge variant="destructive" className="mt-0.5">Accuracy</Badge>
                            <p>Focus on accuracy first. Your accuracy is {char.accuracy.toFixed(1)}%. Slow down and ensure correct keystrokes before increasing speed.</p>
                          </div>
                        )}
                        
                        {char.error_rate > 0.1 && (
                          <div className="flex items-start space-x-2">
                            <Badge variant="destructive" className="mt-0.5">Errors</Badge>
                            <p>High error rate ({(char.error_rate * 100).toFixed(1)}%). Practice finger placement and review proper typing technique for this character.</p>
                          </div>
                        )}
                        
                        {char.average_speed < 30 && (
                          <div className="flex items-start space-x-2">
                            <Badge variant="secondary" className="mt-0.5">Speed</Badge>
                            <p>Increase speed gradually. Current: {char.average_speed.toFixed(1)} CPM. Target: 40+ CPM. Use dedicated practice sessions.</p>
                          </div>
                        )}
                        
                        <div className="flex items-start space-x-2">
                          <Badge variant="outline" className="mt-0.5">Practice</Badge>
                          <p>Generate custom practice text focusing on '{char.character}' combinations and common words.</p>
                        </div>
                      </div>
                      
                      <Button 
                        className="mt-3 w-full"
                        onClick={() => generatePracticeText(char.character, Math.min(char.difficulty_score + 1, 5))}
                        disabled={generatingText}
                      >
                        {generatingText ? 'Generating...' : `Start Focused Practice for '${char.character}'`}
                      </Button>
                    </div>
                  ))}
                </div>
                
                {characterData.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">
                      Complete some typing tests to receive personalized recommendations!
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
