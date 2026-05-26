import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Login() {
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.post("/auth/login", form);
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        navigate("/products");
      } else {
        setError(data.error || "Login failed");
      }
    } catch {
      setError("Server unreachable. Make sure backend is running.");
    }
    setLoading(false);
  };

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center",
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    }}>
      <div style={{
        background: "#1e293b", borderRadius: 16, padding: "40px 36px",
        width: 380, border: "1px solid #334155",
        boxShadow: "0 24px 64px rgba(0,0,0,0.4)",
      }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ fontSize: 28, fontWeight: 800, color: "#f8fafc", fontFamily: "'Syne', sans-serif" }}>
            Inventory<span style={{ color: "#6366f1" }}>.</span>
          </div>
          <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Sign in to your account</div>
        </div>

        {error && (
          <div style={{ background: "#450a0a", color: "#f87171", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        {[{ key: "username", label: "Username", type: "text" },
          { key: "password", label: "Password", type: "password" }].map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6, display: "block", fontWeight: 600, letterSpacing: 0.5 }}>
              {f.label.toUpperCase()}
            </label>
            <input
              type={f.type}
              value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 8,
                border: "1px solid #334155", background: "#0f172a",
                color: "#f1f5f9", fontSize: 14, outline: "none",
              }}
            />
          </div>
        ))}

        <button onClick={handleLogin} disabled={loading} style={{
          width: "100%", padding: 13, borderRadius: 8, border: "none",
          background: "#6366f1", color: "#fff", cursor: "pointer",
          fontSize: 15, fontWeight: 700, marginTop: 8,
        }}>
          {loading ? "Signing in..." : "Sign In"}
        </button>

        <p style={{ textAlign: "center", marginTop: 16, color: "#64748b", fontSize: 14 }}>
          No account?{" "}
          <span onClick={() => navigate("/register")} style={{ color: "#6366f1", cursor: "pointer", fontWeight: 600 }}>
            Register
          </span>
        </p>
      </div>
    </div>
  );
}