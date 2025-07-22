"use client";

import { createClient } from "@/utils/supabase/client";

export async function clientLogin(formData: FormData): Promise<{ success: boolean; error?: string }> {
  const supabase = createClient();
  
  // Check if this is a social login
  const provider = formData.get("provider") as string;
  
  if (provider) {
    try {
      // Handle social login (Google or GitHub)
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: provider as "google" | "github",
        options: {
          redirectTo: `${window.location.origin}/auth/confirm`,
          // Add scopes for proper authentication
          scopes: provider === 'github' ? 'user:email' : undefined
        },
      });
      
      if (error) {
        console.error("OAuth error:", error);
        return { success: false, error: error.message };
      }
      
      if (!data || !data.url) {
        console.error("No data.url returned from signInWithOAuth");
        return { success: false, error: "Failed to get authentication URL" };
      }
      
      // Redirect is handled by Supabase
      window.location.href = data.url;
      return { success: true };
    } catch (err: any) {
      console.error("Social login error:", err);
      return { success: false, error: err.message || "Failed to login with provider" };
    }
  }
  
  try {
    // Standard email/password login
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    
    if (error) {
      console.error("Email login error:", error);
      return { success: false, error: error.message };
    }
    
    if (data.user) {
      // Redirect to home page
      window.location.href = "/";
      return { success: true };
    } else {
      return { success: false, error: "Authentication failed" };
    }
  } catch (err: any) {
    console.error("Login error:", err);
    return { success: false, error: err.message || "Failed to login" };
  }
}

export async function clientSignup(formData: FormData): Promise<{ success: boolean; error?: string; message?: string }> {
  const supabase = createClient();
  
  try {
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;
    
    if (!email || !password) {
      return { success: false, error: "Email and password are required" };
    }
    
    if (password.length < 6) {
      return { success: false, error: "Password must be at least 6 characters" };
    }
    
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/confirm`,
      },
    });
    
    if (error) {
      console.error("Signup error:", error);
      return { success: false, error: error.message };
    }
    
    if (data.user) {
      if (data.session) {
        // User is signed in immediately (email confirmation not required)
        window.location.href = "/";
        return { success: true };
      } else {
        // Email confirmation required
        return { 
          success: true, 
          message: "Check your email to confirm your account" 
        };
      }
    } else {
      return { success: false, error: "Failed to create account" };
    }
  } catch (err: any) {
    console.error("Signup error:", err);
    return { success: false, error: err.message || "Failed to sign up" };
  }
}