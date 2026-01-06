"use client";

import { useEffect, useState } from "react";

export default function Map({ onSelect }: { onSelect?: (pos: any) => void }) {
  const [components, setComponents] = useState<any>(null);
  const [L, setL] = useState<any>(null);
  const [clickedPos, setClickedPos] = useState<any>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    Promise.all([import("react-leaflet"), import("leaflet")])
      .then(([RL, LeafletLib]) => {
        setL(LeafletLib);

        // Fix default Leaflet icon paths
        delete (LeafletLib.Icon.Default.prototype as any)._getIconUrl;
        LeafletLib.Icon.Default.mergeOptions({
          iconRetinaUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
          iconUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
        });

        // Red marker icon ONLY
        (window as any).redIcon = new LeafletLib.Icon({
          iconUrl:
            "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-red.png",
          shadowUrl:
            "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
          iconSize: [25, 41],
          iconAnchor: [12, 41],
        });

        // Inject Leaflet CSS once
        const href =
          "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        if (!document.querySelector(`link[href="${href}"]`)) {
          const link = document.createElement("link");
          link.rel = "stylesheet";
          link.href = href;
          document.head.appendChild(link);
        }

        setComponents(RL);
      })
      .catch(console.error);
  }, []);

  if (!components) return null;

  const { MapContainer, TileLayer, Marker, Popup, useMapEvents } = components;

  function ClickMarker() {
    useMapEvents({
      click(e: any) {
        setClickedPos(e.latlng);
        onSelect?.(e.latlng);
      },
    });

    return clickedPos ? (
      <Marker position={clickedPos} icon={(window as any).redIcon}>
        <Popup>
          <strong>New report location</strong>
          <br />
          Lat: {clickedPos.lat.toFixed(4)}
          <br />
          Lng: {clickedPos.lng.toFixed(4)}
        </Popup>
      </Marker>
    ) : null;
  }

  return (
    <div className="h-full w-full">
      <MapContainer
        center={[-13.9833, 33.7833]}
        zoom={12}
        className="h-full w-full"
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution="© OpenStreetMap contributors"
        />

        {/* ONLY the click marker */}
        <ClickMarker />
      </MapContainer>
    </div>
  );
}
