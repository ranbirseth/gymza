import React, { FormEvent, useState } from "react";
import { useNavigate } from "react-router-dom";
import { login } from "../features/auth/auth.api";
import { useAuthStore } from "../store/auth.store";
import { Dumbbell, Mail, Lock, Eye, EyeOff } from "lucide-react";

export default function LoginPage() {
  const navigate = useNavigate();
  const { setAuth, gymId, setGymId } = useAuthStore();
  const [email, setEmail] = useState("admin@gymza.com");
  const [password, setPassword] = useState("Password123");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { data } = await login({ gymId, email, password });
      setAuth(data.data.user, data.data.accessToken);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.message || "Invalid login credentials");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page" style={{ 
      display: 'flex', 
      minHeight: '100vh', 
      background: 'var(--clr-bg-base)',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div className="bg-mesh">
        <div className="blob-1"></div>
        <div className="blob-2"></div>
      </div>

      <div className="login-left" style={{ 
        flex: '0 0 450px', 
        display: 'flex', 
        flexDirection: 'column', 
        justifyContent: 'center', 
        padding: '3rem',
        zIndex: 1
      }}>
        <div className="glass-card" style={{ padding: '3rem' }}>
          <div className="text-center" style={{ marginBottom: '2.5rem' }}>
            <div style={{ 
              display: 'inline-flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              width: '60px',
              height: '60px',
              borderRadius: '16px',
              background: 'var(--clr-accent-gradient)',
              marginBottom: '1rem',
              color: 'white'
            }}>
              <Dumbbell size={32} />
            </div>
            <h1 style={{ fontSize: '2rem', fontWeight: '800' }}>Gymza</h1>
            <p className="text-muted">Sign in to your account</p>
          </div>

          <form onSubmit={submit}>
            {error && (
              <div style={{ 
                background: 'rgba(244, 63, 94, 0.1)', 
                color: 'var(--clr-danger)', 
                padding: '0.75rem', 
                borderRadius: '8px',
                fontSize: '0.85rem',
                marginBottom: '1.5rem',
                border: '1px solid rgba(244, 63, 94, 0.2)'
              }}>
                {error}
              </div>
            )}

            <div className="form-group">
              <label className="form-label">Gym ID</label>
              <div style={{ position: 'relative' }}>
                <input 
                  className="form-input"
                  value={gymId} 
                  onChange={(e) => setGymId(e.target.value)} 
                  placeholder="Enter Gym ID" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }} />
                <input 
                  className="form-input"
                  style={{ paddingLeft: '3rem' }}
                  type="email"
                  value={email} 
                  onChange={(e) => setEmail(e.target.value)} 
                  placeholder="admin@gymza.com" 
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock size={18} style={{ position: 'absolute', left: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }} />
                <input 
                  className="form-input"
                  style={{ paddingLeft: '3rem', paddingRight: '3rem' }}
                  type={showPassword ? "text" : "password"}
                  value={password} 
                  onChange={(e) => setPassword(e.target.value)} 
                  placeholder="••••••••" 
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)', color: 'var(--clr-text-muted)' }}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input type="checkbox" style={{ accentColor: 'var(--clr-primary)' }} />
                <span>Remember me</span>
              </label>
              <a href="#" style={{ fontSize: '0.85rem', color: 'var(--clr-primary)', fontWeight: '600' }}>Forgot Password?</a>
            </div>

            <button 
              type="submit" 
              className="btn btn-primary w-full" 
              style={{ padding: '0.875rem' }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div className="text-center" style={{ marginTop: '2rem' }}>
            <p className="text-muted" style={{ fontSize: '0.9rem' }}>
              Don't have an account? <a href="#" style={{ color: 'var(--clr-primary)', fontWeight: '600' }}>Sign up</a>
            </p>
          </div>
        </div>
      </div>

      <div className="login-right" style={{ flex: 1, position: 'relative' }}>
        {/* Right side background image or illustration could go here */}
      </div>
    </div>
  );
}
