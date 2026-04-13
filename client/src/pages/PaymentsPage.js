import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { getPayments, markAsPaid, markAsUnpaid, getInvoice } from '../features/payments/payments.api';
import { CreditCard, IndianRupee, Download, Search, Filter, ArrowUpRight, ArrowDownLeft, CheckCircle, XCircle, FileText, Printer } from 'lucide-react';
import Modal from '../components/Modal';
const PaymentsPage = () => {
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, pending: 0, pendingCount: 0 });
    const [expandedCardId, setExpandedCardId] = useState(null);
    // Invoice Modal State
    const [isInvoiceModalOpen, setIsInvoiceModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState(null);
    const [fetchingInvoice, setFetchingInvoice] = useState(false);
    const fetchPayments = async () => {
        setLoading(true);
        try {
            const res = await getPayments();
            const data = res.data?.data;
            const items = Array.isArray(data) ? data : (data?.items || []);
            setPayments(items);
            // Calculate simple stats
            const total = items.filter((p) => p.status === 'paid').reduce((acc, p) => acc + p.amount, 0);
            const pending = items.filter((p) => p.status === 'pending').reduce((acc, p) => acc + p.amount, 0);
            const pendingCount = items.filter((p) => p.status === 'pending').length;
            setStats({ total, pending, pendingCount });
        }
        catch (error) {
            console.error('Failed to fetch payments', error);
            setPayments([]);
        }
        finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchPayments();
    }, []);
    const handleStatusChange = async (id, currentStatus) => {
        try {
            if (currentStatus === 'paid') {
                await markAsUnpaid(id);
            }
            else {
                await markAsPaid(id);
            }
            fetchPayments();
        }
        catch (error) {
            alert(error.response?.data?.message || 'Status update failed');
        }
    };
    const handleDownloadInvoice = async (id) => {
        setFetchingInvoice(true);
        try {
            const res = await getInvoice(id);
            setSelectedInvoice(res.data.data);
            setIsInvoiceModalOpen(true);
        }
        catch (error) {
            alert("Failed to fetch invoice data");
        }
        finally {
            setFetchingInvoice(false);
        }
    };
    const handlePrint = () => {
        window.print();
    };
    const handleDownloadPDF = () => {
        const element = document.querySelector('.invoice-printable');
        if (!element)
            return;
        // A simple way to "download" as PDF is to trigger print 
        // but in modern browsers, print() allows "Save as PDF"
        // For a real programmatic download, we'd use jspdf/html2canvas, 
        // but since they aren't installed, we will use a dedicated print-to-pdf style trigger
        window.print();
    };
    return (_jsxs("div", { children: [_jsx("style", { children: `
        @media print {
          body * { visibility: hidden; }
          .invoice-printable, .invoice-printable * { visibility: visible; }
          .invoice-printable { position: absolute; left: 0; top: 0; width: 100%; }
          .btn-print { display: none !important; }
        }
      ` }), _jsx("div", { className: "page-header", style: { marginBottom: '2rem' }, children: _jsx("div", { className: "flex-responsive", style: { gap: '1rem' }, children: _jsxs("div", { children: [_jsx("h1", { children: "Offline Payments & Billing" }), _jsx("p", { className: "text-muted", children: "Track cash collections and manual membership payments." })] }) }) }), _jsxs("div", { className: "grid-stats", children: [_jsxs("div", { className: "stat-card", children: [_jsxs("div", { className: "stat-info", children: [_jsx("h3", { style: { fontSize: '0.9rem' }, children: "Total Revenue" }), _jsxs("p", { className: "stat-value", style: { fontSize: '1.5rem' }, children: ["\u20B9", stats.total.toLocaleString()] }), _jsxs("p", { className: "stat-trend trend-up", style: { fontSize: '0.75rem' }, children: [_jsx(ArrowUpRight, { size: 12 }), "Confirmed cash"] })] }), _jsx("div", { className: "stat-icon", style: { background: 'rgba(16, 185, 129, 0.1)', color: 'var(--clr-success)', width: '40px', height: '40px' }, children: _jsx(IndianRupee, { size: 20 }) })] }), _jsxs("div", { className: "stat-card", children: [_jsxs("div", { className: "stat-info", children: [_jsx("h3", { style: { fontSize: '0.9rem' }, children: "Pending Dues" }), _jsxs("p", { className: "stat-value", style: { fontSize: '1.5rem' }, children: ["\u20B9", stats.pending.toLocaleString()] }), _jsxs("p", { className: "stat-trend trend-down", style: { fontSize: '0.75rem' }, children: [_jsx(ArrowDownLeft, { size: 12 }), stats.pendingCount, " members"] })] }), _jsx("div", { className: "stat-icon", style: { background: 'rgba(245, 158, 11, 0.1)', color: 'var(--clr-warning)', width: '40px', height: '40px' }, children: _jsx(CreditCard, { size: 20 }) })] })] }), _jsxs("div", { className: "glass-panel", style: { padding: '1.5rem', marginTop: '2rem' }, children: [_jsx("div", { className: "flex-responsive", style: { marginBottom: '1.5rem', gap: '1rem' }, children: _jsxs("div", { className: "flex-responsive", style: { gap: '0.75rem', justifyContent: 'flex-start', width: '100%', maxWidth: '500px' }, children: [_jsxs("div", { className: "search-bar", style: { flex: 1, minWidth: '150px', background: 'var(--clr-bg-base)', padding: '0.4rem 1rem' }, children: [_jsx(Search, { size: 16, className: "text-muted" }), _jsx("input", { placeholder: "Search transactions...", style: { fontSize: '0.85rem' } })] }), _jsxs("button", { className: "btn btn-secondary", style: { padding: '0.4rem 0.75rem', fontSize: '0.85rem', flexShrink: 0 }, children: [_jsx(Filter, { size: 16 }), "Filter"] })] }) }), _jsx("div", { className: "table-container hide-on-mobile", style: { margin: 0, borderRadius: '12px', border: '1px solid var(--clr-glass-border)' }, children: _jsxs("table", { className: "data-table", style: { fontSize: '0.85rem' }, children: [_jsx("thead", { children: _jsxs("tr", { children: [_jsx("th", { style: { padding: '0.75rem 1rem' }, children: "Invoice #" }), _jsx("th", { style: { padding: '0.75rem 1rem' }, children: "Member" }), _jsx("th", { style: { padding: '0.75rem 1rem' }, children: "Plan" }), _jsx("th", { style: { padding: '0.75rem 1rem' }, children: "Amount" }), _jsx("th", { style: { padding: '0.75rem 1rem' }, children: "Date" }), _jsx("th", { style: { padding: '0.75rem 1rem' }, children: "Status" }), _jsx("th", { style: { padding: '0.75rem 1rem' }, children: "Action" })] }) }), _jsx("tbody", { children: loading ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, style: { textAlign: 'center', padding: '3rem' }, children: _jsx("div", { className: "spinner", style: { margin: '0 auto' } }) }) })) : payments.length === 0 ? (_jsx("tr", { children: _jsx("td", { colSpan: 7, style: { textAlign: 'center', padding: '3rem' }, children: _jsx("p", { className: "text-muted", children: "No transactions recorded." }) }) })) : payments.map((p) => (_jsxs("tr", { children: [_jsx("td", { style: { padding: '0.75rem 1rem' }, children: _jsx("span", { style: { fontFamily: 'monospace', fontWeight: '600', color: 'var(--clr-primary)', fontSize: '0.8rem' }, children: p.invoiceNumber }) }), _jsx("td", { style: { padding: '0.75rem 1rem' }, children: _jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.75rem' }, children: [_jsx("div", { className: "avatar", style: { width: '28px', height: '28px', fontSize: '0.7rem', flexShrink: 0 }, children: (p.member?.user?.name || 'U').charAt(0) }), _jsx("span", { style: { fontWeight: '600', whiteSpace: 'nowrap' }, children: p.member?.user?.name || 'Unknown Member' })] }) }), _jsx("td", { style: { padding: '0.75rem 1rem' }, children: _jsx("span", { className: "status-badge active", style: { background: 'rgba(var(--clr-primary-rgb), 0.1)', color: 'var(--clr-primary)', fontSize: '0.75rem', padding: '0.2rem 0.5rem', whiteSpace: 'nowrap' }, children: p.plan?.name || 'Manual Payment' }) }), _jsxs("td", { style: { padding: '0.75rem 1rem' }, children: [_jsxs("div", { style: { fontWeight: '700' }, children: ["\u20B9", (p.amount || 0).toLocaleString()] }), _jsx("div", { style: { fontSize: '0.65rem', color: 'var(--clr-text-muted)', textTransform: 'capitalize' }, children: p.method })] }), _jsx("td", { style: { padding: '0.75rem 1rem', whiteSpace: 'nowrap' }, children: new Date(p.date || p.createdAt).toLocaleDateString() }), _jsx("td", { style: { padding: '0.75rem 1rem' }, children: _jsxs("button", { onClick: () => handleStatusChange(p._id, p.status), className: `status-badge ${p.status === 'paid' ? 'active' : 'pending'}`, style: { border: 'none', cursor: 'pointer', transition: 'all 0.2s', fontSize: '0.75rem', padding: '0.2rem 0.6rem' }, title: `Click to mark as ${p.status === 'paid' ? 'unpaid' : 'paid'}`, children: [p.status === 'paid' ? _jsx(CheckCircle, { size: 10, style: { marginRight: '4px' } }) : _jsx(XCircle, { size: 10, style: { marginRight: '4px' } }), p.status] }) }), _jsx("td", { style: { padding: '0.75rem 1rem' }, children: _jsx("div", { style: { display: 'flex', gap: '0.5rem' }, children: _jsx("button", { className: "btn-icon", style: { width: '28px', height: '28px' }, onClick: () => handleDownloadInvoice(p._id), title: "Download Invoice", children: _jsx(FileText, { size: 14 }) }) }) })] }, p._id))) })] }) }), _jsx("div", { className: "mobile-cards-container", children: loading ? (_jsx("div", { className: "text-center", style: { padding: '2rem' }, children: _jsx("div", { className: "spinner", style: { margin: '0 auto' } }) })) : payments.length > 0 ? (payments.map((p) => {
                            const isExpanded = expandedCardId === p._id;
                            return (_jsxs("div", { className: `mobile-card ${isExpanded ? 'expanded' : ''}`, onClick: () => setExpandedCardId(isExpanded ? null : p._id), style: { cursor: 'pointer', transition: 'all 0.3s ease' }, children: [_jsxs("div", { className: "mobile-card-row", children: [_jsx("span", { className: "mobile-card-label", children: "Invoice" }), _jsx("span", { className: "mobile-card-value", style: { fontFamily: 'monospace', fontWeight: '600', color: 'var(--clr-primary)' }, children: p.invoiceNumber })] }), _jsxs("div", { className: "mobile-card-row", children: [_jsx("span", { className: "mobile-card-label", children: "Member" }), _jsxs("div", { className: "mobile-card-value", style: { display: 'flex', alignItems: 'center', gap: '0.5rem' }, children: [_jsx("div", { className: "avatar", style: { width: '24px', height: '24px', fontSize: '0.65rem' }, children: (p.member?.user?.name || 'U').charAt(0) }), _jsx("span", { children: p.member?.user?.name || 'Unknown' })] })] }), _jsxs("div", { className: "mobile-card-row", children: [_jsx("span", { className: "mobile-card-label", children: "Amount" }), _jsx("div", { className: "mobile-card-value", children: _jsxs("div", { style: { fontWeight: '700' }, children: ["\u20B9", (p.amount || 0).toLocaleString()] }) })] }), isExpanded && (_jsxs("div", { style: { marginTop: '0.85rem', display: 'flex', flexDirection: 'column', gap: '0.85rem', borderTop: '1px solid var(--clr-glass-border)', paddingTop: '0.85rem' }, children: [_jsxs("div", { className: "mobile-card-row", children: [_jsx("span", { className: "mobile-card-label", children: "Plan" }), _jsx("span", { className: "mobile-card-value", children: p.plan?.name || 'Manual' })] }), _jsxs("div", { className: "mobile-card-row", children: [_jsx("span", { className: "mobile-card-label", children: "Date" }), _jsx("span", { className: "mobile-card-value", children: new Date(p.date || p.createdAt).toLocaleDateString() })] }), _jsxs("div", { className: "mobile-card-row", children: [_jsx("span", { className: "mobile-card-label", children: "Method" }), _jsx("span", { className: "mobile-card-value", style: { textTransform: 'capitalize' }, children: p.method })] }), _jsxs("div", { className: "mobile-card-row", children: [_jsx("span", { className: "mobile-card-label", children: "Status" }), _jsx("button", { onClick: (e) => {
                                                            e.stopPropagation();
                                                            handleStatusChange(p._id, p.status);
                                                        }, className: `status-badge ${p.status === 'paid' ? 'active' : 'pending'}`, style: { border: 'none', cursor: 'pointer', fontSize: '0.7rem' }, children: p.status })] }), _jsx("div", { style: { marginTop: '0.5rem' }, children: _jsxs("button", { className: "btn btn-secondary w-full", style: { fontSize: '0.8rem', padding: '0.4rem' }, onClick: (e) => {
                                                        e.stopPropagation();
                                                        handleDownloadInvoice(p._id);
                                                    }, children: [_jsx(FileText, { size: 14 }), " View Invoice"] }) })] })), !isExpanded && (_jsx("div", { style: { textAlign: 'center', marginTop: '0.5rem' }, children: _jsxs("span", { style: { fontSize: '0.7rem', color: 'var(--clr-text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }, children: ["Click for more details ", _jsx(ArrowDownLeft, { size: 10, style: { transform: 'rotate(-45deg)' } })] }) }))] }, p._id));
                        })) : (_jsx("p", { className: "text-center text-muted", style: { padding: '2rem' }, children: "No transactions found." })) })] }), _jsx(Modal, { isOpen: isInvoiceModalOpen, onClose: () => setIsInvoiceModalOpen(false), title: "Payment Invoice", children: selectedInvoice && (_jsxs("div", { className: "invoice-printable", style: { padding: '1rem', color: '#1a1a1a', background: 'white', borderRadius: '8px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '2rem', borderBottom: '2px solid #eee', paddingBottom: '1rem' }, children: [_jsxs("div", { children: [_jsx("h2", { style: { color: 'var(--clr-primary)', marginBottom: '0.5rem' }, children: "GYMZA" }), _jsx("p", { style: { fontSize: '0.85rem', color: '#666' }, children: "Premium Fitness Center" })] }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsx("h3", { style: { marginBottom: '0.25rem' }, children: "INVOICE" }), _jsx("p", { style: { fontSize: '0.9rem', fontWeight: 'bold' }, children: selectedInvoice.invoiceNumber })] })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', marginBottom: '2rem' }, children: [_jsxs("div", { children: [_jsx("h4", { style: { fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }, children: "Billed To" }), _jsx("p", { style: { fontWeight: 'bold' }, children: selectedInvoice.member?.user?.name }), _jsx("p", { style: { fontSize: '0.85rem' }, children: selectedInvoice.member?.user?.email }), _jsx("p", { style: { fontSize: '0.85rem' }, children: selectedInvoice.member?.user?.phone })] }), _jsxs("div", { style: { textAlign: 'right' }, children: [_jsx("h4", { style: { fontSize: '0.75rem', textTransform: 'uppercase', color: '#888', marginBottom: '0.5rem' }, children: "Payment Details" }), _jsxs("p", { style: { fontSize: '0.85rem' }, children: ["Date: ", new Date(selectedInvoice.date).toLocaleDateString()] }), _jsxs("p", { style: { fontSize: '0.85rem' }, children: ["Method: ", _jsx("span", { style: { textTransform: 'capitalize' }, children: selectedInvoice.method })] }), _jsxs("p", { style: { fontSize: '0.85rem' }, children: ["Status: ", _jsx("span", { style: { color: selectedInvoice.status === 'paid' ? '#10b981' : '#f59e0b', fontWeight: 'bold' }, children: selectedInvoice.status.toUpperCase() })] })] })] }), _jsxs("table", { style: { width: '100%', borderCollapse: 'collapse', marginBottom: '2rem' }, children: [_jsx("thead", { children: _jsxs("tr", { style: { background: '#f8f9fa' }, children: [_jsx("th", { style: { textAlign: 'left', padding: '12px', borderBottom: '1px solid #eee' }, children: "Description" }), _jsx("th", { style: { textAlign: 'right', padding: '12px', borderBottom: '1px solid #eee' }, children: "Amount" })] }) }), _jsx("tbody", { children: _jsxs("tr", { children: [_jsxs("td", { style: { padding: '12px', borderBottom: '1px solid #eee' }, children: [_jsx("p", { style: { fontWeight: 'bold' }, children: selectedInvoice.plan?.name || 'Membership Plan' }), _jsxs("p", { style: { fontSize: '0.75rem', color: '#666' }, children: [selectedInvoice.plan?.duration, " Days Access"] })] }), _jsxs("td", { style: { textAlign: 'right', padding: '12px', borderBottom: '1px solid #eee', fontWeight: 'bold' }, children: ["\u20B9", selectedInvoice.amount.toLocaleString()] })] }) }), _jsx("tfoot", { children: _jsxs("tr", { children: [_jsx("td", { style: { padding: '12px', textAlign: 'right', fontWeight: 'bold' }, children: "Total" }), _jsxs("td", { style: { padding: '12px', textAlign: 'right', fontWeight: 'bold', fontSize: '1.2rem', color: 'var(--clr-primary)' }, children: ["\u20B9", selectedInvoice.amount.toLocaleString()] })] }) })] }), _jsxs("div", { style: { textAlign: 'center', marginTop: '3rem', borderTop: '1px solid #eee', paddingTop: '1rem' }, children: [_jsx("p", { style: { fontSize: '0.8rem', color: '#888' }, children: "Thank you for your business!" }), _jsx("p", { style: { fontSize: '0.75rem', color: '#aaa', marginTop: '0.5rem' }, children: "This is a computer-generated invoice." })] }), _jsxs("div", { className: "btn-print", style: { marginTop: '2rem', display: 'flex', gap: '1rem' }, children: [_jsxs("button", { className: "btn btn-primary flex-1", onClick: handlePrint, children: [_jsx(Printer, { size: 18 }), " Print Invoice"] }), _jsxs("button", { className: "btn btn-secondary flex-1", onClick: handleDownloadPDF, children: [_jsx(Download, { size: 18 }), " Download (PDF)"] }), _jsx("button", { className: "btn btn-secondary", onClick: () => setIsInvoiceModalOpen(false), children: "Close" })] })] })) })] }));
};
export default PaymentsPage;
