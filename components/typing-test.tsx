"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  generateWords,
  calculateWPM,
  calculateAccuracy,
  calculateConsistency,
  formatTime,
  type TypingStats,
  type TestMode,
  type TimeOption,
  type WordsOption,
} from "@/lib/typing-test-utils";
import { TestControls } from "@/components/test-controls";
import { WordDisplay } from "@/components/word-display";
import { TestResults } from "@/components/test-results";
import { KeyboardDisplay } from "@/components/keyboard-display";
import { CommandLine } from "@/components/command-line";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock } from "lucide-react";
import { getFontFamilyClass, getFontSizeClass } from "@/lib/user-settings";
import { cn } from "@/lib/utils";
import { useTheme } from "next-themes";
import { useAuth } from "@/contexts/auth-context";
import { getAuth } from 'firebase/auth';
import { supabaseClient } from '@/utils/supabase/client';

const WPM_UPDATE_INTERVAL = 1000; // Update WPM every second
const TEXT_BUFFER_THRESHOLD = 0.7; // Generate more text when user has typed 70% of current text
const DEFAULT_TIME: TimeOption = 60; // Default time in seconds

// Helper function to detect mobile devices
const isMobileDevice = () => {
  if (typeof window !== 'undefined') {
    return window.innerWidth < 768;
  }
  return false;
};

interface TypingTestProps {
  initialTestMode?: TestMode;
  initialTimeOption?: TimeOption;
  initialWordsOption?: WordsOption;
  showKeyboard?: boolean;
  fontFamily?: "mono" | "sans" | "serif";
  fontSize?: "small" | "medium" | "large";
  caretStyle?: "block" | "underline" | "outline" | "straight" | "cursor";
  caretBlink?: boolean;
  soundEnabled?: boolean;
  customText?: string;
}

export function TypingTest({
  initialTestMode = "time",
  initialTimeOption = DEFAULT_TIME,
  initialWordsOption = 25,
  showKeyboard = true,
  fontFamily = "mono",
  fontSize = "medium",
  caretStyle = "cursor",
  caretBlink = false,
  soundEnabled = false,
  customText,
}: TypingTestProps) {
  // Test configuration
  const [testMode, setTestMode] = useState<TestMode>(initialTestMode);
  const [timeOption, setTimeOption] = useState<TimeOption>(initialTimeOption);
  const [wordsOption, setWordsOption] =
    useState<WordsOption>(initialWordsOption);

  // Test state
  const [text, setText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [startTime, setStartTime] = useState<number | null>(null);
  const [endTime, setEndTime] = useState<number | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [remainingTime, setRemainingTime] = useState<number>(initialTimeOption);
  const [isActive, setIsActive] = useState(false);
  const [isFinished, setIsFinished] = useState(false);
  const [stats, setStats] = useState<TypingStats | null>(null);
  const [currentKey, setCurrentKey] = useState<string | null>(null);
  const [wpmHistory, setWpmHistory] = useState<number[]>([]);
  const [errorHistory, setErrorHistory] = useState<number[]>([]); // Track errors per second
  const [commandLineOpen, setCommandLineOpen] = useState(false);
  
  // Character-level performance tracking
  const [characterPerformance, setCharacterPerformance] = useState<{[key: string]: {
    total_typed: number;
    correct_typed: number;
    incorrect_typed: number;
    total_time: number; // Total time spent on this character (ms)
    speeds: number[]; // Individual typing speeds for this character
  }}>({});
  const [lastKeystrokeTime, setLastKeystrokeTime] = useState<number>(Date.now());

  // Save character performance data to the API
  const saveCharacterPerformance = async (testId: string, firebase_uid: string) => {
    try {
      // Process character performance data for API
      const performanceData: {[key: string]: any} = {};
      
      Object.entries(characterPerformance).forEach(([char, data]) => {
        if (data.total_typed > 0) {
          const avgSpeed = data.speeds.length > 0 
            ? data.speeds.reduce((sum, speed) => sum + speed, 0) / data.speeds.length 
            : 0;
          
          performanceData[char] = {
            total_typed: data.total_typed,
            correct_typed: data.correct_typed,
            incorrect_typed: data.incorrect_typed,
            average_speed: avgSpeed,
            error_rate: data.total_typed > 0 ? (data.incorrect_typed / data.total_typed) * 100 : 0,
            difficulty_score: avgSpeed > 0 ? Math.max(0, 100 - avgSpeed) : 100, // Lower speed = higher difficulty
          };
        }
      });

      if (Object.keys(performanceData).length > 0) {
        const response = await fetch('/api/character-performance', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firebase_uid,
            test_id: testId,
            character_performance: performanceData
          })
        });

        const result = await response.json();
        if (!response.ok || !result?.success) {
          console.error('Failed to save character performance:', result);
        } else {
          console.log('Character performance saved successfully');
        }
      }
    } catch (error) {
      console.error('Error saving character performance:', error);
    }
  };

  // Detect mobile device for keyboard display
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wpmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTestRef = useRef<(() => void) | null>(null);

  // Initialize the test
  const initTest = useCallback(() => {
    // Generate more text initially to fill multiple lines
    let wordCount = 0;
    
    // For each test mode, ensure we generate enough text to fill 3 lines
    if (testMode === "words") {
      wordCount = Math.max(wordsOption, 100);
    } else if (testMode === "quote" || testMode === "custom") {
      wordCount = customText ? customText.split(" ").length : 150;
    } else {
      // For time, zen, punctuation, numbers modes
      wordCount = 200;
    }
    
    const newText = generateWords(wordCount, testMode, customText);
    setText(newText);
    setUserInput("");
    setStartTime(null);
    setEndTime(null);
    setElapsedTime(0);
    setRemainingTime(timeOption);
    setIsActive(false);
    setIsFinished(false);
    setStats(null);
    setWpmHistory([]);
    setErrorHistory([]);
    setCharacterPerformance({}); // Reset character tracking
    setLastKeystrokeTime(Date.now());

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
      wpmIntervalRef.current = null;
    }
  }, [testMode, wordsOption, timeOption, customText]);

  // Calculate current WPM and track errors
  const calculateCurrentWPM = useCallback(() => {
    if (!startTime || !isActive) return;

    const currentTime = Date.now();
    const timeElapsed = Math.max(1, (currentTime - startTime) / 1000);
    const correctChars = userInput
      .split("")
      .filter((char, i) => char === text[i]).length;
    const currentWPM = calculateWPM(correctChars, timeElapsed);

    // Count current errors
    const currentErrors = userInput
      .split("")
      .filter((char, i) => char !== text[i] && i < text.length).length;

    setWpmHistory((prev) => [...prev, currentWPM]);
    setErrorHistory((prev) => [...prev, currentErrors]);
  }, [startTime, isActive, userInput, text]);

  // End the test
  const endTest = useCallback(async () => {
    console.log("endTest called, isActive:", isActive);

    if (!isActive) return;

    setIsActive(false);
    setIsFinished(true);
    setEndTime(Date.now());

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
      wpmIntervalRef.current = null;
    }

    const correctChars = userInput
      .split("")
      .filter((char, i) => char === text[i]).length;
    const incorrectChars = userInput
      .split("")
      .filter((char, i) => char !== text[i]).length;
    const totalChars = userInput.length;
    
    // Always use actual elapsed time for accurate WPM calculation
    const actualElapsedTime = Math.max(elapsedTime, 1); // Ensure at least 1 second to avoid division by zero
    const timeInSeconds = actualElapsedTime;

    // Find positions where errors occurred
    const errors: number[] = [];
    let errorCount = 0;
    for (let i = 0; i < userInput.length; i++) {
      if (userInput[i] !== text[i]) {
        errorCount++;
        // Check if this is a new error (at a different position than the previous one)
        if (
          errorCount === 1 ||
          errors[errors.length - 1] !== Math.floor(i / 5)
        ) {
          errors.push(Math.floor(i / 5)); // Record error position (in 5-character "word" units)
        }
      }
    }

    // Calculate final stats
    const finalStats: TypingStats = {
      wpm: calculateWPM(correctChars, timeInSeconds),
      accuracy: calculateAccuracy(correctChars, totalChars),
      correctChars,
      incorrectChars,
      totalChars,
      elapsedTime: timeInSeconds,
      consistency: calculateConsistency(wpmHistory),
      wpmHistory,
      errorHistory,
      errors,
    };

    // Force immediate state update for the stats
    console.log("Setting stats:", finalStats);
    setStats(finalStats);

    // Save character performance data locally for dashboard analytics
    const authInstance = getAuth();
    const currentUser = authInstance.currentUser;
    if (currentUser && Object.keys(characterPerformance).length > 0) {
      try {
        await fetch('/api/character-performance/local', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            firebase_uid: currentUser.uid,
            character_performance: characterPerformance
          })
        });
        console.log('Character performance saved locally for dashboard');
      } catch (error) {
        console.error('Failed to save character performance locally:', error);
      }
    }
  }, [isActive, text, userInput, elapsedTime, wpmHistory, testMode, timeOption, characterPerformance]);

  // Update the endTestRef whenever endTest changes
  useEffect(() => {
    endTestRef.current = endTest;
  }, [endTest]);

  // Start the timer when user starts typing
  const startTimer = useCallback(() => {
    if (!isActive && !isFinished) {
      setIsActive(true);
      const now = Date.now();
      setStartTime(now);

      timerRef.current = setInterval(() => {
        const currentTime = Date.now();
        const start = startTime || now;
        const exactElapsedTime = (currentTime - start) / 1000; // Keep decimal precision
        const newElapsedTime = Math.floor(exactElapsedTime);
        const newRemainingTime = Math.max(0, timeOption - newElapsedTime);

        setElapsedTime(newElapsedTime);
        setRemainingTime(newRemainingTime);

        console.log(`Timer update: ${newRemainingTime}s remaining, exact: ${exactElapsedTime.toFixed(1)}s`);

        // For all modes: end test when exact time is reached (not rounded)
        if (exactElapsedTime >= timeOption) {
          console.log(`Timer reached target time (${exactElapsedTime.toFixed(1)}s >= ${timeOption}s), ending test`);
          // Set the final elapsed time to exactly the time option for accurate display
          setElapsedTime(timeOption);
          if (endTestRef.current) endTestRef.current();
        }
      }, 100); // More frequent updates for precise timing

      wpmIntervalRef.current = setInterval(
        calculateCurrentWPM,
        WPM_UPDATE_INTERVAL
      );
    }
  }, [isActive, isFinished, startTime, timeOption, calculateCurrentWPM]);

  // Handle user input
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const currentTime = Date.now();

    if (!isActive && !isFinished) {
      startTimer();
      setLastKeystrokeTime(currentTime);
    }

    // Track character-level performance for new characters
    if (value.length > userInput.length) {
      const newCharIndex = value.length - 1;
      const typedChar = value[newCharIndex];
      const expectedChar = text[newCharIndex];
      const timeSinceLastKeystroke = currentTime - lastKeystrokeTime;
      
      // Calculate speed for this character (characters per minute)
      const charSpeed = timeSinceLastKeystroke > 0 ? (60000 / timeSinceLastKeystroke) : 0;

      // Update character performance tracking
      setCharacterPerformance(prev => {
        const current = prev[expectedChar] || {
          total_typed: 0,
          correct_typed: 0,
          incorrect_typed: 0,
          total_time: 0,
          speeds: []
        };

        return {
          ...prev,
          [expectedChar]: {
            total_typed: current.total_typed + 1,
            correct_typed: current.correct_typed + (typedChar === expectedChar ? 1 : 0),
            incorrect_typed: current.incorrect_typed + (typedChar !== expectedChar ? 1 : 0),
            total_time: current.total_time + timeSinceLastKeystroke,
            speeds: [...current.speeds, charSpeed].slice(-10) // Keep last 10 speeds for this character
          }
        };
      });

      setLastKeystrokeTime(currentTime);
    }

    setUserInput(value);
    setCurrentKey(value.length > 0 ? value[value.length - 1] : null);

    // Play sound if enabled
    if (soundEnabled && value.length > userInput.length) {
      // TODO: Play typing sound
    }

    // Check if we've reached the end of a text line
    const currentPosition = value.length;

    // Line-by-line typing behavior
    // Look ahead for a suitable line break point, typically after a complete word
    if (
      testMode !== "quote" &&
      testMode !== "custom" &&
      currentPosition > 0 &&
      currentPosition % 80 >= 75
    ) {
      // Approaching end of a line (assuming ~80 chars per line)

      // Find the next space to complete the current word
      const nextSpace = text.indexOf(" ", currentPosition);

      if (nextSpace !== -1 && nextSpace < currentPosition + 20) {
        // Wait until user finishes current word
        if (currentPosition > nextSpace) {
          console.log("Adding new line of text");
          // Generate a complete new line of text
          const additionalText = generateWords(20, testMode); // Generate next line
          setText(text + " " + additionalText);
        }
      }
    }

    // End test conditions for word-based modes or when we reach the end of custom text
    if (
      (testMode === "words" || testMode === "quote" || testMode === "custom") &&
      value.length >= text.length
    ) {
      if (endTestRef.current) endTestRef.current();
    }
  };

  // Add a keydown handler to capture special keys
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Set the current key to the key that was pressed
    setCurrentKey(e.key);

    // For Backspace, we need to handle it specially since it doesn't show up in the input value
    if (e.key === "Backspace") {
      // Play sound if enabled
      if (soundEnabled) {
        // TODO: Play backspace sound
      }
    }
  };

  // Restart the test
  const restartTest = () => {
    // First, reset all state via initTest
    initTest();
    
    // Generate initial text immediately to ensure it's visible
    let wordCount = 0;
    
    // For each test mode, ensure we generate enough text to fill 3 lines
    if (testMode === "words") {
      wordCount = Math.max(wordsOption, 100);
    } else if (testMode === "quote" || testMode === "custom") {
      wordCount = customText ? customText.split(" ").length : 150;
    } else {
      // For time, zen, punctuation, numbers modes
      wordCount = 200;
    }
    
    const newText = generateWords(wordCount, testMode, customText);
    setText(newText);
    
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  // Handle test mode change
  const handleModeChange = (mode: TestMode) => {
    setTestMode(mode);
    restartTest();
  };

  // Handle time option change
  const handleTimeChange = (time: TimeOption) => {
    setTimeOption(time);
    setRemainingTime(time);
    restartTest();
  };

  // Handle words option change
  const handleWordsChange = (words: WordsOption) => {
    setWordsOption(words);
    restartTest();
  };

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    // Tab + Enter to restart test
    if (e.key === "Tab" && e.shiftKey) {
      e.preventDefault();
      restartTest();
    }

    // Escape to open command line
    if (e.key === "Escape") {
      e.preventDefault();
      setCommandLineOpen((prev) => !prev);
    }
  }, []);

  // Initialize on component mount
  useEffect(() => {
    initTest();

    // Add keyboard event listeners
    window.addEventListener("keydown", handleKeyDown);

    // Detect mobile devices on mount
    setIsMobile(isMobileDevice());

    const handleResize = () => {
      setIsMobile(isMobileDevice());
    };
    
    window.addEventListener('resize', handleResize);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (wpmIntervalRef.current) {
        clearInterval(wpmIntervalRef.current);
      }
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener('resize', handleResize);
    };
  }, [initTest, handleKeyDown]);

  // Focus input on mount and when test is restarted
  useEffect(() => {
    if (inputRef.current && !isFinished) {
      inputRef.current.focus();
    }
  }, [isFinished]);

  // Update when settings change
  useEffect(() => {
    setTestMode(initialTestMode);
    setTimeOption(initialTimeOption);
    setWordsOption(initialWordsOption);
    setRemainingTime(initialTimeOption);
    restartTest(); // Restart test when settings change
  }, [initialTestMode, initialTimeOption, initialWordsOption, customText]);

  // Automatically focus on input when clicking anywhere in the container
  const handleContainerClick = () => {
    if (inputRef.current && !isFinished) {
      inputRef.current.focus();
    }
  };

  // Get caret style class
  const getCaretStyleClass = () => {
    switch (caretStyle) {
      case "block":
        return "bg-primary/20";
      case "underline":
        return "border-b-2 border-primary";
      case "outline":
        return "border border-primary";
      default:
        return "bg-primary/20";
    }
  };

  // Add an effect to ensure test ends when time/words are completed
  useEffect(() => {
    // End the test when time runs out (for all modes)
    if (remainingTime === 0 && isActive) {
      console.log("useEffect detected time is up, ending test");
      if (endTestRef.current) endTestRef.current();
    }

    // End the test when word count is reached
    if (
      (testMode === "words" || testMode === "quote" || testMode === "custom") &&
      userInput.length >= text.length &&
      isActive
    ) {
      console.log("useEffect detected word count reached, ending test");
      if (endTestRef.current) endTestRef.current();
    }
  }, [testMode, remainingTime, userInput, text, isActive]);

  return (
    <div className="w-full flex flex-col items-center justify-center">
      <div
        className={` ${
          isFinished ? "hidden" : "block"
        } w-full flex justify-center my-2`}
      >
        <div className="w-full max-w-7xl">
          <div
            className={""}
            // `container py-[2px] max-w-7xl flex h-10 items-center text-center justify-between rounded-lg bg-slate-800/30 p-0.5 typing-options transition-all ${
            //   isFinished ? "opacity-0" : "opacity-100"
            // }`
          >
            <TestControls
              testMode={testMode}
              timeOption={timeOption}
              wordsOption={wordsOption}
              onModeChange={handleModeChange}
              onTimeChange={handleTimeChange}
              onWordsChange={handleWordsChange}
              disabled={isActive || isFinished}
              isPracticing={isActive && !isFinished}
            />
          </div>
        </div>
      </div>

      <div
        className={`${
          !isActive && !isFinished
            ? "opacity-0 h-24"
            : "opacity-100 transition-opacity duration-300"
        }`}
      >
        {isActive && !isFinished ? (
          <div className="h-24 w-full flex justify-center items-center">
            <div className="flex flex-col items-center justify-center">
              { !isActive ? <span>{timeOption}</span>
               : (
                <span
                className="text-3xl font-mono font-bold flex items-center"
                style={{ color: "var(--primary-color)" }}
              > 
                 <Clock className="mr-2 h-7 w-7" />
                {remainingTime}s
              </span>
              )}
            </div>
          </div>
        ) : (
          <span className="text-4xl font-bold align-middle text-slate-400"></span>
        )}
      </div>

      <div className="w-full">
        {!isFinished && (
          <div
            className="max-w-7xl mx-auto flex flex-col items-center text-center justify-start"
            onClick={handleContainerClick}
          >
            {/* Fixed height container for the typing area */}
            <div className="w-full flex flex-col">
              <WordDisplay
                text={text}
                userInput={userInput}
                fontFamily={fontFamily}
                fontSize={fontSize}
                caretStyle={caretStyle}
                caretBlink={caretBlink}
                maxLines={3}
              />
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={handleInput}
                onKeyDown={handleInputKeyDown}
                className="opacity-0 absolute left-0 top-0 max-w-7xl mx-auto cursor-default"
                autoCorrect="off"
                autoCapitalize="off"
                autoComplete="off"
                spellCheck="false"
                autoFocus
              />
            </div>
            
            {/* Fixed height container for the restart button */}
            <div className="h-16 flex items-center justify-center mt-4">
              {isActive && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    restartTest();
                  }}
                  className={`flex items-center gap-1 px-3 py-1.5 rounded-md transition-colors ${
                    isDark 
                      ? "bg-slate-800 hover:bg-slate-700 text-slate-200" 
                      : "bg-slate-200 hover:bg-slate-300 text-slate-700"
                  }`}
                  aria-label="Restart test"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span className="text-sm">Restart</span>
                </button>
              )}
            </div>
          </div>
        )}

        {isFinished && stats && (
          <div className="mt-4 w-full">
            <TestResults
              wpm={stats.wpm}
              rawWpm={stats.wpm * (100 / Math.max(stats.accuracy, 50))}
              accuracy={stats.accuracy}
              consistency={stats.consistency}
              characters={stats.totalChars}
              errors={stats.incorrectChars}
              duration={stats.elapsedTime}
              testType={testMode}
              testMode={testMode}
              timeSeconds={testMode === 'time' ? timeOption : undefined}
              textContent={text.substring(0, userInput.length)}
              wpmHistory={stats.wpmHistory}
              errorHistory={stats.errorHistory}
              onRestart={restartTest}
            />
          </div>
        )}

        {showKeyboard && !isMobile && !isFinished && (
          <div
            className={cn(
              "w-full mt-6 sticky bottom-0 left-0 right-0 z-10",
              isActive
                ? "opacity-100"
                : "opacity-60 hover:opacity-100 transition-opacity"
            )}
          >
            <KeyboardDisplay currentKey={currentKey} />
          </div>
        )}

        {/* Command line tools section - completely separate from keyboard */}
        <div className={cn(
          "flex flex-wrap justify-center gap-2 mt-4 mb-6 py-2 px-3 rounded-md max-w-xl mx-auto",
        )}>
          <div className="flex items-center text-sm">
            <kbd className={cn("px-2 py-0.5 rounded mx-1", isDark ? "bg-slate-700" : "bg-slate-300")}>shift</kbd>
            <span className="mx-1 text-slate-400">+</span>
            <kbd className={cn("px-2 py-0.5 rounded mx-1", isDark ? "bg-slate-700" : "bg-slate-300")}>tab</kbd>
            <span className="mx-2 text-slate-400">-</span>
            <span className="text-sm text-slate-400">restart test</span>
          </div>
          
          <div className="flex items-center text-sm">
            <kbd className={cn("px-2 py-0.5 rounded mx-1", isDark ? "bg-slate-700" : "bg-slate-300")}>esc</kbd>
            <span className="mx-2 text-slate-400">-</span>
            <span className="text-sm text-slate-400">command line</span>
          </div>
        </div>

        {commandLineOpen && (
          <CommandLine
            isOpen={commandLineOpen}
            onClose={() => setCommandLineOpen(false)}
            onChangeMode={handleModeChange}
            onChangeTime={handleTimeChange}
            onChangeWords={handleWordsChange}
            onRestart={restartTest}
          />
        )}
      </div>
    </div>
  );
}