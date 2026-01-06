"use client"

import { useState, useMemo } from "react"
import type { Pothole } from "@/components/types/pothole"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { MapPin, Trash2 } from "lucide-react"

/* ================= PROPS ================= */

interface PotholeListProps {
  potholes: Pothole[]
  onUpdateStatus?: (id: string, status: string) => Promise<void> | void
  onDeletePothole?: (id: string) => void
  onSelectPothole?: (id: string) => void
  onFiltersChange?: (filters: {
    status?: string
    severity?: string
    district?: string
    dateFrom?: string
    dateTo?: string
  }) => void
}

/* ================= CONSTANTS ================= */

const STATUS_OPTIONS = ["Pending", "In Progress", "Resolved"] as const

const getStatusClasses = (status?: string) => {
  switch (status) {
    case "Resolved":
      return "bg-green-500 text-white"
    case "In Progress":
      return "bg-blue-500 text-white"
    case "Pending":
    default:
      return "bg-yellow-400 text-black"
  }
}

/* ================= COMPONENT ================= */

export default function PotholeList({
  potholes,
  onUpdateStatus,
  onDeletePothole,
  onFiltersChange,
}: PotholeListProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [filterSeverity, setFilterSeverity] = useState("all")
  const [filterDistrict, setFilterDistrict] = useState("all")
  const [filterDateFrom, setFilterDateFrom] = useState("")
  const [filterDateTo, setFilterDateTo] = useState("")

  /* ================= HELPERS ================= */

  const formatDate = (value?: string) => {
    if (!value) return "-"
    const date = new Date(value)
    return isNaN(date.getTime())
      ? "-"
      : date.toLocaleString("en-GB", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })
  }

  const districts = useMemo(() => {
    return Array.from(
      new Set(potholes.map((p) => p.district).filter(Boolean)),
    ).sort()
  }, [potholes])

  /* ================= FILTER ================= */

  const filteredPotholes = useMemo(() => {
    return potholes.filter((p) => {
      const matchesSearch =
        p.roadName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.district?.toLowerCase().includes(searchTerm.toLowerCase())

      const matchesStatus = filterStatus === "all" || p.status === filterStatus
      const matchesSeverity = filterSeverity === "all" || p.severity === filterSeverity
      const matchesDistrict = filterDistrict === "all" || p.district === filterDistrict

      let matchesDate = true
      if (filterDateFrom || filterDateTo) {
        const date = new Date(p.reportedAt || p.createdAt || "")
        if (filterDateFrom && new Date(filterDateFrom) > date) matchesDate = false
        if (filterDateTo && new Date(filterDateTo) < date) matchesDate = false
      }

      return (
        Boolean(matchesSearch) &&
        matchesStatus &&
        matchesSeverity &&
        matchesDistrict &&
        matchesDate
      )
    })
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
    return [...filteredPotholes].sort(
      (a, b) =>
        new Date(b.reportedAt || b.createdAt || "").getTime() -
        new Date(a.reportedAt || a.createdAt || "").getTime(),
    )
  }, [filteredPotholes])

  /* ================= UI ================= */

  return (
    <div className="space-y-6">
      {/* FILTERS */}
      <Card className="border-border bg-card/50">
        <CardContent className="pt-6">
          <h3 className="mb-4 text-lg font-semibold">Filters & Search</h3>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <div>
              <label className="mb-2 block text-sm font-medium">Search</label>
              <Input
                placeholder="Road, district, description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Status</label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All</option>
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">Severity</label>
              <select
                value={filterSeverity}
                onChange={(e) => setFilterSeverity(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All</option>
                <option value="Critical">Critical</option>
                <option value="High">High</option>
                <option value="Medium">Medium</option>
                <option value="Low">Low</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">District</label>
              <select
                value={filterDistrict}
                onChange={(e) => setFilterDistrict(e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All</option>
                {districts.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">From</label>
              <Input
                type="date"
                value={filterDateFrom}
                onChange={(e) => setFilterDateFrom(e.target.value)}
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium">To</label>
              <Input
                type="date"
                value={filterDateTo}
                onChange={(e) => setFilterDateTo(e.target.value)}
              />
            </div>
          </div>

          <div className="mt-4 text-sm text-muted-foreground">
            Showing <strong>{sortedPotholes.length}</strong> of{" "}
            <strong>{potholes.length}</strong> potholes
          </div>
        </CardContent>
      </Card>

      {/* TABLE */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="p-4 text-left">Road</th>
                <th className="p-4 text-left">District</th>
                <th className="p-4 text-left">Severity</th>
                <th className="p-4 text-left">Status</th>
                <th className="p-4 text-left">Date</th>
                <th className="p-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {sortedPotholes.map((p) => (
                <tr key={p.id} className="border-b hover:bg-muted/50">
                  <td className="p-4">{p.roadName ?? "-"}</td>
                  <td className="p-4">{p.district ?? "-"}</td>
                  <td className="p-4">
                    <Badge>{p.severity ?? "Unknown"}</Badge>
                  </td>
                  <td className="p-4">
                    <select
                      value={p.status ?? "Pending"}
                      onChange={(e) => onUpdateStatus?.(p.id, e.target.value)}
                      className={`rounded-md px-3 py-1 text-sm font-medium cursor-pointer ${getStatusClasses(
                        p.status,
                      )}`}
                    >
                      {STATUS_OPTIONS.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="p-4 text-sm">
                    {formatDate(p.reportedAt || p.createdAt)}
                  </td>
                  <td className="p-4 flex justify-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() =>
                        window.open(
                          `https://www.google.com/maps/search/${p.latitude},${p.longitude}`,
                          "_blank",
                        )
                      }
                    >
                      <MapPin className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDeletePothole?.(p.id)}
                      className="hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  )
}
