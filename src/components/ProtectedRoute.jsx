"use client"
import { useEffect, useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"

export default function ProtectedRoute({ children }) {
  const router = useRouter()
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem("authToken")
    if (!token) {
      router.push("/login")
    } else {
      setLoading(false)
    }
  }, [router])

  if (loading) {
    return <div style={{ textAlign: "center" }}>Validating session...</div>
  }

  return children
}
