import { useSearchParams, Link, useParams } from "react-router-dom";
import { useState } from "react";
import { API_BASE } from "../config/api";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const routeParams = useParams();
  const orderId = params.get("orderId") || routeParams.orderId;

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  async function handleConvert(e) {
    e.preventDefault();
    setLoading(true);
    setMessage("");
    try {
      const resp = await fetch(`${API_BASE}/orders/convert-guest`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId: Number(orderId), email, name }),
      });

      const data = await resp.json();
      if (resp.ok && data.success) {
        setMessage("Account created and order attached. Redirecting to My Orders...");
        setTimeout(() => (window.location.href = "/my-orders"), 1000);
      } else {
        setMessage(data.error || data.message || JSON.stringify(data));
      }
    } catch {
      setMessage(String(err));
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2>Order Placed Successfully 🎉</h2>
      <p>Your Order ID: <b>{orderId}</b></p>

      <Link to="/my-orders">View My Orders</Link>

      <hr />

      <h3>Create an account from this order</h3>
      <p>If you want to save this order to an account, create one now.</p>

      <form onSubmit={handleConvert}>
        <div>
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div>
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} />
        </div>
        <div>
          <button type="submit" disabled={loading || !orderId}>
            {loading ? "Creating..." : "Create Account and Attach Order"}
          </button>
        </div>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}



