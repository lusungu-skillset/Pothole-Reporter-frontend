"use client"
import Link from "next/link"
import { useRouter } from "next/router"
import { useState, useEffect } from "react"
import { useAppContext } from "../context/AppContext"

export default function Layout({ children }) {
  const { potholeCount, isAdmin, setIsAdmin, adminEmail, setAdminEmail, theme, toggleTheme } = useAppContext()
  const [mounted, setMounted] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const router = useRouter()

  useEffect(() => setMounted(true), [])

  const handleLogout = () => {
    localStorage.clear()
    setIsAdmin(false)
    setAdminEmail("")
    setMobileMenuOpen(false)
    router.push("/")
  }

  const handleNavClick = (path) => {
    router.push(path)
    setMobileMenuOpen(false)
  }

  return (
    <div className="app">
<nav className="navbar">
  <div className="nav-inner container">
    <div className="brand">
      <span aria-hidden="true" className="brand-icon">🛣️</span>
      <Link href="/" className="brand-text">PotholeReporter</Link>
    </div>

    {mounted && (
      <>
        <div className="nav-actions">
          <button
            className="theme-toggle"
            onClick={toggleTheme}
            aria-label={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
            title={`Switch to ${theme === "light" ? "dark" : "light"} mode`}
          >
            {theme === "light" ? "🌙" : "☀️"}
          </button>

          <button
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            ☰
          </button>
        </div>

        <div className={`nav-links ${mobileMenuOpen ? "mobile-open" : ""}`}>
          <Link href="/" className="nav-link primary" style={{ textDecoration: 'none', display: 'inline-block' }}>🏠 Home</Link>
          <button className="nav-link primary" onClick={() => handleNavClick("/report")}>Report</button>

          {isAdmin ? (
            <>
              <span className="admin-email">{adminEmail}</span>
              <button className="nav-link" onClick={() => handleNavClick("/admin")}>
                Dashboard <span className="badge">{potholeCount}</span>
              </button>
              <button className="nav-link danger" onClick={handleLogout}>Logout</button>
            </>
          ) : (
            <button className="nav-link primary" onClick={() => handleNavClick("/login")}>
              Admin Login
            </button>
          )}
        </div>
      </>
    )}
  </div>
</nav>


      <main className="container" style={{ paddingTop: '1.25rem' }}>{children}</main>
    </div>
  )
}

