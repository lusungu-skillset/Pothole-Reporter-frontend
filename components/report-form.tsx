"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { CheckCircle2, XCircle, Upload, MapPin, FileImage } from "lucide-react"

const apiClient = axios.create({
  baseURL: "http://localhost:3005",
  headers: {
    "Content-Type": "application/json",
  },
})

export default function ReportForm({ selectedLocation, onSubmit }) {
  const [formData, setFormData] = useState({
    reporterName: "",
    description: "",
    severity: "MEDIUM",
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  const [photos, setPhotos] = useState([])
  const [previews, setPreviews] = useState([])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

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
      fd.append("reporterName", formData.reporterName)
      fd.append("description", formData.description)
      fd.append("severity", formData.severity)
      fd.append("latitude", String(selectedLocation.lat))
      fd.append("longitude", String(selectedLocation.lng))

      photos.forEach((file) => fd.append("photos", file))

      const response = await apiClient.post("/potholes", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      })

      setSuccess(true)

      if (onSubmit) onSubmit(response.data)

      // Reset form
      setFormData({ reporterName: "", description: "", severity: "MEDIUM" })
      setPhotos([])
      setPreviews([])

      setTimeout(() => setSuccess(false), 5000)
    } catch (err) {
      console.error("Full error object:", err)

      let errorMessage = "Failed to submit report"
      const backendUrl = apiClient?.defaults?.baseURL || "(unknown backend URL)"

      if (err?.code === "ERR_NETWORK") {
        errorMessage = `Network error: Cannot connect to server at ${backendUrl}`
      } else if (err.response?.status === 0) {
        errorMessage = `Connection failed: Backend server is not accessible`
      } else if (err.response?.status === 404) {
        errorMessage = `API endpoint not found (404)`
      } else if (err.response?.status === 400) {
        errorMessage = err.response?.data?.message || "Invalid data submitted"
      } else if (err.response?.status === 500) {
        errorMessage = "Server error: " + (err.response?.data?.message || "Internal server error")
      } else if (err.message === "Network Error") {
        errorMessage = `Network error: Check if backend is running`
      } else {
        errorMessage = err.response?.data?.message || err.message || errorMessage
      }

      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const urls = photos.map((file) => URL.createObjectURL(file))
    setPreviews(urls)
    return () => {
      urls.forEach((u) => URL.revokeObjectURL(u))
    }
  }, [photos])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || []).slice(0, 3)
    setPhotos(files)
  }

  const severityColors = {
    LOW: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    MEDIUM: "bg-amber-500/10 text-amber-500 border-amber-500/20",
    HIGH: "bg-red-500/10 text-red-500 border-red-500/20",
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold mb-2">Report Details</h2>
        <p className="text-sm text-muted-foreground">Fill in the information about the pothole you want to report.</p>
      </div>

      {error && (
        <Alert variant="destructive" className="border-red-500/20 bg-red-500/10">
          <XCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="border-emerald-500/20 bg-emerald-500/10 text-emerald-500">
          <CheckCircle2 className="h-4 w-4" />
          <AlertDescription>Report submitted successfully!</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name Field */}
        <div className="space-y-2">
          <Label htmlFor="name" className="text-sm font-medium">
            Your Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="name"
            placeholder="Enter your name"
            value={formData.reporterName}
            onChange={(e) => setFormData({ ...formData, reporterName: e.target.value })}
            className="border-border focus-visible:ring-[#FFCC00] focus-visible:border-[#FFCC00]"
          />
        </div>

        {/* Description Field */}
        <div className="space-y-2">
          <Label htmlFor="description" className="text-sm font-medium">
            Description <span className="text-red-500">*</span>
          </Label>
          <Textarea
            id="description"
            placeholder="Describe the pothole and road condition..."
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            className="min-h-[100px] resize-none border-border focus-visible:ring-[#FFCC00] focus-visible:border-[#FFCC00]"
          />
        </div>

        {/* Severity Field */}
        <div className="space-y-2">
          <Label htmlFor="severity" className="text-sm font-medium">
            Severity Level
          </Label>
          <select
            id="severity"
            value={formData.severity}
            onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
            className="w-full px-3 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-[#FFCC00] focus:border-[#FFCC00] transition-colors"
          >
            <option value="LOW">Low - Minor issue</option>
            <option value="MEDIUM">Medium - Noticeable damage</option>
            <option value="HIGH">High - Severe hazard</option>
          </select>
          <div className="flex gap-2 mt-2">
            <span className={`text-xs px-2 py-1 rounded-full border ${severityColors[formData.severity]}`}>
              {formData.severity}
            </span>
          </div>
        </div>

        {/* Photo Upload */}
        <div className="space-y-2">
          <Label className="text-sm font-medium flex items-center gap-2">
            <FileImage className="h-4 w-4" />
            Photos (Optional)
          </Label>
          <div className="border-2 border-dashed border-border rounded-lg p-6 hover:border-[#FFCC00]/50 transition-colors">
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer flex flex-col items-center gap-2 text-center">
              <Upload className="h-8 w-8 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Click to upload photos</p>
                <p className="text-xs text-muted-foreground mt-1">Up to 3 images (JPG, PNG)</p>
              </div>
            </label>
          </div>

          {previews.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-3">
              {previews.map((url, idx) => (
                <div key={idx} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                  <img
                    src={url || "/placeholder.svg"}
                    alt={`Preview ${idx + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Location Display */}
        <Card
          className={`p-4 ${selectedLocation ? "border-[#FFCC00]/20 bg-[#FFCC00]/5" : "border-border bg-muted/20"}`}
        >
          <div className="flex items-start gap-3">
            <MapPin
              className={`h-5 w-5 ${selectedLocation ? "text-[#FFCC00]" : "text-muted-foreground"} flex-shrink-0 mt-0.5`}
            />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium mb-1">Selected Location</p>
              {selectedLocation ? (
                <p className="text-xs text-muted-foreground font-mono">
                  Lat: {selectedLocation.lat.toFixed(5)}, Lng: {selectedLocation.lng.toFixed(5)}
                </p>
              ) : (
                <p className="text-xs text-muted-foreground">Click on the map to select a location</p>
              )}
            </div>
          </div>
        </Card>

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading || !selectedLocation}
          className="w-full bg-[#FFCC00] hover:bg-[#FFCC00]/90 text-black font-semibold h-11 transition-all"
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black mr-2"></div>
              Submitting...
            </>
          ) : (
            "Submit Report"
          )}
        </Button>
      </form>
    </div>
  )
}
