import { useState } from "react"
import dynamic from "next/dynamic"
import { useAppContext } from "../context/AppContext"
import ReportForm from "../components/ReportForm"

const Map = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => (
    <div style={{ padding: '1.5rem', textAlign: 'center' }}>Loading map…</div>
  )
})

export default function ReportPage() {
  const [selectedLocation, setSelectedLocation] = useState(null)
  const { setPotholeCount } = useAppContext()

  const handleSubmitReport = (reportData) => {
    const newPothole = {
      id: Date.now(),
      ...reportData,
      status: "reported",
      date: new Date().toLocaleDateString()
    }
    setPotholeCount(prev => prev + 1)
    setSelectedLocation(null)
    alert("Pothole reported successfully!")
  }

  return (
    <div className="container">
      <h2 style={{ marginBottom: '0.25rem' }}>Report a Pothole</h2>
      <p className="muted">Click on the map to select location</p>

      <Map onSelect={setSelectedLocation} />

      {selectedLocation && (
        <div style={{ marginTop: '1rem' }}>
          <p className="muted">Selected location: {selectedLocation.lat.toFixed(4)}, {selectedLocation.lng.toFixed(4)}</p>
          <ReportForm 
            selectedLocation={selectedLocation}
            onSubmit={handleSubmitReport}
          />
        </div>
      )}
    </div>
  )
}
