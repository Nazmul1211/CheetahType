"use client";

import { useTheme } from "next-themes";
import { Card, CardContent } from "@/components/ui/card";
import { Keyboard, BarChart2, Users, Clock, Globe, Code } from "lucide-react";
import { StructuredData } from '@/components/structured-data';

export default function AboutPage() {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "name": "About CheetahType - Our Mission and Features",
    "description": "Learn about CheetahType, our mission to improve typing skills, and the features that make us the best typing test platform for typists of all levels.",
    "url": "https://cheetahtype.com/about/",
    "mainEntity": {
      "@type": "Organization",
      "name": "CheetahType",
      "description": "A modern typing test application to improve your typing speed and accuracy",
      "url": "https://cheetahtype.com",
      "foundingDate": "2023",
      "knowsAbout": ["Typing Tests", "WPM Calculation", "Typing Speed", "Touch Typing"]
    }
  };

  return (
    <div className={`min-h-[calc(100vh-4rem)] ${isDark ? 'bg-slate-900' : 'bg-slate-50'}`}>
      {/* Add structured data */}
      <StructuredData data={structuredData} />
      
      <div className="container mx-auto max-w-7xl px-4 py-12">
        <div className="flex flex-col items-center justify-center mb-12 text-center">
          <h1 className={`text-4xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            About CheetahType
          </h1>
          <p className={`text-xl max-w-3xl ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            Empowering typists worldwide with a modern, accurate, and feature-rich typing test platform.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          <div>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              Our Mission
            </h2>
            <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              At CheetahType, our mission is to help people improve their typing skills through an engaging, 
              accessible platform that provides accurate measurements and meaningful feedback. We believe that 
              typing proficiency is a fundamental skill in today's digital world, and we're committed to making 
              the learning process enjoyable and effective.
            </p>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Founded in 2023, CheetahType has quickly grown to become a trusted resource for typists of all 
              levels, from beginners looking to learn proper technique to professionals aiming to increase their 
              speed and accuracy.
            </p>
          </div>
          <div>
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
              What Sets Us Apart
            </h2>
            <p className={`mb-4 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              Unlike traditional typing tests, CheetahType offers a comprehensive suite of features designed 
              to provide a complete typing experience. Our platform combines accurate metrics, customizable tests, 
              progress tracking, and multiplayer competitions to create an environment where users can continuously 
              improve their skills.
            </p>
            <p className={`${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
              We're constantly innovating and adding new features based on user feedback to ensure that CheetahType 
              remains the most effective and enjoyable typing test platform available.
            </p>
          </div>
        </div>

        <h2 className={`text-2xl font-bold mb-8 text-center ${isDark ? 'text-white' : 'text-slate-900'}`}>
          Key Features
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardContent className="p-6">
              <div className={`rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <Keyboard className={isDark ? 'text-teal-400' : 'text-teal-600'} />
              </div>
              <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Accurate Metrics
              </h3>
              <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                Get precise measurements of your typing speed (WPM), accuracy, and consistency with detailed 
                breakdowns of your performance.
              </p>
            </CardContent>
          </Card>

          <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardContent className="p-6">
              <div className={`rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <BarChart2 className={isDark ? 'text-teal-400' : 'text-teal-600'} />
              </div>
              <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Progress Tracking
              </h3>
              <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                Monitor your improvement over time with comprehensive statistics and visualizations of your 
                typing history.
              </p>
            </CardContent>
          </Card>

          <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardContent className="p-6">
              <div className={`rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <Users className={isDark ? 'text-teal-400' : 'text-teal-600'} />
              </div>
              <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Multiplayer Races
              </h3>
              <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                Compete with friends or typists worldwide in real-time typing races to add a fun, 
                competitive element to your practice.
              </p>
            </CardContent>
          </Card>

          <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardContent className="p-6">
              <div className={`rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <Clock className={isDark ? 'text-teal-400' : 'text-teal-600'} />
              </div>
              <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Customizable Tests
              </h3>
              <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                Choose from various test modes, durations, and content types, or create your own custom 
                typing tests tailored to your specific needs.
              </p>
            </CardContent>
          </Card>

          <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardContent className="p-6">
              <div className={`rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <Globe className={isDark ? 'text-teal-400' : 'text-teal-600'} />
              </div>
              <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Global Leaderboards
              </h3>
              <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                See how you stack up against other typists worldwide with our regularly updated leaderboards 
                featuring the fastest and most accurate typists.
              </p>
            </CardContent>
          </Card>

          <Card className={isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200'}>
            <CardContent className="p-6">
              <div className={`rounded-full p-3 w-12 h-12 flex items-center justify-center mb-4 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}>
                <Code className={isDark ? 'text-teal-400' : 'text-teal-600'} />
              </div>
              <h3 className={`text-xl font-medium mb-2 ${isDark ? 'text-white' : 'text-slate-900'}`}>
                Programmers Mode
              </h3>
              <p className={isDark ? 'text-slate-300' : 'text-slate-600'}>
                Practice typing code snippets in various programming languages to improve your coding 
                speed and reduce errors in your development workflow.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="border-t mb-12 pt-12 text-center">
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-slate-900'}`}>
            Join Our Community
          </h2>
          <p className={`max-w-3xl mx-auto mb-6 ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
            CheetahType is more than just a typing test - it's a community of people dedicated to improving 
            their typing skills. Join thousands of typists who use our platform daily to practice, compete, 
            and track their progress.
          </p>
        </div>
      </div>
    </div>
  );
}
