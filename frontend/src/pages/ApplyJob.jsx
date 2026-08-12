import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

import {
  Loader2,
  FileText,
  Briefcase,
  CheckCircle2,
  ArrowLeft,
  Building2,
  Calendar,
  MapPin,
  Clock3,
  GraduationCap,
  AlertCircle,
  Send,
  ShieldCheck,
  Sparkles,
  ChevronDown,
  Check,
  Target,
  Award,
  Brain,
  Zap,
  Users,
  Rocket,
  Star,
  Medal,
  Crown,
  Heart,
  Globe2,
  Lock,
} from "lucide-react";

import toast from "react-hot-toast";

import { getJob } from "../api/jobApi";
import { getUserResumes } from "../api/resumeApi";
import { applyJob, getApplicationsByStudent } from "../api/applicationApi";

function ApplyJob() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [job, setJob] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [selectedResume, setSelectedResume] = useState("");
  const [alreadyApplied, setAlreadyApplied] = useState(false);
  const [existingApplication, setExistingApplication] = useState(null);
  const [applicationSubmitted, setApplicationSubmitted] = useState(false);
  const [visibleResumeCount, setVisibleResumeCount] = useState(5);
  const [hoveredCard, setHoveredCard] = useState(null);

  useEffect(() => {
    if (!jobId) {
      toast.error("Job ID is missing.");
      navigate("/jobs");
      return;
    }
    loadData();
  }, [jobId]);

  const loadData = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        toast.error("Please login again.");
        navigate("/login");
        return;
      }

      const jobResponse = await getJob(jobId);
      const jobData = jobResponse?.job || jobResponse?.data || jobResponse;
      setJob(jobData);

      const resumeResponse = await getUserResumes(userId);
      const userResumes = resumeResponse?.resumes || resumeResponse?.data || [];
      setResumes(userResumes);

      if (userResumes.length > 0) {
        setSelectedResume(userResumes[0]._id);
      }

      const applicationResponse = await getApplicationsByStudent(userId);
      const applications = applicationResponse?.applications || 
                          applicationResponse?.data || 
                          applicationResponse || [];

      if (Array.isArray(applications)) {
        const existing = applications.find(
          (application) =>
            String(application.job_id || application.job?._id || application.job?.id) === String(jobId)
        );

        if (existing) {
          setAlreadyApplied(true);
          setExistingApplication(existing);
        }
      }
    } catch (error) {
      console.error("Apply Page Load Error:", error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to load application page."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (alreadyApplied) {
      toast.error("You have already applied for this job.");
      return;
    }

    if (!selectedResume) {
      toast.error("Please select a resume before applying.");
      return;
    }

    try {
      setSubmitting(true);
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        toast.error("Your session has expired. Please login again.");
        navigate("/login");
        return;
      }

      const payload = {
        student_id: userId,
        job_id: jobId,
        resume_id: selectedResume,
      };

      const response = await applyJob(payload);
      const newApplication = response?.application || response?.data || response;

      setExistingApplication(newApplication);
      setAlreadyApplied(true);
      setApplicationSubmitted(true);
      toast.success("Application submitted successfully!");
    } catch (error) {
      console.error("Application Error:", error);
      const message = error.response?.data?.detail || error.response?.data?.message || "";

      if (String(message).toLowerCase().includes("already")) {
        setAlreadyApplied(true);
        toast.error("You have already applied for this job.");
        return;
      }

      toast.error(message || "Unable to submit application.");
    } finally {
      setSubmitting(false);
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
          <h2 className="text-2xl font-bold text-[#101828]">Preparing Your Application</h2>
          <p className="text-[#667085] mt-2">Loading job and resume information...</p>
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
          <p className="text-[#667085] mt-2">This job may have been removed or is no longer available.</p>
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

  // Success Screen
  if (applicationSubmitted) {
    return (
      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center px-4 py-10">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-xl w-full"
        >
          <div className="relative overflow-hidden bg-white rounded-3xl border border-[#101828]/10 shadow-2xl p-8 md:p-10 text-center">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#0F766E]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
            
            <div className="relative">
              <div className="w-24 h-24 mx-auto rounded-full bg-[#EAF5F1] flex items-center justify-center mb-6">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 200, damping: 15 }}
                >
                  <CheckCircle2 size={52} className="text-[#0F766E]" />
                </motion.div>
              </div>

              <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#EAF5F1] text-[#0F766E] border border-[#BFE5DB] rounded-full text-sm font-semibold mb-4">
                <Check size={15} />
                Application Submitted
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-[#101828]">You're All Set!</h1>
              <p className="text-[#667085] mt-3 leading-7">
                Your application for{" "}
                <strong className="text-[#101828]">{job.title}</strong> at{" "}
                <strong className="text-[#101828]">{job.company_name || "the company"}</strong>{" "}
                has been submitted successfully.
              </p>

              <div className="bg-[#F7F5EF] rounded-2xl p-5 mt-7 text-left border border-[#101828]/5">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-2xl bg-[#EAF5F1] flex items-center justify-center">
                    <FileText size={22} className="text-[#0F766E]" />
                  </div>
                  <div>
                    <p className="text-xs text-[#98A2B3] font-semibold uppercase tracking-wider">Resume Used</p>
                    <p className="font-semibold text-[#101828]">
                      {resumes.find(r => r._id === selectedResume)?.file_name || "Selected Resume"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between border-t border-[#101828]/10 pt-4">
                  <span className="text-[#667085]">Application Status</span>
                  <span className="px-3 py-1.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-sm font-semibold">
                    {existingApplication?.application_status || existingApplication?.status || "Pending"}
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-7">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/my-applications")}
                  className="px-5 py-3.5 bg-[#101828] hover:bg-[#0F766E] text-white rounded-2xl font-semibold transition-all shadow-lg shadow-[#101828]/20"
                >
                  View My Applications
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/jobs")}
                  className="px-5 py-3.5 bg-[#F7F5EF] hover:bg-[#EAF5F1] text-[#101828] rounded-2xl font-semibold transition-all border border-[#101828]/10"
                >
                  Browse More Jobs
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    );
  }

  const selectedResumeData = resumes.find((resume) => resume._id === selectedResume);
  const applicationStatus = existingApplication?.application_status || 
                           existingApplication?.status || 
                           "Pending";
  const jobSkills = Array.isArray(job.skills) ? job.skills : [];
  const visibleResumes = resumes.slice(0, visibleResumeCount);

  return (
    <div className="min-h-screen bg-[#F7F5EF] relative overflow-hidden">
      {/* Background Decor */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-52 -right-52 w-[550px] h-[550px] bg-[#0F766E]/5 rounded-full blur-3xl" />
        <div className="absolute top-[45%] -left-52 w-[500px] h-[500px] bg-[#E87961]/5 rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-6xl mx-auto px-4 py-6 md:px-8 md:py-10">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          whileHover={{ x: -4 }}
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 text-[#667085] hover:text-[#0F766E] font-medium mb-7 transition-all group"
        >
          <ArrowLeft size={19} className="group-hover:-translate-x-1 transition-transform" />
          Back to Job
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#101828] text-white text-xs font-semibold mb-3 shadow-lg shadow-[#101828]/20">
            <Briefcase size={14} className="text-[#8FE2D1]" />
            JOB APPLICATION
          </div>
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-[-0.04em] text-[#101828]">
            Apply for this position
          </h1>
          <p className="text-[#667085] mt-2 max-w-2xl text-sm md:text-base">
            Review the position and choose the resume that best represents your skills and experience.
          </p>
        </motion.div>

        {/* Job Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm hover:shadow-lg transition-all duration-300 p-6 md:p-8 mb-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-start gap-5">
              <div className="w-16 h-16 rounded-2xl bg-[#EAF5F1] flex items-center justify-center flex-shrink-0">
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

              <div>
                <h2 className="text-2xl font-bold text-[#101828]">{job.title || "Untitled Job"}</h2>
                <p className="text-[#667085] mt-1">{job.company_name || "Company"}</p>

                <div className="flex flex-wrap gap-2 mt-4">
                  {job.location && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F5EF] rounded-xl text-sm text-[#667085] border border-[#101828]/5">
                      <MapPin size={14} className="text-[#0F766E]" />
                      {job.location}
                    </span>
                  )}
                  {job.employment_type && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F5EF] rounded-xl text-sm text-[#667085] border border-[#101828]/5">
                      <Briefcase size={14} className="text-[#0F766E]" />
                      {job.employment_type}
                    </span>
                  )}
                  {job.experience_required && (
                    <span className="flex items-center gap-1.5 px-3 py-1.5 bg-[#F7F5EF] rounded-xl text-sm text-[#667085] border border-[#101828]/5">
                      <GraduationCap size={14} className="text-[#0F766E]" />
                      {job.experience_required}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {alreadyApplied && (
              <div className="flex items-center gap-2 px-4 py-3 bg-[#EAF5F1] border border-[#BFE5DB] rounded-2xl text-[#0F766E] font-semibold">
                <CheckCircle2 size={20} />
                Already Applied
              </div>
            )}
          </div>

          {jobSkills.length > 0 && (
            <div className="border-t border-[#101828]/10 mt-6 pt-6">
              <p className="text-sm font-semibold text-[#344054] mb-3 flex items-center gap-2">
                <Target size={16} className="text-[#0F766E]" />
                Key Skills
              </p>
              <div className="flex flex-wrap gap-2">
                {jobSkills.slice(0, 10).map((skill, index) => (
                  <span
                    key={`${skill}-${index}`}
                    className="px-3 py-1.5 bg-[#EAF5F1] text-[#0F766E] border border-[#BFE5DB] rounded-xl text-sm font-medium"
                  >
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </motion.div>

        {/* Already Applied Alert */}
        {alreadyApplied && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-[#EAF5F1] border border-[#BFE5DB] rounded-2xl p-5 mb-6"
          >
            <div className="flex items-start gap-4">
              <CheckCircle2 className="text-[#0F766E] mt-0.5 flex-shrink-0" size={23} />
              <div>
                <h3 className="font-bold text-[#0F766E]">You have already applied for this job</h3>
                <p className="text-[#667085] text-sm mt-1">
                  Your application is currently <strong className="text-[#0F766E]">{applicationStatus}</strong>.
                  You cannot submit another application for the same position.
                </p>
              </div>
            </div>
          </motion.div>
        )}

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Resume Selection */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm hover:shadow-lg transition-all duration-300 p-6 md:p-8"
          >
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl md:text-2xl font-bold text-[#101828]">Choose your resume</h2>
                <p className="text-[#667085] text-sm mt-1">Select the resume you want recruiters to review.</p>
              </div>
              <div className="hidden sm:flex items-center gap-2 px-3 py-2 bg-[#EAF5F1] text-[#0F766E] rounded-xl text-sm font-semibold border border-[#BFE5DB]">
                <FileText size={16} />
                {resumes.length} Resume{resumes.length !== 1 ? "s" : ""}
              </div>
            </div>

            {/* No Resume */}
            {resumes.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="border-2 border-dashed border-[#D0D5DD] rounded-2xl p-8 text-center"
              >
                <div className="w-14 h-14 bg-[#F7F5EF] rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <FileText size={27} className="text-[#98A2B3]" />
                </div>
                <h3 className="font-bold text-[#101828]">No resumes available</h3>
                <p className="text-[#667085] text-sm mt-2">Upload a resume before applying for this position.</p>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => navigate("/resume-upload")}
                  className="mt-5 px-5 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-2xl font-semibold transition-all shadow-lg shadow-[#101828]/20"
                >
                  Upload Resume
                </motion.button>
              </motion.div>
            ) : (
              <>
                <div className="space-y-3">
                  {visibleResumes.map((resume, index) => {
                    const selected = selectedResume === resume._id;
                    const score = resume.analysis?.resume_score ?? resume.resume_score;

                    return (
                      <motion.button
                        key={resume._id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.05 }}
                        whileHover={!alreadyApplied ? { x: 4 } : {}}
                        onHoverStart={() => setHoveredCard(resume._id)}
                        onHoverEnd={() => setHoveredCard(null)}
                        type="button"
                        disabled={alreadyApplied}
                        onClick={() => setSelectedResume(resume._id)}
                        className={`w-full text-left rounded-2xl border-2 p-4 md:p-5 transition-all duration-300 ${
                          selected
                            ? "border-[#0F766E] bg-[#EAF5F1] shadow-lg shadow-[#0F766E]/10 ring-2 ring-[#0F766E]/20"
                            : "border-[#D0D5DD] hover:border-[#0F766E]/50 hover:bg-[#F7F5EF]"
                        } ${alreadyApplied ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              selected ? "bg-[#0F766E] text-white" : "bg-[#F7F5EF] text-[#667085]"
                            }`}
                          >
                            <FileText size={23} />
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-2">
                              <h3 className={`font-bold truncate transition-colors ${
                                selected ? "text-[#0F766E]" : "text-[#101828]"
                              }`}>
                                {resume.file_name || "Resume"}
                              </h3>
                              {score !== undefined && (
                                <span className="px-2 py-1 bg-[#EAF5F1] text-[#0F766E] rounded-md text-xs font-bold border border-[#BFE5DB]">
                                  {score}% Score
                                </span>
                              )}
                            </div>
                            <div className="flex flex-wrap gap-4 mt-2 text-xs text-[#667085]">
                              {resume.created_at && (
                                <span className="flex items-center gap-1">
                                  <Calendar size={13} className="text-[#98A2B3]" />
                                  {new Date(resume.created_at).toLocaleDateString("en-IN")}
                                </span>
                              )}
                              {resume.file_size && (
                                <span>{(resume.file_size / 1024).toFixed(1)} KB</span>
                              )}
                            </div>
                          </div>

                          <div
                            className={`w-7 h-7 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                              selected
                                ? "border-[#0F766E] bg-[#0F766E] shadow-lg shadow-[#0F766E]/30"
                                : "border-[#D0D5DD] bg-white"
                            }`}
                          >
                            {selected && <Check size={16} className="text-white" />}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>

                {visibleResumeCount < resumes.length && (
                  <motion.button
                    whileHover={{ scale: 1.01 }}
                    whileTap={{ scale: 0.98 }}
                    type="button"
                    onClick={() => setVisibleResumeCount((prev) => prev + 5)}
                    className="w-full mt-4 py-3 border border-[#D0D5DD] hover:border-[#0F766E] hover:text-[#0F766E] rounded-2xl text-[#667085] font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <ChevronDown size={18} />
                    Show More Resumes
                  </motion.button>
                )}

                <p className="text-center text-xs text-[#98A2B3] mt-4">
                  Showing {Math.min(visibleResumeCount, resumes.length)} of {resumes.length} resumes
                </p>
              </>
            )}
          </motion.div>

          {/* Application Summary */}
          <div className="space-y-5">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm hover:shadow-lg transition-all duration-300 p-6"
            >
              <h3 className="font-bold text-[#101828] flex items-center gap-2">
                <Award size={18} className="text-[#0F766E]" />
                Application Summary
              </h3>

              <div className="mt-5 space-y-4">
                <SummaryItem
                  icon={<Briefcase size={17} />}
                  label="Position"
                  value={job.title || "Job Position"}
                />
                <SummaryItem
                  icon={<Building2 size={17} />}
                  label="Company"
                  value={job.company_name || "Company"}
                />
                <SummaryItem
                  icon={<FileText size={17} />}
                  label="Resume"
                  value={selectedResumeData?.file_name || "Select a resume"}
                />
                <SummaryItem
                  icon={<Clock3 size={17} />}
                  label="Status"
                  value={alreadyApplied ? applicationStatus : "Ready to apply"}
                  highlight={alreadyApplied}
                />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.5 }}
              className="relative overflow-hidden bg-gradient-to-br from-[#101828] via-[#1a2538] to-[#0F766E] rounded-3xl p-6 shadow-2xl shadow-[#101828]/20"
            >
              <div className="absolute -right-20 -top-20 w-48 h-48 bg-[#0F766E]/20 rounded-full blur-3xl animate-pulse" />
              
              <div className="relative">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/10">
                    <ShieldCheck size={20} className="text-[#8FE2D1]" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white">Safe & Transparent</h3>
                    <p className="text-xs text-white/50">Your application is protected</p>
                  </div>
                </div>

                <div className="space-y-3 text-sm text-white/70">
                  <div className="flex gap-2 items-start">
                    <Check size={16} className="text-[#8FE2D1] mt-0.5 flex-shrink-0" />
                    <span>Your selected resume will be shared with the recruiter.</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Check size={16} className="text-[#8FE2D1] mt-0.5 flex-shrink-0" />
                    <span>You can track your application status from My Applications.</span>
                  </div>
                  <div className="flex gap-2 items-start">
                    <Check size={16} className="text-[#8FE2D1] mt-0.5 flex-shrink-0" />
                    <span>You cannot submit multiple applications for the same job.</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Submit Bar */}
        {resumes.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="sticky bottom-4 mt-7"
          >
            <div className="bg-white/95 backdrop-blur-xl border border-[#101828]/10 shadow-2xl rounded-2xl p-4 md:p-5">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <p className="text-xs text-[#98A2B3] font-semibold uppercase tracking-wider">Selected resume</p>
                  <p className="font-semibold text-[#101828] truncate max-w-[300px]">
                    {selectedResumeData?.file_name || "No resume selected"}
                  </p>
                </div>

                {alreadyApplied ? (
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate("/my-applications")}
                    className="w-full md:w-auto px-7 py-3.5 bg-[#EAF5F1] text-[#0F766E] border border-[#BFE5DB] rounded-2xl font-bold flex items-center justify-center gap-2 transition-all"
                  >
                    <CheckCircle2 size={20} />
                    Already Applied
                  </motion.button>
                ) : (
                  <motion.button
                    whileHover={!submitting && selectedResume ? { scale: 1.02 } : {}}
                    whileTap={!submitting && selectedResume ? { scale: 0.98 } : {}}
                    onClick={handleApply}
                    disabled={submitting || !selectedResume}
                    className="relative w-full md:w-auto px-8 py-3.5 bg-[#101828] hover:bg-[#0F766E] disabled:bg-[#D0D5DD] disabled:cursor-not-allowed text-white rounded-2xl font-bold flex items-center justify-center gap-3 transition-all duration-300 shadow-lg shadow-[#101828]/20 hover:shadow-[#0F766E]/30 overflow-hidden group"
                  >
                    {!submitting && !alreadyApplied && (
                      <div className="absolute inset-0 bg-gradient-to-r from-[#0F766E] to-[#0A5C56] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    )}
                    <span className="relative z-10 flex items-center gap-3">
                      {submitting ? (
                        <>
                          <Loader2 size={20} className="animate-spin" />
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          <Send size={20} />
                          Submit Application
                          <Rocket size={16} className="group-hover:translate-x-1 -translate-y-1 transition-transform" />
                        </>
                      )}
                    </span>
                  </motion.button>
                )}
              </div>
            </div>
          </motion.div>
        )}

        {/* Footer */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-3 py-4 text-xs text-[#98A2B3] border-t border-[#101828]/5"
        >
          <span className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#0F766E]" />
            Recruit_Ai Application Portal
          </span>
          <span className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <Globe2 size={12} className="text-[#0F766E]" />
              Secure Platform
            </span>
            <span className="flex items-center gap-1.5">
              <Lock size={12} className="text-[#0F766E]" />
              Encrypted Data
            </span>
            <span className="flex items-center gap-1.5">
              <Brain size={12} className="text-[#0F766E]" />
              AI-Powered
            </span>
          </span>
        </motion.div>
      </div>
    </div>
  );
}

// Summary Item Component
function SummaryItem({ icon, label, value, highlight }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#F7F5EF] flex items-center justify-center text-[#667085] flex-shrink-0">
        {icon}
      </div>
      <div className="min-w-0">
        <p className="text-xs text-[#98A2B3] font-medium uppercase tracking-wider">{label}</p>
        <p className={`text-sm font-semibold mt-0.5 break-words ${highlight ? "text-[#0F766E]" : "text-[#101828]"}`}>
          {value}
        </p>
      </div>
    </div>
  );
}

export default ApplyJob;