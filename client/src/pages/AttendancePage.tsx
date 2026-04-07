import React, { useEffect, useState } from 'react';
import { getAttendance, manualCheckIn } from '../features/attendance/attendance.api';
import { getMembers } from '../features/members/members.api';
import { Calendar, Plus, Clock, CheckCircle2, XCircle, Save, Search, UserCheck, QrCode, Download } from 'lucide-react';
import { useDebounce } from '../hooks/useDebounce';
import Modal from '../components/Modal';
import { format } from 'date-fns';

const AttendancePage: React.FC = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isQRModalOpen, setIsQRModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0]);
  const debouncedSearch = useDebounce(searchQuery, 500);
  const [formData, setFormData] = useState({ memberId: '' });

  const qrUrl = `${window.location.origin}/mark-attendance`;
  const qrImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;

  const fetchAttendance = () => {
    setLoading(true);
    getAttendance({ search: debouncedSearch, date: dateFilter })
      .then((res) => {
        const data = res.data?.data;
        setAttendance(Array.isArray(data) ? data : (data?.items || []));
      })
      .catch(() => setAttendance([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttendance();
  }, [debouncedSearch, dateFilter]);

  useEffect(() => {
    getMembers({ limit: 100 }).then(res => {
      const data = res.data?.data;
      setMembers(Array.isArray(data) ? data : (data?.items || []));
    }).catch(() => setMembers([]));
  }, []);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId) return alert('Please select a member');
    setIsSaving(true);
    try {
      await manualCheckIn({ member: formData.memberId });
      setIsModalOpen(false);
      setFormData({ memberId: '' });
      fetchAttendance();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setIsSaving(false);
    }
  };

  const stats = {
    present: attendance.filter(a => a.status === 'present' || a.status === 'completed').length,
    completed: attendance.filter(a => a.status === 'completed').length,
    total: attendance.length
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Attendance Tracking</h1>
            <p className="text-muted">Monitor daily check-ins and member activity.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button className="btn btn-secondary" onClick={() => setIsQRModalOpen(true)}>
              <QrCode size={18} />
              View QR Code
            </button>
            <button className="btn btn-secondary" onClick={() => window.open('/mark-attendance', '_blank')}>
              <UserCheck size={18} />
              Open QR Page
            </button>
            <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
              <Plus size={18} />
              Mark Attendance
            </button>
          </div>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Mark Member Attendance">
        <form onSubmit={handleMarkAttendance}>
          <div className="form-group">
            <label className="form-label">Select Member</label>
            <select 
              className="form-input" 
              required 
              value={formData.memberId}
              onChange={e => setFormData({...formData, memberId: e.target.value})}
            >
              <option value="">-- Select Member --</option>
              {members.map(m => (
                <option key={m._id} value={m._id}>{m.user?.name || m.name || 'Unknown'}</option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-primary w-full" type="submit" disabled={isSaving}>
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </Modal>

      {/* QR Code Modal */}
      <Modal isOpen={isQRModalOpen} onClose={() => setIsQRModalOpen(false)} title="Attendance QR Code">
        <div style={{ textAlign: 'center', padding: '1rem' }}>
          <p className="text-muted" style={{ marginBottom: '1.5rem' }}>
            Display this QR code at your gym entrance. Members can scan it to mark their attendance.
          </p>
          <div className="glass-panel" style={{ 
            display: 'inline-block', 
            padding: '1.5rem', 
            background: 'white', 
            borderRadius: '1rem',
            marginBottom: '1.5rem'
          }}>
            <img 
              src={qrImage} 
              alt="Attendance QR" 
              style={{ width: '250px', height: '250px', display: 'block' }} 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <p style={{ fontSize: '0.85rem', wordBreak: 'break-all' }} className="text-primary">
              {qrUrl}
            </p>
            <button 
              className="btn btn-primary" 
              style={{ justifyContent: 'center' }}
              onClick={() => window.open(qrImage, '_blank')}
            >
              <Download size={18} />
              Download / Print QR
            </button>
          </div>
        </div>
      </Modal>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Check-ins</h3>
            <p className="stat-value">{stats.total}</p>
            <p className="stat-trend trend-up">{stats.present} Currently Present</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--clr-success)' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Workouts Completed</h3>
            <p className="stat-value">{stats.completed}</p>
            <p className="text-muted">Members checked-out</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--clr-secondary)' }}>
            <UserCheck size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Active Today</h3>
            <p className="stat-value">{stats.present}</p>
            <p className="text-muted">Members in gym</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(245, 158, 11, 0.1)', color: 'var(--clr-warning)' }}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Attendance Log</h3>
          <div style={{ display: 'flex', gap: '1rem', flex: 1, justifyContent: 'flex-end' }}>
            <div className="search-bar" style={{ maxWidth: '300px', background: 'var(--clr-bg-base)' }}>
              <Search size={18} className="text-muted" />
              <input 
                placeholder="Search member..." 
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
              />
            </div>
            <input 
              type="date" 
              className="form-input" 
              style={{ width: 'auto' }}
              value={dateFilter}
              onChange={e => setDateFilter(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container" style={{ margin: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Check-in</th>
                <th>Check-out</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center" style={{ padding: '2rem' }}>Loading log...</td>
                </tr>
              ) : attendance.length > 0 ? (
                attendance.map((entry) => (
                  <tr key={entry._id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                          {(entry.member?.user?.name || 'U').charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontWeight: '600', marginBottom: 0 }}>{entry.member?.user?.name || 'Unknown'}</p>
                          <p className="text-muted" style={{ fontSize: '0.7rem', marginBottom: 0 }}>ID: {entry.member?.secretCode}</p>
                        </div>
                      </div>
                    </td>
                    <td>{entry.checkIn ? format(new Date(entry.checkIn), 'hh:mm a') : '-'}</td>
                    <td>{entry.checkOut ? format(new Date(entry.checkOut), 'hh:mm a') : '-'}</td>
                    <td>{entry.date}</td>
                    <td>
                      <span className={`status-badge ${entry.status === 'completed' ? 'active' : 'pending'}`}>
                        {entry.status}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="text-center" style={{ padding: '2rem' }}>No attendance found for this selection.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
