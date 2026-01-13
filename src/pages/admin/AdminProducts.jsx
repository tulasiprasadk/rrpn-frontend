import React, { useEffect, useState } from 'react';
import axios from 'axios';
import ProductList from '../../components/admin/ProductList';
import ProductEditor from '../../components/admin/ProductEditor';

export default function AdminProducts(){
  const [products, setProducts] = useState([]);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ status:'', q:'', page:1 });

  useEffect(()=> fetchProducts(), [filters]);

  async function fetchProducts(){
    try{
      const params = { ...filters };
      const res = await axios.get('/api/admin/products', { params });
      setProducts(res.data.data || []);
    } catch (err) { console.error(err); }
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl mb-4">Product Management</h1>
      <div style={{ marginBottom: 12 }}>
        <a className="btn" href="/groceries_bulk_upload.csv" download>⬇️ Download Groceries Sample CSV</a>
        <input id="groceries-file" type="file" accept=".csv" style={{ marginLeft: 12 }} />
        <button className="btn" style={{ marginLeft: 8 }} onClick={async () => {
          const f = document.getElementById('groceries-file').files[0];
          if (!f) return alert('Select a CSV file first');
          const form = new FormData(); form.append('file', f);
          try {
            const res = await axios.post('/api/admin/products/import-groceries', form, { headers: { 'Content-Type': 'multipart/form-data' } });
            alert('Import result: ' + (res.data.inserted || '0') + ' inserted');
            window.location.reload();
          } catch (err) { console.error(err); alert('Import failed'); }
        }}>Upload & Import</button>
      </div>
      <div className="grid grid-cols-4 gap-4">
        <div className="col-span-1">
          <button className="w-full mb-2 btn" onClick={()=> setSelected({})}>Create Product</button>
          <div className="mb-2">
            <input placeholder="Search" value={filters.q} onChange={e=>setFilters({...filters,q:e.target.value, page:1})} />
            <select value={filters.status} onChange={e=>setFilters({...filters, status:e.target.value, page:1})}>
              <option value="">All</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="disabled">Disabled</option>
            </select>
          </div>
          <ProductList products={products} onEdit={p=>setSelected(p)} onRefresh={fetchProducts} />
        </div>

        <div className="col-span-3">
          <ProductEditor product={selected} onSaved={() => { setSelected(null); fetchProducts(); }} />
        </div>
      </div>
    </div>
  );
}



