import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Users,
  Search,
  Eye,
  CheckCircle,
  XCircle,
  Clock,
  Briefcase,
  User,
  Award,
  AlertCircle,
  RefreshCw,
  Brain,
  X,
  TrendingUp,
} from "lucide-react";

import OrganizationSidebar from "../../components/organization/OrganizationSidebar";
import OrganizationNavbar from "../../components/organization/OrganizationNavbar";

import {
  getApplicationsByOrganization,
  updateApplicationStatus,
} from "../../api/applicationApi";


function Applications() {

  const navigate = useNavigate();

  // =========================================================
  // STATE
  // =========================================================

  const [loading, setLoading] = useState(true);

  const [applications, setApplications] = useState([]);

  const [filteredApplications, setFilteredApplications] =
    useState([]);

  const [searchTerm, setSearchTerm] = useState("");

  const [statusFilter, setStatusFilter] = useState("All");

  const [updatingId, setUpdatingId] = useState(null);


  // =========================================================
  // ORGANIZATION ID
  // =========================================================

  const organizationId =
    localStorage.getItem("organizationId") ||
    localStorage.getItem("organization_id");


  // =========================================================
  // LOAD
  // =========================================================

  useEffect(() => {
    loadApplications();
  }, []);


  // =========================================================
  // FILTER
  // =========================================================

  useEffect(() => {
    filterApplications();
  }, [
    applications,
    searchTerm,
    statusFilter,
  ]);


  // =========================================================
  // LOAD APPLICATIONS
  // =========================================================

  const loadApplications = async () => {

    try {

      setLoading(true);

      if (!organizationId) {

        toast.error(
          "Organization ID not found. Please login again."
        );

        navigate("/organization/login");

        return;
      }


      const data =
        await getApplicationsByOrganization(
          organizationId
        );


      console.log(
        "Applications:",
        data
      );


      const applicationList =
        Array.isArray(data)
          ? data
          : data?.applications ||
            data?.data ||
            [];


      const sortedData =
        [...applicationList].sort(
          (a, b) =>
            new Date(
              b.created_at || 0
            ) -
            new Date(
              a.created_at || 0
            )
        );


      setApplications(sortedData);

      setFilteredApplications(sortedData);

    } catch (error) {

      console.error(
        "Load Applications Error:",
        error
      );


      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Unable to load applications."
      );


      setApplications([]);

      setFilteredApplications([]);

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // FILTER
  // =========================================================

  const filterApplications = () => {

    let filtered = [...applications];


    if (searchTerm.trim() !== "") {

      const search =
        searchTerm
          .toLowerCase()
          .trim();


      filtered =
        filtered.filter(
          (application) => {

            const name =
              application.student_name
                ?.toLowerCase() ||
              application.candidate_name
                ?.toLowerCase() ||
              "";


            const email =
              application.student_email
                ?.toLowerCase() ||
              application.candidate_email
                ?.toLowerCase() ||
              "";


            const job =
              application.job_title
                ?.toLowerCase() ||
              application.job_name
                ?.toLowerCase() ||
              "";


            const applicationId =
              String(
                application._id ||
                application.application_id ||
                application.id ||
                ""
              ).toLowerCase();


            return (
              name.includes(search) ||
              email.includes(search) ||
              job.includes(search) ||
              applicationId.includes(search)
            );

          }
        );

    }


    if (statusFilter !== "All") {

      filtered =
        filtered.filter(
          (application) =>
            application.application_status ===
            statusFilter
        );

    }


    setFilteredApplications(filtered);

  };


  // =========================================================
  // UPDATE STATUS
  // =========================================================

  const handleStatusUpdate =
    async (
      applicationId,
      status
    ) => {

      if (!applicationId) {

        toast.error(
          "Application ID not found."
        );

        return;
      }


      if (updatingId) {
        return;
      }


      try {

        setUpdatingId(applicationId);


        await updateApplicationStatus(
          applicationId,
          {
            application_status: status,
          }
        );


        toast.success(
          `Application ${status.toLowerCase()} successfully.`
        );


        await loadApplications();

      } catch (error) {

        console.error(
          "Status Update Error:",
          error
        );


        toast.error(
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to update application status."
        );

      } finally {

        setUpdatingId(null);

      }

    };


  // =========================================================
  // CREATE INTERVIEW
  // =========================================================

  const handleCreateInterview =
    (application) => {

      if (!application) {

        toast.error(
          "Application information not found."
        );

        return;
      }


      const applicationId =
        application.application_id ||
        application._id ||
        application.id;


      if (!applicationId) {

        toast.error(
          "Application ID is missing."
        );

        return;
      }


      if (
        application.application_status !==
        "Shortlisted"
      ) {

        toast.error(
          "Only shortlisted candidates can receive an interview."
        );

        return;
      }


      const resumeId =
        application.resume_id ||
        application.resumeId ||
        application.resume?._id ||
        application.resume?.id;


      if (!resumeId) {

        toast.error(
          "Resume ID is missing. The candidate must have an analyzed resume before creating an interview."
        );

        return;
      }


      navigate(
        `/organization/interviews/create/${applicationId}`
      );

    };


  // =========================================================
  // STATUS COLORS
  // =========================================================

  const getStatusColor =
    (status) => {

      switch (status) {

        case "Pending":

          return `
            bg-[#FFF7E8]
            text-[#B7791F]
            border-[#F1D9A6]
          `;


        case "Shortlisted":

          return `
            bg-[#E8F3F2]
            text-[#0F766E]
            border-[#C5E2DE]
          `;


        case "Interview":

          return `
            bg-[#F2EDFF]
            text-[#6D3BC1]
            border-[#DFD2FF]
          `;


        case "Selected":

          return `
            bg-[#EAF6ED]
            text-[#16803C]
            border-[#C9E8D1]
          `;


        case "Rejected":

          return `
            bg-[#FCECEC]
            text-[#C53030]
            border-[#F3CACA]
          `;


        default:

          return `
            bg-[#F4F5F6]
            text-[#64748B]
            border-[#E5E7EB]
          `;

      }

    };


  // =========================================================
  // STATUS ICON
  // =========================================================

  const getStatusIcon =
    (status) => {

      switch (status) {

        case "Pending":

          return <Clock size={13} />;


        case "Shortlisted":

          return <CheckCircle size={13} />;


        case "Interview":

          return <Brain size={13} />;


        case "Selected":

          return <Award size={13} />;


        case "Rejected":

          return <XCircle size={13} />;


        default:

          return null;

      }

    };


  // =========================================================
  // STATISTICS
  // =========================================================

  const stats = {

    total: applications.length,

    pending:
      applications.filter(
        (a) =>
          a.application_status ===
          "Pending"
      ).length,

    shortlisted:
      applications.filter(
        (a) =>
          a.application_status ===
          "Shortlisted"
      ).length,

    interview:
      applications.filter(
        (a) =>
          a.application_status ===
          "Interview"
      ).length,

    selected:
      applications.filter(
        (a) =>
          a.application_status ===
          "Selected"
      ).length,

    rejected:
      applications.filter(
        (a) =>
          a.application_status ===
          "Rejected"
      ).length,

  };


  // =========================================================
  // SCORE COLOR
  // =========================================================

  const getScoreColor =
    (score) => {

      const value =
        Number(score) || 0;


      if (value >= 70) {

        return `
          bg-[#EAF6ED]
          text-[#16803C]
        `;

      }


      if (value >= 50) {

        return `
          bg-[#FFF7E8]
          text-[#B7791F]
        `;

      }


      return `
        bg-[#FCECEC]
        text-[#C53030]
      `;

    };


  // =========================================================
  // DATE
  // =========================================================

  const formatDate =
    (date) => {

      if (!date) {
        return "N/A";
      }


      const parsedDate =
        new Date(date);


      if (
        Number.isNaN(
          parsedDate.getTime()
        )
      ) {

        return "N/A";

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


  // =========================================================
  // LOADING UI
  // =========================================================

  if (loading) {

    return (

      <div
        className="
          min-h-screen
          bg-[#F7F6F2]
        "
      >

        <OrganizationSidebar />


        <div
          className="
            min-h-screen
            ml-0
            md:ml-72
          "
        >

          <OrganizationNavbar />


          <main
            className="
              pt-[88px]
              min-h-screen
            "
          >

            <div
              className="
                max-w-[1600px]
                mx-auto
                px-4
                sm:px-5
                lg:px-8
                py-6
                lg:py-8
              "
            >

              <div
                className="
                  animate-pulse
                "
              >

                {/* HEADER */}

                <div
                  className="
                    flex
                    justify-between
                    mb-8
                  "
                >

                  <div>

                    <div
                      className="
                        h-8
                        w-64
                        bg-[#E5E7E4]
                        rounded-lg
                      "
                    />

                    <div
                      className="
                        h-4
                        w-96
                        bg-[#E5E7E4]
                        rounded
                        mt-3
                      "
                    />

                  </div>


                  <div
                    className="
                      h-11
                      w-28
                      bg-[#E5E7E4]
                      rounded-xl
                    "
                  />

                </div>


                {/* STAT CARDS */}

                <div
                  className="
                    grid
                    grid-cols-2
                    lg:grid-cols-5
                    gap-4
                    mb-7
                  "
                >

                  {[1, 2, 3, 4, 5].map(
                    (item) => (

                      <div
                        key={item}
                        className="
                          h-28
                          bg-white
                          rounded-2xl
                          border
                          border-[#E5E7EB]
                        "
                      />

                    )
                  )}

                </div>


                {/* SEARCH */}

                <div
                  className="
                    h-16
                    bg-white
                    rounded-2xl
                    border
                    border-[#E5E7EB]
                    mb-6
                  "
                />


                {/* TABLE */}

                <div
                  className="
                    h-[500px]
                    bg-white
                    rounded-2xl
                    border
                    border-[#E5E7EB]
                  "
                />

              </div>

            </div>

          </main>

        </div>

      </div>

    );

  }


  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <div
      className="
        min-h-screen
        bg-[#F7F6F2]
        text-[#172033]
      "
    >

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <OrganizationSidebar />


      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div
        className="
          min-h-screen
          ml-0
          md:ml-72
        "
      >

        {/* ===================================================
            NAVBAR
        =================================================== */}

        <OrganizationNavbar />


        {/* ===================================================
            CONTENT
        =================================================== */}

        <main
          className="
            pt-[88px]
            min-h-screen
          "
        >

          <div
            className="
              max-w-[1600px]
              mx-auto

              px-4
              sm:px-5
              lg:px-8

              py-6
              lg:py-8
            "
          >

            {/* =================================================
                PAGE HEADER
            ================================================= */}

            <div
              className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                lg:justify-between

                gap-5

                mb-7
              "
            >

              <div>

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      w-12
                      h-12

                      rounded-2xl

                      bg-[#E8F3F2]

                      flex
                      items-center
                      justify-center

                      shadow-sm

                      animate-[floatIcon_3s_ease-in-out_infinite]
                    "
                  >

                    <Users
                      size={23}
                      className="
                        text-[#0F766E]
                      "
                    />

                  </div>


                  <div>

                    <h1
                      className="
                        text-2xl
                        md:text-3xl

                        font-bold

                        text-[#172033]

                        tracking-tight
                      "
                    >
                      Candidate Applications
                    </h1>


                    <p
                      className="
                        text-sm

                        text-[#64748B]

                        mt-1
                      "
                    >
                      Review candidates,
                      shortlist applicants and
                      manage AI interviews.
                    </p>

                  </div>

                </div>

              </div>


              {/* REFRESH */}

              <button
                onClick={loadApplications}

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

                  shadow-sm

                  hover:bg-[#0F766E]

                  hover:-translate-y-0.5

                  hover:shadow-lg

                  transition-all
                  duration-200
                "
              >

                <RefreshCw
                  size={17}
                />

                Refresh

              </button>

            </div>


            {/* =================================================
                STATISTICS
            ================================================= */}

            <div
              className="
                grid

                grid-cols-2
                sm:grid-cols-3
                lg:grid-cols-5

                gap-4

                mb-7
              "
            >

              <ApplicationStat
                title="Total Applications"
                value={stats.total}
                icon={<Users size={20} />}
                iconBg="bg-[#EEF1F7]"
                iconColor="text-[#172033]"
              />


              <ApplicationStat
                title="Pending"
                value={stats.pending}
                icon={<Clock size={20} />}
                iconBg="bg-[#FFF7E8]"
                iconColor="text-[#B7791F]"
              />


              <ApplicationStat
                title="Shortlisted"
                value={stats.shortlisted}
                icon={<CheckCircle size={20} />}
                iconBg="bg-[#E8F3F2]"
                iconColor="text-[#0F766E]"
              />


              <ApplicationStat
                title="Interview"
                value={stats.interview}
                icon={<Brain size={20} />}
                iconBg="bg-[#F2EDFF]"
                iconColor="text-[#6D3BC1]"
              />


              <ApplicationStat
                title="Selected"
                value={stats.selected}
                icon={<Award size={20} />}
                iconBg="bg-[#EAF6ED]"
                iconColor="text-[#16803C]"
              />

            </div>


            {/* =================================================
                MINI PIPELINE
            ================================================= */}

            {applications.length > 0 && (

              <div
                className="
                  bg-white

                  rounded-2xl

                  border
                  border-[#E5E7EB]

                  shadow-sm

                  p-5

                  mb-7
                "
              >

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    mb-4
                  "
                >

                  <div>

                    <h2
                      className="
                        text-base
                        font-bold
                        text-[#172033]
                      "
                    >
                      Hiring Pipeline
                    </h2>

                    <p
                      className="
                        text-xs
                        text-[#94A3B8]
                        mt-1
                      "
                    >
                      Candidate distribution by stage
                    </p>

                  </div>


                  <TrendingUp
                    size={19}
                    className="
                      text-[#0F766E]
                    "
                  />

                </div>


                <div
                  className="
                    flex
                    h-2
                    rounded-full
                    overflow-hidden
                    bg-[#EEF0F1]
                  "
                >

                  {stats.pending > 0 && (
                    <div
                      style={{
                        width: `${
                          (stats.pending /
                            stats.total) *
                          100
                        }%`,
                      }}
                      className="
                        bg-[#B7791F]
                      "
                    />
                  )}


                  {stats.shortlisted > 0 && (
                    <div
                      style={{
                        width: `${
                          (stats.shortlisted /
                            stats.total) *
                          100
                        }%`,
                      }}
                      className="
                        bg-[#0F766E]
                      "
                    />
                  )}


                  {stats.interview > 0 && (
                    <div
                      style={{
                        width: `${
                          (stats.interview /
                            stats.total) *
                          100
                        }%`,
                      }}
                      className="
                        bg-[#6D3BC1]
                      "
                    />
                  )}


                  {stats.selected > 0 && (
                    <div
                      style={{
                        width: `${
                          (stats.selected /
                            stats.total) *
                          100
                        }%`,
                      }}
                      className="
                        bg-[#16803C]
                      "
                    />
                  )}


                  {stats.rejected > 0 && (
                    <div
                      style={{
                        width: `${
                          (stats.rejected /
                            stats.total) *
                          100
                        }%`,
                      }}
                      className="
                        bg-[#C53030]
                      "
                    />
                  )}

                </div>


                <div
                  className="
                    flex
                    flex-wrap
                    gap-x-6
                    gap-y-2

                    mt-4

                    text-xs
                    text-[#64748B]
                  "
                >

                  <PipelineLabel
                    label="Pending"
                    value={stats.pending}
                    dot="bg-[#B7791F]"
                  />

                  <PipelineLabel
                    label="Shortlisted"
                    value={stats.shortlisted}
                    dot="bg-[#0F766E]"
                  />

                  <PipelineLabel
                    label="Interview"
                    value={stats.interview}
                    dot="bg-[#6D3BC1]"
                  />

                  <PipelineLabel
                    label="Selected"
                    value={stats.selected}
                    dot="bg-[#16803C]"
                  />

                  <PipelineLabel
                    label="Rejected"
                    value={stats.rejected}
                    dot="bg-[#C53030]"
                  />

                </div>

              </div>

            )}


            {/* =================================================
                SEARCH + FILTER
            ================================================= */}

            <div
              className="
                bg-white

                rounded-2xl

                border
                border-[#E5E7EB]

                shadow-sm

                p-4

                mb-6
              "
            >

              <div
                className="
                  flex
                  flex-col
                  lg:flex-row

                  gap-3
                "
              >

                {/* SEARCH */}

                <div
                  className="
                    flex-1
                    relative
                  "
                >

                  <Search
                    size={19}

                    className="
                      absolute
                      left-4
                      top-1/2

                      -translate-y-1/2

                      text-[#94A3B8]
                    "
                  />


                  <input
                    type="text"

                    value={searchTerm}

                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }

                    placeholder="
                      Search candidate,
                      email, job or application ID...
                    "

                    className="
                      w-full

                      h-12

                      pl-11
                      pr-11

                      rounded-xl

                      border
                      border-[#DDE3E5]

                      bg-white

                      text-sm

                      text-[#172033]

                      outline-none

                      placeholder:text-[#94A3B8]

                      focus:border-[#0F766E]

                      focus:ring-4

                      focus:ring-[#0F766E]/10

                      transition
                    "
                  />


                  {searchTerm && (

                    <button
                      onClick={() =>
                        setSearchTerm("")
                      }

                      className="
                        absolute

                        right-3
                        top-1/2

                        -translate-y-1/2

                        w-7
                        h-7

                        rounded-lg

                        bg-[#F1F3F3]

                        flex
                        items-center
                        justify-center

                        text-[#64748B]

                        hover:bg-[#E5E8E8]

                        transition
                      "
                    >

                      <X
                        size={15}
                      />

                    </button>

                  )}

                </div>


                {/* FILTER */}

                <select
                  value={statusFilter}

                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }

                  className="
                    lg:w-56

                    h-12

                    px-4

                    rounded-xl

                    border
                    border-[#DDE3E5]

                    bg-white

                    text-sm

                    text-[#172033]

                    outline-none

                    focus:border-[#0F766E]

                    focus:ring-4

                    focus:ring-[#0F766E]/10
                  "
                >

                  <option value="All">
                    All Applications
                  </option>

                  <option value="Pending">
                    Pending
                  </option>

                  <option value="Shortlisted">
                    Shortlisted
                  </option>

                  <option value="Interview">
                    Interview
                  </option>

                  <option value="Selected">
                    Selected
                  </option>

                  <option value="Rejected">
                    Rejected
                  </option>

                </select>


                {/* REFRESH */}

                <button
                  onClick={loadApplications}

                  className="
                    h-12

                    px-4

                    rounded-xl

                    bg-[#F1F4F4]

                    text-[#172033]

                    flex
                    items-center
                    justify-center

                    gap-2

                    text-sm
                    font-semibold

                    hover:bg-[#E8F3F2]

                    hover:text-[#0F766E]

                    transition
                  "
                >

                  <RefreshCw
                    size={17}
                  />

                  <span className="hidden sm:block">
                    Refresh
                  </span>

                </button>

              </div>

            </div>


            {/* =================================================
                RESULT COUNT
            ================================================= */}

            <div
              className="
                flex
                items-center
                justify-between

                mb-4
              "
            >

              <div>

                <h2
                  className="
                    text-lg
                    font-bold
                    text-[#172033]
                  "
                >
                  Applications
                </h2>


                <p
                  className="
                    text-sm
                    text-[#64748B]
                    mt-1
                  "
                >
                  Showing{" "}

                  <span
                    className="
                      font-semibold
                      text-[#172033]
                    "
                  >
                    {filteredApplications.length}
                  </span>{" "}

                  of{" "}

                  <span
                    className="
                      font-semibold
                      text-[#172033]
                    "
                  >
                    {applications.length}
                  </span>
                </p>

              </div>


              {searchTerm && (

                <button
                  onClick={() =>
                    setSearchTerm("")
                  }

                  className="
                    text-sm
                    font-medium

                    text-[#0F766E]

                    hover:underline
                  "
                >
                  Clear search
                </button>

              )}

            </div>


            {/* =================================================
                EMPTY
            ================================================= */}

            {filteredApplications.length === 0 ? (

              <div
                className="
                  bg-white

                  rounded-3xl

                  border
                  border-[#E5E7EB]

                  shadow-sm

                  p-12
                  md:p-16

                  text-center
                "
              >

                <div
                  className="
                    w-20
                    h-20

                    mx-auto

                    rounded-3xl

                    bg-[#E8F3F2]

                    flex
                    items-center
                    justify-center

                    mb-5
                  "
                >

                  <AlertCircle
                    size={38}

                    className="
                      text-[#0F766E]
                    "
                  />

                </div>


                <h3
                  className="
                    text-xl

                    font-bold

                    text-[#172033]
                  "
                >
                  No Applications Found
                </h3>


                <p
                  className="
                    text-sm

                    text-[#64748B]

                    mt-2
                  "
                >
                  {searchTerm
                    ? "Try changing your search or filter."
                    : "No candidates have applied for your jobs yet."}
                </p>


                {searchTerm && (

                  <button
                    onClick={() => {
                      setSearchTerm("");
                      setStatusFilter("All");
                    }}

                    className="
                      mt-6

                      px-5
                      py-2.5

                      rounded-xl

                      bg-[#172033]

                      text-white

                      text-sm
                      font-semibold

                      hover:bg-[#0F766E]

                      transition
                    "
                  >
                    Clear Filters
                  </button>

                )}

              </div>

            ) : (

              /* =================================================
                 APPLICATION TABLE
              ================================================= */

              <div
                className="
                  bg-white

                  rounded-3xl

                  border
                  border-[#E5E7EB]

                  shadow-sm

                  overflow-hidden
                "
              >

                <div
                  className="
                    overflow-x-auto
                  "
                >

                  <table
                    className="
                      w-full
                      min-w-[950px]
                    "
                  >

                    {/* TABLE HEADER */}

                    <thead
                      className="
                        bg-[#F8F9F8]

                        border-b
                        border-[#E5E7EB]
                      "
                    >

                      <tr>

                        <th
                          className="
                            px-5
                            py-4

                            text-left

                            text-[11px]

                            font-bold

                            text-[#64748B]

                            uppercase

                            tracking-wider
                          "
                        >
                          Candidate
                        </th>


                        <th
                          className="
                            px-5
                            py-4

                            text-left

                            text-[11px]

                            font-bold

                            text-[#64748B]

                            uppercase

                            tracking-wider
                          "
                        >
                          Job
                        </th>


                        <th
                          className="
                            px-5
                            py-4

                            text-center

                            text-[11px]

                            font-bold

                            text-[#64748B]

                            uppercase

                            tracking-wider
                          "
                        >
                          Resume
                        </th>


                        <th
                          className="
                            px-5
                            py-4

                            text-center

                            text-[11px]

                            font-bold

                            text-[#64748B]

                            uppercase

                            tracking-wider
                          "
                        >
                          JD Match
                        </th>


                        <th
                          className="
                            px-5
                            py-4

                            text-left

                            text-[11px]

                            font-bold

                            text-[#64748B]

                            uppercase

                            tracking-wider
                          "
                        >
                          Status
                        </th>


                        <th
                          className="
                            px-5
                            py-4

                            text-left

                            text-[11px]

                            font-bold

                            text-[#64748B]

                            uppercase

                            tracking-wider
                          "
                        >
                          Applied
                        </th>


                        <th
                          className="
                            px-5
                            py-4

                            text-center

                            text-[11px]

                            font-bold

                            text-[#64748B]

                            uppercase

                            tracking-wider
                          "
                        >
                          Actions
                        </th>

                      </tr>

                    </thead>


                    {/* TABLE BODY */}

                    <tbody
                      className="
                        divide-y
                        divide-[#F0F1F1]
                      "
                    >

                      {filteredApplications.map(
                        (
                          application,
                          index
                        ) => {

                          const applicationId =
                            application._id ||
                            application.application_id ||
                            application.id;


                          const candidateName =
                            application.student_name ||
                            application.candidate_name ||
                            "Unknown Candidate";


                          const candidateEmail =
                            application.student_email ||
                            application.candidate_email ||
                            "No email";


                          const jobTitle =
                            application.job_title ||
                            application.job_name ||
                            "Unknown Job";


                          const status =
                            application.application_status ||
                            "Pending";


                          return (

                            <tr
                              key={
                                applicationId
                              }

                              className="
                                group

                                hover:bg-[#FAFCFB]

                                transition-all
                                duration-200

                                animate-[rowFade_0.35s_ease-out]
                              "
                              style={{
                                animationDelay:
                                  `${index * 35}ms`,
                              }}
                            >

                              {/* CANDIDATE */}

                              <td
                                className="
                                  px-5
                                  py-5
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
                                    className="
                                      w-10
                                      h-10

                                      rounded-xl

                                      bg-[#EEF4F3]

                                      flex
                                      items-center
                                      justify-center

                                      flex-shrink-0

                                      group-hover:scale-105

                                      transition
                                    "
                                  >

                                    <User
                                      size={18}

                                      className="
                                        text-[#0F766E]
                                      "
                                    />

                                  </div>


                                  <div
                                    className="
                                      min-w-0
                                    "
                                  >

                                    <p
                                      className="
                                        font-semibold

                                        text-[#172033]

                                        truncate

                                        max-w-[200px]
                                      "
                                    >
                                      {candidateName}
                                    </p>


                                    <p
                                      className="
                                        text-xs

                                        text-[#94A3B8]

                                        truncate

                                        max-w-[200px]

                                        mt-0.5
                                      "
                                    >
                                      {candidateEmail}
                                    </p>

                                  </div>

                                </div>

                              </td>


                              {/* JOB */}

                              <td
                                className="
                                  px-5
                                  py-5
                                "
                              >

                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-2
                                  "
                                >

                                  <div
                                    className="
                                      w-8
                                      h-8

                                      rounded-lg

                                      bg-[#F2F4F4]

                                      flex
                                      items-center
                                      justify-center
                                    "
                                  >

                                    <Briefcase
                                      size={15}

                                      className="
                                        text-[#64748B]
                                      "
                                    />

                                  </div>


                                  <span
                                    className="
                                      text-sm

                                      font-medium

                                      text-[#475569]

                                      max-w-[190px]

                                      truncate
                                    "
                                  >
                                    {jobTitle}
                                  </span>

                                </div>

                              </td>


                              {/* RESUME */}

                              <td
                                className="
                                  px-5
                                  py-5

                                  text-center
                                "
                              >

                                <ScoreBadge
                                  score={
                                    application.resume_score
                                  }
                                />

                              </td>


                              {/* JD */}

                              <td
                                className="
                                  px-5
                                  py-5

                                  text-center
                                "
                              >

                                <ScoreBadge
                                  score={
                                    application.jd_match_score
                                  }
                                />

                              </td>


                              {/* STATUS */}

                              <td
                                className="
                                  px-5
                                  py-5
                                "
                              >

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

                                    border

                                    whitespace-nowrap

                                    ${getStatusColor(
                                      status
                                    )}
                                  `}
                                >

                                  {getStatusIcon(
                                    status
                                  )}

                                  {status}

                                </span>

                              </td>


                              {/* DATE */}

                              <td
                                className="
                                  px-5
                                  py-5
                                "
                              >

                                <span
                                  className="
                                    text-sm

                                    text-[#64748B]

                                    whitespace-nowrap
                                  "
                                >
                                  {formatDate(
                                    application.created_at
                                  )}
                                </span>

                              </td>


                              {/* ACTIONS */}

                              <td
                                className="
                                  px-5
                                  py-5
                                "
                              >

                                <div
                                  className="
                                    flex

                                    items-center
                                    justify-center

                                    gap-1
                                  "
                                >

                                  {/* VIEW */}

                                  <ActionButton
                                    title="View Application"
                                    onClick={() =>
                                      navigate(
                                        `/organization/applications/${applicationId}`
                                      )
                                    }
                                    icon={
                                      <Eye
                                        size={17}
                                      />
                                    }
                                    className="
                                      text-[#64748B]
                                      hover:text-[#172033]
                                      hover:bg-[#F1F3F5]
                                    "
                                  />


                                  {/* SHORTLIST */}

                                  {status ===
                                    "Pending" && (

                                    <ActionButton
                                      title="Shortlist Candidate"
                                      disabled={
                                        updatingId ===
                                        applicationId
                                      }
                                      onClick={() =>
                                        handleStatusUpdate(
                                          applicationId,
                                          "Shortlisted"
                                        )
                                      }
                                      icon={
                                        <CheckCircle
                                          size={17}
                                        />
                                      }
                                      className="
                                        text-[#0F766E]
                                        hover:bg-[#E8F3F2]
                                      "
                                    />

                                  )}


                                  {/* AI INTERVIEW */}

                                  {status ===
                                    "Shortlisted" && (

                                    <ActionButton
                                      title="Create AI Interview"
                                      disabled={
                                        updatingId ===
                                        applicationId
                                      }
                                      onClick={() =>
                                        handleCreateInterview(
                                          application
                                        )
                                      }
                                      icon={
                                        <Brain
                                          size={17}
                                        />
                                      }
                                      className="
                                        text-[#6D3BC1]
                                        hover:bg-[#F2EDFF]
                                      "
                                    />

                                  )}


                                  {/* SELECT */}

                                  {status ===
                                    "Interview" && (

                                    <ActionButton
                                      title="Select Candidate"
                                      disabled={
                                        updatingId ===
                                        applicationId
                                      }
                                      onClick={() =>
                                        handleStatusUpdate(
                                          applicationId,
                                          "Selected"
                                        )
                                      }
                                      icon={
                                        <Award
                                          size={17}
                                        />
                                      }
                                      className="
                                        text-[#16803C]
                                        hover:bg-[#EAF6ED]
                                      "
                                    />

                                  )}


                                  {/* REJECT */}

                                  {(
                                    status ===
                                      "Pending" ||

                                    status ===
                                      "Shortlisted" ||

                                    status ===
                                      "Interview"

                                  ) && (

                                    <ActionButton
                                      title="Reject Candidate"
                                      disabled={
                                        updatingId ===
                                        applicationId
                                      }
                                      onClick={() =>
                                        handleStatusUpdate(
                                          applicationId,
                                          "Rejected"
                                        )
                                      }
                                      icon={
                                        <XCircle
                                          size={17}
                                        />
                                      }
                                      className="
                                        text-[#C53030]
                                        hover:bg-[#FCECEC]
                                      "
                                    />

                                  )}

                                </div>

                              </td>

                            </tr>

                          );

                        }
                      )}

                    </tbody>

                  </table>

                </div>


                {/* =================================================
                    FOOTER
                ================================================= */}

                <div
                  className="
                    px-5
                    py-4

                    bg-[#FAFAF8]

                    border-t
                    border-[#E5E7EB]
                  "
                >

                  <div
                    className="
                      flex

                      flex-col
                      sm:flex-row

                      sm:items-center
                      sm:justify-between

                      gap-3
                    "
                  >

                    <p
                      className="
                        text-sm

                        text-[#64748B]
                      "
                    >
                      Total{" "}

                      <span
                        className="
                          font-bold

                          text-[#172033]
                        "
                      >
                        {applications.length}
                      </span>{" "}
                      applications
                    </p>


                    <div
                      className="
                        flex

                        items-center

                        gap-4

                        flex-wrap

                        text-xs

                        text-[#64748B]
                      "
                    >

                      <span>
                        Pending:{" "}
                        <b className="text-[#B7791F]">
                          {stats.pending}
                        </b>
                      </span>


                      <span>
                        Shortlisted:{" "}
                        <b className="text-[#0F766E]">
                          {stats.shortlisted}
                        </b>
                      </span>


                      <span>
                        Interview:{" "}
                        <b className="text-[#6D3BC1]">
                          {stats.interview}
                        </b>
                      </span>


                      <span>
                        Selected:{" "}
                        <b className="text-[#16803C]">
                          {stats.selected}
                        </b>
                      </span>


                      <span>
                        Rejected:{" "}
                        <b className="text-[#C53030]">
                          {stats.rejected}
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


      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style>
        {`

          @keyframes rowFade {

            from {
              opacity: 0;
              transform: translateY(6px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }

          }


          @keyframes floatIcon {

            0%,
            100% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-3px);
            }

          }

        `}
      </style>

    </div>

  );

}


// =============================================================
// STAT CARD
// =============================================================

function ApplicationStat({
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

        rounded-2xl

        border
        border-[#E5E7EB]

        shadow-sm

        p-4
        md:p-5

        hover:-translate-y-1

        hover:shadow-lg

        transition-all
        duration-300
      "
    >

      <div
        className="
          flex
          items-center
          justify-between

          gap-3
        "
      >

        <div>

          <p
            className="
              text-xs
              md:text-sm

              font-medium

              text-[#64748B]
            "
          >
            {title}
          </p>


          <p
            className="
              text-2xl
              md:text-3xl

              font-bold

              text-[#172033]

              mt-1
            "
          >
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
// SCORE BADGE
// =============================================================

function ScoreBadge({
  score,
}) {

  const value =
    Number(score) || 0;


  let className = "";

  if (value >= 70) {

    className =
      "bg-[#EAF6ED] text-[#16803C]";

  } else if (value >= 50) {

    className =
      "bg-[#FFF7E8] text-[#B7791F]";

  } else {

    className =
      "bg-[#FCECEC] text-[#C53030]";

  }


  return (

    <span
      className={`
        inline-flex

        items-center
        justify-center

        min-w-[52px]

        px-3
        py-1.5

        rounded-lg

        text-xs

        font-bold

        ${className}
      `}
    >
      {value}%
    </span>

  );

}


// =============================================================
// PIPELINE LABEL
// =============================================================

function PipelineLabel({
  label,
  value,
  dot,
}) {

  return (

    <span
      className="
        flex
        items-center
        gap-2
      "
    >

      <span
        className={`
          w-2
          h-2

          rounded-full

          ${dot}
        `}
      />

      {label}:{" "}

      <strong
        className="
          text-[#172033]
        "
      >
        {value}
      </strong>

    </span>

  );

}


// =============================================================
// ACTION BUTTON
// =============================================================

function ActionButton({
  title,
  icon,
  onClick,
  disabled,
  className,
}) {

  return (

    <button
      type="button"

      title={title}

      onClick={onClick}

      disabled={disabled}

      className={`
        w-9
        h-9

        rounded-lg

        flex
        items-center
        justify-center

        transition-all
        duration-200

        hover:scale-105

        disabled:opacity-40
        disabled:cursor-not-allowed

        ${className}
      `}
    >

      {icon}

    </button>

  );

}


export default Applications;