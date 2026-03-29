import React, { useEffect, useState } from "react";
import { getDashboardStats } from "../features/dashboard/dashboard.api";
import { Users, IndianRupee, UserSquare2, CalendarCheck, TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

export default function DashboardPage() {
  const [stats, setStats] = useState({ 
    totalMembers: 120, 
    activePlans: 0, 
    revenue: 50000,
    activeTrainers: 5,
    attendanceToday: 45
  });

  useEffect(() => {
    getDashboardStats()
      .then((res) => {
        if (res.data?.data) {
          setStats(prev => ({ ...prev, ...res.data.data }));
        }
      })
      .catch(() => null);
  }, []);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Dashboard Overview</h1>
            <p className="text-muted">Welcome back! Here's what's happening today.</p>
          </div>
          <button className="btn btn-primary">
            <ArrowUpRight size={18} />
            Export
          </button>
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Members</h3>
            <p className="stat-value">{stats.totalMembers}</p>
            <p className="stat-trend trend-up">
              <TrendingUp size={14} />
              +12% this month
            </p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--clr-primary)' }}>
            <Users size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Monthly Revenue</h3>
            <p className="stat-value">₹{(stats.revenue || 0).toLocaleString()}</p>
            <p className="stat-trend trend-up">
              <TrendingUp size={14} />
              +5.4% this month
            </p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--clr-success)' }}>
            <IndianRupee size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Active Trainers</h3>
            <p className="stat-value">{stats.activeTrainers}</p>
            <p className="text-muted" style={{ fontSize: '0.8rem' }}>All present today</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--clr-secondary)' }}>
            <UserSquare2 size={24} />
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-info">
            <h3>Attendance Today</h3>
            <p className="stat-value">{stats.attendanceToday}</p>
            <p className="stat-trend trend-down">
              <TrendingDown size={14} />
              -2% from yesterday
            </p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--clr-warning)' }}>
            <CalendarCheck size={24} />
          </div>
        </div>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="glass-panel" style={{ padding: '1.5rem', minHeight: '350px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.1rem' }}>Revenue Analytics (Simulated)</h3>
            <select className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
              <option>Last 7 Days</option>
              <option>Last 30 Days</option>
            </select>
          </div>
          {/* Chart Placeholder */}
          <div style={{ height: '250px', display: 'flex', alignItems: 'flex-end', gap: '1rem', paddingBottom: '1rem' }}>
            {[40, 60, 45, 80, 55, 90, 70].map((h, i) => (
              <div key={i} style={{ 
                flex: 1, 
                height: `${h}%`, 
                background: i === 3 ? 'var(--clr-success)' : 'var(--clr-primary)',
                borderRadius: '8px 8px 0 0',
                opacity: 0.8
              }}></div>
            ))}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem', marginBottom: '1.5rem' }}>Recent Activities</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {[
              { text: 'Amit Das checked in', time: '10 mins ago', color: 'var(--clr-success)' },
              { text: 'New membership: Priya', time: '1 hour ago', color: 'var(--clr-primary)' },
              { text: 'Payment due: Vikram', time: '2 hours ago', color: 'var(--clr-warning)' },
              { text: 'Trainer Karan updated schedule', time: '4 hours ago', color: 'var(--clr-secondary)' },
            ].map((activity, i) => (
              <div key={i} style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: activity.color, marginTop: '0.4rem' }}></div>
                <div>
                  <p style={{ fontSize: '0.9rem', fontWeight: '500' }}>{activity.text}</p>
                  <p style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
