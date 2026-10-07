import React, {
  useState, useEffect, useRef, useCallback, useMemo, createContext, useContext,
} from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Users, FileText, Activity, TrendingUp, LogOut, Menu, X, Shield, Flag,
} from 'lucide-react';
import { useAdminContext } from '../Context/AdminContext';

/* ─────────────────────────────────────────────
   AdminLayout

   One shared shell for every admin page: sidebar, mobile menu, login guard,
   toast and confirm dialog. Each admin page is rendered inside <Outlet />,
   so the sidebar stays on screen and only the content swaps - while every
   page still has its own real URL (/admin-users, /admin-reports ...), which
   keeps the browser Back button, refresh, bookmarks and links working.

   This replaces ~100 lines of identical sidebar code that used to be
   copy-pasted into four different pages (and was missing from Reports).
───────────────────────────────────────────── */

const NAV_ITEMS = [
  { key: 'dashboard', label: 'Dashboard', icon: Activity, to: '/admin-dashboard' },
  { key: 'users', label: 'Users', icon: Users, to: '/admin-users' },
  { key: 'posts', label: 'Posts', icon: FileText, to: '/admin-posts' },
  { key: 'reports', label: 'Reports', icon: Flag, to: '/admin-reports' },
  { key: 'analytics', label: 'Analytics', icon: TrendingUp, to: '/admin-analytics' },
];

/* Shared helpers used by the admin pages */

// Works whether the backend stores "/uploads/x.png", "x.png" or a full URL
export const resolveImage = (path) => {
  if (!path) return null;
  if (path.startsWith('http')) return path;
  if (path.startsWith('/')) return `${import.meta.env.VITE_BACKEND_URL}${path}`;
  return `${import.meta.env.VITE_BACKEND_URL}/uploads/${path}`;
};

// Returns `value` only after it has stopped changing for `delay` ms.
// Used so typing in a search box doesn't hit the server on every keystroke.
export const useDebouncedValue = (value, delay = 400) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
};

/* toast() and confirm() for admin pages.
   If a page is ever rendered outside the layout, these safe fallbacks keep it
   from crashing. */
const AdminUIContext = createContext({
  toast: (message) => console.log(message),
  confirm: (message) => Promise.resolve(window.confirm(message)),
});

export const useAdminUI = () => useContext(AdminUIContext);

const AdminLayout = () => {
  const { admin, logout } = useAdminContext();
  const navigate = useNavigate();
  const { pathname } = useLocation();

  const [showSidebar, setShowSidebar] = useState(false);
  const [toastState, setToastState] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const toastTimer = useRef(null);
  const confirmResolveRef = useRef(null);

  // Only redirect if there is no admin AND no token
  useEffect(() => {
    if (admin) return;
    const token = localStorage.getItem('adminToken');
    if (!token) navigate('/admin-login');
  }, [admin, navigate]);

  // Close the mobile menu whenever you move to another page
  useEffect(() => { setShowSidebar(false); }, [pathname]);

  useEffect(() => () => clearTimeout(toastTimer.current), []);

  const toast = useCallback((message, type = 'success', persistent = false) => {
    clearTimeout(toastTimer.current);
    setToastState({ message, type, persistent });
    if (!persistent) {
      toastTimer.current = setTimeout(() => setToastState(null), 3000);
    }
  }, []);

  // confirm('Delete this post?') -> Promise<boolean>
  const confirm = useCallback((message, options = {}) => (
    new Promise((resolve) => {
      confirmResolveRef.current?.(false); // an older unanswered dialog counts as "cancel"
      confirmResolveRef.current = resolve;
      setConfirmState({
        message,
        title: options.title || 'Please confirm',
        confirmText: options.confirmText || 'Confirm',
      });
    })
  ), []);

  const closeConfirm = (result) => {
    confirmResolveRef.current?.(result);
    confirmResolveRef.current = null;
    setConfirmState(null);
  };

  // Escape closes the confirm dialog first, then the mobile menu
  useEffect(() => {
    if (!confirmState && !showSidebar) return;
    const onKeyDown = (e) => {
      if (e.key !== 'Escape') return;
      if (confirmState) closeConfirm(false);
      else setShowSidebar(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [confirmState, showSidebar]);

  const handleLogout = async () => {
    const ok = await confirm('Are you sure you want to log out?', {
      title: 'Log Out',
      confirmText: 'Log Out',
    });
    if (!ok) return;
    await logout();
    navigate('/admin-login');
  };

  const uiValue = useMemo(() => ({ toast, confirm }), [toast, confirm]);

  return (
    <AdminUIContext.Provider value={uiValue}>
      <div className="min-h-screen bg-[#0a0a0f]">
        {/* Mobile Menu Button */}
        <button
          onClick={() => setShowSidebar(!showSidebar)}
          aria-label={showSidebar ? 'Close menu' : 'Open menu'}
          aria-expanded={showSidebar}
          className="lg:hidden fixed top-4 left-4 z-50 p-2.5 bg-[#0f0f1a] border border-[rgba(255,255,255,0.07)] rounded-lg text-[rgba(255,255,255,0.4)]"
        >
          {showSidebar ? <X size={18} /> : <Menu size={18} />}
        </button>

        {/* Mobile backdrop - tap outside the menu to close it */}
        {showSidebar && (
          <div
            className="lg:hidden fixed inset-0 bg-black/50 z-30"
            onClick={() => setShowSidebar(false)}
          />
        )}

        {/* Sidebar
            (when closed on mobile it is also `invisible`, so keyboard users
            can't Tab into menu items they can't see) */}
        <div className={`
          fixed top-0 left-0 h-full w-64 bg-[#0f0f1a] border-r border-[rgba(255,255,255,0.07)] z-40
          transform transition-[transform,visibility] duration-200 lg:translate-x-0 lg:visible
          ${showSidebar ? 'translate-x-0 visible' : '-translate-x-full invisible'}
        `}>
          <div className="p-5 flex flex-col h-full">
            {/* Logo */}
            <div className="flex items-center gap-2.5 mb-8 px-1">
              <div className="w-8 h-8 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.07)] rounded-lg flex items-center justify-center">
                <Shield size={16} className="text-[rgba(255,255,255,0.4)]" />
              </div>
              <div>
                <h2 className="text-[#f1f5f9] font-semibold text-sm leading-tight">FindOut</h2>
                <p className="text-[rgba(255,255,255,0.2)] text-xs leading-tight">Admin</p>
              </div>
            </div>

            {/* Admin Info */}
            <div className="bg-[rgba(255,255,255,0.03)] border border-[rgba(255,255,255,0.07)] rounded-xl p-3.5 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-[rgba(255,255,255,0.06)] border border-[rgba(255,255,255,0.07)] rounded-full flex items-center justify-center flex-shrink-0">
                  <span className="text-[#f1f5f9] font-semibold text-xs">
                    {admin?.name?.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[#f1f5f9] font-medium text-sm truncate">{admin?.name}</p>
                  <p className="text-[rgba(255,255,255,0.2)] text-xs truncate">{admin?.email}</p>
                </div>
              </div>
              {admin?.isSuperAdmin && (
                <div className="mt-3 pt-3 border-t border-[rgba(255,255,255,0.07)]">
                  <span className="inline-flex items-center gap-1.5 text-xs text-[rgba(251,191,36,0.9)]">
                    <Shield size={12} />
                    Super Admin
                  </span>
                </div>
              )}
            </div>

            {/* Navigation */}
            <nav className="space-y-0.5 flex-1">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                const active = pathname === item.to;
                return (
                  <button
                    key={item.key}
                    onClick={() => navigate(item.to)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors border-l-2 ${
                      active
                        ? 'text-[#f1f5f9] bg-[rgba(255,255,255,0.05)] border-[#6366f1]'
                        : 'text-[rgba(255,255,255,0.4)] hover:text-[#f1f5f9] hover:bg-[rgba(255,255,255,0.03)] border-transparent'
                    }`}
                  >
                    <Icon size={17} />
                    {item.label}
                  </button>
                );
              })}
            </nav>

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-3 py-2.5 text-[rgba(255,255,255,0.2)] hover:text-[#ef4444] hover:bg-[rgba(239,68,68,0.1)] rounded-lg transition-colors text-sm font-medium"
            >
              <LogOut size={17} />
              Logout
            </button>
          </div>
        </div>

        {/* Main Content - the current admin page is rendered here.
            pt-16 on mobile keeps the title clear of the fixed menu button. */}
        <div className="lg:ml-64 px-4 pt-16 pb-6 lg:px-10 lg:py-10">
          <Outlet />
        </div>

        {/* Toast */}
        {toastState && (
          <div
            role={toastState.type === 'error' ? 'alert' : 'status'}
            className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] flex items-center gap-3 px-5 py-3 rounded-xl text-sm font-medium max-w-[90vw]"
            style={{
              background: toastState.type === 'error' ? '#dc2626' : '#0f0f1a',
              border: toastState.type === 'error' ? 'none' : '1px solid rgba(99,102,241,0.3)',
              color: '#fff',
              boxShadow: '0 8px 24px rgba(0,0,0,0.4)',
            }}
          >
            <span className="break-words">{toastState.message}</span>
            {toastState.persistent && (
              <button onClick={() => setToastState(null)} className="text-xs underline flex-shrink-0" style={{ color: 'rgba(255,255,255,0.7)' }}>
                Dismiss
              </button>
            )}
          </div>
        )}

        {/* Confirm dialog (replaces the browser's window.confirm) */}
        {confirmState && (
          <div
            className="fixed inset-0 z-[10000] flex items-center justify-center bg-black/70 backdrop-blur-sm p-4"
            onClick={() => closeConfirm(false)}
          >
            <div
              role="dialog"
              aria-modal="true"
              aria-label={confirmState.title}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-sm rounded-2xl p-6"
              style={{ background: '#0f0f1a', border: '1px solid rgba(255,255,255,0.08)', boxShadow: '0 24px 60px rgba(0,0,0,0.6)' }}
            >
              <h3 className="text-base font-semibold mb-2" style={{ color: '#f1f5f9' }}>{confirmState.title}</h3>
              <p className="text-sm mb-6" style={{ color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>{confirmState.message}</p>
              <div className="flex justify-end gap-2">
                <button
                  onClick={() => closeConfirm(false)}
                  className="px-4 py-2 rounded-lg text-sm font-medium"
                  style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', color: 'rgba(255,255,255,0.7)' }}
                >
                  Cancel
                </button>
                <button
                  onClick={() => closeConfirm(true)}
                  className="px-4 py-2 rounded-lg text-sm font-semibold"
                  style={{ background: 'linear-gradient(135deg,#3b82f6,#6366f1)', border: 'none', color: '#fff' }}
                >
                  {confirmState.confirmText}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminUIContext.Provider>
  );
};

export default AdminLayout;