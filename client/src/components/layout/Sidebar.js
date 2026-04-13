import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Users, UserSquare2, CreditCard, CalendarCheck, Settings, LogOut, Dumbbell, ClipboardList, X } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';
import { logout as logoutApi } from '../../features/auth/auth.api';
const Sidebar = ({ isOpen, onClose }) => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const onLogout = async () => {
        try {
            await logoutApi();
        }
        catch (error) {
            console.error('Logout failed', error);
        }
        logout();
        navigate('/login');
    };
    const navItems = [
        { name: 'Dashboard', path: '/', icon: _jsx(LayoutDashboard, { size: 20 }), roles: ['admin', 'trainer'] },
        { name: 'Members', path: '/members', icon: _jsx(Users, { size: 20 }), roles: ['admin', 'trainer'] },
        { name: 'Trainers', path: '/trainers', icon: _jsx(UserSquare2, { size: 20 }), roles: ['admin'] },
        { name: 'Plans', path: '/plans', icon: _jsx(ClipboardList, { size: 20 }), roles: ['admin'] },
        { name: 'Attendance', path: '/attendance', icon: _jsx(CalendarCheck, { size: 20 }), roles: ['admin', 'trainer'] },
        { name: 'Workouts & Diet', path: '/workouts', icon: _jsx(Dumbbell, { size: 20 }), roles: ['admin', 'trainer', 'member'] },
        { name: 'Payments', path: '/payments', icon: _jsx(CreditCard, { size: 20 }), roles: ['admin', 'member'] },
    ];
    const filteredNavItems = navItems.filter(item => !item.roles || (user && item.roles.includes(user.role)));
    return (_jsxs("aside", { className: `sidebar ${isOpen ? 'open' : ''}`, children: [_jsxs("div", { className: "sidebar-header", children: [_jsxs("div", { className: "sidebar-logo", children: [_jsx(Dumbbell, { className: "text-primary" }), _jsx("span", { className: "text-gradient", children: "Gymza" })] }), _jsx("button", { className: "sidebar-close-btn", onClick: onClose, children: _jsx(X, { size: 24 }) })] }), _jsx("nav", { className: "sidebar-nav", children: filteredNavItems.map((item) => (_jsxs(NavLink, { to: item.path, className: ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`, onClick: onClose, children: [item.icon, _jsx("span", { children: item.name })] }, item.path))) }), _jsxs("div", { className: "sidebar-footer", children: [_jsxs(NavLink, { to: "/settings", className: ({ isActive }) => `nav-item ${isActive ? 'active' : ''}`, onClick: onClose, children: [_jsx(Settings, { size: 20 }), _jsx("span", { children: "Settings" })] }), _jsxs("button", { onClick: onLogout, className: "nav-item", style: { width: '100%', textAlign: 'left' }, children: [_jsx(LogOut, { size: 20 }), _jsx("span", { children: "Logout" })] })] })] }));
};
export default Sidebar;
