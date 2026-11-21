import React, { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/dialog';
import { CertificatePreviewModal } from '../../components/ui/CertificatePreviewModal';
import { usePlatformBatches, PlatformBatch, CandidateRecord } from '../../lib/batchStore';
import {
  Crown,
  AlertTriangle,
  Award,
  CheckCircle2,
  FileCheck,
  Building,
  RotateCcw,
  ShieldAlert,
  Send,
  Download,
  Users,
  Eye,
  Search,
  FileText,
  QrCode,
} from 'lucide-react';

export const StateDashboard: React.FC = () => {
  const { batches, stateIssue, reviseBatch } = usePlatformBatches();

  const [activeNav, setActiveNav] = useState<'issuance' | 'approvals' | 'revocation'>('issuance');
  const [selectedBatch, setSelectedBatch] = useState<PlatformBatch | null>(null);
  const [revocationModalOpen, setRevocationModalOpen] = useState(false);
  const [certToRevoke, setCertToRevoke] = useState('');
  const [revokeReason, setRevokeReason] = useState('FRAUDULENT_ASSESSMENT');
  const [remarks, setRemarks] = useState('');

  // Candidate Inspection & Certificate Preview State
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [inspectingBatch, setInspectingBatch] = useState<PlatformBatch | null>(null);
  const [candidateSearch, setCandidateSearch] = useState('');

  // Certificate Preview Modal State
  const [previewModalOpen, setPreviewModalOpen] = useState(false);
  const [previewCertificateData, setPreviewCertificateData] = useState<{
    certificateNumber: string;
    candidateName: string;
    courseName: string;
    trainingCentre?: string;
    district?: string;
    issuedDate: string;
  } | null>(null);

  const handleOpenInspect = (batch: PlatformBatch) => {
    setInspectingBatch(batch);
    setCandidateSearch('');
    setCandidateModalOpen(true);
  };

  const handlePreviewCertificate = (c: CandidateRecord, courseName: string) => {
    setPreviewCertificateData({
      certificateNumber: c.certificateNumber || 'CF-2026-DL-000001',
      candidateName: (c.fullName || 'FULL NAME').toUpperCase(),
      courseName: courseName || 'Project Skilling Program',
      trainingCentre: inspectingBatch?.trainingCentre || 'Apex Skilling Centre',
      district: inspectingBatch?.district || 'Delhi Central',
      issuedDate: c.issuedDate || '2026-03-01',
    });
    setPreviewModalOpen(true);
  };

  const handleAuthorizeBatch = () => {
    if (!selectedBatch) return;
    stateIssue(selectedBatch.id);
    setSelectedBatch(null);
  };

  // State Level Batches: Quality approved or Issued
  const approvedQualityBatches = batches.filter((b) => b.status === 'APPROVED_QUALITY');
  const issuedBatches = batches.filter((b) => b.status === 'ISSUED');
  const stateBatches = batches.filter(
    (b) => b.status === 'APPROVED_QUALITY' || b.status === 'ISSUED'
  );

  const displayedBatches =
    activeNav === 'approvals'
      ? approvedQualityBatches
      : stateBatches;

  const currentCandidates = inspectingBatch?.candidatesList || [];
  const filteredCandidates = currentCandidates.filter(
    (c: CandidateRecord) =>
      c.fullName.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.enrollmentNumber.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      (c.certificateNumber && c.certificateNumber.toLowerCase().includes(candidateSearch.toLowerCase())) ||
      c.fatherName.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.maskedAadhaar.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  const totalIssuedCredentials = issuedBatches.reduce(
    (acc, b) => acc + (b.candidateCount || 0),
    0
  );

  return (
    <AppShell
      userRole="STATE_OFFICER"
      userName="Dr. V. K. Nair (Director General of Skilling)"
      pageTitle="State Directorate Final Issuance &amp; Governance Portal"
      pageDescription="Final executive clearance, Project Veer certificate generation dispatch via BullMQ, and statewide revocation authority."
      breadcrumbs={[{ label: 'State Operations', href: '#' }, { label: 'Final Issuance Console' }]}
      activeNavId={activeNav}
      onNavSelect={(navId) => {
        setActiveNav(navId as any);
        if (navId === 'revocation') {
          setRevocationModalOpen(true);
        }
      }}
      primaryAction={
        <Button
          variant="destructive"
          size="sm"
          onClick={() => setRevocationModalOpen(true)}
          className="gap-2 text-xs"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>Emergency Revocation Console</span>
        </Button>
      }
    >
      <div className="space-y-6">
        {/* Metric Overview */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card
            className={`shadow-card cursor-pointer transition-all ${
              activeNav === 'approvals' ? 'ring-2 ring-[#163A5F] bg-[#163A5F]/5' : ''
            }`}
            onClick={() => setActiveNav('approvals')}
          >
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-[#163A5F]/70 uppercase">Awaiting State Sign-off</span>
              <FileCheck className="w-4 h-4 text-[#163A5F]" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-[#163A5F]">{approvedQualityBatches.length}</div>
              <p className="text-[11px] text-[#172B3A]/60 mt-1">Dual-signed &amp; Quality sampled</p>
            </CardContent>
          </Card>

          <Card
            className={`shadow-card cursor-pointer transition-all ${
              activeNav === 'issuance' ? 'ring-2 ring-[#0F766E] bg-[#0F766E]/5' : ''
            }`}
            onClick={() => setActiveNav('issuance')}
          >
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-[#0F766E] uppercase">Issued Credentials</span>
              <Award className="w-4 h-4 text-[#0F766E]" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-[#0F766E] tabular-nums">
                {totalIssuedCredentials}
              </div>
              <p className="text-[11px] text-[#172B3A]/60 mt-1">Directly queryable via public registry</p>
            </CardContent>
          </Card>

          <Card className="shadow-card">
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-[#163A5F]/70 uppercase">Active Centres</span>
              <Building className="w-4 h-4 text-[#245B85]" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-[#245B85] tabular-nums">48</div>
              <p className="text-[11px] text-[#172B3A]/60 mt-1">Across 11 Delhi districts</p>
            </CardContent>
          </Card>

          <Card
            className={`shadow-card cursor-pointer transition-all ${
              activeNav === 'revocation' ? 'ring-2 ring-[#B91C1C] bg-[#B91C1C]/5' : ''
            }`}
            onClick={() => {
              setActiveNav('revocation');
              setRevocationModalOpen(true);
            }}
          >
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-[#B91C1C] uppercase">Revoked Certificates</span>
              <AlertTriangle className="w-4 h-4 text-[#B91C1C]" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-[#B91C1C] tabular-nums">14</div>
              <p className="text-[11px] text-[#B91C1C] mt-1 font-semibold">Immediate QR block</p>
            </CardContent>
          </Card>
        </div>

        {/* Batches Table Card */}
        <Card className="shadow-card overflow-hidden">
          <CardHeader className="p-4 sm:p-6 border-b border-[#DCE3EA] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base text-[#163A5F]">
                {activeNav === 'approvals'
                  ? 'Batches Awaiting Final State Executive Authorization'
                  : 'State Directorate Credential Issuance Console'}
              </CardTitle>
              <p className="text-xs text-[#172B3A]/60 mt-0.5">
                Inspect candidate rosters, preview official Project Veer certificates, and authorize final issuance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeNav === 'issuance' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveNav('issuance')}
                className="text-xs"
              >
                Issuance Overview ({stateBatches.length})
              </Button>
              <Button
                variant={activeNav === 'approvals' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveNav('approvals')}
                className="text-xs"
              >
                Approvals Queue ({approvedQualityBatches.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Training Centre &amp; Course</TableHead>
                  <TableHead>Candidate Count</TableHead>
                  <TableHead>Multi-Sign Audit Status</TableHead>
                  <TableHead className="text-right">Inspection &amp; State Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedBatches.length > 0 ? (
                  displayedBatches.map((batch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-mono font-bold text-[#163A5F]">
                        {batch.batchNumber}
                        <div className="text-[10px] text-[#172B3A]/60 font-sans font-normal">
                          {batch.status === 'ISSUED' ? (
                            <span className="text-[#0F766E] font-semibold">✓ Officially Issued</span>
                          ) : (
                            <span className="text-[#C49A3A] font-semibold">Ready for Clearance</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-[#172B3A]">{batch.trainingCentre}</div>
                        <div className="text-xs text-[#172B3A]/60">
                          {batch.courseName} ({batch.district})
                        </div>
                      </TableCell>
                      <TableCell className="tabular-nums font-mono font-bold text-[#163A5F]">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#245B85]" />
                          <span>{batch.candidateCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex flex-col space-y-0.5 text-xs">
                          <span className="text-[#0F766E] font-medium flex items-center gap-1">
                            ✓ Dual District Signatures Cleared
                          </span>
                          <span className="text-[#0F766E] font-medium flex items-center gap-1">
                            ✓ State Quality Sampling Passed (10% Roster)
                          </span>
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Candidate Roster & Preview Certificate */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenInspect(batch)}
                            className="gap-1 text-xs border-[#163A5F]/30 text-[#163A5F] hover:bg-[#163A5F]/10"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect &amp; Preview ({batch.candidateCount})</span>
                          </Button>

                          {batch.status === 'APPROVED_QUALITY' ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => setSelectedBatch(batch)}
                              className="gap-1.5 bg-[#0F766E] hover:bg-[#0B5953] text-xs"
                            >
                              <Send className="w-3.5 h-3.5" />
                              <span>Grant State Clearance</span>
                            </Button>
                          ) : (
                            <Badge variant="success" className="text-xs py-1 px-2 gap-1">
                              ✓ Issued &amp; Dispatched
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-xs text-[#172B3A]/60">
                      No batches available in the State Directorate view.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Roster & Certificate Inspection Dialog */}
      <Dialog open={candidateModalOpen} onClose={() => setCandidateModalOpen(false)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Award className="w-5 h-5 text-[#163A5F]" />
            <span>State Candidate Audit &amp; Certificate Dossier: {inspectingBatch?.batchNumber}</span>
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F4F7FA] p-3 rounded-lg border border-[#DCE3EA]">
              <div>
                <p className="text-xs font-bold text-[#163A5F]">{inspectingBatch?.courseName}</p>
                <p className="text-[11px] text-[#172B3A]/70">
                  {inspectingBatch?.trainingCentre} ({inspectingBatch?.district})
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-white text-[#163A5F]">
                  {inspectingBatch?.candidateCount} Candidates Verified
                </Badge>
                <Badge variant="success" className="text-xs">
                  Project Veer Layout Verified
                </Badge>
              </div>
            </div>

            {/* Candidate Search Filter */}
            <div className="relative">
              <Search className="w-4 h-4 text-[#245B85] absolute left-3 top-2.5" />
              <Input
                type="text"
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                placeholder="Search candidate by name, father's name, certificate number, or enrollment..."
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* Candidate Table */}
            <div className="border border-[#DCE3EA] rounded-md overflow-hidden max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F4F7FA]">
                    <TableHead className="text-xs">Candidate Name &amp; Father</TableHead>
                    <TableHead className="text-xs">Enrollment &amp; Aadhaar</TableHead>
                    <TableHead className="text-xs">Certificate Number</TableHead>
                    <TableHead className="text-xs text-center">Score / Attendance</TableHead>
                    <TableHead className="text-xs text-right">Certificate Preview</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.length > 0 ? (
                    filteredCandidates.map((c: CandidateRecord, idx: number) => {
                      const certNo =
                        c.certificateNumber ||
                        `CF-2026-DL-${String(idx + 1).padStart(6, '0')}`;
                      return (
                        <TableRow key={c.id}>
                          <TableCell>
                            <div className="font-bold text-xs text-[#163A5F]">{c.fullName}</div>
                            <div className="text-[10px] text-[#172B3A]/60">
                              {c.fatherName} • {c.dob}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="font-mono text-xs text-[#172B3A]">{c.enrollmentNumber}</div>
                            <div className="text-[10px] text-[#172B3A]/60 font-mono">{c.maskedAadhaar}</div>
                          </TableCell>
                          <TableCell className="font-mono text-xs font-bold text-[#163A5F]">
                            {certNo}
                          </TableCell>
                          <TableCell className="text-center">
                            <span className="font-mono text-xs font-semibold text-[#163A5F]">
                              {c.theoryScore}T/{c.practicalScore}P
                            </span>
                            <span className="text-[10px] text-[#0F766E] font-bold block">
                              {c.attendance}% Attended
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() =>
                                handlePreviewCertificate(
                                  { ...c, certificateNumber: certNo },
                                  inspectingBatch?.courseName || 'Accredited Qualification'
                                )
                              }
                              className="gap-1.5 text-xs bg-[#C49A3A] hover:bg-[#a6802e] text-[#172B3A] font-bold"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Preview Certificate</span>
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-6 text-xs text-[#172B3A]/60">
                        No candidates matched your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
        <DialogFooter className="flex items-center justify-between">
          <span className="text-xs text-[#172B3A]/60">
            Click 'Preview Certificate' to inspect the authentic Project Veer layout with gold borders, VSIF &amp; ISO seals, and Director signature.
          </span>
          <Button variant="outline" size="sm" onClick={() => setCandidateModalOpen(false)}>
            Close Dossier
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Grant Clearance Confirmation Dialog */}
      <Dialog open={selectedBatch !== null} onClose={() => setSelectedBatch(null)}>
        <DialogHeader>
          <DialogTitle>State Final Clearance &amp; Asynchronous Issuance Dispatch</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-xs text-[#172B3A]">
            You are authorizing official state issuance for batch{' '}
            <span className="font-mono font-bold text-[#163A5F]">{selectedBatch?.batchNumber}</span> (
            {selectedBatch?.candidateCount} candidates).
          </p>
          <div className="mt-3 rounded-lg border border-[#DCE3EA] bg-[#F4F7FA] p-3 text-xs text-[#172B3A]/80">
            <p className="font-bold text-[#163A5F] mb-1">Asynchronous Issuance Pipeline:</p>
            <ul className="list-disc pl-4 space-y-1 text-[11px]">
              <li>Transactional outbox records `CERTIFICATE_BATCH_CLEARED` domain event atomically.</li>
              <li>
                BullMQ `certificate-processing` queue triggers PDFKit rendering with Project Veer layout, cryptographic QR codes, and VSIF/ISO seals.
              </li>
              <li>WhatsApp HSM notifications dispatched to candidate registered mobile numbers (+91).</li>
            </ul>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setSelectedBatch(null)}>
            Cancel
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleAuthorizeBatch}
            className="bg-[#0F766E] hover:bg-[#0B5953]"
          >
            Confirm &amp; Dispatch Issuance
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Revocation Console Modal */}
      <Dialog open={revocationModalOpen} onClose={() => setRevocationModalOpen(false)}>
        <DialogHeader>
          <DialogTitle className="text-[#B91C1C]">State Emergency Certificate Revocation</DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="rounded-md bg-[#B91C1C]/10 border border-[#B91C1C]/20 p-3 text-xs text-[#B91C1C] leading-relaxed">
              <span className="font-bold block mb-0.5">High-Security Administrative Action</span>
              Executing revocation immediately renders this certificate INVALID across all public QR verification scans and logs the action permanently in the immutable audit ledger.
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="revokeCertNo" required>
                Target Certificate Number
              </Label>
              <Input
                id="revokeCertNo"
                type="text"
                value={certToRevoke}
                onChange={(e) => setCertToRevoke(e.target.value)}
                placeholder="e.g. CF-2026-DL-000001"
                className="font-mono uppercase"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="revokeReasonSelect" required>
                Legal Grounds for Revocation
              </Label>
              <select
                id="revokeReasonSelect"
                value={revokeReason}
                onChange={(e) => setRevokeReason(e.target.value)}
                className="flex h-10 w-full rounded-md border border-[#DCE3EA] bg-white px-3 py-2 text-xs text-[#172B3A] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#245B85]"
              >
                <option value="FRAUDULENT_ASSESSMENT">Fraudulent Assessment Scores</option>
                <option value="DUPLICATE_ISSUANCE">Duplicate Issuance Collision</option>
                <option value="IDENTITY_MISMATCH">Candidate Identity Mismatch</option>
                <option value="ATTENDANCE_SHORTFALL">Mandatory Biometric Attendance Shortfall</option>
                <option value="ADMINISTRATIVE_ERROR">Administrative Typographical Error</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="investigationRemarks">Inquiry Committee Remarks</Label>
              <textarea
                id="investigationRemarks"
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Order number, committee reference, and inquiry findings..."
                className="w-full rounded-md border border-[#DCE3EA] p-2 text-xs focus:border-[#163A5F] focus:outline-none"
              />
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setRevocationModalOpen(false)}>
            Dismiss
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => setRevocationModalOpen(false)}
            disabled={!certToRevoke.trim()}
          >
            Execute Permanent Revocation
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Official CertiFlow / NCVET Certificate Preview Modal */}
      {previewCertificateData && (
        <CertificatePreviewModal
          isOpen={previewModalOpen}
          onClose={() => setPreviewModalOpen(false)}
          certificateNumber={previewCertificateData.certificateNumber}
          candidateName={previewCertificateData.candidateName}
          courseName={previewCertificateData.courseName}
          trainingCentre={previewCertificateData.trainingCentre}
          district={previewCertificateData.district}
          issuedDate={previewCertificateData.issuedDate}
          directorName="Dr. V. K. Nair"
          directorTitle="Director General of Skilling, State Skill Development Mission"
        />
      )}
    </AppShell>
  );
};
