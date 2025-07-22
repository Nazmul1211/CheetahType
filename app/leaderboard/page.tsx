"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { StructuredData } from '@/components/structured-data';

interface LeaderboardEntry {
  _id: string;
  userId: string;
  username: string;
  displayName?: string;
  wpm: number;
  accuracy: number;
  characters: number;
  errors: number;
  testType: string;
  testMode: string;
  language: string;
  createdAt: string;
  rank?: number;
}

// Mock data for leaderboard
const mockLeaderboardData: Record<string, LeaderboardEntry[]> = {
  "15": [
    { _id: "1", userId: "user1", username: "speedtyper", displayName: "Speed Typer", wpm: 120, accuracy: 98.5, characters: 450, errors: 5, testType: "time", testMode: "15", language: "english", createdAt: "2023-05-15T12:00:00Z" },
    { _id: "2", userId: "user2", username: "fastfingers", displayName: "Fast Fingers", wpm: 115, accuracy: 97.2, characters: 430, errors: 8, testType: "time", testMode: "15", language: "english", createdAt: "2023-05-16T14:30:00Z" },
    { _id: "3", userId: "user3", username: "typingwizard", displayName: "Typing Wizard", wpm: 110, accuracy: 96.8, characters: 410, errors: 10, testType: "time", testMode: "15", language: "english", createdAt: "2023-05-17T10:15:00Z" },
  ],
  "30": [
    { _id: "4", userId: "user1", username: "speedtyper", displayName: "Speed Typer", wpm: 110, accuracy: 97.5, characters: 800, errors: 12, testType: "time", testMode: "30", language: "english", createdAt: "2023-05-18T09:45:00Z" },
    { _id: "5", userId: "user4", username: "keyhero", displayName: "Key Hero", wpm: 105, accuracy: 96.8, characters: 780, errors: 15, testType: "time", testMode: "30", language: "english", createdAt: "2023-05-19T16:20:00Z" },
    { _id: "6", userId: "user2", username: "fastfingers", displayName: "Fast Fingers", wpm: 102, accuracy: 95.9, characters: 760, errors: 18, testType: "time", testMode: "30", language: "english", createdAt: "2023-05-20T11:10:00Z" },
  ],
  "60": [
    { _id: "7", userId: "user3", username: "typingwizard", displayName: "Typing Wizard", wpm: 100, accuracy: 96.2, characters: 1450, errors: 28, testType: "time", testMode: "60", language: "english", createdAt: "2023-05-21T13:40:00Z" },
    { _id: "8", userId: "user5", username: "wordsmith", displayName: "Word Smith", wpm: 98, accuracy: 95.8, characters: 1420, errors: 30, testType: "time", testMode: "60", language: "english", createdAt: "2023-05-22T08:30:00Z" },
    { _id: "9", userId: "user1", username: "speedtyper", displayName: "Speed Typer", wpm: 95, accuracy: 94.5, characters: 1380, errors: 35, testType: "time", testMode: "60", language: "english", createdAt: "2023-05-23T15:15:00Z" },
  ],
  "120": [
    { _id: "10", userId: "user4", username: "keyhero", displayName: "Key Hero", wpm: 92, accuracy: 95.0, characters: 2650, errors: 65, testType: "time", testMode: "120", language: "english", createdAt: "2023-05-24T10:05:00Z" },
    { _id: "11", userId: "user2", username: "fastfingers", displayName: "Fast Fingers", wpm: 90, accuracy: 94.2, characters: 2600, errors: 70, testType: "time", testMode: "120", language: "english", createdAt: "2023-05-25T14:50:00Z" },
    { _id: "12", userId: "user5", username: "wordsmith", displayName: "Word Smith", wpm: 88, accuracy: 93.8, characters: 2550, errors: 75, testType: "time", testMode: "120", language: "english", createdAt: "2023-05-26T09:25:00Z" },
  ]
};

export default function LeaderboardPage() {
  const [activeTab, setActiveTab] = useState("30");
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { theme } = useTheme();
  const [pagination, setPagination] = useState({
    total: 0,
    page: 0,
    limit: 10,
    pages: 0
  });

  useEffect(() => {
    // Simulate API fetch delay
    setLoading(true);
    setError(null);
    
    setTimeout(() => {
      try {
        const data = mockLeaderboardData[activeTab] || [];
        
        // Add rank to each entry
        const entriesWithRank = data.map((entry: LeaderboardEntry, index: number) => ({
          ...entry,
          rank: index + 1
        }));
        
        setEntries(entriesWithRank);
        setPagination({
          total: entriesWithRank.length,
          page: 0,
          limit: 10,
          pages: Math.ceil(entriesWithRank.length / 10)
        });
        setLoading(false);
      } catch (err) {
        console.error("Error loading leaderboard data:", err);
        setError("Failed to load leaderboard data");
        setLoading(false);
      }
    }, 500); // Simulate network delay
  }, [activeTab]);

  const getCardClass = () => {
    return theme === "dark" 
      ? "bg-gray-800 text-white border border-gray-700" 
      : "bg-white text-gray-900 border border-gray-200";
  };

  // Create structured data for SEO
  const structuredData = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "name": "CheetahType Leaderboard - Top Typing Speed Rankings",
    "description": "View the fastest typists on CheetahType across different typing test modes",
    "url": "https://cheetahtype.com/leaderboard/",
    "numberOfItems": entries.length,
    "itemListElement": entries.map((entry, index) => ({
      "@type": "ListItem",
      "position": entry.rank,
      "item": {
        "@type": "Person",
        "name": entry.displayName || entry.username,
        "additionalProperty": [
          {
            "@type": "PropertyValue",
            "name": "WPM",
            "value": Math.round(entry.wpm)
          },
          {
            "@type": "PropertyValue",
            "name": "Accuracy",
            "value": `${entry.accuracy.toFixed(2)}%`
          }
        ]
      }
    }))
  };

  return (
    <div className="container max-w-7xl mx-auto py-8 px-4">
      {/* Add structured data */}
      <StructuredData data={structuredData} />
      
      <h1 className="text-3xl font-bold mb-6">Leaderboard</h1>
      
      <Tabs defaultValue="30" value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6 bg-gray-100 dark:bg-gray-700">
          <TabsTrigger value="15" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary dark:data-[state=active]:text-primary-foreground">15s</TabsTrigger>
          <TabsTrigger value="30" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary dark:data-[state=active]:text-primary-foreground">30s</TabsTrigger>
          <TabsTrigger value="60" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary dark:data-[state=active]:text-primary-foreground">60s</TabsTrigger>
          <TabsTrigger value="120" className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800 data-[state=active]:text-primary dark:data-[state=active]:text-primary-foreground">120s</TabsTrigger>
        </TabsList>
        
        {["15", "30", "60", "120"].map((mode) => (
          <TabsContent key={mode} value={mode}>
            <Card className={getCardClass()}>
              <CardHeader>
                <CardTitle>Top Typists - {mode}s Mode</CardTitle>
              </CardHeader>
              <CardContent>
                {loading && activeTab === mode ? (
                  <div className="flex justify-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : error ? (
                  <div className="text-center py-8 text-red-500 dark:text-red-400">
                    <p>{error}</p>
                    <button 
                      onClick={() => setActiveTab(mode)} 
                      className="mt-2 px-4 py-2 bg-primary text-primary-foreground rounded-md"
                    >
                      Try Again
                    </button>
                  </div>
                ) : entries.length === 0 && activeTab === mode ? (
                  <div className="text-center py-8">
                    <p>No data available for this mode yet.</p>
                  </div>
                ) : activeTab === mode && (
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-gray-200 dark:border-gray-700">
                          <th className="py-2 px-4 text-left">Rank</th>
                          <th className="py-2 px-4 text-left">User</th>
                          <th className="py-2 px-4 text-right">WPM</th>
                          <th className="py-2 px-4 text-right">Accuracy</th>
                          <th className="py-2 px-4 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry) => (
                          <tr key={entry._id} className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                            <td className="py-2 px-4">{entry.rank}</td>
                            <td className="py-2 px-4">{entry.displayName || entry.username}</td>
                            <td className="py-2 px-4 text-right font-semibold">{Math.round(entry.wpm)}</td>
                            <td className="py-2 px-4 text-right">{entry.accuracy.toFixed(2)}%</td>
                            <td className="py-2 px-4 text-right">{new Date(entry.createdAt).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                    
                    {pagination.pages > 1 && (
                      <div className="flex justify-center mt-6">
                        <nav className="flex items-center space-x-2">
                          {Array.from({ length: pagination.pages }, (_, i) => (
                            <button
                              key={i}
                              className={`px-3 py-1 rounded ${
                                pagination.page === i
                                  ? 'bg-primary text-primary-foreground'
                                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
                              }`}
                              onClick={() => {
                                // Pagination not needed for mock data
                              }}
                            >
                              {i + 1}
                            </button>
                          ))}
                        </nav>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}