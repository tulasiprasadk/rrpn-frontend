import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import SupplierSidebar from "../../components/dashboard/SupplierSidebar";
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
import api from "../../api/client";
import "../../components/dashboard/Sidebar.css";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Tooltip,
  Legend
);

export default function SupplierAnalytics() {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [weeklyData, setWeeklyData] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get("/supplier/dashboard");
      
      if (res.data) {
        setStats(res.data.stats);
        setWeeklyData(res.data.charts?.weekly || []);
        setMonthlyData(res.data.charts?.monthly || []);
        setTopProducts(res.data.topProducts || []);
      }
    } catch (err) {
      console.error("Analytics load error:", err);
      if (err.response?.status === 401) {
        navigate("/supplier/login");
        return;
      }
      setError("Failed to load analytics data");
    } finally {
      setLoading(false);
    }
  };

  const weeklyChartData = {
    labels: weeklyData.map(d => {
      const date = new Date(d.date);
      return date.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    }),
    datasets: [{
      label: 'Daily Revenue (₹)',
      data: weeklyData.map(d => d.revenue),
      borderColor: '#1976d2',
      backgroundColor: 'rgba(25, 118, 210, 0.1)',
      tension: 0.4
    }]
  };

  const monthlyChartData = {
    labels: monthlyData.map(d => {
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      return `${monthNames[d.month - 1]} ${d.year}`;
    }),
    datasets: [{
      label: 'Monthly Revenue (₹)',
      data: monthlyData.map(d => d.revenue),
      backgroundColor: 'rgba(255, 193, 7, 0.6)',
      borderColor: '#ffc107',
      borderWidth: 1
    }]
  };

  const hasData = stats && (stats.revenueWeek > 0 || stats.revenueMonth > 0 || topProducts.length > 0);

  return (
    <div className="dashboard-container" style={{ display: 'flex', minHeight: '80vh', background: '#f8f9fa', position: 'relative' }}>
      <SupplierSidebar />
      <main style={{ 
        flex: 1, 
        padding: '2rem', 
        marginLeft: '250px',
        width: 'calc(100% - 250px)',
        maxWidth: 'calc(100vw - 250px)',
        boxSizing: 'border-box',
        minWidth: 0,
        position: 'relative'
      }}>
        <h1 style={{ marginBottom: '1.5rem', fontSize: '28px', fontWeight: 'bold' }}>Performance Analytics</h1>

        {error && (
          <div style={{ padding: '12px', background: '#ffebee', color: '#c62828', borderRadius: '4px', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Loading analytics...</div>
        ) : !hasData ? (
          <div style={{ 
            textAlign: 'center', 
            padding: '4rem 2rem', 
            background: 'white', 
            borderRadius: '8px', 
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ fontSize: '48px', marginBottom: '1rem' }}>📊</div>
            <h2 style={{ color: '#666', marginBottom: '0.5rem' }}>No Performance Data</h2>
            <p style={{ color: '#999' }}>You don't have any performance data yet. Analytics will appear here once you start receiving orders.</p>
          </div>
        ) : (
          <>
            {/* Revenue Summary */}
            {stats && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem', color: '#666' }}>Weekly Revenue</h3>
                  <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 'bold', color: '#1976d2' }}>₹ {(stats.revenueWeek || 0).toLocaleString()}</h2>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem', color: '#666' }}>Monthly Revenue</h3>
                  <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 'bold', color: '#1976d2' }}>₹ {(stats.revenueMonth || 0).toLocaleString()}</h2>
                </div>
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ fontSize: '1.2rem', margin: '0 0 0.5rem', color: '#666' }}>Yearly Revenue</h3>
                  <h2 style={{ fontSize: '1.8rem', margin: 0, fontWeight: 'bold', color: '#1976d2' }}>₹ {(stats.revenueYear || 0).toLocaleString()}</h2>
                </div>
              </div>
            )}

            {/* Charts */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              {weeklyData.length > 0 && (
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '18px', fontWeight: '600' }}>Weekly Revenue Trend</h3>
                  <Line data={weeklyChartData} options={{ responsive: true, maintainAspectRatio: false, height: 300 }} />
                </div>
              )}

              {monthlyData.length > 0 && (
                <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                  <h3 style={{ marginBottom: '1rem', fontSize: '18px', fontWeight: '600' }}>Monthly Revenue Trend</h3>
                  <Bar data={monthlyChartData} options={{ responsive: true, maintainAspectRatio: false, height: 300 }} />
                </div>
              )}
            </div>

            {/* Top Products */}
            {topProducts.length > 0 && (
              <div style={{ background: 'white', padding: '1.5rem', borderRadius: '8px', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                <h3 style={{ marginBottom: '1rem', fontSize: '18px', fontWeight: '600' }}>Top Products</h3>
                <div style={{ display: 'grid', gap: '0.5rem' }}>
                  {topProducts.map((product, idx) => (
                    <div key={product.productId || idx} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.75rem', background: '#f5f5f5', borderRadius: '4px' }}>
                      <span style={{ fontWeight: '500' }}>{product.productTitle}</span>
                      <div style={{ display: 'flex', gap: '1rem', color: '#666' }}>
                        <span>{product.orderCount} orders</span>
                        <span style={{ fontWeight: '600', color: '#1976d2' }}>₹ {product.revenue.toLocaleString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}
