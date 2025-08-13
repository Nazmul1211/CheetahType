'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getPracticeText } from '@/data/character-practice-texts';

interface CharacterData {
  character: string;
  accuracy: number;
  average_speed: number;
  total_typed: number;
  mistakes_count: number;
  error_rate: number;
  weakness_score: number;
  difficulty_score: number;
}

interface PracticeText {
  id: string;
  target_character: string;
  practice_text: string;
  difficulty_level: string;
  character_frequency: number;
  created_at: string;
}

type DifficultyLevel = 'easy' | 'medium' | 'hard';

export default function TypingDashboard() {
  const [characterData, setCharacterData] = useState<CharacterData[]>([]);
  const [practiceTexts, setPracticeTexts] = useState<PracticeText[]>([]);
  const [generatingText, setGeneratingText] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const router = useRouter();

  useEffect(() => {
    fetchCharacterData();
    fetchPracticeTexts();
  }, []);

  const fetchCharacterData = async () => {
    try {
      const response = await fetch('/api/stats/characters');
      if (response.ok) {
        const data = await response.json();
        setCharacterData(data.characters || []);
      }
    } catch (error) {
      console.error('Error fetching character data:', error);
    }
  };

  const fetchPracticeTexts = async () => {
    try {
      const response = await fetch('/api/practice/texts');
      if (response.ok) {
        const data = await response.json();
        setPracticeTexts(data.texts || []);
      }
    } catch (error) {
      console.error('Error fetching practice texts:', error);
    }
  };

  const practiceCharacter = async (character: string, difficulty: DifficultyLevel = 'medium') => {
    setGeneratingText(true);
    try {
      // Get practice text from our character-specific library
      const practiceText = getPracticeText(character, difficulty);
      
      // Save this practice session to database
      const practiceSession = {
        id: Date.now().toString(),
        target_character: character,
        practice_text: practiceText,
        difficulty_level: difficulty,
        character_frequency: (practiceText.toLowerCase().match(new RegExp(character, 'g')) || []).length,
        created_at: new Date().toISOString()
      };

      // Store practice session
      const existingTexts = JSON.parse(localStorage.getItem('practiceTexts') || '[]');
      existingTexts.unshift(practiceSession);
      localStorage.setItem('practiceTexts', JSON.stringify(existingTexts.slice(0, 20))); // Keep last 20
      
      // Update practice texts in component
      setPracticeTexts(existingTexts);
      
      // Navigate to typing test with custom text
      router.push(`/?custom_text=${encodeURIComponent(practiceText)}&focus_char=${character}`);
    } catch (error) {
      console.error('Error setting up practice session:', error);
    } finally {
      setGeneratingText(false);
    }
  };

  // Load practice texts from localStorage on component mount
  useEffect(() => {
    const storedTexts = JSON.parse(localStorage.getItem('practiceTexts') || '[]');
    setPracticeTexts(storedTexts);
  }, []);

  const getPerformanceLevel = (accuracy: number, speed: number) => {
    if (accuracy >= 95 && speed >= 40) return { level: 'Expert', color: 'bg-green-500' };
    if (accuracy >= 90 && speed >= 30) return { level: 'Advanced', color: 'bg-blue-500' };
    if (accuracy >= 85 && speed >= 20) return { level: 'Intermediate', color: 'bg-yellow-500' };
    return { level: 'Beginner', color: 'bg-red-500' };
  };

  const getDifficultyColor = (score: number): "default" | "secondary" | "destructive" | "outline" => {
    if (score > 70) return 'destructive';
    if (score > 40) return 'secondary';
    return 'outline';
  };

  const sortedCharacterData = [...characterData].sort((a, b) => b.weakness_score - a.weakness_score);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Complete Character Improvement System</h1>
        <p className="text-lg text-muted-foreground">
          Track character mistakes and practice with specialized texts designed to maximize specific letter usage
        </p>
      </div>

      <div className="mb-8">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="weaknesses">Top Weaknesses</TabsTrigger>
            <TabsTrigger value="alphabet">Full Alphabet</TabsTrigger>
            <TabsTrigger value="practice">Practice History</TabsTrigger>
            <TabsTrigger value="recommendations">Tips & Guide</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-6 md:grid-cols-4">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Characters Tracked</CardTitle>
                  <span className="text-2xl font-bold">{characterData.length}</span>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Letters with performance data
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Critical Weaknesses</CardTitle>
                  <span className="text-2xl font-bold text-destructive">
                    {characterData.filter(c => c.weakness_score > 60).length}
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Characters requiring immediate practice
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Practice Sessions</CardTitle>
                  <span className="text-2xl font-bold">{practiceTexts.length}</span>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Character-focused practice completed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average Accuracy</CardTitle>
                  <span className="text-2xl font-bold">
                    {characterData.length > 0 ? Math.round(characterData.reduce((acc, c) => acc + c.accuracy, 0) / characterData.length) : 0}%
                  </span>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground">
                    Overall character accuracy
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Quick Practice - Your Weakest Characters</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Click any character to start immediate practice with texts maximizing that letter's usage
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 md:grid-cols-10 gap-3">
                  {sortedCharacterData.slice(0, 20).map((char) => {
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
                        
                        {/* Tooltip */}
                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-xs rounded whitespace-nowrap z-10">
                          Accuracy: {char.accuracy.toFixed(1)}%<br/>
                          Speed: {char.average_speed.toFixed(1)} CPM<br/>
                          Mistakes: {char.mistakes_count}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {characterData.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No character data available yet</p>
                    <p className="text-sm text-muted-foreground">
                      Complete some typing tests to see your weakest characters here
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="weaknesses" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Character Weakness Analysis</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Detailed breakdown of your most problematic characters with targeted practice buttons
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sortedCharacterData.length === 0 ? (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground mb-4">No character data available yet</p>
                      <p className="text-sm text-muted-foreground">
                        Complete some typing tests to see detailed character analysis
                      </p>
                    </div>
                  ) : (
                    sortedCharacterData.slice(0, 15).map((char) => {
                      const performance = getPerformanceLevel(char.accuracy, char.average_speed);
                      return (
                        <div key={char.character} className="border rounded-lg p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-3xl font-bold uppercase bg-muted rounded-lg w-16 h-16 flex items-center justify-center">
                                {char.character}
                              </div>
                              <div>
                                <div className="font-medium text-lg">Character '{char.character.toUpperCase()}'</div>
                                <div className="text-sm text-muted-foreground">
                                  Typed {char.total_typed} times • {char.mistakes_count} mistakes
                                </div>
                                <Badge className={performance.color + ' text-white mt-1'}>{performance.level}</Badge>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => practiceCharacter(char.character, 'easy')}
                                disabled={generatingText}
                                className="bg-green-50 hover:bg-green-100"
                              >
                                🟢 Easy
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => practiceCharacter(char.character, 'medium')}
                                disabled={generatingText}
                                className="bg-yellow-50 hover:bg-yellow-100"
                              >
                                🟡 Medium
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => practiceCharacter(char.character, 'hard')}
                                disabled={generatingText}
                                className="bg-red-50 hover:bg-red-100"
                              >
                                🔴 Hard
                              </Button>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                            <div>
                              <div className="text-sm text-muted-foreground">Accuracy</div>
                              <div className="font-bold text-lg">{char.accuracy.toFixed(1)}%</div>
                              <Progress value={char.accuracy} className="mt-1" />
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Speed (CPM)</div>
                              <div className="font-bold text-lg">{char.average_speed.toFixed(1)}</div>
                              <Progress value={Math.min(100, (char.average_speed / 50) * 100)} className="mt-1" />
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Error Rate</div>
                              <div className="font-bold text-lg">{char.error_rate.toFixed(1)}%</div>
                              <Progress value={100 - char.error_rate} className="mt-1" />
                            </div>
                            <div>
                              <div className="text-sm text-muted-foreground">Weakness Score</div>
                              <div className="font-bold text-lg">{char.weakness_score.toFixed(1)}</div>
                              <Badge variant={getDifficultyColor(char.weakness_score)} className="mt-1">
                                {char.weakness_score > 70 ? 'Critical' : char.weakness_score > 40 ? 'Moderate' : 'Minor'}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alphabet" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Complete Alphabet Practice</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Practice any letter with specialized texts designed to maximize that character's usage
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 md:grid-cols-13 gap-3">
                  {'abcdefghijklmnopqrstuvwxyz'.split('').map((char) => {
                    const charData = characterData.find(c => c.character === char);
                    const performance = charData ? getPerformanceLevel(charData.accuracy, charData.average_speed) : { level: "New", color: "bg-gray-500" };
                    
                    return (
                      <div key={char} className="relative group">
                        <Button
                          variant="outline"
                          className="h-16 w-16 p-0 relative hover:scale-105 transition-transform"
                          onClick={() => practiceCharacter(char, 'medium')}
                          disabled={generatingText}
                        >
                          <div className="flex flex-col items-center">
                            <span className="text-xl font-bold uppercase">{char}</span>
                            <div className={`absolute bottom-1 left-1 w-2 h-2 rounded-full ${performance.color}`}></div>
                          </div>
                        </Button>
                        
                        {charData && (
                          <div className="absolute top-0 right-0 -mt-1 -mr-1">
                            <Badge variant={getDifficultyColor(charData.weakness_score)} className="text-xs px-1">
                              {Math.round(charData.weakness_score)}
                            </Badge>
                          </div>
                        )}
                        
                        {/* Tooltip */}
                        <div className="invisible group-hover:visible absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black text-white text-xs rounded whitespace-nowrap z-10">
                          {charData ? (
                            <>
                              Accuracy: {charData.accuracy.toFixed(1)}%<br/>
                              Speed: {charData.average_speed.toFixed(1)} CPM<br/>
                              Mistakes: {charData.mistakes_count}
                            </>
                          ) : (
                            'No data yet - click to practice!'
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                <div className="mt-6">
                  <h4 className="font-semibold mb-3">Difficulty Levels</h4>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant="outline"
                      onClick={() => {
                        const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
                        practiceCharacter(randomChar, 'easy');
                      }}
                      disabled={generatingText}
                      className="bg-green-50 hover:bg-green-100"
                    >
                      🟢 Easy Mode (Random Letter)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
                        practiceCharacter(randomChar, 'medium');
                      }}
                      disabled={generatingText}
                      className="bg-yellow-50 hover:bg-yellow-100"
                    >
                      🟡 Medium Mode (Random Letter)
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const randomChar = String.fromCharCode(97 + Math.floor(Math.random() * 26));
                        practiceCharacter(randomChar, 'hard');
                      }}
                      disabled={generatingText}
                      className="bg-red-50 hover:bg-red-100"
                    >
                      🔴 Hard Mode (Random Letter)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="practice" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Practice Session History</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Recent character-focused practice sessions
                </p>
              </CardHeader>
              <CardContent>
                {practiceTexts.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground mb-4">No practice sessions yet</p>
                    <Button onClick={() => practiceCharacter('e', 'medium')}>
                      Start Your First Practice Session
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {practiceTexts.slice(0, 10).map((practice) => (
                      <div key={practice.id} className="border rounded-lg p-4 hover:bg-muted/50">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <Badge variant="outline" className="text-lg px-3 py-1">
                              {practice.target_character.toUpperCase()}
                            </Badge>
                            <div>
                              <div className="font-medium">
                                Character '{practice.target_character}' Practice
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {practice.character_frequency} occurrences • Level {practice.difficulty_level}
                              </div>
                            </div>
                          </div>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => practiceCharacter(practice.target_character, 'medium')}
                          >
                            Practice Again
                          </Button>
                        </div>
                        <div className="text-sm text-muted-foreground bg-muted p-3 rounded max-h-20 overflow-hidden">
                          {practice.practice_text.substring(0, 200)}...
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recommendations" className="space-y-6">
            <div className="grid gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>🎯 Typing Improvement Tips</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Focus on Problem Characters</h4>
                    <p className="text-sm text-muted-foreground">
                      Characters with high weakness scores (red badges) need immediate attention. 
                      Practice these characters daily for 5-10 minutes.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Progressive Difficulty</h4>
                    <p className="text-sm text-muted-foreground">
                      Start with Easy mode for new characters, then progress to Medium and Hard modes 
                      as your accuracy improves above 90%.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Consistent Practice</h4>
                    <p className="text-sm text-muted-foreground">
                      Practice 15-20 minutes daily focusing on your weakest 3-5 characters. 
                      Consistency beats intensity for muscle memory development.
                    </p>
                  </div>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold">Proper Finger Positioning</h4>
                    <p className="text-sm text-muted-foreground">
                      Use the correct finger for each character. The color indicators show your 
                      performance level: Green (Expert), Blue (Advanced), Yellow (Intermediate), Red (Beginner).
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>📊 Understanding Your Metrics</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Badge variant="destructive">Weakness Score</Badge>
                      <p className="text-sm text-muted-foreground">
                        Higher scores indicate characters that need more practice. 
                        Focus on scores above 60.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Badge variant="secondary">Accuracy</Badge>
                      <p className="text-sm text-muted-foreground">
                        Percentage of correct keystrokes for each character. 
                        Aim for 95%+ accuracy.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Badge variant="outline">Speed (CPM)</Badge>
                      <p className="text-sm text-muted-foreground">
                        Characters per minute for each letter. 
                        40+ CPM is considered expert level.
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Badge variant="outline">Error Rate</Badge>
                      <p className="text-sm text-muted-foreground">
                        Percentage of mistakes for each character. 
                        Keep this below 5% for optimal performance.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
