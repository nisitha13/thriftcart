import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, ShoppingCart } from 'lucide-react';
import { Outlet } from 'react-router-dom';

interface LayoutProps {
  showHeader?: boolean;
}

const Layout: React.FC<LayoutProps> = ({ showHeader = true }) => {
  const { user, logOut } = useAuth();
  const navigate = useNavigate();

  const handleLogoClick = () => {
    navigate('/categories');
  };

  const handleLogout = async () => {
    try {
      await logOut();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      {showHeader && (
        <header className="bg-black/50 backdrop-blur-md border-b border-gray-700/50 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
              <div 
                className="flex items-center space-x-2 cursor-pointer hover:opacity-80 transition-opacity"
                onClick={handleLogoClick}
              >
                <ShoppingCart className="h-8 w-8 text-lavender-400" />
                <span className="text-2xl font-bold bg-gradient-to-r from-lavender-400 to-lavender-600 bg-clip-text text-transparent">
                  ThrifCart
                </span>
              </div>
              
              {user && (
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => navigate('/profile')}
                      className="flex items-center space-x-2 hover:opacity-80 transition-opacity"
                      title="View Profile"
                    >
                      <img 
                        src={user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=7e22ce&color=fff`} 
                        alt={user.displayName || 'User'}
                        className="w-8 h-8 rounded-full border-2 border-lavender-400"
                      />
                      <span className="text-white font-medium hidden sm:inline">{user.displayName || 'User'}</span>
                    </button>
                  </div>
                  <button
                    onClick={handleLogout}
                    className="p-2 text-gray-400 hover:text-white transition-colors"
                    title="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>
      )}
      <main className="flex-1">
        <Outlet /> {/* Magic spot where child routes appear ✨ */}
      </main>
    </div>
  );
};

export default Layout;
