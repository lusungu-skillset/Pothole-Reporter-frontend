"use client"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import dynamic from "next/dynamic"

const Map = dynamic(() => import("./Map"), {
  ssr: false,
  loading: () => <div style={{ padding: "1rem", textAlign: "center" }}>Loading map...</div>,
})

export default function PotholeDetailsModal({
  pothole,
  isOpen,
  onClose,
  onUpdateStatus,
  onAddNote,
}) {
  const [notes, setNotes] = useState([])
  const [newNote, setNewNote] = useState("")
  const [newStatus, setNewStatus] = useState(pothole?.status || "Pending")
  const [assignedStaff, setAssignedStaff] = useState(pothole?.assignedStaff || "")
  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(false)
  const [potholeData, setPotholeData] = useState(pothole)
  const authToken = typeof window !== "undefined" ? localStorage.getItem("authToken") : ""

  const apiClient = axios.create({
    baseURL: "http://localhost:3005",
    headers: {
      "Authorization": authToken ? `Bearer ${authToken}` : "",
      "Content-Type": "application/json",
    },
  })

  useEffect(() => {
    if (pothole) {
      setPotholeData(pothole)
      setNewStatus(pothole.status || "Pending")
      console.log("Initial pothole data:", pothole)
      console.log("Initial photos:", pothole.photos)
    }
    
    if (pothole?.id) {
      fetchPotholeDetails()
      fetchNotes()
      fetchStaffList()
    }
  }, [pothole?.id, pothole])

  const fetchPotholeDetails = async () => {
    try {
      const response = await apiClient.get(`/admin/dashboard/potholes/${pothole.id}`)
      console.log("Fetched pothole details:", response.data)
      console.log("Photos array from API:", response.data.photos)
      
      const mergedData = {
        ...pothole,
        ...response.data,
        photos: response.data.photos || pothole.photos || []
      }
      console.log("Merged pothole data:", mergedData)
      console.log("Final photos:", mergedData.photos)
      
      setPotholeData(mergedData)
      setNewStatus(response.data.status || pothole.status || "Pending")
    } catch (err) {
      console.error("Error fetching pothole details:", err)
      setPotholeData(pothole)
    }
  }

  const fetchNotes = async () => {
    try {
      const storedNotes = localStorage.getItem(`pothole-notes-${pothole.id}`)
      if (storedNotes) {
        setNotes(JSON.parse(storedNotes))
      }
    } catch (err) {
      console.error("Error fetching notes:", err)
    }
  }

  const fetchStaffList = async () => {
    try {
      const response = await apiClient.get("/staff")
      setStaffList(response.data || [])
    } catch (err) {
      setStaffList([
        { id: 1, name: "Lusungu" },
        { id: 2, name: "Lusper mhango" },
        { id: 3, name: "Michael Banda" },
      ])
    }
  }

  const handleAddNote = () => {
    if (!newNote.trim()) return

    const note = {
      id: Date.now(),
      text: newNote,
      timestamp: new Date().toISOString(),
      author: "Admin",
    }

    const updatedNotes = [...notes, note]
    setNotes(updatedNotes)
    localStorage.setItem(`pothole-notes-${pothole.id}`, JSON.stringify(updatedNotes))
    setNewNote("")
    onAddNote?.(pothole.id, note)
  }

  const handleStatusChange = async (e) => {
    const status = e.target.value
    setNewStatus(status)
    setLoading(true)
    try {
      await onUpdateStatus?.(pothole.id, status)
    } catch (err) {
      console.error("Error updating status:", err)
      setNewStatus(pothole.status)
    } finally {
      setLoading(false)
    }
  }

  const handleAssignStaff = async () => {
    setLoading(true)
    try {
      await apiClient.put(`/potholes/${pothole.id}`, {
        assignedStaff: assignedStaff,
      })
      alert("Staff member assigned successfully")
    } catch (err) {
      console.error("Error assigning staff:", err)
      alert("Failed to assign staff")
    } finally {
      setLoading(false)
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

  const displayPothole = potholeData || pothole

  // Log for debugging
  useEffect(() => {
    if (displayPothole) {
      console.log("Display pothole:", displayPothole)
      console.log("Display pothole photos:", displayPothole?.photos)
    }
  }, [displayPothole])

  if (!isOpen) return null
  
  if (!potholeData && !pothole) return null

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(0,0,0,0.6)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 1000,
        padding: "1rem",
      }}
      onClick={onClose}
    >
      <div
        style={{
          background: "var(--color-surface)",
          borderRadius: "12px",
          maxWidth: "900px",
          width: "100%",
          maxHeight: "90vh",
          overflowY: "auto",
          padding: "2rem",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          color: "var(--color-text)",
          transition: "background 0.3s ease, color 0.3s ease",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* HEADER */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "start", marginBottom: "1.5rem" }}>
          <div>
            <h2 style={{ margin: "0 0 0.5rem 0", color: "var(--color-text)" }}>Pothole #{displayPothole?.id}</h2>
            <p style={{ color: "var(--color-muted)", margin: 0 }}>{displayPothole?.roadName || "Unnamed Road"}</p>
          </div>
          <button
            onClick={onClose}
            style={{
              background: "var(--color-bg)",
              border: "1px solid var(--color-muted)",
              borderRadius: "6px",
              width: "32px",
              height: "32px",
              cursor: "pointer",
              fontSize: "1.2rem",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "var(--color-text)",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => e.target.style.background = "var(--color-bg)"}
            onMouseLeave={(e) => e.target.style.background = "var(--color-surface)"}
          >
            ✕
          </button>
        </div>

        {/* INFO GRID */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
            gap: "1rem",
            marginBottom: "2rem",
            padding: "1.5rem",
            background: "var(--color-bg)",
            borderRadius: "8px",
            border: "1px solid rgba(15,23,36,0.06)",
            transition: "background 0.3s ease",
          }}
        >
          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>
              Status
            </div>
            <select
              value={newStatus}
              onChange={handleStatusChange}
              disabled={loading}
              style={{
                marginTop: "0.5rem",
                padding: "0.5rem",
                borderRadius: "6px",
                border: "1px solid var(--color-muted)",
                background: "var(--color-surface)",
                fontWeight: 600,
                color: getStatusColor(newStatus),
                transition: "background 0.3s ease",
              }}
            >
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>
              Severity
            </div>
            <div
              style={{
                marginTop: "0.5rem",
                display: "inline-block",
                padding: "0.5rem 1rem",
                background: `${getSeverityColor(displayPothole?.severity)}20`,
                color: getSeverityColor(displayPothole?.severity),
                borderRadius: "6px",
                fontWeight: 600,
                fontSize: "0.9rem",
              }}
            >
              {displayPothole?.severity || "Unknown"}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>
              District
            </div>
            <div style={{ marginTop: "0.5rem", fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text)" }}>
              {displayPothole?.district || "-"}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>
              Location
            </div>
            <div style={{ marginTop: "0.5rem", fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text)" }}>
              {displayPothole?.location || "-"}
            </div>
          </div>

          <div>
            <div style={{ fontSize: "0.75rem", fontWeight: 700, color: "var(--color-muted)", textTransform: "uppercase" }}>
              Date Reported
            </div>
            <div style={{ marginTop: "0.5rem", fontWeight: 600, fontSize: "0.9rem", color: "var(--color-text)" }}>
              {displayPothole?.dateReported || displayPothole?.createdAt
                ? new Date(displayPothole?.dateReported || displayPothole?.createdAt).toLocaleDateString()
                : "-"}
            </div>
          </div>
        </div>

        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "2rem", marginBottom: "2rem" }}>
          
          <div>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 600, color: "var(--color-text)" }}>Details</h3>

            <div style={{ marginBottom: "1.5rem", background: " rgba(5, 5, 5, 0.06)" }}>
              <h4 style={{ margin: "0 0 0.5rem 0", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text)" }}>
                Description
              </h4>
              <p style={{ margin: 0, color: "var(--color-muted)", lineHeight: 1.6 }}>
                {displayPothole?.description || "No description provided"}
              </p>
            </div>

      
            <div style={{ padding: "1rem", background: "var(--color-bg)", borderRadius: "8px", transition: "background 0.3s ease" }}>
              <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text)" }}>
                Coordinates
              </h4>
              <div style={{ fontSize: "0.85rem", fontFamily: "monospace", color: "var(--color-muted)" }}>
                <div>Latitude: {displayPothole?.latitude?.toFixed(6) || "-"}</div>
                <div>Longitude: {displayPothole?.longitude?.toFixed(6) || "-"}</div>
              </div>
            </div>
          </div>

          {/* RIGHT: MAP & ASSIGNMENT */}
          <div>
            {/* MAP */}
            <div style={{ marginBottom: "1.5rem" }}>
              <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text)" }}>
                Location Map
              </h4>
              <div
                style={{
                  width: "100%",
                  height: "250px",
                  background: "var(--color-bg)",
                  borderRadius: "8px",
                  overflow: "hidden",
                  border: "1px solid rgba(15,23,36,0.06)",
                  transition: "background 0.3s ease",
                }}
              >
                <Map
                  potholes={[pothole]}
                  onSelect={() => {}}
                />
              </div>
            </div>

            {/* STAFF ASSIGNMENT */}
            <div style={{ padding: "1rem", background: "var(--color-bg)", borderRadius: "8px", transition: "background 0.3s ease" }}>
              <h4 style={{ margin: "0 0 0.75rem 0", fontSize: "0.9rem", fontWeight: 600, color: "var(--color-text)" }}>
                Assign to Staff
              </h4>
              <div style={{ display: "flex", gap: "0.5rem" }}>
                <select
                  value={assignedStaff}
                  onChange={(e) => setAssignedStaff(e.target.value)}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: "0.6rem",
                    borderRadius: "6px",
                    border: "1px solid var(--color-muted)",
                    fontSize: "0.9rem",
                    background: "var(--color-surface)",
                    color: "var(--color-text)",
                    transition: "background 0.3s ease",
                  }}
                >
                  <option value="">Select staff member...</option>
                  {staffList.map(staff => (
                    <option key={staff.id} value={staff.name}>
                      {staff.name}
                    </option>
                  ))}
                </select>
                <button
                  onClick={handleAssignStaff}
                  disabled={loading || !assignedStaff}
                  style={{
                    padding: "0.6rem 1rem",
                    background: assignedStaff && !loading ? "var(--color-primary)" : "var(--color-muted)",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: assignedStaff && !loading ? "pointer" : "not-allowed",
                    fontWeight: 600,
                    fontSize: "0.85rem",
                    transition: "background 0.2s ease",
                  }}
                >
                  Assign
                </button>
              </div>
              {pothole.assignedStaff && (
                <div style={{ marginTop: "0.5rem", fontSize: "0.85rem", color: "var(--color-success)" }}>
                  ✓ Assigned to {pothole.assignedStaff}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* PHOTOS */}
        {displayPothole?.photos && Array.isArray(displayPothole.photos) && displayPothole.photos.length > 0 ? (
          <div style={{ marginBottom: "2rem" }}>
            <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 600, color: "var(--color-text)" }}>
              Photos ({displayPothole.photos.length})
            </h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "1rem" }}>
              {displayPothole.photos.map((photo, idx) => {
                console.log(`Rendering photo ${idx}:`, photo)
                const photoUrl = typeof photo === "string" ? photo : photo.photo_url || URL.createObjectURL(photo)
                return (
                  <div
                    key={idx}
                    style={{
                      width: "100%",
                      paddingBottom: "100%",
                      position: "relative",
                      borderRadius: "8px",
                      overflow: "hidden",
                      background: "var(--color-bg)",
                      cursor: "pointer",
                      border: "1px solid rgba(15,23,36,0.06)",
                      transition: "transform 0.2s ease, box-shadow 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = "scale(1.05)"
                      e.currentTarget.style.boxShadow = "0 8px 16px rgba(0,0,0,0.2)"
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = "scale(1)"
                      e.currentTarget.style.boxShadow = "none"
                    }}
                  >
                    <img
                      src={photoUrl}
                      alt={`Pothole photo ${idx + 1}`}
                      onClick={() => window.open(photoUrl, "_blank")}
                      onError={(e) => {
                        console.error(`Failed to load photo ${idx}:`, photoUrl, e)
                        e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='200' height='200'%3E%3Crect fill='%23ccc' width='200' height='200'/%3E%3Ctext x='50%25' y='50%25' text-anchor='middle' dy='.3em' fill='%23999' font-size='14'%3EImage failed to load%3C/text%3E%3C/svg%3E"
                      }}
                      style={{
                        position: "absolute",
                        inset: 0,
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                      }}
                    />
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div style={{ marginBottom: "2rem", padding: "1rem", background: "var(--color-bg)", borderRadius: "8px", textAlign: "center", color: "var(--color-muted)" }}>
            <p>No photos uploaded for this pothole</p>
            <p style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
              {displayPothole ? `(photos field exists: ${displayPothole.photos ? "yes" : "no"}, is array: ${Array.isArray(displayPothole.photos) ? "yes" : "no"})` : ""}
            </p>
          </div>
        )}

        {/* UPDATE HISTORY / NOTES */}
        <div style={{ marginBottom: "2rem" }}>
          <h3 style={{ margin: "0 0 1rem 0", fontSize: "1rem", fontWeight: 600, color: "var(--color-text)" }}>
            Update History & Notes
          </h3>

          <div style={{ marginBottom: "1.5rem" }}>
            <textarea
              value={newNote}
              onChange={(e) => setNewNote(e.target.value)}
              placeholder="Add a note or update..."
              style={{
                width: "100%",
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid var(--color-muted)",
                fontSize: "0.9rem",
                minHeight: "80px",
                fontFamily: "inherit",
                background: "var(--color-bg)",
                color: "var(--color-text)",
                transition: "background 0.3s ease, border-color 0.3s ease",
              }}
            />
            <button
              onClick={handleAddNote}
              disabled={!newNote.trim() || loading}
              style={{
                marginTop: "0.5rem",
                padding: "0.6rem 1.2rem",
                background: newNote.trim() && !loading ? "var(--color-primary)" : "var(--color-muted)",
                color: "white",
                border: "none",
                borderRadius: "6px",
                fontWeight: 600,
                cursor: newNote.trim() && !loading ? "pointer" : "not-allowed",
                transition: "background 0.2s ease",
              }}
            >
              Add Note
            </button>
          </div>

          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            {notes.length === 0 ? (
              <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>No notes yet</p>
            ) : (
              notes.map((note) => (
                <div
                  key={note.id}
                  style={{
                    padding: "1rem",
                    background: "var(--color-bg)",
                    borderRadius: "8px",
                    marginBottom: "0.5rem",
                    borderLeft: "4px solid var(--color-primary)",
                    transition: "background 0.3s ease",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "0.5rem" }}>
                    <strong style={{ fontSize: "0.9rem", color: "var(--color-text)" }}>{note.author}</strong>
                    <span style={{ fontSize: "0.75rem", color: "var(--color-muted)" }}>
                      {new Date(note.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p style={{ margin: 0, fontSize: "0.9rem", color: "var(--color-muted)", lineHeight: 1.5 }}>
                    {note.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>

        {/* CLOSE BUTTON */}
        <div style={{ display: "flex", gap: "0.75rem", justifyContent: "flex-end" }}>
          <button
            onClick={onClose}
            style={{
              padding: "0.75rem 1.5rem",
              background: "var(--color-bg)",
              color: "var(--color-text)",
              border: "1px solid var(--color-muted)",
              borderRadius: "6px",
              fontWeight: 600,
              cursor: "pointer",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => e.target.style.background = "var(--color-muted)"}
            onMouseLeave={(e) => e.target.style.background = "var(--color-bg)"}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}
