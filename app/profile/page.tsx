"use client";

import { useEffect, useState } from "react";
import { getAuth, onAuthStateChanged, updateProfile, updateEmail, updatePassword, signOut, deleteUser } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";
import { useAuth } from "@/contexts/auth-context";
import { getTestHistory, TestHistoryEntry } from "@/lib/data";

interface Profile {
  name: string;
  email: string;
  image: string;
}

interface UserStats {
  testsCompleted: number;
  averageWpm: number;
  bestWpm: number;
  averageAccuracy: number;
  bestAccuracy: number;
  totalCharacters: number;
  totalErrors: number;
  totalTime: number;
}

export default function ProfilePage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<UserStats | null>(null);
  const [history, setHistory] = useState<TestHistoryEntry[] | null>(null);

  const router = useRouter();
  const { theme } = useTheme();
  const { toast } = useToast();
  const { deleteAccount } = useAuth();

  // Form states
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const calculateUserStats = (history: TestHistoryEntry[]): UserStats => {
    if (history.length === 0) {
      return {
        testsCompleted: 0, averageWpm: 0, bestWpm: 0,
        averageAccuracy: 0, bestAccuracy: 0, totalCharacters: 0,
        totalErrors: 0, totalTime: 0,
      };
    }

    const testsCompleted = history.length;
    const totalTime = history.reduce((acc, test) => acc + test.time, 0);
    const totalWpm = history.reduce((acc, test) => acc + test.wpm, 0);
    const totalAccuracy = history.reduce((acc, test) => acc + test.accuracy, 0);

    const averageWpm = totalWpm / testsCompleted;
    const bestWpm = Math.max(...history.map(test => test.wpm));
    const averageAccuracy = totalAccuracy / testsCompleted;
    const bestAccuracy = Math.max(...history.map(test => test.accuracy));

    return {
      testsCompleted,
      averageWpm: Math.round(averageWpm), bestWpm,
      averageAccuracy: parseFloat(averageAccuracy.toFixed(1)),
      bestAccuracy: parseFloat(bestAccuracy.toFixed(1)),
      totalCharacters: 0, totalErrors: 0, totalTime,
    };
  };

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
        
        // Fetch real data
        getTestHistory(user.uid).then(testHistory => {
          if (testHistory) {
            setHistory(testHistory);
            const calculatedStats = calculateUserStats(testHistory);
            setStats(calculatedStats);
          }
        }).catch(e => {
          setError("Failed to load user data.");
          toast({
            title: "Error",
            description: "Could not load your test history.",
            variant: "destructive",
          });
        }).finally(() => {
          setIsLoading(false);
        });
      } else {
        // User is signed out
        setProfile(null);
        setError("You must be logged in to view your profile.");
        router.push("/login");
        setIsLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, [router, toast]);

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
            <StatCard title="Tests Completed" value={stats?.testsCompleted || 0} theme={theme} />
            <StatCard title="Average WPM" value={Math.round(stats?.averageWpm || 0)} theme={theme} />
            <StatCard title="Best WPM" value={Math.round(stats?.bestWpm || 0)} theme={theme} />
            <StatCard title="Average Accuracy" value={`${(stats?.averageAccuracy || 0).toFixed(1)}%`} theme={theme} />
            <StatCard title="Best Accuracy" value={`${(stats?.bestAccuracy || 0).toFixed(1)}%`} theme={theme} />
            <StatCard title="Total Characters" value={stats?.totalCharacters || 0} theme={theme} />
            <StatCard title="Total Errors" value={stats?.totalErrors || 0} theme={theme} />
            <StatCard title="Total Time" value={`${Math.round((stats?.totalTime || 0) / 60)} min`} theme={theme} />
          </div>
        </TabsContent>
        
        <TabsContent value="history">
          <Card className={getCardClass()}>
            <CardHeader>
              <CardTitle className={getTextClass()}>Test History</CardTitle>
              <CardDescription className={getSubTextClass()}>
                Your recent typing tests
              </CardDescription>
            </CardHeader>
            <CardContent className={getTextClass()}>
              {history && history.length > 0 ? (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>WPM</TableHead>
                      <TableHead>Accuracy</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {history.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>{test.wpm}</TableCell>
                        <TableCell>{test.accuracy.toFixed(1)}%</TableCell>
                        <TableCell>{test.time}s</TableCell>
                        <TableCell>{new Date(test.created_at).toLocaleDateString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              ) : (
                <p>No test history found.</p>
              )}
            </CardContent>
          </Card>
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
          <Card className={getCardClass()}>
            <CardHeader>
              <CardTitle className={getTextClass()}>Typing Preferences</CardTitle>
              <CardDescription className={getSubTextClass()}>
                Customize your typing experience
              </CardDescription>
            </CardHeader>
            <CardContent className={getTextClass()}>
              <p>Coming soon: Customize your typing experience</p>
            </CardContent>
          </Card>
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