import React from 'react';
import { Search, Bell, Moon, Sun, Menu } from 'lucide-react';
import { useAuthStore } from '../../store/auth.store';

interface HeaderProps {
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  toggleSidebar: () => void;
}

const Header: React.FC<HeaderProps> = ({ theme, toggleTheme, toggleSidebar }) => {
  const { user } = useAuthStore();

  return (
    <header className="top-nav">
      <div className="nav-left">
        <button className="icon-btn mobile-menu-btn" onClick={toggleSidebar}>
          <Menu size={24} />
        </button>
        <div className="search-bar">
          <Search size={18} className="text-muted" />
          <input type="text" placeholder="Search members, classes..." />
        </div>
      </div>

      <div className="nav-right">
        <button className="icon-btn" onClick={toggleTheme}>
          {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <button className="icon-btn">
          <Bell size={20} />
          {/* <span className="badge">3</span> */}
        </button>
        
        <div className="user-profile">
          <div className="avatar">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="user-info">
            <span className="user-name">{user?.name || 'User'}</span>
            <span className="user-role">{user?.role || 'Guest'}</span>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
