import { useState, useEffect } from "react"
import axios from "axios"


const apiClient = axios.create({
  baseURL: "http://localhost:3005",
  headers: {
    "Content-Type": "application/json"
  }
})

export default function ReportForm({ selectedLocation, onSubmit }) {
  const [formData, setFormData] = useState({
    reporterName: "",
    description: "",
    severity: "MEDIUM"
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [photos, setPhotos] = useState([])
  const [previews, setPreviews] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    
    if (!selectedLocation) {
      setError("Please select a location on the map first")
      return
    }

    if (!formData.reporterName.trim()) {
      setError("Please enter your name")
      return
    }

    if (!formData.description.trim()) {
      setError("Please enter a description")
      return
    }
    
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('reporterName', formData.reporterName)
      fd.append('description', formData.description)
      fd.append('severity', formData.severity)
      fd.append('latitude', String(selectedLocation.lat))
      fd.append('longitude', String(selectedLocation.lng))
      
      // append all photos if present
      photos.forEach((file) => fd.append('photos', file))

      const response = await apiClient.post("/potholes", fd, {
        headers: { 'Content-Type': 'multipart/form-data' }
      })

      alert("Report submitted successfully!")

      if (onSubmit) onSubmit(response.data)

      setFormData({ reporterName: "", description: "", severity: "MEDIUM" })
      setPhotos([])
      setPreviews([])
    } catch (err) {
      console.error("Full error object:", err)

      let errorMessage = "Failed to submit report"

      const backendUrl = apiClient?.defaults?.baseURL || "(unknown backend URL)"

      if (err?.code === "ERR_NETWORK") {
        errorMessage = `Network error: Cannot connect to server. Make sure the backend is running at ${backendUrl}`
      } else if (err.response?.status === 0) {
        errorMessage = `Connection failed: Backend server ${backendUrl} is not accessible`
      } else if (err.response?.status === 404) {
        errorMessage = `API endpoint not found (404) at ${backendUrl}`
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Invalid data submitted"
      } else if (err.response?.status === 500) {
        errorMessage = "Server error: " + (err.response?.data?.message || "Internal server error")
      } else if (err.message === "Network Error") {
        errorMessage = `Network error: Check if backend ${backendUrl} is running and CORS is configured`
      } else {
        errorMessage = err.response?.data?.message || err.message || errorMessage
      }

      setError(errorMessage)
      console.error("Error submitting report:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // create previews
    const urls = photos.map(file => URL.createObjectURL(file))
    setPreviews(urls)

    return () => {
      urls.forEach(u => URL.revokeObjectURL(u))
    }
  }, [photos])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    setPhotos(files)
  }
    return (
  <form className="report-card" onSubmit={handleSubmit}>
  <h2 className="report-title">Report a Pothole</h2>

  {error && <div className="form-error">{error}</div>}

  <div className="form-group">
    <label className="form-label">Your Name *</label>
    <input
      className="form-input"
      placeholder="Enter your name"
      value={formData.reporterName}
      onChange={(e) =>
        setFormData({ ...formData, reporterName: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label className="form-label">Description *</label>
    <textarea
      className="form-input textarea"
      placeholder="Describe the pothole and road condition"
      value={formData.description}
      onChange={(e) =>
        setFormData({ ...formData, description: e.target.value })
      }
    />
  </div>

  <div className="form-group">
    <label className="form-label">Severity</label>
    <select
      className="form-select"
      value={formData.severity}
      onChange={(e) =>
        setFormData({ ...formData, severity: e.target.value })
      }
    >
      <option value="LOW">Low</option>
      <option value="MEDIUM">Medium</option>
      <option value="HIGH">High</option>
    </select>
  </div>

  <div className="form-group">
    <label className="form-label">Photos (optional)</label>
    <div className="file-input-wrapper">
      <input
        type="file"
        multiple
        onChange={handleFileChange}
        className="file-input"
      />
      <span className="file-hint">Up to 3 images (JPG / PNG)</span>
    </div>
  </div>

  <div className="form-group">
    <label className="form-label">Selected Location</label>
    <div className="location-box">
      {selectedLocation
        ? `Lat: ${selectedLocation.lat.toFixed(5)}, Lng: ${selectedLocation.lng.toFixed(5)}`
        : "Click on the map to select a location"}
    </div>
  </div>

  <button className="submit-btn" type="submit" disabled={loading}>
    {loading ? "Submitting..." : "Submit Report"}
  </button>
</form>


)

  
}
