import { Outlet, NavLink, useNavigate } from 'react-router';
import { BookOpen, Users, LayoutDashboard, LogOut, ShieldCheck, Menu, X, AlertTriangle, User } from 'lucide-react';
import { useState } from 'react';
import { Toaster } from 'sonner';
import { useApp } from '../context/AppContext';

export function AdminLayout() {
  const { logout, getAllConflicts } = useApp();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const conflicts = getAllConflicts();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const navItems = [
    { to: '/admin', label: 'Dashboard', icon: LayoutDashboard, end: true },
    { to: '/admin/courses', label: 'Manage Courses', icon: BookOpen, end: false },
    { to: '/admin/registrations', label: 'Registrations', icon: Users, end: false },
  ];

  const Sidebar = () => (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-slate-700/50">
        <div className="w-9 h-9 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
          <ShieldCheck className="w-4 h-4 text-white" />
        </div>
        <div>
          <p className="text-white text-sm" style={{ fontWeight: 700 }}>CourseSync</p>
          <p className="text-emerald-400 text-xs">Admin Panel</p>
        </div>
      </div>

      {/* Admin Info */}
      <NavLink
        to="/admin/profile"
        onClick={() => setSidebarOpen(false)}
        className="block px-4 py-4 border-b border-slate-700/50 hover:bg-slate-700/30 transition-colors cursor-pointer"
      >
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-emerald-600 rounded-full flex items-center justify-center text-white text-xs flex-shrink-0" style={{ fontWeight: 700 }}>
            SA
          </div>
          <div className="flex-1">
            <p className="text-white text-sm" style={{ fontWeight: 600 }}>System Admin</p>
            <p className="text-slate-400 text-xs">admin@university.edu</p>
          </div>
          <User className="w-4 h-4 text-slate-400 flex-shrink-0" />
        </div>
      </NavLink>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setSidebarOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors ${
                isActive
                  ? 'bg-emerald-600 text-white'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700/50'
              }`
            }
          >
            <item.icon className="w-4 h-4 flex-shrink-0" />
            {item.label}
            {item.label === 'Registrations' && conflicts.length > 0 && (
              <span className="ml-auto bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center" style={{ fontWeight: 700 }}>
                {conflicts.length}
              </span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* Conflicts Alert */}
      {conflicts.length > 0 && (
        <div className="mx-3 mb-3 p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <p className="text-amber-300 text-xs" style={{ fontWeight: 600 }}>
              {conflicts.length} Active Conflict{conflicts.length > 1 ? 's' : ''}
            </p>
          </div>
          <p className="text-amber-400/70 text-xs mt-1">Requires resolution</p>
        </div>
      )}

      {/* Logout */}
      <div className="px-3 pb-4">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-400 hover:text-white hover:bg-slate-700/50 transition-colors"
        >
          <LogOut className="w-4 h-4" />
          Sign Out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-60 bg-slate-900 flex-shrink-0">
        <Sidebar />
      </aside>

      {/* Mobile Sidebar Overlay */}
      {sidebarOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div className="fixed inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <aside className="relative w-60 bg-slate-900 flex flex-col">
            <button
              onClick={() => setSidebarOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            <Sidebar />
          </aside>
        </div>
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden flex items-center gap-3 px-4 py-3 bg-white border-b border-slate-200">
          <button onClick={() => setSidebarOpen(true)} className="text-slate-600">
            <Menu className="w-5 h-5" />
          </button>
          <span className="text-slate-900 text-sm" style={{ fontWeight: 600 }}>CourseSync Admin</span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>

      <Toaster position="top-right" richColors />
    </div>
  );
}