import { useState, useEffect } from "react";
import API from "../api/axios";

export default function Orders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get("/orders/my-orders")
      .then(({ data }) => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  const statusColor = (s) => s === "PLACED" ? "#22c55e" : "#ef4444";

  return (
    <div>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0, fontFamily: "'Syne', sans-serif" }}>My Orders</h1>
        <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>{orders.length} total orders</p>
      </div>

      {loading ? (
        <div style={{ textAlign: "center", color: "#64748b", padding: 48 }}>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={{ textAlign: "center", color: "#64748b", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🧾</div>
          No orders yet. Go to Products to place an order!
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          {orders.map(o => (
            <div key={o.id} style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", padding: "20px 24px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16 }}>
                <div>
                  <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 16 }}>Order #{o.id}</div>
                  <div style={{ color: "#64748b", fontSize: 13, marginTop: 2 }}>
                    {o.createdAt ? new Date(o.createdAt).toLocaleString("en-IN") : ""}
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: statusColor(o.status), fontSize: 12, fontWeight: 700 }}>● {o.status}</span>
                  <div style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 20, marginTop: 4 }}>
                    ₹{parseFloat(o.totalAmount).toLocaleString()}
                  </div>
                </div>
              </div>
              <div style={{ borderTop: "1px solid #334155", paddingTop: 16 }}>
                {(o.items || []).map((item, i) => (
                  <div key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                    <span style={{ color: "#94a3b8", fontSize: 14 }}>{item.productName} × {item.quantity}</span>
                    <span style={{ color: "#f1f5f9", fontSize: 14, fontWeight: 600 }}>₹{parseFloat(item.totalPrice).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}