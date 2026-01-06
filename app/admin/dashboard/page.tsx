"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { useRouter } from "next/navigation"
import PotholeList from "@/components/pothole-list"
import DashboardStats from "@/components/dashboard-stats"
import Analytics from "@/components/analytics"
import Navigation from "@/components/navigation"
import ProtectedRoute from "@/components/protected-route"
import { Button } from "@/components/ui/button"
import { BarChart3, List, LineChart } from "lucide-react"

function AdminDashboardContent() {
  const router = useRouter()

  // 🔑 SIMPLE FIX: use any[]
  const [potholes, setPotholes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPotholeId, setSelectedPotholeId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState("dashboard")
  const [adminEmail, setAdminEmail] = useState("")
  const [authToken, setAuthToken] = useState("")

  // Auth check
  useEffect(() => {
    const token = localStorage.getItem("authToken")
    const email = localStorage.getItem("adminEmail")

    if (!token) {
      router.push("/admin")
      return
    }

    setAuthToken(token)
    setAdminEmail(email || "")
  }, [router])

  const getApiClient = () => {
    return axios.create({
      baseURL: "http://localhost:3005",
      headers: {
        Authorization: authToken ? `Bearer ${authToken}` : "",
        "Content-Type": "application/json",
      },
    })
  }

  // Fetch potholes
  const fetchPotholes = async (filters: any = {}) => {
    try {
      setRefreshing(true)
      const apiClient = getApiClient()

      const params = new URLSearchParams()
      if (filters.status && filters.status !== "all") params.append("status", filters.status)
      if (filters.severity && filters.severity !== "all")
        params.append("severity", filters.severity.toUpperCase())
      if (filters.district && filters.district !== "all")
        params.append("district", filters.district)

      const url = `/admin/dashboard/potholes${params.toString() ? "?" + params.toString() : ""}`
      const response = await apiClient.get(url)

      // 🔑 SIMPLE FIX: force id to string
      const data = Array.isArray(response.data)
        ? response.data.map((p: any) => ({ ...p, id: String(p.id) }))
        : []

      setPotholes(data)
      setError(null)
    } catch (err: any) {
      console.error("Error fetching potholes:", err)
      setError(err.response?.data?.message || err.message || "Failed to fetch potholes")
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!authToken) return
    fetchPotholes()
    const interval = setInterval(fetchPotholes, 5000)
    return () => clearInterval(interval)
  }, [authToken])

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      const apiClient = getApiClient()
      await apiClient.put(`/admin/dashboard/potholes/${id}`, { status: newStatus })

      setPotholes((prev) =>
        prev.map((p) => (p.id === id ? { ...p, status: newStatus } : p))
      )
    } catch (err: any) {
      alert("Failed to update status: " + (err.response?.data?.message || err.message))
    }
  }

  const handleDeletePothole = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this report?")) return

    try {
      const apiClient = getApiClient()
      await apiClient.delete(`/admin/dashboard/potholes/${id}`)
      setPotholes((prev) => prev.filter((p) => p.id !== id))
    } catch (err: any) {
      alert("Failed to delete report: " + (err.response?.data?.message || err.message))
    }
  }

  const handleFiltersChange = (filters: any) => {
    fetchPotholes(filters)
  }

  const handleLogout = () => {
    localStorage.removeItem("authToken")
    localStorage.removeItem("adminEmail")
    router.push("/admin")
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation />
        <div className="container mx-auto px-4 py-20 text-center text-muted-foreground">
          Loading dashboard...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 rounded-xl border bg-card p-6 shadow">
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <h1 className="mb-2 text-3xl font-bold">Admin Dashboard</h1>
              <p className="text-muted-foreground">
                Logged in as <span className="font-semibold">{adminEmail}</span>
              </p>
            </div>

            <div className="flex gap-3">
              <div className="text-sm">
                Total Reports: <strong>{potholes.length}</strong>
              </div>
              <Button onClick={() => fetchPotholes()} disabled={refreshing} variant="outline">
                {refreshing ? "Refreshing…" : "Refresh"}
              </Button>
              <Button onClick={handleLogout} variant="destructive">
                Logout
              </Button>
            </div>
          </div>

          {/* Tabs */}
          <div className="mt-6 flex gap-2 border-t pt-4">
            <Button
              onClick={() => setActiveTab("dashboard")}
              variant={activeTab === "dashboard" ? "default" : "ghost"}
            >
              <BarChart3 className="mr-2 h-4 w-4" />
              Dashboard
            </Button>
            <Button
              onClick={() => setActiveTab("list")}
              variant={activeTab === "list" ? "default" : "ghost"}
            >
              <List className="mr-2 h-4 w-4" />
              All Potholes
            </Button>
            <Button
              onClick={() => setActiveTab("analytics")}
              variant={activeTab === "analytics" ? "default" : "ghost"}
            >
              <LineChart className="mr-2 h-4 w-4" />
              Analytics
            </Button>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded border border-destructive/50 bg-destructive/10 p-4 text-destructive">
            {error}
          </div>
        )}

        {activeTab === "dashboard" && <DashboardStats potholes={potholes} />}

        {activeTab === "list" && (
          <PotholeList
            potholes={potholes}
            onUpdateStatus={handleUpdateStatus}
            onDeletePothole={handleDeletePothole}
            onSelectPothole={(id: string) => setSelectedPotholeId(id)}
            onFiltersChange={handleFiltersChange}
          />
        )}

        {activeTab === "analytics" && <Analytics potholes={potholes} />}
      </div>

      <footer className="mt-16 border-t bg-card py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Pothole Reporter
      </footer>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  )
}
