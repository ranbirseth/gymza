import React, { useState, useEffect } from 'react';
import { Dumbbell, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { markAttendance } from '../features/attendance/attendance.api';

const QRAttendancePage: React.FC = () => {
  const [secretCode, setSecretCode] = useState('');
  const [status, setStatus] = useState<{ type: 'success' | 'error' | 'idle' | 'loading', message: string }>({
    type: 'idle',
    message: ''
  });

  // Ensure theme is applied (defaulting to dark for this standalone-ish page)
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (secretCode.length !== 3 || !/^\d+$/.test(secretCode)) {
      setStatus({ type: 'error', message: 'Please enter a valid 3-digit code.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Marking attendance...' });

    try {
      const response = await markAttendance({ secretCode });
      const data = response.data;

      if (response.status === 200 || response.status === 201) {
        setStatus({ type: 'success', message: data.message || 'Attendance marked successfully!' });
        setSecretCode('');
        // Clear success message after 5 seconds
        setTimeout(() => setStatus({ type: 'idle', message: '' }), 5000);
      } else {
        setStatus({ type: 'error', message: data.message || 'Failed to mark attendance.' });
      }
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to mark attendance. Please check your code.';
      setStatus({ type: 'error', message: errorMessage });
    }
  };

  return (
    <div className="attendance-qr-container" style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '1.5rem',
      background: 'radial-gradient(circle at top right, #1a1b25, #0a0b10)'
    }}>
      <div className="bg-mesh" style={{ opacity: 0.5 }}>
        <div className="blob-1"></div>
        <div className="blob-2"></div>
        <div className="blob-3"></div>
      </div>

      <div className="glass-card" style={{
        width: '100%',
        maxWidth: '400px',
        padding: '2.5rem',
        textAlign: 'center',
        position: 'relative',
        zIndex: 1
      }}>
        <div className="sidebar-logo" style={{ justifyContent: 'center', marginBottom: '2rem' }}>
          <Dumbbell className="text-primary" size={32} />
          <span className="text-gradient" style={{ fontSize: '2rem', fontWeight: 800 }}>Gymza</span>
        </div>

        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem', fontWeight: 700 }}>Mark Attendance</h2>
        <p className="text-muted" style={{ marginBottom: '2rem' }}>Enter your unique 3-digit secret code</p>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="form-group" style={{ textAlign: 'left' }}>
            <label className="form-label" style={{ fontSize: '0.85rem', opacity: 0.8 }}>Secret Code</label>
            <input
              type="text"
              className="form-input"
              style={{ 
                fontSize: '2rem', 
                textAlign: 'center', 
                letterSpacing: '0.5rem',
                fontWeight: 700,
                height: '70px'
              }}
              placeholder="000"
              maxLength={3}
              value={secretCode}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '');
                if (val.length <= 3) setSecretCode(val);
              }}
              disabled={status.type === 'loading'}
              autoFocus
            />
          </div>

          <button 
            type="submit" 
            className="btn btn-primary w-full" 
            style={{ height: '50px', justifyContent: 'center', fontSize: '1.1rem' }}
            disabled={status.type === 'loading' || secretCode.length !== 3}
          >
            {status.type === 'loading' ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Processing...
              </>
            ) : 'Submit Code'}
          </button>
        </form>

        {status.type !== 'idle' && status.type !== 'loading' && (
          <div className={`glass-panel ${status.type === 'success' ? 'text-success' : 'text-danger'}`} style={{
            marginTop: '2rem',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '0.75rem',
            animation: 'slideUp 0.3s ease-out',
            background: status.type === 'success' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
            borderColor: status.type === 'success' ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
          }}>
            {status.type === 'success' ? <CheckCircle2 size={20} /> : <AlertCircle size={20} />}
            <span style={{ fontWeight: 500 }}>{status.message}</span>
          </div>
        )}
      </div>

      <style>{`
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default QRAttendancePage;
