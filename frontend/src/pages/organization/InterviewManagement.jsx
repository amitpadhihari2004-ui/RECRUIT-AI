import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  CalendarDays,
  Clock3,
  Search,
  Filter,
  RefreshCw,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Pencil,
  Video,
  Users,
  Brain,
  ChevronDown,
  Briefcase,
  Mail,
  AlertCircle,
  Plus,
  Sparkles,
} from "lucide-react";

import OrganizationSidebar from "../../components/organization/OrganizationSidebar";
import OrganizationNavbar from "../../components/organization/OrganizationNavbar";

import CreateInterviewModal from "../../components/organization/CreateInterviewModal";

import {
  getOrganizationInterviews,
  confirmInterview,
  cancelInterview,
  rescheduleInterview,
  scheduleInterview,
} from "../../api/interviewApi";

import {
  getApplicationsByOrganization,
} from "../../api/applicationApi";


// =========================================================
// STATUS CONFIG
// =========================================================

const STATUS_CONFIG = {
  Generated: {
    label: "Generated",
    className:
      "bg-purple-50 text-purple-700 border-purple-200",
  },

  Scheduled: {
    label: "Scheduled",
    className:
      "bg-blue-50 text-blue-700 border-blue-200",
  },

  Confirmed: {
    label: "Confirmed",
    className:
      "bg-emerald-50 text-emerald-700 border-emerald-200",
  },

  Started: {
    label: "Started",
    className:
      "bg-amber-50 text-amber-700 border-amber-200",
  },

  Completed: {
    label: "Completed",
    className:
      "bg-indigo-50 text-indigo-700 border-indigo-200",
  },

  Evaluated: {
    label: "Evaluated",
    className:
      "bg-green-50 text-green-700 border-green-200",
  },

  Rescheduled: {
    label: "Rescheduled",
    className:
      "bg-orange-50 text-orange-700 border-orange-200",
  },

  Cancelled: {
    label: "Cancelled",
    className:
      "bg-red-50 text-red-700 border-red-200",
  },

  Canceled: {
    label: "Cancelled",
    className:
      "bg-red-50 text-red-700 border-red-200",
  },
};


// =========================================================
// MAIN COMPONENT
// =========================================================

function InterviewManagement() {
  const navigate = useNavigate();

  // =======================================================
  // INTERVIEW STATE
  // =======================================================

  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [actionLoading, setActionLoading] = useState(null);

  // =======================================================
  // APPLICATION STATE
  // =======================================================

  const [applications, setApplications] = useState([]);
  const [applicationsLoading, setApplicationsLoading] =
    useState(false);

  // =======================================================
  // SEARCH / FILTER
  // =======================================================

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showFilters, setShowFilters] = useState(false);

  // =======================================================
  // MODALS
  // =======================================================

  const [showCreateModal, setShowCreateModal] =
    useState(false);

  const [showScheduleModal, setShowScheduleModal] =
    useState(false);

  const [showRescheduleModal, setShowRescheduleModal] =
    useState(false);

  const [showCancelModal, setShowCancelModal] =
    useState(false);

  // =======================================================
  // SELECTED INTERVIEW
  // =======================================================

  const [selectedInterview, setSelectedInterview] =
    useState(null);

  // =======================================================
  // CANCEL
  // =======================================================

  const [cancelReason, setCancelReason] = useState("");

  // =======================================================
  // SCHEDULE FORM
  // =======================================================

  const [scheduleForm, setScheduleForm] = useState({
    scheduled_date: "",
    scheduled_time: "",
    meeting_link: "",
    duration: 45,
  });

  // =======================================================
  // ORGANIZATION ID
  // =======================================================

  const getOrganizationId = () => {
    const directId =
      localStorage.getItem("organizationId");

    if (directId) {
      return directId;
    }

    try {
      const storedUser =
        localStorage.getItem("user");

      if (storedUser) {
        const user = JSON.parse(storedUser);

        return (
          user?.organization_id ||
          user?.organizationId ||
          user?.id ||
          null
        );
      }
    } catch (error) {
      console.error(
        "Unable to read user:",
        error
      );
    }

    return null;
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

      const organizationId =
        getOrganizationId();

      if (!organizationId) {
        toast.error(
          "Organization ID not found. Please login again."
        );

        navigate("/organization/login");
        return;
      }

      const response =
        await getOrganizationInterviews(
          organizationId
        );

      console.log(
        "Interview API Response:",
        response
      );

      const data =
        response?.interviews ||
        response?.data ||
        response ||
        [];

      setInterviews(
        Array.isArray(data)
          ? data
          : []
      );
    } catch (error) {
      console.error(
        "Interview loading error:",
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
    }
  };

  // =======================================================
  // LOAD APPLICATIONS
  // =======================================================

  const loadApplications = async () => {
    try {
      setApplicationsLoading(true);

      const organizationId =
        getOrganizationId();

      if (!organizationId) {
        toast.error(
          "Organization ID not found."
        );
        return;
      }

      const response =
        await getApplicationsByOrganization(
          organizationId
        );

      console.log(
        "Applications for interview creation:",
        response
      );

      const data =
        Array.isArray(response)
          ? response
          : response?.applications ||
            response?.data ||
            [];

      const eligibleApplications =
        data.filter(
          (application) => {
            const status =
              application?.application_status;

            return (
              status === "Shortlisted" ||
              status === "Interview"
            );
          }
        );

      setApplications(
        eligibleApplications
      );
    } catch (error) {
      console.error(
        "Application loading error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
        "Unable to load candidate applications."
      );

      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  // =======================================================
  // OPEN CREATE INTERVIEW
  // =======================================================

  const handleOpenCreateInterview = async () => {
    await loadApplications();
    setShowCreateModal(true);
  };

  // =======================================================
  // AFTER INTERVIEW CREATED
  // =======================================================

  const handleInterviewCreated = async (
    response
  ) => {
    console.log(
      "Interview created:",
      response
    );

    toast.success(
      "AI interview created successfully."
    );

    await loadInterviews();
  };

  // =======================================================
  // REFRESH
  // =======================================================

  const handleRefresh = async () => {
    try {
      setRefreshing(true);

      await loadInterviews();

      toast.success(
        "Interviews refreshed."
      );
    } finally {
      setRefreshing(false);
    }
  };

  // =======================================================
  // FILTER INTERVIEWS
  // =======================================================

  const filteredInterviews = useMemo(() => {
    return interviews.filter(
      (interview) => {
        const candidateName =
          interview?.candidate_name ||
          interview?.student_name ||
          interview?.candidate?.name ||
          "";

        const candidateEmail =
          interview?.candidate_email ||
          interview?.student_email ||
          interview?.candidate?.email ||
          "";

        const jobTitle =
          interview?.job_title ||
          interview?.job?.title ||
          "";

        const applicationId =
          interview?.application_id ||
          "";

        const searchableText =
          `${candidateName}
          ${candidateEmail}
          ${jobTitle}
          ${applicationId}`
            .toLowerCase();

        const matchesSearch =
          searchableText.includes(
            search
              .toLowerCase()
              .trim()
          );

        const matchesStatus =
          statusFilter === "All" ||
          interview?.status ===
            statusFilter;

        return (
          matchesSearch &&
          matchesStatus
        );
      }
    );
  }, [
    interviews,
    search,
    statusFilter,
  ]);

  // =======================================================
  // STATISTICS
  // =======================================================

  const statistics = useMemo(() => {
    return {
      total:
        interviews.length,

      scheduled:
        interviews.filter(
          (item) =>
            item.status ===
            "Scheduled"
        ).length,

      confirmed:
        interviews.filter(
          (item) =>
            item.status ===
            "Confirmed"
        ).length,

      completed:
        interviews.filter(
          (item) =>
            item.status ===
              "Completed" ||
            item.status ===
              "Evaluated"
        ).length,

      cancelled:
        interviews.filter(
          (item) =>
            item.status ===
              "Cancelled" ||
            item.status ===
              "Canceled"
        ).length,
    };
  }, [interviews]);

  // =======================================================
  // CONFIRM
  // =======================================================

  const handleConfirm = async (
    interview
  ) => {
    const id =
      interview?._id ||
      interview?.id;

    if (!id) {
      toast.error(
        "Interview ID is missing."
      );
      return;
    }

    try {
      setActionLoading(id);

      await confirmInterview(id);

      toast.success(
        "Interview confirmed successfully."
      );

      await loadInterviews();
    } catch (error) {
      console.error(
        "Confirm error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
        "Unable to confirm interview."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =======================================================
  // OPEN CANCEL MODAL
  // =======================================================

  const openCancelModal = (
    interview
  ) => {
    setSelectedInterview(
      interview
    );

    setCancelReason("");
    setShowCancelModal(true);
  };

  // =======================================================
  // CANCEL INTERVIEW
  // =======================================================

  const handleCancel = async () => {
    const id =
      selectedInterview?._id ||
      selectedInterview?.id;

    if (!id) {
      toast.error(
        "Interview ID is missing."
      );
      return;
    }

    try {
      setActionLoading(id);

      await cancelInterview(
        id,
        cancelReason || null
      );

      toast.success(
        "Interview cancelled successfully."
      );

      setShowCancelModal(false);
      setSelectedInterview(null);

      await loadInterviews();
    } catch (error) {
      console.error(
        "Cancel interview error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
        "Unable to cancel interview."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =======================================================
  // OPEN SCHEDULE MODAL
  // =======================================================

  const openScheduleModal = (
    interview
  ) => {
    setSelectedInterview(
      interview
    );

    setScheduleForm({
      scheduled_date:
        interview?.scheduled_date ||
        "",

      scheduled_time:
        interview?.scheduled_time ||
        "",

      meeting_link:
        interview?.meeting_link ||
        "",

      duration:
        interview?.duration ||
        45,
    });

    setShowScheduleModal(true);
  };

  // =======================================================
  // SCHEDULE INTERVIEW
  // =======================================================

  const handleSchedule = async (
    event
  ) => {
    event.preventDefault();

    const id =
      selectedInterview?._id ||
      selectedInterview?.id;

    if (!id) {
      toast.error(
        "Interview ID is missing."
      );
      return;
    }

    if (
      !scheduleForm.scheduled_date ||
      !scheduleForm.scheduled_time
    ) {
      toast.error(
        "Please select interview date and time."
      );
      return;
    }

    try {
      setActionLoading(id);

      await scheduleInterview(
        id,
        scheduleForm
      );

      toast.success(
        "Interview scheduled successfully."
      );

      setShowScheduleModal(false);
      setSelectedInterview(null);

      await loadInterviews();
    } catch (error) {
      console.error(
        "Schedule error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
        "Unable to schedule interview."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =======================================================
  // OPEN RESCHEDULE MODAL
  // =======================================================

  const openRescheduleModal = (
    interview
  ) => {
    setSelectedInterview(
      interview
    );

    setScheduleForm({
      scheduled_date:
        interview?.scheduled_date ||
        "",

      scheduled_time:
        interview?.scheduled_time ||
        "",

      meeting_link:
        interview?.meeting_link ||
        "",

      duration:
        interview?.duration ||
        45,
    });

    setShowRescheduleModal(true);
  };

  // =======================================================
  // RESCHEDULE
  // =======================================================

  const handleReschedule = async (
    event
  ) => {
    event.preventDefault();

    const id =
      selectedInterview?._id ||
      selectedInterview?.id;

    if (!id) {
      toast.error(
        "Interview ID is missing."
      );
      return;
    }

    if (
      !scheduleForm.scheduled_date ||
      !scheduleForm.scheduled_time
    ) {
      toast.error(
        "Please select date and time."
      );
      return;
    }

    try {
      setActionLoading(id);

      await rescheduleInterview(
        id,
        {
          scheduled_date:
            scheduleForm.scheduled_date,

          scheduled_time:
            scheduleForm.scheduled_time,

          meeting_link:
            scheduleForm.meeting_link ||
            null,

          duration:
            scheduleForm.duration,

          reason:
            "Rescheduled by organization.",
        }
      );

      toast.success(
        "Interview rescheduled successfully."
      );

      setShowRescheduleModal(false);
      setSelectedInterview(null);

      await loadInterviews();
    } catch (error) {
      console.error(
        "Reschedule error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
        "Unable to reschedule interview."
      );
    } finally {
      setActionLoading(null);
    }
  };

  // =======================================================
  // EDIT
  // =======================================================

  const handleEdit = (
    interview
  ) => {
    openScheduleModal(
      interview
    );
  };

  // =======================================================
  // VIEW
  // =======================================================

  const handleView = (
    interview
  ) => {
    const id =
      interview?._id ||
      interview?.id;

    if (!id) {
      toast.error(
        "Interview ID is missing."
      );
      return;
    }

    navigate(
      `/organization/interviews/${id}`
    );
  };

  // =======================================================
  // LOADING SCREEN
  // =======================================================

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">

        {/* FIXED SIDEBAR */}

        <div className="
          fixed
          left-0
          top-0
          bottom-0
          w-[302px]
          z-50
        ">
          <OrganizationSidebar />
        </div>


        {/* RIGHT SIDE */}

        <div className="
          ml-[302px]
          min-h-screen
          min-w-0
        ">

          <div className="
            sticky
            top-0
            z-40
          ">
            <OrganizationNavbar />
          </div>


          <main className="
            min-h-[calc(100vh-80px)]
            flex
            items-center
            justify-center
            p-6
          ">

            <div className="text-center">

              <Loader2
                size={45}
                className="
                  animate-spin
                  text-blue-600
                  mx-auto
                "
              />

              <p className="
                mt-4
                text-gray-500
                font-medium
              ">
                Loading interview management...
              </p>

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
    <div className="min-h-screen bg-slate-100">

      {/* =================================================
          FIXED SIDEBAR
      ================================================= */}

      <div className="
        fixed
        left-0
        top-0
        bottom-0
        w-[302px]
        z-50
      ">
        <OrganizationSidebar />
      </div>


      {/* =================================================
          RIGHT CONTENT AREA
      ================================================= */}

      <div className="
        ml-[302px]
        min-h-screen
        min-w-0
      ">

        {/* =================================================
            NAVBAR
        ================================================= */}

        <div className="
          sticky
          top-0
          z-40
        ">
          <OrganizationNavbar />
        </div>


        {/* =================================================
            MAIN CONTENT
        ================================================= */}

        <main className="
          w-full
          overflow-x-hidden
        ">

          <div className="
            w-full
            max-w-[1400px]
            mx-auto
            px-5
            py-6
            md:px-7
            lg:px-8
          ">

            {/* =================================================
                HEADER
            ================================================= */}

            <div className="
              flex
              flex-col
              lg:flex-row
              lg:items-center
              lg:justify-between
              gap-5
              mb-7
            ">

              <div>

                <div className="
                  flex
                  items-center
                  gap-3
                ">

                  <div className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-blue-100
                    flex
                    items-center
                    justify-center
                  ">

                    <CalendarDays
                      size={28}
                      className="text-blue-600"
                    />

                  </div>


                  <div>

                    <h1 className="
                      text-2xl
                      md:text-3xl
                      font-bold
                      text-gray-900
                    ">
                      Interview Management
                    </h1>


                    <p className="
                      text-gray-500
                      mt-1
                    ">
                      Schedule, manage and track candidate interviews.
                    </p>

                  </div>

                </div>

              </div>


              {/* HEADER ACTIONS */}

              <div className="
                flex
                flex-wrap
                gap-3
              ">

                <button
                  onClick={
                    handleOpenCreateInterview
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-5
                    py-3
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    rounded-xl
                    font-semibold
                    shadow-sm
                    transition
                  "
                >

                  <Plus size={18} />

                  Create Interview

                </button>


                <button
                  onClick={
                    handleRefresh
                  }
                  disabled={
                    refreshing
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-5
                    py-3
                    bg-white
                    border
                    border-gray-200
                    rounded-xl
                    text-gray-700
                    font-semibold
                    hover:bg-gray-50
                    transition
                    shadow-sm
                    disabled:opacity-60
                  "
                >

                  {refreshing ? (
                    <Loader2
                      size={18}
                      className="animate-spin"
                    />
                  ) : (
                    <RefreshCw
                      size={18}
                    />
                  )}

                  Refresh

                </button>

              </div>

            </div>


            {/* =================================================
                AI BANNER
            ================================================= */}

            <div className="
              bg-gradient-to-r
              from-blue-600
              to-purple-600
              rounded-3xl
              p-6
              text-white
              mb-7
            ">

              <div className="
                flex
                flex-col
                md:flex-row
                md:items-center
                gap-5
              ">

                <div className="
                  w-12
                  h-12
                  rounded-2xl
                  bg-white/15
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                ">

                  <Brain size={25} />

                </div>


                <div>

                  <h2 className="
                    text-lg
                    font-bold
                  ">
                    AI Interview Management
                  </h2>


                  <p className="
                    text-white/80
                    text-sm
                    mt-1
                    max-w-3xl
                  ">
                    Create personalized AI interviews,
                    schedule candidates, manage interview
                    status and evaluate candidate performance.
                  </p>

                </div>

              </div>

            </div>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div className="
              grid
              grid-cols-1
              sm:grid-cols-2
              lg:grid-cols-5
              gap-4
              mb-7
            ">

              <StatCard
                icon={<Users />}
                title="Total Interviews"
                value={statistics.total}
                iconClass="text-blue-600"
                bgClass="bg-blue-50"
              />


              <StatCard
                icon={<CalendarDays />}
                title="Scheduled"
                value={statistics.scheduled}
                iconClass="text-purple-600"
                bgClass="bg-purple-50"
              />


              <StatCard
                icon={<CheckCircle2 />}
                title="Confirmed"
                value={statistics.confirmed}
                iconClass="text-emerald-600"
                bgClass="bg-emerald-50"
              />


              <StatCard
                icon={<Brain />}
                title="Completed"
                value={statistics.completed}
                iconClass="text-indigo-600"
                bgClass="bg-indigo-50"
              />


              <StatCard
                icon={<XCircle />}
                title="Cancelled"
                value={statistics.cancelled}
                iconClass="text-red-600"
                bgClass="bg-red-50"
              />

            </div>


            {/* =================================================
                SEARCH / FILTER
            ================================================= */}

            <div className="
              bg-white
              rounded-2xl
              border
              border-gray-100
              shadow-sm
              p-4
              mb-6
            ">

              <div className="
                flex
                flex-col
                md:flex-row
                gap-3
              ">

                <div className="
                  relative
                  flex-1
                ">

                  <Search
                    size={18}
                    className="
                      absolute
                      left-4
                      top-1/2
                      -translate-y-1/2
                      text-gray-400
                    "
                  />


                  <input
                    type="text"
                    value={search}
                    onChange={(event) =>
                      setSearch(
                        event.target.value
                      )
                    }
                    placeholder="
                      Search candidate, email, job or application ID...
                    "
                    className="
                      w-full
                      pl-11
                      pr-4
                      py-3
                      bg-gray-50
                      border
                      border-gray-200
                      rounded-xl
                      outline-none
                      focus:ring-2
                      focus:ring-blue-500
                      focus:border-blue-500
                    "
                  />

                </div>


                <button
                  onClick={() =>
                    setShowFilters(
                      !showFilters
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-5
                    py-3
                    border
                    border-gray-200
                    rounded-xl
                    text-gray-700
                    font-semibold
                    hover:bg-gray-50
                  "
                >

                  <Filter size={18} />

                  Filters

                  <ChevronDown
                    size={16}
                    className={
                      showFilters
                        ? "rotate-180 transition"
                        : "transition"
                    }
                  />

                </button>

              </div>


              {showFilters && (
                <div className="
                  mt-4
                  pt-4
                  border-t
                  border-gray-100
                ">

                  <div className="
                    flex
                    flex-wrap
                    gap-2
                  ">

                    {[
                      "All",
                      "Generated",
                      "Scheduled",
                      "Confirmed",
                      "Started",
                      "Completed",
                      "Evaluated",
                      "Rescheduled",
                      "Cancelled",
                    ].map(
                      (status) => (
                        <button
                          key={status}
                          onClick={() =>
                            setStatusFilter(
                              status
                            )
                          }
                          className={`
                            px-4
                            py-2
                            rounded-lg
                            text-sm
                            font-semibold
                            border
                            transition
                            ${
                              statusFilter ===
                              status
                                ? "bg-blue-600 text-white border-blue-600"
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                            }
                          `}
                        >
                          {status}
                        </button>
                      )
                    )}

                  </div>

                </div>
              )}

            </div>


            {/* =================================================
                RESULT HEADER
            ================================================= */}

            <div className="
              flex
              flex-col
              sm:flex-row
              sm:items-center
              sm:justify-between
              gap-3
              mb-4
            ">

              <div>

                <h2 className="
                  text-xl
                  font-bold
                  text-gray-900
                ">
                  Interviews
                </h2>


                <p className="
                  text-sm
                  text-gray-500
                  mt-1
                ">

                  Showing{" "}

                  <span className="
                    font-semibold
                    text-gray-700
                  ">
                    {filteredInterviews.length}
                  </span>{" "}

                  of{" "}

                  <span className="
                    font-semibold
                    text-gray-700
                  ">
                    {interviews.length}
                  </span>{" "}

                  interviews

                </p>

              </div>


              <div className="
                flex
                items-center
                gap-2
                text-sm
                text-gray-500
              ">

                <Clock3 size={16} />

                Manage interview schedules and statuses

              </div>

            </div>


            {/* =================================================
                EMPTY STATE
            ================================================= */}

            {filteredInterviews.length === 0 ? (

              <div className="
                bg-white
                rounded-3xl
                border
                border-gray-100
                shadow-sm
                p-12
                text-center
              ">

                <div className="
                  w-20
                  h-20
                  rounded-3xl
                  bg-blue-50
                  flex
                  items-center
                  justify-center
                  mx-auto
                  mb-5
                ">

                  <CalendarDays
                    size={38}
                    className="text-blue-500"
                  />

                </div>


                <h2 className="
                  text-2xl
                  font-bold
                  text-gray-900
                ">
                  No Interviews Found
                </h2>


                <p className="
                  text-gray-500
                  max-w-lg
                  mx-auto
                  mt-2
                ">

                  {search ||
                  statusFilter !== "All"
                    ? "There are no interviews matching your current search or filter."
                    : "Create an AI interview from a shortlisted candidate to get started."}

                </p>


                {!search &&
                  statusFilter ===
                    "All" && (

                    <button
                      onClick={
                        handleOpenCreateInterview
                      }
                      className="
                        mt-6
                        inline-flex
                        items-center
                        gap-2
                        px-5
                        py-3
                        bg-blue-600
                        hover:bg-blue-700
                        text-white
                        rounded-xl
                        font-semibold
                      "
                    >

                      <Sparkles
                        size={17}
                      />

                      Create First Interview

                    </button>
                  )}


                {(search ||
                  statusFilter !==
                    "All") && (

                  <button
                    onClick={() => {
                      setSearch("");
                      setStatusFilter(
                        "All"
                      );
                    }}
                    className="
                      mt-6
                      px-5
                      py-3
                      bg-blue-600
                      text-white
                      rounded-xl
                      font-semibold
                      hover:bg-blue-700
                    "
                  >
                    Clear Filters
                  </button>
                )}

              </div>

            ) : (

              /* =================================================
                 INTERVIEW LIST
              ================================================= */

              <div className="
                space-y-4
              ">

                {filteredInterviews.map(
                  (
                    interview,
                    index
                  ) => {

                    const id =
                      interview?._id ||
                      interview?.id ||
                      index;

                    const candidateName =
                      interview?.candidate_name ||
                      interview?.student_name ||
                      interview?.candidate?.name ||
                      `Candidate ${index + 1}`;

                    const candidateEmail =
                      interview?.candidate_email ||
                      interview?.student_email ||
                      interview?.candidate?.email ||
                      "Email unavailable";

                    const jobTitle =
                      interview?.job_title ||
                      interview?.job?.title ||
                      "Job Position";

                    const status =
                      interview?.status ||
                      "Generated";

                    const statusConfig =
                      STATUS_CONFIG[
                        status
                      ] || {
                        label: status,
                        className:
                          "bg-gray-50 text-gray-700 border-gray-200",
                      };

                    const score =
                      Number(
                        interview?.overall_score ||
                        0
                      );

                    const isLoading =
                      actionLoading ===
                      id;

                    return (
                      <div
                        key={id}
                        className="
                          bg-white
                          rounded-3xl
                          border
                          border-gray-100
                          shadow-sm
                          hover:shadow-md
                          transition
                          overflow-hidden
                        "
                      >

                        <div className="
                          p-5
                          md:p-6
                        ">

                          {/* TOP */}

                          <div className="
                            flex
                            flex-col
                            lg:flex-row
                            lg:items-center
                            gap-5
                          ">

                            <div className="
                              w-14
                              h-14
                              rounded-2xl
                              bg-blue-50
                              flex
                              items-center
                              justify-center
                              flex-shrink-0
                            ">

                              <Users
                                size={25}
                                className="text-blue-600"
                              />

                            </div>


                            <div className="
                              flex-1
                              min-w-0
                            ">

                              <div className="
                                flex
                                flex-wrap
                                items-center
                                gap-3
                              ">

                                <h3 className="
                                  text-lg
                                  font-bold
                                  text-gray-900
                                ">
                                  {candidateName}
                                </h3>


                                <StatusBadge
                                  status={
                                    status
                                  }
                                  config={
                                    statusConfig
                                  }
                                />

                              </div>


                              <div className="
                                flex
                                flex-wrap
                                gap-x-5
                                gap-y-2
                                mt-2
                                text-sm
                                text-gray-500
                              ">

                                <span className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                ">

                                  <Mail
                                    size={14}
                                  />

                                  {candidateEmail}

                                </span>


                                <span className="
                                  inline-flex
                                  items-center
                                  gap-1.5
                                ">

                                  <Briefcase
                                    size={14}
                                  />

                                  {jobTitle}

                                </span>

                              </div>

                            </div>


                            <div className="
                              text-center
                              lg:text-right
                            ">

                              <p className="
                                text-xs
                                uppercase
                                font-semibold
                                text-gray-400
                              ">
                                AI Score
                              </p>


                              <p className="
                                text-3xl
                                font-bold
                                text-blue-600
                              ">

                                {score}

                                <span className="
                                  text-sm
                                  text-gray-400
                                ">
                                  /100
                                </span>

                              </p>

                            </div>

                          </div>


                          {/* DETAILS */}

                          <div className="
                            grid
                            grid-cols-1
                            md:grid-cols-3
                            gap-3
                            mt-6
                          ">

                            <InfoBox
                              icon={
                                <CalendarDays
                                  size={17}
                                />
                              }
                              title="Interview Date"
                              value={
                                interview?.scheduled_date ||
                                "Not scheduled"
                              }
                            />


                            <InfoBox
                              icon={
                                <Clock3
                                  size={17}
                                />
                              }
                              title="Interview Time"
                              value={
                                interview?.scheduled_time ||
                                "Not scheduled"
                              }
                            />


                            <InfoBox
                              icon={
                                <Brain
                                  size={17}
                                />
                              }
                              title="Interview Type"
                              value={
                                interview?.interview_type ||
                                "Technical"
                              }
                            />

                          </div>


                          {/* APPLICATION INFO */}

                          <div className="
                            mt-4
                            p-4
                            rounded-2xl
                            bg-gray-50
                            border
                            border-gray-100
                          ">

                            <div className="
                              flex
                              flex-wrap
                              gap-x-6
                              gap-y-2
                              text-sm
                            ">

                              <span className="
                                text-gray-500
                              ">

                                Application ID:

                                <span className="
                                  font-semibold
                                  text-gray-700
                                  ml-1
                                ">

                                  {interview?.application_id ||
                                    "N/A"}

                                </span>

                              </span>


                              <span className="
                                text-gray-500
                              ">

                                Duration:

                                <span className="
                                  font-semibold
                                  text-gray-700
                                  ml-1
                                ">

                                  {interview?.duration ||
                                    45}{" "}
                                  min

                                </span>

                              </span>


                              {interview?.meeting_link && (
                                <span className="
                                  text-emerald-600
                                  font-semibold
                                ">
                                  Meeting link available
                                </span>
                              )}

                            </div>

                          </div>


                          {/* ACTIONS */}

                          <div className="
                            flex
                            flex-wrap
                            gap-3
                            mt-5
                            pt-5
                            border-t
                            border-gray-100
                          ">

                            {/* VIEW */}

                            <button
                              onClick={() =>
                                handleView(
                                  interview
                                )
                              }
                              className="
                                inline-flex
                                items-center
                                gap-2
                                px-4
                                py-2.5
                                bg-blue-600
                                hover:bg-blue-700
                                text-white
                                rounded-xl
                                text-sm
                                font-semibold
                                transition
                              "
                            >

                              <Eye size={16} />

                              View

                            </button>


                            {/* SCHEDULE */}

                            {[
                              "Generated",
                              "Rescheduled",
                            ].includes(
                              status
                            ) && (

                              <button
                                onClick={() =>
                                  openScheduleModal(
                                    interview
                                  )
                                }
                                disabled={
                                  isLoading
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  px-4
                                  py-2.5
                                  bg-purple-600
                                  hover:bg-purple-700
                                  disabled:bg-gray-400
                                  text-white
                                  rounded-xl
                                  text-sm
                                  font-semibold
                                  transition
                                "
                              >

                                <CalendarDays
                                  size={16}
                                />

                                Schedule

                              </button>
                            )}


                            {/* CONFIRM */}

                            {status ===
                              "Scheduled" && (

                              <button
                                onClick={() =>
                                  handleConfirm(
                                    interview
                                  )
                                }
                                disabled={
                                  isLoading
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  px-4
                                  py-2.5
                                  bg-emerald-600
                                  hover:bg-emerald-700
                                  disabled:bg-gray-400
                                  text-white
                                  rounded-xl
                                  text-sm
                                  font-semibold
                                  transition
                                "
                              >

                                {isLoading ? (
                                  <Loader2
                                    size={16}
                                    className="animate-spin"
                                  />
                                ) : (
                                  <CheckCircle2
                                    size={16}
                                  />
                                )}

                                Confirm

                              </button>
                            )}


                            {/* RESCHEDULE */}

                            {[
                              "Scheduled",
                              "Confirmed",
                            ].includes(
                              status
                            ) && (

                              <button
                                onClick={() =>
                                  openRescheduleModal(
                                    interview
                                  )
                                }
                                disabled={
                                  isLoading
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  px-4
                                  py-2.5
                                  bg-orange-50
                                  hover:bg-orange-100
                                  text-orange-700
                                  rounded-xl
                                  text-sm
                                  font-semibold
                                  transition
                                "
                              >

                                <RotateCcw
                                  size={16}
                                />

                                Reschedule

                              </button>
                            )}


                            {/* EDIT */}

                            {[
                              "Generated",
                              "Scheduled",
                              "Confirmed",
                            ].includes(
                              status
                            ) && (

                              <button
                                onClick={() =>
                                  handleEdit(
                                    interview
                                  )
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  px-4
                                  py-2.5
                                  bg-gray-100
                                  hover:bg-gray-200
                                  text-gray-700
                                  rounded-xl
                                  text-sm
                                  font-semibold
                                  transition
                                "
                              >

                                <Pencil
                                  size={16}
                                />

                                Edit

                              </button>
                            )}


                            {/* MEETING */}

                            {interview?.meeting_link &&
                              [
                                "Scheduled",
                                "Confirmed",
                              ].includes(
                                status
                              ) && (

                              <a
                                href={
                                  interview.meeting_link
                                }
                                target="_blank"
                                rel="noreferrer"
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  px-4
                                  py-2.5
                                  bg-indigo-50
                                  hover:bg-indigo-100
                                  text-indigo-700
                                  rounded-xl
                                  text-sm
                                  font-semibold
                                  transition
                                "
                              >

                                <Video
                                  size={16}
                                />

                                Meeting

                              </a>
                            )}


                            {/* CANCEL */}

                            {[
                              "Generated",
                              "Scheduled",
                              "Confirmed",
                            ].includes(
                              status
                            ) && (

                              <button
                                onClick={() =>
                                  openCancelModal(
                                    interview
                                  )
                                }
                                disabled={
                                  isLoading
                                }
                                className="
                                  inline-flex
                                  items-center
                                  gap-2
                                  px-4
                                  py-2.5
                                  bg-red-50
                                  hover:bg-red-100
                                  text-red-700
                                  rounded-xl
                                  text-sm
                                  font-semibold
                                  transition
                                "
                              >

                                <XCircle
                                  size={16}
                                />

                                Cancel

                              </button>
                            )}

                          </div>

                        </div>

                      </div>
                    );
                  }
                )}

              </div>
            )}

          </div>

        </main>

      </div>


      {/* =====================================================
          CREATE INTERVIEW MODAL
      ===================================================== */}

      <CreateInterviewModal
        isOpen={
          showCreateModal
        }
        onClose={() => {
          setShowCreateModal(
            false
          );
        }}
        applications={
          applications
        }
        loading={
          applicationsLoading
        }
        onCreated={
          handleInterviewCreated
        }
      />


      {/* =====================================================
          SCHEDULE MODAL
      ===================================================== */}

      {showScheduleModal && (
        <ScheduleModal
          title="Schedule Interview"
          subtitle="
            Choose a date and time for the candidate interview.
          "
          form={
            scheduleForm
          }
          setForm={
            setScheduleForm
          }
          loading={
            actionLoading ===
            (
              selectedInterview?._id ||
              selectedInterview?.id
            )
          }
          onClose={() => {
            setShowScheduleModal(
              false
            );

            setSelectedInterview(
              null
            );
          }}
          onSubmit={
            handleSchedule
          }
        />
      )}


      {/* =====================================================
          RESCHEDULE MODAL
      ===================================================== */}

      {showRescheduleModal && (
        <ScheduleModal
          title="Reschedule Interview"
          subtitle="
            Select a new interview date and time.
          "
          form={
            scheduleForm
          }
          setForm={
            setScheduleForm
          }
          loading={
            actionLoading ===
            (
              selectedInterview?._id ||
              selectedInterview?.id
            )
          }
          onClose={() => {
            setShowRescheduleModal(
              false
            );

            setSelectedInterview(
              null
            );
          }}
          onSubmit={
            handleReschedule
          }
        />
      )}


      {/* =====================================================
          CANCEL MODAL
      ===================================================== */}

      {showCancelModal && (
        <ModalOverlay>

          <div className="
            bg-white
            rounded-3xl
            shadow-xl
            w-full
            max-w-md
            p-6
          ">

            <div className="
              w-12
              h-12
              rounded-2xl
              bg-red-50
              flex
              items-center
              justify-center
              mb-4
            ">

              <AlertCircle
                className="text-red-600"
                size={25}
              />

            </div>


            <h2 className="
              text-xl
              font-bold
              text-gray-900
            ">
              Cancel Interview?
            </h2>


            <p className="
              text-sm
              text-gray-500
              mt-2
            ">
              This will cancel the scheduled interview
              for the candidate.
            </p>


            <textarea
              value={
                cancelReason
              }
              onChange={(
                event
              ) =>
                setCancelReason(
                  event.target.value
                )
              }
              rows={4}
              placeholder="
                Reason for cancellation (optional)
              "
              className="
                w-full
                mt-5
                p-3
                border
                border-gray-200
                rounded-xl
                outline-none
                focus:ring-2
                focus:ring-red-500
                resize-none
              "
            />


            <div className="
              flex
              justify-end
              gap-3
              mt-5
            ">

              <button
                onClick={() => {
                  setShowCancelModal(
                    false
                  );

                  setSelectedInterview(
                    null
                  );
                }}
                className="
                  px-5
                  py-2.5
                  bg-gray-100
                  hover:bg-gray-200
                  text-gray-700
                  rounded-xl
                  font-semibold
                "
              >
                Keep Interview
              </button>


              <button
                onClick={
                  handleCancel
                }
                disabled={
                  actionLoading ===
                  (
                    selectedInterview?._id ||
                    selectedInterview?.id
                  )
                }
                className="
                  px-5
                  py-2.5
                  bg-red-600
                  hover:bg-red-700
                  disabled:bg-gray-400
                  text-white
                  rounded-xl
                  font-semibold
                  inline-flex
                  items-center
                  gap-2
                "
              >

                {actionLoading ===
                (
                  selectedInterview?._id ||
                  selectedInterview?.id
                ) ? (
                  <Loader2
                    size={17}
                    className="animate-spin"
                  />
                ) : (
                  <XCircle
                    size={17}
                  />
                )}

                Cancel Interview

              </button>

            </div>

          </div>

        </ModalOverlay>
      )}

    </div>
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
    <div className="
      bg-white
      rounded-2xl
      border
      border-gray-100
      shadow-sm
      p-5
    ">

      <div className="
        flex
        items-center
        justify-between
      ">

        <div>

          <p className="
            text-xs
            text-gray-500
            font-semibold
            uppercase
            tracking-wide
          ">
            {title}
          </p>


          <p className="
            text-2xl
            font-bold
            text-gray-900
            mt-2
          ">
            {value}
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
            ${bgClass}
          `}
        >

          <span
            className={
              iconClass
            }
          >
            {icon}
          </span>

        </div>

      </div>

    </div>
  );
}


// =========================================================
// STATUS BADGE
// =========================================================

function StatusBadge({
  status,
  config,
}) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        px-3
        py-1
        rounded-full
        border
        text-xs
        font-semibold
        ${config.className}
      `}
    >

      {status ===
      "Evaluated" ? (
        <Brain
          size={13}
        />
      ) : status ===
        "Confirmed" ? (
        <CheckCircle2
          size={13}
        />
      ) : status ===
          "Cancelled" ||
        status ===
          "Canceled" ? (
        <XCircle
          size={13}
        />
      ) : (
        <CalendarDays
          size={13}
        />
      )}

      {config.label}

    </span>
  );
}


// =========================================================
// INFO BOX
// =========================================================

function InfoBox({
  icon,
  title,
  value,
}) {
  return (
    <div className="
      bg-gray-50
      border
      border-gray-100
      rounded-xl
      p-3
    ">

      <div className="
        flex
        items-center
        gap-2
      ">

        <div className="
          w-8
          h-8
          rounded-lg
          bg-white
          flex
          items-center
          justify-center
          text-blue-600
        ">
          {icon}
        </div>


        <div className="
          min-w-0
        ">

          <p className="
            text-xs
            text-gray-400
          ">
            {title}
          </p>


          <p className="
            text-sm
            font-semibold
            text-gray-700
            truncate
          ">
            {value}
          </p>

        </div>

      </div>

    </div>
  );
}


// =========================================================
// SCHEDULE MODAL
// =========================================================

function ScheduleModal({
  title,
  subtitle,
  form,
  setForm,
  loading,
  onClose,
  onSubmit,
}) {
  return (
    <ModalOverlay>

      <form
        onSubmit={
          onSubmit
        }
        className="
          bg-white
          rounded-3xl
          shadow-xl
          w-full
          max-w-lg
          p-6
        "
      >

        <div className="
          flex
          items-start
          justify-between
          gap-4
        ">

          <div>

            <h2 className="
              text-xl
              font-bold
              text-gray-900
            ">
              {title}
            </h2>


            <p className="
              text-sm
              text-gray-500
              mt-1
            ">
              {subtitle}
            </p>

          </div>


          <button
            type="button"
            onClick={
              onClose
            }
            className="
              w-9
              h-9
              rounded-lg
              bg-gray-100
              hover:bg-gray-200
              text-gray-500
            "
          >
            ×
          </button>

        </div>


        {/* DATE + TIME */}

        <div className="
          grid
          grid-cols-1
          sm:grid-cols-2
          gap-4
          mt-6
        ">

          <div>

            <label className="
              block
              text-sm
              font-semibold
              text-gray-700
              mb-2
            ">
              Interview Date
            </label>


            <input
              type="date"
              value={
                form.scheduled_date
              }
              min={
                new Date()
                  .toISOString()
                  .split("T")[0]
              }
              onChange={(
                event
              ) =>
                setForm({
                  ...form,
                  scheduled_date:
                    event.target.value,
                })
              }
              required
              className="
                w-full
                px-4
                py-3
                border
                border-gray-200
                rounded-xl
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

          </div>


          <div>

            <label className="
              block
              text-sm
              font-semibold
              text-gray-700
              mb-2
            ">
              Interview Time
            </label>


            <input
              type="time"
              value={
                form.scheduled_time
              }
              onChange={(
                event
              ) =>
                setForm({
                  ...form,
                  scheduled_time:
                    event.target.value,
                })
              }
              required
              className="
                w-full
                px-4
                py-3
                border
                border-gray-200
                rounded-xl
                outline-none
                focus:ring-2
                focus:ring-blue-500
              "
            />

          </div>

        </div>


        {/* DURATION */}

        <div className="mt-4">

          <label className="
            block
            text-sm
            font-semibold
            text-gray-700
            mb-2
          ">
            Duration
          </label>


          <select
            value={
              form.duration
            }
            onChange={(
              event
            ) =>
              setForm({
                ...form,
                duration:
                  Number(
                    event.target.value
                  ),
              })
            }
            className="
              w-full
              px-4
              py-3
              border
              border-gray-200
              rounded-xl
              outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          >

            <option value={15}>
              15 minutes
            </option>

            <option value={30}>
              30 minutes
            </option>

            <option value={45}>
              45 minutes
            </option>

            <option value={60}>
              60 minutes
            </option>

            <option value={90}>
              90 minutes
            </option>

          </select>

        </div>


        {/* MEETING LINK */}

        <div className="mt-4">

          <label className="
            block
            text-sm
            font-semibold
            text-gray-700
            mb-2
          ">
            Meeting Link
          </label>


          <input
            type="url"
            value={
              form.meeting_link
            }
            onChange={(
              event
            ) =>
              setForm({
                ...form,
                meeting_link:
                  event.target.value,
              })
            }
            placeholder="
              https://meet.google.com/...
            "
            className="
              w-full
              px-4
              py-3
              border
              border-gray-200
              rounded-xl
              outline-none
              focus:ring-2
              focus:ring-blue-500
            "
          />

        </div>


        {/* FOOTER */}

        <div className="
          flex
          justify-end
          gap-3
          mt-6
        ">

          <button
            type="button"
            onClick={
              onClose
            }
            className="
              px-5
              py-2.5
              bg-gray-100
              hover:bg-gray-200
              text-gray-700
              rounded-xl
              font-semibold
            "
          >
            Cancel
          </button>


          <button
            type="submit"
            disabled={
              loading
            }
            className="
              px-5
              py-2.5
              bg-blue-600
              hover:bg-blue-700
              disabled:bg-gray-400
              text-white
              rounded-xl
              font-semibold
              inline-flex
              items-center
              gap-2
            "
          >

            {loading && (
              <Loader2
                size={17}
                className="animate-spin"
              />
            )}

            Save Schedule

          </button>

        </div>

      </form>

    </ModalOverlay>
  );
}


// =========================================================
// MODAL OVERLAY
// =========================================================

function ModalOverlay({
  children,
}) {
  return (
    <div className="
      fixed
      inset-0
      z-[100]
      bg-black/50
      backdrop-blur-sm
      flex
      items-center
      justify-center
      p-4
      overflow-y-auto
    ">
      {children}
    </div>
  );
}


export default InterviewManagement;