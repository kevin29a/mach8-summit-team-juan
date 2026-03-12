import { useAuth } from '../context/AuthContext';
import { MdCode } from 'react-icons/md';
import { Link } from 'react-router-dom';

export default function Header() {
  const { isAuthenticated, user, logout } = useAuth();

  return (
    <div className="header-container">
      {/* Main Header Area */}
      <header className="main-header">
        <div className="logo-section">
          <div className="logo-icon-container">
            <MdCode size={24} color="#00d8ff" />
          </div>
          <span className="logo-text">Avanzatechblog</span>
        </div>

        <div className="auth-section">
          {isAuthenticated ? (
            <div className="user-greeting">
              Welcome, {user?.first_name ? `${user.first_name} ${user?.last_name || ''}`.trim() : user?.username}
              <button onClick={logout} className="logout-link">Logout</button>
            </div>
          ) : (
            <div className="auth-links">
              <Link to="/login">Login</Link>
              <span className="divider">|</span>
              <Link to="/register">Register</Link>
            </div>
          )}
        </div>
      </header>
    </div>
  );
}
