"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LayoutDashboard,
  FilePlus,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  ShieldAlert,
  Trash2,
  Eye,
  Plus,
  Sparkles,
  BookOpen,
  ArrowUpRight,
  TrendingUp,
} from "lucide-react";

interface ExamItem {
  id: string;
  title: string;
  category: string;
  durationMinutes: number;
  totalMarks: number;
  passingMarks: number;
  positiveMarks: number;
  negativeMarks: number;
  _count: {
    questions: number;
    attempts: number;
  };
  createdAt: string;
}

interface SubmissionItem {
  id: string;
  candidateName: string;
  candidateEmail: string;
  examTitle: string;
  score: number;
  totalMarks: number;
  isPassed: boolean;
  cheatWarnings: number;
  submittedAt: string;
}

export default function AdminDashboardPage() {
  const [activeTab, setActiveTab] = useState<"exams" | "submissions">("exams");
  const [exams, setExams] = useState<ExamItem[]>([]);
  const [submissions, setSubmissions] = useState<SubmissionItem[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // New Exam Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [newCategory, setNewCategory] = useState("General");
  const [newDuration, setNewDuration] = useState(20);
  const [newPositiveMarks, setNewPositiveMarks] = useState(2.0);
  const [newNegativeMarks, setNewNegativeMarks] = useState(0.5);
  const [newPassingMarks, setNewPassingMarks] = useState(10);
  const [newShuffle, setNewShuffle] = useState(true);

  // Questions for new exam
  const [questions, setQuestions] = useState<
    {
      text: string;
      options: string[];
      correctAnswer: number;
      explanation: string;
    }[]
  >([
    {
      text: "Which protocol is primarily used for secure web browsing?",
      options: ["HTTP", "HTTPS", "FTP", "SMTP"],
      correctAnswer: 1,
      explanation: "HTTPS (Hypertext Transfer Protocol Secure) encrypts communication using TLS/SSL.",
    },
    {
      text: "What is the time complexity of searching an element in a balanced Binary Search Tree (BST)?",
      options: ["O(1)", "O(n)", "O(log n)", "O(n^2)"],
      correctAnswer: 2,
      explanation: "In a balanced BST, the height is logarithmic, giving O(log n) search time.",
    },
  ]);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [examsRes, statsRes] = await Promise.all([
        fetch("/api/exams"),
        fetch("/api/admin/stats"),
      ]);

      const examsData = await examsRes.json();
      const statsData = await statsRes.json();

      if (examsData.exams) setExams(examsData.exams);
      if (statsData.stats) setStats(statsData.stats);
      if (statsData.recentSubmissions) setSubmissions(statsData.recentSubmissions);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleDeleteExam = async (id: string) => {
    if (!confirm("Are you sure you want to delete this exam and all its records?")) return;

    try {
      const res = await fetch(`/api/exams/${id}`, { method: "DELETE" });
      if (res.ok) {
        setExams((prev) => prev.filter((e) => e.id !== id));
      }
    } catch (err) {
      console.error(err);
      alert("Failed to delete exam.");
    }
  };

  const handleAddQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        text: "",
        options: ["Option A", "Option B", "Option C", "Option D"],
        correctAnswer: 0,
        explanation: "",
      },
    ]);
  };

  const handleUpdateQuestion = (idx: number, field: string, value: any) => {
    setQuestions((prev) => {
      const copy = [...prev];
      copy[idx] = { ...copy[idx], [field]: value };
      return copy;
    });
  };

  const handleUpdateOption = (qIdx: number, optIdx: number, val: string) => {
    setQuestions((prev) => {
      const copy = [...prev];
      const opts = [...copy[qIdx].options];
      opts[optIdx] = val;
      copy[qIdx] = { ...copy[qIdx], options: opts };
      return copy;
    });
  };

  const handleRemoveQuestion = (idx: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== idx));
  };

  // Preset question bank loader
  const handleLoadSamplePreset = () => {
    setQuestions([
      {
        text: "Which SQL command is used to retrieve data from a relational database?",
        options: ["SELECT", "UPDATE", "INSERT", "FETCH"],
        correctAnswer: 0,
        explanation: "The SELECT statement is used to query data from a database.",
      },
      {
        text: "What does CSS stand for in web development?",
        options: [
          "Computer Style Sheets",
          "Creative Style System",
          "Cascading Style Sheets",
          "Colorful Sheet System",
        ],
        correctAnswer: 2,
        explanation: "CSS stands for Cascading Style Sheets.",
      },
      {
        text: "In JavaScript, which method is used to remove the last element from an array?",
        options: ["shift()", "pop()", "push()", "slice()"],
        correctAnswer: 1,
        explanation: "pop() removes the last element from an array and returns that element.",
      },
    ]);
  };

  const handleCreateExam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (questions.length === 0) {
      alert("Please add at least one question to the exam.");
      return;
    }

    try {
      const res = await fetch("/api/exams", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: newTitle,
          description: newDesc,
          category: newCategory,
          durationMinutes: newDuration,
          positiveMarks: newPositiveMarks,
          negativeMarks: newNegativeMarks,
          passingMarks: newPassingMarks,
          shuffleQuestions: newShuffle,
          totalMarks: questions.length * newPositiveMarks,
          questions,
        }),
      });

      if (res.ok) {
        setShowCreateModal(false);
        setNewTitle("");
        setNewDesc("");
        loadAdminData();
      } else {
        alert("Failed to create exam.");
      }
    } catch (err) {
      console.error(err);
      alert("Error creating exam.");
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 text-xs font-bold mb-2">
            <LayoutDashboard className="w-3.5 h-3.5" />
            Examiner & Administrator Portal
          </div>
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">
            Assessment Management Center
          </h1>
          <p className="text-sm text-slate-500">
            Create objective tests, configure negative marking penalties, and review candidate responses.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold py-3 px-5 rounded-2xl shadow-md shadow-blue-600/20 transition"
        >
          <FilePlus className="w-4 h-4" />
          Create New Exam
        </button>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Total Exams</span>
            <BookOpen className="w-4 h-4 text-blue-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalExams ?? exams.length}
          </div>
          <p className="text-[11px] text-slate-500">Published assessments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Submissions</span>
            <Users className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalAttempts ?? 0}
          </div>
          <p className="text-[11px] text-slate-500">Completed test attempts</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Overall Pass Rate</span>
            <TrendingUp className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.passRate ?? 0}%
          </div>
          <p className="text-[11px] text-slate-500">Passing candidates</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase">Registered Students</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-slate-900">
            {stats?.totalStudents ?? 0}
          </div>
          <p className="text-[11px] text-slate-500">Active student accounts</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab("exams")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "exams"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Exams & Question Banks ({exams.length})
        </button>

        <button
          onClick={() => setActiveTab("submissions")}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === "submissions"
              ? "bg-blue-600 text-white shadow-xs"
              : "text-slate-600 hover:bg-slate-100"
          }`}
        >
          <ShieldAlert className="w-4 h-4" />
          Candidate Submissions & Cheat Logs ({submissions.length})
        </button>
      </div>

      {/* Tab 1: Exams List */}
      {activeTab === "exams" && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-4">Exam Title</th>
                  <th className="p-4">Category</th>
                  <th className="p-4 text-center">Questions</th>
                  <th className="p-4 text-center">Duration</th>
                  <th className="p-4 text-center">Scoring Scheme</th>
                  <th className="p-4 text-center">Submissions</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {exams.map((ex) => (
                  <tr key={ex.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900">
                      <div>{ex.title}</div>
                      <span className="text-[11px] font-normal text-slate-400">
                        Pass threshold: {ex.passingMarks} pts
                      </span>
                    </td>
                    <td className="p-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-slate-100 border text-slate-600 text-xs font-semibold">
                        {ex.category}
                      </span>
                    </td>
                    <td className="p-4 text-center font-bold text-slate-800">
                      {ex._count?.questions || 0}
                    </td>
                    <td className="p-4 text-center font-medium text-slate-600">
                      {ex.durationMinutes} mins
                    </td>
                    <td className="p-4 text-center">
                      <span className="text-emerald-700 font-bold">+{ex.positiveMarks}</span>
                      <span className="text-slate-400 mx-1">/</span>
                      <span className="text-rose-600 font-bold">-{ex.negativeMarks}</span>
                    </td>
                    <td className="p-4 text-center font-bold text-blue-600">
                      {ex._count?.attempts || 0}
                    </td>
                    <td className="p-4 text-right space-x-2">
                      <Link
                        href={`/exams/${ex.id}/take`}
                        className="p-2 inline-flex rounded-lg text-slate-600 hover:text-blue-600 hover:bg-blue-50 transition"
                        title="Preview Exam as Student"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => handleDeleteExam(ex.id)}
                        className="p-2 inline-flex rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                        title="Delete Exam"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Candidate Submissions & Audit Logs */}
      {activeTab === "submissions" && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          {submissions.length === 0 ? (
            <div className="p-12 text-center text-slate-500 text-xs">
              No candidate submissions recorded yet. Take an exam as a student to see the audit trail here!
            </div>
          ) : (
            <table className="w-full text-left text-xs sm:text-sm">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[11px]">
                <tr>
                  <th className="p-4">Candidate</th>
                  <th className="p-4">Exam</th>
                  <th className="p-4 text-center">Score</th>
                  <th className="p-4 text-center">Result</th>
                  <th className="p-4 text-center">Tab-Switch Warnings</th>
                  <th className="p-4 text-center">Submission Date</th>
                  <th className="p-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {submissions.map((sub) => (
                  <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                    <td className="p-4 font-bold text-slate-900">
                      <div>{sub.candidateName}</div>
                      <span className="text-[11px] font-normal text-slate-400">
                        {sub.candidateEmail}
                      </span>
                    </td>
                    <td className="p-4 text-slate-700 font-medium">
                      {sub.examTitle}
                    </td>
                    <td className="p-4 text-center font-black text-slate-900">
                      {sub.score} / {sub.totalMarks}
                    </td>
                    <td className="p-4 text-center">
                      {sub.isPassed ? (
                        <span className="px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[11px] font-bold">
                          Passed
                        </span>
                      ) : (
                        <span className="px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200 text-[11px] font-bold">
                          Failed
                        </span>
                      )}
                    </td>
                    <td className="p-4 text-center">
                      {sub.cheatWarnings > 0 ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 border border-amber-300 font-bold text-xs">
                          <ShieldAlert className="w-3.5 h-3.5 text-amber-600" />
                          {sub.cheatWarnings} Violations
                        </span>
                      ) : (
                        <span className="text-slate-400 text-xs">0 (Clean)</span>
                      )}
                    </td>
                    <td className="p-4 text-center text-slate-500 text-xs">
                      {new Date(sub.submittedAt).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-right">
                      <Link
                        href={`/results/${sub.id}`}
                        className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-3 py-1.5 rounded-lg border border-blue-200 transition"
                      >
                        Response Sheet <ArrowUpRight className="w-3 h-3" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* CREATE EXAM MODAL / WIZARD */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-3xl w-full my-8 p-6 sm:p-8 space-y-6 border border-slate-200 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-xl font-black text-slate-900">
                  Create Objective Examination
                </h3>
                <p className="text-xs text-slate-500">
                  Configure exam settings, positive & negative marks, and questions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateExam} className="space-y-6">
              {/* Basic Details */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Exam Title *</label>
                  <input
                    type="text"
                    required
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                    placeholder="e.g. Python Programming Certification Exam"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <label className="text-xs font-bold text-slate-700">Description</label>
                  <textarea
                    rows={2}
                    value={newDesc}
                    onChange={(e) => setNewDesc(e.target.value)}
                    placeholder="Brief description and candidate instructions..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Category</label>
                  <input
                    type="text"
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value)}
                    placeholder="e.g. Computer Science, Aptitude, Engineering"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Duration (Minutes)</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={newDuration}
                    onChange={(e) => setNewDuration(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                {/* Marking scheme */}
                <div className="space-y-1">
                  <label className="text-xs font-bold text-emerald-700">Marks per Correct (+)</label>
                  <input
                    type="number"
                    step="0.25"
                    min={0.1}
                    required
                    value={newPositiveMarks}
                    onChange={(e) => setNewPositiveMarks(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-rose-700">Negative Penalty per Incorrect (-)</label>
                  <input
                    type="number"
                    step="0.05"
                    min={0}
                    required
                    value={newNegativeMarks}
                    onChange={(e) => setNewNegativeMarks(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700">Passing Score (Points)</label>
                  <input
                    type="number"
                    step="0.5"
                    min={0}
                    required
                    value={newPassingMarks}
                    onChange={(e) => setNewPassingMarks(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div className="flex items-center gap-2 pt-6">
                  <input
                    type="checkbox"
                    id="shuffle"
                    checked={newShuffle}
                    onChange={(e) => setNewShuffle(e.target.checked)}
                    className="h-4 w-4 rounded text-blue-600 focus:ring-blue-500 border-slate-300"
                  />
                  <label htmlFor="shuffle" className="text-xs font-bold text-slate-700 cursor-pointer">
                    Randomize question sequence for candidates
                  </label>
                </div>
              </div>

              {/* Questions Section */}
              <div className="space-y-4 pt-4 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-black text-slate-900 uppercase tracking-wider">
                    Questions ({questions.length})
                  </h4>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleLoadSamplePreset}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-800 bg-indigo-50 px-2.5 py-1.5 rounded-lg border border-indigo-200 transition flex items-center gap-1"
                    >
                      <Sparkles className="w-3 h-3" /> Load Sample Preset
                    </button>
                    <button
                      type="button"
                      onClick={handleAddQuestion}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 bg-blue-50 px-2.5 py-1.5 rounded-lg border border-blue-200 transition flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" /> Add Question
                    </button>
                  </div>
                </div>

                {questions.map((q, qIdx) => (
                  <div
                    key={qIdx}
                    className="p-4 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-600">
                        Question #{qIdx + 1}
                      </span>
                      {questions.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveQuestion(qIdx)}
                          className="text-xs text-rose-600 hover:underline font-semibold"
                        >
                          Remove
                        </button>
                      )}
                    </div>

                    <input
                      type="text"
                      required
                      value={q.text}
                      onChange={(e) => handleUpdateQuestion(qIdx, "text", e.target.value)}
                      placeholder="Enter question text here..."
                      className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs sm:text-sm bg-white focus:ring-2 focus:ring-blue-500"
                    />

                    {/* Options (A, B, C, D) */}
                    <div className="space-y-2">
                      <span className="text-[11px] font-bold text-slate-500 block">
                        Options & designate correct key:
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {q.options.map((opt, optIdx) => {
                          const isCorrect = q.correctAnswer === optIdx;
                          const label = String.fromCharCode(65 + optIdx);

                          return (
                            <div
                              key={optIdx}
                              className={`flex items-center gap-2 p-1.5 rounded-xl border ${
                                isCorrect
                                  ? "border-emerald-500 bg-emerald-50/60"
                                  : "border-slate-200 bg-white"
                              }`}
                            >
                              <input
                                type="radio"
                                name={`correct-${qIdx}`}
                                checked={isCorrect}
                                onChange={() => handleUpdateQuestion(qIdx, "correctAnswer", optIdx)}
                                className="ml-1 text-emerald-600 focus:ring-emerald-500"
                                title="Mark as correct answer"
                              />
                              <span className="text-xs font-bold text-slate-600 w-4">
                                {label}
                              </span>
                              <input
                                type="text"
                                required
                                value={opt}
                                onChange={(e) => handleUpdateOption(qIdx, optIdx, e.target.value)}
                                className="flex-1 px-2 py-1 text-xs rounded border border-slate-200 focus:outline-none"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    {/* Explanation */}
                    <input
                      type="text"
                      value={q.explanation}
                      onChange={(e) => handleUpdateQuestion(qIdx, "explanation", e.target.value)}
                      placeholder="Step-by-step solution / explanation (optional)..."
                      className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs bg-white focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                ))}
              </div>

              {/* Submit Buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20"
                >
                  Publish Examination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
