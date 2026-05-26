import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async () => {
    setLoading(true);
    setError("");
    try {
      const { data } = await API.post("/auth/register", form);
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.username);
        navigate("/products");
      } else {
        setError(data.error || "Registration failed");
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
          <div style={{ color: "#64748b", fontSize: 14, marginTop: 4 }}>Create a new account</div>
        </div>

        {error && (
          <div style={{ background: "#450a0a", color: "#f87171", padding: "10px 14px", borderRadius: 8, marginBottom: 16, fontSize: 13 }}>
            {error}
          </div>
        )}

        {[{ key: "username", label: "Username", type: "text" },
          { key: "email", label: "Email", type: "email" },
          { key: "password", label: "Password", type: "password" }].map(f => (
          <div key={f.key} style={{ marginBottom: 16 }}>
            <label style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6, display: "block", fontWeight: 600, letterSpacing: 0.5 }}>
              {f.label.toUpperCase()}
            </label>
            <input
              type={f.type}
              value={form[f.key]}
              onChange={e => setForm({ ...form, [f.key]: e.target.value })}
              onKeyDown={e => e.key === "Enter" && handleRegister()}
              style={{
                width: "100%", padding: "11px 14px", borderRadius: 8,
                border: "1px solid #334155", background: "#0f172a",
                color: "#f1f5f9", fontSize: 14, outline: "none",
              }}
            />
          </div>
        ))}

        <button onClick={handleRegister} disabled={loading} style={{
          width: "100%", padding: 13, borderRadius: 8, border: "none",
          background: "#6366f1", color: "#fff", cursor: "pointer",
          fontSize: 15, fontWeight: 700, marginTop: 8,
        }}>
          {loading ? "Creating account..." : "Create Account"}
        </button>

        <p style={{ textAlign: "center", marginTop: 16, color: "#64748b", fontSize: 14 }}>
          Already have an account?{" "}
          <span onClick={() => navigate("/login")} style={{ color: "#6366f1", cursor: "pointer", fontWeight: 600 }}>
            Sign In
          </span>
        </p>
      </div>
    </div>
  );
}