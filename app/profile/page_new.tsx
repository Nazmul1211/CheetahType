"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, updateProfile, updateEmail, updatePassword } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Square, Underline, BoxSelect, Type, TrendingUp, Trophy, Target, Clock } from 'lucide-react';
import { useUserSettings } from "@/lib/user-settings";

interface Profile {
  name: string;
  email: string;
  image: string;
}

interface UserStats {
  totalTests: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  bestAccuracy: number;
  averageConsistency: number;
  bestConsistency: number;
  totalTimeSpent: number;
  totalCharactersTyped: number;
  recentTests: any[];
  wpmProgress: any[];
  accuracyProgress: any[];
  testsByMode: { [key: string]: any };
  testsByTimeLimit: { [key: string]: any };
}

interface TestResult {
  id: string;
  wpm: number;
  accuracy: number;
  consistency: number; 
  test_mode: string;
  time_limit?: number;
  word_limit?: number;
  actual_duration: number;
  created_at: string;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [latestTest, setLatestTest] = useState<TestResult | null>(null);
  const router = useRouter();
  const { theme } = useTheme();
  const { toast } = useToast();
  const { deleteAccount } = useAuth();
  const { settings, updateSettings, resetSettings } = useUserSettings();

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const auth = getAuth();
    
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in
        const userProfile = {
          name: user.displayName || "User",
          email: user.email || "",
          image: user.photoURL || "",
        };
        
        setProfile(userProfile);
        setDisplayName(userProfile.name);
        setEmail(userProfile.email);
        setAvatarUrl(userProfile.image);
        
        try {
          // Fetch user statistics from our new API
          const response = await fetch(`/api/users/stats?firebase_uid=${user.uid}`);
          const data = await response.json();

          if (data.success) {
            setStats(data.stats);
            
            // Set the latest test if available
            if (data.stats.recentTests && data.stats.recentTests.length > 0) {
              setLatestTest(data.stats.recentTests[0]);
            }
          } else {
            console.error('Failed to load user stats:', data.error);
            // Initialize empty stats if user not found (new user)
            setStats({
              totalTests: 0,
              averageWpm: 0,
              bestWpm: 0,
              averageAccuracy: 0,
              bestAccuracy: 0,
              averageConsistency: 0,
              bestConsistency: 0,
              totalTimeSpent: 0,
              totalCharactersTyped: 0,
              recentTests: [],
              wpmProgress: [],
              accuracyProgress: [],
              testsByMode: {},
              testsByTimeLimit: {}
            });
          }
          setIsLoading(false);
        } catch (e) {
          console.error('Failed to load user stats', e);
          setIsLoading(false);
        }
      } else {
        // User is signed out
        setProfile(null);
        setError("You must be logged in to view your profile.");
        router.push("/login");
        setIsLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [router]);

  const handleProfileUpdate = async () => {
    try {
      setIsUpdating(true);
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update your profile.",
          variant: "destructive",
        });
        return;
      }
      
      // Update display name and photo URL
      await updateProfile(user, {
        displayName,
        photoURL: avatarUrl
      });
      
      // Update email if changed
      if (email !== user.email) {
        await updateEmail(user, email);
      }

      // Update profile in our database
      const response = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firebase_uid: user.uid,
          email,
          display_name: displayName,
          photo_url: avatarUrl
        })
      });

      if (!response.ok) {
        throw new Error('Failed to update profile in database');
      }
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
      });
      
      // Update local state
      setProfile({
        name: displayName,
        email: email,
        image: avatarUrl
      });
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update profile. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handlePasswordUpdate = async () => {
    try {
      setIsUpdating(true);
      
      if (newPassword !== confirmPassword) {
        toast({
          title: "Passwords Don't Match",
          description: "New password and confirmation must match.",
          variant: "destructive",
        });
        return;
      }
      
      const auth = getAuth();
      const user = auth.currentUser;
      
      if (!user) {
        toast({
          title: "Error",
          description: "You must be logged in to update your password.",
          variant: "destructive",
        });
        return;
      }
      
      await updatePassword(user, newPassword);
      
      toast({
        title: "Password Updated",
        description: "Your password has been successfully updated.",
      });
      
      // Clear password fields
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (error: any) {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAccountDeletion = async () => {
    try {
      const auth = getAuth();
      const user = auth.currentUser;
      if (user) {
        // First delete user from our database
        try {
          await fetch(`/api/users?firebase_uid=${user.uid}`, { method: 'DELETE' });
        } catch (e) {
          console.error('Failed to delete user in database', e);
        }
      }

      await deleteAccount();
      toast({
        title: "Account Deleted",
        description: "Your account has been successfully deleted.",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        title: "Deletion Failed",
        description: error.message || "Failed to delete account. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <div className="grid gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-32 w-full" />
        </div>
      </div>
    );
  }
  
  if (error || !profile) {
    return (
      <div className="container max-w-7xl mx-auto p-4">
        <h1 className="text-3xl font-bold mb-6">Profile</h1>
        <Card>
          <CardHeader>
            <CardTitle>Error</CardTitle>
            <CardDescription>
              {error || "You must be logged in to view your profile."}
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }
  
  // Helper function for styling based on theme
  const isDark = theme === 'dark';
  const getCardClass = () => isDark ? 'bg-zinc-900' : 'bg-card';
  const getInnerCardClass = () => isDark ? 'bg-zinc-800 border-zinc-700' : 'bg-card';
  const getTextClass = () => isDark ? 'text-white' : '';
  const getSubTextClass = () => isDark ? 'text-gray-300' : '';
  const getInputClass = () => isDark ? 'bg-zinc-800 border-zinc-600 focus:border-zinc-400 text-white' : '';
  
  // Render test history content
  const renderTestHistory = () => {
    if (!latestTest || !stats) return <p>No test history available</p>;
    
    const formatDate = (dateString: string) => {
      const date = new Date(dateString);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };
    
    return (
      <div className="grid gap-6">
        {/* Latest Test Results */}
        <Card className={getCardClass()}>
          <CardHeader>
            <CardTitle className={getTextClass()}>Latest Test</CardTitle>
            <CardDescription className={getSubTextClass()}>
              Completed on {formatDate(latestTest.created_at)}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className={`p-4 rounded-lg border ${getInnerCardClass()}`}>
                <div className="text-sm text-muted-foreground">WPM</div>
                <div className={`text-3xl font-bold ${getTextClass()}`}>{Math.round(latestTest.wpm)}</div>
              </div>
              <div className={`p-4 rounded-lg border ${getInnerCardClass()}`}>
                <div className="text-sm text-muted-foreground">Accuracy</div>
                <div className={`text-3xl font-bold ${getTextClass()}`}>{(latestTest.accuracy * 100).toFixed(1)}%</div>
              </div>
              <div className={`p-4 rounded-lg border ${getInnerCardClass()}`}>
                <div className="text-sm text-muted-foreground">Consistency</div>
                <div className={`text-3xl font-bold ${getTextClass()}`}>
                  {latestTest.consistency ? (latestTest.consistency * 100).toFixed(1) : 'N/A'}%
                </div>
              </div>
              <div className={`p-4 rounded-lg border ${getInnerCardClass()}`}>
                <div className="text-sm text-muted-foreground">Duration</div>
                <div className={`text-3xl font-bold ${getTextClass()}`}>{latestTest.actual_duration}s</div>
              </div>
              <div className={`p-4 rounded-lg border ${getInnerCardClass()}`}>
                <div className="text-sm text-muted-foreground">Mode</div>
                <div className={`text-xl font-bold ${getTextClass()}`}>{latestTest.test_mode}</div>
                {latestTest.time_limit && (
                  <div className="text-xs text-muted-foreground">{latestTest.time_limit}s</div>
                )}
                {latestTest.word_limit && (
                  <div className="text-xs text-muted-foreground">{latestTest.word_limit} words</div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
        
        {/* Performance by Mode */}
        {Object.keys(stats.testsByMode).length > 0 && (
          <Card className={getCardClass()}>
            <CardHeader>
              <CardTitle className={getTextClass()}>Performance by Mode</CardTitle>
              <CardDescription className={getSubTextClass()}>
                Your statistics across different test modes
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Object.entries(stats.testsByMode).map(([mode, modeStats]) => (
                  <div key={mode} className={`p-4 rounded-lg border ${getInnerCardClass()}`}>
                    <h4 className={`font-semibold mb-2 capitalize ${getTextClass()}`}>{mode}</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                      <div>
                        <div className="text-muted-foreground">Tests</div>
                        <div className={`font-bold ${getTextClass()}`}>{modeStats.count}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg WPM</div>
                        <div className={`font-bold ${getTextClass()}`}>{modeStats.averageWpm}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Best WPM</div>
                        <div className={`font-bold ${getTextClass()}`}>{modeStats.bestWpm}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Avg Accuracy</div>
                        <div className={`font-bold ${getTextClass()}`}>{modeStats.averageAccuracy}%</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
        
        {/* Recent Tests List */}
        {stats.recentTests.length > 0 && (
          <Card className={getCardClass()}>
            <CardHeader>
              <CardTitle className={getTextClass()}>Recent Tests</CardTitle>
              <CardDescription className={getSubTextClass()}>
                Your last {stats.recentTests.length} typing tests
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {stats.recentTests.map((test, index) => (
                  <div key={test.id || index} className={`p-3 rounded-lg border ${getInnerCardClass()}`}>
                    <div className="flex justify-between items-center">
                      <div className="flex gap-4">
                        <span className={`font-bold ${getTextClass()}`}>{test.wpm} WPM</span>
                        <span className={getSubTextClass()}>{(test.accuracy * 100).toFixed(1)}%</span>
                        <span className={`text-xs ${getSubTextClass()}`}>{test.test_mode}</span>
                      </div>
                      <span className={`text-xs ${getSubTextClass()}`}>
                        {formatDate(test.created_at)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    );
  };

  // Render settings (keeping the existing settings implementation)
  const renderSettings = () => {
    if (!settings) return <p>Loading settings...</p>;
    
    return (
      <div className="space-y-8">
        <Card className={getCardClass()}>
          <CardHeader>
            <CardTitle className={getTextClass()}>Appearance</CardTitle>
            <CardDescription className={getSubTextClass()}>
              Customize the visual style of your typing tests
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h3 className={`text-sm font-medium mb-2 ${getTextClass()}`}>Font Family</h3>
              <RadioGroup
                value={settings.fontFamily}
                onValueChange={(value) => updateSettings({ fontFamily: value as 'mono' | 'sans' | 'serif' })}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="mono" id="font-mono-profile" />
                  <Label htmlFor="font-mono-profile" className={`font-mono ${getSubTextClass()}`}>Monospace</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sans" id="font-sans-profile" />
                  <Label htmlFor="font-sans-profile" className={`font-sans ${getSubTextClass()}`}>Sans Serif</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="serif" id="font-serif-profile" />
                  <Label htmlFor="font-serif-profile" className={`font-serif ${getSubTextClass()}`}>Serif</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <h3 className={`text-sm font-medium mb-2 ${getTextClass()}`}>Font Size</h3>
              <RadioGroup
                value={settings.fontSize}
                onValueChange={(value) => updateSettings({ fontSize: value as 'small' | 'medium' | 'large' })}
                className="flex flex-col space-y-1"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="small" id="font-small-profile" />
                  <Label htmlFor="font-small-profile" className={`text-sm ${getSubTextClass()}`}>Small</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="medium" id="font-medium-profile" />
                  <Label htmlFor="font-medium-profile" className={`text-base ${getSubTextClass()}`}>Medium</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="large" id="font-large-profile" />
                  <Label htmlFor="font-large-profile" className={`text-lg ${getSubTextClass()}`}>Large</Label>
                </div>
              </RadioGroup>
            </div>

            <div>
              <h3 className={`text-sm font-medium mb-2 ${getTextClass()}`}>Caret Style</h3>
              <RadioGroup
                value={settings.caretStyle}
                onValueChange={(value) => updateSettings({ caretStyle: value as 'block' | 'underline' | 'outline' | 'straight' })}
                className="grid grid-cols-2 gap-2"
              >
                <div className={`flex items-center p-2 rounded-md border ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100'} transition-colors`}>
                  <RadioGroupItem value="block" id="caret-block-profile" className="sr-only" />
                  <Label 
                    htmlFor="caret-block-profile" 
                    className={`flex flex-col items-center justify-center cursor-pointer w-full ${getSubTextClass()}`}
                  >
                    <Square className="h-5 w-5 mb-1" />
                    <span>Block</span>
                  </Label>
                </div>
                <div className={`flex items-center p-2 rounded-md border ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100'} transition-colors`}>
                  <RadioGroupItem value="underline" id="caret-underline-profile" className="sr-only" />
                  <Label 
                    htmlFor="caret-underline-profile"
                    className={`flex flex-col items-center justify-center cursor-pointer w-full ${getSubTextClass()}`}
                  >
                    <Underline className="h-5 w-5 mb-1" />
                    <span>Underline</span>
                  </Label>
                </div>
                <div className={`flex items-center p-2 rounded-md border ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100'} transition-colors`}>
                  <RadioGroupItem value="outline" id="caret-outline-profile" className="sr-only" />
                  <Label 
                    htmlFor="caret-outline-profile"
                    className={`flex flex-col items-center justify-center cursor-pointer w-full ${getSubTextClass()}`}
                  >
                    <BoxSelect className="h-5 w-5 mb-1" />
                    <span>Outline</span>
                  </Label>
                </div>
                <div className={`flex items-center p-2 rounded-md border ${isDark ? 'border-zinc-700 hover:bg-zinc-800' : 'border-slate-200 hover:bg-slate-100'} transition-colors`}>
                  <RadioGroupItem value="straight" id="caret-straight-profile" className="sr-only" />
                  <Label 
                    htmlFor="caret-straight-profile"
                    className={`flex flex-col items-center justify-center cursor-pointer w-full ${getSubTextClass()}`}
                  >
                    <Type className="h-5 w-5 mb-1" />
                    <span>Straight</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
            
            <div className="flex items-center justify-between pt-2">
              <Label htmlFor="caret-blink-profile" className={getSubTextClass()}>Caret Blink</Label>
              <Switch
                id="caret-blink-profile"
                checked={settings.caretBlink}
                onCheckedChange={(checked) => updateSettings({ caretBlink: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={getCardClass()}>
          <CardHeader>
            <CardTitle className={getTextClass()}>Behavior</CardTitle>
            <CardDescription className={getSubTextClass()}>
              Adjust typing test behavior
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <Label htmlFor="show-keyboard-profile" className={getSubTextClass()}>Show Keyboard</Label>
              <Switch
                id="show-keyboard-profile"
                checked={settings.showKeyboard}
                onCheckedChange={(checked) => updateSettings({ showKeyboard: checked })}
              />
            </div>

            <div className="flex items-center justify-between">
              <Label htmlFor="sound-enabled-profile" className={getSubTextClass()}>Sound Effects</Label>
              <Switch
                id="sound-enabled-profile"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => updateSettings({ soundEnabled: checked })}
              />
            </div>
          </CardContent>
        </Card>

        <Card className={getCardClass()}>
          <CardHeader>
            <CardTitle className={getTextClass()}>Custom Text</CardTitle>
            <CardDescription className={getSubTextClass()}>
              Use your own text for practice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              value={settings.customText || ''}
              onChange={(e) => updateSettings({ customText: e.target.value })}
              className={`min-h-[150px] ${getInputClass()}`}
              placeholder="Enter your custom text here..."
            />
            <p className={`text-xs ${getSubTextClass()}`}>
              Enter your own text to practice with specific content.
            </p>
          </CardContent>
          <CardFooter>
            <div className="flex flex-col sm:flex-row gap-4 w-full justify-between">
              <Button variant="outline" onClick={resetSettings}>
                Reset to Defaults
              </Button>
              <Button onClick={() => toast({ title: "Settings Saved", description: "Your settings have been saved" })}>
                Save Settings
              </Button>
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  };
  
  return (
    <div className="container max-w-7xl mx-auto p-4">
      <h1 className={`text-3xl font-bold mb-6 ${getTextClass()}`}>Profile</h1>
      
      <div className="mb-6">
        <Card className={getCardClass()}>
          <CardContent className="p-6">
            <div className="flex items-center space-x-4">
              <Avatar className="w-16 h-16">
                <AvatarImage src={profile.image} alt={profile.name} />
                <AvatarFallback className={`text-2xl ${isDark ? 'bg-zinc-700 text-white' : ''}`}>
                  {profile.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className={`text-2xl font-bold ${getTextClass()}`}>{profile.name}</h2>
                <p className={`text-muted-foreground ${getSubTextClass()}`}>{profile.email}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="stats">
        <TabsList className="mb-4 w-full overflow-x-auto flex-wrap">
          <TabsTrigger value="stats" className="text-xs sm:text-sm">Statistics</TabsTrigger>
          <TabsTrigger value="history" className="text-xs sm:text-sm">Test History</TabsTrigger>
          <TabsTrigger value="account" className="text-xs sm:text-sm">Account</TabsTrigger>
          <TabsTrigger value="settings" className="text-xs sm:text-sm">Settings</TabsTrigger>
        </TabsList>
        
        <TabsContent value="stats">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard title="Tests Completed" value={stats?.totalTests || 0} theme={theme} />
            <StatCard title="Average WPM" value={Math.round(stats?.averageWpm || 0)} theme={theme} />
            <StatCard title="Best WPM" value={Math.round(stats?.bestWpm || 0)} theme={theme} />
            <StatCard title="Average Accuracy" value={`${(stats?.averageAccuracy || 0).toFixed(1)}%`} theme={theme} />
            <StatCard title="Best Accuracy" value={`${(stats?.bestAccuracy || 0).toFixed(1)}%`} theme={theme} />
            <StatCard title="Total Characters" value={stats?.totalCharactersTyped || 0} theme={theme} />
            <StatCard title="Average Consistency" value={`${(stats?.averageConsistency || 0).toFixed(1)}%`} theme={theme} />
            <StatCard title="Total Time" value={`${Math.round((stats?.totalTimeSpent || 0) / 60)} min`} theme={theme} />
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          {renderTestHistory()}
        </TabsContent>
        
        <TabsContent value="account">
          <div className="grid gap-6">
            <Card className={getCardClass()}>
              <CardHeader>
                <CardTitle className={getTextClass()}>Profile Information</CardTitle>
                <CardDescription className={getSubTextClass()}>
                  Update your account information
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="displayName" className={getTextClass()}>Display Name</Label>
                    <Input 
                      id="displayName" 
                      value={displayName} 
                      onChange={(e) => setDisplayName(e.target.value)}
                      className={getInputClass()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="email" className={getTextClass()}>Email</Label>
                    <Input 
                      id="email" 
                      type="email" 
                      value={email} 
                      onChange={(e) => setEmail(e.target.value)}
                      className={getInputClass()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="avatarUrl" className={getTextClass()}>Avatar URL</Label>
                    <Input 
                      id="avatarUrl" 
                      value={avatarUrl} 
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      className={getInputClass()}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handleProfileUpdate} 
                  disabled={isUpdating}
                >
                  {isUpdating ? "Updating..." : "Update Profile"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card className={getCardClass()}>
              <CardHeader>
                <CardTitle className={getTextClass()}>Change Password</CardTitle>
                <CardDescription className={getSubTextClass()}>
                  Update your password
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <Label htmlFor="currentPassword" className={getTextClass()}>Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      value={currentPassword} 
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      className={getInputClass()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="newPassword" className={getTextClass()}>New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password" 
                      value={newPassword} 
                      onChange={(e) => setNewPassword(e.target.value)}
                      className={getInputClass()}
                    />
                  </div>
                  <div>
                    <Label htmlFor="confirmPassword" className={getTextClass()}>Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={confirmPassword} 
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={getInputClass()}
                    />
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={handlePasswordUpdate} 
                  disabled={isUpdating || !newPassword || newPassword !== confirmPassword}
                >
                  {isUpdating ? "Updating..." : "Update Password"}
                </Button>
              </CardFooter>
            </Card>
            
            <Card className={getCardClass()}>
              <CardHeader>
                <CardTitle className={getTextClass()}>Danger Zone</CardTitle>
                <CardDescription className={getSubTextClass()}>
                  Irreversible account actions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive">Delete Account</Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className={isDark ? 'bg-zinc-900 border-zinc-800 text-white' : ''}>
                    <AlertDialogHeader>
                      <AlertDialogTitle className={getTextClass()}>Are you absolutely sure?</AlertDialogTitle>
                      <AlertDialogDescription className={getSubTextClass()}>
                        This action cannot be undone. This will permanently delete your
                        account and remove all your data from our servers.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className={isDark ? 'bg-zinc-800 hover:bg-zinc-700' : ''}>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={handleAccountDeletion}>
                        Delete Account
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="settings">
          {renderSettings()}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function StatCard({ title, value, theme }: { title: string; value: number | string; theme?: string }) {
  const isDark = theme === 'dark';
  const cardClass = isDark ? 'bg-zinc-900' : 'bg-card';
  const textClass = isDark ? 'text-white' : '';
  const subTextClass = isDark ? 'text-gray-300' : '';
  
  return (
    <Card className={cardClass}>
      <CardHeader className="pb-2">
        <CardDescription className={subTextClass}>{title}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className={`text-3xl font-bold ${textClass}`}>{value}</p>
      </CardContent>
    </Card>
  );
}
