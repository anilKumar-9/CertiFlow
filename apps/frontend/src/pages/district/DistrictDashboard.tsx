import React, { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/dialog';
import { usePlatformBatches, PlatformBatch, CandidateRecord } from '../../lib/batchStore';
import {
  CheckSquare,
  AlertTriangle,
  Clock,
  ShieldCheck,
  FileText,
  UserCheck,
  RotateCcw,
  Building2,
  Users,
  Search,
  CheckCircle2,
  Eye,
  Filter,
} from 'lucide-react';

export const DistrictDashboard: React.FC = () => {
  const { batches, officer1Sign, officer2Sign, reviseBatch } = usePlatformBatches();

  const [activeNav, setActiveNav] = useState<'queue' | 'inspected' | 'overdue'>('queue');
  const [selectedBatch, setSelectedBatch] = useState<PlatformBatch | null>(null);
  const [actionType, setActionType] = useState<'APPROVE' | 'REVISE' | null>(null);
  const [remarks, setRemarks] = useState('');
  const [certifiedCheck, setCertifiedCheck] = useState(false);

  // Candidate Inspection Modal State
  const [candidateModalOpen, setCandidateModalOpen] = useState(false);
  const [inspectingBatch, setInspectingBatch] = useState<PlatformBatch | null>(null);
  const [candidateSearch, setCandidateSearch] = useState('');

  const handleOpenInspect = (batch: PlatformBatch) => {
    setInspectingBatch(batch);
    setCandidateSearch('');
    setCandidateModalOpen(true);
  };

  const handleSignBatch = () => {
    if (!selectedBatch) return;
    if (!selectedBatch.officer1Approved) {
      officer1Sign(selectedBatch.id, 'A. K. Verma (DO-01)');
    } else {
      officer2Sign(selectedBatch.id, 'R. Sharma (DO-02)');
    }
    setSelectedBatch(null);
    setCertifiedCheck(false);
  };

  const handleReviseBatch = () => {
    if (!selectedBatch) return;
    reviseBatch(selectedBatch.id, remarks || 'Returned for revision: data discrepancy detected.');
    setSelectedBatch(null);
    setRemarks('');
  };

  // Filtered lists based on live platform store
  const pendingQueue = batches.filter(
    (b) => b.status === 'SUBMITTED' || b.status === 'DISTRICT_PARTIALLY_APPROVED'
  );
  const inspectedList = batches.filter(
    (b) =>
      b.status === 'DISTRICT_APPROVED' ||
      b.status === 'APPROVED_QUALITY' ||
      b.status === 'ISSUED'
  );
  const overdueList = batches.filter(
    (b) =>
      b.slaHoursLeft < 0 &&
      (b.status === 'SUBMITTED' || b.status === 'DISTRICT_PARTIALLY_APPROVED')
  );

  const displayedBatches =
    activeNav === 'overdue'
      ? overdueList
      : activeNav === 'inspected'
      ? inspectedList
      : pendingQueue;

  const currentBatchCandidates = inspectingBatch?.candidatesList || [];
  const filteredCandidates = currentBatchCandidates.filter(
    (c: CandidateRecord) =>
      c.fullName.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.enrollmentNumber.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.maskedAadhaar.toLowerCase().includes(candidateSearch.toLowerCase()) ||
      c.fatherName.toLowerCase().includes(candidateSearch.toLowerCase())
  );

  return (
    <AppShell
      userRole="DISTRICT_OFFICER"
      userName="A. K. Verma (District Central - DO-01 / DO-02)"
      pageTitle="District Officer Governance Queue"
      pageDescription="Mandatory dual-officer four-eyes verification queue. Both assigned district officers must independently inspect candidate records and sign batches before quality sampling."
      breadcrumbs={[{ label: 'District Operations', href: '#' }, { label: 'Approval Queue' }]}
      activeNavId={activeNav}
      onNavSelect={(navId) => setActiveNav(navId as any)}
    >
      <div className="space-y-6">
        {/* District Metrics */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card
            className={`shadow-card cursor-pointer transition-all ${
              activeNav === 'queue' ? 'ring-2 ring-[#163A5F] bg-[#163A5F]/5' : ''
            }`}
            onClick={() => setActiveNav('queue')}
          >
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-[#163A5F]/70 uppercase">Pending Review</span>
              <FileText className="w-4 h-4 text-[#163A5F]" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-[#163A5F]">{pendingQueue.length}</div>
              <p className="text-[11px] text-[#172B3A]/60 mt-1">Awaiting verification in queue</p>
            </CardContent>
          </Card>

          <Card
            className="shadow-card cursor-pointer transition-all hover:bg-[#245B85]/5"
            onClick={() => setActiveNav('queue')}
          >
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-[#163A5F]/70 uppercase">Dual-Sign Incomplete</span>
              <UserCheck className="w-4 h-4 text-[#245B85]" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-[#245B85] tabular-nums">
                {batches.filter((b) => b.officer1Approved && !b.officer2Approved).length}
              </div>
              <p className="text-[11px] text-[#172B3A]/60 mt-1">1 of 2 signatures logged</p>
            </CardContent>
          </Card>

          <Card
            className={`shadow-card cursor-pointer transition-all ${
              activeNav === 'overdue' ? 'ring-2 ring-[#B91C1C] bg-[#B91C1C]/5' : ''
            }`}
            onClick={() => setActiveNav('overdue')}
          >
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-[#B91C1C] uppercase">SLA Breached (&gt;48h)</span>
              <AlertTriangle className="w-4 h-4 text-[#B91C1C]" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-[#B91C1C] tabular-nums">{overdueList.length}</div>
              <p className="text-[11px] text-[#B91C1C] mt-1 font-semibold">
                {overdueList.length > 0 ? 'Immediate escalation required' : 'Zero SLA breaches'}
              </p>
            </CardContent>
          </Card>

          <Card
            className={`shadow-card cursor-pointer transition-all ${
              activeNav === 'inspected' ? 'ring-2 ring-[#0F766E] bg-[#0F766E]/5' : ''
            }`}
            onClick={() => setActiveNav('inspected')}
          >
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-[#0F766E] uppercase">Cleared This Month</span>
              <ShieldCheck className="w-4 h-4 text-[#0F766E]" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-[#0F766E] tabular-nums">{inspectedList.length}</div>
              <p className="text-[11px] text-[#172B3A]/60 mt-1">Passed to Quality Sampling</p>
            </CardContent>
          </Card>
        </div>

        {/* Overdue Alert Banner if on Overdue tab */}
        {activeNav === 'overdue' && (
          <div className="rounded-lg border border-[#B91C1C]/40 bg-[#B91C1C]/10 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#B91C1C] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-[#172B3A]">
                  NCVET Statutory 48-Hour SLA Escalation Filter Active
                </h2>
                <p className="text-xs text-[#172B3A]/80 mt-1 leading-relaxed">
                  Batches shown here have exceeded the mandatory 48-hour four-eyes verification window. These items are flagged to the State Directorate monitoring center for expedited intervention.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* District Approval Queue Card */}
        <Card className="shadow-card overflow-hidden">
          <CardHeader className="p-4 sm:p-6 border-b border-[#DCE3EA] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base text-[#163A5F]">
                {activeNav === 'overdue'
                  ? 'SLA Escalation Queue (>48 Hours Pending)'
                  : activeNav === 'inspected'
                  ? 'Inspected & Dual-Signed Batches Archive'
                  : 'District Skill Committee Four-Eyes Approval Queue'}
              </CardTitle>
              <p className="text-xs text-[#172B3A]/60 mt-0.5">
                Every batch must receive 2 independent cryptographic signatures from separate District Officers.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeNav === 'queue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveNav('queue')}
                className="text-xs"
              >
                Pending Queue ({pendingQueue.length})
              </Button>
              <Button
                variant={activeNav === 'overdue' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveNav('overdue')}
                className="text-xs text-[#B91C1C] border-[#B91C1C]/40"
              >
                Overdue ({overdueList.length})
              </Button>
              <Button
                variant={activeNav === 'inspected' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveNav('inspected')}
                className="text-xs"
              >
                Inspected History ({inspectedList.length})
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Training Centre &amp; Course</TableHead>
                  <TableHead>Candidates</TableHead>
                  <TableHead>48-Hour SLA Status</TableHead>
                  <TableHead>Four-Eyes Status</TableHead>
                  <TableHead className="text-right">Inspection &amp; Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedBatches.length > 0 ? (
                  displayedBatches.map((batch: PlatformBatch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-mono font-bold text-[#163A5F]">
                        {batch.batchNumber}
                        <div className="text-[10px] text-[#172B3A]/60 font-sans font-normal">
                          v{batch.version} • {batch.district}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-[#172B3A]">{batch.trainingCentre}</div>
                        <div className="text-xs text-[#172B3A]/60">{batch.courseName}</div>
                      </TableCell>
                      <TableCell className="tabular-nums font-mono font-bold text-[#163A5F]">
                        <div className="flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-[#245B85]" />
                          <span>{batch.candidateCount}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        {batch.slaHoursLeft < 0 ? (
                          <Badge variant="destructive" className="gap-1">
                            <AlertTriangle className="w-3 h-3" /> Overdue ({Math.abs(batch.slaHoursLeft)}h)
                          </Badge>
                        ) : batch.status === 'DISTRICT_APPROVED' || batch.status === 'APPROVED_QUALITY' || batch.status === 'ISSUED' ? (
                          <Badge variant="outline" className="gap-1 text-[#0F766E] border-[#0F766E]/40">
                            ✓ Cleared in SLA
                          </Badge>
                        ) : batch.slaHoursLeft < 24 ? (
                          <Badge variant="warning" className="gap-1">
                            <Clock className="w-3 h-3" /> {batch.slaHoursLeft}h remaining
                          </Badge>
                        ) : (
                          <span className="text-xs font-mono font-semibold text-[#0F766E] flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {batch.slaHoursLeft}h remaining
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        {batch.officer1Approved && batch.officer2Approved ? (
                          <div className="text-xs space-y-0.5">
                            <span className="text-[#0F766E] font-bold flex items-center gap-1">
                              ✓ Dual-Signed ({batch.officer1Name} &amp; {batch.officer2Name})
                            </span>
                            <span className="text-[#172B3A]/60">Cleared for Quality Audit</span>
                          </div>
                        ) : batch.officer1Approved ? (
                          <div className="text-xs space-y-0.5">
                            <span className="text-[#0F766E] font-bold flex items-center gap-1">
                              ✓ Officer 1 Signed ({batch.officer1Name})
                            </span>
                            <span className="text-[#C49A3A] font-medium block">
                              ⏳ Awaiting Officer 2 (Your Sign-off)
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-[#172B3A]/60 flex items-center gap-1">
                            <Clock className="w-3 h-3 text-[#245B85]" />
                            <span>Awaiting Officer 1 Review</span>
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Inspect Candidate Roster Button */}
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleOpenInspect(batch)}
                            className="gap-1 text-xs border-[#163A5F]/30 text-[#163A5F] hover:bg-[#163A5F]/10"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Inspect Candidates ({batch.candidateCount})</span>
                          </Button>

                          {(batch.status === 'SUBMITTED' || batch.status === 'DISTRICT_PARTIALLY_APPROVED') && (
                            <>
                              <Button
                                variant="default"
                                size="sm"
                                onClick={() => {
                                  setSelectedBatch(batch);
                                  setActionType('APPROVE');
                                }}
                                className="gap-1 text-xs bg-[#163A5F] hover:bg-[#122e4c]"
                              >
                                <CheckSquare className="w-3.5 h-3.5" />
                                <span>
                                  {batch.officer1Approved ? 'Sign as Officer 2' : 'Review & Sign (Officer 1)'}
                                </span>
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBatch(batch);
                                  setActionType('REVISE');
                                }}
                                className="gap-1 text-xs text-[#B91C1C] border-[#B91C1C]/30 hover:bg-[#B91C1C]/10"
                              >
                                <RotateCcw className="w-3.5 h-3.5" />
                                <span>Revise</span>
                              </Button>
                            </>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-[#172B3A]/60">
                      No batches found in the current view.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Candidate Roster Inspection Dialog */}
      <Dialog open={candidateModalOpen} onClose={() => setCandidateModalOpen(false)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#163A5F]" />
            <span>District Candidate Audit Dossier: {inspectingBatch?.batchNumber}</span>
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-[#F4F7FA] p-3 rounded-lg border border-[#DCE3EA]">
              <div>
                <span className="text-xs text-[#172B3A]/70">
                  Centre: <strong>{inspectingBatch?.trainingCentre}</strong>
                </span>
                <p className="text-xs text-[#163A5F] font-bold">{inspectingBatch?.courseName}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs bg-white text-[#163A5F]">
                  Total Roster: {inspectingBatch?.candidateCount} Candidates
                </Badge>
                <Badge variant="success" className="text-xs">
                  Biometric Aadhaar: 100% Match
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
                placeholder="Search candidate by name, father's name, enrollment, or masked Aadhaar..."
                className="pl-9 text-xs h-9"
              />
            </div>

            {/* Candidate Table */}
            <div className="border border-[#DCE3EA] rounded-md overflow-hidden max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F4F7FA]">
                    <TableHead className="text-xs">Candidate Details</TableHead>
                    <TableHead className="text-xs">Father's Name &amp; DOB</TableHead>
                    <TableHead className="text-xs">Masked Aadhaar</TableHead>
                    <TableHead className="text-xs text-center">Attendance %</TableHead>
                    <TableHead className="text-xs text-center">Assessment Marks</TableHead>
                    <TableHead className="text-xs text-right">Verification</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredCandidates.length > 0 ? (
                    filteredCandidates.map((c: CandidateRecord) => (
                      <TableRow key={c.id}>
                        <TableCell>
                          <div className="font-bold text-xs text-[#163A5F]">{c.fullName}</div>
                          <div className="font-mono text-[10px] text-[#172B3A]/60">{c.enrollmentNumber}</div>
                        </TableCell>
                        <TableCell className="text-xs text-[#172B3A]">
                          <div>{c.fatherName}</div>
                          <div className="text-[10px] text-[#172B3A]/60">
                            {c.dob} ({c.gender})
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[#172B3A]">
                          {c.maskedAadhaar}
                        </TableCell>
                        <TableCell className="text-center">
                          <span
                            className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold ${
                              c.attendance >= 80
                                ? 'bg-[#0F766E]/10 text-[#0F766E]'
                                : 'bg-[#B91C1C]/10 text-[#B91C1C]'
                            }`}
                          >
                            {c.attendance}%
                          </span>
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs">
                          <span className="text-[#163A5F] font-semibold">{c.theoryScore}T</span> /{' '}
                          <span className="text-[#0F766E] font-semibold">{c.practicalScore}P</span>
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="success" className="text-[10px] gap-1">
                            <CheckCircle2 className="w-3 h-3" /> Verified
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-6 text-xs text-[#172B3A]/60">
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
            DPDP Compliant: Aadhaar is masked, raw biometric vectors remain in hardware HSM.
          </span>
          <Button variant="outline" size="sm" onClick={() => setCandidateModalOpen(false)}>
            Close Dossier
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Review & Dual-Sign Dialog */}
      <Dialog open={selectedBatch !== null} onClose={() => setSelectedBatch(null)}>
        <DialogHeader>
          <DialogTitle>
            {actionType === 'APPROVE'
              ? selectedBatch?.officer1Approved
                ? 'Officer 2 Final District Sign-off (Four-Eyes Completion)'
                : 'Officer 1 Initial Inspection Sign-off'
              : 'Return Batch for Training Centre Revision'}
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <p className="text-xs text-[#172B3A]/80">
            Target Batch: <span className="font-mono font-bold text-[#163A5F]">{selectedBatch?.batchNumber}</span>
          </p>
          <p className="text-xs text-[#172B3A]/70 mt-0.5">
            Course: <strong>{selectedBatch?.courseName}</strong> | Total Candidates:{' '}
            <strong>{selectedBatch?.candidateCount}</strong>
          </p>

          {actionType === 'APPROVE' ? (
            <div className="space-y-4 mt-3">
              {/* Candidate Audit Summary Box */}
              <div className="rounded-md border border-[#DCE3EA] bg-[#F4F7FA] p-3 text-xs space-y-2">
                <span className="font-bold text-[#163A5F] block">Candidate Verification Summary:</span>
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-2 bg-white rounded border border-[#DCE3EA]">
                    <span className="text-[10px] text-[#172B3A]/60 block">Roster Count</span>
                    <span className="font-mono font-bold text-[#163A5F]">{selectedBatch?.candidateCount}</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-[#DCE3EA]">
                    <span className="text-[10px] text-[#172B3A]/60 block">Min Attendance</span>
                    <span className="font-mono font-bold text-[#0F766E]">&gt; 80% Valid</span>
                  </div>
                  <div className="p-2 bg-white rounded border border-[#DCE3EA]">
                    <span className="text-[10px] text-[#172B3A]/60 block">Pass Rate</span>
                    <span className="font-mono font-bold text-[#0F766E]">100% Eligible</span>
                  </div>
                </div>
              </div>

              <div className="rounded-md bg-[#0F766E]/10 border border-[#0F766E]/20 p-3 text-xs text-[#0F766E] leading-relaxed">
                <span className="font-bold block mb-1">Government Verification Certification</span>
                By recording your digital signature, you certify under official regulations that candidate attendance logs, biometric checks, and theoretical/practical assessment thresholds satisfy the District Skill Committee standards.
              </div>
              <label className="flex items-start gap-2 text-xs font-semibold text-[#163A5F] cursor-pointer">
                <input
                  type="checkbox"
                  checked={certifiedCheck}
                  onChange={(e) => setCertifiedCheck(e.target.checked)}
                  className="rounded border-[#DCE3EA] text-[#163A5F] mt-0.5"
                />
                <span>
                  I confirm that all {selectedBatch?.candidateCount} candidate dossiers in this batch have been audited without discrepancy.
                </span>
              </label>
            </div>
          ) : (
            <div className="space-y-3 mt-3">
              <Label htmlFor="revisionRemarks" required>
                Mandatory Revision Remarks (Logged to Immutable Audit)
              </Label>
              <textarea
                id="revisionRemarks"
                rows={3}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="State specific discrepancy (e.g., Row 14 duplicate Aadhaar hash, Row 22 assessment score below 50% passing threshold)..."
                className="w-full rounded-md border border-[#DCE3EA] p-2.5 text-xs focus:border-[#163A5F] focus:ring-1 focus:ring-[#163A5F] focus:outline-none"
                required
              />
            </div>
          )}
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setSelectedBatch(null)}>
            Cancel
          </Button>
          <Button
            variant={actionType === 'APPROVE' ? 'default' : 'destructive'}
            size="sm"
            onClick={actionType === 'APPROVE' ? handleSignBatch : handleReviseBatch}
            disabled={actionType === 'APPROVE' && !certifiedCheck}
          >
            {actionType === 'APPROVE' ? 'Record Legal Signature' : 'Return Batch (Increment Version)'}
          </Button>
        </DialogFooter>
      </Dialog>
    </AppShell>
  );
};
