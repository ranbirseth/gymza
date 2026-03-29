import React from 'react';
import { Dumbbell, Utensils, Zap, Clock, TrendingUp } from 'lucide-react';

const WorkoutsPage: React.FC = () => {
  const workouts = [
    { name: 'Full Body Strength', duration: '60 min', intensity: 'High', exercises: 8 },
    { name: 'HIIT Cardio', duration: '30 min', intensity: 'Very High', exercises: 12 },
    { name: 'Core Blaster', duration: '20 min', intensity: 'Medium', exercises: 6 },
  ];

  const dietPlan = [
    { meal: 'Breakfast', items: 'Oatmeal with protein, banana', calories: 450 },
    { meal: 'Lunch', items: 'Grilled chicken, quinoa, broccoli', calories: 600 },
    { meal: 'Snack', items: 'Greek yogurt with berries', calories: 200 },
    { meal: 'Dinner', items: 'Salmon, sweet potato, asparagus', calories: 550 },
  ];

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <h1>Workouts & Diet</h1>
        <p className="text-muted">Personalized fitness plans and nutrition guides.</p>
      </div>

      <div className="grid-cards" style={{ gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
        {/* Workouts Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--clr-primary)' }}>
              <Dumbbell size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem' }}>Active Workouts</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {workouts.map((w, i) => (
              <div key={i} className="glass-card" style={{ padding: '1.25rem', background: 'var(--clr-bg-input)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontSize: '1rem' }}>{w.name}</h3>
                  <span className="status-badge active" style={{ fontSize: '0.7rem' }}>{w.intensity}</span>
                </div>
                <div style={{ display: 'flex', gap: '1.5rem', marginTop: '1rem', color: 'var(--clr-text-muted)', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Clock size={14} /> {w.duration}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <Zap size={14} /> {w.exercises} Exercises
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="btn btn-primary w-full" style={{ marginTop: '2rem' }}>Explore Library</button>
        </div>

        {/* Diet Section */}
        <div className="glass-panel" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
            <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--clr-success)' }}>
              <Utensils size={24} />
            </div>
            <h2 style={{ fontSize: '1.5rem' }}>Nutrition Plan</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {dietPlan.map((d, i) => (
              <div key={i} style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '1rem',
                borderBottom: '1px solid var(--clr-glass-border)'
              }}>
                <div>
                  <h3 style={{ fontSize: '0.9rem', fontWeight: '600' }}>{d.meal}</h3>
                  <p style={{ fontSize: '0.8rem', color: 'var(--clr-text-muted)' }}>{d.items}</p>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ fontWeight: '700', fontSize: '0.9rem' }}>{d.calories}</span>
                  <p style={{ fontSize: '0.7rem', color: 'var(--clr-text-muted)' }}>kcal</p>
                </div>
              </div>
            ))}
          </div>
          <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(139, 92, 246, 0.05)', borderRadius: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
              <span>Daily Target</span>
              <span style={{ fontWeight: '700' }}>1800 / 2200 kcal</span>
            </div>
            <div style={{ height: '8px', background: 'var(--clr-bg-input)', borderRadius: '4px', marginTop: '0.75rem', overflow: 'hidden' }}>
              <div style={{ width: '80%', height: '100%', background: 'var(--clr-primary)' }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WorkoutsPage;
