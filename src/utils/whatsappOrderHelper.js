/**
 * Handles structured order placement via WhatsApp including Subscriptions and Upsells.
 * 
 * @param {Object} user - { name, phone }
 * @param {Object} cart - { items: [], total }
 * @param {Object} address - { street, city, pincode }
 * @param {string} slot - Selected delivery slot
 * @param {Object} subscription - { type, duration, frequency, upsellItems: [], total: 0 }
 * @param {string} whatsappNumber - Recipient number (e.g., '919876543210')
 */
export const handleWhatsAppOrder = (user, cart, address, slot, subscription, whatsappNumber) => {
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

  // 2. DATA EXTRACTION & FORMATTING
  const name = user.name || 'Customer';
  const phone = user.phone;
  const fullAddress = `${address.street || ''}, ${address.city || ''} - ${address.pincode || ''}`.trim();
  
  // Format Standard Items
  const itemsList = cart.items
    .map(item => `- ${item.product_name} (${item.quantity}) ₹${item.price}`)
    .join('\n');

  // Format Subscription Details (if applicable)
  let subscriptionSection = '';
  if (subscription && subscription.type) {
    subscriptionSection = `\nSubscription Details:
Type: ${subscription.type}
Duration: ${subscription.duration}
Frequency: ${subscription.frequency}\n`;

    if (subscription.upsellItems && subscription.upsellItems.length > 0) {
      const upsells = subscription.upsellItems
        .map(item => `- ${item.product_name} (${item.quantity || 1}) ₹${item.price}`)
        .join('\n');
      subscriptionSection += `\nUpsell Items:\n${upsells}\n`;
    }
  }

  // Calculate Grand Total (Cart + Subscription)
  const grandTotal = cart.total + (subscription?.total || 0);

  // 3. CONSTRUCT MESSAGE (STRICT FORMAT)
  const message = `New Order Request

Name: ${name}
Phone: ${phone}
Address: ${fullAddress}

Items:
${itemsList}
${subscriptionSection}
Total: ₹${grandTotal}

Preferred Delivery Slot: ${slot || 'Not Selected'}
Payment Mode: UPI / WhatsApp Pay`;

  // 4. LOGGING
  console.log("whatsapp_order_clicked", { 
    timestamp: new Date().toISOString(), 
    orderSummary: { items: cart.items.length, hasSubscription: !!subscription } 
  });

  // 5. ENCODING & REDIRECTION
  const encodedMessage = encodeURIComponent(message);
  const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;

  // Open in new tab (Works on Mobile App and WhatsApp Web)
  const newWindow = window.open(whatsappUrl, '_blank');
  if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
    alert("Pop-up blocked! Please allow pop-ups to open WhatsApp.");
  }
};