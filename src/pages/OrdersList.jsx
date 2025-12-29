import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";

export default function OrdersList() {
  const [orders, setOrders] = useState([]);
  const token = localStorage.getItem("customerToken");

  useEffect(() => {
    api.get("/customer/orders")
      .then(res => setOrders(res.data));
  }, []);

  return (
    <div>
      <h2>My Orders</h2>

      {orders.length === 0 && <p>No orders yet.</p>}

      {orders.map(o => (
        <div key={o.id} style={{ border: "1px solid #ccc", margin: 10, padding: 10 }}>
          <b>Order #{o.id}</b><br />
          Total: ₹{o.total} <br />
          Status: {o.status} <br />
          Date: {new Date(o.createdAt).toLocaleString()} <br />

          <Link to={`/my-orders/${o.id}`}>View Details</Link>
        </div>
      ))}
    </div>
  );
}
