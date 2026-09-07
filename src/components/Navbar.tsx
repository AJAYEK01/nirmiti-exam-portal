"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  GraduationCap,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  FileText,
} from "lucide-react";

export default function Navbar() {
  const router = useRouter();
  const [user, setUser] = useState<{
    id: string;
    name: string;
    email: string;
    role: "STUDENT" | "ADMIN";
  } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    try {
      const res = await fetch("/api/auth/me");
      const data = await res.json();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setUser(null);
    router.push("/login");
    router.refresh();
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="h-10 w-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20 group-hover:bg-blue-700 transition">
            <GraduationCap className="h-5 w-5" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-slate-900 flex items-center gap-1.5">
              NIRMITI
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                EXAM PORTAL
              </span>
            </span>
            <p className="text-[11px] text-slate-500 font-medium leading-none">
              Online Objective Examination System
            </p>
          </div>
        </Link>

        {/* Center / Navigation links */}
        <nav className="hidden md:flex items-center gap-6">
          <Link
            href="/"
            className="text-sm font-medium text-slate-600 hover:text-blue-600 flex items-center gap-1.5 transition"
          >
            <FileText className="w-4 h-4" />
            Exam Portal
          </Link>
          {user?.role === "ADMIN" && (
            <Link
              href="/admin"
              className="text-sm font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1.5 transition bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200"
            >
              <LayoutDashboard className="w-4 h-4" />
              Examiner Portal
            </Link>
          )}
        </nav>

        {/* Right Action / Profile */}
        <div className="flex items-center gap-3">
          {!loading && user ? (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-right">
                <div>
                  <p className="text-sm font-semibold text-slate-800 leading-tight">
                    {user.name}
                  </p>
                  <p className="text-xs text-slate-500 flex items-center justify-end gap-1">
                    {user.role === "ADMIN" ? (
                      <span className="inline-flex items-center text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-amber-200">
                        <ShieldCheck className="w-3 h-3 mr-0.5" /> ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px] font-bold border border-emerald-200">
                        STUDENT
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <button
                onClick={handleLogout}
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                title="Logout"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          ) : !loading ? (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
              >
                Examiner Login
              </Link>
            </div>
          ) : null}
        </div>
      </div>
    </header>
  );
}
