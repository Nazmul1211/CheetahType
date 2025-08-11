"use client"

import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { type TestMode, type TimeOption, type WordsOption } from '@/lib/typing-test-utils';
import { useTheme } from 'next-themes';
import { Square, Underline, BoxSelect, Type, MousePointer } from 'lucide-react';

interface UserSettings {
  testMode: TestMode;
  timeOption: TimeOption;
  wordsOption: WordsOption;
  showKeyboard: boolean;
  fontFamily: 'mono' | 'sans' | 'serif';
  fontSize: 'small' | 'medium' | 'large';
  caretStyle: 'block' | 'underline' | 'outline' | 'straight' | 'cursor';
  caretBlink: boolean;
  soundEnabled: boolean;
  customText?: string;
}

interface SettingsDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  settings: UserSettings;
  onUpdateSettings: (settings: Partial<UserSettings>) => void;
  onResetSettings: () => void;
}

export function SettingsDialog({
  isOpen,
  onOpenChange,
  settings,
  onUpdateSettings,
  onResetSettings
}: SettingsDialogProps) {
  const [activeTab, setActiveTab] = useState('appearance');
  const [customText, setCustomText] = useState(settings.customText || '');
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  useEffect(() => {
    setCustomText(settings.customText || '');
  }, [settings.customText, isOpen]);

  const handleSaveCustomText = () => {
    onUpdateSettings({ customText });
    if (customText && settings.testMode !== 'custom') {
      onUpdateSettings({ testMode: 'custom' });
    }
  };

  // Helper classes for dark mode styling
  const darkModeDialog = isDark ? 'bg-zinc-900 border-zinc-800' : '';
  const darkModeText = isDark ? 'text-white' : '';
  const darkModeSubText = isDark ? 'text-gray-300' : '';
  const darkModeTabsList = isDark ? 'bg-zinc-800' : '';
  const darkModeTabsTrigger = isDark ? 'data-[state=active]:bg-zinc-900 data-[state=active]:text-white text-gray-300 hover:text-gray-100' : '';
  const darkModeInput = isDark ? 'bg-zinc-800 border-zinc-700 focus:border-zinc-500 text-white' : '';
  const darkModeHeading = isDark ? 'text-white' : 'text-slate-900';
  const darkModeLabel = isDark ? 'text-gray-300' : 'text-slate-700';

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className={`sm:max-w-[500px] ${darkModeDialog}`}>
        <DialogHeader>
          <DialogTitle className={darkModeText}>Settings</DialogTitle>
          <DialogDescription className={darkModeSubText}>
            Customize your typing test experience.
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className={`grid grid-cols-3 mb-4 ${darkModeTabsList}`}>
            <TabsTrigger value="appearance" className={darkModeTabsTrigger}>Appearance</TabsTrigger>
            <TabsTrigger value="behavior" className={darkModeTabsTrigger}>Behavior</TabsTrigger>
            <TabsTrigger value="custom" className={darkModeTabsTrigger}>Custom Text</TabsTrigger>
          </TabsList>

          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-4">
              <div>
                <h3 className={`text-sm font-medium mb-2 ${darkModeHeading}`}>Font Family</h3>
                <RadioGroup
                  defaultValue={settings.fontFamily}
                  onValueChange={(value) => onUpdateSettings({ fontFamily: value as 'mono' | 'sans' | 'serif' })}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="mono" id="font-mono" />
                    <Label htmlFor="font-mono" className={`font-mono ${darkModeLabel}`}>Monospace</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="sans" id="font-sans" />
                    <Label htmlFor="font-sans" className={`font-sans ${darkModeLabel}`}>Sans Serif</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="serif" id="font-serif" />
                    <Label htmlFor="font-serif" className={`font-serif ${darkModeLabel}`}>Serif</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className={`text-sm font-medium mb-2 ${darkModeHeading}`}>Font Size</h3>
                <RadioGroup
                  defaultValue={settings.fontSize}
                  onValueChange={(value) => onUpdateSettings({ fontSize: value as 'small' | 'medium' | 'large' })}
                  className="flex flex-col space-y-1"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="small" id="font-small" />
                    <Label htmlFor="font-small" className={`text-sm ${darkModeLabel}`}>Small</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="medium" id="font-medium" />
                    <Label htmlFor="font-medium" className={`text-base ${darkModeLabel}`}>Medium</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="large" id="font-large" />
                    <Label htmlFor="font-large" className={`text-lg ${darkModeLabel}`}>Large</Label>
                  </div>
                </RadioGroup>
              </div>

              <div>
                <h3 className={`text-sm font-medium mb-2 ${darkModeHeading}`}>Caret Style</h3>
                <RadioGroup
                  defaultValue={settings.caretStyle}
                  value={settings.caretStyle}
                  onValueChange={(value) => onUpdateSettings({ caretStyle: value as 'block' | 'underline' | 'outline' | 'straight' | 'cursor' })}
                  className="grid grid-cols-2 gap-2"
                >
                  <div className={`flex items-center p-2 rounded-md border ${settings.caretStyle === 'block' ? (isDark ? 'bg-zinc-700 border-primary' : 'bg-slate-200 border-primary') : (isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100')} transition-colors`}>
                    <RadioGroupItem value="block" id="caret-block" className="sr-only" />
                    <Label 
                      htmlFor="caret-block" 
                      className={`flex flex-col items-center justify-center cursor-pointer w-full ${darkModeLabel}`}
                    >
                      <Square className="h-5 w-5 mb-1" />
                      <span>Block</span>
                    </Label>
                  </div>
                  <div className={`flex items-center p-2 rounded-md border ${settings.caretStyle === 'underline' ? (isDark ? 'bg-zinc-700 border-primary' : 'bg-slate-200 border-primary') : (isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100')} transition-colors`}>
                    <RadioGroupItem value="underline" id="caret-underline" className="sr-only" />
                    <Label 
                      htmlFor="caret-underline"
                      className={`flex flex-col items-center justify-center cursor-pointer w-full ${darkModeLabel}`}
                    >
                      <Underline className="h-5 w-5 mb-1" />
                      <span>Underline</span>
                    </Label>
                  </div>
                  <div className={`flex items-center p-2 rounded-md border ${settings.caretStyle === 'outline' ? (isDark ? 'bg-zinc-700 border-primary' : 'bg-slate-200 border-primary') : (isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100')} transition-colors`}>
                    <RadioGroupItem value="outline" id="caret-outline" className="sr-only" />
                    <Label 
                      htmlFor="caret-outline"
                      className={`flex flex-col items-center justify-center cursor-pointer w-full ${darkModeLabel}`}
                    >
                      <BoxSelect className="h-5 w-5 mb-1" />
                      <span>Outline</span>
                    </Label>
                  </div>
                  <div className={`flex items-center p-2 rounded-md border ${settings.caretStyle === 'straight' ? (isDark ? 'bg-zinc-700 border-primary' : 'bg-slate-200 border-primary') : (isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100')} transition-colors`}>
                    <RadioGroupItem value="straight" id="caret-straight" className="sr-only" />
                    <Label 
                      htmlFor="caret-straight"
                      className={`flex flex-col items-center justify-center cursor-pointer w-full ${darkModeLabel}`}
                    >
                      <Type className="h-5 w-5 mb-1" />
                      <span>Straight</span>
                    </Label>
                  </div>
                  <div className={`flex items-center p-2 rounded-md border ${settings.caretStyle === 'cursor' ? (isDark ? 'bg-zinc-700 border-primary' : 'bg-slate-200 border-primary') : (isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100')} transition-colors`}>
                    <RadioGroupItem value="cursor" id="caret-cursor" className="sr-only" />
                    <Label 
                      htmlFor="caret-cursor"
                      className={`flex flex-col items-center justify-center cursor-pointer w-full ${darkModeLabel}`}
                    >
                      <MousePointer className="h-5 w-5 mb-1" />
                      <span>Cursor</span>
                    </Label>
                  </div>
                </RadioGroup>
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="caret-blink" className={darkModeLabel}>Caret Blink</Label>
                <Switch
                  id="caret-blink"
                  checked={settings.caretBlink}
                  onCheckedChange={(checked) => onUpdateSettings({ caretBlink: checked })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="behavior" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-keyboard" className={darkModeLabel}>Show Keyboard</Label>
                <Switch
                  id="show-keyboard"
                  checked={settings.showKeyboard}
                  onCheckedChange={(checked) => onUpdateSettings({ showKeyboard: checked })}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="sound-enabled" className={darkModeLabel}>Sound Effects</Label>
                <Switch
                  id="sound-enabled"
                  checked={settings.soundEnabled}
                  onCheckedChange={(checked) => onUpdateSettings({ soundEnabled: checked })}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="custom" className="space-y-4">
            <div className="space-y-4">
              <div>
                <Label htmlFor="custom-text" className={`block mb-2 ${darkModeLabel}`}>Custom Text</Label>
                <Textarea
                  id="custom-text"
                  value={customText}
                  onChange={(e) => setCustomText(e.target.value)}
                  className={`min-h-[150px] ${darkModeInput}`}
                  placeholder="Enter your custom text here..."
                />
                <p className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-slate-500'}`}>
                  Enter your own text to practice with specific content.
                </p>
              </div>
              <Button onClick={handleSaveCustomText} className="w-full">
                Save Custom Text
              </Button>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex justify-between items-center">
          <Button variant="outline" onClick={onResetSettings} className={isDark ? 'border-zinc-700 text-slate-800 hover:bg-zinc-800 hover:text-slate-200' : ''}>
            Reset to Defaults
          </Button>
          <Button onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}