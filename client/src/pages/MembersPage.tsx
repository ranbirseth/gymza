import React, { useEffect, useState } from "react";
import { getMembers, searchMembers, createMember, updateMember, deleteMember } from "../features/members/members.api";
import { useDebounce } from "../hooks/useDebounce";
import { Search, Filter, Plus, Edit2, Trash2, Mail, Phone, Save, X } from "lucide-react";
import Modal from "../components/Modal";

export default function MembersPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedQuery = useDebounce(query, 350);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({ name: '', email: '', phone: '', password: 'Password123', status: 'pending' });
  const [isSaving, setIsSaving] = useState(false);

  const fetchMembers = () => {
    setLoading(true);
    getMembers({ search: debouncedQuery, status: statusFilter })
      .then((res) => {
        setItems(res.data?.data?.items || []);
      })
      .catch((err) => {
        console.error("Fetch members error:", err);
        setItems([]);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMembers();
  }, [debouncedQuery, statusFilter]);

  const handleOpenAddModal = () => {
    setEditingId(null);
    setFormData({ name: '', email: '', phone: '', password: 'Password123', status: 'pending' });
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (member: any) => {
    setEditingId(member._id);
    setFormData({
      name: member.user?.name || '',
      email: member.user?.email || '',
      phone: member.user?.phone || '',
      password: '', // Don't show password on edit
      status: member.status || 'pending'
    });
    setIsModalOpen(true);
  };

  const handleSaveMember = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      if (editingId) {
        // Remove password if empty on edit
        const payload = { ...formData };
        if (!payload.password) delete (payload as any).password;
        await updateMember(editingId, payload);
      } else {
        await createMember(formData);
      }
      setIsModalOpen(false);
      fetchMembers(); // Refresh list
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to save member');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteMember = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this member?")) return;
    try {
      await deleteMember(id);
      fetchMembers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete member');
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
          <button className="btn btn-primary" onClick={handleOpenAddModal}>
            <Plus size={18} />
            Add Member
          </button>
        </div>
      </div>

      <Modal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        title={editingId ? "Edit Member" : "Add New Member"}
      >
        <form onSubmit={handleSaveMember}>
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
          {!editingId && (
            <div className="form-group">
              <label className="form-label">Password</label>
              <input 
                className="form-input" 
                type="password"
                required 
                value={formData.password}
                onChange={e => setFormData({...formData, password: e.target.value})}
                placeholder="••••••••"
              />
            </div>
          )}
          {editingId && (
            <div className="form-group">
              <label className="form-label">Status</label>
              <select 
                className="form-input" 
                value={formData.status}
                onChange={e => setFormData({...formData, status: e.target.value})}
              >
                <option value="pending">Pending</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
          )}
          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-primary w-full" type="submit" disabled={isSaving}>
              <Save size={18} />
              {isSaving ? 'Saving...' : (editingId ? 'Update Member' : 'Create Member')}
            </button>
          </div>
        </form>
      </Modal>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', gap: '1rem', flexWrap: 'wrap' }}>
          <div className="search-bar" style={{ width: '400px', background: 'var(--clr-bg-base)' }}>
            <Search size={18} className="text-muted" />
            <input 
              placeholder="Search members..." 
              value={query}
              onChange={e => setQuery(e.target.value)}
            />
          </div>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <select 
              className="btn btn-secondary" 
              style={{ background: 'var(--clr-bg-base)', border: '1px solid var(--clr-glass-border)', color: 'var(--clr-text-main)', padding: '0 1rem' }}
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending Approval</option>
              <option value="active">Active Members</option>
              <option value="inactive">Inactive Members</option>
            </select>
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
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading members...</td></tr>
              ) : items.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>No members found.</td></tr>
              ) : items.map((m) => (
                <tr key={m._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                        {m.user?.name?.charAt(0)}
                      </div>
                      <span style={{ fontWeight: '600' }}>{m.user?.name}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                      <span style={{ fontSize: '0.85rem' }}>{m.user?.email}</span>
                      <span style={{ fontSize: '0.75rem', color: 'var(--clr-text-muted)' }}>{m.user?.phone}</span>
                    </div>
                  </td>
                  <td>{m.currentPlan?.name || 'No Plan'}</td>
                  <td>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : 'N/A'}</td>
                  <td>
                    <span className={`status-badge ${m.status || 'pending'}`}>
                      {m.status ? m.status.charAt(0).toUpperCase() + m.status.slice(1) : 'Pending'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button className="btn-icon" onClick={() => handleOpenEditModal(m)}>
                        <Edit2 size={14} />
                      </button>
                      <button className="btn-icon danger" onClick={() => handleDeleteMember(m._id)}>
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
