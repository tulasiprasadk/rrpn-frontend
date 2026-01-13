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
import { useNavigate } from "react-router-dom";
import { API_BASE } from "../../config/api";
import "./AdminDashboard.css";

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
  const { admin } = useAdminAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [revenueData, setRevenueData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      
      // Dashboard stats
      const statsRes = await fetch(`${API_BASE}/admin/stats`, {
        credentials: 'include'
      });
      const statsData = await statsRes.json();
      setStats(statsData);

      // Revenue chart
      const revenueRes = await fetch(`${API_BASE}/admin/charts/revenue`, {
        credentials: 'include'
      });
      const revenueChartData = await revenueRes.json();
      setRevenueData(revenueChartData);

      // Orders chart
      const ordersRes = await fetch(`${API_BASE}/admin/charts/orders`, {
        credentials: 'include'
      });
      const ordersChartData = await ordersRes.json();
      setOrdersData(ordersChartData);
    } catch (err) {
      console.error('Dashboard load error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="admin-dashboard-loading">
        <div>Loading dashboard...</div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="admin-dashboard-error">
        <p>Failed to load dashboard data. Please refresh the page.</p>
      </div>
    );
  }

  const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

  const lineChartData = {
    labels: revenueData.map(r => `${months[parseInt(r.month) - 1]} ${r.year}`),
    datasets: [
      {
        label: "Revenue (₹)",
        data: revenueData.map(r => r.total || 0),
        borderColor: "#e31e24",
        backgroundColor: "rgba(227, 30, 36, 0.1)",
        tension: 0.4,
        fill: true
      }
    ]
  };

  const barChartData = {
    labels: ordersData.map(o => `${months[parseInt(o.month) - 1]} ${o.year}`),
    datasets: [
      {
        label: "Orders Per Month",
        data: ordersData.map(o => o.count || 0),
        backgroundColor: "rgba(255, 214, 0, 0.8)",
        borderColor: "#ffd700",
        borderWidth: 1
      }
    ]
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  return (
    <div className="admin-dashboard">
      <div className="admin-dashboard-header">
        <h1>Admin Dashboard</h1>
        {admin && (
          <div className="admin-welcome">
            Welcome, <strong>{admin.name}</strong> ({admin.role === 'super_admin' ? 'Master Admin' : 'Admin'})
          </div>
        )}
      </div>

      {/* TOP SUMMARY CARDS */}
      <div className="admin-dashboard-cards">
        <DashboardCard 
          title="Total Revenue" 
          value={formatCurrency(stats.totalRevenue || 0)} 
          icon="💰"
          color="#e31e24"
          onClick={() => navigate('/admin/orders')}
        />
        <DashboardCard 
          title="Total Orders" 
          value={stats.totalOrders || 0} 
          icon="📦"
          color="#ffd700"
          onClick={() => navigate('/admin/orders')}
        />
        <DashboardCard 
          title="Total Suppliers" 
          value={stats.totalSuppliers || 0} 
          icon="🏪"
          color="#28a745"
          onClick={() => navigate('/admin/suppliers')}
        />
        <DashboardCard 
          title="Total Customers" 
          value={stats.totalCustomers || 0} 
          icon="👥"
          color="#007bff"
        />
        <DashboardCard 
          title="Pending Approvals" 
          value={stats.pendingSuppliers || 0} 
          icon="⏳"
          color="#ffc107"
          onClick={() => navigate('/admin/suppliers')}
          highlight={stats.pendingSuppliers > 0}
        />
        <DashboardCard 
          title="Total Products" 
          value={stats.totalProducts || 0} 
          icon="📦"
          color="#17a2b8"
          onClick={() => navigate('/admin/products')}
        />
      </div>

      {/* REVENUE SUMMARY */}
      <div className="admin-dashboard-revenue">
        <div className="revenue-card">
          <h3>Today's Revenue</h3>
          <p className="revenue-amount">{formatCurrency(stats.revenueToday || 0)}</p>
        </div>
        <div className="revenue-card">
          <h3>This Month</h3>
          <p className="revenue-amount">{formatCurrency(stats.revenueMonth || 0)}</p>
        </div>
        <div className="revenue-card">
          <h3>This Year</h3>
          <p className="revenue-amount">{formatCurrency(stats.revenueYear || 0)}</p>
        </div>
      </div>

      {/* CHARTS */}
      <div className="admin-dashboard-charts">
        <div className="chart-card">
          <h2>Monthly Revenue Trend</h2>
          {revenueData.length > 0 ? (
            <Line data={lineChartData} options={{
              responsive: true,
              plugins: {
                legend: { display: true },
                tooltip: { mode: 'index', intersect: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    callback: function(value) {
                      return '₹' + value.toLocaleString('en-IN');
                    }
                  }
                }
              }
            }} />
          ) : (
            <p className="no-data">No revenue data available</p>
          )}
        </div>

        <div className="chart-card">
          <h2>Orders Per Month</h2>
          {ordersData.length > 0 ? (
            <Bar data={barChartData} options={{
              responsive: true,
              plugins: {
                legend: { display: true },
                tooltip: { mode: 'index', intersect: false }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1
                  }
                }
              }
            }} />
          ) : (
            <p className="no-data">No orders data available</p>
          )}
        </div>
      </div>

      {/* QUICK ACTIONS */}
      <div className="admin-dashboard-actions">
        <h2>Quick Actions</h2>
        <div className="action-buttons">
          <button onClick={() => navigate('/admin/suppliers')} className="action-btn">
            Review Supplier KYC ({stats.pendingSuppliers || 0} pending)
          </button>
          <button onClick={() => navigate('/admin/products')} className="action-btn">
            Manage Products
          </button>
          <button onClick={() => navigate('/admin/orders')} className="action-btn">
            View All Orders
          </button>
          <button onClick={() => navigate('/admin/ads')} className="action-btn">
            Manage Advertisements
          </button>
        </div>
      </div>
    </div>
  );
};

const DashboardCard = ({ title, value, icon, color, onClick, highlight }) => (
  <div 
    className={`admin-dashboard-card ${onClick ? 'clickable' : ''} ${highlight ? 'highlight' : ''}`}
    onClick={onClick}
    style={{ borderTopColor: color }}
  >
    <div className="card-icon" style={{ color }}>{icon}</div>
    <h3>{title}</h3>
    <p className="card-value">{value}</p>
  </div>
);

export default AdminDashboard;



