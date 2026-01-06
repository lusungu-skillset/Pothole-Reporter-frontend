"use client"
import { useMemo, useState, useEffect } from "react"
import axios from "axios"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Clock, TrendingUp } from "lucide-react"

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

export default function DashboardStats({ potholes = [], apiClient }: { potholes: any[]; apiClient?: any }) {
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

    const byStatus: Record<string, number> = {}
    const bySeverity: Record<string, number> = {}
    const byDistrict: Record<string, number> = {}

    potholes.forEach((p) => {
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

  const StatCard = ({ title, value, color, icon: Icon, sub }: { title: string; value: number; color: string; icon: any; sub?: string }) => (
    <Card className="border-border bg-card/50">
      <CardContent className="pt-6">
        <div className="flex items-center gap-4">
          <div
            className="flex h-12 w-12 items-center justify-center rounded-lg"
            style={{ backgroundColor: `${color}1A` }}
          >
            <Icon className="h-6 w-6" style={{ color }} />
          </div>
          <div>
            <p className="text-sm text-muted-foreground">{title}</p>
            <p className="text-3xl font-bold" style={{ color }}>
              {value}
            </p>
            {sub && <p className="text-xs text-muted-foreground">{sub}</p>}
          </div>
        </div>
      </CardContent>
    </Card>
  )

  return (
    <div className="space-y-6">
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard title="Total Reports" value={stats.total} color="#0b64d1" icon={AlertTriangle} />
        <StatCard title="Pending" value={stats.pending} color="#FFCC00" icon={Clock} />
        <StatCard title="In Progress" value={stats.inProgress} color="#0b64d1" icon={TrendingUp} />
        <StatCard title="Resolved" value={stats.resolved} color="#10b981" icon={CheckCircle} />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="border-border bg-card/50">
          <CardContent className="pt-6">
            <h4 className="mb-4 text-lg font-semibold">Severity Distribution</h4>
            <div className="space-y-4">
              {Object.entries(stats.severity).map(([k, v]) => (
                <div key={k}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{k}</span>
                    <span className="text-muted-foreground">{v}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(v / stats.total) * 100}%`,
                        backgroundColor: "#FFCC00",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card/50">
          <CardContent className="pt-6">
            <h4 className="mb-4 text-lg font-semibold">District Distribution</h4>
            <div className="space-y-4">
              {Object.entries(stats.districts).map(([d, v]) => (
                <div key={d}>
                  <div className="mb-1 flex justify-between text-sm">
                    <span className="font-medium">{d}</span>
                    <span className="text-muted-foreground">{v}</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${(v / stats.total) * 100}%`,
                        backgroundColor: "#0b64d1",
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-border bg-primary/10">
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <TrendingUp className="h-5 w-5 text-primary" />
            <div>
              <h4 className="mb-2 font-semibold">Key Insights</h4>
              <ul className="space-y-1 text-sm text-muted-foreground">
                <li>{stats.resolved} reports resolved</li>
                <li>{stats.pending} still pending</li>
                <li>{stats.inProgress} under active repair</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
