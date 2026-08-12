import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Target,
  Sparkles,
  Briefcase,
  FileText,
  TrendingUp,
  Brain,
  Award,
  Star,
  Medal,
  Zap,
  Layers,
  Users,
  ShieldCheck,
  Clock,
  Rocket,
  Crown,
  CheckCircle,
  XCircle,
} from "lucide-react";

import { getMatchResult } from "../api/jdMatchingApi";

function JDMatchResult() {
  const { matchId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [match, setMatch] = useState(null);

  useEffect(() => {
    loadMatchResult();
  }, [matchId]);

  const loadMatchResult = async () => {
    try {
      setLoading(true);
      console.log("LOADING JD MATCH RESULT - Match ID:", matchId);

      if (!matchId) {
        toast.error("Match ID not found.");
        return;
      }

      const response = await getMatchResult(matchId);
      console.log("JD MATCH RESPONSE:", response);

      if (response?.success && response?.data) {
        setMatch(response.data);
      } else if (response?.data) {
        setMatch(response.data);
      } else {
        toast.error("Invalid match result.");
      }
    } catch (error) {
      console.error("JD Match Result Error:", error);
      toast.error(
        error.response?.data?.detail || "Unable to load JD match result."
      );
    } finally {
      setLoading(false);
    }
  };

  const getScoreLabel = (score) => {
    if (score >= 90) return { label: "Excellent Match", icon: Crown };
    if (score >= 80) return { label: "Strong Match", icon: Award };
    if (score >= 70) return { label: "Good Match", icon: Star };
    if (score >= 60) return { label: "Moderate Match", icon: Target };
    if (score >= 40) return { label: "Weak Match", icon: AlertCircle };
    return { label: "Very Weak Match", icon: XCircle };
  };

  const getScoreStyle = (score) => {
    if (score >= 80) {
      return {
        circle: "text-[#0F766E]",
        bg: "bg-[#EAF5F1]",
        border: "border-[#0F766E]",
        badge: "bg-[#EAF5F1] text-[#0F766E] border-[#BFE5DB]",
        gradient: "from-emerald-600 to-teal-600",
      };
    }
    if (score >= 60) {
      return {
        circle: "text-blue-600",
        bg: "bg-blue-50",
        border: "border-blue-500",
        badge: "bg-blue-50 text-blue-700 border-blue-200",
        gradient: "from-blue-500 to-indigo-500",
      };
    }
    if (score >= 40) {
      return {
        circle: "text-amber-600",
        bg: "bg-amber-50",
        border: "border-amber-500",
        badge: "bg-amber-50 text-amber-700 border-amber-200",
        gradient: "from-amber-400 to-orange-500",
      };
    }
    return {
      circle: "text-red-600",
      bg: "bg-red-50",
      border: "border-red-500",
      badge: "bg-red-50 text-red-700 border-red-200",
      gradient: "from-rose-400 to-red-500",
    };
  };

  // Loading State
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#0F766E]/10 flex items-center justify-center mb-6">
            <Loader2 className="w-10 h-10 animate-spin text-[#0F766E]" />
          </div>
          <h2 className="text-2xl font-bold text-[#101828]">Analyzing Match Result...</h2>
          <p className="text-[#667085] mt-2">Loading your resume-job compatibility.</p>
        </motion.div>
      </div>
    );
  }

  // No Result State
  if (!match) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl shadow-xl border border-[#101828]/10 p-12 text-center max-w-md"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-red-50 flex items-center justify-center mb-6">
            <AlertCircle size={36} className="text-red-500" />
          </div>
          <h2 className="text-2xl font-bold text-[#101828]">Match Result Not Found</h2>
          <p className="text-[#667085] mt-2">We couldn't find the requested JD matching result.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className="mt-6 px-6 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-2xl font-semibold transition-all shadow-lg shadow-[#101828]/20"
          >
            Go Back
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const score = Number(match.match_percentage || 0);
  const scoreStyle = getScoreStyle(score);
  const scoreInfo = getScoreLabel(score);
  const ScoreIcon = scoreInfo.icon;

  const matchedSkills = Array.isArray(match.matched_skills) ? match.matched_skills : [];
  const missingSkills = Array.isArray(match.missing_skills) ? match.missing_skills : [];
  const strengths = Array.isArray(match.strengths) ? match.strengths : [];
  const recommendations = Array.isArray(match.recommendations) ? match.recommendations : [];

  return (
    <div className="min-h-screen bg-[#F7F5EF] relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-52 -right-52 w-[550px] h-[550px] bg-[#0F766E]/5 rounded-full blur-3xl" />
        <div className="absolute top-[45%] -left-52 w-[500px] h-[500px] bg-[#E87961]/5 rounded-full blur-3xl" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl" />
      </div>

      <main className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#667085] hover:text-[#0F766E] font-medium mb-8 transition-all group"
        >
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#101828] text-white text-xs font-semibold mb-4 shadow-lg shadow-[#101828]/20">
            <Sparkles className="w-3.5 h-3.5 text-[#8FE2D1]" />
            AI JOB MATCHING
            <span className="w-1 h-1 rounded-full bg-white/30" />
            <span className="text-white/60">Result</span>
          </div>

          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-[#101828]">
            Resume & Job Match
          </h1>
          <p className="text-[#667085] mt-2 text-sm md:text-base">
            AI-powered analysis of how well your resume matches this job.
          </p>
        </motion.div>

        {/* Score Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm hover:shadow-lg transition-all duration-300 p-8 md:p-10 mb-8"
        >
          <div className="flex flex-col md:flex-row items-center justify-between gap-8">
            {/* Score */}
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className={`w-36 h-36 rounded-full border-[8px] ${scoreStyle.border} flex flex-col items-center justify-center bg-white shadow-lg`}>
                  <span className={`text-4xl font-bold ${scoreStyle.circle}`}>
                    {score}%
                  </span>
                  <span className="text-[10px] font-semibold text-[#98A2B3] uppercase tracking-wider mt-0.5">
                    Match
                  </span>
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-[#EAF5F1] border border-[#BFE5DB] flex items-center justify-center">
                  <Brain size={14} className="text-[#0F766E]" />
                </div>
              </div>

              <div>
                <div className={`inline-flex items-center px-4 py-2 rounded-full border text-sm font-bold ${scoreStyle.badge}`}>
                  <ScoreIcon className="w-4 h-4 mr-2" />
                  {scoreInfo.label}
                </div>

                <h2 className="text-2xl font-bold text-[#101828] mt-3">
                  Your Compatibility Score
                </h2>
                <p className="text-[#667085] mt-1 max-w-lg text-sm">
                  Based on your skills, experience, education, projects and job requirements.
                </p>
              </div>
            </div>

            {/* AI Badge */}
            <div className="flex items-center gap-4 bg-[#F7F5EF] px-6 py-4 rounded-2xl border border-[#101828]/5">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0A5C56] flex items-center justify-center">
                <Zap size={22} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-[#98A2B3] font-semibold uppercase tracking-wider">Powered By</p>
                <p className="font-bold text-[#101828]">Recruit_Ai Intelligence</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Overall Feedback */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#101828] via-[#1a2538] to-[#0F766E] rounded-3xl p-7 md:p-8 mb-8 shadow-2xl shadow-[#101828]/20"
        >
          <div className="absolute -right-32 -top-32 w-72 h-72 bg-[#0F766E]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -left-32 -bottom-32 w-72 h-72 bg-[#E87961]/10 rounded-full blur-3xl animate-pulse delay-1000" />

          <div className="relative flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center flex-shrink-0 border border-white/10">
              <Sparkles className="w-5 h-5 text-[#8FE2D1]" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-white">Overall AI Feedback</h2>
              <p className="text-white/70 mt-2 leading-7 text-sm">
                {match.overall_feedback || "No overall feedback available."}
              </p>
            </div>
          </div>
        </motion.div>

        {/* Grid Section */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Matched Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm hover:shadow-lg transition-all duration-300 p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-[#EAF5F1] flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5 text-[#0F766E]" />
              </div>
              <div>
                <h2 className="font-bold text-[#101828]">Matched Skills</h2>
                <p className="text-sm text-[#98A2B3]">Skills matching the job requirements</p>
              </div>
            </div>

            {matchedSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {matchedSkills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="px-3 py-2 bg-[#EAF5F1] text-[#0F766E] border border-[#BFE5DB] rounded-xl text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[#98A2B3] text-sm">No matching skills identified.</p>
            )}
          </motion.div>

          {/* Missing Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
            className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm hover:shadow-lg transition-all duration-300 p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center">
                <AlertCircle className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <h2 className="font-bold text-[#101828]">Missing Skills</h2>
                <p className="text-sm text-[#98A2B3]">Skills you may need to improve</p>
              </div>
            </div>

            {missingSkills.length > 0 ? (
              <div className="flex flex-wrap gap-2">
                {missingSkills.map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="px-3 py-2 bg-amber-50 text-amber-700 border border-amber-200 rounded-xl text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-[#0F766E] text-sm font-medium flex items-center gap-2">
                <CheckCircle size={16} />
                Excellent! No major missing skills identified.
              </p>
            )}
          </motion.div>

          {/* Strengths */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm hover:shadow-lg transition-all duration-300 p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center">
                <Target className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <h2 className="font-bold text-[#101828]">Your Strengths</h2>
                <p className="text-sm text-[#98A2B3]">Why you match this position</p>
              </div>
            </div>

            {strengths.length > 0 ? (
              <div className="space-y-3">
                {strengths.map((strength, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <CheckCircle2 className="text-[#0F766E] mt-0.5 flex-shrink-0" size={18} />
                    <p className="text-[#667085] text-sm leading-6">{strength}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#98A2B3] text-sm">No strengths available.</p>
            )}
          </motion.div>

          {/* Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm hover:shadow-lg transition-all duration-300 p-6"
          >
            <div className="flex items-center gap-3 mb-5">
              <div className="w-11 h-11 rounded-2xl bg-purple-50 flex items-center justify-center">
                <Lightbulb className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <h2 className="font-bold text-[#101828]">Recommendations</h2>
                <p className="text-sm text-[#98A2B3]">Improve your chances for this job</p>
              </div>
            </div>

            {recommendations.length > 0 ? (
              <div className="space-y-3">
                {recommendations.map((recommendation, index) => (
                  <div key={index} className="flex gap-3 items-start">
                    <Lightbulb className="text-purple-600 mt-0.5 flex-shrink-0" size={18} />
                    <p className="text-[#667085] text-sm leading-6">{recommendation}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-[#98A2B3] text-sm">No additional recommendations.</p>
            )}
          </motion.div>
        </div>

        {/* Meta Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.5 }}
          className="mt-6 bg-white rounded-3xl border border-[#101828]/10 shadow-sm p-6"
        >
          <div className="flex flex-wrap gap-6">
            <div className="flex items-center gap-3">
              <FileText className="w-5 h-5 text-[#98A2B3]" />
              <div>
                <p className="text-[10px] text-[#98A2B3] uppercase font-semibold tracking-wider">Resume ID</p>
                <p className="text-sm font-medium text-[#101828] break-all">{match.resume_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-[#98A2B3]" />
              <div>
                <p className="text-[10px] text-[#98A2B3] uppercase font-semibold tracking-wider">Job ID</p>
                <p className="text-sm font-medium text-[#101828] break-all">{match.job_id}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="w-5 h-5 text-[#98A2B3]" />
              <div>
                <p className="text-[10px] text-[#98A2B3] uppercase font-semibold tracking-wider">Analysis Date</p>
                <p className="text-sm font-medium text-[#101828]">
                  {match.created_at ? new Date(match.created_at).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                  }) : "N/A"}
                </p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Bottom Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.5 }}
          className="flex flex-col sm:flex-row gap-4 justify-center mt-8"
        >
          <motion.button
            whileHover={{ scale: 1.02, x: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate(-1)}
            className="px-7 py-3.5 bg-white border border-[#D0D5DD] hover:border-[#0F766E] hover:text-[#0F766E] rounded-2xl font-semibold transition-all duration-300 shadow-sm"
          >
            Back to Job
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/jobs")}
            className="px-7 py-3.5 bg-[#101828] hover:bg-[#0F766E] text-white rounded-2xl font-semibold transition-all duration-300 shadow-lg shadow-[#101828]/20 hover:shadow-[#0F766E]/30"
          >
            Browse More Jobs
          </motion.button>
        </motion.div>

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 py-4 text-xs text-[#98A2B3] border-t border-[#101828]/5"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
            Recruit_Ai JD Match Result
          </span>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-[#0F766E]" />
              AI-Powered Analysis
            </span>
            <span className="flex items-center gap-1.5">
              <Brain size={12} className="text-[#0F766E]" />
              Secure & Private
            </span>
          </span>
        </motion.div>
      </main>
    </div>
  );
}

export default JDMatchResult;