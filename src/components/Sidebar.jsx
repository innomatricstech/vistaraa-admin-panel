import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderOpen,
  Layers,
  Layers3,
  Tag,
  ShoppingCart,
  Ticket,
  Image,
  User,
  Users,
  UserCheck,
  Upload,
  X,
  Code,
  Package,
} from 'lucide-react';

// Modern UI: glassmorphism, neon accents, smooth transitions, unique gradient
// Color palette → Indigo + Violet glow

const Sidebar = ({ isOpen, onClose }) => {
  const menuItems = [
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/products', icon: FolderOpen, label: 'Products' },
    { path: '/category', icon: Layers, label: 'Category' },
    { path: '/sub-category', icon: Layers, label: 'Sub Category' },
    { path: '/sub-under-category', icon: Layers3, label: 'Sub Under Category' },
    { path: '/brands', icon: Tag, label: 'Brands' },
    { path: '/orders', icon: ShoppingCart, label: 'Orders' },
    { path: '/sellers', icon: Users, label: 'Seller' },
    { path: '/customers', icon: UserCheck, label: 'Customers' },
    { path: '/coupons', icon: Ticket, label: 'Coupons' },
    { path: '/posters', icon: Image, label: 'Posters' },
    { path: '/json-upload', icon: Upload, label: 'JSON Upload' },
    { path: '/python-automation', icon: Code, label: 'Python Automation' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div
        className={`w-64 bg-gradient-to-b from-[#1f1b2e] via-[#14121d] to-[#0d0b14] text-white h-full fixed left-0 top-0 overflow-y-auto z-50 border-r border-white/10 shadow-2xl shadow-indigo-800/20 transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10 bg-white/5 backdrop-blur-xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-600/40">
                <span className="text-lg font-bold text-white">V</span>
              </div>
              <span className="text-xl font-bold tracking-wide bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
                Vistaraa
              </span>
            </div>

            <button
              onClick={onClose}
              className="lg:hidden p-1 rounded-md hover:bg-white/10 transition-colors"
            >
              <X size={20} className="text-gray-300" />
            </button>
          </div>
        </div>

        {/* Menu */}
        <nav className="mt-6">
          <ul className="space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    className={({ isActive }) =>
                      `group flex items-center space-x-3 px-3 py-2.5 rounded-lg transition-all duration-200 relative overflow-hidden ${
                        isActive
                          ? 'bg-indigo-600 text-white shadow-md shadow-indigo-700/40'
                          : 'text-gray-300 hover:bg-white/10 hover:text-white'
                      }`
                    }
                  >
                    {/* Glow effect */}
                    <span className="absolute inset-0 opacity-0 group-hover:opacity-30 bg-gradient-to-r from-indigo-500 to-purple-600 blur-xl transition-opacity"></span>

                    <Icon size={20} className="relative z-10" />
                    <span className="font-medium relative z-10">{item.label}</span>
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
    </>
  );
};

export default Sidebar;
