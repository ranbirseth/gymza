import React, { useEffect, useState } from 'react';
import { getPayments, getInvoice } from '../features/payments/payments.api';
import { getMyProfile } from '../features/members/members.api';
import { CreditCard, Calendar, Clock, Download, FileText, Printer, AlertTriangle, Check } from 'lucide-react';
import Modal from '../components/Modal';

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  // Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [fetchingInvoice, setFetchingInvoice] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [payRes, profRes] = await Promise.all([
        getPayments().catch(() => ({ data: { data: { items: [] } } })),
        getMyProfile().catch(() => ({ data: { data: null } }))
      ]);
      
      const paymentData = payRes.data?.data;
      const items = Array.isArray(paymentData) ? paymentData : (paymentData?.items || []);
      setPayments(items);
      setProfile(profRes.data?.data);
    } catch (error) {
      console.error('Failed to fetch data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDownloadInvoice = async (id: string) => {
    setFetchingInvoice(true);
    try {
      const res = await getInvoice(id);
      setSelectedInvoice(res.data.data);
      setIsInvoiceModalOpen(true);
    } catch (error) {
      alert("Failed to fetch invoice data");
    } finally {
      setFetchingInvoice(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    window.print();
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = () => {
    if (!profile?.membershipExpiryDate) return null;
    const expiry = new Date(profile.membershipExpiryDate);
    const now = new Date();
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const daysLeft = getDaysUntilExpiry();
  const isExpirySoon = daysLeft !== null && daysLeft <= 7 && daysLeft > 0;
  const isExpired = daysLeft !== null && daysLeft <= 0;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-printable, .invoice-printable * { visibility: visible; }
          .invoice-printable { position: absolute; left: 0; top: 0; width: 100%; }
          .btn-print { display: none !important; }
        }
      `}</style>

      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1>My Payments & Billing</h1>
          <p className="text-muted">Manage your subscription and payment history</p>
        </div>
      </div>

      {/* Active Plan Section */}
      {profile?.currentPlan ? (
        <div className="glass-panel" style={{ padding: '1.5rem', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.08) 0%, rgba(6, 182, 212, 0.08) 100%)', border: '1px solid rgba(139, 92, 246, 0.2)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(139, 92, 246, 0.15)', borderRadius: '12px', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CreditCard size={24} style={{ color: 'var(--clr-primary)' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.1rem', margin: 0 }}>My Active Plan</h2>
              <p className="text-muted" style={{ fontSize: '0.8rem', margin: '0.25rem 0 0 0' }}>Current Subscription</p>
            </div>
            <div style={{ marginLeft: 'auto' }}>
              <span className="status-badge active">Active</span>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, marginBottom: '0.5rem' }}>Plan Name</p>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--clr-primary)', margin: 0 }}>{profile.currentPlan.name}</p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, marginBottom: '0.5rem' }}>Start Date</p>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', margin: 0 }}>
                {profile.membershipStartDate ? new Date(profile.membershipStartDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, marginBottom: '0.5rem' }}>Expiry Date</p>
              <p style={{ fontWeight: 600, fontSize: '0.95rem', color: isExpired ? 'var(--clr-danger)' : isExpirySoon ? 'var(--clr-warning)' : 'inherit', margin: 0 }}>
                {profile.membershipExpiryDate ? new Date(profile.membershipExpiryDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' }) : 'N/A'}
              </p>
            </div>
            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.06)' }}>
              <p className="text-muted" style={{ fontSize: '0.7rem', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0, marginBottom: '0.5rem' }}>Days Left</p>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', color: isExpired ? 'var(--clr-danger)' : isExpirySoon ? 'var(--clr-warning)' : 'var(--clr-success)', margin: 0 }}>
                {daysLeft === null ? 'N/A' : daysLeft <= 0 ? 'Expired' : `${daysLeft} days`}
              </p>
            </div>
          </div>

          {isExpired && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(244, 63, 94, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(244, 63, 94, 0.3)' }}>
              <AlertTriangle size={20} style={{ color: 'var(--clr-danger)', flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, color: 'var(--clr-danger)', margin: 0, marginBottom: '0.25rem' }}>Subscription Expired</p>
                <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>Your subscription has expired. Please renew to continue accessing the gym.</p>
              </div>
            </div>
          )}

          {isExpirySoon && !isExpired && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', background: 'rgba(245, 158, 11, 0.1)', padding: '1rem', borderRadius: '12px', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
              <Clock size={20} style={{ color: 'var(--clr-warning)', flexShrink: 0 }} />
              <div>
                <p style={{ fontWeight: 600, color: 'var(--clr-warning)', margin: 0, marginBottom: '0.25rem' }}>Expiring Soon</p>
                <p className="text-muted" style={{ fontSize: '0.85rem', margin: 0 }}>Your subscription expires in {daysLeft} days. Renew now to avoid interruption.</p>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ padding: '1.5rem', textAlign: 'center', background: 'rgba(245, 158, 11, 0.05)', border: '1px solid rgba(245, 158, 11, 0.2)' }}>
          <AlertTriangle size={32} style={{ color: 'var(--clr-warning)', margin: '0 auto 0.5rem' }} />
          <p className="text-muted" style={{ marginBottom: '0.35rem' }}>No active plan assigned</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--clr-text-muted)' }}>Please contact the admin to subscribe to a plan.</p>
        </div>
      )}

      {/* Payment History Section */}
      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', borderRadius: '12px', padding: '0.75rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <CreditCard size={24} style={{ color: 'var(--clr-success)' }} />
          </div>
          <h2 style={{ fontSize: '1.1rem', margin: 0 }}>Payment History</h2>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>
            <div className="spinner" style={{ margin: '0 auto' }}></div>
          </div>
        ) : payments.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem' }}>
            <CreditCard size={48} style={{ color: 'var(--clr-text-muted)', opacity: 0.3, margin: '0 auto 1rem' }} />
            <p className="text-muted">No payment records found</p>
          </div>
        ) : (
          <>
            {/* Desktop Table View */}
            <div className="table-container hide-on-mobile" style={{ margin: 0, border: 'none', background: 'transparent', overflowX: 'auto' }}>
              <table className="data-table" style={{ fontSize: '0.85rem' }}>
                <thead>
                  <tr>
                    <th style={{ padding: '0.75rem 1rem' }}>Invoice #</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Plan</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {payments.map((p) => (
                    <tr key={p._id}>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--clr-primary)', fontSize: '0.8rem' }}>
                          {p.invoiceNumber}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className="status-badge active" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--clr-primary)', fontSize: '0.75rem', padding: '0.2rem 0.5rem' }}>
                          {p.plan?.name || 'Manual Payment'}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: '700' }}>₹{(p.amount || 0).toLocaleString()}</td>
                      <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>{new Date(p.date || p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <span className={`status-badge ${p.status === 'paid' ? 'active' : 'pending'}`} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          {p.status === 'paid' ? <Check size={12} /> : <Clock size={12} />}
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '0.75rem 1rem' }}>
                        <button 
                          className="btn-icon" 
                          style={{ width: '28px', height: '28px' }} 
                          onClick={() => handleDownloadInvoice(p._id)} 
                          title="View Invoice"
                          disabled={fetchingInvoice}
                        >
                          <FileText size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards View */}
            <div className="mobile-cards-container">
              {payments.map((p) => (
                <div 
                  key={p._id} 
                  className="mobile-card"
                  style={{ cursor: 'pointer' }}
                  onClick={() => handleDownloadInvoice(p._id)}
                >
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Invoice</span>
                    <span className="mobile-card-value" style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--clr-primary)' }}>
                      {p.invoiceNumber}
                    </span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Plan</span>
                    <span className="mobile-card-value">{p.plan?.name || 'Manual Payment'}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Amount</span>
                    <span className="mobile-card-value" style={{ fontWeight: '700', color: 'var(--clr-primary)' }}>₹{(p.amount || 0).toLocaleString()}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Date</span>
                    <span className="mobile-card-value">{new Date(p.date || p.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: '2-digit' })}</span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Status</span>
                    <span className={`status-badge ${p.status === 'paid' ? 'active' : 'pending'}`} style={{ fontSize: '0.75rem' }}>
                      {p.status}
                    </span>
                  </div>
                  <div style={{ marginTop: '0.75rem', textAlign: 'center' }}>
                    <p className="text-muted" style={{ fontSize: '0.7rem', margin: 0 }}>Tap to view invoice</p>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Invoice Modal */}
      <Modal isOpen={isInvoiceModalOpen} onClose={() => setIsInvoiceModalOpen(false)} title="Payment Invoice">
        {selectedInvoice && (
          <div className="invoice-printable" style={{ padding: '1rem', color: '#1a1a1a', background: 'white', borderRadius: '8px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }}>
              <div>
                <h2 style={{ color: 'var(--clr-primary)', marginBottom: '0.5rem' }}>GYMZA</h2>
                <p style={{ fontSize: '0.85rem', color: '#666' }}>Premium Fitness Center</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h3 style={{ marginBottom: '0.25rem' }}>INVOICE</h3>
                <p style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{selectedInvoice.invoiceNumber}</p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }}>
              <div>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Billed To</h4>
                <p style={{ fontWeight: 'bold' }}>{selectedInvoice.member?.user?.name}</p>
                <p style={{ fontSize: '0.85rem' }}>{selectedInvoice.member?.user?.email}</p>
                <p style={{ fontSize: '0.85rem' }}>{selectedInvoice.member?.user?.phone}</p>
              </div>
              <div style={{ textAlign: 'right' }}>
                <h4 style={{ fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }}>Payment Details</h4>
                <p style={{ fontSize: '0.85rem' }}>Date: {new Date(selectedInvoice.date).toLocaleDateString()}</p>
                <p style={{ fontSize: '0.85rem' }}>Method: <span style={{ textTransform: 'capitalize' }}>{selectedInvoice.method}</span></p>
                <p style={{ fontSize: '0.85rem' }}>Status: <span style={{ color: selectedInvoice.status === 'paid' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }}>{selectedInvoice.status.toUpperCase()}</span></p>
              </div>
            </div>

            <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }}>
              <thead>
                <tr style={{ background: '#f8f9fa' }}>
                  <th style={{ textAlign: 'left', padding: '12px', borderBottom: '1px solid #eee' }}>Description</th>
                  <th style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid #eee' }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td style={{ padding: '12px', borderBottom: '1px solid #eee' }}>
                    <p style={{ fontWeight: 'bold' }}>{selectedInvoice.plan?.name || 'Membership Plan'}</p>
                    <p style={{ fontSize: '0.75rem', color: '#666' }}>{selectedInvoice.plan?.duration} Days Access</p>
                  </td>
                  <td style={{ textAlign: 'right', padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }}>₹{selectedInvoice.amount.toLocaleString()}</td>
                </tr>
              </tbody>
              <tfoot>
                <tr>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold' }}>Total</td>
                  <td style={{ padding: '12px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--clr-primary)' }}>₹{selectedInvoice.amount.toLocaleString()}</td>
                </tr>
              </tfoot>
            </table>

            <div style={{ textAlign: 'center', marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '1rem' }}>
              <p style={{ fontSize: '0.8rem', color: '#888' }}>Thank you for your business!</p>
              <p style={{ fontSize: '0.75rem', color: '#aaa', marginTop: '0.5rem' }}>This is a computer-generated invoice.</p>
            </div>

            <div className="btn-print" style={{ marginTop: '2rem', display: 'flex', gap: '1rem' }}>
              <button className="btn btn-primary flex-1" onClick={handlePrint}>
                <Printer size={18} /> Print Invoice
              </button>
              <button className="btn btn-secondary flex-1" onClick={handleDownloadPDF}>
                <Download size={18} /> Download (PDF)
              </button>
              <button className="btn btn-secondary" onClick={() => setIsInvoiceModalOpen(false)}>Close</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default PaymentsPage;
