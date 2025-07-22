"use client"

import { useState, useRef, useEffect } from 'react';
import { type TestMode, type TimeOption, type WordsOption } from '@/lib/typing-test-utils';

interface CommandLineProps {
  isOpen: boolean;
  onClose: () => void;
  onChangeMode: (mode: TestMode) => void;
  onChangeTime: (time: TimeOption) => void;
  onChangeWords: (words: WordsOption) => void;
  onRestart: () => void;
}

export function CommandLine({
  isOpen,
  onClose,
  onChangeMode,
  onChangeTime,
  onChangeWords,
  onRestart
}: CommandLineProps) {
  const [command, setCommand] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);
  
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Escape') {
      onClose();
    }
    
    if (e.key === 'Enter') {
      executeCommand(command);
      setCommand('');
    }
  };
  
  const executeCommand = (cmd: string) => {
    const lowerCmd = cmd.toLowerCase().trim();
    
    // Test mode commands
    if (lowerCmd === 'time') {
      onChangeMode('time');
    } else if (lowerCmd === 'words') {
      onChangeMode('words');
    } else if (lowerCmd === 'quote') {
      onChangeMode('quote');
    } else if (lowerCmd === 'zen') {
      onChangeMode('zen');
    } else if (lowerCmd === 'punctuation') {
      onChangeMode('punctuation');
    } else if (lowerCmd === 'numbers') {
      onChangeMode('numbers');
    }
    
    // Time options
    if (lowerCmd === 'time 15') {
      onChangeTime(15);
    } else if (lowerCmd === 'time 30') {
      onChangeTime(30);
    } else if (lowerCmd === 'time 60') {
      onChangeTime(60);
    } else if (lowerCmd === 'time 120') {
      onChangeTime(120);
    }
    
    // Word options
    if (lowerCmd === 'words 10') {
      onChangeWords(10);
    } else if (lowerCmd === 'words 25') {
      onChangeWords(25);
    } else if (lowerCmd === 'words 50') {
      onChangeWords(50);
    } else if (lowerCmd === 'words 100') {
      onChangeWords(100);
    }
    
    // Other commands
    if (lowerCmd === 'restart' || lowerCmd === 'reset') {
      onRestart();
    }
    
    // Close command line after executing command
    onClose();
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed bottom-16 left-0 right-0 p-4 bg-card border-t border-border z-50">
      <div className="max-w-7xl mx-auto flex items-center gap-2">
        <span className="text-muted-foreground">:</span>
        <input 
          ref={inputRef}
          type="text" 
          className="flex-1 bg-transparent border-none outline-none"
          placeholder="Type a command (time, words, quote, zen, restart)..."
          value={command}
          onChange={(e) => setCommand(e.target.value)}
          onKeyDown={handleKeyDown}
          autoFocus
        />
      </div>
    </div>
  );
} 