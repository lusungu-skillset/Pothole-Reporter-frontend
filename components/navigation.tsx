"use client"

import Link from "next/link"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Moon, Sun, Menu, X } from "lucide-react"

export default function Navigation() {
  const [theme, setTheme] = useState<"light" | "dark">("dark")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
    const savedTheme = localStorage.getItem("theme") as "light" | "dark" | null
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches

    const initialTheme = savedTheme || (prefersDark ? "dark" : "light")
    setTheme(initialTheme)
    document.documentElement.classList.toggle("dark", initialTheme === "dark")
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.classList.toggle("dark", newTheme === "dark")
  }

  if (!mounted) {
    return null
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Brand */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl hover:text-[#FFCC00] transition-colors">
            <div className="h-8 w-8 rounded-lg bg-[#FFCC00] flex items-center justify-center text-black font-bold">
              PR
            </div>
            <span>PotholeReporter</span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/" className="text-sm font-medium hover:text-[#FFCC00] transition-colors">
              Home
            </Link>
            <Link href="/report" className="text-sm font-medium hover:text-[#FFCC00] transition-colors">
              Report
            </Link>
            <Link href="/map" className="text-sm font-medium hover:text-[#FFCC00] transition-colors">
              Map
            </Link>
            <Link href="/admin" className="text-sm font-medium hover:text-[#FFCC00] transition-colors">
              Admin
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
              className="hover:bg-[#FFCC00]/10 hover:text-[#FFCC00]"
            >
              {theme === "light" ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden hover:bg-[#FFCC00]/10 hover:text-[#FFCC00]"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-border py-4 space-y-4">
            <Link
              href="/"
              className="block py-2 text-sm font-medium hover:text-[#FFCC00] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Home
            </Link>
            <Link
              href="/report"
              className="block py-2 text-sm font-medium hover:text-[#FFCC00] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Report
            </Link>
            <Link
              href="/map"
              className="block py-2 text-sm font-medium hover:text-[#FFCC00] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Map
            </Link>
            <Link
              href="/admin"
              className="block py-2 text-sm font-medium hover:text-[#FFCC00] transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Admin
            </Link>
            <div className="pt-2 border-t border-border">
              <Button
                variant="ghost"
                size="sm"
                onClick={toggleTheme}
                className="w-full justify-start hover:bg-[#FFCC00]/10 hover:text-[#FFCC00]"
              >
                {theme === "light" ? (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                )}
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
