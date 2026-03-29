import React, { useEffect, useState } from 'react';
import { getPayments } from '../features/payments/payments.api';
import { CreditCard, IndianRupee, Download, Search, Filter, ArrowUpRight, ArrowDownLeft } from 'lucide-react';

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getPayments()
      .then((res) => {
        const data = res.data?.data;
        setPayments(Array.isArray(data) ? data : (data?.items || []));
      })
      .catch(() => setPayments([]))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Payments & Billing</h1>
            <p className="text-muted">Manage invoices and track revenue.</p>
          </div>
          <button className="btn btn-primary">
            <CreditCard size={18} />
            New Transaction
          </button>
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Revenue</h3>
            <p className="stat-value">₹1,24,500</p>
            <p className="stat-trend trend-up">
              <ArrowUpRight size={14} />
              +8.2% vs last month
            </p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--clr-success)' }}>
            <IndianRupee size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Pending Dues</h3>
            <p className="stat-value">₹12,400</p>
            <p className="stat-trend trend-down">
              <ArrowDownLeft size={14} />
              14 members
            </p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--clr-warning)' }}>
            <CreditCard size={24} />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
          <div className="search-bar" style={{ width: '400px', background: 'var(--clr-bg-base)' }}>
            <Search size={18} className="text-muted" />
            <input placeholder="Search transactions..." />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary">
              <Filter size={18} />
              Filter
            </button>
          </div>
        </div>

        <div className="table-container" style={{ margin: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Method</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {payments.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                        {(p.member || 'U').charAt(0)}
                      </div>
                      <span style={{ fontWeight: '600' }}>{p.member || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700' }}>₹{(p.amount || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', textTransform: 'capitalize' }}>{p.type}</div>
                  </td>
                  <td>{p.date}</td>
                  <td>{p.method}</td>
                  <td>
                    <span className={`status-badge ${p.status || 'pending'}`}>
                      {p.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-icon">
                      <Download size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default PaymentsPage;
