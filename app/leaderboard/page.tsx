"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTheme } from "next-themes";
import { StructuredData } from '@/components/structured-data';

interface LeaderboardEntry {
  id: string;
  user_id: string;
  username: string;
  display_name?: string;
  wpm: number;
  accuracy: number;
  characters: number;
  errors: number;
  test_type: string;
  test_mode: string;
  created_at: string;
  rank?: number;
}

// Data loaded from /api/leaderboard

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
    let timer: NodeJS.Timeout | null = null;

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`/api/leaderboard?mode=time&time_limit=${activeTab}&limit=50`, { cache: 'no-store' });
        const json = await res.json();
        const data: LeaderboardEntry[] = json.entries || [];
        const entriesWithRank = data.map((entry, index) => ({ ...entry, rank: index + 1 }));
        setEntries(entriesWithRank);
        setPagination({ total: entriesWithRank.length, page: 0, limit: 10, pages: Math.ceil(entriesWithRank.length / 10) });
        setLoading(false);
      } catch (err) {
        console.error('Error loading leaderboard data:', err);
        setError('Failed to load leaderboard data');
        setLoading(false);
      }
    };

    fetchData();
    timer = setInterval(fetchData, 60_000); // poll every 1 minute
    return () => { if (timer) clearInterval(timer); };
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
        "name": entry.display_name || entry.username,
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
      
      <h1 className="text-2xl md:text-3xl font-bold mb-6 text-teal-500 dark:text-teal-400">Leaderboard</h1>
      
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
                        <tr className="border-b-2 border-gray-300 dark:border-gray-600 bg-gray-50 dark:bg-gray-800/50">
                          <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Rank</th>
                          <th className="py-3 px-4 text-left font-semibold text-gray-700 dark:text-gray-300">Player</th>
                          <th className="py-3 px-4 text-right font-semibold text-gray-700 dark:text-gray-300">Speed</th>
                          <th className="py-3 px-4 text-right font-semibold text-gray-700 dark:text-gray-300">Accuracy</th>
                          <th className="py-3 px-4 text-right font-semibold text-gray-700 dark:text-gray-300">Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {entries.map((entry) => (
                          <tr key={entry.id} className={`border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 ${
                            entry.rank === 1 ? 'bg-gradient-to-r from-yellow-50 to-amber-50 dark:from-yellow-900/20 dark:to-amber-900/20' : ''
                          }`}>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-2">
                                {entry.rank === 1 && (
                                  <svg className="w-5 h-5 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M9.664 1.319a.75.75 0 01.672 0 41.059 41.059 0 018.198 5.424.75.75 0 01-.254 1.285 31.372 31.372 0 00-7.86 3.83.75.75 0 01-.84 0 31.508 31.508 0 00-2.08-1.287V9.394c0-.244.116-.463.302-.592a35.504 35.504 0 013.305-2.033.75.75 0 00-.714-1.319 37 37 0 00-3.446 2.12A2.216 2.216 0 006 9.393v.38a31.293 31.293 0 00-4.28-1.746.75.75 0 01-.254-1.285 41.059 41.059 0 018.198-5.424zM6 11.459a29.848 29.848 0 00-2.455-1.158 41.029 41.029 0 00-.39 3.114.75.75 0 00.419.74c.528.256 1.046.53 1.554.82-.21-.899-.385-1.804-.528-2.716zM16 11.459c-.143.912-.318 1.817-.528 2.716.508-.29 1.026-.564 1.554-.82a.75.75 0 00.419-.74 41.029 41.029 0 00-.39-3.114 29.848 29.848 0 00-2.455 1.158z" clipRule="evenodd" />
                                  </svg>
                                )}
                                <span className={`font-semibold ${entry.rank === 1 ? 'text-yellow-600 dark:text-yellow-400' : ''}`}>
                                  #{entry.rank}
                                </span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <span className={`font-medium ${entry.rank === 1 ? 'text-yellow-700 dark:text-yellow-300' : ''}`}>
                                {entry.display_name || entry.username}
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`font-bold text-lg ${entry.rank === 1 ? 'text-yellow-600 dark:text-yellow-400' : 'text-blue-600 dark:text-blue-400'}`}>
                                {Math.round(entry.wpm)}
                              </span>
                              <span className="text-sm text-gray-500 ml-1">WPM</span>
                            </td>
                            <td className="py-3 px-4 text-right">
                              <span className={`font-semibold ${entry.rank === 1 ? 'text-yellow-600 dark:text-yellow-400' : 'text-green-600 dark:text-green-400'}`}>
                                {entry.accuracy.toFixed(1)}%
                              </span>
                            </td>
                            <td className="py-3 px-4 text-right text-sm text-gray-500">
                              {new Date(entry.created_at).toLocaleDateString()}
                            </td>
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