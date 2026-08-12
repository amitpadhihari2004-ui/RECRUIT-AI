import {
  useEffect,
  useRef,
  useState,
} from "react";

import {
  useNavigate,
  useParams,
} from "react-router-dom";

import {
  motion,
  AnimatePresence,
} from "framer-motion";

import toast from "react-hot-toast";

import {
  Camera,
  CameraOff,
  Mic,
  MicOff,
  Maximize,
  AlertTriangle,
  Clock,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Send,
  Brain,
  ShieldCheck,
  Loader2,
  Video,
  Sparkles,
  ArrowRight,
  Target,
  Smartphone,
  UserRound,
  ScanFace,
  Activity,
  WifiOff,
} from "lucide-react";

import {
  getInterview,
  startInterview,
  updateAnswers,
  submitInterview,
  recordProctoringEvent,
} from "../api/interviewApi";

import {
  processCVFrame,
} from "../api/cvApi";


// =========================================================
// START INTERVIEW
// =========================================================

function StartInterview() {

  const {
    interviewId,
  } = useParams();

  const navigate =
    useNavigate();


  // =======================================================
  // BASIC STATE
  // =======================================================

  const [
    loading,
    setLoading,
  ] = useState(true);

  const [
    starting,
    setStarting,
  ] = useState(false);

  const [
    submitting,
    setSubmitting,
  ] = useState(false);

  const [
    interview,
    setInterview,
  ] = useState(null);

  const [
    questions,
    setQuestions,
  ] = useState([]);

  const [
    currentQuestion,
    setCurrentQuestion,
  ] = useState(0);

  const [
    answers,
    setAnswers,
  ] = useState([]);


  // =======================================================
  // MEDIA
  // =======================================================

  const [
    cameraEnabled,
    setCameraEnabled,
  ] = useState(false);

  const [
    microphoneEnabled,
    setMicrophoneEnabled,
  ] = useState(false);

  const [
    mediaReady,
    setMediaReady,
  ] = useState(false);


  // =======================================================
  // INTERVIEW
  // =======================================================

  const [
    started,
    setStarted,
  ] = useState(false);

  const [
    fullscreen,
    setFullscreen,
  ] = useState(false);

  const [
    proctoringWarning,
    setProctoringWarning,
  ] = useState("");

  const [
    tabSwitches,
    setTabSwitches,
  ] = useState(0);

  const [
    timeLeft,
    setTimeLeft,
  ] = useState(null);

  const [
    showSubmitModal,
    setShowSubmitModal,
  ] = useState(false);

  const [
    questionsSource,
    setQuestionsSource,
  ] = useState("");


  // =======================================================
  // COMPUTER VISION
  // =======================================================

  const [
    cvActive,
    setCvActive,
  ] = useState(false);

  const [
    cvProcessing,
    setCvProcessing,
  ] = useState(false);

  const [
    cvError,
    setCvError,
  ] = useState("");

  const [
    cvFaceCount,
    setCvFaceCount,
  ] = useState(0);

  const [
    cvPersonCount,
    setCvPersonCount,
  ] = useState(0);

  const [
    cvPhoneDetected,
    setCvPhoneDetected,
  ] = useState(false);

  const [
    cvCameraBlocked,
    setCvCameraBlocked,
  ] = useState(false);

  const [
    cvMovementScore,
    setCvMovementScore,
  ] = useState(0);

  const [
    cvLastScan,
    setCvLastScan,
  ] = useState(null);

  const [
    cvEventCount,
    setCvEventCount,
  ] = useState(0);


  // =======================================================
  // MICROPHONE MONITORING
  // =======================================================

  const [
    micLevel,
    setMicLevel,
  ] = useState(0);

  const [
    micSpeaking,
    setMicSpeaking,
  ] = useState(false);


  // =======================================================
  // REFS
  // =======================================================

  const videoRef =
    useRef(null);

  const canvasRef =
    useRef(null);

  const streamRef =
    useRef(null);

  const timerRef =
    useRef(null);

  const saveTimerRef =
    useRef(null);


  // =======================================================
  // CV REFS
  // =======================================================

  const cvTimerRef =
    useRef(null);

  const cvInitialTimeoutRef =
    useRef(null);

  const cvBusyRef =
    useRef(false);


  // =======================================================
  // MICROPHONE REFS
  // =======================================================

  const audioContextRef =
    useRef(null);

  const analyserRef =
    useRef(null);

  const audioDataRef =
    useRef(null);

  const micTimerRef =
    useRef(null);


  // =======================================================
  // PROCTORING REFS
  // =======================================================

  const proctoringEventLockRef =
    useRef({});

  const proctoringStartedRef =
    useRef(false);

  const answersRef =
    useRef([]);

  const fullscreenTransitionRef =
    useRef(false);


  // =======================================================
  // ANSWERS REF
  // =======================================================

  useEffect(() => {

    answersRef.current =
      answers;

  }, [
    answers,
  ]);


  // =======================================================
  // GET STUDENT ID
  // =======================================================

  const getStudentId = () => {

    const possibleIds = [];


    try {

      const studentData =
        localStorage.getItem(
          "student"
        );

      if (studentData) {

        const student =
          JSON.parse(
            studentData
          );

        possibleIds.push(
          student?.id,
          student?._id,
          student?.student_id,
          student?.studentId,
          student?.user_id,
          student?.userId
        );

      }

    } catch (error) {

      console.warn(
        "Unable to parse student object:",
        error
      );

    }


    possibleIds.push(
      localStorage.getItem(
        "studentId"
      ),
      localStorage.getItem(
        "student_id"
      ),
      localStorage.getItem(
        "user_id"
      )
    );


    const validId =
      possibleIds.find(
        (id) =>
          id !== null &&
          id !== undefined &&
          String(id).trim() !== ""
      );


    return validId
      ? String(validId)
      : "";

  };


  // =======================================================
  // SEND PROCTORING EVENT
  // =======================================================

  const sendProctoringEvent =
    async (
      eventType,
      severity = "low",
      message = null,
      metadata = {}
    ) => {

      if (
        !interviewId ||
        (
          !started &&
          !proctoringStartedRef.current
        )
      ) {

        return;

      }


      const lockKey =
        `${eventType}:${message || ""}`;


      const now =
        Date.now();


      const lastSent =
        proctoringEventLockRef
          .current[
            lockKey
          ] || 0;


      if (
        now - lastSent <
        1500
      ) {

        return;

      }


      proctoringEventLockRef.current[
        lockKey
      ] = now;


      try {

        await recordProctoringEvent(
          interviewId,
          {
            event_type:
              eventType,

            severity:
              severity,

            message:
              message,

            metadata:
              metadata,
          }
        );

      } catch (error) {

        console.warn(
          "Unable to record proctoring event:",
          eventType,
          error
        );

      }

    };


  // =======================================================
  // LOAD INTERVIEW
  // =======================================================

  useEffect(() => {

    loadInterview();


    return () => {

      stopCVMonitoring();

      stopMicrophoneMonitoring();

      stopMedia();


      if (
        timerRef.current
      ) {

        clearInterval(
          timerRef.current
        );

        timerRef.current =
          null;

      }


      if (
        saveTimerRef.current
      ) {

        clearTimeout(
          saveTimerRef.current
        );

        saveTimerRef.current =
          null;

      }


      proctoringStartedRef.current =
        false;

    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    interviewId,
  ]);


  // =======================================================
  // LOAD INTERVIEW
  // =======================================================

  const loadInterview =
    async () => {

      try {

        setLoading(true);


        if (!interviewId) {

          toast.error(
            "Interview ID is missing."
          );

          navigate(
            "/interviews"
          );

          return;

        }


        const response =
          await getInterview(
            interviewId
          );


        console.log(
          "INTERVIEW DETAILS:",
          response
        );


        const interviewData =
          response?.interview ||
          response?.data ||
          response;


        if (
          !interviewData ||
          typeof interviewData !==
            "object"
        ) {

          throw new Error(
            "Interview not found."
          );

        }


        setInterview(
          interviewData
        );


        const backendQuestions =
          extractQuestionsFromResponse(
            response,
            interviewData
          );


        console.log(
          "QUESTIONS FROM BACKEND:",
          backendQuestions
        );


        if (
          backendQuestions.length >
          0
        ) {

          setQuestions(
            backendQuestions
          );

          setQuestionsSource(
            "backend"
          );

        } else {

          setQuestions([]);

          setQuestionsSource("");

        }


        const existingAnswers =
          Array.isArray(
            interviewData?.answers
          )
            ? interviewData.answers
                .map(
                  (answer) => ({
                    question_id:
                      Number(
                        answer?.question_id
                      ),

                    answer:
                      answer?.answer ||
                      answer?.response ||
                      answer?.text ||
                      "",
                  })
                )
                .filter(
                  (answer) =>
                    Number.isFinite(
                      answer.question_id
                    )
                )
            : [];


        setAnswers(
          existingAnswers
        );


        /*
         * IMPORTANT
         *
         * If backend says In Progress,
         * we do NOT automatically start camera.
         *
         * User can resume through the
         * normal Start/Resume button.
         */

        if (
          interviewData?.status ===
          "In Progress"
        ) {

          if (
            backendQuestions.length ===
            0
          ) {

            toast.error(
              "Interview is in progress but AI questions were not found."
            );

            setStarted(false);

          } else {

            /*
             * We keep the UI in resume mode
             * so camera permission happens from
             * a real user click.
             */

            setStarted(false);

          }

        }

      } catch (error) {

        console.error(
          "Load Interview Error:",
          error
        );


        toast.error(
          error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          "Unable to load interview."
        );

      } finally {

        setLoading(false);

      }

    };


  // =======================================================
  // EXTRACT QUESTIONS
  // =======================================================

  const extractQuestionsFromResponse =
    (
      response,
      interviewData
    ) => {

      const possibleSources = [

        response?.questions,

        interviewData?.questions,

        response?.generated_questions,

        interviewData?.generated_questions,

        response?.question_set,

        interviewData?.question_set,

        response?.data?.questions,

        response?.data?.generated_questions,

        interviewData?.data?.questions,

      ];


      for (
        const source of possibleSources
      ) {

        if (
          source &&
          typeof source ===
            "object"
        ) {

          const extracted =
            extractQuestions(
              source
            );


          if (
            extracted.length >
            0
          ) {

            return extracted;

          }

        }

      }


      return [];

    };


  // =======================================================
  // EXTRACT QUESTION COLLECTION
  // =======================================================

  const extractQuestions =
    (
      questionData
    ) => {

      if (
        Array.isArray(
          questionData
        )
      ) {

        return normalizeQuestions(
          questionData
        );

      }


      if (
        !questionData ||
        typeof questionData !==
          "object"
      ) {

        return [];

      }


      const categories = [

        "technical_questions",

        "hr_questions",

        "behavioral_questions",

        "technical",

        "hr",

        "behavioral",

        "questions",

        "interview_questions",

        "generated_questions",

      ];


      const extracted = [];

      const usedIds =
        new Set();


      categories.forEach(
        (category) => {

          const categoryQuestions =
            questionData[
              category
            ];


          if (
            !Array.isArray(
              categoryQuestions
            )
          ) {

            return;

          }


          categoryQuestions.forEach(
            (
              question
            ) => {

              if (
                !question ||
                typeof question !==
                  "object"
              ) {

                return;

              }


              const normalized =
                normalizeSingleQuestion(
                  question
                );


              if (
                !normalized.question
              ) {

                return;

              }


              if (
                usedIds.has(
                  normalized.question_id
                )
              ) {

                return;

              }


              usedIds.add(
                normalized.question_id
              );


              extracted.push(
                normalized
              );

            }
          );

        }
      );


      return extracted;

    };


  // =======================================================
  // NORMALIZE QUESTION
  // =======================================================

  const normalizeSingleQuestion =
    (
      question,
      fallbackId = null
    ) => {

      const questionId =
        Number(
          question?.question_id ??
          question?.id ??
          fallbackId
        );


      const text =
        String(
          question?.question ??
          question?.text ??
          question?.question_text ??
          ""
        ).trim();


      const category =
        String(
          question?.category ??
          question?.type ??
          question?.question_type ??
          "General"
        ).trim();


      let type =
        category;


      if (
        category
          .toLowerCase()
          .includes(
            "technical"
          )
      ) {

        type =
          "Technical";

      } else if (
        category
          .toLowerCase()
          .includes(
            "hr"
          )
      ) {

        type =
          "HR";

      } else if (
        category
          .toLowerCase()
          .includes(
            "behavior"
          )
      ) {

        type =
          "Behavioral";

      }


      return {

        question_id:
          Number.isFinite(
            questionId
          )
            ? questionId
            : fallbackId,

        question:
          text,

        type:
          type ||
          "General",

        category:
          category ||
          "General",

        difficulty:
          question?.difficulty ||
          "Medium",

      };

    };


  // =======================================================
  // NORMALIZE QUESTIONS
  // =======================================================

  const normalizeQuestions =
    (
      questionList
    ) => {

      if (
        !Array.isArray(
          questionList
        )
      ) {

        return [];

      }


      const result = [];

      const usedIds =
        new Set();


      questionList.forEach(
        (
          question,
          index
        ) => {

          const normalized =
            normalizeSingleQuestion(
              question,
              index + 1
            );


          if (
            !normalized.question
          ) {

            return;

          }


          if (
            usedIds.has(
              normalized.question_id
            )
          ) {

            return;

          }


          usedIds.add(
            normalized.question_id
          );


          result.push(
            normalized
          );

        }
      );


      return result;

    };


  // =======================================================
  // REQUEST CAMERA + MICROPHONE
  // =======================================================

  const requestMediaPermissions =
    async () => {

      if (
        !navigator.mediaDevices ||
        !navigator.mediaDevices
          .getUserMedia
      ) {

        throw new Error(
          "Camera and microphone are not supported by this browser."
        );

      }


      /*
       * Stop an old stream first.
       */

      if (
        streamRef.current
      ) {

        streamRef.current
          .getTracks()
          .forEach(
            (
              track
            ) => {

              try {

                track.stop();

              } catch {}

            }
          );

      }


      /*
       * Request both camera + microphone.
       */

      const stream =
        await navigator
          .mediaDevices
          .getUserMedia(
            {
              video: {
                facingMode:
                  "user",

                width: {
                  ideal: 1280,
                },

                height: {
                  ideal: 720,
                },
              },

              audio: true,
            }
          );


      const videoTracks =
        stream.getVideoTracks();


      const audioTracks =
        stream.getAudioTracks();


      const videoLive =
        videoTracks.some(
          (
            track
          ) =>
            track.readyState ===
            "live"
        );


      const audioLive =
        audioTracks.some(
          (
            track
          ) =>
            track.readyState ===
            "live"
        );


      if (
        !videoLive
      ) {

        stream
          .getTracks()
          .forEach(
            (
              track
            ) =>
              track.stop()
          );


        throw new Error(
          "Camera is not ready."
        );

      }


      /*
       * CRITICAL FIX
       *
       * Store stream FIRST.
       *
       * Do NOT depend on videoRef.current
       * because the video element may not exist
       * before setStarted(true).
       */

      streamRef.current =
        stream;


      setCameraEnabled(
        videoLive
      );


      setMicrophoneEnabled(
        audioLive
      );


      setMediaReady(
        true
      );


      /*
       * Monitor hardware track changes.
       */

      stream
        .getTracks()
        .forEach(
          (
            track
          ) => {

            track.addEventListener(
              "ended",
              () => {

                if (
                  track.kind ===
                  "video"
                ) {

                  setCameraEnabled(
                    false
                  );

                  setMediaReady(
                    false
                  );


                  if (
                    proctoringStartedRef.current
                  ) {

                    sendProctoringEvent(
                      "camera_disabled",
                      "high",
                      "Camera track stopped during interview.",
                      {
                        track:
                          "video",
                      }
                    );

                  }

                }


                if (
                  track.kind ===
                  "audio"
                ) {

                  setMicrophoneEnabled(
                    false
                  );


                  if (
                    proctoringStartedRef.current
                  ) {

                    sendProctoringEvent(
                      "microphone_disabled",
                      "high",
                      "Microphone track stopped during interview.",
                      {
                        track:
                          "audio",
                      }
                    );

                  }

                }

              }
            );

          }
        );


      /*
       * Microphone level monitoring
       * can start immediately because
       * the stream already exists.
       */

      startMicrophoneMonitoring(
        stream
      );


      return stream;

    };


  // =======================================================
  // ATTACH CAMERA STREAM
  // =======================================================
  //
  // THIS IS THE IMPORTANT FIX.
  //
  // The video element exists only after
  // started === true.
  //
  // =======================================================

  useEffect(() => {

    if (
      !started
    ) {

      return;

    }


    const stream =
      streamRef.current;


    const video =
      videoRef.current;


    if (
      !stream ||
      !video
    ) {

      console.warn(
        "Camera attach skipped:",
        {
          hasStream:
            Boolean(
              stream
            ),

          hasVideo:
            Boolean(
              video
            ),
        }
      );

      return;

    }


    /*
     * Attach stream AFTER video mounts.
     */

    if (
      video.srcObject !==
      stream
    ) {

      video.srcObject =
        stream;

    }


    const playVideo =
      async () => {

        try {

          await video.play();

          console.log(
            "Camera preview started successfully.",
            {
              readyState:
                video.readyState,

              width:
                video.videoWidth,

              height:
                video.videoHeight,
            }
          );

        } catch (error) {

          console.warn(
            "Video play warning:",
            error
          );

        }

      };


    if (
      video.readyState >=
      1
    ) {

      playVideo();

    } else {

      video.onloadedmetadata =
        playVideo;

    }


    return () => {

      if (
        video.onloadedmetadata ===
        playVideo
      ) {

        video.onloadedmetadata =
          null;

      }

    };

  }, [
    started,
    mediaReady,
  ]);


  // =======================================================
  // STOP MEDIA
  // =======================================================

  const stopMedia = () => {

    if (
      streamRef.current
    ) {

      streamRef.current
        .getTracks()
        .forEach(
          (
            track
          ) => {

            try {

              track.stop();

            } catch {}

          }
        );


      streamRef.current =
        null;

    }


    if (
      videoRef.current
    ) {

      try {

        videoRef.current.pause();

      } catch {}


      videoRef.current.srcObject =
        null;

    }


    stopMicrophoneMonitoring();


    setCameraEnabled(
      false
    );

    setMicrophoneEnabled(
      false
    );

    setMediaReady(
      false
    );

    setMicLevel(
      0
    );

    setMicSpeaking(
      false
    );

  };


  // =======================================================
  // MICROPHONE MONITORING
  // =======================================================

  const startMicrophoneMonitoring =
    (
      stream
    ) => {

      try {

        stopMicrophoneMonitoring();


        const audioTracks =
          stream?.getAudioTracks?.() ||
          [];


        if (
          audioTracks.length ===
          0
        ) {

          setMicrophoneEnabled(
            false
          );

          return;

        }


        const AudioContextClass =
          window.AudioContext ||
          window.webkitAudioContext;


        if (
          !AudioContextClass
        ) {

          console.warn(
            "Web Audio API is not supported."
          );

          return;

        }


        const audioContext =
          new AudioContextClass();


        const analyser =
          audioContext.createAnalyser();


        analyser.fftSize =
          512;


        analyser.smoothingTimeConstant =
          0.8;


        const source =
          audioContext
            .createMediaStreamSource(
              stream
            );


        source.connect(
          analyser
        );


        const data =
          new Uint8Array(
            analyser.fftSize
          );


        audioContextRef.current =
          audioContext;

        analyserRef.current =
          analyser;

        audioDataRef.current =
          data;


        if (
          audioContext.state ===
          "suspended"
        ) {

          audioContext
            .resume()
            .catch(
              () => {}
            );

        }


        const checkMicrophone =
          () => {

            try {

              if (
                !analyserRef.current ||
                !audioDataRef.current
              ) {

                return;

              }


              analyserRef.current
                .getByteTimeDomainData(
                  audioDataRef.current
                );


              let sum = 0;


              for (
                let i = 0;
                i <
                audioDataRef.current
                  .length;
                i++
              ) {

                const normalized =
                  (
                    audioDataRef.current[
                      i
                    ] - 128
                  ) / 128;


                sum +=
                  normalized *
                  normalized;

              }


              const rms =
                Math.sqrt(
                  sum /
                  audioDataRef.current
                    .length
                );


              const level =
                Math.min(
                  100,
                  Math.round(
                    rms * 500
                  )
                );


              setMicLevel(
                level
              );


              setMicSpeaking(
                level > 8
              );

            } catch (
              error
            ) {

              console.warn(
                "Microphone level check failed:",
                error
              );

            }

          };


        checkMicrophone();


        micTimerRef.current =
          setInterval(
            checkMicrophone,
            100
          );

      } catch (
        error
      ) {

        console.error(
          "Microphone monitoring failed:",
          error
        );

        setMicLevel(
          0
        );

        setMicSpeaking(
          false
        );

      }

    };


  // =======================================================
  // STOP MICROPHONE MONITORING
  // =======================================================

  const stopMicrophoneMonitoring =
    () => {

      if (
        micTimerRef.current
      ) {

        clearInterval(
          micTimerRef.current
        );

        micTimerRef.current =
          null;

      }


      if (
        audioContextRef.current
      ) {

        try {

          audioContextRef.current.close();

        } catch {}

        audioContextRef.current =
          null;

      }


      analyserRef.current =
        null;

      audioDataRef.current =
        null;


      setMicLevel(
        0
      );

      setMicSpeaking(
        false
      );

    };


  // =======================================================
  // ENTER FULLSCREEN
  // =======================================================

  const enterFullscreen =
    async () => {

      try {

        fullscreenTransitionRef.current =
          true;


        if (
          !document.fullscreenElement
        ) {

          await document.documentElement
            .requestFullscreen();

        }


        setFullscreen(
          Boolean(
            document.fullscreenElement
          )
        );


        setTimeout(
          () => {

            fullscreenTransitionRef.current =
              false;

          },
          1500
        );

      } catch (
        error
      ) {

        fullscreenTransitionRef.current =
          false;

        console.warn(
          "Fullscreen request failed:",
          error
        );

      }

    };


  // =======================================================
  // EXIT FULLSCREEN
  // =======================================================

  const exitFullscreen =
    async () => {

      try {

        fullscreenTransitionRef.current =
          true;


        if (
          document.fullscreenElement
        ) {

          await document.exitFullscreen();

        }


        setFullscreen(
          false
        );


        setTimeout(
          () => {

            fullscreenTransitionRef.current =
              false;

          },
          800
        );

      } catch (
        error
      ) {

        fullscreenTransitionRef.current =
          false;

        console.warn(
          "Exit fullscreen failed:",
          error
        );

      }

    };


  // =======================================================
  // CAPTURE CURRENT FRAME
  // =======================================================

  const captureCurrentFrame =
    async () => {

      if (
        !videoRef.current ||
        !canvasRef.current
      ) {

        return null;

      }


      const video =
        videoRef.current;


      /*
       * Wait until actual camera pixels
       * are available.
       */

      if (
        video.readyState <
          2 ||
        video.videoWidth <=
          0 ||
        video.videoHeight <=
          0
      ) {

        return null;

      }


      const canvas =
        canvasRef.current;


      const maxWidth =
        960;


      const scale =
        Math.min(
          1,
          maxWidth /
            video.videoWidth
        );


      canvas.width =
        Math.floor(
          video.videoWidth *
            scale
        );


      canvas.height =
        Math.floor(
          video.videoHeight *
            scale
        );


      const context =
        canvas.getContext(
          "2d",
          {
            alpha:
              false,
          }
        );


      if (
        !context
      ) {

        return null;

      }


      context.drawImage(
        video,
        0,
        0,
        canvas.width,
        canvas.height
      );


      return new Promise(
        (
          resolve
        ) => {

          canvas.toBlob(
            (
              blob
            ) => {

              resolve(
                blob
              );

            },
            "image/jpeg",
            0.72
          );

        }
      );

    };


  // =======================================================
  // EXTRACT CV RESULT
  // =======================================================

  const extractCVResult =
    (
      response
    ) => {

      if (
        response?.cv_result
      ) {

        return response.cv_result;

      }


      if (
        response?.result
      ) {

        return response.result;

      }


      if (
        response?.data?.cv_result
      ) {

        return response.data.cv_result;

      }


      if (
        response?.data?.result
      ) {

        return response.data.result;

      }


      if (
        response &&
        typeof response ===
          "object"
      ) {

        return response;

      }


      return {};

    };


  // =======================================================
  // PROCESS CURRENT CV FRAME
  // =======================================================

  const processCurrentCVFrame =
    async () => {

      if (
        !started ||
        !interviewId ||
        !cameraEnabled ||
        !streamRef.current
      ) {

        return;

      }


      if (
        cvBusyRef.current
      ) {

        return;

      }


      cvBusyRef.current =
        true;


      setCvProcessing(
        true
      );


      try {

        const frameBlob =
          await captureCurrentFrame();


        if (
          !frameBlob
        ) {

          return;

        }


        const response =
          await processCVFrame(
            interviewId,
            frameBlob
          );


        const result =
          extractCVResult(
            response
          );


        const faceCount =
          Number(
            result?.face_count ??
            0
          );


        const personCount =
          Number(
            result?.person_count ??
            0
          );


        const phoneDetected =
          Boolean(
            result?.phone_detected
          );


        const cameraBlocked =
          Boolean(
            result?.camera_blocked
          );


        const movementScore =
          Number(
            result?.movement_score ??
            0
          );


        setCvFaceCount(
          Number.isFinite(
            faceCount
          )
            ? faceCount
            : 0
        );


        setCvPersonCount(
          Number.isFinite(
            personCount
          )
            ? personCount
            : 0
        );


        setCvPhoneDetected(
          phoneDetected
        );


        setCvCameraBlocked(
          cameraBlocked
        );


        setCvMovementScore(
          Number.isFinite(
            movementScore
          )
            ? movementScore
            : 0
        );


        setCvLastScan(
          new Date()
        );


        setCvActive(
          true
        );


        setCvError(
          ""
        );


        // =================================================
        // EVENTS
        // =================================================
        //
        // IMPORTANT:
        //
        // /process-frame already records
        // CV events in MongoDB.
        //
        // DO NOT call recordProctoringEvent()
        // for these events again.
        //

        const events =
          Array.isArray(
            response?.detected_events
          )
            ? response.detected_events
            : Array.isArray(
                response?.data
                  ?.detected_events
              )
            ? response.data
                .detected_events
            : Array.isArray(
                result?.events
              )
            ? result.events
            : [];


        if (
          events.length >
          0
        ) {

          setCvEventCount(
            (
              previous
            ) =>
              previous +
              events.length
          );


          const seriousEvent =
            events.find(
              (
                event
              ) =>
                event?.severity ===
                  "high" ||
                event?.event_type ===
                  "phone_detected" ||
                event?.event_type ===
                  "multiple_faces_detected" ||
                event?.event_type ===
                  "person_left_frame"
            );


          if (
            seriousEvent
          ) {

            setProctoringWarning(
              seriousEvent?.message ||
              "Computer vision detected a proctoring warning."
            );

          } else {

            const mediumEvent =
              events.find(
                (
                  event
                ) =>
                  event?.severity ===
                  "medium"
              );


            if (
              mediumEvent
            ) {

              setProctoringWarning(
                mediumEvent?.message ||
                "Computer vision detected a warning."
              );

            }

          }

        }


        // =================================================
        // VISUAL CV WARNING
        // =================================================

        if (
          cameraBlocked
        ) {

          setProctoringWarning(
            "Warning: Camera appears to be blocked."
          );

        } else if (
          phoneDetected
        ) {

          setProctoringWarning(
            "Warning: A mobile phone was detected."
          );

        } else if (
          faceCount >
          1
        ) {

          setProctoringWarning(
            "Warning: Multiple faces detected."
          );

        } else if (
          faceCount ===
          0
        ) {

          setProctoringWarning(
            "Warning: Candidate face not detected."
          );

        } else if (
          events.some(
            (
              event
            ) =>
              event?.event_type ===
              "looking_away"
          )
        ) {

          setProctoringWarning(
            "Warning: Candidate appears to be looking away."
          );

        } else if (
          events.some(
            (
              event
            ) =>
              event?.event_type ===
              "head_pose_warning"
          )
        ) {

          setProctoringWarning(
            "Warning: Head pose warning detected."
          );

        } else {

          /*
           * Clear only CV warnings.
           *
           * Keep browser warnings.
           */

          setProctoringWarning(
            (
              previous
            ) => {

              const lower =
                previous
                  ?.toLowerCase?.() ||
                "";


              if (
                lower.includes(
                  "tab"
                ) ||
                lower.includes(
                  "fullscreen"
                ) ||
                lower.includes(
                  "window"
                )
              ) {

                return previous;

              }


              return "";

            }
          );

        }

      } catch (
        error
      ) {

        console.warn(
          "CV frame processing failed:",
          error
        );


        setCvError(
          error?.response
            ?.data
            ?.detail ||
          error?.response
            ?.data
            ?.message ||
          error?.message ||
          "CV scan failed."
        );

        /*
         * CV failure is non-fatal.
         */

      } finally {

        cvBusyRef.current =
          false;

        setCvProcessing(
          false
        );

      }

    };


  // =======================================================
  // START CV MONITORING
  // =======================================================

  const startCVMonitoring =
    () => {

      stopCVMonitoring();


      setCvActive(
        true
      );


      /*
       * Give video element time
       * to start producing pixels.
       */

      cvInitialTimeoutRef.current =
        setTimeout(
          () => {

            processCurrentCVFrame();

          },
          1500
        );


      /*
       * Scan every 2.5 seconds.
       */

      cvTimerRef.current =
        setInterval(
          () => {

            processCurrentCVFrame();

          },
          2500
        );

    };


  // =======================================================
  // STOP CV MONITORING
  // =======================================================

  const stopCVMonitoring =
    () => {

      if (
        cvTimerRef.current
      ) {

        clearInterval(
          cvTimerRef.current
        );

        cvTimerRef.current =
          null;

      }


      if (
        cvInitialTimeoutRef.current
      ) {

        clearTimeout(
          cvInitialTimeoutRef.current
        );

        cvInitialTimeoutRef.current =
          null;

      }


      cvBusyRef.current =
        false;


      setCvProcessing(
        false
      );


      setCvActive(
        false
      );

    };


  // =======================================================
  // START CV WHEN CAMERA IS READY
  // =======================================================

  useEffect(() => {

    if (
      started &&
      cameraEnabled &&
      mediaReady
    ) {

      startCVMonitoring();

    } else {

      stopCVMonitoring();

    }


    return () => {

      stopCVMonitoring();

    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    started,
    cameraEnabled,
    mediaReady,
    interviewId,
  ]);


  // =======================================================
  // FULLSCREEN MONITORING
  // =======================================================

  useEffect(() => {

    const handleFullscreenChange =
      () => {

        const isFullscreen =
          Boolean(
            document.fullscreenElement
          );


        setFullscreen(
          isFullscreen
        );


        /*
         * Ignore the fullscreen change
         * caused by our own transition.
         */

        if (
          fullscreenTransitionRef.current
        ) {

          return;

        }


        if (
          started &&
          !isFullscreen
        ) {

          setProctoringWarning(
            "Warning: Fullscreen mode was exited. Please return to fullscreen."
          );


          toast.error(
            "Fullscreen exit detected."
          );


          sendProctoringEvent(
            "fullscreen_exit",
            "high",
            "Candidate exited fullscreen mode.",
            {
              source:
                "browser",
            }
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

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    started,
    interviewId,
  ]);


  // =======================================================
  // TAB / WINDOW MONITORING
  // =======================================================

  useEffect(() => {

    if (
      !started
    ) {

      return;

    }


    const handleVisibilityChange =
      () => {

        if (
          document.hidden
        ) {

          setTabSwitches(
            (
              previous
            ) =>
              previous + 1
          );


          setProctoringWarning(
            "Warning: Please stay on the interview screen."
          );


          toast.error(
            "Tab switching detected."
          );


          sendProctoringEvent(
            "tab_switch",
            "high",
            "Candidate switched away from the interview tab.",
            {
              visibility_state:
                document.visibilityState,
            }
          );

        }

      };


    const handleWindowBlur =
      () => {

        /*
         * Browser blur can happen during
         * fullscreen transitions.
         *
         * Do not report that as a violation.
         */

        if (
          fullscreenTransitionRef.current
        ) {

          return;

        }


        if (
          !document.hidden
        ) {

          setProctoringWarning(
            "Warning: Interview window lost focus."
          );


          sendProctoringEvent(
            "window_blur",
            "medium",
            "Interview window lost focus.",
            {}
          );

        }

      };


    const handleWindowFocus =
      () => {

        if (
          document.fullscreenElement
        ) {

          return;

        }


        setProctoringWarning(
          "Warning: Return to fullscreen interview mode."
        );

      };


    document.addEventListener(
      "visibilitychange",
      handleVisibilityChange
    );


    window.addEventListener(
      "blur",
      handleWindowBlur
    );


    window.addEventListener(
      "focus",
      handleWindowFocus
    );


    return () => {

      document.removeEventListener(
        "visibilitychange",
        handleVisibilityChange
      );


      window.removeEventListener(
        "blur",
        handleWindowBlur
      );


      window.removeEventListener(
        "focus",
        handleWindowFocus
      );

    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    started,
    interviewId,
  ]);


  // =======================================================
  // COPY / PASTE / KEYBOARD PROTECTION
  // =======================================================

  useEffect(() => {

    if (
      !started
    ) {

      return;

    }


    const preventCopy =
      (
        event
      ) => {

        event.preventDefault();


        toast.error(
          "Copying is disabled during the interview."
        );


        sendProctoringEvent(
          "copy",
          "medium",
          "Copy action blocked during interview.",
          {}
        );

      };


    const preventPaste =
      (
        event
      ) => {

        event.preventDefault();


        toast.error(
          "Pasting is disabled during the interview."
        );


        sendProctoringEvent(
          "paste",
          "medium",
          "Paste action blocked during interview.",
          {}
        );

      };


    const preventCut =
      (
        event
      ) => {

        event.preventDefault();


        toast.error(
          "Cutting is disabled during the interview."
        );


        sendProctoringEvent(
          "copy_paste",
          "medium",
          "Cut action blocked during interview.",
          {
            action:
              "cut",
          }
        );

      };


    const preventContextMenu =
      (
        event
      ) => {

        event.preventDefault();


        sendProctoringEvent(
          "context_menu",
          "medium",
          "Right-click/context menu blocked during interview.",
          {}
        );

      };


    const handleKeyDown =
      (
        event
      ) => {

        const key =
          String(
            event.key ||
            ""
          ).toLowerCase();


        const modifier =
          event.ctrlKey ||
          event.metaKey;


        const blockedShortcut =
          (
            modifier &&
            [
              "c",
              "v",
              "x",
              "a",
              "s",
              "p",
              "u",
            ].includes(
              key
            )
          ) ||
          (
            event.ctrlKey &&
            event.shiftKey &&
            [
              "i",
              "j",
              "c",
            ].includes(
              key
            )
          ) ||
          key ===
            "f12";


        if (
          blockedShortcut
        ) {

          event.preventDefault();

          event.stopPropagation();


          toast.error(
            "This keyboard shortcut is disabled during the interview."
          );


          sendProctoringEvent(
            "suspicious_keyboard_shortcut",
            "high",
            "Blocked browser/devtools keyboard shortcut.",
            {
              key:
                event.key,

              ctrl:
                event.ctrlKey,

              meta:
                event.metaKey,

              shift:
                event.shiftKey,
            }
          );

        }

      };


    const handleBeforeUnload =
      (
        event
      ) => {

        if (
          !submitting
        ) {

          event.preventDefault();


          event.returnValue =
            "Your interview is still in progress.";


          sendProctoringEvent(
            "page_exit_attempt",
            "high",
            "Candidate attempted to leave the interview page.",
            {}
          );


          return event.returnValue;

        }


        return undefined;

      };


    document.addEventListener(
      "copy",
      preventCopy
    );

    document.addEventListener(
      "paste",
      preventPaste
    );

    document.addEventListener(
      "cut",
      preventCut
    );

    document.addEventListener(
      "contextmenu",
      preventContextMenu
    );

    document.addEventListener(
      "keydown",
      handleKeyDown,
      true
    );

    window.addEventListener(
      "beforeunload",
      handleBeforeUnload
    );


    return () => {

      document.removeEventListener(
        "copy",
        preventCopy
      );

      document.removeEventListener(
        "paste",
        preventPaste
      );

      document.removeEventListener(
        "cut",
        preventCut
      );

      document.removeEventListener(
        "contextmenu",
        preventContextMenu
      );

      document.removeEventListener(
        "keydown",
        handleKeyDown,
        true
      );

      window.removeEventListener(
        "beforeunload",
        handleBeforeUnload
      );

    };

  }, [
    started,
    interviewId,
    submitting,
  ]);


  // =======================================================
  // START INTERVIEW
  // =======================================================

  const handleStartInterview =
    async () => {

      try {

        setStarting(
          true
        );


        const studentId =
          getStudentId();


        if (
          !studentId
        ) {

          throw new Error(
            "Student ID not found. Please login again."
          );

        }


        if (
          !interviewId
        ) {

          throw new Error(
            "Interview ID not found."
          );

        }


        // =================================================
        // CAMERA + MIC
        // =================================================

        /*
         * This happens from the real button click,
         * so browser permission is allowed.
         */

        await requestMediaPermissions();


        /*
         * Fullscreen.
         */

        await enterFullscreen();


        if (
          !document.fullscreenElement
        ) {

          throw new Error(
            "Fullscreen permission is required to start the interview."
          );

        }


        setFullscreen(
          true
        );


        // =================================================
        // BACKEND START
        // =================================================

        console.log(
          "Calling AI interview start API..."
        );


        const response =
          await startInterview(
            interviewId,
            studentId
          );


        console.log(
          "REAL START INTERVIEW RESPONSE:",
          response
        );


        const interviewData =
          response?.interview ||
          response?.data?.interview ||
          response?.data ||
          response;


        if (
          interviewData &&
          typeof interviewData ===
            "object"
        ) {

          setInterview(
            interviewData
          );

        }


        // =================================================
        // QUESTIONS
        // =================================================

        const aiQuestions =
          extractQuestionsFromResponse(
            response,
            interviewData
          );


        console.log(
          "AI GENERATED QUESTIONS:",
          aiQuestions
        );


        if (
          aiQuestions.length ===
          0
        ) {

          throw new Error(
            "AI interview started, but the backend returned no interview questions."
          );

        }


        if (
          aiQuestions.length <
          10
        ) {

          console.warn(
            `Backend returned ${aiQuestions.length} questions instead of 10.`
          );

        }


        setQuestions(
          aiQuestions
        );


        setQuestionsSource(
          "AI backend"
        );


        // =================================================
        // PROCTORING START
        // =================================================

        proctoringStartedRef.current =
          true;


        setCurrentQuestion(
          0
        );


        // =================================================
        // EXISTING ANSWERS
        // =================================================

        const backendAnswers =
          Array.isArray(
            interviewData?.answers
          )
            ? interviewData.answers.map(
                (
                  answer
                ) => ({
                  question_id:
                    Number(
                      answer?.question_id
                    ),

                  answer:
                    answer?.answer ||
                    "",
                })
              )
            : [];


        setAnswers(
          backendAnswers
        );


        answersRef.current =
          backendAnswers;


        // =================================================
        // IMPORTANT CAMERA FIX
        // =================================================

        /*
         * Stream already exists in streamRef.
         *
         * setStarted(true) mounts the video element.
         *
         * The useEffect above will then attach
         * streamRef.current -> videoRef.current.
         */

        setStarted(
          true
        );


        // =================================================
        // TIMER
        // =================================================

        const duration =
          Number(
            interviewData?.duration ||
            interview?.duration ||
            30
          );


        startTimer(
          duration
        );


        toast.success(
          `AI interview started with ${aiQuestions.length} questions.`
        );

      } catch (
        error
      ) {

        console.error(
          "Start Interview Error:",
          error
        );


        proctoringStartedRef.current =
          false;


        stopCVMonitoring();

        stopMedia();


        await exitFullscreen();


        toast.error(
          error?.response
            ?.data
            ?.detail ||
          error?.response
            ?.data
            ?.message ||
          error?.message ||
          "Unable to start interview."
        );

      } finally {

        setStarting(
          false
        );

      }

    };


  // =======================================================
  // TIMER
  // =======================================================

  const startTimer =
    (
      minutes
    ) => {

      const totalSeconds =
        Math.max(
          1,
          Math.floor(
            Number(
              minutes
            ) * 60
          )
        );


      setTimeLeft(
        totalSeconds
      );


      if (
        timerRef.current
      ) {

        clearInterval(
          timerRef.current
        );

      }


      timerRef.current =
        setInterval(
          () => {

            setTimeLeft(
              (
                previous
              ) => {

                if (
                  previous ===
                  null
                ) {

                  return null;

                }


                if (
                  previous <=
                  1
                ) {

                  clearInterval(
                    timerRef.current
                  );


                  timerRef.current =
                    null;


                  toast.error(
                    "Interview time is over."
                  );


                  setShowSubmitModal(
                    true
                  );


                  return 0;

                }


                return previous - 1;

              }
            );

          },
          1000
        );

    };


  // =======================================================
  // FORMAT TIME
  // =======================================================

  const formatTimeLeft =
    (
      seconds
    ) => {

      if (
        seconds ===
          null ||
        seconds ===
          undefined
      ) {

        return "--:--";

      }


      const minutes =
        Math.floor(
          seconds /
          60
        );


      const remainingSeconds =
        seconds %
        60;


      return (
        `${String(
          minutes
        ).padStart(
          2,
          "0"
        )}:${String(
          remainingSeconds
        ).padStart(
          2,
          "0"
        )}`
      );

    };


  // =======================================================
  // CURRENT QUESTION
  // =======================================================

  const question =
    questions[
      currentQuestion
    ];


  // =======================================================
  // CURRENT ANSWER
  // =======================================================

  const getCurrentAnswer =
    () => {

      if (
        !question
      ) {

        return "";

      }


      const existingAnswer =
        answers.find(
          (
            answer
          ) =>
            String(
              answer.question_id
            ) ===
            String(
              question.question_id
            )
        );


      return (
        existingAnswer?.answer ||
        ""
      );

    };


  // =======================================================
  // ANSWER CHANGE
  // =======================================================

  const handleAnswerChange =
    (
      value
    ) => {

      if (
        !question
      ) {

        return;

      }


      const questionId =
        question.question_id;


      setAnswers(
        (
          previous
        ) => {

          const updated =
            [
              ...previous,
            ];


          const index =
            updated.findIndex(
              (
                answer
              ) =>
                String(
                  answer.question_id
                ) ===
                String(
                  questionId
                )
            );


          if (
            index >=
            0
          ) {

            updated[
              index
            ] = {

              ...updated[
                index
              ],

              answer:
                value,

            };

          } else {

            updated.push({

              question_id:
                questionId,

              answer:
                value,

            });

          }


          answersRef.current =
            updated;


          return updated;

        }
      );


      if (
        saveTimerRef.current
      ) {

        clearTimeout(
          saveTimerRef.current
        );

      }


      saveTimerRef.current =
        setTimeout(
          () => {

            saveAnswers(
              answersRef.current
            );

          },
          1000
        );

    };


  // =======================================================
  // SAVE ANSWERS
  // =======================================================

  const saveAnswers =
    async (
      answersToSave =
        answersRef.current
    ) => {

      if (
        !interviewId ||
        !Array.isArray(
          answersToSave
        ) ||
        answersToSave.length ===
          0
      ) {

        return;

      }


      try {

        const studentId =
          getStudentId();


        if (
          !studentId
        ) {

          console.warn(
            "Student ID not found while saving answers."
          );

          return;

        }


        await updateAnswers(
          interviewId,
          answersToSave,
          studentId
        );

      } catch (
        error
      ) {

        console.error(
          "Auto-save answers failed:",
          error
        );

      }

    };


  // =======================================================
  // NEXT
  // =======================================================

  const nextQuestion =
    () => {

      if (
        currentQuestion <
        questions.length -
          1
      ) {

        setCurrentQuestion(
          (
            previous
          ) =>
            previous + 1
        );


        window.scrollTo({
          top:
            0,

          behavior:
            "smooth",
        });

      }

    };


  // =======================================================
  // PREVIOUS
  // =======================================================

  const previousQuestion =
    () => {

      if (
        currentQuestion >
        0
      ) {

        setCurrentQuestion(
          (
            previous
          ) =>
            previous - 1
        );

      }

    };


  // =======================================================
  // SUBMIT
  // =======================================================

  const handleSubmitInterview =
    async () => {

      try {

        setSubmitting(
          true
        );


        /*
         * Stop new CV events immediately.
         */

        proctoringStartedRef.current =
          false;


        stopCVMonitoring();


        const studentId =
          getStudentId();


        if (
          !studentId
        ) {

          throw new Error(
            "Student ID not found. Please login again."
          );

        }


        if (
          questions.length ===
          0
        ) {

          throw new Error(
            "No AI interview questions are available."
          );

        }


        const finalAnswers =
          questions.map(
            (
              questionItem
            ) => {

              const answer =
                answers.find(
                  (
                    item
                  ) =>
                    String(
                      item.question_id
                    ) ===
                    String(
                      questionItem.question_id
                    )
                );


              return {

                question_id:
                  questionItem.question_id,

                answer:
                  answer?.answer ||
                  "",

              };

            }
          );


        /*
         * Final save.
         */

        await updateAnswers(
          interviewId,
          finalAnswers,
          studentId
        );


        /*
         * Final submit.
         */

        await submitInterview(
          interviewId,
          finalAnswers,
          studentId
        );


        toast.success(
          "Interview submitted successfully."
        );


        /*
         * Cleanup.
         */

        stopCVMonitoring();

        stopMedia();


        if (
          timerRef.current
        ) {

          clearInterval(
            timerRef.current
          );

          timerRef.current =
            null;

        }


        await exitFullscreen();


        navigate(
          `/student/interview/${interviewId}/result`
        );

      } catch (
        error
      ) {

        console.error(
          "Submit Interview Error:",
          error
        );


        /*
         * Re-enable event recording
         * if submission failed.
         */

        proctoringStartedRef.current =
          true;


        toast.error(
          error?.response
            ?.data
            ?.detail ||
          error?.response
            ?.data
            ?.message ||
          error?.message ||
          "Failed to submit interview."
        );

      } finally {

        setSubmitting(
          false
        );

      }

    };


  // =======================================================
  // ANSWERED COUNT
  // =======================================================

  const answeredCount =
    questions.filter(
      (
        questionItem
      ) =>
        answers.some(
          (
            answer
          ) =>
            String(
              answer.question_id
            ) ===
            String(
              questionItem.question_id
            ) &&
            String(
              answer.answer ||
              ""
            ).trim() !==
            ""
        )
    ).length;


  // =======================================================
  // LOADING UI
  // =======================================================

  if (
    loading
  ) {

    return (

      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center">

        <motion.div
          initial={{
            opacity:
              0,

            scale:
              0.95,
          }}
          animate={{
            opacity:
              1,

            scale:
              1,
          }}
          className="text-center"
        >

          <div className="w-20 h-20 mx-auto rounded-2xl bg-[#0F766E]/10 flex items-center justify-center mb-6">

            <Loader2
              size={34}
              className="text-[#0F766E] animate-spin"
            />

          </div>


          <h2 className="text-2xl font-bold text-[#101828]">

            Loading Interview

          </h2>


          <p className="text-[#667085] mt-2">

            Preparing your assessment...

          </p>

        </motion.div>

      </div>

    );

  }


  // =======================================================
  // PRE INTERVIEW
  // =======================================================

  if (
    !started
  ) {

    return (

      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-5">

        <motion.div
          initial={{
            opacity:
              0,

            y:
              20,
          }}
          animate={{
            opacity:
              1,

            y:
              0,
          }}
          className="w-full max-w-2xl"
        >

          <div className="text-center mb-8">

            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0A5C56] flex items-center justify-center mx-auto shadow-2xl shadow-[#0F766E]/30">

              <Brain
                size={36}
                className="text-white"
              />

            </div>


            <h1 className="text-3xl md:text-4xl font-bold mt-5 text-[#101828]">

              AI Interview Assessment

            </h1>


            <p className="text-[#667085] mt-2 text-sm">

              Your interview questions will be
              generated by Recruit_Ai.

            </p>

          </div>


          <div className="bg-white border border-[#101828]/10 rounded-3xl p-6 shadow-sm">

            <div className="flex items-center gap-3 mb-6">

              <div className="w-11 h-11 rounded-2xl bg-[#EAF5F1] flex items-center justify-center">

                <ShieldCheck
                  size={24}
                  className="text-[#0F766E]"
                />

              </div>


              <div>

                <h2 className="font-bold text-[#101828]">

                  Secure Interview Proctoring

                </h2>


                <p className="text-sm text-[#667085]">

                  Camera, microphone, browser and
                  AI computer vision monitoring will
                  be enabled.

                </p>

              </div>

            </div>


            <div className="space-y-3">

              {[
                {
                  icon:
                    Camera,

                  label:
                    "Camera",

                  status:
                    "Required",
                },

                {
                  icon:
                    Mic,

                  label:
                    "Microphone",

                  status:
                    "Required",
                },

                {
                  icon:
                    Maximize,

                  label:
                    "Fullscreen",

                  status:
                    "Required",
                },

                {
                  icon:
                    ScanFace,

                  label:
                    "AI Computer Vision",

                  status:
                    "Enabled",
                },
              ].map(
                (
                  item,
                  index
                ) => {

                  const Icon =
                    item.icon;


                  return (

                    <div
                      key={
                        index
                      }
                      className="flex items-center justify-between p-4 rounded-2xl bg-[#F7F5EF] border border-[#101828]/5"
                    >

                      <div className="flex items-center gap-3">

                        <Icon
                          size={20}
                          className="text-[#0F766E]"
                        />

                        <span className="text-[#101828] font-medium">

                          {
                            item.label
                          }

                        </span>

                      </div>


                      <span className="text-sm font-semibold text-[#0F766E]">

                        {
                          item.status
                        }

                      </span>

                    </div>

                  );

                }
              )}

            </div>


            <div className="mt-6 p-4 rounded-2xl bg-[#EAF5F1] border border-[#BFE5DB]">

              <div className="flex gap-3">

                <Brain
                  size={20}
                  className="text-[#0F766E] flex-shrink-0"
                />


                <p className="text-sm text-[#344054]">

                  Recruit_Ai will generate
                  personalized questions based on
                  the candidate's resume and selected
                  job role.

                </p>

              </div>

            </div>


            <div className="mt-4 p-4 rounded-2xl bg-blue-50 border border-blue-200">

              <div className="flex gap-3">

                <ScanFace
                  size={20}
                  className="text-blue-600 flex-shrink-0"
                />


                <div>

                  <p className="text-sm font-semibold text-blue-800">

                    AI Proctoring

                  </p>


                  <p className="text-sm text-blue-700 mt-1">

                    Computer vision checks face
                    presence, multiple faces, person
                    presence, phone detection, head
                    pose and suspicious movement.

                  </p>

                </div>

              </div>

            </div>


            <div className="mt-4 p-4 rounded-2xl bg-amber-50 border border-amber-200">

              <div className="flex gap-3">

                <AlertTriangle
                  size={20}
                  className="text-amber-600 flex-shrink-0"
                />


                <p className="text-sm text-[#667085]">

                  Do not switch tabs or leave the
                  interview screen during your
                  assessment.

                </p>

              </div>

            </div>


            <button
              onClick={
                handleStartInterview
              }
              disabled={
                starting
              }
              className="w-full mt-6 flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-[#101828] hover:bg-[#0F766E] text-white font-semibold shadow-lg transition-all disabled:opacity-60"
            >

              {starting ? (

                <>

                  <Loader2
                    size={18}
                    className="animate-spin"
                  />

                  Starting AI Interview...

                </>

              ) : (

                <>

                  <Video
                    size={18}
                  />

                  Start AI Interview

                </>

              )}

            </button>


            <button
              onClick={() =>
                navigate(
                  "/interviews"
                )
              }
              disabled={
                starting
              }
              className="w-full mt-3 py-3 text-sm text-[#667085] hover:text-[#101828] transition"
            >

              Back to Interviews

            </button>

          </div>

        </motion.div>

      </div>

    );

  }


  // =======================================================
  // NO QUESTIONS
  // =======================================================

  if (
    questions.length ===
    0
  ) {

    return (

      <div className="min-h-screen bg-[#F7F5EF] flex items-center justify-center p-5">

        <div className="w-full max-w-lg text-center">

          <AlertTriangle
            size={50}
            className="mx-auto text-amber-500"
          />


          <h2 className="text-2xl font-bold text-[#101828] mt-5">

            AI Questions Not Available

          </h2>


          <p className="text-[#667085] mt-3">

            The backend did not return any
            AI-generated interview questions.

          </p>


          <p className="text-xs text-[#98A2B3] mt-3">

            No dummy questions are being displayed.

          </p>


          <button
            onClick={() => {

              stopCVMonitoring();

              stopMedia();

              exitFullscreen();

              navigate(
                "/interviews"
              );

            }}
            className="mt-6 px-5 py-3 rounded-2xl bg-[#101828] hover:bg-[#0F766E] text-white font-semibold transition"
          >

            Back to Interviews

          </button>

        </div>

      </div>

    );

  }


  // =======================================================
  // CURRENT QUESTION DATA
  // =======================================================

  const currentQuestionData =
    questions[
      currentQuestion
    ];


  // =======================================================
  // MAIN INTERVIEW UI
  // =======================================================

  return (

    <div className="min-h-screen bg-[#F7F5EF]">


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="sticky top-0 z-50 bg-[#101828] border-b border-[#101828]/20 shadow-lg">

        <div className="max-w-7xl mx-auto px-4 py-3">

          <div className="flex items-center justify-between gap-4">


            <div className="flex items-center gap-3">

              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#0F766E] to-[#0A5C56] flex items-center justify-center">

                <Brain
                  size={21}
                  className="text-white"
                />

              </div>


              <div className="hidden sm:block">

                <p className="font-bold text-white">

                  Recruit_Ai

                </p>


                <p className="text-xs text-white/50">

                  Professional Assessment

                </p>

              </div>

            </div>


            <div className="flex items-center gap-3">


              <div className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-[#0F766E]/20 border border-[#0F766E]/30 text-[#8FE2D1] text-xs font-semibold">

                <Sparkles
                  size={15}
                />

                AI Generated

              </div>


              <div
                className={`hidden md:flex items-center gap-2 px-3 py-2 rounded-2xl border text-xs font-semibold ${
                  cvActive
                    ? "bg-emerald-500/15 border-emerald-400/20 text-emerald-300"
                    : "bg-white/10 border-white/10 text-white/60"
                }`}
              >

                {cvActive ? (

                  <Activity
                    size={14}
                    className="animate-pulse"
                  />

                ) : (

                  <WifiOff
                    size={14}
                  />

                )}


                {cvActive
                  ? "AI Vision Active"
                  : "AI Vision"}

              </div>


              <div
                className={`flex items-center gap-2 px-4 py-2 rounded-2xl border ${
                  timeLeft !==
                    null &&
                  timeLeft <=
                    300
                    ? "bg-red-500/20 border-red-500/30 text-red-400"
                    : "bg-white/10 border-white/10 text-white"
                }`}
              >

                <Clock
                  size={17}
                />


                <span className="font-bold font-mono text-sm">

                  {
                    formatTimeLeft(
                      timeLeft
                    )
                  }

                </span>

              </div>


              <button
                onClick={
                  enterFullscreen
                }
                className="hidden md:flex p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition"
                title="Fullscreen"
              >

                <Maximize
                  size={18}
                />

              </button>

            </div>

          </div>

        </div>

      </header>


      {/* =================================================
          WARNING
      ================================================= */}

      {proctoringWarning && (

        <div className="bg-amber-50 border-b border-amber-200">

          <div className="max-w-7xl mx-auto px-4 py-3">

            <div className="flex items-center gap-2 text-amber-700">

              <AlertTriangle
                size={18}
              />

              <span className="text-sm font-medium">

                {
                  proctoringWarning
                }

              </span>

            </div>

          </div>

        </div>

      )}


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="max-w-7xl mx-auto px-4 py-6">

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6">


          {/* =================================================
              QUESTION AREA
          ================================================= */}

          <section>


            {/* PROGRESS */}

            <div className="bg-white border border-[#101828]/10 rounded-3xl p-5 mb-5 shadow-sm">

              <div className="flex items-center justify-between mb-3">

                <div>

                  <p className="text-sm text-[#667085]">

                    AI Interview Question

                  </p>


                  <p className="font-bold text-lg text-[#101828]">

                    {
                      currentQuestion +
                      1
                    }

                    <span className="text-[#98A2B3]">

                      {" "}
                      /{" "}
                      {
                        questions.length
                      }

                    </span>

                  </p>

                </div>


                <div className="text-right">

                  <p className="text-sm text-[#667085]">

                    Answered

                  </p>


                  <p className="font-bold text-[#0F766E]">

                    {
                      answeredCount
                    }

                    {" / "}

                    {
                      questions.length
                    }

                  </p>

                </div>

              </div>


              <div className="h-2 bg-[#EAECF0] rounded-full overflow-hidden">

                <div
                  className="h-full bg-[#0F766E] transition-all duration-500"
                  style={{
                    width:
                      `${
                        (
                          (
                            currentQuestion +
                            1
                          ) /
                          questions.length
                        ) *
                        100
                      }%`,
                  }}
                />

              </div>

            </div>


            {/* QUESTION */}

            <motion.div
              key={
                currentQuestion
              }
              initial={{
                opacity:
                  0,

                y:
                  12,
              }}
              animate={{
                opacity:
                  1,

                y:
                  0,
              }}
              className="bg-white border border-[#101828]/10 rounded-3xl p-6 md:p-8 shadow-sm"
            >

              <div className="flex flex-wrap items-center gap-2 mb-6">

                <span className="px-3 py-1 rounded-full bg-[#EAF5F1] text-[#0F766E] border border-[#BFE5DB] text-xs font-semibold">

                  {
                    currentQuestionData.type
                  }

                </span>


                <span className="px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200 text-xs font-semibold">

                  {
                    currentQuestionData.difficulty
                  }

                </span>


                <span className="px-3 py-1 rounded-full bg-purple-50 text-purple-600 border border-purple-200 text-xs font-semibold">

                  AI Generated

                </span>

              </div>


              <h1 className="text-xl md:text-2xl font-bold leading-relaxed text-[#101828]">

                {
                  currentQuestionData.question
                }

              </h1>


              <div className="mt-8">

                <label className="block text-sm font-semibold text-[#344054] mb-3">

                  Your Answer

                </label>


                <textarea
                  value={
                    getCurrentAnswer()
                  }
                  onChange={(
                    event
                  ) =>
                    handleAnswerChange(
                      event.target.value
                    )
                  }
                  placeholder="Type your answer here..."
                  rows={9}
                  className="w-full resize-none rounded-2xl bg-[#FCFCFA] border border-[#D0D5DD] px-5 py-4 text-[#101828] placeholder:text-[#98A2B3] outline-none focus:border-[#0F766E] focus:ring-2 focus:ring-[#0F766E]/10 transition"
                />


                <div className="flex items-center justify-between mt-3">

                  <span className="text-xs text-[#98A2B3]">

                    {
                      getCurrentAnswer()
                        .length
                    }{" "}
                    characters

                  </span>


                  <span className="text-xs text-[#98A2B3]">

                    Autosave enabled

                  </span>

                </div>

              </div>


              {/* NAVIGATION */}

              <div className="flex items-center justify-between mt-7 gap-3">

                <button
                  onClick={
                    previousQuestion
                  }
                  disabled={
                    currentQuestion ===
                    0
                  }
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl border border-[#D0D5DD] text-[#667085] font-semibold hover:bg-[#F2F4F7] disabled:opacity-40 disabled:cursor-not-allowed transition"
                >

                  <ChevronLeft
                    size={18}
                  />

                  Previous

                </button>


                {currentQuestion <
                questions.length -
                  1 ? (

                  <button
                    onClick={
                      nextQuestion
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#0F766E] hover:bg-[#0A5C56] text-white font-semibold transition shadow-lg shadow-[#0F766E]/20"
                  >

                    Next

                    <ChevronRight
                      size={18}
                    />

                  </button>

                ) : (

                  <button
                    onClick={() =>
                      setShowSubmitModal(
                        true
                      )
                    }
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-[#101828] hover:bg-[#0F766E] text-white font-semibold transition"
                  >

                    Review & Submit

                    <Send
                      size={17}
                    />

                  </button>

                )}

              </div>

            </motion.div>


            {/* QUESTION NAVIGATION */}

            <div className="bg-white border border-[#101828]/10 rounded-3xl p-5 mt-5 shadow-sm">

              <div className="flex items-center gap-2 mb-4">

                <Target
                  size={16}
                  className="text-[#0F766E]"
                />

                <h3 className="font-semibold text-[#101828]">

                  AI Questions

                </h3>

              </div>


              <div className="grid grid-cols-5 gap-2">

                {questions.map(
                  (
                    questionItem,
                    index
                  ) => {

                    const answered =
                      answers.some(
                        (
                          answer
                        ) =>
                          String(
                            answer.question_id
                          ) ===
                          String(
                            questionItem.question_id
                          ) &&
                          String(
                            answer.answer ||
                            ""
                          ).trim() !==
                            ""
                      );


                    const active =
                      index ===
                      currentQuestion;


                    return (

                      <button
                        key={
                          `${questionItem.question_id}-${index}`
                        }
                        onClick={() =>
                          setCurrentQuestion(
                            index
                          )
                        }
                        className={`h-10 rounded-xl text-sm font-semibold transition ${
                          active
                            ? "bg-[#0F766E] text-white"
                            : answered
                            ? "bg-[#EAF5F1] text-[#0F766E] border border-[#BFE5DB]"
                            : "bg-[#F2F4F7] text-[#667085] hover:bg-[#EAECF0]"
                        }`}
                      >

                        {
                          index +
                          1
                        }

                      </button>

                    );

                  }
                )}

              </div>

            </div>

          </section>


          {/* =================================================
              RIGHT SIDEBAR
          ================================================= */}

          <aside className="space-y-5">


            {/* CAMERA */}
            <div className="bg-white border border-[#101828]/10 rounded-3xl overflow-hidden shadow-sm">

              <div className="px-4 py-3 bg-[#101828] flex items-center justify-between">

                <div className="flex items-center gap-2 text-white">

                  <Video
                    size={17}
                  />

                  <span className="font-semibold">

                    AI Proctoring

                  </span>

                </div>


                <span className="flex items-center gap-1.5 text-xs text-emerald-300">

                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />

                  AI Active

                </span>

              </div>


              <div className="aspect-video bg-black relative">

                <video
                  ref={
                    videoRef
                  }
                  autoPlay
                  muted
                  playsInline
                  onLoadedMetadata={async () => {

                    try {

                      if (
                        videoRef.current &&
                        videoRef.current
                          .srcObject
                      ) {

                        await videoRef.current.play();

                      }

                    } catch (
                      error
                    ) {

                      console.warn(
                        "Video metadata play failed:",
                        error
                      );

                    }

                  }}
                  onCanPlay={async () => {

                    try {

                      if (
                        videoRef.current &&
                        videoRef.current
                          .srcObject
                      ) {

                        await videoRef.current.play();

                      }

                    } catch (
                      error
                    ) {

                      console.warn(
                        "Video canPlay failed:",
                        error
                      );

                    }

                  }}
                  className="w-full h-full object-cover"
                />


                {!cameraEnabled && (

                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white/50">

                    <CameraOff
                      size={32}
                    />

                    <p className="text-sm mt-2">

                      Camera unavailable

                    </p>

                  </div>

                )}


                {cvFaceCount >
                  1 && (

                  <div className="absolute top-3 right-3 px-3 py-1.5 rounded-xl bg-red-500/90 text-white text-xs font-semibold">

                    Multiple faces

                  </div>

                )}


                {cvPhoneDetected && (

                  <div className="absolute top-3 left-3 px-3 py-1.5 rounded-xl bg-red-500/90 text-white text-xs font-semibold flex items-center gap-1.5">

                    <Smartphone
                      size={13}
                    />

                    Phone detected

                  </div>

                )}

              </div>


              {/* CAMERA STATUS */}

              <div className="p-4 space-y-2">

                <div className="flex items-center justify-between text-sm">

                  <span className="flex items-center gap-2 text-[#667085]">

                    {cameraEnabled ? (

                      <Camera
                        size={16}
                        className="text-[#0F766E]"
                      />

                    ) : (

                      <CameraOff
                        size={16}
                        className="text-red-500"
                      />

                    )}

                    Camera

                  </span>


                  <span
                    className={
                      cameraEnabled
                        ? "text-[#0F766E]"
                        : "text-red-500"
                    }
                  >

                    {cameraEnabled
                      ? "On"
                      : "Off"}

                  </span>

                </div>


                <div className="flex items-center justify-between text-sm">

                  <span className="flex items-center gap-2 text-[#667085]">

                    {microphoneEnabled ? (

                      <Mic
                        size={16}
                        className="text-[#0F766E]"
                      />

                    ) : (

                      <MicOff
                        size={16}
                        className="text-red-500"
                      />

                    )}

                    Microphone

                  </span>


                  <span
                    className={
                      microphoneEnabled
                        ? "text-[#0F766E]"
                        : "text-red-500"
                    }
                  >

                    {microphoneEnabled
                      ? micSpeaking
                        ? "Speaking"
                        : "Listening"
                      : "Off"}

                  </span>

                </div>


                <div className="flex items-center justify-between text-sm">

                  <span className="flex items-center gap-2 text-[#667085]">

                    <Maximize
                      size={16}
                      className="text-[#0F766E]"
                    />

                    Fullscreen

                  </span>


                  <span
                    className={
                      fullscreen
                        ? "text-[#0F766E]"
                        : "text-amber-600"
                    }
                  >

                    {fullscreen
                      ? "Active"
                      : "Inactive"}

                  </span>

                </div>


                {/* MIC LEVEL */}

                <div className="pt-2">

                  <div className="flex items-center justify-between text-xs mb-1.5">

                    <span className="text-[#98A2B3]">

                      Microphone level

                    </span>


                    <span className="font-semibold text-[#667085]">

                      {
                        micLevel
                      }%

                    </span>

                  </div>


                  <div className="h-1.5 rounded-full bg-[#EAECF0] overflow-hidden">

                    <motion.div
                      animate={{
                        width:
                          `${micLevel}%`,
                      }}
                      className="h-full bg-gradient-to-r from-[#0F766E] to-[#22C55E] rounded-full"
                    />

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                AI VISION
            ================================================= */}

            <div className="bg-white border border-[#101828]/10 rounded-3xl p-5 shadow-sm">

              <div className="flex items-center justify-between">

                <div className="flex items-center gap-3">

                  <div className="w-10 h-10 rounded-2xl bg-[#EAF5F1] flex items-center justify-center">

                    <ScanFace
                      size={20}
                      className="text-[#0F766E]"
                    />

                  </div>


                  <div>

                    <h3 className="font-semibold text-[#101828]">

                      AI Vision

                    </h3>


                    <p className="text-xs text-[#98A2B3] mt-1">

                      MediaPipe + YOLO + OpenCV

                    </p>

                  </div>

                </div>


                <div
                  className={`w-2.5 h-2.5 rounded-full ${
                    cvActive
                      ? "bg-emerald-500 animate-pulse"
                      : "bg-gray-300"
                  }`}
                />

              </div>


              {/* CV METRICS */}

              <div className="mt-4 grid grid-cols-2 gap-2">

                <div className="p-3 rounded-2xl bg-[#F7F5EF]">

                  <div className="flex items-center gap-2">

                    <UserRound
                      size={14}
                      className="text-[#0F766E]"
                    />

                    <span className="text-[11px] text-[#667085]">

                      Faces

                    </span>

                  </div>


                  <p className="text-lg font-bold text-[#101828] mt-1">

                    {
                      cvFaceCount
                    }

                  </p>

                </div>


                <div className="p-3 rounded-2xl bg-[#F7F5EF]">

                  <div className="flex items-center gap-2">

                    <UserRound
                      size={14}
                      className="text-[#0F766E]"
                    />

                    <span className="text-[11px] text-[#667085]">

                      Persons

                    </span>

                  </div>


                  <p className="text-lg font-bold text-[#101828] mt-1">

                    {
                      cvPersonCount
                    }

                  </p>

                </div>


                <div className="p-3 rounded-2xl bg-[#F7F5EF]">

                  <div className="flex items-center gap-2">

                    <Smartphone
                      size={14}
                      className={
                        cvPhoneDetected
                          ? "text-red-500"
                          : "text-[#0F766E]"
                      }
                    />

                    <span className="text-[11px] text-[#667085]">

                      Phone

                    </span>

                  </div>


                  <p
                    className={`text-sm font-bold mt-1 ${
                      cvPhoneDetected
                        ? "text-red-500"
                        : "text-[#0F766E]"
                    }`}
                  >

                    {cvPhoneDetected
                      ? "Detected"
                      : "Clear"}

                  </p>

                </div>


                <div className="p-3 rounded-2xl bg-[#F7F5EF]">

                  <div className="flex items-center gap-2">

                    <Activity
                      size={14}
                      className="text-[#0F766E]"
                    />

                    <span className="text-[11px] text-[#667085]">

                      Movement

                    </span>

                  </div>


                  <p className="text-sm font-bold text-[#101828] mt-1">

                    {
                      Number(
                        cvMovementScore
                      ).toFixed(
                        2
                      )
                    }

                  </p>

                </div>

              </div>


              <div className="mt-3 flex items-center justify-between text-[11px]">

                <span className="text-[#98A2B3]">

                  Camera CV

                </span>


                <span
                  className={
                    cvCameraBlocked
                      ? "text-red-500 font-semibold"
                      : "text-[#0F766E] font-semibold"
                  }
                >

                  {cvCameraBlocked
                    ? "Blocked"
                    : cvActive
                    ? "Healthy"
                    : "Waiting"}

                </span>

              </div>


              <div className="mt-2 flex items-center justify-between text-[11px]">

                <span className="text-[#98A2B3]">

                  Last AI scan

                </span>


                <span className="text-[#667085] font-medium">

                  {cvLastScan
                    ? cvLastScan.toLocaleTimeString()
                    : "Waiting..."}

                </span>

              </div>


              <div className="mt-2 flex items-center justify-between text-[11px]">

                <span className="text-[#98A2B3]">

                  CV events

                </span>


                <span className="text-[#0F766E] font-semibold">

                  {
                    cvEventCount
                  }

                </span>

              </div>


              {cvProcessing && (

                <div className="mt-3 flex items-center gap-2 text-xs text-[#667085]">

                  <Loader2
                    size={13}
                    className="animate-spin text-[#0F766E]"
                  />

                  AI vision scanning...

                </div>

              )}


              {cvError && (

                <div className="mt-3 p-3 rounded-2xl bg-amber-50 border border-amber-200">

                  <div className="flex items-start gap-2">

                    <AlertTriangle
                      size={14}
                      className="text-amber-600 mt-0.5 flex-shrink-0"
                    />

                    <p className="text-[11px] text-amber-700">

                      AI vision temporarily
                      unavailable. Interview can
                      continue.

                    </p>

                  </div>

                </div>

              )}

            </div>


            {/* =================================================
                PROCTORING STATUS
            ================================================= */}

            <div className="bg-white border border-[#101828]/10 rounded-3xl p-5 shadow-sm">

              <div className="flex items-center gap-3">

                <ShieldCheck
                  size={21}
                  className="text-[#0F766E]"
                />


                <div>

                  <h3 className="font-semibold text-[#101828]">

                    Proctoring Status

                  </h3>


                  <p className="text-xs text-[#98A2B3] mt-1">

                    Browser + AI vision monitoring

                  </p>

                </div>

              </div>


              <div className="mt-4 space-y-2 text-xs">

                <div className="flex justify-between">

                  <span className="text-[#667085]">

                    Tab switches

                  </span>


                  <span
                    className={
                      tabSwitches ===
                      0
                        ? "text-[#0F766E]"
                        : "text-amber-600"
                    }
                  >

                    {
                      tabSwitches
                    }

                  </span>

                </div>


                <div className="flex justify-between">

                  <span className="text-[#667085]">

                    Camera

                  </span>


                  <span
                    className={
                      cameraEnabled
                        ? "text-[#0F766E]"
                        : "text-red-500"
                    }
                  >

                    {cameraEnabled
                      ? "Active"
                      : "Inactive"}

                  </span>

                </div>


                <div className="flex justify-between">

                  <span className="text-[#667085]">

                    Microphone

                  </span>


                  <span
                    className={
                      microphoneEnabled
                        ? "text-[#0F766E]"
                        : "text-red-500"
                    }
                  >

                    {microphoneEnabled
                      ? micSpeaking
                        ? "Speaking"
                        : "Listening"
                      : "Inactive"}

                  </span>

                </div>


                <div className="flex justify-between">

                  <span className="text-[#667085]">

                    Mic Level

                  </span>


                  <span className="text-[#101828]">

                    {
                      micLevel
                    }%

                  </span>

                </div>


                <div className="flex justify-between">

                  <span className="text-[#667085]">

                    AI Vision

                  </span>


                  <span
                    className={
                      cvActive
                        ? "text-[#0F766E]"
                        : "text-amber-600"
                    }
                  >

                    {cvActive
                      ? "Active"
                      : "Waiting"}

                  </span>

                </div>


                <div className="flex justify-between">

                  <span className="text-[#667085]">

                    CV Events

                  </span>


                  <span className="text-[#0F766E]">

                    {
                      cvEventCount
                    }

                  </span>

                </div>


                <div className="flex justify-between">

                  <span className="text-[#667085]">

                    Fullscreen

                  </span>


                  <span
                    className={
                      fullscreen
                        ? "text-[#0F766E]"
                        : "text-amber-600"
                    }
                  >

                    {fullscreen
                      ? "Active"
                      : "Inactive"}

                  </span>

                </div>

              </div>

            </div>

          </aside>

        </div>

      </main>


      {/* =================================================
          HIDDEN CANVAS
      ================================================= */}

      <canvas
        ref={
          canvasRef
        }
        className="hidden"
      />


      {/* =================================================
          SUBMIT MODAL
      ================================================= */}

      <AnimatePresence>

        {showSubmitModal && (

          <motion.div
            initial={{
              opacity:
                0,
            }}
            animate={{
              opacity:
                1,
            }}
            exit={{
              opacity:
                0,
            }}
            className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-5"
          >

            <motion.div
              initial={{
                scale:
                  0.95,

                y:
                  20,
              }}
              animate={{
                scale:
                  1,

                y:
                  0,
              }}
              exit={{
                scale:
                  0.95,

                y:
                  20,
              }}
              className="w-full max-w-md bg-white border border-[#101828]/10 rounded-3xl p-6 shadow-2xl"
            >

              <div className="w-12 h-12 rounded-2xl bg-[#EAF5F1] flex items-center justify-center">

                <Send
                  size={22}
                  className="text-[#0F766E]"
                />

              </div>


              <h2 className="text-xl font-bold mt-5 text-[#101828]">

                Submit Interview?

              </h2>


              <p className="text-[#667085] text-sm mt-2">

                Once submitted, your answers will
                be evaluated by Recruit AI.

              </p>


              <div className="mt-5 p-4 rounded-2xl bg-[#F7F5EF]">

                <div className="flex justify-between text-sm">

                  <span className="text-[#667085]">

                    AI Questions

                  </span>


                  <span className="font-semibold text-[#101828]">

                    {
                      questions.length
                    }

                  </span>

                </div>


                <div className="flex justify-between text-sm mt-2">

                  <span className="text-[#667085]">

                    Answered

                  </span>


                  <span className="font-semibold text-[#0F766E]">

                    {
                      answeredCount
                    }

                    {" / "}

                    {
                      questions.length
                    }

                  </span>

                </div>


                <div className="flex justify-between text-sm mt-2">

                  <span className="text-[#667085]">

                    Unanswered

                  </span>


                  <span className="font-semibold text-amber-600">

                    {
                      questions.length -
                      answeredCount
                    }

                  </span>

                </div>

              </div>


              <div className="flex gap-3 mt-6">

                <button
                  onClick={() =>
                    setShowSubmitModal(
                      false
                    )
                  }
                  disabled={
                    submitting
                  }
                  className="flex-1 py-3 rounded-2xl bg-[#F2F4F7] hover:bg-[#EAECF0] text-[#344054] font-semibold transition"
                >

                  Continue Interview

                </button>


                <button
                  onClick={
                    handleSubmitInterview
                  }
                  disabled={
                    submitting
                  }
                  className="flex-1 py-3 rounded-2xl bg-[#0F766E] hover:bg-[#0A5C56] text-white font-semibold transition flex items-center justify-center gap-2 disabled:opacity-60"
                >

                  {submitting ? (

                    <>

                      <Loader2
                        size={17}
                        className="animate-spin"
                      />

                      Submitting...

                    </>

                  ) : (

                    <>

                      <CheckCircle
                        size={17}
                      />

                      Submit

                    </>

                  )}

                </button>

              </div>

            </motion.div>

          </motion.div>

        )}

      </AnimatePresence>

    </div>

  );

}


export default StartInterview;