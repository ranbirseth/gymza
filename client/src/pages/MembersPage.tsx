import React, { useEffect, useState } from 'react';
import { Users, Search, Plus, Filter, MoreVertical, Edit2, Trash2, Shield, Calendar, CreditCard, ChevronRight, Zap, RefreshCw, AlertCircle, Snowflake, PlayCircle } from 'lucide-react';
import { getMembers, createMember, deleteMember, assignPlan, renewPlan, cancelPlan, freezePlan, resumePlan, approveMember, updateMember } from '../features/members/members.api';
import { getPlans } from '../features/plans/plans.api';
import { recordPayment } from '../features/payments/payments.api';
import { useDebounce } from '../hooks/useDebounce';
import Modal from '../components/Modal';

const MembersPage: React.FC = () => {
  const [members, setMembers] = useState<any[]>([]);
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubModalOpen, setIsSubModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [formData, setFormData] = useState({ 
    name: '', 
    email: '', 
    phone: '', 
    password: 'Password123',
    planId: '',
    branchCode: 'MAIN'
  });
  const [subFormData, setSubFormData] = useState({
    planId: '',
    amount: 0,
    note: '',
    recordPayment: true
  });

  const fetchMembers = async (search = '') => {
    setLoading(true);
    try {
      const res = await getMembers({ search, limit: 100 });
      setMembers(res.data?.data?.items || []);
    } catch (error) {
      console.error('Failed to fetch members', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchPlans = async () => {
    try {
      const res = await getPlans();
      const planData = res.data?.data;
      setPlans(Array.isArray(planData) ? planData : (planData?.items || []));
    } catch (error) {
      console.error('Failed to fetch plans', error);
      setPlans([]);
    }
  };

  useEffect(() => {
    fetchMembers(debouncedSearch);
  }, [debouncedSearch]);

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleCreateMember = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMember(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: 'Password123', planId: '', branchCode: 'MAIN' });
      fetchMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create member');
    }
  };

  const handleOpenSubscription = (member: any) => {
    setSelectedMember(member);
    setSubFormData({
      planId: member.currentPlan?._id || '',
      amount: member.currentPlan?.price || 0,
      note: '',
      recordPayment: true
    });
    setIsSubModalOpen(true);
  };

  const handleSubscriptionAction = async (action: 'assign' | 'renew' | 'cancel' | 'freeze' | 'resume') => {
    if (!selectedMember) return;
    try {
      if (action === 'cancel') {
        if (window.confirm('Are you sure you want to cancel this subscription?')) {
          await cancelPlan(selectedMember._id);
        } else return;
      } else if (action === 'freeze') {
        if (window.confirm('Freeze this plan? Membership will be paused.')) {
          await freezePlan(selectedMember._id);
        } else return;
      } else if (action === 'resume') {
        await resumePlan(selectedMember._id);
      } else {
        // Assign or Renew
        if (action === 'assign') {
          await assignPlan(selectedMember._id, { planId: subFormData.planId });
        } else {
          await renewPlan(selectedMember._id, { planId: subFormData.planId });
        }

        // Record payment (Paid or Pending)
        await recordPayment({
          member: selectedMember._id,
          plan: subFormData.planId,
          amount: subFormData.amount,
          method: 'cash',
          status: subFormData.recordPayment ? 'paid' : 'pending',
          note: subFormData.note
        });
      }
      setIsSubModalOpen(false);
      fetchMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Action failed');
    }
  };

  const handleApprove = async (id: string) => {
    if (!window.confirm('Approve this member? They will be moved to active status.')) return;
    try {
      await approveMember(id);
      fetchMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Approval failed');
    }
  };

  const handleDiscard = async (id: string) => {
    if (!window.confirm('Discard this membership request? The member will be notified.')) return;
    try {
      await updateMember(id, { status: 'inactive' });
      fetchMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Discard failed');
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm('Are you sure you want to PERMANENTLY delete this member and ALL their associated data (payments, attendance, progress)? This action cannot be undone.')) return;
    try {
      await deleteMember(id);
      fetchMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Deletion failed');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-success bg-success-light';
      case 'expired': return 'text-danger bg-danger-light';
      case 'pending': return 'text-warning bg-warning-light';
      case 'cancelled': return 'text-muted bg-glass';
      default: return 'text-muted bg-glass';
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Members Management</h1>
            <p className="text-muted">Manage member subscriptions, plans, and offline payments.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Add Member
          </button>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.25rem', marginBottom: '2rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
        <div className="search-bar" style={{ flex: 1, minWidth: '300px' }}>
          <Search size={18} className="text-muted" />
          <input 
            placeholder="Search members by name, email or phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <button className="btn btn-secondary">
          <Filter size={18} />
          Filters
        </button>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Member">
        <form onSubmit={handleCreateMember}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input className="form-input" type="tel" required value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input className="form-input" type="password" required value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})} />
          </div>
          <div className="form-group">
            <label className="form-label">Initial Plan (Optional)</label>
            <select className="form-input" value={formData.planId} onChange={e => setFormData({...formData, planId: e.target.value})}>
              <option value="">Select a plan</option>
              {plans.map(p => <option key={p._id} value={p._id}>{p.name} - ₹{p.price}</option>)}
            </select>
          </div>
          <button className="btn btn-primary w-full" type="submit">Create Member</button>
        </form>
      </Modal>

      <Modal isOpen={isSubModalOpen} onClose={() => setIsSubModalOpen(false)} title="Subscription Management">
        {selectedMember && (
          <div>
            <div className="glass-panel" style={{ marginBottom: '1.5rem', padding: '1rem' }}>
              <p>Member: <strong>{selectedMember.user?.name}</strong></p>
              <p>Current Status: <span className={`status-badge ${selectedMember.status}`}>{selectedMember.status}</span></p>
              <p>Payment: <span className={`status-badge ${selectedMember.paymentStatus === 'paid' ? 'active' : 'pending'}`}>{selectedMember.paymentStatus}</span></p>
            </div>

            <div className="form-group">
              <label className="form-label">Select Plan</label>
              <select className="form-input" value={subFormData.planId} onChange={e => {
                const plan = plans.find(p => p._id === e.target.value);
                setSubFormData({...subFormData, planId: e.target.value, amount: plan?.price || 0});
              }}>
                <option value="">Select a plan</option>
                {plans.map(p => <option key={p._id} value={p._id}>{p.name} - ₹{p.price} ({p.duration} days)</option>)}
              </select>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Amount (₹)</label>
                <input className="form-input" type="number" value={subFormData.amount} onChange={e => setSubFormData({...subFormData, amount: Number(e.target.value)})} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', paddingTop: '1.5rem' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                  <input type="checkbox" checked={subFormData.recordPayment} onChange={e => setSubFormData({...subFormData, recordPayment: e.target.checked})} />
                  Mark as Paid (Cash)
                </label>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Payment Note (Optional)</label>
              <input className="form-input" value={subFormData.note} onChange={e => setSubFormData({...subFormData, note: e.target.value})} placeholder="e.g. Received cash at counter" />
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '2rem', flexWrap: 'wrap' }}>
              {!selectedMember.currentPlan ? (
                <button className="btn btn-primary flex-1" onClick={() => handleSubscriptionAction('assign')}>
                  <Zap size={18} /> Assign Plan
                </button>
              ) : (
                <>
                  {selectedMember.status === 'frozen' ? (
                    <button className="btn btn-primary flex-1" onClick={() => handleSubscriptionAction('resume')}>
                      <PlayCircle size={18} /> Resume Plan
                    </button>
                  ) : (
                    <button className="btn btn-primary flex-1" onClick={() => handleSubscriptionAction('renew')}>
                      <RefreshCw size={18} /> Renew/Upgrade
                    </button>
                  )}
                  
                  {selectedMember.status === 'active' && (
                    <button className="btn btn-secondary" onClick={() => handleSubscriptionAction('freeze')}>
                      <Snowflake size={18} /> Freeze
                    </button>
                  )}
                  
                  <button className="btn btn-secondary" onClick={() => handleSubscriptionAction('cancel')} style={{ color: 'var(--clr-danger)' }}>
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </Modal>

      {loading ? (
        <div className="loading-state"><div className="spinner"></div></div>
      ) : (
        <div className="grid-cards">
          {members.map((member) => (
            <div key={member._id} className="glass-card member-card" style={{ padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div className="avatar">{member.user?.name?.charAt(0)}</div>
                <div style={{ textAlign: 'right' }}>
                  <span className={`status-badge ${member.status}`}>{member.status}</span>
                  <div className={`text-muted`} style={{ fontSize: '0.7rem', marginTop: '0.25rem' }}>
                    Payment: <span style={{ color: member.paymentStatus === 'paid' ? 'var(--clr-success)' : 'var(--clr-warning)' }}>{member.paymentStatus}</span>
                  </div>
                </div>
              </div>
              
              <h3 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{member.user?.name}</h3>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '0.25rem' }}>{member.user?.email}</p>
              <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem', fontWeight: 600 }}>ID: {member.secretCode}</p>
              
              <div className="glass-panel" style={{ padding: '0.75rem', marginBottom: '1.5rem', background: 'rgba(255,255,255,0.03)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                  <Zap size={14} className="text-primary" />
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{member.currentPlan?.name || 'No Plan'}</span>
                </div>
                {member.membershipExpiryDate && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.75rem' }} className="text-muted">
                    <Calendar size={12} />
                    <span>Expires: {new Date(member.membershipExpiryDate).toLocaleDateString()}</span>
                  </div>
                )}
              </div>

              <div style={{ display: 'flex', gap: '0.5rem' }}>
                {member.status === 'pending' ? (
                  <>
                    <button className="btn btn-primary flex-1" onClick={() => handleApprove(member._id)} style={{ fontSize: '0.85rem', padding: '0.5rem' }}>
                      <Shield size={14} /> Approve
                    </button>
                  </>
                ) : (
                  <button className="btn btn-secondary flex-1" onClick={() => handleOpenSubscription(member)} style={{ fontSize: '0.85rem', padding: '0.5rem' }}>
                    <CreditCard size={14} /> Subscription
                  </button>
                )}
                <button className="btn-icon" onClick={() => handleDeleteMember(member._id)} style={{ color: 'var(--clr-danger)' }} title="Delete Member Permanently">
                  <Trash2 size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MembersPage;
