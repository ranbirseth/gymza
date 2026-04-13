import React, { useEffect, useState } from 'react';
import { getPayments, markAsPaid, markAsUnpaid, getInvoice } from '../features/payments/payments.api';
import { CreditCard, IndianRupee, Download, Search, Filter, ArrowUpRight, ArrowDownLeft, CheckCircle, XCircle, FileText, Printer } from 'lucide-react';
import Modal from '../components/Modal';

const PaymentsPage: React.FC = () => {
  const [payments, setPayments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, pending: 0, pendingCount: 0 });
  const [expandedCardId, setExpandedCardId] = useState<string | null>(null);
  
  // Invoice Modal State
  const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [fetchingInvoice, setFetchingInvoice] = useState(false);

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
    const element = document.querySelector('.invoice-printable') as HTMLElement;
    if (!element) return;

    // A simple way to "download" as PDF is to trigger print 
    // but in modern browsers, print() allows "Save as PDF"
    // For a real programmatic download, we'd use jspdf/html2canvas, 
    // but since they aren't installed, we will use a dedicated print-to-pdf style trigger
    window.print();
  };

  return (
    <div>
      <style>{`
        @media print {
          body * { visibility: hidden; }
          .invoice-printable, .invoice-printable * { visibility: visible; }
          .invoice-printable { position: absolute; left: 0; top: 0; width: 100%; }
          .btn-print { display: none !important; }
        }
      `}</style>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div className="flex-responsive" style={{ gap: '1rem' }}>
          <div>
            <h1>Offline Payments & Billing</h1>
            <p className="text-muted">Track cash collections and manual membership payments.</p>
          </div>
        </div>
      </div>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-info">
            <h3 style={{ fontSize: '0.9rem' }}>Total Revenue</h3>
            <p className="stat-value" style={{ fontSize: '1.5rem' }}>₹{stats.total.toLocaleString()}</p>
            <p className="stat-trend trend-up" style={{ fontSize: '0.75rem' }}>
              <ArrowUpRight size={12} />
              Confirmed cash
            </p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--clr-success)', width: '40px', height: '40px' }}>
            <IndianRupee size={20} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3 style={{ fontSize: '0.9rem' }}>Pending Dues</h3>
            <p className="stat-value" style={{ fontSize: '1.5rem' }}>₹{stats.pending.toLocaleString()}</p>
            <p className="stat-trend trend-down" style={{ fontSize: '0.75rem' }}>
              <ArrowDownLeft size={12} />
              {stats.pendingCount} members
            </p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--clr-warning)', width: '40px', height: '40px' }}>
            <CreditCard size={20} />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div className="flex-responsive" style={{ marginBottom: '1.5rem', gap: '1rem' }}>
          <div className="flex-responsive" style={{ gap: '0.75rem', justifyContent: 'flex-start', width: '100%', maxWidth: '500px' }}>
            <div className="search-bar" style={{ flex: 1, minWidth: '150px', background: 'var(--clr-bg-base)', padding: '0.4rem 1rem' }}>
              <Search size={16} className="text-muted" />
              <input placeholder="Search transactions..." style={{ fontSize: '0.85rem' }} />
            </div>
            <button className="btn btn-secondary" style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', flexShrink: 0 }}>
              <Filter size={16} />
              Filter
            </button>
          </div>
        </div>

        <div className="table-container hide-on-mobile" style={{ margin: 0, borderRadius: '12px', border: '1px solid var(--clr-glass-border)' }}>
          <table className="data-table" style={{ fontSize: '0.85rem' }}>
            <thead>
              <tr>
                <th style={{ padding: '0.75rem 1rem' }}>Invoice #</th>
                <th style={{ padding: '0.75rem 1rem' }}>Member</th>
                <th style={{ padding: '0.75rem 1rem' }}>Plan</th>
                <th style={{ padding: '0.75rem 1rem' }}>Amount</th>
                <th style={{ padding: '0.75rem 1rem' }}>Date</th>
                <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                <th style={{ padding: '0.75rem 1rem' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}><div className="spinner" style={{ margin: '0 auto' }}></div></td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: '3rem' }}><p className="text-muted">No transactions recorded.</p></td></tr>
              ) : payments.map((p) => (
                <tr key={p._id}>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--clr-primary)', fontSize: '0.8rem' }}>
                      {p.invoiceNumber}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ width: '28px', height: '28px', fontSize: '0.7rem', flexShrink: 0 }}>
                        {(p.member?.user?.name || 'U').charAt(0)}
                      </div>
                      <span style={{ fontWeight: '600', whiteSpace: 'nowrap' }}>{p.member?.user?.name || 'Unknown Member'}</span>
                    </div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className="status-badge active" style={{ background: 'rgba(var(--clr-primary-rgb), 0.1)', color: 'var(--clr-primary)', fontSize: '0.75rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }}>
                      {p.plan?.name || 'Manual Payment'}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ fontWeight: '700' }}>₹{(p.amount || 0).toLocaleString()}</div>
                    <div style={{ fontSize: '0.65rem', color: 'var(--clr-text-muted)', textTransform: 'capitalize' }}>{p.method}</div>
                  </td>
                  <td style={{ padding: '0.75rem 1rem', whiteSpace: 'nowrap' }}>{new Date(p.date || p.createdAt).toLocaleDateString()}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <button 
                      onClick={() => handleStatusChange(p._id, p.status)}
                      className={`status-badge ${p.status === 'paid' ? 'active' : 'pending'}`}
                      style={{ border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }}
                      title={`Click to mark as ${p.status === 'paid' ? 'unpaid' : 'paid'}`}
                    >
                      {p.status === 'paid' ? <CheckCircle size={10} style={{ marginRight: '4px' }} /> : <XCircle size={10} style={{ marginRight: '4px' }} />}
                      {p.status}
                    </button>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-icon" style={{ width: '28px', height: '28px' }} onClick={() => handleDownloadInvoice(p._id)} title="Download Invoice">
                        <FileText size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Mobile Cards View */}
        <div className="mobile-cards-container">
          {loading ? (
            <div className="text-center" style={{ padding: '2rem' }}>
              <div className="spinner" style={{ margin: '0 auto' }}></div>
            </div>
          ) : payments.length > 0 ? (
            payments.map((p) => {
              const isExpanded = expandedCardId === p._id;
              return (
                <div 
                  key={p._id} 
                  className={`mobile-card ${isExpanded ? 'expanded' : ''}`}
                  onClick={() => setExpandedCardId(isExpanded ? null : p._id)}
                  style={{ cursor: 'pointer', transition: 'all 0.3s ease' }}
                >
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Invoice</span>
                    <span className="mobile-card-value" style={{ fontFamily: 'monospace', fontWeight: '600', color: 'var(--clr-primary)' }}>
                      {p.invoiceNumber}
                    </span>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Member</span>
                    <div className="mobile-card-value" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <div className="avatar" style={{ width: '24px', height: '24px', fontSize: '0.65rem' }}>
                        {(p.member?.user?.name || 'U').charAt(0)}
                      </div>
                      <span>{p.member?.user?.name || 'Unknown'}</span>
                    </div>
                  </div>
                  <div className="mobile-card-row">
                    <span className="mobile-card-label">Amount</span>
                    <div className="mobile-card-value">
                      <div style={{ fontWeight: '700' }}>₹{(p.amount || 0).toLocaleString()}</div>
                    </div>
                  </div>

                  {isExpanded && (
                    <div style={{ marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', borderTop: '1px solid var(--clr-glass-border)', paddingTop: '0.85rem' }}>
                      <div className="mobile-card-row">
                        <span className="mobile-card-label">Plan</span>
                        <span className="mobile-card-value">{p.plan?.name || 'Manual'}</span>
                      </div>
                      <div className="mobile-card-row">
                        <span className="mobile-card-label">Date</span>
                        <span className="mobile-card-value">{new Date(p.date || p.createdAt).toLocaleDateString()}</span>
                      </div>
                      <div className="mobile-card-row">
                        <span className="mobile-card-label">Method</span>
                        <span className="mobile-card-value" style={{ textTransform: 'capitalize' }}>{p.method}</span>
                      </div>
                      <div className="mobile-card-row">
                        <span className="mobile-card-label">Status</span>
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleStatusChange(p._id, p.status);
                          }}
                          className={`status-badge ${p.status === 'paid' ? 'active' : 'pending'}`}
                          style={{ border: 'none', cursor: 'pointer', fontSize: '0.7rem' }}
                        >
                          {p.status}
                        </button>
                      </div>
                      <div style={{ marginTop: '0.5rem' }}>
                        <button 
                          className="btn btn-secondary w-full" 
                          style={{ fontSize: '0.8rem', padding: '0.4rem' }} 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDownloadInvoice(p._id);
                          }}
                        >
                          <FileText size={14} /> View Invoice
                        </button>
                      </div>
                    </div>
                  )}
                  
                  {!isExpanded && (
                    <div style={{ textAlign: 'center', marginTop: '0.5rem' }}>
                      <span style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                        Click for more details <ArrowDownLeft size={10} style={{ transform: 'rotate(-45deg)' }} />
                      </span>
                    </div>
                  )}
                </div>
              );
            })
          ) : (
            <p className="text-center text-muted" style={{ padding: '2rem' }}>No transactions found.</p>
          )}
        </div>
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
