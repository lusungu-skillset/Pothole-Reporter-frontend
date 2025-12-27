import { useState } from "react"
import { useRouter } from "next/router"
import axios from "axios"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const from = "/admin"

  const handleLogin = async (e) => {
    e.preventDefault()
    setError("")

    if (!email || !password) {
      setError("Email and password are required")
      return
    }

    setLoading(true)
    try {
      const response = await axios.post(
        "http://localhost:3005/auth/login",
        { email, password }
      )

      console.log("Login response:", response.data)

      const { token, admin } = response.data

      if (!token || !admin) {
        setError("Invalid response from server - missing token or admin data")
        return
      }

      localStorage.setItem("authToken", token)
      localStorage.setItem("adminData", JSON.stringify(admin))

      router.push(from)
    } catch (err) {
      console.error("Login error:", err)
      setError(
        err.response?.data?.message ||
        err.message ||
        "Invalid email or password"
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1rem",
    
    }}>
      <div style={{
        width: "100%",
        maxWidth: "520px",
        padding: "2.5rem",
        background: "radial-gradient(circle at top, #333, #2c2a2aff)",
        borderRadius: "1rem",
        boxShadow: "0 20px 40px rgba(0,0,0,0.6)",
        backdropFilter: "blur(10px)",
        color: "white"
      }}>
        <h1 style={{
          fontSize: "2rem",
          fontWeight: "700",
          marginBottom: "0.5rem",
          color: "white",
          marginBottom: '5vh'
        }}>
          Admin Login
        </h1>

       

        <form onSubmit={handleLogin}>
          
          <div style={{ marginBottom: "1.25rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              color: "#d1d5db"
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@potholes.mw"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.9rem",
                borderRadius: "0.75rem",
                background: "#111",
                border: "1px solid #333",
                color: "white",
                outline: "none"
              }}
            />
          </div>

          
          <div style={{ marginBottom: "1.5rem" }}>
            <label style={{
              display: "block",
              marginBottom: "0.5rem",
              fontSize: "0.875rem",
              color: "#d1d5db"
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password"
              disabled={loading}
              style={{
                width: "100%",
                padding: "0.9rem",
                borderRadius: "0.75rem",
                background: "#111",
                border: "1px solid #333",
                color: "white",
                outline: "none"
              }}
            />
          </div>

    
          {error && (
            <div style={{
              background: "#7f1d1d",
              color: "#fecaca",
              padding: "0.75rem",
              borderRadius: "0.5rem",
              marginBottom: "1rem",
              fontSize: "0.875rem"
            }}>
              {error}
            </div>
          )}

        
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "1rem",
              borderRadius: "9999px",
              border: "none",
              background: loading
                ? "#9ca3af"
                : "linear-gradient(to right, #ff8a00, #ff6a00)",
              color: "white",
              fontSize: "1rem",
              fontWeight: "600",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "transform 0.2s ease"
            }}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}
