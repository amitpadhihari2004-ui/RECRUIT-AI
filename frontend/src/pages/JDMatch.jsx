import { useEffect, useState } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  Loader2,
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  FileText,
  CheckCircle,
  Sparkles,
  ArrowRight,
  AlertCircle,
  Brain,
  Users,
  Target,
  Zap,
  Clock,
  Award,
  TrendingUp,
  UserCheck,
  ShieldCheck,
  Globe2,
  Lock,
  ChevronRight,
  Star,
  Medal,
  Rocket,
  Layers,
  BarChart3,
  Mic2,
  GraduationCap,
} from "lucide-react";

import toast from "react-hot-toast";

import { getJob } from "../api/jobApi";
import { getUserResumes } from "../api/resumeApi";
import { matchResumeWithJob } from "../api/jdMatchingApi";

function JDMatch() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [matching, setMatching] = useState(false);
  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    if (jobId) {
      loadData();
    }
  }, [jobId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        toast.error("User not found. Please login again.");
        navigate("/login");
        return;
      }

      const jobResponse = await getJob(jobId);
      const jobData = jobResponse?.job || jobResponse?.data || jobResponse;
      setJob(jobData);

      const resumeResponse = await getUserResumes(userId);
      const userResumes = resumeResponse?.resumes || resumeResponse?.data || [];
      
      const analyzedResumes = userResumes.filter(
        (resume) => resume.analysis_status === "Completed"
      );

      setResumes(analyzedResumes);
      
      if (analyzedResumes.length > 0) {
        setSelectedResume(analyzedResumes[0]._id);
      }
    } catch (error) {
      console.error("JD Match Load Error:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to load JD matching page."
      );
      setJob(null);
      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMatch = async () => {
    if (!selectedResume) {
      toast.error("Please select a resume.");
      return;
    }

    if (!jobId) {
      toast.error("Job ID not found.");
      return;
    }

    try {
      setMatching(true);
      const response = await matchResumeWithJob(selectedResume, jobId);
      const matchId = response?.data?.id;

      if (!matchId) {
        toast.error("Match completed, but result ID was not received.");
        return;
      }

      toast.success(
        response?.cached
          ? "Existing JD match loaded."
          : "JD matching completed successfully."
      );

      navigate(`/jd-match/result/${matchId}`);
    } catch (error) {
      console.error("JD Matching Error:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to match resume with this job."
      );
    } finally {
      setMatching(false);
    }
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
          <h2 className="text-2xl font-bold text-[#101828]">Preparing JD Matching...</h2>
          <p className="text-[#667085] mt-2">Loading job and your analyzed resumes.</p>
        </motion.div>
      </div>
    );
  }

  // Job Not Found
  if (!job) {
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
          <h2 className="text-2xl font-bold text-[#101828]">Job Not Found</h2>
          <p className="text-[#667085] mt-2">The selected job could not be loaded.</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate("/jobs")}
            className="mt-6 px-6 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-2xl font-semibold transition-all shadow-lg shadow-[#101828]/20"
          >
            Browse Jobs
          </motion.button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] px-4 py-6 md:px-8 md:py-10">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-[#667085] hover:text-[#0F766E] font-medium transition-all group"
        >
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
          Back
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="relative overflow-hidden bg-gradient-to-br from-[#101828] via-[#1a2538] to-[#0F766E] rounded-3xl p-8 md:p-10 mb-7 shadow-2xl shadow-[#101828]/20"
        >
          <div className="absolute -right-32 -top-32 w-96 h-96 bg-[#0F766E]/20 rounded-full blur-3xl animate-pulse" />
          <div className="absolute -left-32 -bottom-32 w-96 h-96 bg-[#E87961]/10 rounded-full blur-3xl animate-pulse delay-1000" />
          
          <div className="relative">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 border border-white/10 text-xs font-semibold text-white/80 mb-5 backdrop-blur-sm"
            >
              <Sparkles size={14} className="text-[#8FE2D1]" />
              AI JOB MATCHING
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-white tracking-[-0.04em]"
            >
              Match Your Resume
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="text-white/60 mt-3 max-w-2xl text-sm md:text-base"
            >
              Select one of your analyzed resumes and Recruit_Ai will compare it against this job's requirements.
            </motion.p>
          </div>
        </motion.div>

        {/* Job Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm hover:shadow-lg transition-all duration-300 p-6 md:p-8 mb-7"
        >
          <div className="flex items-start gap-5">
            <div className="w-16 h-16 rounded-2xl bg-[#EAF5F1] flex items-center justify-center flex-shrink-0 overflow-hidden">
              {job.company_logo ? (
                <img
                  src={job.company_logo}
                  alt={job.company_name || "Company"}
                  className="w-full h-full object-cover rounded-2xl"
                />
              ) : (
                <Building2 size={30} className="text-[#0F766E]" />
              )}
            </div>

            <div className="min-w-0 flex-1">
              <h2 className="text-2xl md:text-3xl font-bold text-[#101828]">
                {job.title || "Untitled Job"}
              </h2>
              <p className="text-lg text-[#667085] mt-1">{job.company_name || "Company"}</p>

              <div className="flex flex-wrap gap-3 mt-4">
                {job.location && (
                  <span className="inline-flex items-center gap-2 text-sm text-[#667085] bg-[#F7F5EF] px-3 py-2 rounded-xl border border-[#101828]/5">
                    <MapPin size={16} className="text-[#0F766E]" />
                    {job.location}
                  </span>
                )}
                {job.employment_type && (
                  <span className="inline-flex items-center gap-2 text-sm text-[#667085] bg-[#F7F5EF] px-3 py-2 rounded-xl border border-[#101828]/5">
                    <Briefcase size={16} className="text-[#0F766E]" />
                    {job.employment_type}
                  </span>
                )}
                {job.salary_range && (
                  <span className="inline-flex items-center gap-2 text-sm text-[#667085] bg-[#F7F5EF] px-3 py-2 rounded-xl border border-[#101828]/5">
                    <Award size={16} className="text-[#0F766E]" />
                    {job.salary_range}
                  </span>
                )}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2 bg-[#EAF5F1] px-4 py-2 rounded-full border border-[#BFE5DB]">
              <Brain size={16} className="text-[#0F766E]" />
              <span className="text-xs font-semibold text-[#0F766E]">AI Ready</span>
            </div>
          </div>
        </motion.div>

        {/* Resume Selection */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
          className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm hover:shadow-lg transition-all duration-300 p-6 md:p-8"
        >
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-[#101828]">Select Resume</h2>
            <p className="text-[#667085] mt-1 text-sm">
              Choose an analyzed resume for accurate job matching.
            </p>
          </div>

          {/* No Resume State */}
          {resumes.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="border-2 border-dashed border-amber-200 bg-amber-50/50 rounded-2xl p-10 text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 flex items-center justify-center mb-4">
                <AlertCircle size={28} className="text-amber-600" />
              </div>
              <h3 className="text-xl font-bold text-[#101828]">No Analyzed Resume Found</h3>
              <p className="text-[#667085] mt-2 max-w-md mx-auto">
                You need at least one completed resume analysis before Recruit_Ai can calculate your JD match score.
              </p>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/resumes")}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-2xl font-semibold transition-all shadow-lg shadow-[#101828]/20"
              >
                Go to Resumes
                <ArrowRight size={17} />
              </motion.button>
            </motion.div>
          ) : (
            <>
              {/* Resume List */}
              <div className="space-y-3">
                {resumes.map((resume, index) => {
                  const isSelected = selectedResume === resume._id;
                  const score = resume.analysis?.resume_score ?? 0;

                  return (
                    <motion.button
                      key={resume._id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.05 }}
                      whileHover={{ x: 4 }}
                      onHoverStart={() => setHoveredCard(resume._id)}
                      onHoverEnd={() => setHoveredCard(null)}
                      onClick={() => setSelectedResume(resume._id)}
                      className={`w-full text-left border-2 rounded-2xl p-5 transition-all duration-300 ${
                        isSelected
                          ? "border-[#0F766E] bg-[#EAF5F1] shadow-lg shadow-[#0F766E]/10 ring-2 ring-[#0F766E]/20"
                          : "border-[#D0D5DD] hover:border-[#0F766E]/50 hover:bg-[#F7F5EF]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-4">
                        <div className="flex items-center gap-4 min-w-0 flex-1">
                          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            isSelected ? "bg-[#0F766E] text-white" : "bg-[#EAF5F1] text-[#0F766E]"
                          }`}>
                            <FileText size={22} />
                          </div>

                          <div className="min-w-0 flex-1">
                            <h3 className={`font-bold truncate transition-colors ${
                              isSelected ? "text-[#0F766E]" : "text-[#101828]"
                            }`}>
                              {resume.file_name || "Resume"}
                            </h3>
                            <div className="flex flex-wrap gap-4 mt-1 text-sm text-[#667085]">
                              <span className="flex items-center gap-1">
                                <Clock size={13} className="text-[#98A2B3]" />
                                {resume.created_at
                                  ? new Date(resume.created_at).toLocaleDateString("en-IN")
                                  : "Date unavailable"}
                              </span>
                              <span className="flex items-center gap-1">
                                <Target size={13} className="text-[#98A2B3]" />
                                Score: <strong className="text-[#0F766E]">{score}%</strong>
                              </span>
                              {isSelected && (
                                <span className="flex items-center gap-1 text-[#0F766E] text-xs font-semibold">
                                  <CheckCircle size={14} />
                                  Selected
                                </span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div
                          className={`w-8 h-8 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                            isSelected
                              ? "border-[#0F766E] bg-[#0F766E] shadow-lg shadow-[#0F766E]/30"
                              : "border-[#D0D5DD] bg-white"
                          }`}
                        >
                          {isSelected && <CheckCircle size={18} className="text-white" />}
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
              </div>

              {/* Match Button */}
              <div className="mt-8 pt-6 border-t border-[#101828]/10">
                <motion.button
                  whileHover={!matching && selectedResume ? { scale: 1.01 } : {}}
                  whileTap={!matching && selectedResume ? { scale: 0.98 } : {}}
                  onClick={handleMatch}
                  disabled={matching || !selectedResume}
                  className="relative w-full bg-[#101828] hover:bg-[#0F766E] disabled:bg-[#D0D5DD] disabled:cursor-not-allowed text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-[#101828]/20 hover:shadow-[#0F766E]/30 overflow-hidden group"
                >
                  {!matching && (
                    <div className="absolute inset-0 bg-gradient-to-r from-[#0F766E] to-[#0A5C56] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  )}
                  
                  <span className="relative z-10 flex items-center gap-3">
                    {matching ? (
                      <>
                        <Loader2 size={21} className="animate-spin" />
                        AI is analyzing your resume...
                      </>
                    ) : (
                      <>
                        <Sparkles size={21} />
                        Analyze Resume Match
                        <ArrowRight size={19} className="group-hover:translate-x-1 transition-transform" />
                      </>
                    )}
                  </span>
                </motion.button>

                <div className="flex items-center justify-center gap-4 mt-4 text-xs text-[#98A2B3]">
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck size={13} className="text-[#0F766E]" />
                    Secure Analysis
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#D0D5DD]" />
                  <span className="flex items-center gap-1.5">
                    <Brain size={13} className="text-[#0F766E]" />
                    AI-Powered
                  </span>
                  <span className="w-1 h-1 rounded-full bg-[#D0D5DD]" />
                  <span className="flex items-center gap-1.5">
                    <Zap size={13} className="text-[#0F766E]" />
                    Real-time
                  </span>
                </div>
              </div>
            </>
          )}
        </motion.div>

        {/* Footer Info */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 py-4 text-xs text-[#98A2B3] border-t border-[#101828]/5"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
            Recruit_Ai JD Matching
          </span>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Globe2 size={12} />
              Secure Platform
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={12} />
              Encrypted Data
            </span>
          </span>
        </motion.div>
      </div>
    </div>
  );
}

export default JDMatch;