import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Products from "./pages/Products";
import Orders from "./pages/Orders";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/products" element={
          <PrivateRoute>
            <Navbar />
            <div style={{ marginLeft: 220, padding: "36px 40px" }}>
              <Products />
            </div>
          </PrivateRoute>
        } />
        <Route path="/orders" element={
          <PrivateRoute>
            <Navbar />
            <div style={{ marginLeft: 220, padding: "36px 40px" }}>
              <Orders />
            </div>
          </PrivateRoute>
        } />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </BrowserRouter>
  );
}