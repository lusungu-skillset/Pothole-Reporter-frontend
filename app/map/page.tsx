"use client"

import { useEffect, useState } from "react"
import Map from "@/components/map"
import Navigation from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"

/* -------------------------------
   Types
-------------------------------- */
type Pothole = {
  id: number
  severity: "Low" | "Medium" | "High" | "Critical"
  status: "PENDING" | "RESOLVED" | "IN_PROGRESS"
}

/* -------------------------------
   Page
-------------------------------- */
export default function MapPage() {
  const [potholes, setPotholes] = useState<Pothole[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [severityFilter, setSeverityFilter] = useState<string[]>([])

  useEffect(() => {
    async function fetchPotholes() {
      try {
        const res = await fetch("http://localhost:3005/api/potholes")
        if (res.ok) {
          const data: Pothole[] = await res.json()
          setPotholes(data)
        }
      } catch (err) {
        console.error("Error fetching potholes:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchPotholes()
    const interval = setInterval(fetchPotholes, 10000)
    return () => clearInterval(interval)
  }, [])

  const filteredPotholes =
    severityFilter.length === 0
      ? potholes
      : potholes.filter((p) => severityFilter.includes(p.severity))

  const toggleSeverity = (value: string) => {
    setSeverityFilter((prev) =>
      prev.includes(value) ? prev.filter((v) => v !== value) : [...prev, value]
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <Navigation />

      <main className="flex-1">
        {/* Hero */}
        <section className="border-b bg-gradient-to-b from-background to-muted/20 py-12">
          <div className="container">
            <h1 className="mb-3 text-4xl font-bold tracking-tight">
              Pothole Map
            </h1>
            <p className="text-lg text-muted-foreground">
              View all reported potholes across Lilongwe.
            </p>
          </div>
        </section>

        {/* Content */}
        <section className="container py-8">
          <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
            {/* Sidebar */}
            <aside className="space-y-6">
              {/* Stats */}
              <Card className="p-6">
                <h3 className="mb-4 font-semibold">Statistics</h3>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Total Reports
                    </span>
                    <Badge variant="secondary">
                      {potholes.length}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Pending
                    </span>
                    <Badge className="bg-amber-500/10 text-amber-500">
                      {potholes.filter((p) => p.status === "PENDING").length}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">
                      Resolved
                    </span>
                    <Badge className="bg-emerald-500/10 text-emerald-500">
                      {potholes.filter((p) => p.status === "RESOLVED").length}
                    </Badge>
                  </div>
                </div>
              </Card>

              {/* Filters */}
              <Card className="p-6">
                <h3 className="mb-4 font-semibold">Filter by Severity</h3>

                <div className="space-y-3">
                  {["Low", "Medium", "High", "Critical"].map((severity) => (
                    <div key={severity} className="flex items-center space-x-2">
                      <Checkbox
                        id={severity}
                        checked={severityFilter.includes(severity)}
                        onCheckedChange={() => toggleSeverity(severity)}
                      />
                      <Label
                        htmlFor={severity}
                        className="flex flex-1 justify-between text-sm"
                      >
                        <span>{severity}</span>
                        <Badge variant="outline">
                          {
                            potholes.filter(
                              (p) => p.severity === severity
                            ).length
                          }
                        </Badge>
                      </Label>
                    </div>
                  ))}
                </div>

                {severityFilter.length > 0 && (
                  <button
                    onClick={() => setSeverityFilter([])}
                    className="mt-4 w-full text-sm text-[#FFCC00] hover:underline"
                  >
                    Clear filters
                  </button>
                )}
              </Card>
            </aside>

            {/* Map */}
            <Card className="overflow-hidden">
              <div className="h-[600px] w-full">
                {loading ? (
                  <div className="flex h-full items-center justify-center bg-muted">
                    <p className="text-muted-foreground">
                      Loading map...
                    </p>
                  </div>
                ) : (
                  /* Map is click-only now */
                  <Map onSelect={() => {}} />
                )}
              </div>
            </Card>
          </div>
        </section>
      </main>

      <footer className="border-t bg-background py-8">
        <div className="container text-center text-sm text-muted-foreground">
          © 2026 RoadWatch. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
