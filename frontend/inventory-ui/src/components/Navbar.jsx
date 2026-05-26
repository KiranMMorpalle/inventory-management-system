import { useNavigate, useLocation } from "react-router-dom";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const username = localStorage.getItem("username");

  const logout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItem = (label, icon, path) => (
    <button onClick={() => navigate(path)} style={{
      width: "100%", display: "flex", alignItems: "center", gap: 12,
      padding: "11px 14px", borderRadius: 8, border: "none", cursor: "pointer",
      marginBottom: 4, textAlign: "left", fontSize: 14, fontWeight: 500,
      background: location.pathname === path ? "#6366f1" : "transparent",
      color: location.pathname === path ? "#fff" : "#94a3b8",
    }}>
      <span>{icon}</span>{label}
    </button>
  );

  return (
    <div style={{
      width: 220, minHeight: "100vh", background: "#0f172a",
      position: "fixed", left: 0, top: 0, borderRight: "1px solid #1e293b",
      display: "flex", flexDirection: "column",
    }}>
      <div style={{ padding: "28px 24px 20px" }}>
        <div style={{ fontSize: 11, letterSpacing: 3, color: "#475569", textTransform: "uppercase", marginBottom: 4 }}>System</div>
        <div style={{ fontSize: 20, fontWeight: 800, color: "#f8fafc", fontFamily: "'Syne', sans-serif" }}>
          Inventory<span style={{ color: "#6366f1" }}>.</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: "8px 12px" }}>
        {navItem("Products", "📦", "/products")}
        {navItem("My Orders", "🧾", "/orders")}
      </nav>

      <div style={{ padding: "16px 16px 24px", borderTop: "1px solid #1e293b" }}>
        <div style={{ fontSize: 12, color: "#64748b", marginBottom: 2 }}>Logged in as</div>
        <div style={{ fontSize: 14, color: "#e2e8f0", fontWeight: 600, marginBottom: 12 }}>{username}</div>
        <button onClick={logout} style={{
          width: "100%", padding: "9px", borderRadius: 8,
          border: "1px solid #1e293b", background: "transparent",
          color: "#ef4444", cursor: "pointer", fontSize: 13, fontWeight: 500,
        }}>Sign out</button>
      </div>
    </div>
  );
}