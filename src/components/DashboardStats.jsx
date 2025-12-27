"use client"
import { useMemo, useState, useEffect } from "react"
import axios from "axios"

function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false)
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768)
    handleResize()
    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])
  return isMobile
}

export default function DashboardStats({ potholes = [], apiClient }) {
  const isMobile = useIsMobile()
  const [statsFromApi, setStatsFromApi] = useState(null)

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem("authToken")
        const client =
          apiClient ||
          axios.create({
            baseURL: "http://localhost:3005",
            headers: { Authorization: token ? `Bearer ${token}` : "" },
          })

        const res = await client.get("/admin/dashboard/stats")
        setStatsFromApi(res.data)
      } catch (err) {
        console.error("Failed to load stats", err)
      }
    }
    fetchStats()
  }, [apiClient])

  const stats = useMemo(() => {
    const base = statsFromApi || {
      total: potholes.length,
      byStatus: [],
      bySeverity: [],
      byDistrict: [],
    }

    const byStatus = {}
    const bySeverity = {}
    const byDistrict = {}

    potholes.forEach(p => {
      byStatus[p.status] = (byStatus[p.status] || 0) + 1
      bySeverity[p.severity] = (bySeverity[p.severity] || 0) + 1
      byDistrict[p.district] = (byDistrict[p.district] || 0) + 1
    })

    return {
      total: base.total,
      pending: byStatus["Pending"] || 0,
      inProgress: byStatus["In Progress"] || 0,
      resolved: byStatus["Resolved"] || 0,
      severity: bySeverity,
      districts: byDistrict,
    }
  }, [statsFromApi, potholes])

  const StatCard = ({ title, value, color, icon, sub }) => (
    <div
      style={{
        background: "#262626",
        padding: isMobile ? "1rem" : "1.5rem",
        borderRadius: "12px",
        border: "1px solid #333",
      }}
    >
      <div style={{ fontSize: "0.85rem", color: "#aaa" }}>{title}</div>
      <div style={{ fontSize: "2rem", fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: "0.8rem", color: "#999" }}>{sub}</div>
    </div>
  )

  return (
    <div style={{ padding: isMobile ? "1rem" : "1.5rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(4, 1fr)",
          gap: "1rem",
        }}
      >
        <StatCard title="Total Reports" value={stats.total} color="#0b64d1" />
        <StatCard title="Pending" value={stats.pending} color="#f59e0b" />
        <StatCard title="In Progress" value={stats.inProgress} color="#0b64d1" />
        <StatCard title="Resolved" value={stats.resolved} color="#10b981" />
      </div>

      <div
        style={{
          marginTop: "1.5rem",
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "repeat(2, 1fr)",
          gap: "1.5rem",
        }}
      >
        <div style={{ background: "#262626", padding: "1.5rem", borderRadius: "12px" }}>
          <h4>Severity Distribution</h4>
          {Object.entries(stats.severity).map(([k, v]) => (
            <div key={k} style={{ marginTop: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{k}</span>
                <span>{v}</span>
              </div>
              <div style={{ height: "6px", background: "#333", borderRadius: "4px" }}>
                <div
                  style={{
                    width: `${(v / stats.total) * 100}%`,
                    height: "100%",
                    background: "#f97316",
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        <div style={{ background: "#262626", padding: "1.5rem", borderRadius: "12px" }}>
          <h4>District Distribution</h4>
          {Object.entries(stats.districts).map(([d, v]) => (
            <div key={d} style={{ marginTop: "0.75rem" }}>
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{d}</span>
                <span>{v}</span>
              </div>
              <div style={{ height: "6px", background: "#333" }}>
                <div
                  style={{
                    width: `${(v / stats.total) * 100}%`,
                    height: "100%",
                    background: "#0b64d1",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: "2rem",
          background: "linear-gradient(135deg,#ff8c1a,#ff7a00)",
          padding: "1.5rem",
          borderRadius: "12px",
          color: "#111",
        }}
      >
        <strong>📊 Insights</strong>
        <ul style={{ marginTop: "0.75rem", lineHeight: 1.7 }}>
          <li>{stats.resolved} reports resolved</li>
          <li>{stats.pending} still pending</li>
          <li>{stats.inProgress} under active repair</li>
        </ul>
      </div>
    </div>
  )
}
