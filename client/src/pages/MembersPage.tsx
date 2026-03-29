import React, { useEffect, useState } from "react";
import { getMembers, searchMembers, createMember } from "../features/members/members.api";
import { useDebounce } from "../hooks/useDebounce";
import { Search, Filter, Plus, Edit2, Trash2, Mail, Phone, Save } from "lucide-react";
import Modal from "../components/Modal";

export default function MembersPage() {
  const [query, setQuery] = useState("");
  const debouncedQuery = useDebounce(query, 350);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: 'Password123' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchMembers = () => {
    setLoading(true);
    const request = debouncedQuery ? searchMembers(debouncedQuery) : getMembers();
    request
      .then((res) => {
        setItems(res.data?.data?.items || []);
      })
      .catch(() => null)
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, [debouncedQuery]);

  const handleAddMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await createMember(formData);
      setIsModalOpen(false);
      setFormData({ name: '', email: '', phone: '', password: 'Password123' });
      fetchMembers(); // Refresh list
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create member');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Members Management</h1>
            <p className="text-muted">View, search, and manage gym members.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Add Member
          </button>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title="Add New Member"
      >
        <form onSubmit={handleAddMember}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              className="form-input" 
              required 
              value={formData.name}
              onChange={e => setFormData({...formData, name: e.target.value})}
              placeholder="e.g. John Doe"
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
              placeholder="john@example.com"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Phone Number</label>
            <input 
              className="form-input" 
              required 
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              placeholder="+91 0000000000"
            />
          </div>
          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-primary w-full" type="submit" disabled={isSaving}>
              <Save size={18} />
              {isSaving ? 'Creating...' : 'Create Member'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem' }}>
          <div className="search-bar" style={{ width: '400px', background: 'var(--clr-bg-base)' }}>
            <Search size={18} className="text-muted" />
            <input 
              value={query} 
              onChange={(e) => setQuery(e.target.value)} 
              placeholder="Search by name or email..." 
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select className="btn btn-secondary">
              <option>All Status</option>
              <option>Active</option>
              <option>Pending</option>
              <option>Inactive</option>
            </select>
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
                <th>Name</th>
                <th>Contact Info</th>
                <th>Plan</th>
                <th>Join Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                        {m.userDoc?.name?.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '600' }}>{m.userDoc?.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem' }}>{m.userDoc?.email}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{m.phone}</span>
                    </div>
                  </td>
                  <td>{m.plan || 'N/A'}</td>
                  <td>{m.joinDate || 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${m.status || 'pending'}`}>
                      {m.status || 'pending'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-icon">
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-icon danger">
                        <Trash2 size={14} />
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
}
