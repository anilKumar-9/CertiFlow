import React, { ReactNode } from 'react';
import { ShieldCheck, Award, FileCheck, ExternalLink, Lock } from 'lucide-react';

export interface PublicVerificationShellProps {
  children: ReactNode;
}

export const PublicVerificationShell: React.FC<PublicVerificationShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#F4F7FA] text-[#172B3A] flex flex-col justify-between selection:bg-[#245B85] selection:text-white">
      {/* Top National Identity Band */}
      <div className="w-full bg-[#163A5F] text-white border-b border-[#245B85] no-print">
        <div className="h-1 w-full bg-gradient-to-r from-[#FF9933] via-white to-[#138808]" aria-hidden="true" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1.5 flex items-center justify-between text-[11px] font-medium tracking-wide text-white/90">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#C49A3A]">भारत सरकार</span>
            <span className="text-white/40">|</span>
            <span>Government of India</span>
            <span className="hidden md:inline text-white/40">|</span>
            <span className="hidden md:inline text-white/80">Ministry of Skill Development &amp; Entrepreneurship</span>
          </div>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="flex items-center gap-1 text-[#C49A3A]">
              <Lock className="w-3 h-3" />
              <span>Secure SSL Portal</span>
            </span>
            <span className="hidden sm:inline text-white/60">English</span>
          </div>
        </div>
      </div>

      {/* Main Government Portal Header */}
      <header className="bg-white border-b border-[#DCE3EA] shadow-card sticky top-0 z-40 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-[#163A5F] border border-[#245B85] flex items-center justify-center text-[#C49A3A] shadow-sm">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-[#163A5F] text-lg tracking-tight">CERTIFLOW</span>
                <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-[#C49A3A]/20 text-[#172B3A] border border-[#C49A3A]/40">
                  National Registry
                </span>
              </div>
              <p className="text-xs text-[#172B3A]/70 font-medium">
                National Skilling Digital Credential Verification Gateway
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:flex flex-col text-right text-xs">
              <span className="font-semibold text-[#163A5F]">NCVET Accredited Ecosystem</span>
              <span className="text-[11px] text-[#0F766E] font-medium flex items-center justify-end gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> SHA-256 Cryptographic Tamper-Proof
              </span>
            </div>
            <div className="h-8 w-[1px] bg-[#DCE3EA] hidden lg:block" />
            <a
              href="#registry-info"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#245B85] hover:text-[#163A5F] bg-[#F4F7FA] hover:bg-[#DCE3EA]/50 px-3 py-1.5 rounded-md border border-[#DCE3EA] transition-colors"
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Registry Guidelines</span>
            </a>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col items-center justify-center gov-pattern">
        {children}
      </main>

      {/* Official Government Footer */}
      <footer id="registry-info" className="bg-[#163A5F] text-white border-t border-[#245B85] mt-12 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs text-white/80">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-6 h-6 rounded bg-[#C49A3A] flex items-center justify-center text-[#172B3A] font-bold text-xs">
                  GOV
                </div>
                <span className="font-bold text-white text-sm">CertiFlow National Registry</span>
              </div>
              <p className="leading-relaxed text-white/70">
                Official centralized digital verification infrastructure for vocational and technical skill credentials issued across accredited institutions in India.
              </p>
              <p className="mt-2 text-[11px] text-[#C49A3A]">
                Protected under Digital Personal Data Protection (DPDP) Act 2023.
              </p>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-2 text-xs">Security &amp; Integrity</h4>
              <ul className="space-y-1.5 text-white/70 text-[11px]">
                <li className="flex items-center gap-1.5">
                  <span className="text-[#0F766E] font-bold">✓</span> SHA-256 Document Fingerprinting
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#0F766E] font-bold">✓</span> Dual-Officer District Level Validation
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#0F766E] font-bold">✓</span> Zero Citizen Aadhaar Data Exposure
                </li>
                <li className="flex items-center gap-1.5">
                  <span className="text-[#0F766E] font-bold">✓</span> Real-Time State Revocation Synchronization
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white uppercase tracking-wider mb-2 text-xs">Citizen Helpdesk &amp; Grievance</h4>
              <p className="text-white/70 text-[11px] leading-relaxed">
                If you suspect a fraudulent certificate or encounter discrepancies in verification details, submit a formal inquiry to the State Directorate.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <span className="px-2 py-1 bg-[#245B85] rounded text-white font-mono text-[11px]">
                  Toll-Free: 1800-111-2026
                </span>
                <span className="text-white/40">|</span>
                <a href="#" className="text-[#C49A3A] hover:underline flex items-center gap-1 text-[11px]">
                  <span>Grievance Portal</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between text-[11px] text-white/60 gap-2">
            <p>© 2026 National Council for Vocational Education and Training (NCVET). All rights reserved.</p>
            <div className="flex gap-4">
              <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
              <a href="#" className="hover:text-white transition-colors">Terms of Verification</a>
              <a href="#" className="hover:text-white transition-colors">Hyperlinking Policy</a>
              <a href="#" className="hover:text-white transition-colors">Accessibility Statement</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};
