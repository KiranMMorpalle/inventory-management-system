import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div style={{
      minHeight: "100vh", display: "flex", alignItems: "center",
      justifyContent: "center", flexDirection: "column", gap: 24,
      background: "linear-gradient(135deg, #0f172a 0%, #1e1b4b 100%)",
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 48, fontWeight: 800, color: "#f8fafc", fontFamily: "'Syne', sans-serif" }}>
          Inventory<span style={{ color: "#6366f1" }}>.</span>
        </div>
        <div style={{ color: "#64748b", fontSize: 18, marginTop: 8 }}>
          Microservices-based Inventory Management System
        </div>
        <div style={{ color: "#475569", fontSize: 14, marginTop: 4 }}>
          Built with Spring Boot · PostgreSQL · Redis · Docker · AWS EC2
        </div>
      </div>

      <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
        <button onClick={() => navigate("/login")} style={{
          background: "#6366f1", color: "#fff", border: "none",
          borderRadius: 10, padding: "13px 32px", cursor: "pointer",
          fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
        }}>Login</button>
        <button onClick={() => navigate("/register")} style={{
          background: "transparent", color: "#6366f1",
          border: "1px solid #6366f1", borderRadius: 10,
          padding: "13px 32px", cursor: "pointer",
          fontSize: 15, fontWeight: 700, fontFamily: "'DM Sans', sans-serif",
        }}>Register</button>
      </div>
    </div>
  );
}