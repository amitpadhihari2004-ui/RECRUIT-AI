import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Loader2,
  ArrowLeft,
  Building2,
  Briefcase,
  Calendar,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquare,
  Sparkles,
  Target,
  XCircle,
  MapPin,
  GraduationCap,
  TrendingUp,
  Award,
  ShieldCheck,
  ChevronRight,
  Activity,
  UserCheck,
  CircleCheck,
  AlertCircle,
  Brain,
  BarChart3,
  Layers3,
  ArrowUpRight,
  Crown,
  Medal,
  Star,
  Zap,
  Rocket,
  Globe2,
  Lock,
} from "lucide-react";

import toast from "react-hot-toast";
import { getApplication } from "../api/applicationApi";
import Sidebar from "../components/Sidebar";

function ApplicationDetails() {
  const { applicationId } = useParams();
  const navigate = useNavigate();

  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (applicationId) fetchApplication();
  }, [applicationId]);

  const fetchApplication = async () => {
    try {
      setLoading(true);
      const studentId = localStorage.getItem("user_id");

      if (!studentId) {
        toast.error("User not found. Please login again.");
        navigate("/login");
        return;
      }

      const response = await getApplication(applicationId);

      if (response?.student_id && response.student_id !== studentId) {
        toast.error("You are not authorized to view this application.");
        navigate("/my-applications");
        return;
      }

      setApplication(response);
    } catch (error) {
      console.error("Application Details Error:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load application."
      );
      navigate("/my-applications");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return "N/A";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "N/A";
    return parsedDate.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const getStatus = (status) => {
    const statusMap = {
      Accepted: { icon: CheckCircle2, label: "Accepted", color: "text-[#0F766E]", bg: "bg-[#EAF5F1]", border: "border-[#BFE5DB]" },
      Shortlisted: { icon: CheckCircle2, label: "Shortlisted", color: "text-[#0F766E]", bg: "bg-[#EAF5F1]", border: "border-[#BFE5DB]" },
      Rejected: { icon: XCircle, label: "Rejected", color: "text-[#C95F4C]", bg: "bg-[#FFF1EE]", border: "border-[#F3C7BD]" },
      Interview: { icon: CalendarDays, label: "Interview", color: "text-[#667085]", bg: "bg-[#F2F4F7]", border: "border-[#D0D5DD]" },
      "Interview Scheduled": { icon: CalendarDays, label: "Interview Scheduled", color: "text-[#667085]", bg: "bg-[#F2F4F7]", border: "border-[#D0D5DD]" },
    };
    return statusMap[status] || { icon: Clock3, label: status || "Pending", color: "text-[#A16A00]", bg: "bg-[#FFF8E7]", border: "border-[#F1D99A]" };
  };

  const resumeScore = Math.min(100, Math.max(0, Number(application?.resume_score || 0)));
  const jdMatchScore = Math.min(100, Math.max(0, Number(application?.jd_match_score || 0)));
  const matchedSkills = useMemo(() => application?.matched_skills || [], [application]);
  const missingSkills = useMemo(() => application?.missing_skills || [], [application]);
  const totalSkills = matchedSkills.length + missingSkills.length;
  const skillMatch = totalSkills > 0 ? Math.round((matchedSkills.length / totalSkills) * 100) : 0;
  const overallScore = Math.round(resumeScore * 0.4 + jdMatchScore * 0.6);
  const status = getStatus(application?.application_status);
  const StatusIcon = status.icon;

  const getScoreLabel = (score) => {
    if (score >= 85) return "Excellent fit";
    if (score >= 70) return "Strong fit";
    if (score >= 55) return "Good foundation";
    if (score >= 40) return "Needs improvement";
    return "Low alignment";
  };

  const timeline = [
    { title: "Application submitted", description: "Your application was successfully submitted.", date: application?.created_at, completed: true, icon: FileText },
    { title: "Application review", description: "The hiring team can now review your application.", date: application?.updated_at, completed: application?.application_status !== "Pending", icon: UserCheck },
    { title: "Shortlisted", description: "Your profile progressed to the next stage.", date: ["Shortlisted", "Interview Scheduled"].includes(application?.application_status) ? application?.updated_at : null, completed: ["Shortlisted", "Interview Scheduled", "Accepted"].includes(application?.application_status), icon: Award },
    { title: "Interview", description: application?.interview_status || "Interview has not been scheduled.", date: application?.interview_date || null, completed: application?.interview_status === "Completed" || application?.application_status === "Accepted", icon: CalendarDays },
    { title: "Final decision", description: application?.application_status === "Accepted" ? "Your application has been accepted. 🎉" : "Final decision is pending.", date: null, completed: application?.application_status === "Accepted", icon: CircleCheck },
  ];

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F7F5EF]">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center p-6">
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center">
            <div className="w-20 h-20 mx-auto rounded-2xl bg-[#0F766E]/10 flex items-center justify-center mb-6">
              <Loader2 size={34} className="text-[#0F766E] animate-spin" />
            </div>
            <h2 className="text-2xl font-bold text-[#101828]">Loading Application</h2>
            <p className="text-[#667085] mt-2">Preparing your application intelligence...</p>
          </motion.div>
        </main>
      </div>
    );
  }

  if (!application) return null;

  return (
    <div className="flex min-h-screen bg-[#F7F5EF]">
      <Sidebar />
      <main className="flex-1 min-w-0 relative overflow-hidden">
        {/* Background Decor */}
        <div className="fixed inset-0 pointer-events-none">
          <div className="absolute -top-60 right-[-100px] w-[650px] h-[650px] rounded-full bg-[#0F766E]/5 blur-3xl" />
          <div className="absolute bottom-[-180px] left-[-180px] w-[550px] h-[550px] rounded-full bg-[#E87961]/5 blur-3xl" />
        </div>

        <div className="relative">
          {/* Top Nav */}
          <div className="max-w-7xl mx-auto px-5 md:px-8 pt-5">
            <motion.button
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              whileHover={{ x: -4 }}
              onClick={() => navigate("/my-applications")}
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#667085] hover:text-[#0F766E] transition-all group"
            >
              <ArrowLeft size={17} className="group-hover:-translate-x-1 transition-transform" />
              Back to applications
            </motion.button>
          </div>

          {/* Hero Section */}
          <section className="max-w-7xl mx-auto px-5 md:px-8 mt-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#101828] via-[#1a2538] to-[#0F766E] rounded-3xl shadow-2xl shadow-[#101828]/20"
            >
              <div className="absolute -right-40 -top-48 w-[600px] h-[600px] rounded-full bg-[#0F766E]/20 blur-3xl animate-pulse" />
              <div className="absolute right-[15%] bottom-[-220px] w-[450px] h-[450px] rounded-full bg-[#E87961]/10 blur-3xl animate-pulse delay-1000" />
              
              <div className="relative p-6 md:p-9">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">
                  <div className="flex items-start gap-5">
                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center overflow-hidden shrink-0 border border-white/10">
                      {application.company_logo ? (
                        <img src={application.company_logo} alt={application.company_name} className="w-full h-full object-cover" />
                      ) : (
                        <Building2 size={34} className="text-[#8FE2D1]" />
                      )}
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-medium text-[#8FE2D1]">
                        <CircleCheck size={14} />
                        Application Intelligence
                        <span className="px-2 py-0.5 text-[8px] bg-[#0F766E]/30 text-[#8FE2D1] rounded-full border border-[#0F766E]/30">AI-Powered</span>
                      </div>
                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-white mt-2">
                        {application.job_title || "Job Position"}
                      </h1>
                      <p className="text-base md:text-lg text-white/60 mt-2">{application.company_name || "Company"}</p>
                      <div className="flex flex-wrap items-center gap-3 mt-4 text-xs text-white/40">
                        <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                          <Calendar size={13} /> Applied {formatDate(application.created_at)}
                        </span>
                        {application.location && (
                          <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1.5 rounded-full border border-white/5">
                            <MapPin size={13} /> {application.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className={`inline-flex items-center gap-2 px-5 py-3 rounded-full border text-sm font-semibold backdrop-blur-sm ${status.bg} ${status.color} ${status.border}`}>
                      <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse" />
                      <StatusIcon size={16} />
                      {status.label}
                    </span>
                  </div>
                </div>

                {/* Hero Metrics */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">
                  <HeroMetric label="Application" value="Submitted" icon={<FileText size={16} />} />
                  <HeroMetric label="Resume" value={`${resumeScore}/100`} icon={<FileText size={16} />} />
                  <HeroMetric label="JD Match" value={`${jdMatchScore}/100`} icon={<Target size={16} />} />
                  <HeroMetric label="Overall Fit" value={`${overallScore}/100`} icon={<Sparkles size={16} />} />
                </div>
              </div>
            </motion.div>
          </section>

          {/* Content */}
          <div className="max-w-7xl mx-auto px-5 md:px-8 py-7">
            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_350px] gap-7">
              {/* Left Column */}
              <div className="space-y-6">
                {/* AI Summary */}
                <motion.section
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                  className="relative overflow-hidden bg-gradient-to-br from-[#EAF5F1] to-[#DDF5EF] border border-[#BFE5DB] rounded-3xl p-6 md:p-7"
                >
                  <div className="absolute right-[-80px] top-[-100px] w-72 h-72 rounded-full bg-[#0F766E]/10 blur-3xl" />
                  <div className="relative flex items-start gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0 shadow-lg">
                      <Sparkles size={22} className="text-[#0F766E]" />
                    </div>
                    <div>
                      <p className="text-[10px] uppercase tracking-[0.15em] font-bold text-[#0F766E]">Recruit_Ai Intelligence</p>
                      <h2 className="text-xl md:text-2xl font-bold text-[#101828] mt-1">{getScoreLabel(overallScore)}</h2>
                      <p className="text-sm text-[#667085] leading-6 mt-2 max-w-2xl">
                        Your application currently has an overall fit score of{" "}
                        <span className="font-bold text-[#0F766E]">{overallScore}/100</span>.
                        This combines your resume quality and compatibility with the selected role.
                      </p>
                    </div>
                  </div>
                </motion.section>

                {/* Score Overview */}
                <ContentSection title="Application Overview" icon={<BarChart3 size={18} />}>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <ScoreCard score={resumeScore} title="Resume Score" subtitle="Resume quality" />
                    <ScoreCard score={jdMatchScore} title="Job Match" subtitle="Role compatibility" />
                    <ScoreCard score={overallScore} title="Overall Fit" subtitle="Application strength" />
                  </div>
                </ContentSection>

                {/* Score Breakdown */}
                <ContentSection title="Recruit_Ai Analysis" icon={<TrendingUp size={18} />}>
                  <p className="text-sm text-[#667085] leading-6 mb-6">
                    Here is how your profile performs across the main application signals.
                  </p>
                  <ScoreBar title="Resume Quality" score={resumeScore} icon={<FileText size={15} />} />
                  <ScoreBar title="Job Compatibility" score={jdMatchScore} icon={<Target size={15} />} />
                  <ScoreBar title="Skill Alignment" score={skillMatch} icon={<Brain size={15} />} />
                  <ScoreBar title="Overall Application" score={overallScore} icon={<Award size={15} />} />
                </ContentSection>

                {/* Skills */}
                <ContentSection title="Skill Alignment" icon={<Layers3 size={18} />}>
                  <div className="grid grid-cols-3 gap-3 mb-6">
                    <MetricBox label="Matched" value={matchedSkills.length} type="success" />
                    <MetricBox label="Missing" value={missingSkills.length} type="danger" />
                    <MetricBox label="Match Rate" value={`${skillMatch}%`} type="neutral" />
                  </div>

                  {totalSkills > 0 && (
                    <div className="mb-7">
                      <div className="flex h-3 rounded-full overflow-hidden bg-[#EAECF0]">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${skillMatch}%` }} transition={{ duration: 1 }} className="bg-[#0F766E]" />
                        <motion.div initial={{ width: 0 }} animate={{ width: `${100 - skillMatch}%` }} transition={{ duration: 1 }} className="bg-[#DFA79A]" />
                      </div>
                      <div className="flex justify-between mt-2 text-[11px] text-[#98A2B3]">
                        <span>Matched skills</span>
                        <span>Skill gaps</span>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    <SkillGroup title="Matched Skills" description="Skills aligned with this role" skills={matchedSkills} success />
                    <SkillGroup title="Missing Skills" description="Skills worth strengthening" skills={missingSkills} />
                  </div>
                </ContentSection>

                {/* Application Journey */}
                <ContentSection title="Application Journey" icon={<Activity size={18} />}>
                  <p className="text-sm text-[#667085] mb-7">Follow your progress through the recruitment process.</p>
                  <div className="space-y-0">
                    {timeline.map((item, index) => {
                      const Icon = item.icon;
                      const isLast = index === timeline.length - 1;
                      return (
                        <div key={item.title} className="relative flex gap-4">
                          {!isLast && (
                            <div className={`absolute left-[19px] top-10 w-px h-[calc(100%-10px)] ${item.completed ? "bg-[#0F766E]" : "bg-[#EAECF0]"}`} />
                          )}
                          <div className={`relative z-10 w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-all duration-300 ${item.completed ? "bg-[#0F766E] text-white shadow-lg shadow-[#0F766E]/30" : "bg-[#F2F4F7] text-[#98A2B3]"}`}>
                            {item.completed ? <CheckCircle2 size={18} /> : <Icon size={18} />}
                          </div>
                          <div className="pb-7">
                            <p className={`text-sm font-semibold ${item.completed ? "text-[#344054]" : "text-[#98A2B3]"}`}>{item.title}</p>
                            <p className="text-xs text-[#98A2B3] mt-1 leading-5">{item.description}</p>
                            {item.date && (
                              <p className="text-[11px] text-[#667085] mt-2 flex items-center gap-1">
                                <Calendar size={11} /> {formatDate(item.date)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ContentSection>

                {/* Recruiter Feedback */}
                <ContentSection title="Recruiter Feedback" icon={<MessageSquare size={18} />}>
                  {application.recruiter_feedback ? (
                    <div className="bg-[#FCFCFA] border border-[#EAECF0] rounded-2xl p-5">
                      <div className="flex items-start gap-3">
                        <div className="w-9 h-9 rounded-xl bg-[#EAF5F1] flex items-center justify-center shrink-0">
                          <MessageSquare size={16} className="text-[#0F766E]" />
                        </div>
                        <p className="text-sm text-[#475467] leading-7">{application.recruiter_feedback}</p>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[#D0D5DD] rounded-2xl p-8 text-center">
                      <MessageSquare size={28} className="text-[#D0D5DD] mx-auto" />
                      <p className="text-sm font-medium text-[#667085] mt-3">No recruiter feedback yet</p>
                      <p className="text-xs text-[#98A2B3] mt-1">Feedback from the hiring team will appear here when available.</p>
                    </div>
                  )}
                </ContentSection>

                {/* Application Information */}
                <ContentSection title="Application Information" icon={<FileText size={18} />}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <InfoRow icon={<Building2 size={15} />} label="Company" value={application.company_name} />
                    <InfoRow icon={<Briefcase size={15} />} label="Position" value={application.job_title} />
                    <InfoRow icon={<Clock3 size={15} />} label="Status" value={application.application_status || "Pending"} />
                    <InfoRow icon={<CalendarDays size={15} />} label="Interview" value={application.interview_status || "Not Scheduled"} />
                    <InfoRow icon={<Calendar size={15} />} label="Applied" value={formatDate(application.created_at)} />
                    <InfoRow icon={<Activity size={15} />} label="Last Updated" value={formatDate(application.updated_at)} />
                  </div>
                </ContentSection>
              </div>

              {/* Right Sidebar */}
              <aside className="space-y-5">
                <div className="lg:sticky lg:top-6 space-y-5">
                  {/* Status Card */}
                  <motion.div
                    initial={{ opacity: 0, x: 15 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.15 }}
                    className="bg-white border border-[#101828]/10 rounded-3xl shadow-sm hover:shadow-lg transition-all duration-300 overflow-hidden"
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-[10px] uppercase tracking-[0.15em] text-[#98A2B3] font-bold">Current Status</p>
                          <h3 className="text-xl font-bold text-[#101828] mt-1">{status.label}</h3>
                        </div>
                        <div className={`w-11 h-11 rounded-xl ${status.bg} flex items-center justify-center`}>
                          <StatusIcon size={19} className={status.color} />
                        </div>
                      </div>

                      <div className="mt-6">
                        <div className="flex items-end gap-2">
                          <span className="text-5xl font-bold text-[#101828]">{overallScore}</span>
                          <span className="text-sm text-[#98A2B3] mb-2">/100</span>
                        </div>
                        <p className="text-xs text-[#667085] mt-1">Overall application fit</p>
                      </div>

                      <div className="mt-5 h-2.5 bg-[#EAECF0] rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${overallScore}%` }}
                          transition={{ duration: 1 }}
                          className="h-full bg-gradient-to-r from-[#0F766E] to-[#0A5C56] rounded-full"
                        />
                      </div>
                    </div>

                    <div className="px-6 py-4 bg-[#FCFCFA] border-t border-[#EAECF0]">
                      <div className="flex items-center gap-2">
                        <ShieldCheck size={15} className="text-[#0F766E]" />
                        <p className="text-[11px] text-[#667085]">Secure Recruit_Ai application</p>
                      </div>
                    </div>
                  </motion.div>

                  {/* Quick Scores */}
                  <div className="grid grid-cols-2 gap-3">
                    <QuickScore label="Resume" score={resumeScore} />
                    <QuickScore label="JD Match" score={jdMatchScore} />
                  </div>

                  {/* Interview Card */}
                  <div className="bg-white border border-[#101828]/10 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#EAF5F1] flex items-center justify-center">
                        <CalendarDays size={18} className="text-[#0F766E]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#98A2B3] font-medium">Interview</p>
                        <p className="text-sm font-semibold text-[#101828] mt-0.5">
                          {application.interview_status || "Not Scheduled"}
                        </p>
                      </div>
                    </div>
                    {application.interview_date && (
                      <div className="mt-5 bg-[#FCFCFA] border border-[#EAECF0] rounded-xl p-4">
                        <p className="text-[10px] uppercase tracking-wider text-[#98A2B3] font-semibold">Interview Date</p>
                        <p className="text-sm font-semibold text-[#344054] mt-1 flex items-center gap-2">
                          <Calendar size={14} className="text-[#0F766E]" /> {formatDate(application.interview_date)}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Company Summary */}
                  <div className="bg-white border border-[#101828]/10 rounded-2xl p-6 shadow-sm hover:shadow-lg transition-all duration-300">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-[#F2F4F7] flex items-center justify-center">
                        <Building2 size={18} className="text-[#667085]" />
                      </div>
                      <div>
                        <p className="text-xs text-[#98A2B3] font-medium">Hiring Company</p>
                        <p className="text-sm font-semibold text-[#101828] mt-0.5">
                          {application.company_name || "Company"}
                        </p>
                      </div>
                    </div>
                    <div className="mt-5 space-y-3">
                      <MiniInfo icon={<Briefcase size={14} />} text={application.job_title || "Position not specified"} />
                      <MiniInfo icon={<MapPin size={14} />} text={application.location || "Location not specified"} />
                      <MiniInfo icon={<GraduationCap size={14} />} text={application.experience_required || "Experience not specified"} />
                    </div>
                  </div>

                  {/* Next Step */}
                  <div className="relative overflow-hidden bg-gradient-to-br from-[#101828] via-[#1a2538] to-[#0F766E] rounded-2xl p-6 text-white shadow-2xl shadow-[#101828]/20">
                    <div className="absolute -right-16 -top-16 w-48 h-48 rounded-full bg-[#0F766E]/25 blur-2xl animate-pulse" />
                    <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-[#E87961]/10 blur-2xl animate-pulse delay-1000" />
                    
                    <div className="relative">
                      <div className="w-10 h-10 rounded-xl bg-[#0F766E]/20 flex items-center justify-center border border-[#0F766E]/30">
                        <Rocket size={18} className="text-[#8FE2D1]" />
                      </div>
                      <h3 className="font-bold mt-4">Recommended Next Step</h3>
                      <p className="text-xs text-white/60 leading-5 mt-2">
                        {application.application_status === "Rejected"
                          ? "Review your skill gaps and strengthen your resume before applying to similar roles."
                          : application.interview_status
                          ? "Prepare for your upcoming interview and review the job requirements."
                          : jdMatchScore >= 80
                          ? "Your profile is strongly aligned. Stay ready for the next recruitment stage."
                          : "Review your missing skills and strengthen your profile for similar opportunities."}
                      </p>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => navigate("/jobs")}
                        className="w-full mt-5 flex items-center justify-center gap-2 px-4 py-3 bg-white text-[#101828] hover:bg-[#EAF5F1] rounded-xl text-xs font-semibold transition-all shadow-lg"
                      >
                        Explore More Jobs
                        <ChevronRight size={15} />
                      </motion.button>
                    </div>
                  </div>

                  {/* Security Badge */}
                  <div className="flex items-start gap-3 bg-[#EAF5F1] border border-[#BFE5DB] rounded-2xl p-4">
                    <ShieldCheck size={18} className="text-[#0F766E] shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-semibold text-[#344054]">Secure Application</p>
                      <p className="text-[11px] text-[#667085] leading-5 mt-1">
                        Your application information is connected to your authenticated Recruit_Ai account.
                      </p>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>

          {/* Bottom CTA */}
          <section className="max-w-7xl mx-auto px-5 md:px-8 pb-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#EAF5F1] to-[#DDF5EF] border border-[#BFE5DB] rounded-3xl p-6 md:p-8"
            >
              <div className="absolute right-[-100px] top-[-120px] w-80 h-80 rounded-full bg-[#0F766E]/10 blur-3xl" />
              <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">
                <div>
                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0F766E]">
                    <Sparkles size={14} /> Career Intelligence
                  </div>
                  <h2 className="text-xl md:text-2xl font-bold text-[#101828] mt-2">Keep Building Your Career Profile</h2>
                  <p className="text-sm text-[#667085] mt-1">
                    Explore more opportunities and use Recruit_Ai intelligence to improve your next application.
                  </p>
                </div>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/jobs")}
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#101828] hover:bg-[#0F766E] text-white rounded-2xl font-semibold text-sm transition-all shadow-lg shadow-[#101828]/20 hover:shadow-[#0F766E]/30 shrink-0"
                >
                  Explore Jobs
                  <ArrowUpRight size={16} />
                </motion.button>
              </div>
            </motion.div>
          </section>

          {/* Footer */}
          <footer className="max-w-7xl mx-auto px-5 md:px-8 pb-8">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#98A2B3] border-t border-[#101828]/5 pt-6"
            >
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
                Recruit_Ai Application Intelligence
              </span>
              <span className="flex items-center gap-4">
                <span className="flex items-center gap-1.5">
                  <Globe2 size={12} className="text-[#0F766E]" /> Track
                </span>
                <span className="flex items-center gap-1.5">
                  <Brain size={12} className="text-[#0F766E]" /> Analyze
                </span>
                <span className="flex items-center gap-1.5">
                  <Rocket size={12} className="text-[#0F766E]" /> Improve
                </span>
              </span>
            </motion.div>
          </footer>
        </div>
      </main>
    </div>
  );
}

// =========================================================
// COMPONENTS
// =========================================================

function ContentSection({ title, icon, children }) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      className="bg-white border border-[#101828]/10 rounded-3xl p-6 md:p-7 shadow-sm hover:shadow-lg transition-all duration-300"
    >
      <div className="flex items-center gap-3 mb-5">
        <div className="w-9 h-9 rounded-xl bg-[#EAF5F1] flex items-center justify-center text-[#0F766E]">
          {icon}
        </div>
        <h2 className="text-lg font-bold text-[#101828]">{title}</h2>
      </div>
      {children}
    </motion.section>
  );
}

function ScoreCard({ score, title, subtitle }) {
  const radius = 38;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;

  return (
    <div className="bg-[#FCFCFA] border border-[#EAECF0] rounded-2xl p-5 hover:border-[#0F766E]/30 transition-all duration-300">
      <div className="flex items-center gap-5">
        <div className="relative w-24 h-24 shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r={radius} fill="none" stroke="#EAECF0" strokeWidth="8" />
            <motion.circle
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset: circumference - progress }}
              transition={{ duration: 1 }}
              cx="50" cy="50" r={radius} fill="none" stroke="#0F766E" strokeWidth="8"
              strokeLinecap="round" strokeDasharray={circumference}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-[#101828]">{score}</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-[#344054]">{title}</p>
          <p className="text-xs text-[#98A2B3] mt-1">{subtitle}</p>
          <p className={`text-xs font-semibold mt-3 ${score >= 80 ? "text-[#0F766E]" : score >= 60 ? "text-blue-600" : "text-amber-600"}`}>
            {score >= 80 ? "Strong" : score >= 60 ? "Good" : "Needs work"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ScoreBar({ title, score, icon }) {
  return (
    <div className="mb-5 last:mb-0">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#F7F5EF] flex items-center justify-center text-[#0F766E]">
            {icon}
          </div>
          <span className="text-xs font-semibold text-[#344054]">{title}</span>
        </div>
        <span className="text-xs font-bold text-[#101828]">{score}/100</span>
      </div>
      <div className="h-2.5 bg-[#EAECF0] rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          whileInView={{ width: `${score}%` }}
          viewport={{ once: true }}
          transition={{ duration: 0.9 }}
          className="h-full bg-gradient-to-r from-[#0F766E] to-[#0A5C56] rounded-full"
        />
      </div>
    </div>
  );
}

function MetricBox({ label, value, type }) {
  const styles = {
    success: "text-[#0F766E] bg-[#EAF5F1]",
    danger: "text-[#C95F4C] bg-[#FFF1EE]",
    neutral: "text-[#101828] bg-[#F7F5EF]",
  };
  return (
    <div className={`rounded-xl p-4 text-center border ${styles[type]} border-transparent`}>
      <p className="text-2xl font-bold">{value}</p>
      <p className="text-[10px] uppercase tracking-wider font-semibold mt-1 opacity-70">{label}</p>
    </div>
  );
}

function SkillGroup({ title, description, skills, success = false }) {
  return (
    <div className={`rounded-2xl p-5 border transition-all duration-300 ${
      success ? "bg-[#F3FBF8] border-[#BFE5DB] hover:border-[#0F766E]/50" : "bg-[#FFF8F6] border-[#F3D4CC] hover:border-[#C95F4C]/50"
    }`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-semibold text-[#344054]">{title}</p>
          <p className="text-[11px] text-[#98A2B3] mt-1">{description}</p>
        </div>
        <span className={`text-lg font-bold ${success ? "text-[#0F766E]" : "text-[#C95F4C]"}`}>{skills.length}</span>
      </div>
      {skills.length > 0 ? (
        <div className="flex flex-wrap gap-2 mt-5">
          {skills.map((skill, index) => (
            <span key={`${skill}-${index}`} className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
              success ? "bg-white border-[#BFE5DB] text-[#0F766E]" : "bg-white border-[#F3D4CC] text-[#C95F4C]"
            }`}>{skill}</span>
          ))}
        </div>
      ) : <p className="text-xs text-[#98A2B3] mt-5">No data available.</p>}
    </div>
  );
}

function QuickScore({ label, score }) {
  return (
    <div className="bg-white border border-[#101828]/10 rounded-2xl p-4 shadow-sm hover:shadow-lg transition-all duration-300">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-[#EAF5F1] flex items-center justify-center">
          <TrendingUp size={14} className="text-[#0F766E]" />
        </div>
        <span className="text-[10px] uppercase tracking-wider font-semibold text-[#98A2B3]">{label}</span>
      </div>
      <p className="text-2xl font-bold text-[#101828] mt-3">{score}<span className="text-xs text-[#98A2B3] font-medium">/100</span></p>
      <div className="h-1.5 bg-[#EAECF0] rounded-full mt-3 overflow-hidden">
        <motion.div initial={{ width: 0 }} animate={{ width: `${score}%` }} transition={{ duration: 0.8 }} className="h-full bg-gradient-to-r from-[#0F766E] to-[#0A5C56] rounded-full" />
      </div>
    </div>
  );
}

function HeroMetric({ label, value, icon }) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5 backdrop-blur-sm hover:bg-white/10 transition-all duration-300">
      <div className="flex items-center gap-2 text-[#8FE2D1]">
        {icon}
        <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40">{label}</span>
      </div>
      <p className="text-xs md:text-sm font-medium text-white/80 mt-2">{value}</p>
    </div>
  );
}

function InfoRow({ icon, label, value }) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-[#FCFCFA] border border-[#EAECF0] rounded-xl hover:border-[#0F766E]/30 transition-all duration-300">
      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0F766E] shrink-0">{icon}</div>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider font-semibold text-[#98A2B3]">{label}</p>
        <p className="text-sm font-medium text-[#344054] mt-0.5 truncate">{value || "Not available"}</p>
      </div>
    </div>
  );
}

function MiniInfo({ icon, text }) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-[#667085]">
      <span className="text-[#0F766E]">{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}

export default ApplicationDetails;