import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  Briefcase,
  Building2,
  MapPin,
  User,
  Calendar,
  IndianRupee,
  FileText,
  Tag,
  List,
  Clock,
  CheckCircle,
  Lock,
  Pencil,
  Edit3,
  Sparkles,
} from "lucide-react";

import OrganizationSidebar from "../../components/organization/OrganizationSidebar";
import OrganizationNavbar from "../../components/organization/OrganizationNavbar";
import { getJob } from "../../api/jobApi";

function ViewJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [job, setJob] = useState(null);

  // =========================================================
  // LOAD JOB
  // =========================================================

  useEffect(() => {
    loadJob();
  }, [id]);

  const loadJob = async () => {
    try {
      setLoading(true);

      const data = await getJob(id);

      setJob(data);
    } catch (error) {
      console.error("Load Job Error:", error);

      toast.error(
        error.response?.data?.detail ||
          "Failed to load job."
      );

      navigate("/organization/jobs");
    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // STATUS COLOR
  // =========================================================

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "closed":
        return "bg-red-50 text-red-700 border-red-200";

      case "draft":
        return "bg-amber-50 text-amber-700 border-amber-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  // =========================================================
  // STATUS ICON
  // =========================================================

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case "published":
        return <CheckCircle size={15} />;

      case "closed":
        return <Lock size={15} />;

      case "draft":
        return <Pencil size={15} />;

      default:
        return null;
    }
  };

  // =========================================================
  // DATE FORMAT
  // =========================================================

  const formatDate = (date) => {
    if (!date) return "N/A";

    const parsedDate = new Date(date);

    if (Number.isNaN(parsedDate.getTime())) {
      return "N/A";
    }

    return parsedDate.toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // =========================================================
  // COMMON PORTAL LAYOUT
  // =========================================================

  const PortalLayout = ({ children }) => {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-[#F7F6F2]">

        {/* =================================================
            SIDEBAR
        ================================================= */}

        <aside className="w-72 min-w-72 shrink-0 h-screen">
          <OrganizationSidebar />
        </aside>

        {/* =================================================
            RIGHT SIDE
        ================================================= */}

        <div className="flex min-w-0 flex-1 flex-col overflow-hidden">

          {/* =================================================
              NAVBAR
          ================================================= */}

          <div className="shrink-0 z-30">
            <OrganizationNavbar />
          </div>

          {/* =================================================
              CONTENT
          ================================================= */}

          <main className="min-w-0 flex-1 overflow-y-auto overflow-x-hidden">
            {children}
          </main>

        </div>
      </div>
    );
  };

  // =========================================================
  // LOADING
  // =========================================================

  if (loading) {
    return (
      <PortalLayout>

        <div className="min-h-full px-4 py-6 md:px-6 lg:px-8">

          <div className="w-full max-w-[1400px] mx-auto">

            <div className="animate-pulse">

              {/* BACK */}

              <div className="h-5 w-32 bg-gray-200 rounded mb-7" />

              {/* HEADER */}

              <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 mb-6">

                <div className="flex justify-between gap-5">

                  <div className="flex gap-4">

                    <div className="w-14 h-14 bg-gray-200 rounded-2xl" />

                    <div>

                      <div className="h-8 w-72 bg-gray-200 rounded" />

                      <div className="h-4 w-40 bg-gray-200 rounded mt-3" />

                    </div>

                  </div>

                  <div className="h-8 w-24 bg-gray-200 rounded-full" />

                </div>

              </div>

              {/* CONTENT */}

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                <div className="space-y-6">

                  <SkeletonCard />

                  <SkeletonCard />

                </div>

                <div className="space-y-6">

                  <SkeletonCard />

                  <SkeletonCard />

                  <SkeletonCard />

                </div>

              </div>

            </div>

          </div>

        </div>

      </PortalLayout>
    );
  }

  // =========================================================
  // NO JOB
  // =========================================================

  if (!job) {
    return null;
  }

  // =========================================================
  // MAIN UI
  // =========================================================

  return (
    <PortalLayout>

      <div className="min-h-full px-4 py-6 md:px-6 lg:px-8">

        <div className="w-full max-w-[1400px] mx-auto">

          {/* =================================================
              BACK + EDIT
          ================================================= */}

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">

            <button
              onClick={() =>
                navigate("/organization/jobs")
              }
              className="
                inline-flex
                items-center
                gap-2
                text-sm
                font-semibold
                text-gray-600
                hover:text-[#0F766E]
                transition
                w-fit
              "
            >
              <ArrowLeft size={18} />

              Back to Jobs
            </button>

            <button
              onClick={() =>
                navigate(
                  `/organization/jobs/edit/${id}`
                )
              }
              className="
                inline-flex
                items-center
                justify-center
                gap-2
                px-5
                py-2.5
                rounded-xl
                bg-[#172033]
                hover:bg-[#0F766E]
                text-white
                font-semibold
                shadow-sm
                hover:shadow-md
                transition-all
                duration-200
              "
            >
              <Edit3 size={17} />

              Edit Job
            </button>

          </div>

          {/* =================================================
              JOB HEADER
          ================================================= */}

          <section className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden mb-6">

            {/* TOP ACCENT */}

            <div
              className={`h-1.5 ${
                job.status?.toLowerCase() ===
                "published"
                  ? "bg-emerald-500"
                  : job.status?.toLowerCase() ===
                    "closed"
                  ? "bg-red-500"
                  : "bg-amber-400"
              }`}
            />

            <div className="p-6 md:p-8">

              <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">

                {/* LEFT */}

                <div className="flex items-start gap-4 min-w-0">

                  <div className="w-14 h-14 md:w-16 md:h-16 rounded-2xl bg-[#E7F4F1] flex items-center justify-center flex-shrink-0">

                    <Briefcase
                      size={28}
                      className="text-[#0F766E]"
                    />

                  </div>

                  <div className="min-w-0">

                    <div className="flex flex-wrap items-center gap-3">

                      <h1 className="text-2xl md:text-3xl font-bold text-[#172033] break-words">

                        {job.title ||
                          "Untitled Job"}

                      </h1>

                      <span
                        className={`
                          inline-flex
                          items-center
                          gap-1.5
                          px-3
                          py-1.5
                          rounded-full
                          text-xs
                          md:text-sm
                          font-semibold
                          border
                          ${getStatusColor(
                            job.status
                          )}
                        `}
                      >
                        {getStatusIcon(
                          job.status
                        )}

                        {job.status ||
                          "Draft"}
                      </span>

                    </div>

                    <div className="flex items-center gap-2 mt-3">

                      <Building2
                        size={17}
                        className="text-gray-400"
                      />

                      <span className="text-gray-600 font-medium">

                        {job.department ||
                          "General"}

                      </span>

                    </div>

                  </div>

                </div>

                {/* RIGHT INFO */}

                <div className="flex flex-wrap gap-2">

                  <MiniInfo
                    icon={MapPin}
                    text={
                      job.location ||
                      "Location not specified"
                    }
                  />

                  <MiniInfo
                    icon={User}
                    text={
                      job.employment_type ||
                      "Employment type not specified"
                    }
                  />

                </div>

              </div>

            </div>

          </section>

          {/* =================================================
              MAIN GRID
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* =================================================
                LEFT COLUMN
            ================================================= */}

            <div className="space-y-6">

              {/* =================================================
                  BASIC INFORMATION
              ================================================= */}

              <InfoCard
                title="Basic Information"
                icon={Briefcase}
              >

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

                  <DetailItem
                    icon={MapPin}
                    label="Location"
                    value={
                      job.location ||
                      "Not specified"
                    }
                  />

                  <DetailItem
                    icon={User}
                    label="Employment Type"
                    value={
                      job.employment_type ||
                      "Not specified"
                    }
                  />

                  <DetailItem
                    icon={Calendar}
                    label="Experience Required"
                    value={
                      job.experience_required ||
                      "Not specified"
                    }
                  />

                  <DetailItem
                    icon={IndianRupee}
                    label="Salary"
                    value={
                      job.salary ||
                      "Not specified"
                    }
                  />

                </div>

              </InfoCard>

              {/* =================================================
                  TIMELINE
              ================================================= */}

              <InfoCard
                title="Job Timeline"
                icon={Clock}
              >

                <div className="space-y-5">

                  <TimelineItem
                    icon={CheckCircle}
                    title="Job Created"
                    value={formatDate(
                      job.created_at
                    )}
                  />

                  <TimelineItem
                    icon={Clock}
                    title="Last Updated"
                    value={formatDate(
                      job.updated_at
                    )}
                  />

                </div>

              </InfoCard>

              {/* =================================================
                  SKILLS
              ================================================= */}

              <InfoCard
                title="Required Skills"
                icon={Tag}
              >

                {job.skills &&
                job.skills.length > 0 ? (

                  <div className="flex flex-wrap gap-2">

                    {job.skills.map(
                      (skill, index) => (

                        <span
                          key={index}
                          className="
                            px-3
                            py-1.5
                            rounded-xl
                            bg-[#EAF5F2]
                            text-[#0F766E]
                            border
                            border-[#D2ECE6]
                            text-sm
                            font-semibold
                          "
                        >
                          {skill}
                        </span>

                      )
                    )}

                  </div>

                ) : (

                  <EmptyText text="No skills listed." />

                )}

              </InfoCard>

            </div>

            {/* =================================================
                RIGHT COLUMN
            ================================================= */}

            <div className="space-y-6">

              {/* =================================================
                  DESCRIPTION
              ================================================= */}

              <InfoCard
                title="Job Description"
                icon={FileText}
              >

                <div className="text-gray-700 leading-7 whitespace-pre-wrap break-words">

                  {job.description ||
                    "No description provided."}

                </div>

              </InfoCard>

              {/* =================================================
                  REQUIREMENTS
              ================================================= */}

              <InfoCard
                title="Requirements"
                icon={List}
              >

                {job.requirements &&
                job.requirements.length > 0 ? (

                  <ul className="space-y-3">

                    {job.requirements.map(
                      (requirement, index) => (

                        <li
                          key={index}
                          className="flex items-start gap-3 text-gray-700"
                        >

                          <span className="
                            mt-2
                            w-2
                            h-2
                            rounded-full
                            bg-[#0F766E]
                            flex-shrink-0
                          " />

                          <span className="leading-6">

                            {requirement}

                          </span>

                        </li>

                      )
                    )}

                  </ul>

                ) : (

                  <EmptyText text="No requirements listed." />

                )}

              </InfoCard>

              {/* =================================================
                  AI INFO
              ================================================= */}

              {job.status?.toLowerCase() ===
                "published" && (

                <div className="
                  rounded-3xl
                  border
                  border-purple-100
                  bg-gradient-to-r
                  from-purple-50
                  to-blue-50
                  p-5
                  md:p-6
                ">

                  <div className="flex items-start gap-4">

                    <div className="
                      w-11
                      h-11
                      rounded-xl
                      bg-white
                      shadow-sm
                      flex
                      items-center
                      justify-center
                      flex-shrink-0
                    ">

                      <Sparkles
                        size={21}
                        className="text-purple-600"
                      />

                    </div>

                    <div className="min-w-0">

                      <h3 className="font-bold text-[#172033]">

                        AI Candidate Ranking

                      </h3>

                      <p className="text-sm text-gray-500 mt-1 leading-5">

                        This published job is eligible
                        for AI-powered candidate ranking
                        and evaluation.

                      </p>

                      <button
                        onClick={() =>
                          navigate(
                            `/organization/jobs/${id}/ranking`
                          )
                        }
                        className="
                          mt-4
                          text-sm
                          font-semibold
                          text-purple-600
                          hover:text-purple-800
                          transition
                        "
                      >

                        View Candidate Ranking →

                      </button>

                    </div>

                  </div>

                </div>

              )}

            </div>

          </div>

          {/* =================================================
              BOTTOM ACTION
          ================================================= */}

          <div className="
            mt-6
            bg-white
            border
            border-gray-200
            rounded-2xl
            p-4
            md:p-5
            shadow-sm
          ">

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">

              <div>

                <p className="font-semibold text-[#172033]">

                  Manage this job posting

                </p>

                <p className="text-sm text-gray-500 mt-1">

                  Update the job details whenever required.

                </p>

              </div>

              <div className="flex flex-col sm:flex-row gap-3">

                <button
                  onClick={() =>
                    navigate(
                      "/organization/jobs"
                    )
                  }
                  className="
                    px-5
                    py-2.5
                    rounded-xl
                    bg-gray-100
                    hover:bg-gray-200
                    text-[#172033]
                    font-semibold
                    transition
                  "
                >

                  Back to Jobs

                </button>

                <button
                  onClick={() =>
                    navigate(
                      `/organization/jobs/edit/${id}`
                    )
                  }
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-5
                    py-2.5
                    rounded-xl
                    bg-[#172033]
                    hover:bg-[#0F766E]
                    text-white
                    font-semibold
                    transition
                  "
                >

                  <Pencil size={16} />

                  Edit Job

                </button>

              </div>

            </div>

          </div>

        </div>

      </div>

    </PortalLayout>
  );
}


// =========================================================
// INFO CARD
// =========================================================

function InfoCard({
  title,
  icon: Icon,
  children,
}) {
  return (
    <section className="
      bg-white
      rounded-3xl
      border
      border-gray-200
      shadow-sm
      overflow-hidden
    ">

      <div className="
        px-5
        md:px-6
        py-4
        border-b
        border-gray-100
        bg-[#FCFCFA]
      ">

        <div className="flex items-center gap-3">

          <div className="
            w-10
            h-10
            rounded-xl
            bg-[#E7F4F1]
            flex
            items-center
            justify-center
          ">

            <Icon
              size={19}
              className="text-[#0F766E]"
            />

          </div>

          <h2 className="text-lg font-bold text-[#172033]">

            {title}

          </h2>

        </div>

      </div>

      <div className="p-5 md:p-6">

        {children}

      </div>

    </section>
  );
}


// =========================================================
// DETAIL ITEM
// =========================================================

function DetailItem({
  icon: Icon,
  label,
  value,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="
        w-9
        h-9
        rounded-lg
        bg-[#F1F5F5]
        flex
        items-center
        justify-center
        flex-shrink-0
      ">

        <Icon
          size={17}
          className="text-[#0F766E]"
        />

      </div>

      <div className="min-w-0">

        <p className="text-xs font-medium uppercase tracking-wide text-gray-400">

          {label}

        </p>

        <p className="text-sm md:text-base font-semibold text-[#172033] mt-1 break-words">

          {value}

        </p>

      </div>

    </div>
  );
}


// =========================================================
// TIMELINE ITEM
// =========================================================

function TimelineItem({
  icon: Icon,
  title,
  value,
}) {
  return (
    <div className="flex items-start gap-3">

      <div className="
        w-10
        h-10
        rounded-xl
        bg-[#E7F4F1]
        flex
        items-center
        justify-center
        flex-shrink-0
      ">

        <Icon
          size={18}
          className="text-[#0F766E]"
        />

      </div>

      <div>

        <p className="text-sm font-semibold text-[#172033]">

          {title}

        </p>

        <p className="text-sm text-gray-500 mt-1">

          {value}

        </p>

      </div>

    </div>
  );
}


// =========================================================
// MINI INFO
// =========================================================

function MiniInfo({
  icon: Icon,
  text,
}) {
  return (
    <div className="
      flex
      items-center
      gap-2
      px-3
      py-2
      rounded-xl
      bg-gray-50
      border
      border-gray-100
      text-sm
      text-gray-600
    ">

      <Icon
        size={15}
        className="text-[#0F766E]"
      />

      <span className="truncate max-w-[220px]">

        {text}

      </span>

    </div>
  );
}


// =========================================================
// EMPTY TEXT
// =========================================================

function EmptyText({ text }) {
  return (
    <p className="text-sm text-gray-500">

      {text}

    </p>
  );
}


// =========================================================
// SKELETON CARD
// =========================================================

function SkeletonCard() {
  return (
    <div className="bg-white rounded-3xl border border-gray-200 p-6">

      <div className="h-6 w-48 bg-gray-200 rounded mb-6" />

      <div className="space-y-4">

        <div className="h-4 w-full bg-gray-200 rounded" />

        <div className="h-4 w-5/6 bg-gray-200 rounded" />

        <div className="h-4 w-4/6 bg-gray-200 rounded" />

        <div className="h-4 w-full bg-gray-200 rounded" />

      </div>

    </div>
  );
}


export default ViewJob;