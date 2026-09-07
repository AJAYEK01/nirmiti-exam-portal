"use client";

import { useEffect } from "react";
import Link from "next/link";
import {
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from "lucide-react";
import { CircuitBoardBg } from "@/components/HardwareGraphics";

export default function ExamSubmittedPage() {
  useEffect(() => {
    // Clean up all local session data and cookies so any next student on this shared laptop can take the exam smoothly
    try {
      localStorage.removeItem("nirmiti_submitted_exam");
      document.cookie = "exam_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
      document.cookie = "exam_completed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
    } catch {}
  }, []);

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12 relative overflow-hidden">
      {/* Background Hardware circuit traces */}
      <CircuitBoardBg />

      <div className="max-w-xl w-full bg-white/95 backdrop-blur-md rounded-3xl border border-slate-200 shadow-xl p-8 sm:p-12 text-center space-y-6 relative z-10">
        {/* Success Icon */}
        <div className="w-20 h-20 rounded-3xl bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto shadow-md shadow-emerald-500/15">
          <CheckCircle2 className="w-12 h-12" />
        </div>

        {/* Verified Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold font-manjari">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          NIRMITI 2026 — ഉത്തരങ്ങൾ സുരക്ഷിതമായി സമർപ്പിച്ചു
        </div>

        {/* Title & Bilingual Message */}
        <div className="space-y-3">
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight font-baloo">
            പരീക്ഷ വിജയകരമായി സമർപ്പിച്ചു!
          </h1>
          <p className="text-sm sm:text-base font-bold text-slate-700 font-sans">
            Examination Successfully Submitted
          </p>
          <p className="text-xs sm:text-sm text-slate-600 font-manjari leading-relaxed max-w-md mx-auto">
            നിങ്ങളുടെ 25 ഉത്തരങ്ങളും ക്ലൗഡ് സെർവറിൽ വിജയകരമായി രേഖപ്പെടുത്തിയിരിക്കുന്നു. ഓരോ സ്കൂളിൽ നിന്നും തിരഞ്ഞെടുക്കപ്പെടുന്ന 2 വിജയികളെ (Top 2 Finalists) സംഘാടകർ ഔദ്യോഗികമായി അറിയിക്കുന്നതാണ്. പങ്കെടുത്തതിന് നന്ദി!
          </p>
          <p className="text-xs text-slate-500 font-sans leading-relaxed max-w-md mx-auto">
            Your 25 responses have been safely received and locked. The selected Top 2 finalists from each school will be officially announced by the organizers. Thank you for participating!
          </p>
        </div>

        {/* Single Clear Action Button */}
        <div className="pt-4">
          <Link
            href="/"
            onClick={() => {
              try {
                localStorage.removeItem("nirmiti_submitted_exam");
                document.cookie = "exam_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
                document.cookie = "exam_completed=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
              } catch {}
            }}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm sm:text-base shadow-lg shadow-blue-600/30 hover:shadow-xl hover:shadow-blue-600/40 active:scale-[0.98] transition cursor-pointer font-manjari"
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>അടുത്ത കുട്ടിയുടെ പരീക്ഷ / Home Page</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
