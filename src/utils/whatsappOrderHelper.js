/**
 * Constructs and opens a structured WhatsApp order message.
 */
export const handleWhatsAppOrder = (user, cart, address, slot, subscription, whatsappNumber) => {
  // Validations
  if (!cart?.items?.length) return alert("Cart is empty");
  if (!address) return alert("Please add delivery address");
  if (!user?.phone) return alert("Please add phone number");

  const name = user.name || 'Customer';
  const phone = user.phone;
  const fullAddress = `${address.street || ''}, ${address.city || ''} - ${address.pincode || ''}`.trim();
  
  // 1. Format Standard Items
  const itemsList = cart.items
    .map(item => `- ${item.product_name} (${item.quantity}) ₹${item.price}`)
    .join('\n');

  // 2. Format Subscription Section
  let subText = '';
  if (subscription) {
    subText = `\nSubscription Request:
Type: ${subscription.type}
Duration: ${subscription.duration}
Frequency: ${subscription.frequency}`;
    
    if (subscription.rationPackage) {
      subText += `\nPackage: ${subscription.rationPackage}`;
    }

    if (subscription.upsellItems?.length > 0) {
      const upsells = subscription.upsellItems
        .map(item => `- ${item.product_name} ₹${item.price}`)
        .join('\n');
      subText += `\n\nUpsell Items:\n${upsells}`;
    }
    subText += '\n';
  }

  // 3. Totals
  const grandTotal = cart.total + (subscription?.total || 0);

  // 4. Construct Final Message
  const message = `New Order Request

Name: ${name}
Phone: ${phone}
Address: ${fullAddress}

Items:
${itemsList}
${subText}
Total: ₹${grandTotal}

Preferred Delivery Slot: ${slot || 'Standard'}
Payment Mode: UPI / WhatsApp Pay`;

  // 5. Redirection
  const encodedMessage = encodeURIComponent(message);
  window.open(`https://wa.me/${whatsappNumber}?text=${encodedMessage}`, '_blank');
};