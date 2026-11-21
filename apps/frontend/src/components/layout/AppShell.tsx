import React, { ReactNode, useState } from 'react';
import { Role } from '@certiflow/shared';
import { queryClient } from '../../lib/query-client';
import {
  Menu,
  X,
  LogOut,
  Shield,
  Layers,
  ChevronRight,
  User,
  Building2,
  CheckSquare,
  ShieldCheck,
  Crown,
  BarChart3,
  Search,
} from 'lucide-react';

export interface NavItem {
  id: string;
  label: string;
  badge?: string;
}

export interface AppShellProps {
  children: ReactNode;
  userRole?: Role;
  userName?: string;
  breadcrumbs?: Array<{ label: string; href?: string }>;
  pageTitle?: string;
  pageDescription?: string;
  primaryAction?: ReactNode;
  navItems?: NavItem[];
  activeNavId?: string;
  onNavSelect?: (id: string) => void;
}

export const AppShell: React.FC<AppShellProps> = ({
  children,
  userRole = 'TRAINING_CENTRE',
  userName = 'Authorized Official',
  breadcrumbs = [{ label: 'Dashboard' }],
  pageTitle = 'Overview',
  pageDescription,
  primaryAction,
  navItems,
  activeNavId,
  onNavSelect,
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('user_profile');
    queryClient.clear();
    window.location.reload();
  };

  const defaultNavByRole: Record<Role, NavItem[]> = {
    TRAINING_CENTRE: [
      { id: 'batches', label: 'Batches Overview' },
      { id: 'upload', label: 'Upload Candidate Roster' },
      { id: 'template', label: 'Download Template & Rules' },
    ],
    DISTRICT_OFFICER: [
      { id: 'queue', label: 'Approval Queue (48h SLA)' },
      { id: 'inspected', label: 'Inspected Batches' },
      { id: 'overdue', label: 'SLA Overdue Escalations', badge: '1 Overdue' },
    ],
    QUALITY_OFFICER: [
      { id: 'reviews', label: 'Quality Sampling Reviews' },
      { id: 'alerts', label: 'High-Volume Alerts (>100)', badge: '1 Alert' },
      { id: 'checklists', label: 'NCVET Audit Rules' },
    ],
    STATE_OFFICER: [
      { id: 'issuance', label: 'State Issuance Overview' },
      { id: 'approvals', label: 'Final Batch Approvals' },
      { id: 'revocation', label: 'Revocation Console', badge: 'Admin' },
    ],
    ADMIN: [
      { id: 'overview', label: 'System Overview' },
      { id: 'users', label: 'User Directory' },
      { id: 'audit', label: 'Audit Trail' },
    ],
  };

  const currentNav = navItems || defaultNavByRole[userRole] || [];

  const handleItemClick = (id: string) => {
    if (onNavSelect) {
      onNavSelect(id);
    }
    setIsSidebarOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-[#F4F7FA] text-[#172B3A] font-sans">
      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setIsSidebarOpen(false)}
        />
      )}

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-[#163A5F] text-white transition-transform duration-200 lg:static lg:translate-x-0 flex flex-col justify-between shadow-elevated ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          {/* Header Brand */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-[#245B85] bg-[#122e4c]">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded bg-[#C49A3A] flex items-center justify-center text-[#172B3A] font-black text-xs">
                CF
              </div>
              <div>
                <span className="font-extrabold text-white tracking-tight text-sm">CERTIFLOW</span>
                <span className="ml-1 text-[9px] font-bold text-[#C49A3A] px-1 py-0.2 border border-[#C49A3A]/60 rounded">
                  GOV
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-white/70 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Identifier Banner */}
          <div className="px-6 py-3 bg-[#163A5F] border-b border-[#245B85]/60 text-xs text-white/80">
            <span className="text-[10px] uppercase tracking-wider text-[#C49A3A] font-bold block">
              Active Tier
            </span>
            <span className="font-semibold text-white">{userRole.replace('_', ' ')}</span>
          </div>

          {/* Nav Items (Clickable & Active State) */}
          <nav className="p-4 space-y-1">
            {currentNav.map((item) => {
              const isActive = activeNavId ? activeNavId === item.id : false;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleItemClick(item.id)}
                  className={`w-full flex items-center justify-between rounded-md px-3 py-2.5 text-xs font-semibold transition-colors text-left ${
                    isActive
                      ? 'bg-[#245B85] text-white shadow-sm ring-1 ring-white/30'
                      : 'text-white/80 hover:bg-[#245B85]/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Layers className={`w-4 h-4 ${isActive ? 'text-[#C49A3A]' : 'text-white/70'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[9px] px-1.5 py-0.5 rounded bg-black/30 text-white font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Quick Portal Switcher in Sidebar */}
          <div className="px-4 py-3 border-t border-[#245B85]/50 bg-[#122e4c]/40">
            <span className="text-[10px] uppercase tracking-wider text-[#C49A3A] font-bold block mb-2 px-1">
              Switch Portal View
            </span>
            <div className="space-y-0.5">
              {[
                { id: 'TRAINING_CENTRE', label: 'Training Centre', icon: Building2 },
                { id: 'DISTRICT', label: 'District Dual-Sign', icon: CheckSquare },
                { id: 'QUALITY', label: 'Quality Sampling', icon: ShieldCheck },
                { id: 'STATE', label: 'State Clearance', icon: Crown },
                { id: 'REPORTS', label: 'Analytics & Reports', icon: BarChart3 },
                { id: 'VERIFY', label: 'Public Verification', icon: Search },
              ].map((portal) => {
                const Icon = portal.icon;
                return (
                  <button
                    key={portal.id}
                    type="button"
                    onClick={() => {
                      window.dispatchEvent(
                        new CustomEvent('certiflow:navigate', { detail: { view: portal.id } })
                      );
                      setIsSidebarOpen(false);
                    }}
                    className="w-full flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-xs font-medium text-white/75 hover:bg-[#245B85] hover:text-white transition-colors text-left"
                  >
                    <Icon className="w-3.5 h-3.5 text-white/60 shrink-0" />
                    <span>{portal.label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Sidebar Footer User Card */}
        <div className="p-4 border-t border-[#245B85] bg-[#122e4c]/80 text-xs">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-7 h-7 rounded-full bg-[#245B85] flex items-center justify-center text-white">
              <User className="w-3.5 h-3.5" />
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-white truncate text-xs">{userName}</p>
              <p className="text-[10px] text-white/60 font-mono">Secured Session</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-1.5 py-1.5 rounded bg-white/10 hover:bg-[#B91C1C] text-white text-xs font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex flex-1 flex-col overflow-hidden min-w-0">
        {/* Top Header */}
        <header className="flex h-14 items-center justify-between border-b border-[#DCE3EA] bg-white px-4 sm:px-6 lg:px-8 shadow-card">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="lg:hidden p-1.5 rounded-md border border-[#DCE3EA] text-[#163A5F] hover:bg-[#F4F7FA]"
              aria-label="Open sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <nav aria-label="Breadcrumbs" className="flex items-center text-xs text-[#172B3A]/60 space-x-1">
              {breadcrumbs.map((b, i) => (
                <React.Fragment key={b.label}>
                  {i > 0 && <ChevronRight className="w-3 h-3 text-[#172B3A]/40" />}
                  <span
                    className={
                      i === breadcrumbs.length - 1
                        ? 'font-bold text-[#163A5F]'
                        : 'hover:text-[#163A5F] transition-colors'
                    }
                  >
                    {b.label}
                  </span>
                </React.Fragment>
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[11px] bg-[#0F766E]/10 text-[#0F766E] border border-[#0F766E]/20 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
              <Shield className="w-3 h-3" />
              <span>Audit Logged</span>
            </span>
          </div>
        </header>

        {/* Page Header Bar */}
        <div className="border-b border-[#DCE3EA] bg-white px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <h1 className="text-xl font-extrabold text-[#163A5F] tracking-tight">{pageTitle}</h1>
              {pageDescription && (
                <p className="mt-0.5 text-xs text-[#172B3A]/70 max-w-3xl leading-relaxed">
                  {pageDescription}
                </p>
              )}
            </div>
            {primaryAction && <div className="shrink-0">{primaryAction}</div>}
          </div>
        </div>

        {/* Body Canvas */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
