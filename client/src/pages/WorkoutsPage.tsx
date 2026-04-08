import React, { useEffect, useState } from 'react';
import { Dumbbell, Utensils, Zap, Clock, Plus, Trash2, ChevronDown, ChevronUp, Save, Search, UserPlus } from 'lucide-react';
import { getWorkoutTemplates, createWorkoutTemplate, deleteWorkoutPlan, assignWorkoutToMember, getMyWorkout } from '../features/workouts/workouts.api';
import { getDietTemplates, createDietTemplate, deleteDietPlan, assignDietToMember, getMyDiet } from '../features/diets/diets.api';
import { getMembers } from '../features/members/members.api';
import { useAuthStore } from '../store/auth.store';
import Modal from '../components/Modal';

const WorkoutsPage: React.FC = () => {
  const { user } = useAuthStore();
  const isAdmin = user?.role === 'admin';
  const isTrainer = user?.role === 'trainer';
  
  const [activeTab, setActiveTab] = useState<'workouts' | 'diets'>('workouts');
  const [workoutTemplates, setWorkoutTemplates] = useState<any[]>([]);
  const [dietTemplates, setDietTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal States
  const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
  const [isDietModalOpen, setIsDietModalOpen] = useState(false);
  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [selectedTemplateForAssign, setSelectedTemplateForAssign] = useState<{ id: string, type: 'workout' | 'diet', name: string } | null>(null);
  
  // Assignment States
  const [members, setMembers] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);

  // Form States - Workout
  const [workoutForm, setWorkoutForm] = useState({
    name: '',
    goal: 'General Fitness',
    difficulty: 'Beginner',
    days: [{ dayName: 'Day 1', exercises: [{ name: '', sets: 3, reps: '12', rest: '60s' }] }]
  });

  // Form States - Diet
  const [dietForm, setDietForm] = useState({
    name: '',
    goal: 'Maintenance',
    calories: 2000,
    meals: {
      breakfast: [{ foodName: '', quantity: '', calories: 0 }],
      lunch: [{ foodName: '', quantity: '', calories: 0 }],
      dinner: [{ foodName: '', quantity: '', calories: 0 }],
      snacks: [{ foodName: '', quantity: '', calories: 0 }]
    }
  });

  const fetchData = async () => {
    setLoading(true);
    try {
      const [wRes, dRes] = await Promise.allSettled([
        getWorkoutTemplates(),
        getDietTemplates()
      ]);
      
      if (wRes.status === 'fulfilled') {
        setWorkoutTemplates(wRes.value.data?.data || []);
      } else {
        console.error("Failed to fetch workout templates", wRes.reason);
        setWorkoutTemplates([]);
      }

      if (dRes.status === 'fulfilled') {
        setDietTemplates(dRes.value.data?.data || []);
      } else {
        console.error("Failed to fetch diet templates", dRes.reason);
        setDietTemplates([]);
      }
    } catch (error) {
      console.error("Unexpected error in fetchData", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isAdmin || isTrainer) {
      fetchData();
    }
  }, [isAdmin, isTrainer]);

  useEffect(() => {
    if (isAssignModalOpen) {
      getMembers({ search: memberSearch, limit: 10 }).then(res => {
        setMembers(res.data.data.items);
      });
    }
  }, [isAssignModalOpen, memberSearch]);

  const handleCreateWorkout = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createWorkoutTemplate(workoutForm);
      setIsWorkoutModalOpen(false);
      setWorkoutForm({
        name: '',
        goal: 'General Fitness',
        difficulty: 'Beginner',
        days: [{ dayName: 'Day 1', exercises: [{ name: '', sets: 3, reps: '12', rest: '60s' }] }]
      });
      fetchData();
    } catch (error) {
      alert("Failed to create workout template");
    }
  };

  const handleCreateDiet = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createDietTemplate(dietForm);
      setIsDietModalOpen(false);
      setDietForm({
        name: '',
        goal: 'Maintenance',
        calories: 2000,
        meals: {
          breakfast: [{ foodName: '', quantity: '', calories: 0 }],
          lunch: [{ foodName: '', quantity: '', calories: 0 }],
          dinner: [{ foodName: '', quantity: '', calories: 0 }],
          snacks: [{ foodName: '', quantity: '', calories: 0 }]
        }
      });
      fetchData();
    } catch (error) {
      alert("Failed to create diet template");
    }
  };

  const handleAssign = async (memberId: string) => {
    if (!selectedTemplateForAssign) return;
    setIsAssigning(true);
    try {
      if (selectedTemplateForAssign.type === 'workout') {
        await assignWorkoutToMember({ memberId, templateId: selectedTemplateForAssign.id });
      } else {
        await assignDietToMember({ memberId, templateId: selectedTemplateForAssign.id });
      }
      alert("Plan assigned successfully!");
      setIsAssignModalOpen(false);
    } catch (error) {
      alert("Failed to assign plan");
    } finally {
      setIsAssigning(false);
    }
  };

  const addWorkoutDay = () => {
    setWorkoutForm({
      ...workoutForm,
      days: [...workoutForm.days, { dayName: `Day ${workoutForm.days.length + 1}`, exercises: [{ name: '', sets: 3, reps: '12', rest: '60s' }] }]
    });
  };

  const addExercise = (dayIndex: number) => {
    const newDays = [...workoutForm.days];
    newDays[dayIndex].exercises.push({ name: '', sets: 3, reps: '12', rest: '60s' });
    setWorkoutForm({ ...workoutForm, days: newDays });
  };

  const addMealItem = (meal: keyof typeof dietForm.meals) => {
    setDietForm({
      ...dietForm,
      meals: {
        ...dietForm.meals,
        [meal]: [...dietForm.meals[meal], { foodName: '', quantity: '', calories: 0 }]
      }
    });
  };

  if (!user) {
    return <div className="loading-state"><div className="spinner"></div></div>;
  }

  if (user.role === 'member') {
    return <MemberView />;
  }

  return (
    <div>
      <div className="page-header" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1>Workout & Diet Library</h1>
            <p className="text-muted">Manage templates and assign plans to members.</p>
          </div>
          <div style={{ display: 'flex', gap: '1rem' }}>
            {activeTab === 'workouts' ? (
              isAdmin && <button className="btn btn-primary" onClick={() => setIsWorkoutModalOpen(true)}>
                <Plus size={18} /> Create Workout
              </button>
            ) : (
              isAdmin && <button className="btn btn-primary" onClick={() => setIsDietModalOpen(true)}>
                <Plus size={18} /> Create Diet
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="glass-panel" style={{ padding: '0.5rem', marginBottom: '2rem', display: 'inline-flex', gap: '0.5rem' }}>
        <button 
          className={`btn ${activeTab === 'workouts' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('workouts')}
        >
          <Dumbbell size={18} /> Workouts
        </button>
        <button 
          className={`btn ${activeTab === 'diets' ? 'btn-primary' : 'btn-secondary'}`}
          onClick={() => setActiveTab('diets')}
        >
          <Utensils size={18} /> Diet Plans
        </button>
      </div>

      {loading ? (
        <div className="loading-state"><div className="spinner"></div></div>
      ) : (
        <div className="grid-cards">
          {activeTab === 'workouts' ? (
            workoutTemplates.length > 0 ? (
              workoutTemplates.map((t) => (
                <div key={t._id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{t.name}</h3>
                    <span className="status-badge active" style={{ fontSize: '0.7rem' }}>{t.difficulty}</span>
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Goal: {t.goal}</p>
                  <div style={{ display: 'flex', gap: '1rem', color: 'var(--clr-text-muted)', fontSize: '0.85rem', marginBottom: '1.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                      <Zap size={14} /> {t.days?.length} Days
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary flex-1" onClick={() => {
                      setSelectedTemplateForAssign({ id: t._id, type: 'workout', name: t.name });
                      setIsAssignModalOpen(true);
                    }}>
                      <UserPlus size={16} /> Assign
                    </button>
                    {isAdmin && (
                      <button className="btn btn-icon danger" onClick={() => deleteWorkoutPlan(t._id).then(fetchData)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
                <Dumbbell size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p className="text-muted">No workout templates found. Create your first one!</p>
              </div>
            )
          ) : (
            dietTemplates.length > 0 ? (
              dietTemplates.map((t) => (
                <div key={t._id} className="glass-card" style={{ padding: '1.5rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                    <h3 style={{ fontSize: '1.1rem' }}>{t.name}</h3>
                    <span className="status-badge active" style={{ fontSize: '0.7rem' }}>{t.goal}</span>
                  </div>
                  <p className="text-muted" style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Target: {t.calories} kcal</p>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button className="btn btn-secondary flex-1" onClick={() => {
                      setSelectedTemplateForAssign({ id: t._id, type: 'diet', name: t.name });
                      setIsAssignModalOpen(true);
                    }}>
                      <UserPlus size={16} /> Assign
                    </button>
                    {isAdmin && (
                      <button className="btn btn-icon danger" onClick={() => deleteDietPlan(t._id).then(fetchData)}>
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="glass-panel" style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }}>
                <Utensils size={48} className="text-muted" style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
                <p className="text-muted">No diet plans found. Create your first one!</p>
              </div>
            )
          )}
        </div>
      )}

      {/* Workout Create Modal */}
      <Modal isOpen={isWorkoutModalOpen} onClose={() => setIsWorkoutModalOpen(false)} title="Create Workout Template">
        <form onSubmit={handleCreateWorkout} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Plan Name</label>
            <input className="form-input" required value={workoutForm.name} onChange={e => setWorkoutForm({...workoutForm, name: e.target.value})} placeholder="e.g. 5-Day Muscle Builder" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Goal</label>
              <select className="form-input" value={workoutForm.goal} onChange={e => setWorkoutForm({...workoutForm, goal: e.target.value})}>
                <option>Fat Loss</option>
                <option>Muscle Gain</option>
                <option>Strength</option>
                <option>General Fitness</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Difficulty</label>
              <select className="form-input" value={workoutForm.difficulty} onChange={e => setWorkoutForm({...workoutForm, difficulty: e.target.value})}>
                <option>Beginner</option>
                <option>Intermediate</option>
                <option>Advanced</option>
              </select>
            </div>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '0.5rem' }}>
            {workoutForm.days.map((day, dIdx) => (
              <div key={dIdx} className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <input 
                  className="form-input" 
                  style={{ fontWeight: 700, marginBottom: '1rem', background: 'transparent', border: 'none', borderBottom: '1px solid var(--clr-glass-border)', borderRadius: 0 }}
                  value={day.dayName}
                  onChange={e => {
                    const newDays = [...workoutForm.days];
                    newDays[dIdx].dayName = e.target.value;
                    setWorkoutForm({...workoutForm, days: newDays});
                  }}
                />
                {day.exercises.map((ex, eIdx) => (
                  <div key={eIdx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input className="form-input" placeholder="Exercise" value={ex.name} onChange={e => {
                      const newDays = [...workoutForm.days];
                      newDays[dIdx].exercises[eIdx].name = e.target.value;
                      setWorkoutForm({...workoutForm, days: newDays});
                    }} />
                    <input className="form-input" placeholder="Sets" type="number" value={ex.sets} onChange={e => {
                      const newDays = [...workoutForm.days];
                      newDays[dIdx].exercises[eIdx].sets = Number(e.target.value);
                      setWorkoutForm({...workoutForm, days: newDays});
                    }} />
                    <input className="form-input" placeholder="Reps" value={ex.reps} onChange={e => {
                      const newDays = [...workoutForm.days];
                      newDays[dIdx].exercises[eIdx].reps = e.target.value;
                      setWorkoutForm({...workoutForm, days: newDays});
                    }} />
                    <input className="form-input" placeholder="Rest" value={ex.rest} onChange={e => {
                      const newDays = [...workoutForm.days];
                      newDays[dIdx].exercises[eIdx].rest = e.target.value;
                      setWorkoutForm({...workoutForm, days: newDays});
                    }} />
                  </div>
                ))}
                <button type="button" className="btn btn-secondary w-full" style={{ fontSize: '0.8rem', padding: '0.4rem' }} onClick={() => addExercise(dIdx)}>+ Add Exercise</button>
              </div>
            ))}
          </div>
          <button type="button" className="btn btn-secondary" onClick={addWorkoutDay}>+ Add Day</button>
          <button className="btn btn-primary w-full" type="submit">Save Template</button>
        </form>
      </Modal>

      {/* Diet Create Modal */}
      <Modal isOpen={isDietModalOpen} onClose={() => setIsDietModalOpen(false)} title="Create Diet Template">
        <form onSubmit={handleCreateDiet} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div className="form-group">
            <label className="form-label">Plan Name</label>
            <input className="form-input" required value={dietForm.name} onChange={e => setDietForm({...dietForm, name: e.target.value})} placeholder="e.g. High Protein Cutting" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div className="form-group">
              <label className="form-label">Goal</label>
              <select className="form-input" value={dietForm.goal} onChange={e => setDietForm({...dietForm, goal: e.target.value})}>
                <option>Weight Loss</option>
                <option>Muscle Gain</option>
                <option>Maintenance</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Calories</label>
              <input className="form-input" type="number" value={dietForm.calories} onChange={e => setDietForm({...dietForm, calories: Number(e.target.value)})} />
            </div>
          </div>

          <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
            {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((meal) => (
              <div key={meal} className="glass-panel" style={{ padding: '1rem', marginBottom: '1rem' }}>
                <h4 style={{ textTransform: 'capitalize', marginBottom: '1rem' }}>{meal}</h4>
                {dietForm.meals[meal].map((item, idx) => (
                  <div key={idx} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '0.5rem', marginBottom: '0.5rem' }}>
                    <input className="form-input" placeholder="Food Name" value={item.foodName} onChange={e => {
                      const newMeals = {...dietForm.meals};
                      newMeals[meal][idx].foodName = e.target.value;
                      setDietForm({...dietForm, meals: newMeals});
                    }} />
                    <input className="form-input" placeholder="Qty" value={item.quantity} onChange={e => {
                      const newMeals = {...dietForm.meals};
                      newMeals[meal][idx].quantity = e.target.value;
                      setDietForm({...dietForm, meals: newMeals});
                    }} />
                    <input className="form-input" placeholder="Kcal" type="number" value={item.calories} onChange={e => {
                      const newMeals = {...dietForm.meals};
                      newMeals[meal][idx].calories = Number(e.target.value);
                      setDietForm({...dietForm, meals: newMeals});
                    }} />
                  </div>
                ))}
                <button type="button" className="btn btn-secondary w-full" style={{ fontSize: '0.8rem', padding: '0.4rem' }} onClick={() => addMealItem(meal)}>+ Add Item</button>
              </div>
            ))}
          </div>
          <button className="btn btn-primary w-full" type="submit">Save Template</button>
        </form>
      </Modal>

      {/* Assign Modal */}
      <Modal isOpen={isAssignModalOpen} onClose={() => setIsAssignModalOpen(false)} title={`Assign ${selectedTemplateForAssign?.name}`}>
        <div className="form-group">
          <label className="form-label">Search Member</label>
          <div className="search-bar">
            <Search size={18} />
            <input placeholder="Member name or email..." value={memberSearch} onChange={e => setMemberSearch(e.target.value)} />
          </div>
        </div>
        <div style={{ maxHeight: '300px', overflowY: 'auto', marginTop: '1rem' }}>
          {members.map(m => (
            <div key={m._id} className="glass-panel" style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer' }} onClick={() => handleAssign(m._id)}>
              <div>
                <p style={{ fontWeight: 600 }}>{m.user?.name}</p>
                <p className="text-muted" style={{ fontSize: '0.8rem' }}>{m.user?.email}</p>
              </div>
              <button className="btn-icon" style={{ background: 'var(--clr-primary)', color: 'white' }} disabled={isAssigning}>
                <Plus size={16} />
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

const MemberView: React.FC = () => {
  const [workout, setWorkout] = useState<any>(null);
  const [diet, setDiet] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([getMyWorkout(), getMyDiet()])
      .then(([wRes, dRes]) => {
        setWorkout(wRes.data.data);
        setDiet(dRes.data.data);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-state"><div className="spinner"></div></div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '2rem' }}>
      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div className="stat-icon" style={{ background: 'rgba(139, 92, 246, 0.1)', color: 'var(--clr-primary)' }}>
            <Dumbbell size={24} />
          </div>
          <h2>My Workout Plan</h2>
        </div>
        {!workout ? <p className="text-muted">No workout assigned yet.</p> : (
          <div>
            <h3 style={{ marginBottom: '1.5rem' }}>{workout.name}</h3>
            {workout.days.map((day: any, i: number) => (
              <div key={i} style={{ marginBottom: '2rem' }}>
                <h4 style={{ color: 'var(--clr-primary)', marginBottom: '1rem' }}>{day.dayName}</h4>
                {day.exercises.map((ex: any, j: number) => (
                  <div key={j} style={{ padding: '1rem', borderBottom: '1px solid var(--clr-glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{ fontWeight: 600 }}>{ex.name}</p>
                      <p className="text-muted" style={{ fontSize: '0.8rem' }}>Rest: {ex.rest}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700 }}>{ex.sets} × {ex.reps}</p>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel" style={{ padding: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem' }}>
          <div className="stat-icon" style={{ background: 'rgba(16, 185, 129, 0.1)', color: 'var(--clr-success)' }}>
            <Utensils size={24} />
          </div>
          <h2>My Diet Plan</h2>
        </div>
        {!diet ? <p className="text-muted">No diet assigned yet.</p> : (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <h3>{diet.name}</h3>
              <span className="status-badge active">{diet.calories} kcal</span>
            </div>
            {(['breakfast', 'lunch', 'dinner', 'snacks'] as const).map((meal) => (
              <div key={meal} style={{ marginBottom: '1.5rem' }}>
                <h4 style={{ textTransform: 'capitalize', marginBottom: '0.75rem', color: 'var(--clr-success)' }}>{meal}</h4>
                {diet.meals[meal].map((item: any, i: number) => (
                  <div key={i} style={{ padding: '0.75rem', borderBottom: '1px solid var(--clr-glass-border)', display: 'flex', justifyContent: 'space-between' }}>
                    <p>{item.foodName}</p>
                    <p className="text-muted">{item.quantity}</p>
                  </div>
                ))}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkoutsPage;
