import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import {
  createInterview,
  getApplicationInterview,
} from "../../api/interviewApi";

import { getApplication } from "../../api/applicationApi";

import OrganizationSidebar from "../../components/organization/OrganizationSidebar";
import OrganizationNavbar from "../../components/organization/OrganizationNavbar";

import {
  ArrowLeft,
  User,
  Briefcase,
  Calendar,
  Clock,
  Video,
  Brain,
  ShieldCheck,
  RotateCcw,
  FileText,
  Settings,
  CheckCircle,
  AlertCircle,
  Sparkles,
  Loader2,
} from "lucide-react";


// =========================================================
// CREATE INTERVIEW
// ORGANIZATION SIDE
// =========================================================

export default function CreateInterview() {
  const { applicationId } = useParams();

  const navigate = useNavigate();

  // =======================================================
  // STATE
  // =======================================================

  const [application, setApplication] = useState(null);

  const [existingInterview, setExistingInterview] =
    useState(null);

  const [loading, setLoading] = useState(true);

  const [creating, setCreating] = useState(false);

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");


  // =======================================================
  // FORM
  // =======================================================

  const [form, setForm] = useState({
    interview_type: "Technical",
    round_name: "Technical Round 1",
    duration: 30,
    scheduled_date: "",
    scheduled_time: "",
    meeting_link: "",
    question_count: 10,
    difficulty: "Medium",
    allow_retry: false,
    proctoring_enabled: true,
    candidate_notes: "",
    interviewer_notes: "",
  });


  // =======================================================
  // LOAD PAGE
  // =======================================================

  useEffect(() => {
    if (!applicationId) {
      setError("Application ID is missing.");
      setLoading(false);
      return;
    }

    loadPageData();
  }, [applicationId]);


  // =======================================================
  // LOAD APPLICATION + EXISTING INTERVIEW
  // =======================================================

  const loadPageData = async () => {
    try {
      setLoading(true);
      setError("");

      // =================================================
      // LOAD APPLICATION
      // =================================================

      const applicationResponse =
        await getApplication(applicationId);

      const applicationData =
        applicationResponse?.application ||
        applicationResponse?.data ||
        applicationResponse;

      if (!applicationData) {
        throw new Error("Application not found.");
      }

      console.log(
        "Application:",
        applicationData
      );

      setApplication(applicationData);


      // =================================================
      // CHECK EXISTING INTERVIEW
      // =================================================

      try {
        const interviewResponse =
          await getApplicationInterview(applicationId);

        console.log(
          "Existing interview response:",
          interviewResponse
        );

        const interview =
          interviewResponse?.interview ||
          interviewResponse?.data ||
          null;

        if (interview) {
          setExistingInterview(interview);
        }
      } catch (interviewError) {

        /*
         * 404 means no interview exists.
         * This is normal.
         */

        if (
          interviewError?.response?.status !== 404
        ) {
          console.warn(
            "Existing interview check failed:",
            interviewError
          );
        }
      }

    } catch (err) {

      console.error(
        "Create interview page loading error:",
        err
      );

      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to load application."
      );

    } finally {

      setLoading(false);

    }
  };


  // =======================================================
  // GET ORGANIZATION ID
  // =======================================================

  const getOrganizationId = () => {
    try {

      const organizationString =
        localStorage.getItem("organization");

      const organization =
        organizationString
          ? JSON.parse(organizationString)
          : null;


      const organizationId =
        localStorage.getItem(
          "organizationId"
        ) ||
        organization?.organization_id ||
        organization?.organizationId ||
        organization?.id ||
        organization?._id ||
        localStorage.getItem(
          "organization_id"
        ) ||
        "";


      console.log(
        "Organization ID from storage:",
        organizationId
      );


      return organizationId;

    } catch (error) {

      console.error(
        "Organization storage error:",
        error
      );

      return (
        localStorage.getItem(
          "organizationId"
        ) ||
        localStorage.getItem(
          "organization_id"
        ) ||
        ""
      );
    }
  };


  // =======================================================
  // HANDLE INPUT
  // =======================================================

  const handleChange = (event) => {

    const {
      name,
      value,
      type,
      checked,
    } = event.target;


    setForm((previous) => ({
      ...previous,

      [name]:
        type === "checkbox"
          ? checked
          : value,
    }));
  };


  // =======================================================
  // CREATE INTERVIEW
  // =======================================================

  const handleCreateInterview = async (event) => {

    event.preventDefault();


    try {

      setCreating(true);

      setError("");
      setSuccess("");


      // =================================================
      // CHECK EXISTING INTERVIEW
      // =================================================

      if (existingInterview) {

        throw new Error(
          "An interview already exists for this application."
        );

      }


      // =================================================
      // ORGANIZATION ID
      // =================================================

      const organizationId =
        getOrganizationId();


      if (!organizationId) {

        throw new Error(
          "Organization ID not found. Please login again."
        );

      }


      // =================================================
      // DATE
      // =================================================

      if (!form.scheduled_date) {

        throw new Error(
          "Please select interview date."
        );

      }


      // =================================================
      // TIME
      // =================================================

      if (!form.scheduled_time) {

        throw new Error(
          "Please select interview time."
        );

      }


      // =================================================
      // DURATION
      // =================================================

      if (
        Number(form.duration) < 5
      ) {

        throw new Error(
          "Interview duration must be at least 5 minutes."
        );

      }


      // =================================================
      // QUESTION COUNT
      // =================================================

      if (
        Number(form.question_count) < 1
      ) {

        throw new Error(
          "Question count must be at least 1."
        );

      }


      // =================================================
      // STUDENT ID
      // =================================================

      const studentId =
        application?.student_id ||
        application?.studentId ||
        application?.candidate_id ||
        application?.candidateId ||
        application?.student?.id ||
        application?.student?._id ||
        "";


      if (!studentId) {

        throw new Error(
          "Student ID is missing from the application."
        );

      }


      // =================================================
      // JOB ID
      // =================================================

      const jobId =
        application?.job_id ||
        application?.jobId ||
        application?.job?.id ||
        application?.job?._id ||
        "";


      if (!jobId) {

        throw new Error(
          "Job ID is missing from the application."
        );

      }


      // =================================================
      // RESUME ID
      // =================================================

      const resumeId =
        application?.resume_id ||
        application?.resumeId ||
        application?.resume?.id ||
        application?.resume?._id ||
        "";


      if (!resumeId) {

        throw new Error(
          "Resume ID is missing from the application."
        );

      }


      // =================================================
      // INTERVIEW DATA
      // =================================================

      const interviewData = {

        application_id:
          applicationId,

        student_id:
          studentId,

        organization_id:
          organizationId,

        job_id:
          jobId,

        resume_id:
          resumeId,

        interview_type:
          form.interview_type,

        round_name:
          form.round_name,

        interview_mode:
          "AI",

        interviewer_id:
          organizationId,

        interviewer_name:
          "AI Interview",

        scheduled_date:
          form.scheduled_date,

        scheduled_time:
          form.scheduled_time,

        duration:
          Number(form.duration),

        meeting_link:
          form.meeting_link || null,

        question_count:
          Number(form.question_count),

        difficulty:
          form.difficulty,

        allow_retry:
          Boolean(form.allow_retry),

        proctoring_enabled:
          Boolean(
            form.proctoring_enabled
          ),

        candidate_notes:
          form.candidate_notes || null,

        interviewer_notes:
          form.interviewer_notes || null,

      };


      // =================================================
      // RESUME ANALYSIS
      // =================================================

      const resumeAnalysis =
        application?.resume_analysis ||
        application?.resumeAnalysis ||
        application?.resume_analysis_result ||
        application?.analysis ||
        {};


      // =================================================
      // JOB DATA
      // =================================================

      const job =
        application?.job || {

          id: jobId,

          _id: jobId,

          title:
            application?.job_title ||
            application?.job_name ||
            "",

          description:
            application?.job_description ||
            "",

        };


      // =================================================
      // DEBUG
      // =================================================

      console.log(
        "===================================="
      );

      console.log(
        "CREATING AI INTERVIEW"
      );

      console.log(
        "Application ID:",
        applicationId
      );

      console.log(
        "Organization ID:",
        organizationId
      );

      console.log(
        "Student ID:",
        studentId
      );

      console.log(
        "Job ID:",
        jobId
      );

      console.log(
        "Resume ID:",
        resumeId
      );

      console.log(
        "Interview Data:",
        interviewData
      );

      console.log(
        "Resume Analysis:",
        resumeAnalysis
      );

      console.log(
        "Job:",
        job
      );

      console.log(
        "===================================="
      );


      // =================================================
      // CREATE INTERVIEW
      // =================================================

      const response =
        await createInterview(
          interviewData,
          resumeAnalysis,
          job
        );


      console.log(
        "Create Interview Response:",
        response
      );


      // =================================================
      // SUCCESS
      // =================================================

      setSuccess(
        "AI interview created successfully."
      );


      // =================================================
      // INTERVIEW ID
      // =================================================

      const interviewId =
        response?.interview_id ||
        response?.interviewId ||
        response?.id ||
        response?._id ||
        response?.interview?.id ||
        response?.interview?._id;


      console.log(
        "Created Interview ID:",
        interviewId
      );


      // =================================================
      // REDIRECT
      // =================================================

      setTimeout(() => {

        navigate(
          "/organization/interviews"
        );

      }, 1000);


    } catch (err) {

      console.error(
        "Create interview error:",
        err
      );

      console.error(
        "Backend response:",
        err?.response?.data
      );


      setError(
        err?.response?.data?.detail ||
          err?.response?.data?.message ||
          err?.message ||
          "Failed to create interview."
      );

    } finally {

      setCreating(false);

    }
  };


  // =======================================================
  // COMMON LAYOUT
  // =======================================================

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


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (

      <PortalLayout>

        <div className="min-h-full px-4 py-6 md:px-6 lg:px-8">

          <div className="w-full max-w-[1400px] mx-auto">

            {/* HEADER SKELETON */}

            <div className="animate-pulse">

              <div className="flex items-center justify-between mb-8">

                <div>

                  <div className="h-9 w-72 bg-gray-200 rounded-lg" />

                  <div className="h-4 w-96 bg-gray-200 rounded mt-3" />

                </div>

                <div className="h-11 w-28 bg-gray-200 rounded-xl" />

              </div>


              {/* CANDIDATE */}

              <div className="bg-white rounded-2xl border border-gray-200 p-6 mb-6">

                <div className="h-5 w-48 bg-gray-200 rounded mb-5" />

                <div className="h-7 w-64 bg-gray-200 rounded mb-6" />

                <div className="grid md:grid-cols-3 gap-5">

                  {[1, 2, 3].map((item) => (

                    <div key={item}>

                      <div className="h-3 w-24 bg-gray-200 rounded" />

                      <div className="h-4 w-40 bg-gray-200 rounded mt-2" />

                    </div>

                  ))}

                </div>

              </div>


              {/* FORM SKELETON */}

              <div className="bg-white rounded-2xl border border-gray-200 p-6">

                <div className="h-6 w-48 bg-gray-200 rounded mb-7" />

                <div className="grid md:grid-cols-2 gap-5">

                  {[1, 2, 3, 4, 5, 6].map((item) => (

                    <div key={item}>

                      <div className="h-4 w-32 bg-gray-200 rounded mb-2" />

                      <div className="h-12 w-full bg-gray-200 rounded-xl" />

                    </div>

                  ))}

                </div>

              </div>

            </div>

          </div>

        </div>

      </PortalLayout>

    );
  }


  // =======================================================
  // EXISTING INTERVIEW
  // =======================================================

  if (existingInterview) {

    return (

      <PortalLayout>

        <div className="min-h-full flex items-center justify-center px-4 py-10">

          <div className="w-full max-w-lg bg-white border border-gray-200 rounded-3xl shadow-sm p-8 text-center">

            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-amber-50 flex items-center justify-center">

              <AlertCircle
                size={32}
                className="text-[#B7791F]"
              />

            </div>


            <h2 className="text-2xl font-bold text-[#172033]">

              Interview Already Exists

            </h2>


            <p className="text-gray-500 mt-3">

              An interview has already been created
              for this application.

            </p>


            <div className="flex flex-col sm:flex-row gap-3 mt-7">

              <button
                onClick={() =>
                  navigate(-1)
                }
                className="
                  flex-1
                  flex
                  items-center
                  justify-center
                  gap-2
                  py-3
                  rounded-xl
                  bg-gray-100
                  hover:bg-gray-200
                  text-[#172033]
                  font-semibold
                  transition
                "
              >

                <ArrowLeft size={17} />

                Go Back

              </button>


              <button
                onClick={() =>
                  navigate(
                    "/organization/interviews"
                  )
                }
                className="
                  flex-1
                  py-3
                  rounded-xl
                  bg-[#172033]
                  hover:bg-[#0F766E]
                  text-white
                  font-semibold
                  transition
                "
              >

                View Interviews

              </button>

            </div>

          </div>

        </div>

      </PortalLayout>

    );
  }


  // =======================================================
  // MAIN PAGE
  // =======================================================

  return (

    <PortalLayout>

      <div className="min-h-full px-4 py-6 md:px-6 lg:px-8">

        <div className="w-full max-w-[1400px] mx-auto">


          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-5 mb-7">

            <div>

              <div className="flex items-center gap-3">

                <div className="w-12 h-12 rounded-2xl bg-[#E6F4F1] flex items-center justify-center">

                  <Brain
                    size={25}
                    className="text-[#0F766E]"
                  />

                </div>


                <div>

                  <div className="flex items-center gap-2">

                    <h1 className="text-2xl md:text-3xl font-bold text-[#172033]">

                      Create AI Interview

                    </h1>

                    <Sparkles
                      size={20}
                      className="text-[#0F766E]"
                    />

                  </div>


                  <p className="text-gray-500 mt-1">

                    Schedule an AI-powered interview
                    for the shortlisted candidate.

                  </p>

                </div>

              </div>

            </div>


            <button
              type="button"
              onClick={() =>
                navigate(-1)
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
                hover:bg-[#0F766E]
                text-white
                font-semibold
                shadow-sm
                hover:shadow-md
                transition-all
                duration-200
              "
            >

              <ArrowLeft size={18} />

              Back

            </button>

          </div>


          {/* =================================================
              ERROR
          ================================================= */}

          {error && (

            <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-5 py-4 flex items-start gap-3">

              <AlertCircle
                size={20}
                className="text-[#C53030] mt-0.5 flex-shrink-0"
              />

              <div>

                <p className="font-semibold text-[#C53030]">

                  Something went wrong

                </p>

                <p className="text-sm text-red-700 mt-1">

                  {error}

                </p>

              </div>

            </div>

          )}


          {/* =================================================
              SUCCESS
          ================================================= */}

          {success && (

            <div className="mb-6 rounded-2xl border border-green-200 bg-green-50 px-5 py-4 flex items-center gap-3">

              <CheckCircle
                size={20}
                className="text-[#16803C]"
              />

              <p className="font-semibold text-[#16803C]">

                {success}

              </p>

            </div>

          )}


          {/* =================================================
              CANDIDATE CARD
          ================================================= */}

          <section className="bg-white border border-gray-200 rounded-3xl shadow-sm p-5 md:p-6 mb-6">

            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-5">

              <div className="flex items-center gap-4">

                <div className="w-14 h-14 rounded-2xl bg-[#EAF4F2] flex items-center justify-center flex-shrink-0">

                  <User
                    size={27}
                    className="text-[#0F766E]"
                  />

                </div>


                <div>

                  <div className="flex items-center gap-2">

                    <p className="text-xs font-semibold uppercase tracking-wide text-[#0F766E]">

                      Shortlisted Candidate

                    </p>

                    <span className="px-2 py-1 rounded-full bg-green-50 text-[#16803C] text-[11px] font-semibold">

                      Shortlisted

                    </span>

                  </div>


                  <h2 className="text-xl font-bold text-[#172033] mt-1">

                    {
                      application?.student_name ||
                      application?.candidate_name ||
                      application?.student?.name ||
                      application?.candidate?.name ||
                      "Candidate"
                    }

                  </h2>

                </div>

              </div>


              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-[#F7F6F2] border border-gray-100">

                <Brain
                  size={18}
                  className="text-[#0F766E]"
                />

                <span className="text-sm font-semibold text-[#172033]">

                  AI Interview

                </span>

              </div>

            </div>


            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6 pt-5 border-t border-gray-100">

              {/* APPLICATION */}

              <InfoItem
                label="Application ID"
                value={applicationId}
              />


              {/* JOB */}

              <InfoItem
                label="Job"
                value={
                  application?.job_title ||
                  application?.job_name ||
                  application?.job?.title ||
                  application?.job_id ||
                  "-"
                }
              />


              {/* CANDIDATE ID */}

              <InfoItem
                label="Candidate ID"
                value={
                  application?.student_id ||
                  application?.studentId ||
                  application?.candidate_id ||
                  application?.candidateId ||
                  application?.student?.id ||
                  application?.student?._id ||
                  "-"
                }
              />

            </div>

          </section>


          {/* =================================================
              FORM
          ================================================= */}

          <form
            onSubmit={handleCreateInterview}
            className="space-y-6"
          >


            {/* =================================================
                INTERVIEW DETAILS
            ================================================= */}

            <section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

              <SectionHeader
                icon={Video}
                title="Interview Details"
                description="Configure the interview schedule and AI assessment."
              />


              <div className="p-5 md:p-6">

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">


                  {/* INTERVIEW TYPE */}

                  <FormField
                    label="Interview Type"
                    icon={Video}
                  >

                    <select
                      name="interview_type"
                      value={
                        form.interview_type
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass}
                    >

                      <option value="Technical">
                        Technical
                      </option>

                      <option value="HR">
                        HR
                      </option>

                      <option value="Behavioral">
                        Behavioral
                      </option>

                      <option value="Mixed">
                        Mixed
                      </option>

                    </select>

                  </FormField>


                  {/* ROUND NAME */}

                  <FormField
                    label="Round Name"
                    icon={FileText}
                  >

                    <input
                      type="text"
                      name="round_name"
                      value={
                        form.round_name
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="Technical Round 1"
                      className={inputClass}
                    />

                  </FormField>


                  {/* QUESTIONS */}

                  <FormField
                    label="Number of Questions"
                    icon={Brain}
                  >

                    <input
                      type="number"
                      name="question_count"
                      min="1"
                      max="50"
                      value={
                        form.question_count
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass}
                    />

                  </FormField>


                  {/* DIFFICULTY */}

                  <FormField
                    label="Difficulty"
                    icon={Settings}
                  >

                    <select
                      name="difficulty"
                      value={
                        form.difficulty
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass}
                    >

                      <option value="Easy">
                        Easy
                      </option>

                      <option value="Medium">
                        Medium
                      </option>

                      <option value="Hard">
                        Hard
                      </option>

                    </select>

                  </FormField>


                  {/* DURATION */}

                  <FormField
                    label="Duration (minutes)"
                    icon={Clock}
                  >

                    <input
                      type="number"
                      name="duration"
                      min="5"
                      max="180"
                      value={
                        form.duration
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass}
                    />

                  </FormField>


                  {/* DATE */}

                  <FormField
                    label="Interview Date"
                    icon={Calendar}
                  >

                    <input
                      type="date"
                      name="scheduled_date"
                      value={
                        form.scheduled_date
                      }
                      onChange={
                        handleChange
                      }
                      min={
                        new Date()
                          .toISOString()
                          .split("T")[0]
                      }
                      className={inputClass}
                    />

                  </FormField>


                  {/* TIME */}

                  <FormField
                    label="Interview Time"
                    icon={Clock}
                  >

                    <input
                      type="time"
                      name="scheduled_time"
                      value={
                        form.scheduled_time
                      }
                      onChange={
                        handleChange
                      }
                      className={inputClass}
                    />

                  </FormField>


                  {/* MEETING LINK */}

                  <FormField
                    label="Meeting Link"
                    icon={Video}
                    optional
                  >

                    <input
                      type="url"
                      name="meeting_link"
                      value={
                        form.meeting_link
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="https://..."
                      className={inputClass}
                    />

                  </FormField>

                </div>

              </div>

            </section>


            {/* =================================================
                AI SETTINGS
            ================================================= */}

            <section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

              <SectionHeader
                icon={Brain}
                title="AI Interview Settings"
                description="Control AI assessment and interview security."
              />


              <div className="p-5 md:p-6">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


                  {/* PROCTORING */}

                  <ToggleCard
                    icon={ShieldCheck}
                    title="Enable Proctoring"
                    description="Monitor fullscreen exits, tab switching, copy/paste and suspicious activity."
                    name="proctoring_enabled"
                    checked={
                      form.proctoring_enabled
                    }
                    onChange={
                      handleChange
                    }
                  />


                  {/* RETRY */}

                  <ToggleCard
                    icon={RotateCcw}
                    title="Allow Retry"
                    description="Allow the candidate to retry the interview."
                    name="allow_retry"
                    checked={
                      form.allow_retry
                    }
                    onChange={
                      handleChange
                    }
                  />

                </div>

              </div>

            </section>


            {/* =================================================
                NOTES
            ================================================= */}

            <section className="bg-white border border-gray-200 rounded-3xl shadow-sm overflow-hidden">

              <SectionHeader
                icon={FileText}
                title="Interview Notes"
                description="Add instructions for the candidate and internal recruiter notes."
              />


              <div className="p-5 md:p-6 space-y-5">


                {/* CANDIDATE NOTES */}

                <div>

                  <label className="block text-sm font-semibold text-[#172033] mb-2">

                    Candidate Notes

                  </label>

                  <textarea
                    name="candidate_notes"
                    value={
                      form.candidate_notes
                    }
                    onChange={
                      handleChange
                    }
                    rows="4"
                    placeholder="Instructions visible to the candidate..."
                    className={textareaClass}
                  />

                </div>


                {/* INTERVIEWER NOTES */}

                <div>

                  <label className="block text-sm font-semibold text-[#172033] mb-2">

                    Interviewer Notes

                  </label>

                  <textarea
                    name="interviewer_notes"
                    value={
                      form.interviewer_notes
                    }
                    onChange={
                      handleChange
                    }
                    rows="4"
                    placeholder="Internal organization notes..."
                    className={textareaClass}
                  />

                </div>

              </div>

            </section>


            {/* =================================================
                BOTTOM ACTIONS
            ================================================= */}

            <div className="bg-white border border-gray-200 rounded-2xl p-4 md:p-5 shadow-sm">

              <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">

                <button
                  type="button"
                  onClick={() =>
                    navigate(-1)
                  }
                  disabled={creating}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-6
                    py-3
                    rounded-xl
                    bg-gray-100
                    hover:bg-gray-200
                    text-[#172033]
                    font-semibold
                    transition
                    disabled:opacity-50
                  "
                >

                  <ArrowLeft size={17} />

                  Cancel

                </button>


                <button
                  type="submit"
                  disabled={creating}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    px-7
                    py-3
                    rounded-xl
                    bg-[#172033]
                    hover:bg-[#0F766E]
                    text-white
                    font-semibold
                    shadow-sm
                    hover:shadow-md
                    transition-all
                    duration-200
                    disabled:opacity-60
                    disabled:cursor-not-allowed
                  "
                >

                  {creating ? (

                    <>
                      <Loader2
                        size={18}
                        className="animate-spin"
                      />

                      Creating AI Interview...

                    </>

                  ) : (

                    <>
                      <Brain size={18} />

                      Create AI Interview

                    </>

                  )}

                </button>

              </div>

            </div>

          </form>

        </div>

      </div>

    </PortalLayout>

  );
}


// =========================================================
// CONSTANT STYLES
// =========================================================

const inputClass = `
  w-full
  px-4
  py-3
  rounded-xl
  border
  border-gray-200
  bg-white
  text-[#172033]
  outline-none
  transition-all
  duration-200
  focus:border-[#0F766E]
  focus:ring-4
  focus:ring-[#0F766E]/10
`;

const textareaClass = `
  w-full
  px-4
  py-3
  rounded-xl
  border
  border-gray-200
  bg-white
  text-[#172033]
  outline-none
  resize-none
  transition-all
  duration-200
  focus:border-[#0F766E]
  focus:ring-4
  focus:ring-[#0F766E]/10
`;


// =========================================================
// INFO ITEM
// =========================================================

function InfoItem({
  label,
  value,
}) {

  return (

    <div className="min-w-0">

      <p className="text-xs font-medium uppercase tracking-wide text-gray-400">

        {label}

      </p>

      <p className="text-sm font-semibold text-[#172033] mt-1 truncate">

        {value || "-"}

      </p>

    </div>

  );
}


// =========================================================
// SECTION HEADER
// =========================================================

function SectionHeader({
  icon: Icon,
  title,
  description,
}) {

  return (

    <div className="px-5 md:px-6 py-5 border-b border-gray-100 bg-[#FCFCFA]">

      <div className="flex items-center gap-3">

        <div className="w-10 h-10 rounded-xl bg-[#E6F4F1] flex items-center justify-center">

          <Icon
            size={20}
            className="text-[#0F766E]"
          />

        </div>


        <div>

          <h2 className="text-lg font-bold text-[#172033]">

            {title}

          </h2>

          <p className="text-sm text-gray-500 mt-0.5">

            {description}

          </p>

        </div>

      </div>

    </div>

  );
}


// =========================================================
// FORM FIELD
// =========================================================

function FormField({
  label,
  icon: Icon,
  optional = false,
  children,
}) {

  return (

    <div>

      <label className="flex items-center gap-2 text-sm font-semibold text-[#172033] mb-2">

        {Icon && (

          <Icon
            size={15}
            className="text-[#0F766E]"
          />

        )}

        {label}

        {optional && (

          <span className="text-xs font-normal text-gray-400">

            Optional

          </span>

        )}

      </label>

      {children}

    </div>

  );
}


// =========================================================
// TOGGLE CARD
// =========================================================

function ToggleCard({
  icon: Icon,
  title,
  description,
  name,
  checked,
  onChange,
}) {

  return (

    <label className="flex items-start gap-4 p-5 rounded-2xl border border-gray-200 bg-[#FCFCFA] hover:border-[#0F766E]/30 hover:bg-[#F8FBFA] transition cursor-pointer">

      <div className="flex-shrink-0">

        <div className="w-11 h-11 rounded-xl bg-[#E6F4F1] flex items-center justify-center">

          <Icon
            size={21}
            className="text-[#0F766E]"
          />

        </div>

      </div>


      <div className="flex-1 min-w-0">

        <div className="flex items-center justify-between gap-4">

          <div>

            <p className="font-semibold text-[#172033]">

              {title}

            </p>

            <p className="text-sm text-gray-500 mt-1 leading-5">

              {description}

            </p>

          </div>


          <div className="relative flex-shrink-0">

            <input
              type="checkbox"
              name={name}
              checked={checked}
              onChange={onChange}
              className="sr-only peer"
            />

            <div className="w-11 h-6 bg-gray-300 rounded-full peer-checked:bg-[#0F766E] transition-colors" />

            <div className="absolute left-1 top-1 w-4 h-4 bg-white rounded-full shadow-sm transition-transform peer-checked:translate-x-5" />

          </div>

        </div>

      </div>

    </label>

  );
}