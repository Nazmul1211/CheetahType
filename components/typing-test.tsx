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
  caretStyle?: "block" | "underline" | "outline";
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
  caretStyle = "block",
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
  const [commandLineOpen, setCommandLineOpen] = useState(false);

  // Detect mobile device for keyboard display
  const [isMobile, setIsMobile] = useState<boolean>(false);

  const inputRef = useRef<HTMLInputElement>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const wpmIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const endTestRef = useRef<(() => void) | null>(null);

  // Initialize the test
  const initTest = useCallback(() => {
    const wordCount = testMode === "words" ? wordsOption : 1000; // Generate a large amount of text
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

    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (wpmIntervalRef.current) {
      clearInterval(wpmIntervalRef.current);
      wpmIntervalRef.current = null;
    }
  }, [testMode, wordsOption, timeOption, customText]);

  // Calculate current WPM
  const calculateCurrentWPM = useCallback(() => {
    if (!startTime || !isActive) return;

    const currentTime = Date.now();
    const timeElapsed = Math.max(1, (currentTime - startTime) / 1000);
    const correctChars = userInput
      .split("")
      .filter((char, i) => char === text[i]).length;
    const currentWPM = calculateWPM(correctChars, timeElapsed);

    setWpmHistory((prev) => [...prev, currentWPM]);
  }, [startTime, isActive, userInput, text]);

  // End the test
  const endTest = useCallback(() => {
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
    const timeInSeconds = elapsedTime > 0 ? elapsedTime : 1;

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
      errors,
    };

    // Force immediate state update for the stats
    console.log("Setting stats:", finalStats);
    setStats(finalStats);
  }, [isActive, text, userInput, elapsedTime, wpmHistory]);

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
        const newElapsedTime = Math.floor((currentTime - start) / 1000);
        const newRemainingTime = Math.max(0, timeOption - newElapsedTime);

        setElapsedTime(newElapsedTime);
        setRemainingTime(newRemainingTime);

        console.log(`Timer update: ${newRemainingTime}s remaining`);

        // For all modes: end test when time runs out
        if (newRemainingTime === 0) {
          console.log("Timer reached zero, ending test");
          if (endTestRef.current) endTestRef.current();
        }
      }, 1000);

      wpmIntervalRef.current = setInterval(
        calculateCurrentWPM,
        WPM_UPDATE_INTERVAL
      );
    }
  }, [isActive, isFinished, startTime, timeOption, calculateCurrentWPM]);

  // Handle user input
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;

    if (!isActive && !isFinished) {
      startTimer();
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
    initTest();
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
            className={`container py-[2px] max-w-7xl flex h-10 items-center text-center justify-between rounded-lg bg-slate-800/30 p-0.5 typing-options transition-all ${
              isFinished ? "opacity-0" : "opacity-100"
            }`}
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
            className="max-w-7xl mx-auto mb-8 flex items-center justify-center relative"
            onClick={handleContainerClick}
          >
            <WordDisplay
              text={text}
              userInput={userInput}
              fontFamily={fontFamily}
              fontSize="large" // Always use large font
              caretStyleClass={getCaretStyleClass()}
              maxLines={3}
            />
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInput}
              onKeyDown={handleInputKeyDown}
              className="opacity-0 absolute left-0 top-0 h-full max-w-7xl mx-auto cursor-default"
              autoCorrect="off"
              autoCapitalize="off"
              autoComplete="off"
              spellCheck="false"
              autoFocus
            />
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
              onRestart={restartTest}
            />
          </div>
        )}

        {showKeyboard && !isMobile && !isFinished && (
          <div
            className={cn(
              "w-full mt-8 sticky bottom-0 left-0 right-0 z-10",
              isActive
                ? "opacity-100"
                : "opacity-60 hover:opacity-100 transition-opacity"
            )}
          >
            <KeyboardDisplay currentKey={currentKey} />
          </div>
        )}

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
