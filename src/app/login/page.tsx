"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ShieldCheck, LogIn, ArrowLeft, Lock } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Login failed. Please check your credentials.");
        setLoading(false);
        return;
      }

      if (data.user.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/");
      }
      router.refresh();
    } catch {
      setError("An unexpected error occurred. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 py-12">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="h-12 w-12 rounded-2xl bg-blue-600 text-white mx-auto flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Lock className="w-6 h-6 text-amber-300" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Examiner Sign In
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Restricted administrative access for authorized examiners and administrators only.
          </p>
        </div>

        {/* Login Form */}
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Examiner Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="examiner@exam.com"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50 focus:bg-white transition"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">Examiner Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm bg-slate-50 focus:bg-white transition"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm py-3 px-4 rounded-xl shadow-md shadow-blue-600/20 transition disabled:opacity-50"
            >
              <LogIn className="w-4 h-4" />
              {loading ? "Verifying Credentials..." : "Sign In to Admin Portal"}
            </button>
          </form>

          <div className="text-center pt-2 border-t border-slate-100">
            <Link
              href="/"
              className="text-xs font-bold text-slate-500 hover:text-blue-600 inline-flex items-center gap-1 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back to Student Exam Portal
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
