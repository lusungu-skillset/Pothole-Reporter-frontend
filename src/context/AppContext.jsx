import React, { createContext, useContext, useState, useEffect } from "react"

const AppContext = createContext(null)

export function AppProvider({ children }) {
  const [potholeCount, setPotholeCount] = useState(0)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminEmail, setAdminEmail] = useState("")
  const [theme, setTheme] = useState("light")

  useEffect(() => {
    const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : null
    const savedEmail = typeof window !== "undefined" ? (localStorage.getItem("adminEmail") || "") : ""
    const savedTheme = typeof window !== "undefined" ? (localStorage.getItem("theme") || "light") : "light"
    
    setIsAdmin(!!authToken)
    setAdminEmail(savedEmail)
    setTheme(savedTheme)
    
    // Apply theme to document
    if (typeof window !== "undefined") {
      document.documentElement.setAttribute("data-theme", savedTheme)
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light"
    setTheme(newTheme)
    localStorage.setItem("theme", newTheme)
    document.documentElement.setAttribute("data-theme", newTheme)
  }

  return (
    <AppContext.Provider value={{ potholeCount, setPotholeCount, isAdmin, setIsAdmin, adminEmail, setAdminEmail, theme, toggleTheme }}>
      {children}
    </AppContext.Provider>
  )
}

export function useAppContext() {
  return useContext(AppContext)
}

export default AppContext
