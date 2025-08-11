"use client";

import { useEffect, useRef } from 'react';
import { initSounds, loadSoundSettings, toggleSoundEffects } from '@/lib/sound-effects';
import { useUserSettings } from '@/lib/user-settings';

interface TypingSoundProps {
  active?: boolean;
}

export default function TypingSound({ active = true }: TypingSoundProps) {
  const isInitializedRef = useRef(false);
  const { settings } = useUserSettings();

  useEffect(() => {
    // Only initialize once
    if (isInitializedRef.current) return;
    isInitializedRef.current = true;
    
    const initAudio = async () => {
      try {
        // Load saved settings
        loadSoundSettings();
        
        // Initialize and preload sounds
        await initSounds();
        
        // console.log('Typing sound initialized successfully');
      } catch (error) {
        // console.error('Failed to initialize typing sound:', error);
      }
    };
    
    // Initialize audio - this preloads the sound file
    initAudio();
    
    // No need for global keydown listener as sounds are played from the typing-test component
    
    return () => {
      // Cleanup if needed
    };
  }, []);
  
  // Update sound enabled state when settings change
  useEffect(() => {
    toggleSoundEffects(settings.soundEnabled);
  }, [settings.soundEnabled]);
  
  // This component doesn't render anything visible
  return null;
} 