
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  User,
  FileText,
  Briefcase,
  ClipboardCheck,
  Brain,
  Sparkles,
  Mic,
  ArrowRight,
  CheckCircle,
  Clock,
  XCircle,
  TrendingUp,
  Upload,
  Eye,
  CalendarDays,
  Timer,
  Video,
  ChevronRight,
  Bell,
  Search,
  ShieldCheck,
  Target,
  Building2,
  GraduationCap,
  RefreshCw,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

import {
  getApplicationsByStudent,
} from "../api/applicationApi";

import {
  getStudentInterviews,
} from "../api/interviewApi";


function Dashboard() {
  const navigate = useNavigate();

  // =====================================================
  // USER DATA
  // =====================================================

  const userId = localStorage.getItem("user_id");

  const fullName =
    localStorage.getItem("full_name") || "Student";

  const email =
    localStorage.getItem("email") || "";


  // =====================================================
  // STATE
  // =====================================================

  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);


  // =====================================================
  // LOAD DASHBOARD
  // =====================================================

  useEffect(() => {
    loadDashboard();
  }, []);


  // =====================================================
  // LOAD DASHBOARD DATA
  // =====================================================

  const loadDashboard = async () => {
    try {
      setLoading(true);

      if (!userId) {
        navigate("/login");
        return;
      }

      // =================================================
      // APPLICATIONS
      // =================================================

      try {
        const data =
          await getApplicationsByStudent(userId);

        const applicationList =
          Array.isArray(data)
            ? data
            : data?.applications || [];

        setApplications(applicationList);

      } catch (applicationError) {
        console.error(
          "Applications loading error:",
          applicationError
        );

        setApplications([]);
      }


      // =================================================
      // INTERVIEWS
      // =================================================

      try {
        const interviewResponse =
          await getStudentInterviews(userId);

        console.log(
          "Student interviews:",
          interviewResponse
        );

        const interviewList =
          Array.isArray(interviewResponse)
            ? interviewResponse
            : interviewResponse?.interviews ||
              interviewResponse?.data ||
              [];

        setInterviews(
          Array.isArray(interviewList)
            ? interviewList
            : []
        );

      } catch (interviewError) {
        console.error(
          "Student interviews loading error:",
          interviewError
        );

        setInterviews([]);
      }

    } catch (error) {
      console.error(
        "Dashboard loading error:",
        error
      );

      setApplications([]);
      setInterviews([]);

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // APPLICATION STATISTICS
  // =====================================================

  const totalApplications =
    applications.length;

  const pendingApplications =
    applications.filter(
      (application) =>
        application.application_status === "Pending"
    ).length;

  const shortlistedApplications =
    applications.filter(
      (application) =>
        application.application_status === "Shortlisted"
    ).length;

  const interviewApplications =
    applications.filter(
      (application) =>
        application.application_status === "Interview"
    ).length;

  const selectedApplications =
    applications.filter(
      (application) =>
        application.application_status === "Selected"
    ).length;


  // =====================================================
  // INTERVIEW STATISTICS
  // =====================================================

  const activeInterviews =
    interviews.filter((interview) => {
      const status = interview?.status;

      return (
        status === "Scheduled" ||
        status === "Confirmed" ||
        status === "In Progress"
      );
    });


  // =====================================================
  // UPCOMING INTERVIEW
  // =====================================================

  const upcomingInterviews =
    interviews
      .filter((interview) => {
        const status = interview?.status;

        return (
          status === "Scheduled" ||
          status === "Confirmed"
        );
      })
      .sort((a, b) => {
        const dateA =
          new Date(
            `${a?.scheduled_date || ""} ${
              a?.scheduled_time || ""
            }`
          );

        const dateB =
          new Date(
            `${b?.scheduled_date || ""} ${
              b?.scheduled_time || ""
            }`
          );

        return dateA - dateB;
      });

  const upcomingInterview =
    upcomingInterviews.length > 0
      ? upcomingInterviews[0]
      : null;


  // =====================================================
  // GET INTERVIEW ID
  // =====================================================

  const getInterviewId = (interview) => {
    return (
      interview?.id ||
      interview?._id ||
      interview?.interview_id ||
      interview?.interviewId ||
      ""
    );
  };


  // =====================================================
  // OPEN INTERVIEW
  // =====================================================

  const openInterview = (interview) => {
    const interviewId =
      getInterviewId(interview);

    if (!interviewId) {
      console.error(
        "Interview ID missing."
      );

      return;
    }

    navigate(
      `/ai-interview/${interviewId}`
    );
  };


  // =====================================================
  // FORMAT DATE
  // =====================================================

  const formatInterviewDate = (date) => {
    if (!date) {
      return "Date not available";
    }

    try {
      return new Date(
        `${date}T00:00:00`
      ).toLocaleDateString(
        "en-IN",
        {
          day: "2-digit",
          month: "short",
          year: "numeric",
        }
      );

    } catch {
      return date;
    }
  };


  // =====================================================
  // STATUS COLOR
  // =====================================================

  const getInterviewStatusStyle = (status) => {
    switch (status) {
      case "Scheduled":
        return "bg-[#EAF5F1] text-[#0F766E] border-[#BFE5DB]";

      case "Confirmed":
        return "bg-[#EAF5F1] text-[#0F766E] border-[#BFE5DB]";

      case "In Progress":
        return "bg-[#FFF1ED] text-[#C85D49] border-[#F3C4B9]";

      case "Completed":
        return "bg-[#EAF5F1] text-[#0F766E] border-[#BFE5DB]";

      case "Cancelled":
        return "bg-[#FEF3F2] text-[#B42318] border-[#FECDCA]";

      default:
        return "bg-[#F2F4F7] text-[#475467] border-[#D0D5DD]";
    }
  };


  // =====================================================
  // APPLICATION STATUS
  // =====================================================

  const getStatusStyle = (status) => {
    switch (status) {
      case "Pending":
        return "bg-[#FFF8E7] text-[#A15C00]";

      case "Shortlisted":
        return "bg-[#EAF5F1] text-[#0F766E]";

      case "Interview":
        return "bg-[#FFF1ED] text-[#C85D49]";

      case "Selected":
        return "bg-[#EAF5F1] text-[#0F766E]";

      case "Rejected":
        return "bg-[#FEF3F2] text-[#B42318]";

      default:
        return "bg-[#F2F4F7] text-[#475467]";
    }
  };


  // =====================================================
  // STATUS ICON
  // =====================================================

  const getStatusIcon = (status) => {
    switch (status) {
      case "Pending":
        return <Clock size={14} />;

      case "Shortlisted":
        return <CheckCircle size={14} />;

      case "Interview":
        return <Brain size={14} />;

      case "Selected":
        return <CheckCircle size={14} />;

      case "Rejected":
        return <XCircle size={14} />;

      default:
        return null;
    }
  };


  // =====================================================
  // RECENT APPLICATIONS
  // =====================================================

  const recentApplications =
    [...applications]
      .sort(
        (a, b) =>
          new Date(
            b.created_at || 0
          ) -
          new Date(
            a.created_at || 0
          )
      )
      .slice(0, 5);


  // =====================================================
  // ANIMATION
  // =====================================================

  const fadeUp = {
    hidden: {
      opacity: 0,
      y: 20,
    },

    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.55,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };


  const stagger = {
    hidden: {},

    visible: {
      transition: {
        staggerChildren: 0.08,
      },
    },
  };


  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F7F5EF]">

        <Sidebar />

        <main className="flex-1 p-5 md:p-8">

          <div className="max-w-7xl mx-auto animate-pulse">

            <div className="h-8 w-72 bg-white rounded-lg" />

            <div className="h-4 w-96 bg-white rounded mt-3" />

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

              {[1, 2, 3, 4].map((item) => (
                <div
                  key={item}
                  className="h-36 bg-white rounded-2xl border border-[#101828]/5"
                />
              ))}

            </div>

            <div className="h-72 bg-white rounded-2xl mt-6" />

            <div className="grid lg:grid-cols-2 gap-5 mt-6">

              <div className="h-52 bg-white rounded-2xl" />

              <div className="h-52 bg-white rounded-2xl" />

            </div>

          </div>

        </main>

      </div>
    );
  }


  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="flex min-h-screen bg-[#F7F5EF]">

      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="flex-1 overflow-y-auto">

        <div className="max-w-7xl mx-auto p-5 md:p-8">


          {/* =================================================
              TOP HEADER
          ================================================= */}

          <motion.div
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-8"
          >

            <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">

              <div>

                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">

                  <span className="w-7 h-[2px] bg-[#0F766E]" />

                  Student Dashboard

                </div>


                <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.04em] text-[#101828] mt-3">

                  Welcome back, {fullName} 👋

                </h1>


                <p className="text-[#667085] mt-2">
                  Here's what's happening with your career journey.
                </p>


                {email && (
                  <div className="flex items-center gap-2 text-xs text-[#98A2B3] mt-2">
                    <span>{email}</span>
                  </div>
                )}

              </div>


              <div className="flex flex-wrap gap-3">

                <button
                  onClick={loadDashboard}
                  className="flex items-center justify-center gap-2 bg-white border border-[#101828]/10 px-4 py-2.5 rounded-xl text-sm font-semibold text-[#475467] hover:border-[#0F766E] hover:text-[#0F766E] transition"
                >

                  <RefreshCw size={16} />

                  Refresh

                </button>


                <button
                  onClick={() =>
                    navigate("/profile")
                  }
                  className="flex items-center justify-center gap-2 bg-[#101828] text-white px-5 py-2.5 rounded-xl text-sm font-semibold hover:bg-[#0F766E] transition"
                >

                  <User size={17} />

                  My Profile

                </button>

              </div>

            </div>

          </motion.div>


          {/* =================================================
              OVERVIEW STATISTICS
          ================================================= */}

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >


            {/* APPLICATIONS */}

            <motion.div
              variants={fadeUp}
              className="group bg-white rounded-2xl border border-[#101828]/10 p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#101828]/5 transition-all duration-300"
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-[#667085]">
                    Applications
                  </p>

                  <h2 className="text-3xl font-semibold text-[#101828] mt-2">
                    {totalApplications}
                  </h2>

                </div>


                <div className="w-11 h-11 rounded-xl bg-[#EAF5F1] flex items-center justify-center">

                  <ClipboardCheck
                    size={21}
                    className="text-[#0F766E]"
                  />

                </div>

              </div>


              <div className="flex items-center gap-2 mt-5 text-xs text-[#98A2B3]">

                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />

                Total job applications

              </div>

            </motion.div>


            {/* SHORTLISTED */}

            <motion.div
              variants={fadeUp}
              className="group bg-white rounded-2xl border border-[#101828]/10 p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#101828]/5 transition-all duration-300"
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-[#667085]">
                    Shortlisted
                  </p>

                  <h2 className="text-3xl font-semibold text-[#0F766E] mt-2">
                    {shortlistedApplications}
                  </h2>

                </div>


                <div className="w-11 h-11 rounded-xl bg-[#EAF5F1] flex items-center justify-center">

                  <CheckCircle
                    size={21}
                    className="text-[#0F766E]"
                  />

                </div>

              </div>


              <div className="flex items-center gap-2 mt-5 text-xs text-[#98A2B3]">

                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />

                Candidates shortlisted

              </div>

            </motion.div>


            {/* INTERVIEWS */}

            <motion.div
              variants={fadeUp}
              onClick={() =>
                navigate("/ai-interview")
              }
              className="group bg-[#101828] rounded-2xl border border-[#101828] p-5 cursor-pointer hover:-translate-y-1 hover:shadow-xl hover:shadow-[#101828]/15 transition-all duration-300"
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-white/60">
                    Interviews
                  </p>

                  <h2 className="text-3xl font-semibold text-white mt-2">
                    {interviews.length}
                  </h2>

                </div>


                <div className="w-11 h-11 rounded-xl bg-[#0F766E] flex items-center justify-center">

                  <Mic
                    size={21}
                    className="text-white"
                  />

                </div>

              </div>


              <div className="flex items-center justify-between mt-5">

                <span className="text-xs text-white/50">
                  {activeInterviews.length} active
                </span>

                <ArrowRight
                  size={16}
                  className="text-white/50 group-hover:translate-x-1 transition-transform"
                />

              </div>

            </motion.div>


            {/* SELECTED */}

            <motion.div
              variants={fadeUp}
              className="group bg-white rounded-2xl border border-[#101828]/10 p-5 hover:-translate-y-1 hover:shadow-xl hover:shadow-[#101828]/5 transition-all duration-300"
            >

              <div className="flex items-start justify-between">

                <div>

                  <p className="text-sm text-[#667085]">
                    Selected
                  </p>

                  <h2 className="text-3xl font-semibold text-[#0F766E] mt-2">
                    {selectedApplications}
                  </h2>

                </div>


                <div className="w-11 h-11 rounded-xl bg-[#EAF5F1] flex items-center justify-center">

                  <TrendingUp
                    size={21}
                    className="text-[#0F766E]"
                  />

                </div>

              </div>


              <div className="flex items-center gap-2 mt-5 text-xs text-[#98A2B3]">

                <span className="w-1.5 h-1.5 rounded-full bg-[#E87961]" />

                Successful applications

              </div>

            </motion.div>

          </motion.div>


          {/* =================================================
              CAREER PROGRESS BAR
          ================================================= */}

          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-[#101828] rounded-2xl p-6 mb-6 overflow-hidden relative"
          >

            <div className="absolute -right-20 -top-24 w-72 h-72 rounded-full bg-[#0F766E]/30 blur-3xl" />

            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">

              <div>

                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#8FE2D1] font-semibold">

                  <Sparkles size={14} />

                  Career Progress

                </div>


                <h2 className="text-2xl font-semibold text-white mt-3">
                  Keep building your profile.
                </h2>


                <p className="text-sm text-white/50 mt-2 max-w-xl">
                  Complete your resume and explore opportunities
                  to improve your chances of finding the right role.
                </p>

              </div>


              <div className="min-w-[240px]">

                <div className="flex justify-between text-xs text-white/50 mb-2">

                  <span>
                    Recruitment activity
                  </span>

                  <span>
                    {totalApplications > 0 ? "Active" : "Getting started"}
                  </span>

                </div>


                <div className="h-2 bg-white/10 rounded-full overflow-hidden">

                  <motion.div
                    initial={{
                      width: 0,
                    }}
                    animate={{
                      width:
                        totalApplications > 0
                          ? "72%"
                          : "25%",
                    }}
                    transition={{
                      duration: 1,
                      delay: 0.4,
                    }}
                    className="h-full bg-[#0F766E] rounded-full"
                  />

                </div>

              </div>

            </div>

          </motion.section>


          {/* =================================================
              UPCOMING AI INTERVIEW
          ================================================= */}

          {upcomingInterview && (

            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mb-6 bg-white rounded-2xl border border-[#101828]/10 shadow-sm overflow-hidden"
            >

              {/* HEADER */}

              <div className="px-6 py-5 border-b border-[#101828]/10 bg-[#EAF5F1]/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

                <div className="flex items-center gap-3">

                  <div className="w-11 h-11 rounded-xl bg-[#DDF5EF] flex items-center justify-center">

                    <Brain
                      size={21}
                      className="text-[#0F766E]"
                    />

                  </div>


                  <div>

                    <h2 className="text-lg font-semibold text-[#101828]">
                      Upcoming AI Interview
                    </h2>

                    <p className="text-sm text-[#667085] mt-1">
                      Your next scheduled interview.
                    </p>

                  </div>

                </div>


                <span
                  className={`
                    inline-flex
                    items-center
                    gap-1.5
                    px-3
                    py-1.5
                    rounded-full
                    border
                    text-xs
                    font-semibold
                    ${getInterviewStatusStyle(
                      upcomingInterview?.status
                    )}
                  `}
                >

                  <Clock size={13} />

                  {upcomingInterview?.status || "Scheduled"}

                </span>

              </div>


              {/* BODY */}

              <div className="p-6">

                <div className="grid grid-cols-1 lg:grid-cols-[1fr_300px] gap-7">

                  <div>

                    <p className="text-xs uppercase tracking-[0.16em] text-[#98A2B3] font-semibold">
                      Interview
                    </p>


                    <h3 className="text-2xl font-semibold text-[#101828] mt-2">

                      {
                        upcomingInterview?.job_title ||
                        upcomingInterview?.job_name ||
                        upcomingInterview?.job?.title ||
                        "AI Technical Interview"
                      }

                    </h3>


                    <p className="text-[#667085] mt-1">
                      {
                        upcomingInterview?.round_name ||
                        "Technical Round 1"
                      }
                    </p>


                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-6">

                      {/* DATE */}

                      <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F7F5EF]">

                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">

                          <CalendarDays
                            size={18}
                            className="text-[#0F766E]"
                          />

                        </div>


                        <div>

                          <p className="text-[11px] text-[#98A2B3]">
                            Date
                          </p>

                          <p className="font-semibold text-sm text-[#101828] mt-1">

                            {
                              formatInterviewDate(
                                upcomingInterview?.scheduled_date
                              )
                            }

                          </p>

                        </div>

                      </div>


                      {/* TIME */}

                      <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F7F5EF]">

                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">

                          <Clock
                            size={18}
                            className="text-[#0F766E]"
                          />

                        </div>


                        <div>

                          <p className="text-[11px] text-[#98A2B3]">
                            Time
                          </p>

                          <p className="font-semibold text-sm text-[#101828] mt-1">

                            {
                              upcomingInterview?.scheduled_time ||
                              "Not specified"
                            }

                          </p>

                        </div>

                      </div>


                      {/* DURATION */}

                      <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F7F5EF]">

                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">

                          <Timer
                            size={18}
                            className="text-[#E87961]"
                          />

                        </div>


                        <div>

                          <p className="text-[11px] text-[#98A2B3]">
                            Duration
                          </p>

                          <p className="font-semibold text-sm text-[#101828] mt-1">

                            {
                              upcomingInterview?.duration || 30
                            }{" "}

                            minutes

                          </p>

                        </div>

                      </div>


                      {/* TYPE */}

                      <div className="flex items-center gap-3 p-4 rounded-xl bg-[#F7F5EF]">

                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center">

                          <Video
                            size={18}
                            className="text-[#0F766E]"
                          />

                        </div>


                        <div>

                          <p className="text-[11px] text-[#98A2B3]">
                            Interview Type
                          </p>

                          <p className="font-semibold text-sm text-[#101828] mt-1">

                            {
                              upcomingInterview?.interview_type ||
                              "Technical"
                            }

                            {" • "}

                            {
                              upcomingInterview?.interview_mode ||
                              "AI"
                            }

                          </p>

                        </div>

                      </div>

                    </div>

                  </div>


                  {/* ACTION PANEL */}

                  <div className="bg-[#101828] rounded-2xl p-6 text-white flex flex-col justify-between">

                    <div>

                      <div className="w-11 h-11 rounded-xl bg-[#0F766E] flex items-center justify-center">

                        <Brain size={21} />

                      </div>


                      <h3 className="font-semibold text-lg mt-5">
                        Ready for your interview?
                      </h3>


                      <p className="text-sm text-white/50 mt-2 leading-6">
                        Review your interview details
                        before entering the interview room.
                      </p>

                    </div>


                    <button
                      onClick={() =>
                        openInterview(
                          upcomingInterview
                        )
                      }
                      className="w-full mt-6 flex items-center justify-center gap-2 bg-white text-[#101828] hover:bg-[#DDF5EF] px-5 py-3 rounded-xl font-semibold text-sm transition"
                    >

                      View Interview

                      <ArrowRight size={16} />

                    </button>

                  </div>

                </div>

              </div>

            </motion.section>

          )}


          {/* =================================================
              NO UPCOMING INTERVIEW
          ================================================= */}

          {!upcomingInterview && (

            <motion.section
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className="mb-6 bg-white rounded-2xl border border-[#101828]/10 p-6"
            >

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">

                <div className="flex items-center gap-4">

                  <div className="w-12 h-12 rounded-xl bg-[#EAF5F1] flex items-center justify-center">

                    <Mic
                      size={22}
                      className="text-[#0F766E]"
                    />

                  </div>


                  <div>

                    <h2 className="text-lg font-semibold text-[#101828]">
                      No Upcoming Interview
                    </h2>

                    <p className="text-sm text-[#667085] mt-1">
                      Scheduled interviews will appear here.
                    </p>

                  </div>

                </div>


                <button
                  onClick={() =>
                    navigate("/ai-interview")
                  }
                  className="flex items-center justify-center gap-2 border border-[#101828]/10 text-[#475467] hover:border-[#0F766E] hover:text-[#0F766E] px-5 py-3 rounded-xl font-semibold text-sm transition"
                >

                  My Interviews

                  <ArrowRight size={16} />

                </button>

              </div>

            </motion.section>

          )}


          {/* =================================================
              QUICK ACTIONS
          ================================================= */}

          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="mb-6"
          >

            <div className="flex items-end justify-between mb-4">

              <div>

                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-[#0F766E] font-semibold">
                  <Sparkles size={13} />
                  Workspace
                </div>

                <h2 className="text-xl font-semibold text-[#101828] mt-2">
                  Quick Actions
                </h2>

                <p className="text-sm text-[#667085] mt-1">
                  Continue building your career profile.
                </p>

              </div>

            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">


              {/* RESUME */}

              <motion.button
                whileHover={{
                  y: -5,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() =>
                  navigate("/resume-upload")
                }
                className="group bg-white border border-[#101828]/10 rounded-2xl p-5 text-left hover:border-[#0F766E]/40 hover:shadow-xl hover:shadow-[#101828]/5 transition-all"
              >

                <div className="flex items-start justify-between">

                  <div className="w-11 h-11 rounded-xl bg-[#EAF5F1] flex items-center justify-center">

                    <Upload
                      size={20}
                      className="text-[#0F766E]"
                    />

                  </div>

                  <ArrowRight
                    size={17}
                    className="text-[#98A2B3] group-hover:text-[#0F766E] group-hover:translate-x-1 transition-all"
                  />

                </div>


                <h3 className="font-semibold text-[#101828] mt-5">
                  Upload Resume
                </h3>


                <p className="text-sm text-[#667085] mt-1 leading-6">
                  Upload and analyze your resume.
                </p>

              </motion.button>


              {/* JOBS */}

              <motion.button
                whileHover={{
                  y: -5,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() =>
                  navigate("/jobs")
                }
                className="group bg-white border border-[#101828]/10 rounded-2xl p-5 text-left hover:border-[#0F766E]/40 hover:shadow-xl hover:shadow-[#101828]/5 transition-all"
              >

                <div className="flex items-start justify-between">

                  <div className="w-11 h-11 rounded-xl bg-[#F0F4F2] flex items-center justify-center">

                    <Briefcase
                      size={20}
                      className="text-[#101828]"
                    />

                  </div>

                  <ArrowRight
                    size={17}
                    className="text-[#98A2B3] group-hover:text-[#0F766E] group-hover:translate-x-1 transition-all"
                  />

                </div>


                <h3 className="font-semibold text-[#101828] mt-5">
                  Find Jobs
                </h3>


                <p className="text-sm text-[#667085] mt-1 leading-6">
                  Explore available job opportunities.
                </p>

              </motion.button>


              {/* RECOMMENDATIONS */}

              <motion.button
                whileHover={{
                  y: -5,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() =>
                  navigate("/recommended-jobs")
                }
                className="group bg-white border border-[#101828]/10 rounded-2xl p-5 text-left hover:border-[#E87961]/40 hover:shadow-xl hover:shadow-[#101828]/5 transition-all"
              >

                <div className="flex items-start justify-between">

                  <div className="w-11 h-11 rounded-xl bg-[#FFF1ED] flex items-center justify-center">

                    <Sparkles
                      size={20}
                      className="text-[#E87961]"
                    />

                  </div>

                  <ArrowRight
                    size={17}
                    className="text-[#98A2B3] group-hover:text-[#E87961] group-hover:translate-x-1 transition-all"
                  />

                </div>


                <h3 className="font-semibold text-[#101828] mt-5">
                  AI Recommendations
                </h3>


                <p className="text-sm text-[#667085] mt-1 leading-6">
                  Discover jobs matched to your profile.
                </p>

              </motion.button>


              {/* INTERVIEW */}

              <motion.button
                whileHover={{
                  y: -5,
                }}
                whileTap={{
                  scale: 0.98,
                }}
                onClick={() =>
                  navigate("/ai-interview")
                }
                className="group bg-white border border-[#101828]/10 rounded-2xl p-5 text-left hover:border-[#0F766E]/40 hover:shadow-xl hover:shadow-[#101828]/5 transition-all"
              >

                <div className="flex items-start justify-between">

                  <div className="w-11 h-11 rounded-xl bg-[#EAF5F1] flex items-center justify-center">

                    <Brain
                      size={20}
                      className="text-[#0F766E]"
                    />

                  </div>

                  <ArrowRight
                    size={17}
                    className="text-[#98A2B3] group-hover:text-[#0F766E] group-hover:translate-x-1 transition-all"
                  />

                </div>


                <h3 className="font-semibold text-[#101828] mt-5">
                  AI Interview
                </h3>


                <p className="text-sm text-[#667085] mt-1 leading-6">
                  View your scheduled AI interviews.
                </p>

              </motion.button>

            </div>

          </motion.section>


          {/* =================================================
              INTELLIGENCE CARDS
          ================================================= */}

          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-6"
          >


            {/* RESUME INTELLIGENCE */}

            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden bg-white rounded-2xl border border-[#101828]/10 p-6"
            >

              <div className="absolute -right-20 -top-20 w-52 h-52 rounded-full bg-[#DDF5EF] blur-3xl opacity-60" />

              <div className="relative">

                <div className="flex items-start justify-between">

                  <div className="w-11 h-11 rounded-xl bg-[#EAF5F1] flex items-center justify-center">

                    <FileText
                      size={21}
                      className="text-[#0F766E]"
                    />

                  </div>

                  <div className="flex items-center gap-1 text-xs text-[#0F766E] font-semibold">
                    <Sparkles size={13} />
                    AI
                  </div>

                </div>


                <h2 className="text-xl font-semibold text-[#101828] mt-5">
                  Resume Intelligence
                </h2>


                <p className="text-sm text-[#667085] mt-2 leading-6 max-w-lg">
                  Analyze your resume and identify strengths,
                  skills and areas that can improve your profile.
                </p>


                <button
                  onClick={() =>
                    navigate("/resume-analysis")
                  }
                  className="mt-6 flex items-center gap-2 text-sm text-[#0F766E] font-semibold hover:gap-3 transition-all"
                >

                  View Resume Analysis

                  <ArrowRight size={16} />

                </button>

              </div>

            </motion.div>


            {/* JD MATCHING */}

            <motion.div
              variants={fadeUp}
              className="relative overflow-hidden bg-[#101828] rounded-2xl p-6 text-white"
            >

              <div className="absolute -right-20 -top-20 w-52 h-52 rounded-full bg-[#0F766E]/30 blur-3xl" />

              <div className="relative">

                <div className="flex items-start justify-between">

                  <div className="w-11 h-11 rounded-xl bg-[#0F766E] flex items-center justify-center">

                    <Target size={21} />

                  </div>

                  <div className="text-xs text-white/40">
                    MATCHING
                  </div>

                </div>


                <h2 className="text-xl font-semibold mt-5">
                  AI Job Matching
                </h2>


                <p className="text-sm text-white/50 mt-2 leading-6 max-w-lg">
                  Compare your profile with job descriptions
                  and discover opportunities that fit your skills.
                </p>


                <button
                  onClick={() =>
                    navigate("/jobs")
                  }
                  className="mt-6 flex items-center gap-2 text-sm text-[#8FE2D1] font-semibold hover:gap-3 transition-all"
                >

                  Explore Jobs

                  <ArrowRight size={16} />

                </button>

              </div>

            </motion.div>

          </motion.div>


          {/* =================================================
              RECENT APPLICATIONS
          ================================================= */}

          <motion.section
            variants={fadeUp}
            initial="hidden"
            animate="visible"
            className="bg-white rounded-2xl border border-[#101828]/10 shadow-sm overflow-hidden"
          >

            <div className="px-6 py-5 border-b border-[#101828]/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <div className="flex items-center gap-2">

                  <Briefcase
                    size={17}
                    className="text-[#0F766E]"
                  />

                  <h2 className="text-xl font-semibold text-[#101828]">
                    Recent Applications
                  </h2>

                </div>


                <p className="text-sm text-[#667085] mt-1">
                  Track your latest job applications.
                </p>

              </div>


              <button
                onClick={() =>
                  navigate("/my-applications")
                }
                className="flex items-center gap-1.5 text-sm font-semibold text-[#0F766E] hover:gap-2.5 transition-all"
              >

                View All

                <ArrowRight size={15} />

              </button>

            </div>


            {recentApplications.length === 0 ? (

              <div className="p-12 text-center">

                <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F7F5EF] flex items-center justify-center">

                  <ClipboardCheck
                    size={24}
                    className="text-[#98A2B3]"
                  />

                </div>


                <h3 className="font-semibold text-[#101828] mt-4">
                  No applications yet
                </h3>


                <p className="text-sm text-[#667085] mt-1 max-w-sm mx-auto leading-6">
                  Start exploring jobs and apply to positions
                  that match your skills.
                </p>


                <button
                  onClick={() =>
                    navigate("/jobs")
                  }
                  className="mt-5 inline-flex items-center gap-2 bg-[#101828] hover:bg-[#0F766E] text-white px-5 py-2.5 rounded-xl font-semibold text-sm transition"
                >

                  Browse Jobs

                  <ArrowRight size={16} />

                </button>

              </div>

            ) : (

              <div className="divide-y divide-[#101828]/8">

                {recentApplications.map(
                  (application, index) => (

                    <motion.div
                      key={
                        application._id ||
                        application.application_id ||
                        index
                      }
                      whileHover={{
                        backgroundColor: "#FBFAF7",
                      }}
                      className="px-6 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4 transition-colors"
                    >

                      <div className="flex items-center gap-4">

                        <div className="w-11 h-11 rounded-xl bg-[#F7F5EF] flex items-center justify-center shrink-0">

                          <Briefcase
                            size={18}
                            className="text-[#475467]"
                          />

                        </div>


                        <div>

                          <h3 className="font-semibold text-[#101828]">

                            {
                              application.job_title ||
                              application.job_name ||
                              "Job Position"
                            }

                          </h3>


                          <p className="text-sm text-[#667085] mt-1">

                            Applied on{" "}

                            {
                              application.created_at
                                ? new Date(
                                    application.created_at
                                  ).toLocaleDateString(
                                    "en-IN",
                                    {
                                      day: "2-digit",
                                      month: "short",
                                      year: "numeric",
                                    }
                                  )
                                : "N/A"
                            }

                          </p>

                        </div>

                      </div>


                      <div className="flex items-center gap-3">

                        <span
                          className={`
                            inline-flex
                            items-center
                            gap-1.5
                            px-3
                            py-1.5
                            rounded-full
                            text-xs
                            font-semibold
                            ${getStatusStyle(
                              application.application_status
                            )}
                          `}
                        >

                          {getStatusIcon(
                            application.application_status
                          )}

                          {
                            application.application_status ||
                            "Pending"
                          }

                        </span>


                        <button
                          onClick={() =>
                            navigate(
                              `/applications/${
                                application._id ||
                                application.application_id
                              }`
                            )
                          }
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-[#98A2B3] hover:bg-[#F7F5EF] hover:text-[#0F766E] transition"
                          title="View Application"
                        >

                          <Eye size={17} />

                        </button>


                        <ChevronRight
                          size={16}
                          className="hidden sm:block text-[#D0D5DD]"
                        />

                      </div>

                    </motion.div>

                  )
                )}

              </div>

            )}

          </motion.section>


          {/* =================================================
              FOOTER STATUS
          ================================================= */}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-7 text-xs text-[#98A2B3]">

            <div className="flex items-center gap-2">

              <ShieldCheck
                size={14}
                className="text-[#0F766E]"
              />

              Your recruitment data is securely protected.

            </div>


            <div className="flex items-center gap-2">

              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />

              Recruit_Ai Student Portal

            </div>

          </div>

        </div>

      </main>

    </div>
  );
}


export default Dashboard;

