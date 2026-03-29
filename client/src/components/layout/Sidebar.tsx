import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  UserSquare2, 
  CreditCard, 
  CalendarCheck, 
  Settings, 
  LogOut,
  Dumbbell,
  ClipboardList
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { logout as logoutApi } from '../../features/auth/auth.api';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const onLogout = async () => {
    try {
      await logoutApi();
    } catch (error) {
      console.error('Logout failed', error);
    }
    logout();
    navigate('/login');
  };

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['admin', 'trainer'] },
    { name: 'Members', path: '/members', icon: <Users size={20} />, roles: ['admin', 'trainer'] },
    { name: 'Trainers', path: '/trainers', icon: <UserSquare2 size={20} />, roles: ['admin'] },
    { name: 'Plans', path: '/plans', icon: <ClipboardList size={20} />, roles: ['admin'] },
    { name: 'Attendance', path: '/attendance', icon: <CalendarCheck size={20} />, roles: ['admin', 'trainer'] },
    { name: 'Workouts & Diet', path: '/workouts', icon: <Dumbbell size={20} />, roles: ['admin', 'trainer', 'member'] },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={20} />, roles: ['admin', 'member'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <Dumbbell className="text-primary" />
        <span className="text-gradient">Gymza</span>
      </div>

      <nav className="sidebar-nav">
        {filteredNavItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Settings size={20} />
          <span>Settings</span>
        </NavLink>
        <button onClick={onLogout} className="nav-item" style={{ width: '100%', textAlign: 'left' }}>
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
