"use client"

import { useState } from 'react';
import { 
  type TestMode, 
  type TimeOption, 
  type WordsOption 
} from '@/lib/typing-test-utils';
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import { Hash, Clock, Quote, Wand2, Infinity as InfinityIcon, Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

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
  const [customTimeDialogOpen, setCustomTimeDialogOpen] = useState(false);
  const [customWordsDialogOpen, setCustomWordsDialogOpen] = useState(false);
  const [tempCustomTime, setTempCustomTime] = useState<number>(60);
  const [tempCustomWords, setTempCustomWords] = useState<number>(25);
  const [currentModeForTime, setCurrentModeForTime] = useState<TestMode>('time');
  
  // Time components
  const [days, setDays] = useState(0);
  const [hours, setHours] = useState(0);
  const [minutes, setMinutes] = useState(0);
  const [seconds, setSeconds] = useState(30);
  
  const handleCustomTimeSubmit = () => {
    // Convert days, hours, minutes, seconds to total seconds
    const totalSeconds = (days * 24 * 60 * 60) + (hours * 60 * 60) + (minutes * 60) + seconds;
    
    // Ensure we have at least 1 second
    const finalTime = Math.max(1, totalSeconds) as TimeOption;
    onTimeChange(finalTime);
    setCustomTimeDialogOpen(false);
  };
  
  const handleCustomWordsSubmit = () => {
    // Ensure we have at least 1 word
    const finalWords = Math.max(1, tempCustomWords) as WordsOption;
    onWordsChange(finalWords);
    setCustomWordsDialogOpen(false);
  };
  
  const openCustomTimeDialog = (mode: TestMode = 'time') => {
    // Initialize the time components based on current timeOption
    const totalSeconds = typeof timeOption === 'number' ? timeOption : 60;
    const d = Math.floor(totalSeconds / (24 * 60 * 60));
    const h = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const m = Math.floor((totalSeconds % (60 * 60)) / 60);
    const s = totalSeconds % 60;
    
    setDays(d);
    setHours(h);
    setMinutes(m);
    setSeconds(s);
    setCurrentModeForTime(mode);
    
    setCustomTimeDialogOpen(true);
  };
  
  const openCustomWordsDialog = () => {
    setTempCustomWords(typeof wordsOption === 'number' ? wordsOption : 25);
    setCustomWordsDialogOpen(true);
  };

  // Show time options based on selected mode
  const showTimeOptions = (mode: TestMode) => (
    <div className="flex items-center gap-1 ml-1">
      {[15, 30, 60, 120].map((time) => (
        <button
          key={time}
          onClick={() => onTimeChange(time as TimeOption)}
          className={cn(
            "px-2 py-1 rounded-md transition-colors text-xs sm:text-sm flex items-center justify-center",
            timeOption === time 
              ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
              : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
          )}
          disabled={disabled}
        >
          {time}s
        </button>
      ))}
      <button
        onClick={() => openCustomTimeDialog(mode)}
        className={cn(
          "px-2 py-1 rounded-md transition-colors text-xs sm:text-sm flex items-center justify-center",
          ![15, 30, 60, 120].includes(Number(timeOption))
            ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
            : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
        )}
        disabled={disabled}
      >
        <Settings className="h-3 w-3 mr-1" />
        {![15, 30, 60, 120].includes(Number(timeOption)) 
          ? `${timeOption}s` 
          : "custom"
        }
      </button>
    </div>
  );
  
  return (
    <div className="w-full flex flex-col items-center">      
      <div className={`flex my-1 items-center text-center flex-wrap justify-center gap-1 text-[14px] xs:text-[12px] mb-1 py-1 px-1 rounded-md ${isDark ? 'bg-slate-800/50 border border-slate-700/70' : 'bg-slate-100/70 border border-slate-200/70'} shadow-sm`}>
        <div className="flex items-center gap-0.5 flex-wrap justify-center text-center">
          <button
            onClick={() => onModeChange('punctuation')}
            className={cn(
              "px-2 py-1 rounded-md flex items-center justify-center text-center gap-0.5 transition-colors text-xs sm:text-sm",
              testMode === 'punctuation' 
                ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            )}
            disabled={disabled}
          >
            <Hash className="flex items-center justify-center text-center h-3 w-3 sm:inline mr-1" />
            <span className="">punctuation</span>
          </button>
          
          <button
            onClick={() => onModeChange('numbers')}
            className={cn(
              "px-2 py-1 rounded-md flex items-center justify-center gap-0.5 transition-colors text-xs sm:text-sm",
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
              "px-2 py-1 rounded-md flex items-center justify-center gap-0.5 transition-colors text-xs sm:text-sm",
              testMode === 'time' 
                ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            )}
            disabled={disabled}
          >
            <Clock className="h-3 w-3 sm:inline mr-1" />
            <span>time</span>
          </button>
          
          <button
            onClick={() => onModeChange('words')}
            className={cn(
              "px-2 py-1 rounded-md flex items-center justify-center gap-0.5 transition-colors text-xs sm:text-sm",
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
              "px-2 py-1 rounded-md flex items-center justify-center gap-0.5 transition-colors text-xs sm:text-sm",
              testMode === 'quote' 
                ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            )}
            disabled={disabled}
          >
            <Quote className="h-3 w-3 sm:inline mr-1" />
            <span>quote</span>
          </button>
          
          <button
            onClick={() => onModeChange('zen')}
            className={cn(
              "px-2 py-1 rounded-md flex items-center justify-center gap-0.5 transition-colors text-xs sm:text-sm",
              testMode === 'zen' 
                ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            )}
            disabled={disabled}
          >
            <InfinityIcon className="h-3 w-3 sm:inline mr-1" />
            <span>zen</span>
          </button>
          
          <button
            onClick={() => onModeChange('custom')}
            className={cn(
              "px-2 py-1 rounded-md flex items-center justify-center gap-0.5 transition-colors text-xs sm:text-sm",
              testMode === 'custom' 
                ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
            )}
            disabled={disabled}
          >
            <Wand2 className="h-3 w-3 sm:inline mr-1" />
            <span>custom</span>
          </button>
        </div>
        
        {/* Time options */}
        {testMode === 'time' && showTimeOptions('time')}
        
        {/* Punctuation time options */}
        {testMode === 'punctuation' && showTimeOptions('punctuation')}
        
        {/* Numbers time options */}
        {testMode === 'numbers' && showTimeOptions('numbers')}
        
        {/* Quote time options */}
        {testMode === 'quote' && showTimeOptions('quote')}
        
        {/* Custom time options */}
        {testMode === 'custom' && showTimeOptions('custom')}
        
        {/* Zen time options */}
        {testMode === 'zen' && showTimeOptions('zen')}
        
        {/* Words options */}
        {testMode === 'words' && (
          <div className="flex items-center gap-1 ml-1">
            {[10, 25, 50, 100].map((count) => (
              <button
                key={count}
                onClick={() => onWordsChange(count as WordsOption)}
                className={cn(
                  "px-2 py-1 rounded-md transition-colors text-xs sm:text-sm flex items-center justify-center",
                  wordsOption === count 
                    ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                    : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
                )}
                disabled={disabled}
              >
                {count}
              </button>
            ))}
            <button
              onClick={openCustomWordsDialog}
              className={cn(
                "px-2 py-1 rounded-md transition-colors text-xs sm:text-sm flex items-center justify-center",
                ![10, 25, 50, 100].includes(Number(wordsOption))
                  ? isDark ? "bg-teal-900/50 text-teal-400" : "bg-teal-100 text-teal-700" 
                  : isDark ? "text-slate-400 hover:text-slate-200" : "text-slate-600 hover:text-slate-900"
              )}
              disabled={disabled}
            >
              <Settings className="h-3 w-3 mr-1" />
              {![10, 25, 50, 100].includes(Number(wordsOption)) 
                ? `${wordsOption}` 
                : "custom"
              }
            </button>
          </div>
        )}
      </div>
      
      {/* Custom Time Dialog */}
      <Dialog open={customTimeDialogOpen} onOpenChange={setCustomTimeDialogOpen} modal={true}>
        <DialogContent className={`sm:max-w-[400px] ${isDark ? 'bg-slate-800 text-slate-100' : ''}`}>
          <DialogHeader>
            <DialogTitle className="text-center">
              Custom Time for {currentModeForTime.charAt(0).toUpperCase() + currentModeForTime.slice(1)}
            </DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-x-4 gap-y-6 py-4">
            <div className="flex flex-col">
              <Label htmlFor="days" className="mb-2">Days</Label>
              <Input 
                id="days" 
                type="number"
                min="0"
                value={days}
                onChange={(e) => setDays(parseInt(e.target.value) || 0)}
                className={`text-center ${isDark ? 'bg-slate-700 border-slate-600' : ''}`}
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="hours" className="mb-2">Hours</Label>
              <Input 
                id="hours" 
                type="number"
                min="0"
                max="23"
                value={hours}
                onChange={(e) => setHours(parseInt(e.target.value) || 0)}
                className={`text-center ${isDark ? 'bg-slate-700 border-slate-600' : ''}`}
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="minutes" className="mb-2">Minutes</Label>
              <Input 
                id="minutes" 
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={(e) => setMinutes(parseInt(e.target.value) || 0)}
                className={`text-center ${isDark ? 'bg-slate-700 border-slate-600' : ''}`}
              />
            </div>
            <div className="flex flex-col">
              <Label htmlFor="seconds" className="mb-2">Seconds</Label>
              <Input 
                id="seconds" 
                type="number"
                min="0"
                max="59"
                value={seconds}
                onChange={(e) => setSeconds(parseInt(e.target.value) || 0)}
                className={`text-center ${isDark ? 'bg-slate-700 border-slate-600' : ''}`}
              />
            </div>
          </div>
          <div className="py-2">
            <p className={`text-sm text-center ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Total time: {days > 0 ? `${days}d ` : ''}{hours > 0 ? `${hours}h ` : ''}{minutes > 0 ? `${minutes}m ` : ''}{seconds}s
            </p>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleCustomTimeSubmit}
              className={`w-full ${isDark ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
            >
              Set Time
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Custom Words Dialog */}
      <Dialog open={customWordsDialogOpen} onOpenChange={setCustomWordsDialogOpen}>
        <DialogContent className={`sm:max-w-[400px] ${isDark ? 'bg-slate-800 text-slate-100' : ''}`}>
          <DialogHeader>
            <DialogTitle className="text-center">Custom Word Count</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-center block">Number of Words: {tempCustomWords}</Label>
                <Slider
                  min={1}
                  max={1000}
                  step={1}
                  value={[tempCustomWords]}
                  onValueChange={(value) => setTempCustomWords(value[0])}
                  className={isDark ? 'bg-slate-700' : ''}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Label htmlFor="customWordsInput" className="w-24">Custom Value:</Label>
                <Input
                  id="customWordsInput"
                  type="number"
                  min="1"
                  value={tempCustomWords}
                  onChange={(e) => setTempCustomWords(parseInt(e.target.value) || 1)}
                  className={isDark ? 'bg-slate-700 border-slate-600' : ''}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              type="submit" 
              onClick={handleCustomWordsSubmit}
              className={`w-full ${isDark ? 'bg-teal-600 hover:bg-teal-700' : ''}`}
            >
              Set Words
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}