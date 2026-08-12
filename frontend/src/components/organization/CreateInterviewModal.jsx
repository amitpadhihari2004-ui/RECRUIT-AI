import { useEffect, useState } from "react";
import {
  X,
  Brain,
  User,
  Briefcase,
  FileText,
  Loader2,
  Sparkles,
  CalendarDays,
  Clock3,
  Link2,
  CheckCircle2,
  AlertCircle,
} from "lucide-react";

import { createInterview } from "../../api/interviewApi";

const CreateInterviewModal = ({
  isOpen,
  onClose,
  application,
  onCreated,
}) => {
  // =========================================================
  // STATE
  // =========================================================

  const [interviewType, setInterviewType] =
    useState("Technical");

  const [duration, setDuration] =
    useState("30");

  const [scheduledDate, setScheduledDate] =
    useState("");

  const [scheduledTime, setScheduledTime] =
    useState("");

  const [meetingLink, setMeetingLink] =
    useState("");

  const [loading, setLoading] =
    useState(false);

  const [error, setError] =
    useState("");

  const [success, setSuccess] =
    useState(false);

  const [createdInterviewId, setCreatedInterviewId] =
    useState("");

  // =========================================================
  // RESET MODAL
  // =========================================================

  useEffect(() => {
    if (!isOpen) {
      setInterviewType("Technical");
      setDuration("30");
      setScheduledDate("");
      setScheduledTime("");
      setMeetingLink("");
      setLoading(false);
      setError("");
      setSuccess(false);
      setCreatedInterviewId("");
    }
  }, [isOpen]);

  // =========================================================
  // STOP IF CLOSED
  // =========================================================

  if (!isOpen || !application) {
    return null;
  }

  // =========================================================
  // APPLICATION DATA
  // =========================================================

  const applicationId =
    application.application_id ||
    application.applicationId ||
    application._id ||
    application.id;

  const studentId =
    application.student_id ||
    application.studentId;

  const organizationId =
    application.organization_id ||
    application.organizationId;

  const jobId =
    application.job_id ||
    application.jobId;

  const resumeId =
    application.resume_id ||
    application.resumeId;

  const candidateName =
    application.student_name ||
    application.candidate_name ||
    application.studentName ||
    application.candidateName ||
    application.name ||
    "Candidate";

  const candidateEmail =
    application.student_email ||
    application.candidate_email ||
    application.studentEmail ||
    application.candidateEmail ||
    application.email ||
    "";

  const jobTitle =
    application.job_title ||
    application.job_name ||
    application.jobTitle ||
    application.position ||
    "Job Position";

  // =========================================================
  // VALIDATE REQUIRED DATA
  // =========================================================

  const validateApplicationData = () => {
    if (!applicationId) {
      return "Application ID is missing.";
    }

    if (!studentId) {
      return "Student ID is missing.";
    }

    if (!organizationId) {
      return "Organization ID is missing.";
    }

    if (!jobId) {
      return "Job ID is missing.";
    }

    if (!resumeId) {
      return (
        "Resume ID is missing. The candidate must have an analyzed resume before an interview can be created."
      );
    }

    return null;
  };

  // =========================================================
  // CREATE INTERVIEW
  // =========================================================

  const handleCreateInterview = async () => {
    setError("");
    setSuccess(false);

    const validationError =
      validateApplicationData();

    if (validationError) {
      setError(validationError);
      return;
    }

    // -------------------------------------------------------
    // DATE/TIME VALIDATION
    // -------------------------------------------------------

    if (scheduledDate && !scheduledTime) {
      setError(
        "Please select an interview time."
      );
      return;
    }

    if (scheduledTime && !scheduledDate) {
      setError(
        "Please select an interview date."
      );
      return;
    }

    // -------------------------------------------------------
    // CREATE REQUEST
    // -------------------------------------------------------

    try {
      setLoading(true);

      const interviewData = {
        application_id: String(applicationId),

        student_id: String(studentId),

        organization_id: String(
          organizationId
        ),

        job_id: String(jobId),

        resume_id: String(resumeId),

        interview_type:
          interviewType,

        // These fields are included only
        // when the backend schema supports them.
        duration: Number(duration),

        scheduled_date:
          scheduledDate || null,

        scheduled_time:
          scheduledTime || null,

        meeting_link:
          meetingLink.trim() || null,
      };

      console.log(
        "===================================="
      );

      console.log(
        "CREATING AI INTERVIEW"
      );

      console.log(
        "Interview Data:",
        interviewData
      );

      console.log(
        "===================================="
      );

      const response =
        await createInterview(
          interviewData
        );

      console.log(
        "Interview Created:",
        response
      );

      // -------------------------------------------------------
      // GET CREATED INTERVIEW ID
      // -------------------------------------------------------

      const interviewId =
        response?.interview_id ||
        response?.id ||
        response?.data?.interview_id ||
        response?.data?.id ||
        "";

      setCreatedInterviewId(
        interviewId
      );

      setSuccess(true);

      // -------------------------------------------------------
      // INFORM PARENT
      // -------------------------------------------------------

      if (onCreated) {
        await onCreated(
          response
        );
      }

      // -------------------------------------------------------
      // CLOSE AFTER SUCCESS
      // -------------------------------------------------------

      setTimeout(() => {
        onClose();
      }, 1200);

    } catch (err) {
      console.error(
        "Create Interview Error:",
        err
      );

      console.error(
        "Backend Response:",
        err?.response?.data
      );

      const backendError =
        err?.response?.data?.detail ||
        err?.response?.data?.message ||
        err?.response?.data?.error;

      setError(
        backendError ||
          "Unable to create the interview. Please try again."
      );

    } finally {
      setLoading(false);
    }
  };

  // =========================================================
  // CLOSE MODAL
  // =========================================================

  const handleClose = () => {
    if (loading) {
      return;
    }

    onClose();
  };

  // =========================================================
  // UI
  // =========================================================

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm"
      onMouseDown={(event) => {
        if (
          event.target === event.currentTarget &&
          !loading
        ) {
          onClose();
        }
      }}
    >

      <div
        className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-3xl bg-white shadow-2xl"
        onMouseDown={(event) =>
          event.stopPropagation()
        }
      >

        {/* =====================================================
            HEADER
        ===================================================== */}

        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">

          <div className="flex items-center gap-3">

            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100">

              <Brain
                className="h-6 w-6 text-blue-600"
              />

            </div>

            <div>

              <h2 className="text-xl font-bold text-slate-900">
                Create AI Interview
              </h2>

              <p className="mt-0.5 text-sm text-slate-500">
                Generate a personalized candidate interview
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-xl p-2 text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
          >

            <X size={21} />

          </button>

        </div>

        {/* =====================================================
            BODY
        ===================================================== */}

        <div className="flex-1 overflow-y-auto">

          <div className="space-y-5 p-6">

            {/* =================================================
                SUCCESS
            ================================================= */}

            {success && (

              <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4">

                <div className="flex items-start gap-3">

                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-emerald-100">

                    <CheckCircle2
                      size={20}
                      className="text-emerald-600"
                    />

                  </div>

                  <div>

                    <p className="font-semibold text-emerald-800">
                      Interview created successfully
                    </p>

                    <p className="mt-1 text-sm text-emerald-700">
                      AI interview questions have been generated for this candidate.
                    </p>

                    {createdInterviewId && (
                      <p className="mt-1 text-xs text-emerald-600">
                        Interview ID:{" "}
                        {createdInterviewId}
                      </p>
                    )}

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                ERROR
            ================================================= */}

            {error && (

              <div className="rounded-2xl border border-red-200 bg-red-50 p-4">

                <div className="flex items-start gap-3">

                  <AlertCircle
                    size={20}
                    className="mt-0.5 shrink-0 text-red-600"
                  />

                  <div>

                    <p className="font-semibold text-red-800">
                      Unable to create interview
                    </p>

                    <p className="mt-1 text-sm leading-5 text-red-700">
                      {error}
                    </p>

                  </div>

                </div>

              </div>
            )}

            {/* =================================================
                CANDIDATE INFORMATION
            ================================================= */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="mb-4 flex items-center gap-2">

                <User
                  size={18}
                  className="text-blue-600"
                />

                <h3 className="font-semibold text-slate-800">
                  Candidate Information
                </h3>

              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Candidate
                  </p>

                  <p className="mt-1 font-semibold text-slate-900">
                    {candidateName}
                  </p>

                </div>

                <div>

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Email
                  </p>

                  <p className="mt-1 break-all text-sm text-slate-700">
                    {candidateEmail ||
                      "Not available"}
                  </p>

                </div>

                <div className="sm:col-span-2">

                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                    Application ID
                  </p>

                  <p className="mt-1 break-all font-mono text-xs text-slate-600">
                    {applicationId}
                  </p>

                </div>

              </div>

            </div>

            {/* =================================================
                JOB INFORMATION
            ================================================= */}

            <div className="rounded-2xl border border-slate-200 bg-slate-50 p-5">

              <div className="mb-4 flex items-center gap-2">

                <Briefcase
                  size={18}
                  className="text-purple-600"
                />

                <h3 className="font-semibold text-slate-800">
                  Job Information
                </h3>

              </div>

              <p className="font-semibold text-slate-900">
                {jobTitle}
              </p>

              <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">

                <FileText size={14} />

                Candidate resume will be used
                for AI question generation.

              </div>

            </div>

            {/* =================================================
                INTERVIEW TYPE
            ================================================= */}

            <div>

              <label
                htmlFor="interview-type"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Interview Type
              </label>

              <select
                id="interview-type"
                value={interviewType}
                onChange={(event) =>
                  setInterviewType(
                    event.target.value
                  )
                }
                disabled={loading}
                className="w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
              >

                <option value="Technical">
                  Technical Interview
                </option>

                <option value="HR">
                  HR Interview
                </option>

                <option value="Behavioral">
                  Behavioral Interview
                </option>

                <option value="Technical + HR">
                  Technical + HR Interview
                </option>

              </select>

            </div>

            {/* =================================================
                DURATION
            ================================================= */}

            <div>

              <label
                htmlFor="interview-duration"
                className="mb-2 block text-sm font-semibold text-slate-700"
              >
                Interview Duration
              </label>

              <div className="relative">

                <Clock3
                  size={18}
                  className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                />

                <select
                  id="interview-duration"
                  value={duration}
                  onChange={(event) =>
                    setDuration(
                      event.target.value
                    )
                  }
                  disabled={loading}
                  className="w-full appearance-none rounded-xl border border-slate-300 bg-white py-3 pl-11 pr-4 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                >

                  <option value="15">
                    15 minutes
                  </option>

                  <option value="30">
                    30 minutes
                  </option>

                  <option value="45">
                    45 minutes
                  </option>

                  <option value="60">
                    60 minutes
                  </option>

                </select>

              </div>

            </div>

            {/* =================================================
                OPTIONAL SCHEDULING
            ================================================= */}

            <div className="rounded-2xl border border-slate-200 p-5">

              <div className="mb-4">

                <div className="flex items-center gap-2">

                  <CalendarDays
                    size={18}
                    className="text-blue-600"
                  />

                  <h3 className="font-semibold text-slate-800">
                    Schedule Interview
                  </h3>

                  <span className="rounded-full bg-slate-100 px-2 py-1 text-[10px] font-semibold uppercase text-slate-500">
                    Optional
                  </span>

                </div>

                <p className="mt-1 text-xs text-slate-500">
                  You can generate the interview now and schedule it later.
                </p>

              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

                {/* DATE */}

                <div>

                  <label
                    htmlFor="scheduled-date"
                    className="mb-2 block text-xs font-semibold text-slate-600"
                  >
                    Date
                  </label>

                  <input
                    id="scheduled-date"
                    type="date"
                    value={scheduledDate}
                    onChange={(event) =>
                      setScheduledDate(
                        event.target.value
                      )
                    }
                    disabled={loading}
                    min={
                      new Date()
                        .toISOString()
                        .split("T")[0]
                    }
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />

                </div>

                {/* TIME */}

                <div>

                  <label
                    htmlFor="scheduled-time"
                    className="mb-2 block text-xs font-semibold text-slate-600"
                  >
                    Time
                  </label>

                  <input
                    id="scheduled-time"
                    type="time"
                    value={scheduledTime}
                    onChange={(event) =>
                      setScheduledTime(
                        event.target.value
                      )
                    }
                    disabled={loading}
                    className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />

                </div>

              </div>

              {/* MEETING LINK */}

              <div className="mt-4">

                <label
                  htmlFor="meeting-link"
                  className="mb-2 block text-xs font-semibold text-slate-600"
                >
                  Meeting Link
                </label>

                <div className="relative">

                  <Link2
                    size={17}
                    className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                  />

                  <input
                    id="meeting-link"
                    type="url"
                    value={meetingLink}
                    onChange={(event) =>
                      setMeetingLink(
                        event.target.value
                      )
                    }
                    disabled={loading}
                    placeholder="https://meet.google.com/..."
                    className="w-full rounded-xl border border-slate-300 py-3 pl-11 pr-4 text-sm outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100 disabled:bg-slate-100"
                  />

                </div>

              </div>

            </div>

            {/* =================================================
                AI INFORMATION
            ================================================= */}

            <div className="rounded-2xl border border-blue-200 bg-gradient-to-br from-blue-50 to-purple-50 p-5">

              <div className="flex items-start gap-3">

                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm">

                  <Sparkles
                    size={20}
                    className="text-blue-600"
                  />

                </div>

                <div className="min-w-0">

                  <h3 className="font-semibold text-blue-900">
                    AI Question Generation
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-blue-700">
                    AI will analyze the candidate's resume
                    and job requirements to generate
                    personalized interview questions.
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">

                    <span className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700">
                      5 Technical
                    </span>

                    <span className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700">
                      3 HR
                    </span>

                    <span className="rounded-full border border-blue-100 bg-white px-3 py-1.5 text-xs font-semibold text-blue-700">
                      2 Behavioral
                    </span>

                  </div>

                </div>

              </div>

            </div>

          </div>

        </div>

        {/* =====================================================
            FOOTER
        ===================================================== */}

        <div className="flex flex-col-reverse gap-3 border-t border-slate-200 bg-slate-50 px-6 py-4 sm:flex-row sm:items-center sm:justify-end">

          <button
            type="button"
            onClick={handleClose}
            disabled={loading}
            className="rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleCreateInterview}
            disabled={loading || success}
            className="flex items-center justify-center gap-2 rounded-xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >

            {loading ? (

              <>
                <Loader2
                  size={18}
                  className="animate-spin"
                />

                Generating Interview...
              </>

            ) : success ? (

              <>
                <CheckCircle2 size={18} />

                Interview Created
              </>

            ) : (

              <>
                <Sparkles size={18} />

                Generate Interview
              </>

            )}

          </button>

        </div>

      </div>

    </div>
  );
};

export default CreateInterviewModal;