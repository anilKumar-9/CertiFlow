import React, { useState, useEffect } from 'react';
import { PublicVerificationShell } from '../../components/layout/PublicVerificationShell';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { CertificatePreviewModal } from '../../components/ui/CertificatePreviewModal';
import { downloadVerificationPdf } from '../../lib/pdfDownloader';
import QRCode from 'qrcode';
import {
  ShieldCheck,
  Search,
  AlertTriangle,
  FileX2,
  CheckCircle2,
  QrCode,
  Download,
  Printer,
  Info,
  Building2,
  Calendar,
  Award,
  Hash,
  UserCheck,
  ExternalLink,
} from 'lucide-react';

interface VerificationResult {
  status: 'IDLE' | 'LOADING' | 'GENUINE' | 'REVOKED' | 'NOT_FOUND' | 'ERROR';
  data?: {
    certificateNumber: string;
    candidateName: string;
    courseName: string;
    issuedAt: string;
    issuingAuthority: string;
    trainingCentre?: string;
    district?: string;
    sha256Fingerprint?: string;
    revocationReason?: string;
    revocationDate?: string;
  };
  errorMessage?: string;
}

export const PublicVerificationPage: React.FC = () => {
  const [queryInput, setQueryInput] = useState('');
  const [verificationMode, setVerificationMode] = useState<'NUMBER' | 'QR'>('NUMBER');
  const [result, setResult] = useState<VerificationResult>({ status: 'IDLE' });
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [isDownloadingPdf, setIsDownloadingPdf] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (result.status === 'GENUINE' && result.data?.certificateNumber) {
      const verifyUrl = `https://certiflow.gov.in/verify/${result.data.certificateNumber}`;
      QRCode.toDataURL(verifyUrl, {
        errorCorrectionLevel: 'H',
        margin: 1,
        width: 140,
        color: { dark: '#163A5F', light: '#FFFFFF' },
      })
        .then(setQrDataUrl)
        .catch(console.error);
    }
  }, [result]);

  const handleDownloadPdf = async () => {
    if (!result.data) return;
    setIsDownloadingPdf(true);
    try {
      await downloadVerificationPdf({
        certificateNumber: result.data.certificateNumber,
        candidateName: result.data.candidateName,
        courseName: result.data.courseName,
        issuedAt: result.data.issuedAt,
        issuingAuthority: result.data.issuingAuthority,
        trainingCentre: result.data.trainingCentre,
        district: result.data.district,
        sha256Fingerprint: result.data.sha256Fingerprint,
      });
    } catch (err) {
      console.error('Failed to download audit PDF:', err);
    } finally {
      setIsDownloadingPdf(false);
    }
  };

  const handleVerify = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const cleanId = queryInput.trim().toUpperCase();
    if (!cleanId) return;

    setResult({ status: 'LOADING' });

    // Simulate realistic network roundtrip to public verification endpoint
    setTimeout(() => {
      if (cleanId.includes('REVOKE') || cleanId === 'CF-2026-DL-REVOKED') {
        setResult({
          status: 'REVOKED',
          data: {
            certificateNumber: cleanId,
            candidateName: 'A**** K****',
            courseName: 'Certified Solar Energy Technician (NSQF Level 4)',
            issuedAt: '2026-02-15',
            issuingAuthority: 'Delhi State Skill Development Mission (DSSDM)',
            trainingCentre: 'Pragati Technical Institute, Okhla',
            district: 'Delhi South',
            revocationDate: '2026-03-01',
            revocationReason: 'Candidate dossier failed mandatory post-issuance quality verification audit (Order No. REV-2026-089).',
          },
        });
      } else if (cleanId.length >= 6 || cleanId === 'CF-2026-DL-000001') {
        setResult({
          status: 'GENUINE',
          data: {
            certificateNumber: cleanId,
            candidateName: 'R**** S****',
            courseName: 'Certified Solar Energy Technician (NSQF Level 4)',
            issuedAt: '2026-03-20',
            issuingAuthority: 'Delhi State Skill Development Mission (DSSDM)',
            trainingCentre: 'Apex Skilling Centre, Pusa Campus',
            district: 'Delhi Central',
            sha256Fingerprint: '9f8e7d6c5b4a3210e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1',
          },
        });
      } else {
        setResult({
          status: 'NOT_FOUND',
          data: {
            certificateNumber: cleanId,
            candidateName: '',
            courseName: '',
            issuedAt: '',
            issuingAuthority: '',
          },
        });
      }
    }, 600);
  };

  const handleQuickDemo = (sampleId: string) => {
    setQueryInput(sampleId);
    setResult({ status: 'LOADING' });
    setTimeout(() => {
      if (sampleId.includes('REVOKE')) {
        setResult({
          status: 'REVOKED',
          data: {
            certificateNumber: sampleId,
            candidateName: 'A**** K****',
            courseName: 'Electric Vehicle Service Specialist',
            issuedAt: '2026-02-10',
            issuingAuthority: 'State Skilling Directorate',
            trainingCentre: 'Metro Skill Hub',
            district: 'Delhi North',
            revocationDate: '2026-02-28',
            revocationReason: 'Credential withdrawn following administrative audit under Rule 14(2).',
          },
        });
      } else {
        setResult({
          status: 'GENUINE',
          data: {
            certificateNumber: sampleId,
            candidateName: 'R**** S****',
            courseName: 'Certified Solar Energy Technician (NSQF Level 4)',
            issuedAt: '2026-03-20',
            issuingAuthority: 'Delhi State Skill Development Mission',
            trainingCentre: 'Apex Skilling Centre, Pusa Campus',
            district: 'Delhi Central',
            sha256Fingerprint: '8a7b6c5d4e3f2a10b9c8d7e6f5a4b3c2d1e0f9a8b7c6d5e4f3a2b1c0d9e8f7a6',
          },
        });
      }
    }, 400);
  };

  return (
    <PublicVerificationShell>
      <div className="w-full max-w-2xl space-y-6">
        {/* Verification Gateway Hero Card */}
        <div className="text-center space-y-2 no-print">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#163A5F]/10 border border-[#163A5F]/20 text-[#163A5F] text-xs font-semibold">
            <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            <span>Official National Registry Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#163A5F] tracking-tight">
            Verify Skilling Credential Authenticity
          </h1>
          <p className="text-sm text-[#172B3A]/70 max-w-xl mx-auto">
            Instantly authenticate government-accredited vocational certificates. All issued credentials are cryptographically stamped with SHA-256 ledgers.
          </p>
        </div>

        {/* Verification Card */}
        <Card className="shadow-elevated border-[#DCE3EA] overflow-hidden bg-white no-print">
          {/* Card Mode Tabs */}
          <div className="flex border-b border-[#DCE3EA] bg-[#F4F7FA]/70">
            <button
              type="button"
              onClick={() => setVerificationMode('NUMBER')}
              className={`flex-1 py-3 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2 border-b-2 ${
                verificationMode === 'NUMBER'
                  ? 'border-[#163A5F] bg-white text-[#163A5F]'
                  : 'border-transparent text-[#172B3A]/60 hover:text-[#163A5F] hover:bg-white/50'
              }`}
            >
              <Hash className="w-4 h-4" />
              <span>Verify by Certificate ID</span>
            </button>
            <button
              type="button"
              onClick={() => setVerificationMode('QR')}
              className={`flex-1 py-3 px-4 text-xs font-bold transition-all flex items-center justify-center gap-2 border-b-2 ${
                verificationMode === 'QR'
                  ? 'border-[#163A5F] bg-white text-[#163A5F]'
                  : 'border-transparent text-[#172B3A]/60 hover:text-[#163A5F] hover:bg-white/50'
              }`}
            >
              <QrCode className="w-4 h-4" />
              <span>Scan QR Code</span>
            </button>
          </div>

          <CardContent className="p-6 sm:p-8">
            {verificationMode === 'NUMBER' ? (
              <form onSubmit={handleVerify} className="space-y-4">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="certInput" required>
                      Certificate Number / Token ID
                    </Label>
                    <span className="text-[11px] text-[#172B3A]/60 font-mono">Format: CF-YYYY-DD-XXXXXX</span>
                  </div>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-[#245B85]">
                      <Search className="w-4 h-4" />
                    </div>
                    <Input
                      id="certInput"
                      type="text"
                      value={queryInput}
                      onChange={(e) => setQueryInput(e.target.value)}
                      placeholder="e.g. CF-2026-DL-000001"
                      className="pl-10 h-11 text-base font-mono uppercase tracking-wider placeholder:font-sans placeholder:normal-case placeholder:tracking-normal"
                      required
                    />
                    {queryInput && (
                      <button
                        type="button"
                        onClick={() => setQueryInput('')}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-xs text-[#172B3A]/40 hover:text-[#172B3A]"
                      >
                        Clear
                      </button>
                    )}
                  </div>
                </div>

                <Button
                  type="submit"
                  variant="default"
                  size="lg"
                  className="w-full font-bold shadow-sm flex items-center justify-center gap-2"
                  disabled={result.status === 'LOADING' || !queryInput.trim()}
                >
                  {result.status === 'LOADING' ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      <span>Verifying Cryptographic Ledger...</span>
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-5 h-5 text-[#C49A3A]" />
                      <span>Verify Credential Authenticity</span>
                    </>
                  )}
                </Button>

                {/* Quick Demo Assist Chips */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-[#DCE3EA]/60 text-xs text-[#172B3A]/70">
                  <span className="font-semibold text-[#163A5F]">Quick Demo Inputs:</span>
                  <div className="flex flex-wrap gap-1.5">
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('CF-2026-DL-000001')}
                      className="px-2 py-0.5 rounded border border-[#0F766E]/40 bg-[#0F766E]/10 hover:bg-[#0F766E]/20 text-[#0F766E] text-[11px] font-medium transition-colors"
                    >
                      ✓ Genuine Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => handleQuickDemo('CF-2026-DL-REVOKED')}
                      className="px-2 py-0.5 rounded border border-[#B91C1C]/40 bg-[#B91C1C]/10 hover:bg-[#B91C1C]/20 text-[#B91C1C] text-[11px] font-medium transition-colors"
                    >
                      ⚠ Revoked Sample
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setQueryInput('INVALID-NUM-999');
                        handleVerify();
                      }}
                      className="px-2 py-0.5 rounded border border-[#C49A3A]/40 bg-[#C49A3A]/10 hover:bg-[#C49A3A]/20 text-[#172B3A] text-[11px] font-medium transition-colors"
                    >
                      ✕ Unmatched Sample
                    </button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="text-center py-8 space-y-4">
                <div className="w-20 h-20 mx-auto rounded-xl border-2 border-dashed border-[#245B85] bg-[#F4F7FA] flex items-center justify-center text-[#245B85]">
                  <QrCode className="w-10 h-10" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-[#163A5F]">Camera QR Scanner</h4>
                  <p className="text-xs text-[#172B3A]/70 max-w-sm mx-auto mt-1">
                    Hold the physical certificate QR code directly in front of your camera to authenticate in real time.
                  </p>
                </div>
                <Button
                  type="button"
                  variant="secondary"
                  size="md"
                  onClick={() => handleQuickDemo('CF-2026-DL-000001')}
                  className="gap-2"
                >
                  <Search className="w-4 h-4" />
                  <span>Simulate QR Scan (Read Sample)</span>
                </Button>
              </div>
            )}

            {/* Anti-Scraping / Security Notice */}
            <div className="mt-6 flex items-start gap-2 rounded-md bg-[#F4F7FA] border border-[#DCE3EA] p-3 text-xs text-[#172B3A]/70">
              <Info className="w-4 h-4 text-[#245B85] shrink-0 mt-0.5" />
              <div className="space-y-0.5 leading-relaxed text-[11px]">
                <p className="font-semibold text-[#163A5F]">Citizen Privacy &amp; Security Shield</p>
                <p>
                  In compliance with the Digital Personal Data Protection (DPDP) Act 2023, recipient names are masked and citizen Aadhaar numbers are never transmitted or stored. Public lookups are rate-limited to 10 requests per minute per IP address.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Verification Result Showcase */}
        {result.status === 'GENUINE' && result.data && (
          <Card className="border-2 border-[#0F766E] shadow-elevated bg-white overflow-hidden animate-in fade-in-50 duration-300 verification-slip-printable">
            {/* Official Government Print Header (Visible Only When Printed) */}
            <div className="hidden print:block border-b-2 border-[#0F766E] pb-3 mb-4">
              <div className="flex items-center justify-between border-b border-[#DCE3EA] pb-1.5 mb-2">
                <div>
                  <span className="text-[10px] font-bold tracking-widest text-[#163A5F] uppercase block">
                    भारत सरकार | GOVERNMENT OF INDIA
                  </span>
                  <span className="text-xs font-bold text-[#172B3A]">
                    Ministry of Skill Development &amp; Entrepreneurship
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold text-[#0F766E] uppercase block">
                    National Registry Verification
                  </span>
                  <span className="text-[9px] font-mono text-[#172B3A]/70">
                    Verified: {new Date().toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between mt-2">
                <div>
                  <h1 className="text-base font-black text-[#163A5F] tracking-wide uppercase">
                    Official Credential Verification Slip
                  </h1>
                  <p className="text-[10px] text-[#172B3A]/70">
                    National Council for Vocational Education and Training (NCVET) Digital Ledger
                  </p>
                </div>
                {qrDataUrl && (
                  <img
                    src={qrDataUrl}
                    alt="Verification QR"
                    className="w-16 h-16 border border-[#DCE3EA] rounded p-1 object-contain"
                  />
                )}
              </div>
            </div>

            {/* Verified Header Banner */}
            <div className="bg-[#0F766E] text-white px-6 py-3.5 flex flex-wrap items-center justify-between gap-2 print-bg-teal">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-white" />
                <span className="font-bold text-sm tracking-wide uppercase">Officially Authenticated &amp; Valid</span>
              </div>
              <Badge variant="warning" className="text-[11px] font-bold">
                ✓ Cryptographically Certified
              </Badge>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-6">
              {/* Course & Candidate Header */}
              <div className="border-b border-[#DCE3EA] pb-5">
                <span className="text-[11px] uppercase tracking-wider font-semibold text-[#0F766E]">
                  Accredited Vocational Qualification
                </span>
                <h3 className="text-xl sm:text-2xl font-bold text-[#163A5F] mt-0.5">
                  {result.data.courseName}
                </h3>
                <p className="text-xs text-[#172B3A]/70 mt-1 flex items-center gap-2">
                  <span>Conferred by: <strong>{result.data.issuingAuthority}</strong></span>
                </p>
              </div>

              {/* Credential Attributes Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-[#F4F7FA] border border-[#DCE3EA] space-y-1 print-bg-light">
                  <div className="flex items-center gap-1.5 text-[#163A5F] font-semibold">
                    <UserCheck className="w-4 h-4 text-[#0F766E]" />
                    <span>Candidate Recipient</span>
                  </div>
                  <p className="font-mono text-sm font-bold text-[#172B3A]">{result.data.candidateName}</p>
                  <p className="text-[10px] text-[#172B3A]/60">Masked per DPDP Privacy Provisions</p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#F4F7FA] border border-[#DCE3EA] space-y-1 print-bg-light">
                  <div className="flex items-center gap-1.5 text-[#163A5F] font-semibold">
                    <Hash className="w-4 h-4 text-[#245B85]" />
                    <span>Certificate Identifier</span>
                  </div>
                  <p className="font-mono text-sm font-bold text-[#163A5F]">{result.data.certificateNumber}</p>
                  <p className="text-[10px] text-[#172B3A]/60">Unique Registry Ledger Record</p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#F4F7FA] border border-[#DCE3EA] space-y-1 print-bg-light">
                  <div className="flex items-center gap-1.5 text-[#163A5F] font-semibold">
                    <Building2 className="w-4 h-4 text-[#C49A3A]" />
                    <span>Training Provider &amp; District</span>
                  </div>
                  <p className="font-medium text-[#172B3A]">{result.data.trainingCentre || 'Accredited Center'}</p>
                  <p className="text-[10px] text-[#172B3A]/60">Jurisdiction: {result.data.district || 'Central District'}</p>
                </div>

                <div className="p-3.5 rounded-lg bg-[#F4F7FA] border border-[#DCE3EA] space-y-1 print-bg-light">
                  <div className="flex items-center gap-1.5 text-[#163A5F] font-semibold">
                    <Calendar className="w-4 h-4 text-[#0F766E]" />
                    <span>Clearance Date</span>
                  </div>
                  <p className="font-medium text-[#172B3A]">{result.data.issuedAt}</p>
                  <p className="text-[10px] text-[#0F766E] font-medium">State Level Multi-Sign Complete</p>
                </div>
              </div>

              {/* Cryptographic SHA-256 Fingerprint */}
              {result.data.sha256Fingerprint && (
                <div className="p-3 rounded border border-[#DCE3EA] bg-[#F4F7FA]/70 text-[11px] font-mono break-all text-[#172B3A]/80 print-bg-light">
                  <span className="font-sans font-semibold text-[#163A5F] block mb-0.5">
                    SHA-256 Certificate Checksum:
                  </span>
                  {result.data.sha256Fingerprint}
                </div>
              )}

              {/* Action Buttons (Hidden When Printing) */}
              <div className="flex flex-wrap items-center justify-end gap-2 pt-2 border-t border-[#DCE3EA] no-print">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Verification Slip</span>
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setPreviewModalOpen(true)}
                  className="gap-1.5 text-xs bg-[#C49A3A] hover:bg-[#a6802e] text-[#172B3A] font-bold"
                >
                  <QrCode className="w-3.5 h-3.5" />
                  <span>View Authentic Certificate (CertiFlow / NCVET Layout)</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadPdf}
                  disabled={isDownloadingPdf}
                  className="gap-1.5 text-xs border-[#163A5F]/30 text-[#163A5F] hover:bg-[#163A5F]/10"
                >
                  {isDownloadingPdf ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-[#163A5F]/30 border-t-[#163A5F] rounded-full animate-spin" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Audit PDF</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Official Stamping Ledger Footer (Visible Only When Printed) */}
              <div className="hidden print:flex items-center justify-between border-t border-[#DCE3EA] pt-3 text-[10px] text-[#172B3A]/70">
                <div>
                  <span className="font-bold text-[#163A5F] block">Tamper-Evident Ledger Certification:</span>
                  <span>Validated against SHA-256 state ledger. Citizen privacy protected under DPDP Act 2023.</span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-[#0F766E] block">✓ NCVET VERIFIED DOSSIER</span>
                  <span>CertiFlow National Registry</span>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Official CertiFlow / NCVET Certificate Replica Modal */}
        {result.status === 'GENUINE' && result.data && (
          <CertificatePreviewModal
            isOpen={previewModalOpen}
            onClose={() => setPreviewModalOpen(false)}
            certificateNumber={result.data.certificateNumber}
            candidateName={result.data.candidateName.replace(/\*/g, '').trim() || 'RAHUL VERMA'}
            courseName={result.data.courseName}
            trainingCentre={result.data.trainingCentre}
            district={result.data.district}
            issuedDate={result.data.issuedAt}
            directorName="Dr. V. K. Nair"
            directorTitle="Director General of Skilling, State Skill Development Mission"
          />
        )}

        {/* Revoked State */}
        {result.status === 'REVOKED' && result.data && (
          <Card className="border-2 border-[#B91C1C] shadow-elevated bg-white overflow-hidden animate-in fade-in-50 duration-300">
            <div className="bg-[#B91C1C] text-white px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-white" />
                <span className="font-bold text-sm tracking-wide uppercase">Official Warning: Credential Revoked</span>
              </div>
              <Badge variant="destructive" className="text-[11px]">
                REVOKED &amp; INVALID
              </Badge>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-4">
              <div className="rounded-md bg-[#B91C1C]/10 border border-[#B91C1C]/20 p-4 text-xs text-[#B91C1C] leading-relaxed">
                <p className="font-bold text-sm mb-1">THIS CREDENTIAL HAS BEEN WITHDRAWN BY STATE ORDER</p>
                <p>
                  This certificate has been formally revoked by the issuing authority and possesses <strong>zero legal or vocational validity</strong>. Any presentation of this document for employment, apprenticeship, or government benefits is an offense under applicable laws.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded bg-[#F4F7FA] border border-[#DCE3EA]">
                  <span className="text-[#172B3A]/60 block text-[11px]">Certificate Number:</span>
                  <span className="font-mono font-bold text-[#163A5F]">{result.data.certificateNumber}</span>
                </div>
                <div className="p-3 rounded bg-[#F4F7FA] border border-[#DCE3EA]">
                  <span className="text-[#172B3A]/60 block text-[11px]">Date of Cancellation:</span>
                  <span className="font-bold text-[#B91C1C]">{result.data.revocationDate || '2026-03-01'}</span>
                </div>
              </div>

              {result.data.revocationReason && (
                <div className="text-xs text-[#172B3A] p-3 rounded bg-[#F4F7FA] border border-[#DCE3EA]">
                  <span className="font-semibold text-[#163A5F] block mb-1">Official Cause for Revocation:</span>
                  <p className="text-[#172B3A]/80">{result.data.revocationReason}</p>
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Not Found State */}
        {result.status === 'NOT_FOUND' && (
          <Card className="border border-[#C49A3A] shadow-elevated bg-white overflow-hidden animate-in fade-in-50 duration-300">
            <div className="bg-[#C49A3A] text-[#172B3A] px-6 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <FileX2 className="w-5 h-5 text-[#172B3A]" />
                <span className="font-bold text-sm tracking-wide uppercase">No Record Found In Registry</span>
              </div>
              <Badge variant="warning" className="text-[11px] bg-white text-[#172B3A] border-none font-bold">
                Unverified Identifier
              </Badge>
            </div>

            <CardContent className="p-6 sm:p-8 space-y-4">
              <p className="text-xs text-[#172B3A] leading-relaxed">
                The identifier <strong className="font-mono">{result.data?.certificateNumber}</strong> was not located in the official CertiFlow national skilling ledger.
              </p>

              <div className="rounded-md bg-[#F4F7FA] border border-[#DCE3EA] p-4 text-xs space-y-2">
                <span className="font-bold text-[#163A5F] block">Recommended Verification Troubleshooting:</span>
                <ul className="list-disc pl-4 space-y-1 text-[#172B3A]/80 text-[11px]">
                  <li>Verify that the certificate number matches the exact format printed on the credential (e.g., <code className="font-mono text-[#163A5F]">CF-2026-DL-000001</code>).</li>
                  <li>Ensure the credential was issued by an authorized state training centre within the accredited network.</li>
                  <li>Recent batch clearances may require up to 2 hours for full cryptographic ledger indexing.</li>
                </ul>
              </div>

              <div className="flex items-center justify-between pt-2 text-xs">
                <span className="text-[#172B3A]/60">Need help verifying?</span>
                <a href="#registry-info" className="text-[#245B85] hover:underline font-semibold flex items-center gap-1">
                  <span>Contact State Directorate Helpdesk</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </PublicVerificationShell>
  );
};
