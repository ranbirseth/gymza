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
  ClipboardList,
  X
} from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { logout as logoutApi } from '../../features/auth/auth.api';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
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
    { name: 'My Attendance', path: '/my-attendance', icon: <CalendarCheck size={20} />, roles: ['member'] },
    { name: 'Workouts & Diet', path: '/workouts', icon: <Dumbbell size={20} />, roles: ['admin', 'trainer', 'member'] },
    { name: 'Payments', path: '/payments', icon: <CreditCard size={20} />, roles: ['admin', 'member'] },
  ];

  const filteredNavItems = navItems.filter(item => 
    !item.roles || (user && item.roles.includes(user.role))
  );

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="sidebar-logo">
          <Dumbbell className="text-primary" />
          <span className="text-gradient">Gymza</span>
        </div>
        <button className="sidebar-close-btn" onClick={onClose}>
          <X size={24} />
        </button>
      </div>

      <nav className="sidebar-nav">
        {filteredNavItems.map((item) => (
          <NavLink 
            key={item.path} 
            to={item.path} 
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            onClick={onClose}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-footer">
        <NavLink to="/settings" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
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
