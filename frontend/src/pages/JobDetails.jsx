import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Loader2,
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  IndianRupee,
  GraduationCap,
  Clock3,
  CheckCircle2,
  FileText,
  Send,
  AlertCircle,
  Sparkles,
  Target,
  CalendarDays,
  Globe2,
  Users,
  Code2,
  Bookmark,
  Share2,
  ChevronRight,
  ShieldCheck,
  Zap,
  CircleCheck,
  ExternalLink,
  Layers3,
} from "lucide-react";

import toast from "react-hot-toast";

import { getJob } from "../api/jobApi";
import Sidebar from "../components/Sidebar";

function JobDetails() {
  const { jobId } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  // =====================================================
  // FETCH JOB
  // =====================================================

  useEffect(() => {
    if (jobId) {
      fetchJob();
    }
  }, [jobId]);

  const fetchJob = async () => {
    try {
      setLoading(true);

      const response = await getJob(jobId);

      console.log(
        "Job Details Response:",
        response
      );

      const jobData =
        response?.job ||
        response?.data ||
        response;

      setJob(jobData);
    } catch (error) {
      console.error(
        "Job Details Error:",
        error
      );

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to load job."
      );

      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  // =====================================================
  // JOB ID
  // =====================================================

  const jobIdValue =
    job?._id ||
    job?.job_id ||
    jobId;

  // =====================================================
  // APPLY
  // =====================================================

  const handleApply = () => {
    if (!jobIdValue) {
      toast.error("Job ID not found.");
      return;
    }

    navigate(
      `/apply-job/${jobIdValue}`
    );
  };

  // =====================================================
  // JD MATCH
  // =====================================================

  const handleJDMatch = () => {
    if (!jobIdValue) {
      toast.error("Job ID not found.");
      return;
    }

    navigate(
      `/jd-match/${jobIdValue}`
    );
  };

  // =====================================================
  // SAVE
  // =====================================================

  const handleSave = () => {
    setSaved((previous) => !previous);

    toast.success(
      saved
        ? "Job removed from saved jobs."
        : "Job saved successfully."
    );
  };

  // =====================================================
  // SHARE
  // =====================================================

  const handleShare = async () => {
    try {
      if (
        navigator.clipboard
      ) {
        await navigator.clipboard.writeText(
          window.location.href
        );

        setCopied(true);

        toast.success(
          "Job link copied."
        );

        setTimeout(() => {
          setCopied(false);
        }, 2000);

        return;
      }

      toast.info(
        "Copy this page URL to share the job."
      );
    } catch (error) {
      console.error(error);

      toast.error(
        "Unable to share job."
      );
    }
  };

  // =====================================================
  // SAFE DATA
  // =====================================================

  const jobSkills = useMemo(
    () =>
      Array.isArray(job?.skills)
        ? job.skills
        : [],
    [job]
  );

  const jobRequirements = useMemo(
    () =>
      Array.isArray(
        job?.requirements
      )
        ? job.requirements
        : [],
    [job]
  );

  // =====================================================
  // DATE
  // =====================================================

  const postedDate = job?.created_at
    ? new Date(
        job.created_at
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      )
    : "Recently";

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F7F5EF]">

        <Sidebar />

        <main className="flex-1 flex items-center justify-center p-6">

          <div className="text-center">

            <div className="w-16 h-16 rounded-2xl bg-[#EAF5F1] flex items-center justify-center mx-auto">

              <Loader2
                className="w-8 h-8 text-[#0F766E] animate-spin"
              />

            </div>

            <h2 className="text-xl font-semibold text-[#101828] mt-5">

              Loading opportunity

            </h2>

            <p className="text-sm text-[#667085] mt-2">

              Preparing the job details for you...

            </p>

          </div>

        </main>

      </div>
    );
  }

  // =====================================================
  // NOT FOUND
  // =====================================================

  if (!job) {
    return (
      <div className="flex min-h-screen bg-[#F7F5EF]">

        <Sidebar />

        <main className="flex-1 flex items-center justify-center p-6">

          <div className="w-full max-w-md bg-white rounded-3xl border border-[#101828]/10 shadow-sm p-10 text-center">

            <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mx-auto">

              <AlertCircle
                size={30}
                className="text-red-500"
              />

            </div>

            <h2 className="text-2xl font-semibold text-[#101828] mt-5">

              Opportunity unavailable

            </h2>

            <p className="text-sm text-[#667085] mt-2 leading-6">

              This job may have been removed,
              closed, or is no longer available.

            </p>

            <button
              onClick={() =>
                navigate("/jobs")
              }
              className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-xl text-sm font-semibold transition"
            >

              <ArrowLeft size={16} />

              Browse Available Jobs

            </button>

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

      <main className="flex-1 min-w-0">

        {/* =================================================
            BACKGROUND
        ================================================= */}

        <div className="fixed inset-0 pointer-events-none overflow-hidden">

          <div className="absolute -top-60 right-0 w-[600px] h-[600px] rounded-full bg-[#DDF5EF]/50 blur-3xl" />

          <div className="absolute bottom-0 -left-60 w-[500px] h-[500px] rounded-full bg-blue-100/30 blur-3xl" />

        </div>

        <div className="relative">

          {/* =================================================
              TOP NAV
          ================================================= */}

          <div className="max-w-7xl mx-auto px-5 md:px-8 pt-5">

            <div className="flex items-center justify-between">

              <button
                onClick={() =>
                  navigate(-1)
                }
                className="inline-flex items-center gap-2 text-sm font-semibold text-[#667085] hover:text-[#0F766E] transition"
              >

                <ArrowLeft
                  size={17}
                />

                Back to jobs

              </button>

              <div className="flex items-center gap-2">

                <button
                  onClick={handleShare}
                  className="w-9 h-9 rounded-xl bg-white border border-[#101828]/10 flex items-center justify-center text-[#667085] hover:text-[#0F766E] transition"
                  title="Share job"
                >

                  {copied ? (
                    <CheckCircle2
                      size={16}
                    />
                  ) : (
                    <Share2
                      size={16}
                    />
                  )}

                </button>

                <button
                  onClick={handleSave}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition ${
                    saved
                      ? "bg-[#EAF5F1] border-[#BFE5DB] text-[#0F766E]"
                      : "bg-white border-[#101828]/10 text-[#667085] hover:text-[#0F766E]"
                  }`}
                  title="Save job"
                >

                  <Bookmark
                    size={16}
                    fill={
                      saved
                        ? "currentColor"
                        : "none"
                    }
                  />

                </button>

              </div>

            </div>

          </div>

          {/* =================================================
              HERO
          ================================================= */}

          <section className="max-w-7xl mx-auto px-5 md:px-8 mt-5">

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
                duration: 0.45,
              }}
              className="relative overflow-hidden bg-[#101828] rounded-3xl"
            >

              {/* Decorative */}

              <div className="absolute -right-32 -top-40 w-[500px] h-[500px] rounded-full bg-[#0F766E]/20 blur-3xl" />

              <div className="absolute right-40 bottom-[-180px] w-[400px] h-[400px] rounded-full bg-blue-500/10 blur-3xl" />

              <div className="relative p-6 md:p-9">

                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-8">

                  {/* COMPANY */}

                  <div className="flex items-start gap-5">

                    <div className="w-16 h-16 md:w-20 md:h-20 rounded-2xl bg-white flex items-center justify-center overflow-hidden shrink-0 shadow-lg">

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
                          size={34}
                          className="text-[#0F766E]"
                        />

                      )}

                    </div>

                    <div>

                      <div className="inline-flex items-center gap-2 text-xs font-medium text-[#8FE2D1]">

                        <CheckCircle2
                          size={14}
                        />

                        Verified opportunity

                      </div>

                      <h1 className="text-3xl md:text-4xl lg:text-5xl font-semibold tracking-[-0.045em] text-white mt-2">

                        {job.title ||
                          "Untitled Position"}

                      </h1>

                      <p className="text-base md:text-lg text-white/60 mt-2">

                        {job.company_name ||
                          "Company"}

                      </p>

                      {job.department && (
                        <p className="text-xs text-white/40 mt-2">

                          {job.department}

                        </p>
                      )}

                    </div>

                  </div>

                  {/* POSTED */}

                  <div className="lg:text-right">

                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/30 font-semibold">

                      Posted

                    </p>

                    <p className="text-sm text-white/70 mt-1">

                      {postedDate}

                    </p>

                    <div className="inline-flex items-center gap-1.5 mt-3 px-3 py-1.5 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">

                      <CircleCheck
                        size={13}
                        className="text-[#8FE2D1]"
                      />

                      Open for applications

                    </div>

                  </div>

                </div>

                {/* HERO META */}

                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-8">

                  <HeroMeta
                    icon={
                      <MapPin
                        size={16}
                      />
                    }
                    label="Location"
                    value={
                      job.location ||
                      "Not specified"
                    }
                  />

                  <HeroMeta
                    icon={
                      <Briefcase
                        size={16}
                      />
                    }
                    label="Employment"
                    value={
                      job.employment_type ||
                      "Full Time"
                    }
                  />

                  <HeroMeta
                    icon={
                      <GraduationCap
                        size={16}
                      />
                    }
                    label="Experience"
                    value={
                      job.experience_required ||
                      "Not specified"
                    }
                  />

                  <HeroMeta
                    icon={
                      <IndianRupee
                        size={16}
                      />
                    }
                    label="Salary"
                    value={
                      job.salary ||
                      "Not disclosed"
                    }
                  />

                </div>

              </div>

            </motion.div>

          </section>

          {/* =================================================
              MAIN CONTENT
          ================================================= */}

          <div className="max-w-7xl mx-auto px-5 md:px-8 py-7">

            <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_350px] gap-7">

              {/* =================================================
                  LEFT CONTENT
              ================================================= */}

              <div className="space-y-6">

                {/* AI MATCH */}

                <motion.section
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    delay: 0.1,
                  }}
                  className="relative overflow-hidden bg-[#EAF5F1] border border-[#BFE5DB] rounded-3xl p-6 md:p-7"
                >

                  <div className="absolute right-[-70px] top-[-100px] w-64 h-64 rounded-full bg-[#0F766E]/10 blur-3xl" />

                  <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">

                    <div className="flex items-start gap-4">

                      <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0">

                        <Sparkles
                          size={21}
                          className="text-[#0F766E]"
                        />

                      </div>

                      <div>

                        <div className="flex items-center gap-2">

                          <span className="text-[10px] uppercase tracking-[0.14em] font-bold text-[#0F766E]">

                            Recruit_Ai Intelligence

                          </span>

                        </div>

                        <h2 className="text-lg font-semibold text-[#101828] mt-1">

                          How well does this role fit you?

                        </h2>

                        <p className="text-sm text-[#667085] leading-6 mt-1 max-w-xl">

                          Compare this opportunity against
                          your analyzed resume, skills,
                          experience and education.

                        </p>

                      </div>

                    </div>

                    <button
                      onClick={
                        handleJDMatch
                      }
                      className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-xl text-sm font-semibold transition shrink-0"
                    >

                      <Target
                        size={16}
                      />

                      Check My Match

                      <ChevronRight
                        size={15}
                      />

                    </button>

                  </div>

                </motion.section>

                {/* JOB DESCRIPTION */}

                <ContentSection
                  title="About the role"
                  icon={
                    <FileText
                      size={18}
                    />
                  }
                >

                  <p className="text-sm md:text-[15px] text-[#475467] leading-7 whitespace-pre-line">

                    {job.description ||
                      "No job description has been provided for this opportunity."}

                  </p>

                </ContentSection>

                {/* SKILLS */}

                <ContentSection
                  title="Skills you'll work with"
                  icon={
                    <Code2
                      size={18}
                    />
                  }
                >

                  {jobSkills.length === 0 ? (

                    <EmptyContent text="No specific skills were listed for this role." />

                  ) : (

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                      {jobSkills.map(
                        (
                          skill,
                          index
                        ) => (

                          <motion.div
                            key={`${skill}-${index}`}
                            whileHover={{
                              y: -2,
                            }}
                            className="flex items-center gap-3 p-3.5 bg-[#FCFCFA] border border-[#EAECF0] rounded-xl"
                          >

                            <div className="w-8 h-8 rounded-lg bg-[#EAF5F1] flex items-center justify-center shrink-0">

                              <CheckCircle2
                                size={15}
                                className="text-[#0F766E]"
                              />

                            </div>

                            <span className="text-sm font-medium text-[#344054]">

                              {skill}

                            </span>

                          </motion.div>

                        )
                      )}

                    </div>

                  )}

                </ContentSection>

                {/* REQUIREMENTS */}

                <ContentSection
                  title="What we're looking for"
                  icon={
                    <Target
                      size={18}
                    />
                  }
                >

                  {jobRequirements.length ===
                  0 ? (

                    <EmptyContent text="No additional requirements were specified." />

                  ) : (

                    <div className="space-y-3">

                      {jobRequirements.map(
                        (
                          requirement,
                          index
                        ) => (

                          <div
                            key={`${requirement}-${index}`}
                            className="flex items-start gap-3"
                          >

                            <div className="w-7 h-7 rounded-lg bg-[#EAF5F1] flex items-center justify-center shrink-0 mt-0.5">

                              <CheckCircle2
                                size={15}
                                className="text-[#0F766E]"
                              />

                            </div>

                            <p className="text-sm text-[#475467] leading-6">

                              {requirement}

                            </p>

                          </div>

                        )
                      )}

                    </div>

                  )}

                </ContentSection>

                {/* ROLE DETAILS */}

                <ContentSection
                  title="Role details"
                  icon={
                    <Layers3
                      size={18}
                    />
                  }
                >

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                    <DetailRow
                      icon={
                        <MapPin
                          size={16}
                        />
                      }
                      label="Location"
                      value={
                        job.location
                      }
                    />

                    <DetailRow
                      icon={
                        <Briefcase
                          size={16}
                        />
                      }
                      label="Employment type"
                      value={
                        job.employment_type
                      }
                    />

                    <DetailRow
                      icon={
                        <GraduationCap
                          size={16}
                        />
                      }
                      label="Experience"
                      value={
                        job.experience_required
                      }
                    />

                    <DetailRow
                      icon={
                        <IndianRupee
                          size={16}
                        />
                      }
                      label="Compensation"
                      value={
                        job.salary
                      }
                    />

                    <DetailRow
                      icon={
                        <Building2
                          size={16}
                        />
                      }
                      label="Industry"
                      value={
                        job.industry
                      }
                    />

                    <DetailRow
                      icon={
                        <CalendarDays
                          size={16}
                        />
                      }
                      label="Posted"
                      value={
                        postedDate
                      }
                    />

                  </div>

                </ContentSection>

              </div>

              {/* =================================================
                  RIGHT SIDEBAR
              ================================================= */}

              <aside className="space-y-5">

                {/* APPLY CARD */}

                <motion.div
                  initial={{
                    opacity: 0,
                    x: 15,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    delay: 0.15,
                  }}
                  className="lg:sticky lg:top-6"
                >

                  <div className="bg-white border border-[#101828]/10 rounded-3xl shadow-sm overflow-hidden">

                    <div className="p-6">

                      <div className="flex items-center gap-2">

                        <div className="w-9 h-9 rounded-xl bg-[#EAF5F1] flex items-center justify-center">

                          <Zap
                            size={17}
                            className="text-[#0F766E]"
                          />

                        </div>

                        <div>

                          <p className="text-xs font-semibold text-[#101828]">

                            Ready to apply?

                          </p>

                          <p className="text-[11px] text-[#98A2B3]">

                            Take the next step

                          </p>

                        </div>

                      </div>

                      <button
                        onClick={
                          handleApply
                        }
                        className="w-full mt-6 flex items-center justify-center gap-2 px-5 py-3.5 bg-[#101828] hover:bg-[#0F766E] text-white rounded-xl font-semibold text-sm transition"
                      >

                        <Send
                          size={17}
                        />

                        Apply Now

                        <ChevronRight
                          size={16}
                        />

                      </button>

                      <button
                        onClick={
                          handleJDMatch
                        }
                        className="w-full mt-3 flex items-center justify-center gap-2 px-5 py-3.5 bg-[#EAF5F1] hover:bg-[#DDF5EF] text-[#0F766E] rounded-xl font-semibold text-sm transition"
                      >

                        <Target
                          size={17}
                        />

                        Check Resume Match

                      </button>

                      <div className="flex items-center justify-center gap-2 mt-5 text-[11px] text-[#98A2B3]">

                        <ShieldCheck
                          size={14}
                          className="text-[#0F766E]"
                        />

                        Secure Recruit_Ai application

                      </div>

                    </div>

                    {/* CARD FOOTER */}

                    <div className="px-6 py-4 bg-[#FCFCFA] border-t border-[#EAECF0]">

                      <div className="flex items-center justify-between text-xs">

                        <span className="text-[#98A2B3]">

                          Application status

                        </span>

                        <span className="inline-flex items-center gap-1.5 font-semibold text-[#0F766E]">

                          <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />

                          Open

                        </span>

                      </div>

                    </div>

                  </div>

                </motion.div>

                {/* COMPANY CARD */}

                <div className="bg-white border border-[#101828]/10 rounded-2xl p-6">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-xl bg-[#F2F4F7] flex items-center justify-center overflow-hidden">

                      {job.company_logo ? (

                        <img
                          src={
                            job.company_logo
                          }
                          alt=""
                          className="w-full h-full object-cover"
                        />

                      ) : (

                        <Building2
                          size={20}
                          className="text-[#667085]"
                        />

                      )}

                    </div>

                    <div>

                      <p className="text-xs text-[#98A2B3]">

                        Hiring company

                      </p>

                      <p className="text-sm font-semibold text-[#101828] mt-0.5">

                        {job.company_name ||
                          "Company"}

                      </p>

                    </div>

                  </div>

                  <div className="mt-5 space-y-3">

                    <MiniInfo
                      icon={
                        <Globe2
                          size={14}
                        />
                      }
                      text={
                        job.industry ||
                        "Industry not specified"
                      }
                    />

                    <MiniInfo
                      icon={
                        <Users
                          size={14}
                        />
                      }
                      text="Recruit_Ai opportunity"
                    />

                    <MiniInfo
                      icon={
                        <MapPin
                          size={14}
                        />
                      }
                      text={
                        job.location ||
                        "Location not specified"
                      }
                    />

                  </div>

                </div>

                {/* APPLICATION FLOW */}

                <div className="bg-[#101828] rounded-2xl p-6 text-white overflow-hidden relative">

                  <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-[#0F766E]/20 blur-2xl" />

                  <div className="relative">

                    <div className="w-9 h-9 rounded-xl bg-[#0F766E]/20 flex items-center justify-center">

                      <Sparkles
                        size={17}
                        className="text-[#8FE2D1]"
                      />

                    </div>

                    <h3 className="font-semibold mt-4">

                      Your Recruit_Ai flow

                    </h3>

                    <div className="mt-5 space-y-4">

                      <FlowStep
                        number="01"
                        title="Check your match"
                        description="Compare your resume with the role."
                        active
                      />

                      <FlowStep
                        number="02"
                        title="Review your resume"
                        description="Choose the strongest version."
                      />

                      <FlowStep
                        number="03"
                        title="Submit application"
                        description="Apply directly through Recruit_Ai."
                      />

                    </div>

                  </div>

                </div>

                {/* SAFETY */}

                <div className="flex items-start gap-3 bg-[#EAF5F1] border border-[#BFE5DB] rounded-2xl p-4">

                  <ShieldCheck
                    size={18}
                    className="text-[#0F766E] shrink-0 mt-0.5"
                  />

                  <div>

                    <p className="text-xs font-semibold text-[#344054]">

                      Apply with confidence

                    </p>

                    <p className="text-[11px] text-[#667085] leading-5 mt-1">

                      Recruit_Ai keeps your application
                      workflow organized and connected to
                      your resume intelligence.

                    </p>

                  </div>

                </div>

              </aside>

            </div>

          </div>

          {/* =================================================
              BOTTOM CTA
          ================================================= */}

          <section className="max-w-7xl mx-auto px-5 md:px-8 pb-8">

            <div className="bg-[#EAF5F1] border border-[#BFE5DB] rounded-3xl p-6 md:p-8">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

                <div>

                  <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#0F766E]">

                    <Sparkles
                      size={14}
                    />

                    Career intelligence

                  </div>

                  <h2 className="text-xl md:text-2xl font-semibold text-[#101828] mt-2">

                    Not sure if this role is right for you?

                  </h2>

                  <p className="text-sm text-[#667085] mt-1">

                    Run an AI-powered resume match before
                    submitting your application.

                  </p>

                </div>

                <button
                  onClick={
                    handleJDMatch
                  }
                  className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-[#101828] hover:bg-[#0F766E] text-white rounded-xl font-semibold text-sm transition shrink-0"
                >

                  <Target
                    size={17}
                  />

                  Analyze My Match

                  <ArrowRightIcon />

                </button>

              </div>

            </div>

          </section>

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="max-w-7xl mx-auto px-5 md:px-8 pb-8">

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[#98A2B3]">

              <span>

                Recruit_Ai Job Intelligence

              </span>

              <span className="flex items-center gap-2">

                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />

                Discover • Match • Apply

              </span>

            </div>

          </footer>

        </div>

      </main>

    </div>
  );
}

// =========================================================
// HERO META
// =========================================================

function HeroMeta({
  icon,
  label,
  value,
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">

      <div className="flex items-center gap-2 text-[#8FE2D1]">

        {icon}

        <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40">

          {label}

        </span>

      </div>

      <p className="text-xs md:text-sm font-medium text-white/80 mt-2 truncate">

        {value || "Not specified"}

      </p>

    </div>
  );
}

// =========================================================
// CONTENT SECTION
// =========================================================

function ContentSection({
  title,
  icon,
  children,
}) {
  return (
    <motion.section
      initial={{
        opacity: 0,
        y: 10,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: "-50px",
      }}
      className="bg-white border border-[#101828]/10 rounded-2xl p-6 md:p-7 shadow-sm"
    >

      <div className="flex items-center gap-3 mb-5">

        <div className="w-9 h-9 rounded-xl bg-[#EAF5F1] flex items-center justify-center text-[#0F766E]">

          {icon}

        </div>

        <h2 className="text-lg font-semibold text-[#101828]">

          {title}

        </h2>

      </div>

      {children}

    </motion.section>
  );
}

// =========================================================
// DETAIL ROW
// =========================================================

function DetailRow({
  icon,
  label,
  value,
}) {
  return (
    <div className="flex items-center gap-3 p-3.5 bg-[#FCFCFA] border border-[#EAECF0] rounded-xl">

      <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center text-[#0F766E] shrink-0">

        {icon}

      </div>

      <div className="min-w-0">

        <p className="text-[10px] uppercase tracking-wider font-semibold text-[#98A2B3]">

          {label}

        </p>

        <p className="text-sm font-medium text-[#344054] mt-0.5 truncate">

          {value || "Not specified"}

        </p>

      </div>

    </div>
  );
}

// =========================================================
// MINI INFO
// =========================================================

function MiniInfo({
  icon,
  text,
}) {
  return (
    <div className="flex items-center gap-2.5 text-xs text-[#667085]">

      <span className="text-[#0F766E]">

        {icon}

      </span>

      <span className="truncate">

        {text}

      </span>

    </div>
  );
}

// =========================================================
// FLOW STEP
// =========================================================

function FlowStep({
  number,
  title,
  description,
  active = false,
}) {
  return (
    <div className="flex items-start gap-3">

      <div
        className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-[10px] font-bold ${
          active
            ? "bg-[#0F766E] text-white"
            : "bg-white/10 text-white/50"
        }`}
      >

        {number}

      </div>

      <div>

        <p className="text-xs font-semibold text-white/90">

          {title}

        </p>

        <p className="text-[11px] text-white/40 mt-1 leading-5">

          {description}

        </p>

      </div>

    </div>
  );
}

// =========================================================
// EMPTY
// =========================================================

function EmptyContent({
  text,
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-[#FCFCFA] border border-[#EAECF0] rounded-xl">

      <AlertCircle
        size={17}
        className="text-[#98A2B3]"
      />

      <p className="text-sm text-[#667085]">

        {text}

      </p>

    </div>
  );
}

// =========================================================
// ARROW ICON
// =========================================================

function ArrowRightIcon() {
  return (
    <ChevronRight
      size={16}
    />
  );
}

export default JobDetails;