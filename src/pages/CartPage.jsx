// frontend/src/pages/CartPage.jsx
import { useNavigate } from "react-router-dom";
import { useCrackerCart } from "../context/CrackerCartContext";
import { openWhatsAppOrder } from "../utils/whatsappOrderHelper";
import "./CartPage.css";

export default function BagPage() {
  const navigate = useNavigate();
  const { cart, updateQty, total } = useCrackerCart();

  const remove = (id) => {
    updateQty(id, 0);
  };

  const clearBag = () => {
    cart.forEach(item => updateQty(item.id, 0));
  };

  const checkout = () => {
    if (cart.length === 0) {
      alert("Your bag is empty!");
      return;
    }
    navigate("/checkout");
  };

  const orderOnWhatsApp = () => {
    if (cart.length === 0) {
      alert("Your bag is empty!");
      return;
    }

    openWhatsAppOrder({
      cart,
      note: "Order started from Bag page",
    });
  };

  return (
    <div className="bag-page">
      <div className="bag-container">
        <h2 className="bag-title">🛍️ Your Bag</h2>

        {cart.length === 0 && (
          <div className="empty-bag">
            <p>Your bag is empty</p>
            <button
              className="continue-btn"
              onClick={() => navigate("/")}
            >
              Continue Shopping
            </button>
          </div>
        )}

        {cart.length > 0 && (
          <>
            <ul className="bag-list">
              {cart.map(item => (
                <li key={item.id} className="bag-item">
                  <div className="item-info">
                    <h3>{item.title || item.name}</h3>
                    <p>Qty: {item.qty} × ₹{item.price}</p>
                    <p className="subtotal">Subtotal: ₹{((item.price || 0) * (item.qty || 1)).toFixed(2)}</p>
                  </div>
                  <div className="item-actions">
                    <button onClick={() => updateQty(item.id, Math.max(1, item.qty - 1))}>−</button>
                    <span>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)}>+</button>
                    <button className="remove-btn" onClick={() => remove(item.id)}>Remove</button>
                  </div>
                </li>
              ))}
            </ul>
            <div className="bag-summary">
              <h3>Total: ₹{total.toFixed(2)}</h3>
              <button className="checkout-btn whatsapp-order-btn" onClick={orderOnWhatsApp}>Order on WhatsApp</button>
              <button className="secondary-checkout-btn" onClick={checkout}>Add delivery details</button>
              <button className="clear-btn" onClick={clearBag}>Clear Bag</button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}



