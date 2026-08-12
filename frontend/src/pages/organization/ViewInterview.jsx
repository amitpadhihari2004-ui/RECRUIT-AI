import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  RefreshCw,
  User,
  Mail,
  Briefcase,
  Building2,
  Calendar,
  Clock,
  FileText,
  Award,
  CheckCircle,
  XCircle,
  Loader2,
  Video,
  ShieldCheck,
  RotateCcw,
  Target,
  Hash,
  Brain,
} from "lucide-react";

import OrganizationSidebar from "../../components/organization/OrganizationSidebar";
import OrganizationNavbar from "../../components/organization/OrganizationNavbar";

import { getInterview } from "../../api/interviewApi";


// =========================================================
// VIEW INTERVIEW
// =========================================================

export default function ViewInterview() {

  const { interviewId } = useParams();
  const navigate = useNavigate();

  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");


  // =======================================================
  // LOAD INTERVIEW
  // =======================================================

  useEffect(() => {

    if (!interviewId) {
      setError("Interview ID is missing.");
      setLoading(false);
      return;
    }

    loadInterview();

  }, [interviewId]);


  const loadInterview = async () => {

    try {

      setLoading(true);
      setError("");

      const response =
        await getInterview(interviewId);

      console.log(
        "Interview response:",
        response
      );

      const data =
        response?.interview ||
        response?.data ||
        response;

      if (!data) {
        throw new Error("Interview not found.");
      }

      setInterview(data);

    } catch (err) {

      console.error(
        "Load interview error:",
        err
      );

      const message =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to load interview.";

      setError(message);

    } finally {

      setLoading(false);

    }

  };


  // =======================================================
  // STATUS STYLE
  // =======================================================

  const getStatusStyle = (status) => {

    switch (
      String(status || "").toLowerCase()
    ) {

      case "scheduled":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "confirmed":
        return "bg-cyan-50 text-cyan-700 border-cyan-200";

      case "in progress":
        return "bg-amber-50 text-amber-700 border-amber-200";

      case "completed":
        return "bg-emerald-50 text-emerald-700 border-emerald-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      case "rescheduled":
        return "bg-purple-50 text-purple-700 border-purple-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }

  };


  // =======================================================
  // STATUS ICON
  // =======================================================

  const getStatusIcon = (status) => {

    switch (
      String(status || "").toLowerCase()
    ) {

      case "scheduled":
        return <Calendar size={16} />;

      case "confirmed":
        return <CheckCircle size={16} />;

      case "in progress":
        return <Clock size={16} />;

      case "completed":
        return <Award size={16} />;

      case "cancelled":
        return <XCircle size={16} />;

      case "rescheduled":
        return <RefreshCw size={16} />;

      default:
        return <Clock size={16} />;
    }

  };


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (

      <div className="min-h-screen bg-slate-100">

        {/* FIXED SIDEBAR SPACE */}

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

        <div className="ml-[302px] min-h-screen">

          <OrganizationNavbar />

          <main className="
            min-h-[calc(100vh-80px)]
            flex
            items-center
            justify-center
            p-6
          ">

            <div className="
              bg-white
              rounded-3xl
              border
              border-gray-100
              shadow-sm
              px-10
              py-12
              text-center
            ">

              <div className="
                w-16
                h-16
                rounded-2xl
                bg-blue-50
                flex
                items-center
                justify-center
                mx-auto
              ">

                <Loader2
                  size={32}
                  className="
                    text-blue-600
                    animate-spin
                  "
                />

              </div>

              <h2 className="
                text-lg
                font-bold
                text-gray-900
                mt-5
              ">
                Loading Interview
              </h2>

              <p className="
                text-sm
                text-gray-500
                mt-2
              ">
                Please wait while we load
                the interview details.
              </p>

            </div>

          </main>

        </div>

      </div>

    );
  }


  // =======================================================
  // ERROR
  // =======================================================

  if (error) {

    return (

      <div className="min-h-screen bg-slate-100">

        {/* SIDEBAR */}

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


        {/* RIGHT CONTENT */}

        <div className="ml-[302px] min-h-screen">

          <OrganizationNavbar />

          <main className="
            min-h-[calc(100vh-80px)]
            flex
            items-center
            justify-center
            p-6
          ">

            <div className="
              max-w-lg
              w-full
              bg-white
              border
              border-gray-200
              rounded-3xl
              shadow-sm
              p-8
              text-center
            ">

              <div className="
                w-16
                h-16
                rounded-2xl
                bg-red-50
                flex
                items-center
                justify-center
                mx-auto
              ">

                <XCircle
                  size={32}
                  className="text-red-500"
                />

              </div>


              <h1 className="
                text-2xl
                font-bold
                text-gray-900
                mt-5
              ">
                Unable to Load Interview
              </h1>


              <p className="
                text-red-600
                text-sm
                mt-3
              ">
                {error}
              </p>


              <div className="
                flex
                flex-col
                sm:flex-row
                gap-3
                mt-7
              ">

                <button
                  onClick={() => navigate(-1)}
                  className="
                    flex-1
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-5
                    py-3
                    rounded-xl
                    bg-gray-100
                    hover:bg-gray-200
                    text-gray-700
                    font-semibold
                    transition
                  "
                >

                  <ArrowLeft size={17} />

                  Go Back

                </button>


                <button
                  onClick={loadInterview}
                  className="
                    flex-1
                    flex
                    items-center
                    justify-center
                    gap-2
                    px-5
                    py-3
                    rounded-xl
                    bg-blue-600
                    hover:bg-blue-700
                    text-white
                    font-semibold
                    transition
                  "
                >

                  <RefreshCw size={17} />

                  Retry

                </button>

              </div>

            </div>

          </main>

        </div>

      </div>

    );
  }


  // =======================================================
  // SAFE DATA
  // =======================================================

  const candidateName =
    interview?.student_name ||
    interview?.candidate_name ||
    interview?.student?.name ||
    interview?.candidate?.name ||
    "Candidate";


  const candidateEmail =
    interview?.student_email ||
    interview?.candidate_email ||
    interview?.student?.email ||
    interview?.candidate?.email ||
    "-";


  const jobTitle =
    interview?.job_title ||
    interview?.job_name ||
    interview?.job?.title ||
    interview?.job_id ||
    "-";


  const status =
    interview?.status ||
    "Unknown";


  const score =
    interview?.overall_score ??
    interview?.score ??
    interview?.final_score;


  const scheduledDate =
    interview?.scheduled_date ||
    "-";


  const scheduledTime =
    interview?.scheduled_time ||
    "-";


  const duration =
    interview?.duration ??
    "-";


  const questionCount =
    interview?.question_count ??
    "-";


  // =======================================================
  // MAIN PAGE
  // =======================================================

  return (

    <div className="
      min-h-screen
      bg-slate-100
    ">


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
          RIGHT SIDE
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
            PAGE
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

                <button
                  onClick={() =>
                    navigate(
                      "/organization/interviews"
                    )
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    text-blue-600
                    hover:text-blue-700
                    font-medium
                    mb-4
                    transition
                  "
                >

                  <ArrowLeft size={18} />

                  Back to Interviews

                </button>


                <div className="
                  flex
                  items-center
                  gap-4
                ">

                  <div className="
                    w-12
                    h-12
                    rounded-xl
                    bg-purple-100
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                  ">

                    <Brain
                      size={25}
                      className="text-purple-600"
                    />

                  </div>


                  <div>

                    <h1 className="
                      text-2xl
                      md:text-3xl
                      font-bold
                      text-gray-900
                    ">

                      Interview Details

                    </h1>


                    <p className="
                      text-gray-500
                      mt-1
                    ">

                      Review candidate interview
                      information and results.

                    </p>

                  </div>

                </div>

              </div>


              {/* STATUS */}

              <span
                className={`
                  inline-flex
                  items-center
                  gap-2
                  w-fit
                  px-4
                  py-2.5
                  rounded-full
                  border
                  text-sm
                  font-semibold
                  ${getStatusStyle(status)}
                `}
              >

                {getStatusIcon(status)}

                {status}

              </span>

            </div>


            {/* =================================================
                CANDIDATE
            ================================================= */}

            <section className="
              bg-white
              border
              border-gray-200
              rounded-2xl
              shadow-sm
              p-6
              mb-6
            ">

              <div className="
                flex
                flex-col
                lg:flex-row
                lg:items-center
                gap-5
              ">


                {/* AVATAR */}

                <div className="
                  w-20
                  h-20
                  rounded-2xl
                  bg-gradient-to-br
                  from-blue-500
                  to-indigo-600
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                ">

                  <User
                    size={38}
                    className="text-white"
                  />

                </div>


                {/* CANDIDATE DETAILS */}

                <div className="
                  flex-1
                  min-w-0
                ">

                  <p className="
                    text-xs
                    uppercase
                    tracking-wide
                    font-bold
                    text-blue-600
                  ">

                    Candidate

                  </p>


                  <h2 className="
                    text-2xl
                    font-bold
                    text-gray-900
                    mt-1
                  ">

                    {candidateName}

                  </h2>


                  <div className="
                    flex
                    flex-wrap
                    gap-x-5
                    gap-y-2
                    mt-3
                    text-sm
                    text-gray-500
                  ">

                    <div className="
                      flex
                      items-center
                      gap-2
                    ">

                      <Mail size={15} />

                      <span className="break-all">
                        {candidateEmail}
                      </span>

                    </div>


                    <div className="
                      flex
                      items-center
                      gap-2
                    ">

                      <Briefcase size={15} />

                      <span>
                        {jobTitle}
                      </span>

                    </div>


                    {interview?.organization_name && (

                      <div className="
                        flex
                        items-center
                        gap-2
                      ">

                        <Building2 size={15} />

                        <span>
                          {interview.organization_name}
                        </span>

                      </div>

                    )}

                  </div>

                </div>


                {/* INTERVIEW ID */}

                <div className="
                  lg:w-56
                  bg-gray-50
                  border
                  border-gray-100
                  rounded-xl
                  px-4
                  py-3
                  flex-shrink-0
                ">

                  <p className="
                    text-[11px]
                    uppercase
                    tracking-wide
                    font-bold
                    text-gray-400
                  ">

                    Interview ID

                  </p>


                  <p className="
                    text-xs
                    font-semibold
                    text-gray-700
                    mt-1
                    break-all
                  ">

                    {interviewId}

                  </p>

                </div>

              </div>

            </section>


            {/* =================================================
                SCORE
            ================================================= */}

            <section className="
              bg-white
              border
              border-gray-200
              rounded-2xl
              shadow-sm
              p-6
              mb-6
            ">

              <div className="
                flex
                flex-col
                md:flex-row
                md:items-center
                md:justify-between
                gap-6
              ">


                <div>

                  <div className="
                    flex
                    items-center
                    gap-3
                  ">

                    <div className="
                      w-11
                      h-11
                      rounded-xl
                      bg-emerald-50
                      flex
                      items-center
                      justify-center
                    ">

                      <Award
                        size={21}
                        className="text-emerald-600"
                      />

                    </div>


                    <div>

                      <p className="
                        text-sm
                        text-gray-500
                        font-medium
                      ">

                        Overall Interview Score

                      </p>


                      <p className="
                        text-xs
                        text-gray-400
                      ">

                        Final candidate performance

                      </p>

                    </div>

                  </div>


                  <p className="
                    text-4xl
                    md:text-5xl
                    font-bold
                    text-emerald-600
                    mt-5
                  ">

                    {score !== undefined &&
                    score !== null
                      ? score
                      : "—"}

                    {score !== undefined &&
                    score !== null && (

                      <span className="
                        text-xl
                        text-gray-400
                      ">
                        /100
                      </span>

                    )}

                  </p>

                </div>


                <div className="
                  w-full
                  md:w-72
                ">

                  <div className="
                    flex
                    justify-between
                    text-xs
                    text-gray-400
                    mb-2
                  ">

                    <span>
                      Score
                    </span>

                    <span>
                      {score !== undefined &&
                      score !== null
                        ? `${score}%`
                        : "0%"}
                    </span>

                  </div>


                  <div className="
                    h-3
                    bg-gray-100
                    rounded-full
                    overflow-hidden
                  ">

                    <div
                      className="
                        h-full
                        bg-emerald-500
                        rounded-full
                        transition-all
                      "
                      style={{
                        width: `${Math.min(
                          Math.max(
                            Number(score) || 0,
                            0
                          ),
                          100
                        )}%`,
                      }}
                    />

                  </div>

                </div>

              </div>

            </section>


            {/* =================================================
                INFORMATION
            ================================================= */}

            <div className="
              grid
              grid-cols-1
              xl:grid-cols-2
              gap-6
            ">


              {/* INTERVIEW INFORMATION */}

              <section className="
                bg-white
                border
                border-gray-200
                rounded-2xl
                shadow-sm
                p-6
              ">

                <SectionTitle
                  icon={
                    <FileText
                      size={19}
                      className="text-blue-600"
                    />
                  }
                  title="Interview Information"
                />


                <div className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-4
                ">

                  <Info
                    label="Interview ID"
                    value={interviewId}
                    icon={<Hash size={15} />}
                  />

                  <Info
                    label="Application ID"
                    value={
                      interview?.application_id || "-"
                    }
                    icon={<FileText size={15} />}
                  />

                  <Info
                    label="Student ID"
                    value={
                      interview?.student_id || "-"
                    }
                    icon={<User size={15} />}
                  />

                  <Info
                    label="Job ID"
                    value={
                      interview?.job_id || "-"
                    }
                    icon={<Briefcase size={15} />}
                  />

                  <Info
                    label="Resume ID"
                    value={
                      interview?.resume_id || "-"
                    }
                    icon={<FileText size={15} />}
                  />

                  <Info
                    label="Interview Type"
                    value={
                      interview?.interview_type || "-"
                    }
                    icon={<Brain size={15} />}
                  />

                  <Info
                    label="Round Name"
                    value={
                      interview?.round_name || "-"
                    }
                    icon={<Target size={15} />}
                  />

                  <Info
                    label="Interview Mode"
                    value={
                      interview?.interview_mode || "AI"
                    }
                    icon={<Video size={15} />}
                  />

                </div>

              </section>


              {/* SCHEDULE */}

              <section className="
                bg-white
                border
                border-gray-200
                rounded-2xl
                shadow-sm
                p-6
              ">

                <SectionTitle
                  icon={
                    <Calendar
                      size={19}
                      className="text-purple-600"
                    />
                  }
                  title="Schedule & Settings"
                />


                <div className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  gap-4
                ">

                  <Info
                    label="Interview Date"
                    value={scheduledDate}
                    icon={<Calendar size={15} />}
                  />

                  <Info
                    label="Interview Time"
                    value={scheduledTime}
                    icon={<Clock size={15} />}
                  />

                  <Info
                    label="Duration"
                    value={
                      duration !== "-"
                        ? `${duration} minutes`
                        : "-"
                    }
                    icon={<Clock size={15} />}
                  />

                  <Info
                    label="Question Count"
                    value={questionCount}
                    icon={<FileText size={15} />}
                  />

                  <Info
                    label="Difficulty"
                    value={
                      interview?.difficulty || "-"
                    }
                    icon={<Target size={15} />}
                  />

                  <Info
                    label="Proctoring"
                    value={
                      interview?.proctoring_enabled
                        ? "Enabled"
                        : "Disabled"
                    }
                    icon={<ShieldCheck size={15} />}
                  />

                  <Info
                    label="Retry"
                    value={
                      interview?.allow_retry
                        ? "Allowed"
                        : "Not Allowed"
                    }
                    icon={<RotateCcw size={15} />}
                  />

                  <Info
                    label="Meeting Link"
                    value={
                      interview?.meeting_link ||
                      "Not provided"
                    }
                    icon={<Video size={15} />}
                  />

                </div>

              </section>

            </div>


            {/* =================================================
                NOTES
            ================================================= */}

            <section className="
              bg-white
              border
              border-gray-200
              rounded-2xl
              shadow-sm
              p-6
              mt-6
            ">

              <SectionTitle
                icon={
                  <FileText
                    size={19}
                    className="text-blue-600"
                  />
                }
                title="Interview Notes"
              />


              <div className="
                grid
                grid-cols-1
                md:grid-cols-2
                gap-5
              ">

                <NoteCard
                  title="Candidate Notes"
                  value={
                    interview?.candidate_notes ||
                    "No candidate notes."
                  }
                />


                <NoteCard
                  title="Interviewer Notes"
                  value={
                    interview?.interviewer_notes ||
                    "No interviewer notes."
                  }
                />

              </div>

            </section>


            {/* =================================================
                ACTIONS
            ================================================= */}

            <div className="
              flex
              flex-col
              sm:flex-row
              gap-3
              mt-6
              pb-8
            ">

              <button
                onClick={() =>
                  navigate(
                    "/organization/interviews"
                  )
                }
                className="
                  flex-1
                  flex
                  items-center
                  justify-center
                  gap-2
                  py-3
                  rounded-xl
                  bg-white
                  border
                  border-gray-200
                  hover:bg-gray-50
                  text-gray-700
                  font-semibold
                  transition
                "
              >

                <ArrowLeft size={17} />

                Back to Interviews

              </button>


              <button
                onClick={loadInterview}
                className="
                  flex-1
                  flex
                  items-center
                  justify-center
                  gap-2
                  py-3
                  rounded-xl
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  font-semibold
                  transition
                "
              >

                <RefreshCw size={17} />

                Refresh Interview

              </button>

            </div>

          </div>

        </main>

      </div>

    </div>

  );
}


// =========================================================
// SECTION TITLE
// =========================================================

function SectionTitle({
  icon,
  title,
}) {

  return (

    <div className="
      flex
      items-center
      gap-3
      mb-6
    ">

      <div className="
        w-10
        h-10
        rounded-xl
        bg-gray-50
        border
        border-gray-100
        flex
        items-center
        justify-center
      ">

        {icon}

      </div>


      <h2 className="
        text-lg
        font-bold
        text-gray-900
      ">

        {title}

      </h2>

    </div>

  );

}


// =========================================================
// INFO
// =========================================================

function Info({
  label,
  value,
  icon,
}) {

  return (

    <div className="
      rounded-xl
      bg-gray-50
      border
      border-gray-100
      p-4
      min-w-0
    ">

      <div className="
        flex
        items-center
        gap-2
        text-gray-400
      ">

        {icon}

        <p className="
          text-[11px]
          font-semibold
          uppercase
          tracking-wide
        ">

          {label}

        </p>

      </div>


      <p className="
        text-sm
        font-semibold
        text-gray-800
        mt-2
        break-all
      ">

        {value}

      </p>

    </div>

  );

}


// =========================================================
// NOTE CARD
// =========================================================

function NoteCard({
  title,
  value,
}) {

  return (

    <div>

      <p className="
        text-sm
        font-semibold
        text-gray-700
        mb-2
      ">

        {title}

      </p>


      <div className="
        min-h-28
        bg-gray-50
        border
        border-gray-100
        rounded-xl
        p-4
        text-sm
        text-gray-600
        whitespace-pre-wrap
      ">

        {value}

      </div>

    </div>

  );

}