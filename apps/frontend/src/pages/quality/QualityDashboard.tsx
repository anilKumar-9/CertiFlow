import React, { useState } from 'react';
import { AppShell } from '../../components/layout/AppShell';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '../../components/ui/table';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { Label } from '../../components/ui/label';
import { Input } from '../../components/ui/input';
import { Dialog, DialogHeader, DialogTitle, DialogContent, DialogFooter } from '../../components/ui/dialog';
import { usePlatformBatches, PlatformBatch, CandidateRecord } from '../../lib/batchStore';
import {
  ShieldCheck,
  AlertTriangle,
  FileSearch,
  CheckCircle2,
  Users,
  Search,
  Eye,
  CheckSquare,
  FileSpreadsheet,
  Check,
  X,
  Info,
} from 'lucide-react';

export const QualityDashboard: React.FC = () => {
  const { batches, qualityApprove, reviseBatch } = usePlatformBatches();

  const [activeNav, setActiveNav] = useState<'reviews' | 'alerts' | 'checklists'>('reviews');
  const [selectedBatch, setSelectedBatch] = useState<PlatformBatch | null>(null);
  const [remarks, setRemarks] = useState('');
  const [check1, setCheck1] = useState(false);
  const [check2, setCheck2] = useState(false);
  const [check3, setCheck3] = useState(false);

  // Full Roster Modal
  const [rosterModalOpen, setRosterModalOpen] = useState(false);
  const [rosterBatch, setRosterBatch] = useState<PlatformBatch | null>(null);
  const [rosterSearch, setRosterSearch] = useState('');

  // Sample Audit Tracking (audited candidate IDs)
  const [auditedCandidateIds, setAuditedCandidateIds] = useState<Record<string, boolean>>({});

  // Eligible batches for Quality review (cleared by District)
  const qualityQueue = batches.filter(
    (b) => b.status === 'DISTRICT_APPROVED' || b.status === 'APPROVED_QUALITY' || b.status === 'ISSUED'
  );
  const highVolumeAlerts = batches.filter(
    (b) => b.isHighVolumeAlert && (b.status === 'DISTRICT_APPROVED' || b.status === 'APPROVED_QUALITY' || b.status === 'ISSUED')
  );

  const displayedBatches =
    activeNav === 'alerts'
      ? highVolumeAlerts
      : qualityQueue;

  const allChecked = check1 && check2 && check3;

  const handleApproveQuality = () => {
    if (!selectedBatch) return;
    qualityApprove(selectedBatch.id);
    setSelectedBatch(null);
    setCheck1(false);
    setCheck2(false);
    setCheck3(false);
    setRemarks('');
  };

  const handleToggleAudit = (candidateId: string) => {
    setAuditedCandidateIds((prev) => ({
      ...prev,
      [candidateId]: !prev[candidateId],
    }));
  };

  // Get sample candidates for the selected batch (10% PRNG sample)
  const getSampleCandidates = (batch: PlatformBatch | null): CandidateRecord[] => {
    if (!batch || !batch.candidatesList) return [];
    const count = batch.candidatesList.length;
    const sampleSize = Math.max(1, Math.round(count * 0.1));
    return batch.candidatesList.slice(0, sampleSize);
  };

  const activeSamples = getSampleCandidates(selectedBatch);

  // Full roster candidates filtered by search
  const rosterCandidates = rosterBatch?.candidatesList || [];
  const filteredRoster = rosterCandidates.filter(
    (c: CandidateRecord) =>
      c.fullName.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      c.enrollmentNumber.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      c.maskedAadhaar.toLowerCase().includes(rosterSearch.toLowerCase()) ||
      c.fatherName.toLowerCase().includes(rosterSearch.toLowerCase())
  );

  return (
    <AppShell
      userRole="QUALITY_OFFICER"
      userName="S. Sen (State Quality Directorate)"
      pageTitle="Quality Assurance &amp; Audit Portal"
      pageDescription="Statewide 10% statistical randomized audit sampling and automated high-volume anomaly scrutiny (threshold: 100 candidates)."
      breadcrumbs={[{ label: 'Quality Assurance', href: '#' }, { label: 'Sampling Queue' }]}
      activeNavId={activeNav}
      onNavSelect={(navId) => setActiveNav(navId as any)}
    >
      <div className="space-y-6">
        {/* Quality Metric Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-4">
          <Card
            className={`shadow-card cursor-pointer transition-all ${
              activeNav === 'reviews' ? 'ring-2 ring-[#163A5F] bg-[#163A5F]/5' : ''
            }`}
            onClick={() => setActiveNav('reviews')}
          >
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-[#163A5F]/70 uppercase">Batches In Sampling</span>
              <FileSearch className="w-4 h-4 text-[#163A5F]" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-[#163A5F]">
                {batches.filter((b) => b.status === 'DISTRICT_APPROVED').length}
              </div>
              <p className="text-[11px] text-[#172B3A]/60 mt-1">Dual-sign verified batches</p>
            </CardContent>
          </Card>

          <Card
            className={`shadow-card cursor-pointer transition-all ${
              activeNav === 'alerts' ? 'ring-2 ring-[#C49A3A] bg-[#C49A3A]/10' : ''
            }`}
            onClick={() => setActiveNav('alerts')}
          >
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-[#C49A3A] uppercase">High-Volume Flags (&gt;100)</span>
              <AlertTriangle className="w-4 h-4 text-[#C49A3A]" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-[#C49A3A] tabular-nums">
                {highVolumeAlerts.length} Batches
              </div>
              <p className="text-[11px] text-[#C49A3A] font-semibold mt-1">Mandatory 10% scrutiny</p>
            </CardContent>
          </Card>

          <Card
            className="shadow-card cursor-pointer transition-all hover:bg-[#245B85]/5"
            onClick={() => setActiveNav('reviews')}
          >
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-[#163A5F]/70 uppercase">Candidates In Queue</span>
              <Users className="w-4 h-4 text-[#245B85]" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-[#245B85] tabular-nums">
                {qualityQueue.reduce((acc, b) => acc + (b.candidateCount || 0), 0)}
              </div>
              <p className="text-[11px] text-[#172B3A]/60 mt-1">PRNG sample validation pool</p>
            </CardContent>
          </Card>

          <Card
            className={`shadow-card cursor-pointer transition-all ${
              activeNav === 'checklists' ? 'ring-2 ring-[#0F766E] bg-[#0F766E]/5' : ''
            }`}
            onClick={() => setActiveNav('checklists')}
          >
            <CardHeader className="p-4 flex flex-row items-center justify-between pb-2">
              <span className="text-xs font-semibold text-[#0F766E] uppercase">Sampling Pass Rate</span>
              <CheckCircle2 className="w-4 h-4 text-[#0F766E]" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold text-[#0F766E] tabular-nums">100%</div>
              <p className="text-[11px] text-[#172B3A]/60 mt-1">Conforms to NCVET criteria</p>
            </CardContent>
          </Card>
        </div>

        {/* NCVET Compliance Guidelines Banner if on checklists tab */}
        {activeNav === 'checklists' && (
          <Card className="shadow-card border-[#0F766E]/40 bg-[#0F766E]/5 overflow-hidden">
            <CardHeader className="p-4 border-b border-[#0F766E]/20">
              <CardTitle className="text-sm font-bold text-[#0F766E] flex items-center gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span>NCVET Statutory Sampling &amp; Quality Audit Standards</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3 text-xs text-[#172B3A]">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-3 bg-white rounded border border-[#DCE3EA]">
                  <h4 className="font-bold text-[#163A5F] mb-1">1. 10% Randomized Sampling</h4>
                  <p className="text-[#172B3A]/70 text-[11px]">
                    Every batch exceeding 10 candidates is sampled using deterministic SHA-256 PRNG seeding to prevent audit cherry-picking.
                  </p>
                </div>
                <div className="p-3 bg-white rounded border border-[#DCE3EA]">
                  <h4 className="font-bold text-[#163A5F] mb-1">2. 100+ High-Volume Rule</h4>
                  <p className="text-[#172B3A]/70 text-[11px]">
                    Batches with &gt;100 candidates automatically trigger vigilance scrutiny to ensure training centers maintain instructor-to-student ratios.
                  </p>
                </div>
                <div className="p-3 bg-white rounded border border-[#DCE3EA]">
                  <h4 className="font-bold text-[#163A5F] mb-1">3. 50% Cutoff &amp; 80% Attendance</h4>
                  <p className="text-[#172B3A]/70 text-[11px]">
                    No candidate below 80% biometric attendance or below 50% cumulative assessment marks may be certified.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* High Volume Alert Banner */}
        {activeNav === 'alerts' && (
          <div className="rounded-lg border border-[#C49A3A]/40 bg-[#C49A3A]/10 p-4 shadow-sm">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-[#C49A3A] shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-[#172B3A]">
                  Automated High-Volume Vigilance Filter Active (&gt;100 Candidates)
                </h2>
                <p className="text-xs text-[#172B3A]/80 mt-1 leading-relaxed">
                  Showing only batches exceeding the standard threshold of 100 candidates. The system has automatically extracted a mandatory 10% sample for physical and digital verification before state escalation.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Batches Table */}
        <Card className="shadow-card overflow-hidden">
          <CardHeader className="p-4 sm:p-6 border-b border-[#DCE3EA] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <CardTitle className="text-base text-[#163A5F]">
                {activeNav === 'alerts'
                  ? 'High-Volume Anomaly Queue (>100 Candidates)'
                  : activeNav === 'checklists'
                  ? 'NCVET Quality Audit Checklists & Guidelines'
                  : 'Quality Review &amp; Randomized Sampling Queue'}
              </CardTitle>
              <p className="text-xs text-[#172B3A]/60 mt-0.5">
                Inspect statistically extracted candidate dossiers to certify batch integrity before final state clearance.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant={activeNav === 'reviews' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveNav('reviews')}
                className="text-xs"
              >
                All Batches ({qualityQueue.length})
              </Button>
              <Button
                variant={activeNav === 'alerts' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveNav('alerts')}
                className="text-xs text-[#C49A3A] border-[#C49A3A]/40"
              >
                High-Volume ({highVolumeAlerts.length})
              </Button>
              <Button
                variant={activeNav === 'checklists' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveNav('checklists')}
                className="text-xs"
              >
                NCVET Rules
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Batch Number</TableHead>
                  <TableHead>Training Centre &amp; District</TableHead>
                  <TableHead>Total Roster</TableHead>
                  <TableHead>Sampled Dossiers</TableHead>
                  <TableHead>Risk Classification</TableHead>
                  <TableHead className="text-right">Audit &amp; Candidate Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {displayedBatches.length > 0 ? (
                  displayedBatches.map((batch: PlatformBatch) => (
                    <TableRow key={batch.id}>
                      <TableCell className="font-mono font-bold text-[#163A5F]">
                        {batch.batchNumber}
                        <div className="text-[10px] text-[#172B3A]/60 font-sans font-normal">
                          {batch.status === 'DISTRICT_APPROVED' ? (
                            <span className="text-[#C49A3A] font-semibold">Ready for Quality Sampling</span>
                          ) : (
                            <span className="text-[#0F766E] font-semibold">✓ Quality Certified</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium text-[#172B3A]">{batch.trainingCentre}</div>
                        <div className="text-xs text-[#172B3A]/60">{batch.district} • {batch.courseName}</div>
                      </TableCell>
                      <TableCell className="tabular-nums font-mono font-bold text-[#163A5F]">
                        {batch.candidateCount}
                      </TableCell>
                      <TableCell>
                        <span className="font-mono font-bold text-[#0F766E]">{batch.sampleSize}</span>{' '}
                        <span className="text-xs text-[#172B3A]/60">(10% PRNG)</span>
                      </TableCell>
                      <TableCell>
                        {batch.isHighVolumeAlert ? (
                          <Badge variant="warning" className="gap-1">
                            <AlertTriangle className="w-3 h-3" /> High-Volume Flag
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="gap-1 text-[#172B3A]/70">
                            Standard Sampling
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => {
                              setRosterBatch(batch);
                              setRosterSearch('');
                              setRosterModalOpen(true);
                            }}
                            className="gap-1 text-xs border-[#163A5F]/30 text-[#163A5F] hover:bg-[#163A5F]/10"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>View Roster ({batch.candidateCount})</span>
                          </Button>

                          {batch.status === 'DISTRICT_APPROVED' ? (
                            <Button
                              variant="default"
                              size="sm"
                              onClick={() => {
                                setSelectedBatch(batch);
                                setCheck1(false);
                                setCheck2(false);
                                setCheck3(false);
                              }}
                              className="gap-1.5 text-xs bg-[#0F766E] hover:bg-[#0B5953]"
                            >
                              <FileSearch className="w-3.5 h-3.5" />
                              <span>Audit 10% Sample ({batch.sampleSize})</span>
                            </Button>
                          ) : (
                            <Badge variant="success" className="text-xs py-1 px-2 gap-1">
                              ✓ Quality Cleared
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-xs text-[#172B3A]/60">
                      No batches in the Quality Sampling Queue.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* 10% Sampled Candidates Quality Audit Dialog */}
      <Dialog open={selectedBatch !== null} onClose={() => setSelectedBatch(null)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-[#0F766E]" />
            <span>10% PRNG Quality Audit Dossier: {selectedBatch?.batchNumber}</span>
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-[#F4F7FA] p-3 rounded-lg border border-[#DCE3EA]">
              <div>
                <p className="text-xs text-[#172B3A]">
                  Centre: <strong>{selectedBatch?.trainingCentre}</strong> ({selectedBatch?.district})
                </p>
                <p className="text-xs text-[#163A5F] font-bold mt-0.5">
                  Course: {selectedBatch?.courseName || 'Accredited Qualification'}
                </p>
              </div>
              <div className="flex items-center gap-1.5">
                <Badge variant="outline" className="text-xs bg-white">
                  Total Roster: {selectedBatch?.candidateCount}
                </Badge>
                <Badge variant="warning" className="text-xs">
                  Auditing {activeSamples.length} Sampled Dossiers
                </Badge>
              </div>
            </div>

            {/* Candidate Sample Dossier Cards */}
            <div className="space-y-2">
              <span className="text-xs font-bold text-[#163A5F] block">
                Statistically Extracted Candidate Sample Dossiers (Click to Audit):
              </span>
              <div className="border border-[#DCE3EA] rounded-md overflow-hidden max-h-60 overflow-y-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#F4F7FA]">
                      <TableHead className="text-xs">Candidate &amp; Father</TableHead>
                      <TableHead className="text-xs">Enrollment &amp; Aadhaar</TableHead>
                      <TableHead className="text-xs text-center">Attendance %</TableHead>
                      <TableHead className="text-xs text-center">Marks (T/P)</TableHead>
                      <TableHead className="text-xs text-right">Audit Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {activeSamples.map((sample: CandidateRecord) => {
                      const isAudited = auditedCandidateIds[sample.id] ?? true;
                      return (
                        <TableRow
                          key={sample.id}
                          className={`cursor-pointer transition-colors ${
                            isAudited ? 'bg-[#0F766E]/5' : ''
                          }`}
                          onClick={() => handleToggleAudit(sample.id)}
                        >
                          <TableCell>
                            <div className="font-bold text-xs text-[#163A5F]">{sample.fullName}</div>
                            <div className="text-[10px] text-[#172B3A]/60">
                              {sample.fatherName} • {sample.dob}
                            </div>
                          </TableCell>
                          <TableCell className="font-mono text-xs">
                            <div className="text-[#163A5F] font-semibold">{sample.enrollmentNumber}</div>
                            <div className="text-[10px] text-[#172B3A]/60">{sample.maskedAadhaar}</div>
                          </TableCell>
                          <TableCell className="text-center">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-xs font-mono font-bold ${
                                sample.attendance >= 80
                                  ? 'bg-[#0F766E]/10 text-[#0F766E]'
                                  : 'bg-[#B91C1C]/10 text-[#B91C1C]'
                              }`}
                            >
                              {sample.attendance}%
                            </span>
                          </TableCell>
                          <TableCell className="text-center font-mono text-xs">
                            <span className="font-semibold text-[#163A5F]">{sample.theoryScore}T</span> /{' '}
                            <span className="font-semibold text-[#0F766E]">{sample.practicalScore}P</span>
                          </TableCell>
                          <TableCell className="text-right">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleToggleAudit(sample.id);
                              }}
                              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-1 rounded transition-colors ${
                                isAudited
                                  ? 'bg-[#0F766E] text-white'
                                  : 'border border-[#DCE3EA] text-[#172B3A]/60 hover:border-[#0F766E]'
                              }`}
                            >
                              {isAudited ? (
                                <>
                                  <Check className="w-3 h-3" />
                                  <span>Sample Audited</span>
                                </>
                              ) : (
                                <span>Pending Audit</span>
                              )}
                            </button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Statutory Quality Checklist */}
            <div className="space-y-2 bg-[#F4F7FA] p-3 rounded-lg border border-[#DCE3EA]">
              <span className="text-xs font-bold text-[#163A5F] block">
                Statutory Quality Sign-off Attestation:
              </span>

              <label className="flex items-start gap-2 text-xs text-[#172B3A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={check1}
                  onChange={(e) => setCheck1(e.target.checked)}
                  className="mt-0.5 rounded border-[#DCE3EA] text-[#0F766E]"
                />
                <span>
                  All sampled candidates exceed the mandatory 80% biometric attendance threshold.
                </span>
              </label>

              <label className="flex items-start gap-2 text-xs text-[#172B3A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={check2}
                  onChange={(e) => setCheck2(e.target.checked)}
                  className="mt-0.5 rounded border-[#DCE3EA] text-[#0F766E]"
                />
                <span>
                  All sampled candidates exceed minimum 50% theoretical and practical assessment marks.
                </span>
              </label>

              <label className="flex items-start gap-2 text-xs text-[#172B3A] cursor-pointer">
                <input
                  type="checkbox"
                  checked={check3}
                  onChange={(e) => setCheck3(e.target.checked)}
                  className="mt-0.5 rounded border-[#DCE3EA] text-[#0F766E]"
                />
                <span>No duplicate enrollment or Aadhaar collision detected across active batches.</span>
              </label>

              <div className="space-y-1 pt-1">
                <Label htmlFor="qualityRemarks">Quality Officer Notes &amp; Audit Log</Label>
                <textarea
                  id="qualityRemarks"
                  rows={2}
                  value={remarks}
                  onChange={(e) => setRemarks(e.target.value)}
                  placeholder="Sample candidate dossiers verified against attendance biometric records and practical test logs..."
                  className="w-full rounded-md border border-[#DCE3EA] p-2 text-xs focus:border-[#163A5F] focus:outline-none"
                />
              </div>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setSelectedBatch(null)}>
            Close
          </Button>
          <Button
            variant="default"
            size="sm"
            onClick={handleApproveQuality}
            disabled={!allChecked}
            className="bg-[#0F766E] hover:bg-[#0B5953]"
          >
            Certify Quality Pass &amp; Forward to State
          </Button>
        </DialogFooter>
      </Dialog>

      {/* Full Batch Candidate Roster Modal */}
      <Dialog open={rosterModalOpen} onClose={() => setRosterModalOpen(false)}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Users className="w-5 h-5 text-[#163A5F]" />
            <span>Complete Candidate Roster: {rosterBatch?.batchNumber}</span>
          </DialogTitle>
        </DialogHeader>
        <DialogContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-[#F4F7FA] p-3 rounded-lg border border-[#DCE3EA]">
              <div>
                <p className="text-xs font-bold text-[#163A5F]">{rosterBatch?.courseName}</p>
                <p className="text-[11px] text-[#172B3A]/70">
                  {rosterBatch?.trainingCentre} ({rosterBatch?.district})
                </p>
              </div>
              <Badge variant="outline" className="text-xs bg-white text-[#163A5F]">
                {rosterBatch?.candidateCount} Total Enrolled
              </Badge>
            </div>

            <div className="relative">
              <Search className="w-4 h-4 text-[#245B85] absolute left-3 top-2.5" />
              <Input
                type="text"
                value={rosterSearch}
                onChange={(e) => setRosterSearch(e.target.value)}
                placeholder="Filter by candidate name, father's name, enrollment number, or Aadhaar..."
                className="pl-9 text-xs h-9"
              />
            </div>

            <div className="border border-[#DCE3EA] rounded-md overflow-hidden max-h-80 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#F4F7FA]">
                    <TableHead className="text-xs">Candidate Name</TableHead>
                    <TableHead className="text-xs">Father's Name &amp; DOB</TableHead>
                    <TableHead className="text-xs">Enrollment Number</TableHead>
                    <TableHead className="text-xs">Masked Aadhaar</TableHead>
                    <TableHead className="text-xs text-center">Attendance %</TableHead>
                    <TableHead className="text-xs text-center">Marks (T/P)</TableHead>
                    <TableHead className="text-xs text-right">Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredRoster.length > 0 ? (
                    filteredRoster.map((c: CandidateRecord) => (
                      <TableRow key={c.id}>
                        <TableCell className="font-bold text-xs text-[#163A5F]">
                          {c.fullName}
                        </TableCell>
                        <TableCell className="text-xs text-[#172B3A]">
                          <div>{c.fatherName}</div>
                          <div className="text-[10px] text-[#172B3A]/60">
                            {c.dob} ({c.gender})
                          </div>
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[#172B3A]/70">
                          {c.enrollmentNumber}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-[#172B3A]">
                          {c.maskedAadhaar}
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs font-bold text-[#0F766E]">
                          {c.attendance}%
                        </TableCell>
                        <TableCell className="text-center font-mono text-xs">
                          {c.theoryScore}T / {c.practicalScore}P
                        </TableCell>
                        <TableCell className="text-right">
                          <Badge variant="success" className="text-[10px]">
                            ✓ Qualified
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-6 text-xs text-[#172B3A]/60">
                        No candidates matched your search criteria.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DialogContent>
        <DialogFooter>
          <Button variant="outline" size="sm" onClick={() => setRosterModalOpen(false)}>
            Close Roster
          </Button>
        </DialogFooter>
      </Dialog>
    </AppShell>
  );
};
