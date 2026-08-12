import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";

import {
  Sparkles,
  Briefcase,
  MapPin,
  Clock,
  DollarSign,
  Building2,
  ArrowRight,
  RefreshCw,
  Search,
  CheckCircle,
  AlertCircle,
  Target,
  Zap,
  X,
  SlidersHorizontal,
  Bookmark,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  Award,
  UserCheck,
  Code2,
  GraduationCap,
  Brain,
  BarChart3,
  CircleCheck,
  Layers3,
} from "lucide-react";

import { getRecommendedJobs } from "../api/recommendationApi";
import Sidebar from "../components/Sidebar";

function RecommendedJobs() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [jobs, setJobs] = useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [selectedJob, setSelectedJob] = useState(null);

  const [savedJobs, setSavedJobs] = useState([]);

  const [showFilters, setShowFilters] = useState(false);

  const [minimumMatch, setMinimumMatch] = useState(0);

  // =====================================================
  // LOAD RECOMMENDATIONS
  // =====================================================

  useEffect(() => {
    loadRecommendations();
  }, []);

  const loadRecommendations = async () => {
    try {
      setLoading(true);

      const userId = localStorage.getItem("user_id");

      if (!userId) {
        toast.error("User not found. Please login again.");
        navigate("/login");
        return;
      }

      const response = await getRecommendedJobs(userId);

      console.log("Recommendation Response:", response);

      if (Array.isArray(response)) {
        setJobs(response);
      } else if (response?.recommendations) {
        setJobs(response.recommendations);
      } else if (response?.jobs) {
        setJobs(response.jobs);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error("Recommendation Error:", error);

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to load job recommendations."
      );

      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadRecommendations();
  };

  // =====================================================
  // JOB SCORE
  // =====================================================

  const getMatchScore = (job) => {
    return Math.round(
      job.match_score ??
        job.recommendation_score ??
        job.score ??
        0
    );
  };

  // =====================================================
  // SCORE LABEL
  // =====================================================

  const getScoreLabel = (score) => {
    if (score >= 90) return "Excellent Match";
    if (score >= 80) return "Strong Match";
    if (score >= 70) return "Good Match";
    if (score >= 50) return "Partial Match";
    return "Low Match";
  };

  // =====================================================
  // SCORE COLORS
  // =====================================================

  const getScoreColor = (score) => {
    if (score >= 90) {
      return {
        text: "text-[#0F766E]",
        bg: "bg-[#EAF5F1]",
        border: "border-[#BFE5DB]",
        ring: "#0F766E",
      };
    }

    if (score >= 80) {
      return {
        text: "text-blue-700",
        bg: "bg-blue-50",
        border: "border-blue-200",
        ring: "#2563EB",
      };
    }

    if (score >= 70) {
      return {
        text: "text-amber-700",
        bg: "bg-amber-50",
        border: "border-amber-200",
        ring: "#D97706",
      };
    }

    return {
      text: "text-gray-600",
      bg: "bg-gray-50",
      border: "border-gray-200",
      ring: "#98A2B3",
    };
  };

  // =====================================================
  // SEARCH + FILTER
  // =====================================================

  const filteredJobs = useMemo(() => {
    const search = searchTerm.toLowerCase().trim();

    return jobs.filter((job) => {
      const matchesSearch =
        !search ||
        job.title?.toLowerCase().includes(search) ||
        job.company_name?.toLowerCase().includes(search) ||
        job.department?.toLowerCase().includes(search) ||
        job.location?.toLowerCase().includes(search);

      const score = getMatchScore(job);

      const matchesScore = score >= minimumMatch;

      return matchesSearch && matchesScore;
    });
  }, [jobs, searchTerm, minimumMatch]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    if (!jobs.length) {
      return {
        total: 0,
        excellent: 0,
        strong: 0,
        average: 0,
        highest: 0,
      };
    }

    const scores = jobs.map(getMatchScore);

    return {
      total: jobs.length,

      excellent: jobs.filter(
        (job) => getMatchScore(job) >= 90
      ).length,

      strong: jobs.filter(
        (job) => getMatchScore(job) >= 80
      ).length,

      average: Math.round(
        scores.reduce((a, b) => a + b, 0) /
          scores.length
      ),

      highest: Math.max(...scores),
    };
  }, [jobs]);

  // =====================================================
  // AUTO SELECT FIRST JOB
  // =====================================================

  useEffect(() => {
    if (
      filteredJobs.length > 0 &&
      !selectedJob
    ) {
      setSelectedJob(filteredJobs[0]);
    }
  }, [filteredJobs, selectedJob]);

  // =====================================================
  // SAVE JOB
  // =====================================================

  const toggleSaveJob = (jobId) => {
    setSavedJobs((previous) => {
      if (previous.includes(jobId)) {
        toast.success("Job removed from saved jobs.");
        return previous.filter((id) => id !== jobId);
      }

      toast.success("Job saved.");
      return [...previous, jobId];
    });
  };

  // =====================================================
  // OPEN JOB
  // =====================================================

  const openJob = (job) => {
    const jobId =
      job?.job_id ||
      job?._id ||
      job?.id;

    if (!jobId) {
      toast.error("Job ID not found.");
      return;
    }

    navigate(`/jobs/${jobId}`);
  };

  // =====================================================
  // FORMAT SKILLS
  // =====================================================

  const getMatchedSkills = (job) => {
    return (
      job?.matched_skills ||
      job?.matching_skills ||
      []
    );
  };

  const getMissingSkills = (job) => {
    return job?.missing_skills || [];
  };

  // =====================================================
  // SCORE RING
  // =====================================================

  const ScoreRing = ({
    score,
    size = 82,
  }) => {
    const colors = getScoreColor(score);

    const radius = 34;
    const circumference = 2 * Math.PI * radius;

    const progress =
      (Math.min(score, 100) / 100) *
      circumference;

    return (
      <div
        className="relative flex items-center justify-center"
        style={{
          width: size,
          height: size,
        }}
      >
        <svg
          width={size}
          height={size}
          viewBox="0 0 82 82"
          className="-rotate-90"
        >
          <circle
            cx="41"
            cy="41"
            r={radius}
            stroke="#EAECF0"
            strokeWidth="7"
            fill="none"
          />

          <circle
            cx="41"
            cy="41"
            r={radius}
            stroke={colors.ring}
            strokeWidth="7"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${progress} ${circumference}`}
          />
        </svg>

        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-bold text-[#101828]">
            {score}%
          </span>

          <span className="text-[8px] font-semibold uppercase tracking-wider text-[#98A2B3]">
            match
          </span>
        </div>
      </div>
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F7F5EF]">
        <Sidebar />

        <main className="flex-1">
          <div className="max-w-7xl mx-auto p-5 md:p-8">
            <div className="animate-pulse">

              <div className="h-4 w-32 bg-gray-200 rounded mb-4" />

              <div className="h-10 w-80 bg-gray-200 rounded-lg" />

              <div className="h-5 w-[500px] max-w-full bg-gray-200 rounded mt-3" />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="bg-white rounded-2xl p-5 border border-gray-100"
                  >
                    <div className="h-4 w-24 bg-gray-200 rounded" />

                    <div className="h-9 w-16 bg-gray-200 rounded mt-3" />
                  </div>
                ))}

              </div>

              <div className="grid grid-cols-1 xl:grid-cols-[390px_1fr] gap-5 mt-8">

                <div className="space-y-3">

                  {[1, 2, 3, 4].map((item) => (
                    <div
                      key={item}
                      className="bg-white rounded-2xl p-5 border border-gray-100"
                    >
                      <div className="flex gap-3">
                        <div className="w-12 h-12 bg-gray-200 rounded-xl" />

                        <div className="flex-1">
                          <div className="h-4 w-3/4 bg-gray-200 rounded" />
                          <div className="h-3 w-1/2 bg-gray-200 rounded mt-2" />
                        </div>
                      </div>

                      <div className="h-3 w-full bg-gray-200 rounded mt-5" />
                      <div className="h-3 w-2/3 bg-gray-200 rounded mt-2" />
                    </div>
                  ))}

                </div>

                <div className="bg-white rounded-3xl p-8 border border-gray-100 min-h-[600px]" />
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="flex min-h-screen bg-[#F7F5EF] text-[#101828]">

      <Sidebar />

      <main className="flex-1 min-w-0 overflow-hidden">

        {/* BACKGROUND */}

        <div className="fixed inset-0 pointer-events-none overflow-hidden">

          <div className="absolute -top-52 right-0 w-[550px] h-[550px] rounded-full bg-[#DDF5EF]/50 blur-3xl" />

          <div className="absolute bottom-0 -left-52 w-[500px] h-[500px] rounded-full bg-blue-100/30 blur-3xl" />

        </div>

        <div className="relative max-w-[1500px] mx-auto p-5 md:p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <motion.header
            initial={{
              opacity: 0,
              y: -12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            className="mb-7"
          >

            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">

              <div>

                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">

                  <span className="w-7 h-[2px] bg-[#0F766E]" />

                  Career Intelligence

                </div>

                <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.04em] mt-3">

                  Find your next opportunity

                </h1>

                <p className="text-[#667085] mt-2 max-w-2xl">

                  Recruit_Ai ranks opportunities based on your resume,
                  skills, experience and career profile.

                </p>

              </div>

              <div className="flex items-center gap-3">

                <button
                  onClick={() =>
                    navigate("/profile")
                  }
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#101828]/10 rounded-xl text-sm font-semibold text-[#344054] hover:bg-[#FCFCFA] transition"
                >
                  <UserCheck size={16} />

                  Improve Profile
                </button>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#101828] text-white rounded-xl text-sm font-semibold hover:bg-[#0F766E] transition disabled:opacity-60"
                >
                  <RefreshCw
                    size={16}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh
                </button>

              </div>

            </div>

          </motion.header>

          {/* =================================================
              AI PROFILE SUMMARY
          ================================================= */}

          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.08,
            }}
            className="bg-[#101828] rounded-3xl overflow-hidden relative mb-6"
          >

            <div className="absolute -right-20 -top-28 w-96 h-96 rounded-full bg-[#0F766E]/20 blur-3xl" />

            <div className="relative p-6 md:p-7">

              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-7">

                <div className="flex items-start gap-4">

                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0">

                    <Sparkles
                      size={21}
                      className="text-[#8FE2D1]"
                    />

                  </div>

                  <div>

                    <div className="flex items-center gap-2">

                      <h2 className="text-white font-semibold">

                        AI Job Match Engine

                      </h2>

                      <span className="px-2 py-0.5 rounded-full bg-[#0F766E]/20 text-[#8FE2D1] text-[10px] font-semibold">

                        ACTIVE

                      </span>

                    </div>

                    <p className="text-white/50 text-sm mt-1 max-w-xl leading-6">

                      Your latest resume is being used to compare
                      skills, experience and role requirements.

                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-6">

                  <div>

                    <p className="text-[10px] uppercase tracking-wider text-white/40">

                      Opportunities

                    </p>

                    <p className="text-2xl font-semibold text-white mt-1">

                      {statistics.total}

                    </p>

                  </div>

                  <div className="w-px h-10 bg-white/10" />

                  <div>

                    <p className="text-[10px] uppercase tracking-wider text-white/40">

                      Average Match

                    </p>

                    <p className="text-2xl font-semibold text-[#8FE2D1] mt-1">

                      {statistics.average}%

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </motion.section>

          {/* =================================================
              STATISTICS
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.12,
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >

            {[
              {
                label: "Total Matches",
                value: statistics.total,
                icon: Briefcase,
                description: "Jobs found",
                color: "text-[#101828]",
                bg: "bg-[#F2F4F7]",
              },
              {
                label: "Excellent Matches",
                value: statistics.excellent,
                icon: Award,
                description: "90%+ match",
                color: "text-[#0F766E]",
                bg: "bg-[#EAF5F1]",
              },
              {
                label: "Strong Matches",
                value: statistics.strong,
                icon: Target,
                description: "80%+ match",
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Best Match",
                value: `${statistics.highest}%`,
                icon: TrendingUp,
                description: "Top opportunity",
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
            ].map((stat, index) => {
              const Icon = stat.icon;

              return (
                <motion.div
                  key={stat.label}
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay:
                      0.1 +
                      index * 0.05,
                  }}
                  className="bg-white rounded-2xl border border-[#101828]/10 p-5 shadow-sm"
                >

                  <div className="flex items-start justify-between">

                    <div>

                      <p className="text-xs font-medium text-[#667085]">

                        {stat.label}

                      </p>

                      <p
                        className={`text-2xl font-bold mt-2 ${stat.color}`}
                      >
                        {stat.value}
                      </p>

                      <p className="text-[11px] text-[#98A2B3] mt-1">

                        {stat.description}

                      </p>

                    </div>

                    <div
                      className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
                    >

                      <Icon
                        size={18}
                        className={stat.color}
                      />

                    </div>

                  </div>

                </motion.div>
              );
            })}

          </motion.div>

          {/* =================================================
              SEARCH / FILTER BAR
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.2,
            }}
            className="bg-white rounded-2xl border border-[#101828]/10 p-3 mb-6"
          >

            <div className="flex flex-col md:flex-row gap-3">

              <div className="relative flex-1">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]"
                />

                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  placeholder="Search by role, company, location..."
                  className="w-full pl-11 pr-4 py-3 bg-[#FCFCFA] border border-[#EAECF0] rounded-xl text-sm outline-none focus:border-[#0F766E] focus:ring-4 focus:ring-[#0F766E]/5 transition"
                />

              </div>

              <button
                onClick={() =>
                  setShowFilters(
                    (previous) =>
                      !previous
                  )
                }
                className={`inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl border text-sm font-semibold transition ${
                  showFilters
                    ? "bg-[#101828] text-white border-[#101828]"
                    : "bg-white text-[#344054] border-[#EAECF0] hover:bg-[#FCFCFA]"
                }`}
              >

                <SlidersHorizontal size={16} />

                Filters

              </button>

              <button
                onClick={() => {
                  setSearchTerm("");
                  setMinimumMatch(0);
                }}
                className="px-4 py-3 text-sm font-semibold text-[#667085] hover:text-[#101828] transition"
              >
                Clear
              </button>

            </div>

            <AnimatePresence>
              {showFilters && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  className="overflow-hidden"
                >

                  <div className="border-t border-[#EAECF0] mt-3 pt-4">

                    <div className="flex flex-wrap items-center gap-2">

                      <span className="text-xs font-semibold text-[#667085] mr-2">

                        Minimum Match

                      </span>

                      {[0, 60, 70, 80, 90].map(
                        (score) => (
                          <button
                            key={score}
                            onClick={() =>
                              setMinimumMatch(
                                score
                              )
                            }
                            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                              minimumMatch ===
                              score
                                ? "bg-[#101828] text-white"
                                : "bg-[#F2F4F7] text-[#667085] hover:bg-[#EAECF0]"
                            }`}
                          >
                            {score === 0
                              ? "All"
                              : `${score}%+`}
                          </button>
                        )
                      )}

                    </div>

                  </div>

                </motion.div>
              )}
            </AnimatePresence>

          </motion.div>

          {/* =================================================
              EMPTY
          ================================================= */}

          {filteredJobs.length === 0 ? (

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="bg-white rounded-3xl border border-[#101828]/10 p-12 md:p-20 text-center"
            >

              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#F2F4F7] flex items-center justify-center">

                <Briefcase
                  size={36}
                  className="text-[#98A2B3]"
                />

              </div>

              <h2 className="text-2xl font-semibold text-[#101828] mt-6">

                {jobs.length === 0
                  ? "No recommendations yet"
                  : "No matching jobs"}

              </h2>

              <p className="text-[#667085] max-w-lg mx-auto mt-2 leading-6">

                {jobs.length === 0
                  ? "Upload and analyze your resume to let Recruit_Ai find opportunities that match your profile."
                  : "Try changing your search or minimum match filter."}

              </p>

              <div className="flex flex-wrap justify-center gap-3 mt-6">

                {jobs.length === 0 && (
                  <button
                    onClick={() =>
                      navigate(
                        "/resume-upload"
                      )
                    }
                    className="inline-flex items-center gap-2 px-5 py-3 bg-[#101828] text-white rounded-xl font-semibold hover:bg-[#0F766E] transition"
                  >
                    <Sparkles size={16} />

                    Analyze Resume

                    <ArrowRight
                      size={16}
                    />
                  </button>
                )}

                <button
                  onClick={() =>
                    navigate("/jobs")
                  }
                  className="inline-flex items-center gap-2 px-5 py-3 bg-[#F2F4F7] text-[#344054] rounded-xl font-semibold hover:bg-[#EAECF0] transition"
                >
                  Browse All Jobs

                  <ArrowRight
                    size={16}
                  />
                </button>

              </div>

            </motion.div>

          ) : (

            /* =================================================
               JOB DISCOVERY
            ================================================= */

            <div className="grid grid-cols-1 xl:grid-cols-[390px_minmax(0,1fr)] gap-5">

              {/* =================================================
                  JOB LIST
              ================================================= */}

              <section>

                <div className="flex items-center justify-between mb-3">

                  <div>

                    <h2 className="text-sm font-semibold text-[#101828]">

                      Recommended opportunities

                    </h2>

                    <p className="text-xs text-[#98A2B3] mt-0.5">

                      {filteredJobs.length} jobs matching your profile

                    </p>

                  </div>

                  <div className="hidden sm:flex items-center gap-1.5 text-xs text-[#667085]">

                    <Sparkles
                      size={13}
                      className="text-[#0F766E]"
                    />

                    AI ranked

                  </div>

                </div>

                <div className="space-y-3">

                  {filteredJobs.map(
                    (job, index) => {

                      const score =
                        getMatchScore(job);

                      const colors =
                        getScoreColor(
                          score
                        );

                      const jobId =
                        job.job_id ||
                        job._id ||
                        job.id;

                      const isSelected =
                        selectedJob &&
                        (
                          selectedJob.job_id ||
                          selectedJob._id ||
                          selectedJob.id
                        ) === jobId;

                      const isSaved =
                        savedJobs.includes(
                          jobId
                        );

                      return (
                        <motion.button
                          key={
                            jobId ||
                            index
                          }
                          initial={{
                            opacity: 0,
                            x: -10,
                          }}
                          animate={{
                            opacity: 1,
                            x: 0,
                          }}
                          transition={{
                            delay:
                              index *
                              0.04,
                          }}
                          onClick={() =>
                            setSelectedJob(
                              job
                            )
                          }
                          className={`w-full text-left bg-white rounded-2xl border p-4 transition-all duration-200 ${
                            isSelected
                              ? "border-[#0F766E] shadow-md shadow-[#0F766E]/10"
                              : "border-[#101828]/10 hover:border-[#98A2B3] hover:shadow-sm"
                          }`}
                        >

                          <div className="flex items-start gap-3">

                            {/* COMPANY */}

                            <div className="w-11 h-11 rounded-xl bg-[#F2F4F7] flex items-center justify-center shrink-0 overflow-hidden">

                              {job.company_logo ? (
                                <img
                                  src={
                                    job.company_logo
                                  }
                                  alt={
                                    job.company_name ||
                                    "Company"
                                  }
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <Building2
                                  size={20}
                                  className="text-[#667085]"
                                />
                              )}

                            </div>

                            {/* DETAILS */}

                            <div className="min-w-0 flex-1">

                              <div className="flex items-start justify-between gap-2">

                                <div className="min-w-0">

                                  <h3 className="font-semibold text-sm text-[#101828] truncate">

                                    {job.title ||
                                      "Untitled Position"}

                                  </h3>

                                  <p className="text-xs text-[#667085] mt-0.5 truncate">

                                    {job.company_name ||
                                      "Company"}

                                  </p>

                                </div>

                                <div
                                  className={`px-2 py-1 rounded-lg border text-xs font-bold shrink-0 ${colors.bg} ${colors.text} ${colors.border}`}
                                >
                                  {score}%
                                </div>

                              </div>

                              <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3">

                                {job.location && (
                                  <span className="flex items-center gap-1 text-[11px] text-[#98A2B3]">

                                    <MapPin
                                      size={12}
                                    />

                                    {job.location}

                                  </span>
                                )}

                                {job.employment_type && (
                                  <span className="flex items-center gap-1 text-[11px] text-[#98A2B3]">

                                    <Clock
                                      size={12}
                                    />

                                    {
                                      job.employment_type
                                    }

                                  </span>
                                )}

                              </div>

                              <div className="flex items-center justify-between mt-3">

                                <span
                                  className={`text-[11px] font-semibold ${colors.text}`}
                                >
                                  {getScoreLabel(
                                    score
                                  )}
                                </span>

                                <ChevronRight
                                  size={15}
                                  className={
                                    isSelected
                                      ? "text-[#0F766E]"
                                      : "text-[#98A2B3]"
                                  }
                                />

                              </div>

                            </div>

                          </div>

                        </motion.button>
                      );
                    }
                  )}

                </div>

              </section>

              {/* =================================================
                  DETAIL PANEL
              ================================================= */}

              <AnimatePresence mode="wait">

                {selectedJob && (
                  <motion.section
                    key={
                      selectedJob.job_id ||
                      selectedJob._id ||
                      selectedJob.id
                    }
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      duration: 0.3,
                    }}
                    className="bg-white rounded-3xl border border-[#101828]/10 overflow-hidden xl:sticky xl:top-6 self-start"
                  >

                    {/* MOBILE CLOSE */}

                    <button
                      onClick={() =>
                        setSelectedJob(
                          null
                        )
                      }
                      className="xl:hidden absolute right-4 top-4 w-9 h-9 rounded-xl bg-white border border-[#EAECF0] flex items-center justify-center z-10"
                    >
                      <X size={16} />
                    </button>

                    <div className="p-6 md:p-8">

                      {/* TOP */}

                      <div className="flex flex-col md:flex-row md:items-start justify-between gap-5">

                        <div className="flex items-start gap-4">

                          <div className="w-14 h-14 rounded-2xl bg-[#F2F4F7] flex items-center justify-center shrink-0 overflow-hidden">

                            {selectedJob.company_logo ? (
                              <img
                                src={
                                  selectedJob.company_logo
                                }
                                alt={
                                  selectedJob.company_name ||
                                  "Company"
                                }
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <Building2
                                size={25}
                                className="text-[#667085]"
                              />
                            )}

                          </div>

                          <div>

                            <h2 className="text-2xl font-semibold tracking-[-0.03em] text-[#101828]">

                              {selectedJob.title ||
                                "Untitled Position"}

                            </h2>

                            <p className="text-sm text-[#667085] mt-1">

                              {selectedJob.company_name ||
                                "Company"}

                            </p>

                            <div className="flex flex-wrap gap-3 mt-3">

                              {selectedJob.location && (
                                <span className="flex items-center gap-1.5 text-xs text-[#667085]">

                                  <MapPin
                                    size={13}
                                  />

                                  {
                                    selectedJob.location
                                  }

                                </span>
                              )}

                              {selectedJob.employment_type && (
                                <span className="flex items-center gap-1.5 text-xs text-[#667085]">

                                  <Clock
                                    size={13}
                                  />

                                  {
                                    selectedJob.employment_type
                                  }

                                </span>
                              )}

                            </div>

                          </div>

                        </div>

                        <div className="flex items-center gap-2">

                          <button
                            onClick={() =>
                              toggleSaveJob(
                                selectedJob.job_id ||
                                  selectedJob._id ||
                                  selectedJob.id
                              )
                            }
                            className={`w-10 h-10 rounded-xl border flex items-center justify-center transition ${
                              savedJobs.includes(
                                selectedJob.job_id ||
                                  selectedJob._id ||
                                  selectedJob.id
                              )
                                ? "bg-[#EAF5F1] border-[#BFE5DB] text-[#0F766E]"
                                : "bg-white border-[#EAECF0] text-[#667085] hover:bg-[#F7F5EF]"
                            }`}
                          >

                            <Bookmark
                              size={17}
                              fill={
                                savedJobs.includes(
                                  selectedJob.job_id ||
                                    selectedJob._id ||
                                    selectedJob.id
                                )
                                  ? "currentColor"
                                  : "none"
                              }
                            />

                          </button>

                          <button
                            onClick={() =>
                              openJob(
                                selectedJob
                              )
                            }
                            className="hidden md:flex w-10 h-10 rounded-xl border border-[#EAECF0] items-center justify-center text-[#667085] hover:bg-[#F7F5EF]"
                          >

                            <ExternalLink
                              size={17}
                            />

                          </button>

                        </div>

                      </div>

                      {/* MATCH HERO */}

                      <div className="mt-7 rounded-2xl bg-[#F7F5EF] border border-[#101828]/5 p-5">

                        <div className="flex flex-col sm:flex-row sm:items-center gap-5">

                          <ScoreRing
                            score={getMatchScore(
                              selectedJob
                            )}
                          />

                          <div className="flex-1">

                            <div className="flex items-center gap-2">

                              <Sparkles
                                size={16}
                                className="text-[#0F766E]"
                              />

                              <p className="text-sm font-semibold text-[#101828]">

                                {
                                  getScoreLabel(
                                    getMatchScore(
                                      selectedJob
                                    )
                                  )
                                }

                              </p>

                            </div>

                            <p className="text-xs text-[#667085] mt-1 leading-5">

                              Recruit_Ai estimates how well your
                              current profile matches this role.

                            </p>

                            <div className="mt-3 h-1.5 bg-[#EAECF0] rounded-full overflow-hidden">

                              <motion.div
                                initial={{
                                  width: 0,
                                }}
                                animate={{
                                  width: `${Math.min(
                                    getMatchScore(
                                      selectedJob
                                    ),
                                    100
                                  )}%`,
                                }}
                                transition={{
                                  duration: 0.8,
                                }}
                                className="h-full bg-[#0F766E] rounded-full"
                              />

                            </div>

                          </div>

                        </div>

                      </div>

                      {/* JOB META */}

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-5">

                        {selectedJob.salary && (
                          <div className="bg-[#FCFCFA] border border-[#EAECF0] rounded-xl p-3">

                            <DollarSign
                              size={15}
                              className="text-[#0F766E]"
                            />

                            <p className="text-[10px] uppercase tracking-wide text-[#98A2B3] mt-2">

                              Salary

                            </p>

                            <p className="text-xs font-semibold text-[#344054] mt-1 truncate">

                              {
                                selectedJob.salary
                              }

                            </p>

                          </div>
                        )}

                        {selectedJob.experience_required && (
                          <div className="bg-[#FCFCFA] border border-[#EAECF0] rounded-xl p-3">

                            <Briefcase
                              size={15}
                              className="text-[#0F766E]"
                            />

                            <p className="text-[10px] uppercase tracking-wide text-[#98A2B3] mt-2">

                              Experience

                            </p>

                            <p className="text-xs font-semibold text-[#344054] mt-1 truncate">

                              {
                                selectedJob.experience_required
                              }

                            </p>

                          </div>
                        )}

                        {selectedJob.department && (
                          <div className="bg-[#FCFCFA] border border-[#EAECF0] rounded-xl p-3">

                            <Layers3
                              size={15}
                              className="text-[#0F766E]"
                            />

                            <p className="text-[10px] uppercase tracking-wide text-[#98A2B3] mt-2">

                              Department

                            </p>

                            <p className="text-xs font-semibold text-[#344054] mt-1 truncate">

                              {
                                selectedJob.department
                              }

                            </p>

                          </div>
                        )}

                        <div className="bg-[#FCFCFA] border border-[#EAECF0] rounded-xl p-3">

                          <Target
                            size={15}
                            className="text-[#0F766E]"
                          />

                          <p className="text-[10px] uppercase tracking-wide text-[#98A2B3] mt-2">

                            Match

                          </p>

                          <p className="text-xs font-semibold text-[#344054] mt-1">

                            {getMatchScore(
                              selectedJob
                            )}
                            %

                          </p>

                        </div>

                      </div>

                      {/* WHY YOU MATCH */}

                      <div className="mt-7">

                        <div className="flex items-center gap-2">

                          <div className="w-8 h-8 rounded-lg bg-[#EAF5F1] flex items-center justify-center">

                            <Brain
                              size={16}
                              className="text-[#0F766E]"
                            />

                          </div>

                          <div>

                            <h3 className="text-sm font-semibold text-[#101828]">

                              Why you match

                            </h3>

                            <p className="text-[11px] text-[#98A2B3]">

                              Based on your resume

                            </p>

                          </div>

                        </div>

                        <div className="mt-4 space-y-2">

                          {getMatchedSkills(
                            selectedJob
                          ).length > 0 ? (
                            getMatchedSkills(
                              selectedJob
                            )
                              .slice(0, 8)
                              .map(
                                (
                                  skill,
                                  index
                                ) => (
                                  <div
                                    key={`${skill}-${index}`}
                                    className="flex items-center gap-3"
                                  >

                                    <CircleCheck
                                      size={15}
                                      className="text-[#0F766E]"
                                    />

                                    <span className="text-xs text-[#344054]">

                                      {skill}

                                    </span>

                                  </div>
                                )
                              )
                          ) : (
                            <p className="text-xs text-[#98A2B3]">

                              Your profile has been
                              matched against the job
                              requirements.

                            </p>
                          )}

                        </div>

                      </div>

                      {/* SKILLS TO IMPROVE */}

                      {getMissingSkills(
                        selectedJob
                      ).length > 0 && (
                        <div className="mt-6">

                          <div className="flex items-center gap-2">

                            <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">

                              <AlertCircle
                                size={16}
                                className="text-amber-600"
                              />

                            </div>

                            <div>

                              <h3 className="text-sm font-semibold text-[#101828]">

                                Skills to improve

                              </h3>

                              <p className="text-[11px] text-[#98A2B3]">

                                These could strengthen your match

                              </p>

                            </div>

                          </div>

                          <div className="flex flex-wrap gap-2 mt-4">

                            {getMissingSkills(
                              selectedJob
                            )
                              .slice(0, 8)
                              .map(
                                (
                                  skill,
                                  index
                                ) => (
                                  <span
                                    key={`${skill}-${index}`}
                                    className="px-2.5 py-1.5 bg-amber-50 border border-amber-100 rounded-lg text-[11px] font-medium text-amber-700"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}

                          </div>

                        </div>
                      )}

                      {/* AI RECOMMENDATION */}

                      <div className="mt-7 p-4 rounded-2xl bg-[#101828] text-white">

                        <div className="flex items-start gap-3">

                          <Zap
                            size={17}
                            className="text-[#8FE2D1] mt-0.5 shrink-0"
                          />

                          <div>

                            <p className="text-xs font-semibold">

                              Recruit_Ai recommendation

                            </p>

                            <p className="text-[11px] text-white/50 leading-5 mt-1">

                              {getMatchScore(
                                selectedJob
                              ) >= 80
                                ? "This role is strongly aligned with your current profile. Consider applying."
                                : getMatchScore(
                                    selectedJob
                                  ) >= 60
                                ? "This role has good potential. Review the missing skills before applying."
                                : "Consider improving your profile before prioritizing this role."}

                            </p>

                          </div>

                        </div>

                      </div>

                      {/* ACTIONS */}

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">

                        <button
                          onClick={() =>
                            openJob(
                              selectedJob
                            )
                          }
                          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#101828] hover:bg-[#0F766E] text-white rounded-xl font-semibold text-sm transition"
                        >

                          View Full Job

                          <ArrowRight
                            size={16}
                          />

                        </button>

                        <button
                          onClick={() =>
                            toggleSaveJob(
                              selectedJob.job_id ||
                                selectedJob._id ||
                                selectedJob.id
                            )
                          }
                          className="flex items-center justify-center gap-2 px-5 py-3.5 bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] rounded-xl font-semibold text-sm transition"
                        >

                          <Bookmark
                            size={16}
                            fill={
                              savedJobs.includes(
                                selectedJob.job_id ||
                                  selectedJob._id ||
                                  selectedJob.id
                              )
                                ? "currentColor"
                                : "none"
                            }
                          />

                          {savedJobs.includes(
                            selectedJob.job_id ||
                              selectedJob._id ||
                              selectedJob.id
                          )
                            ? "Saved"
                            : "Save Job"}

                        </button>

                      </div>

                    </div>

                  </motion.section>
                )}

              </AnimatePresence>

            </div>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 py-8 text-xs text-[#98A2B3]">

            <span>
              Recruit_Ai Career Intelligence
            </span>

            <span className="flex items-center gap-2">

              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />

              AI-ranked opportunities

            </span>

          </footer>

        </div>
      </main>
    </div>
  );
}

export default RecommendedJobs;