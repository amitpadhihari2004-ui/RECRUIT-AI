import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  Loader2,
  FileText,
  Eye,
  Calendar,
  CheckCircle,
  XCircle,
  Clock,
  Trash2,
  Upload,
  Files,
  BarChart3,
  Search,
  HardDrive,
  Download,
  TrendingUp,
  AlertCircle,
  Sparkles,
  Star,
  Briefcase,
  Brain,
  ShieldCheck,
  ArrowUpRight,
  ChevronRight,
  Target,
  Activity,
  Award,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getUserResumes,
  deleteResume,
} from "../api/resumeApi";

import Sidebar from "../components/Sidebar";

function ResumeAnalysis() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [resumes, setResumes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("Latest");

  // =====================================================
  // FETCH RESUMES
  // =====================================================

  useEffect(() => {
    fetchUserResumes();
  }, []);

  const fetchUserResumes = async () => {
    try {
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        toast.error("User not found. Please login again.");
        navigate("/login");
        return;
      }

      const response = await getUserResumes(userId);

      if (response?.success && response?.resumes) {
        setResumes(response.resumes);
      } else {
        setResumes([]);
      }
    } catch (error) {
      console.error("Resume fetch error:", error);

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load resumes."
      );

      setResumes([]);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // DELETE RESUME
  // =====================================================

  const handleDeleteResume = async (resumeId, fileName) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${fileName}"?`
    );

    if (!confirmed) {
      return;
    }

    try {
      await deleteResume(resumeId);

      toast.success("Resume deleted successfully.");

      fetchUserResumes();
    } catch (error) {
      console.error("Delete error:", error);

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to delete resume."
      );
    }
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (dateString) => {
    if (!dateString) {
      return "N/A";
    }

    const date = new Date(dateString);

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  // =====================================================
  // FILE SIZE
  // =====================================================

  const formatFileSize = (size) => {
    if (!size) {
      return "0 KB";
    }

    if (size >= 1024 * 1024) {
      return `${(size / (1024 * 1024)).toFixed(2)} MB`;
    }

    return `${(size / 1024).toFixed(1)} KB`;
  };

  // =====================================================
  // STATUS
  // =====================================================

  const getStatusInfo = (status) => {
    if (
      status === "Completed" ||
      status === "Analyzed"
    ) {
      return {
        label: "Completed",
        icon: CheckCircle,
        className:
          "bg-[#EAF5F1] text-[#0F766E] border-[#BFE5DB]",
      };
    }

    if (status === "Failed") {
      return {
        label: "Failed",
        icon: XCircle,
        className:
          "bg-red-50 text-red-600 border-red-200",
      };
    }

    return {
      label: "Pending",
      icon: Clock,
      className:
        "bg-amber-50 text-amber-600 border-amber-200",
    };
  };

  // =====================================================
  // SCORE
  // =====================================================

  const getScoreLabel = (score) => {
    if (score >= 90) {
      return "Outstanding";
    }

    if (score >= 80) {
      return "Excellent";
    }

    if (score >= 70) {
      return "Strong";
    }

    if (score >= 60) {
      return "Good";
    }

    if (score >= 40) {
      return "Average";
    }

    return "Needs Improvement";
  };

  const getScoreColor = (score) => {
    if (score >= 80) {
      return "#0F766E";
    }

    if (score >= 60) {
      return "#2563EB";
    }

    if (score >= 40) {
      return "#D97706";
    }

    return "#DC2626";
  };

  const getScoreTextColor = (score) => {
    if (score >= 80) {
      return "text-[#0F766E]";
    }

    if (score >= 60) {
      return "text-blue-600";
    }

    if (score >= 40) {
      return "text-amber-600";
    }

    return "text-red-600";
  };

  // =====================================================
  // FILTER
  // =====================================================

  const filteredResumes = useMemo(() => {
    return resumes.filter((resume) => {
      const fileName = resume.file_name || "";

      const matchesSearch = fileName
        .toLowerCase()
        .includes(searchTerm.toLowerCase());

      const status =
        resume.analysis_status || "Pending";

      const normalizedStatus =
        status === "Analyzed"
          ? "Completed"
          : status;

      const matchesFilter =
        filterStatus === "All" ||
        normalizedStatus === filterStatus;

      return matchesSearch && matchesFilter;
    });
  }, [
    resumes,
    searchTerm,
    filterStatus,
  ]);

  // =====================================================
  // SORT
  // =====================================================

  const sortedResumes = useMemo(() => {
    return [...filteredResumes].sort(
      (a, b) => {
        if (sortBy === "Highest Score") {
          return (
            (b.resume_score || 0) -
            (a.resume_score || 0)
          );
        }

        return (
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
        );
      }
    );
  }, [filteredResumes, sortBy]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const stats = useMemo(() => {
    const completed = resumes.filter(
      (resume) =>
        resume.analysis_status === "Completed" ||
        resume.analysis_status === "Analyzed"
    );

    const scores = completed
      .map((resume) =>
        Number(resume.resume_score || 0)
      )
      .filter((score) => score > 0);

    const averageScore =
      scores.length > 0
        ? Math.round(
            scores.reduce(
              (sum, score) => sum + score,
              0
            ) / scores.length
          )
        : 0;

    const highestScore =
      scores.length > 0
        ? Math.max(...scores)
        : 0;

    const bestResume =
      completed.length > 0
        ? [...completed].sort(
            (a, b) =>
              (b.resume_score || 0) -
              (a.resume_score || 0)
          )[0]
        : null;

    return {
      total: resumes.length,
      completed: completed.length,
      pending:
        resumes.length - completed.length,
      averageScore,
      highestScore,
      bestResume,
    };
  }, [resumes]);

  // =====================================================
  // SCORE DISTRIBUTION
  // =====================================================

  const scoreDistribution = useMemo(() => {
    return {
      excellent: resumes.filter(
        (r) => (r.resume_score || 0) >= 80
      ).length,

      good: resumes.filter(
        (r) =>
          (r.resume_score || 0) >= 60 &&
          (r.resume_score || 0) < 80
      ).length,

      average: resumes.filter(
        (r) =>
          (r.resume_score || 0) >= 40 &&
          (r.resume_score || 0) < 60
      ).length,

      low: resumes.filter(
        (r) =>
          (r.resume_score || 0) > 0 &&
          (r.resume_score || 0) < 40
      ).length,
    };
  }, [resumes]);

  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F7F5EF]">
        <Sidebar />

        <main className="flex-1 p-5 md:p-8">
          <div className="max-w-7xl mx-auto">
            <div className="animate-pulse">

              <div className="h-4 w-40 bg-gray-200 rounded mb-4" />

              <div className="h-10 w-72 bg-gray-200 rounded mb-3" />

              <div className="h-5 w-96 bg-gray-200 rounded mb-10" />

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[1, 2, 3, 4].map((item) => (
                  <div
                    key={item}
                    className="h-32 bg-white rounded-2xl border border-gray-200"
                  />
                ))}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 h-80 bg-white rounded-3xl border border-gray-200" />
                <div className="h-80 bg-white rounded-3xl border border-gray-200" />
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
    <div className="flex min-h-screen bg-[#F7F5EF]">

      <Sidebar />

      <main className="flex-1 overflow-y-auto">

        <div className="max-w-7xl mx-auto p-5 md:p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-5 mb-8"
          >

            <div>

              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">
                <span className="w-7 h-[2px] bg-[#0F766E]" />
                Resume Intelligence
              </div>

              <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.04em] text-[#101828] mt-3">
                Resume Library
              </h1>

              <p className="text-[#667085] mt-2 max-w-2xl">
                Manage your resumes, track ATS performance and
                understand how your profile is improving.
              </p>

            </div>

            <motion.button
              whileHover={{
                y: -2,
              }}
              whileTap={{
                scale: 0.98,
              }}
              onClick={() =>
                navigate("/resume-upload")
              }
              className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-xl font-semibold transition-all duration-300"
            >
              <Upload size={17} />
              Upload Resume
              <ArrowUpRight size={16} />
            </motion.button>

          </motion.div>

          {/* =================================================
              KPI CARDS
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
              delay: 0.1,
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >

            {/* TOTAL */}

            <StatCard
              label="Total resumes"
              value={stats.total}
              icon={Files}
              description="Uploaded documents"
            />

            {/* ANALYZED */}

            <StatCard
              label="Analyzed"
              value={stats.completed}
              icon={CheckCircle}
              description={`${stats.pending} pending`}
              accent="teal"
            />

            {/* AVG */}

            <StatCard
              label="Average score"
              value={`${stats.averageScore}%`}
              icon={Activity}
              description="Across analyzed resumes"
              accent="blue"
            />

            {/* BEST */}

            <StatCard
              label="Best score"
              value={`${stats.highestScore}%`}
              icon={Award}
              description={
                stats.highestScore >= 80
                  ? "Excellent profile"
                  : "Keep improving"
              }
              accent="amber"
            />

          </motion.div>

          {/* =================================================
              ANALYTICS SECTION
          ================================================= */}

          <div className="grid grid-cols-1 xl:grid-cols-[1.7fr_1fr] gap-6 mb-8">

            {/* =================================================
                SCORE TREND
            ================================================= */}

            <motion.section
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.2,
                duration: 0.5,
              }}
              className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm overflow-hidden"
            >

              <div className="px-6 py-5 border-b border-[#101828]/5 flex items-center justify-between">

                <div>

                  <h2 className="font-semibold text-[#101828]">
                    Resume score overview
                  </h2>

                  <p className="text-xs text-[#98A2B3] mt-1">
                    Performance across your analyzed resumes
                  </p>

                </div>

                <div className="w-9 h-9 rounded-xl bg-[#EAF5F1] flex items-center justify-center">
                  <TrendingUp
                    size={17}
                    className="text-[#0F766E]"
                  />
                </div>

              </div>

              <div className="p-6">

                {resumes.length === 0 ? (
                  <EmptyChart />
                ) : (
                  <ScoreChart
                    resumes={resumes}
                  />
                )}

              </div>

            </motion.section>

            {/* =================================================
                SCORE DISTRIBUTION
            ================================================= */}

            <motion.section
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.3,
                duration: 0.5,
              }}
              className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm"
            >

              <div className="px-6 py-5 border-b border-[#101828]/5">

                <div className="flex items-center justify-between">

                  <div>

                    <h2 className="font-semibold text-[#101828]">
                      Score distribution
                    </h2>

                    <p className="text-xs text-[#98A2B3] mt-1">
                      Resume quality breakdown
                    </p>

                  </div>

                  <div className="w-9 h-9 rounded-xl bg-[#F7F5EF] flex items-center justify-center">
                    <BarChart3
                      size={17}
                      className="text-[#667085]"
                    />
                  </div>

                </div>

              </div>

              <div className="p-6">

                <div className="space-y-5">

                  <ScoreBar
                    label="Excellent"
                    range="80–100"
                    value={scoreDistribution.excellent}
                    total={Math.max(
                      resumes.length,
                      1
                    )}
                    color="bg-[#0F766E]"
                  />

                  <ScoreBar
                    label="Good"
                    range="60–79"
                    value={scoreDistribution.good}
                    total={Math.max(
                      resumes.length,
                      1
                    )}
                    color="bg-blue-600"
                  />

                  <ScoreBar
                    label="Average"
                    range="40–59"
                    value={scoreDistribution.average}
                    total={Math.max(
                      resumes.length,
                      1
                    )}
                    color="bg-amber-500"
                  />

                  <ScoreBar
                    label="Needs improvement"
                    range="1–39"
                    value={scoreDistribution.low}
                    total={Math.max(
                      resumes.length,
                      1
                    )}
                    color="bg-red-500"
                  />

                </div>

                <div className="mt-7 pt-5 border-t border-[#101828]/5">

                  <div className="flex items-center justify-between">

                    <div className="flex items-center gap-2">

                      <Target
                        size={16}
                        className="text-[#0F766E]"
                      />

                      <span className="text-xs font-semibold text-[#344054]">
                        Target score
                      </span>

                    </div>

                    <span className="text-sm font-bold text-[#0F766E]">
                      80+
                    </span>

                  </div>

                </div>

              </div>

            </motion.section>

          </div>

          {/* =================================================
              BEST RESUME
          ================================================= */}

          {stats.bestResume && (
            <motion.section
              initial={{
                opacity: 0,
                y: 15,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                delay: 0.35,
                duration: 0.5,
              }}
              className="relative overflow-hidden bg-[#101828] rounded-3xl p-6 md:p-7 mb-8"
            >

              <div className="absolute -right-20 -top-20 w-56 h-56 rounded-full bg-[#0F766E]/25 blur-3xl" />

              <div className="absolute -left-20 -bottom-20 w-48 h-48 rounded-full bg-[#E87961]/10 blur-3xl" />

              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">

                <div className="flex items-center gap-4">

                  <div className="w-14 h-14 rounded-2xl bg-[#0F766E]/20 flex items-center justify-center shrink-0">

                    <Star
                      size={25}
                      className="text-[#8FE2D1] fill-[#8FE2D1]"
                    />

                  </div>

                  <div>

                    <div className="flex items-center gap-2">

                      <span className="text-[10px] uppercase tracking-[0.16em] text-[#8FE2D1] font-semibold">
                        Best performing resume
                      </span>

                    </div>

                    <h3 className="text-white font-semibold mt-1 truncate max-w-[280px] md:max-w-md">
                      {stats.bestResume.file_name}
                    </h3>

                    <p className="text-white/50 text-xs mt-1">
                      {getScoreLabel(
                        stats.highestScore
                      )} ATS performance
                    </p>

                  </div>

                </div>

                <div className="flex items-center gap-5">

                  <div className="text-right">

                    <p className="text-3xl font-bold text-white">
                      {stats.highestScore}
                      <span className="text-sm text-white/40">
                        /100
                      </span>
                    </p>

                    <p className="text-[10px] uppercase tracking-wide text-white/40">
                      Resume score
                    </p>

                  </div>

                  <button
                    onClick={() =>
                      navigate(
                        `/resume-analysis/view/${stats.bestResume._id}`
                      )
                    }
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-white text-[#101828] hover:bg-[#EAF5F1] rounded-xl text-xs font-semibold transition"
                  >
                    View
                    <ChevronRight size={15} />
                  </button>

                </div>

              </div>

            </motion.section>
          )}

          {/* =================================================
              SEARCH / FILTERS
          ================================================= */}

          <motion.section
            initial={{
              opacity: 0,
              y: 15,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.4,
              duration: 0.5,
            }}
            className="bg-white rounded-2xl border border-[#101828]/10 p-4 mb-6"
          >

            <div className="flex flex-col lg:flex-row gap-3">

              <div className="relative flex-1">

                <Search
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#98A2B3]"
                />

                <input
                  type="text"
                  placeholder="Search your resumes..."
                  value={searchTerm}
                  onChange={(e) =>
                    setSearchTerm(
                      e.target.value
                    )
                  }
                  className="w-full pl-10 pr-4 py-3 bg-[#FCFCFA] border border-[#D0D5DD] rounded-xl text-sm text-[#344054] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/10 focus:border-[#0F766E] transition"
                />

              </div>

              <div className="flex flex-wrap gap-2">

                {[
                  "All",
                  "Completed",
                  "Pending",
                  "Failed",
                ].map((status) => (
                  <button
                    key={status}
                    onClick={() =>
                      setFilterStatus(
                        status
                      )
                    }
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      filterStatus === status
                        ? "bg-[#101828] text-white"
                        : "bg-[#F2F4F7] text-[#667085] hover:bg-[#EAECF0]"
                    }`}
                  >
                    {status}
                  </button>
                ))}

              </div>

              <div className="flex gap-2">

                {[
                  "Latest",
                  "Highest Score",
                ].map((sort) => (
                  <button
                    key={sort}
                    onClick={() =>
                      setSortBy(sort)
                    }
                    className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition ${
                      sortBy === sort
                        ? "bg-[#EAF5F1] text-[#0F766E]"
                        : "bg-[#F2F4F7] text-[#667085] hover:bg-[#EAECF0]"
                    }`}
                  >
                    {sort}
                  </button>
                ))}

              </div>

            </div>

          </motion.section>

          {/* =================================================
              LIBRARY HEADER
          ================================================= */}

          <div className="flex items-center justify-between mb-4">

            <div>

              <h2 className="font-semibold text-[#101828]">
                Your resumes
              </h2>

              <p className="text-xs text-[#98A2B3] mt-1">
                {sortedResumes.length}{" "}
                {sortedResumes.length === 1
                  ? "resume"
                  : "resumes"}{" "}
                shown
              </p>

            </div>

            <div className="hidden sm:flex items-center gap-2 text-xs text-[#98A2B3]">

              <ShieldCheck
                size={14}
                className="text-[#0F766E]"
              />

              Securely stored

            </div>

          </div>

          {/* =================================================
              RESUME CARDS
          ================================================= */}

          <AnimatePresence mode="wait">

            {sortedResumes.length === 0 ? (

              <EmptyState
                searchTerm={searchTerm}
                filterStatus={filterStatus}
                onUpload={() =>
                  navigate("/resume-upload")
                }
              />

            ) : (

              <motion.div
                initial={{
                  opacity: 0,
                }}
                animate={{
                  opacity: 1,
                }}
                className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
              >

                {sortedResumes.map(
                  (resume, index) => {

                    const score =
                      Number(
                        resume.resume_score || 0
                      );

                    const statusInfo =
                      getStatusInfo(
                        resume.analysis_status
                      );

                    const StatusIcon =
                      statusInfo.icon;

                    const isBest =
                      stats.highestScore > 0 &&
                      score ===
                        stats.highestScore;

                    return (
                      <motion.article
                        key={resume._id}
                        initial={{
                          opacity: 0,
                          y: 20,
                        }}
                        animate={{
                          opacity: 1,
                          y: 0,
                        }}
                        exit={{
                          opacity: 0,
                          scale: 0.95,
                        }}
                        transition={{
                          delay:
                            index * 0.04,
                          duration: 0.35,
                        }}
                        whileHover={{
                          y: -4,
                        }}
                        className="bg-white rounded-2xl border border-[#101828]/10 shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                      >

                        {/* TOP */}

                        <div className="p-5">

                          <div className="flex items-start justify-between gap-3">

                            <div className="flex items-center gap-3 min-w-0">

                              <div className="w-11 h-11 rounded-xl bg-[#F7F5EF] flex items-center justify-center shrink-0">

                                <FileText
                                  size={21}
                                  className="text-[#0F766E]"
                                />

                              </div>

                              <div className="min-w-0">

                                <h3 className="text-sm font-semibold text-[#101828] truncate">
                                  {resume.file_name}
                                </h3>

                                <p className="text-[11px] text-[#98A2B3] mt-1">
                                  {(
                                    resume.file_name
                                      ?.split(".")
                                      .pop() ||
                                    "FILE"
                                  ).toUpperCase()}{" "}
                                  • Resume
                                </p>

                              </div>

                            </div>

                            <div
                              className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-semibold shrink-0 ${statusInfo.className}`}
                            >
                              <StatusIcon size={12} />
                              {statusInfo.label}
                            </div>

                          </div>

                          {/* BEST BADGE */}

                          {isBest && (
                            <div className="mt-4 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-700 text-[10px] font-semibold">

                              <Star
                                size={11}
                                className="fill-current"
                              />

                              Highest scoring resume

                            </div>
                          )}

                          {/* META */}

                          <div className="grid grid-cols-2 gap-2 mt-4">

                            <div className="bg-[#F7F5EF] rounded-xl p-3">

                              <div className="flex items-center gap-1.5">

                                <Calendar
                                  size={13}
                                  className="text-[#98A2B3]"
                                />

                                <span className="text-[10px] uppercase tracking-wide text-[#98A2B3]">
                                  Uploaded
                                </span>

                              </div>

                              <p className="text-xs font-medium text-[#344054] mt-1">
                                {formatDate(
                                  resume.created_at
                                )}
                              </p>

                            </div>

                            <div className="bg-[#F7F5EF] rounded-xl p-3">

                              <div className="flex items-center gap-1.5">

                                <HardDrive
                                  size={13}
                                  className="text-[#98A2B3]"
                                />

                                <span className="text-[10px] uppercase tracking-wide text-[#98A2B3]">
                                  Size
                                </span>

                              </div>

                              <p className="text-xs font-medium text-[#344054] mt-1">
                                {formatFileSize(
                                  resume.file_size
                                )}
                              </p>

                            </div>

                          </div>

                          {/* SCORE */}

                          {resume.has_analysis && (
                            <div className="mt-4 p-4 bg-[#FCFCFA] border border-[#101828]/5 rounded-xl">

                              <div className="flex items-center gap-4">

                                <ScoreRing
                                  score={score}
                                />

                                <div className="flex-1">

                                  <div className="flex items-center justify-between">

                                    <p
                                      className={`text-sm font-semibold ${getScoreTextColor(
                                        score
                                      )}`}
                                    >
                                      {getScoreLabel(
                                        score
                                      )}
                                    </p>

                                    <span className="text-[10px] text-[#98A2B3]">
                                      ATS
                                    </span>

                                  </div>

                                  <p className="text-xs text-[#98A2B3] mt-1">
                                    Resume compatibility score
                                  </p>

                                  <div className="mt-3 h-1.5 bg-[#EAECF0] rounded-full overflow-hidden">

                                    <div
                                      className="h-full rounded-full transition-all"
                                      style={{
                                        width: `${Math.min(
                                          score,
                                          100
                                        )}%`,
                                        backgroundColor:
                                          getScoreColor(
                                            score
                                          ),
                                      }}
                                    />

                                  </div>

                                </div>

                              </div>

                            </div>
                          )}

                          {/* AI SUMMARY */}

                          {resume.ai_summary && (
                            <div className="mt-4 bg-[#EAF5F1] border border-[#BFE5DB] rounded-xl p-3">

                              <div className="flex items-center gap-2">

                                <Sparkles
                                  size={14}
                                  className="text-[#0F766E]"
                                />

                                <p className="text-[11px] font-semibold text-[#344054]">
                                  AI insight
                                </p>

                              </div>

                              <p className="text-[11px] leading-5 text-[#667085] mt-1 line-clamp-2">
                                {resume.ai_summary}
                              </p>

                            </div>
                          )}

                        </div>

                        {/* ACTIONS */}

                        <div className="px-5 py-4 bg-[#FCFCFA] border-t border-[#101828]/5 flex items-center gap-2">

                          <button
                            onClick={() =>
                              navigate(
                                `/resume-analysis/view/${resume._id}`
                              )
                            }
                            className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2.5 bg-[#101828] hover:bg-[#0F766E] text-white rounded-xl text-xs font-semibold transition-all"
                          >
                            <Eye size={14} />
                            View Analysis
                            <ChevronRight
                              size={13}
                            />
                          </button>

                          <button
                            onClick={() =>
                              toast.info(
                                "Job matching feature coming soon."
                              )
                            }
                            className="w-10 h-10 flex items-center justify-center bg-white border border-[#D0D5DD] hover:border-[#0F766E] hover:text-[#0F766E] text-[#667085] rounded-xl transition"
                            title="Job matching"
                          >
                            <Briefcase size={15} />
                          </button>

                          <button
                            onClick={() =>
                              toast.info(
                                "Download feature coming soon."
                              )
                            }
                            className="w-10 h-10 flex items-center justify-center bg-white border border-[#D0D5DD] hover:border-[#0F766E] hover:text-[#0F766E] text-[#667085] rounded-xl transition"
                            title="Download"
                          >
                            <Download size={15} />
                          </button>

                          <button
                            onClick={() =>
                              handleDeleteResume(
                                resume._id,
                                resume.file_name
                              )
                            }
                            className="w-10 h-10 flex items-center justify-center bg-white border border-red-100 hover:bg-red-50 text-red-500 rounded-xl transition"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>

                        </div>

                      </motion.article>
                    );
                  }
                )}

              </motion.div>
            )}

          </AnimatePresence>

          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-8 text-xs text-[#98A2B3]">

            <span>
              Recruit_Ai Resume Intelligence
            </span>

            <span className="flex items-center gap-2">

              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />

              AI-powered career analysis

            </span>

          </div>

        </div>

      </main>
    </div>
  );
}

// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  label,
  value,
  icon: Icon,
  description,
  accent = "gray",
}) {
  const accentStyles = {
    gray: {
      bg: "bg-[#F7F5EF]",
      icon: "text-[#667085]",
      value: "text-[#101828]",
    },
    teal: {
      bg: "bg-[#EAF5F1]",
      icon: "text-[#0F766E]",
      value: "text-[#0F766E]",
    },
    blue: {
      bg: "bg-blue-50",
      icon: "text-blue-600",
      value: "text-blue-600",
    },
    amber: {
      bg: "bg-amber-50",
      icon: "text-amber-600",
      value: "text-amber-600",
    },
  };

  const style =
    accentStyles[accent] ||
    accentStyles.gray;

  return (
    <motion.div
      whileHover={{
        y: -3,
      }}
      className="bg-white rounded-2xl border border-[#101828]/10 p-5 shadow-sm hover:shadow-md transition-all"
    >

      <div className="flex items-start justify-between gap-3">

        <div>

          <p className="text-[11px] uppercase tracking-wide font-semibold text-[#98A2B3]">
            {label}
          </p>

          <p
            className={`text-2xl md:text-3xl font-bold mt-2 ${style.value}`}
          >
            {value}
          </p>

          <p className="text-[11px] text-[#98A2B3] mt-1">
            {description}
          </p>

        </div>

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${style.bg}`}
        >
          <Icon
            size={18}
            className={style.icon}
          />
        </div>

      </div>

    </motion.div>
  );
}

// =========================================================
// SCORE RING
// =========================================================

function ScoreRing({ score }) {
  const radius = 24;
  const circumference =
    2 * Math.PI * radius;

  const progress =
    Math.min(Math.max(score, 0), 100) /
    100;

  const color =
    score >= 80
      ? "#0F766E"
      : score >= 60
      ? "#2563EB"
      : score >= 40
      ? "#D97706"
      : "#DC2626";

  return (
    <div className="relative w-16 h-16 shrink-0">

      <svg
        width="64"
        height="64"
        viewBox="0 0 64 64"
        className="-rotate-90"
      >

        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke="#EAECF0"
          strokeWidth="5"
        />

        <circle
          cx="32"
          cy="32"
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={
            circumference *
            (1 - progress)
          }
        />

      </svg>

      <div className="absolute inset-0 flex items-center justify-center">

        <span className="text-sm font-bold text-[#101828]">
          {score}
        </span>

      </div>

    </div>
  );
}

// =========================================================
// SCORE BAR
// =========================================================

function ScoreBar({
  label,
  range,
  value,
  total,
  color,
}) {
  const percentage =
    total > 0
      ? (value / total) * 100
      : 0;

  return (
    <div>

      <div className="flex items-center justify-between mb-2">

        <div className="flex items-center gap-2">

          <span className="text-xs font-semibold text-[#344054]">
            {label}
          </span>

          <span className="text-[10px] text-[#98A2B3]">
            {range}
          </span>

        </div>

        <span className="text-xs font-bold text-[#667085]">
          {value}
        </span>

      </div>

      <div className="h-2 bg-[#F2F4F7] rounded-full overflow-hidden">

        <motion.div
          initial={{
            width: 0,
          }}
          animate={{
            width: `${percentage}%`,
          }}
          transition={{
            duration: 0.7,
            ease: "easeOut",
          }}
          className={`h-full rounded-full ${color}`}
        />

      </div>

    </div>
  );
}

// =========================================================
// SCORE CHART
// =========================================================

function ScoreChart({ resumes }) {
  const analyzed = resumes
    .filter(
      (resume) =>
        Number(resume.resume_score || 0) >
        0
    )
    .sort(
      (a, b) =>
        new Date(a.created_at || 0) -
        new Date(b.created_at || 0)
    )
    .slice(-8);

  if (analyzed.length === 0) {
    return <EmptyChart />;
  }

  const width = 700;
  const height = 260;

  const paddingLeft = 45;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 45;

  const chartWidth =
    width -
    paddingLeft -
    paddingRight;

  const chartHeight =
    height -
    paddingTop -
    paddingBottom;

  const points = analyzed.map(
    (resume, index) => {
      const x =
        analyzed.length === 1
          ? width / 2
          : paddingLeft +
            (index /
              (analyzed.length - 1)) *
              chartWidth;

      const score = Math.min(
        Number(
          resume.resume_score || 0
        ),
        100
      );

      const y =
        paddingTop +
        ((100 - score) / 100) *
          chartHeight;

      return {
        x,
        y,
        score,
        name: resume.file_name,
      };
    }
  );

  const linePath = points
    .map(
      (point, index) =>
        `${index === 0 ? "M" : "L"} ${
          point.x
        } ${point.y}`
    )
    .join(" ");

  const areaPath = `
    ${linePath}
    L ${points[points.length - 1].x} ${
      height - paddingBottom
    }
    L ${points[0].x} ${
      height - paddingBottom
    }
    Z
  `;

  return (
    <div>

      <div className="flex items-center justify-between mb-4">

        <div>

          <p className="text-2xl font-bold text-[#101828]">
            {Math.round(
              analyzed.reduce(
                (sum, item) =>
                  sum +
                  Number(
                    item.resume_score || 0
                  ),
                0
              ) / analyzed.length
            )}
            <span className="text-sm text-[#98A2B3] font-medium">
              % avg
            </span>
          </p>

          <p className="text-[11px] text-[#98A2B3]">
            Last {analyzed.length} analyzed resumes
          </p>

        </div>

        <div className="flex items-center gap-2">

          <span className="w-2 h-2 rounded-full bg-[#0F766E]" />

          <span className="text-[11px] text-[#667085]">
            ATS score
          </span>

        </div>

      </div>

      <div className="w-full overflow-hidden">

        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="w-full h-auto"
        >

          {/* GRID */}

          {[0, 25, 50, 75, 100].map(
            (value) => {
              const y =
                paddingTop +
                ((100 - value) /
                  100) *
                  chartHeight;

              return (
                <g key={value}>

                  <line
                    x1={paddingLeft}
                    x2={
                      width -
                      paddingRight
                    }
                    y1={y}
                    y2={y}
                    stroke="#EAECF0"
                    strokeWidth="1"
                  />

                  <text
                    x="5"
                    y={y + 4}
                    fontSize="10"
                    fill="#98A2B3"
                  >
                    {value}
                  </text>

                </g>
              );
            }
          )}

          {/* AREA */}

          <path
            d={areaPath}
            fill="#0F766E"
            fillOpacity="0.07"
          />

          {/* LINE */}

          <path
            d={linePath}
            fill="none"
            stroke="#0F766E"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* POINTS */}

          {points.map(
            (point, index) => (
              <g key={index}>

                <circle
                  cx={point.x}
                  cy={point.y}
                  r="7"
                  fill="white"
                  stroke="#0F766E"
                  strokeWidth="3"
                />

                <text
                  x={point.x}
                  y={
                    height -
                    17
                  }
                  textAnchor="middle"
                  fontSize="9"
                  fill="#98A2B3"
                >
                  {index + 1}
                </text>

              </g>
            )
          )}

        </svg>

      </div>

      <div className="flex items-center justify-between mt-1">

        <span className="text-[10px] text-[#98A2B3]">
          Older
        </span>

        <span className="text-[10px] text-[#98A2B3]">
          Latest
        </span>

      </div>

    </div>
  );
}

// =========================================================
// EMPTY CHART
// =========================================================

function EmptyChart() {
  return (
    <div className="h-52 flex flex-col items-center justify-center text-center">

      <div className="w-12 h-12 rounded-xl bg-[#F7F5EF] flex items-center justify-center mb-3">

        <BarChart3
          size={21}
          className="text-[#98A2B3]"
        />

      </div>

      <p className="text-sm font-semibold text-[#344054]">
        No score data yet
      </p>

      <p className="text-xs text-[#98A2B3] mt-1">
        Analyze a resume to start seeing insights.
      </p>

    </div>
  );
}

// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
  searchTerm,
  filterStatus,
  onUpload,
}) {
  const filtered =
    searchTerm ||
    filterStatus !== "All";

  return (
    <motion.div
      initial={{
        opacity: 0,
        y: 10,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      className="bg-white rounded-3xl border border-[#101828]/10 p-12 md:p-16 text-center"
    >

      <div className="w-16 h-16 mx-auto rounded-2xl bg-[#F7F5EF] flex items-center justify-center">

        <FileText
          size={28}
          className="text-[#98A2B3]"
        />

      </div>

      <h3 className="text-xl font-semibold text-[#101828] mt-5">
        {filtered
          ? "No resumes found"
          : "No resume uploaded yet"}
      </h3>

      <p className="text-sm text-[#667085] mt-2 max-w-md mx-auto">
        {filtered
          ? "Try changing your search or filter to find another resume."
          : "Upload your first resume and let Recruit_Ai generate your resume intelligence."}
      </p>

      {!filtered && (
        <button
          onClick={onUpload}
          className="inline-flex items-center gap-2 mt-6 px-5 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-xl text-sm font-semibold transition"
        >
          <Upload size={16} />
          Upload Resume
          <ArrowUpRight size={15} />
        </button>
      )}

    </motion.div>
  );
}

export default ResumeAnalysis;
