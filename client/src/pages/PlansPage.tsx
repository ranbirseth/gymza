import React, { useEffect, useState } from 'react';
import { Check, X, Plus, Trash2, Edit2, Save, IndianRupee, Clock, Zap } from 'lucide-react';
import { getPlans, createPlan, deletePlan, updatePlan } from '../features/plans/plans.api';
import Modal from '../components/Modal';

const PlansPage: React.FC = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', price: 0, duration: 30, features: [] as string[] });
  const [featureInput, setFeatureInput] = useState('');

  const fetchPlans = async () => {
    setLoading(true);
    try {
      const res = await getPlans();
      const planData = res.data?.data;
      setPlans(Array.isArray(planData) ? planData : (planData?.items || []));
    } catch (error) {
      console.error('Failed to fetch plans', error);
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ name: '', price: 0, duration: 30, features: [] });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (plan: any) => {
    setEditingId(plan._id);
    setFormData({
      name: plan.name,
      price: plan.price,
      duration: plan.duration,
      features: plan.features || []
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        await updatePlan(editingId, formData);
      } else {
        await createPlan(formData);
      }
      setIsModalOpen(false);
      fetchPlans();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan? This cannot be undone if members are using it.')) return;
    try {
      await deletePlan(id);
      fetchPlans();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete plan');
    }
  };

  const addFeature = () => {
    if (!featureInput.trim()) return;
    setFormData({ ...formData, features: [...formData.features, featureInput.trim()] });
    setFeatureInput('');
  };

  const removeFeature = (index: number) => {
    setFormData({ ...formData, features: formData.features.filter((_, i) => i !== index) });
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Membership Plans</h1>
            <p className="text-muted">Create and manage gym subscription plans.</p>
          </div>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            Add New Plan
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingId ? "Edit Plan" : "Add New Plan"}>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">Plan Name</label>
            <input 
              className="form-input" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Basic Monthly, Pro Yearly"
            />
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Price (₹)</label>
              <div style={{ position: 'relative' }}>
                <IndianRupee size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }} />
                <input 
                  className="form-input" 
                  style={{ paddingLeft: '35px' }}
                  type="number"
                  required 
                  min="0"
                  value={formData.price}
                  onChange={e => setFormData({...formData, price: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Duration (Days)</label>
              <div style={{ position: 'relative' }}>
                <Clock size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }} />
                <input 
                  className="form-input" 
                  style={{ paddingLeft: '35px' }}
                  type="number"
                  required 
                  min="1"
                  value={formData.duration}
                  onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Plan Features</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                className="form-input" 
                value={featureInput}
                onChange={e => setFeatureInput(e.target.value)}
                placeholder="Add a feature (e.g. Personal Trainer)..."
                onKeyPress={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
              />
              <button type="button" className="btn btn-secondary" onClick={addFeature}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.features.map((f, i) => (
                <span key={i} className="status-badge active" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 0.8rem' }}>
                  {f}
                  <X size={14} style={{ cursor: 'pointer', opacity: 0.7 }} onClick={() => removeFeature(i)} />
                </span>
              ))}
            </div>
          </div>

          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-primary w-full" type="submit" disabled={isSaving}>
              <Save size={18} />
              {isSaving ? 'Saving...' : (editingId ? 'Update Plan' : 'Create Plan')}
            </button>
          </div>
        </form>
      </Modal>

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center' }}>
          <div className="spinner"></div>
          <p className="text-muted" style={{ marginTop: '1rem' }}>Loading plans...</p>
        </div>
      ) : (
        <div className="grid-cards">
          {plans.map((plan) => (
            <div key={plan._id} className="glass-card" style={{ 
              padding: '2.5rem',
              position: 'relative',
              textAlign: 'center'
            }}>
              <div style={{ position: 'absolute', top: '1.25rem', right: '1.25rem', display: 'flex', gap: '0.5rem' }}>
                <button className="btn-icon" onClick={() => handleOpenEdit(plan)} title="Edit">
                  <Edit2 size={14} />
                </button>
                <button className="btn-icon danger" onClick={() => handleDelete(plan._id)} title="Delete">
                  <Trash2 size={14} />
                </button>
              </div>

              <div style={{ 
                display: 'inline-flex', 
                padding: '0.75rem', 
                borderRadius: '16px', 
                background: 'rgba(var(--clr-primary-rgb), 0.1)', 
                color: 'var(--clr-primary)',
                marginBottom: '1.5rem'
              }}>
                <Zap size={24} fill="currentColor" />
              </div>

              <h3 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{plan.name}</h3>
              <p className="text-muted" style={{ fontSize: '0.9rem', marginBottom: '1.5rem' }}>
                Valid for {plan.duration} days
              </p>

              <div style={{ marginBottom: '2rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: '800', color: 'var(--clr-primary)' }}>
                  ₹{plan.price.toLocaleString()}
                </span>
              </div>

              <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem', minHeight: '150px' }}>
                {(plan.features || []).map((feature: string, idx: number) => (
                  <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: 'rgba(34, 197, 94, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} className="text-success" />
                    </div>
                    <span style={{ fontSize: '0.9rem' }}>{feature}</span>
                  </div>
                ))}
                {(!plan.features || plan.features.length === 0) && (
                  <p className="text-muted" style={{ fontSize: '0.85rem', fontStyle: 'italic' }}>No specific features listed</p>
                )}
              </div>

              <button className="btn btn-secondary w-full" style={{ justifyContent: 'center' }}>
                Assign to Member
              </button>
            </div>
          ))}
        </div>
      )}

      {!loading && plans.length === 0 && (
        <div className="glass-panel text-center" style={{ padding: '5rem' }}>
          <Zap size={48} className="text-muted" style={{ marginBottom: '1.5rem', opacity: 0.3 }} />
          <h3>No plans created yet</h3>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Get started by creating your first membership plan.</p>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={18} />
            Add First Plan
          </button>
        </div>
      )}
    </div>
  );
};

export default PlansPage;
