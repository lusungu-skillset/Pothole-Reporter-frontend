"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { useState, useEffect } from "react"
import { useAppContext } from "../context/AppContext"
import Image from "next/image"



function HeroIllustration() {
  return (
    <div
      style={{
        borderRadius: 24,
        height: "clamp(320px, 45vh, 460px)",
        width: "100%",
        maxWidth: 460,
        position: "relative",
        overflow: "hidden",
        boxShadow: "0 16px 40px rgba(0,0,0,0.35)",
      }}
    >
      <Image
        src="/images/potholes.jpg"
        alt="Damaged road with a pothole requiring repair"
        fill
        priority
        style={{
          objectFit: "cover",
        }}
      />

      
      <div
        aria-hidden
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(180deg, rgba(0,0,0,0.25), rgba(0,0,0,0.4))",
        }}
      />
    </div>
  )
}

function StatCard({ title, value, icon }) {
  return (
    <div
      role="group"
      aria-label={title}
      style={{
        display: "flex",
        alignItems: "center",
        gap: "1rem",
        padding: "1.25rem",
        background: "var(--color-surface)",
        borderRadius: 12,
        border: "1px solid rgba(11,100,209,0.08)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.06)",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div
       style={{
  width: 56,
  height: 56,
  borderRadius: 14,
  background: "linear-gradient(135deg, #2f2f2f 0%, #3a3a3a 50%, #242424 100%)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  flexShrink: 0,
  boxShadow: "0 6px 16px rgba(0,0,0,0.35)",
}}

        aria-hidden
      >
        {icon}
      </div>
      <div>
        <div style={{ fontSize: "0.85rem", color: "var(--color-muted)", fontWeight: 600 }}>
          {title}
        </div>
        <div style={{ fontSize: "1.6rem", fontWeight: 800, color: "var(--color-primary)" }}>
          {value}
        </div>
      </div>
    </div>
  )
}

function GuidelinesSection() {
  const steps = [
    {
      title: "Open the report form",
      text: "Click “Report Pothole” or navigate to the report page.",
    },
    {
      title: "Select the location",
      text: "Click directly on the road where the pothole exists so crews can find it.",
    },
    {
      title: "Add photos",
      text: "Upload 1–3 clear photos showing the pothole from different angles.",
    },
    {
      title: "Describe the issue",
      text: "Include size, severity, and nearby hazards (e.g. intersections).",
    },
    {
      title: "Submit the report",
      text: "Send the report and receive confirmation that it was submitted successfully.",
    },
  ]

  return (
    <section
      style={{
        background: "var(--color-bg)",
        padding: "clamp(2.25rem, 5vw, 3.25rem) 0",
        borderTop: "1px solid rgba(15,23,36,0.06)",
        borderBottom: "1px solid rgba(15,23,36,0.06)",
        transition: "background 0.3s ease, border-color 0.3s ease",
      }}
    >
      <div className="container">
        <header style={{ marginBottom: "1.5rem", maxWidth: 720 }}>
          <h3
            style={{
              margin: "0 0 0.5rem 0",
              fontSize: "clamp(1.35rem, 3vw, 1.9rem)",
              fontWeight: 800,
              color: "var(--color-text)",
            }}
          >
            How to Report a Pothole
          </h3>
          <p style={{ margin: 0, color: "var(--color-muted)", lineHeight: 1.6 }}>
            
🔗 Follow these quick steps to submit a clear and useful report.
          </p>
        </header>

        <ol
          style={{
            margin: 0,
            padding: 0,
            listStyle: "none",
            display: "grid",
            gap: "0.85rem",
            maxWidth: 780,
          }}
        >
          {steps.map((step, index) => (
            <li
              key={index}
              style={{
                display: "flex",
                gap: "0.85rem",
                padding: "0.9rem 1rem",
                background: "var(--color-surface)",
                borderRadius: 12,
                border: "1px solid rgba(15,23,36,0.06)",
                boxShadow: "0 2px 10px rgba(0,0,0,0.04)",
                transition: "background 0.3s ease, border-color 0.3s ease",
              }}
            >
              <div
                style={{
                  minWidth: 30,
                  height: 30,
                  borderRadius: "50%",
                  background: "var(--color-primary)",
                  color: "#fff",
                  fontSize: "0.9rem",
                  fontWeight: 800,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  marginTop: 2,
                }}
                aria-hidden
              >
                {index + 1}
              </div>

              <div>
                <div
                  style={{
                    fontWeight: 700,
                    color: "var(--color-text)",
                    marginBottom: "0.2rem",
                  }}
                >
                  {step.title}
                </div>
                <div style={{ color: "var(--color-muted)", fontSize: "0.95rem", lineHeight: 1.6 }}>
                  {step.text}
                </div>
              </div>
            </li>
          ))}
        </ol>

        <p style={{ marginTop: "1rem", color: "var(--color-muted)", maxWidth: 780, lineHeight: 1.6 }}>
          💡 Tip: Accurate map pins and clear photos help repair teams respond faster. Your privacy is respected — contact
          details are optional.
        </p>

        <div style={{ marginTop: "1.25rem" }}>
          <Link
            href="/report"
            style={{
              background: "#ff8c1a",
              color: "#fff",
              padding: "0.8rem 1.3rem",
              borderRadius: 999,
              fontWeight: 700,
              textDecoration: "none",
              display: "inline-block",
              boxShadow: "0 6px 14px rgba(255,140,26,0.3)",
            }}
          >
            Report Now
          </Link>
        </div>
      </div>
    </section>
  )
}

export default function HomePage() {
  const { setPotholeCount } = useAppContext()
  const [stats, setStats] = useState({ reported: "—", repaired: "—", pending: "—" })

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await fetch("http://localhost:3005/potholes")
        const data = await res.json()
        const potholes = Array.isArray(data) ? data : []

        const reported = potholes.length
        // Fixed status check - backend returns "Resolved", not "fixed"
        const repaired = potholes.filter((p) => p.status?.toLowerCase() === "resolved").length
        // Pending status check
        const pending = potholes.filter((p) => p.status?.toLowerCase() === "pending").length

        console.log("Stats calculation:", { reported, repaired, pending })
        console.log("Sample pothole statuses:", potholes.slice(0, 3).map(p => p.status))

        setStats({
          reported: reported.toString(),
          repaired: repaired.toString(),
          pending: pending.toString(),
        })

        setPotholeCount(reported)
      } catch (err) {
        console.error("Error fetching stats:", err)
      }
    }

    fetchStats()
    const interval = setInterval(fetchStats, 10000)
    return () => clearInterval(interval)
  }, [setPotholeCount])

  return (
    <main className="homepage">
      <section
        className="full-bleed"
        style={{
          minHeight: "100vh",
          background: "linear-gradient(180deg,#0b1220,#0f1724)",
          display: "flex",
          alignItems: "center",
        }}
      >
        <div
          className="container"
          style={{
            display: "grid",
            gridTemplateColumns: "1.1fr 0.9fr",
            gap: "4rem",
            alignItems: "center",
            padding: "clamp(3rem,6vw,5rem) 0",
          }}
        >
          <section aria-labelledby="hero-heading" style={{ color: "white" }}>
            <h1
              id="hero-heading"
              style={{
                fontSize: "clamp(2.2rem,6vw,3.2rem)",
                fontWeight: 800,
                lineHeight: 1.15,
                marginBottom: "1.5rem",
                color: "rgba(255,255,255,0.35)"
              }}
            >
              Keep Roads Safe & Smooth for Everyone
            </h1>

            <p
              style={{
                fontSize: "1.1rem",
                maxWidth: 640,
                lineHeight: 1.7,
                marginBottom: "2.5rem",
                color: "rgba(255,255,255,0.9)",
              }}
            >
              Report potholes by selecting exact road locations, adding photos, and tracking repair progress in real time.
            </p>

            <div className="hero-actions" style={{ display: "flex", gap: "1.25rem", flexWrap: "wrap" }}>
              <Link
                href="/report"
                style={{
                  background: "#ff8c1a",
                  color: "#fff",
                  padding: "0.9rem 1.75rem",
                  borderRadius: 999,
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  cursor: "pointer"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "#ff9e33";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,140,26,0.4)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "#ff8c1a";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                Report Pothole
              </Link>

              <Link
                href="/report"
                style={{
                  color: "#fff",
                  padding: "0.9rem 1.75rem",
                  borderRadius: 999,
                  border: "1px solid rgba(255,255,255,0.35)",
                  fontWeight: 700,
                  textDecoration: "none",
                  transition: "all 0.3s ease",
                  cursor: "pointer",
                  background: "transparent"
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.8)";
                  e.currentTarget.style.background = "rgba(255,255,255,0.08)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                  e.currentTarget.style.boxShadow = "0 8px 20px rgba(255,255,255,0.15)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "rgba(255,255,255,0.35)";
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                View Map
              </Link>
            </div>
          </section>

          <HeroIllustration />
        </div>
      </section>

      <section style={{ background: "var(--color-bg)", padding: "3rem 0", transition: "background 0.3s ease" }}>
        <div className="container">
          <header style={{ marginBottom: "2rem" }}>
            <h2 style={{ fontSize: "1.8rem", fontWeight: 800, marginBottom: "0.5rem", color: "var(--color-text)" }}>
              Impact at a Glance
            </h2>
            <p style={{ color: "var(--color-muted)" }}>Live statistics from the pothole reporting community</p>
          </header>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))",
              gap: "1.5rem",
            }}
          >
            <StatCard
              title="Reported Potholes"
              value={stats.reported}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 2v20" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                  <circle cx="12" cy="8" r="2" fill="#fff" />
                </svg>
              }
            />
            <StatCard
              title="Repaired Potholes"
              value={stats.repaired}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M20 6L9 17l-5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            />
            <StatCard
              title="Pending Repairs"
              value={stats.pending}
              icon={
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                  <path d="M12 8v4l3 3" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
                </svg>
              }
            />
          </div>
        </div>
      </section>

      <GuidelinesSection />

      <footer
        className="full-bleed"
        style={{
          backgroundColor: "#1a1a1a",
          color: "#ffffff",
          padding: "3rem 0",
          borderTop: "1px solid #2a2a2a"
        }}
      >
        <div className="container" style={{ textAlign: "center" }}>
          <p style={{ fontWeight: 600, fontSize: "1.05rem", margin: 0, color: "rgba(255,255,255,0.7)" }}>
            © {new Date().getFullYear()} Pothole Reporter
          </p>
          <p style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.35)", margin: "0.5rem 0 0 0" }}>
            Helping communities report and fix road hazards faster
          </p>
        </div>
      </footer>
    </main>
  )
}
