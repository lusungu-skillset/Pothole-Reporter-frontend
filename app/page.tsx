"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { AlertTriangle, CheckCircle, Clock, MapPin } from "lucide-react"
import { useState, useEffect } from "react"
import Navigation from "@/components/navigation"

export default function HomePage() {
  const [stats, setStats] = useState({ reported: "—", repaired: "—", pending: "—" })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 5000)

        const res = await fetch("http://localhost:3005/potholes", {
          signal: controller.signal,
        })
        clearTimeout(timeoutId)

        const data = await res.json()
        const potholes = Array.isArray(data) ? data : []

        const reported = potholes.length
        const repaired = potholes.filter((p) => p.status?.toLowerCase() === "resolved").length
        const pending = potholes.filter((p) => p.status?.toLowerCase() === "pending").length

        setStats({
          reported: reported.toString(),
          repaired: repaired.toString(),
          pending: pending.toString(),
        })
      } catch (err) {
 
        if (err instanceof Error && err.name !== "AbortError") {
          console.log("[v0] API not available - using placeholder stats")
        }
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="min-h-screen bg-background">
      <Navigation />

    
      <section className="relative overflow-hidden bg-gradient-to-b from-background to-background/80 py-20 md:py-32">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/10 via-background to-background" />
        <div className="container relative mx-auto px-4">
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
            <div className="space-y-8">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl text-balance">
                {"Keep Roads Safe & Smooth for Everyone"}
              </h1>
              <p className="text-lg text-muted-foreground md:text-xl text-pretty max-w-2xl leading-relaxed">
                Report potholes by selecting exact road locations, adding photos, and tracking repair progress in real
                time.
              </p>
              <div className="flex flex-wrap gap-4">
                <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
                  <Link href="/report">
                    <MapPin className="mr-2 h-5 w-5" />
                    Report Pothole
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/map">View Map</Link>
                </Button>
              </div>
            </div>
            <div className="relative">
              <div className="aspect-[4/3] overflow-hidden rounded-xl border border-border bg-muted shadow-2xl">
                <img
                  src="/damaged-road-with-pothole-requiring-repair.jpg"
                  alt="Damaged road with a pothole requiring repair"
                  className="object-cover w-full h-full"
                />
              </div>
            </div>
          </div>
        </div>
      </section>

  
      <section className="py-16 bg-card border-y border-border">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center">
            <h2 className="text-3xl font-bold tracking-tight mb-4">Impact at a Glance</h2>
            <p className="text-muted-foreground">Live statistics from the pothole reporting community</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            <Card className="border-border bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10">
                    <AlertTriangle className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Reported Potholes</p>
                    <p className="text-3xl font-bold text-blue-500">{stats.reported}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10">
                    <Clock className="h-6 w-6 text-amber-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Pending Repairs</p>
                    <p className="text-3xl font-bold text-amber-500">{stats.pending}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-border bg-card/50">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10">
                    <CheckCircle className="h-6 w-6 text-emerald-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Repaired Potholes</p>
                    <p className="text-3xl font-bold text-emerald-500">{stats.repaired}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="mb-12 text-center max-w-2xl mx-auto">
            <h2 className="text-3xl font-bold tracking-tight mb-4">How to Report a Pothole</h2>
            <p className="text-muted-foreground text-pretty">
              Follow these quick steps to submit a clear and useful report.
            </p>
          </div>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-5 max-w-6xl mx-auto">
            {[
              {
                step: "1",
                title: "Open the report form",
                description: 'Click "Report Pothole" or navigate to the report page.',
              },
              {
                step: "2",
                title: "Select the location",
                description: "Click directly on the road where the pothole exists so crews can find it.",
              },
              {
                step: "3",
                title: "Add photos",
                description: "Upload 1–3 clear photos showing the pothole from different angles.",
              },
              {
                step: "4",
                title: "Describe the issue",
                description: "Include size, severity, and nearby hazards (e.g. intersections).",
              },
              {
                step: "5",
                title: "Submit the report",
                description: "Send the report and receive confirmation that it was submitted successfully.",
              },
            ].map((item) => (
              <Card key={item.step} className="border-border bg-card/50">
                <CardContent className="pt-6 space-y-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-lg">
                    {item.step}
                  </div>
                  <h3 className="font-semibold text-balance">{item.title}</h3>
                  <p className="text-sm text-muted-foreground text-pretty leading-relaxed">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="mt-8 text-center">
            <div className="inline-flex items-start gap-2 rounded-lg bg-primary/10 px-4 py-3 text-sm max-w-2xl">
              <span className="text-lg">💡</span>
              <p className="text-pretty text-left">
                <strong>Tip:</strong> Accurate map pins and clear photos help repair teams respond faster. Your privacy
                is respected — contact details are optional.
              </p>
            </div>
          </div>
          <div className="mt-8 text-center">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90">
              <Link href="/report">Report Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p className="font-semibold">© {new Date().getFullYear()} Pothole Reporter</p>
          <p className="mt-2">Helping communities report and fix road hazards faster</p>
        </div>
      </footer>
    </div>
  )
}
