import React, { useState, useEffect } from 'react';

const SubscriptionOptions = ({ onUpdate, upsellProducts = [] }) => {
  const [type, setType] = useState('none'); 
  const [duration, setDuration] = useState('1 Month');
  const [frequency, setFrequency] = useState('4 times/month');
  const [rationPackage, setRationPackage] = useState('Standard');
  const [selectedUpsells, setSelectedUpsells] = useState([]);

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
        total: selectedUpsells.reduce((sum, item) => sum + (item.price || 0), 0)
      });
    }
  }, [type, duration, frequency, rationPackage, selectedUpsells, onUpdate]);

  const toggleUpsell = (product) => {
    setSelectedUpsells(prev => 
      prev.find(p => p.id === product.id) 
        ? prev.filter(p => p.id !== product.id) 
        : [...prev, product]
    );
  };

  return (
    <div className="subscription-box" style={{ border: '1px solid #25D366', padding: '15px', borderRadius: '8px', margin: '20px 0', backgroundColor: '#f9f9f9' }}>
      <h3 style={{ marginTop: 0, color: '#075E54' }}>Add Subscription</h3>
      
      <div style={{ marginBottom: '15px' }}>
        <label style={{ marginRight: '10px' }}>
          <input type="radio" name="subType" value="none" checked={type === 'none'} onChange={() => setType('none')} /> None
        </label>
        <label style={{ marginRight: '10px' }}>
          <input type="radio" name="subType" value="repeat" checked={type === 'repeat'} onChange={() => setType('repeat')} /> Repeat Item
        </label>
        <label>
          <input type="radio" name="subType" value="ration" checked={type === 'ration'} onChange={() => setType('ration')} /> Monthly Ration
        </label>
      </div>

      {type === 'repeat' && (
        <div className="options-grid" style={{ display: 'grid', gap: '10px' }}>
          <div>
            <label>Duration: </label>
            <select value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option>1 Month</option><option>3 Months</option><option>6 Months</option><option>12 Months</option>
            </select>
          </div>
          <div>
            <label>Frequency: </label>
            <select value={frequency} onChange={(e) => setFrequency(e.target.value)}>
              <option>4 times/month</option><option>15 times/month</option><option>30 times/month</option>
            </select>
          </div>
        </div>
      )}

      {type === 'ration' && (
        <div className="ration-grid">
          <label>Package: </label>
          <select value={rationPackage} onChange={(e) => setRationPackage(e.target.value)}>
            <option>Basic</option><option>Standard</option><option>Advanced</option><option>Premium</option>
          </select>
        </div>
      )}

      {type !== 'none' && upsellProducts.length > 0 && (
        <div style={{ marginTop: '15px', borderTop: '1px solid #ddd', paddingTop: '10px' }}>
          <h4 style={{ margin: '0 0 10px 0' }}>Recommended Add-ons</h4>
          {upsellProducts.map(product => (
            <div key={product.id} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'center' }}>
              <span>{product.product_name} (₹{product.price})</span>
              <button 
                onClick={() => toggleUpsell(product)}
                style={{ 
                  padding: '4px 8px', 
                  backgroundColor: selectedUpsells.find(p => p.id === product.id) ? '#dc3545' : '#28a745',
                  color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer'
                }}
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