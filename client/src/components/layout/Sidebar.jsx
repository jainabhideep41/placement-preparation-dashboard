import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Code2,
  Globe2,
  ServerCog,
  GitBranch,
  Award,
  Settings,
  Flame,
  CheckCircle,
  ExternalLink,
  UserCheck
} from 'lucide-react';

export function Sidebar({ 
  activePage = 'dashboard', 
  onNavigate, 
  isOpen = false, 
  onClose,
  revisionDueCount = 0 
}) {
  const location = useLocation();
  const currentPath = location.pathname.toLowerCase();

  const navItems = [
    {
      id: 'dashboard',
      path: '/dashboard',
      aliases: ['/', '/dashboard'],
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'dsa',
      path: '/dsa',
      aliases: ['/dsa'],
      label: 'DSA Preparation',
      icon: Code2,
      badge: revisionDueCount > 0 ? `${revisionDueCount} due` : null,
      badgeColor: 'amber'
    },
    {
      id: 'webdev',
      path: '/webdev',
      aliases: ['/webdev', '/web-development'],
      label: 'Web Development',
      icon: Globe2,
      badge: 'Roadmap'
    },
    {
      id: 'systemdesign',
      path: '/system-design',
      aliases: ['/system-design', '/systemdesign'],
      label: 'System Design',
      icon: ServerCog,
      badge: 'HLD/LLD'
    },
    {
      id: 'github',
      path: '/github',
      aliases: ['/github', '/github-foss'],
      label: 'GitHub & FOSS',
      icon: GitBranch,
      badge: 'Active'
    },
    {
      id: 'readiness',
      path: '/readiness',
      aliases: ['/readiness', '/placement-readiness'],
      label: 'Placement Readiness',
      icon: Award,
      badge: 'Engine'
    },
    {
      id: 'profile',
      path: '/u',
      aliases: ['/u', '/profile'],
      label: 'Public Profile',
      icon: UserCheck,
      badge: 'Share'
    },
    {
      id: 'settings',
      path: '/settings',
      aliases: ['/settings'],
      label: 'Settings & Handles',
      icon: Settings,
      badge: null
    }
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 w-64 border-r border-black/10 bg-[#F9F9F7] p-4 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="space-y-6">
          {/* Quick status widget */}
          <div className="p-3 rounded-xl bg-white border border-black/10 shadow-sm">
            <div className="flex items-center gap-2 text-xs font-semibold text-black/80 font-display mb-1">
              <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
              <span>Placement Sprint</span>
            </div>
            <p className="text-[11px] text-black/50">
              Campus placement drives target: <span className="text-black font-semibold">Tier 1 Product</span>
            </p>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map(item => {
              const Icon = item.icon;
              const isActive = item.path === '/dashboard'
                ? (currentPath === '/' || currentPath === '/dashboard')
                : (currentPath === item.path || (item.aliases && item.aliases.includes(currentPath)) || currentPath.startsWith(item.path));

              return (
                <Link
                  key={item.id}
                  to={item.path}
                  onClick={() => {
                    if (onNavigate) onNavigate(item.id);
                    if (onClose) onClose();
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-black text-white font-semibold shadow-[2px_2px_0px_rgba(0,0,0,0.3)]'
                      : 'text-black/60 hover:text-black hover:bg-black/5 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-black/50'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                        item.badgeColor === 'amber'
                          ? 'bg-amber-500/15 text-amber-600 border border-amber-500/30 font-semibold'
                          : isActive
                            ? 'bg-white/20 text-white/80'
                            : 'bg-black/5 text-black/40'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Footer info: source project sheet & inspiration note */}
        <div className="p-3 rounded-xl bg-white border border-black/10 text-[11px] text-black/50 space-y-1 shadow-sm">
          <div className="flex items-center justify-between text-black/70 font-medium">
            <span>Topic 7 Dashboard</span>
            <span className="text-[10px] font-mono text-emerald-600">React + Hooks</span>
          </div>
          <p className="text-[10px] text-black/40 leading-tight">
            Inspired by Codolio DSA Architecture & CP Companion Visuals.
          </p>
        </div>
      </aside>
    </>
  );
}
