/**
 * Logic to handle structured order placement via WhatsApp.
 * 
 * @param {Object} user - User object with name and phone.
 * @param {Object} cart - Cart object containing items and total.
 * @param {Object} address - Selected delivery address object.
 * @param {string} slot - Selected delivery slot.
 * @param {string} whatsappNumber - The recipient WhatsApp number (e.g., '919876543210').
 */
export const handleWhatsAppOrder = async (user, cart, address, slot, whatsappNumber) => {
  // 1. MANDATORY VALIDATIONS
  if (!cart || !cart.items || cart.items.length === 0) {
    alert("Cart is empty");
    return;
  }

  if (!address) {
    alert("Please add delivery address");
    return;
  }

  if (!user || !user.phone) {
    alert("Please add phone number");
    return;
  }

  // 2. DATA EXTRACTION
  const name = user.name || 'Customer';
  const phone = user.phone;
  const deliveryAddress = `${address.street || ''}, ${address.city || ''}, ${address.pincode || ''}`.trim();
  const totalValue = cart.total;
  const deliverySlot = slot || 'Standard Delivery';

  // 3. MESSAGE CONSTRUCTION (STRICT FORMAT)
  const itemsList = cart.items
    .map(item => `- ${item.product_name} (${item.quantity}) ₹${item.price}`)
    .join('\n');

  const message = `New Order Request

Name: ${name}
Phone: ${phone}
Address: ${deliveryAddress}

Items:
${itemsList}

Total: ₹${totalValue}

Preferred Delivery Slot: ${deliverySlot}
Payment Mode: UPI / WhatsApp Pay`;

  // 4. OPTIONAL LOGGING
  console.log("whatsapp_order_clicked", { timestamp: new Date(), cartSnapshot: cart });
  // You can add an API call here to save the cart snapshot to the DB if needed:
  // await api.post('/orders/log-whatsapp-attempt', { cart, user: user.id });

  // 5. ENCODING & REDIRECTION
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  // Open in new tab - works on mobile (app) and desktop (web)
  window.open(whatsappUrl, '_blank');
};