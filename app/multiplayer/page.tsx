"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Users, Rocket } from "lucide-react";
import Link from "next/link";
import { ClientJoinForm } from "@/components/multiplayer/client-join-form";
import { useTheme } from "next-themes";
import { StructuredData } from '@/components/structured-data';

export default function MultiplayerPage() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  
  // Helper classes for dark mode
  const textColor = isDark ? 'text-white' : 'text-slate-800';
  const mutedTextColor = isDark ? 'text-slate-300' : 'text-slate-600';
  const headingColor = isDark ? 'text-teal-400' : 'text-teal-600';
  const cardBg = isDark ? 'bg-slate-800 border-slate-700' : 'bg-white border-slate-200';
  const cardDescriptionColor = isDark ? 'text-slate-400' : 'text-slate-500';
  
  // Structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "name": "CheetahType Multiplayer",
    "description": "Compete in real-time typing races with friends and typists worldwide.",
    "url": "https://cheetahtype.com/multiplayer/",
    "applicationCategory": "GameApplication",
    "operatingSystem": "Any",
    "offers": {
      "@type": "Offer",
      "price": "0",
      "priceCurrency": "USD"
    },
    "featureList": "Real-time Typing Races, Multiplayer Competition, Race Creation, Lobby System",
    "author": {
      "@type": "Organization",
      "name": "CheetahType Team",
      "url": "https://cheetahtype.com"
    }
  };
  
  return (
    <div className="container mx-auto py-6 px-4 sm:px-6 md:py-10">
      {/* Add structured data */}
      <StructuredData data={structuredData} />
      
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className={`text-3xl font-bold mb-2 flex items-center gap-3 ${headingColor}`}>
            <Users className="h-8 w-8" /> Multiplayer Typing Races
          </h1>
          <p className={`text-lg ${mutedTextColor}`}>
            Compete with friends and improve your typing skills together
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-8 mb-6 sm:mb-10">
          <Card className={cardBg}>
            <CardHeader>
              <CardTitle className={headingColor}>
                Join a Race
              </CardTitle>
              <CardDescription className={cardDescriptionColor}>
                Enter a lobby code to join an existing race
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ClientJoinForm />
            </CardContent>
          </Card>
          
          <Card className={cardBg}>
            <CardHeader>
              <CardTitle className={headingColor}>
                Create a Race
              </CardTitle>
              <CardDescription className={cardDescriptionColor}>
                Start a new race and invite friends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="p-4 rounded-md mb-4 bg-teal-900/20 border border-teal-800/50">
                <p className="text-sm text-teal-300">
                  <Rocket className="h-4 w-4 inline-block mr-2" />
                  Coming soon! Multiplayer races are currently under development.
                </p>
              </div>
              <Button disabled className="w-full">
                Create Race
              </Button>
            </CardContent>
          </Card>
        </div>
        
        <Card className={`mb-8 ${cardBg}`}>
          <CardHeader>
            <CardTitle className={headingColor}>
              How it Works
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ol className={`list-decimal pl-5 space-y-3 ${mutedTextColor}`}>
              <li>
                <strong>Create or join a race</strong> - Set up a new race with your preferred settings or join an existing one with a lobby code
              </li>
              <li>
                <strong>Invite friends</strong> - Share the lobby code with friends so they can join your race
              </li>
              <li>
                <strong>Race together</strong> - Compete in real-time and see everyone&apos;s progress on the same text
              </li>
              <li>
                <strong>Compare results</strong> - See detailed stats for all participants after the race ends
              </li>
            </ol>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
 