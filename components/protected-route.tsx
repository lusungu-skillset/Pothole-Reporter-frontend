"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/admin")
    } else {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-[#FFCC00] border-r-transparent mb-4"></div>
          <p className="text-muted-foreground">Validating session...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
