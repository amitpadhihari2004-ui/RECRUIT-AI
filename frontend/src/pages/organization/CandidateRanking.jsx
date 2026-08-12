import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  Brain,
  RefreshCw,
  Loader2,
  Trophy,
  Users,
  Star,
  CheckCircle2,
  TrendingUp,
  Eye,
  FileText,
  Target,
  ShieldCheck,
  MessageSquare,
  Briefcase,
  Search,
  Filter,
  XCircle,
  Clock3,
  UserCheck,
  ChevronDown,
  Award,
  AlertCircle,
  UserX,
  BarChart3,
  Sparkles,
  Mail,
} from "lucide-react";

import OrganizationSidebar from "../../components/organization/OrganizationSidebar";
import OrganizationNavbar from "../../components/organization/OrganizationNavbar";

import {
  getRankingsByJob,
  getRankingStatistics,
  generateRanking,
  regenerateRanking,
} from "../../api/rankingApi";

import { getJob } from "../../api/jobApi";


// =========================================================
// COLORS
// =========================================================
//
// Background  #F7F6F2
// Card        #FFFFFF
// Heading     #172033
// Button      #172033
// Accent      #0F766E
// Success     #16803C
// Warning     #B7791F
// Error       #C53030
//
// =========================================================


// =========================================================
// ORGANIZATION LAYOUT
// IMPORTANT: THIS FIXES LEFT/RIGHT + UPPER/LOWER OVERLAP
// =========================================================

function OrganizationLayout({ children }) {

  return (

    <div className="min-h-screen w-full bg-[#F7F6F2]">

      {/* =====================================================
          FIXED LEFT SIDEBAR
      ===================================================== */}

      <aside
        className="
          fixed
          left-0
          top-0
          bottom-0
          z-50
          w-[282px]
          overflow-hidden
        "
      >

        <OrganizationSidebar />

      </aside>


      {/* =====================================================
          RIGHT APPLICATION AREA
      ===================================================== */}

      <div
        className="
          ml-[282px]
          min-h-screen
          w-[calc(100%-282px)]
          bg-[#F7F6F2]
        "
      >

        {/* ===================================================
            TOP NAVBAR
        =================================================== */}

        <header
          className="
            sticky
            top-0
            z-40
            w-full
            bg-white
            border-b
            border-gray-200
            shadow-sm
          "
        >

          <OrganizationNavbar />

        </header>


        {/* ===================================================
            LOWER PAGE CONTENT
        =================================================== */}

        <main
          className="
            w-full
            min-h-[calc(100vh-80px)]
            bg-[#F7F6F2]
          "
        >

          {children}

        </main>

      </div>

    </div>

  );
}


// =========================================================
// MAIN COMPONENT
// =========================================================

function CandidateRanking() {

  const { jobId } = useParams();

  const navigate = useNavigate();


  // =======================================================
  // STATE
  // =======================================================

  const [job, setJob] = useState(null);

  const [rankings, setRankings] = useState([]);

  const [statistics, setStatistics] = useState(null);

  const [loading, setLoading] = useState(true);

  const [generating, setGenerating] = useState(false);

  const [regenerating, setRegenerating] = useState(false);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [sortMode, setSortMode] = useState("rank");


  // =======================================================
  // LOAD
  // =======================================================

  useEffect(() => {

    if (!jobId) {

      toast.error("Job ID is missing.");

      navigate("/organization/jobs");

      return;

    }

    loadRankingData();

  }, [jobId]);


  // =======================================================
  // LOAD DATA
  // =======================================================

  const loadRankingData = async () => {

    try {

      setLoading(true);


      // JOB

      try {

        const response =
          await getJob(jobId);

        const jobData =
          response?.job ||
          response?.data ||
          response;

        setJob(jobData);

      } catch (error) {

        console.error(
          "Job loading error:",
          error
        );

      }


      // RANKINGS

      const rankingResponse =
        await getRankingsByJob(jobId);

      console.log(
        "Ranking Response:",
        rankingResponse
      );


      const rankingData =
        rankingResponse?.rankings ||
        rankingResponse?.data ||
        rankingResponse ||
        [];


      const list =
        Array.isArray(rankingData)
          ? rankingData
          : [];


      setRankings(list);


      // STATISTICS

      try {

        const statisticsResponse =
          await getRankingStatistics(jobId);

        const stats =
          statisticsResponse?.data ||
          statisticsResponse ||
          {};

        setStatistics(stats);

      } catch (error) {

        console.warn(
          "Statistics unavailable:",
          error?.response?.data ||
            error?.message
        );

        setStatistics(null);

      }

    } catch (error) {

      console.error(
        "Candidate Ranking Error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
          "Unable to load candidate rankings."
      );

      setRankings([]);

    } finally {

      setLoading(false);

    }

  };


  // =======================================================
  // GENERATE
  // =======================================================

  const handleGenerate = async () => {

    if (!jobId) {

      toast.error("Job ID is missing.");

      return;

    }

    try {

      setGenerating(true);

      const response =
        await generateRanking(jobId);

      toast.success(
        response?.message ||
          "Candidate ranking generated successfully."
      );

      await loadRankingData();

    } catch (error) {

      toast.error(
        error?.response?.data?.detail ||
          "Unable to generate ranking."
      );

    } finally {

      setGenerating(false);

    }

  };


  // =======================================================
  // REGENERATE
  // =======================================================

  const handleRegenerate = async () => {

    if (!jobId) {

      toast.error("Job ID is missing.");

      return;

    }

    try {

      setRegenerating(true);

      const response =
        await regenerateRanking(jobId);

      toast.success(
        response?.message ||
          "Candidate ranking regenerated successfully."
      );

      await loadRankingData();

    } catch (error) {

      toast.error(
        error?.response?.data?.detail ||
          "Unable to regenerate ranking."
      );

    } finally {

      setRegenerating(false);

    }

  };


  // =======================================================
  // AUTOMATIC DECISION
  // =======================================================

  const getAutomaticDecision = (score) => {

    const value =
      Number(score || 0);


    if (value >= 90) {

      return {

        status: "Selected",

        reason:
          "Excellent overall candidate score. Candidate strongly matches the job requirements.",

        badge:
          "bg-[#EAF6EE] text-[#16803C] border-[#BFE4CB]",

        icon:
          "text-[#16803C]",

        dot:
          "bg-[#16803C]",

        iconComponent:
          <UserCheck size={15} />,

      };

    }


    if (value >= 80) {

      return {

        status: "Shortlisted",

        reason:
          "Strong candidate profile with a high overall evaluation score.",

        badge:
          "bg-[#E7F4F2] text-[#0F766E] border-[#B9DDD8]",

        icon:
          "text-[#0F766E]",

        dot:
          "bg-[#0F766E]",

        iconComponent:
          <CheckCircle2 size={15} />,

      };

    }


    if (value >= 70) {

      return {

        status: "Under Review",

        reason:
          "Candidate has a reasonable overall score and requires further review.",

        badge:
          "bg-[#FFF7E8] text-[#B7791F] border-[#EAD8A9]",

        icon:
          "text-[#B7791F]",

        dot:
          "bg-[#B7791F]",

        iconComponent:
          <Clock3 size={15} />,

      };

    }


    if (value >= 60) {

      return {

        status: "Consider",

        reason:
          "Candidate meets some requirements but has areas that need consideration.",

        badge:
          "bg-[#FFF4E5] text-[#B7791F] border-[#E9D2A7]",

        icon:
          "text-[#B7791F]",

        dot:
          "bg-[#B7791F]",

        iconComponent:
          <AlertCircle size={15} />,

      };

    }


    return {

      status: "Rejected",

      reason:
        "Overall candidate score is below the minimum recommended threshold.",

      badge:
        "bg-[#FCECEC] text-[#C53030] border-[#E8BABA]",

      icon:
        "text-[#C53030]",

      dot:
        "bg-[#C53030]",

      iconComponent:
        <UserX size={15} />,

    };

  };


  // =======================================================
  // CANDIDATE DECISION
  // =======================================================

  const getCandidateDecision = (candidate) => {

    const score =
      Number(
        candidate?.final_score || 0
      );


    const automatic =
      getAutomaticDecision(score);


    const backendStatus =
      candidate?.selection_status;


    const validStatuses = [
      "Selected",
      "Shortlisted",
      "Under Review",
      "Consider",
      "On Hold",
      "Rejected",
    ];


    if (
      backendStatus &&
      validStatuses.includes(
        backendStatus
      )
    ) {

      return {

        ...automatic,

        status:
          backendStatus,

        reason:
          candidate?.decision_reason ||
          automatic.reason,

      };

    }


    return automatic;

  };


  // =======================================================
  // RECOMMENDATION
  // =======================================================

  const getRecommendationStyle = (
    recommendation
  ) => {

    switch (recommendation) {

      case "Highly Recommended":

        return {
          badge:
            "bg-[#EAF6EE] text-[#16803C] border-[#BFE4CB]",
          icon:
            "text-[#16803C]",
        };


      case "Recommended":

        return {
          badge:
            "bg-[#E7F4F2] text-[#0F766E] border-[#B9DDD8]",
          icon:
            "text-[#0F766E]",
        };


      case "Consider":

        return {
          badge:
            "bg-[#FFF7E8] text-[#B7791F] border-[#EAD8A9]",
          icon:
            "text-[#B7791F]",
        };


      case "Average":

        return {
          badge:
            "bg-[#F2F3F5] text-[#172033] border-[#D9DDE3]",
          icon:
            "text-[#172033]",
        };


      default:

        return {
          badge:
            "bg-[#FCECEC] text-[#C53030] border-[#E8BABA]",
          icon:
            "text-[#C53030]",
        };

    }

  };


  // =======================================================
  // SCORE COLOR
  // =======================================================

  const getScoreColor = (score) => {

    const value =
      Number(score || 0);


    if (value >= 90)
      return "text-[#16803C]";


    if (value >= 80)
      return "text-[#0F766E]";


    if (value >= 70)
      return "text-[#B7791F]";


    if (value >= 60)
      return "text-[#B7791F]";


    return "text-[#C53030]";

  };


  // =======================================================
  // SCORE BAR
  // =======================================================

  const getScoreBar = (score) => {

    const value =
      Number(score || 0);


    if (value >= 90)
      return "bg-[#16803C]";


    if (value >= 80)
      return "bg-[#0F766E]";


    if (value >= 70)
      return "bg-[#B7791F]";


    if (value >= 60)
      return "bg-[#B7791F]";


    return "bg-[#C53030]";

  };


  // =======================================================
  // RANK STYLE
  // =======================================================

  const getRankStyle = (rank) => {

    if (rank === 1) {

      return {
        box:
          "bg-[#FFF7E8] border-[#EAD8A9]",
        text:
          "text-[#B7791F]",
      };

    }


    if (rank === 2) {

      return {
        box:
          "bg-[#F2F3F5] border-[#D9DDE3]",
        text:
          "text-[#172033]",
      };

    }


    if (rank === 3) {

      return {
        box:
          "bg-[#FFF4E5] border-[#E9D2A7]",
        text:
          "text-[#B7791F]",
      };

    }


    return {
      box:
        "bg-[#E7F4F2] border-[#C8E4E0]",
      text:
        "text-[#0F766E]",
    };

  };


  // =======================================================
  // FILTER + SORT
  // =======================================================

  const filteredRankings =
    useMemo(() => {

      let result =
        [...rankings];


      if (searchTerm.trim()) {

        const search =
          searchTerm
            .toLowerCase()
            .trim();


        result =
          result.filter(
            (candidate) => {

              const name =
                String(
                  candidate?.candidate_name ||
                    ""
                ).toLowerCase();


              const email =
                String(
                  candidate?.candidate_email ||
                    ""
                ).toLowerCase();


              const applicationId =
                String(
                  candidate?.application_id ||
                    ""
                ).toLowerCase();


              const studentId =
                String(
                  candidate?.student_id ||
                    ""
                ).toLowerCase();


              return (
                name.includes(search) ||
                email.includes(search) ||
                applicationId.includes(search) ||
                studentId.includes(search)
              );

            }
          );

      }


      if (
        statusFilter !== "All"
      ) {

        result =
          result.filter(
            (candidate) =>
              getCandidateDecision(
                candidate
              ).status ===
              statusFilter
          );

      }


      if (
        sortMode === "score"
      ) {

        result.sort(
          (a, b) =>
            Number(
              b.final_score || 0
            ) -
            Number(
              a.final_score || 0
            )
        );

      }


      if (
        sortMode === "rank"
      ) {

        result.sort(
          (a, b) =>
            Number(
              a.rank || 999999
            ) -
            Number(
              b.rank || 999999
            )
        );

      }


      if (
        sortMode === "name"
      ) {

        result.sort(
          (a, b) =>
            String(
              a.candidate_name || ""
            ).localeCompare(
              String(
                b.candidate_name || ""
              )
            )
        );

      }


      return result;

    }, [
      rankings,
      searchTerm,
      statusFilter,
      sortMode,
    ]);


  // =======================================================
  // FRONTEND STATISTICS
  // =======================================================

  const calculatedStatistics =
    useMemo(() => {

      const stats = {

        total:
          rankings.length,

        selected: 0,

        shortlisted: 0,

        underReview: 0,

        consider: 0,

        onHold: 0,

        rejected: 0,

        averageScore: 0,

        highestScore: 0,

        lowestScore: 0,

      };


      if (!rankings.length) {

        return stats;

      }


      let totalScore = 0;


      rankings.forEach(
        (candidate) => {

          const score =
            Number(
              candidate?.final_score || 0
            );


          totalScore += score;


          stats.highestScore =
            Math.max(
              stats.highestScore,
              score
            );


          if (
            stats.lowestScore === 0 ||
            score <
              stats.lowestScore
          ) {

            stats.lowestScore =
              score;

          }


          const decision =
            getCandidateDecision(
              candidate
            );


          switch (
            decision.status
          ) {

            case "Selected":
              stats.selected++;
              break;

            case "Shortlisted":
              stats.shortlisted++;
              break;

            case "Under Review":
              stats.underReview++;
              break;

            case "Consider":
              stats.consider++;
              break;

            case "On Hold":
              stats.onHold++;
              break;

            case "Rejected":
              stats.rejected++;
              break;

            default:
              break;

          }

        }
      );


      stats.averageScore =
        Math.round(
          (totalScore /
            rankings.length) *
            100
        ) / 100;


      return stats;

    }, [rankings]);


  // =======================================================
  // DISPLAY STATS
  // =======================================================

  const totalCandidates =
    statistics?.total_candidates ??
    calculatedStatistics.total;


  const averageScore =
    statistics?.average_score ??
    calculatedStatistics.averageScore;


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (

      <OrganizationLayout>

        <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-[#F7F6F2]">

          <div className="text-center">

            <div className="w-16 h-16 bg-[#E7F4F2] rounded-2xl flex items-center justify-center mx-auto">

              <Loader2
                size={36}
                className="text-[#0F766E] animate-spin"
              />

            </div>


            <p className="text-[#172033] mt-5 font-semibold">
              Loading candidate rankings...
            </p>


            <p className="text-sm text-gray-500 mt-1">
              Preparing AI evaluation results
            </p>

          </div>

        </div>

      </OrganizationLayout>

    );

  }


  // =======================================================
  // MAIN
  // =======================================================

  return (

    <OrganizationLayout>

      {/* =====================================================
          PAGE WRAPPER
      ===================================================== */}

      <div className="w-full bg-[#F7F6F2]">

        {/* ===================================================
            PAGE CONTAINER
        =================================================== */}

        <div className="w-full max-w-[1500px] mx-auto px-5 md:px-7 lg:px-8 py-6">

          {/* =================================================
              HEADER
          ================================================= */}

          <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6 mb-7">

            <div>

              <button
                onClick={() =>
                  navigate(
                    "/organization/jobs"
                  )
                }
                className="flex items-center gap-2 text-[#0F766E] hover:text-[#172033] font-semibold mb-4 transition"
              >

                <ArrowLeft
                  size={18}
                />

                Back to Jobs

              </button>


              <div className="flex items-start gap-4">

                <div className="w-14 h-14 bg-[#E7F4F2] rounded-2xl flex items-center justify-center flex-shrink-0">

                  <Brain
                    size={28}
                    className="text-[#0F766E]"
                  />

                </div>


                <div className="min-w-0">

                  <div className="flex flex-wrap items-center gap-3">

                    <h1 className="text-2xl md:text-3xl font-bold text-[#172033]">

                      Candidate Ranking

                    </h1>


                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E7F4F2] text-[#0F766E] border border-[#C8E4E0] text-xs font-bold">

                      <Sparkles
                        size={13}
                      />

                      AI Powered

                    </span>

                  </div>


                  <p className="text-gray-600 mt-1">

                    {job?.title ||
                      "Job Position"}

                  </p>


                  <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">

                    <Briefcase
                      size={14}
                    />

                    Automatic candidate ranking and decision support

                  </p>

                </div>

              </div>

            </div>


            {/* ACTIONS */}

            <div className="flex flex-wrap gap-3">

              <button
                onClick={
                  loadRankingData
                }
                disabled={
                  loading ||
                  generating ||
                  regenerating
                }
                className="flex items-center gap-2 px-4 py-3 bg-white border border-gray-200 hover:bg-gray-50 disabled:opacity-50 text-[#172033] rounded-xl font-semibold shadow-sm"
              >

                <RefreshCw
                  size={17}
                  className={
                    loading
                      ? "animate-spin"
                      : ""
                  }
                />

                Refresh

              </button>


              {rankings.length === 0 ? (

                <button
                  onClick={
                    handleGenerate
                  }
                  disabled={
                    generating
                  }
                  className="flex items-center gap-2 px-5 py-3 bg-[#172033] hover:bg-[#0F766E] disabled:bg-gray-400 text-white rounded-xl font-semibold shadow-sm transition"
                >

                  {generating ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <Brain
                      size={18}
                    />
                  )}

                  {generating
                    ? "Generating..."
                    : "Generate Ranking"}

                </button>

              ) : (

                <button
                  onClick={
                    handleRegenerate
                  }
                  disabled={
                    regenerating
                  }
                  className="flex items-center gap-2 px-5 py-3 bg-[#172033] hover:bg-[#0F766E] disabled:bg-gray-400 text-white rounded-xl font-semibold shadow-sm transition"
                >

                  {regenerating ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCw
                      size={18}
                    />
                  )}

                  {regenerating
                    ? "Regenerating..."
                    : "Regenerate Ranking"}

                </button>

              )}

            </div>

          </div>


          {/* =================================================
              AI BANNER
          ================================================= */}

          <div className="bg-[#172033] rounded-3xl p-6 md:p-7 text-white mb-7 shadow-lg">

            <div className="flex flex-col md:flex-row md:items-center gap-5">

              <div className="w-14 h-14 rounded-2xl bg-[#0F766E] flex items-center justify-center flex-shrink-0">

                <Brain
                  size={28}
                />

              </div>


              <div className="flex-1">

                <h2 className="text-lg font-bold">
                  AI Candidate Evaluation
                </h2>


                <p className="text-white/75 text-sm mt-1 max-w-4xl leading-6">

                  Every applicant is evaluated using resume quality,
                  job-description match, interview performance and
                  integrity data when available.

                </p>

              </div>


              <div className="hidden md:block">

                <div className="px-5 py-3 rounded-2xl bg-white/10 border border-white/10">

                  <p className="text-xs text-white/60">
                    Total Applicants
                  </p>


                  <p className="text-2xl font-bold">
                    {totalCandidates}
                  </p>

                </div>

              </div>

            </div>

          </div>


          {/* =================================================
              STATISTICS
          ================================================= */}

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">

            <StatCard
              icon={<Users />}
              title="Applicants"
              value={totalCandidates}
              iconClass="text-[#0F766E]"
              bgClass="bg-[#E7F4F2]"
            />


            <StatCard
              icon={<UserCheck />}
              title="Selected"
              value={
                statistics?.selected ??
                calculatedStatistics.selected
              }
              iconClass="text-[#16803C]"
              bgClass="bg-[#EAF6EE]"
            />


            <StatCard
              icon={<Award />}
              title="Shortlisted"
              value={
                statistics?.shortlisted ??
                calculatedStatistics.shortlisted
              }
              iconClass="text-[#0F766E]"
              bgClass="bg-[#E7F4F2]"
            />


            <StatCard
              icon={<Clock3 />}
              title="Review"
              value={
                statistics?.under_review ??
                calculatedStatistics.underReview
              }
              iconClass="text-[#B7791F]"
              bgClass="bg-[#FFF7E8]"
            />


            <StatCard
              icon={<UserX />}
              title="Rejected"
              value={
                statistics?.rejected ??
                calculatedStatistics.rejected
              }
              iconClass="text-[#C53030]"
              bgClass="bg-[#FCECEC]"
            />


            <StatCard
              icon={<TrendingUp />}
              title="Avg Score"
              value={averageScore}
              iconClass="text-[#172033]"
              bgClass="bg-[#EEF0F3]"
            />

          </div>


          {/* =================================================
              DECISION OVERVIEW
          ================================================= */}

          {rankings.length > 0 && (

            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-5 mb-7">

              <div className="flex flex-col xl:flex-row xl:items-center xl:justify-between gap-5">

                <div>

                  <div className="flex items-center gap-2">

                    <BarChart3
                      size={20}
                      className="text-[#0F766E]"
                    />

                    <h2 className="font-bold text-[#172033]">
                      Decision Overview
                    </h2>

                  </div>


                  <p className="text-sm text-gray-500 mt-1">
                    AI-generated candidate decisions based on final ranking score.
                  </p>

                </div>


                <div className="flex flex-wrap gap-2">

                  <DecisionMini
                    label="Selected"
                    value={
                      calculatedStatistics.selected
                    }
                    color="emerald"
                  />


                  <DecisionMini
                    label="Shortlisted"
                    value={
                      calculatedStatistics.shortlisted
                    }
                    color="teal"
                  />


                  <DecisionMini
                    label="Review"
                    value={
                      calculatedStatistics.underReview
                    }
                    color="amber"
                  />


                  <DecisionMini
                    label="Consider"
                    value={
                      calculatedStatistics.consider
                    }
                    color="amber"
                  />


                  <DecisionMini
                    label="Rejected"
                    value={
                      calculatedStatistics.rejected
                    }
                    color="red"
                  />

                </div>

              </div>

            </div>

          )}


          {/* =================================================
              EMPTY
          ================================================= */}

          {rankings.length === 0 ? (

            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 md:p-16 text-center">

              <div className="w-20 h-20 bg-[#E7F4F2] rounded-3xl flex items-center justify-center mx-auto mb-5">

                <Users
                  size={40}
                  className="text-[#0F766E]"
                />

              </div>


              <h2 className="text-2xl font-bold text-[#172033]">
                No Rankings Generated
              </h2>


              <p className="text-gray-500 max-w-xl mx-auto mt-2 leading-6">

                All candidates who applied for this job will
                appear here after AI ranking is generated.

              </p>


              <button
                onClick={
                  handleGenerate
                }
                disabled={
                  generating
                }
                className="mt-7 inline-flex items-center gap-2 px-6 py-3 bg-[#172033] hover:bg-[#0F766E] disabled:bg-gray-400 text-white rounded-xl font-semibold shadow-sm"
              >

                {generating ? (
                  <Loader2
                    size={18}
                    className="animate-spin"
                  />
                ) : (
                  <Brain
                    size={18}
                  />
                )}

                {generating
                  ? "Generating..."
                  : "Generate Candidate Ranking"}

              </button>

            </div>

          ) : (

            <>

              {/* =================================================
                  SEARCH / FILTER
              ================================================= */}

              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 mb-6">

                <div className="flex flex-col xl:flex-row gap-3">

                  <div className="flex-1 relative">

                    <Search
                      size={19}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                    />


                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) =>
                        setSearchTerm(
                          e.target.value
                        )
                      }
                      placeholder="Search by candidate name, email, application ID..."
                      className="w-full pl-11 pr-10 py-3 rounded-xl border border-gray-200 focus:border-[#0F766E] focus:ring-2 focus:ring-[#D8EEEB] outline-none text-[#172033]"
                    />


                    {searchTerm && (

                      <button
                        onClick={() =>
                          setSearchTerm("")
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-[#C53030]"
                      >

                        <XCircle
                          size={18}
                        />

                      </button>

                    )}

                  </div>


                  <div className="relative xl:w-56">

                    <Filter
                      size={17}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />


                    <select
                      value={statusFilter}
                      onChange={(e) =>
                        setStatusFilter(
                          e.target.value
                        )
                      }
                      className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#0F766E] focus:ring-2 focus:ring-[#D8EEEB] outline-none appearance-none text-[#172033]"
                    >

                      <option value="All">
                        All Candidates
                      </option>

                      <option value="Selected">
                        Selected
                      </option>

                      <option value="Shortlisted">
                        Shortlisted
                      </option>

                      <option value="Under Review">
                        Under Review
                      </option>

                      <option value="Consider">
                        Consider
                      </option>

                      <option value="On Hold">
                        On Hold
                      </option>

                      <option value="Rejected">
                        Rejected
                      </option>

                    </select>


                    <ChevronDown
                      size={17}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                    />

                  </div>


                  <div className="relative xl:w-52">

                    <select
                      value={sortMode}
                      onChange={(e) =>
                        setSortMode(
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white focus:border-[#0F766E] focus:ring-2 focus:ring-[#D8EEEB] outline-none text-[#172033]"
                    >

                      <option value="rank">
                        Sort: Rank
                      </option>

                      <option value="score">
                        Sort: Highest Score
                      </option>

                      <option value="name">
                        Sort: Candidate Name
                      </option>

                    </select>

                  </div>

                </div>


                <div className="flex flex-wrap items-center justify-between gap-3 mt-3">

                  <p className="text-sm text-gray-500">

                    Showing{" "}

                    <span className="font-bold text-[#172033]">
                      {filteredRankings.length}
                    </span>{" "}

                    of{" "}

                    <span className="font-bold text-[#172033]">
                      {rankings.length}
                    </span>{" "}

                    applicants

                  </p>


                  {(searchTerm ||
                    statusFilter !== "All") && (

                    <button
                      onClick={() => {

                        setSearchTerm("");

                        setStatusFilter(
                          "All"
                        );

                      }}
                      className="text-sm text-[#0F766E] hover:text-[#172033] font-semibold"
                    >

                      Clear Filters

                    </button>

                  )}

                </div>

              </div>


              {/* =================================================
                  LIST HEADER
              ================================================= */}

              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">

                <div>

                  <h2 className="text-xl font-bold text-[#172033]">
                    Ranked Applicants
                  </h2>


                  <p className="text-sm text-gray-500 mt-1">
                    Every applicant is ranked according to the AI evaluation score.
                  </p>

                </div>


                <div className="inline-flex items-center gap-2 text-sm text-gray-500">

                  <Star
                    size={16}
                    className="text-[#B7791F]"
                  />

                  Rank #1 = highest score

                </div>

              </div>


              {/* =================================================
                  FILTER EMPTY
              ================================================= */}

              {filteredRankings.length === 0 ? (

                <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-12 text-center">

                  <Search
                    size={42}
                    className="text-gray-300 mx-auto"
                  />


                  <h3 className="text-lg font-bold text-[#172033] mt-4">
                    No Applicants Found
                  </h3>


                  <p className="text-gray-500 text-sm mt-1">
                    Try another search term or status filter.
                  </p>

                </div>

              ) : (

                /* =================================================
                   CANDIDATES
                ================================================= */

                <div className="space-y-5">

                  {filteredRankings.map(
                    (
                      candidate,
                      index
                    ) => {

                      const rank =
                        Number(
                          candidate?.rank
                        ) ||
                        index + 1;


                      const score =
                        Number(
                          candidate?.final_score ||
                            0
                        );


                      const recommendation =
                        candidate?.recommendation ||
                        "Not Recommended";


                      const decision =
                        getCandidateDecision(
                          candidate
                        );


                      const recommendationStyle =
                        getRecommendationStyle(
                          recommendation
                        );


                      const rankStyle =
                        getRankStyle(rank);


                      const candidateName =
                        candidate?.candidate_name ||
                        `Candidate #${rank}`;


                      const candidateEmail =
                        candidate?.candidate_email ||
                        "";


                      return (

                        <div
                          key={
                            candidate?._id ||
                            candidate?.id ||
                            candidate?.application_id ||
                            index
                          }
                          className="bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-md transition overflow-hidden"
                        >

                          {/* STATUS */}

                          <div
                            className={`h-1.5 w-full ${decision.dot}`}
                          />


                          <div className="p-5 md:p-6">

                            {/* =================================================
                                CANDIDATE HEADER
                            ================================================= */}

                            <div className="flex flex-col lg:flex-row lg:items-center gap-5">

                              {/* RANK */}

                              <div
                                className={`w-16 h-16 rounded-2xl border flex items-center justify-center flex-shrink-0 ${rankStyle.box}`}
                              >

                                {rank <= 3 ? (

                                  <div className="text-center">

                                    <Trophy
                                      size={24}
                                      className={`mx-auto ${rankStyle.text}`}
                                    />


                                    <span
                                      className={`text-[10px] font-bold ${rankStyle.text}`}
                                    >
                                      #{rank}
                                    </span>

                                  </div>

                                ) : (

                                  <span
                                    className={`text-xl font-bold ${rankStyle.text}`}
                                  >
                                    #{rank}
                                  </span>

                                )}

                              </div>


                              {/* CANDIDATE */}

                              <div className="flex-1 min-w-0">

                                <div className="flex flex-wrap items-center gap-2">

                                  <h3 className="text-xl font-bold text-[#172033] truncate">

                                    {candidateName}

                                  </h3>


                                  <span
                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-bold ${decision.badge}`}
                                  >

                                    <span
                                      className={
                                        decision.icon
                                      }
                                    >
                                      {
                                        decision.iconComponent
                                      }
                                    </span>

                                    {decision.status}

                                  </span>

                                </div>


                                {candidateEmail && (

                                  <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1">

                                    <Mail
                                      size={14}
                                    />

                                    {candidateEmail}

                                  </div>

                                )}


                                <p className="text-xs text-gray-400 mt-2 break-all">

                                  Application ID:{" "}

                                  <span className="font-medium text-gray-600">

                                    {
                                      candidate?.application_id ||
                                      "N/A"
                                    }

                                  </span>

                                </p>

                              </div>


                              {/* SCORE */}

                              <div className="lg:text-right flex-shrink-0">

                                <p className="text-xs text-gray-400 uppercase font-bold tracking-wide">
                                  AI Score
                                </p>


                                <p
                                  className={`text-4xl font-bold mt-1 ${getScoreColor(
                                    score
                                  )}`}
                                >

                                  {score}

                                  <span className="text-lg text-gray-400">
                                    /100
                                  </span>

                                </p>

                              </div>

                            </div>


                            {/* =================================================
                                DECISION
                            ================================================= */}

                            <div
                              className={`mt-5 rounded-2xl border p-4 ${decision.badge}`}
                            >

                              <div className="flex items-start gap-3">

                                <div
                                  className={`mt-0.5 ${decision.icon}`}
                                >
                                  {
                                    decision.iconComponent
                                  }
                                </div>


                                <div className="flex-1">

                                  <div className="flex flex-wrap items-center gap-2">

                                    <p className="text-sm font-bold">
                                      AI Decision:
                                    </p>

                                    <p className="text-sm font-bold">
                                      {decision.status}
                                    </p>

                                  </div>


                                  <p className="text-xs mt-1 opacity-80 leading-5">

                                    {decision.reason}

                                  </p>

                                </div>

                              </div>

                            </div>


                            {/* =================================================
                                SCORE BAR
                            ================================================= */}

                            <div className="mt-6">

                              <div className="flex items-center justify-between mb-2">

                                <span className="text-xs font-semibold text-gray-500">
                                  Overall AI Evaluation
                                </span>


                                <span
                                  className={`text-xs font-bold ${getScoreColor(
                                    score
                                  )}`}
                                >
                                  {score}%
                                </span>

                              </div>


                              <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden">

                                <div
                                  className={`h-full ${getScoreBar(
                                    score
                                  )} rounded-full transition-all duration-700`}
                                  style={{
                                    width: `${Math.min(
                                      Math.max(
                                        score,
                                        0
                                      ),
                                      100
                                    )}%`,
                                  }}
                                />

                              </div>

                            </div>


                            {/* =================================================
                                BADGES
                            ================================================= */}

                            <div className="flex flex-wrap gap-2 mt-5">

                              <span
                                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-semibold ${recommendationStyle.badge}`}
                              >

                                <CheckCircle2
                                  size={14}
                                  className={
                                    recommendationStyle.icon
                                  }
                                />

                                {recommendation}

                              </span>


                              {candidate?.interview_available && (

                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#EAF6EE] text-[#16803C] border border-[#BFE4CB] text-xs font-semibold">

                                  <MessageSquare
                                    size={14}
                                  />

                                  Interview Evaluated

                                </span>

                              )}


                              {candidate?.integrity_available && (

                                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#E7F4F2] text-[#0F766E] border border-[#C8E4E0] text-xs font-semibold">

                                  <ShieldCheck
                                    size={14}
                                  />

                                  Integrity Checked

                                </span>

                              )}

                            </div>


                            {/* =================================================
                                SCORE BREAKDOWN
                            ================================================= */}

                            <div className="mt-6">

                              <div className="flex items-center gap-2 mb-3">

                                <BarChart3
                                  size={17}
                                  className="text-[#0F766E]"
                                />


                                <h4 className="text-sm font-bold text-[#172033]">
                                  Score Breakdown
                                </h4>

                              </div>


                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">

                                <ScoreItem
                                  icon={
                                    <FileText
                                      size={17}
                                    />
                                  }
                                  title="Resume"
                                  value={
                                    candidate?.resume_score
                                  }
                                  color="teal"
                                  weight={
                                    candidate?.interview_available
                                      ? "30%"
                                      : "40%"
                                  }
                                />


                                <ScoreItem
                                  icon={
                                    <Target
                                      size={17}
                                    />
                                  }
                                  title="JD Match"
                                  value={
                                    candidate?.jd_match_score
                                  }
                                  color="teal"
                                  weight={
                                    candidate?.interview_available
                                      ? "30%"
                                      : "60%"
                                  }
                                />


                                <ScoreItem
                                  icon={
                                    <MessageSquare
                                      size={17}
                                    />
                                  }
                                  title="Interview"
                                  value={
                                    candidate?.interview_score
                                  }
                                  color="green"
                                  weight={
                                    candidate?.interview_available
                                      ? "25%"
                                      : "N/A"
                                  }
                                />


                                <ScoreItem
                                  icon={
                                    <ShieldCheck
                                      size={17}
                                    />
                                  }
                                  title="Integrity"
                                  value={
                                    candidate?.integrity_score
                                  }
                                  color="amber"
                                  weight={
                                    candidate?.integrity_available
                                      ? "15%"
                                      : "N/A"
                                  }
                                />

                              </div>

                            </div>


                            {/* =================================================
                                SKILLS
                            ================================================= */}

                            {(
                              candidate?.matched_skills?.length >
                                0 ||
                              candidate?.missing_skills?.length >
                                0
                            ) && (

                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">

                                {candidate?.matched_skills?.length >
                                  0 && (

                                  <div className="rounded-2xl bg-[#EAF6EE] border border-[#CBE8D4] p-4">

                                    <div className="flex items-center justify-between mb-3">

                                      <p className="text-xs font-bold uppercase tracking-wide text-[#16803C]">
                                        Matched Skills
                                      </p>


                                      <span className="text-xs font-bold text-[#16803C]">

                                        {
                                          candidate.matched_skills.length
                                        }

                                      </span>

                                    </div>


                                    <div className="flex flex-wrap gap-2">

                                      {candidate.matched_skills.map(
                                        (
                                          skill,
                                          skillIndex
                                        ) => (

                                          <span
                                            key={
                                              skillIndex
                                            }
                                            className="px-2.5 py-1 bg-white border border-[#CBE8D4] rounded-lg text-xs font-medium text-[#16803C]"
                                          >

                                            {skill}

                                          </span>

                                        )
                                      )}

                                    </div>

                                  </div>

                                )}


                                {candidate?.missing_skills?.length >
                                  0 && (

                                  <div className="rounded-2xl bg-[#FCECEC] border border-[#E8BABA] p-4">

                                    <div className="flex items-center justify-between mb-3">

                                      <p className="text-xs font-bold uppercase tracking-wide text-[#C53030]">
                                        Missing Skills
                                      </p>


                                      <span className="text-xs font-bold text-[#C53030]">

                                        {
                                          candidate.missing_skills.length
                                        }

                                      </span>

                                    </div>


                                    <div className="flex flex-wrap gap-2">

                                      {candidate.missing_skills.map(
                                        (
                                          skill,
                                          skillIndex
                                        ) => (

                                          <span
                                            key={
                                              skillIndex
                                            }
                                            className="px-2.5 py-1 bg-white border border-[#E8BABA] rounded-lg text-xs font-medium text-[#C53030]"
                                          >

                                            {skill}

                                          </span>

                                        )
                                      )}

                                    </div>

                                  </div>

                                )}

                              </div>

                            )}


                            {/* =================================================
                                ACTIONS
                            ================================================= */}

                            <div className="flex flex-wrap items-center gap-3 mt-6 pt-5 border-t border-gray-100">

                              <button
                                onClick={() =>
                                  navigate(
                                    `/organization/applications/${candidate?.application_id}`
                                  )
                                }
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#172033] hover:bg-[#0F766E] text-white rounded-xl text-sm font-semibold transition shadow-sm"
                              >

                                <Eye
                                  size={17}
                                />

                                View Candidate

                              </button>


                              <button
                                onClick={() =>
                                  navigate(
                                    `/organization/applications/${candidate?.application_id}`
                                  )
                                }
                                className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#EEF0F3] hover:bg-[#E3E5E8] text-[#172033] rounded-xl text-sm font-semibold transition"
                              >

                                <FileText
                                  size={17}
                                />

                                Application Details

                              </button>


                              {candidate?.candidate_email && (

                                <a
                                  href={`mailto:${candidate.candidate_email}`}
                                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-[#F7F6F2] text-[#172033] border border-gray-200 rounded-xl text-sm font-semibold transition"
                                >

                                  <Mail
                                    size={17}
                                  />

                                  Contact

                                </a>

                              )}

                            </div>

                          </div>

                        </div>

                      );

                    }
                  )}

                </div>

              )}

            </>

          )}

        </div>

      </div>

    </OrganizationLayout>

  );
}


// =========================================================
// STAT CARD
// =========================================================

function StatCard({
  icon,
  title,
  value,
  iconClass,
  bgClass,
}) {

  return (

    <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4 hover:shadow-md transition">

      <div className="flex items-center justify-between gap-3">

        <div className="min-w-0">

          <p className="text-[11px] text-gray-500 font-bold uppercase tracking-wide truncate">
            {title}
          </p>


          <p className="text-2xl font-bold text-[#172033] mt-2">
            {value}
          </p>

        </div>


        <div
          className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${bgClass}`}
        >

          <span className={iconClass}>
            {icon}
          </span>

        </div>

      </div>

    </div>

  );
}


// =========================================================
// DECISION MINI
// =========================================================

function DecisionMini({
  label,
  value,
  color,
}) {

  const styles = {

    emerald: {
      wrapper:
        "bg-[#EAF6EE] border-[#CBE8D4]",
      text:
        "text-[#16803C]",
    },

    teal: {
      wrapper:
        "bg-[#E7F4F2] border-[#C8E4E0]",
      text:
        "text-[#0F766E]",
    },

    amber: {
      wrapper:
        "bg-[#FFF7E8] border-[#EAD8A9]",
      text:
        "text-[#B7791F]",
    },

    red: {
      wrapper:
        "bg-[#FCECEC] border-[#E8BABA]",
      text:
        "text-[#C53030]",
    },

  };


  const style =
    styles[color] ||
    styles.teal;


  return (

    <div
      className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${style.wrapper}`}
    >

      <span
        className={`text-xs font-semibold ${style.text}`}
      >
        {label}
      </span>


      <span
        className={`text-sm font-bold ${style.text}`}
      >
        {value}
      </span>

    </div>

  );
}


// =========================================================
// SCORE ITEM
// =========================================================

function ScoreItem({
  icon,
  title,
  value,
  color,
  weight,
}) {

  const styles = {

    teal: {
      bg: "bg-[#E7F4F2]",
      text: "text-[#0F766E]",
      bar: "bg-[#0F766E]",
    },

    green: {
      bg: "bg-[#EAF6EE]",
      text: "text-[#16803C]",
      bar: "bg-[#16803C]",
    },

    amber: {
      bg: "bg-[#FFF7E8]",
      text: "text-[#B7791F]",
      bar: "bg-[#B7791F]",
    },

  };


  const style =
    styles[color] ||
    styles.teal;


  const numericValue =
    Number(value || 0);


  return (

    <div className="bg-[#F7F6F2] rounded-2xl p-4 border border-gray-200">

      <div className="flex items-center justify-between gap-2">

        <div className="flex items-center gap-2 min-w-0">

          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${style.bg}`}
          >

            <span className={style.text}>
              {icon}
            </span>

          </div>


          <div className="min-w-0">

            <p className="text-xs text-gray-500">
              {title}
            </p>


            <p className="font-bold text-[#172033]">

              {numericValue}

              <span className="text-xs text-gray-400">
                /100
              </span>

            </p>

          </div>

        </div>


        <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
          {weight}
        </span>

      </div>


      <div className="mt-3 w-full h-1.5 bg-gray-200 rounded-full overflow-hidden">

        <div
          className={`h-full ${style.bar} rounded-full transition-all duration-700`}
          style={{
            width: `${Math.min(
              Math.max(
                numericValue,
                0
              ),
              100
            )}%`,
          }}
        />

      </div>

    </div>

  );
}


export default CandidateRanking;