"use client"
import { useState, useMemo } from "react"

export default function PotholeList({
  potholes = [],
  onUpdateStatus,
  onDeletePothole,
  onSelectPothole,
  onFiltersChange,
  apiClient,
}) 
{
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterDistrict, setFilterDistrict] = useState("all")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [selectedIds, setSelectedIds] = useState(new Set())
  const [showBulkActions, setShowBulkActions] = useState(false)
  const [openActionMenuId, setOpenActionMenuId] = useState(null)

  const districts = useMemo(() => {
    const unique = new Set(potholes.map(p => p.district || "Unknown").filter(Boolean))
    return Array.from(unique).sort()
  }, [potholes])

  const formatDate = (value) => {
    if (!value) return "-";
    const date = new Date(value);
    if (isNaN(date.getTime())) return "-";
    return date.toLocaleString("en-GB", {
      year: "numeric",
      month: "short",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const filteredPotholes = useMemo(() => {
    return potholes.filter(pothole => {
      const matchesSearch =
        (pothole.roadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pothole.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pothole.district?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          pothole.location?.toLowerCase().includes(searchTerm.toLowerCase())) ?? false;

      const matchesStatus =
        filterStatus === "all" || pothole.status === filterStatus;

      const matchesSeverity =
        filterSeverity === "all" || pothole.severity === filterSeverity;

      const matchesDistrict =
        filterDistrict === "all" || pothole.district === filterDistrict;

      let matchesDate = true;
      if (filterDateFrom || filterDateTo) {
        const potholeDate = new Date(pothole.reportedAt || pothole.dateReported || pothole.createdAt);
        if (filterDateFrom && new Date(filterDateFrom) > potholeDate) matchesDate = false;
        if (filterDateTo && new Date(filterDateTo) < potholeDate) matchesDate = false;
      }

      return matchesSearch && matchesStatus && matchesSeverity && matchesDistrict && matchesDate;
    });
  }, [
    potholes,
    searchTerm,
    filterStatus,
    filterSeverity,
    filterDistrict,
    filterDateFrom,
    filterDateTo,
  ])

  
  const sortedPotholes = useMemo(() => {
    const sorted = [...filteredPotholes]
    switch (sortBy) {
      case "severity":
        const severityOrder = { Critical: 4, High: 3, Medium: 2, Low: 1 }
        sorted.sort((a, b) => (severityOrder[b.severity] || 0) - (severityOrder[a.severity] || 0))
        break
      case "status":
        const statusOrder = { Pending: 3, "In Progress": 2, Resolved: 1 }
        sorted.sort((a, b) => (statusOrder[b.status] || 0) - (statusOrder[a.status] || 0))
        break
      case "date":
      default:
        sorted.sort((a, b) => new Date(b.reportedAt || b.dateReported || b.createdAt) - new Date(a.reportedAt || a.dateReported || a.createdAt))
    }
    return sorted
  }, [filteredPotholes, sortBy])

  const handleSelectAll = (checked) => {
    if (checked) {
      setSelectedIds(new Set(sortedPotholes.map(p => p.id)))
      setShowBulkActions(true)
    } else {
      setSelectedIds(new Set())
      setShowBulkActions(false)
    }
  }

  const handleSelectPothole = (id, checked) => {
    const newSelected = new Set(selectedIds)
    if (checked) {
      newSelected.add(id)
    } else {
      newSelected.delete(id)
    }
    setSelectedIds(newSelected)
    setShowBulkActions(newSelected.size > 0)
  }

  const handleBulkResolve = async () => {
    if (!window.confirm(`Mark ${selectedIds.size} potholes as Resolved?`)) return
    
    for (const id of selectedIds) {
      await onUpdateStatus?.(id, "Resolved")
    }
    setSelectedIds(new Set())
    setShowBulkActions(false)
  }

  const handleExportCSV = () => {
    const headers = ["ID", "Road Name", "District", "Location", "Severity", "Status", "Date Reported", "Reporter", "Phone", "Email"]
    const rows = sortedPotholes.map(p => [
      p.id,
      p.roadName || "-",
      p.district || "-",
      p.location || "-",
      p.severity || "-",
      p.status || "-",
      p.reportedAt || p.dateReported || p.createdAt,
      p.reporterName || p.reporter_name || "-",
      p.reporterPhone || p.reporter_phone || "-",
      p.reporterEmail || p.reporter_email || "-",
    ])

    const csv = [headers, ...rows]
      .map(row => row.map(cell => `"${(cell || "").toString().replace(/"/g, '""')}"`).join(","))
      .join("\n")

    const blob = new Blob([csv], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `potholes-${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleOpenInMaps = (lat, lng) => {
    window.open(
      `https://www.google.com/maps/search/${lat},${lng}`,
      "_blank"
    )
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case "Critical":
        return "#dc2626"
      case "High":
        return "#ea580c"
      case "Medium":
        return "#f59e0b"
      case "Low":
        return "#10b981"
      default:
        return "#6b7280"
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case "Pending":
        return "#f59e0b"
      case "In Progress":
        return "#0b64d1"
      case "Resolved":
        return "#10b981"
      default:
        return "#6b7280"
    }
  }

  return (
    <div 
      style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}
      onClick={() => {
        if (openActionMenuId) {
          setOpenActionMenuId(null)
        }
      }}
    >
      
      <div
        className="card"
        style={{
          padding: "1.5rem",
          background: "linear-gradient(180deg, #2e2e2e, #262626)",
          border: "1px solid #303030",
          borderRadius: "12px",
          boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
        }}
      >
        <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 600, color: "#e6e6e6" }}>
          Filters & Search
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "1rem",
            marginBottom: "1rem",
          }}
        >
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d4d4d4" }}>
              Search (Road, Description, District)
            </label>
            <input
              type="text"
              placeholder="Search..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input"
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #404040",
                borderRadius: "8px",
                fontSize: "0.9rem",
                background: "#323232",
                color: "#e6e6e6",
              }}
            />
          </div>

      
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d4d4d4" }}>
              Status
            </label>
            <select
              value={filterStatus}
              onChange={(e) => {
                setFilterStatus(e.target.value)
                onFiltersChange?.({ status: e.target.value, severity: filterSeverity, district: filterDistrict })
              }}
              className="input"
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #404040",
                borderRadius: "8px",
                fontSize: "0.9rem",
                background: "#323232",
                color: "#e6e6e6",
              }}
            >
              <option value="all">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

    
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d4d4d4" }}>
              Severity
            </label>
            <select
              value={filterSeverity}
              onChange={(e) => {
                setFilterSeverity(e.target.value)
                onFiltersChange?.({ status: filterStatus, severity: e.target.value, district: filterDistrict })
              }}
              className="input"
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #8B5C2A",
                borderRadius: "8px",
                fontSize: "0.9rem",
                background: "#A0522D", 
                color: "#fff",
              }}
            >
              <option value="all">All Severities</option>
              <option value="Critical">Critical</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>

        
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d4d4d4" }}>
              District
            </label>
            <select
              value={filterDistrict}
              onChange={(e) => {
                setFilterDistrict(e.target.value)
                onFiltersChange?.({ status: filterStatus, severity: filterSeverity, district: e.target.value })
              }}
              className="input"
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #404040",
                borderRadius: "8px",
                fontSize: "0.9rem",
                background: "#323232",
                color: "#e6e6e6",
              }}
            >
              <option value="all">All Districts</option>
              {districts.map(district => (
                <option key={district} value={district}>
                  {district}
                </option>
              ))}
            </select>
          </div>

    
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d4d4d4" }}>
              Date From
            </label>
            <input
              type="date"
              value={filterDateFrom}
              onChange={(e) => setFilterDateFrom(e.target.value)}
              className="input"
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #404040",
                borderRadius: "8px",
                fontSize: "0.9rem",
                background: "#323232",
                color: "#e6e6e6",
              }}
            />
          </div>

      
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d4d4d4" }}>
              Date To
            </label>
            <input
              type="date"
              value={filterDateTo}
              onChange={(e) => setFilterDateTo(e.target.value)}
              className="input"
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #404040",
                borderRadius: "8px",
                fontSize: "0.9rem",
                background: "#323232",
                color: "#e6e6e6",
              }}
            />
          </div>

    
          <div>
            <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.4rem", color: "#d4d4d4" }}>
              Sort By
            </label>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="input"
              style={{
                width: "100%",
                padding: "0.6rem",
                border: "1px solid #404040",
                borderRadius: "8px",
                fontSize: "0.9rem",
                background: "#323232",
                color: "#e6e6e6",
              }}
            >
              <option value="date">Date (Newest)</option>
              <option value="severity">Severity (Highest)</option>
              <option value="status">Status (Pending First)</option>
            </select>
          </div>
        </div>

  
        <div style={{ fontSize: "0.9rem", color: "#9ca3af" }}>
          Showing <strong>{sortedPotholes.length}</strong> of <strong>{potholes.length}</strong> potholes
        </div>
      </div>

      
      {showBulkActions && (
        <div
          style={{
            padding: "1rem",
            background: "#1e3a5f",
            border: "1px solid #2d5a8f",
            borderRadius: "8px",
            display: "flex",
            gap: "0.75rem",
            alignItems: "center",
          }}
        >
          <span style={{ fontSize: "0.9rem", color: "#60d5ff", fontWeight: 600 }}>
            {selectedIds.size} selected
          </span>
          <button
            onClick={handleBulkResolve}
            style={{
              padding: "0.5rem 1rem",
              background: "#10b981",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Mark as Resolved
          </button>
          <button
            onClick={handleExportCSV}
            style={{
              padding: "0.5rem 1rem",
              background: "#0b64d1",
              color: "white",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Export Selected
          </button>
          <button
            onClick={() => {
              setSelectedIds(new Set())
              setShowBulkActions(false)
            }}
            style={{
              padding: "0.5rem 1rem",
              background: "#e5e7eb",
              color: "#374151",
              border: "none",
              borderRadius: "6px",
              fontSize: "0.85rem",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Clear
          </button>
        </div>
      )}

    
      <div style={{ display: "flex", gap: "0.75rem" }}>
        <button
          onClick={handleExportCSV}
          style={{
            padding: "0.6rem 1.2rem",
            background: "#0b64d1",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "0.9rem",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          📥 Export All CSV
        </button>
      </div>

  
      {sortedPotholes.length === 0 ? (
        <div
          style={{
            padding: "2rem",
            textAlign: "center",
            color: "#9ca3af",
            background: "linear-gradient(180deg, #2e2e2e, #262626)",
            borderRadius: "8px",
            border: "1px solid #303030",
          }}
        >
          No potholes match your filters
        </div>
      ) : (
        <div
          style={{
            overflowX: "auto",
            borderRadius: "8px",
            border: "1px solid #303030",
            background: "linear-gradient(180deg, #2e2e2e, #262626)",
            boxShadow: "0 8px 20px rgba(0,0,0,0.3)",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              background: "linear-gradient(180deg, #2e2e2e, #262626)",
            }}
          >
            <thead>
              <tr
                style={{
                  background: "#323232",
                  borderBottom: "1px solid #3a3a3a",
                  position: "sticky",
                  top: 0,
                  zIndex: 10,
                }}
              >
                <th style={{ padding: "1rem 0.75rem", textAlign: "left", fontWeight: 600, fontSize: "0.85rem", color: "#d4d4d4", width: "40px" }}>
                  <input
                    type="checkbox"
                    checked={selectedIds.size === sortedPotholes.length && sortedPotholes.length > 0}
                    onChange={(e) => handleSelectAll(e.target.checked)}
                    style={{ cursor: "pointer" }}
                  />
                </th>
                <th style={{ padding: "1rem 0.75rem", textAlign: "left", fontWeight: 600, fontSize: "0.85rem", color: "#d4d4d4", minWidth: "140px" }}>
                  Road Name
                </th>
                <th style={{ padding: "1rem 0.75rem", textAlign: "left", fontWeight: 600, fontSize: "0.85rem", color: "#d4d4d4", minWidth: "120px" }}>
                  District
                </th>
                <th style={{ padding: "1rem 0.75rem", textAlign: "left", fontWeight: 600, fontSize: "0.85rem", color: "#d4d4d4", minWidth: "100px" }}>
                  Location
                </th>
                <th style={{ padding: "1rem 0.75rem", textAlign: "left", fontWeight: 600, fontSize: "0.85rem", color: "#d4d4d4", minWidth: "100px" }}>
                  Severity
                </th>
                <th style={{ padding: "1rem 0.75rem", textAlign: "left", fontWeight: 600, fontSize: "0.85rem", color: "#d4d4d4", minWidth: "110px" }}>
                  Status
                </th>
                <th style={{ padding: "1rem 0.75rem", textAlign: "left", fontWeight: 600, fontSize: "0.85rem", color: "#d4d4d4", minWidth: "120px" }}>
                  Date Reported
                </th>
                <th style={{ padding: "1rem 0.75rem", textAlign: "center", fontWeight: 600, fontSize: "0.85rem", color: "#d4d4d4", width: "100px" }}>
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {sortedPotholes.map((pothole) => (
                <tr
                  key={pothole.id}
                  style={{
                    borderBottom: "1px solid #3a3a3a",
                    background: "linear-gradient(180deg, #2e2e2e, #262626)",
                    transition: "background 0.2s ease",
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255, 140, 26, 0.05)"}
                  onMouseLeave={(e) => e.currentTarget.style.background = "linear-gradient(180deg, #2e2e2e, #262626)"}
                >
                  <td style={{ padding: "1rem 0.75rem" }}>
                    <input
                      type="checkbox"
                      checked={selectedIds.has(pothole.id)}
                      onChange={(e) => handleSelectPothole(pothole.id, e.target.checked)}
                      style={{ cursor: "pointer" }}
                    />
                  </td>
                  <td style={{ padding: "1rem 0.75rem", fontSize: "0.9rem", fontWeight: 500, color: "#e6e6e6" }}>
                    {pothole.roadName || "-"}
                  </td>
                  <td style={{ padding: "1rem 0.75rem", fontSize: "0.9rem", color: "#9ca3af" }}>
                    {pothole.district || "-"}
                  </td>
                  <td style={{ padding: "1rem 0.75rem", fontSize: "0.9rem", color: "#9ca3af" }}>
                    {pothole.location
                      ? pothole.location
                      : pothole.latitude && pothole.longitude
                        ? `${pothole.latitude}, ${pothole.longitude}`
                        : "-"}
                  </td>
                  <td style={{ padding: "1rem 0.75rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.35rem 0.7rem",
                        background: `${getSeverityColor(pothole.severity)}20`,
                        color: getSeverityColor(pothole.severity),
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {pothole.severity || "-"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 0.75rem" }}>
                    <span
                      style={{
                        display: "inline-block",
                        padding: "0.35rem 0.7rem",
                        background: `${getStatusColor(pothole.status)}20`,
                        color: getStatusColor(pothole.status),
                        borderRadius: "4px",
                        fontSize: "0.8rem",
                        fontWeight: 600,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {pothole.status || "-"}
                    </span>
                  </td>
                  <td style={{ padding: "1rem 0.75rem", fontSize: "0.9rem", color: "#9ca3af" }}>
                    {formatDate(pothole.reportedAt || pothole.dateReported || pothole.createdAt)}
                  </td>
                  <td
                    style={{
                      padding: "0.75rem",
                      textAlign: "center",
                      position: "relative",
                    }}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setOpenActionMenuId(openActionMenuId === pothole.id ? null : pothole.id)}
                      style={{
                        padding: "0.4rem 0.8rem",
                        background: "#323232",
                        color: "#e6e6e6",
                        border: "1px solid #404040",
                        borderRadius: "4px",
                        fontSize: "0.85rem",
                        fontWeight: 600,
                        cursor: "pointer",
                        transition: "background 0.2s ease",
                      }}
                      onMouseEnter={(e) => e.target.style.background = "#3a3a3a"}
                      onMouseLeave={(e) => e.target.style.background = "#323232"}
                    >
                      ⚙️ Actions
                    </button>

                    {openActionMenuId === pothole.id && (
                      <div
                        style={{
                          position: "absolute",
                          top: "100%",
                          right: 0,
                          marginTop: "0.5rem",
                          background: "#1f1f1f",
                          border: "1px solid #3a3a3a",
                          borderRadius: "6px",
                          minWidth: "180px",
                          boxShadow: "0 10px 25px rgba(0,0,0,0.5)",
                          zIndex: 100,
                          overflow: "hidden",
                        }}
                      >
                        <button
                          onClick={() => {
                            onSelectPothole?.(pothole.id)
                            setOpenActionMenuId(null)
                          }}
                          style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            background: "#2a2a2a",
                            color: "#fff",
                            border: "none",
                            textAlign: "left",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            borderBottom: "1px solid #161615ff",
                            transition: "background 0.2s ease",
                          }}
                          onMouseEnter={(e) => e.target.style.background = "#20201fff"}
                          onMouseLeave={(e) => e.target.style.background = "#1d1d1cff"}
                        >
                          👁️ View Details
                        </button>

                        <button
                          onClick={() => {
                            handleOpenInMaps(pothole.latitude, pothole.longitude)
                            setOpenActionMenuId(null)
                          }}
                          style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            background: "transparent",
                            color: "#e6e6e6",
                            border: "none",
                            textAlign: "left",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            borderBottom: "1px solid #2a2a2a",
                            transition: "background 0.2s ease",
                          }}
                          onMouseEnter={(e) => e.target.style.background = "#2a2a2a"}
                          onMouseLeave={(e) => e.target.style.background = "transparent"}
                        >
                          🗺️ Open Map
                        </button>

                        {pothole.status !== "Resolved" && (
                          <>
                            <select
                              value={pothole.status || "Pending"}
                              onChange={(e) => {
                                onUpdateStatus?.(pothole.id, e.target.value)
                                setOpenActionMenuId(null)
                              }}
                              style={{
                                width: "100%",
                                padding: "0.75rem 1rem",
                                background: "#2a2a2a",
                                border: "none",
                                borderBottom: "1px solid #2a2a2a",
                                borderRadius: 0,
                                fontSize: "0.85rem",
                                fontWeight: 600,
                                cursor: "pointer",
                                color: "#ffffff",
                                appearance: "none",
                                paddingRight: "2rem",
                                backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%23e6e6e6' d='M6 9L1 4h10z'/%3E%3C/svg%3E\")",
                                backgroundRepeat: "no-repeat",
                                backgroundPosition: "right 0.75rem center",
                              }}
                            >
                              <option value="Pending">📋 Pending</option>
                              <option value="In Progress">⏳ In Progress</option>
                              <option value="Resolved">✅ Resolved</option>
                            </select>
                          </>
                        )}

                        <button
                          onClick={() => {
                            if (window.confirm("Delete this pothole report?")) {
                              onDeletePothole?.(pothole.id)
                            }
                            setOpenActionMenuId(null)
                          }}
                          style={{
                            width: "100%",
                            padding: "0.75rem 1rem",
                            background: "transparent",
                            color: "#fca5a5",
                            border: "none",
                            textAlign: "left",
                            fontSize: "0.85rem",
                            cursor: "pointer",
                            transition: "background 0.2s ease",
                          }}
                          onMouseEnter={(e) => e.target.style.background = "rgba(239, 68, 68, 0.1)"}
                          onMouseLeave={(e) => e.target.style.background = "transparent"}
                        >
                          🗑️ Delete
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
