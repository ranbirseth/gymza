import React, { useEffect, useState } from 'react';
import { UserSquare2, Star, Users, Plus, Edit2, Trash2, Save } from 'lucide-react';
import { getTrainers, createTrainer, deleteTrainer } from '../features/trainers/trainers.api';
import Modal from '../components/Modal';

const TrainersPage: React.FC = () => {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ name: '', specialty: '', email: '', password: 'Password123' });

  const fetchTrainers = async () => {
    setLoading(true);
    try {
      const res = await getTrainers();
      // Ensure we are setting an array even if API returns something else
      const trainerData = res.data?.data;
      setTrainers(Array.isArray(trainerData) ? trainerData : (trainerData?.items || []));
    } catch (error) {
      console.error('Failed to fetch trainers', error);
      setTrainers([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleAddTrainer = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createTrainer(formData);
      setIsModalOpen(false);
      setFormData({ name: '', specialty: '', email: '', password: 'Password123' });
      fetchTrainers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create trainer');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this trainer?')) return;
    try {
      await deleteTrainer(id);
      fetchTrainers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete trainer');
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Trainers</h1>
            <p className="text-muted">Manage gym trainers and assignments.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Add Trainer
          </button>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add New Trainer">
        <form onSubmit={handleAddTrainer}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              className="form-input" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. Karan Johar"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input 
              className="form-input" 
              type="email" 
              required 
              value={formData.email}
              onChange={e => setFormData({...formData, email: e.target.value})}
              placeholder="karan@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Specialty</label>
            <input 
              className="form-input" 
              required 
              value={formData.specialty}
              onChange={e => setFormData({...formData, specialty: e.target.value})}
              placeholder="e.g. Weightlifting"
            />
          </div>
          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-primary w-full" type="submit" disabled={isSaving}>
              <Save size={18} />
              {isSaving ? 'Creating...' : 'Create Trainer'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="grid-cards" style={{ marginTop: '2rem' }}>
        {trainers.map((trainer) => (
          <div key={trainer._id} className="glass-card text-center" style={{ padding: '2rem' }}>
            <div style={{ position: 'absolute', top: '1rem', right: '1rem', display: 'flex', gap: '0.5rem' }}>
              <button className="btn-icon">
                <Edit2 size={12} />
              </button>
              <button className="btn-icon danger" onClick={() => handleDelete(trainer._id)}>
                <Trash2 size={12} />
              </button>
            </div>
            
            <div className="avatar" style={{ 
              width: '100px', 
              height: '100px', 
              margin: '0 auto 1.5rem', 
              fontSize: '2rem',
              boxShadow: '0 0 20px var(--clr-primary-glow)'
            }}>
              {trainer.userDoc?.name?.charAt(0) || trainer.name?.charAt(0)}
            </div>
            
            <h3 style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>{trainer.userDoc?.name || trainer.name}</h3>
            <p className="text-primary" style={{ fontSize: '0.9rem', fontWeight: '600', marginBottom: '1.5rem' }}>
              {trainer.specialty}
            </p>
            
            <div style={{ 
              display: 'flex', 
              justifyContent: 'center', 
              gap: '2.5rem', 
              padding: '1rem',
              background: 'rgba(255, 255, 255, 0.03)',
              borderRadius: '12px',
              marginBottom: '1.5rem'
            }}>
              <div>
                <p className="stat-value" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  {trainer.rating || 0} <Star size={14} fill="currentColor" />
                </p>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Rating</p>
              </div>
              <div style={{ width: '1px', background: 'var(--clr-glass-border)' }}></div>
              <div>
                <p className="stat-value" style={{ fontSize: '1.1rem' }}>{trainer.studentsCount || 0}</p>
                <p className="text-muted" style={{ fontSize: '0.75rem' }}>Students</p>
              </div>
            </div>
            
            <button className="btn btn-secondary w-full">
              <Users size={16} />
              Assign Member
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainersPage;
