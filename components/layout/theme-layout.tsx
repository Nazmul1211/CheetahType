"use client"

import React, { useState, useEffect } from 'react'
import { useTheme } from 'next-themes'
import { ColorPaletteSelector } from '@/components/color-palette-selector'
import { ThemeToggle } from '@/components/theme-toggle'
import { MainNav } from '@/components/layout/main-nav'

interface ThemeLayoutProps {
  children: React.ReactNode
}

// Define color palettes with their theme colors for both light and dark mode
const COLOR_THEMES = {
  teal: {
    primary: { dark: '#2DD4BF', light: '#14b8a6' },
    accent: { dark: '#A78BFA', light: '#8b5cf6' },
    error: { dark: '#F87171', light: '#ef4444' },
    background: { dark: 'bg-slate-900', light: 'bg-slate-50' }
  },
  blue: {
    primary: { dark: '#60A5FA', light: '#3b82f6' },
    accent: { dark: '#A78BFA', light: '#8b5cf6' },
    error: { dark: '#F87171', light: '#ef4444' },
    background: { dark: 'bg-slate-900', light: 'bg-slate-50' }
  },
  purple: {
    primary: { dark: '#A78BFA', light: '#8b5cf6' },
    accent: { dark: '#2DD4BF', light: '#14b8a6' },
    error: { dark: '#F87171', light: '#ef4444' },
    background: { dark: 'bg-gray-900', light: 'bg-gray-50' }
  },
  amber: {
    primary: { dark: '#F59E0B', light: '#d97706' },
    accent: { dark: '#A78BFA', light: '#8b5cf6' },
    error: { dark: '#2DD4BF', light: '#14b8a6' },
    background: { dark: 'bg-zinc-900', light: 'bg-zinc-50' }
  },
  rose: {
    primary: { dark: '#FB7185', light: '#e11d48' },
    accent: { dark: '#60A5FA', light: '#3b82f6' },
    error: { dark: '#2DD4BF', light: '#14b8a6' },
    background: { dark: 'bg-slate-900', light: 'bg-slate-50' }
  },
  green: {
    primary: { dark: '#10B981', light: '#059669' },
    accent: { dark: '#60A5FA', light: '#3b82f6' },
    error: { dark: '#F87171', light: '#ef4444' },
    background: { dark: 'bg-slate-900', light: 'bg-slate-50' }
  }
}

export function ThemeLayout({ children }: ThemeLayoutProps) {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [activeColorTheme, setActiveColorTheme] = useState('teal')
  const isDark = resolvedTheme === 'dark'

  // Apply CSS variables based on current theme and color palette
  useEffect(() => {
    setMounted(true)
    
    // Get stored color palette from localStorage
    const storedPalette = localStorage.getItem('colorPalette') || 'teal'
    setActiveColorTheme(storedPalette)

    // Listen for color palette changes
    const updateColorTheme = (e: StorageEvent) => {
      if (e.key === 'colorPalette') {
        setActiveColorTheme(e.newValue || 'teal')
      }
    }

    window.addEventListener('storage', updateColorTheme)

    // Apply the color theme
    applyColorTheme(storedPalette, isDark)

    return () => {
      window.removeEventListener('storage', updateColorTheme)
    }
  }, [resolvedTheme, isDark])

  // Function to apply color theme based on palette and dark/light mode
  const applyColorTheme = (palette: string, isDark: boolean) => {
    const colorMode = isDark ? 'dark' : 'light'
    const selectedPalette = COLOR_THEMES[palette as keyof typeof COLOR_THEMES] || COLOR_THEMES.teal

    document.documentElement.style.setProperty('--primary-color', selectedPalette.primary[colorMode])
    document.documentElement.style.setProperty('--accent-color', selectedPalette.accent[colorMode])
    document.documentElement.style.setProperty('--error-color', selectedPalette.error[colorMode])
  }

  // Get the background class based on current theme and color palette
  const getBackgroundClass = () => {
    const selectedPalette = COLOR_THEMES[activeColorTheme as keyof typeof COLOR_THEMES] || COLOR_THEMES.teal
    return isDark ? selectedPalette.background.dark : selectedPalette.background.light
  }

  // Don't render anything until mounted to prevent hydration mismatch
  if (!mounted) {
    return null
  }

  return (
    <div className={`flex min-h-screen flex-col ${getBackgroundClass()}`}>
      <MainNav />
      <main className="flex-1">{children}</main>
      <footer className={`border-t ${isDark ? 'border-slate-700 bg-slate-900' : 'border-slate-200 bg-slate-50'}`}>
        <div className="container mx-auto max-w-7xl px-4 flex flex-col sm:flex-row items-center justify-center sm:justify-between py-3">
          <p className={`text-sm ${isDark ? 'text-slate-500' : 'text-slate-600'} mb-2 sm:mb-0`}>
            © {new Date().getFullYear()} CheetahType. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <a 
              href="/about-us/" 
              className={`px-2 py-1 text-sm ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'}`}
            >
              About us
            </a>
            <a 
              href="/terms-of-service/" 
              className={`px-2 py-1 text-sm ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Terms of Service
            </a>
            <a 
              href="/privacy-policy/" 
              className={`px-2 py-1 text-sm ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Privacy policy
            </a>
            <a 
              href="/support/" 
              className={`px-2 py-1 text-sm ${isDark ? 'text-slate-500 hover:text-slate-300' : 'text-slate-600 hover:text-slate-900'}`}
            >
              Support
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
} 