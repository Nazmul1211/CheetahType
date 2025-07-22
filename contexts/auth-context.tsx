"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import Cookies from 'js-cookie';
import { auth } from '@/utils/firebase/config';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  GoogleAuthProvider, 
  GithubAuthProvider, 
  signInWithPopup, 
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  deleteUser,
  User as FirebaseUser,
  Auth
} from 'firebase/auth';

// Create providers
const googleProvider = new GoogleAuthProvider();
const githubProvider = new GithubAuthProvider();

// User type
type CustomUser = {
  id: string;
  email: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  [key: string]: any;
};

type AuthContextType = {
  user: CustomUser | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signInWithGithub: () => Promise<void>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  deleteAccount: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Set auth token in cookie
  const updateAuthCookie = async (firebaseUser: FirebaseUser | null) => {
    try {
      if (firebaseUser) {
        const token = await firebaseUser.getIdToken();
        // Set the cookie with a 7-day expiration
        Cookies.set('firebase-auth-token', token, { expires: 7, path: '/' });
      } else {
        // Remove the cookie when user is null (logged out)
        Cookies.remove('firebase-auth-token', { path: '/' });
      }
    } catch (error) {
      console.error("Error updating auth cookie:", error);
    }
  };

  useEffect(() => {
    try {
      // Set up Firebase auth state listener
      const unsubscribe = onAuthStateChanged(auth as Auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // Format user data
          const customUser: CustomUser = {
            id: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName,
            photoURL: firebaseUser.photoURL,
            emailVerified: firebaseUser.emailVerified,
          };
          
          setUser(customUser);
          await updateAuthCookie(firebaseUser);
        } else {
          setUser(null);
          await updateAuthCookie(null);
        }
        
        setLoading(false);
      });

      return () => {
        unsubscribe();
      };
    } catch (error) {
      console.error("Error in auth setup:", error);
      setLoading(false);
    }
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth as Auth, email, password);
    } catch (error) {
      console.error("Error signing in:", error);
      throw error;
    }
  };

  const signUp = async (email: string, password: string) => {
    try {
      await createUserWithEmailAndPassword(auth as Auth, email, password);
    } catch (error) {
      console.error("Error signing up:", error);
      throw error;
    }
  };

  const signInWithGoogle = async () => {
    try {
      await signInWithPopup(auth as Auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
      throw error;
    }
  };

  const signInWithGithub = async () => {
    try {
      await signInWithPopup(auth as Auth, githubProvider);
    } catch (error) {
      console.error("Error signing in with GitHub:", error);
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth as Auth);
      await updateAuthCookie(null);
    } catch (error) {
      console.error("Error signing out:", error);
      throw error;
    }
  };

  const resetPassword = async (email: string) => {
    try {
      await sendPasswordResetEmail(auth as Auth, email);
    } catch (error) {
      console.error("Error resetting password:", error);
      throw error;
    }
  };

  const deleteAccount = async () => {
    try {
      const currentUser = (auth as Auth).currentUser;
      if (currentUser) {
        // Delete from Firebase
        await deleteUser(currentUser);
        await updateAuthCookie(null);
      }
    } catch (error) {
      console.error("Error deleting account:", error);
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      signIn, 
      signUp, 
      signInWithGoogle, 
      signInWithGithub, 
      signOut,
      resetPassword,
      deleteAccount
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === null) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}