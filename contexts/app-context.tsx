"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"

interface AppContextType {
  potholeCount: number
  setPotholeCount: (count: number) => void
  isAdmin: boolean
  setIsAdmin: (isAdmin: boolean) => void
  adminEmail: string
  setAdminEmail: (email: string) => void
  theme: string
  toggleTheme: () => void
}

const AppContext = createContext<AppContextType | null>(null)

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [potholeCount, setPotholeCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [theme, setTheme] = useState("dark")

  useEffect(() => {
    const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    const savedEmail = typeof window !== "undefined" ? localStorage.getItem("adminEmail") || "" : ""
    const savedTheme = typeof window !== "undefined" ? localStorage.getItem("theme") || "dark" : "dark"

    setIsAdmin(!!authToken)
    setAdminEmail(savedEmail)
    setTheme(savedTheme)

    // Apply theme to document
    if (typeof window !== "undefined") {
      if (savedTheme === "dark") {
        document.documentElement.classList.add("dark")
      } else {
        document.documentElement.classList.remove("dark")
      }
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)

    if (newTheme === "dark") {
      document.documentElement.classList.add("dark")
    } else {
      document.documentElement.classList.remove("dark")
    }
  }

  return (
    <AppContext.Provider
      value={{ potholeCount, setPotholeCount, isAdmin, setIsAdmin, adminEmail, setAdminEmail, theme, toggleTheme }}
    >
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  const context = useContext(AppContext)
  if (!context) {
    throw new Error("useAppContext must be used within AppProvider")
  }
  return context
}

export default AppContext
