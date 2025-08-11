"use client"

import { useState, useEffect } from 'react';
import { TypingTest } from '@/components/typing-test';
import { SettingsDialog } from '@/components/settings-dialog';
import { useUserSettings } from '@/lib/user-settings';
import { Toaster } from "@/components/ui/toaster";
import { useTheme } from 'next-themes';
import { Card, CardContent } from "@/components/ui/card";
import { Gauge, Users, Trophy, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { StructuredData } from '@/components/structured-data';
import { Metadata } from 'next';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface SiteStats {
  totalTests: number;
  totalUsers: number;
  avgWpm: number;
  highestWpm: {
    wpm: number;
    username: string;
  } | null;
  recentTests: number;
}

export default function Home() {
  const [settingsOpen, setSettingsOpen] = useState(false);
  const { settings, updateSettings, resetSettings } = useUserSettings();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';
  
  const [stats, setStats] = useState<SiteStats | null>(null);
  const [isLoadingStats, setIsLoadingStats] = useState(true);

  // Fetch site statistics
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/stats/site');
        const data = await response.json();
        
        if (data.success) {
          setStats(data.data);
        } else {
          console.error("Error fetching stats:", data.error);
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoadingStats(false);
      }
    };
    
    fetchStats();
  }, []);

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CheetahType",
    "description": "A modern typing test application to improve your typing speed and accuracy",
    "url": "https://cheetahtype.com",
    "applicationCategory": "EducationalApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": "Typing Test, WPM Calculation, Accuracy Measurement, Multiple Test Modes",
    "screenshot": "https://cheetahtype.com/images/screenshot.jpg",
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.8",
      "ratingCount": "256",
      "bestRating": "5",
      "worstRating": "1"
    },
    "author": {
      "@type": "Organization",
      "name": "CheetahType Team",
      "url": "https://cheetahtype.com"
    }
  };

  // FAQ structured data for AEO
  const faqStructuredData = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What is CheetahType?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CheetahType is a free, modern typing test application designed to help users improve their typing speed and accuracy. It offers multiple test modes, detailed statistics, and multiplayer features."
        }
      },
      {
        "@type": "Question",
        "name": "How is WPM (Words Per Minute) calculated?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "WPM is calculated by dividing the number of characters typed (including spaces) by 5, and then dividing that result by the time taken in minutes. This is the standard method used by most typing tests."
        }
      },
      {
        "@type": "Question",
        "name": "How can I improve my typing speed?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "To improve your typing speed, practice regularly with proper finger positioning, focus on accuracy before speed, learn touch typing, use keyboard shortcuts, and take regular typing tests to track your progress."
        }
      },
      {
        "@type": "Question",
        "name": "What test modes are available on CheetahType?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "CheetahType offers several test modes including timed tests (15, 30, 60, and 120 seconds), word count tests (10, 25, 50, and 100 words), and custom text mode where you can practice with your own content."
        }
      },
      {
        "@type": "Question",
        "name": "Is CheetahType free to use?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Yes, CheetahType is completely free to use. All features including typing tests, statistics tracking, and multiplayer races are available at no cost."
        }
      }
    ]
  };

  return (
    <main className="flex flex-col items-center justify-center p-4 md:py-6">
      {/* Structured data for SEO */}
      <StructuredData data={structuredData} />
      
      {/* FAQ structured data for AEO */}
      <StructuredData data={faqStructuredData} />
      
      <div className="w-full max-w-7xl mx-auto">
        {/* Add semantic HTML5 elements for better SEO */}
        {/* <header className="sr-only">
          <h1>CheetahType - A Modern Typing Test</h1>
          <p>Improve your typing speed and accuracy with this free online typing test application</p>
        </header> */}
        
        <section aria-label="Typing Test">
          <TypingTest 
            initialTestMode={settings.testMode}
            initialTimeOption={settings.timeOption}
            initialWordsOption={settings.wordsOption}
            showKeyboard={settings.showKeyboard}
            fontFamily={settings.fontFamily}
            fontSize="large"
            caretStyle={settings.caretStyle}
            soundEnabled={settings.soundEnabled}
            customText={settings.customText}
          />
        </section>
        
        {/* Statistics Section */}
        {/* <section aria-label="Statistics" className="mt-8 mb-4">
          <h2 className={`text-xl font-bold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            CheetahType Statistics
          </h2>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
              <CardContent className="p-4 flex items-center">
                <div className={`p-2 rounded-full mr-3 ${isDark ? 'bg-teal-900/50' : 'bg-teal-100'}`}>
                  <Gauge className={`h-5 w-5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Avg. WPM</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {isLoadingStats ? '...' : stats?.avgWpm || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
              <CardContent className="p-4 flex items-center">
                <div className={`p-2 rounded-full mr-3 ${isDark ? 'bg-teal-900/50' : 'bg-teal-100'}`}>
                  <Trophy className={`h-5 w-5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Top WPM</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {isLoadingStats ? '...' : stats?.highestWpm?.wpm || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
              <CardContent className="p-4 flex items-center">
                <div className={`p-2 rounded-full mr-3 ${isDark ? 'bg-teal-900/50' : 'bg-teal-100'}`}>
                  <Users className={`h-5 w-5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Users</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {isLoadingStats ? '...' : stats?.totalUsers || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
            
            <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
              <CardContent className="p-4 flex items-center">
                <div className={`p-2 rounded-full mr-3 ${isDark ? 'bg-teal-900/50' : 'bg-teal-100'}`}>
                  <Clock className={`h-5 w-5 ${isDark ? 'text-teal-400' : 'text-teal-600'}`} />
                </div>
                <div>
                  <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-600'}`}>Tests</p>
                  <p className={`text-xl font-bold ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
                    {isLoadingStats ? '...' : stats?.totalTests || 0}
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </section> */}
        
        {/* FAQ Section for AEO */}
        <section aria-label="Frequently Asked Questions" className="max-w-xl mx-auto mt-12 mb-8">
          <h2 className={`text-xl md:text-2xl font-bold mb-6 text-center ${isDark ? 'text-slate-200' : 'text-slate-800'}`}>
            Frequently Asked Questions
          </h2>
          
          <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-slate-700 bg-slate-800/30' : 'border-slate-200 bg-white/60'}`}>
            <Accordion type="single" collapsible className={isDark ? 'text-slate-200' : 'text-slate-800'}>
              <AccordionItem value="item-1" className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <AccordionTrigger className="text-left px-4 py-3 hover:no-underline data-[state=open]:bg-teal-900/20">
                  <div className="flex items-center">
                    <span className={`text-base font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      What is CheetahType?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className={`px-4 py-3 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <p className="leading-relaxed">
                    CheetahType is a free, modern & customizable typing test application designed to help users improve their typing speed and accuracy. It offers multiple test modes, detailed statistics, and multiplayer features.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-2" className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <AccordionTrigger className="text-left px-4 py-3 hover:no-underline data-[state=open]:bg-teal-900/20">
                  <div className="flex items-center">
                    <span className={`text-base font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      How is WPM (Words Per Minute) calculated?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className={`px-4 py-3 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <p className="leading-relaxed">
                    WPM is calculated by dividing the number of characters typed (including spaces) by 5, and then dividing that result by the time taken in minutes. This is the standard method used by most typing tests.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-3" className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <AccordionTrigger className="text-left px-4 py-3 hover:no-underline data-[state=open]:bg-teal-900/20">
                  <div className="flex items-center">
                    <span className={`text-base font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      How can I improve my typing speed?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className={`px-4 py-3 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <p className="leading-relaxed">
                    To improve your typing speed, practice regularly with proper finger positioning, focus on accuracy before speed, learn touch typing, use keyboard shortcuts, and take regular typing tests to track your progress.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-4" className={`border-b ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
                <AccordionTrigger className="text-left px-4 py-3 hover:no-underline data-[state=open]:bg-teal-900/20">
                  <div className="flex items-center">
                    <span className={`text-base font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      What test modes are available on CheetahType?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className={`px-4 py-3 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <p className="leading-relaxed">
                    Cheetah Type offers several test modes including punctuation tests, numbers tests, timed tests(15, 30, 60, and 120 seconds), word count tests(10, 25, 50, and 100 words), zen mode, and custom text mode where you can practice with your own content.
                  </p>
                </AccordionContent>
              </AccordionItem>
              
              <AccordionItem value="item-5" className={`${isDark ? 'border-slate-700' : 'border-slate-200'} border-0`}>
                <AccordionTrigger className="text-left px-4 py-3 hover:no-underline data-[state=open]:bg-teal-900/20">
                  <div className="flex items-center">
                    <span className={`text-base font-medium ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
                      Is CheetahType free to use?
                    </span>
                  </div>
                </AccordionTrigger>
                <AccordionContent className={`px-4 py-3 ${isDark ? 'bg-slate-800/50' : 'bg-slate-50'}`}>
                  <p className="leading-relaxed">
                    Yes, CheetahType is completely free to use. All features including typing tests, statistics tracking, and multiplayer races are available at no cost.
                  </p>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </div>
        </section>
      </div>
      
      <SettingsDialog 
        isOpen={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
      />
      <Toaster />
    </main>
  );
}