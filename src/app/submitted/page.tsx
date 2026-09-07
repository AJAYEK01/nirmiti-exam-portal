"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  ShieldCheck,
  Building2,
  Phone,
  Clock,
  Home,
  FileCheck,
  Lock,
  Sparkles,
} from "lucide-react";
import { MicrochipGraphic, CircuitBoardBg } from "@/components/HardwareGraphics";

export default function ExamSubmittedPage() {
  const [candidateData, setCandidateData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Record submission flag in localStorage to guard this browser device
    try {
      localStorage.setItem("nirmiti_submitted_exam", "true");
    } catch {}

    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d) => {
        if (d.user) setCandidateData(d.user);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const submissionDate = new Date();

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Hardware Hackathon circuit traces */}
      <CircuitBoardBg />

      <div className="max-w-2xl w-full bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-10 space-y-8 relative z-10">
        {/* Success Icon & Header */}
        <div className="text-center space-y-3">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/10">
            <CheckCircle2 className="w-9 h-9" />
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
            NIRMITI 2026 — Verified &amp; Securely Stored
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Examination Successfully Submitted!
          </h1>
          <p className="text-xs sm:text-sm text-slate-600">
            Your 25 responses have been safely locked in the cloud evaluation repository.
          </p>
        </div>

        {/* Confidentiality Alert Box */}
        <div className="p-5 rounded-2xl bg-amber-50/80 border border-amber-200/90 text-amber-950 space-y-2">
          <div className="flex items-center gap-2 font-bold text-xs sm:text-sm text-amber-900">
            <Lock className="w-4 h-4 text-amber-600 flex-shrink-0" />
            <span>Strict Evaluation &amp; Confidentiality Policy</span>
          </div>
          <p className="text-xs text-amber-900/90 leading-relaxed">
            In accordance with state examination rules, individual marks, scores, and answer keys are kept <b>strictly confidential</b> to guarantee complete competition fairness. <b>Scores and answers will not be displayed to candidates.</b>
          </p>
          <p className="text-[11px] text-amber-800 font-semibold pt-1 border-t border-amber-200/60">
            📢 The selected <b>Top 2 Finalists from each school</b> (evaluated by highest score in least time) will be officially announced by the organizers.
          </p>
        </div>

        {/* Official Submission Receipt */}
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-5 space-y-4 text-xs sm:text-sm">
          <div className="flex items-center justify-between pb-3 border-b border-slate-200/70">
            <span className="font-bold text-slate-700 flex items-center gap-1.5">
              <FileCheck className="w-4 h-4 text-blue-600" />
              Official Examination Receipt
            </span>
            <span className="text-[11px] font-mono text-slate-400">
              {submissionDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <span className="text-slate-400 text-xs block font-medium">Candidate Name</span>
              <strong className="text-slate-900 font-bold">{candidateData?.name || "Candidate"}</strong>
            </div>

            <div>
              <span className="text-slate-400 text-xs block font-medium">School Name</span>
              <strong className="text-slate-900 font-bold">{candidateData?.schoolName || "Registered School"}</strong>
            </div>

            <div>
              <span className="text-slate-400 text-xs block font-medium">Class &amp; Medium</span>
              <strong className="text-slate-900 font-bold">
                {candidateData?.className || "Class 10"} ({candidateData?.medium || "ENGLISH"})
              </strong>
            </div>

            <div>
              <span className="text-slate-400 text-xs block font-medium">Candidate ID</span>
              <strong className="text-slate-900 font-bold font-mono">
                {candidateData?.id ? candidateData.id.slice(0, 12).toUpperCase() : "VERIFIED"}
              </strong>
            </div>

            <div className="sm:col-span-2 pt-2 border-t border-slate-200/50 flex items-center justify-between text-xs text-slate-500">
              <span>Duration: <b>8 Minutes Max</b></span>
              <span>Questions: <b>25 Questions</b></span>
              <span>Status: <b className="text-emerald-600">Submitted & Locked</b></span>
            </div>
          </div>
        </div>

        {/* Footer actions */}
        <div className="pt-2 text-center">
          <Link
            href="/"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition"
          >
            <Home className="w-4 h-4" />
            Return to Portal Home
          </Link>
        </div>
      </div>
    </div>
  );
}
