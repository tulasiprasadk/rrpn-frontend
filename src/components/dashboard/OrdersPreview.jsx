import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api/client";
import "./OrdersPreview.css";

export default function OrdersPreview() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const res = await api.get("/orders");
        const list = Array.isArray(res.data) ? res.data.slice(0, 3) : [];
        if (mounted) {
          setOrders(list);
        }
      } catch (err) {
        console.error("Orders preview load failed:", err);
        if (mounted) {
          setOrders([]);
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  return (
    <div className="orders-box">
      <h2>My Recent Orders</h2>

      {orders.length === 0 ? (
        <div className="order-item">No recent orders</div>
      ) : (
        orders.map((order) => (
          <div
            key={order.id}
            className="order-item"
            style={{ cursor: "pointer" }}
            onClick={() => navigate(`/my-orders/${order.id}`)}
          >
            <div>#{order.id}</div>
            <span className={`order-status ${order.paymentStatus === "approved" ? "success" : "pending"}`}>
              {order.paymentStatus || order.status || "pending"}
            </span>
          </div>
        ))
      )}
    </div>
  );
}



