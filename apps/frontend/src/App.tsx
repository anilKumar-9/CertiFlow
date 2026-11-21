import React, { useState } from 'react';
import { QueryProvider } from './app/providers/QueryProvider';
import { PublicVerificationPage } from './pages/verification/PublicVerificationPage';
import { LoginPage } from './pages/auth/LoginPage';
import { TrainingCentreDashboard } from './pages/training-centre/TrainingCentreDashboard';
import { DistrictDashboard } from './pages/district/DistrictDashboard';
import { QualityDashboard } from './pages/quality/QualityDashboard';
import { StateDashboard } from './pages/state/StateDashboard';
import { ReportsDashboard } from './pages/reports/ReportsDashboard';
import { useEventStream } from './hooks/useEventStream';
import {
  Search,
  Lock,
  Building2,
  CheckSquare,
  ShieldCheck,
  Crown,
  BarChart3,
  Layers,
  ChevronDown,
} from 'lucide-react';

type ViewMode = 'VERIFY' | 'LOGIN' | 'TRAINING_CENTRE' | 'DISTRICT' | 'QUALITY' | 'STATE' | 'REPORTS';

const AppContent: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewMode>('VERIFY');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Initialize real-time domain event stream
  useEventStream(true);

  // Listen for navigation events dispatched from anywhere (e.g. sidebar portal switcher)
  React.useEffect(() => {
    const handleCustomNav = (e: any) => {
      if (e.detail?.view) {
        setActiveView(e.detail.view as ViewMode);
      }
    };
    window.addEventListener('certiflow:navigate', handleCustomNav);
    return () => window.removeEventListener('certiflow:navigate', handleCustomNav);
  }, []);

  const handleLoginSuccess = (user: any) => {
    switch (user?.role) {
      case 'TRAINING_CENTRE':
        setActiveView('TRAINING_CENTRE');
        break;
      case 'DISTRICT_OFFICER':
        setActiveView('DISTRICT');
        break;
      case 'QUALITY_OFFICER':
        setActiveView('QUALITY');
        break;
      case 'STATE_OFFICER':
      case 'ADMIN':
        setActiveView('STATE');
        break;
      default:
        setActiveView('VERIFY');
        break;
    }
  };

  const navItems = [
    { id: 'VERIFY' as ViewMode, label: 'Public Verification', icon: Search, badge: 'Public' },
    { id: 'LOGIN' as ViewMode, label: 'Gov Sign-In', icon: Lock, badge: 'Auth' },
    { id: 'TRAINING_CENTRE' as ViewMode, label: 'Training Centre', icon: Building2 },
    { id: 'DISTRICT' as ViewMode, label: 'District Dual-Sign', icon: CheckSquare },
    { id: 'QUALITY' as ViewMode, label: 'Quality Sampling', icon: ShieldCheck },
    { id: 'STATE' as ViewMode, label: 'State Clearance', icon: Crown },
    { id: 'REPORTS' as ViewMode, label: 'Analytics', icon: BarChart3 },
  ];

  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#172B3A] flex flex-col font-sans">
      {/* Enterprise Multi-Role Evaluation Switcher Bar */}
      <header className="bg-[#163A5F] border-b border-[#245B85] text-white sticky top-0 z-50 shadow-md no-print">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2 flex items-center justify-between gap-3">
          {/* Logo & Platform Info */}
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="flex items-center justify-center w-7 h-7 rounded bg-[#C49A3A] text-[#172B3A] font-extrabold text-xs shadow-sm">
              CF
            </div>
            <div>
              <div className="flex items-center gap-1.5 font-bold tracking-tight text-sm">
                <span>CertiFlow</span>
                <span className="text-[10px] font-semibold bg-[#245B85] text-white/90 px-1.5 py-0.2 rounded border border-white/20">
                  GovPlatform
                </span>
              </div>
              <span className="hidden md:inline text-[10px] text-white/70 tracking-wide">
                Role Navigation Sandbox
              </span>
            </div>
          </div>

          {/* Desktop Navigation Tabs */}
          <nav aria-label="Portal Navigation" className="hidden lg:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveView(item.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all min-h-[36px] ${
                    isActive
                      ? 'bg-white text-[#163A5F] shadow-sm font-bold ring-1 ring-white/50'
                      : 'text-white/80 hover:bg-[#245B85] hover:text-white'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#163A5F]' : 'text-white/70'}`} />
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] px-1 py-0.2 rounded font-mono ${
                        isActive ? 'bg-[#163A5F]/10 text-[#163A5F]' : 'bg-white/10 text-white/80'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile / Tablet Dropdown Control */}
          <div className="lg:hidden flex items-center gap-2">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-[#245B85] text-white text-xs font-semibold min-h-[36px]"
              aria-expanded={mobileMenuOpen}
            >
              <Layers className="w-4 h-4 text-[#C49A3A]" />
              <span>Role: {navItems.find((n) => n.id === activeView)?.label}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu Drawer */}
        {mobileMenuOpen && (
          <div className="lg:hidden border-t border-[#245B85] bg-[#122e4c] p-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    setActiveView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded text-xs font-semibold text-left ${
                    isActive ? 'bg-white text-[#163A5F] font-bold' : 'text-white/80 hover:bg-[#245B85]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-black/20 font-mono">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col">
        {activeView === 'VERIFY' && <PublicVerificationPage />}
        {activeView === 'LOGIN' && <LoginPage onLoginSuccess={handleLoginSuccess} />}
        {activeView === 'TRAINING_CENTRE' && <TrainingCentreDashboard />}
        {activeView === 'DISTRICT' && <DistrictDashboard />}
        {activeView === 'QUALITY' && <QualityDashboard />}
        {activeView === 'STATE' && <StateDashboard />}
        {activeView === 'REPORTS' && <ReportsDashboard />}
      </main>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryProvider>
      <AppContent />
    </QueryProvider>
  );
};

export default App;
