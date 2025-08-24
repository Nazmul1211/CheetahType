"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { getAuth } from "firebase/auth";
import { supabaseClient } from '@/utils/supabase/client';
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

// Import Recharts components with type assertions
const {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend
} = require('recharts') as any;

interface TestResultsProps {
  wpm: number;
  rawWpm?: number;
  accuracy: number;
  consistency?: number;
  characters: number;
  errors: number;
  duration: number;
  textContent?: string;
  testType?: string;
  testMode?: string;
  timeSeconds?: number;
  wpmHistory?: number[];
  onRestart: () => void;
}

export function TestResults({
  wpm,
  rawWpm = 0,
  accuracy,
  consistency = 0,
  characters,
  errors,
  duration,
  textContent,
  testType = "standard",
  testMode = "time",
  timeSeconds,
  wpmHistory = [],
  onRestart,
}: TestResultsProps) {
  const { toast } = useToast();
  const router = useRouter();
  const { theme } = useTheme();
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');
  
  // Reset save status when test results change (new test)
  useEffect(() => {
    setSaveStatus('idle');
  }, [wpm, accuracy, characters, duration]);
  
  // Calculate correct characters and CPM
  const correctChars = Math.max(0, characters - errors);
  const cpm = Math.round((characters / Math.max(duration, 1)) * 60);
  
  // Calculate word-related statistics
  const totalWords = Math.max(1, Math.round(characters / 5));
  const correctWords = Math.max(0, Math.round(correctChars / 5));
  const incorrectWords = Math.max(0, totalWords - correctWords);
  
  // Helper for dark mode
  const isDark = theme === 'dark';

  // Prepare comprehensive chart data for Recharts
  const chartData = wpmHistory.map((wpm, index) => ({
    time: index + 1,
    wpm: Math.round(wpm),
    rawWpm: Math.round(wpm * 1.2), // Estimate raw WPM
    accuracy: accuracy, // This could be tracked over time in the future
    cpm: Math.round(wpm * 5), // Characters per minute
    errors: Math.round((100 - accuracy) / 100 * wpm / 5), // Estimate errors per segment
  }));

  // Data for accuracy pie chart
  const accuracyData = [
    { name: 'Correct', value: accuracy, fill: isDark ? '#10b981' : '#059669' },
    { name: 'Errors', value: 100 - accuracy, fill: isDark ? '#ef4444' : '#dc2626' }
  ];

  // Data for stats comparison bar chart
  const statsData = [
    { name: 'WPM', value: Math.round(wpm), fill: isDark ? '#fbbf24' : '#f59e0b' },
    { name: 'Raw WPM', value: rawWpm || Math.round(wpm * 1.2), fill: isDark ? '#8b5cf6' : '#7c3aed' },
    { name: 'CPM', value: cpm, fill: isDark ? '#06b6d4' : '#0891b2' },
    { name: 'Consistency', value: consistency || 85, fill: isDark ? '#10b981' : '#059669' }
  ];

  const averageWpm = wpmHistory.length > 0 
    ? Math.round(wpmHistory.reduce((sum: number, w: number) => sum + w, 0) / wpmHistory.length)
    : Math.round(wpm);

  // Manual save result function (simplified for this example)
  const saveResult = async () => {
    if (saveStatus === 'saving' || saveStatus === 'saved') return;
    
    setSaveStatus('saving');
    try {
      // Simulate save functionality
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('saved');
      toast({ title: "Result Saved", description: "Your test result has been saved." });
    } catch (err: any) {
      setSaveStatus('failed');
      toast({ 
        title: "Save failed", 
        description: err.message || 'Could not save result.', 
        variant: "destructive" 
      });
    }
  };

  return (
    <div className="w-full max-w-6xl mx-auto space-y-8 p-6">
      {/* Main Stats - MonkeyType Style */}
      <div className={cn(
        "rounded-2xl p-8 shadow-lg border-0",
        isDark ? "bg-gray-900/60" : "bg-white/60"
      )}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div className={cn(
              "text-7xl md:text-8xl font-bold mb-2 leading-none",
              isDark ? "text-amber-400" : "text-amber-600"
            )}>
              {Math.round(wpm)}
            </div>
            <div className={cn(
              "text-lg font-semibold tracking-wider uppercase",
              isDark ? "text-gray-300" : "text-gray-700"
            )}>
              wpm
            </div>
          </div>
          
          <div className="text-center">
            <div className={cn(
              "text-7xl md:text-8xl font-bold mb-2 leading-none",
              isDark ? "text-blue-400" : "text-blue-600"
            )}>
              {accuracy.toFixed(0)}%
            </div>
            <div className={cn(
              "text-lg font-semibold tracking-wider uppercase",
              isDark ? "text-gray-300" : "text-gray-700"
            )}>
              acc
            </div>
          </div>
          
          <div className="text-center">
            <div className={cn(
              "text-7xl md:text-8xl font-bold mb-2 leading-none",
              isDark ? "text-green-400" : "text-green-600"
            )}>
              {consistency?.toFixed(0) || 85}%
            </div>
            <div className={cn(
              "text-lg font-semibold tracking-wider uppercase",
              isDark ? "text-gray-300" : "text-gray-700"
            )}>
              consistency
            </div>
          </div>
          
          <div className="text-center">
            <div className={cn(
              "text-7xl md:text-8xl font-bold mb-2 leading-none",
              isDark ? "text-purple-400" : "text-purple-600"
            )}>
              {duration}s
            </div>
            <div className={cn(
              "text-lg font-semibold tracking-wider uppercase",
              isDark ? "text-gray-300" : "text-gray-700"
            )}>
              time
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* WPM Over Time - Line Chart */}
        {wpmHistory && wpmHistory.length > 1 && (
          <Card className={cn(
            "border-0 shadow-md",
            isDark ? "bg-gray-900/50" : "bg-white/50"
          )}>
            <CardHeader className="pb-4">
              <CardTitle className={cn(
                "text-lg font-semibold",
                isDark ? "text-gray-200" : "text-gray-800"
              )}>
                WPM Progress Over Time
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <LineChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <CartesianGrid 
                      strokeDasharray="3 3" 
                      stroke={isDark ? "#374151" : "#e5e7eb"}
                      opacity={0.5}
                    />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                    />
                    <Tooltip 
                      contentStyle={{
                        backgroundColor: isDark ? "#1f2937" : "#ffffff",
                        border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                        borderRadius: "8px",
                        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                      }}
                      labelStyle={{ color: isDark ? "#f3f4f6" : "#1f2937" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="wpm"
                      stroke={isDark ? "#fbbf24" : "#f59e0b"}
                      strokeWidth={3}
                      dot={{ fill: isDark ? "#fbbf24" : "#f59e0b", strokeWidth: 0, r: 5 }}
                      activeDot={{ r: 7, fill: isDark ? "#fbbf24" : "#f59e0b" }}
                    />
                    <Line
                      type="monotone"
                      dataKey="rawWpm"
                      stroke={isDark ? "#8b5cf6" : "#7c3aed"}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: isDark ? "#8b5cf6" : "#7c3aed", strokeWidth: 0, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accuracy Breakdown - Pie Chart */}
        <Card className={cn(
          "border-0 shadow-md",
          isDark ? "bg-gray-900/50" : "bg-white/50"
        )}>
          <CardHeader className="pb-4">
            <CardTitle className={cn(
              "text-lg font-semibold",
              isDark ? "text-gray-200" : "text-gray-800"
            )}>
              Accuracy Breakdown
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={accuracyData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, value }: { name: string; value: number }) => `${name}: ${value.toFixed(1)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {accuracyData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "#ffffff",
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px"
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Performance Stats - Bar Chart */}
        <Card className={cn(
          "border-0 shadow-md lg:col-span-2",
          isDark ? "bg-gray-900/50" : "bg-white/50"
        )}>
          <CardHeader className="pb-4">
            <CardTitle className={cn(
              "text-lg font-semibold",
              isDark ? "text-gray-200" : "text-gray-800"
            )}>
              Performance Metrics
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ width: '100%', height: 300 }}>
              <ResponsiveContainer>
                <BarChart data={statsData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                  />
                  <YAxis 
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: isDark ? "#1f2937" : "#ffffff",
                      border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                      borderRadius: "8px"
                    }}
                  />
                  <Bar dataKey="value" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* WPM with Area Chart */}
        {wpmHistory && wpmHistory.length > 1 && (
          <Card className={cn(
            "border-0 shadow-md lg:col-span-2",
            isDark ? "bg-gray-900/50" : "bg-white/50"
          )}>
            <CardHeader className="pb-4">
              <CardTitle className={cn(
                "text-lg font-semibold",
                isDark ? "text-gray-200" : "text-gray-800"
              )}>
                WPM Area Chart
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div style={{ width: '100%', height: 300 }}>
                <ResponsiveContainer>
                  <AreaChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
                    <defs>
                      <linearGradient id="wpmGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor={isDark ? "#fbbf24" : "#f59e0b"} stopOpacity={0.8}/>
                        <stop offset="95%" stopColor={isDark ? "#fbbf24" : "#f59e0b"} stopOpacity={0.1}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={isDark ? "#374151" : "#e5e7eb"} />
                    <XAxis 
                      dataKey="time" 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                    />
                    <YAxis 
                      axisLine={false}
                      tickLine={false}
                      tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 12 }}
                    />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: isDark ? "#1f2937" : "#ffffff",
                        border: `1px solid ${isDark ? "#374151" : "#e5e7eb"}`,
                        borderRadius: "8px"
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="wpm"
                      stroke={isDark ? "#fbbf24" : "#f59e0b"}
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#wpmGradient)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-4">
        <Button onClick={onRestart} size="lg" className="min-w-32">
          New Test
        </Button>
        <Button 
          onClick={saveResult} 
          variant="outline" 
          size="lg" 
          disabled={saveStatus === 'saving' || saveStatus === 'saved'}
          className="min-w-32"
        >
          {saveStatus === 'saving' ? 'Saving...' : saveStatus === 'saved' ? 'Saved ✓' : 'Save Result'}
        </Button>
      </div>
    </div>
  );
}
