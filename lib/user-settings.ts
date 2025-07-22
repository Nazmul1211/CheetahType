import { useState, useEffect } from 'react';
import { type TestMode, type TimeOption, type WordsOption } from './typing-test-utils';

export interface UserSettings {
  testMode: TestMode;
  timeOption: TimeOption;
  wordsOption: WordsOption;
  showKeyboard: boolean;
  caretStyle: 'block' | 'underline' | 'outline';
  fontFamily: 'mono' | 'sans' | 'serif';
  fontSize: 'small' | 'medium' | 'large';
  soundEnabled: boolean;
  theme: 'light' | 'dark' | 'system';
  customText?: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  testMode: 'time',
  timeOption: 30,
  wordsOption: 25,
  showKeyboard: true,
  caretStyle: 'block',
  fontFamily: 'mono',
  fontSize: 'medium',
  soundEnabled: false,
  theme: 'system',
  customText: "The quick brown fox jumps over the lazy dog. All good men must come to the aid of their country."
};

export function useUserSettings() {
  const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load settings from localStorage on mount
  useEffect(() => {
    try {
      const savedSettings = localStorage.getItem('CheetahType-settings');
      if (savedSettings) {
        setSettings(JSON.parse(savedSettings));
      }
      setIsLoaded(true);
    } catch (error) {
      console.error('Failed to load settings:', error);
      setIsLoaded(true);
    }
  }, []);

  // Save settings to localStorage whenever they change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem('CheetahType-settings', JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save settings:', error);
      }
    }
  }, [settings, isLoaded]);

  const updateSettings = (newSettings: Partial<UserSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    updateSettings,
    resetSettings,
    isLoaded,
  };
}

export function getFontSizeClass(size: UserSettings['fontSize'], defaultSize?: UserSettings['fontSize']) {
  const sizeToUse = size || defaultSize || 'medium';
  
  switch (sizeToUse) {
    case 'small':
      return 'text-xl';
    case 'medium':
      return 'text-2xl';
    case 'large':
      return 'text-3xl';
    default:
      return 'text-2xl';
  }
}

export function getFontFamilyClass(family: UserSettings['fontFamily']) {
  switch (family) {
    case 'mono':
      return 'font-mono';
    case 'sans':
      return 'font-sans';
    case 'serif':
      return 'font-serif';
    default:
      return 'font-mono';
  }
} 