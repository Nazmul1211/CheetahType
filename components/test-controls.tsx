"use client"

import { 
  type TestMode, 
  type TimeOption, 
  type WordsOption 
} from '@/lib/typing-test-utils';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Hash, Clock, Quote, Wand2, Infinity as InfinityIcon } from 'lucide-react';

interface TestControlsProps {
  testMode: TestMode;
  timeOption: TimeOption;
  wordsOption: WordsOption;
  onModeChange: (mode: TestMode) => void;
  onTimeChange: (time: TimeOption) => void;
  onWordsChange: (words: WordsOption) => void;
  disabled?: boolean;
  isPracticing?: boolean;
}

export function TestControls({
  testMode,
  timeOption,
  wordsOption,
  onModeChange,
  onTimeChange,
  onWordsChange,
  disabled = false,
  isPracticing = false
}: TestControlsProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  return (
    <div className="w-full flex flex-col items-center">      
      <div className={`flex my-1 items-center text-center flex-wrap justify-center gap-1 text-[14px] xs:text-[12px] mb-1 py-1 px-1 rounded-md ${isDark ? 'bg-slate-800/50' : 'bg-slate-100/70'}`}>
        <div className="flex items-center gap-0.5 flex-wrap justify-center">
          <button
            onClick={() => onModeChange('punctuation')}
            className={cn(
              "px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-colors text-xs sm:text-sm",
              testMode === 'punctuation' 
                ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            )}
            disabled={disabled}
          >
            <Hash className="h-3 w-3 hidden sm:inline" />
            <span>punctuation</span>
          </button>
          
          <button
            onClick={() => onModeChange('numbers')}
            className={cn(
              "px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-colors text-xs sm:text-sm",
              testMode === 'numbers' 
                ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            )}
            disabled={disabled}
          >
            <span>numbers</span>
          </button>
          
          <button
            onClick={() => onModeChange('time')}
            className={cn(
              "px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-colors text-xs sm:text-sm",
              testMode === 'time' 
                ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            )}
            disabled={disabled}
          >
            <Clock className="h-3 w-3 hidden sm:inline" />
            <span>time</span>
          </button>
          
          <button
            onClick={() => onModeChange('words')}
            className={cn(
              "px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-colors text-xs sm:text-sm",
              testMode === 'words' 
                ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            )}
            disabled={disabled}
          >
            <span>words</span>
          </button>
          
          <button
            onClick={() => onModeChange('quote')}
            className={cn(
              "px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-colors text-xs sm:text-sm",
              testMode === 'quote' 
                ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            )}
            disabled={disabled}
          >
            <Quote className="h-3 w-3 hidden sm:inline" />
            <span>quote</span>
          </button>
          
          <button
            onClick={() => onModeChange('zen')}
            className={cn(
              "px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-colors text-xs sm:text-sm",
              testMode === 'zen' 
                ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            )}
            disabled={disabled}
          >
            <InfinityIcon className="h-3 w-3 hidden sm:inline" />
            <span>zen</span>
          </button>
          
          <button
            onClick={() => onModeChange('custom')}
            className={cn(
              "px-1.5 py-0.5 rounded-md flex items-center gap-0.5 transition-colors text-xs sm:text-sm",
              testMode === 'custom' 
                ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            )}
            disabled={disabled}
          >
            <Wand2 className="h-3 w-3 hidden sm:inline" />
            <span>custom</span>
          </button>
        </div>
        
        {/* Time options */}
        {testMode === 'time' && (
          <div className="flex items-center gap-0.5 ml-1">
            {[15, 30, 60, 120].map((time) => (
              <button
                key={time}
                onClick={() => onTimeChange(time as TimeOption)}
                className={cn(
                  "px-1.5 py-0.5 rounded-md transition-colors text-xs sm:text-sm",
                  timeOption === time 
                    ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                    : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
                )}
                disabled={disabled}
              >
                {time}s
              </button>
            ))}
          </div>
        )}
        
        {/* Words options */}
        {testMode === 'words' && (
          <div className="flex items-center gap-0.5 ml-1">
            {[10, 25, 50, 100].map((count) => (
              <button
                key={count}
                onClick={() => onWordsChange(count as WordsOption)}
                className={cn(
                  "px-1.5 py-0.5 rounded-md transition-colors text-xs sm:text-sm",
                  wordsOption === count 
                    ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                    : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
                )}
                disabled={disabled}
              >
                {count}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}