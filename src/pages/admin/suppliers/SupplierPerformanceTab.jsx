import { useEffect, useState } from "react";
import api from "../../../api/client";

export default function SupplierPerformanceTab({ supplierId }) {
  const [kpis, setKpis] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadStats() {
      try {
        setError("");
        const res = await api.get(`/admin/suppliers/stats/${supplierId}`);
        setKpis(res.data?.kpis || null);
      } catch (err) {
        console.error("Failed to load supplier performance:", err);
        setKpis(null);
        setError("Performance data is unavailable.");
      }
    }
    loadStats();
  }, [supplierId]);

  if (error) return error;

  if (!kpis) return "Loading...";

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      <Stat label="Performance Score" value={kpis.score} />
      <Stat label="Total Orders" value={kpis.totalOrders} />
      <Stat label="Delivered Orders" value={kpis.deliveredOrders} />
      <Stat label="On-Time Delivery" value={`${kpis.onTimeDeliveryPercent}%`} />
      <Stat
        label="Avg Fulfillment Time"
        value={`${kpis.averageFulfillmentTimeHours} hrs`}
      />
      <Stat label="Revenue" value={`₹${kpis.totalRevenue}`} />
      <Stat
        label="Cancelled Orders"
        value={`${kpis.cancelledOrders} (${kpis.cancellationRatePercent}%)`}
      />
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="border rounded-lg p-4 bg-white shadow">
      <div className="text-xs text-gray-500 uppercase">{label}</div>
      <div className="text-xl font-semibold">{value}</div>
    </div>
  );
}



