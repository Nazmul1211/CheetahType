"use client"

import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';

interface KeyboardDisplayProps {
  currentKey: string | null;
}

export function KeyboardDisplay({ currentKey }: KeyboardDisplayProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  const keyboardRows = [
    ['`', '1', '2', '3', '4', '5', '6', '7', '8', '9', '0', '-', '=', 'Backspace'],
    ['Tab', 'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p', '[', ']', '\\'],
    ['Caps', 'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l', ';', '\'', 'Enter'],
    ['ShiftLeft', 'z', 'x', 'c', 'v', 'b', 'n', 'm', ',', '.', '/', 'ShiftRight'],
    ['CtrlLeft', 'AltLeft', 'Space', 'AltRight', 'CtrlRight']
  ];

  const getKeyWidth = (key: string) => {
    switch (key) {
      case 'Backspace':
        return 'w-16';
      case 'Tab':
      case 'Caps':
      case '\\':
        return 'w-12';
      case 'ShiftLeft':
      case 'ShiftRight':
        return 'w-16';
      case 'Enter':
        return 'w-14';
      case 'Space':
        return 'w-40';
      case 'CtrlLeft':
      case 'CtrlRight':
      case 'AltLeft':
      case 'AltRight':
        return 'w-10';
      default:
        return 'w-8';
    }
  };

  const isActive = (key: string) => {
    if (!currentKey) return false;
    
    // Handle special keys
    if (key === 'Space' && currentKey === ' ') {
      return true;
    }
    
    // Handle Backspace key
    if (key === 'Backspace' && currentKey === 'Backspace') {
      return true;
    }
    
    // Handle other special keys
    if ((key === 'Enter' && currentKey === 'Enter') ||
        (key === 'Tab' && currentKey === 'Tab') ||
        ((key === 'ShiftLeft' || key === 'ShiftRight') && currentKey === 'Shift') ||
        ((key === 'CtrlLeft' || key === 'CtrlRight') && currentKey === 'Control') ||
        ((key === 'AltLeft' || key === 'AltRight') && currentKey === 'Alt')) {
      return true;
    }
    
    // Default case for regular characters
    return key.toLowerCase() === currentKey.toLowerCase();
  };

  const getKeyDisplay = (key: string) => {
    if (key === "Space") return "␣";
    if (key === "ShiftLeft" || key === "ShiftRight") return "Shift";
    if (key === "CtrlLeft" || key === "CtrlRight") return "Ctrl";
    if (key === "AltLeft" || key === "AltRight") return "Alt";
    return key;
  };

  return (
    <div className={cn(
      "max-w-xl flex mx-auto flex-col items-center justify-center gap-1 p-2 rounded-lg border", 
      isDark ? "bg-slate-800/50 border-slate-700/50" : "bg-slate-200/70 border-slate-300/50"
    )}>
      {keyboardRows.map((row, rowIndex) => (
        <div key={rowIndex} className="flex gap-1">
          {row.map((key) => (
            <div
              key={key}
              className={cn(
                "flex items-center justify-center rounded-md text-xs font-medium transition-colors h-8",
                getKeyWidth(key),
                isActive(key)
                  ? "bg-teal-500/90 text-white shadow-md" // Active key
                  : isDark 
                    ? "bg-slate-700/80 text-slate-300 hover:bg-slate-600/80" // Dark mode inactive key
                    : "bg-slate-300/80 text-slate-800 hover:bg-slate-400/80" // Light mode inactive key
              )}
            >
              {getKeyDisplay(key)}
            </div>
          ))}
        </div>
      ))}
    </div>
  );
}