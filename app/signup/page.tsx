"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { useSearchParams, useRouter } from "next/navigation";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";
import { Github } from "lucide-react";
import { useAuth } from "@/contexts/auth-context";

export default function SignupPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const searchParams = useSearchParams();
  const router = useRouter();
  const { signUp, signInWithGoogle, signInWithGithub } = useAuth();
  
  const queryError = searchParams.get("error");
  const queryMessage = searchParams.get("message");
  const queryEmail = searchParams.get("email");

  // Use query params for initial error/message state
  useEffect(() => {
    if (queryError) setErrorMessage(queryError);
    if (queryMessage) setStatusMessage(queryMessage);
  }, [queryError, queryMessage]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage(null);
    setStatusMessage(null);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    try {
      await signUp(email, password);
      setStatusMessage("Account created successfully! You can now sign in.");
      
      // Redirect to login page after a short delay
      setTimeout(() => {
        router.push("/login?message=Account created successfully! You can now sign in.");
      }, 2000);
    } catch (error: any) {
      console.error("Signup error:", error);
      setErrorMessage(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleSocialLogin = async (provider: 'google' | 'github') => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      if (provider === 'google') {
        await signInWithGoogle();
      } else if (provider === 'github') {
        await signInWithGithub();
      }
      router.push("/");
    } catch (error: any) {
      console.error("Social login error:", error);
      setErrorMessage(error.message || "Failed to login with provider");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-slate-900 py-6">
      <Card className="w-[380px] bg-slate-800 border-slate-700 shadow-lg">
        <CardHeader className="space-y-1 pb-4">
          <CardTitle className="text-2xl text-teal-400 text-center">
            Create an account
          </CardTitle>
          <CardDescription className="text-slate-400 text-center">
            Enter your details to create an account
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-3">
          {errorMessage && (
            <Alert className="mb-3 bg-red-900/30 border-red-800 text-red-300">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{errorMessage}</AlertDescription>
            </Alert>
          )}
          {statusMessage && (
            <Alert className="mb-3 bg-green-900/30 border-green-800 text-green-300">
              <AlertDescription>{statusMessage}</AlertDescription>
            </Alert>
          )}
          
          <div className="space-y-3">
            <Button
              type="button"
              variant="outline"
              className="w-full bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200"
              onClick={() => handleSocialLogin('google')}
              disabled={isLoading}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="mr-2 h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12.545,10.239v3.821h5.445c-0.712,2.315-2.647,3.972-5.445,3.972c-3.332,0-6.033-2.701-6.033-6.032s2.701-6.032,6.033-6.032c1.498,0,2.866,0.549,3.921,1.453l2.814-2.814C17.503,2.988,15.139,2,12.545,2C7.021,2,2.543,6.477,2.543,12s4.478,10,10.002,10c8.396,0,10.249-7.85,9.426-11.748L12.545,10.239z"/>
              </svg>
              Sign up with Google
            </Button>
            
            <Button
              type="button"
              variant="outline"
              className="w-full bg-slate-700 border-slate-600 hover:bg-slate-600 text-slate-200"
              onClick={() => handleSocialLogin('github')}
              disabled={isLoading}
            >
              <Github className="mr-2 h-4 w-4" />
              Sign up with GitHub
            </Button>

            <div className="relative my-3">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-slate-600" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="px-2 bg-slate-800 text-slate-400">or continue with email</span>
              </div>
            </div>
          
            <form onSubmit={onSubmit} className="space-y-3">
              <div className="space-y-3">
                <div className="space-y-1">
                  <Label htmlFor="email" className="text-sm text-slate-300">Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="name@example.com"
                    defaultValue={queryEmail || ""}
                    required
                    className="h-9 bg-slate-700 border-slate-600 text-slate-200"
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="password" className="text-sm text-slate-300">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="h-9 bg-slate-700 border-slate-600 text-slate-200"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full mt-2"
                  disabled={isLoading}
                >
                  {isLoading ? "Loading..." : "Sign Up"}
                </Button>
              </div>
            </form>
          </div>
        </CardContent>
        <CardFooter className="flex flex-col pt-1 pb-4 space-y-2 border-t border-slate-700">
          <div className="text-sm text-slate-400 text-center pt-2">
            Already have an account?{" "}
            <Link href="/login" className="text-teal-400 hover:underline font-medium">
              Sign in
            </Link>
          </div>
          <div className="text-xs text-slate-500 text-center">
            By continuing, you agree to our{" "}
            <Link href="/terms" className="text-teal-400 hover:underline">
              Terms of Service
            </Link>{" "}
            and{" "}
            <Link href="/privacy" className="text-teal-400 hover:underline">
              Privacy Policy
            </Link>
            .
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}