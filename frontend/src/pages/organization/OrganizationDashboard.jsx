import { useEffect, useMemo, useState } from "react";

import {
  getOrganizationProfile,
} from "../../api/organizationApi";

import {
  getAllJobs,
} from "../../api/jobApi";

import {
  getAllApplications,
} from "../../api/applicationApi";

import {
  getAllInterviews,
} from "../../api/interviewApi";

import OrganizationSidebar from "../../components/organization/OrganizationSidebar";
import OrganizationNavbar from "../../components/organization/OrganizationNavbar";

import {
  Briefcase,
  Users,
  FileText,
  Trophy,
  Clock3,
  CheckCircle2,
  XCircle,
  UserCheck,
  CalendarDays,
  ArrowUpRight,
  Plus,
  BarChart3,
  Activity,
  Sparkles,
  RefreshCw,
  ChevronRight,
  TrendingUp,
  Target,
  Building2,
} from "lucide-react";


// ============================================================
// ORGANIZATION DASHBOARD
// ============================================================

export default function OrganizationDashboard() {

  const [company, setCompany] = useState("");

  const [stats, setStats] = useState({
    jobs: 0,
    applications: 0,
    interviews: 0,
    selected: 0,
  });

  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [interviews, setInterviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);


  // ==========================================================
  // LOAD DASHBOARD
  // ==========================================================

  useEffect(() => {
    loadDashboard();
  }, []);


  const loadDashboard = async (isRefresh = false) => {

    try {

      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const organizationId =
        localStorage.getItem("organizationId");


      if (!organizationId) {
        console.error(
          "Organization ID not found."
        );
        return;
      }


      const [
        profile,
        jobsResponse,
        applicationsResponse,
        interviewsResponse,
      ] = await Promise.all([

        getOrganizationProfile(
          organizationId
        ),

        getAllJobs(),

        getAllApplications(),

        getAllInterviews(),

      ]);


      // ------------------------------------------------------
      // NORMALIZE API RESPONSE
      // ------------------------------------------------------

      const jobsData =
        Array.isArray(jobsResponse)
          ? jobsResponse
          : jobsResponse?.jobs || [];


      const applicationsData =
        Array.isArray(applicationsResponse)
          ? applicationsResponse
          : applicationsResponse?.applications || [];


      const interviewsData =
        Array.isArray(interviewsResponse)
          ? interviewsResponse
          : interviewsResponse?.interviews || [];


      setCompany(
        profile?.company_name ||
        localStorage.getItem(
          "company_name"
        ) ||
        "Your Organization"
      );


      setJobs(jobsData);
      setApplications(applicationsData);
      setInterviews(interviewsData);


      // ------------------------------------------------------
      // SELECTED
      // ------------------------------------------------------

      const selected =
        applicationsData.filter(
          (application) => {

            const status =
              String(
                application?.status || ""
              ).toLowerCase();

            return (
              status.includes("selected") ||
              status.includes("hired") ||
              status.includes("accepted")
            );

          }
        ).length;


      setStats({

        jobs: jobsData.length,

        applications:
          applicationsData.length,

        interviews:
          interviewsData.length,

        selected,

      });


    } catch (error) {

      console.error(
        "Organization Dashboard Error:",
        error
      );

    } finally {

      setLoading(false);
      setRefreshing(false);

    }

  };


  // ==========================================================
  // APPLICATION STATUS
  // ==========================================================

  const applicationStats = useMemo(() => {

    const result = {
      pending: 0,
      shortlisted: 0,
      selected: 0,
      rejected: 0,
    };


    applications.forEach(
      (application) => {

        const status =
          String(
            application?.status || ""
          ).toLowerCase();


        if (
          status.includes("short")
        ) {

          result.shortlisted++;

        } else if (

          status.includes("select") ||
          status.includes("hire") ||
          status.includes("accept")

        ) {

          result.selected++;

        } else if (
          status.includes("reject")
        ) {

          result.rejected++;

        } else {

          result.pending++;

        }

      }
    );


    return result;

  }, [applications]);


  // ==========================================================
  // INTERVIEW STATUS
  // ==========================================================

  const interviewStats = useMemo(() => {

    const result = {
      upcoming: 0,
      completed: 0,
      pending: 0,
    };


    interviews.forEach(
      (interview) => {

        const status =
          String(
            interview?.status || ""
          ).toLowerCase();


        if (
          status.includes("complete") ||
          status.includes("finish")
        ) {

          result.completed++;

        } else if (

          status.includes("schedule") ||
          status.includes("upcoming")

        ) {

          result.upcoming++;

        } else {

          result.pending++;

        }

      }
    );


    return result;

  }, [interviews]);


  // ==========================================================
  // ACTIVE JOBS
  // ==========================================================

  const activeJobs = useMemo(() => {

    return jobs.filter(
      (job) => {

        const status =
          String(
            job?.status || ""
          ).toLowerCase();


        return (
          status === "active" ||
          status === "open" ||
          status === "published" ||
          !job?.status
        );

      }
    );

  }, [jobs]);


  // ==========================================================
  // CLOSED JOBS
  // ==========================================================

  const closedJobs =
    Math.max(
      stats.jobs -
      activeJobs.length,
      0
    );


  // ==========================================================
  // HIRING RATE
  // ==========================================================

  const hiringRate =
    stats.applications > 0
      ? Math.round(
          (
            stats.selected /
            stats.applications
          ) * 100
        )
      : 0;


  // ==========================================================
  // SHORTLIST RATE
  // ==========================================================

  const shortlistRate =
    stats.applications > 0
      ? Math.round(
          (
            applicationStats.shortlisted /
            stats.applications
          ) * 100
        )
      : 0;


  // ==========================================================
  // RECENT APPLICATIONS
  // ==========================================================

  const recentApplications =
    useMemo(() => {

      return [...applications]
        .sort((a, b) => {

          const dateA =
            new Date(
              a?.created_at ||
              a?.applied_at ||
              a?.createdAt ||
              0
            ).getTime();


          const dateB =
            new Date(
              b?.created_at ||
              b?.applied_at ||
              b?.createdAt ||
              0
            ).getTime();


          return dateB - dateA;

        })
        .slice(0, 5);

    }, [applications]);


  // ==========================================================
  // CANDIDATE NAME
  // ==========================================================

  const getCandidateName =
    (application) => {

      return (
        application?.candidate_name ||
        application?.student_name ||
        application?.candidate?.name ||
        application?.student?.name ||
        application?.name ||
        "Candidate"
      );

    };


  // ==========================================================
  // JOB TITLE
  // ==========================================================

  const getJobTitle =
    (application) => {

      return (
        application?.job_title ||
        application?.job?.title ||
        application?.job?.job_title ||
        "Job Application"
      );

    };


  // ==========================================================
  // STATUS STYLE
  // ==========================================================

  const getStatusStyle =
    (status) => {

      const value =
        String(
          status || "Pending"
        ).toLowerCase();


      if (
        value.includes("select") ||
        value.includes("hire") ||
        value.includes("accept")
      ) {

        return {
          bg: "bg-[#EAF6EE]",
          text: "text-[#16803C]",
          dot: "bg-[#16803C]",
        };

      }


      if (
        value.includes("reject")
      ) {

        return {
          bg: "bg-[#FCEDED]",
          text: "text-[#C53030]",
          dot: "bg-[#C53030]",
        };

      }


      if (
        value.includes("short")
      ) {

        return {
          bg: "bg-[#FFF7E8]",
          text: "text-[#B7791F]",
          dot: "bg-[#B7791F]",
        };

      }


      return {
        bg: "bg-[#EEF5F4]",
        text: "text-[#0F766E]",
        dot: "bg-[#0F766E]",
      };

    };


  // ==========================================================
  // LOADING
  // ==========================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-[#F7F6F2]">

        <OrganizationSidebar />

        <div
          className="
            min-h-screen
            lg:ml-72
          "
        >

          <OrganizationNavbar />

          <main
            className="
              p-5
              sm:p-6
              lg:p-8
            "
          >

            <div className="max-w-7xl mx-auto">

              <div
                className="
                  h-48
                  rounded-3xl
                  bg-[#172033]
                  animate-pulse
                "
              />

              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  xl:grid-cols-4
                  gap-5
                  mt-6
                "
              >

                {[1, 2, 3, 4].map(
                  (item) => (

                    <div
                      key={item}
                      className="
                        h-36
                        bg-white
                        rounded-2xl
                        border
                        border-[#E5E7EB]
                        animate-pulse
                      "
                    />

                  )
                )}

              </div>

            </div>

          </main>

        </div>

      </div>

    );

  }


  // ==========================================================
  // MAIN UI
  // ==========================================================

  return (

    <div
      className="
        min-h-screen
        bg-[#F7F6F2]
        text-[#172033]
      "
    >

      {/* ======================================================
          SIDEBAR
      ====================================================== */}

      <OrganizationSidebar />


      {/* ======================================================
          MAIN AREA

          Sidebar = 18rem
      ====================================================== */}

      <div
        className="
          min-h-screen
          lg:ml-72
        "
      >

        {/* ====================================================
            NAVBAR
        ==================================================== */}

        <OrganizationNavbar />


        {/* ====================================================
            PAGE CONTENT
        ==================================================== */}

        <main
          className="
            px-4
            py-5
            sm:px-6
            lg:px-8
          "
        >

          <div
            className="
              max-w-7xl
              mx-auto
            "
          >


            {/* =================================================
                HERO
            ================================================= */}

            <section
              className="
                relative
                overflow-hidden
                rounded-3xl
                bg-gradient-to-r
                from-[#172033]
                via-[#172033]
                to-[#123F47]
                px-6
                py-7
                sm:px-8
                lg:px-9
                shadow-[0_20px_50px_rgba(23,32,51,0.14)]
                animate-[fadeUp_.5s_ease-out]
              "
            >

              {/* Decorative circles */}

              <div
                className="
                  absolute
                  -right-20
                  -top-32
                  w-80
                  h-80
                  rounded-full
                  bg-[#0F766E]/25
                  blur-3xl
                  animate-pulse
                "
              />

              <div
                className="
                  absolute
                  right-40
                  -bottom-32
                  w-64
                  h-64
                  rounded-full
                  bg-[#79CEC5]/10
                  blur-3xl
                "
              />


              <div
                className="
                  relative
                  flex
                  flex-col
                  lg:flex-row
                  lg:items-center
                  lg:justify-between
                  gap-6
                "
              >

                <div>

                  <div
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-3
                      py-1.5
                      rounded-full
                      bg-white/10
                      border
                      border-white/10
                      text-xs
                      font-semibold
                      text-white/90
                      mb-4
                    "
                  >

                    <Sparkles
                      size={14}
                      className="text-[#79CEC5]"
                    />

                    Recruit AI
                  </div>


                  <h1
                    className="
                      text-2xl
                      sm:text-3xl
                      lg:text-4xl
                      font-bold
                      text-white
                    "
                  >

                    Welcome back,{" "}

                    <span
                      className="
                        text-[#79CEC5]
                      "
                    >
                      {company}
                    </span>

                  </h1>


                  <p
                    className="
                      mt-2
                      max-w-2xl
                      text-sm
                      sm:text-base
                      text-white/65
                    "
                  >

                    Manage your hiring pipeline,
                    review candidates, track interviews,
                    and make smarter recruitment decisions.

                  </p>

                </div>


                <div
                  className="
                    flex
                    flex-wrap
                    gap-3
                  "
                >

                  <button
                    onClick={() =>
                      loadDashboard(true)
                    }
                    disabled={refreshing}
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-4
                      py-3
                      rounded-xl
                      border
                      border-white/15
                      bg-white/10
                      text-white
                      text-sm
                      font-semibold
                      backdrop-blur
                      hover:bg-white/15
                      transition-all
                      duration-300
                    "
                  >

                    <RefreshCw
                      size={17}
                      className={
                        refreshing
                          ? "animate-spin"
                          : ""
                      }
                    />

                    Refresh

                  </button>


                  <button
                    onClick={() =>
                      window.location.href =
                        "/organization/jobs/create"
                    }
                    className="
                      inline-flex
                      items-center
                      gap-2
                      px-4
                      py-3
                      rounded-xl
                      bg-[#0F766E]
                      text-white
                      text-sm
                      font-bold
                      shadow-lg
                      shadow-[#0F766E]/20
                      hover:bg-[#0B625C]
                      hover:-translate-y-0.5
                      transition-all
                      duration-300
                    "
                  >

                    <Plus size={18} />

                    Create Job

                  </button>

                </div>

              </div>

            </section>


            {/* =================================================
                KPI CARDS
            ================================================= */}

            <section
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                xl:grid-cols-4
                gap-5
                mt-6
              "
            >

              <StatCard
                title="Active Jobs"
                value={activeJobs.length}
                subtitle={`${closedJobs} closed jobs`}
                icon={Briefcase}
                delay="0ms"
              />


              <StatCard
                title="Applications"
                value={stats.applications}
                subtitle={`${shortlistRate}% shortlisted`}
                icon={Users}
                delay="80ms"
                accent
              />


              <StatCard
                title="Interviews"
                value={stats.interviews}
                subtitle={`${interviewStats.completed} completed`}
                icon={CalendarDays}
                delay="160ms"
              />


              <StatCard
                title="Selected"
                value={stats.selected}
                subtitle={`${hiringRate}% hiring rate`}
                icon={Trophy}
                delay="240ms"
                success
              />

            </section>


            {/* =================================================
                ANALYTICS GRID
            ================================================= */}

            <section
              className="
                grid
                grid-cols-1
                xl:grid-cols-3
                gap-6
                mt-6
              "
            >


              {/* =================================================
                  APPLICATION PIPELINE GRAPH
              ================================================= */}

              <div
                className="
                  xl:col-span-2
                  bg-white
                  border
                  border-[#E5E7EB]
                  rounded-2xl
                  p-5
                  sm:p-6
                  shadow-[0_8px_30px_rgba(23,32,51,0.04)]
                  hover:shadow-[0_14px_35px_rgba(23,32,51,0.07)]
                  transition-all
                  duration-300
                "
              >

                <div
                  className="
                    flex
                    items-start
                    justify-between
                    gap-4
                    mb-6
                  "
                >

                  <div>

                    <p
                      className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                        text-[#0F766E]
                      "
                    >
                      Hiring Pipeline
                    </p>

                    <h2
                      className="
                        text-xl
                        font-bold
                        mt-1
                      "
                    >
                      Application Journey
                    </h2>

                    <p
                      className="
                        text-sm
                        text-[#64748B]
                        mt-1
                      "
                    >
                      Track candidates from application
                      to selection.
                    </p>

                  </div>


                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-[#EEF5F4]
                      text-[#0F766E]
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <TrendingUp
                      size={20}
                    />

                  </div>

                </div>


                {/* GRAPH */}

                <div
                  className="
                    relative
                    h-56
                    sm:h-64
                    rounded-xl
                    bg-gradient-to-b
                    from-[#FAFCFB]
                    to-[#F7F6F2]
                    border
                    border-[#EEF0EF]
                    overflow-hidden
                  "
                >

                  {/* GRID LINES */}

                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      flex-col
                      justify-between
                      py-7
                      px-5
                    "
                  >

                    {[1, 2, 3, 4, 5].map(
                      (item) => (

                        <div
                          key={item}
                          className="
                            border-t
                            border-dashed
                            border-[#DDE5E3]
                          "
                        />

                      )
                    )}

                  </div>


                  {/* SVG GRAPH */}

                  <svg
                    viewBox="0 0 800 250"
                    preserveAspectRatio="none"
                    className="
                      absolute
                      inset-0
                      w-full
                      h-full
                      p-4
                    "
                  >

                    <defs>

                      <linearGradient
                        id="areaGradient"
                        x1="0"
                        x2="0"
                        y1="0"
                        y2="1"
                      >

                        <stop
                          offset="0%"
                          stopColor="#0F766E"
                          stopOpacity="0.22"
                        />

                        <stop
                          offset="100%"
                          stopColor="#0F766E"
                          stopOpacity="0"
                        />

                      </linearGradient>

                    </defs>


                    {/* AREA */}

                    <path
                      d="
                        M 0 190
                        L 120 160
                        L 240 175
                        L 360 120
                        L 480 135
                        L 600 85
                        L 800 50
                        L 800 250
                        L 0 250
                        Z
                      "
                      fill="url(#areaGradient)"
                    />


                    {/* LINE */}

                    <path
                      d="
                        M 0 190
                        L 120 160
                        L 240 175
                        L 360 120
                        L 480 135
                        L 600 85
                        L 800 50
                      "
                      fill="none"
                      stroke="#0F766E"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />


                    {/* POINTS */}

                    <circle
                      cx="0"
                      cy="190"
                      r="7"
                      fill="#FFFFFF"
                      stroke="#172033"
                      strokeWidth="4"
                    />

                    <circle
                      cx="120"
                      cy="160"
                      r="7"
                      fill="#FFFFFF"
                      stroke="#0F766E"
                      strokeWidth="4"
                    />

                    <circle
                      cx="240"
                      cy="175"
                      r="7"
                      fill="#FFFFFF"
                      stroke="#0F766E"
                      strokeWidth="4"
                    />

                    <circle
                      cx="360"
                      cy="120"
                      r="7"
                      fill="#FFFFFF"
                      stroke="#0F766E"
                      strokeWidth="4"
                    />

                    <circle
                      cx="480"
                      cy="135"
                      r="7"
                      fill="#FFFFFF"
                      stroke="#0F766E"
                      strokeWidth="4"
                    />

                    <circle
                      cx="600"
                      cy="85"
                      r="7"
                      fill="#FFFFFF"
                      stroke="#0F766E"
                      strokeWidth="4"
                    />

                    <circle
                      cx="800"
                      cy="50"
                      r="8"
                      fill="#FFFFFF"
                      stroke="#172033"
                      strokeWidth="4"
                    />

                  </svg>


                  {/* LABELS */}

                  <div
                    className="
                      absolute
                      bottom-3
                      left-5
                      right-5
                      flex
                      justify-between
                      text-[11px]
                      text-[#94A3B8]
                    "
                  >

                    <span>
                      Applications
                    </span>

                    <span>
                      Shortlisted
                    </span>

                    <span>
                      Interviews
                    </span>

                    <span>
                      Selected
                    </span>

                  </div>

                </div>


                {/* PIPELINE NUMBERS */}

                <div
                  className="
                    grid
                    grid-cols-4
                    gap-3
                    mt-5
                  "
                >

                  <MiniMetric
                    label="Applied"
                    value={stats.applications}
                  />

                  <MiniMetric
                    label="Shortlisted"
                    value={
                      applicationStats.shortlisted
                    }
                  />

                  <MiniMetric
                    label="Interviewed"
                    value={
                      stats.interviews
                    }
                  />

                  <MiniMetric
                    label="Selected"
                    value={
                      stats.selected
                    }
                  />

                </div>

              </div>


              {/* =================================================
                  STATUS BREAKDOWN
              ================================================= */}

              <div
                className="
                  bg-white
                  border
                  border-[#E5E7EB]
                  rounded-2xl
                  p-5
                  sm:p-6
                  shadow-[0_8px_30px_rgba(23,32,51,0.04)]
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mb-6
                  "
                >

                  <div>

                    <p
                      className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                        text-[#0F766E]
                      "
                    >
                      Applications
                    </p>

                    <h2
                      className="
                        text-xl
                        font-bold
                        mt-1
                      "
                    >
                      Status Breakdown
                    </h2>

                  </div>


                  <div
                    className="
                      w-10
                      h-10
                      rounded-xl
                      bg-[#172033]
                      text-white
                      flex
                      items-center
                      justify-center
                    "
                  >

                    <BarChart3 size={19} />

                  </div>

                </div>


                <StatusBar
                  label="Pending"
                  value={
                    applicationStats.pending
                  }
                  total={stats.applications}
                  color="bg-[#172033]"
                />


                <StatusBar
                  label="Shortlisted"
                  value={
                    applicationStats.shortlisted
                  }
                  total={stats.applications}
                  color="bg-[#0F766E]"
                />


                <StatusBar
                  label="Selected"
                  value={
                    applicationStats.selected
                  }
                  total={stats.applications}
                  color="bg-[#16803C]"
                />


                <StatusBar
                  label="Rejected"
                  value={
                    applicationStats.rejected
                  }
                  total={stats.applications}
                  color="bg-[#C53030]"
                />


                {/* Hiring Rate */}

                <div
                  className="
                    mt-7
                    rounded-xl
                    bg-[#F7F6F2]
                    border
                    border-[#E8E8E4]
                    p-4
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <Target
                        size={17}
                        className="
                          text-[#0F766E]
                        "
                      />

                      <span
                        className="
                          text-sm
                          font-semibold
                        "
                      >
                        Hiring Rate
                      </span>

                    </div>


                    <span
                      className="
                        text-xl
                        font-bold
                        text-[#0F766E]
                      "
                    >
                      {hiringRate}%
                    </span>

                  </div>

                </div>

              </div>

            </section>


            {/* =================================================
                INTERVIEW + JOB OVERVIEW
            ================================================= */}

            <section
              className="
                grid
                grid-cols-1
                lg:grid-cols-2
                gap-6
                mt-6
              "
            >


              {/* INTERVIEW */}

              <div
                className="
                  bg-white
                  border
                  border-[#E5E7EB]
                  rounded-2xl
                  p-5
                  sm:p-6
                  shadow-[0_8px_30px_rgba(23,32,51,0.04)]
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mb-5
                  "
                >

                  <div>

                    <p
                      className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                        text-[#0F766E]
                      "
                    >
                      Interview Activity
                    </p>

                    <h2
                      className="
                        text-xl
                        font-bold
                        mt-1
                      "
                    >
                      Interview Overview
                    </h2>

                  </div>


                  <Activity
                    size={21}
                    className="
                      text-[#0F766E]
                    "
                  />

                </div>


                <div className="space-y-3">

                  <InterviewRow
                    title="Upcoming"
                    value={
                      interviewStats.upcoming
                    }
                    icon={CalendarDays}
                    bg="bg-[#EEF5F4]"
                    text="text-[#0F766E]"
                  />

                  <InterviewRow
                    title="Completed"
                    value={
                      interviewStats.completed
                    }
                    icon={CheckCircle2}
                    bg="bg-[#EAF6EE]"
                    text="text-[#16803C]"
                  />

                  <InterviewRow
                    title="Pending"
                    value={
                      interviewStats.pending
                    }
                    icon={Clock3}
                    bg="bg-[#FFF7E8]"
                    text="text-[#B7791F]"
                  />

                </div>


                <div
                  className="
                    mt-5
                    p-4
                    rounded-xl
                    bg-gradient-to-r
                    from-[#172033]
                    to-[#123F47]
                    text-white
                  "
                >

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                    "
                  >

                    <div>

                      <p
                        className="
                          text-xs
                          text-white/60
                        "
                      >
                        Total interviews
                      </p>

                      <p
                        className="
                          text-3xl
                          font-bold
                          mt-1
                        "
                      >
                        {stats.interviews}
                      </p>

                    </div>


                    <div
                      className="
                        w-11
                        h-11
                        rounded-xl
                        bg-white/10
                        flex
                        items-center
                        justify-center
                      "
                    >

                      <CalendarDays
                        size={21}
                      />

                    </div>

                  </div>

                </div>

              </div>


              {/* JOB OVERVIEW */}

              <div
                className="
                  bg-white
                  border
                  border-[#E5E7EB]
                  rounded-2xl
                  p-5
                  sm:p-6
                  shadow-[0_8px_30px_rgba(23,32,51,0.04)]
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mb-5
                  "
                >

                  <div>

                    <p
                      className="
                        text-xs
                        font-bold
                        uppercase
                        tracking-wider
                        text-[#0F766E]
                      "
                    >
                      Job Management
                    </p>

                    <h2
                      className="
                        text-xl
                        font-bold
                        mt-1
                      "
                    >
                      Job Overview
                    </h2>

                  </div>


                  <Briefcase
                    size={21}
                    className="
                      text-[#0F766E]
                    "
                  />

                </div>


                <div
                  className="
                    grid
                    grid-cols-2
                    gap-4
                  "
                >

                  <JobMetric
                    label="Total Jobs"
                    value={stats.jobs}
                    icon={Briefcase}
                  />

                  <JobMetric
                    label="Active"
                    value={
                      activeJobs.length
                    }
                    icon={Activity}
                    green
                  />

                  <JobMetric
                    label="Closed"
                    value={closedJobs}
                    icon={XCircle}
                    red
                  />

                  <JobMetric
                    label="Applications"
                    value={
                      stats.applications
                    }
                    icon={FileText}
                    teal
                  />

                </div>


                <button
                  onClick={() =>
                    window.location.href =
                      "/organization/jobs"
                  }
                  className="
                    w-full
                    mt-5
                    py-3
                    rounded-xl
                    bg-[#172033]
                    text-white
                    text-sm
                    font-semibold
                    flex
                    items-center
                    justify-center
                    gap-2
                    hover:bg-[#0F172A]
                    transition-all
                  "
                >

                  Manage Jobs

                  <ArrowUpRight
                    size={17}
                  />

                </button>

              </div>

            </section>


            {/* =================================================
                RECENT APPLICATIONS
            ================================================= */}

            <section
              className="
                mt-6
                bg-white
                border
                border-[#E5E7EB]
                rounded-2xl
                overflow-hidden
                shadow-[0_8px_30px_rgba(23,32,51,0.04)]
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  px-5
                  sm:px-6
                  py-5
                  border-b
                  border-[#E5E7EB]
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-[#0F766E]
                    "
                  >
                    Latest Activity
                  </p>

                  <h2
                    className="
                      text-xl
                      font-bold
                      mt-1
                    "
                  >
                    Recent Applications
                  </h2>

                </div>


                <button
                  onClick={() =>
                    window.location.href =
                      "/organization/applications"
                  }
                  className="
                    flex
                    items-center
                    gap-1
                    text-sm
                    font-semibold
                    text-[#0F766E]
                    hover:gap-2
                    transition-all
                  "
                >

                  View all

                  <ChevronRight
                    size={17}
                  />

                </button>

              </div>


              {recentApplications.length === 0 ? (

                <div
                  className="
                    py-12
                    text-center
                  "
                >

                  <FileText
                    size={32}
                    className="
                      mx-auto
                      text-[#0F766E]
                      mb-3
                    "
                  />

                  <p
                    className="
                      font-bold
                    "
                  >
                    No applications yet
                  </p>

                  <p
                    className="
                      text-sm
                      text-[#94A3B8]
                      mt-1
                    "
                  >
                    Applications will appear
                    here when candidates apply.
                  </p>

                </div>

              ) : (

                <div>

                  {recentApplications.map(
                    (application, index) => {

                      const status =
                        application?.status ||
                        "Pending";

                      const style =
                        getStatusStyle(
                          status
                        );


                      return (

                        <div
                          key={
                            application?._id ||
                            application?.id ||
                            index
                          }
                          className="
                            flex
                            items-center
                            justify-between
                            gap-4
                            px-5
                            sm:px-6
                            py-4
                            border-b
                            border-[#F0F1F2]
                            last:border-0
                            hover:bg-[#FAFAF8]
                            transition-all
                          "
                        >

                          <div
                            className="
                              flex
                              items-center
                              gap-3
                              min-w-0
                            "
                          >

                            <div
                              className="
                                w-10
                                h-10
                                rounded-xl
                                bg-[#EEF5F4]
                                text-[#0F766E]
                                flex
                                items-center
                                justify-center
                                font-bold
                                flex-shrink-0
                              "
                            >

                              {getCandidateName(
                                application
                              )
                                .charAt(0)
                                .toUpperCase()}

                            </div>


                            <div
                              className="
                                min-w-0
                              "
                            >

                              <p
                                className="
                                  text-sm
                                  font-semibold
                                  truncate
                                "
                              >
                                {getCandidateName(
                                  application
                                )}
                              </p>

                              <p
                                className="
                                  text-xs
                                  text-[#94A3B8]
                                  truncate
                                "
                              >
                                {getJobTitle(
                                  application
                                )}
                              </p>

                            </div>

                          </div>


                          <span
                            className={`
                              flex
                              items-center
                              gap-1.5
                              flex-shrink-0
                              px-3
                              py-1.5
                              rounded-full
                              text-xs
                              font-semibold
                              ${style.bg}
                              ${style.text}
                            `}
                          >

                            <span
                              className={`
                                w-1.5
                                h-1.5
                                rounded-full
                                ${style.dot}
                              `}
                            />

                            {status}

                          </span>

                        </div>

                      );

                    }
                  )}

                </div>

              )}

            </section>


            {/* =================================================
                BOTTOM INSIGHT
            ================================================= */}

            <section
              className="
                mt-6
                mb-6
                rounded-2xl
                border
                border-[#D9E9E6]
                bg-gradient-to-r
                from-[#EEF7F5]
                via-white
                to-[#F7F6F2]
                p-5
                sm:p-6
              "
            >

              <div
                className="
                  flex
                  flex-col
                  md:flex-row
                  md:items-center
                  md:justify-between
                  gap-5
                "
              >

                <div
                  className="
                    flex
                    items-start
                    gap-4
                  "
                >

                  <div
                    className="
                      w-11
                      h-11
                      rounded-xl
                      bg-[#0F766E]
                      text-white
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                    "
                  >

                    <Sparkles
                      size={21}
                    />

                  </div>


                  <div>

                    <h3
                      className="
                        font-bold
                        text-lg
                      "
                    >
                      Recruitment at a glance
                    </h3>

                    <p
                      className="
                        text-sm
                        text-[#64748B]
                        mt-1
                      "
                    >

                      You currently have{" "}

                      <strong>
                        {activeJobs.length}
                      </strong>{" "}

                      active jobs and{" "}

                      <strong>
                        {stats.applications}
                      </strong>{" "}

                      applications with a{" "}

                      <strong
                        className="
                          text-[#0F766E]
                        "
                      >
                        {hiringRate}%
                      </strong>{" "}

                      selection rate.

                    </p>

                  </div>

                </div>


                <button
                  onClick={() =>
                    window.location.href =
                      "/organization/analytics"
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-5
                    py-3
                    rounded-xl
                    bg-[#172033]
                    text-white
                    text-sm
                    font-semibold
                    hover:bg-[#0F172A]
                    hover:-translate-y-0.5
                    transition-all
                  "
                >

                  View Analytics

                  <ArrowUpRight
                    size={17}
                  />

                </button>

              </div>

            </section>


          </div>

        </main>

      </div>

    </div>

  );

}


// ============================================================
// STAT CARD
// ============================================================

function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  accent = false,
  success = false,
  delay = "0ms",
}) {

  return (

    <div
      style={{
        animationDelay: delay,
      }}
      className="
        group
        bg-white
        border
        border-[#E5E7EB]
        rounded-2xl
        p-5
        shadow-[0_8px_25px_rgba(23,32,51,0.04)]
        hover:-translate-y-1
        hover:shadow-[0_15px_35px_rgba(23,32,51,0.09)]
        transition-all
        duration-300
        animate-[fadeUp_.5s_ease-out_both]
      "
    >

      <div
        className="
          flex
          items-start
          justify-between
        "
      >

        <div>

          <p
            className="
              text-sm
              font-medium
              text-[#64748B]
            "
          >
            {title}
          </p>

          <p
            className="
              text-3xl
              font-bold
              text-[#172033]
              mt-2
            "
          >
            {value}
          </p>

          <p
            className="
              text-xs
              text-[#94A3B8]
              mt-1
            "
          >
            {subtitle}
          </p>

        </div>


        <div
          className={`
            w-11
            h-11
            rounded-xl
            flex
            items-center
            justify-center
            transition-all
            duration-300
            group-hover:scale-110
            ${
              success
                ? "bg-[#EAF6EE] text-[#16803C]"
                : accent
                ? "bg-[#EEF5F4] text-[#0F766E]"
                : "bg-[#EEF1F5] text-[#172033]"
            }
          `}
        >

          <Icon size={21} />

        </div>

      </div>


      <div
        className="
          mt-5
          h-1
          rounded-full
          bg-[#EEF0F1]
          overflow-hidden
        "
      >

        <div
          className={`
            h-full
            rounded-full
            transition-all
            duration-700
            group-hover:w-full
            ${
              success
                ? "w-3/5 bg-[#16803C]"
                : accent
                ? "w-4/5 bg-[#0F766E]"
                : "w-2/3 bg-[#172033]"
            }
          `}
        />

      </div>

    </div>

  );

}


// ============================================================
// MINI METRIC
// ============================================================

function MiniMetric({
  label,
  value,
}) {

  return (

    <div
      className="
        text-center
        rounded-xl
        bg-[#F7F6F2]
        border
        border-[#ECEDE9]
        py-3
      "
    >

      <p
        className="
          text-lg
          font-bold
          text-[#172033]
        "
      >
        {value}
      </p>

      <p
        className="
          text-[10px]
          sm:text-xs
          text-[#94A3B8]
          mt-0.5
        "
      >
        {label}
      </p>

    </div>

  );

}


// ============================================================
// STATUS BAR
// ============================================================

function StatusBar({
  label,
  value,
  total,
  color,
}) {

  const percentage =
    total > 0
      ? Math.round(
          (value / total) * 100
        )
      : 0;


  return (

    <div className="mb-5">

      <div
        className="
          flex
          items-center
          justify-between
          mb-2
        "
      >

        <span
          className="
            text-sm
            font-medium
            text-[#172033]
          "
        >
          {label}
        </span>

        <span
          className="
            text-xs
            font-bold
            text-[#64748B]
          "
        >
          {value}
        </span>

      </div>


      <div
        className="
          h-2
          rounded-full
          bg-[#EDF0F2]
          overflow-hidden
        "
      >

        <div
          className={`
            h-full
            rounded-full
            ${color}
            transition-all
            duration-700
          `}
          style={{
            width:
              `${Math.min(
                percentage,
                100
              )}%`,
          }}
        />

      </div>


      <p
        className="
          text-[10px]
          text-[#94A3B8]
          mt-1
          text-right
        "
      >
        {percentage}%
      </p>

    </div>

  );

}


// ============================================================
// INTERVIEW ROW
// ============================================================

function InterviewRow({
  title,
  value,
  icon: Icon,
  bg,
  text,
}) {

  return (

    <div
      className="
        flex
        items-center
        justify-between
        p-3
        rounded-xl
        hover:bg-[#FAFAF8]
        transition
      "
    >

      <div
        className="
          flex
          items-center
          gap-3
        "
      >

        <div
          className={`
            w-9
            h-9
            rounded-lg
            ${bg}
            ${text}
            flex
            items-center
            justify-center
          `}
        >

          <Icon size={17} />

        </div>


        <span
          className="
            text-sm
            font-medium
          "
        >
          {title}
        </span>

      </div>


      <span
        className="
          font-bold
          text-[#172033]
        "
      >
        {value}
      </span>

    </div>

  );

}


// ============================================================
// JOB METRIC
// ============================================================

function JobMetric({
  label,
  value,
  icon: Icon,
  green = false,
  red = false,
  teal = false,
}) {

  let background =
    "bg-[#F2F4F6]";

  let text =
    "text-[#172033]";


  if (green) {
    background = "bg-[#EAF6EE]";
    text = "text-[#16803C]";
  }

  if (red) {
    background = "bg-[#FCEDED]";
    text = "text-[#C53030]";
  }

  if (teal) {
    background = "bg-[#EEF5F4]";
    text = "text-[#0F766E]";
  }


  return (

    <div
      className="
        rounded-xl
        bg-[#FCFCFB]
        border
        border-[#EEF0F1]
        p-4
      "
    >

      <div
        className={`
          w-9
          h-9
          rounded-lg
          ${background}
          ${text}
          flex
          items-center
          justify-center
          mb-3
        `}
      >

        <Icon size={17} />

      </div>


      <p
        className="
          text-xs
          text-[#64748B]
        "
      >
        {label}
      </p>


      <p
        className="
          text-2xl
          font-bold
          mt-1
        "
      >
        {value}
      </p>

    </div>

  );

}