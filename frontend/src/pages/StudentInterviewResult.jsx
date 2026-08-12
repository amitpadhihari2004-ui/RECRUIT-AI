import React, {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  ArrowLeft,
  ArrowRight,
  Award,
  BarChart3,
  Brain,
  BriefcaseBusiness,
  Calendar,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock,
  FileText,
  Loader2,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Video,
  XCircle,
  AlertTriangle,
  MonitorCheck,
  Copy,
  Mic,
  Camera,
} from "lucide-react";

import { motion } from "framer-motion";

import Sidebar from "../components/Sidebar";

import {
  getInterview,
  getProctoring,
} from "../api/interviewApi";


// =========================================================
// STUDENT INTERVIEW RESULT
// =========================================================

export default function StudentInterviewResult() {

  const {
    interviewId,
  } = useParams();

  const navigate =
    useNavigate();


  // =======================================================
  // STATE
  // =======================================================

  const [
    interview,
    setInterview,
  ] = useState(null);

  const [
    proctoring,
    setProctoring,
  ] = useState(null);

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    error,
    setError,
  ] = useState("");

  const [
    showEvents,
    setShowEvents,
  ] = useState(false);


  // =======================================================
  // LOAD RESULT
  // =======================================================

  useEffect(() => {

    if (!interviewId) {

      setError(
        "Interview ID is missing."
      );

      setLoading(false);

      return;

    }

    loadResult();

  }, [interviewId]);


  // =======================================================
  // LOAD INTERVIEW + PROCTORING
  // =======================================================

  const loadResult = async () => {

    try {

      setLoading(true);

      setError("");


      // ===================================================
      // INTERVIEW
      // ===================================================

      const response =
        await getInterview(
          interviewId
        );


      console.log(
        "INTERVIEW RESULT RESPONSE:",
        response
      );


      const interviewData =
        response?.interview ||
        response?.data?.interview ||
        response?.data ||
        response;


      if (
        !interviewData ||
        typeof interviewData !== "object"
      ) {

        throw new Error(
          "Interview result not found."
        );

      }


      setInterview(
        interviewData
      );


      // ===================================================
      // PROCTORING
      // ===================================================

      try {

        const proctoringResponse =
          await getProctoring(
            interviewId
          );


        console.log(
          "PROCTORING RESULT RESPONSE:",
          proctoringResponse
        );


        const proctoringData =
          proctoringResponse?.proctoring ||
          proctoringResponse?.data?.proctoring ||
          proctoringResponse?.data ||
          null;


        if (
          proctoringData &&
          typeof proctoringData === "object"
        ) {

          setProctoring(
            proctoringData
          );

        } else {

          setProctoring(null);

        }

      } catch (
        proctoringError
      ) {

        console.warn(
          "Unable to load proctoring result:",
          proctoringError
        );

        setProctoring(null);

      }

    } catch (err) {

      console.error(
        "Interview result loading error:",
        err
      );


      setError(
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Unable to load interview result."
      );

    } finally {

      setLoading(false);

    }

  };


  // =======================================================
  // EVALUATION
  // =======================================================

  const evaluation =
    interview?.evaluation ||
    interview?.ai_evaluation ||
    interview?.result ||
    interview?.assessment ||
    interview?.ai_result ||
    {};


  // =======================================================
  // SCORE
  // =======================================================

  const rawScore =
    evaluation?.score ??
    evaluation?.overall_score ??
    evaluation?.final_score ??
    evaluation?.total_score ??
    interview?.score ??
    interview?.overall_score ??
    0;


  const parsedScore =
    Number(rawScore);


  const score =
    Number.isFinite(parsedScore)
      ? Math.max(
          0,
          Math.min(
            100,
            parsedScore
          )
        )
      : 0;


  // =======================================================
  // FEEDBACK
  // =======================================================

  const feedback =
    evaluation?.feedback ||
    evaluation?.overall_feedback ||
    evaluation?.summary ||
    evaluation?.overall_summary ||
    evaluation?.comments ||
    interview?.feedback ||
    interview?.overall_feedback ||
    "No feedback available.";


  // =======================================================
  // STRENGTHS
  // =======================================================

  const strengths =
    Array.isArray(
      evaluation?.strengths
    )
      ? evaluation.strengths
      : Array.isArray(
          interview?.strengths
        )
      ? interview.strengths
      : [];


  // =======================================================
  // WEAKNESSES
  // =======================================================

  const weaknesses =
    Array.isArray(
      evaluation?.weaknesses
    )
      ? evaluation.weaknesses
      : Array.isArray(
          evaluation?.areas_for_improvement
        )
      ? evaluation.areas_for_improvement
      : Array.isArray(
          interview?.weaknesses
        )
      ? interview.weaknesses
      : [];


  // =======================================================
  // RECOMMENDATION
  // =======================================================

  const recommendation =
    evaluation?.recommendation ||
    evaluation?.hiring_recommendation ||
    evaluation?.final_recommendation ||
    evaluation?.result ||
    interview?.recommendation ||
    interview?.hiring_recommendation ||
    "Not available";


  // =======================================================
  // SCORE LABEL
  // =======================================================

  const getScoreLabel = () => {

    if (score >= 90) {
      return "Excellent";
    }

    if (score >= 80) {
      return "Very Good";
    }

    if (score >= 70) {
      return "Good";
    }

    if (score >= 60) {
      return "Average";
    }

    if (score >= 40) {
      return "Needs Improvement";
    }

    return "Needs Significant Improvement";

  };


  // =======================================================
  // SCORE STYLE
  // =======================================================

  const getScoreStyle = () => {

    if (score >= 80) {

      return {
        text: "text-[#0F766E]",
        bg: "bg-[#EAF5F1]",
        border: "border-[#BFE5DB]",
      };

    }

    if (score >= 60) {

      return {
        text: "text-[#8A6200]",
        bg: "bg-[#FFF8E7]",
        border: "border-[#F1D99A]",
      };

    }

    return {

      text: "text-[#C95F4C]",
      bg: "bg-[#FFF1EE]",
      border: "border-[#F3C7BD]",

    };

  };


  // =======================================================
  // RECOMMENDATION TYPE
  // =======================================================

  const getRecommendationType = () => {

    const value =
      String(
        recommendation
      ).toLowerCase();


    // Check negative FIRST so
    // "not recommended" does not
    // accidentally match "recommended".

    if (
      value.includes("reject") ||
      value.includes("rejected") ||
      value.includes("fail") ||
      value.includes("not recommended") ||
      value.includes("not selected")
    ) {

      return "negative";

    }


    if (
      value.includes("pass") ||
      value.includes("select") ||
      value.includes("selected") ||
      value.includes("hire") ||
      value.includes("hired") ||
      value.includes("recommended")
    ) {

      return "positive";

    }


    return "neutral";

  };


  // =======================================================
  // RECOMMENDATION STYLE
  // =======================================================

  const getRecommendationStyle = () => {

    const type =
      getRecommendationType();


    if (type === "positive") {

      return {

        text: "text-[#0F766E]",
        bg: "bg-[#EAF5F1]",
        border: "border-[#BFE5DB]",
        icon: CheckCircle2,

      };

    }


    if (type === "negative") {

      return {

        text: "text-[#C95F4C]",
        bg: "bg-[#FFF1EE]",
        border: "border-[#F3C7BD]",
        icon: XCircle,

      };

    }


    return {

      text: "text-[#8A6200]",
      bg: "bg-[#FFF8E7]",
      border: "border-[#F1D99A]",
      icon: AlertTriangle,

    };

  };


  // =======================================================
  // PROCTORING STATUS
  // =======================================================

  const getProctoringStatus =
    () => {

      const value =
        String(
          proctoring?.overall_status ||
          "Normal"
        ).toLowerCase();


      if (
        value === "normal"
      ) {

        return {

          label: "Normal",
          text: "text-[#0F766E]",
          bg: "bg-[#EAF5F1]",
          border: "border-[#BFE5DB]",
          icon: ShieldCheck,

        };

      }


      if (
        value === "review"
      ) {

        return {

          label: "Review Required",
          text: "text-[#8A6200]",
          bg: "bg-[#FFF8E7]",
          border: "border-[#F1D99A]",
          icon: AlertTriangle,

        };

      }


      if (
        value === "suspicious"
      ) {

        return {

          label: "Suspicious",
          text: "text-[#B54708]",
          bg: "bg-[#FFF4E5]",
          border: "border-[#F5D0A9]",
          icon: AlertTriangle,

        };

      }


      return {

        label:
          proctoring?.overall_status ||
          "Flagged",

        text: "text-[#C95F4C]",
        bg: "bg-[#FFF1EE]",
        border: "border-[#F3C7BD]",
        icon: XCircle,

      };

    };


  // =======================================================
  // FORMAT LIST ITEM
  // =======================================================

  const formatListItem =
    (item) => {

      if (
        typeof item === "string"
      ) {

        return item;

      }


      if (
        item &&
        typeof item === "object"
      ) {

        return (
          item.text ||
          item.description ||
          item.reason ||
          item.feedback ||
          item.message ||
          JSON.stringify(item)
        );

      }


      return String(item);

    };


  // =======================================================
  // FORMAT DATE
  // =======================================================

  const formatDate =
    (value) => {

      if (!value) {

        return "Not available";

      }


      try {

        const date =
          new Date(value);


        if (
          Number.isNaN(
            date.getTime()
          )
        ) {

          return String(value);

        }


        return date.toLocaleString(
          "en-IN",
          {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }
        );

      } catch {

        return String(value);

      }

    };


  // =======================================================
  // PROCTORING EVENTS
  // =======================================================

  const proctoringEvents =
    Array.isArray(
      proctoring?.events
    )
      ? proctoring.events
      : [];


  // =======================================================
  // PROCTORING COUNTERS
  // =======================================================

  const securityStats = useMemo(() => {

    return {

      warnings:
        Number(
          proctoring?.warnings || 0
        ),

      tabSwitches:
        Number(
          proctoring?.tab_switches || 0
        ),

      fullscreenExits:
        Number(
          proctoring?.fullscreen_exits || 0
        ),

      suspicious:
        Number(
          proctoring?.suspicious_events || 0
        ),

      multiplePerson:
        Number(
          proctoring?.multiple_person_detected || 0
        ),

      faceNotDetected:
        Number(
          proctoring?.face_not_detected || 0
        ),

      camera:
        Number(
          proctoring?.camera_warnings || 0
        ),

      microphone:
        Number(
          proctoring?.microphone_warnings || 0
        ),

      copyPaste:
        Number(
          proctoring?.copy_paste_events || 0
        ),

    };

  }, [proctoring]);


  // =======================================================
  // RECOMMENDATION UI
  // =======================================================

  const recommendationStyle =
    getRecommendationStyle();

  const RecommendationIcon =
    recommendationStyle.icon;


  // =======================================================
  // PROCTORING UI
  // =======================================================

  const proctoringStyle =
    getProctoringStatus();

  const ProctoringIcon =
    proctoringStyle.icon;


  // =======================================================
  // LOADING
  // =======================================================

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

            <h2 className="text-xl font-semibold text-[#101828] mt-5">

              Loading interview result

            </h2>

            <p className="text-sm text-[#667085] mt-2">

              Fetching your AI evaluation...

            </p>

          </div>

        </main>

      </div>

    );

  }


  // =======================================================
  // ERROR
  // =======================================================

  if (error) {

    return (

      <div className="flex min-h-screen bg-gradient-to-br from-[#EDF8F3] via-[#F7F5EF] to-[#EEF2F8]">

        <Sidebar />

        <main className="flex-1 flex items-center justify-center px-6">

          <div className="max-w-md w-full bg-white border border-[#101828]/10 rounded-3xl p-8 text-center shadow-sm">

            <div className="w-14 h-14 rounded-2xl bg-[#FFF1EE] text-[#C95F4C] flex items-center justify-center mx-auto">

              <AlertTriangle size={25} />

            </div>

            <h1 className="text-2xl font-semibold text-[#101828] mt-5">

              Result not available

            </h1>

            <p className="text-sm text-[#667085] leading-6 mt-3">

              {error}

            </p>

            <div className="flex flex-col gap-3 mt-7">

              <button
                onClick={
                  loadResult
                }
                className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-xl font-semibold transition"
              >

                Try Again

                <ArrowRight
                  size={16}
                />

              </button>

              <button
                onClick={() =>
                  navigate(
                    "/student/dashboard"
                  )
                }
                className="w-full px-6 py-3 bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] rounded-xl font-semibold transition"
              >

                Back to Dashboard

              </button>

            </div>

          </div>

        </main>

      </div>

    );

  }


  // =======================================================
  // PAGE
  // =======================================================

  return (

    <div className="flex min-h-screen bg-gradient-to-br from-[#EDF8F3] via-[#F7F5EF] to-[#EEF2F8] text-[#101828]">

      <Sidebar />

      <main className="flex-1 min-w-0 overflow-y-auto">

        {/* =================================================
            DECORATIVE BACKGROUND
        ================================================= */}

        <div className="fixed inset-0 pointer-events-none overflow-hidden">

          <div className="absolute -top-60 right-[-150px] w-[600px] h-[600px] rounded-full bg-[#CDEDE3]/35 blur-3xl" />

          <div className="absolute bottom-[-220px] left-[-150px] w-[600px] h-[600px] rounded-full bg-[#DCE5F5]/30 blur-3xl" />

        </div>


        <div className="relative max-w-7xl mx-auto px-5 md:px-8 py-6 md:py-8">


          {/* =================================================
              TOP NAV
          ================================================= */}

          <div className="flex items-center justify-between mb-6">

            <button
              onClick={() =>
                navigate(
                  "/student/interviews"
                )
              }
              className="flex items-center gap-2 text-sm font-medium text-[#667085] hover:text-[#0F766E] transition"
            >

              <ArrowLeft
                size={17}
              />

              Back to interviews

            </button>


            <button
              onClick={() =>
                navigate(
                  "/student/dashboard"
                )
              }
              className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#101828]/10 text-sm font-semibold text-[#344054] hover:border-[#0F766E] hover:text-[#0F766E] transition shadow-sm"
            >

              Dashboard

              <ArrowRight
                size={15}
              />

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
            className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#102D36] via-[#102A34] to-[#101828] text-white"
          >

            <div className="absolute -right-40 -top-48 w-[600px] h-[600px] rounded-full bg-[#0F766E]/20 blur-3xl" />

            <div className="relative p-6 md:p-9">

              <div className="grid lg:grid-cols-[1fr_300px] gap-10 items-center">

                {/* HERO LEFT */}

                <div>

                  <div className="inline-flex items-center gap-2 text-[#8FE2D1] text-xs font-semibold uppercase tracking-[0.16em]">

                    <span className="w-2 h-2 rounded-full bg-[#8FE2D1]" />

                    Interview Performance

                  </div>


                  <h1 className="text-3xl md:text-5xl font-semibold tracking-[-0.045em] mt-4">

                    Your interview
                    <br />

                    <span className="text-[#8FE2D1]">
                      results are ready.
                    </span>

                  </h1>


                  <p className="mt-4 max-w-xl text-sm leading-7 text-white/55">

                    Review your AI evaluation, understand
                    your strengths, identify areas to improve,
                    and use the feedback to prepare for your
                    next opportunity.

                  </p>


                  <div className="flex flex-wrap gap-2 mt-6">

                    <HeroTag
                      icon={
                        <Brain size={14} />
                      }
                      text="AI Evaluation"
                    />

                    <HeroTag
                      icon={
                        <ShieldCheck size={14} />
                      }
                      text="Proctoring Checked"
                    />

                    <HeroTag
                      icon={
                        <BarChart3 size={14} />
                      }
                      text="Performance Analysis"
                    />

                  </div>

                </div>


                {/* HERO SCORE */}

                <div className="bg-white/[0.06] border border-white/10 rounded-2xl p-6">

                  <p className="text-[10px] uppercase tracking-[0.16em] text-white/40 font-bold">

                    Overall Score

                  </p>


                  <div className="flex items-end gap-2 mt-3">

                    <span className="text-6xl font-semibold text-[#8FE2D1]">

                      {score}

                    </span>

                    <span className="text-white/35 mb-2">

                      /100

                    </span>

                  </div>


                  <p className="text-sm font-semibold text-white/75 mt-2">

                    {getScoreLabel()}

                  </p>


                  <div className="h-2 bg-white/10 rounded-full mt-5 overflow-hidden">

                    <motion.div
                      initial={{
                        width: 0,
                      }}
                      animate={{
                        width: `${score}%`,
                      }}
                      transition={{
                        duration: 1,
                        ease: "easeOut",
                      }}
                      className="h-full bg-[#0F766E] rounded-full"
                    />

                  </div>


                  <p className="text-[11px] text-white/35 mt-2">

                    Based on your AI interview evaluation

                  </p>

                </div>

              </div>

            </div>

          </motion.section>


          {/* =================================================
              INTERVIEW META
          ================================================= */}

          <div className="mt-6 bg-white border border-[#101828]/10 rounded-2xl p-5 md:p-6 shadow-sm">

            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5">

              <div>

                <p className="text-[10px] uppercase tracking-[0.16em] text-[#0F766E] font-bold">

                  Completed Interview

                </p>


                <h2 className="text-2xl font-semibold mt-1">

                  {interview?.round_name ||
                    interview?.title ||
                    "AI Interview"}

                </h2>


                <div className="flex flex-wrap gap-2 mt-3">

                  <MetaTag
                    icon={
                      <Brain size={13} />
                    }
                    text={
                      interview?.interview_type ||
                      "AI Interview"
                    }
                  />


                  {interview?.job_title && (

                    <MetaTag
                      icon={
                        <BriefcaseBusiness
                          size={13}
                        />
                      }
                      text={
                        interview.job_title
                      }
                    />

                  )}


                  {interview?.department && (

                    <MetaTag
                      icon={
                        <UserCheck
                          size={13}
                        />
                      }
                      text={
                        interview.department
                      }
                    />

                  )}

                </div>

              </div>


              <div className="flex flex-wrap gap-5 text-sm">

                {interview?.completed_at && (

                  <div className="flex items-center gap-2 text-[#667085]">

                    <Calendar
                      size={16}
                      className="text-[#0F766E]"
                    />

                    <div>

                      <p className="text-[10px] text-[#98A2B3] uppercase font-bold">
                        Completed
                      </p>

                      <p className="font-medium text-[#344054]">
                        {formatDate(
                          interview.completed_at
                        )}
                      </p>

                    </div>

                  </div>

                )}


                {interview?.duration && (

                  <div className="flex items-center gap-2 text-[#667085]">

                    <Clock
                      size={16}
                      className="text-[#0F766E]"
                    />

                    <div>

                      <p className="text-[10px] text-[#98A2B3] uppercase font-bold">
                        Duration
                      </p>

                      <p className="font-medium text-[#344054]">
                        {interview.duration} min
                      </p>

                    </div>

                  </div>

                )}

              </div>

            </div>

          </div>


          {/* =================================================
              KEY RESULTS
          ================================================= */}

          <div className="grid md:grid-cols-3 gap-5 mt-6">


            {/* SCORE */}

            <ResultMetric
              icon={
                <TrendingUp size={19} />
              }
              label="Overall Score"
              value={`${score}/100`}
              description={
                getScoreLabel()
              }
              accent="teal"
            />


            {/* STATUS */}

            <ResultMetric
              icon={
                <CheckCircle2
                  size={19}
                />
              }
              label="Interview Status"
              value={
                interview?.status ||
                "Completed"
              }
              description="Interview completed successfully"
              accent="neutral"
            />


            {/* RECOMMENDATION */}

            <div
              className={`rounded-2xl border p-5 shadow-sm ${recommendationStyle.bg} ${recommendationStyle.border}`}
            >

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center">

                  <RecommendationIcon
                    size={19}
                    className={
                      recommendationStyle.text
                    }
                  />

                </div>

                <div>

                  <p className="text-xs text-[#667085]">
                    AI Recommendation
                  </p>

                  <p
                    className={`font-semibold mt-1 ${recommendationStyle.text}`}
                  >
                    {String(
                      recommendation
                    )}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              AI FEEDBACK
          ================================================= */}

          <motion.section
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            className="mt-6 bg-white border border-[#101828]/10 rounded-2xl p-6 shadow-sm"
          >

            <div className="flex items-start gap-4">

              <div className="w-11 h-11 rounded-xl bg-[#EAF5F1] flex items-center justify-center shrink-0">

                <Sparkles
                  size={20}
                  className="text-[#0F766E]"
                />

              </div>


              <div className="flex-1">

                <div className="flex flex-wrap items-center justify-between gap-3">

                  <div>

                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#0F766E] font-bold">

                      Recruit_Ai Intelligence

                    </p>

                    <h3 className="text-xl font-semibold mt-1">

                      AI Feedback

                    </h3>

                  </div>


                  <span className="px-3 py-1 rounded-full bg-[#EAF5F1] border border-[#BFE5DB] text-[#0F766E] text-[11px] font-semibold">

                    Evaluation Complete

                  </span>

                </div>


                <p className="text-sm text-[#475467] leading-7 mt-5 whitespace-pre-line">

                  {String(
                    feedback
                  )}

                </p>

              </div>

            </div>

          </motion.section>


          {/* =================================================
              STRENGTHS + IMPROVEMENT
          ================================================= */}

          <div className="grid lg:grid-cols-2 gap-6 mt-6">


            {/* STRENGTHS */}

            <FeedbackCard
              title="Your Strengths"
              description="What you performed well in during the interview."
              icon={
                <CheckCircle2
                  size={19}
                />
              }
              type="strength"
              items={strengths}
              formatListItem={
                formatListItem
              }
            />


            {/* IMPROVEMENT */}

            <FeedbackCard
              title="Areas to Improve"
              description="Focus areas that can strengthen your next interview."
              icon={
                <Target
                  size={19}
                />
              }
              type="improvement"
              items={weaknesses}
              formatListItem={
                formatListItem
              }
            />

          </div>


          {/* =================================================
              PERFORMANCE SUMMARY
          ================================================= */}

          <section className="mt-6 bg-white border border-[#101828]/10 rounded-2xl p-6 shadow-sm">

            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-xl bg-[#F7F5EF] flex items-center justify-center">

                <BarChart3
                  size={18}
                  className="text-[#0F766E]"
                />

              </div>

              <div>

                <p className="text-[10px] uppercase tracking-[0.16em] text-[#98A2B3] font-bold">

                  Performance overview

                </p>

                <h3 className="text-xl font-semibold mt-1">

                  Your interview at a glance

                </h3>

              </div>

            </div>


            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">

              <PerformanceBox
                icon={
                  <Award size={17} />
                }
                label="Score"
                value={`${score}/100`}
              />

              <PerformanceBox
                icon={
                  <TrendingUp size={17} />
                }
                label="Rating"
                value={getScoreLabel()}
              />

              <PerformanceBox
                icon={
                  <CheckCircle2
                    size={17}
                  />
                }
                label="Strengths"
                value={strengths.length}
              />

              <PerformanceBox
                icon={
                  <Target size={17} />
                }
                label="Improvement Areas"
                value={weaknesses.length}
              />

            </div>

          </section>


          {/* =================================================
              PROCTORING
          ================================================= */}

          <section className="mt-6 bg-white border border-[#101828]/10 rounded-2xl shadow-sm overflow-hidden">

            <div className="p-6">

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">

                <div className="flex items-start gap-4">

                  <div className="w-11 h-11 rounded-xl bg-[#EAF5F1] flex items-center justify-center shrink-0">

                    <ShieldCheck
                      size={20}
                      className="text-[#0F766E]"
                    />

                  </div>

                  <div>

                    <p className="text-[10px] uppercase tracking-[0.16em] text-[#0F766E] font-bold">

                      Interview Security

                    </p>

                    <h3 className="text-xl font-semibold mt-1">

                      Proctoring Summary

                    </h3>

                    <p className="text-sm text-[#667085] mt-1">

                      Overview of browser and interview security events.

                    </p>

                  </div>

                </div>


                {proctoring && (

                  <div
                    className={`inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-semibold ${proctoringStyle.bg} ${proctoringStyle.text} ${proctoringStyle.border}`}
                  >

                    <ProctoringIcon
                      size={15}
                    />

                    {proctoringStyle.label}

                  </div>

                )}

              </div>


              {!proctoring ? (

                <div className="mt-6 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl p-5">

                  <div className="flex items-start gap-3">

                    <AlertTriangle
                      size={18}
                      className="text-[#98A2B3] mt-0.5"
                    />

                    <div>

                      <p className="font-medium text-[#344054]">

                        Proctoring data unavailable

                      </p>

                      <p className="text-sm text-[#667085] mt-1">

                        A proctoring summary was not available
                        for this interview.

                      </p>

                    </div>

                  </div>

                </div>

              ) : (

                <>

                  {/* SECURITY COUNTERS */}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">

                    <SecurityMetric
                      icon={
                        <AlertTriangle
                          size={16}
                        />
                      }
                      label="Warnings"
                      value={
                        securityStats.warnings
                      }
                      warning={
                        securityStats.warnings > 0
                      }
                    />

                    <SecurityMetric
                      icon={
                        <MonitorCheck
                          size={16}
                        />
                      }
                      label="Tab Switches"
                      value={
                        securityStats.tabSwitches
                      }
                      warning={
                        securityStats.tabSwitches > 0
                      }
                    />

                    <SecurityMetric
                      icon={
                        <MonitorCheck
                          size={16}
                        />
                      }
                      label="Fullscreen Exits"
                      value={
                        securityStats.fullscreenExits
                      }
                      warning={
                        securityStats.fullscreenExits > 0
                      }
                    />

                    <SecurityMetric
                      icon={
                        <AlertTriangle
                          size={16}
                        />
                      }
                      label="Suspicious Events"
                      value={
                        securityStats.suspicious
                      }
                      warning={
                        securityStats.suspicious > 0
                      }
                    />

                  </div>


                  {/* SECONDARY COUNTERS */}

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">

                    <SecurityMetric
                      icon={
                        <UserCheck
                          size={16}
                        />
                      }
                      label="Multiple Person"
                      value={
                        securityStats.multiplePerson
                      }
                      warning={
                        securityStats.multiplePerson > 0
                      }
                    />

                    <SecurityMetric
                      icon={
                        <Camera
                          size={16}
                        />
                      }
                      label="Face Not Detected"
                      value={
                        securityStats.faceNotDetected
                      }
                      warning={
                        securityStats.faceNotDetected > 0
                      }
                    />

                    <SecurityMetric
                      icon={
                        <Camera
                          size={16}
                        />
                      }
                      label="Camera Warnings"
                      value={
                        securityStats.camera
                      }
                      warning={
                        securityStats.camera > 0
                      }
                    />

                    <SecurityMetric
                      icon={
                        <Mic
                          size={16}
                        />
                      }
                      label="Microphone"
                      value={
                        securityStats.microphone
                      }
                      warning={
                        securityStats.microphone > 0
                      }
                    />

                  </div>


                  {/* COPY PASTE */}

                  <div className="mt-3 flex items-center justify-between bg-[#FCFCFA] border border-[#EAECF0] rounded-xl p-4">

                    <div className="flex items-center gap-3">

                      <div className="w-9 h-9 rounded-lg bg-[#F2F4F7] flex items-center justify-center">

                        <Copy
                          size={16}
                          className="text-[#667085]"
                        />

                      </div>

                      <div>

                        <p className="text-sm font-semibold text-[#344054]">

                          Copy / Paste Events

                        </p>

                        <p className="text-xs text-[#98A2B3] mt-1">

                          Recorded browser interaction events

                        </p>

                      </div>

                    </div>


                    <span
                      className={`text-xl font-bold ${
                        securityStats.copyPaste > 0
                          ? "text-[#C95F4C]"
                          : "text-[#0F766E]"
                      }`}
                    >

                      {
                        securityStats.copyPaste
                      }

                    </span>

                  </div>


                  {/* EVENTS */}

                  {proctoringEvents.length > 0 && (

                    <div className="mt-4 border border-[#EAECF0] rounded-xl overflow-hidden">

                      <button
                        onClick={() =>
                          setShowEvents(
                            !showEvents
                          )
                        }
                        className="w-full flex items-center justify-between p-4 hover:bg-[#FCFCFA] transition"
                      >

                        <div className="flex items-center gap-3">

                          <FileText
                            size={17}
                            className="text-[#0F766E]"
                          />

                          <div className="text-left">

                            <p className="text-sm font-semibold text-[#344054]">

                              Security Events

                            </p>

                            <p className="text-xs text-[#98A2B3] mt-0.5">

                              {proctoringEvents.length} recorded event
                              {proctoringEvents.length !== 1
                                ? "s"
                                : ""}

                            </p>

                          </div>

                        </div>


                        {showEvents ? (

                          <ChevronUp
                            size={18}
                            className="text-[#667085]"
                          />

                        ) : (

                          <ChevronDown
                            size={18}
                            className="text-[#667085]"
                          />

                        )}

                      </button>


                      {showEvents && (

                        <div className="border-t border-[#EAECF0] bg-[#FCFCFA] p-4">

                          <div className="space-y-3 max-h-80 overflow-y-auto">

                            {proctoringEvents.map(
                              (
                                event,
                                index
                              ) => (

                                <SecurityEvent
                                  key={
                                    index
                                  }
                                  event={
                                    event
                                  }
                                  formatDate={
                                    formatDate
                                  }
                                />

                              )
                            )}

                          </div>

                        </div>

                      )}

                    </div>

                  )}

                </>

              )}

            </div>

          </section>


          {/* =================================================
              COMPLETION MESSAGE
          ================================================= */}

          <section className="mt-6 relative overflow-hidden bg-gradient-to-br from-[#EAF5F1] to-[#F7F5EF] border border-[#BFE5DB] rounded-2xl p-6">

            <div className="absolute right-[-70px] top-[-90px] w-64 h-64 rounded-full bg-[#0F766E]/10 blur-3xl" />

            <div className="relative flex flex-col md:flex-row md:items-center gap-5">

              <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shrink-0">

                <CheckCircle2
                  size={23}
                  className="text-[#0F766E]"
                />

              </div>


              <div>

                <p className="text-[10px] uppercase tracking-[0.16em] text-[#0F766E] font-bold">

                  Interview Completed

                </p>

                <h3 className="text-xl font-semibold mt-1">

                  Your evaluation has been recorded successfully.

                </h3>

                <p className="text-sm text-[#667085] leading-6 mt-1 max-w-3xl">

                  Your interview answers, AI evaluation and
                  available proctoring information have been
                  recorded. The organization can review your
                  interview result.

                </p>

              </div>

            </div>

          </section>


          {/* =================================================
              ACTIONS
          ================================================= */}

          <div className="flex flex-col sm:flex-row gap-3 mt-7 pb-8">

            <button
              onClick={() =>
                navigate(
                  "/student/interviews"
                )
              }
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#101828] hover:bg-[#0F766E] text-white font-semibold transition"
            >

              <ArrowLeft
                size={16}
              />

              Back to Interviews

            </button>


            <button
              onClick={() =>
                navigate(
                  "/student/dashboard"
                )
              }
              className="flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white border border-[#D0D5DD] hover:border-[#0F766E] hover:text-[#0F766E] text-[#344054] font-semibold transition"
            >

              Dashboard

              <ArrowRight
                size={16}
              />

            </button>

          </div>

        </div>

      </main>

    </div>

  );

}


// =========================================================
// HERO TAG
// =========================================================

function HeroTag({
  icon,
  text,
}) {

  return (

    <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-white/5 border border-white/10 text-xs text-white/60">

      <span className="text-[#8FE2D1]">
        {icon}
      </span>

      {text}

    </div>

  );

}


// =========================================================
// META TAG
// =========================================================

function MetaTag({
  icon,
  text,
}) {

  return (

    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F2F4F7] border border-[#EAECF0] text-xs font-medium text-[#667085]">

      <span className="text-[#0F766E]">
        {icon}
      </span>

      {text}

    </span>

  );

}


// =========================================================
// RESULT METRIC
// =========================================================

function ResultMetric({
  icon,
  label,
  value,
  description,
  accent,
}) {

  const isTeal =
    accent === "teal";


  return (

    <div className="bg-white border border-[#101828]/10 rounded-2xl p-5 shadow-sm">

      <div className="flex items-center gap-3">

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isTeal
              ? "bg-[#EAF5F1] text-[#0F766E]"
              : "bg-[#F2F4F7] text-[#667085]"
          }`}
        >

          {icon}

        </div>

        <div>

          <p className="text-xs text-[#667085]">

            {label}

          </p>

          <p className="text-xl font-semibold text-[#101828] mt-0.5">

            {value}

          </p>

        </div>

      </div>

      <p className="text-xs text-[#98A2B3] mt-4">

        {description}

      </p>

    </div>

  );

}


// =========================================================
// FEEDBACK CARD
// =========================================================

function FeedbackCard({
  title,
  description,
  icon,
  type,
  items,
  formatListItem,
}) {

  const isStrength =
    type === "strength";


  return (

    <section className="bg-white border border-[#101828]/10 rounded-2xl p-6 shadow-sm">

      <div className="flex items-start gap-3">

        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isStrength
              ? "bg-[#EAF5F1] text-[#0F766E]"
              : "bg-[#FFF8E7] text-[#8A6200]"
          }`}
        >

          {icon}

        </div>


        <div>

          <h3 className="text-xl font-semibold">

            {title}

          </h3>

          <p className="text-xs text-[#98A2B3] mt-1">

            {description}

          </p>

        </div>

      </div>


      {items.length > 0 ? (

        <div className="space-y-3 mt-6">

          {items.map(
            (
              item,
              index
            ) => (

              <div
                key={index}
                className="flex items-start gap-3"
              >

                <div
                  className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${
                    isStrength
                      ? "bg-[#EAF5F1] text-[#0F766E]"
                      : "bg-[#FFF8E7] text-[#8A6200]"
                  }`}
                >

                  {isStrength ? (

                    <Check
                      size={13}
                      strokeWidth={3}
                    />

                  ) : (

                    <Target
                      size={12}
                    />

                  )}

                </div>


                <p className="text-sm text-[#475467] leading-6">

                  {formatListItem(
                    item
                  )}

                </p>

              </div>

            )
          )}

        </div>

      ) : (

        <div className="mt-6 bg-[#F9FAFB] border border-[#EAECF0] rounded-xl p-4">

          <p className="text-sm text-[#98A2B3]">

            {isStrength
              ? "No specific strengths were provided by the AI evaluation."
              : "No specific improvement areas were provided by the AI evaluation."}

          </p>

        </div>

      )}

    </section>

  );

}


// =========================================================
// PERFORMANCE BOX
// =========================================================

function PerformanceBox({
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

      <p className="text-lg font-semibold text-[#344054] mt-3">

        {value}

      </p>

    </div>

  );

}


// =========================================================
// SECURITY METRIC
// =========================================================

function SecurityMetric({
  icon,
  label,
  value,
  warning,
}) {

  return (

    <div className="bg-[#FCFCFA] border border-[#EAECF0] rounded-xl p-4">

      <div className="flex items-center gap-2">

        <div
          className={`w-8 h-8 rounded-lg flex items-center justify-center ${
            warning
              ? "bg-[#FFF8E7] text-[#8A6200]"
              : "bg-[#EAF5F1] text-[#0F766E]"
          }`}
        >

          {icon}

        </div>

        <p className="text-xs text-[#667085]">

          {label}

        </p>

      </div>


      <p
        className={`text-2xl font-semibold mt-3 ${
          warning
            ? "text-[#8A6200]"
            : "text-[#344054]"
        }`}
      >

        {value}

      </p>

    </div>

  );

}


// =========================================================
// SECURITY EVENT
// =========================================================

function SecurityEvent({
  event,
  formatDate,
}) {

  const severity =
    String(
      event?.severity ||
      "low"
    ).toLowerCase();


  const severityClass =
    severity === "critical"
      ? "text-[#C95F4C] bg-[#FFF1EE]"
      : severity === "high"
      ? "text-[#B54708] bg-[#FFF4E5]"
      : severity === "medium"
      ? "text-[#8A6200] bg-[#FFF8E7]"
      : "text-[#667085] bg-[#F2F4F7]";


  return (

    <div className="bg-white border border-[#EAECF0] rounded-xl p-4">

      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">

        <div>

          <p className="text-sm font-semibold text-[#344054]">

            {String(
              event?.event_type ||
              "Security Event"
            )}

          </p>


          {event?.message && (

            <p className="text-xs text-[#667085] leading-5 mt-1">

              {event.message}

            </p>

          )}

        </div>


        <span
          className={`self-start px-2.5 py-1 rounded-full text-[10px] uppercase font-bold ${severityClass}`}
        >

          {severity}

        </span>

      </div>


      {event?.timestamp && (

        <p className="text-[10px] text-[#98A2B3] mt-3">

          {formatDate(
            event.timestamp
          )}

        </p>

      )}

    </div>

  );

}