import React, { useEffect, useState } from 'react';
import { getAttendance, markAttendance } from '../features/attendance/attendance.api';
import { getMembers } from '../features/members/members.api';
import { Calendar, Plus, Clock, CheckCircle2, XCircle, Save } from 'lucide-react';
import Modal from '../components/Modal';

const AttendancePage: React.FC = () => {
  const [attendance, setAttendance] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({ memberId: '', status: 'present' as 'present' | 'absent' });

  const fetchAttendance = () => {
    setLoading(true);
    getAttendance()
      .then((res) => {
        const data = res.data?.data;
        setAttendance(Array.isArray(data) ? data : (data?.items || []));
      })
      .catch(() => setAttendance([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchAttendance();
    getMembers(1, 100).then(res => {
      const data = res.data?.data;
      setMembers(Array.isArray(data) ? data : (data?.items || []));
    }).catch(() => setMembers([]));
  }, []);

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.memberId) return alert('Please select a member');
    setIsSaving(true);
    try {
      await markAttendance(formData);
      setIsModalOpen(false);
      setFormData({ memberId: '', status: 'present' });
      fetchAttendance();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to mark attendance');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Attendance Tracking</h1>
            <p className="text-muted">Monitor daily check-ins and member activity.</p>
          </div>
          <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
            <Plus size={18} />
            Mark Attendance
          </button>
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
                <option key={m._id} value={m._id}>{m.userDoc?.name || m.name || 'Unknown'}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <label className="status-badge active" style={{ cursor: 'pointer', opacity: formData.status === 'present' ? 1 : 0.4 }}>
                <input 
                  type="radio" 
                  name="status" 
                  checked={formData.status === 'present'} 
                  onChange={() => setFormData({...formData, status: 'present'})}
                  style={{ display: 'none' }}
                />
                Present
              </label>
              <label className="status-badge inactive" style={{ cursor: 'pointer', opacity: formData.status === 'absent' ? 1 : 0.4 }}>
                <input 
                  type="radio" 
                  name="status" 
                  checked={formData.status === 'absent'} 
                  onChange={() => setFormData({...formData, status: 'absent'})}
                  style={{ display: 'none' }}
                />
                Absent
              </label>
            </div>
          </div>
          <div style={{ marginTop: '2rem' }}>
            <button className="btn btn-primary w-full" type="submit" disabled={isSaving}>
              <Save size={18} />
              {isSaving ? 'Saving...' : 'Save Attendance'}
            </button>
          </div>
        </form>
      </Modal>

      <div className="grid-stats">
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Present</h3>
            <p className="stat-value">84</p>
            <p className="stat-trend trend-up">Today's Peak: 10 AM</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--clr-success)' }}>
            <CheckCircle2 size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Total Absent</h3>
            <p className="stat-value">12</p>
            <p className="text-muted">Excused: 5</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(244, 63, 94, 0.1)', color: 'var(--clr-danger)' }}>
            <XCircle size={24} />
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <h3>Avg. Duration</h3>
            <p className="stat-value">1.5h</p>
            <p className="text-muted">Per Session</p>
          </div>
          <div className="stat-icon" style={{ background: 'rgba(6, 182, 212, 0.1)', color: 'var(--clr-secondary)' }}>
            <Clock size={24} />
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem', marginTop: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ fontSize: '1.1rem' }}>Today's Log</h3>
          <div style={{ display: 'flex', gap: '0.75rem' }}>
            <button className="btn btn-secondary">
              <Calendar size={18} />
              Select Date
            </button>
          </div>
        </div>

        <div className="table-container" style={{ margin: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Member Name</th>
                <th>Check-in Time</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {attendance.map((entry) => (
                <tr key={entry._id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div className="avatar" style={{ width: '32px', height: '32px', fontSize: '0.75rem' }}>
                        {(entry.member?.userDoc?.name || entry.name || 'U').charAt(0)}
                      </div>
                      <span style={{ fontWeight: '600' }}>{entry.member?.userDoc?.name || entry.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td>{entry.time}</td>
                  <td>{entry.date}</td>
                  <td>
                    <span className={`status-badge ${entry.status}`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default AttendancePage;
