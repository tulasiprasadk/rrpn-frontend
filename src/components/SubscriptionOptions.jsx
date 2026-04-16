import React, { useState, useEffect } from 'react';

const SubscriptionOptions = ({ onUpdate, upsellProducts = [] }) => {
  const [type, setType] = useState('none'); // 'none', 'repeat', 'ration'
  const [duration, setDuration] = useState('1 Month');
  const [frequency, setFrequency] = useState('4 times/month');
  const [rationPackage, setRationPackage] = useState('Standard');
  const [selectedUpsells, setSelectedUpsells] = useState([]);

  // Notify parent component (PaymentPage) whenever a selection changes
  useEffect(() => {
    if (type === 'none') {
      onUpdate(null);
    } else {
      onUpdate({
        type: type === 'repeat' ? 'Repeat Item' : 'Monthly Ration',
        duration,
        frequency: type === 'repeat' ? frequency : 'Monthly',
        rationPackage: type === 'ration' ? rationPackage : null,
        upsellItems: selectedUpsells,
        total: calculateSubscriptionTotal()
      });
    }
  }, [type, duration, frequency, rationPackage, selectedUpsells]);

  const calculateSubscriptionTotal = () => {
    let total = 0;
    selectedUpsells.forEach(item => total += item.price);
    // Add base package logic here if ration packages have fixed prices
    return total;
  };

  const toggleUpsell = (product) => {
    setSelectedUpsells(prev => 
      prev.find(p => p.id === product.id) 
        ? prev.filter(p => p.id !== product.id) 
        : [...prev, product]
    );
  };

  return (
    <div className="subscription-container" style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
      <h3>Add Subscription (Optional)</h3>
      
      <div className="type-selector" style={{ marginBottom: '15px' }}>
        <label>
          <input type="radio" name="subType" value="none" checked={type === 'none'} onChange={() => setType('none')} /> No Subscription
        </label>
        <label style={{ marginLeft: '15px' }}>
          <input type="radio" name="subType" value="repeat" checked={type === 'repeat'} onChange={() => setType('repeat')} /> Repeat Item
        </label>
        <label style={{ marginLeft: '15px' }}>
          <input type="radio" name="subType" value="ration" checked={type === 'ration'} onChange={() => setType('ration')} /> Monthly Ration
        </label>
      </div>

      {type === 'repeat' && (
        <div className="repeat-options">
          <div style={{ marginBottom: '10px' }}>
            <label>Duration: </label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option>1 Month</option><option>3 Months</option><option>6 Months</option><option>12 Months</option>
            </select>
          </div>
          <div style={{ marginBottom: '10px' }}>
            <label>Frequency: </label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option>4 times/month</option><option>15 times/month</option><option>30 times/month</option>
            </select>
          </div>
        </div>
      )}

      {type === 'ration' && (
        <div className="ration-options" style={{ marginBottom: '10px' }}>
          <label>Package: </label>
          <select value={rationPackage} onChange={(e) => setRationPackage(e.target.value)}>
            <option>Basic</option><option>Standard</option><option>Advanced</option><option>Premium</option>
          </select>
        </div>
      )}

      {(type !== 'none' && upsellProducts.length > 0) && (
        <div className="upsell-section" style={{ marginTop: '15px', paddingTop: '10px', borderTop: '1px dashed #ccc' }}>
          <h4>Add-on (Upsell) Suggestions</h4>
          {upsellProducts.map(product => (
            <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
              <span>{product.product_name} (₹{product.price})</span>
              <button 
                onClick={() => toggleUpsell(product)}
                style={{ padding: '2px 10px', backgroundColor: selectedUpsells.find(p => p.id === product.id) ? '#ff4d4d' : '#4CAF50', color: 'white', border: 'none', borderRadius: '4px' }}
              >
                {selectedUpsells.find(p => p.id === product.id) ? 'Remove' : 'Add'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SubscriptionOptions;