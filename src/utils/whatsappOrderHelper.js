export const handleWhatsAppOrder = (user, cart, address, slot, subscription, whatsappNumber) => {
  if (!cart?.items?.length) return alert("Cart is empty");
  if (!address) return alert("Please add delivery address");
  if (!user?.phone) return alert("Please add phone number");

  const name = user.name || 'Customer';
  const phone = user.phone;
  const fullAddress = `${address.street || ''}, ${address.city || ''} ${address.pincode || ''}`.trim();
  
  const itemsList = cart.items
    .map(item => `- ${item.product_name} (${item.quantity}) ₹${item.price}`)
    .join('\n');

  let subSection = '';
  if (subscription) {
    subSection = `\nSubscription Details:
Type: ${subscription.type}
Duration: ${subscription.duration}
Frequency: ${subscription.frequency}`;
    
    if (subscription.rationPackage) {
      subSection += `\nPackage: ${subscription.rationPackage}`;
    }

    if (subscription.upsellItems?.length > 0) {
      const upsells = subscription.upsellItems
        .map(item => `- ${item.product_name} ₹${item.price}`)
        .join('\n');
      subSection += `\n\nUpsell Items:\n${upsells}`;
    }
    subSection += '\n';
  }

  const total = cart.total + (subscription?.total || 0);

  const message = `New Order Request

Name: ${name}
Phone: ${phone}
Address: ${fullAddress}

Items:
${itemsList}
${subSection}
Total: ₹${total}

Preferred Delivery Slot: ${slot || 'Standard'}
Payment Mode: UPI / WhatsApp Pay`;

  window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
};