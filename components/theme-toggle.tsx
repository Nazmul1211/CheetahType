"use client"

import { Moon, Sun, Monitor } from "lucide-react"
import { useTheme } from "next-themes"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useEffect, useState } from "react"

export function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)
  
  // Set default theme to dark if not set
  useEffect(() => {
    setMounted(true)
    if (!theme) {
      setTheme("dark")
    }
  }, [theme, setTheme])
  
  if (!mounted) {
    return null
  }

  const currentTheme = theme || resolvedTheme || "dark"
  const isDark = resolvedTheme === "dark"

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={isDark ? "bg-slate-800 hover:bg-slate-700" : "bg-white hover:bg-slate-100"}
        >
          {currentTheme === "light" ? (
            <Sun className="h-[1.2rem] w-[1.2rem] text-yellow-500" />
          ) : currentTheme === "dark" ? (
            <Moon className="h-[1.2rem] w-[1.2rem] text-slate-300" />
          ) : (
            <Monitor className="h-[1.2rem] w-[1.2rem] text-purple-400" />
          )}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end"
        side="bottom"
        sideOffset={8}
        className={isDark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200"}
      >
        <DropdownMenuItem 
          onClick={() => setTheme("light")}
          className={`cursor-pointer ${isDark 
            ? currentTheme === "light" ? "text-yellow-400" : "text-slate-300" 
            : currentTheme === "light" ? "text-yellow-600 font-medium" : "text-slate-700"
          }`}
        >
          <Sun className="h-4 w-4 mr-2" />
          Light
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("dark")}
          className={`cursor-pointer ${isDark
            ? currentTheme === "dark" ? "text-teal-400" : "text-slate-300"
            : currentTheme === "dark" ? "text-teal-600 font-medium" : "text-slate-700"
          }`}
        >
          <Moon className="h-4 w-4 mr-2" />
          Dark
        </DropdownMenuItem>
        <DropdownMenuItem 
          onClick={() => setTheme("system")}
          className={`cursor-pointer ${isDark
            ? currentTheme === "system" ? "text-purple-400" : "text-slate-300"
            : currentTheme === "system" ? "text-purple-600 font-medium" : "text-slate-700"
          }`}
        >
          <Monitor className="h-4 w-4 mr-2" />
          System
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}