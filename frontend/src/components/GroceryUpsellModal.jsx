import React from 'react';

const GROCERY_PLANS = [
  { id: 'basic', name: 'Basic', tag: '', items: ['Rice 5kg', 'Atta 3kg'], color: 'blue' },
  { id: 'advanced', name: 'Advanced', tag: 'Most Popular', items: ['Rice 7kg', 'Atta 5kg', 'Oil 1L'], color: 'green' },
  { id: 'pro', name: 'Pro', tag: 'Best Value', items: ['Rice 10kg', 'Atta 10kg', 'Oil 2L', 'Pulses'], color: 'orange' },
  { id: 'vip', name: 'VIP', tag: 'Premium', items: ['Organic Rice 10kg', 'Atta 10kg', 'Cold Pressed Oil 5L', 'Essentials Kit'], color: 'purple' }
];

const GroceryUpsellModal = ({ isOpen, onClose, onSelectPlan }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full p-8 shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl">✕</button>
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-800">Add Monthly Grocery Plan & Save More</h2>
          <p className="text-gray-500 mt-2">Subscribe to our essentials bundles and never run out.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {GROCERY_PLANS.map((plan) => (
            <div key={plan.id} className="border-2 border-gray-100 rounded-2xl p-5 flex flex-col hover:border-blue-500 transition-all group relative">
              {plan.tag && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] uppercase font-bold px-3 py-1 rounded-full shadow-md">
                  {plan.tag}
                </span>
              )}
              <div className="mb-4">
                <h3 className="text-xl font-bold text-gray-800">{plan.name}</h3>
                <div className="h-1 w-10 bg-blue-500 mt-1 rounded"></div>
              </div>
              
              <ul className="space-y-2 mb-8 flex-grow">
                {plan.items.map((item, idx) => (
                  <li key={idx} className="text-sm text-gray-600 flex items-center">
                    <span className="mr-2 text-blue-500">✓</span> {item}
                  </li>
                ))}
              </ul>

              <button 
                onClick={() => onSelectPlan(plan.id)}
                className="w-full bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-blue-600 transition-colors shadow-lg active:scale-95"
              >
                Choose Plan
              </button>
            </div>
          ))}
        </div>

        <div className="mt-8 text-center">
          <button onClick={onClose} className="text-sm text-gray-400 hover:text-blue-500 underline transition-colors">
            Continue to payment without grocery plan
          </button>
        </div>
      </div>
    </div>
  );
};

export default GroceryUpsellModal;