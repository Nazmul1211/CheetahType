"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { 
  ArrowLeft, 
  ChevronRight,
  Keyboard,
  LineChart,
  Target,
  Clock,
  Brain,
  HandMetal,
  Flame
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function GuidesPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className={`min-h-[calc(100vh-4rem)] ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="container mx-auto max-w-5xl px-4 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Button variant="ghost" size="sm" asChild className="flex items-center mb-2">
            <Link href="/support">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Support
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Typing Guides
          </h1>
          <p className={`text-lg mb-6 ${isDark ? 'text-slate-300' : 'text-slate-700'}`}>
            Master the art of touch typing with our comprehensive guides and techniques to improve your speed and accuracy.
          </p>
        </div>

        <Tabs defaultValue="beginners" className="mb-8">
          <TabsList className="mb-6">
            <TabsTrigger value="beginners">Beginners</TabsTrigger>
            <TabsTrigger value="intermediate">Intermediate</TabsTrigger>
            <TabsTrigger value="advanced">Advanced</TabsTrigger>
            <TabsTrigger value="ergonomics">Ergonomics</TabsTrigger>
          </TabsList>
          
          <TabsContent value="beginners">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                Getting Started with Touch Typing
              </h2>
              <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
                <CardContent className="pt-6">
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Keyboard className="inline-block mr-2 h-5 w-5" /> Basic Finger Placement
                  </h3>
                  <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    The foundation of touch typing is proper finger placement on the home row:
                  </p>
                  <ul className={`list-disc pl-5 space-y-3 mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <li>
                      <strong>Left hand:</strong> Place your fingers on A (pinky), S (ring finger), D (middle finger), and F (index finger)
                    </li>
                    <li>
                      <strong>Right hand:</strong> Place your fingers on J (index finger), K (middle finger), L (ring finger), and ; (pinky)
                    </li>
                    <li>
                      <strong>Thumbs:</strong> Rest lightly on the space bar
                    </li>
                  </ul>
                  <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    From this position, your fingers should reach up to the number row and down to the bottom row in consistent patterns. The F and J keys typically have small bumps or ridges to help you find the home position without looking.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mb-6">
              <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
                <CardContent className="pt-6">
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Target className="inline-block mr-2 h-5 w-5" /> Beginner Practice Tips
                  </h3>
                  <div className={`mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <ol className="list-decimal pl-5 space-y-3">
                      <li>
                        <strong>Start slow, focus on accuracy:</strong> Typing quickly with many mistakes is counterproductive. Build muscle memory by practicing accurately, even if slowly at first.
                      </li>
                      <li>
                        <strong>Don't look at your keyboard:</strong> Cover your hands with a cloth or use a keyboard cover if necessary to break the habit of looking down.
                      </li>
                      <li>
                        <strong>Practice regularly:</strong> Daily practice of just 15-20 minutes is better than occasional longer sessions.
                      </li>
                      <li>
                        <strong>Use proper posture:</strong> Sit up straight with your feet flat on the floor. Position your keyboard so your forearms are parallel to the floor.
                      </li>
                      <li>
                        <strong>Focus on problem keys:</strong> Pay attention to which keys you struggle with and practice those specifically.
                      </li>
                    </ol>
                  </div>
                  <div className={`p-4 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Beginner's Practice Plan</h4>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      Start with 15 minutes daily on CheetahType's Time mode (30 seconds). Focus on hitting the correct keys, not speed. Once you can type without looking at the keyboard, gradually increase your practice time and challenge yourself with longer tests.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="intermediate">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                Beyond the Basics
              </h2>
              <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
                <CardContent className="pt-6">
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Clock className="inline-block mr-2 h-5 w-5" /> Improving Speed
                  </h3>
                  <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Once you've mastered the basics of touch typing, focus on these techniques to increase your speed:
                  </p>
                  <ul className={`list-disc pl-5 space-y-3 mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <li>
                      <strong>Rhythm and consistency:</strong> Develop a steady typing rhythm rather than bursts of speed followed by pauses.
                    </li>
                    <li>
                      <strong>Practice common word patterns:</strong> The most common words in English (the, and, of, to, etc.) should become automatic.
                    </li>
                    <li>
                      <strong>Use proper fingering for numbers and symbols:</strong> Many intermediate typists still hunt for special characters; practice them deliberately.
                    </li>
                    <li>
                      <strong>Analyze your results:</strong> Use CheetahType's analytics to identify which keys or combinations slow you down.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="mb-6">
              <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
                <CardContent className="pt-6">
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Brain className="inline-block mr-2 h-5 w-5" /> Mental Techniques
                  </h3>
                  <div className={`mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <p className="mb-4">
                      Your mental approach significantly impacts typing speed. Try these psychological strategies:
                    </p>
                    <ul className="list-disc pl-5 space-y-3">
                      <li>
                        <strong>Look ahead:</strong> Train yourself to read 2-3 words ahead of what you're currently typing.
                      </li>
                      <li>
                        <strong>Chunking:</strong> Process words or common phrases as single units rather than individual letters.
                      </li>
                      <li>
                        <strong>Flow state:</strong> Practice entering a focused state where typing feels automatic and effortless.
                      </li>
                      <li>
                        <strong>Positive mindset:</strong> Instead of getting frustrated by mistakes, use them as learning opportunities.
                      </li>
                    </ul>
                  </div>
                  <div className={`p-4 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Intermediate Practice Plan</h4>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      Practice for 20-30 minutes daily with a mix of test types. Add punctuation tests to your routine and challenge yourself with varied content. Try to increase your WPM by 5% each week, but maintain at least 95% accuracy.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="advanced">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                For the Speed Demons
              </h2>
              <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
                <CardContent className="pt-6">
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Flame className="inline-block mr-2 h-5 w-5" /> Pushing Your Limits
                  </h3>
                  <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    For those already typing at 80+ WPM and looking to push further:
                  </p>
                  <ul className={`list-disc pl-5 space-y-3 mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <li>
                      <strong>Targeted drills:</strong> Create custom tests focusing on your specific weak points.
                    </li>
                    <li>
                      <strong>Alternative keyboard layouts:</strong> Consider learning Dvorak, Colemak, or another optimized layout for potential long-term speed benefits.
                    </li>
                    <li>
                      <strong>Interval training:</strong> Similar to athletic training, alternate between typing at maximum speed and more relaxed typing.
                    </li>
                    <li>
                      <strong>Competitive typing:</strong> Use CheetahType's multiplayer mode to challenge others, which can push you to new heights.
                    </li>
                  </ul>
                  <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    At advanced levels, small ergonomic optimizations and hardware choices can make meaningful differences. Experiment with keyboard types, switch mechanisms, and subtle technique adjustments.
                  </p>
                </CardContent>
              </Card>
            </div>
            
            <div className="mb-6">
              <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
                <CardContent className="pt-6">
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <LineChart className="inline-block mr-2 h-5 w-5" /> Breaking Plateaus
                  </h3>
                  <div className={`mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <p className="mb-4">
                      Most typists hit speed plateaus. Here's how to break through:
                    </p>
                    <ul className="list-disc pl-5 space-y-3">
                      <li>
                        <strong>Video record your hands:</strong> Watch for inefficient movements or tension that might be limiting your speed.
                      </li>
                      <li>
                        <strong>Focus on relaxation:</strong> Paradoxically, relaxed hands often type faster than tense ones striving for speed.
                      </li>
                      <li>
                        <strong>Change practice materials:</strong> If you've been practicing on similar content, try completely different text types.
                      </li>
                      <li>
                        <strong>Temporary speed bursts:</strong> Practice typing as fast as possible for 15 seconds, regardless of errors, to break mental barriers.
                      </li>
                    </ul>
                  </div>
                  <div className={`p-4 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Advanced Practice Plan</h4>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      Include specialized practice sessions: speed bursts (2 minutes), endurance sessions (5+ minutes), high-accuracy sessions (aim for 100%), and complex text with specialized punctuation and formatting. Analyze your performance data weekly and adjust your training.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          <TabsContent value="ergonomics">
            <div className="mb-6">
              <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-teal-400' : 'text-teal-600'}`}>
                Preventing Injury & Optimizing Comfort
              </h2>
              <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
                <CardContent className="pt-6">
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <HandMetal className="inline-block mr-2 h-5 w-5" /> Typing Ergonomics
                  </h3>
                  <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    Proper ergonomics prevents injury and allows for sustained typing:
                  </p>
                  <ul className={`list-disc pl-5 space-y-3 mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <li>
                      <strong>Wrist position:</strong> Keep wrists in a neutral position, not bent up, down, or to the sides.
                    </li>
                    <li>
                      <strong>Keyboard height:</strong> Adjust your chair and desk so your forearms are parallel to the floor.
                    </li>
                    <li>
                      <strong>Take breaks:</strong> Follow the 20-20-20 rule: every 20 minutes, look 20 feet away for 20 seconds.
                    </li>
                    <li>
                      <strong>Stretching:</strong> Do hand and wrist stretches before long typing sessions and during breaks.
                    </li>
                    <li>
                      <strong>Keyboard choice:</strong> Consider ergonomic or split keyboards if you experience discomfort.
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
            
            <div className="mb-6">
              <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
                <CardContent className="pt-6">
                  <h3 className={`text-lg font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                    <Keyboard className="inline-block mr-2 h-5 w-5" /> Equipment Recommendations
                  </h3>
                  <div className={`mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                    <p className="mb-4">
                      Your typing equipment can significantly impact your speed, accuracy, and comfort:
                    </p>
                    <ul className="list-disc pl-5 space-y-3">
                      <li>
                        <strong>Mechanical keyboards:</strong> Many professional typists prefer mechanical switches for their tactile feedback and durability.
                      </li>
                      <li>
                        <strong>Switch types:</strong> 
                        <ul className="list-disc pl-5 mt-2 space-y-1">
                          <li><strong>Linear switches:</strong> Smooth keypresses without tactile bumps, popular for gaming and fast typing</li>
                          <li><strong>Tactile switches:</strong> Provide feedback when a key is activated, helpful for accuracy</li>
                          <li><strong>Clicky switches:</strong> Offer both tactile and audible feedback, satisfying but louder</li>
                        </ul>
                      </li>
                      <li>
                        <strong>Wrist rests:</strong> Can help maintain proper wrist position but shouldn't be used to rest wrists while actively typing.
                      </li>
                      <li>
                        <strong>Monitor positioning:</strong> Place your monitor at eye level to maintain good neck posture while typing.
                      </li>
                    </ul>
                  </div>
                  <div className={`p-4 rounded-md ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                    <h4 className={`font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>Ergonomic Practice Plan</h4>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      Set a timer for breaks during long typing sessions. During breaks, do hand stretches and focus your eyes on distant objects. Pay attention to any discomfort and adjust your setup accordingly. Consider using CheetahType's Zen mode for practice sessions focused on comfortable, strain-free typing.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="flex justify-between items-center">
          <Button variant="outline" size="sm" asChild>
            <Link href="/docs/getting-started">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Documentation
            </Link>
          </Button>
          <Button variant="default" size="sm" asChild>
            <Link href="/support">
              Back to Support
              <ChevronRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}