export type Pothole = {
  id: string
  roadName?: string
  description?: string
  district?: string
  location?: string
  severity?: "Critical" | "High" | "Medium" | "Low"
  status?: "Pending" | "In Progress" | "Resolved"
  latitude?: number
  longitude?: number
  reportedAt?: string
  dateReported?: string
  createdAt?: string
  reporterName?: string
  reporterPhone?: string
  reporterEmail?: string
}
