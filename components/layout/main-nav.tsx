"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import CheetahType from "@/public/images/CheetahType.png";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { ColorPaletteSelector } from "@/components/color-palette-selector";
import {
  Keyboard,
  Users,
  Trophy,
  User,
  Menu,
  BarChart,
  Settings,
} from "lucide-react";
import { useUserSettings } from "@/lib/user-settings";
import { SettingsDialog } from "@/components/settings-dialog";
import { useAuth } from "@/contexts/auth-context";

export function MainNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [settingsOpen, setSettingsOpen] = React.useState(false);
  const { settings, updateSettings, resetSettings } = useUserSettings();

  // Use Firebase Auth context instead of NextAuth
  const { user, loading, signOut } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut();
      router.push("/");
      router.refresh();
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const routes = [
    {
      href: "/",
      label: "Type",
      icon: <Keyboard className="h-4 w-4 mr-2" />,
      active: pathname === "/",
    },
    {
      href: "/multiplayer",
      label: "Multiplayer",
      icon: <Users className="h-4 w-4 mr-2" />,
      active:
        pathname === "/multiplayer" || pathname.startsWith("/multiplayer/"),
    },
    {
      href: "/leaderboard",
      label: "Leaderboard",
      icon: <Trophy className="h-4 w-4 mr-2" />,
      active: pathname === "/leaderboard",
    },
  ];

  // Additional tools that should be available in the header
  const tools = [
    {
      href: "/dashboard",
      label: "Typing Performance Dashboard",
      icon: <BarChart className="h-4 w-4" />,
      active: pathname === "/dashboard",
      show: !!user,
    },
  ];

  return (
    <div
      className={`border-b ${
        isDark
          ? "border-slate-700 bg-slate-900"
          : "border-slate-200 bg-slate-50"
      }`}
    >
      <div className="container mx-auto max-w-7xl px-2 md:px-0 flex h-20 items-center justify-between">
        <div className="flex items-center justify-center">
          <Link href="/" className="flex items-center justify-center">
            {pathname === "/" ? (
              <div
                className={`text-sm md:text-xl font-bold flex flex-col items-center mr-2 md:mr-10 md:ml-10${
                  isDark ? "text-teal-400" : "text-teal-600"
                } flex items-center`}
              >
                <Image
                  src={CheetahType}
                  alt="CheetahType"
                  width={120}
                  height={30}
                  // style={{ width: '', height: 'auto' }}
                  priority
                />
                <h1 className={`ml-2 ${isDark ? "text-slate-100" : "text-amber-600"}`}>CheetahType</h1>
              </div>
            ) : (
              <span
                className={`text-xl font-bold ${
                  isDark ? "text-teal-400" : "text-teal-600"
                }`}
              >
                <Image
                  src={CheetahType}
                  alt="CheetahType"
                  width={120}
                  height={30}
                  // style={{ width: 'auto', height: 'auto' }}
                />
              </span>
            )}
          </Link>

          {/* Desktop Navigation */}
          <nav className="mx-4 hidden items-center space-x-1 md:flex">
            {routes.map((route) => (
              <Button
                key={route.href}
                variant={route.active ? "default" : "ghost"}
                asChild
                className={cn(
                  `text-sm font-medium px-3 py-1 ${isDark ? "text-slate-400 bg-slate-900 border border-slate-800 hover:text-white hover:bg-slate-800" : "text-slate-700 hover:text-slate-900 hover:bg-slate-200"}`,
                  route.active
                    ? isDark
                      ? "bg-teal-700 text-slate-200 hover:bg-teal-600"
                      : "bg-teal-600 hover:bg-teal-500 text-white"
                    : isDark
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-700 hover:text-slate-900"
                )}
              >
                <Link href={route.href} className="flex items-center">
                  {route.icon}
                  {route.label}
                </Link>
              </Button>
            ))}
          </nav>
        </div>

        <div className="flex items-center space-x-2">
          <div className="hidden md:flex items-center space-x-2">
            {/* Tool buttons */}
            {tools.map(
              (tool) =>
                tool.show && (
                  <Button
                    key={tool.href}
                    variant={tool.active ? "default" : "ghost"}
                    size="icon"
                    asChild
                    className={
                      isDark
                        ? "text-slate-300 hover:text-white"
                        : "text-slate-700 hover:text-slate-900"
                    }
                  >
                    <Link href={tool.href} aria-label={tool.label}>
                      {tool.icon}
                    </Link>
                  </Button>
                )
            )}

            {/* Theme controls */}
            <ColorPaletteSelector />
            <ThemeToggle />

            {/* Settings Button */}
            <Button
              variant="ghost"
              size="icon"
              aria-label="Settings"
              onClick={() => setSettingsOpen(true)}
              className={
                isDark
                  ? "text-slate-300 hover:bg-slate-700 hover:text-white"
                  : "text-slate-600 hover:text-slate-600 hover:bg-slate-100"
              }
            >
              <Settings className="h-4 w-4" />
            </Button>
          </div>

          {/* User Menu */}
          {!loading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      className={`relative h-8 w-8 rounded-full p-0.5 ${
                        isDark ? "bg-slate-800" : "bg-slate-200"
                      }`}
                    >
                      <span className="sr-only">Open user menu</span>
                      <User
                        className={`h-4 w-4 ${
                          isDark ? "text-teal-400" : "text-teal-600"
                        }`}
                      />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className={`w-56 ${
                      isDark
                        ? "bg-slate-800 border-slate-700"
                        : "bg-white border-slate-200"
                    }`}
                  >
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-0.5 leading-none">
                        <p
                          className={`text-sm font-medium ${
                            isDark ? "text-slate-200" : "text-slate-800"
                          }`}
                        >
                          {user.displayName || user.email}
                        </p>
                        {user.displayName && (
                          <p
                            className={`text-xs ${
                              isDark ? "text-slate-400" : "text-slate-600"
                            }`}
                          >
                            {user.email}
                          </p>
                        )}
                      </div>
                    </div>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/dashboard"
                        className={`dark:text-slate-300 cursor-pointer font-medium hover:text-slate-300`}
                      >
                        Improvement Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link
                        href="/profile"
                        className={`dark:text-slate-300 cursor-pointer font-medium hover:text-slate-300`}
                      >
                        Profile & Stats
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      className={`cursor-pointer ${
                        isDark
                          ? "text-red-300 focus:text-red-300"
                          : "text-red-600 focus:text-red-600"
                      }`}
                      onClick={handleSignOut}
                    >
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="flex items-center gap-2">
                  <Button
                    asChild
                    variant="outline"
                    className={`h-8 ${
                      isDark
                        ? "text-slate-50 hover:text-slate-100 bg-slate-800 border-slate-700 hover:bg-slate-700"
                        : "bg-white border-slate-200 hover:bg-slate-100"
                    }`}
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    className={`h-8 ${
                      isDark
                        ? "bg-teal-600 hover:bg-teal-500"
                        : "bg-teal-500 hover:bg-teal-600"
                    } text-white`}
                  >
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </div>
              )}
            </>
          )}

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu
              className={`h-5 w-5 ${
                isDark ? "text-slate-300" : "text-slate-700"
              }`}
            />
          </Button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {mobileMenuOpen && (
        <div
          className={`md:hidden border-t ${
            isDark
              ? "border-slate-700 bg-slate-800"
              : "border-slate-200 bg-slate-100"
          }`}
        >
          <div className="container py-2 px-4">
            <nav className="flex flex-col space-y-2">
              {routes.map((route) => (
                <Button
                  key={route.href}
                  variant={route.active ? "default" : "ghost"}
                  asChild
                  className={cn(
                    "justify-start text-sm font-medium",
                    route.active
                      ? isDark
                        ? "bg-teal-700 hover:bg-teal-600"
                        : "bg-teal-600 hover:bg-teal-500 text-white"
                      : isDark
                      ? "text-slate-300 hover:text-white"
                      : "text-slate-700 hover:text-slate-900"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Link href={route.href} className="flex items-center">
                    {route.icon}
                    {route.label}
                  </Link>
                </Button>
              ))}

              {/* Additional tools in mobile menu */}
              {tools.map(
                (tool) =>
                  tool.show && (
                    <Button
                      key={tool.href}
                      variant={tool.active ? "default" : "ghost"}
                      asChild
                      className={cn(
                        "justify-start text-sm font-medium",
                        tool.active
                          ? isDark
                            ? "bg-teal-700 hover:bg-teal-600"
                            : "bg-teal-600 hover:bg-teal-500 text-white"
                          : isDark
                          ? "text-slate-300 hover:text-white"
                          : "text-slate-700 hover:text-slate-900"
                      )}
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <Link href={tool.href} className="flex items-center">
                        {tool.icon}
                        <span className="ml-2">{tool.label}</span>
                      </Link>
                    </Button>
                  )
              )}

              {/* Theme controls in mobile menu */}
              <div className="flex items-center justify-between py-2">
                <ColorPaletteSelector />
                <ThemeToggle />
              </div>

              {/* Settings Button in mobile menu */}
              <Button
                variant="ghost"
                className={cn(
                  "justify-start text-sm font-medium",
                  isDark
                    ? "text-slate-300 hover:text-white"
                    : "text-slate-700 hover:text-slate-900"
                )}
                onClick={() => {
                  setSettingsOpen(true);
                  setMobileMenuOpen(false);
                }}
              >
                <Settings className="h-4 w-4 mr-2" />
                <span>Settings</span>
              </Button>

              {/* User actions in mobile menu */}
              {!loading && !user && (
                <>
                  <Button
                    asChild
                    variant="outline"
                    className={`justify-start text-sm font-medium ${
                      isDark
                        ? "bg-slate-800 border-slate-700 hover:bg-slate-700"
                        : "bg-white border-slate-200 hover:bg-slate-100"
                    }`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/login">Sign In</Link>
                  </Button>
                  <Button
                    asChild
                    className={`justify-start text-sm font-medium ${
                      isDark
                        ? "bg-teal-600 hover:bg-teal-500"
                        : "bg-teal-500 hover:bg-teal-600"
                    } text-white`}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    <Link href="/signup">Sign Up</Link>
                  </Button>
                </>
              )}

              {!loading && user && (
                <Button
                  variant="ghost"
                  className={cn(
                    "justify-start text-sm font-medium",
                    isDark
                      ? "text-slate-300 hover:text-white"
                      : "text-slate-700 hover:text-slate-900"
                  )}
                  onClick={() => {
                    handleSignOut();
                    setMobileMenuOpen(false);
                  }}
                >
                  <User className="h-4 w-4 mr-2" />
                  <span>Sign Out</span>
                </Button>
              )}
            </nav>
          </div>
        </div>
      )}

      {/* Settings Dialog */}
      <SettingsDialog
        isOpen={settingsOpen}
        onOpenChange={setSettingsOpen}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
      />
    </div>
  );
}