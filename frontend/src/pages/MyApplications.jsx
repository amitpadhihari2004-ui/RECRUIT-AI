import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  XCircle,
  Eye,
  TrendingUp,
  Building2,
  Sparkles,
  RefreshCw,
  ArrowUpRight,
  ShieldCheck,
  Brain,
  Rocket,
  Globe2,
  Lock,
  Award,
  Target,
  Zap,
  ChevronRight,
  Search,
  Filter,
} from "lucide-react";
import toast from "react-hot-toast";

import { getApplicationsByStudent } from "../api/applicationApi";

function MyApplications() {
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");

  const fetchApplications = async (showLoader = true) => {
    try {
      if (showLoader) setLoading(true);
      else setRefreshing(true);

      const studentId = localStorage.getItem("user_id");

      if (!studentId) {
        toast.error("User not found. Please login again.");
        navigate("/login");
        return;
      }

      const response = await getApplicationsByStudent(studentId);

      if (Array.isArray(response)) {
        setApplications(response);
      } else if (response?.applications) {
        setApplications(response.applications);
      } else {
        setApplications([]);
      }
    } catch (error) {
      console.error("My Applications Error:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load applications."
      );
      setApplications([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchApplications();
  }, []);

  const formatDate = (date) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getApplicationStatus = (status) => {
    const statusMap = {
      Accepted: { icon: CheckCircle2, label: "Accepted", color: "text-[#0F766E]", bg: "bg-[#EAF5F1]", border: "border-[#BFE5DB]" },
      Shortlisted: { icon: CheckCircle2, label: "Shortlisted", color: "text-[#0F766E]", bg: "bg-[#EAF5F1]", border: "border-[#BFE5DB]" },
      Rejected: { icon: XCircle, label: "Rejected", color: "text-[#C95F4C]", bg: "bg-[#FFF1EE]", border: "border-[#F3C7BD]" },
      Pending: { icon: Clock3, label: "Pending", color: "text-[#A16A00]", bg: "bg-[#FFF8E7]", border: "border-[#F1D99A]" },
    };
    return statusMap[status] || { icon: Clock3, label: status || "Pending", color: "text-[#A16A00]", bg: "bg-[#FFF8E7]", border: "border-[#F1D99A]" };
  };

  const totalApplications = applications.length;
  const pendingApplications = applications.filter((app) => app.application_status === "Pending").length;
  const shortlistedApplications = applications.filter((app) =>
    ["Shortlisted", "Accepted"].includes(app.application_status)
  ).length;
  const rejectedApplications = applications.filter((app) => app.application_status === "Rejected").length;

  const filteredApplications = applications.filter((app) => {
    const matchesFilter = filter === "All" || app.application_status === filter;
    const matchesSearch = app.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          app.company_name?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#0F766E]/10 flex items-center justify-center mb-6">
            <Loader2 className="w-10 h-10 animate-spin text-[#0F766E]" />
          </div>
          <p className="text-sm text-[#667085] font-medium">Loading your applications...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F5EF] relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-60 right-[-100px] w-[650px] h-[650px] rounded-full bg-[#0F766E]/5 blur-3xl" />
        <div className="absolute bottom-[-180px] left-[-180px] w-[550px] h-[550px] rounded-full bg-[#E87961]/5 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto p-4 md:p-8 lg:p-10">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-8"
        >
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="w-8 h-[2px] bg-[#0F766E] rounded-full" />
              <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#0F766E]">Recruit_Ai</span>
              <span className="px-2 py-0.5 text-[8px] bg-[#EAF5F1] text-[#0F766E] rounded-full border border-[#BFE5DB]">Dashboard</span>
            </div>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-[#101828]">
              My Applications
            </h1>
            <p className="text-[#667085] mt-2 text-sm">Track your job applications and recruitment progress.</p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => fetchApplications(false)}
            disabled={refreshing}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-[#101828]/20 hover:shadow-[#0F766E]/30 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
            Refresh
          </motion.button>
        </motion.div>

        {/* Statistics */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
        >
          <StatCard
            label="Total Applications"
            value={totalApplications}
            icon={Briefcase}
            color="#0F766E"
            bgColor="#EAF5F1"
          />
          <StatCard
            label="Pending"
            value={pendingApplications}
            icon={Clock3}
            color="#A16A00"
            bgColor="#FFF8E7"
          />
          <StatCard
            label="Shortlisted"
            value={shortlistedApplications}
            icon={TrendingUp}
            color="#0F766E"
            bgColor="#EAF5F1"
          />
          <StatCard
            label="Rejected"
            value={rejectedApplications}
            icon={XCircle}
            color="#C95F4C"
            bgColor="#FFF1EE"
          />
        </motion.div>

        {/* Search & Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="bg-white border border-[#101828]/10 rounded-2xl p-4 mb-6 shadow-sm hover:shadow-lg transition-all duration-300"
        >
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#98A2B3]" />
              <input
                type="text"
                placeholder="Search by job title or company..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-[#FCFCFA] border border-[#D0D5DD] rounded-2xl text-sm text-[#344054] placeholder:text-[#98A2B3] focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              {["All", "Pending", "Shortlisted", "Rejected"].map((status) => (
                <motion.button
                  key={status}
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setFilter(status)}
                  className={`px-5 py-2.5 rounded-2xl text-sm font-semibold transition-all ${
                    filter === status
                      ? "bg-[#101828] text-white shadow-lg shadow-[#101828]/20"
                      : "bg-[#F2F4F7] text-[#667085] hover:bg-[#EAECF0]"
                  }`}
                >
                  {status}
                </motion.button>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Empty State */}
        {filteredApplications.length === 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-[#101828]/10 rounded-3xl p-12 md:p-20 text-center shadow-sm"
          >
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#F7F5EF] flex items-center justify-center">
              <Briefcase className="w-9 h-9 text-[#98A2B3]" />
            </div>
            <h2 className="text-2xl font-bold text-[#101828] mt-6">
              {applications.length === 0 ? "No Applications Yet" : "No Applications Found"}
            </h2>
            <p className="text-[#667085] mt-2 max-w-md mx-auto text-sm">
              {applications.length === 0
                ? "You haven't applied for any jobs yet. Explore available opportunities and submit your first application."
                : "Try selecting a different application status."}
            </p>
            {applications.length === 0 && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => navigate("/jobs")}
                className="mt-6 inline-flex items-center gap-2 px-6 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-2xl font-semibold transition-all shadow-lg shadow-[#101828]/20"
              >
                <Briefcase className="w-4 h-4" />
                Browse Jobs
                <ArrowUpRight className="w-4 h-4" />
              </motion.button>
            )}
          </motion.div>
        )}

        {/* Application Cards */}
        {filteredApplications.length > 0 && (
          <AnimatePresence>
            <motion.div className="space-y-4">
              {filteredApplications.map((application, index) => {
                const statusInfo = getApplicationStatus(application.application_status);
                const StatusIcon = statusInfo.icon;

                return (
                  <motion.div
                    key={application._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: index * 0.05 }}
                    whileHover={{ y: -4 }}
                    className="bg-white border border-[#101828]/10 rounded-3xl p-5 md:p-6 shadow-sm hover:shadow-xl hover:border-[#0F766E]/20 transition-all duration-300"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                      {/* Company / Job */}
                      <div className="flex items-start gap-4 flex-1 min-w-0">
                        <div className="w-14 h-14 rounded-2xl bg-[#EAF5F1] flex items-center justify-center flex-shrink-0">
                          {application.company_logo ? (
                            <img
                              src={application.company_logo}
                              alt={application.company_name}
                              className="w-full h-full object-cover rounded-2xl"
                            />
                          ) : (
                            <Building2 className="w-6 h-6 text-[#0F766E]" />
                          )}
                        </div>

                        <div className="min-w-0">
                          <h2 className="text-xl font-bold text-[#101828] truncate">
                            {application.job_title || "Job Position"}
                          </h2>
                          <p className="text-[#667085] mt-1">{application.company_name || "Company"}</p>
                          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-[#667085]">
                            <span className="flex items-center gap-1.5">
                              <Calendar className="w-4 h-4 text-[#0F766E]" />
                              Applied {formatDate(application.created_at)}
                            </span>
                            <span className="flex items-center gap-1.5">
                              <FileText className="w-4 h-4 text-[#0F766E]" />
                              Resume Submitted
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Scores */}
                      <div className="flex gap-3">
                        <div className="px-4 py-3 bg-[#F7F5EF] border border-[#101828]/5 rounded-xl text-center min-w-[90px]">
                          <div className="flex items-center justify-center gap-1 text-[#98A2B3] text-xs">
                            <FileText className="w-3.5 h-3.5" />
                            Resume
                          </div>
                          <p className="text-xl font-bold text-[#101828] mt-1">
                            {application.resume_score ?? 0}
                            <span className="text-xs text-[#98A2B3]">/100</span>
                          </p>
                        </div>
                        <div className="px-4 py-3 bg-[#F7F5EF] border border-[#101828]/5 rounded-xl text-center min-w-[90px]">
                          <div className="flex items-center justify-center gap-1 text-[#98A2B3] text-xs">
                            <Target className="w-3.5 h-3.5" />
                            Match
                          </div>
                          <p className="text-xl font-bold text-[#101828] mt-1">
                            {application.jd_match_score ?? 0}
                            <span className="text-xs text-[#98A2B3]">/100</span>
                          </p>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="flex flex-col items-start lg:items-end gap-3">
                        <span
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-semibold ${statusInfo.bg} ${statusInfo.color} ${statusInfo.border}`}
                        >
                          <StatusIcon className="w-4 h-4" />
                          {statusInfo.label}
                        </span>
                        <span className="text-xs text-[#98A2B3]">
                          Interview: {application.interview_status || "Not Scheduled"}
                        </span>
                      </div>

                      {/* View Button */}
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate(`/applications/${application._id}`)}
                        className="flex items-center justify-center gap-2 px-5 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-[#101828]/20 hover:shadow-[#0F766E]/30"
                      >
                        <Eye className="w-4 h-4" />
                        View
                        <ChevronRight className="w-4 h-4" />
                      </motion.button>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          </AnimatePresence>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-3 py-4 text-xs text-[#98A2B3] border-t border-[#101828]/5"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
            Recruit_Ai Applications Dashboard
          </span>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <ShieldCheck size={12} className="text-[#0F766E]" /> Secure
            </span>
            <span className="flex items-center gap-1.5">
              <Brain size={12} className="text-[#0F766E]" /> AI-Powered
            </span>
            <span className="flex items-center gap-1.5">
              <Rocket size={12} className="text-[#0F766E]" /> Track
            </span>
          </span>
        </motion.div>
      </div>
    </div>
  );
}

// =========================================================
// Stat Card Component
// =========================================================

function StatCard({ label, value, icon: Icon, color, bgColor }) {
  return (
    <motion.div
      whileHover={{ y: -4 }}
      className="bg-white border border-[#101828]/10 rounded-2xl p-5 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-[#667085] font-medium">{label}</p>
          <p className="text-3xl font-bold text-[#101828] mt-2">{value}</p>
        </div>
        <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: bgColor }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
      </div>
    </motion.div>
  );
}

export default MyApplications;