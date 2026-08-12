import React, {
  useEffect,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  getOrganizationInterviews,
} from "../../api/interviewApi";

import OrganizationSidebar from "../../components/organization/OrganizationSidebar";
import OrganizationNavbar from "../../components/organization/OrganizationNavbar";

import {
  Video,
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Eye,
  AlertCircle,
  Brain,
  Trophy,
  PlayCircle,
  CalendarCheck,
  CircleDot,
} from "lucide-react";


// =========================================================
// ORGANIZATION INTERVIEWS
// =========================================================

export default function OrganizationInterviews() {

  const navigate = useNavigate();

  // =======================================================
  // STATE
  // =======================================================

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");


  // =======================================================
  // GET ORGANIZATION ID
  // =======================================================

  const getOrganizationId = () => {
    try {

      // 1. organization object
      const organizationData =
        localStorage.getItem("organization");

      if (organizationData) {

        const organization =
          JSON.parse(organizationData);

        const organizationId =
          organization?.id ||
          organization?._id ||
          organization?.organization_id ||
          organization?.organizationId;

        if (organizationId) {
          return String(organizationId);
        }
      }


      // 2. organization_id
      const organizationId =
        localStorage.getItem("organization_id");

      if (organizationId) {
        return String(organizationId);
      }


      // 3. organizationId
      const organizationIdCamel =
        localStorage.getItem("organizationId");

      if (organizationIdCamel) {
        return String(organizationIdCamel);
      }


      // 4. user
      const userData =
        localStorage.getItem("user");

      if (userData) {

        const user =
          JSON.parse(userData);

        const id =
          user?.organization_id ||
          user?.organizationId ||
          user?.organization?.id ||
          user?.organization?._id;

        if (id) {
          return String(id);
        }
      }


      // 5. auth_user
      const authUserData =
        localStorage.getItem("auth_user");

      if (authUserData) {

        const authUser =
          JSON.parse(authUserData);

        const id =
          authUser?.organization_id ||
          authUser?.organizationId ||
          authUser?.organization?.id ||
          authUser?.organization?._id;

        if (id) {
          return String(id);
        }
      }


      return "";

    } catch (error) {

      console.error(
        "Organization ID error:",
        error
      );

      return "";
    }
  };


  // =======================================================
  // LOAD INTERVIEWS
  // =======================================================

  useEffect(() => {
    loadInterviews();
  }, []);


  const loadInterviews = async () => {

    try {

      setLoading(true);
      setError("");

      const organizationId =
        getOrganizationId();

      if (!organizationId) {

        throw new Error(
          "Organization ID not found. Please login again."
        );
      }

      console.log(
        "Organization ID:",
        organizationId
      );

      const response =
        await getOrganizationInterviews(
          organizationId
        );

      console.log(
        "Organization Interviews:",
        response
      );

      const data =
        response?.interviews ||
        response?.data ||
        [];

      setInterviews(
        Array.isArray(data)
          ? data
          : []
      );

    } catch (err) {

      console.error(
        "Interview loading error:",
        err
      );

      const backendMessage =
        err?.response?.data?.detail ||
        err?.response?.data?.message;

      setError(
        backendMessage ||
        err?.message ||
        "Failed to load interviews."
      );

    } finally {

      setLoading(false);
    }
  };


  // =======================================================
  // FILTER
  // =======================================================

  const filteredInterviews =
    filter === "All"
      ? interviews
      : interviews.filter(
          (interview) =>
            interview?.status === filter
        );


  // =======================================================
  // STATUS STYLE
  // =======================================================

  const getStatusStyle = (status) => {

    switch (status) {

      case "Scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "Confirmed":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";

      case "In Progress":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "Completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "Cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      case "Rescheduled":
        return "bg-purple-50 text-purple-700 border-purple-200";

      default:
        return "bg-gray-50 text-gray-600 border-gray-200";
    }
  };


  // =======================================================
  // STATUS ICON
  // =======================================================

  const getStatusIcon = (status) => {

    switch (status) {

      case "Scheduled":
        return <Calendar size={14} />;

      case "Confirmed":
        return <CalendarCheck size={14} />;

      case "In Progress":
        return <PlayCircle size={14} />;

      case "Completed":
        return <CheckCircle2 size={14} />;

      case "Cancelled":
        return <XCircle size={14} />;

      case "Rescheduled":
        return <RefreshCw size={14} />;

      default:
        return <CircleDot size={14} />;
    }
  };


  // =======================================================
  // OPEN INTERVIEW
  // =======================================================

  const openInterview = (interviewId) => {

    if (!interviewId) {

      console.error(
        "Interview ID missing."
      );

      return;
    }

    navigate(
      `/organization/interviews/${interviewId}`
    );
  };


  // =======================================================
  // STATISTICS
  // =======================================================

  const stats = {

    total:
      interviews.length,

    scheduled:
      interviews.filter(
        (item) =>
          item?.status === "Scheduled"
      ).length,

    confirmed:
      interviews.filter(
        (item) =>
          item?.status === "Confirmed"
      ).length,

    inProgress:
      interviews.filter(
        (item) =>
          item?.status === "In Progress"
      ).length,

    completed:
      interviews.filter(
        (item) =>
          item?.status === "Completed"
      ).length,

    cancelled:
      interviews.filter(
        (item) =>
          item?.status === "Cancelled"
      ).length,
  };


  // =======================================================
  // LOADING UI
  // =======================================================

  if (loading) {

    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#F7F6F2]">

        {/* SIDEBAR */}
        <div className="w-72 min-w-72 shrink-0 h-screen">
          <OrganizationSidebar />
        </div>


        {/* RIGHT AREA */}
        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          <div className="shrink-0">
            <OrganizationNavbar />
          </div>


          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">

            <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">

              <div className="animate-pulse">

                {/* HEADER */}

                <div className="flex items-center justify-between mb-8">

                  <div>

                    <div className="h-9 w-60 bg-gray-200 rounded-lg mb-3" />

                    <div className="h-4 w-80 bg-gray-200 rounded" />

                  </div>

                  <div className="h-11 w-28 bg-gray-200 rounded-xl" />

                </div>


                {/* STATS */}

                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">

                  {[1, 2, 3, 4, 5, 6].map(
                    (item) => (
                      <div
                        key={item}
                        className="h-28 bg-gray-200 rounded-2xl"
                      />
                    )
                  )}

                </div>


                {/* FILTER */}

                <div className="h-14 bg-gray-200 rounded-2xl mb-6" />


                {/* TABLE */}

                <div className="h-96 bg-gray-200 rounded-2xl" />

              </div>

            </div>

          </main>

        </div>

      </div>
    );
  }


  // =======================================================
  // MAIN UI
  // =======================================================

  return (

    <div className="flex h-screen w-full overflow-hidden bg-[#F7F6F2] text-[#172033]">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <div className="w-72 min-w-72 shrink-0 h-screen">

        <OrganizationSidebar />

      </div>


      {/* =================================================
          RIGHT APPLICATION AREA
      ================================================= */}

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">


        {/* =================================================
            NAVBAR
        ================================================= */}

        <div className="shrink-0">

          <OrganizationNavbar />

        </div>


        {/* =================================================
            SCROLLABLE CONTENT
        ================================================= */}

        <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">


          {/* =================================================
              CONTENT CONTAINER

              IMPORTANT:
              width is controlled here so content never
              goes underneath sidebar.
          ================================================= */}

          <div className="w-full max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-8">


            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5 mb-7">


              <div>

                <div className="flex items-center gap-3">

                  <div className="w-12 h-12 rounded-2xl bg-[#E8F3F2] flex items-center justify-center shadow-sm">

                    <Video
                      size={24}
                      className="text-[#0F766E]"
                    />

                  </div>


                  <div>

                    <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-[#172033]">

                      AI Interviews

                    </h1>

                    <p className="text-sm text-[#64748B] mt-1">

                      Manage candidate interviews and review interview results.

                    </p>

                  </div>

                </div>

              </div>


              {/* REFRESH */}

              <button
                onClick={loadInterviews}
                className="
                  inline-flex
                  items-center
                  justify-center
                  gap-2
                  px-5
                  py-3
                  bg-white
                  border
                  border-[#E2E8F0]
                  rounded-xl
                  text-[#475569]
                  text-sm
                  font-semibold
                  shadow-sm
                  hover:bg-[#F8FAFC]
                  hover:border-[#CBD5E1]
                  hover:-translate-y-0.5
                  transition-all
                  duration-200
                "
              >

                <RefreshCw size={17} />

                Refresh

              </button>

            </div>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-7">

              <InterviewStat
                title="Total"
                value={stats.total}
                icon={<Users size={20} />}
                iconBg="bg-blue-50"
                iconColor="text-blue-600"
              />

              <InterviewStat
                title="Scheduled"
                value={stats.scheduled}
                icon={<Calendar size={20} />}
                iconBg="bg-indigo-50"
                iconColor="text-indigo-600"
              />

              <InterviewStat
                title="Confirmed"
                value={stats.confirmed}
                icon={<CalendarCheck size={20} />}
                iconBg="bg-cyan-50"
                iconColor="text-cyan-600"
              />

              <InterviewStat
                title="In Progress"
                value={stats.inProgress}
                icon={<PlayCircle size={20} />}
                iconBg="bg-amber-50"
                iconColor="text-amber-600"
              />

              <InterviewStat
                title="Completed"
                value={stats.completed}
                icon={<Trophy size={20} />}
                iconBg="bg-emerald-50"
                iconColor="text-emerald-600"
              />

              <InterviewStat
                title="Cancelled"
                value={stats.cancelled}
                icon={<XCircle size={20} />}
                iconBg="bg-red-50"
                iconColor="text-red-600"
              />

            </div>


            {/* =================================================
                FILTERS
            ================================================= */}

            <div className="bg-white border border-[#E5E7EB] rounded-2xl p-3 shadow-sm mb-6 overflow-x-auto">

              <div className="flex items-center gap-2 min-w-max">

                {[
                  "All",
                  "Scheduled",
                  "Confirmed",
                  "In Progress",
                  "Completed",
                  "Rescheduled",
                  "Cancelled",
                ].map((status) => (

                  <button
                    key={status}
                    onClick={() => setFilter(status)}
                    className={`
                      px-4
                      py-2.5
                      rounded-xl
                      text-sm
                      font-semibold
                      transition-all
                      duration-200
                      ${
                        filter === status
                          ? "bg-[#172033] text-white shadow-sm"
                          : "text-[#64748B] hover:bg-[#F1F5F9] hover:text-[#172033]"
                      }
                    `}
                  >
                    {status}
                  </button>

                ))}

              </div>

            </div>


            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="flex items-start gap-3 bg-red-50 border border-red-200 text-red-700 rounded-2xl p-4 mb-6">

                <AlertCircle
                  size={20}
                  className="mt-0.5 flex-shrink-0"
                />

                <div>

                  <p className="font-semibold">
                    Failed to load interviews
                  </p>

                  <p className="text-sm mt-1">
                    {error}
                  </p>

                </div>

              </div>

            )}


            {/* =================================================
                RESULT HEADER
            ================================================= */}

            <div className="flex items-center justify-between mb-4">

              <div>

                <h2 className="text-lg font-bold text-[#172033]">
                  Interview Schedule
                </h2>

                <p className="text-sm text-[#64748B] mt-0.5">

                  Showing{" "}

                  <span className="font-semibold text-[#172033]">
                    {filteredInterviews.length}
                  </span>{" "}

                  of{" "}

                  <span className="font-semibold text-[#172033]">
                    {interviews.length}
                  </span>{" "}

                  interviews

                </p>

              </div>

            </div>


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {filteredInterviews.length === 0 ? (

              <div className="bg-white border border-[#E5E7EB] rounded-3xl p-12 md:p-16 text-center shadow-sm">

                <div className="w-20 h-20 mx-auto rounded-3xl bg-[#E8F3F2] flex items-center justify-center mb-5">

                  <Video
                    size={34}
                    className="text-[#0F766E]"
                  />

                </div>

                <h3 className="text-xl font-bold text-[#172033]">
                  No Interviews Found
                </h3>

                <p className="text-[#64748B] mt-2 max-w-md mx-auto">

                  There are no interviews matching the selected status filter.

                </p>

                {filter !== "All" && (

                  <button
                    onClick={() => setFilter("All")}
                    className="mt-5 px-5 py-2.5 rounded-xl bg-[#F1F5F9] text-[#475569] text-sm font-semibold hover:bg-[#E2E8F0] transition"
                  >
                    View All Interviews
                  </button>

                )}

              </div>

            ) : (

              /* =================================================
                 TABLE
              ================================================= */

              <div className="bg-white border border-[#E5E7EB] rounded-2xl shadow-sm overflow-hidden">

                <div className="w-full overflow-x-auto">

                  <table className="w-full min-w-[1050px]">

                    {/* TABLE HEADER */}

                    <thead className="bg-[#F8FAFC] border-b border-[#E5E7EB]">

                      <tr>

                        <TableHeader>
                          Candidate
                        </TableHeader>

                        <TableHeader>
                          Job
                        </TableHeader>

                        <TableHeader>
                          Interview
                        </TableHeader>

                        <TableHeader>
                          Schedule
                        </TableHeader>

                        <TableHeader>
                          Score
                        </TableHeader>

                        <TableHeader>
                          Status
                        </TableHeader>

                        <TableHeader align="right">
                          Action
                        </TableHeader>

                      </tr>

                    </thead>


                    {/* TABLE BODY */}

                    <tbody className="divide-y divide-[#F1F5F9]">

                      {filteredInterviews.map(
                        (interview) => {

                          const interviewId =
                            interview?.id ||
                            interview?._id ||
                            interview?.interview_id;


                          const candidateName =
                            interview?.student_name ||
                            interview?.candidate_name ||
                            interview?.student?.name ||
                            interview?.candidate?.name ||
                            interview?.student_id ||
                            "Candidate";


                          const candidateEmail =
                            interview?.student_email ||
                            interview?.candidate_email ||
                            interview?.student?.email ||
                            interview?.candidate?.email ||
                            "";


                          const jobTitle =
                            interview?.job_title ||
                            interview?.job_name ||
                            interview?.job?.title ||
                            interview?.job_id ||
                            "-";


                          const roundName =
                            interview?.round_name ||
                            "Technical Interview";


                          const interviewType =
                            interview?.interview_type ||
                            "Technical";


                          const interviewMode =
                            interview?.interview_mode ||
                            "AI";


                          const scheduledDate =
                            interview?.scheduled_date ||
                            "-";


                          const scheduledTime =
                            interview?.scheduled_time ||
                            "-";


                          const status =
                            interview?.status ||
                            "Unknown";


                          const score =
                            interview?.overall_score ??
                            interview?.score;


                          return (

                            <tr
                              key={interviewId}
                              className="
                                hover:bg-[#FAFCFC]
                                transition-colors
                              "
                            >

                              {/* CANDIDATE */}

                              <td className="px-5 py-5">

                                <div className="flex items-center gap-3">

                                  <div className="w-10 h-10 rounded-xl bg-[#E8F3F2] flex items-center justify-center flex-shrink-0">

                                    <Users
                                      size={18}
                                      className="text-[#0F766E]"
                                    />

                                  </div>

                                  <div className="min-w-0">

                                    <p className="font-semibold text-[#172033] truncate max-w-[190px]">
                                      {candidateName}
                                    </p>

                                    {candidateEmail && (

                                      <p className="text-xs text-[#94A3B8] mt-1 truncate max-w-[190px]">
                                        {candidateEmail}
                                      </p>

                                    )}

                                    <p className="text-[11px] text-[#94A3B8] mt-1">

                                      Application:{" "}

                                      {interview?.application_id ||
                                        "-"}

                                    </p>

                                  </div>

                                </div>

                              </td>


                              {/* JOB */}

                              <td className="px-5 py-5">

                                <div className="flex items-center gap-2">

                                  <div className="w-9 h-9 rounded-lg bg-blue-50 flex items-center justify-center">

                                    <BriefcaseIcon />

                                  </div>

                                  <p className="text-sm font-semibold text-[#475569] max-w-[180px] truncate">
                                    {jobTitle}
                                  </p>

                                </div>

                              </td>


                              {/* INTERVIEW */}

                              <td className="px-5 py-5">

                                <p className="font-semibold text-sm text-[#172033]">
                                  {roundName}
                                </p>

                                <div className="flex items-center gap-2 mt-1.5">

                                  <span className="inline-flex items-center px-2 py-1 rounded-md bg-purple-50 text-purple-700 text-[11px] font-semibold">
                                    {interviewType}
                                  </span>

                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-[#E8F3F2] text-[#0F766E] text-[11px] font-semibold">

                                    <Brain size={11} />

                                    {interviewMode}

                                  </span>

                                </div>

                              </td>


                              {/* SCHEDULE */}

                              <td className="px-5 py-5">

                                <div className="flex items-start gap-2">

                                  <Calendar
                                    size={16}
                                    className="text-[#94A3B8] mt-0.5"
                                  />

                                  <div>

                                    <p className="text-sm font-medium text-[#475569]">
                                      {scheduledDate}
                                    </p>

                                    <p className="text-xs text-[#94A3B8] mt-1 flex items-center gap-1">

                                      <Clock size={12} />

                                      {scheduledTime}

                                    </p>

                                  </div>

                                </div>

                              </td>


                              {/* SCORE */}

                              <td className="px-5 py-5">

                                {status === "Completed" &&
                                score !== undefined &&
                                score !== null ? (

                                  <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 font-bold text-sm">

                                    <Trophy size={14} />

                                    {score}/100

                                  </div>

                                ) : (

                                  <span className="text-[#CBD5E1]">
                                    —
                                  </span>

                                )}

                              </td>


                              {/* STATUS */}

                              <td className="px-5 py-5">

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
                                    whitespace-nowrap
                                    ${getStatusStyle(status)}
                                  `}
                                >

                                  {getStatusIcon(status)}

                                  {status}

                                </span>

                              </td>


                              {/* ACTION */}

                              <td className="px-5 py-5 text-right">

                                <button
                                  onClick={() =>
                                    openInterview(
                                      interviewId
                                    )
                                  }
                                  disabled={!interviewId}
                                  className="
                                    inline-flex
                                    items-center
                                    gap-2
                                    px-4
                                    py-2.5
                                    rounded-xl
                                    bg-[#172033]
                                    hover:bg-[#0F766E]
                                    text-white
                                    text-sm
                                    font-semibold
                                    shadow-sm
                                    hover:-translate-y-0.5
                                    transition-all
                                    disabled:opacity-40
                                    disabled:cursor-not-allowed
                                  "
                                >

                                  <Eye size={16} />

                                  View

                                </button>

                              </td>

                            </tr>

                          );
                        }
                      )}

                    </tbody>

                  </table>

                </div>


                {/* =================================================
                    TABLE FOOTER
                ================================================= */}

                <div className="px-5 py-4 bg-[#F8FAFC] border-t border-[#E5E7EB]">

                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                    <p className="text-sm text-[#64748B]">

                      Total interviews:{" "}

                      <span className="font-bold text-[#172033]">
                        {interviews.length}
                      </span>

                    </p>


                    <div className="flex items-center gap-4 text-xs text-[#64748B] flex-wrap">

                      <span>
                        Scheduled:{" "}
                        <b className="text-blue-600">
                          {stats.scheduled}
                        </b>
                      </span>

                      <span>
                        Completed:{" "}
                        <b className="text-emerald-600">
                          {stats.completed}
                        </b>
                      </span>

                      <span>
                        Cancelled:{" "}
                        <b className="text-red-600">
                          {stats.cancelled}
                        </b>
                      </span>

                    </div>

                  </div>

                </div>

              </div>

            )}

          </div>

        </main>

      </div>

    </div>
  );
}


// =============================================================
// STAT CARD
// =============================================================

function InterviewStat({
  title,
  value,
  icon,
  iconBg,
  iconColor,
}) {

  return (

    <div
      className="
        bg-white
        border
        border-[#E5E7EB]
        rounded-2xl
        p-4
        md:p-5
        shadow-sm
        hover:shadow-md
        hover:-translate-y-0.5
        transition-all
        duration-200
      "
    >

      <div className="flex items-center justify-between gap-3">

        <div className="min-w-0">

          <p className="text-xs md:text-sm text-[#64748B] font-medium truncate">
            {title}
          </p>

          <p className="text-2xl font-bold text-[#172033] mt-1">
            {value}
          </p>

        </div>


        <div
          className={`
            w-10
            h-10
            md:w-11
            md:h-11
            rounded-xl
            flex
            items-center
            justify-center
            flex-shrink-0
            ${iconBg}
          `}
        >

          <span className={iconColor}>
            {icon}
          </span>

        </div>

      </div>

    </div>

  );
}


// =============================================================
// TABLE HEADER
// =============================================================

function TableHeader({
  children,
  align = "left",
}) {

  return (

    <th
      className={`
        px-5
        py-4
        text-xs
        font-semibold
        text-[#64748B]
        uppercase
        tracking-wide
        ${align === "right" ? "text-right" : "text-left"}
      `}
    >
      {children}
    </th>

  );
}


// =============================================================
// BRIEFCASE ICON
// =============================================================

function BriefcaseIcon() {

  return (

    <svg
      width="17"
      height="17"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-blue-600"
    >

      <rect
        width="20"
        height="14"
        x="2"
        y="7"
        rx="2"
        ry="2"
      />

      <path
        d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"
      />

    </svg>

  );
}