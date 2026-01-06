"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import axios from "axios"
import { useAppContext } from "@/contexts/app-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle } from "lucide-react"
import Navigation from "@/components/navigation"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const { setIsAdmin, setAdminEmail } = useAppContext()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post("http://localhost:3005/auth/login", { email, password })

      console.log("Login response:", response.data)

      const { token, admin } = response.data

      if (!token || !admin) {
        setError("Invalid response from server - missing token or admin data")
        return
      }

      localStorage.setItem("authToken", token)
      localStorage.setItem("adminEmail", admin.email || email)

      setIsAdmin(true)
      setAdminEmail(admin.email || email)

      router.push("/admin/dashboard")
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.response?.data?.message || err.message || "Invalid email or password")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Navigation />

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <Card className="w-full max-w-lg border-border bg-card/50 shadow-2xl">
          <CardContent className="pt-8 pb-8 px-8">
            <div className="mb-8">
              <h1 className="text-3xl font-bold mb-2">Admin Login</h1>
              <p className="text-muted-foreground">Sign in to access the admin dashboard</p>
            </div>

            <form onSubmit={handleLogin} className="space-y-6">
              {/* Email Field */}
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@potholes.mw"
                  disabled={loading}
                  className="bg-background border-border focus:border-[#FFCC00] focus:ring-[#FFCC00]"
                />
              </div>

              {/* Password Field */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  disabled={loading}
                  className="bg-background border-border focus:border-[#FFCC00] focus:ring-[#FFCC00]"
                />
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-start gap-3 rounded-lg bg-destructive/10 border border-destructive/20 p-4">
                  <AlertCircle className="h-5 w-5 text-destructive mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-destructive">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={loading}
                className="w-full bg-[#FFCC00] hover:bg-[#FFCC00]/90 text-black font-semibold h-12 rounded-full transition-transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? "Logging in..." : "Login"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-semibold">© {new Date().getFullYear()} Pothole Reporter</p>
          <p className="mt-2">Helping communities report and fix road hazards faster</p>
        </div>
      </footer>
    </div>
  )
}
