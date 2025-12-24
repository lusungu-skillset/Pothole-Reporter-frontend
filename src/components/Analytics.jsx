"use client"
import { useMemo } from "react"

export default function Analytics({ potholes = [] }) {
  const analytics = useMemo(() => {
    const roadStats = {}
    potholes.forEach(p => {
      const road = p.roadName || "Unknown"
      if (!roadStats[road]) {
        roadStats[road] = {
          count: 0,
          critical: 0,
          high: 0,
          medium: 0,
          low: 0,
          resolved: 0,
        }
      }
      roadStats[road].count++
      if (p.severity === "Critical") roadStats[road].critical++
      if (p.severity === "High") roadStats[road].high++
      if (p.severity === "Medium") roadStats[road].medium++
      if (p.severity === "Low") roadStats[road].low++
      if (p.status === "Resolved") roadStats[road].resolved++
    })

    const mostProblematicRoads = Object.entries(roadStats)
      .sort((a, b) => {
        const aScore = b[1].critical * 3 + b[1].high * 2 + b[1].medium
        const bScore = a[1].critical * 3 + a[1].high * 2 + a[1].medium
        return aScore - bScore
      })
      .slice(0, 5)

    const responseTimes = potholes
      .filter(p => p.createdAt && p.dateReported)
      .map(p => {
        const created = new Date(p.dateReported || p.createdAt)
        const updated = new Date(p.updatedAt || p.createdAt)
        const diffHours = (updated - created) / (1000 * 60 * 60)
        return {
          id: p.id,
          status: p.status,
          hours: diffHours,
        }
      })

    const avgResponseTime =
      responseTimes.length > 0
        ? (responseTimes.reduce((sum, rt) => sum + rt.hours, 0) / responseTimes.length).toFixed(1)
        : 0

    const resolvedResponseTime =
      responseTimes.filter(rt => rt.status === "Resolved").length > 0
        ? (
            responseTimes
              .filter(rt => rt.status === "Resolved")
              .reduce((sum, rt) => sum + rt.hours, 0) /
            responseTimes.filter(rt => rt.status === "Resolved").length
          ).toFixed(1)
        : 0

    
    const locationDensity = {}
    potholes.forEach(p => {
      const latCell = Math.floor(p.latitude * 100) / 100
      const lngCell = Math.floor(p.longitude * 100) / 100
      const key = `${latCell},${lngCell}`
      locationDensity[key] = (locationDensity[key] || 0) + 1
    })

    const hotspots = Object.entries(locationDensity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([coords, count]) => {
        const [lat, lng] = coords.split(",")
        return { lat: parseFloat(lat), lng: parseFloat(lng), count }
      })

    
    const trendData = []
    for (let i = 6; i >= 0; i--) {
      const date = new Date()
      date.setDate(date.getDate() - i)
      const dayStr = date.toISOString().split("T")[0]
      const count = potholes.filter(p => {
        const dateStr = p.dateReported || p.createdAt
        if (!dateStr) return false
        const pDate = dateStr.split("T")[0]
        return pDate === dayStr
      }).length
      trendData.push({ date: dayStr, count })
    }

    return {
      mostProblematicRoads,
      avgResponseTime,
      resolvedResponseTime,
      hotspots,
      trendData,
      responseTimes,
    }
  }, [potholes])

  const MetricCard = ({ title, value, unit, trend, color, icon }) => (
    <div
      style={{
        padding: "1.5rem",
        background: "linear-gradient(180deg, #2e2e2e, #262626)",
        borderRadius: "12px",
        border: "1px solid #303030",
        boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start" }}>
        <div>
          <div style={{ fontSize: "0.85rem", color: "#d4d4d4", fontWeight: 600 }}>
            {title}
          </div>
          <div style={{ fontSize: "1.75rem", fontWeight: 800, color, marginTop: "0.5rem" }}>
            {value}
          </div>
          {unit && (
            <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
              {unit}
            </div>
          )}
        </div>
        {trend && (
          <div
            style={{
              fontSize: "0.8rem",
              fontWeight: 600,
              background: trend > 0 ? "#3b0d0d" : "#0d3a2e",
              color: trend > 0 ? "#fecaca" : "#86efac",
              padding: "0.4rem 0.8rem",
              borderRadius: "6px",
            }}
          >
            {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
          </div>
        )}
        {icon && (
          <div style={{ fontSize: "1.5rem" }}>
            {icon}
          </div>
        )}
      </div>
    </div>
  )

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1.5rem",
        }}
      >
        <MetricCard
          title="Avg Response Time"
          value={analytics.avgResponseTime}
          unit="hours"
          color="#0b64d1"
          icon="⏱️"
        />
        <MetricCard
          title="Avg Resolution Time"
          value={analytics.resolvedResponseTime}
          unit="hours"
          color="#10b981"
          icon="✓"
        />
        <MetricCard
          title="Geographic Hotspots"
          value={analytics.hotspots.length}
          unit="high-density areas"
          color="#f59e0b"
          icon="🔥"
        />
      </div>

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
          🚗 Most Problematic Roads
        </h4>
        <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          {analytics.mostProblematicRoads.length === 0 ? (
            <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>No data available</p>
          ) : (
            analytics.mostProblematicRoads.map(([road, stats], idx) => {
              const maxCount = Math.max(...analytics.mostProblematicRoads.map(r => r[1].count), 1)
              const percentage = (stats.count / maxCount) * 100
              const unresolved = stats.count - stats.resolved

              return (
                <div key={road}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.5rem",
                      fontSize: "0.9rem",
                    }}
                  >
                    <div>
                      <strong style={{ color: "#e6e6e6" }}>#{idx + 1} {road}</strong>
                      <span style={{ color: "#9ca3af", marginLeft: "0.5rem" }}>
                        {stats.count} reports
                      </span>
                    </div>
                    <div style={{ color: "#9ca3af", fontSize: "0.85rem" }}>
                      {stats.critical > 0 && `🔴 ${stats.critical} Critical`}
                      {stats.high > 0 && ` 🟠 ${stats.high} High`}
                    </div>
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
                        width: `${percentage}%`,
                        height: "100%",
                        background:
                          stats.critical > 0
                            ? "#dc2626"
                            : stats.high > 0
                              ? "#ea580c"
                              : stats.medium > 0
                                ? "#f59e0b"
                                : "#10b981",
                        transition: "width 0.3s ease",
                      }}
                    />
                  </div>
                  <div style={{ fontSize: "0.75rem", color: "#9ca3af", marginTop: "0.25rem" }}>
                    {stats.resolved} resolved, {unresolved} pending
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>

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
          🔥 Geographic Hotspots (High Concentration Areas)
        </h4>
        {analytics.hotspots.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>No data available</p>
        ) : (
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
              gap: "1rem",
            }}
          >
            {analytics.hotspots.map((spot, idx) => (
              <div
                key={idx}
                style={{
                  padding: "1rem",
                  background: "#323232",
                  borderRadius: "8px",
                  border: "1px solid #404040",
                }}
              >
                <div style={{ fontWeight: 600, marginBottom: "0.5rem", color: "#e6e6e6" }}>
                  🔴 Hotspot {idx + 1}
                </div>
                <div style={{ fontSize: "0.85rem", color: "#9ca3af", marginBottom: "0.75rem" }}>
                  <div>Lat: {spot.lat.toFixed(4)}</div>
                  <div>Lng: {spot.lng.toFixed(4)}</div>
                  <div style={{ marginTop: "0.5rem", fontWeight: 600, color: "#ff8c1a" }}>
                    {spot.count} reports
                  </div>
                </div>
                <button
                  onClick={() => {
                    window.open(
                      `https://www.google.com/maps/search/${spot.lat},${spot.lng}`,
                      "_blank"
                    )
                  }}
                  style={{
                    width: "100%",
                    padding: "0.5rem",
                    background: "#0b64d1",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    fontSize: "0.85rem",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
                >
                  View on Map
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

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
          📊 Reports Trend (Last 7 Days)
        </h4>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: "0.5rem",
            height: "200px",
            justifyContent: "space-around",
          }}
        >
          {analytics.trendData.map((day, idx) => {
            const maxCount = Math.max(...analytics.trendData.map(d => d.count), 1)
            const height = (day.count / maxCount) * 180

            return (
              <div
                key={idx}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "0.5rem",
                }}
              >
                <div
                  style={{
                    width: "100%",
                    height: `${height}px`,
                    background: "linear-gradient(180deg, #0b64d1, #0b64d155)",
                    borderRadius: "4px 4px 0 0",
                  }}
                  title={`${day.date}: ${day.count} reports`}
                />
                <div style={{ fontSize: "0.75rem", color: "#9ca3af" }}>
                  {new Date(day.date).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                </div>
                <div style={{ fontSize: "0.75rem", fontWeight: 600, color: "#0b64d1" }}>
                  {day.count}
                </div>
              </div>
            )
          })}
        </div>
      </div>

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
          ⏱️ Response Time Distribution
        </h4>
        {analytics.responseTimes.length === 0 ? (
          <p style={{ color: "#9ca3af", fontSize: "0.9rem" }}>No response time data available</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", color: "#e6e6e6" }}>
                Distribution by Status
              </div>
              <div style={{ display: "flex", gap: "0.5rem", height: "30px", borderRadius: "6px", overflow: "hidden" }}>
                {["Pending", "In Progress", "Resolved"].map(status => {
                  const count = analytics.responseTimes.filter(rt => rt.status === status).length
                  const pct = (count / analytics.responseTimes.length) * 100

                  return (
                    <div
                      key={status}
                      style={{
                        flex: pct,
                        background:
                          status === "Pending"
                            ? "#f59e0b"
                            : status === "In Progress"
                              ? "#0b64d1"
                              : "#10b981",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: "white",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                      }}
                      title={`${status}: ${count}`}
                    >
                      {count > 0 && count}
                    </div>
                  )
                })}
              </div>
            </div>

            <div>
              <div style={{ fontSize: "0.9rem", fontWeight: 600, marginBottom: "0.5rem", color: "#e6e6e6" }}>
                Response Time Ranges
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {[
                  { range: "< 1 hour", min: 0, max: 1 },
                  { range: "1-8 hours", min: 1, max: 8 },
                  { range: "1-3 days", min: 8, max: 72 },
                  { range: "> 3 days", min: 72, max: Infinity },
                ].map(bucket => {
                  const count = analytics.responseTimes.filter(
                    rt => rt.hours >= bucket.min && rt.hours < bucket.max
                  ).length
                  const pct = (count / analytics.responseTimes.length) * 100

                  return (
                    <div key={bucket.range}>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem", marginBottom: "0.25rem", color: "#e6e6e6" }}>
                        <span>{bucket.range}</span>
                        <span style={{ color: "#9ca3af" }}>{count}</span>
                      </div>
                      <div
                        style={{
                          width: "100%",
                          height: "6px",
                          background: "#3a3a3a",
                          borderRadius: "3px",
                          overflow: "hidden",
                        }}
                      >
                        <div
                          style={{
                            width: `${pct}%`,
                            height: "100%",
                            background: "#0b64d1",
                          }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
