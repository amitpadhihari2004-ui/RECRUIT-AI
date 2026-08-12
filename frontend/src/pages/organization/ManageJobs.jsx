import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import OrganizationSidebar from "../../components/organization/OrganizationSidebar";
import OrganizationNavbar from "../../components/organization/OrganizationNavbar";

import {
  getJobsByOrganization,
  publishJob,
  closeJob,
  deleteJob,
} from "../../api/jobApi";

import {
  Search,
  Briefcase,
  MapPin,
  Building2,
  Pencil,
  Trash2,
  Eye,
  Upload,
  Lock,
  Calendar,
  IndianRupee,
  User,
  Plus,
  AlertCircle,
  Brain,
  Sparkles,
  Clock,
  ChevronRight,
  RefreshCw,
  X,
} from "lucide-react";


function ManageJobs() {

  const navigate = useNavigate();


  // =========================================================
  // STATE
  // =========================================================

  const [loading, setLoading] =
    useState(true);

  const [jobs, setJobs] =
    useState([]);

  const [filteredJobs, setFilteredJobs] =
    useState([]);

  const [searchTerm, setSearchTerm] =
    useState("");

  const [statusFilter, setStatusFilter] =
    useState("All");


  const organizationId =
    localStorage.getItem(
      "organizationId"
    );


  // =========================================================
  // LOAD
  // =========================================================

  useEffect(() => {

    loadJobs();

  }, []);


  // =========================================================
  // FILTER
  // =========================================================

  useEffect(() => {

    filterJobs();

  }, [
    jobs,
    searchTerm,
    statusFilter,
  ]);


  // =========================================================
  // LOAD JOBS
  // =========================================================

  const loadJobs = async () => {

    try {

      setLoading(true);


      if (!organizationId) {

        toast.error(
          "Organization ID not found."
        );

        return;
      }


      const data =
        await getJobsByOrganization(
          organizationId
        );


      console.log(
        "Organization Jobs:",
        data
      );


      const jobList =
        Array.isArray(data)
          ? data
          : data?.jobs ||
            data?.data ||
            [];


      setJobs(jobList);

      setFilteredJobs(jobList);

    } catch (error) {

      console.error(
        "Load Jobs Error:",
        error
      );


      toast.error(
        error?.response?.data?.detail ||
        "Failed to load jobs."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // FILTER
  // =========================================================

  const filterJobs = () => {

    let filtered = [...jobs];


    if (
      searchTerm.trim() !== ""
    ) {

      const searchLower =
        searchTerm
          .toLowerCase()
          .trim();


      filtered =
        filtered.filter((job) => {

          return (

            job.title
              ?.toLowerCase()
              .includes(searchLower)

            ||

            job.department
              ?.toLowerCase()
              .includes(searchLower)

            ||

            job.location
              ?.toLowerCase()
              .includes(searchLower)

          );

        });

    }


    if (
      statusFilter !== "All"
    ) {

      filtered =
        filtered.filter(
          (job) =>
            job.status
              ?.toLowerCase() ===
            statusFilter.toLowerCase()
        );

    }


    setFilteredJobs(filtered);

  };


  // =========================================================
  // PUBLISH
  // =========================================================

  const handlePublish =
    async (jobId) => {

      try {

        await publishJob(jobId);


        toast.success(
          "Job published successfully."
        );


        loadJobs();

      } catch (error) {

        console.error(error);


        toast.error(
          error?.response?.data?.detail ||
          "Failed to publish job."
        );

      }

    };


  // =========================================================
  // CLOSE
  // =========================================================

  const handleClose =
    async (jobId) => {

      try {

        await closeJob(jobId);


        toast.success(
          "Job closed successfully."
        );


        loadJobs();

      } catch (error) {

        console.error(error);


        toast.error(
          error?.response?.data?.detail ||
          "Failed to close job."
        );

      }

    };


  // =========================================================
  // DELETE
  // =========================================================

  const handleDelete =
    async (jobId) => {

      const confirmed =
        window.confirm(
          "Are you sure you want to delete this job?"
        );


      if (!confirmed) {
        return;
      }


      try {

        await deleteJob(jobId);


        toast.success(
          "Job deleted successfully."
        );


        loadJobs();

      } catch (error) {

        console.error(error);


        toast.error(
          error?.response?.data?.detail ||
          "Failed to delete job."
        );

      }

    };


  // =========================================================
  // STATUS
  // =========================================================

  const getStatusColor =
    (status = "") => {

      switch (
        status.toLowerCase()
      ) {

        case "published":

          return `
            bg-[#EAF6ED]
            text-[#16803C]
            border-[#C9E8D1]
          `;


        case "closed":

          return `
            bg-[#FCECEC]
            text-[#C53030]
            border-[#F3CACA]
          `;


        case "draft":

          return `
            bg-[#FFF7E8]
            text-[#B7791F]
            border-[#F1D9A6]
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
    (status = "") => {

      switch (
        status.toLowerCase()
      ) {

        case "published":

          return (
            <Upload
              size={13}
            />
          );


        case "closed":

          return (
            <Lock
              size={13}
            />
          );


        case "draft":

          return (
            <Pencil
              size={13}
            />
          );


        default:

          return null;

      }

    };


  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {

    return (

      <div
        className="
          min-h-screen

          bg-[#F7F6F2]

          text-[#172033]
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

              {/* HEADER SKELETON */}

              <div
                className="
                  animate-pulse
                "
              >

                <div
                  className="
                    flex
                    justify-between

                    mb-7
                  "
                >

                  <div>

                    <div
                      className="
                        h-8
                        w-48

                        bg-[#E6E7E5]

                        rounded-lg
                      "
                    />

                    <div
                      className="
                        h-4
                        w-72

                        bg-[#E6E7E5]

                        rounded

                        mt-3
                      "
                    />

                  </div>


                  <div
                    className="
                      h-11
                      w-32

                      bg-[#E6E7E5]

                      rounded-xl
                    "
                  />

                </div>


                {/* SUMMARY */}

                <div
                  className="
                    grid

                    grid-cols-2
                    lg:grid-cols-4

                    gap-4

                    mb-6
                  "
                >

                  {[1, 2, 3, 4].map(
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

                    mb-7
                  "
                />


                {/* JOBS */}

                <div
                  className="
                    grid

                    grid-cols-1
                    md:grid-cols-2
                    xl:grid-cols-3

                    gap-5
                  "
                >

                  {[1, 2, 3].map(
                    (item) => (

                      <div
                        key={item}

                        className="
                          h-[430px]

                          bg-white

                          rounded-3xl

                          border
                          border-[#E5E7EB]
                        "
                      />

                    )
                  )}

                </div>

              </div>

            </div>

          </main>

        </div>

      </div>

    );

  }


  // =========================================================
  // MAIN
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

          IMPORTANT:
          Sidebar = fixed 288px

          Desktop:
          ml-72

          Mobile:
          ml-0
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
            PAGE CONTENT

            Navbar = 88px
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
                HEADER
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
                    "
                  >

                    <Briefcase
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
                      Manage Jobs
                    </h1>


                    <p
                      className="
                        text-sm

                        text-[#64748B]

                        mt-1
                      "
                    >
                      Manage your job postings,
                      applications and hiring
                      pipeline.
                    </p>

                  </div>

                </div>

              </div>


              {/* CREATE */}

              <button
                onClick={() =>
                  navigate(
                    "/organization/jobs/create"
                  )
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

                  shadow-sm

                  hover:bg-[#0F766E]

                  hover:-translate-y-0.5

                  hover:shadow-lg

                  transition-all
                  duration-200
                "
              >

                <Plus
                  size={18}
                />

                Create Job

              </button>

            </div>


            {/* =================================================
                SUMMARY
            ================================================= */}

            <div
              className="
                grid

                grid-cols-2
                lg:grid-cols-4

                gap-4

                mb-6
              "
            >

              <SummaryCard
                title="Total Jobs"

                value={jobs.length}

                icon={
                  <Briefcase
                    size={20}
                  />
                }

                iconBg="
                  bg-[#EEF1F7]
                "

                iconColor="
                  text-[#172033]
                "
              />


              <SummaryCard
                title="Published"

                value={
                  jobs.filter(
                    (job) =>
                      job.status
                        ?.toLowerCase() ===
                      "published"
                  ).length
                }

                icon={
                  <Upload
                    size={20}
                  />
                }

                iconBg="
                  bg-[#EAF6ED]
                "

                iconColor="
                  text-[#16803C]
                "
              />


              <SummaryCard
                title="Drafts"

                value={
                  jobs.filter(
                    (job) =>
                      job.status
                        ?.toLowerCase() ===
                      "draft"
                  ).length
                }

                icon={
                  <Pencil
                    size={20}
                  />
                }

                iconBg="
                  bg-[#FFF7E8]
                "

                iconColor="
                  text-[#B7791F]
                "
              />


              <SummaryCard
                title="Closed"

                value={
                  jobs.filter(
                    (job) =>
                      job.status
                        ?.toLowerCase() ===
                      "closed"
                  ).length
                }

                icon={
                  <Lock
                    size={20}
                  />
                }

                iconBg="
                  bg-[#FCECEC]
                "

                iconColor="
                  text-[#C53030]
                "
              />

            </div>


            {/* =================================================
                SEARCH
            ================================================= */}

            <div
              className="
                bg-white

                rounded-2xl

                border
                border-[#E5E7EB]

                shadow-sm

                p-4

                mb-7
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

                    placeholder="
                      Search by job title,
                      department or location...
                    "

                    value={searchTerm}

                    onChange={(e) =>
                      setSearchTerm(
                        e.target.value
                      )
                    }

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
                      type="button"

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

                        text-[#64748B]

                        flex
                        items-center
                        justify-center

                        hover:bg-[#E6E9E9]

                        transition
                      "
                    >

                      <X
                        size={15}
                      />

                    </button>

                  )}

                </div>


                {/* STATUS */}

                <select
                  value={statusFilter}

                  onChange={(e) =>
                    setStatusFilter(
                      e.target.value
                    )
                  }

                  className="
                    lg:w-52

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

                    transition
                  "
                >

                  <option value="All">
                    All Status
                  </option>

                  <option value="Draft">
                    Draft
                  </option>

                  <option value="Published">
                    Published
                  </option>

                  <option value="Closed">
                    Closed
                  </option>

                </select>


                {/* REFRESH */}

                <button
                  type="button"

                  onClick={loadJobs}

                  className="
                    h-12

                    px-4

                    rounded-xl

                    bg-[#F2F4F4]

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
                RESULTS HEADER
            ================================================= */}

            <div
              className="
                flex
                items-end
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
                  Job Postings
                </h2>


                <p
                  className="
                    text-sm

                    text-[#64748B]

                    mt-1
                  "
                >
                  {filteredJobs.length}{" "}
                  {filteredJobs.length === 1
                    ? "job"
                    : "jobs"}{" "}
                  found
                </p>

              </div>

            </div>


            {/* =================================================
                EMPTY
            ================================================= */}

            {filteredJobs.length === 0 ? (

              <div
                className="
                  bg-white

                  rounded-3xl

                  border
                  border-[#E5E7EB]

                  shadow-sm

                  p-10
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
                  No Jobs Found
                </h3>


                <p
                  className="
                    text-[#64748B]

                    mt-2

                    max-w-md

                    mx-auto

                    text-sm
                  "
                >
                  No job postings match your
                  current search or filter.
                </p>


                <button
                  onClick={() => {

                    setSearchTerm("");

                    setStatusFilter(
                      "All"
                    );

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

              </div>

            ) : (

              /* =================================================
                 JOB GRID
              ================================================= */

              <div
                className="
                  grid

                  grid-cols-1
                  md:grid-cols-2
                  xl:grid-cols-3

                  gap-5
                "
              >

                {filteredJobs.map(
                  (job) => {

                    const status =
                      job.status ||
                      "Draft";


                    const isPublished =
                      status.toLowerCase() ===
                      "published";


                    const isDraft =
                      status.toLowerCase() ===
                      "draft";


                    return (

                      <div
                        key={job._id}

                        className="
                          group

                          bg-white

                          rounded-3xl

                          border
                          border-[#E5E7EB]

                          shadow-sm

                          overflow-hidden

                          hover:shadow-xl

                          hover:-translate-y-1

                          hover:border-[#B7D8D4]

                          transition-all
                          duration-300
                        "
                      >

                        {/* ====================================
                            TOP ACCENT
                        ==================================== */}

                        <div
                          className={`
                            h-1

                            ${
                              isPublished
                                ? "bg-[#16803C]"
                                : isDraft
                                ? "bg-[#B7791F]"
                                : "bg-[#C53030]"
                            }
                          `}
                        />


                        <div
                          className="
                            p-5
                            sm:p-6
                          "
                        >

                          {/* ==================================
                              HEADER
                          ================================== */}

                          <div
                            className="
                              flex

                              items-start

                              justify-between

                              gap-3

                              mb-5
                            "
                          >

                            <div
                              className="
                                flex

                                items-start

                                gap-3

                                min-w-0
                              "
                            >

                              <div
                                className="
                                  w-11
                                  h-11

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

                                <Briefcase
                                  size={20}

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

                                <h3
                                  className="
                                    text-lg

                                    font-bold

                                    text-[#172033]

                                    truncate
                                  "
                                >
                                  {job.title ||
                                    "Untitled Job"}
                                </h3>


                                <div
                                  className="
                                    flex
                                    items-center
                                    gap-1.5

                                    mt-1
                                  "
                                >

                                  <Building2
                                    size={13}

                                    className="
                                      text-[#94A3B8]
                                    "
                                  />


                                  <span
                                    className="
                                      text-sm

                                      text-[#64748B]

                                      truncate
                                    "
                                  >
                                    {job.department ||
                                      "General"}
                                  </span>

                                </div>

                              </div>

                            </div>


                            {/* STATUS */}

                            <span
                              className={`
                                flex

                                items-center

                                gap-1.5

                                px-2.5
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

                          </div>


                          {/* ==================================
                              DETAILS
                          ================================== */}

                          <div
                            className="
                              space-y-3

                              mb-5
                            "
                          >

                            <JobDetail
                              icon={
                                <MapPin
                                  size={15}
                                />
                              }

                              text={
                                job.location ||
                                "Location not specified"
                              }
                            />


                            <JobDetail
                              icon={
                                <User
                                  size={15}
                                />
                              }

                              text={
                                job.employment_type ||
                                "Employment type not specified"
                              }
                            />


                            <JobDetail
                              icon={
                                <Clock
                                  size={15}
                                />
                              }

                              text={
                                job.experience_required ||
                                "Experience not specified"
                              }
                            />


                            <JobDetail
                              icon={
                                <IndianRupee
                                  size={15}
                                />
                              }

                              text={
                                job.salary ||
                                "Salary not specified"
                              }
                            />

                          </div>


                          {/* ==================================
                              AI RANKING
                          ================================== */}

                          {isPublished && (

                            <button
                              onClick={() =>
                                navigate(
                                  `/organization/jobs/${job._id}/ranking`
                                )
                              }

                              className="
                                w-full

                                mb-5

                                p-4

                                rounded-2xl

                                bg-gradient-to-r

                                from-[#F4F0FF]

                                to-[#EEF4FF]

                                border
                                border-[#E6DBFF]

                                hover:from-[#EEE7FF]

                                hover:to-[#E4EEFF]

                                transition-all
                                duration-200
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
                                    gap-3
                                  "
                                >

                                  <div
                                    className="
                                      w-10
                                      h-10

                                      rounded-xl

                                      bg-white

                                      shadow-sm

                                      flex
                                      items-center
                                      justify-center
                                    "
                                  >

                                    <Brain
                                      size={20}

                                      className="
                                        text-purple-600
                                      "
                                    />

                                  </div>


                                  <div
                                    className="
                                      text-left
                                    "
                                  >

                                    <div
                                      className="
                                        flex
                                        items-center
                                        gap-2
                                      "
                                    >

                                      <p
                                        className="
                                          font-bold

                                          text-[#172033]

                                          text-sm
                                        "
                                      >
                                        AI Candidate
                                        Ranking
                                      </p>


                                      <Sparkles
                                        size={14}

                                        className="
                                          text-purple-500
                                        "
                                      />

                                    </div>


                                    <p
                                      className="
                                        text-xs

                                        text-[#64748B]

                                        mt-0.5
                                      "
                                    >
                                      Rank applicants
                                      automatically
                                    </p>

                                  </div>

                                </div>


                                <ChevronRight
                                  size={19}

                                  className="
                                    text-purple-500

                                    group-hover:translate-x-1

                                    transition
                                  "
                                />

                              </div>

                            </button>

                          )}


                          {/* ==================================
                              DRAFT / CLOSED
                          ================================== */}

                          {!isPublished && (

                            <div
                              className="
                                mb-5

                                p-3.5

                                rounded-xl

                                bg-[#FAFAF8]

                                border
                                border-[#EEF0F1]
                              "
                            >

                              <div
                                className="
                                  flex

                                  items-start

                                  gap-2
                                "
                              >

                                {isDraft ? (

                                  <Pencil
                                    size={16}

                                    className="
                                      text-[#B7791F]

                                      mt-0.5

                                      flex-shrink-0
                                    "
                                  />

                                ) : (

                                  <Lock
                                    size={16}

                                    className="
                                      text-[#C53030]

                                      mt-0.5

                                      flex-shrink-0
                                    "
                                  />

                                )}


                                <p
                                  className="
                                    text-sm

                                    text-[#64748B]

                                    leading-5
                                  "
                                >

                                  {isDraft
                                    ? "Publish this job to start receiving applications."
                                    : "This job is currently closed."}

                                </p>

                              </div>

                            </div>

                          )}


                          {/* ==================================
                              FOOTER
                          ================================== */}

                          <div
                            className="
                              pt-4

                              border-t
                              border-[#EEF0F1]
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
                                  gap-1.5

                                  text-xs

                                  text-[#94A3B8]
                                "
                              >

                                <Calendar
                                  size={13}
                                />

                                Created{" "}

                                {job.created_at
                                  ? new Date(
                                      job.created_at
                                    ).toLocaleDateString(
                                      "en-IN"
                                    )
                                  : "N/A"}

                              </div>

                            </div>


                            {/* ACTIONS */}

                            <div
                              className="
                                flex

                                items-center

                                gap-1

                                mt-4
                              "
                            >

                              {/* VIEW */}

                              <button
                                onClick={() =>
                                  navigate(
                                    `/organization/jobs/view/${job._id}`
                                  )
                                }

                                className="
                                  flex-1

                                  flex

                                  items-center
                                  justify-center

                                  gap-1.5

                                  py-2.5

                                  rounded-xl

                                  text-[#64748B]

                                  hover:text-[#0F766E]

                                  hover:bg-[#EAF6F5]

                                  text-sm

                                  font-medium

                                  transition
                                "
                              >

                                <Eye
                                  size={16}
                                />

                                <span className="hidden sm:inline">
                                  View
                                </span>

                              </button>


                              {/* EDIT */}

                              <button
                                onClick={() =>
                                  navigate(
                                    `/organization/jobs/edit/${job._id}`
                                  )
                                }

                                className="
                                  flex-1

                                  flex

                                  items-center
                                  justify-center

                                  gap-1.5

                                  py-2.5

                                  rounded-xl

                                  text-[#64748B]

                                  hover:text-[#172033]

                                  hover:bg-[#F1F3F5]

                                  text-sm

                                  font-medium

                                  transition
                                "
                              >

                                <Pencil
                                  size={16}
                                />

                                <span className="hidden sm:inline">
                                  Edit
                                </span>

                              </button>


                              {/* PUBLISH */}

                              {isDraft && (

                                <button
                                  onClick={() =>
                                    handlePublish(
                                      job._id
                                    )
                                  }

                                  className="
                                    p-2.5

                                    rounded-xl

                                    text-[#64748B]

                                    hover:text-[#16803C]

                                    hover:bg-[#EAF6ED]

                                    transition
                                  "

                                  title="Publish Job"
                                >

                                  <Upload
                                    size={17}
                                  />

                                </button>

                              )}


                              {/* CLOSE */}

                              {isPublished && (

                                <button
                                  onClick={() =>
                                    handleClose(
                                      job._id
                                    )
                                  }

                                  className="
                                    p-2.5

                                    rounded-xl

                                    text-[#64748B]

                                    hover:text-[#C53030]

                                    hover:bg-[#FCECEC]

                                    transition
                                  "

                                  title="Close Job"
                                >

                                  <Lock
                                    size={17}
                                  />

                                </button>

                              )}


                              {/* DELETE */}

                              <button
                                onClick={() =>
                                  handleDelete(
                                    job._id
                                  )
                                }

                                className="
                                  p-2.5

                                  rounded-xl

                                  text-[#94A3B8]

                                  hover:text-[#C53030]

                                  hover:bg-[#FCECEC]

                                  transition
                                "

                                title="Delete Job"
                              >

                                <Trash2
                                  size={17}
                                />

                              </button>

                            </div>

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
          ANIMATION
      ===================================================== */}

      <style>
        {`

          @keyframes jobFadeIn {

            from {
              opacity: 0;
              transform: translateY(10px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }

          }

        `}
      </style>

    </div>

  );

}


// =============================================================
// SUMMARY CARD
// =============================================================

function SummaryCard({
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

        hover:shadow-md

        hover:-translate-y-0.5

        transition-all
        duration-200
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

              text-[#64748B]

              font-medium
            "
          >
            {title}
          </p>


          <p
            className="
              text-2xl

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

          <span
            className={iconColor}
          >
            {icon}
          </span>

        </div>

      </div>

    </div>

  );

}


// =============================================================
// JOB DETAIL
// =============================================================

function JobDetail({
  icon,
  text,
}) {

  return (

    <div
      className="
        flex

        items-center

        gap-2.5

        text-sm

        text-[#64748B]
      "
    >

      <span
        className="
          text-[#94A3B8]

          flex-shrink-0
        "
      >
        {icon}
      </span>


      <span
        className="
          truncate
        "
      >
        {text}
      </span>

    </div>

  );

}


export default ManageJobs;