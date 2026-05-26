import { useState, useEffect } from "react";
import API from "../api/axios";

export default function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editProduct, setEditProduct] = useState(null);
  const [form, setForm] = useState({ productName: "", category: "", price: "", quantity: "" });
  const [orderModal, setOrderModal] = useState(null);
  const [orderQty, setOrderQty] = useState(1);
  const [toast, setToast] = useState(null);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await API.get("/products", {
        params: search ? { name: search } : { page: 0, size: 20 },
      });
      setProducts(data.content || []);
    } catch {
      showToast("Failed to load products", "error");
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [search]);

  const openAdd = () => {
    setEditProduct(null);
    setForm({ productName: "", category: "", price: "", quantity: "" });
    setShowModal(true);
  };

  const openEdit = (p) => {
    setEditProduct(p);
    setForm({ productName: p.productName, category: p.category, price: p.price, quantity: p.quantity });
    setShowModal(true);
  };

  const handleSave = async () => {
    try {
      const payload = { ...form, price: parseFloat(form.price), quantity: parseInt(form.quantity) };
      if (editProduct) {
        await API.put(`/products/${editProduct.id}`, payload);
        showToast("Product updated!");
      } else {
        await API.post("/products", payload);
        showToast("Product added!");
      }
      setShowModal(false);
      load();
    } catch {
      showToast("Failed to save", "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this product?")) return;
    await API.delete(`/products/${id}`);
    showToast("Deleted!", "info");
    load();
  };

  const handleOrder = async () => {
    try {
      const { data } = await API.post("/orders", {
        items: [{ productId: orderModal.id, quantity: orderQty }],
      });
      if (data.id) {
        showToast(`Order #${data.id} placed!`);
        setOrderModal(null);
        load();
      } else {
        showToast(data.error || "Order failed", "error");
      }
    } catch {
      showToast("Order failed", "error");
    }
  };

  const stockColor = (s) =>
    s === "IN_STOCK" ? "#22c55e" : s === "LOW_STOCK" ? "#f59e0b" : "#ef4444";

  return (
    <div>
      {/* Toast */}
      {toast && (
        <div style={{
          position: "fixed", bottom: 24, right: 24, zIndex: 9999,
          background: toast.type === "error" ? "#ef4444" : toast.type === "info" ? "#3b82f6" : "#22c55e",
          color: "#fff", padding: "12px 20px", borderRadius: 10, fontSize: 14, fontWeight: 500,
          boxShadow: "0 8px 32px rgba(0,0,0,0.18)",
        }}>{toast.msg}</div>
      )}

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 800, color: "#f8fafc", margin: 0, fontFamily: "'Syne', sans-serif" }}>Products</h1>
          <p style={{ color: "#64748b", margin: "4px 0 0", fontSize: 14 }}>{products.length} items</p>
        </div>
        <button onClick={openAdd} style={{
          background: "#6366f1", color: "#fff", border: "none", borderRadius: 10,
          padding: "11px 20px", cursor: "pointer", fontSize: 14, fontWeight: 700,
        }}>+ Add Product</button>
      </div>

      {/* Search */}
      <input
        placeholder="Search by product name..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: "100%", padding: "11px 16px", borderRadius: 10,
          border: "1px solid #1e293b", background: "#1e293b",
          color: "#f1f5f9", fontSize: 14, marginBottom: 24, outline: "none",
        }}
      />

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: "center", color: "#64748b", padding: 48 }}>Loading...</div>
      ) : products.length === 0 ? (
        <div style={{ textAlign: "center", color: "#64748b", padding: 48 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>📦</div>
          No products found. Add your first product!
        </div>
      ) : (
        <div style={{ background: "#1e293b", borderRadius: 12, border: "1px solid #334155", overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr style={{ background: "#0f172a" }}>
                {["Product", "Category", "Price", "Stock", "Status", "Actions"].map(h => (
                  <th key={h} style={{ padding: "14px 16px", textAlign: "left", fontSize: 11, color: "#475569", fontWeight: 700, letterSpacing: 1, textTransform: "uppercase" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {products.map((p, i) => (
                <tr key={p.id} style={{ borderTop: "1px solid #334155", background: i % 2 === 0 ? "transparent" : "#172033" }}>
                  <td style={{ padding: "14px 16px", color: "#f1f5f9", fontWeight: 600 }}>{p.productName}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ background: "#312e81", color: "#a5b4fc", padding: "3px 10px", borderRadius: 20, fontSize: 12, fontWeight: 600 }}>{p.category}</span>
                  </td>
                  <td style={{ padding: "14px 16px", color: "#f1f5f9", fontWeight: 700 }}>₹{parseFloat(p.price).toLocaleString()}</td>
                  <td style={{ padding: "14px 16px", color: "#94a3b8" }}>{p.quantity}</td>
                  <td style={{ padding: "14px 16px" }}>
                    <span style={{ color: stockColor(p.stockStatus), fontSize: 12, fontWeight: 700 }}>● {p.stockStatus?.replace("_", " ")}</span>
                  </td>
                  <td style={{ padding: "14px 16px" }}>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={() => { setOrderModal(p); setOrderQty(1); }} style={{ background: "#064e3b", color: "#34d399", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Order</button>
                      <button onClick={() => openEdit(p)} style={{ background: "#1e3a5f", color: "#60a5fa", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Edit</button>
                      <button onClick={() => handleDelete(p.id)} style={{ background: "#450a0a", color: "#f87171", border: "none", borderRadius: 6, padding: "6px 12px", cursor: "pointer", fontSize: 12, fontWeight: 600 }}>Del</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add/Edit Modal */}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setShowModal(false)}>
          <div style={{ background: "#1e293b", borderRadius: 16, padding: "32px 28px", width: 420, border: "1px solid #334155" }}
            onClick={e => e.stopPropagation()}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
              <h2 style={{ margin: 0, color: "#f8fafc", fontSize: 18, fontWeight: 800, fontFamily: "'Syne', sans-serif" }}>
                {editProduct ? "Edit Product" : "Add Product"}
              </h2>
              <button onClick={() => setShowModal(false)} style={{ background: "none", border: "none", color: "#64748b", cursor: "pointer", fontSize: 20 }}>×</button>
            </div>
            {[
              { key: "productName", label: "Product Name", type: "text" },
              { key: "category", label: "Category", type: "text" },
              { key: "price", label: "Price (₹)", type: "number" },
              { key: "quantity", label: "Quantity", type: "number" },
            ].map(f => (
              <div key={f.key} style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6, display: "block", fontWeight: 600 }}>{f.label.toUpperCase()}</label>
                <input
                  type={f.type}
                  value={form[f.key]}
                  onChange={e => setForm({ ...form, [f.key]: e.target.value })}
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9", fontSize: 14, outline: "none" }}
                />
              </div>
            ))}
            <button onClick={handleSave} style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#6366f1", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
              {editProduct ? "Update" : "Add Product"}
            </button>
          </div>
        </div>
      )}

      {/* Order Modal */}
      {orderModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setOrderModal(null)}>
          <div style={{ background: "#1e293b", borderRadius: 16, padding: "32px 28px", width: 400, border: "1px solid #334155" }}
            onClick={e => e.stopPropagation()}>
            <h2 style={{ margin: "0 0 16px", color: "#f8fafc", fontFamily: "'Syne', sans-serif" }}>Place Order</h2>
            <div style={{ color: "#f1f5f9", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{orderModal.productName}</div>
            <div style={{ color: "#64748b", fontSize: 13, marginBottom: 20 }}>Available: {orderModal.quantity} · ₹{parseFloat(orderModal.price).toLocaleString()} each</div>
            <label style={{ fontSize: 12, color: "#94a3b8", marginBottom: 6, display: "block", fontWeight: 600 }}>QUANTITY</label>
            <input
              type="number" min={1} max={orderModal.quantity}
              value={orderQty}
              onChange={e => setOrderQty(parseInt(e.target.value))}
              style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid #334155", background: "#0f172a", color: "#f1f5f9", fontSize: 14, outline: "none", marginBottom: 20 }}
            />
            <div style={{ background: "#0f172a", borderRadius: 8, padding: "12px 16px", marginBottom: 20, display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "#64748b" }}>Total</span>
              <span style={{ color: "#f1f5f9", fontWeight: 800, fontSize: 18 }}>₹{(orderQty * parseFloat(orderModal.price)).toLocaleString()}</span>
            </div>
            <button onClick={handleOrder} style={{ width: "100%", padding: 12, borderRadius: 8, border: "none", background: "#059669", color: "#fff", cursor: "pointer", fontSize: 15, fontWeight: 700 }}>
              Confirm Order
            </button>
          </div>
        </div>
      )}
    </div>
  );
}