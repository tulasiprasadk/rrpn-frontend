import { useEffect, useState } from "react";
import { Line, Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useAdminAuth } from "../../context/AdminAuthContext";
import { API_BASE } from "../../config/api";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

const AdminDashboard = () => {
  useAdminAuth();

  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;

    const fetchJson = async (url) => {
      const res = await fetch(url, { credentials: "include", headers });
      if (!res.ok) {
        throw new Error(`Request failed: ${res.status}`);
      }
      return res.json();
    };

    Promise.all([
      fetchJson(`${API_BASE}/admin/stats`),
      fetchJson(`${API_BASE}/admin/charts/revenue`),
      fetchJson(`${API_BASE}/admin/charts/orders`),
    ])
      .then(([statsData, revenue, orders]) => {
        setStats(statsData);
        setRevenueData(revenue || []);
        setOrdersData(orders || []);
      })
      .catch((err) => {
        console.error("Admin dashboard load error:", err);
        setStats({
          totalOrders: 0,
          totalRevenue: 0,
          totalSuppliers: 0,
          totalAds: 0,
        });
        setRevenueData([]);
        setOrdersData([]);
      });
  }, []);

  if (!stats) return <div>Loading dashboard...</div>;

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const lineChartData = {
    labels: revenueData.map(r => months[parseInt(r.month) - 1]),
    datasets: [
      {
        label: "Revenue (₹)",
        data: revenueData.map(r => r.total),
        borderColor: "#007bff",
        backgroundColor: "rgba(0, 123, 255, 0.3)",
      }
    ]
  };

  const barChartData = {
    labels: ordersData.map(o => months[parseInt(o.month) - 1]),
    datasets: [
      {
        label: "Orders Per Month",
        data: ordersData.map(o => o.count),
        backgroundColor: "rgba(255, 99, 132, 0.6)",
      }
    ]
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Admin Dashboard</h1>

      {/* TOP SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <DashboardCard title="Total Orders" value={stats.totalOrders} />
        <DashboardCard title="Revenue" value={"₹" + stats.totalRevenue} />
        <DashboardCard title="Suppliers" value={stats.totalSuppliers} />
        <DashboardCard title="Advertisements" value={stats.totalAds} />
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

        <div className="bg-white p-5 shadow rounded">
          <h2 className="text-xl mb-3 font-semibold">Monthly Revenue</h2>
          <Line data={lineChartData} />
        </div>

        <div className="bg-white p-5 shadow rounded">
          <h2 className="text-xl mb-3 font-semibold">Orders Per Month</h2>
          <Bar data={barChartData} />
        </div>

      </div>
    </div>
  );
};

const DashboardCard = ({ title, value }) => (
  <div className="bg-white shadow p-6 rounded">
    <h3 className="text-gray-600">{title}</h3>
    <p className="text-2xl font-bold mt-2">{value}</p>
  </div>
);

export default AdminDashboard;



