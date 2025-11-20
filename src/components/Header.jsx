import React, { useState, useEffect } from 'react';
import { ChevronDown, User, LogOut, UserCircle, Menu, ShoppingBag, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Updated UI: modern gradients, glassmorphism, smoother transitions
// Improved color combinations with teal → indigo palette

const Header = ({ onToggleSidebar, setIsAuthenticated }) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [userData, setUserData] = useState({ name: 'Support Admin', email: 'support@vistaraa.com' });
  const navigate = useNavigate();

  useEffect(() => {
    const storedUserData = localStorage.getItem('userData');
    if (storedUserData) {
      const parsedData = JSON.parse(storedUserData);
      setUserData({
        name: parsedData.name || 'Support Admin',
        email: parsedData.email || 'support@vistaraa.com'
      });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    setIsAuthenticated(false);
    navigate('/login');
  };

  return (
    <header className="bg-gradient-to-r from-[#1e3c72] via-[#2a5298] to-[#1e3c72] backdrop-blur-xl border-b border-white/10 px-6 py-4 sticky top-0 z-40 shadow-lg">
      <div className="flex items-center justify-between">
        {/* Left Section */}
        <div className="flex items-center space-x-4">
          <button 
            onClick={onToggleSidebar}
            className="lg:hidden p-2 rounded-xl bg-white/5 hover:bg-white/10 transition-colors shadow-md"
          >
            <Menu size={20} className="text-teal-300" />
          </button>

          <div className="flex items-center space-x-3">
            <div className="w-11 h-11 bg-gradient-to-br from-teal-400 to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/40">
              <ShoppingBag size={22} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-extrabold bg-gradient-to-r from-teal-300 to-indigo-400 bg-clip-text text-transparent tracking-wide">
                Vistaraa
              </h1>
              <p className="text-gray-400 text-sm">Admin Dashboard</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className="flex items-center space-x-4">
          <div className="relative">
            {/* <button 
              className="flex items-center space-x-3 bg-white/10 hover:bg-white/20 px-3 py-2 rounded-xl transition-all duration-300 border border-white/10 hover:border-white/20 shadow-md"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="w-9 h-9 bg-gradient-to-br from-teal-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                <User size={16} className="text-white" />
              </div>

              <div className="hidden sm:block text-left">
                <div className="text-white font-semibold text-sm">{userData.name}</div>
                <div className="text-gray-300 text-xs">{userData.email}</div>
              </div>

              <ChevronDown 
                size={16} 
                className={`text-gray-300 transition-transform duration-300 ${isDropdownOpen ? 'rotate-180' : ''} hidden sm:block`} 
              />
            </button> */}

            {isDropdownOpen && (
              <div className="absolute right-0 mt-3 w-68 bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/10 z-50 p-2 animate-in fade-in slide-in-from-top-3">
                {/* User Info */}
                <div className="p-4 border-b border-white/10">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-br from-teal-400 to-indigo-500 rounded-full flex items-center justify-center shadow-md">
                      <User size={20} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-bold truncate">{userData.name}</p>
                      <p className="text-gray-300 text-sm truncate">{userData.email}</p>
                    </div>
                  </div>
                </div>

                {/* Menu Items */}
                <div className="p-2 space-y-1">
                  <button 
                    onClick={() => { navigate('/profile'); setIsDropdownOpen(false); }}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-all"
                  >
                    <UserCircle size={18} />
                    <span>My Profile</span>
                  </button>

                  <button 
                    onClick={() => { navigate('/settings'); setIsDropdownOpen(false); }}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-all"
                  >
                    <Settings size={18} />
                    <span>Settings</span>
                  </button>

                  <button 
                    onClick={() => { navigate('/orders'); setIsDropdownOpen(false); }}
                    className="w-full flex items-center space-x-3 px-3 py-2 text-gray-300 hover:bg-white/10 hover:text-white rounded-lg transition-all"
                  >
                    <ShoppingBag size={18} />
                    <span>Order Management</span>
                  </button>

                  {/* Logout */}
                  <div className="border-t border-white/10 mt-2 pt-2">
                    <button 
                      onClick={handleLogout}
                      className="w-full flex items-center space-x-3 px-3 py-2 text-red-400 hover:bg-red-500/20 hover:text-red-300 rounded-lg transition-all"
                    >
                      <LogOut size={18} />
                      <span>Logout</span>
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
