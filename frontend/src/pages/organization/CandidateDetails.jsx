import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  ArrowLeft,
  User,
  Mail,
  Briefcase,
  Award,
  CheckCircle,
  XCircle,
  Clock,
  FileText,
  Sparkles,
  MessageSquare,
  Calendar,
  Building2,
  Loader2,
  Target,
  TrendingUp,
  CalendarPlus,
} from "lucide-react";

import OrganizationSidebar from "../../components/organization/OrganizationSidebar";
import OrganizationNavbar from "../../components/organization/OrganizationNavbar";

import {
  getApplication,
  updateApplicationStatus,
} from "../../api/applicationApi";


// =========================================================
// COLORS
// =========================================================
//
// Background  : #F7F6F2
// Cards       : #FFFFFF
// Headings    : #172033
// Buttons     : #172033
// Accent      : #0F766E
// Success     : #16803C
// Warning     : #B7791F
// Error       : #C53030
//
// =========================================================


// =========================================================
// ORGANIZATION LAYOUT
// =========================================================

function OrganizationLayout({ children }) {
  return (
    <div
      className="
        flex
        h-screen
        w-full
        overflow-hidden
      "
      style={{
        backgroundColor: "#F7F6F2",
      }}
    >

      {/* =================================================
          LEFT SIDEBAR
      ================================================= */}

      <aside
        className="
          w-[280px]
          min-w-[280px]
          h-screen
          flex-shrink-0
          overflow-hidden
        "
      >
        <OrganizationSidebar />
      </aside>


      {/* =================================================
          RIGHT APPLICATION AREA
      ================================================= */}

      <div
        className="
          flex-1
          min-w-0
          h-screen
          flex
          flex-col
          overflow-hidden
        "
      >

        {/* =================================================
            NAVBAR
        ================================================= */}

        <div
          className="
            w-full
            flex-shrink-0
          "
        >
          <OrganizationNavbar />
        </div>


        {/* =================================================
            PAGE CONTENT
        ================================================= */}

        <main
          className="
            flex-1
            min-w-0
            w-full
            overflow-y-auto
            overflow-x-hidden
          "
          style={{
            backgroundColor: "#F7F6F2",
          }}
        >
          {children}
        </main>

      </div>

    </div>
  );
}


// =========================================================
// CANDIDATE DETAILS
// =========================================================

function CandidateDetails() {

  const { applicationId } = useParams();

  const navigate = useNavigate();


  // =======================================================
  // STATE
  // =======================================================

  const [application, setApplication] =
    useState(null);

  const [loading, setLoading] =
    useState(true);

  const [updating, setUpdating] =
    useState(false);

  const [feedback, setFeedback] =
    useState("");


  // =======================================================
  // LOAD APPLICATION
  // =======================================================

  useEffect(() => {

    if (!applicationId) {

      toast.error(
        "Application ID is missing."
      );

      navigate(
        "/organization/applications"
      );

      return;
    }

    loadApplication();

  }, [applicationId]);


  const loadApplication = async () => {

    try {

      setLoading(true);


      const response =
        await getApplication(
          applicationId
        );


      console.log(
        "Application API Response:",
        response
      );


      const applicationData =
        response?.application ||
        response?.data ||
        response;


      if (!applicationData) {

        toast.error(
          "Application data not found."
        );

        setApplication(null);

        return;
      }


      setApplication(
        applicationData
      );


      setFeedback(
        applicationData?.recruiter_feedback ||
        ""
      );


    } catch (error) {

      console.error(
        "Candidate Details Error:",
        error
      );


      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to load application."
      );


      setApplication(null);

    } finally {

      setLoading(false);

    }

  };


  // =======================================================
  // SAFE DATA
  // =======================================================

  const applicationStatus =
    application?.application_status ||
    "Pending";


  const resumeScore =
    Number(
      application?.resume_score
    ) || 0;


  const jdMatchScore =
    Number(
      application?.jd_match_score
    ) || 0;


  const matchedSkills =
    Array.isArray(
      application?.matched_skills
    )
      ? application.matched_skills
      : [];


  const missingSkills =
    Array.isArray(
      application?.missing_skills
    )
      ? application.missing_skills
      : [];


  // =======================================================
  // UPDATE APPLICATION STATUS
  // =======================================================

  const updateStatus = async (
    status
  ) => {

    if (!applicationId) {

      toast.error(
        "Application ID is missing."
      );

      return;
    }


    try {

      setUpdating(true);


      await updateApplicationStatus(
        applicationId,
        {
          application_status:
            status,

          recruiter_feedback:
            feedback,
        }
      );


      toast.success(
        `Application ${status.toLowerCase()} successfully.`
      );


      setApplication(
        (previous) => ({

          ...previous,

          application_status:
            status,

          recruiter_feedback:
            feedback,

          updated_at:
            new Date().toISOString(),

        })
      );


    } catch (error) {

      console.error(
        "Update Application Status Error:",
        error
      );


      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to update application status."
      );


    } finally {

      setUpdating(false);

    }

  };


  // =======================================================
  // CREATE AI INTERVIEW
  // =======================================================

  const createInterview = () => {

    if (!applicationId) {

      toast.error(
        "Application ID is missing."
      );

      return;
    }


    if (
      applicationStatus !==
      "Shortlisted"
    ) {

      toast.error(
        "Please shortlist the candidate before creating an interview."
      );

      return;
    }


    navigate(
      `/organization/applications/${applicationId}/interview/create`
    );

  };


  // =======================================================
  // STATUS STYLE
  // =======================================================

  const getStatusStyle = (
    status
  ) => {

    switch (status) {

      case "Pending":

        return {
          backgroundColor: "#FFF8E7",
          color: "#B7791F",
          borderColor: "#F2D48A",
        };


      case "Shortlisted":

        return {
          backgroundColor: "#E8F5F3",
          color: "#0F766E",
          borderColor: "#B7DDD8",
        };


      case "Interview":

        return {
          backgroundColor: "#E8F5F3",
          color: "#0F766E",
          borderColor: "#B7DDD8",
        };


      case "Selected":

        return {
          backgroundColor: "#EAF7EF",
          color: "#16803C",
          borderColor: "#B8E0C5",
        };


      case "Rejected":

        return {
          backgroundColor: "#FDECEC",
          color: "#C53030",
          borderColor: "#F2B8B8",
        };


      default:

        return {
          backgroundColor: "#F3F4F6",
          color: "#172033",
          borderColor: "#E5E7EB",
        };

    }

  };


  // =======================================================
  // STATUS ICON
  // =======================================================

  const getStatusIcon = (
    status
  ) => {

    switch (status) {

      case "Pending":

        return (
          <Clock size={17} />
        );


      case "Shortlisted":

        return (
          <CheckCircle size={17} />
        );


      case "Interview":

        return (
          <Calendar size={17} />
        );


      case "Selected":

        return (
          <Award size={17} />
        );


      case "Rejected":

        return (
          <XCircle size={17} />
        );


      default:

        return (
          <Clock size={17} />
        );

    }

  };


  // =======================================================
  // SCORE COLOR
  // =======================================================

  const getScoreColor = (
    score
  ) => {

    if (score >= 80) {

      return "#16803C";

    }

    if (score >= 60) {

      return "#0F766E";

    }

    if (score >= 40) {

      return "#B7791F";

    }

    return "#C53030";

  };


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (

      <OrganizationLayout>

        <div
          className="
            w-full
            min-h-full
            flex
            items-center
            justify-center
            p-6
          "
        >

          <div className="text-center">

            <div
              className="
                w-16
                h-16
                rounded-2xl
                flex
                items-center
                justify-center
                mx-auto
              "
              style={{
                backgroundColor: "#E8F5F3",
              }}
            >

              <Loader2
                className="
                  w-9
                  h-9
                  animate-spin
                "
                style={{
                  color: "#0F766E",
                }}
              />

            </div>


            <p
              className="
                font-semibold
                mt-5
              "
              style={{
                color: "#172033",
              }}
            >
              Loading candidate details...
            </p>


            <p
              className="
                text-sm
                mt-1
              "
              style={{
                color: "#6B7280",
              }}
            >
              Please wait while we load the application.
            </p>

          </div>

        </div>

      </OrganizationLayout>

    );

  }


  // =======================================================
  // APPLICATION NOT FOUND
  // =======================================================

  if (!application) {

    return (

      <OrganizationLayout>

        <div
          className="
            w-full
            min-h-full
            flex
            items-center
            justify-center
            p-6
          "
        >

          <div
            className="
              text-center
              rounded-3xl
              border
              shadow-sm
              p-10
              max-w-md
              w-full
            "
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
            }}
          >

            <div
              className="
                w-16
                h-16
                rounded-2xl
                flex
                items-center
                justify-center
                mx-auto
              "
              style={{
                backgroundColor: "#F3F4F6",
              }}
            >

              <FileText
                className="
                  w-8
                  h-8
                "
                style={{
                  color: "#6B7280",
                }}
              />

            </div>


            <h2
              className="
                text-xl
                font-bold
                mt-5
              "
              style={{
                color: "#172033",
              }}
            >
              Application Not Found
            </h2>


            <p
              className="
                mt-2
              "
              style={{
                color: "#6B7280",
              }}
            >
              The requested application could not be found.
            </p>


            <button
              onClick={() =>
                navigate(
                  "/organization/applications"
                )
              }
              className="
                mt-6
                px-5
                py-3
                text-white
                rounded-xl
                font-semibold
                transition
                hover:opacity-90
              "
              style={{
                backgroundColor: "#172033",
              }}
            >
              Back to Applications
            </button>

          </div>

        </div>

      </OrganizationLayout>

    );

  }


  // =======================================================
  // MAIN UI
  // =======================================================

  return (

    <OrganizationLayout>

      <div
        className="
          w-full
        "
      >

        <div
          className="
            max-w-7xl
            mx-auto
            px-4
            py-6
            md:px-6
            lg:px-8
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

              <button
                onClick={() =>
                  navigate(
                    "/organization/applications"
                  )
                }
                className="
                  flex
                  items-center
                  gap-2
                  font-medium
                  mb-4
                  transition
                  hover:opacity-75
                "
                style={{
                  color: "#0F766E",
                }}
              >

                <ArrowLeft
                  size={18}
                />

                Back to Applications

              </button>


              <div
                className="
                  flex
                  items-start
                  gap-4
                "
              >

                <div
                  className="
                    w-14
                    h-14
                    rounded-2xl
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                  "
                  style={{
                    backgroundColor: "#E8F5F3",
                  }}
                >

                  <User
                    size={28}
                    style={{
                      color: "#0F766E",
                    }}
                  />

                </div>


                <div className="min-w-0">

                  <h1
                    className="
                      text-2xl
                      md:text-3xl
                      font-bold
                    "
                    style={{
                      color: "#172033",
                    }}
                  >
                    Candidate Details
                  </h1>


                  <p
                    className="
                      mt-1
                    "
                    style={{
                      color: "#6B7280",
                    }}
                  >
                    Review candidate profile, resume score and application status.
                  </p>

                </div>

              </div>

            </div>


            {/* STATUS */}

            <div
              className="
                inline-flex
                items-center
                gap-2
                px-4
                py-2.5
                rounded-full
                border
                font-semibold
                self-start
                lg:self-center
              "
              style={getStatusStyle(
                applicationStatus
              )}
            >

              {getStatusIcon(
                applicationStatus
              )}

              {applicationStatus}

            </div>

          </div>


          {/* =================================================
              PROFILE CARD
          ================================================= */}

          <div
            className="
              rounded-3xl
              border
              shadow-sm
              p-6
              md:p-7
              mb-6
            "
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
            }}
          >

            <div
              className="
                flex
                flex-col
                md:flex-row
                md:items-center
                gap-5
              "
            >

              <div
                className="
                  w-20
                  h-20
                  rounded-2xl
                  flex
                  items-center
                  justify-center
                  flex-shrink-0
                "
                style={{
                  backgroundColor: "#0F766E",
                }}
              >

                <User
                  size={38}
                  className="text-white"
                />

              </div>


              <div
                className="
                  flex-1
                  min-w-0
                "
              >

                <h2
                  className="
                    text-2xl
                    font-bold
                  "
                  style={{
                    color: "#172033",
                  }}
                >
                  {application.student_name ||
                    application.candidate_name ||
                    "Unknown Candidate"}
                </h2>


                <div
                  className="
                    flex
                    flex-wrap
                    gap-x-5
                    gap-y-2
                    mt-3
                    text-sm
                  "
                  style={{
                    color: "#6B7280",
                  }}
                >

                  {/* EMAIL */}

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <Mail size={15} />

                    <span className="break-all">
                      {application.student_email ||
                        application.candidate_email ||
                        "N/A"}
                    </span>

                  </div>


                  {/* JOB */}

                  <div
                    className="
                      flex
                      items-center
                      gap-2
                    "
                  >

                    <Briefcase
                      size={15}
                    />

                    <span>
                      {application.job_title ||
                        application.job_name ||
                        "Job"}
                    </span>

                  </div>


                  {/* ORGANIZATION */}

                  {application.organization_name && (

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <Building2
                        size={15}
                      />

                      <span>
                        {application.organization_name}
                      </span>

                    </div>

                  )}

                </div>

              </div>


              {/* APPLICATION ID */}

              <div
                className="
                  rounded-2xl
                  border
                  px-4
                  py-3
                  md:min-w-[210px]
                "
                style={{
                  backgroundColor: "#F7F6F2",
                  borderColor: "#E5E7EB",
                }}
              >

                <p
                  className="
                    text-[11px]
                    uppercase
                    tracking-wide
                    font-bold
                  "
                  style={{
                    color: "#9CA3AF",
                  }}
                >
                  Application ID
                </p>


                <p
                  className="
                    text-xs
                    font-semibold
                    mt-1
                    break-all
                  "
                  style={{
                    color: "#172033",
                  }}
                >
                  {applicationId}
                </p>

              </div>

            </div>

          </div>


          {/* =================================================
              SCORE CARDS
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              md:grid-cols-2
              gap-5
              mb-6
            "
          >

            {/* RESUME SCORE */}

            <div
              className="
                rounded-2xl
                border
                shadow-sm
                p-6
              "
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E5E7EB",
              }}
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      font-medium
                    "
                    style={{
                      color: "#6B7280",
                    }}
                  >
                    Resume Score
                  </p>


                  <p
                    className="
                      text-4xl
                      font-bold
                      mt-2
                    "
                    style={{
                      color: getScoreColor(
                        resumeScore
                      ),
                    }}
                  >

                    {resumeScore}

                    <span
                      className="
                        text-xl
                      "
                      style={{
                        color: "#9CA3AF",
                      }}
                    >
                      /100
                    </span>

                  </p>

                </div>


                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    flex
                    items-center
                    justify-center
                  "
                  style={{
                    backgroundColor: "#EAF7EF",
                  }}
                >

                  <TrendingUp
                    size={23}
                    style={{
                      color: "#16803C",
                    }}
                  />

                </div>

              </div>


              <div
                className="
                  mt-5
                  w-full
                  h-2
                  rounded-full
                  overflow-hidden
                "
                style={{
                  backgroundColor: "#E5E7EB",
                }}
              >

                <div
                  className="
                    h-full
                    rounded-full
                    transition-all
                  "
                  style={{
                    width: `${Math.min(
                      Math.max(
                        resumeScore,
                        0
                      ),
                      100
                    )}%`,
                    backgroundColor: "#16803C",
                  }}
                />

              </div>

            </div>


            {/* JD MATCH SCORE */}

            <div
              className="
                rounded-2xl
                border
                shadow-sm
                p-6
              "
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E5E7EB",
              }}
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-4
                "
              >

                <div>

                  <p
                    className="
                      text-sm
                      font-medium
                    "
                    style={{
                      color: "#6B7280",
                    }}
                  >
                    JD Match Score
                  </p>


                  <p
                    className="
                      text-4xl
                      font-bold
                      mt-2
                    "
                    style={{
                      color: getScoreColor(
                        jdMatchScore
                      ),
                    }}
                  >

                    {jdMatchScore}

                    <span
                      className="
                        text-xl
                      "
                      style={{
                        color: "#9CA3AF",
                      }}
                    >
                      /100
                    </span>

                  </p>

                </div>


                <div
                  className="
                    w-12
                    h-12
                    rounded-xl
                    flex
                    items-center
                    justify-center
                  "
                  style={{
                    backgroundColor: "#E8F5F3",
                  }}
                >

                  <Target
                    size={23}
                    style={{
                      color: "#0F766E",
                    }}
                  />

                </div>

              </div>


              <div
                className="
                  mt-5
                  w-full
                  h-2
                  rounded-full
                  overflow-hidden
                "
                style={{
                  backgroundColor: "#E5E7EB",
                }}
              >

                <div
                  className="
                    h-full
                    rounded-full
                    transition-all
                  "
                  style={{
                    width: `${Math.min(
                      Math.max(
                        jdMatchScore,
                        0
                      ),
                      100
                    )}%`,
                    backgroundColor: "#0F766E",
                  }}
                />

              </div>

            </div>

          </div>


          {/* =================================================
              SKILLS
          ================================================= */}

          <div
            className="
              grid
              grid-cols-1
              lg:grid-cols-2
              gap-5
              mb-6
            "
          >

            {/* MATCHED SKILLS */}

            <div
              className="
                rounded-2xl
                border
                shadow-sm
                p-6
              "
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E5E7EB",
              }}
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-5
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
                      w-9
                      h-9
                      rounded-xl
                      flex
                      items-center
                      justify-center
                    "
                    style={{
                      backgroundColor: "#EAF7EF",
                    }}
                  >

                    <CheckCircle
                      size={18}
                      style={{
                        color: "#16803C",
                      }}
                    />

                  </div>


                  <h3
                    className="
                      text-lg
                      font-bold
                    "
                    style={{
                      color: "#172033",
                    }}
                  >
                    Matched Skills
                  </h3>

                </div>


                <span
                  className="
                    px-2.5
                    py-1
                    rounded-full
                    text-xs
                    font-bold
                  "
                  style={{
                    backgroundColor: "#EAF7EF",
                    color: "#16803C",
                  }}
                >
                  {matchedSkills.length}
                </span>

              </div>


              {matchedSkills.length > 0 ? (

                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >

                  {matchedSkills.map(
                    (skill, index) => (

                      <span
                        key={`${skill}-${index}`}
                        className="
                          px-3
                          py-1.5
                          border
                          rounded-lg
                          text-sm
                          font-medium
                        "
                        style={{
                          backgroundColor: "#EAF7EF",
                          color: "#16803C",
                          borderColor: "#C8E5D0",
                        }}
                      >
                        {skill}
                      </span>

                    )
                  )}

                </div>

              ) : (

                <p
                  className="
                    text-sm
                  "
                  style={{
                    color: "#9CA3AF",
                  }}
                >
                  No matched skills available.
                </p>

              )}

            </div>


            {/* MISSING SKILLS */}

            <div
              className="
                rounded-2xl
                border
                shadow-sm
                p-6
              "
              style={{
                backgroundColor: "#FFFFFF",
                borderColor: "#E5E7EB",
              }}
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  mb-5
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
                      w-9
                      h-9
                      rounded-xl
                      flex
                      items-center
                      justify-center
                    "
                    style={{
                      backgroundColor: "#FDECEC",
                    }}
                  >

                    <XCircle
                      size={18}
                      style={{
                        color: "#C53030",
                      }}
                    />

                  </div>


                  <h3
                    className="
                      text-lg
                      font-bold
                    "
                    style={{
                      color: "#172033",
                    }}
                  >
                    Missing Skills
                  </h3>

                </div>


                <span
                  className="
                    px-2.5
                    py-1
                    rounded-full
                    text-xs
                    font-bold
                  "
                  style={{
                    backgroundColor: "#FDECEC",
                    color: "#C53030",
                  }}
                >
                  {missingSkills.length}
                </span>

              </div>


              {missingSkills.length > 0 ? (

                <div
                  className="
                    flex
                    flex-wrap
                    gap-2
                  "
                >

                  {missingSkills.map(
                    (skill, index) => (

                      <span
                        key={`${skill}-${index}`}
                        className="
                          px-3
                          py-1.5
                          border
                          rounded-lg
                          text-sm
                          font-medium
                        "
                        style={{
                          backgroundColor: "#FDECEC",
                          color: "#C53030",
                          borderColor: "#F2B8B8",
                        }}
                      >
                        {skill}
                      </span>

                    )
                  )}

                </div>

              ) : (

                <p
                  className="
                    text-sm
                  "
                  style={{
                    color: "#9CA3AF",
                  }}
                >
                  No missing skills available.
                </p>

              )}

            </div>

          </div>


          {/* =================================================
              APPLICATION INFORMATION
          ================================================= */}

          <div
            className="
              rounded-2xl
              border
              shadow-sm
              p-6
              mb-6
            "
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
            }}
          >

            <div
              className="
                flex
                items-center
                gap-2
                mb-5
              "
            >

              <FileText
                size={20}
                style={{
                  color: "#0F766E",
                }}
              />


              <h3
                className="
                  text-lg
                  font-bold
                "
                style={{
                  color: "#172033",
                }}
              >
                Application Information
              </h3>

            </div>


            <div
              className="
                grid
                grid-cols-1
                sm:grid-cols-2
                lg:grid-cols-4
                gap-5
              "
            >

              <InfoItem
                label="Application Status"
                value={applicationStatus}
              />


              <InfoItem
                label="Interview Status"
                value={
                  application.interview_status ||
                  "Not Scheduled"
                }
              />


              <InfoItem
                label="Applied On"
                value={
                  application.created_at
                    ? new Date(
                        application.created_at
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "N/A"
                }
              />


              <InfoItem
                label="Last Updated"
                value={
                  application.updated_at
                    ? new Date(
                        application.updated_at
                      ).toLocaleDateString(
                        "en-IN",
                        {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        }
                      )
                    : "N/A"
                }
              />

            </div>

          </div>


          {/* =================================================
              RECRUITER FEEDBACK
          ================================================= */}

          <div
            className="
              rounded-2xl
              border
              shadow-sm
              p-6
              mb-6
            "
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
            }}
          >

            <div
              className="
                flex
                items-center
                gap-2
                mb-5
              "
            >

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                "
                style={{
                  backgroundColor: "#E8F5F3",
                }}
              >

                <MessageSquare
                  size={18}
                  style={{
                    color: "#0F766E",
                  }}
                />

              </div>


              <div>

                <h3
                  className="
                    text-lg
                    font-bold
                  "
                  style={{
                    color: "#172033",
                  }}
                >
                  Recruiter Feedback
                </h3>


                <p
                  className="
                    text-xs
                    mt-0.5
                  "
                  style={{
                    color: "#9CA3AF",
                  }}
                >
                  Add internal notes about this candidate.
                </p>

              </div>

            </div>


            <textarea
              value={feedback}
              onChange={(event) =>
                setFeedback(
                  event.target.value
                )
              }
              placeholder="Add notes or feedback about this candidate..."
              rows={5}
              className="
                w-full
                rounded-xl
                border
                px-4
                py-3
                outline-none
                resize-none
                transition
                focus:ring-4
              "
              style={{
                borderColor: "#D1D5DB",
                color: "#172033",
              }}
            />


            <p
              className="
                text-xs
                mt-2
              "
              style={{
                color: "#9CA3AF",
              }}
            >
              Feedback is saved when you update the candidate status.
            </p>

          </div>


          {/* =================================================
              CANDIDATE DECISION
          ================================================= */}

          <div
            className="
              rounded-2xl
              border
              shadow-sm
              p-6
              mb-8
            "
            style={{
              backgroundColor: "#FFFFFF",
              borderColor: "#E5E7EB",
            }}
          >

            <div
              className="
                flex
                items-center
                gap-2
                mb-5
              "
            >

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  flex
                  items-center
                  justify-center
                "
                style={{
                  backgroundColor: "#E8F5F3",
                }}
              >

                <Sparkles
                  size={18}
                  style={{
                    color: "#0F766E",
                  }}
                />

              </div>


              <div>

                <h3
                  className="
                    text-lg
                    font-bold
                  "
                  style={{
                    color: "#172033",
                  }}
                >
                  Candidate Decision
                </h3>


                <p
                  className="
                    text-xs
                    mt-0.5
                  "
                  style={{
                    color: "#9CA3AF",
                  }}
                >
                  Update the application stage.
                </p>

              </div>

            </div>


            <div
              className="
                flex
                flex-wrap
                gap-3
              "
            >

              {/* =================================================
                  SHORTLIST
              ================================================= */}

              <button
                disabled={
                  updating ||
                  applicationStatus ===
                    "Shortlisted"
                }
                onClick={() =>
                  updateStatus(
                    "Shortlisted"
                  )
                }
                className="
                  flex
                  items-center
                  gap-2
                  px-5
                  py-3
                  text-white
                  rounded-xl
                  font-semibold
                  transition
                  shadow-sm
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  hover:opacity-90
                "
                style={{
                  backgroundColor: "#0F766E",
                }}
              >

                {updating ? (

                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                ) : (

                  <CheckCircle
                    size={18}
                  />

                )}


                {applicationStatus ===
                "Shortlisted"
                  ? "Shortlisted"
                  : "Shortlist"}

              </button>


              {/* =================================================
                  CREATE AI INTERVIEW
              ================================================= */}

              {applicationStatus ===
                "Shortlisted" && (

                <button
                  onClick={
                    createInterview
                  }
                  className="
                    flex
                    items-center
                    gap-2
                    px-5
                    py-3
                    text-white
                    rounded-xl
                    font-semibold
                    transition
                    shadow-sm
                    hover:opacity-90
                  "
                  style={{
                    backgroundColor: "#172033",
                  }}
                >

                  <CalendarPlus
                    size={18}
                  />

                  Create AI Interview

                </button>

              )}


              {/* =================================================
                  SELECT
              ================================================= */}

              <button
                disabled={
                  updating ||
                  applicationStatus ===
                    "Selected"
                }
                onClick={() =>
                  updateStatus(
                    "Selected"
                  )
                }
                className="
                  flex
                  items-center
                  gap-2
                  px-5
                  py-3
                  text-white
                  rounded-xl
                  font-semibold
                  transition
                  shadow-sm
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  hover:opacity-90
                "
                style={{
                  backgroundColor: "#16803C",
                }}
              >

                {updating ? (

                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                ) : (

                  <Award
                    size={18}
                  />

                )}

                {applicationStatus ===
                "Selected"
                  ? "Selected"
                  : "Select"}

              </button>


              {/* =================================================
                  REJECT
              ================================================= */}

              <button
                disabled={
                  updating ||
                  applicationStatus ===
                    "Rejected"
                }
                onClick={() =>
                  updateStatus(
                    "Rejected"
                  )
                }
                className="
                  flex
                  items-center
                  gap-2
                  px-5
                  py-3
                  text-white
                  rounded-xl
                  font-semibold
                  transition
                  shadow-sm
                  disabled:opacity-50
                  disabled:cursor-not-allowed
                  hover:opacity-90
                "
                style={{
                  backgroundColor: "#C53030",
                }}
              >

                {updating ? (

                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                ) : (

                  <XCircle
                    size={18}
                  />

                )}

                {applicationStatus ===
                "Rejected"
                  ? "Rejected"
                  : "Reject"}

              </button>

            </div>


            {/* =================================================
                SHORTLISTED NEXT STEP
            ================================================= */}

            {applicationStatus ===
              "Shortlisted" && (

              <div
                className="
                  mt-6
                  p-5
                  rounded-2xl
                  border
                "
                style={{
                  backgroundColor: "#E8F5F3",
                  borderColor: "#B7DDD8",
                }}
              >

                <div
                  className="
                    flex
                    flex-col
                    md:flex-row
                    md:items-center
                    md:justify-between
                    gap-4
                  "
                >

                  <div>

                    <div
                      className="
                        flex
                        items-center
                        gap-2
                      "
                    >

                      <CalendarPlus
                        size={20}
                        style={{
                          color: "#0F766E",
                        }}
                      />


                      <p
                        className="
                          font-bold
                        "
                        style={{
                          color: "#172033",
                        }}
                      >
                        Candidate is shortlisted
                      </p>

                    </div>


                    <p
                      className="
                        text-sm
                        mt-1
                      "
                      style={{
                        color: "#0F766E",
                      }}
                    >
                      Create and schedule an AI-powered interview for this candidate.
                    </p>

                  </div>


                  <button
                    onClick={
                      createInterview
                    }
                    className="
                      inline-flex
                      items-center
                      justify-center
                      gap-2
                      px-5
                      py-3
                      text-white
                      rounded-xl
                      font-semibold
                      transition
                      whitespace-nowrap
                      shadow-sm
                      hover:opacity-90
                    "
                    style={{
                      backgroundColor: "#172033",
                    }}
                  >

                    <Calendar
                      size={18}
                    />

                    Schedule Interview

                  </button>

                </div>

              </div>

            )}

          </div>

        </div>

      </div>

    </OrganizationLayout>

  );

}


// =========================================================
// INFO ITEM
// =========================================================

function InfoItem({
  label,
  value,
}) {

  return (

    <div
      className="
        rounded-xl
        border
        p-4
      "
      style={{
        backgroundColor: "#F7F6F2",
        borderColor: "#E5E7EB",
      }}
    >

      <p
        className="
          text-xs
          font-semibold
          uppercase
          tracking-wide
        "
        style={{
          color: "#9CA3AF",
        }}
      >
        {label}
      </p>


      <p
        className="
          text-sm
          font-semibold
          mt-2
        "
        style={{
          color: "#172033",
        }}
      >
        {value}
      </p>

    </div>

  );

}


export default CandidateDetails;