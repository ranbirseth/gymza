import React, { useEffect, useState } from 'react';
import { getPayments, markAsPaid, markAsUnpaid, getInvoice } from '../features/payments/payments.api';
import { CreditCard, IndianRupee, Download, Search, Filter, ArrowUpRight, ArrowDownLeft, CheckCircle, XCircle, FileText } from 'lucide-react';

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, pendingCount: 0 });

  const fetchPayments = async () => {
    setLoading(true);
    try {
      const res = await getPayments();
      const data = res.data?.data;
      const items = Array.isArray(data) ? data : (data?.items || []);
      setPayments(items);
      
      // Calculate simple stats
      const total = items.filter((p: any) => p.status === 'paid').reduce((acc: number, p: any) => acc + p.amount, 0);
      const pending = items.filter((p: any) => p.status === 'pending').reduce((acc: number, p: any) => acc + p.amount, 0);
      const pendingCount = items.filter((p: any) => p.status === 'pending').length;
      setStats({ total, pending, pendingCount });
    } catch (error) {
      console.error('Failed to fetch payments', error);
      setPayments([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const handleStatusChange = async (id: string, currentStatus: string) => {
    try {
      if (currentStatus === 'paid') {
        await markAsUnpaid(id);
      } else {
        await markAsPaid(id);
      }
      fetchPayments();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Status update failed');
    }
  };

  const handleDownloadInvoice = (id: string) => {
    // In a real app, this would open/download a PDF
    alert('Generating invoice PDF... (Feature coming soon)');
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Offline Payments & Billing</h1>
            <p className="text-muted">Track cash collections and manual membership payments.</p>
          </div>
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Revenue (Collected)</h3>
            <p className="stat-value">₹{stats.total.toLocaleString()}</p>
            <p className="stat-trend trend-up">
              <ArrowUpRight size={14} />
              Confirmed cash payments
            </p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--clr-success)' }}>
            <IndianRupee size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Pending Dues</h3>
            <p className="stat-value">₹{stats.pending.toLocaleString()}</p>
            <p className="stat-trend trend-down">
              <ArrowDownLeft size={14} />
              {stats.pendingCount} members pending
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
            <input placeholder="Search transactions by member or invoice..." />
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
                <th>Invoice #</th>
                <th>Member</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Date</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>Loading transactions...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '2rem' }}>No transactions recorded.</td></tr>
              ) : payments.map((p) => (
                <tr key={p._id}>
                  <td>
                    <span style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--clr-primary)' }}>
                      {p.invoiceNumber}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                        {(p.member?.user?.name || 'U').charAt(0)}
                      </div>
                      <span style={{ fontWeight: '600' }}>{p.member?.user?.name || 'Unknown Member'}</span>
                    </div>
                  </td>
                  <td>
                    <span className="status-badge active" style={{ background: 'rgba(var(--clr-primary-rgb), 0.1)', color: 'var(--clr-primary)' }}>
                      {p.plan?.name || 'Manual Payment'}
                    </span>
                  </td>
                  <td>
                    <div style={{ fontWeight: '700' }}>₹{(p.amount || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', textTransform: 'capitalize' }}>Method: {p.method}</div>
                  </td>
                  <td>{new Date(p.date || p.createdAt).toLocaleDateString()}</td>
                  <td>
                    <button 
                      onClick={() => handleStatusChange(p._id, p.status)}
                      className={`status-badge ${p.status === 'paid' ? 'active' : 'pending'}`}
                      style={{ border: 'none', cursor: 'pointer', transition: 'all 0.2s' }}
                      title={`Click to mark as ${p.status === 'paid' ? 'unpaid' : 'paid'}`}
                    >
                      {p.status === 'paid' ? <CheckCircle size={12} style={{ marginRight: '4px' }} /> : <XCircle size={12} style={{ marginRight: '4px' }} />}
                      {p.status}
                    </button>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-icon" onClick={() => handleDownloadInvoice(p._id)} title="Download Invoice">
                        <FileText size={16} />
                      </button>
                    </div>
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
