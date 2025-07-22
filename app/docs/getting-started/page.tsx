"use client";

import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Keyboard, Mouse, Settings, Award, BarChart2, Users } from "lucide-react";

export default function GettingStartedPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <div className={`min-h-[calc(100vh-4rem)] ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col items-center justify-center mb-12">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Getting Started with CheetahType
          </h1>
          <p className={`text-xl max-w-3xl text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Your guide to improving your typing speed and accuracy
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="md:col-span-1">
            <div className={`sticky top-8 p-4 rounded-lg ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
              <h2 className={`text-lg font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Contents
              </h2>
              <nav className="space-y-1">
                <a 
                  href="#basics" 
                  className={`block px-3 py-2 rounded-md ${isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  The Basics
                </a>
                <a 
                  href="#interface" 
                  className={`block px-3 py-2 rounded-md ${isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Understanding the Interface
                </a>
                <a 
                  href="#settings" 
                  className={`block px-3 py-2 rounded-md ${isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Customizing Settings
                </a>
                <a 
                  href="#tracking" 
                  className={`block px-3 py-2 rounded-md ${isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Tracking Progress
                </a>
                <a 
                  href="#multiplayer" 
                  className={`block px-3 py-2 rounded-md ${isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Multiplayer Races
                </a>
                <a 
                  href="#tips" 
                  className={`block px-3 py-2 rounded-md ${isDark ? 'text-slate-300 hover:bg-slate-700 hover:text-white' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'}`}
                >
                  Tips & Techniques
                </a>
              </nav>
            </div>
          </div>

          <div className="md:col-span-3">
            <section id="basics" className="mb-16">
              <div className="flex items-center mb-6">
                <Keyboard className={`mr-3 h-8 w-8 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>The Basics</h2>
              </div>
              
              <div className={`p-6 rounded-lg mb-8 ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  What is CheetahType?
                </h3>
                <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  CheetahType is a modern typing test platform designed to help you improve your typing speed and accuracy. 
                  Whether you&apos;re a beginner looking to learn proper typing techniques or a professional aiming to 
                  increase your productivity, CheetahType provides the tools and metrics you need to track your progress.
                </p>
                <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                  Our platform offers various test modes, customizable settings, detailed statistics, and even multiplayer 
                  competitions to make your typing practice engaging and effective.
                </p>
              </div>

              <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Taking Your First Test
                </h3>
                <ol className={`list-decimal list-inside space-y-3 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li>
                    <span className="font-medium">Visit the homepage:</span> Navigate to the CheetahType homepage where 
                    you&apos;ll find the typing test interface.
                  </li>
                  <li>
                    <span className="font-medium">Start typing:</span> Once the test appears, simply start typing the text 
                    shown on the screen. The timer will begin automatically when you type the first character.
                  </li>
                  <li>
                    <span className="font-medium">Complete the test:</span> Continue typing until you&apos;ve completed all 
                    the text or until the time runs out (depending on your selected test mode).
                  </li>
                  <li>
                    <span className="font-medium">View your results:</span> After completing the test, you&apos;ll see your 
                    typing speed (WPM), accuracy, and other metrics.
                  </li>
                  <li>
                    <span className="font-medium">Practice regularly:</span> The key to improving your typing skills is 
                    consistent practice. Try to take at least a few tests each day.
                  </li>
                </ol>
              </div>
            </section>

            <section id="interface" className="mb-16">
              <div className="flex items-center mb-6">
                <Mouse className={`mr-3 h-8 w-8 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Understanding the Interface</h2>
              </div>
              
              <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                <Tabs defaultValue="test" className="w-full">
                  <TabsList className={`grid grid-cols-3 mb-6 ${isDark ? 'bg-slate-700' : ''}`}>
                    <TabsTrigger value="test" className={isDark ? 'data-[state=active]:bg-slate-800 data-[state=active]:text-white' : ''}>Test Area</TabsTrigger>
                    <TabsTrigger value="results" className={isDark ? 'data-[state=active]:bg-slate-800 data-[state=active]:text-white' : ''}>Results</TabsTrigger>
                    <TabsTrigger value="keyboard" className={isDark ? 'data-[state=active]:bg-slate-800 data-[state=active]:text-white' : ''}>Keyboard Display</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="test" className="space-y-4">
                    <h3 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Test Area
                    </h3>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      The test area is where you&apos;ll see the text you need to type. It consists of:
                    </p>
                    <ul className={`list-disc list-inside space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <li>
                        <span className="font-medium">Text display:</span> Shows the text you need to type, with color-coding 
                        to indicate correct (green), incorrect (red), and upcoming (gray) characters.
                      </li>
                      <li>
                        <span className="font-medium">Cursor/caret:</span> Indicates your current position in the text.
                      </li>
                      <li>
                        <span className="font-medium">Timer/counter:</span> Shows the remaining time or words, depending on 
                        your test mode.
                      </li>
                      <li>
                        <span className="font-medium">Live WPM indicator:</span> Displays your current typing speed in 
                        real-time as you type.
                      </li>
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="results" className="space-y-4">
                    <h3 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Results Screen
                    </h3>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      After completing a test, the results screen shows:
                    </p>
                    <ul className={`list-disc list-inside space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <li>
                        <span className="font-medium">WPM (Words Per Minute):</span> Your typing speed, calculated as the 
                        number of correct characters typed divided by 5, then divided by the time in minutes.
                      </li>
                      <li>
                        <span className="font-medium">Accuracy:</span> The percentage of characters typed correctly.
                      </li>
                      <li>
                        <span className="font-medium">Raw WPM:</span> Your typing speed without accounting for errors.
                      </li>
                      <li>
                        <span className="font-medium">Character statistics:</span> Breakdown of correct, incorrect, and 
                        extra characters typed.
                      </li>
                      <li>
                        <span className="font-medium">Time analysis:</span> Information about your typing consistency and 
                        speed over time.
                      </li>
                    </ul>
                  </TabsContent>
                  
                  <TabsContent value="keyboard" className="space-y-4">
                    <h3 className={`text-xl font-medium ${isDark ? 'text-white' : 'text-slate-900'}`}>
                      Keyboard Display
                    </h3>
                    <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                      The optional keyboard display shows:
                    </p>
                    <ul className={`list-disc list-inside space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      <li>
                        <span className="font-medium">Virtual keyboard:</span> A visual representation of a standard keyboard.
                      </li>
                      <li>
                        <span className="font-medium">Key highlights:</span> Keys light up as you press them, helping you 
                        visualize your typing patterns.
                      </li>
                      <li>
                        <span className="font-medium">Error indicators:</span> Keys pressed incorrectly are highlighted 
                        differently to help you identify common mistakes.
                      </li>
                    </ul>
                    <p className={`mt-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                      You can toggle the keyboard display on or off in the settings menu according to your preference.
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
            </section>

            <section id="settings" className="mb-16">
              <div className="flex items-center mb-6">
                <Settings className={`mr-3 h-8 w-8 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Customizing Settings</h2>
              </div>
              
              <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Test Modes
                </h3>
                <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  CheetahType offers several test modes to suit different preferences:
                </p>
                <ul className={`list-disc list-inside space-y-2 mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li>
                    <span className="font-medium">Time mode:</span> Type as many words as you can within a set time limit 
                    (15, 30, 60, or 120 seconds).
                  </li>
                  <li>
                    <span className="font-medium">Words mode:</span> Type a specific number of words (10, 25, 50, or 100) 
                    as quickly as possible.
                  </li>
                  <li>
                    <span className="font-medium">Custom mode:</span> Type your own custom text that you&apos;ve provided.
                  </li>
                </ul>

                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Appearance Settings
                </h3>
                <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Customize the look and feel of your typing test:
                </p>
                <ul className={`list-disc list-inside space-y-2 mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li>
                    <span className="font-medium">Theme:</span> Choose between light and dark modes.
                  </li>
                  <li>
                    <span className="font-medium">Color palette:</span> Select from various color schemes.
                  </li>
                  <li>
                    <span className="font-medium">Font family:</span> Choose between monospace, sans-serif, or serif fonts.
                  </li>
                  <li>
                    <span className="font-medium">Font size:</span> Adjust the text size to your preference.
                  </li>
                  <li>
                    <span className="font-medium">Caret style:</span> Select from block, underline, or outline caret styles.
                  </li>
                </ul>

                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Behavior Settings
                </h3>
                <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Adjust how the typing test behaves:
                </p>
                <ul className={`list-disc list-inside space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li>
                    <span className="font-medium">Keyboard display:</span> Toggle the virtual keyboard on or off.
                  </li>
                  <li>
                    <span className="font-medium">Sound effects:</span> Enable or disable typing sounds.
                  </li>
                  <li>
                    <span className="font-medium">Punctuation:</span> Include or exclude punctuation marks in the test text.
                  </li>
                  <li>
                    <span className="font-medium">Numbers:</span> Include or exclude numbers in the test text.
                  </li>
                </ul>
              </div>
            </section>

            <section id="tracking" className="mb-16">
              <div className="flex items-center mb-6">
                <BarChart2 className={`mr-3 h-8 w-8 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Tracking Progress</h2>
              </div>
              
              <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Creating an Account
                </h3>
                <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  To track your progress over time, create a free account. This allows CheetahType to save your test 
                  results and provide insights into your improvement. Sign up using your email or connect with your 
                  Google account for a seamless experience.
                </p>

                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Profile and Statistics
                </h3>
                <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Your profile page contains:
                </p>
                <ul className={`list-disc list-inside space-y-2 mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li>
                    <span className="font-medium">Historical data:</span> View your past test results and track changes 
                    in your typing speed and accuracy over time.
                  </li>
                  <li>
                    <span className="font-medium">Progress graphs:</span> Visual representations of your improvement.
                  </li>
                  <li>
                    <span className="font-medium">Personal bests:</span> Records of your highest WPM, best accuracy, and 
                    longest streaks.
                  </li>
                  <li>
                    <span className="font-medium">Weak spots analysis:</span> Identification of characters and patterns 
                    that consistently cause you trouble.
                  </li>
                </ul>

                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Setting Goals
                </h3>
                <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                  Set personal typing goals to stay motivated. Whether you&apos;re aiming for a specific WPM target, 
                  trying to achieve perfect accuracy, or working on consistency, having clear goals can help structure 
                  your practice and make your improvement more tangible.
                </p>
              </div>
            </section>

            <section id="multiplayer" className="mb-16">
              <div className="flex items-center mb-6">
                <Users className={`mr-3 h-8 w-8 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Multiplayer Races</h2>
              </div>
              
              <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Racing with Friends
                </h3>
                <p className={`mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  CheetahType&apos;s multiplayer feature allows you to compete with friends or other typists in real-time. 
                  This adds a fun, competitive element to your typing practice and can help push you to improve faster.
                </p>

                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  How to Join a Race
                </h3>
                <ol className={`list-decimal list-inside space-y-3 mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li>
                    Navigate to the Multiplayer section from the main menu.
                  </li>
                  <li>
                    Choose to create a new lobby or join an existing one.
                  </li>
                  <li>
                    If creating a lobby, you&apos;ll receive a lobby ID that you can share with friends.
                  </li>
                  <li>
                    If joining a lobby, enter the lobby ID you received from the host.
                  </li>
                  <li>
                    Wait for all participants to join, then the host can start the race.
                  </li>
                  <li>
                    Race against your friends to see who can type the fastest and most accurately!
                  </li>
                </ol>

                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Leaderboards
                </h3>
                <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                  Check out the global leaderboards to see how you rank against the world&apos;s fastest typists. 
                  Leaderboards are updated regularly and can be filtered by test mode and time period.
                </p>
              </div>
            </section>

            <section id="tips" className="mb-16">
              <div className="flex items-center mb-6">
                <Award className={`mr-3 h-8 w-8 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-slate-900'}`}>Tips & Techniques</h2>
              </div>
              
              <div className={`p-6 rounded-lg ${isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white border border-slate-200'}`}>
                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Proper Typing Posture
                </h3>
                <ul className={`list-disc list-inside space-y-2 mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li>
                    Sit up straight with your feet flat on the floor.
                  </li>
                  <li>
                    Keep your elbows bent at a 90-degree angle.
                  </li>
                  <li>
                    Position your wrists slightly above the keyboard, not resting on the desk.
                  </li>
                  <li>
                    Maintain a relaxed posture to prevent strain during long typing sessions.
                  </li>
                </ul>

                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Finger Placement
                </h3>
                <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Proper finger placement is crucial for efficient typing:
                </p>
                <ul className={`list-disc list-inside space-y-2 mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li>
                    Place your left fingers on A, S, D, F and right fingers on J, K, L, ;
                  </li>
                  <li>
                    Your thumbs should rest on the space bar.
                  </li>
                  <li>
                    Feel the small bumps on the F and J keys with your index fingers to position your hands without looking.
                  </li>
                  <li>
                    Each finger is responsible for specific keys, minimizing hand movement.
                  </li>
                </ul>

                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Practice Strategies
                </h3>
                <ul className={`list-disc list-inside space-y-2 mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li>
                    <span className="font-medium">Focus on accuracy first:</span> Speed will come naturally as you build 
                    muscle memory for correct key locations.
                  </li>
                  <li>
                    <span className="font-medium">Practice regularly:</span> Short, daily practice sessions are more 
                    effective than occasional long sessions.
                  </li>
                  <li>
                    <span className="font-medium">Target your weaknesses:</span> Use the statistics to identify problem 
                    keys or patterns and practice them specifically.
                  </li>
                  <li>
                    <span className="font-medium">Gradually increase difficulty:</span> Start with simple tests and 
                    progressively add punctuation, numbers, and longer durations.
                  </li>
                  <li>
                    <span className="font-medium">Don&apos;t look at your hands:</span> Train yourself to type without looking 
                    down at the keyboard.
                  </li>
                </ul>

                <h3 className={`text-xl font-medium mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                  Common Mistakes to Avoid
                </h3>
                <ul className={`list-disc list-inside space-y-2 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <li>
                    <span className="font-medium">Hunching over the keyboard:</span> This causes strain and fatigue.
                  </li>
                  <li>
                    <span className="font-medium">Looking at the keyboard:</span> This slows you down and prevents building 
                    proper muscle memory.
                  </li>
                  <li>
                    <span className="font-medium">Using only a few fingers:</span> "Hunt and peck" typing severely limits 
                    your potential speed.
                  </li>
                  <li>
                    <span className="font-medium">Prioritizing speed over accuracy:</span> Making many errors actually 
                    slows you down in the long run.
                  </li>
                  <li>
                    <span className="font-medium">Inconsistent practice:</span> Regular practice is key to improvement.
                  </li>
                </ul>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  );
}
