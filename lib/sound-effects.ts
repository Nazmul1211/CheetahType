// Sound effects utility for the typing application
import { UserSettings } from './user-settings';

// Create audio elements when in browser environment
let typingAudio: HTMLAudioElement | null = null;
let isLoaded = false;
let isEnabled = false;
let isInitialized = false;

// Initialize and preload the audio 
export async function initSounds(): Promise<void> {
  // Only run in browser environment
  if (typeof window === 'undefined') return;
  
  // Don't initialize twice
  if (isInitialized) return;
  isInitialized = true;
  
  try {
    // Load settings first
    loadSoundSettings();
    
    // Create an audio element
    typingAudio = new Audio('/sounds/typing.mp3');
    typingAudio.preload = 'auto';
    typingAudio.volume = 0.5; // Set a reasonable volume
    
    // Create a promise to wait for the audio to load
    const loadPromise = new Promise<void>((resolve, reject) => {
      if (!typingAudio) return reject('Audio element not created');
      
      typingAudio.oncanplaythrough = () => {
        isLoaded = true;
        // console.log('Typing sound loaded successfully');
        resolve();
      };
      
      typingAudio.onerror = (e) => {
        console.error('Error loading typing sound', e);
        reject(e);
      };
    });
    
    // Wait for the audio to load
    await loadPromise;
    
    // Create a dummy user interaction to unlock audio on some browsers
    const unlockAudio = () => {
      if (typingAudio) {
        typingAudio.play().catch(() => {});
        typingAudio.pause();
        typingAudio.currentTime = 0;
        document.removeEventListener('click', unlockAudio);
        document.removeEventListener('keydown', unlockAudio);
      }
    };
    
    document.addEventListener('click', unlockAudio, { once: true });
    document.addEventListener('keydown', unlockAudio, { once: true });
    
  } catch (error) {
    console.error('Failed to initialize sound effects:', error);
  }
}

// Play typing sound with optimal performance
export function playTypingSound(): void {
  if (!isEnabled || !typingAudio) {
    // If audio is not initialized yet, try to initialize it
    if (!isInitialized) {
      initSounds();
      return;
    }
    return;
  }
  
  try {
    // Reset audio to start for rapid playback
    typingAudio.currentTime = 0;
    
    // Play the sound
    const playPromise = typingAudio.play();
    
    // Handle the play promise to avoid uncaught errors
    if (playPromise !== undefined) {
      playPromise.catch(error => {
        // Auto-play was prevented, likely due to browser policies
        console.warn('Audio playback prevented:', error);
        
        // Try to unlock audio on user interaction
        const unlockAudio = () => {
          if (typingAudio) {
            typingAudio.play().catch(() => {});
            document.removeEventListener('click', unlockAudio);
            document.removeEventListener('keydown', unlockAudio);
          }
        };
        
        document.addEventListener('click', unlockAudio, { once: true });
        document.addEventListener('keydown', unlockAudio, { once: true });
      });
    }
  } catch (error) {
    console.error('Error playing typing sound:', error);
  }
}

// Enable/disable sound effects
export function toggleSoundEffects(enabled: boolean): void {
  isEnabled = enabled;
  saveSoundSettings();
  
  // If enabling sound and audio not initialized, initialize it
  if (enabled && !isInitialized) {
    initSounds();
  }
}

// Get current sound state
export function isSoundEnabled(): boolean {
  return isEnabled;
}

// Load sounds from localStorage on init
export function loadSoundSettings(): void {
  if (typeof window === 'undefined') return;
  
  try {
    // First check if we have a dedicated sound setting
    const savedSetting = localStorage.getItem('soundEnabled');
    if (savedSetting !== null) {
      isEnabled = savedSetting === 'true';
      return;
    }
    
    // If not, try to get from user settings
    const userSettings = localStorage.getItem('CheetahType-settings');
    if (userSettings) {
      const settings = JSON.parse(userSettings) as UserSettings;
      isEnabled = settings.soundEnabled || false;
    }
  } catch (error) {
    console.error('Error loading sound settings:', error);
  }
}

// Save sound settings to localStorage
export function saveSoundSettings(): void {
  if (typeof window === 'undefined') return;
  
  try {
    localStorage.setItem('soundEnabled', isEnabled.toString());
    
    // Also update the user settings if available
    const userSettings = localStorage.getItem('CheetahType-settings');
    if (userSettings) {
      const settings = JSON.parse(userSettings) as UserSettings;
      settings.soundEnabled = isEnabled;
      localStorage.setItem('CheetahType-settings', JSON.stringify(settings));
    }
  } catch (error) {
    console.error('Error saving sound settings:', error);
  }
} 