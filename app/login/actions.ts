"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";
import { cookies } from "next/headers";

export async function login(formData: FormData) {
  const supabase = await createClient();
  
  // Check if this is a social login
  const provider = formData.get("provider") as string;
  
  if (provider) {
    // Handle social login (Google or GitHub)
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: provider as any,
      options: {
        redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`,
      },
    });
    
    if (error) {
      return redirect(`/login?error=${encodeURIComponent(error.message)}`);
    }
    
    return redirect(data.url);
  }
  
  // Standard email/password login
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });
  
  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  
  revalidatePath("/", "layout");
  return redirect("/");
}

export async function signup(formData: FormData) {
  const supabase = await createClient();
  
  const email = formData.get("email") as string;
  const password = formData.get("password") as string;
  
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/auth/confirm`,
    },
  });
  
  if (error) {
    return redirect(`/login?error=${encodeURIComponent(error.message)}`);
  }
  
  return redirect("/login?message=Check your email to confirm your account");
} 