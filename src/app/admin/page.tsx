"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  Award,
  Users,
  Building2,
  Phone,
  Clock,
  Download,
  Search,
  CheckCircle2,
  ShieldAlert,
  ArrowUpRight,
  BookOpen,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Power,
  Calendar,
  Lock,
  Unlock,
  SlidersHorizontal,
} from "lucide-react";
import { MicrochipGraphic, CircuitBoardBg, HardwareSensorIcon, HardwareRoboticsIcon } from "@/components/HardwareGraphics";

interface SchoolCandidate {
  attemptId: string;
  studentId: string;
  name: string;
  schoolName: string;
  className: string;
  medium: string;
  parentMobile: string;
  score: number;
  totalMarks: number;
  timeTakenSeconds: number;
  cheatWarnings: number;
  submittedAt: string;
  rankInSchool: number;
  isFinalist: boolean;
}

interface SchoolGroup {
  schoolName: string;
  totalCandidates: number;
  topTwo: SchoolCandidate[];
  allCandidates: SchoolCandidate[];
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"toppers" | "submissions" | "questions">("toppers");
  const [schools, setSchools] = useState<SchoolGroup[]>([]);
  const [allFinalists, setAllFinalists] = useState<SchoolCandidate[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedSchool, setExpandedSchool] = useState<string | null>(null);
  const [portalWindow, setPortalWindow] = useState<any>(null);
  const [updatingPortal, setUpdatingPortal] = useState(false);

  const fetchPortalStatus = async () => {
    try {
      const res = await fetch("/api/admin/portal-status");
      const d = await res.json();
      if (d.windowInfo) setPortalWindow(d.windowInfo);
    } catch (e) {
      console.error("Failed to fetch portal status", e);
    }
  };

  const handleUpdatePortalStatus = async (newStatus: "SCHEDULED" | "FORCE_OPEN" | "FORCE_CLOSED") => {
    setUpdatingPortal(true);
    try {
      const res = await fetch("/api/admin/portal-status", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      const d = await res.json();
      if (d.windowInfo) {
        setPortalWindow(d.windowInfo);
      }
    } catch (e) {
      alert("Failed to update portal status.");
    } finally {
      setUpdatingPortal(false);
    }
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/school-toppers");
      const data = await res.json();

      if (data.schools) setSchools(data.schools);
      if (data.allFinalists) setAllFinalists(data.allFinalists);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    fetchPortalStatus();
  }, []);

  const formatSeconds = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  };

  // CSV Export for Top 2 per School
  const handleExportFinalistsCSV = () => {
    if (allFinalists.length === 0) {
      alert("No submissions available to export.");
      return;
    }

    const headers = [
      "School Name",
      "School Rank",
      "Student Name",
      "Class",
      "Medium",
      "Parent Mobile Number",
      "Score",
      "Total Marks",
      "Time Taken (Seconds)",
      "Time Taken (Formatted)",
      "Submission Date",
    ];

    const rows = allFinalists.map((f) => [
      `"${f.schoolName.replace(/"/g, '""')}"`,
      `Rank ${f.rankInSchool}`,
      `"${f.name.replace(/"/g, '""')}"`,
      `"${f.className}"`,
      f.medium,
      f.parentMobile,
      f.score,
      f.totalMarks,
      f.timeTakenSeconds,
      formatSeconds(f.timeTakenSeconds),
      new Date(f.submittedAt).toLocaleString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `School_Toppers_Top2_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // CSV Export for All Submissions
  const handleExportAllSubmissionsCSV = () => {
    const all = schools.flatMap((s) => s.allCandidates);
    if (all.length === 0) {
      alert("No submissions to export.");
      return;
    }

    const headers = [
      "Student Name",
      "School Name",
      "Class",
      "Medium",
      "Parent Mobile",
      "Score",
      "Time Taken",
      "Cheat Warnings",
      "Date",
    ];

    const rows = all.map((c) => [
      `"${c.name.replace(/"/g, '""')}"`,
      `"${c.schoolName.replace(/"/g, '""')}"`,
      c.className,
      c.medium,
      c.parentMobile,
      c.score,
      formatSeconds(c.timeTakenSeconds),
      c.cheatWarnings,
      new Date(c.submittedAt).toLocaleString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `All_Candidate_Submissions_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filteredSchools = schools.filter((s) =>
    s.schoolName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    s.allCandidates.some((c) => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const totalCandidates = schools.reduce((acc, curr) => acc + curr.totalCandidates, 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header Bar with Hardware Hackathon SVG Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-indigo-950 text-white p-6 sm:p-8 shadow-xl border border-blue-800/40">
        <CircuitBoardBg className="absolute inset-0 w-full h-full opacity-35" />

        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-xs font-bold backdrop-blur-sm">
              <HardwareSensorIcon className="w-3.5 h-3.5 text-blue-400" />
              <span>Hardware Hackathon Evaluation Core</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
              School Toppers &amp; Submissions Portal
            </h1>
            <p className="text-xs sm:text-sm text-slate-300">
              Automated ranking engine: selects the top 2 candidates per school with the{" "}
              <b>highest score in least completion time</b>. All individual marksheets are printable with audited timestamps.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden lg:block">
              <MicrochipGraphic className="w-16 h-16 opacity-75" />
            </div>
            <button
              onClick={handleExportFinalistsCSV}
              className="inline-flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs sm:text-sm font-bold py-2.5 px-4 rounded-xl shadow-md shadow-emerald-600/20 transition whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              Export Top 2 per School (CSV)
            </button>
          </div>
        </div>
      </div>

      {/* EXAM PORTAL MASTER OVERRIDE CONTROL CARD */}
      <div className="bg-white rounded-3xl border-2 border-slate-200 p-6 shadow-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold">
              <SlidersHorizontal className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-black text-slate-900">
                  Exam Portal Master Control
                </h2>
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                    portalWindow?.isOpen
                      ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                      : "bg-rose-50 text-rose-700 border-rose-300"
                  }`}
                >
                  {portalWindow?.isOpen ? "● PORTAL OPEN" : "○ PORTAL CLOSED"}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Current Mode:{" "}
                <b className="text-slate-800">
                  {portalWindow?.override === "FORCE_OPEN"
                    ? "🟢 Manually Forced OPEN (Candidates can take exam anytime)"
                    : portalWindow?.override === "FORCE_CLOSED"
                    ? "🔴 Manually Forced CLOSED (Candidate access blocked)"
                    : "⏰ Auto-Scheduled (September 9, 2026, 10:00 AM – 10:00 PM IST)"}
                </b>
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              disabled={updatingPortal}
              onClick={() => handleUpdatePortalStatus("SCHEDULED")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                portalWindow?.override === "SCHEDULED" || !portalWindow?.override
                  ? "bg-blue-600 text-white border-blue-600 shadow-xs"
                  : "bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              ⏰ Auto Schedule (Sept 9)
            </button>

            <button
              type="button"
              disabled={updatingPortal}
              onClick={() => handleUpdatePortalStatus("FORCE_OPEN")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                portalWindow?.override === "FORCE_OPEN"
                  ? "bg-emerald-600 text-white border-emerald-600 shadow-xs ring-2 ring-emerald-400/40"
                  : "bg-slate-50 hover:bg-emerald-50 text-emerald-700 border-emerald-200"
              }`}
            >
              <Unlock className="w-3.5 h-3.5" />
              🟢 Open Now (Force Open)
            </button>

            <button
              type="button"
              disabled={updatingPortal}
              onClick={() => handleUpdatePortalStatus("FORCE_CLOSED")}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                portalWindow?.override === "FORCE_CLOSED"
                  ? "bg-rose-600 text-white border-rose-600 shadow-xs ring-2 ring-rose-400/40"
                  : "bg-slate-50 hover:bg-rose-50 text-rose-700 border-rose-200"
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              🔴 Close Now (Force Close)
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-500 flex flex-wrap items-center justify-between gap-2">
          <span>
            Window schedule: <b>{portalWindow?.startDateStr}</b> &rarr; <b>{portalWindow?.endDateStr}</b>
          </span>
          <span className="text-slate-400">
            Changes apply in real-time to candidate registrations and active sessions across the server.
          </span>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Participating Schools</span>
            <Building2 className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{schools.length}</div>
          <p className="text-[11px] text-slate-500">Registered schools</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Total Submissions</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">{totalCandidates}</div>
          <p className="text-[11px] text-slate-500">Completed 8-min tests</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Selected Finalists</span>
            <Award className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-slate-900">{allFinalists.length}</div>
          <p className="text-[11px] text-slate-500">Top 2 students per school</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Question Bank</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">1,000</div>
          <p className="text-[11px] text-slate-500">Random 25 questions / candidate</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("toppers")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "toppers"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Award className="w-4 h-4" />
            School Toppers (Top 2 per School)
          </button>

          <button
            onClick={() => setActiveTab("submissions")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
              activeTab === "submissions"
                ? "bg-blue-600 text-white shadow-xs"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            <Users className="w-4 h-4" />
            All Submissions ({totalCandidates})
          </button>
        </div>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search school or student..."
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-slate-300 text-xs bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* Tab 1: SCHOOL TOPPERS (TOP 2 PER SCHOOL) */}
      {activeTab === "toppers" && (
        <div className="space-y-6">
          {loading ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              Calculating school rankings and generating top scores...
            </div>
          ) : filteredSchools.length === 0 ? (
            <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center text-slate-500 text-xs">
              No school submissions found matching your search.
            </div>
          ) : (
            filteredSchools.map((group) => {
              const isExpanded = expandedSchool === group.schoolName;

              return (
                <div
                  key={group.schoolName}
                  className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden"
                >
                  {/* School Card Header */}
                  <div className="p-5 sm:p-6 bg-slate-50/70 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                        <Building2 className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-slate-900">
                          {group.schoolName}
                        </h3>
                        <span className="text-xs text-slate-500">
                          Total Candidates: <b>{group.totalCandidates}</b>
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                        Top 2 Finalists Selected
                      </span>
                      <button
                        onClick={() =>
                          setExpandedSchool(isExpanded ? null : group.schoolName)
                        }
                        className="p-2 rounded-xl text-slate-500 hover:text-slate-800 hover:bg-slate-200/60 transition text-xs font-semibold flex items-center gap-1"
                      >
                        {isExpanded ? "Hide All" : "View All"}
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4" />
                        ) : (
                          <ChevronDown className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>

                  {/* Top 2 Finalists Grid */}
                  <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                    {group.topTwo.map((candidate) => {
                      const isRank1 = candidate.rankInSchool === 1;

                      return (
                        <div
                          key={candidate.attemptId}
                          className={`p-5 rounded-2xl border-2 transition relative overflow-hidden ${
                            isRank1
                              ? "border-amber-400 bg-amber-50/40"
                              : "border-slate-300 bg-slate-50/50"
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200/60">
                            <div className="flex items-center gap-2">
                              <span
                                className={`text-xs font-black px-2 py-0.5 rounded-full ${
                                  isRank1
                                    ? "bg-amber-500 text-white"
                                    : "bg-slate-700 text-white"
                                }`}
                              >
                                {isRank1 ? "🥇 Rank 1" : "🥈 Rank 2"}
                              </span>
                              <span className="text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded">
                                Finalist
                              </span>
                            </div>

                            <Link
                              href={`/admin/marksheet/${candidate.attemptId}`}
                              className="text-[11px] font-bold text-blue-600 hover:underline flex items-center gap-0.5"
                            >
                              Print Marksheet <ArrowUpRight className="w-3 h-3" />
                            </Link>
                          </div>

                          <div className="pt-3 space-y-2">
                            <h4 className="text-base font-black text-slate-900">
                              {candidate.name}
                            </h4>

                            <div className="grid grid-cols-2 gap-2 text-xs text-slate-600">
                              <div className="bg-white p-2 rounded-xl border border-slate-200">
                                <span className="text-[10px] text-slate-400 block font-bold uppercase">
                                  Score
                                </span>
                                <span className="text-sm font-black text-slate-900">
                                  {candidate.score} / {candidate.totalMarks}
                                </span>
                              </div>

                              <div className="bg-white p-2 rounded-xl border border-slate-200">
                                <span className="text-[10px] text-slate-400 block font-bold uppercase">
                                  Time Taken
                                </span>
                                <span className="text-sm font-black text-blue-600">
                                  {formatSeconds(candidate.timeTakenSeconds)}
                                </span>
                              </div>
                            </div>

                            <div className="pt-1 text-xs text-slate-600 space-y-1">
                              <p>
                                Class: <b>{candidate.className}</b> • Medium: <b>{candidate.medium}</b>
                              </p>
                              <p className="flex items-center gap-1">
                                <Phone className="w-3.5 h-3.5 text-emerald-600" />
                                Parent Mobile:{" "}
                                <a
                                  href={`tel:${candidate.parentMobile}`}
                                  className="font-mono font-bold text-slate-900 hover:underline"
                                >
                                  {candidate.parentMobile}
                                </a>
                              </p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Expanded: All Candidates Table */}
                  {isExpanded && (
                    <div className="p-6 pt-0 border-t border-slate-100">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        All Participants from {group.schoolName}
                      </h4>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-xs">
                          <thead className="bg-slate-100 text-slate-600 font-bold uppercase text-[10px]">
                            <tr>
                              <th className="p-2.5">Rank</th>
                              <th className="p-2.5">Candidate</th>
                              <th className="p-2.5">Class</th>
                              <th className="p-2.5">Medium</th>
                              <th className="p-2.5">Parent Mobile</th>
                              <th className="p-2.5 text-center">Score</th>
                              <th className="p-2.5 text-center">Time Taken</th>
                              <th className="p-2.5 text-right">Audit</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100">
                            {group.allCandidates.map((c) => (
                              <tr
                                key={c.attemptId}
                                className={c.isFinalist ? "bg-emerald-50/40 font-medium" : "hover:bg-slate-50"}
                              >
                                <td className="p-2.5 font-bold">#{c.rankInSchool}</td>
                                <td className="p-2.5 font-semibold text-slate-900">{c.name}</td>
                                <td className="p-2.5">{c.className}</td>
                                <td className="p-2.5">{c.medium}</td>
                                <td className="p-2.5 font-mono">{c.parentMobile}</td>
                                <td className="p-2.5 text-center font-bold text-slate-900">
                                  {c.score} / {c.totalMarks}
                                </td>
                                <td className="p-2.5 text-center font-semibold text-blue-600">
                                  {formatSeconds(c.timeTakenSeconds)}
                                </td>
                                <td className="p-2.5 text-right">
                                  <Link
                                    href={`/admin/marksheet/${c.attemptId}`}
                                    className="text-blue-600 hover:underline font-bold"
                                  >
                                    Marksheet
                                  </Link>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* Tab 2: ALL SUBMISSIONS TABLE */}
      {activeTab === "submissions" && (
        <div className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <span className="text-xs font-bold text-slate-600">
              Complete Submissions Audit Log
            </span>
            <button
              onClick={handleExportAllSubmissionsCSV}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 hover:text-blue-600 bg-white px-3 py-1.5 rounded-lg border border-slate-200"
            >
              <Download className="w-3.5 h-3.5" />
              Download All CSV
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">School</th>
                  <th className="p-4">Class & Medium</th>
                  <th className="p-4">Parent Mobile</th>
                  <th className="p-4 text-center">Score</th>
                  <th className="p-4 text-center">Time Taken</th>
                  <th className="p-4 text-center">Submitted At</th>
                  <th className="p-4 text-right">Sheet</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {schools
                  .flatMap((s) => s.allCandidates)
                  .map((sub) => (
                    <tr key={sub.attemptId} className="hover:bg-slate-50/80 transition">
                      <td className="p-4 font-bold text-slate-900">{sub.name}</td>
                      <td className="p-4 text-slate-700">{sub.schoolName}</td>
                      <td className="p-4 text-slate-600">
                        {sub.className} ({sub.medium})
                      </td>
                      <td className="p-4 font-mono text-slate-800">{sub.parentMobile}</td>
                      <td className="p-4 text-center font-black text-slate-900">
                        {sub.score} / {sub.totalMarks}
                      </td>
                      <td className="p-4 text-center font-bold text-blue-600">
                        {formatSeconds(sub.timeTakenSeconds)}
                      </td>
                      <td className="p-4 text-center text-slate-500 text-xs">
                        {new Date(sub.submittedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </td>
                      <td className="p-4 text-right">
                        <Link
                          href={`/admin/marksheet/${sub.attemptId}`}
                          className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200"
                        >
                          Marksheet <ArrowUpRight className="w-3 h-3" />
                        </Link>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
