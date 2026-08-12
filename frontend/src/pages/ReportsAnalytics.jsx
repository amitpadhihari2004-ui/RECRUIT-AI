import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  getMyAnalytics,
  refreshMyDashboard,
} from "../api/analyticsApi";

import {
  Activity,
  Award,
  BarChart3,
  Brain,
  BriefcaseBusiness,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  Clock3,
  FileText,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserRound,
  XCircle,
  AlertCircle,
  Rocket,
  Globe2,
  Lock,
  Zap,
} from "lucide-react";

export default function ReportsAnalytics() {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    const loadAnalytics = async () => {
      try {
        setLoading(true);
        setError("");
        const data = await getMyAnalytics();
        if (!mounted) return;
        setAnalytics(data);
      } catch (err) {
        console.error("Student analytics loading error:", err);
        if (!mounted) return;
        setError(getApiErrorMessage(err));
      } finally {
        if (mounted) setLoading(false);
      }
    };
    loadAnalytics();
    return () => { mounted = false; };
  }, []);

  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      setError("");
      const refreshed = await refreshMyDashboard();
      setAnalytics(refreshed);
    } catch (err) {
      console.error("Student analytics refresh error:", err);
      setError(getApiErrorMessage(err));
      try {
        const latest = await getMyAnalytics();
        setAnalytics(latest);
      } catch (fallbackError) {
        console.error("Fallback analytics fetch failed:", fallbackError);
      }
    } finally {
      setRefreshing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-white border border-[#101828]/10 rounded-3xl shadow-xl px-8 py-8 text-center w-full max-w-md"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-[#0F766E]/10 flex items-center justify-center mb-4">
            <Loader2 size={28} className="text-[#0F766E] animate-spin" />
          </div>
          <h2 className="text-xl font-bold text-[#101828]">Loading your analytics</h2>
          <p className="text-sm text-[#667085] mt-2">Preparing your personal recruitment report...</p>
        </motion.div>
      </div>
    );
  }

  if (error && !analytics) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center px-5">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-lg bg-white border border-red-200 rounded-3xl shadow-xl p-8 text-center"
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-5">
            <AlertCircle size={30} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-[#101828]">Analytics unavailable</h1>
          <p className="text-sm text-[#667085] mt-2 leading-relaxed">{error}</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => window.location.reload()}
            className="mt-6 inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-[#101828] hover:bg-[#0F766E] text-white font-semibold transition-all shadow-lg shadow-[#101828]/20"
          >
            <RefreshCw size={17} /> Try Again
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const data = normalizeAnalytics(analytics);

  const applicationStatusTotal = Math.max(
    data.totalApplications,
    data.shortlisted + data.selected + data.rejected,
    1
  );

  const otherApplications = Math.max(
    data.totalApplications - data.shortlisted - data.selected - data.rejected,
    0
  );

  const interviewCompletion = data.totalInterviews > 0
    ? (data.completedInterviews / data.totalInterviews) * 100
    : 0;

  const shortlistRate = data.totalApplications > 0
    ? (data.shortlisted / data.totalApplications) * 100
    : 0;

  const selectionRate = data.totalApplications > 0
    ? (data.selected / data.totalApplications) * 100
    : 0;

  return (
    <div className="min-h-screen bg-[#F7F5EF] relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-60 right-[-100px] w-[650px] h-[650px] rounded-full bg-[#0F766E]/5 blur-3xl" />
        <div className="absolute bottom-[-180px] left-[-180px] w-[550px] h-[550px] rounded-full bg-[#E87961]/5 blur-3xl" />
      </div>

      <main className="relative w-full max-w-[1280px] mx-auto px-5 sm:px-6 lg:px-8 xl:px-10 pt-6 pb-10">
        {/* Header */}
        <motion.section
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7"
        >
          <div className="min-w-0">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-11 h-11 rounded-2xl bg-[#0F766E] flex items-center justify-center shadow-lg flex-shrink-0">
                <BarChart3 size={23} className="text-white" />
              </div>
              <span className="text-sm font-semibold text-[#0F766E]">PERSONAL ANALYTICS</span>
              <span className="px-2 py-0.5 text-[8px] bg-[#EAF5F1] text-[#0F766E] rounded-full border border-[#BFE5DB]">AI-Powered</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-[#101828]">My Reports & Analytics</h1>
            <p className="text-[#667085] mt-2 max-w-2xl text-sm">
              Track your applications, interviews, AI scores and overall recruitment performance in one place.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl bg-white border border-[#101828]/10 text-[#101828] font-semibold shadow-sm hover:shadow-lg hover:border-[#0F766E] hover:text-[#0F766E] transition-all disabled:opacity-60 flex-shrink-0"
          >
            {refreshing ? (
              <Loader2 size={17} className="animate-spin" />
            ) : (
              <RefreshCw size={17} />
            )}
            {refreshing ? "Refreshing..." : "Refresh Analytics"}
          </motion.button>
        </motion.section>

        {/* Error Alert */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 flex items-start gap-3"
          >
            <AlertCircle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-800">Analytics update notice</p>
              <p className="text-xs text-amber-700 mt-1">{error}</p>
            </div>
          </motion.div>
        )}

        {/* Personal Performance Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="bg-white border border-[#101828]/10 rounded-3xl shadow-sm p-5 mb-8 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F5EF] flex items-center justify-center flex-shrink-0">
                <UserRound size={22} className="text-[#0F766E]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-wider text-[#98A2B3]">Personal Performance Report</p>
                <h2 className="text-lg font-bold text-[#101828] mt-1">Your Recruitment Journey</h2>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#EAF5F1] text-[#0F766E] text-sm font-medium border border-[#BFE5DB]">
                <ShieldCheck size={16} /> Private to your account
              </div>
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-[#EAF5F1] text-[#0F766E] text-sm font-medium border border-[#BFE5DB]">
                <CheckCircle2 size={16} /> Live data
              </div>
            </div>
          </div>
        </motion.section>

        {/* Application Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#101828]">Application Overview</h2>
            <p className="text-sm text-[#667085] mt-1">Your current recruitment activity</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <MetricCard title="Applications" value={data.totalApplications} icon={<FileText size={21} />} iconClass="bg-[#EAF5F1] text-[#0F766E]" description="Applications submitted" />
            <MetricCard title="Shortlisted" value={data.shortlisted} icon={<Award size={21} />} iconClass="bg-indigo-50 text-indigo-600" description="Applications moved forward" />
            <MetricCard title="Selected" value={data.selected} icon={<CheckCircle2 size={21} />} iconClass="bg-emerald-50 text-emerald-600" description="Successful applications" />
            <MetricCard title="Rejected" value={data.rejected} icon={<XCircle size={21} />} iconClass="bg-red-50 text-red-600" description="Applications not selected" />
          </div>
        </motion.section>

        {/* Interview Overview */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="mb-8"
        >
          <div className="mb-4">
            <h2 className="text-xl font-bold text-[#101828]">Interview Overview</h2>
            <p className="text-sm text-[#667085] mt-1">Your AI interview activity and completion</p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            <MetricCard title="Total Interviews" value={data.totalInterviews} icon={<CalendarDays size={21} />} iconClass="bg-[#EAF5F1] text-[#0F766E]" description="Interviews scheduled" />
            <MetricCard title="Completed" value={data.completedInterviews} icon={<CheckCircle2 size={21} />} iconClass="bg-emerald-50 text-emerald-600" description="Successfully completed" />
            <MetricCard title="Pending" value={data.pendingInterviews} icon={<Clock3 size={21} />} iconClass="bg-amber-50 text-amber-600" description="Awaiting completion" />
          </div>
        </motion.section>

        {/* AI Performance Scores */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white border border-[#101828]/10 rounded-3xl shadow-sm p-5 sm:p-6 mb-8 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-7">
            <div>
              <div className="flex items-center gap-2">
                <Brain size={21} className="text-[#0F766E]" />
                <h2 className="text-xl font-bold text-[#101828]">AI Performance Scores</h2>
              </div>
              <p className="text-sm text-[#667085] mt-1">Average scores calculated from your recruitment activity</p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-[#F7F5EF] border border-[#101828]/10 w-fit">
              <Target size={17} className="text-[#0F766E]" />
              <span className="text-sm text-[#667085]">Overall</span>
              <span className="font-bold text-[#101828]">{formatScore(data.finalScore)}<span className="text-[#98A2B3] font-medium">/100</span></span>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-10 gap-y-6">
            <ScoreRow title="Resume Score" value={data.resumeScore} icon={<FileText size={18} />} />
            <ScoreRow title="JD Match Score" value={data.jdMatchScore} icon={<BriefcaseBusiness size={18} />} />
            <ScoreRow title="Interview Score" value={data.interviewScore} icon={<Brain size={18} />} />
            <ScoreRow title="Integrity Score" value={data.integrityScore} icon={<ShieldCheck size={18} />} />
          </div>

          {/* Final Score */}
          <div className="mt-7 pt-6 border-t border-[#101828]/5">
            <div className="flex items-center justify-between gap-3 mb-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#EAF5F1] flex items-center justify-center">
                  <TrendingUp size={16} className="text-[#0F766E]" />
                </div>
                <span className="font-semibold text-[#101828]">Final Score</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[#0F766E]">{getScoreLabel(data.finalScore)}</span>
                <span className="text-sm font-bold text-[#101828]">{formatScore(data.finalScore)}/100</span>
              </div>
            </div>
            <div className="h-3 bg-[#EAECF0] rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${percentage(data.finalScore)}%` }}
                transition={{ duration: 1 }}
                className={`h-full rounded-full ${getScoreBarClass(data.finalScore)}`}
              />
            </div>
          </div>
        </motion.section>

        {/* Chart Section */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6 mb-8">
          {/* Application Status */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className="bg-white border border-[#101828]/10 rounded-3xl shadow-sm p-5 sm:p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-[#EAF5F1] flex items-center justify-center">
                <Activity size={20} className="text-[#0F766E]" />
              </div>
              <div>
                <h3 className="font-bold text-[#101828]">Application Status</h3>
                <p className="text-xs text-[#98A2B3] mt-1">Breakdown of your applications</p>
              </div>
            </div>
            <div className="space-y-5">
              <StatusBar label="Selected" value={data.selected} total={applicationStatusTotal} color="bg-emerald-500" textColor="text-emerald-600" />
              <StatusBar label="Shortlisted" value={data.shortlisted} total={applicationStatusTotal} color="bg-indigo-500" textColor="text-indigo-600" />
              <StatusBar label="Rejected" value={data.rejected} total={applicationStatusTotal} color="bg-red-500" textColor="text-red-600" />
              <StatusBar label="Other / Pending" value={otherApplications} total={applicationStatusTotal} color="bg-slate-400" textColor="text-slate-600" />
            </div>
          </motion.div>

          {/* Interview Progress */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white border border-[#101828]/10 rounded-3xl shadow-sm p-5 sm:p-6 hover:shadow-lg transition-all duration-300"
          >
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 flex items-center justify-center">
                <BarChart3 size={20} className="text-indigo-600" />
              </div>
              <div>
                <h3 className="font-bold text-[#101828]">Interview Progress</h3>
                <p className="text-xs text-[#98A2B3] mt-1">Your interview completion status</p>
              </div>
            </div>
            <div className="flex items-center justify-center py-4">
              <CircularProgress percentage={interviewCompletion} />
            </div>
            <div className="grid grid-cols-3 gap-3 mt-3">
              <MiniStat label="Total" value={data.totalInterviews} />
              <MiniStat label="Done" value={data.completedInterviews} valueClass="text-emerald-600" />
              <MiniStat label="Pending" value={data.pendingInterviews} valueClass="text-amber-600" />
            </div>
          </motion.div>
        </div>

        {/* Skills */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="bg-white border border-[#101828]/10 rounded-3xl shadow-sm p-5 sm:p-6 mb-8 hover:shadow-lg transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#F7F5EF] flex items-center justify-center">
                <Sparkles size={20} className="text-[#0F766E]" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-[#101828]">Your Top Skills</h2>
                <p className="text-sm text-[#667085] mt-1">Skills identified from your recruitment profile</p>
              </div>
            </div>
            <span className="text-sm text-[#98A2B3]">{data.skills.length} skills</span>
          </div>

          {data.skills.length === 0 ? (
            <div className="py-8 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#F7F5EF] flex items-center justify-center mx-auto">
                <Sparkles size={21} className="text-[#98A2B3]" />
              </div>
              <p className="text-[#667085] mt-3">No skill data available yet.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-5">
              {data.skills.slice(0, 10).map((skill, index) => {
                const width = Math.max(25, 100 - index * 7);
                return (
                  <div key={`${String(skill)}-${index}`}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="w-7 h-7 rounded-xl bg-[#EAF5F1] text-[#0F766E] flex items-center justify-center text-xs font-bold">
                          {index + 1}
                        </span>
                        <span className="text-sm font-semibold text-[#101828]">{String(skill)}</span>
                      </div>
                      <span className="text-xs text-[#98A2B3]">Skill</span>
                    </div>
                    <div className="h-2 bg-[#EAECF0] rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${width}%` }}
                        transition={{ duration: 0.8, delay: index * 0.05 }}
                        className="h-full bg-gradient-to-r from-[#0F766E] to-[#0A5C56] rounded-full"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </motion.section>

        {/* Summary Cards */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mb-8"
        >
          <SummaryCard
            title="Hiring Success"
            value={`${formatScore(data.hiringSuccessRate)}%`}
            description="Current selection success rate"
            icon={<TrendingUp size={22} />}
            iconClass="bg-emerald-50 text-emerald-600"
            valueClass="text-emerald-600"
          />
          <SummaryCard
            title="Shortlist Rate"
            value={`${formatScore(shortlistRate)}%`}
            description="Applications reaching shortlist"
            icon={<Award size={22} />}
            iconClass="bg-indigo-50 text-indigo-600"
            valueClass="text-indigo-600"
          />
          <SummaryCard
            title="Selection Rate"
            value={`${formatScore(selectionRate)}%`}
            description="Applications resulting in selection"
            icon={<CheckCircle2 size={22} />}
            iconClass="bg-[#EAF5F1] text-[#0F766E]"
            valueClass="text-[#0F766E]"
          />
        </motion.section>

        {/* AI Insight Banner */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.45 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#101828] via-[#1a2538] to-[#0F766E] rounded-3xl p-6 md:p-7 mb-8 shadow-2xl shadow-[#101828]/20"
        >
          <div className="absolute -right-32 -top-32 w-72 h-72 rounded-full bg-[#0F766E]/20 blur-3xl animate-pulse" />
          <div className="absolute -left-32 -bottom-32 w-72 h-72 rounded-full bg-[#E87961]/10 blur-3xl animate-pulse delay-1000" />

          <div className="relative flex flex-col md:flex-row md:items-start gap-5">
            <div className="w-11 h-11 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/10">
              <Brain size={22} className="text-[#8FE2D1]" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[#8FE2D1] text-xs font-bold uppercase tracking-wider">Recruit_Ai Insight</p>
              <h2 className="text-xl font-bold text-white mt-1">Your personal recruitment performance</h2>
              <p className="text-white/60 leading-relaxed mt-3 max-w-4xl text-sm">
                Your analytics combine your application activity, AI resume evaluation, job matching,
                interview performance and integrity score. Use these insights to understand your
                strengths and improve your future applications and interviews.
              </p>
              <div className="flex flex-wrap gap-3 mt-5">
                <InsightBadge icon={Target} text={`Final Score ${formatScore(data.finalScore)}/100`} />
                <InsightBadge icon={CalendarDays} text={`${data.completedInterviews} interviews completed`} />
                <InsightBadge icon={FileText} text={`${data.totalApplications} applications`} />
              </div>
            </div>
            <ChevronRight size={22} className="text-white/20 hidden md:block" />
          </div>
        </motion.section>

        {/* Privacy Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center justify-center gap-2 text-xs text-[#98A2B3] pb-5 text-center border-t border-[#101828]/5 pt-6"
        >
          <ShieldCheck size={14} className="text-[#0F766E]" />
          Your analytics are generated specifically for your logged-in student account.
          <span className="flex items-center gap-2 ml-2">
            <Globe2 size={12} className="text-[#0F766E]" /> Secure
            <Lock size={12} className="text-[#0F766E] ml-1" /> Private
          </span>
        </motion.div>
      </main>
    </div>
  );
}

// =========================================================
// COMPONENTS
// =========================================================

function MetricCard({ title, value, icon, iconClass, description }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border border-[#101828]/10 rounded-2xl shadow-sm p-5 hover:shadow-xl hover:border-[#0F766E]/20 transition-all duration-300"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-[#667085]">{title}</p>
          <p className="text-3xl font-bold text-[#101828] mt-3">{number(value)}</p>
          <p className="text-xs text-[#98A2B3] mt-2">{description}</p>
        </div>
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 ${iconClass}`}>
          {icon}
        </div>
      </div>
    </motion.div>
  );
}

function ScoreRow({ title, value, icon }) {
  const numericValue = clampScore(value);
  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#F7F5EF] border border-[#101828]/5 flex items-center justify-center text-[#0F766E]">
            {icon}
          </div>
          <span className="text-sm font-semibold text-[#101828]">{title}</span>
        </div>
        <span className="text-sm font-bold text-[#101828]">{numericValue.toFixed(1)}/100</span>
      </div>
      <div className="h-2.5 bg-[#EAECF0] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${numericValue}%` }}
          transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${getScoreBarClass(numericValue)}`}
        />
      </div>
    </div>
  );
}

function StatusBar({ label, value, total, color, textColor }) {
  const numericValue = number(value);
  const numericTotal = Math.max(number(total), 1);
  const percent = Math.min(100, Math.max(0, (numericValue / numericTotal) * 100));

  return (
    <div>
      <div className="flex items-center justify-between gap-3 mb-2">
        <span className="text-sm font-medium text-[#667085]">{label}</span>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold ${textColor}`}>{Math.round(percent)}%</span>
          <span className="text-sm font-bold text-[#101828]">{numericValue}</span>
        </div>
      </div>
      <div className="h-2.5 bg-[#EAECF0] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percent}%` }}
          transition={{ duration: 0.8 }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  );
}

function CircularProgress({ percentage }) {
  const value = Math.min(100, Math.max(0, number(percentage)));
  const radius = 58;
  const circumference = 2 * Math.PI * radius;
  const dashOffset = circumference - (value / 100) * circumference;

  return (
    <div className="relative w-40 h-40">
      <svg width="160" height="160" viewBox="0 0 160 160" className="-rotate-90">
        <circle cx="80" cy="80" r={radius} fill="none" stroke="#EAECF0" strokeWidth="14" />
        <motion.circle
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: dashOffset }}
          transition={{ duration: 1 }}
          cx="80" cy="80" r={radius} fill="none" stroke="#0F766E" strokeWidth="14"
          strokeLinecap="round" strokeDasharray={circumference}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-3xl font-bold text-[#101828]">{Math.round(value)}%</span>
        <span className="text-xs text-[#98A2B3] mt-1">completed</span>
      </div>
    </div>
  );
}

function MiniStat({ label, value, valueClass = "text-[#101828]" }) {
  return (
    <div className="bg-[#F7F5EF] border border-[#101828]/5 rounded-xl px-3 py-3 text-center">
      <p className="text-xs text-[#98A2B3]">{label}</p>
      <p className={`text-lg font-bold mt-1 ${valueClass}`}>{number(value)}</p>
    </div>
  );
}

function SummaryCard({ title, value, description, icon, iconClass, valueClass }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border border-[#101828]/10 rounded-2xl shadow-sm p-5 hover:shadow-xl hover:border-[#0F766E]/20 transition-all duration-300"
    >
      <div className="flex items-center justify-between gap-4">
        <div className={`w-11 h-11 rounded-2xl flex items-center justify-center ${iconClass}`}>
          {icon}
        </div>
        <TrendingUp size={18} className="text-[#98A2B3]" />
      </div>
      <p className="text-sm font-medium text-[#667085] mt-5">{title}</p>
      <p className={`text-2xl font-bold mt-1 ${valueClass}`}>{value}</p>
      <p className="text-xs text-[#98A2B3] mt-2">{description}</p>
    </motion.div>
  );
}

function InsightBadge({ icon: Icon, text }) {
  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/10 border border-white/10 text-sm text-white/80 hover:bg-white/20 transition-all duration-300">
      <Icon size={15} className="text-[#8FE2D1]" />
      {text}
    </div>
  );
}

// =========================================================
// HELPERS
// =========================================================

function normalizeAnalytics(source) {
  const data = source || {};
  const root = data?.data && typeof data.data === "object" ? data.data : data;
  const applications = root?.applications || root?.candidate_analytics || {};
  const interviews = root?.interviews || root?.interview_analytics || {};
  const scores = root?.scores || root?.score_analytics || {};
  const hiring = root?.hiring || root?.hiring_analytics || {};
  const skillsData = root?.skills || root?.skills_analytics || {};

  const totalApplications = firstNumber(root?.total_applications, applications?.total_applications, root?.applications_count);
  const shortlisted = firstNumber(root?.shortlisted_candidates, root?.shortlisted, applications?.shortlisted_candidates);
  const selected = firstNumber(root?.selected_candidates, root?.selected, applications?.selected_candidates);
  const rejected = firstNumber(root?.rejected_candidates, root?.rejected, applications?.rejected_candidates);

  const totalInterviews = firstNumber(root?.total_interviews, interviews?.total_interviews, root?.interview_count);
  const completedInterviews = firstNumber(root?.completed_interviews, interviews?.completed_interviews, root?.completed_interview_count);
  let pendingInterviews = firstNumber(root?.pending_interviews, interviews?.pending_interviews);
  if (pendingInterviews === 0 && totalInterviews > completedInterviews) {
    pendingInterviews = totalInterviews - completedInterviews;
  }

  const resumeScore = firstNumber(root?.average_resume_score, scores?.average_resume_score, root?.resume_score);
  const jdMatchScore = firstNumber(root?.average_jd_match_score, scores?.average_jd_match_score, root?.jd_match_score);
  const interviewScore = firstNumber(root?.average_interview_score, scores?.average_interview_score, root?.interview_score);
  const integrityScore = firstNumber(root?.average_integrity_score, scores?.average_integrity_score, root?.integrity_score);
  const finalScore = firstNumber(root?.average_final_score, scores?.average_final_score, root?.final_score);
  const hiringSuccessRate = firstNumber(root?.hiring_success_rate, hiring?.hiring_success_rate);

  let skills = [];
  if (Array.isArray(root?.top_skills)) skills = root.top_skills;
  else if (Array.isArray(skillsData?.top_skills)) skills = skillsData.top_skills;
  else if (Array.isArray(skillsData?.skills)) {
    skills = skillsData.skills.map(item => typeof item === "string" ? item : item?.skill || item?.name || "").filter(Boolean);
  }

  return { totalApplications, shortlisted, selected, rejected, totalInterviews, completedInterviews, pendingInterviews, resumeScore, jdMatchScore, interviewScore, integrityScore, finalScore, hiringSuccessRate, skills };
}

function number(value) {
  if (value === undefined || value === null || value === "") return 0;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? 0 : parsed;
}

function firstNumber(...values) {
  for (const value of values) {
    if (value !== undefined && value !== null && value !== "" && !Number.isNaN(Number(value))) {
      return Number(value);
    }
  }
  return 0;
}

function clampScore(value) { return Math.min(100, Math.max(0, number(value))); }
function formatScore(value) { return clampScore(value).toFixed(1); }
function percentage(value) { return clampScore(value); }

function getScoreLabel(value) {
  const scoreValue = clampScore(value);
  if (scoreValue >= 80) return "Excellent";
  if (scoreValue >= 60) return "Good";
  if (scoreValue >= 40) return "Needs improvement";
  return "Needs focus";
}

function getScoreBarClass(value) {
  const scoreValue = clampScore(value);
  if (scoreValue >= 80) return "bg-gradient-to-r from-emerald-500 to-teal-500";
  if (scoreValue >= 60) return "bg-gradient-to-r from-blue-500 to-indigo-500";
  if (scoreValue >= 40) return "bg-gradient-to-r from-amber-400 to-orange-500";
  return "bg-gradient-to-r from-rose-400 to-red-500";
}

function getApiErrorMessage(error) {
  return error?.response?.data?.detail || error?.response?.data?.message || error?.message || "Unable to load your personal analytics.";
}