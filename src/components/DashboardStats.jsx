"use client"
import { useMemo, useState, useEffect } from "react"
import axios from "axios"

export default function DashboardStats({ potholes = [], apiClient }) {
  const [statsFromApi, setStatsFromApi] = useState(null)
  const [loading, setLoading] = useState(true)

  // Fetch stats from API on mount
  useEffect(() => {
    const fetchStats = async () => {
      try {
        const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : ""
        const client = apiClient || axios.create({
          baseURL: "http://localhost:3005",
          headers: {
            "Authorization": authToken ? `Bearer ${authToken}` : "",
            "Content-Type": "application/json"
          }
        })
        const response = await client.get("/admin/dashboard/stats")
        setStatsFromApi(response.data)
      } catch (err) {
        console.error("Error fetching stats:", err)
      } finally {
        setLoading(false)
      }
    }
    fetchStats()
  }, [apiClient])

  const stats = useMemo(() => {
    if (statsFromApi) {
      // Use API stats
      const severityDist = {}
      statsFromApi.bySeverity?.forEach(s => {
        severityDist[s.severity.charAt(0) + s.severity.slice(1).toLowerCase()] = s.count
      })

      const districtDist = {}
      statsFromApi.topDistricts?.forEach(d => {
        districtDist[d.district] = d.count
      })

      const statusCounts = {}
      statsFromApi.byStatus?.forEach(s => {
        statusCounts[s.status] = s.count
      })

      return {
        total: statsFromApi.total,
        pending: statusCounts["Pending"] || 0,
        inProgress: statusCounts["In Progress"] || 0,
        resolved: statusCounts["Resolved"] || 0,
        severityDist,
        districtDist,
      }
    } else {
      // Fallback to calculating from potholes array
      const total = potholes.length
      const pending = potholes.filter(p => p.status === "Pending").length
      const inProgress = potholes.filter(p => p.status === "In Progress").length
      const resolved = potholes.filter(p => p.status === "Resolved").length

      // Severity distribution
      const severityDist = {}
      potholes.forEach(p => {
        const sev = p.severity || "Unknown"
        severityDist[sev] = (severityDist[sev] || 0) + 1
      })

      // District distribution
      const districtDist = {}
      potholes.forEach(p => {
        const district = p.district || "Unknown"
        districtDist[district] = (districtDist[district] || 0) + 1
      })

      return {
        total,
        pending,
        inProgress,
        resolved,
        severityDist,
        districtDist,
      }
    }
  }, [potholes, statsFromApi])

  const StatCard = ({ title, value, color, icon, subtext }) => (
    <div
      style={{
        padding: "1.5rem",
        background: "linear-gradient(180deg, #2e2e2e, #262626)",
        borderRadius: "12px",
        border: "1px solid #303030",
        boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
        <div
          style={{
            width: 56,
            height: 56,
            borderRadius: "12px",
            background: `${color}15`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "1.5rem",
          }}
        >
          {icon}
        </div>
        <div>
          <div style={{ fontSize: "0.85rem", color: "#d4d4d4", fontWeight: 600 }}>
            {title}
          </div>
          <div style={{ fontSize: "2rem", fontWeight: 800, color, marginTop: "0.25rem" }}>
            {value}
          </div>
          {subtext && (
            <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
              {subtext}
            </div>
          )}
        </div>
      </div>
    </div>
  )

  const DistributionCard = ({ title, data, color }) => {
    const maxValue = Math.max(...Object.values(data), 1)

    return (
      <div
        style={{
          padding: "1.5rem",
          background: "linear-gradient(180deg, #2e2e2e, #262626)",
          borderRadius: "12px",
          border: "1px solid #303030",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: 600, color: "#e6e6e6" }}>
          {title}
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          {Object.entries(data)
            .sort((a, b) => b[1] - a[1])
            .map(([key, value]) => (
              <div key={key}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: "0.25rem",
                    fontSize: "0.9rem",
                  }}
                >
                  <span style={{ fontWeight: 600, color: "#e6e6e6" }}>{key}</span>
                  <span style={{ color: "#9ca3af" }}>{value}</span>
                </div>
                <div
                  style={{
                    width: "100%",
                    height: "8px",
                    background: "#3a3a3a",
                    borderRadius: "4px",
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${(value / maxValue) * 100}%`,
                      height: "100%",
                      background: color,
                      transition: "width 0.3s ease",
                    }}
                  />
                </div>
              </div>
            ))}
        </div>
      </div>
    )
  }

  // Calculate percentage
  const pendingPercent = stats.total > 0 ? Math.round((stats.pending / stats.total) * 100) : 0
  const resolvedPercent = stats.total > 0 ? Math.round((stats.resolved / stats.total) * 100) : 0
  const inProgressPercent = stats.total > 0 ? Math.round((stats.inProgress / stats.total) * 100) : 0

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* MAIN STATS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <StatCard
          title="Total Reports"
          value={stats.total}
          color="#0b64d1"
          icon="📊"
          subtext="All reported potholes"
        />
        <StatCard
          title="Pending"
          value={stats.pending}
          color="#f59e0b"
          icon="⏳"
          subtext={`${pendingPercent}% of total`}
        />
        <StatCard
          title="In Progress"
          value={stats.inProgress}
          color="#0b64d1"
          icon="🔧"
          subtext={`${inProgressPercent}% of total`}
        />
        <StatCard
          title="Resolved"
          value={stats.resolved}
          color="#10b981"
          icon="✓"
          subtext={`${resolvedPercent}% of total`}
        />
      </div>

      {/* DISTRIBUTION CHARTS */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <DistributionCard
          title="Distribution by Severity"
          data={stats.severityDist}
          color="#dc2626"
        />
        <DistributionCard
          title="Distribution by District"
          data={stats.districtDist}
          color="#0b64d1"
        />
      </div>

      {/* STATUS OVERVIEW */}
      <div
        style={{
          padding: "1.5rem",
          background: "linear-gradient(180deg, #2e2e2e, #262626)",
          borderRadius: "12px",
          border: "1px solid #303030",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h4 style={{ margin: "0 0 1.5rem 0", fontSize: "0.95rem", fontWeight: 600, color: "#e6e6e6" }}>
          Status Overview
        </h4>
        <div style={{ display: "flex", gap: "1rem", height: "40px", borderRadius: "8px", overflow: "hidden" }}>
          <div
            style={{
              flex: stats.pending,
              background: "#f59e0b",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
            title={`Pending: ${stats.pending}`}
          >
            {stats.pending > 0 && `${stats.pending}`}
          </div>
          <div
            style={{
              flex: stats.inProgress,
              background: "#0b64d1",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
            title={`In Progress: ${stats.inProgress}`}
          >
            {stats.inProgress > 0 && `${stats.inProgress}`}
          </div>
          <div
            style={{
              flex: stats.resolved,
              background: "#10b981",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "white",
              fontWeight: 600,
              fontSize: "0.85rem",
            }}
            title={`Resolved: ${stats.resolved}`}
          >
            {stats.resolved > 0 && `${stats.resolved}`}
          </div>
        </div>
        <div style={{ display: "flex", gap: "2rem", marginTop: "1rem", fontSize: "0.9rem" }}>
          <div>
            <div style={{ color: "#ff8c1a", fontWeight: 600 }}>Pending</div>
            <div style={{ color: "#9ca3af" }}>{stats.pending} reports</div>
          </div>
          <div>
            <div style={{ color: "#0b64d1", fontWeight: 600 }}>In Progress</div>
            <div style={{ color: "#9ca3af" }}>{stats.inProgress} reports</div>
          </div>
          <div>
            <div style={{ color: "#10b981", fontWeight: 600 }}>Resolved</div>
            <div style={{ color: "#9ca3af" }}>{stats.resolved} reports</div>
          </div>
        </div>
      </div>

      {/* QUICK INSIGHTS */}
      <div
        style={{
          padding: "1.5rem",
          background: "linear-gradient(135deg, #ff8c1a 0%, #ff7a00 100%)",
          color: "#111",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(255,140,26,0.3)",
        }}
      >
        <h4 style={{ margin: "0 0 1rem 0", fontSize: "0.95rem", fontWeight: 600 }}>
          📈 Quick Insights
        </h4>
        <ul style={{ margin: 0, paddingLeft: "1.5rem", lineHeight: 1.8, fontSize: "0.9rem" }}>
          {stats.total > 0 && (
            <>
              <li>
                {resolvedPercent}% of reports have been resolved
                {resolvedPercent >= 50 ? " ✓ Great progress!" : " - Keep going!"}
              </li>
              {stats.pending > 0 && (
                <li>
                  {stats.pending} {stats.pending === 1 ? "report is" : "reports are"} awaiting action
                </li>
              )}
              {Object.entries(stats.severityDist).find(([_, count]) => count > 0 && _ === "Critical") && (
                <li>
                  ⚠️ {stats.severityDist.Critical} critical {stats.severityDist.Critical === 1 ? "issue" : "issues"} needs immediate attention
                </li>
              )}
            </>
          )}
          {stats.total === 0 && (
            <li>No reports yet. Keep monitoring the system.</li>
          )}
        </ul>
      </div>
    </div>
  )
}
