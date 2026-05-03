import { NavLink, useNavigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => { logout(); navigate('/login'); };

  const initials = (name) => name?.split(' ').map(w => w[0]).join('').slice(0,2).toUpperCase();

  return (
    <aside className="sidebar">
      <div className="sidebar-logo">Task<span>Flow</span></div>

      <div className="sidebar-user">
        <div className="avatar" style={{ background: user?.color }}>
          {initials(user?.name)}
        </div>
        <div>
          <div className="user-name">{user?.name}</div>
          <div className="user-role">{user?.role}</div>
        </div>
      </div>

      <nav className="sidebar-nav">
        <NavLink to="/"        className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'} end>Dashboard</NavLink>
        <NavLink to="/projects" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Projects</NavLink>
        <NavLink to="/tasks"   className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>My Tasks</NavLink>
        <NavLink to="/board"   className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Board</NavLink>
        {user?.role === 'admin' && (
          <NavLink to="/members" className={({isActive}) => isActive ? 'nav-item active' : 'nav-item'}>Members</NavLink>
        )}
      </nav>

      <button className="logout-btn" onClick={handleLogout}>Sign out</button>
    </aside>
  );
}