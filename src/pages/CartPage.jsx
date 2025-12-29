// frontend/src/pages/CartPage.jsx
import { useNavigate } from "react-router-dom";
import { useCrackerCart } from "../context/CrackerCartContext";
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
          <CartPanel />
        )}
      </div>
    </div>
  );
}
