import React, { useEffect, useState } from 'react';
import { Check, X, Plus, Trash2, Edit2, Save } from 'lucide-react';
import { getPlans, createPlan, deletePlan } from '../features/plans/plans.api';
import Modal from '../components/Modal';

const PlansPage: React.FC = () => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', monthlyPrice: 0, yearlyPrice: 0, features: [] as string[] });
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

  const handleAddPlan = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createPlan(formData);
      setIsModalOpen(false);
      setFormData({ name: '', monthlyPrice: 0, yearlyPrice: 0, features: [] });
      fetchPlans();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create plan');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this plan?')) return;
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
    <div className="text-center">
      <div className="page-header" style={{ marginBottom: '3rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Membership Plans</h1>
            <p className="text-muted">Manage and configure subscription tiers.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Add Plan
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Plan">
        <form onSubmit={handleAddPlan}>
          <div className="form-group">
            <label className="form-label">Plan Name</label>
            <input 
              className="form-input" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Pro Monthly"
            />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Monthly Price (₹)</label>
              <input 
                className="form-input" 
                type="number"
                required 
                value={formData.monthlyPrice}
                onChange={e => setFormData({...formData, monthlyPrice: Number(e.target.value)})}
              />
            </div>
            <div className="form-group">
              <label className="form-label">Yearly Price (₹)</label>
              <input 
                className="form-input" 
                type="number"
                required 
                value={formData.yearlyPrice}
                onChange={e => setFormData({...formData, yearlyPrice: Number(e.target.value)})}
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Features</label>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input 
                className="form-input" 
                value={featureInput}
                onChange={e => setFeatureInput(e.target.value)}
                placeholder="Add a feature..."
              />
              <button type="button" className="btn btn-secondary" onClick={addFeature}>Add</button>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {formData.features.map((f, i) => (
                <span key={i} className="status-badge active" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  {f}
                  <X size={12} style={{ cursor: 'pointer' }} onClick={() => removeFeature(i)} />
                </span>
              ))}
            </div>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-primary w-full" type="submit" disabled={isSaving}>
              <Save size={18} />
              {isSaving ? 'Creating...' : 'Create Plan'}
            </button>
          </div>
        </form>
      </Modal>

      <div style={{ 
        display: 'inline-flex', 
        background: 'var(--clr-bg-card)', 
        padding: '0.4rem', 
        borderRadius: '100px', 
        border: '1px solid var(--clr-glass-border)',
        marginBottom: '3rem'
      }}>
        <button 
          onClick={() => setBillingCycle('monthly')}
          className={`btn ${billingCycle === 'monthly' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '100px', padding: '0.5rem 1.5rem' }}
        >
          Monthly
        </button>
        <button 
          onClick={() => setBillingCycle('yearly')}
          className={`btn ${billingCycle === 'yearly' ? 'btn-primary' : 'btn-secondary'}`}
          style={{ borderRadius: '100px', padding: '0.5rem 1.5rem' }}
        >
          Yearly <span style={{ fontSize: '0.7rem', opacity: 0.8, marginLeft: '0.4rem' }}>Save 20%</span>
        </button>
      </div>

      <div className="grid-cards" style={{ alignItems: 'center' }}>
        {plans.map((plan, i) => (
          <div key={plan._id} className={`glass-card ${plan.popular ? 'popular-card' : ''}`} style={{ 
            padding: '2.5rem',
            border: plan.popular ? '2px solid var(--clr-primary)' : '1px solid var(--clr-glass-border)',
            transform: plan.popular ? 'scale(1.05)' : 'none',
            zIndex: plan.popular ? 2 : 1
          }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn-icon danger" onClick={() => handleDelete(plan._id)}>
                <Trash2 size={14} />
              </button>
            </div>
            {plan.popular && (
              <div style={{ 
                position: 'absolute', 
                top: '0', 
                left: '50%', 
                transform: 'translate(-50%, -50%)',
                background: 'var(--clr-primary)',
                color: 'white',
                padding: '0.4rem 1rem',
                borderRadius: '100px',
                fontSize: '0.75rem',
                fontWeight: '700',
                textTransform: 'uppercase'
              }}>
                Most Popular
              </div>
            )}
            <h3 style={{ fontSize: '1.25rem', color: plan.popular ? 'var(--clr-primary)' : 'var(--clr-text-muted)', marginBottom: '1.5rem' }}>{plan.name}</h3>
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ fontSize: '2.5rem', fontWeight: '800' }}>
                ₹{((billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice) || 0).toLocaleString()}
              </span>
              <span className="text-muted">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
            </div>

            <div style={{ textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '2.5rem' }}>
              {(plan.features || []).map((feature: string, idx: number) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <Check size={18} className="text-success" />
                  <span style={{ fontSize: '0.9rem' }}>{feature}</span>
                </div>
              ))}
            </div>

            <button className={`btn ${plan.popular ? 'btn-primary' : 'btn-secondary'} w-full`}>
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PlansPage;
