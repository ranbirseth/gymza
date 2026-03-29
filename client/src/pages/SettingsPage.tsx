import React from 'react';
import { Settings, Shield, Bell, Smartphone, Globe, Save } from 'lucide-react';

const SettingsPage: React.FC = () => {
  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1>Settings</h1>
        <p className="text-muted">Manage your gym profile and application preferences.</p>
      </div>

      <div className="glass-panel" style={{ display: 'grid', gridTemplateColumns: '250px 1fr', minHeight: '600px', overflow: 'hidden' }}>
        {/* Settings Sidebar */}
        <div style={{ borderRight: '1px solid var(--clr-glass-border)', padding: '1.5rem' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <button className="nav-item active" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <Settings size={18} />
              General
            </button>
            <button className="nav-item" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <Shield size={18} />
              Security
            </button>
            <button className="nav-item" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <Bell size={18} />
              Notifications
            </button>
            <button className="nav-item" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <Smartphone size={18} />
              Integrations
            </button>
            <button className="nav-item" style={{ width: '100%', justifyContent: 'flex-start' }}>
              <Globe size={18} />
              Billing
            </button>
          </div>
        </div>

        {/* Settings Content */}
        <div style={{ padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.25rem', marginBottom: '2rem' }}>General Settings</h2>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '600px' }}>
            <div className="form-group">
              <label className="form-label">Gym Name</label>
              <input className="form-input" placeholder="Gymza Fitness Center" />
            </div>

            <div className="form-group">
              <label className="form-label">Contact Email</label>
              <input className="form-input" placeholder="contact@gymza.com" />
            </div>

            <div className="form-group">
              <label className="form-label">Business Address</label>
              <textarea 
                className="form-input" 
                rows={3} 
                placeholder="123 Fitness St, Workout City, WC 12345"
                style={{ resize: 'none' }}
              ></textarea>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.5rem', background: 'var(--clr-bg-input)', borderRadius: '12px' }}>
              <div>
                <h3 style={{ fontSize: '0.9rem', fontWeight: '600' }}>Dark Mode</h3>
                <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>Use the high-contrast dark theme</p>
              </div>
              <div style={{ 
                width: '44px', 
                height: '24px', 
                background: 'var(--clr-primary)', 
                borderRadius: '100px',
                position: 'relative',
                cursor: 'pointer'
              }}>
                <div style={{ 
                  width: '18px', 
                  height: '18px', 
                  background: 'white', 
                  borderRadius: '50%', 
                  position: 'absolute',
                  right: '3px',
                  top: '3px'
                }}></div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button className="btn btn-primary" style={{ padding: '0.75rem 2rem' }}>
                <Save size={18} />
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
