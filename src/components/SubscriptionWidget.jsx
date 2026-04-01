import React, { useState, useEffect } from 'react';
import { resolveBackendUrl } from '../config/api';

export default function SubscriptionWidget({ product }){
  const [open, setOpen] = useState(false);
  const [plans, setPlans] = useState([]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [deliveryDays, setDeliveryDays] = useState([]);

  useEffect(()=>{
    // derive plans by category heuristics
    const category = product.category || 'groceries';
    if (['flowers','fruits','vegetables'].includes(category)){
      setPlans([
        { id: 'starter', name: 'Starter - 1/wk' },
        { id: 'smart', name: 'Smart - 2/wk' },
        { id: 'value', name: 'Value+ - 3/wk' }
      ]);
    } else if (category === 'groceries'){
      setPlans([
        { id: 'essential', name: 'Essential (3 ppl)' },
        { id: 'family', name: 'Family (4 ppl)' }
      ]);
    } else {
      setPlans([{ id: 'monthly', name: 'Monthly Plan' }]);
    }
  },[product]);

  async function createSubscription(){
    const payload = {
      user_id: 1,
      category: product.category || 'groceries',
      plan_type: selectedPlan?.name || plans[0]?.name,
      frequency: 1,
      delivery_days: deliveryDays,
      items: [{ id: product.id, price: product.basePrice || product.price, qty: 1 }],
      quantities: { [product.id]: 1 }
    };

    try{
      const url = resolveBackendUrl('/subscription/create');
      const res = await fetch(url, {
        method: 'POST', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload)
      });
      const json = await res.json();
      alert('Subscription created');
      setOpen(false);
    }catch(e){
      console.error(e); alert('Failed to create subscription');
    }
  }

  return (
    <div style={{ marginTop:16 }}>
      <button onClick={() => setOpen(true)} style={{ background:'#0a7', color:'#fff', padding:'8px 12px', border:'none', borderRadius:4 }}>Subscribe & Save</button>
      {open && (
        <div style={{ border:'1px solid #ddd', padding:16, marginTop:8, borderRadius:6, maxWidth:420 }}>
          <h4>Subscribe & Save</h4>
          <div>
            <label>Plan</label>
            <select onChange={e=>setSelectedPlan(plans.find(p=>p.id===e.target.value))}>
              {plans.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div style={{ marginTop:8 }}>
            <label>Delivery days (select weekdays)</label>
            <div style={{ display:'flex', gap:6, marginTop:6 }}>
              {[0,1,2,3,4,5,6].map(d=> (
                <button key={d} onClick={()=>{
                  setDeliveryDays(prev => prev.includes(d) ? prev.filter(x=>x!==d) : [...prev,d]);
                }} style={{ padding:6, background: deliveryDays.includes(d)?'#036':'#eee', color: deliveryDays.includes(d)?'#fff':'#000', border:'none' }}>{['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][d]}</button>
              ))}
            </div>
          </div>
          <div style={{ marginTop:12 }}>
            <button onClick={createSubscription} style={{ marginRight:8 }}>Confirm Subscription</button>
            <button onClick={()=>setOpen(false)}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
