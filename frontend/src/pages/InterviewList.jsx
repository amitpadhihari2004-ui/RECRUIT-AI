import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  ArrowRight,
  Calendar,
  Clock,
  Video,
  CheckCircle2,
  XCircle,
  AlertCircle,
  RefreshCw,
  Play,
  Eye,
  Brain,
  BriefcaseBusiness,
  Loader2,
  Sparkles,
  Target,
  TrendingUp,
  ShieldCheck,
  Mic2,
  BarChart3,
  CalendarDays,
  CircleCheck,
  ChevronRight,
  UserCheck,
  Award,
} from "lucide-react";

import Sidebar from "../components/Sidebar";

import {
  getStudentInterviews,
} from "../api/interviewApi";

function InterviewList() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // =====================================================
  // LOAD INTERVIEWS
  // =====================================================

  useEffect(() => {
    loadInterviews();
  }, []);

  const loadInterviews = async () => {
    try {
      setLoading(true);

      const currentStudentId =
        localStorage.getItem("user_id") ||
        localStorage.getItem("studentId") ||
        localStorage.getItem("student_id");

      if (!currentStudentId) {
        toast.error(
          "Student ID not found. Please login again."
        );

        navigate("/login");
        return;
      }

      const data =
        await getStudentInterviews(
          currentStudentId
        );

      console.log(
        "Student Interviews Response:",
        data
      );

      const interviewList =
        Array.isArray(data)
          ? data
          : data?.interviews ||
            data?.data ||
            [];

      setInterviews(
        Array.isArray(interviewList)
          ? interviewList
          : []
      );

    } catch (error) {
      console.error(
        "Load Interviews Error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Unable to load interviews."
      );

      setInterviews([]);

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
    await loadInterviews();
  };

  // =====================================================
  // HELPERS
  // =====================================================

  const getStatus = (interview) => {
    return String(
      interview?.status ||
        interview?.interview_status ||
        ""
    ).toLowerCase();
  };

  const getInterviewId = (interview) => {
    return (
      interview?.interview_id ||
      interview?._id ||
      interview?.id
    );
  };

  const getJobTitle = (interview) => {
    return (
      interview?.job_title ||
      interview?.job_name ||
      interview?.jobTitle ||
      interview?.position ||
      interview?.job?.title ||
      "Job Position"
    );
  };

  const getInterviewType = (interview) => {
    return (
      interview?.interview_type ||
      interview?.interviewType ||
      "AI Interview"
    );
  };

  const getInterviewDate = (interview) => {
    return (
      interview?.scheduled_date ||
      interview?.interview_date ||
      interview?.scheduledDate ||
      null
    );
  };

  const getInterviewTime = (interview) => {
    return (
      interview?.scheduled_time ||
      interview?.interview_time ||
      interview?.scheduledTime ||
      null
    );
  };

  const getDuration = (interview) => {
    return (
      interview?.duration ||
      interview?.interview_duration ||
      30
    );
  };

  const getScore = (interview) => {
    return (
      interview?.overall_score ??
      interview?.ai_score ??
      interview?.score ??
      0
    );
  };

  // =====================================================
  // DATE
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Not scheduled";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // TIME
  // =====================================================

  const formatTime = (time) => {
    if (!time) {
      return "Not scheduled";
    }

    const parts =
      String(time).split(":");

    if (parts.length >= 2) {
      const hours = Number(parts[0]);
      const minutes = Number(parts[1]);

      if (
        !Number.isNaN(hours) &&
        !Number.isNaN(minutes)
      ) {
        const date = new Date();

        date.setHours(
          hours,
          minutes,
          0,
          0
        );

        return date.toLocaleTimeString(
          "en-IN",
          {
            hour: "2-digit",
            minute: "2-digit",
          }
        );
      }
    }

    return time;
  };

  // =====================================================
  // STATUS FORMAT
  // =====================================================

  const formatStatus = (status) => {
    if (!status) {
      return "Pending";
    }

    return String(status)
      .replace(/_/g, " ")
      .replace(
        /\b\w/g,
        (letter) =>
          letter.toUpperCase()
      );
  };

  // =====================================================
  // STATUS STYLE
  // =====================================================

  const getStatusConfig = (status) => {
    switch (
      String(status || "").toLowerCase()
    ) {
      case "scheduled":
        return {
          label: "Scheduled",
          icon: Calendar,
          text: "text-[#0F766E]",
          bg: "bg-[#EAF5F1]",
          border: "border-[#BFE5DB]",
        };

      case "confirmed":
        return {
          label: "Confirmed",
          icon: CheckCircle2,
          text: "text-[#0F766E]",
          bg: "bg-[#EAF5F1]",
          border: "border-[#BFE5DB]",
        };

      case "in_progress":
      case "in progress":
      case "started":
        return {
          label: "In Progress",
          icon: Play,
          text: "text-[#0F766E]",
          bg: "bg-[#EAF5F1]",
          border: "border-[#BFE5DB]",
        };

      case "completed":
        return {
          label: "Completed",
          icon: CircleCheck,
          text: "text-[#475467]",
          bg: "bg-[#F2F4F7]",
          border: "border-[#D0D5DD]",
        };

      case "cancelled":
      case "canceled":
        return {
          label: "Cancelled",
          icon: XCircle,
          text: "text-[#C95F4C]",
          bg: "bg-[#FFF1EE]",
          border: "border-[#F3C7BD]",
        };

      case "rescheduled":
        return {
          label: "Rescheduled",
          icon: CalendarDays,
          text: "text-[#8A6200]",
          bg: "bg-[#FFF8E7]",
          border: "border-[#F1D99A]",
        };

      default:
        return {
          label: formatStatus(status),
          icon: Clock,
          text: "text-[#667085]",
          bg: "bg-[#F2F4F7]",
          border: "border-[#D0D5DD]",
        };
    }
  };

  // =====================================================
  // CONDITIONS
  // =====================================================

  const canStartInterview = (interview) => {
    const status = getStatus(interview);

    return (
      status === "scheduled" ||
      status === "confirmed" ||
      status === "rescheduled"
    );
  };

  const isCompleted = (interview) => {
    return (
      getStatus(interview) ===
      "completed"
    );
  };

  // =====================================================
  // COUNTS
  // =====================================================

  const scheduledCount = useMemo(() => {
    return interviews.filter(
      (interview) => {
        const status =
          getStatus(interview);

        return (
          status === "scheduled" ||
          status === "confirmed" ||
          status === "rescheduled"
        );
      }
    ).length;
  }, [interviews]);

  const completedCount = useMemo(() => {
    return interviews.filter(
      (interview) =>
        getStatus(interview) ===
        "completed"
    ).length;
  }, [interviews]);

  const cancelledCount = useMemo(() => {
    return interviews.filter(
      (interview) => {
        const status =
          getStatus(interview);

        return (
          status === "cancelled" ||
          status === "canceled"
        );
      }
    ).length;
  }, [interviews]);

  const upcomingInterview = useMemo(() => {
    return interviews.find(
      (interview) =>
        canStartInterview(interview)
    );
  }, [interviews]);

  // =====================================================
  // AVERAGE SCORE
  // =====================================================

  const averageScore = useMemo(() => {
    const completed =
      interviews.filter(
        (interview) =>
          isCompleted(interview)
      );

    if (!completed.length) {
      return 0;
    }

    const total =
      completed.reduce(
        (sum, interview) =>
          sum +
          Number(
            getScore(interview)
          ),
        0
      );

    return Math.round(
      total / completed.length
    );
  }, [interviews]);

  // =====================================================
  // NAVIGATION
  // =====================================================

  const handleView = (interview) => {
    const interviewId =
      getInterviewId(interview);

    if (!interviewId) {
      toast.error(
        "Interview ID not found."
      );
      return;
    }

    navigate(
      `/student/interview/${interviewId}`
    );
  };

  const handleStart = (interview) => {
    const interviewId =
      getInterviewId(interview);

    if (!interviewId) {
      toast.error(
        "Interview ID not found."
      );
      return;
    }

    navigate(
      `/interviews/${interviewId}/start`
    );
  };

  const handleResult = (interview) => {
    const interviewId =
      getInterviewId(interview);

    if (!interviewId) {
      toast.error(
        "Interview ID not found."
      );
      return;
    }

    navigate(
      `/student/interview/${interviewId}/result`
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-gradient-to-br from-[#EDF8F3] via-[#F7F5EF] to-[#EEF2F8]">

        <Sidebar />

        <main className="flex-1 flex items-center justify-center">

          <div className="text-center">

            <div className="w-16 h-16 rounded-2xl bg-[#EAF5F1] flex items-center justify-center mx-auto">

              <Loader2
                size={30}
                className="text-[#0F766E] animate-spin"
              />

            </div>

            <h2 className="mt-5 text-xl font-semibold text-[#101828]">
              Loading interviews
            </h2>

            <p className="mt-2 text-sm text-[#667085]">
              Preparing your interview center...
            </p>

          </div>

        </main>

      </div>
    );
  }

  // =====================================================
  // MAIN UI
  // =====================================================

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-[#EDF8F3] via-[#F7F5EF] to-[#EEF2F8] text-[#101828]">

      <Sidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">

        {/* BACKGROUND DECORATION */}

        <div className="fixed inset-0 pointer-events-none overflow-hidden">

          <div className="absolute -top-60 right-[-120px] w-[600px] h-[600px] rounded-full bg-[#CDEDE3]/40 blur-3xl" />

          <div className="absolute bottom-[-200px] left-[-150px] w-[550px] h-[550px] rounded-full bg-[#DCE5F5]/30 blur-3xl" />

        </div>

        <div className="relative max-w-7xl mx-auto px-5 md:px-8 py-6 md:py-8">

          {/* =================================================
              TOP NAV
          ================================================= */}

          <div className="flex items-center justify-between mb-6">

            <button
              onClick={() =>
                navigate("/student/dashboard")
              }
              className="flex items-center gap-2 text-sm font-medium text-[#667085] hover:text-[#0F766E] transition"
            >

              <ArrowLeft size={17} />

              Back to dashboard

            </button>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="w-11 h-11 rounded-xl bg-white border border-[#101828]/10 flex items-center justify-center text-[#667085] hover:text-[#0F766E] hover:border-[#BFE5DB] transition shadow-sm"
            >

              {refreshing ? (
                <Loader2
                  size={17}
                  className="animate-spin"
                />
              ) : (
                <RefreshCw size={17} />
              )}

            </button>

          </div>

          {/* =================================================
              HERO
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
              duration: 0.5,
            }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#102D36] via-[#102A34] to-[#101828] text-white"
          >

            {/* Glow */}

            <div className="absolute -right-40 -top-48 w-[600px] h-[600px] rounded-full bg-[#0F766E]/20 blur-3xl" />

            <div className="absolute right-[20%] bottom-[-250px] w-[500px] h-[500px] rounded-full bg-[#314A70]/20 blur-3xl" />

            <div className="relative p-6 md:p-9">

              <div className="grid lg:grid-cols-[1fr_360px] gap-10 items-center">

                {/* LEFT */}

                <div>

                  <div className="inline-flex items-center gap-2 text-[#8FE2D1] text-xs font-semibold uppercase tracking-[0.16em]">

                    <span className="w-2 h-2 rounded-full bg-[#8FE2D1] animate-pulse" />

                    AI Interview Center

                  </div>

                  <h1 className="mt-4 text-4xl md:text-5xl font-semibold tracking-[-0.045em]">

                    Prepare.
                    <br />

                    <span className="text-[#8FE2D1]">
                      Perform.
                    </span>

                    <br />

                    Improve.

                  </h1>

                  <p className="mt-5 max-w-xl text-sm md:text-base leading-7 text-white/55">

                    Manage your AI interviews, prepare for
                    upcoming sessions and review your
                    interview performance from one place.

                  </p>

                  <div className="flex flex-wrap gap-3 mt-7">

                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/65">

                      <ShieldCheck
                        size={14}
                        className="text-[#8FE2D1]"
                      />

                      Secure interview environment

                    </div>

                    <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/65">

                      <Brain
                        size={14}
                        className="text-[#8FE2D1]"
                      />

                      AI assisted evaluation

                    </div>

                  </div>

                </div>

                {/* RIGHT HERO CARD */}

                <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-5">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[10px] uppercase tracking-[0.16em] text-white/40 font-semibold">

                        Upcoming

                      </p>

                      <p className="text-lg font-semibold mt-1">

                        {upcomingInterview
                          ? getJobTitle(
                              upcomingInterview
                            )
                          : "No interview scheduled"}

                      </p>

                    </div>

                    <div className="w-10 h-10 rounded-xl bg-[#0F766E]/25 flex items-center justify-center">

                      <CalendarDays
                        size={19}
                        className="text-[#8FE2D1]"
                      />

                    </div>

                  </div>

                  {upcomingInterview ? (

                    <>

                      <div className="grid grid-cols-2 gap-3 mt-5">

                        <div className="bg-white/5 rounded-xl p-3">

                          <p className="text-[10px] text-white/35 uppercase">
                            Date
                          </p>

                          <p className="text-xs font-medium mt-1 text-white/80">

                            {formatDate(
                              getInterviewDate(
                                upcomingInterview
                              )
                            )}

                          </p>

                        </div>

                        <div className="bg-white/5 rounded-xl p-3">

                          <p className="text-[10px] text-white/35 uppercase">
                            Time
                          </p>

                          <p className="text-xs font-medium mt-1 text-white/80">

                            {formatTime(
                              getInterviewTime(
                                upcomingInterview
                              )
                            )}

                          </p>

                        </div>

                      </div>

                      <button
                        onClick={() =>
                          handleStart(
                            upcomingInterview
                          )
                        }
                        className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-3 bg-[#0F766E] hover:bg-[#0B625B] rounded-xl text-sm font-semibold transition"
                      >

                        <Play
                          size={16}
                          fill="currentColor"
                        />

                        Start Interview

                      </button>

                    </>

                  ) : (

                    <p className="text-xs text-white/45 mt-5">

                      Your next scheduled interview will
                      appear here.

                    </p>

                  )}

                </div>

              </div>

              {/* HERO METRICS */}

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-9">

                <HeroMetric
                  label="Total"
                  value={
                    interviews.length
                  }
                  icon={
                    <Brain size={16} />
                  }
                />

                <HeroMetric
                  label="Scheduled"
                  value={
                    scheduledCount
                  }
                  icon={
                    <Calendar size={16} />
                  }
                />

                <HeroMetric
                  label="Completed"
                  value={
                    completedCount
                  }
                  icon={
                    <CheckCircle2 size={16} />
                  }
                />

                <HeroMetric
                  label="Average Score"
                  value={
                    `${averageScore}/100`
                  }
                  icon={
                    <TrendingUp size={16} />
                  }
                />

              </div>

            </div>

          </motion.section>

          {/* =================================================
              QUICK INSIGHT
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
              delay: 0.12,
            }}
            className="mt-6 relative overflow-hidden bg-[#EAF5F1] border border-[#BFE5DB] rounded-3xl p-6 md:p-7"
          >

            <div className="absolute right-[-100px] top-[-120px] w-80 h-80 rounded-full bg-[#0F766E]/10 blur-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div className="flex items-start gap-4">

                <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0">

                  <Sparkles
                    size={22}
                    className="text-[#0F766E]"
                  />

                </div>

                <div>

                  <p className="text-[10px] uppercase tracking-[0.16em] font-bold text-[#0F766E]">

                    Recruit_Ai Intelligence

                  </p>

                  <h2 className="text-xl font-semibold text-[#101828] mt-1">

                    {upcomingInterview
                      ? "Your next interview is ready."
                      : completedCount > 0
                      ? "Keep improving your interview performance."
                      : "Your interview journey starts here."}

                  </h2>

                  <p className="text-sm text-[#667085] mt-1 leading-6 max-w-2xl">

                    {upcomingInterview
                      ? "Make sure your microphone, camera and environment are ready before starting."
                      : completedCount > 0
                      ? "Review previous interview results and use the feedback to strengthen your next attempt."
                      : "Once an organization schedules an interview, you will be able to prepare and start it from this page."}

                  </p>

                </div>

              </div>

              {upcomingInterview && (

                <button
                  onClick={() =>
                    handleStart(
                      upcomingInterview
                    )
                  }
                  className="shrink-0 flex items-center justify-center gap-2 px-5 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-xl text-sm font-semibold transition"
                >

                  Prepare now

                  <ArrowRight
                    size={15}
                  />

                </button>

              )}

            </div>

          </motion.section>

          {/* =================================================
              CONTENT GRID
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_320px] gap-6 mt-7">

            {/* =================================================
                INTERVIEWS
            ================================================= */}

            <div>

              <div className="flex items-end justify-between mb-5">

                <div>

                  <p className="text-[10px] uppercase tracking-[0.16em] text-[#0F766E] font-bold">

                    Your activity

                  </p>

                  <h2 className="text-2xl font-semibold text-[#101828] mt-1">

                    My Interviews

                  </h2>

                  <p className="text-sm text-[#667085] mt-1">

                    Scheduled and completed interview sessions.

                  </p>

                </div>

                <span className="text-xs text-[#98A2B3]">

                  {interviews.length} total

                </span>

              </div>

              {interviews.length === 0 ? (

                <EmptyState
                  navigate={navigate}
                />

              ) : (

                <div className="space-y-5">

                  {interviews.map(
                    (
                      interview,
                      index
                    ) => (

                      <InterviewCard
                        key={
                          getInterviewId(
                            interview
                          ) ||
                          index
                        }
                        interview={
                          interview
                        }
                        index={index}
                        getStatus={
                          getStatus
                        }
                        getStatusConfig={
                          getStatusConfig
                        }
                        getJobTitle={
                          getJobTitle
                        }
                        getInterviewType={
                          getInterviewType
                        }
                        getInterviewDate={
                          getInterviewDate
                        }
                        getInterviewTime={
                          getInterviewTime
                        }
                        getDuration={
                          getDuration
                        }
                        getScore={
                          getScore
                        }
                        formatDate={
                          formatDate
                        }
                        formatTime={
                          formatTime
                        }
                        canStartInterview={
                          canStartInterview
                        }
                        isCompleted={
                          isCompleted
                        }
                        handleView={
                          handleView
                        }
                        handleStart={
                          handleStart
                        }
                        handleResult={
                          handleResult
                        }
                      />

                    )
                  )}

                </div>

              )}

            </div>

            {/* =================================================
                RIGHT INSIGHTS
            ================================================= */}

            <aside>

              <div className="lg:sticky lg:top-6 space-y-5">

                {/* READINESS */}

                <div className="bg-white border border-[#101828]/10 rounded-2xl p-6 shadow-sm">

                  <div className="flex items-center justify-between">

                    <div>

                      <p className="text-[10px] uppercase tracking-[0.16em] text-[#98A2B3] font-bold">

                        Interview readiness

                      </p>

                      <h3 className="text-xl font-semibold mt-1">

                        {scheduledCount > 0
                          ? "Ready to prepare"
                          : "Build readiness"}

                      </h3>

                    </div>

                    <div className="w-10 h-10 rounded-xl bg-[#EAF5F1] flex items-center justify-center">

                      <Target
                        size={18}
                        className="text-[#0F766E]"
                      />

                    </div>

                  </div>

                  <div className="mt-6">

                    <div className="flex items-end gap-2">

                      <span className="text-4xl font-semibold">

                        {completedCount > 0
                          ? averageScore
                          : scheduledCount > 0
                          ? 75
                          : 40}

                      </span>

                      <span className="text-xs text-[#98A2B3] mb-1">

                        /100

                      </span>

                    </div>

                    <p className="text-xs text-[#667085] mt-1">

                      Estimated interview readiness

                    </p>

                  </div>

                  <div className="h-2.5 bg-[#EAECF0] rounded-full mt-4 overflow-hidden">

                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${
                          completedCount > 0
                            ? averageScore
                            : scheduledCount > 0
                            ? 75
                            : 40
                        }%`,
                      }}
                      transition={{
                        duration: 0.9,
                      }}
                      className="h-full bg-[#0F766E] rounded-full"
                    />

                  </div>

                </div>

                {/* SCORE */}

                <div className="bg-white border border-[#101828]/10 rounded-2xl p-6 shadow-sm">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-[#F7F5EF] flex items-center justify-center">

                      <BarChart3
                        size={18}
                        className="text-[#0F766E]"
                      />

                    </div>

                    <div>

                      <p className="text-xs text-[#98A2B3]">
                        Performance
                      </p>

                      <p className="font-semibold">
                        Interview overview
                      </p>

                    </div>

                  </div>

                  <div className="mt-5 space-y-4">

                    <InsightRow
                      label="Completed"
                      value={
                        completedCount
                      }
                      icon={
                        <CheckCircle2
                          size={15}
                        />
                      }
                    />

                    <InsightRow
                      label="Upcoming"
                      value={
                        scheduledCount
                      }
                      icon={
                        <Calendar
                          size={15}
                        />
                      }
                    />

                    <InsightRow
                      label="Cancelled"
                      value={
                        cancelledCount
                      }
                      icon={
                        <XCircle
                          size={15}
                        />
                      }
                    />

                    <InsightRow
                      label="Average score"
                      value={
                        `${averageScore}/100`
                      }
                      icon={
                        <TrendingUp
                          size={15}
                        />
                      }
                    />

                  </div>

                </div>

                {/* PREPARE */}

                <div className="relative overflow-hidden bg-gradient-to-br from-[#101828] via-[#102D36] to-[#0F3B3D] rounded-2xl p-6 text-white">

                  <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-[#0F766E]/25 blur-2xl" />

                  <div className="relative">

                    <div className="w-10 h-10 rounded-xl bg-[#0F766E]/20 flex items-center justify-center">

                      <Mic2
                        size={18}
                        className="text-[#8FE2D1]"
                      />

                    </div>

                    <h3 className="font-semibold mt-4">

                      Interview preparation

                    </h3>

                    <p className="text-xs text-white/50 leading-5 mt-2">

                      Find a quiet environment, check your
                      microphone and camera, and keep your
                      resume ready before beginning.

                    </p>

                    <div className="space-y-2 mt-5">

                      <PreparationItem
                        text="Camera & microphone"
                      />

                      <PreparationItem
                        text="Stable internet"
                      />

                      <PreparationItem
                        text="Quiet environment"
                      />

                      <PreparationItem
                        text="Resume ready"
                      />

                    </div>

                  </div>

                </div>

                {/* SECURITY */}

                <div className="flex items-start gap-3 bg-[#EAF5F1] border border-[#BFE5DB] rounded-2xl p-4">

                  <ShieldCheck
                    size={18}
                    className="text-[#0F766E] shrink-0"
                  />

                  <div>

                    <p className="text-xs font-semibold text-[#344054]">

                      Secure interview environment

                    </p>

                    <p className="text-[11px] text-[#667085] leading-5 mt-1">

                      Your interview activity is connected
                      to your authenticated Recruit_Ai account.

                    </p>

                  </div>

                </div>

              </div>

            </aside>

          </div>

          {/* =================================================
              BOTTOM INFORMATION
          ================================================= */}

          {interviews.length > 0 && (

            <div className="mt-7 bg-white border border-[#101828]/10 rounded-2xl p-5 md:p-6">

              <div className="flex items-start gap-4">

                <div className="w-10 h-10 rounded-xl bg-[#EAF5F1] flex items-center justify-center shrink-0">

                  <AlertCircle
                    size={18}
                    className="text-[#0F766E]"
                  />

                </div>

                <div>

                  <h3 className="font-semibold text-[#101828]">

                    Before starting your AI interview

                  </h3>

                  <div className="grid md:grid-cols-2 gap-x-8 gap-y-2 mt-3">

                    <PreparationText>
                      Make sure your camera and microphone are working.
                    </PreparationText>

                    <PreparationText>
                      Use a stable internet connection.
                    </PreparationText>

                    <PreparationText>
                      Choose a quiet environment.
                    </PreparationText>

                    <PreparationText>
                      Keep your resume and job information nearby.
                    </PreparationText>

                  </div>

                </div>

              </div>

            </div>

          )}

        </div>

      </main>

    </div>
  );
}

// =========================================================
// INTERVIEW CARD
// =========================================================

function InterviewCard({
  interview,
  index,
  getStatus,
  getStatusConfig,
  getJobTitle,
  getInterviewType,
  getInterviewDate,
  getInterviewTime,
  getDuration,
  getScore,
  formatDate,
  formatTime,
  canStartInterview,
  isCompleted,
  handleView,
  handleStart,
  handleResult,
}) {
  const status =
    getStatus(interview);

  const config =
    getStatusConfig(status);

  const StatusIcon =
    config.icon;

  const score =
    getScore(interview);

  return (
    <motion.article
      initial={{
        opacity: 0,
        y: 15,
      }}
      animate={{
        opacity: 1,
        y: 0,
      }}
      transition={{
        duration: 0.45,
        delay: index * 0.06,
      }}
      whileHover={{
        y: -3,
      }}
      className="bg-white border border-[#101828]/10 rounded-2xl shadow-sm hover:shadow-lg hover:shadow-[#101828]/5 transition-all overflow-hidden"
    >

      {/* TOP */}

      <div className="p-6">

        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">

          <div className="flex items-start gap-4">

            <div className="w-12 h-12 rounded-xl bg-[#EAF5F1] flex items-center justify-center shrink-0">

              <Brain
                size={23}
                className="text-[#0F766E]"
              />

            </div>

            <div>

              <div className="flex flex-wrap items-center gap-2">

                <h3 className="text-xl font-semibold text-[#101828]">

                  {getJobTitle(
                    interview
                  )}

                </h3>

                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-[11px] font-semibold ${config.bg} ${config.text} ${config.border}`}
                >

                  <StatusIcon size={13} />

                  {config.label}

                </span>

              </div>

              <div className="flex flex-wrap items-center gap-3 mt-2">

                <span className="text-sm text-[#667085]">

                  {getInterviewType(
                    interview
                  )}

                </span>

                {interview?.company_name && (

                  <>
                    <span className="w-1 h-1 rounded-full bg-[#D0D5DD]" />

                    <span className="text-sm text-[#667085]">

                      {interview.company_name}

                    </span>
                  </>
                )}

              </div>

            </div>

          </div>

          {/* SCORE */}

          <div className="md:text-right">

            <p className="text-[10px] uppercase tracking-[0.15em] text-[#98A2B3] font-bold">

              AI Score

            </p>

            <p className="text-3xl font-semibold text-[#101828]">

              {score}

              <span className="text-sm text-[#98A2B3] font-medium">
                /100
              </span>

            </p>

          </div>

        </div>

        {/* DETAILS */}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6">

          <InterviewInfo
            icon={
              <Calendar size={16} />
            }
            label="Date"
            value={formatDate(
              getInterviewDate(
                interview
              )
            )}
          />

          <InterviewInfo
            icon={
              <Clock size={16} />
            }
            label="Time"
            value={formatTime(
              getInterviewTime(
                interview
              )
            )}
          />

          <InterviewInfo
            icon={
              <Clock size={16} />
            }
            label="Duration"
            value={`${getDuration(
              interview
            )} min`}
          />

        </div>

        {/* EXTRA */}

        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 mt-4 text-xs text-[#667085]">

          <span className="flex items-center gap-2">

            <BriefcaseBusiness
              size={14}
              className="text-[#0F766E]"
            />

            {getJobTitle(
              interview
            )}

          </span>

          <span className="flex items-center gap-2">

            <Brain
              size={14}
              className="text-[#0F766E]"
            />

            AI assisted interview

          </span>

          {interview?.meeting_link && (

            <span className="flex items-center gap-2 text-[#0F766E]">

              <Video size={14} />

              Meeting available

            </span>

          )}

        </div>

      </div>

      {/* ACTION BAR */}

      <div className="border-t border-[#EAECF0] bg-[#FCFCFA] px-6 py-4">

        <div className="flex flex-wrap items-center gap-2">

          <button
            onClick={() =>
              handleView(
                interview
              )
            }
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#D0D5DD] text-[#344054] text-sm font-semibold hover:border-[#0F766E] hover:text-[#0F766E] transition"
          >

            <Eye size={15} />

            View Interview

          </button>

          {canStartInterview(
            interview
          ) && (

            <button
              onClick={() =>
                handleStart(
                  interview
                )
              }
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101828] hover:bg-[#0F766E] text-white text-sm font-semibold transition"
            >

              <Play
                size={15}
                fill="currentColor"
              />

              Start Interview

            </button>

          )}

          {isCompleted(
            interview
          ) && (

            <button
              onClick={() =>
                handleResult(
                  interview
                )
              }
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0F766E] hover:bg-[#0B625B] text-white text-sm font-semibold transition"
            >

              <Award size={15} />

              View Result

            </button>

          )}

          {interview?.meeting_link && (

            <a
              href={
                interview.meeting_link
              }
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#EAF5F1] text-[#0F766E] text-sm font-semibold hover:bg-[#DDF5EF] transition"
            >

              <Video size={15} />

              Meeting

            </a>

          )}

          <ChevronRight
            size={17}
            className="ml-auto text-[#D0D5DD]"
          />

        </div>

      </div>

    </motion.article>
  );
}

// =========================================================
// INTERVIEW INFO
// =========================================================

function InterviewInfo({
  icon,
  label,
  value,
}) {
  return (
    <div className="bg-[#FCFCFA] border border-[#EAECF0] rounded-xl p-4">

      <div className="flex items-center gap-2 text-[#0F766E]">

        {icon}

        <span className="text-[10px] uppercase tracking-wider text-[#98A2B3] font-bold">

          {label}

        </span>

      </div>

      <p className="text-sm font-semibold text-[#344054] mt-2">

        {value}

      </p>

    </div>
  );
}

// =========================================================
// HERO METRIC
// =========================================================

function HeroMetric({
  label,
  value,
  icon,
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-xl p-3.5">

      <div className="flex items-center gap-2 text-[#8FE2D1]">

        {icon}

        <span className="text-[10px] uppercase tracking-wider font-semibold text-white/40">

          {label}

        </span>

      </div>

      <p className="text-sm font-semibold text-white/80 mt-2">

        {value}

      </p>

    </div>
  );
}

// =========================================================
// INSIGHT ROW
// =========================================================

function InsightRow({
  label,
  value,
  icon,
}) {
  return (
    <div className="flex items-center justify-between">

      <div className="flex items-center gap-2.5">

        <div className="w-7 h-7 rounded-lg bg-[#EAF5F1] flex items-center justify-center text-[#0F766E]">

          {icon}

        </div>

        <span className="text-xs text-[#667085]">

          {label}

        </span>

      </div>

      <span className="text-xs font-bold text-[#344054]">

        {value}

      </span>

    </div>
  );
}

// =========================================================
// PREPARATION ITEM
// =========================================================

function PreparationItem({
  text,
}) {
  return (
    <div className="flex items-center gap-2 text-xs text-white/60">

      <CheckCircle2
        size={14}
        className="text-[#8FE2D1]"
      />

      {text}

    </div>
  );
}

// =========================================================
// PREPARATION TEXT
// =========================================================

function PreparationText({
  children,
}) {
  return (
    <div className="flex items-start gap-2 text-xs text-[#667085]">

      <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E] mt-1.5 shrink-0" />

      {children}

    </div>
  );
}

// =========================================================
// EMPTY STATE
// =========================================================

function EmptyState({
  navigate,
}) {
  return (
    <div className="bg-white border border-[#101828]/10 rounded-2xl p-10 md:p-16 text-center shadow-sm">

      <div className="w-16 h-16 mx-auto rounded-2xl bg-[#EAF5F1] flex items-center justify-center">

        <Calendar
          size={29}
          className="text-[#0F766E]"
        />

      </div>

      <h2 className="text-xl font-semibold text-[#101828] mt-5">

        No interviews yet

      </h2>

      <p className="text-sm text-[#667085] mt-2 max-w-md mx-auto leading-6">

        You don't have any interviews scheduled yet.
        When an organization schedules an interview,
        it will appear here.

      </p>

      <button
        onClick={() =>
          navigate("/jobs")
        }
        className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-xl text-sm font-semibold transition"
      >

        Explore Jobs

        <ArrowRight size={15} />

      </button>

    </div>
  );
}

export default InterviewList;