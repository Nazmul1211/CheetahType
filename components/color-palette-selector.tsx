"use client"

import { useState, useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';
import { Palette, ChevronDown } from 'lucide-react';

// Define color palettes with their theme colors
const colorPalettes = [
  {
    id: 'teal',
    name: 'Teal',
    colors: { dark: ['#2DD4BF', '#A78BFA', '#F87171'], light: ['#14b8a6', '#8b5cf6', '#ef4444'] },
    bgDark: 'bg-slate-900',
    bgLight: 'bg-slate-50',
  },
  {
    id: 'blue',
    name: 'Blue',
    colors: { dark: ['#60A5FA', '#A78BFA', '#F87171'], light: ['#3b82f6', '#8b5cf6', '#ef4444'] },
    bgDark: 'bg-slate-900',
    bgLight: 'bg-slate-50',
  },
  {
    id: 'purple',
    name: 'Purple',
    colors: { dark: ['#A78BFA', '#2DD4BF', '#F87171'], light: ['#8b5cf6', '#14b8a6', '#ef4444'] },
    bgDark: 'bg-gray-900',
    bgLight: 'bg-gray-50',
  },
  {
    id: 'amber',
    name: 'Amber',
    colors: { dark: ['#F59E0B', '#A78BFA', '#2DD4BF'], light: ['#d97706', '#8b5cf6', '#14b8a6'] },
    bgDark: 'bg-zinc-900',
    bgLight: 'bg-zinc-50',
  },
  {
    id: 'rose',
    name: 'Rose',
    colors: { dark: ['#FB7185', '#60A5FA', '#2DD4BF'], light: ['#e11d48', '#3b82f6', '#14b8a6'] },
    bgDark: 'bg-slate-900',
    bgLight: 'bg-slate-50',
  },
  {
    id: 'green',
    name: 'Green',
    colors: { dark: ['#10B981', '#60A5FA', '#F87171'], light: ['#059669', '#3b82f6', '#ef4444'] },
    bgDark: 'bg-slate-900',
    bgLight: 'bg-slate-50',
  }
];

export function ColorPaletteSelector() {
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [activePalette, setActivePalette] = useState('teal');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Ensure component is mounted to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
    
    // Get stored palette from localStorage if it exists
    const storedPalette = localStorage.getItem('colorPalette');
    if (storedPalette) {
      setActivePalette(storedPalette);
    }

    // Close dropdown when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  if (!mounted) return null;
  
  const handlePaletteChange = (paletteId: string) => {
    setActivePalette(paletteId);
    localStorage.setItem('colorPalette', paletteId);
    
    // Close dropdown after selection
    setIsOpen(false);
  };

  const isDarkMode = theme === 'dark';
  const activePaletteObj = colorPalettes.find(p => p.id === activePalette) || colorPalettes[0];
  const activePaletteColors = isDarkMode ? activePaletteObj.colors.dark : activePaletteObj.colors.light;
  
  return (
    <div className="relative" ref={dropdownRef}>
      <button 
        className={`${isDarkMode ? 'bg-slate-900 text-slate-300' : 'bg-slate-50 text-slate-950 hover:text-white'} flex items-center gap-2 px-3 py-1.5 rounded-md flex items-center gap-2 px-3 py-1.5 rounded-md  border border-slate-700/50 hover:bg-slate-800`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <div className="flex w-6 h-6 rounded-full overflow-hidden border border-slate-600">
          <div className="flex-1" style={{ backgroundColor: activePaletteColors[0] }}></div>
          <div className="flex-1" style={{ backgroundColor: activePaletteColors[1] }}></div>
          <div className="flex-1" style={{ backgroundColor: activePaletteColors[2] }}></div>
        </div>
        <span className="text-sm text-slate-300">Theme</span>
        <ChevronDown className="h-4 w-4 text-slate-400" />
      </button>
      
      {isOpen && (
        <div className="absolute top-full mt-2 right-0 z-50 bg-slate-800 border border-slate-700 rounded-md shadow-lg py-2 w-52">
          <p className={`${isDarkMode ? 'text-slate-50' : 'text-slate-50'} text-sm px-3 py-1 text-xs uppercase font-medium tracking-wider`}>Color Theme</p>
          
          <div className="mt-1">
            {colorPalettes.map(palette => (
              <button
                key={palette.id}
                onClick={() => handlePaletteChange(palette.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 hover:bg-slate-700 text-left ${
                  activePalette === palette.id ? 'bg-slate-700/50' : ''
                }`}
              >
                <div className="flex w-5 h-5 rounded-full overflow-hidden border border-slate-600">
                  <div className="flex-1" style={{ backgroundColor: isDarkMode ? palette.colors.dark[0] : palette.colors.light[0] }}></div>
                  <div className="flex-1" style={{ backgroundColor: isDarkMode ? palette.colors.dark[1] : palette.colors.light[1] }}></div>
                  <div className="flex-1" style={{ backgroundColor: isDarkMode ? palette.colors.dark[2] : palette.colors.light[2] }}></div>
                </div>
                <span className={`${isDarkMode ? 'text-slate-50' : 'text-slate-50'} text-sm`}>{palette.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 