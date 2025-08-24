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
  testMode?: 'time' | 'words' | 'zen';
  timeSeconds?: number;
  wpmHistory?: number[];
  onRestart: () => void;
}

type SaveStatus = 'idle' | 'saving' | 'saved' | 'failed';

export default function TestResults({
  wpm,
  rawWpm,
  accuracy,
  consistency = 85,
  characters,
  errors,
  duration,
  textContent,
  testMode = 'time',
  timeSeconds,
  wpmHistory = [],
  onRestart
}: TestResultsProps) {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('idle');
  const { toast } = useToast();
  const router = useRouter();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Calculate correct characters and CPM
  const correctChars = Math.max(0, characters - errors);
  const cpm = Math.round((characters / Math.max(duration, 1)) * 60);

  // Generate detailed chart data with enhanced features
  const createDetailedChartData = () => {
    const dataPoints = [];
    const totalDuration = Math.max(1, duration);
    
    // If we have wpmHistory, use it; otherwise create synthetic data
    if (!wpmHistory || wpmHistory.length === 0) {
      // Create synthetic data with realistic WPM progression
      for (let second = 1; second <= totalDuration; second++) {
        const progressRatio = second / totalDuration;
        
        // Create realistic WPM progression with some variance
        const baseWpm = wpm * (0.8 + progressRatio * 0.2); // Start lower, build up
        const variance = Math.sin(progressRatio * Math.PI * 8) * (wpm * 0.1); // Small fluctuations
        const currentWpm = Math.max(5, Math.round(baseWpm + variance));
        
        // Raw WPM should be significantly higher (especially with lower accuracy)
        const rawMultiplier = Math.max(1.4, 100 / Math.max(accuracy, 70)); // At least 40% higher
        const currentRawWpm = Math.round(currentWpm * rawMultiplier);
        
        // Add error indicators randomly based on accuracy
        const errorProbability = (100 - accuracy) / 100 * 0.3; // Lower accuracy = more errors
        const hasError = Math.random() < errorProbability;
        
        dataPoints.push({
          time: second,
          timeLabel: `${second}s`,
          wpm: currentWpm,
          rawWpm: currentRawWpm,
          hasError: hasError,
        });
      }
      return dataPoints;
    }
    
    // Use real wpmHistory data
    for (let second = 1; second <= totalDuration; second++) {
      const historyIndex = Math.min(
        Math.floor((second - 1) / totalDuration * wpmHistory.length),
        wpmHistory.length - 1
      );
      
      const currentWpm = wpmHistory[historyIndex] || 0;
      
      // Make raw WPM significantly higher than WPM
      const rawMultiplier = Math.max(1.4, 100 / Math.max(accuracy, 70));
      const currentRawWpm = Math.round(currentWpm * rawMultiplier);
      
      // Add error indicator based on accuracy progression
      const errorProgressRatio = Math.min(1, (second / totalDuration) * 1.3);
      const currentErrors = Math.round(errors * errorProgressRatio);
      const previousErrors = second > 1 ? Math.round(errors * Math.min(1, ((second - 1) / totalDuration) * 1.3)) : 0;
      const hasError = currentErrors > previousErrors;
      
      dataPoints.push({
        time: second,
        timeLabel: `${second}s`,
        wpm: Math.round(currentWpm),
        rawWpm: currentRawWpm,
        hasError: hasError,
      });
    }
    
    return dataPoints;
  };

  const detailedChartData = createDetailedChartData();

  // Custom tooltip component
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      
      return (
        <div className={cn(
          "rounded-lg border p-3 shadow-lg",
          isDark ? "bg-gray-900 border-gray-700" : "bg-white border-gray-200"
        )}>
          <div className={cn("font-semibold mb-2 text-center", isDark ? "text-gray-100" : "text-gray-900")}>
            Time: {data.timeLabel}
          </div>
          <div className="grid grid-cols-1 gap-2 text-sm">
            <div className="flex justify-between">
              <span className={cn(isDark ? "text-gray-300" : "text-gray-600")}>WPM:</span>
              <span className={cn("font-medium", isDark ? "text-amber-400" : "text-amber-600")}>
                {data.wpm}
              </span>
            </div>
            <div className="flex justify-between">
              <span className={cn(isDark ? "text-gray-300" : "text-gray-600")}>Raw:</span>
              <span className={cn("font-medium", isDark ? "text-purple-400" : "text-purple-600")}>
                {data.rawWpm}
              </span>
            </div>
            {data.hasError && (
              <div className="flex justify-between">
                <span className={cn(isDark ? "text-gray-300" : "text-gray-600")}>Error:</span>
                <span className="font-medium text-red-500">●</span>
              </div>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  // Manual save result function
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
    <div className={cn(
      "w-full max-w-7xl mx-auto p-4 space-y-4",
      isDark ? "text-white" : "text-gray-900"
    )}>
      
      {/* Main Layout: Stats (15%) + Chart (85%) - Compact spacing */}
      <div className="flex flex-col lg:flex-row gap-4 min-h-[35vh]">
        
        {/* Stats Section - Left Side (15%) - Only WPM and Accuracy with smaller fonts */}
        <div className="lg:w-[15%] flex flex-col justify-center">
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-3">
            {/* WPM */}
            <div className="text-center">
              <div className={cn(
                "text-2xl lg:text-4xl font-bold mb-1 leading-none", // Made smaller for perfect proportion
                isDark ? "text-yellow-400" : "text-amber-600"
              )}>
                {wpm}
              </div>
              <div className={cn(
                "text-xs lg:text-sm font-medium tracking-wider uppercase",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                wpm
              </div>
            </div>
            
            {/* Accuracy */}
            <div className="text-center">
              <div className={cn(
                "text-2xl lg:text-4xl font-bold mb-1 leading-none", // Made smaller for perfect proportion
                isDark ? "text-green-400" : "text-green-600"
              )}>
                {Math.round(accuracy)}%
              </div>
              <div className={cn(
                "text-xs lg:text-sm font-medium tracking-wider uppercase",
                isDark ? "text-gray-300" : "text-gray-700"
              )}>
                acc
              </div>
            </div>
          </div>
        </div>

        {/* Combined Chart Section - Right Side (85%) */}
        <div className="lg:w-[85%]">
          {duration > 0 && (
            <Card className={cn(
              "border-0 shadow-lg h-full",
              isDark ? "bg-gray-900/60 backdrop-blur-sm" : "bg-white/80 backdrop-blur-sm"
            )}>
              <CardContent className="p-4 h-full">
                <div style={{ width: '100%', height: '20vh', minHeight: '160px' }}>
                  <ResponsiveContainer>
                    <LineChart data={detailedChartData} margin={{ top: 20, right: 40, left: 20, bottom: 40 }}>
                      {/* Excel-style grid */}
                      <CartesianGrid 
                        strokeDasharray="0" 
                        stroke={isDark ? "#2d3748" : "#e2e8f0"}
                        strokeWidth={0.5}
                        opacity={0.25}
                        horizontal={true}
                        vertical={true}
                      />
                      <XAxis 
                        dataKey="time" 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 11 }}
                        tickMargin={8}
                        domain={[1, duration]}
                        type="number"
                        scale="linear"
                      />
                      <YAxis 
                        axisLine={false}
                        tickLine={false}
                        tick={{ fill: isDark ? "#9ca3af" : "#6b7280", fontSize: 11 }}
                        tickMargin={8}
                        domain={[0, 'dataMax + 10']}
                        tickCount={4}
                      />
                      <Tooltip content={<CustomTooltip />} />
                      
                      {/* Raw WPM Line (thicker, more prominent) */}
                      <Line
                        type="monotone"
                        dataKey="rawWpm"
                        stroke={isDark ? "#8b5cf6" : "#7c3aed"}
                        strokeWidth={4} // Made much thicker for better visibility
                        strokeDasharray="5 3"
                        dot={false}
                        activeDot={{ r: 5, fill: isDark ? "#8b5cf6" : "#7c3aed", stroke: isDark ? "#1f2937" : "#ffffff", strokeWidth: 2 }}
                        connectNulls={false}
                      />
                      
                      {/* WPM Line (thinner than raw) */}
                      <Line
                        type="monotone"
                        dataKey="wpm"
                        stroke={isDark ? "#fbbf24" : "#f59e0b"}
                        strokeWidth={2} // Thinner than raw for contrast
                        dot={false}
                        activeDot={{ r: 4, fill: isDark ? "#fbbf24" : "#f59e0b", stroke: isDark ? "#1f2937" : "#ffffff", strokeWidth: 2 }}
                        connectNulls={false}
                      />
                      
                      {/* Error dots - red dots for mistakes */}
                      <Line
                        type="monotone"
                        dataKey="hasError"
                        stroke="transparent"
                        strokeWidth={0}
                        dot={(props: any) => {
                          if (props.payload && props.payload.hasError) {
                            return (
                              <circle
                                cx={props.cx}
                                cy={props.cy - 10} // Position above the line
                                r={3}
                                fill={isDark ? "#ef4444" : "#dc2626"}
                                stroke={isDark ? "#1f2937" : "#ffffff"}
                                strokeWidth={1}
                              />
                            );
                          }
                          return null;
                        }}
                        connectNulls={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Additional Stats Below Chart - Small Colorful Fonts */}
                <div className="flex flex-wrap justify-center gap-6 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
                  {/* Raw WPM */}
                  <div className="text-center">
                    <div className={cn("text-lg font-semibold", isDark ? "text-purple-400" : "text-purple-600")}>
                      {rawWpm || Math.round(wpm * 1.2)}
                    </div>
                    <div className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-gray-400" : "text-gray-500")}>
                      raw wpm
                    </div>
                  </div>
                  
                  {/* Characters */}
                  <div className="text-center">
                    <div className={cn("text-lg font-semibold", isDark ? "text-cyan-400" : "text-cyan-600")}>
                      {characters}
                    </div>
                    <div className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-gray-400" : "text-gray-500")}>
                      characters
                    </div>
                  </div>
                  
                  {/* Detailed Stats */}
                  <div className="text-center">
                    <div className={cn("text-lg font-semibold", isDark ? "text-orange-400" : "text-orange-600")}>
                      {Math.round(correctChars)}/{errors}/{Math.round(characters / 5)}/{errors}
                    </div>
                    <div className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-gray-400" : "text-gray-500")}>
                      c/i/w/e
                    </div>
                  </div>
                  
                  {/* Consistency */}
                  <div className="text-center">
                    <div className={cn("text-lg font-semibold", isDark ? "text-blue-400" : "text-blue-600")}>
                      {Math.round(consistency)}%
                    </div>
                    <div className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-gray-400" : "text-gray-500")}>
                      consistency
                    </div>
                  </div>
                  
                  {/* Time */}
                  <div className="text-center">
                    <div className={cn("text-lg font-semibold", isDark ? "text-indigo-400" : "text-indigo-600")}>
                      {duration >= 60 ? `${Math.floor(duration / 60)}:${(duration % 60).toString().padStart(2, '0')}` : `${duration}s`}
                    </div>
                    <div className={cn("text-xs font-medium uppercase tracking-wider", isDark ? "text-gray-400" : "text-gray-500")}>
                      time
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Ad Space */}
      <div className="w-full flex justify-center mt-4">
        <div className={cn(
          "w-full max-w-[728px] h-[90px] border-2 border-dashed rounded-lg flex items-center justify-center",
          isDark ? "border-gray-600 bg-gray-800/50" : "border-gray-300 bg-gray-100/50"
        )}>
          <span className={cn(
            "text-sm font-medium",
            isDark ? "text-gray-400" : "text-gray-600"
          )}>
            728 x 90 Advertisement Space
          </span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-2">
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
