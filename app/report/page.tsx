"use client"

import { useState } from "react"
import dynamic from "next/dynamic"
import Navigation from "@/components/navigation"
import { Card } from "@/components/ui/card"
import { AlertCircle, MapPin } from "lucide-react"

/* ----------------------------------
   Types
----------------------------------- */
type LatLng = {
  lat: number
  lng: number
}

/* ----------------------------------
   Dynamic components (client-only)
----------------------------------- */
const Map = dynamic(() => import("@/components/map"), {
  ssr: false,
})

const ReportForm = dynamic(() => import("@/components/report-form"), {
  ssr: false,
})

/* ----------------------------------
   Page
----------------------------------- */
export default function ReportPage() {
  const [selectedLocation, setSelectedLocation] = useState<LatLng | null>(null)
  const [loading, setLoading] = useState(false)

  // FIX: typed parameter (even if unused)
  const handleReportSubmit = (_newReport: unknown) => {
    setSelectedLocation(null)
  }

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navigation />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="border-b border-border bg-gradient-to-br from-background via-background to-muted/20">
          <div className="container mx-auto px-4 py-12">
            <div className="max-w-3xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#FFCC00]/10 border border-[#FFCC00]/20 mb-6">
                <MapPin className="h-4 w-4 text-[#FFCC00]" />
                <span className="text-sm font-medium text-[#FFCC00]">
                  Report System
                </span>
              </div>

              <h1 className="text-4xl md:text-5xl font-bold mb-4">
                Report a Pothole
              </h1>

              <p className="text-lg text-muted-foreground">
                Click on the map to select a location, then fill out the form to
                submit your report.
              </p>
            </div>
          </div>
        </section>

        {/* Map and Form */}
        <section className="py-12">
          <div className="container mx-auto px-4">
            {!selectedLocation && (
              <Card className="mb-6 p-4 border-[#FFCC00]/20 bg-[#FFCC00]/5">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-[#FFCC00] mt-0.5" />
                  <div>
                    <p className="font-medium text-sm">
                      Click on the map to start
                    </p>
                    <p className="text-sm text-muted-foreground mt-1">
                      Select the exact location of the pothole.
                    </p>
                  </div>
                </div>
              </Card>
            )}

            <div className="grid lg:grid-cols-2 gap-6">
              {/* Map */}
              <Card className="p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-[#FFCC00]" />
                  Select Location
                </h2>

                <div className="h-[600px] rounded-lg overflow-hidden border border-border">
                  {loading ? (
                    <div className="h-full flex items-center justify-center bg-muted/20">
                      <p className="text-sm text-muted-foreground">
                        Loading map…
                      </p>
                    </div>
                  ) : (
                    // ✅ FIX: Map only receives onSelect
                    <Map onSelect={setSelectedLocation} />
                  )}
                </div>
              </Card>

              {/* Report Form */}
              <Card className="p-6">
                <ReportForm
                  selectedLocation={selectedLocation}
                  onSubmit={handleReportSubmit}
                />
              </Card>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-muted/20 py-8">
        <div className="container mx-auto px-4 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#FFCC00] flex items-center justify-center text-black font-bold text-sm">
              PR
            </div>
            <span className="font-semibold">PotholeReporter</span>
          </div>

          <p className="text-sm text-muted-foreground text-center">
            Making roads safer, one report at a time.
          </p>
        </div>
      </footer>
    </div>
  )
}
