import { useState, useEffect } from "react"
import { useAppContext } from "../context/AppContext"
import axios from "axios"
import PotholeList from "../components/PotholeList"
import PotholeDetailsModal from "../components/PotholeDetailsModal"
import DashboardStats from "../components/DashboardStats"
import Analytics from "../components/Analytics"

export default function AdminPage() {
  const [potholes, setPotholes] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [refreshing, setRefreshing] = useState(false)
  const [selectedPotholeId, setSelectedPotholeId] = useState(null)
  const [activeTab, setActiveTab] = useState("dashboard") // dashboard, list, analytics
  const { potholeCount, setPotholeCount } = useAppContext()
  const adminEmail = localStorage.getItem("adminEmail") || ""
  const authToken = localStorage.getItem("authToken")

  // Create axios instance with auth header - update when token changes
  const getApiClient = () => {
    return axios.create({
      baseURL: "http://localhost:3005",
      headers: {
        "Authorization": authToken ? `Bearer ${authToken}` : "",
        "Content-Type": "application/json"
      }
    })
  }

  // Fetch potholes from backend with optional filters
  const fetchPotholes = async (filters = {}) => {
    try {
      setRefreshing(true)
      const apiClient = getApiClient()
      
      const params = new URLSearchParams()
      if (filters.status && filters.status !== "all") params.append("status", filters.status)
      if (filters.severity && filters.severity !== "all") params.append("severity", filters.severity.toUpperCase())
      if (filters.district && filters.district !== "all") params.append("district", filters.district)
      
      const url = `/admin/dashboard/potholes${params.toString() ? "?" + params.toString() : ""}`
      console.log("Fetching:", url, "Token:", authToken ? "Present" : "Missing")
      const response = await apiClient.get(url)
      const data = response.data
      
      console.log("Potholes fetched:", data)
      setPotholes(Array.isArray(data) ? data : [])
      setPotholeCount(Array.isArray(data) ? data.length : 0)
      setError(null)
    } catch (err) {
      console.error("Error fetching potholes:", err.response?.data || err.message)
      const errorMsg = err.response?.data?.message || err.message || "Failed to fetch potholes from backend"
      setError(errorMsg)
    } finally {
      setRefreshing(false)
      setLoading(false)
    }
  }

  // Fetch potholes on component mount and set up auto-refresh
  useEffect(() => {
    fetchPotholes()

    // Auto-refresh every 5 seconds to reflect backend changes
    const interval = setInterval(fetchPotholes, 5000)

    return () => clearInterval(interval)
  }, [authToken])

  const handleUpdateStatus = async (id, newStatus) => {
    try {
      const apiClient = getApiClient()
      // Update backend using PUT (backend expects PUT to update status)
      await apiClient.put(`/admin/dashboard/potholes/${id}`, { status: newStatus })
      
      // Update local state
      setPotholes(potholes.map(pothole => 
        pothole.id === id ? { ...pothole, status: newStatus } : pothole
      ))
    } catch (err) {
      console.error("Error updating pothole status:", err.response?.data || err.message)
      alert("Failed to update status: " + (err.response?.data?.message || err.message))
    }
  }

  const handleDeletePothole = async (id) => {
    if (!window.confirm("Are you sure you want to delete this report?")) {
      return
    }

    try {
      const apiClient = getApiClient()
      // Delete from backend
      await apiClient.delete(`/admin/dashboard/potholes/${id}`)
      
      // Update local state
      setPotholes(potholes.filter(pothole => pothole.id !== id))
      setPotholeCount(prev => prev - 1)
    } catch (err) {
      console.error("Error deleting pothole:", err.response?.data || err.message)
      alert("Failed to delete report: " + (err.response?.data?.message || err.message))
    }
  }

  const handleFiltersChange = (filters) => {
    fetchPotholes(filters)
  }

  const handleAddNote = (potholeId, note) => {
    // Notes are handled in the modal component
    console.log("Note added to pothole:", potholeId, note)
  }

  if (loading) {
    return <div style={{ padding: "2rem", textAlign: "center", color: "#b5b5b5" }}>Loading potholes...</div>
  }

  const selectedPothole = potholes.find(p => p.id === selectedPotholeId)

  return (
    <div className="container">
      {/* HEADER */}
      <div style={{
        marginTop: "5rem", 
        marginBottom: "1.5rem",
        padding: "3.5rem",
        background: "linear-gradient(180deg, #2e2e2e, #262626)",
        borderRadius: "16px",
        border: "1px solid #303030",
        boxShadow: "0 12px 32px rgba(0,0,0,0.35)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ margin: 0, marginBottom: "0.5rem", color: "#fff" }}>Admin Dashboard</h2>
            <div style={{ color: "#b5b5b5" }}>Logged in as: <strong>{adminEmail}</strong></div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem", alignItems: "center" }}>
            <div style={{ color: "#b5b5b5" }}>Total Reports: <strong>{potholeCount}</strong></div>
            <button style={{
              padding: "0.6rem 1rem",
              background: "#ff8c1a",
              color: "#fff",
              border: "none",
              borderRadius: "8px",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.9rem",
              transition: "background 0.2s ease"
            }} onClick={fetchPotholes} disabled={refreshing}>
              {refreshing ? "Refreshing..." : "🔄 Refresh"}
            </button>
          </div>
        </div>

        {/* TABS */}
        <div style={{ display: "flex", gap: "0.75rem", borderBottom: "1px solid #3a3a3a", paddingBottom: "1rem" }}>
          <button
            onClick={() => setActiveTab("dashboard")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "dashboard" ? "#ff8c1a" : "transparent",
              color: activeTab === "dashboard" ? "#111" : "#b5b5b5",
              border: "none",
              borderRadius: "6px 6px 0 0",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.95rem",
              transition: "all 0.2s ease"
            }}
          >
            📊 Dashboard
          </button>
          <button
            onClick={() => setActiveTab("list")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "list" ? "#ff8c1a" : "transparent",
              color: activeTab === "list" ? "#111" : "#b5b5b5",
              border: "none",
              borderRadius: "6px 6px 0 0",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.95rem",
              transition: "all 0.2s ease"
            }}
          >
            📋 All Potholes
          </button>
          <button
            onClick={() => setActiveTab("analytics")}
            style={{
              padding: "0.75rem 1.5rem",
              background: activeTab === "analytics" ? "#ff8c1a" : "transparent",
              color: activeTab === "analytics" ? "#111" : "#b5b5b5",
              border: "none",
              borderRadius: "6px 6px 0 0",
              fontWeight: 600,
              cursor: "pointer",
              fontSize: "0.95rem",
              transition: "all 0.2s ease"
            }}
          >
            📈 Analytics
          </button>
        </div>
      </div>

      {error && (
        <div style={{
          padding: "0.75rem",
          background: "#3b0d0d",
          color: "#fecaca",
          borderRadius: "8px",
          marginBottom: "1rem",
          border: "1px solid #5a1818",
        }}>
          {error}
        </div>
      )}

      {/* DASHBOARD TAB */}
      {activeTab === "dashboard" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <DashboardStats potholes={potholes} apiClient={getApiClient()} />
        </div>
      )}

      {/* LIST TAB */}
      {activeTab === "list" && (
        <div>
          <PotholeList
            potholes={potholes}
            onUpdateStatus={handleUpdateStatus}
            onDeletePothole={handleDeletePothole}
            onSelectPothole={(id) => setSelectedPotholeId(id)}
            onFiltersChange={handleFiltersChange}
            apiClient={getApiClient()}
          />
        </div>
      )}

      {/* ANALYTICS TAB */}
      {activeTab === "analytics" && (
        <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
          <Analytics potholes={potholes} />
        </div>
      )}

      {/* POTHOLE DETAILS MODAL */}
      <PotholeDetailsModal
        pothole={selectedPothole}
        isOpen={!!selectedPotholeId}
        onClose={() => setSelectedPotholeId(null)}
        onUpdateStatus={handleUpdateStatus}
        onAddNote={handleAddNote}
      />
    </div>
  )
}
