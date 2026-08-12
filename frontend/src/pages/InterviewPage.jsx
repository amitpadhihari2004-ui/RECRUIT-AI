import React, {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  getInterview,
  startInterview,
  updateAnswers,
  submitInterview,
  recordProctoringEvent,
} from "../api/interviewApi";


// =========================================================
// STUDENT AI INTERVIEW PAGE
// =========================================================

export default function InterviewPage() {

  const { interviewId } = useParams();

  const navigate = useNavigate();


  // =======================================================
  // STATE
  // =======================================================

  const [interview, setInterview] =
    useState(null);

  const [questions, setQuestions] =
    useState([]);

  const [answers, setAnswers] =
    useState({});

  const [currentQuestion, setCurrentQuestion] =
    useState(0);

  const [loading, setLoading] =
    useState(true);

  const [starting, setStarting] =
    useState(false);

  const [submitting, setSubmitting] =
    useState(false);

  const [error, setError] =
    useState("");

  const [started, setStarted] =
    useState(false);

  const [cameraAllowed, setCameraAllowed] =
    useState(false);

  const [microphoneAllowed, setMicrophoneAllowed] =
    useState(false);

  const [isFullscreen, setIsFullscreen] =
    useState(false);

  const [timeLeft, setTimeLeft] =
    useState(0);

  const [proctoringWarnings, setProctoringWarnings] =
    useState(0);

  const [warningMessage, setWarningMessage] =
    useState("");


  // =======================================================
  // REFS
  // =======================================================

  const videoRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const timerRef =
    useRef(null);

  const answerSaveTimer =
    useRef(null);


  // =======================================================
  // GET STUDENT ID
  // =======================================================

  const getStudentId = () => {

    try {

      const student = JSON.parse(
        localStorage.getItem("student")
      );

      return (
        student?.id ||
        student?._id ||
        localStorage.getItem("student_id") ||
        ""
      );

    } catch {

      return (
        localStorage.getItem("student_id") ||
        ""
      );

    }

  };


  // =======================================================
  // LOAD INTERVIEW
  // =======================================================

  useEffect(() => {

    loadInterview();

    return () => {

      stopCamera();

      if (timerRef.current) {

        clearInterval(
          timerRef.current
        );

      }

      if (answerSaveTimer.current) {

        clearTimeout(
          answerSaveTimer.current
        );

      }

    };

  }, [interviewId]);


  // =======================================================
  // LOAD INTERVIEW
  // =======================================================

  const loadInterview = async () => {

    try {

      setLoading(true);

      setError("");


      const response =
        await getInterview(
          interviewId
        );


      const data =
        response?.interview ||
        response?.data ||
        response;


      if (!data) {

        throw new Error(
          "Interview not found."
        );

      }


      setInterview(data);


      // =====================================================
      // EXTRACT QUESTIONS
      // =====================================================

      const extractedQuestions = [];

      const questionData =
        data.questions || {};


      // -----------------------------------------------------
      // CATEGORY QUESTIONS
      // -----------------------------------------------------

      const categories = [

        "technical_questions",

        "hr_questions",

        "behavioral_questions",

      ];


      categories.forEach(
        (category) => {

          const categoryQuestions =
            questionData[category];


          if (
            !Array.isArray(
              categoryQuestions
            )
          ) {

            return;

          }


          categoryQuestions.forEach(
            (question) => {

              if (!question) {
                return;
              }


              extractedQuestions.push({

                question_id:
                  Number(
                    question.question_id
                  ),

                question:
                  question.question || "",

                category:
                  question.category ||
                  category.replace(
                    "_questions",
                    ""
                  ),

                difficulty:
                  question.difficulty ||
                  data.difficulty ||
                  "Medium",

              });

            }
          );

        }
      );


      // =====================================================
      // FALLBACK ARRAY FORMAT
      // =====================================================

      if (
        extractedQuestions.length === 0 &&
        Array.isArray(questionData)
      ) {

        questionData.forEach(
          (question) => {

            extractedQuestions.push({

              question_id:
                Number(
                  question.question_id
                ),

              question:
                question.question || "",

              category:
                question.category ||
                "Technical",

              difficulty:
                question.difficulty ||
                data.difficulty ||
                "Medium",

            });

          }
        );

      }


      setQuestions(
        extractedQuestions
      );


      // =====================================================
      // LOAD EXISTING ANSWERS
      // =====================================================

      const existingAnswers = {};


      if (
        Array.isArray(
          data.answers
        )
      ) {

        data.answers.forEach(
          (answer) => {

            existingAnswers[
              Number(
                answer.question_id
              )
            ] =
              answer.answer || "";

          }
        );

      }


      setAnswers(
        existingAnswers
      );


      // =====================================================
      // STATUS
      // =====================================================

      if (
        data.status ===
        "In Progress"
      ) {

        setStarted(true);

      }


      // =====================================================
      // TIMER
      // =====================================================

      if (data.duration) {

        setTimeLeft(
          Number(
            data.duration
          ) * 60
        );

      }


    } catch (err) {

      console.error(
        "Interview loading error:",
        err
      );


      setError(
        err?.response?.data?.detail ||
        err?.message ||
        "Failed to load interview."
      );


    } finally {

      setLoading(false);

    }

  };


  // =======================================================
  // CAMERA + MICROPHONE
  // =======================================================

  const requestMedia = async () => {

    try {

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices.getUserMedia
      ) {

        throw new Error(
          "Camera and microphone are not supported by this browser."
        );

      }


      const stream =
        await navigator.mediaDevices.getUserMedia({

          video: true,

          audio: true,

        });


      streamRef.current =
        stream;


      if (videoRef.current) {

        videoRef.current.srcObject =
          stream;

      }


      setCameraAllowed(true);

      setMicrophoneAllowed(true);


      return true;


    } catch (err) {

      console.error(
        "Camera/microphone error:",
        err
      );


      setCameraAllowed(false);

      setMicrophoneAllowed(false);


      setWarningMessage(
        "Camera and microphone permission are required to start the interview."
      );


      return false;

    }

  };


  // =======================================================
  // STOP CAMERA
  // =======================================================

  const stopCamera = () => {

    if (
      streamRef.current
    ) {

      streamRef.current
        .getTracks()
        .forEach(
          (track) => {

            track.stop();

          }
        );


      streamRef.current =
        null;

    }


    if (videoRef.current) {

      videoRef.current.srcObject =
        null;

    }


    setCameraAllowed(false);

    setMicrophoneAllowed(false);

  };


  // =======================================================
  // CAMERA TRACK MONITORING
  // =======================================================

  useEffect(() => {

    if (!streamRef.current) {
      return;
    }


    const tracks =
      streamRef.current.getTracks();


    const handleTrackEnded = (
      event
    ) => {

      if (
        event.target.kind ===
        "video"
      ) {

        setCameraAllowed(false);


        if (started) {

          registerProctoringEvent(

            "camera_disabled",

            "high",

            "Camera was disabled during the interview."

          );

        }

      }


      if (
        event.target.kind ===
        "audio"
      ) {

        setMicrophoneAllowed(false);


        if (started) {

          registerProctoringEvent(

            "microphone_disabled",

            "high",

            "Microphone was disabled during the interview."

          );

        }

      }

    };


    tracks.forEach(
      (track) => {

        track.addEventListener(
          "ended",
          handleTrackEnded
        );

      }
    );


    return () => {

      tracks.forEach(
        (track) => {

          track.removeEventListener(
            "ended",
            handleTrackEnded
          );

        }
      );

    };

  }, [started, streamRef.current]);


  // =======================================================
  // ENTER FULLSCREEN
  // =======================================================

  const enterFullscreen = async () => {

    try {

      if (
        !document.fullscreenElement
      ) {

        await document.documentElement.requestFullscreen();

      }


      setIsFullscreen(true);


    } catch (err) {

      console.error(
        "Fullscreen error:",
        err
      );


      setIsFullscreen(false);

    }

  };


  // =======================================================
  // FULLSCREEN DETECTION
  // =======================================================

  useEffect(() => {

    const handleFullscreenChange =
      () => {

        const fullscreen =
          Boolean(
            document.fullscreenElement
          );


        setIsFullscreen(
          fullscreen
        );


        if (
          started &&
          !fullscreen
        ) {

          registerProctoringEvent(

            "fullscreen_exit",

            "medium",

            "Candidate exited fullscreen."

          );

        }

      };


    document.addEventListener(
      "fullscreenchange",
      handleFullscreenChange
    );


    return () => {

      document.removeEventListener(
        "fullscreenchange",
        handleFullscreenChange
      );

    };

  }, [started]);


  // =======================================================
  // TAB SWITCH DETECTION
  // =======================================================

  useEffect(() => {

    const handleVisibility =
      () => {

        if (!started) {
          return;
        }


        if (
          document.hidden
        ) {

          registerProctoringEvent(

            "tab_switch",

            "medium",

            "Candidate switched away from the interview tab."

          );

        }

      };


    document.addEventListener(
      "visibilitychange",
      handleVisibility
    );


    return () => {

      document.removeEventListener(
        "visibilitychange",
        handleVisibility
      );

    };

  }, [started]);


  // =======================================================
  // COPY / PASTE DETECTION
  // =======================================================

  useEffect(() => {

    if (!started) {
      return;
    }


    const handleCopy = () => {

      registerProctoringEvent(

        "copy",

        "medium",

        "Copy action detected."

      );

    };


    const handlePaste = () => {

      registerProctoringEvent(

        "paste",

        "medium",

        "Paste action detected."

      );

    };


    document.addEventListener(
      "copy",
      handleCopy
    );

    document.addEventListener(
      "paste",
      handlePaste
    );


    return () => {

      document.removeEventListener(
        "copy",
        handleCopy
      );

      document.removeEventListener(
        "paste",
        handlePaste
      );

    };

  }, [started]);


  // =======================================================
  // PROCTORING EVENT
  // =======================================================

  const registerProctoringEvent =
    async (
      eventType,
      severity = "low",
      message = ""
    ) => {

      try {

        setProctoringWarnings(
          (previous) => {

            if (
              severity === "medium" ||
              severity === "high" ||
              severity === "critical"
            ) {

              return previous + 1;

            }

            return previous;

          }
        );


        await recordProctoringEvent(

          interviewId,

          {

            event_type:
              eventType,

            severity:
              severity,

            message:
              message,

            metadata: {

              source:
                "InterviewPage",

            },

          }

        );


      } catch (err) {

        console.error(
          "Proctoring event error:",
          err
        );

      }

    };


  // =======================================================
  // START INTERVIEW
  // =======================================================

  const handleStartInterview =
    async () => {

      try {

        setStarting(true);

        setError("");

        setWarningMessage("");


        // =================================================
        // STUDENT ID
        // =================================================

        const studentId =
          getStudentId();


        if (!studentId) {

          throw new Error(
            "Student ID not found. Please login again."
          );

        }


        // =================================================
        // CAMERA + MIC
        // =================================================

        if (
          interview?.proctoring_enabled !==
          false
        ) {

          const mediaAllowed =
            await requestMedia();


          if (!mediaAllowed) {

            setStarting(false);

            return;

          }

        }


        // =================================================
        // FULLSCREEN
        // =================================================

        if (
          interview?.fullscreen_required !==
          false
        ) {

          await enterFullscreen();

        }


        // =================================================
        // BACKEND START
        // =================================================

        const response =
          await startInterview(

            interviewId,

            studentId

          );


        const updatedInterview =
          response?.interview ||
          response?.data ||
          response;


        if (
          updatedInterview &&
          typeof updatedInterview ===
            "object"
        ) {

          setInterview(
            updatedInterview
          );

        }


        setStarted(true);


        // =================================================
        // TIMER
        // =================================================

        const duration =
          Number(
            interview?.duration ||
            45
          );


        setTimeLeft(
          duration * 60
        );


      } catch (err) {

        console.error(
          "Start interview error:",
          err
        );


        stopCamera();


        setError(
          err?.response?.data?.detail ||
          err?.message ||
          "Unable to start interview."
        );


      } finally {

        setStarting(false);

      }

    };


  // =======================================================
  // TIMER
  // =======================================================

  useEffect(() => {

    if (
      !started ||
      timeLeft <= 0
    ) {

      return;

    }


    timerRef.current =
      setInterval(
        () => {

          setTimeLeft(
            (previous) => {

              if (
                previous <= 1
              ) {

                clearInterval(
                  timerRef.current
                );

                return 0;

              }


              return previous - 1;

            }
          );

        },

        1000

      );


    return () => {

      if (
        timerRef.current
      ) {

        clearInterval(
          timerRef.current
        );

      }

    };

  }, [started]);


  // =======================================================
  // AUTO SUBMIT WHEN TIMER ENDS
  // =======================================================

  useEffect(() => {

    if (
      started &&
      timeLeft === 0
    ) {

      handleSubmit(true);

    }

  }, [timeLeft, started]);


  // =======================================================
  // FORMAT TIME
  // =======================================================

  const formatTime = (
    seconds
  ) => {

    const mins =
      Math.floor(
        seconds / 60
      );


    const secs =
      seconds % 60;


    return `${String(
      mins
    ).padStart(
      2,
      "0"
    )}:${String(
      secs
    ).padStart(
      2,
      "0"
    )}`;

  };


  // =======================================================
  // CHANGE ANSWER
  // =======================================================

  const handleAnswerChange =
    (
      questionId,
      value
    ) => {

      setAnswers(
        (previous) => ({

          ...previous,

          [questionId]:
            value,

        })
      );


      if (
        answerSaveTimer.current
      ) {

        clearTimeout(
          answerSaveTimer.current
        );

      }


      answerSaveTimer.current =
        setTimeout(
          () => {

            saveCurrentAnswers();

          },

          1000

        );

    };


  // =======================================================
  // SAVE ANSWERS
  // =======================================================

  const saveCurrentAnswers =
    async () => {

      try {

        const studentId =
          getStudentId();


        if (!studentId) {
          return;
        }


        const formattedAnswers =
          Object.entries(
            answers
          ).map(
            ([questionId, answer]) => ({

              question_id:
                Number(
                  questionId
                ),

              answer:
                answer || "",

            })
          );


        if (
          formattedAnswers.length ===
          0
        ) {

          return;

        }


        await updateAnswers(

          interviewId,

          formattedAnswers,

          studentId

        );


      } catch (err) {

        console.error(
          "Answer save error:",
          err
        );

      }

    };


  // =======================================================
  // NEXT QUESTION
  // =======================================================

  const nextQuestion = () => {

    if (
      currentQuestion <
      questions.length - 1
    ) {

      setCurrentQuestion(
        (previous) =>
          previous + 1
      );

    }

  };


  // =======================================================
  // PREVIOUS QUESTION
  // =======================================================

  const previousQuestion = () => {

    if (
      currentQuestion > 0
    ) {

      setCurrentQuestion(
        (previous) =>
          previous - 1
      );

    }

  };


  // =======================================================
  // GO TO QUESTION
  // =======================================================

  const goToQuestion =
    (index) => {

      setCurrentQuestion(
        index
      );

    };


  // =======================================================
  // SUBMIT INTERVIEW
  // =======================================================

  const handleSubmit =
    async (
      autoSubmit = false
    ) => {

      try {

        if (!autoSubmit) {

          const confirmed =
            window.confirm(
              "Are you sure you want to submit the interview?"
            );


          if (!confirmed) {
            return;
          }

        }


        setSubmitting(true);

        setError("");


        // =================================================
        // STUDENT ID
        // =================================================

        const studentId =
          getStudentId();


        if (!studentId) {

          throw new Error(
            "Student ID not found."
          );

        }


        // =================================================
        // LAST ANSWERS
        // =================================================

        const formattedAnswers =
          questions.map(
            (question) => ({

              question_id:
                Number(
                  question.question_id
                ),

              answer:
                answers[
                  question.question_id
                ] || "",

            })
          );


        // =================================================
        // SUBMIT
        // =================================================

        await submitInterview(

          interviewId,

          formattedAnswers,

          studentId

        );


        // =================================================
        // STOP CAMERA
        // =================================================

        stopCamera();


        // =================================================
        // EXIT FULLSCREEN
        // =================================================

        if (
          document.fullscreenElement
        ) {

          await document.exitFullscreen();

        }


        if (autoSubmit) {

          alert(
            "Time is over. Your interview was submitted automatically."
          );

        } else {

          alert(
            "Interview submitted successfully."
          );

        }


        navigate(
          "/student/dashboard"
        );


      } catch (err) {

        console.error(
          "Submit interview error:",
          err
        );


        setError(
          err?.response?.data?.detail ||
          err?.message ||
          "Failed to submit interview."
        );


      } finally {

        setSubmitting(false);

      }

    };


  // =======================================================
  // LOADING
  // =======================================================

  if (loading) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white">

        <div className="text-center">

          <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />

          <p className="text-slate-300">
            Loading interview...
          </p>

        </div>

      </div>

    );

  }


  // =======================================================
  // ERROR
  // =======================================================

  if (
    error &&
    !interview
  ) {

    return (

      <div className="min-h-screen flex items-center justify-center bg-slate-950 text-white px-6">

        <div className="max-w-md w-full bg-slate-900 border border-red-500/30 rounded-2xl p-8 text-center">

          <h2 className="text-2xl font-bold mb-3">
            Interview Error
          </h2>

          <p className="text-red-400 mb-6">
            {error}
          </p>

          <button
            onClick={() =>
              navigate(
                "/student/dashboard"
              )
            }
            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-xl"
          >
            Back to Dashboard
          </button>

        </div>

      </div>

    );

  }


  // =======================================================
  // START SCREEN
  // =======================================================

  if (!started) {

    return (

      <div className="min-h-screen bg-slate-950 text-white px-4 py-10">

        <div className="max-w-4xl mx-auto">

          {/* HEADER */}

          <div className="mb-8">

            <p className="text-blue-400 text-sm font-semibold mb-2">
              AI INTERVIEW
            </p>

            <h1 className="text-3xl md:text-4xl font-bold">

              {interview?.round_name ||
                "Technical Interview"}

            </h1>

            <p className="text-slate-400 mt-2">
              Prepare yourself before starting
              the interview.
            </p>

          </div>


          {/* INTERVIEW INFORMATION */}

          <div className="grid md:grid-cols-3 gap-4 mb-8">

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

              <p className="text-slate-500 text-sm">
                Interview Type
              </p>

              <p className="text-lg font-semibold mt-1">

                {interview?.interview_type ||
                  "Technical"}

              </p>

            </div>


            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

              <p className="text-slate-500 text-sm">
                Questions
              </p>

              <p className="text-lg font-semibold mt-1">
                {questions.length}
              </p>

            </div>


            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

              <p className="text-slate-500 text-sm">
                Duration
              </p>

              <p className="text-lg font-semibold mt-1">

                {interview?.duration ||
                  45}{" "}
                minutes

              </p>

            </div>

          </div>


          {/* PROCTORING REQUIREMENTS */}

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 mb-8">

            <h2 className="text-xl font-semibold mb-5">
              Before you start
            </h2>


            <div className="space-y-4">

              {interview?.camera_required !==
                false && (

                <div className="flex items-center gap-3">

                  <span className="text-xl">
                    📷
                  </span>

                  <div>

                    <p className="font-medium">
                      Camera
                    </p>

                    <p className="text-sm text-slate-400">
                      Camera access is required.
                    </p>

                  </div>

                </div>

              )}


              {interview?.microphone_required !==
                false && (

                <div className="flex items-center gap-3">

                  <span className="text-xl">
                    🎤
                  </span>

                  <div>

                    <p className="font-medium">
                      Microphone
                    </p>

                    <p className="text-sm text-slate-400">
                      Microphone access is required.
                    </p>

                  </div>

                </div>

              )}


              {interview?.fullscreen_required !==
                false && (

                <div className="flex items-center gap-3">

                  <span className="text-xl">
                    🖥️
                  </span>

                  <div>

                    <p className="font-medium">
                      Fullscreen
                    </p>

                    <p className="text-sm text-slate-400">
                      The interview should remain
                      in fullscreen.
                    </p>

                  </div>

                </div>

              )}


              {interview?.proctoring_enabled !==
                false && (

                <div className="flex items-center gap-3">

                  <span className="text-xl">
                    👁️
                  </span>

                  <div>

                    <p className="font-medium">
                      AI Proctoring
                    </p>

                    <p className="text-sm text-slate-400">
                      Tab switching and suspicious
                      activity may be recorded.
                    </p>

                  </div>

                </div>

              )}

            </div>

          </div>


          {/* ERROR */}

          {error && (

            <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-4 mb-6">

              {error}

            </div>

          )}


          {/* WARNING */}

          {warningMessage && (

            <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl p-4 mb-6">

              {warningMessage}

            </div>

          )}


          {/* START BUTTON */}

          <button
            onClick={
              handleStartInterview
            }
            disabled={starting}
            className="w-full py-4 rounded-xl bg-blue-600 hover:bg-blue-700 disabled:opacity-50 font-semibold text-lg transition"
          >

            {starting
              ? "Starting Interview..."
              : "Start Interview"}

          </button>

        </div>

      </div>

    );

  }


  // =======================================================
  // NO QUESTIONS
  // =======================================================

  if (
    questions.length === 0
  ) {

    return (

      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">

        <div className="text-center">

          <h2 className="text-2xl font-bold mb-3">
            No questions available
          </h2>

          <p className="text-slate-400">
            Please contact the organization.
          </p>

        </div>

      </div>

    );

  }


  // =======================================================
  // CURRENT QUESTION
  // =======================================================

  const question =
    questions[currentQuestion];


  // =======================================================
  // MAIN INTERVIEW UI
  // =======================================================

  return (

    <div className="min-h-screen bg-slate-950 text-white">

      {/* ===================================================
          TOP BAR
      =================================================== */}

      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-800">

        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-4">

          <div>

            <p className="text-xs text-blue-400 font-semibold">
              AI INTERVIEW
            </p>

            <h1 className="font-semibold">

              {interview?.round_name ||
                "Interview"}

            </h1>

          </div>


          <div className="flex items-center gap-4">

            {/* CAMERA */}

            <div className="hidden sm:flex items-center gap-2 text-sm">

              <span
                className={`w-2 h-2 rounded-full ${
                  cameraAllowed
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />

              Camera

            </div>


            {/* MICROPHONE */}

            <div className="hidden sm:flex items-center gap-2 text-sm">

              <span
                className={`w-2 h-2 rounded-full ${
                  microphoneAllowed
                    ? "bg-green-500"
                    : "bg-red-500"
                }`}
              />

              Mic

            </div>


            {/* FULLSCREEN */}

            <div className="hidden md:flex items-center gap-2 text-sm">

              <span
                className={`w-2 h-2 rounded-full ${
                  isFullscreen
                    ? "bg-green-500"
                    : "bg-yellow-500"
                }`}
              />

              Fullscreen

            </div>


            {/* TIMER */}

            <div className="px-4 py-2 rounded-xl bg-slate-800 font-mono font-bold">

              ⏱ {formatTime(timeLeft)}

            </div>

          </div>

        </div>

      </header>


      {/* ===================================================
          WARNING
      =================================================== */}

      {warningMessage && (

        <div className="max-w-7xl mx-auto px-4 pt-4">

          <div className="bg-yellow-500/10 border border-yellow-500/30 text-yellow-400 rounded-xl p-3">

            {warningMessage}

          </div>

        </div>

      )}


      {/* ===================================================
          ERROR
      =================================================== */}

      {error && (

        <div className="max-w-7xl mx-auto px-4 pt-4">

          <div className="bg-red-500/10 border border-red-500/30 text-red-400 rounded-xl p-3">

            {error}

          </div>

        </div>

      )}


      {/* ===================================================
          MAIN
      =================================================== */}

      <main className="max-w-7xl mx-auto px-4 py-6">

        <div className="grid lg:grid-cols-[1fr_320px] gap-6">


          {/* =================================================
              QUESTION AREA
          ================================================= */}

          <section className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

            {/* QUESTION HEADER */}

            <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between">

              <div>

                <p className="text-sm text-slate-400">

                  Question{" "}
                  {currentQuestion + 1}{" "}
                  of{" "}
                  {questions.length}

                </p>

                <p className="text-xs text-blue-400 mt-1">

                  {question.category}

                  {" • "}

                  {question.difficulty}

                </p>

              </div>


              <div className="text-sm text-slate-400">

                {Math.round(

                  (
                    (currentQuestion + 1) /
                    questions.length
                  ) * 100

                )}

                %

              </div>

            </div>


            {/* QUESTION */}

            <div className="p-6 md:p-8">

              <h2 className="text-xl md:text-2xl font-semibold leading-relaxed mb-8">

                {question.question}

              </h2>


              {/* ANSWER */}

              <textarea
                value={
                  answers[
                    question.question_id
                  ] || ""
                }
                onChange={(event) =>
                  handleAnswerChange(

                    question.question_id,

                    event.target.value

                  )
                }
                placeholder="Type your answer here..."
                className="w-full min-h-[260px] resize-none rounded-xl bg-slate-950 border border-slate-700 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none p-5 text-white placeholder:text-slate-600"
              />


              <div className="flex items-center justify-between mt-3">

                <p className="text-xs text-slate-500">

                  Your answer is automatically
                  saved.

                </p>

                <p className="text-xs text-slate-500">

                  {
                    (
                      answers[
                        question.question_id
                      ] || ""
                    ).length
                  }{" "}
                  characters

                </p>

              </div>

            </div>


            {/* QUESTION NAVIGATION */}

            <div className="px-6 py-5 border-t border-slate-800 flex items-center justify-between gap-3">

              <button
                onClick={
                  previousQuestion
                }
                disabled={
                  currentQuestion === 0
                }
                className="px-5 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:cursor-not-allowed"
              >

                ← Previous

              </button>


              {currentQuestion <
              questions.length - 1 ? (

                <button
                  onClick={
                    nextQuestion
                  }
                  className="px-5 py-3 rounded-xl bg-blue-600 hover:bg-blue-700 font-semibold"
                >

                  Next →

                </button>

              ) : (

                <button
                  onClick={
                    () =>
                      handleSubmit(false)
                  }
                  disabled={
                    submitting
                  }
                  className="px-5 py-3 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-50 font-semibold"
                >

                  {submitting
                    ? "Submitting..."
                    : "Submit Interview"}

                </button>

              )}

            </div>

          </section>


          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-6">


            {/* =================================================
                CAMERA
            ================================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden">

              <div className="aspect-video bg-black relative">

                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />


                {!cameraAllowed && (

                  <div className="absolute inset-0 flex items-center justify-center text-slate-500">

                    Camera unavailable

                  </div>

                )}


                {cameraAllowed && (

                  <div className="absolute bottom-3 left-3 px-3 py-1 rounded-full bg-black/60 text-xs">

                    ● Live

                  </div>

                )}

              </div>


              <div className="p-4">

                <p className="font-medium">
                  Proctoring Camera
                </p>

                <p className="text-xs text-slate-500 mt-1">

                  {cameraAllowed
                    ? "Camera monitoring is active."
                    : "Camera is inactive."}

                </p>

              </div>

            </div>


            {/* =================================================
                QUESTION NAVIGATOR
            ================================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

              <h3 className="font-semibold mb-4">
                Questions
              </h3>


              <div className="grid grid-cols-5 gap-2">

                {questions.map(
                  (item, index) => {

                    const answered =
                      Boolean(

                        answers[
                          item.question_id
                        ]?.trim()

                      );


                    return (

                      <button
                        key={
                          item.question_id
                        }
                        onClick={() =>
                          goToQuestion(
                            index
                          )
                        }
                        className={`
                          h-10 rounded-lg text-sm font-medium
                          ${
                            index ===
                            currentQuestion

                              ? "bg-blue-600 text-white"

                              : answered

                              ? "bg-green-500/20 text-green-400 border border-green-500/30"

                              : "bg-slate-800 text-slate-400"
                          }
                        `}
                      >

                        {index + 1}

                      </button>

                    );

                  }
                )}

              </div>

            </div>


            {/* =================================================
                PROCTORING STATUS
            ================================================= */}

            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5">

              <h3 className="font-semibold mb-4">
                Proctoring Status
              </h3>


              <div className="space-y-3 text-sm">


                {/* CAMERA */}

                <div className="flex justify-between">

                  <span className="text-slate-400">
                    Camera
                  </span>

                  <span
                    className={
                      cameraAllowed
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >

                    {cameraAllowed
                      ? "Active"
                      : "Inactive"}

                  </span>

                </div>


                {/* MICROPHONE */}

                <div className="flex justify-between">

                  <span className="text-slate-400">
                    Microphone
                  </span>

                  <span
                    className={
                      microphoneAllowed
                        ? "text-green-400"
                        : "text-red-400"
                    }
                  >

                    {microphoneAllowed
                      ? "Active"
                      : "Inactive"}

                  </span>

                </div>


                {/* FULLSCREEN */}

                <div className="flex justify-between">

                  <span className="text-slate-400">
                    Fullscreen
                  </span>

                  <span
                    className={
                      isFullscreen
                        ? "text-green-400"
                        : "text-yellow-400"
                    }
                  >

                    {isFullscreen
                      ? "Active"
                      : "Exit"}

                  </span>

                </div>


                {/* WARNINGS */}

                <div className="flex justify-between">

                  <span className="text-slate-400">
                    Warnings
                  </span>

                  <span className="text-yellow-400">

                    {proctoringWarnings}

                  </span>

                </div>


                {/* PROCTORING */}

                <div className="flex justify-between">

                  <span className="text-slate-400">
                    Monitoring
                  </span>

                  <span className="text-green-400">

                    {interview?.proctoring_enabled !==
                    false
                      ? "Active"
                      : "Disabled"}

                  </span>

                </div>

              </div>

            </div>


          </aside>

        </div>

      </main>

    </div>

  );

}