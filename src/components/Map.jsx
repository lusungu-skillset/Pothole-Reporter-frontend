import { useEffect, useState } from "react"

export default function Map({ potholes = [], onSelect }) {
  const [components, setComponents] = useState(null)
  const [L, setL] = useState(null)
  const [clickedPos, setClickedPos] = useState(null)
  const [severityFilter, setSeverityFilter] = useState([])

  useEffect(() => {
    if (typeof window === "undefined") return

    Promise.all([
      import("react-leaflet"),
      import("leaflet"),
    ]).then(([RL, LeafletLib]) => {
      setL(LeafletLib)

      try {
        delete LeafletLib.Icon.Default.prototype._getIconUrl
        LeafletLib.Icon.Default.mergeOptions({
          iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        })
      } catch (err) {
        console.warn("Error setting Leaflet default icon:", err)
      }

      try {
        window.icons = {
          Minor: new LeafletLib.Icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
          Moderate: new LeafletLib.Icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
          Severe: new LeafletLib.Icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
          Low: new LeafletLib.Icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-green.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
          Medium: new LeafletLib.Icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-orange.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
          High: new LeafletLib.Icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
          Critical: new LeafletLib.Icon({
            iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
            shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
            iconSize: [25, 41],
            iconAnchor: [12, 41],
          }),
        }
      } catch (err) {
        console.warn("Error creating custom icons:", err)
      }

      const href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
      if (!document.querySelector(`link[href="${href}"]`)) {
        const link = document.createElement("link")
        link.rel = "stylesheet"
        link.href = href
        document.head.appendChild(link)
      }

      setComponents(RL)
    }).catch(err => {
      console.error("Error loading Leaflet components:", err)
    })
  }, [])

  if (!components) return null

  const {
    MapContainer,
    TileLayer,
    Marker,
    Popup,
    useMapEvents,
  } = components

  function LocationMarker() {
    useMapEvents({
      click(e) {
        setClickedPos(e.latlng)
        onSelect?.(e.latlng)
      },
    })

    let icon = window.icons?.Severe
    
    if (!icon && L) {
      try {
        icon = new L.Icon({
          iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
          shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        })
      } catch (err) {
        console.warn("Error creating LocationMarker icon:", err)
      }
    }

    return clickedPos ? (
      <Marker position={clickedPos} icon={icon}>
        <Popup>
          New report location<br />
          Lat: {clickedPos.lat.toFixed(4)}<br />
          Lng: {clickedPos.lng.toFixed(4)}
        </Popup>
      </Marker>
    ) : null
  }

  const filteredPotholes =
    severityFilter.length === 0
      ? potholes
      : potholes.filter(p => severityFilter.includes(p.severity))

  const toggleSeverity = (value) => {
    setSeverityFilter(prev =>
      prev.includes(value)
        ? prev.filter(v => v !== value)
        : [...prev, value]
    )
  }

  return (
    <div className="map-dashboard">
      
      <aside className="map-sidebar">
        <div className="sidebar-section">
          <h4>Recent Reports</h4>

          {filteredPotholes.length === 0 && (
            <p className="muted">No reports match selected filters</p>
          )}

          {filteredPotholes.slice(0, 3).map(p => (
            <div key={p.id} className="report-card">
              <strong>Pothole #{p.id}</strong>
              <span>Severity: {p.severity}</span>
              <span>Status: {p.status}</span>
            </div>
          ))}
        </div>

        <div className="sidebar-section filters">
          <h4>Filters</h4>
          <p className="filter-hint">
            Filter potholes by severity level
          </p>

          {["Minor", "Moderate", "Severe"].map(level => (
            <label key={level}>
              <input
                type="checkbox"
                checked={severityFilter.includes(level)}
                onChange={() => toggleSeverity(level)}
              />
              {level}
            </label>
          ))}

          <div className="filter-summary">
            Showing <strong>{filteredPotholes.length}</strong> of{" "}
            <strong>{potholes.length}</strong> reports
          </div>
        </div>
      </aside>

      
      <div className="map-container">
       <MapContainer
  center={[-13.9833, 33.7833]}
  zoom={12}
  className="leaflet-map"
>
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />

          {filteredPotholes.map(p => {
            let icon = window.icons?.[p.severity]
            
            if (!icon && L) {
              const iconColor = {
                "Low": "green",
                "Medium": "orange", 
                "High": "red",
                "Critical": "red",
                "Minor": "green",
                "Moderate": "orange",
                "Severe": "red",
              }[p.severity] || "blue"

              try {
                icon = new L.Icon({
                  iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-${iconColor}.png`,
                  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
                  iconSize: [25, 41],
                  iconAnchor: [12, 41],
                })
              } catch (err) {
                console.warn("Error creating fallback icon:", err)
              }
            }

            return (
              <Marker
                key={p.id}
                position={[p.latitude, p.longitude]}
                icon={icon}
              >
                <Popup>
                  <strong>Pothole #{p.id}</strong><br />
                  Severity: {p.severity}<br />
                  Status: {p.status}
                </Popup>
              </Marker>
            )
          })}

          <LocationMarker />
        </MapContainer>
      </div>
    </div>
  )
}
