import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Button } from './button';
import { Printer, X, Download, ShieldCheck, Award, CheckCircle2 } from 'lucide-react';

export interface CertificatePreviewProps {
  isOpen: boolean;
  onClose: () => void;
  certificateNumber?: string;
  candidateName?: string;
  courseName?: string;
  trainingCentre?: string;
  district?: string;
  issuedDate?: string;
  directorName?: string;
  directorTitle?: string;
}

export const CertificatePreviewModal: React.FC<CertificatePreviewProps> = ({
  isOpen,
  onClose,
  certificateNumber = 'CF-2026-DL-000001',
  candidateName = 'RAHUL VERMA',
  courseName = 'Certified Solar Energy Technician (NSQF Level 4)',
  trainingCentre = 'Apex Skilling Centre, Pusa Campus',
  district = 'Delhi Central',
  issuedDate = '2026-03-01',
  directorName = 'Dr. V. K. Nair',
  directorTitle = 'Director General of Skilling, State Skill Development Mission',
}) => {
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (isOpen) {
      const verifyUrl = `https://certiflow.gov.in/verify/${certificateNumber}`;
      QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 120,
        color: { dark: '#163A5F', light: '#FFFFFF' },
      })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [isOpen, certificateNumber]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 overflow-y-auto backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-white rounded-lg shadow-2xl overflow-hidden border border-[#DCE3EA] my-8 animate-in fade-in-50 zoom-in-95 duration-200">
        {/* Modal Action Header */}
        <div className="bg-[#163A5F] text-white px-6 py-3 flex items-center justify-between no-print">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#C49A3A]" />
            <span className="font-bold text-sm tracking-wide">
              Official CertiFlow Accredited Credential Preview
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.print()}
              className="bg-white/10 hover:bg-white text-white hover:text-[#163A5F] border-white/20 gap-1.5 text-xs h-8"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print Certificate</span>
            </Button>
            <button
              onClick={onClose}
              className="text-white/70 hover:text-white p-1 rounded transition-colors"
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Certificate Canvas (Official CertiFlow / NCVET Layout) */}
        <div className="p-6 sm:p-10 bg-white select-none">
          {/* Outer Gold Ornamental Border */}
          <div className="relative border-4 border-[#C49A3A] p-2 sm:p-3 bg-white shadow-sm">
            {/* Inner Gold Line with Stepped Key Corners */}
            <div className="relative border border-[#C49A3A] p-6 sm:p-8 bg-white min-h-[540px] flex flex-col justify-between overflow-hidden">
              {/* Stepped Corner Ornaments */}
              <div className="absolute top-0 left-0 w-4 h-4 border-b-2 border-r-2 border-[#C49A3A]" />
              <div className="absolute top-0 right-0 w-4 h-4 border-b-2 border-l-2 border-[#C49A3A]" />
              <div className="absolute bottom-0 left-0 w-4 h-4 border-t-2 border-r-2 border-[#C49A3A]" />
              <div className="absolute bottom-0 right-0 w-4 h-4 border-t-2 border-l-2 border-[#C49A3A]" />

              {/* Watermark Wave Background */}
              <div
                className="absolute inset-0 pointer-events-none opacity-5"
                style={{
                  backgroundImage: 'radial-gradient(circle at 15% 50%, #163A5F 10%, transparent 60%)',
                }}
              />

              {/* Top Row: Center Government & Registry Emblem + Top Right Certificate ID & QR */}
              <div className="relative flex flex-col sm:flex-row items-center justify-between gap-4">
                {/* Spacer on left to balance the layout */}
                <div className="hidden sm:flex flex-col items-start w-40">
                  <span className="text-[10px] font-bold text-[#163A5F] uppercase tracking-wider">
                    GOVERNMENT OF INDIA
                  </span>
                  <span className="text-[8px] text-[#172B3A]/70 uppercase">
                    Ministry of Skill Development &amp; Entrepreneurship
                  </span>
                </div>

                {/* Center Header */}
                <div className="text-center flex-1 max-w-lg mx-auto">
                  <div className="inline-block">
                    <span className="font-extrabold text-2xl sm:text-3xl tracking-tight text-[#163A5F] block font-sans">
                      CERTIFLOW <span className="text-[#C49A3A]">NATIONAL REGISTRY</span>
                    </span>
                    <span className="text-[10px] uppercase tracking-wider text-[#0F766E] font-bold block mt-0.5">
                      National Council for Vocational Education and Training (NCVET)
                    </span>
                  </div>
                  <p className="text-[8px] sm:text-[9px] uppercase tracking-normal text-[#172B3A]/80 mt-1.5 font-medium leading-tight">
                    Issued in statutory accordance with the National Skills Qualifications Framework (NSQF)<br />
                    State Skill Development Mission • Four-Eyes Dual Verification Cleared
                  </p>
                </div>

                {/* Top Right: Certificate ID, Date & QR Code */}
                <div className="text-right sm:w-40 flex flex-col items-center sm:items-end shrink-0">
                  <p className="text-[10px] font-medium text-[#172B3A]">
                    Certificate ID :{' '}
                    <span className="font-mono font-bold text-[#163A5F]">{certificateNumber}</span>
                  </p>
                  <p className="text-[10px] font-medium text-[#172B3A] mt-0.5">
                    Date of Issue : <span className="font-mono">{issuedDate}</span>
                  </p>
                  {qrDataUrl && (
                    <div className="mt-2 p-1 bg-white border border-[#DCE3EA] rounded shadow-xs">
                      <img src={qrDataUrl} alt="Verification QR Code" className="w-18 h-18 sm:w-20 sm:h-20" />
                    </div>
                  )}
                </div>
              </div>

              {/* Certificate Main Calligraphy Title */}
              <div className="text-center my-5">
                <h1
                  className="text-4xl sm:text-5xl font-serif text-[#C49A3A] tracking-wide italic font-bold"
                  style={{ fontFamily: 'Georgia, "Times New Roman", serif' }}
                >
                  Certificate of Competency
                </h1>
                <p className="text-xs uppercase tracking-widest text-[#475569] font-semibold mt-2.5">
                  THIS IS TO OFFICIALLY CERTIFY THAT
                </p>
              </div>

              {/* Candidate Full Name */}
              <div className="text-center my-2">
                <h2
                  className="text-2xl sm:text-3xl font-extrabold text-[#172B3A] uppercase tracking-wider border-b-2 border-[#C49A3A]/40 inline-block pb-1 min-w-[320px]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {candidateName}
                </h2>
              </div>

              {/* Course Completed Text & Course Name */}
              <div className="text-center my-3 space-y-1.5">
                <p className="text-[11px] uppercase tracking-widest text-[#475569] font-medium">
                  HAS DEMONSTRATED PROFICIENCY AND SUCCESSFULLY COMPLETED THE ACCREDITED QUALIFICATION
                </p>
                <h3
                  className="text-xl sm:text-2xl font-bold text-[#163A5F]"
                  style={{ fontFamily: 'Georgia, serif' }}
                >
                  {courseName}
                </h3>
                <p className="text-xs text-[#172B3A]/70 font-medium">
                  Conferred at <strong className="text-[#163A5F]">{trainingCentre}</strong> ({district})
                </p>
              </div>

              {/* Middle Badges Row: Photo, NCVET Seal, ISO 9001 Seal, Signature */}
              <div className="grid grid-cols-2 sm:grid-cols-4 items-end justify-items-center gap-4 my-5 pt-4 border-t border-[#DCE3EA]/40">
                {/* 1. Candidate Photo / Biometric Box */}
                <div className="w-18 h-22 sm:w-20 sm:h-26 bg-[#F1F5F9] border border-[#CBD5E1] rounded-sm flex flex-col items-center justify-center p-1 shadow-inner">
                  <div className="w-8 h-8 rounded-full bg-[#94A3B8] mb-1" />
                  <div className="w-12 h-6 rounded-t-full bg-[#94A3B8]" />
                  <span className="text-[7px] text-[#0F766E] uppercase tracking-tight mt-1 font-bold">
                    Biometric Verified
                  </span>
                </div>

                {/* 2. Round NCVET Statutory Accredited Seal */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-[#163A5F] p-1 flex items-center justify-center text-center">
                  <div className="w-full h-full rounded-full border border-dashed border-[#163A5F] flex flex-col items-center justify-center p-1 text-[#163A5F]">
                    <span className="text-[5px] uppercase font-bold tracking-tighter leading-tight">
                      NATIONAL COUNCIL FOR
                    </span>
                    <span className="text-xs font-black tracking-wider my-0.5 text-[#C49A3A]">NCVET</span>
                    <span className="text-[5px] uppercase font-bold tracking-tighter leading-tight">
                      VOCATIONAL TRAINING
                    </span>
                  </div>
                </div>

                {/* 3. Gold ISO 9001:2015 & NSQF Rosette Badge */}
                <div className="w-20 h-20 sm:w-22 sm:h-22 rounded-full border-2 border-[#C49A3A] p-1 flex items-center justify-center text-center bg-[#FEFDF9] shadow-xs">
                  <div className="w-full h-full rounded-full border border-[#C49A3A] flex flex-col items-center justify-center p-1 text-[#C49A3A]">
                    <span className="text-[6px] uppercase font-bold tracking-tight">★ ACCREDITED ★</span>
                    <span className="text-[9px] font-black text-[#172B3A] my-0.5 tracking-tight">
                      ISO 9001:2015
                    </span>
                    <span className="text-[6px] uppercase font-bold tracking-tight">NSQF COMPLIANT</span>
                  </div>
                </div>

                {/* 4. Director General Digital Signature Block */}
                <div className="text-center w-full max-w-[170px]">
                  <div className="font-serif italic text-xl text-[#163A5F] pb-1 border-b border-[#94A3B8] select-none">
                    Dr. V. K. Nair
                  </div>
                  <p className="text-[10px] font-bold text-[#172B3A] mt-1">{directorName}</p>
                  <p className="text-[8px] text-[#64748B] leading-tight mt-0.5">{directorTitle}</p>
                </div>
              </div>

              {/* Exact Regulatory Footer */}
              <div className="text-center pt-3 border-t border-[#DCE3EA] text-[8px] sm:text-[9px] text-[#475569] space-y-0.5">
                <p className="font-semibold text-[#163A5F]">
                  National Council for Vocational Education and Training (NCVET) • Ministry of Skill Development &amp; Entrepreneurship, Govt. of India
                </p>
                <p>
                  Cryptographically stamped with SHA-256 state ledger block | Citizen privacy protected under Digital Personal Data Protection (DPDP) Act 2023
                </p>
                <p className="text-[#0F766E] font-medium">
                  Official Verification Gateway: <strong>www.certiflow.gov.in</strong> | Grievance &amp; Verification Desk: <strong>verify@certiflow.gov.in</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Footer Controls */}
        <div className="bg-[#F4F7FA] border-t border-[#DCE3EA] px-6 py-3 flex items-center justify-between text-xs no-print">
          <span className="text-[#172B3A]/70 font-mono text-[11px]">
            Cryptographic SHA-256 Ledger Stamped • Official CertiFlow National Skilling Credential
          </span>
          <Button variant="default" size="sm" onClick={onClose}>
            Close Preview
          </Button>
        </div>
      </div>
    </div>
  );
};
