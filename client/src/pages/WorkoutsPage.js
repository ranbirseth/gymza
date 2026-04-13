import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { useEffect, useState } from 'react';
import { Dumbbell, Utensils, Zap, Plus, Trash2, Search, UserPlus } from 'lucide-react';
import { getWorkoutTemplates, createWorkoutTemplate, deleteWorkoutPlan, assignWorkoutToMember, getMyWorkout } from '../features/workouts/workouts.api';
import { getDietTemplates, createDietTemplate, deleteDietPlan, assignDietToMember, getMyDiet } from '../features/diets/diets.api';
import { getMembers } from '../features/members/members.api';
import { useAuthStore } from '../store/auth.store';
import Modal from '../components/Modal';
const WorkoutsPage = () => {
    const { user } = useAuthStore();
    const isAdmin = user?.role === 'admin';
    const isTrainer = user?.role === 'trainer';
    const [activeTab, setActiveTab] = useState('workouts');
    const [workoutTemplates, setWorkoutTemplates] = useState([]);
    const [dietTemplates, setDietTemplates] = useState([]);
    const [loading, setLoading] = useState(true);
    // Modal States
    const [isWorkoutModalOpen, setIsWorkoutModalOpen] = useState(false);
    const [isDietModalOpen, setIsDietModalOpen] = useState(false);
    const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
    const [selectedTemplateForAssign, setSelectedTemplateForAssign] = useState(null);
    // Assignment States
    const [members, setMembers] = useState([]);
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
            }
            else {
                console.error("Failed to fetch workout templates", wRes.reason);
                setWorkoutTemplates([]);
            }
            if (dRes.status === 'fulfilled') {
                setDietTemplates(dRes.value.data?.data || []);
            }
            else {
                console.error("Failed to fetch diet templates", dRes.reason);
                setDietTemplates([]);
            }
        }
        catch (error) {
            console.error("Unexpected error in fetchData", error);
        }
        finally {
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
    const handleCreateWorkout = async (e) => {
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
        }
        catch (error) {
            alert("Failed to create workout template");
        }
    };
    const handleCreateDiet = async (e) => {
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
        }
        catch (error) {
            alert("Failed to create diet template");
        }
    };
    const handleAssign = async (memberId) => {
        if (!selectedTemplateForAssign)
            return;
        setIsAssigning(true);
        try {
            if (selectedTemplateForAssign.type === 'workout') {
                await assignWorkoutToMember({ memberId, templateId: selectedTemplateForAssign.id });
            }
            else {
                await assignDietToMember({ memberId, templateId: selectedTemplateForAssign.id });
            }
            alert("Plan assigned successfully!");
            setIsAssignModalOpen(false);
        }
        catch (error) {
            alert("Failed to assign plan");
        }
        finally {
            setIsAssigning(false);
        }
    };
    const addWorkoutDay = () => {
        setWorkoutForm({
            ...workoutForm,
            days: [...workoutForm.days, { dayName: `Day ${workoutForm.days.length + 1}`, exercises: [{ name: '', sets: 3, reps: '12', rest: '60s' }] }]
        });
    };
    const addExercise = (dayIndex) => {
        const newDays = [...workoutForm.days];
        newDays[dayIndex].exercises.push({ name: '', sets: 3, reps: '12', rest: '60s' });
        setWorkoutForm({ ...workoutForm, days: newDays });
    };
    const addMealItem = (meal) => {
        setDietForm({
            ...dietForm,
            meals: {
                ...dietForm.meals,
                [meal]: [...dietForm.meals[meal], { foodName: '', quantity: '', calories: 0 }]
            }
        });
    };
    if (!user) {
        return _jsx("div", { className: "loading-state", children: _jsx("div", { className: "spinner" }) });
    }
    if (user.role === 'member') {
        return _jsx(MemberView, {});
    }
    return (_jsxs("div", { children: [_jsx("div", { className: "page-header", style: { marginBottom: '2rem' }, children: _jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center' }, children: [_jsxs("div", { children: [_jsx("h1", { children: "Workout & Diet Library" }), _jsx("p", { className: "text-muted", children: "Manage templates and assign plans to members." })] }), _jsx("div", { style: { display: 'flex', gap: '1rem' }, children: activeTab === 'workouts' ? (isAdmin && _jsxs("button", { className: "btn btn-primary", onClick: () => setIsWorkoutModalOpen(true), children: [_jsx(Plus, { size: 18 }), " Create Workout"] })) : (isAdmin && _jsxs("button", { className: "btn btn-primary", onClick: () => setIsDietModalOpen(true), children: [_jsx(Plus, { size: 18 }), " Create Diet"] })) })] }) }), _jsxs("div", { className: "glass-panel", style: { padding: '0.5rem', marginBottom: '2rem', display: 'inline-flex', gap: '0.5rem' }, children: [_jsxs("button", { className: `btn ${activeTab === 'workouts' ? 'btn-primary' : 'btn-secondary'}`, onClick: () => setActiveTab('workouts'), children: [_jsx(Dumbbell, { size: 18 }), " Workouts"] }), _jsxs("button", { className: `btn ${activeTab === 'diets' ? 'btn-primary' : 'btn-secondary'}`, onClick: () => setActiveTab('diets'), children: [_jsx(Utensils, { size: 18 }), " Diet Plans"] })] }), loading ? (_jsx("div", { className: "loading-state", children: _jsx("div", { className: "spinner" }) })) : (_jsx("div", { className: "grid-cards", children: activeTab === 'workouts' ? (workoutTemplates.length > 0 ? (workoutTemplates.map((t) => (_jsxs("div", { className: "glass-card", style: { padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'fit-content', minHeight: '280px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'flex-start', gap: '1rem' }, children: [_jsx("h3", { style: { fontSize: '1.1rem', color: 'var(--clr-text-main)', wordBreak: 'break-word' }, children: t.name }), _jsx("span", { className: "status-badge active", style: { fontSize: '0.65rem', padding: '0.2rem 0.5rem', flexShrink: 0 }, children: t.difficulty })] }), _jsxs("p", { className: "text-muted", style: { fontSize: '0.8rem', marginBottom: '1rem' }, children: ["Goal: ", t.goal] }), _jsxs("div", { style: { flex: 1, marginBottom: '1.5rem' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--clr-primary)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '600' }, children: [_jsx(Zap, { size: 14 }), " ", t.days?.length, " Days Training"] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }, children: t.days?.map((day, idx) => (_jsxs("div", { style: { borderLeft: '2px solid var(--clr-primary)', paddingLeft: '0.75rem' }, children: [_jsx("p", { style: { fontWeight: '700', color: 'var(--clr-text-main)', fontSize: '0.8rem', marginBottom: '0.25rem' }, children: day.dayName }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.2rem' }, children: day.exercises?.map((ex, exIdx) => (_jsxs("div", { style: { fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }, children: [_jsx("span", { style: { wordBreak: 'break-word' }, children: ex.name }), _jsxs("span", { style: { fontWeight: '600', flexShrink: 0 }, children: [ex.sets, "\u00D7", ex.reps] })] }, exIdx))) })] }, idx))) })] }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--clr-glass-border)' }, children: [_jsxs("button", { className: "btn btn-secondary flex-1", style: { fontSize: '0.85rem', padding: '0.5rem' }, onClick: () => {
                                        setSelectedTemplateForAssign({ id: t._id, type: 'workout', name: t.name });
                                        setIsAssignModalOpen(true);
                                    }, children: [_jsx(UserPlus, { size: 16 }), " Assign"] }), isAdmin && (_jsx("button", { className: "btn btn-icon danger", style: { width: '36px', height: '36px' }, onClick: () => deleteWorkoutPlan(t._id).then(fetchData), children: _jsx(Trash2, { size: 16 }) }))] })] }, t._id)))) : (_jsxs("div", { className: "glass-panel", style: { gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }, children: [_jsx(Dumbbell, { size: 48, className: "text-muted", style: { margin: '0 auto 1rem', opacity: 0.5 } }), _jsx("p", { className: "text-muted", children: "No workout templates found. Create your first one!" })] }))) : (dietTemplates.length > 0 ? (dietTemplates.map((t) => (_jsxs("div", { className: "glass-card", style: { padding: '1.5rem', display: 'flex', flexDirection: 'column', height: 'fit-content', minHeight: '280px' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', marginBottom: '0.75rem', alignItems: 'flex-start', gap: '1rem' }, children: [_jsx("h3", { style: { fontSize: '1.1rem', color: 'var(--clr-text-main)', wordBreak: 'break-word' }, children: t.name }), _jsx("span", { className: "status-badge active", style: { fontSize: '0.65rem', padding: '0.2rem 0.5rem', flexShrink: 0 }, children: t.goal })] }), _jsxs("p", { className: "text-muted", style: { fontSize: '0.8rem', marginBottom: '1rem' }, children: ["Target: ", t.calories, " kcal"] }), _jsxs("div", { style: { flex: 1, marginBottom: '1.5rem' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--clr-success)', fontSize: '0.85rem', marginBottom: '0.75rem', fontWeight: '600' }, children: [_jsx(Utensils, { size: 14 }), " Meal Breakdown"] }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem', maxHeight: '200px', overflowY: 'auto', paddingRight: '8px' }, children: ['breakfast', 'lunch', 'dinner', 'snacks'].map((meal) => (t.meals?.[meal]?.length > 0 && (_jsxs("div", { style: { borderLeft: '2px solid var(--clr-success)', paddingLeft: '0.75rem' }, children: [_jsx("p", { style: { fontWeight: '700', color: 'var(--clr-text-main)', fontSize: '0.8rem', marginBottom: '0.25rem', textTransform: 'capitalize' }, children: meal }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.2rem' }, children: t.meals[meal].map((item, itemIdx) => (_jsxs("div", { style: { fontSize: '0.75rem', color: 'var(--clr-text-muted)', display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }, children: [_jsx("span", { style: { wordBreak: 'break-word' }, children: item.foodName }), _jsx("span", { style: { flexShrink: 0 }, children: item.quantity })] }, itemIdx))) })] }, meal)))) })] }), _jsxs("div", { style: { display: 'flex', gap: '0.5rem', marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--clr-glass-border)' }, children: [_jsxs("button", { className: "btn btn-secondary flex-1", style: { fontSize: '0.85rem', padding: '0.5rem' }, onClick: () => {
                                        setSelectedTemplateForAssign({ id: t._id, type: 'diet', name: t.name });
                                        setIsAssignModalOpen(true);
                                    }, children: [_jsx(UserPlus, { size: 16 }), " Assign"] }), isAdmin && (_jsx("button", { className: "btn btn-icon danger", style: { width: '36px', height: '36px' }, onClick: () => deleteDietPlan(t._id).then(fetchData), children: _jsx(Trash2, { size: 16 }) }))] })] }, t._id)))) : (_jsxs("div", { className: "glass-panel", style: { gridColumn: '1 / -1', padding: '3rem', textAlign: 'center' }, children: [_jsx(Utensils, { size: 48, className: "text-muted", style: { margin: '0 auto 1rem', opacity: 0.5 } }), _jsx("p", { className: "text-muted", children: "No diet plans found. Create your first one!" })] }))) })), _jsx(Modal, { isOpen: isWorkoutModalOpen, onClose: () => setIsWorkoutModalOpen(false), title: "Create Workout Template", children: _jsxs("form", { onSubmit: handleCreateWorkout, style: { display: 'flex', flexDirection: 'column', height: '100%' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Plan Name" }), _jsx("input", { className: "form-input", required: true, value: workoutForm.name, onChange: e => setWorkoutForm({ ...workoutForm, name: e.target.value }), placeholder: "e.g. 5-Day Muscle Builder" })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Goal" }), _jsxs("select", { className: "form-input", value: workoutForm.goal, onChange: e => setWorkoutForm({ ...workoutForm, goal: e.target.value }), children: [_jsx("option", { children: "Fat Loss" }), _jsx("option", { children: "Muscle Gain" }), _jsx("option", { children: "Strength" }), _jsx("option", { children: "General Fitness" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Difficulty" }), _jsxs("select", { className: "form-input", value: workoutForm.difficulty, onChange: e => setWorkoutForm({ ...workoutForm, difficulty: e.target.value }), children: [_jsx("option", { children: "Beginner" }), _jsx("option", { children: "Intermediate" }), _jsx("option", { children: "Advanced" })] })] })] }), _jsx("div", { style: { paddingRight: '0.5rem' }, children: workoutForm.days.map((day, dIdx) => (_jsxs("div", { className: "glass-panel", style: { padding: '1rem', marginBottom: '1rem' }, children: [_jsx("input", { className: "form-input", style: { fontWeight: 700, marginBottom: '1rem', background: 'transparent', border: 'none', borderBottom: '1px solid var(--clr-glass-border)', borderRadius: 0 }, value: day.dayName, onChange: e => {
                                                    const newDays = [...workoutForm.days];
                                                    newDays[dIdx].dayName = e.target.value;
                                                    setWorkoutForm({ ...workoutForm, days: newDays });
                                                } }), day.exercises.map((ex, eIdx) => (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px dashed var(--clr-glass-border)', paddingBottom: '0.5rem' }, children: [_jsx("div", { className: "col-span-full md:col-span-2", children: _jsx("input", { className: "form-input", placeholder: "Exercise", value: ex.name, onChange: e => {
                                                                const newDays = [...workoutForm.days];
                                                                newDays[dIdx].exercises[eIdx].name = e.target.value;
                                                                setWorkoutForm({ ...workoutForm, days: newDays });
                                                            } }) }), _jsx("input", { className: "form-input", placeholder: "Sets", type: "number", value: ex.sets, onChange: e => {
                                                            const newDays = [...workoutForm.days];
                                                            newDays[dIdx].exercises[eIdx].sets = Number(e.target.value);
                                                            setWorkoutForm({ ...workoutForm, days: newDays });
                                                        } }), _jsx("input", { className: "form-input", placeholder: "Reps", value: ex.reps, onChange: e => {
                                                            const newDays = [...workoutForm.days];
                                                            newDays[dIdx].exercises[eIdx].reps = e.target.value;
                                                            setWorkoutForm({ ...workoutForm, days: newDays });
                                                        } }), _jsx("input", { className: "form-input", placeholder: "Rest", value: ex.rest, onChange: e => {
                                                            const newDays = [...workoutForm.days];
                                                            newDays[dIdx].exercises[eIdx].rest = e.target.value;
                                                            setWorkoutForm({ ...workoutForm, days: newDays });
                                                        } })] }, eIdx))), _jsx("button", { type: "button", className: "btn btn-secondary w-full", style: { fontSize: '0.8rem', padding: '0.4rem' }, onClick: () => addExercise(dIdx), children: "+ Add Exercise" })] }, dIdx))) }), _jsx("button", { type: "button", className: "btn btn-secondary w-full mb-4", onClick: addWorkoutDay, children: "+ Add Day" })] }), _jsx("div", { style: { marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--clr-glass-border)', position: 'sticky', bottom: 0, background: 'var(--clr-bg-sidebar)', zIndex: 10 }, children: _jsx("button", { className: "btn btn-primary w-full", type: "submit", children: "Save Template" }) })] }) }), _jsx(Modal, { isOpen: isDietModalOpen, onClose: () => setIsDietModalOpen(false), title: "Create Diet Template", children: _jsxs("form", { onSubmit: handleCreateDiet, style: { display: 'flex', flexDirection: 'column', height: '100%' }, children: [_jsxs("div", { style: { flex: 1 }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Plan Name" }), _jsx("input", { className: "form-input", required: true, value: dietForm.name, onChange: e => setDietForm({ ...dietForm, name: e.target.value }), placeholder: "e.g. High Protein Cutting" })] }), _jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '1rem', marginBottom: '1rem' }, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Goal" }), _jsxs("select", { className: "form-input", value: dietForm.goal, onChange: e => setDietForm({ ...dietForm, goal: e.target.value }), children: [_jsx("option", { children: "Weight Loss" }), _jsx("option", { children: "Muscle Gain" }), _jsx("option", { children: "Maintenance" })] })] }), _jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Calories" }), _jsx("input", { className: "form-input", type: "number", value: dietForm.calories, onChange: e => setDietForm({ ...dietForm, calories: Number(e.target.value) }) })] })] }), _jsx("div", { style: { paddingRight: '0.5rem' }, children: ['breakfast', 'lunch', 'dinner', 'snacks'].map((meal) => (_jsxs("div", { className: "glass-panel", style: { padding: '1rem', marginBottom: '1rem' }, children: [_jsx("h4", { style: { textTransform: 'capitalize', marginBottom: '1rem' }, children: meal }), dietForm.meals[meal].map((item, idx) => (_jsxs("div", { style: { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(80px, 1fr))', gap: '0.5rem', marginBottom: '1rem', borderBottom: '1px dashed var(--clr-glass-border)', paddingBottom: '0.5rem' }, children: [_jsx("div", { className: "col-span-full md:col-span-2", children: _jsx("input", { className: "form-input", placeholder: "Food Name", value: item.foodName, onChange: e => {
                                                                const newMeals = { ...dietForm.meals };
                                                                newMeals[meal][idx].foodName = e.target.value;
                                                                setDietForm({ ...dietForm, meals: newMeals });
                                                            } }) }), _jsx("input", { className: "form-input", placeholder: "Qty", value: item.quantity, onChange: e => {
                                                            const newMeals = { ...dietForm.meals };
                                                            newMeals[meal][idx].quantity = e.target.value;
                                                            setDietForm({ ...dietForm, meals: newMeals });
                                                        } }), _jsx("input", { className: "form-input", placeholder: "Kcal", type: "number", value: item.calories, onChange: e => {
                                                            const newMeals = { ...dietForm.meals };
                                                            newMeals[meal][idx].calories = Number(e.target.value);
                                                            setDietForm({ ...dietForm, meals: newMeals });
                                                        } })] }, idx))), _jsx("button", { type: "button", className: "btn btn-secondary w-full", style: { fontSize: '0.8rem', padding: '0.4rem' }, onClick: () => addMealItem(meal), children: "+ Add Item" })] }, meal))) })] }), _jsx("div", { style: { marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--clr-glass-border)', position: 'sticky', bottom: 0, background: 'var(--clr-bg-sidebar)', zIndex: 10 }, children: _jsx("button", { className: "btn btn-primary w-full", type: "submit", children: "Save Template" }) })] }) }), _jsxs(Modal, { isOpen: isAssignModalOpen, onClose: () => setIsAssignModalOpen(false), title: `Assign ${selectedTemplateForAssign?.name}`, children: [_jsxs("div", { className: "form-group", children: [_jsx("label", { className: "form-label", children: "Search Member" }), _jsxs("div", { className: "search-bar", children: [_jsx(Search, { size: 18 }), _jsx("input", { placeholder: "Member name or email...", value: memberSearch, onChange: e => setMemberSearch(e.target.value) })] })] }), _jsx("div", { style: { maxHeight: '300px', overflowY: 'auto', marginTop: '1rem' }, children: members.map(m => (_jsxs("div", { className: "glass-panel", style: { padding: '1rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem', cursor: 'pointer' }, onClick: () => handleAssign(m._id), children: [_jsxs("div", { children: [_jsx("p", { style: { fontWeight: 600 }, children: m.user?.name }), _jsx("p", { className: "text-muted", style: { fontSize: '0.8rem' }, children: m.user?.email })] }), _jsx("button", { className: "btn-icon", style: { background: 'var(--clr-primary)', color: 'white' }, disabled: isAssigning, children: _jsx(Plus, { size: 16 }) })] }, m._id))) })] })] }));
};
const MemberView = () => {
    const [workout, setWorkout] = useState(null);
    const [diet, setDiet] = useState(null);
    const [loading, setLoading] = useState(true);
    useEffect(() => {
        Promise.all([getMyWorkout(), getMyDiet()])
            .then(([wRes, dRes]) => {
            setWorkout(wRes?.data?.data ?? null);
            setDiet(dRes?.data?.data ?? null);
        })
            .catch(() => {
            setWorkout(null);
            setDiet(null);
        })
            .finally(() => setLoading(false));
    }, []);
    if (loading)
        return _jsx("div", { className: "loading-state", children: _jsx("div", { className: "spinner" }) });
    const workoutDays = Array.isArray(workout?.days) ? workout.days : [];
    const mealItems = (meal) => {
        const meals = diet?.meals;
        const items = meals && typeof meals === 'object' ? meals[meal] : undefined;
        return Array.isArray(items) ? items : [];
    };
    return (_jsxs("div", { className: "grid-cards", style: { gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 350px), 1fr))', gap: '1.5rem' }, children: [_jsxs("div", { className: "glass-panel", style: { padding: 'var(--sp-lg)', height: 'fit-content', minHeight: '300px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }, children: [_jsx("div", { className: "stat-icon", style: { background: 'rgba(139, 92, 246, 0.1)', color: 'var(--clr-primary)', width: '40px', height: '40px', flexShrink: 0 }, children: _jsx(Dumbbell, { size: 20 }) }), _jsx("h2", { style: { fontSize: '1.25rem' }, children: "My Workout Plan" })] }), !workout ? _jsx("p", { className: "text-muted", children: "No workout assigned yet." }) : (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' }, children: [_jsx("h3", { style: { marginBottom: '0.5rem', color: 'var(--clr-text-main)' }, children: workout.name }), workoutDays.map((day, i) => (_jsxs("div", { className: "glass-panel", style: { padding: '1rem', background: 'rgba(255,255,255,0.02)' }, children: [_jsx("h4", { style: { color: 'var(--clr-primary)', marginBottom: '1rem', borderBottom: '1px solid var(--clr-glass-border)', paddingBottom: '0.5rem' }, children: day.dayName }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.75rem' }, children: (Array.isArray(day?.exercises) ? day.exercises : []).map((ex, j) => (_jsxs("div", { style: { padding: '0.75rem', borderBottom: '1px solid var(--clr-glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }, children: [_jsxs("div", { style: { minWidth: 0 }, children: [_jsx("p", { style: { fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.25rem', wordBreak: 'break-word' }, children: ex.name }), _jsxs("p", { className: "text-muted", style: { fontSize: '0.75rem' }, children: ["Rest: ", ex.rest] })] }), _jsx("div", { style: { textAlign: 'right', flexShrink: 0 }, children: _jsxs("p", { style: { fontWeight: 700, fontSize: '0.9rem', color: 'var(--clr-primary)' }, children: [ex.sets, " \u00D7 ", ex.reps] }) })] }, j))) })] }, i)))] }))] }), _jsxs("div", { className: "glass-panel", style: { padding: 'var(--sp-lg)', height: 'fit-content', minHeight: '300px' }, children: [_jsxs("div", { style: { display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }, children: [_jsx("div", { className: "stat-icon", style: { background: 'rgba(16, 185, 129, 0.1)', color: 'var(--clr-success)', width: '40px', height: '40px', flexShrink: 0 }, children: _jsx(Utensils, { size: 20 }) }), _jsx("h2", { style: { fontSize: '1.25rem' }, children: "My Diet Plan" })] }), !diet ? _jsx("p", { className: "text-muted", children: "No diet assigned yet." }) : (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', gap: '1.5rem' }, children: [_jsxs("div", { style: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }, children: [_jsx("h3", { style: { color: 'var(--clr-text-main)' }, children: diet.name }), _jsxs("span", { className: "status-badge active", style: { fontSize: '0.8rem' }, children: [diet.calories, " kcal"] })] }), ['breakfast', 'lunch', 'dinner', 'snacks'].map((meal) => (_jsxs("div", { className: "glass-panel", style: { padding: '1rem', background: 'rgba(255,255,255,0.02)' }, children: [_jsx("h4", { style: { textTransform: 'capitalize', marginBottom: '1rem', color: 'var(--clr-success)', borderBottom: '1px solid var(--clr-glass-border)', paddingBottom: '0.5rem' }, children: meal }), _jsx("div", { style: { display: 'flex', flexDirection: 'column', gap: '0.5rem' }, children: mealItems(meal).map((item, i) => (_jsxs("div", { style: { padding: '0.5rem 0', borderBottom: '1px solid var(--clr-glass-border)', display: 'flex', justifyContent: 'space-between', gap: '1rem' }, children: [_jsx("p", { style: { fontSize: '0.9rem', wordBreak: 'break-word' }, children: item.foodName }), _jsx("p", { className: "text-muted", style: { fontSize: '0.85rem', textAlign: 'right', flexShrink: 0 }, children: item.quantity })] }, i))) })] }, meal)))] }))] })] }));
};
export default WorkoutsPage;
