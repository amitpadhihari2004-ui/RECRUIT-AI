import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  UploadCloud,
  FileText,
  CheckCircle,
  X,
  File,
  Clock,
  Zap,
  BarChart3,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  FileCheck2,
  Brain,
  CircleCheck,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  uploadResume,
  analyzeResume,
} from "../api/resumeApi";


function ResumeUpload() {

  const navigate = useNavigate();

  const [resume, setResume] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploaded, setUploaded] = useState(false);
  const [uploadData, setUploadData] = useState(null);

  const [progress, setProgress] = useState(0);
  const [progressMessage, setProgressMessage] = useState("");

  const [currentStep, setCurrentStep] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const [analysisScore, setAnalysisScore] =
    useState(null);


  // =====================================================
  // PROCESSING STEPS
  // =====================================================

  const steps = [
    {
      id: 0,
      label: "Uploading resume",
      description: "Securely storing your document",
      icon: UploadCloud,
    },
    {
      id: 1,
      label: "Extracting content",
      description: "Reading resume information",
      icon: FileText,
    },
    {
      id: 2,
      label: "AI analysis",
      description: "Evaluating skills and experience",
      icon: Brain,
    },
    {
      id: 3,
      label: "Generating insights",
      description: "Preparing your recruitment profile",
      icon: BarChart3,
    },
    {
      id: 4,
      label: "Analysis complete",
      description: "Your resume is ready",
      icon: CheckCircle,
    },
  ];


  // =====================================================
  // PROCESSING ANIMATION
  // =====================================================

  useEffect(() => {

    if (!loading) {
      return;
    }

    const interval = setInterval(() => {

      setCurrentStep((previous) => {

        if (previous < 4) {

          const messages = [
            "Uploading your resume...",
            "Extracting resume content...",
            "AI is analyzing your profile...",
            "Generating personalized insights...",
          ];

          setProgressMessage(
            messages[previous] ||
            "Processing your resume..."
          );

          return previous + 1;
        }

        return previous;

      });

    }, 2500);


    return () => clearInterval(interval);

  }, [loading]);


  // =====================================================
  // REDIRECT AFTER SUCCESS
  // =====================================================

  useEffect(() => {

    if (!uploaded) {
      return;
    }

    const timer = setTimeout(() => {

      navigate("/resume-analysis");

    }, 2500);


    return () => clearTimeout(timer);

  }, [uploaded, navigate]);


  // =====================================================
  // DRAG EVENTS
  // =====================================================

  const handleDrag = (e) => {

    e.preventDefault();
    e.stopPropagation();

    if (
      e.type === "dragenter" ||
      e.type === "dragover"
    ) {

      setDragActive(true);

    }

    if (e.type === "dragleave") {

      setDragActive(false);

    }

  };


  const handleDrop = (e) => {

    e.preventDefault();
    e.stopPropagation();

    setDragActive(false);

    if (
      e.dataTransfer.files &&
      e.dataTransfer.files[0]
    ) {

      handleFile(
        e.dataTransfer.files[0]
      );

    }

  };


  // =====================================================
  // FILE CHANGE
  // =====================================================

  const handleFileChange = (e) => {

    if (
      e.target.files &&
      e.target.files[0]
    ) {

      handleFile(
        e.target.files[0]
      );

    }

  };


  // =====================================================
  // VALIDATE FILE
  // =====================================================

  const handleFile = (file) => {

    const validTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];


    if (!validTypes.includes(file.type)) {

      toast.error(
        "Please upload a PDF or DOC/DOCX file."
      );

      return;

    }


    if (file.size > 5 * 1024 * 1024) {

      toast.error(
        "File size should be less than 5MB."
      );

      return;

    }


    setResume(file);

    toast.success(
      "Resume selected successfully."
    );

  };


  // =====================================================
  // REMOVE FILE
  // =====================================================

  const removeFile = () => {

    setResume(null);
    setDragActive(false);

  };


  // =====================================================
  // UPLOAD + ANALYZE
  // =====================================================

  const handleUpload = async (e) => {

    e.preventDefault();


    if (!resume) {

      toast.error(
        "Please select a resume."
      );

      return;

    }


    const userId =
      localStorage.getItem(
        "user_id"
      );


    if (!userId) {

      toast.error(
        "User not found. Please login again."
      );

      navigate("/login");

      return;

    }


    try {

      setLoading(true);

      setProgress(0);

      setCurrentStep(0);

      setProgressMessage(
        "Starting resume upload..."
      );


      console.log(
        "================================"
      );

      console.log(
        "STARTING RESUME UPLOAD"
      );

      console.log(
        "User ID:",
        userId
      );

      console.log(
        "Resume:",
        resume
      );

      console.log(
        "Resume name:",
        resume?.name
      );

      console.log(
        "Resume type:",
        resume?.type
      );

      console.log(
        "Resume size:",
        resume?.size
      );

      console.log(
        "================================"
      );


      // =================================================
      // UPLOAD
      // =================================================

      const uploadResponse =
        await uploadResume(
          userId,
          resume
        );


      console.log(
        "UPLOAD RESPONSE:",
        uploadResponse
      );


      setProgress(30);

      setCurrentStep(1);

      setProgressMessage(
        "Extracting resume content..."
      );


      // =================================================
      // ANALYZE
      // =================================================

      const analysisResponse =
        await analyzeResume(
          uploadResponse.resume_id
        );


      console.log(
        "ANALYSIS RESPONSE:",
        analysisResponse
      );


      setProgress(60);

      setCurrentStep(2);

      setProgressMessage(
        "AI analyzing your resume..."
      );


      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1000)
      );


      setProgress(85);

      setCurrentStep(3);

      setProgressMessage(
        "Generating recruitment insights..."
      );


      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1000)
      );


      // =================================================
      // SCORE
      // =================================================

      const score =
        analysisResponse?.analysis?.resume_score ||
        analysisResponse?.resume_score ||
        0;


      setAnalysisScore(score);


      // =================================================
      // SAVE UPLOAD DATA
      // =================================================

      setUploadData({

        resume_id:
          uploadResponse.resume_id,

        file_name:
          resume.name,

        uploaded: true,

        analyzed: true,

        uploadTime:
          new Date().toLocaleString(),

        fileSize:
          resume.size,

        score,

      });


      setProgress(100);

      setCurrentStep(4);

      setProgressMessage(
        "Resume analysis completed."
      );


      toast.success(
        "Resume analyzed successfully!"
      );


      await new Promise(
        (resolve) =>
          setTimeout(resolve, 1000)
      );


      setUploaded(true);


    } catch (error) {

      console.error(
        "================================"
      );

      console.error(
        "RESUME UPLOAD ERROR"
      );

      console.error(
        "Status:",
        error?.response?.status
      );

      console.error(
        "Response:",
        error?.response?.data
      );

      console.error(
        "Message:",
        error?.message
      );

      console.error(
        "================================"
      );


      if (error.response) {

        const errorMessage =
          error.response.data?.detail ||
          error.response.data?.message ||
          JSON.stringify(
            error.response.data
          );


        toast.error(
          `Error ${error.response.status}: ${errorMessage}`
        );

      }

      else if (error.request) {

        toast.error(
          "Backend is not responding. Please check your FastAPI server."
        );

      }

      else {

        toast.error(
          error.message ||
          "An unexpected error occurred."
        );

      }


      setLoading(false);

      setProgress(0);

      setCurrentStep(0);

      setProgressMessage("");

    }

  };


  // =====================================================
  // SUCCESS SCREEN
  // =====================================================

  if (
    uploaded &&
    uploadData
  ) {

    return (

      <div className="
        min-h-screen
        bg-[#f7f7f5]
        flex
        items-center
        justify-center
        px-5
        py-10
        relative
        overflow-hidden
      ">

        {/* Background */}

        <div className="
          absolute
          top-0
          right-0
          w-[500px]
          h-[500px]
          bg-emerald-200/20
          rounded-full
          blur-3xl
        " />

        <div className="
          absolute
          bottom-0
          left-0
          w-[450px]
          h-[450px]
          bg-slate-300/20
          rounded-full
          blur-3xl
        " />


        <motion.div

          initial={{
            opacity: 0,
            y: 25,
            scale: 0.97
          }}

          animate={{
            opacity: 1,
            y: 0,
            scale: 1
          }}

          transition={{
            duration: 0.5
          }}

          className="
            relative
            w-full
            max-w-2xl
            bg-white
            border
            border-black/10
            rounded-[28px]
            shadow-[0_25px_70px_rgba(0,0,0,0.08)]
            overflow-hidden
          "
        >

          {/* Top */}

          <div className="
            px-8
            md:px-12
            pt-12
            pb-8
            text-center
          ">

            <motion.div

              initial={{
                scale: 0
              }}

              animate={{
                scale: 1
              }}

              transition={{
                delay: 0.15,
                type: "spring",
                stiffness: 180
              }}

              className="
                w-20
                h-20
                mx-auto
                rounded-full
                bg-emerald-50
                border
                border-emerald-100
                flex
                items-center
                justify-center
              "
            >

              <CheckCircle
                size={40}
                className="
                  text-emerald-600
                "
              />

            </motion.div>


            <div className="
              mt-6
              inline-flex
              items-center
              gap-2
              px-3
              py-1.5
              rounded-full
              bg-emerald-50
              border
              border-emerald-100
              text-emerald-700
              text-xs
              font-semibold
            ">

              <CircleCheck
                size={14}
              />

              Analysis complete

            </div>


            <h2 className="
              mt-5
              text-3xl
              md:text-4xl
              font-bold
              tracking-tight
              text-[#111111]
            ">

              Your resume is ready.

            </h2>


            <p className="
              mt-3
              text-gray-500
              max-w-lg
              mx-auto
              leading-relaxed
            ">

              Recruit AI has analyzed your
              resume and prepared your
              recruitment insights.

            </p>

          </div>


          {/* Resume information */}

          <div className="
            mx-6
            md:mx-10
            mb-8
            border
            border-black/10
            rounded-2xl
            overflow-hidden
          ">

            <div className="
              p-5
              flex
              items-center
              gap-4
            ">

              <div className="
                w-12
                h-12
                rounded-xl
                bg-[#111111]
                flex
                items-center
                justify-center
                flex-shrink-0
              ">

                <FileText
                  size={21}
                  className="
                    text-white
                  "
                />

              </div>


              <div className="
                min-w-0
                flex-1
              ">

                <p className="
                  text-xs
                  text-gray-400
                  uppercase
                  tracking-wider
                  font-semibold
                ">

                  Resume

                </p>


                <p className="
                  mt-1
                  font-semibold
                  text-gray-900
                  truncate
                ">

                  {uploadData.file_name}

                </p>

              </div>


              <div className="
                hidden
                sm:block
                text-right
              ">

                <p className="
                  text-xs
                  text-gray-400
                ">

                  Score

                </p>

                <p className="
                  text-xl
                  font-bold
                  text-emerald-600
                ">

                  {analysisScore || 0}

                </p>

              </div>

            </div>


            <div className="
              grid
              grid-cols-2
              border-t
              border-black/10
            ">

              <div className="
                p-4
                border-r
                border-black/10
              ">

                <p className="
                  text-xs
                  text-gray-400
                ">

                  Uploaded

                </p>

                <p className="
                  mt-1
                  text-sm
                  font-medium
                  text-gray-800
                ">

                  {uploadData.uploadTime}

                </p>

              </div>


              <div className="
                p-4
              ">

                <p className="
                  text-xs
                  text-gray-400
                ">

                  Status

                </p>

                <div className="
                  mt-1
                  flex
                  items-center
                  gap-1.5
                  text-sm
                  font-semibold
                  text-emerald-600
                ">

                  <CheckCircle
                    size={14}
                  />

                  Analyzed

                </div>

              </div>

            </div>

          </div>


          {/* Redirect */}

          <div className="
            px-6
            md:px-10
            pb-8
          ">

            <div className="
              flex
              items-center
              gap-2
              text-sm
              text-gray-500
              justify-center
            ">

              <Sparkles
                size={15}
              />

              Opening your resume insights...

            </div>


            <div className="
              mt-4
              h-1
              bg-gray-100
              rounded-full
              overflow-hidden
            ">

              <motion.div

                initial={{
                  width: "0%"
                }}

                animate={{
                  width: "100%"
                }}

                transition={{
                  duration: 2.2,
                  ease: "linear"
                }}

                className="
                  h-full
                  bg-[#111111]
                  rounded-full
                "
              />

            </div>

          </div>

        </motion.div>

      </div>

    );

  }


  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (

    <div className="
      min-h-screen
      bg-[#f7f7f5]
      text-[#111111]
      relative
      overflow-hidden
    ">

      {/* =================================================
          DECORATIVE BACKGROUND
      ================================================= */}

      <div className="
        absolute
        top-[-180px]
        right-[-180px]
        w-[500px]
        h-[500px]
        rounded-full
        bg-amber-200/20
        blur-3xl
      " />

      <div className="
        absolute
        bottom-[-200px]
        left-[-200px]
        w-[550px]
        h-[550px]
        rounded-full
        bg-slate-300/20
        blur-3xl
      " />


      {/* =================================================
          HEADER
      ================================================= */}

      <header className="
        relative
        z-10
        border-b
        border-black/10
        bg-white/80
        backdrop-blur-xl
      ">

        <div className="
          max-w-6xl
          mx-auto
          px-5
          md:px-8
          py-5
          flex
          items-center
          justify-between
        ">

          <div className="
            flex
            items-center
            gap-3
          ">

            <div className="
              w-9
              h-9
              rounded-xl
              bg-[#111111]
              flex
              items-center
              justify-center
            ">

              <span className="
                text-white
                font-bold
                text-sm
              ">

                R

              </span>

            </div>


            <div>

              <p className="
                font-bold
                text-lg
                tracking-tight
              ">

                Recruit AI

              </p>

              <p className="
                text-[11px]
                text-gray-400
              ">

                Candidate workspace

              </p>

            </div>

          </div>


          <button
            onClick={() =>
              navigate("/dashboard")
            }
            className="
              text-sm
              font-medium
              text-gray-500
              hover:text-black
              transition
            "
          >

            Back to dashboard

          </button>

        </div>

      </header>


      {/* =================================================
          CONTENT
      ================================================= */}

      <main className="
        relative
        z-10
        max-w-6xl
        mx-auto
        px-5
        md:px-8
        py-10
        md:py-14
      ">

        <div className="
          max-w-3xl
          mx-auto
        ">


          {/* =================================================
              TITLE
          ================================================= */}

          <motion.div

            initial={{
              opacity: 0,
              y: 15
            }}

            animate={{
              opacity: 1,
              y: 0
            }}

            transition={{
              duration: 0.5
            }}

            className="
              mb-8
            "
          >

            <div className="
              inline-flex
              items-center
              gap-2
              px-3
              py-1.5
              rounded-full
              bg-white
              border
              border-black/10
              text-xs
              font-semibold
              text-gray-600
            ">

              <Sparkles
                size={13}
              />

              Resume Intelligence

            </div>


            <h1 className="
              mt-5
              text-4xl
              md:text-5xl
              font-bold
              tracking-[-0.03em]
              text-[#111111]
            ">

              Build a stronger
              <span className="
                block
                text-gray-400
              ">

                candidate profile.

              </span>

            </h1>


            <p className="
              mt-4
              text-gray-500
              text-base
              md:text-lg
              leading-relaxed
              max-w-2xl
            ">

              Upload your latest resume.
              Recruit AI will analyze your
              skills, experience, structure and
              career readiness.

            </p>

          </motion.div>


          {/* =================================================
              UPLOAD CARD
          ================================================= */}

          <motion.div

            initial={{
              opacity: 0,
              y: 20
            }}

            animate={{
              opacity: 1,
              y: 0
            }}

            transition={{
              duration: 0.55,
              delay: 0.1
            }}

            className="
              bg-white
              border
              border-black/10
              rounded-[28px]
              shadow-[0_20px_60px_rgba(0,0,0,0.06)]
              overflow-hidden
            "
          >

            <div className="
              p-6
              md:p-8
            ">

              {/* Card heading */}

              <div className="
                flex
                items-start
                justify-between
                gap-4
                mb-7
              ">

                <div>

                  <h2 className="
                    text-lg
                    font-bold
                    text-gray-900
                  ">

                    Upload resume

                  </h2>

                  <p className="
                    text-sm
                    text-gray-400
                    mt-1
                  ">

                    PDF, DOC or DOCX · Maximum 5 MB

                  </p>

                </div>


                <div className="
                  hidden
                  sm:flex
                  items-center
                  gap-2
                  text-xs
                  font-medium
                  text-gray-500
                ">

                  <ShieldCheck
                    size={16}
                    className="text-emerald-600"
                  />

                  Secure upload

                </div>

              </div>


              <form
                onSubmit={handleUpload}
              >

                {!loading ? (

                  <>

                    {/* =================================================
                        DROP ZONE
                    ================================================= */}

                    <motion.div

                      whileHover={{
                        y: -2
                      }}

                      className={`
                        relative
                        min-h-[300px]
                        rounded-2xl
                        border
                        border-dashed
                        flex
                        items-center
                        justify-center
                        cursor-pointer
                        transition-all
                        duration-300
                        ${
                          dragActive
                            ? "border-black bg-gray-50"
                            : resume
                            ? "border-emerald-300 bg-emerald-50/30"
                            : "border-gray-300 hover:border-gray-500 hover:bg-gray-50/70"
                        }
                      `}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                    >

                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleFileChange}
                        className="
                          absolute
                          inset-0
                          w-full
                          h-full
                          opacity-0
                          cursor-pointer
                        "
                      />


                      <div className="
                        text-center
                        px-6
                      ">

                        <motion.div

                          animate={{
                            y: [0, -5, 0]
                          }}

                          transition={{
                            duration: 3,
                            repeat: Infinity,
                            ease: "easeInOut"
                          }}

                          className={`
                            w-16
                            h-16
                            mx-auto
                            rounded-2xl
                            flex
                            items-center
                            justify-center
                            ${
                              resume
                                ? "bg-emerald-100"
                                : "bg-gray-100"
                            }
                          `}
                        >

                          {resume ? (

                            <FileCheck2
                              size={30}
                              className="
                                text-emerald-600
                              "
                            />

                          ) : (

                            <UploadCloud
                              size={30}
                              className="
                                text-gray-700
                              "
                            />

                          )}

                        </motion.div>


                        {resume ? (

                          <>

                            <div className="
                              mt-5
                              flex
                              items-center
                              justify-center
                              gap-2
                            ">

                              <CheckCircle
                                size={18}
                                className="
                                  text-emerald-600
                                "
                              />

                              <h3 className="
                                font-semibold
                                text-gray-900
                                max-w-[400px]
                                truncate
                              ">

                                {resume.name}

                              </h3>

                            </div>


                            <p className="
                              mt-2
                              text-sm
                              text-gray-400
                            ">

                              {(resume.size / 1024).toFixed(2)}
                              {" "}KB

                            </p>


                            <span className="
                              inline-flex
                              mt-4
                              px-3
                              py-1.5
                              rounded-full
                              bg-emerald-50
                              border
                              border-emerald-100
                              text-emerald-700
                              text-xs
                              font-semibold
                            ">

                              Ready for analysis

                            </span>

                          </>

                        ) : (

                          <>

                            <h3 className="
                              mt-5
                              text-xl
                              font-bold
                              text-gray-900
                            ">

                              Drop your resume here

                            </h3>


                            <p className="
                              mt-2
                              text-sm
                              text-gray-400
                            ">

                              or click anywhere to browse files

                            </p>


                            <div className="
                              mt-5
                              flex
                              items-center
                              justify-center
                              gap-2
                              flex-wrap
                            ">

                              {[
                                "PDF",
                                "DOC",
                                "DOCX"
                              ].map(
                                (type) => (

                                  <span
                                    key={type}
                                    className="
                                      px-3
                                      py-1
                                      rounded-md
                                      bg-gray-100
                                      text-gray-500
                                      text-xs
                                      font-semibold
                                    "
                                  >

                                    {type}

                                  </span>

                                )
                              )}

                            </div>

                          </>

                        )}

                      </div>

                    </motion.div>


                    {/* REMOVE */}

                    {resume && (

                      <motion.div

                        initial={{
                          opacity: 0,
                          height: 0
                        }}

                        animate={{
                          opacity: 1,
                          height: "auto"
                        }}

                        className="
                          mt-4
                          flex
                          justify-between
                          items-center
                        "
                      >

                        <p className="
                          text-xs
                          text-gray-400
                        ">

                          Your file is ready to be analyzed.

                        </p>


                        <button
                          type="button"
                          onClick={removeFile}
                          className="
                            flex
                            items-center
                            gap-1.5
                            text-sm
                            font-semibold
                            text-red-500
                            hover:text-red-700
                            transition
                          "
                        >

                          <X
                            size={15}
                          />

                          Remove

                        </button>

                      </motion.div>

                    )}


                    {/* =================================================
                        SUBMIT
                    ================================================= */}

                    <motion.button

                      whileHover={{
                        y: -2
                      }}

                      whileTap={{
                        scale: 0.98
                      }}

                      type="submit"

                      disabled={!resume}

                      className="
                        w-full
                        mt-7
                        h-14
                        rounded-xl
                        bg-[#111111]
                        hover:bg-black
                        disabled:bg-gray-200
                        disabled:text-gray-400
                        disabled:cursor-not-allowed
                        text-white
                        font-semibold
                        transition-all
                        duration-200
                        flex
                        items-center
                        justify-center
                        gap-2
                      "
                    >

                      <Zap
                        size={18}
                      />

                      Analyze Resume

                      <ArrowRight
                        size={18}
                      />

                    </motion.button>


                    {/* TRUST */}

                    <div className="
                      mt-5
                      flex
                      flex-wrap
                      justify-center
                      gap-x-6
                      gap-y-2
                      text-xs
                      text-gray-400
                    ">

                      <span className="
                        flex
                        items-center
                        gap-1.5
                      ">

                        <ShieldCheck
                          size={14}
                        />

                        Secure processing

                      </span>


                      <span className="
                        flex
                        items-center
                        gap-1.5
                      ">

                        <Brain
                          size={14}
                        />

                        AI-powered analysis

                      </span>


                      <span className="
                        flex
                        items-center
                        gap-1.5
                      ">

                        <BarChart3
                          size={14}
                        />

                        ATS insights

                      </span>

                    </div>

                  </>

                ) : (

                  /* =================================================
                     PROCESSING
                  ================================================= */

                  <div>

                    <div className="
                      flex
                      flex-col
                      sm:flex-row
                      sm:items-center
                      sm:justify-between
                      gap-3
                      mb-7
                    ">

                      <div>

                        <p className="
                          text-xs
                          uppercase
                          tracking-wider
                          font-bold
                          text-gray-400
                        ">

                          Processing

                        </p>

                        <h3 className="
                          mt-1
                          text-xl
                          font-bold
                          text-gray-900
                        ">

                          {progressMessage}

                        </h3>

                      </div>


                      <span className="
                        text-2xl
                        font-bold
                        text-gray-900
                      ">

                        {Math.min(
                          progress,
                          100
                        )}%

                      </span>

                    </div>


                    {/* Progress */}

                    <div className="
                      h-2
                      bg-gray-100
                      rounded-full
                      overflow-hidden
                    ">

                      <motion.div

                        animate={{
                          width: `${Math.min(
                            progress,
                            100
                          )}%`
                        }}

                        transition={{
                          duration: 0.4
                        }}

                        className="
                          h-full
                          bg-[#111111]
                          rounded-full
                        "
                      />

                    </div>


                    {/* Steps */}

                    <div className="
                      mt-8
                      space-y-2
                    ">

                      {steps.map(
                        (step, index) => {

                          const isActive =
                            index === currentStep;

                          const isCompleted =
                            index < currentStep;

                          const Icon =
                            step.icon;


                          return (

                            <motion.div
                              key={step.id}

                              initial={{
                                opacity: 0,
                                x: -8
                              }}

                              animate={{
                                opacity: 1,
                                x: 0
                              }}

                              transition={{
                                delay:
                                  index * 0.05
                              }}

                              className={`
                                flex
                                items-center
                                gap-4
                                p-4
                                rounded-xl
                                border
                                transition-all
                                ${
                                  isActive
                                    ? "bg-gray-50 border-gray-200"
                                    : "border-transparent"
                                }
                              `}
                            >

                              <div className={`
                                w-10
                                h-10
                                rounded-xl
                                flex
                                items-center
                                justify-center
                                flex-shrink-0
                                ${
                                  isCompleted
                                    ? "bg-emerald-100"
                                    : isActive
                                    ? "bg-[#111111]"
                                    : "bg-gray-100"
                                }
                              `}>

                                {isCompleted ? (

                                  <CheckCircle
                                    size={18}
                                    className="
                                      text-emerald-600
                                    "
                                  />

                                ) : (

                                  <Icon
                                    size={18}
                                    className={
                                      isActive
                                        ? "text-white"
                                        : "text-gray-400"
                                    }
                                  />

                                )}

                              </div>


                              <div className="
                                flex-1
                              ">

                                <p className={`
                                  text-sm
                                  font-semibold
                                  ${
                                    isActive ||
                                    isCompleted
                                      ? "text-gray-900"
                                      : "text-gray-400"
                                  }
                                `}>

                                  {step.label}

                                </p>


                                <p className="
                                  text-xs
                                  text-gray-400
                                  mt-0.5
                                ">

                                  {step.description}

                                </p>

                              </div>


                              {isActive && (

                                <LoaderSpinner />

                              )}

                            </motion.div>

                          );

                        }
                      )}

                    </div>


                    {/* Security note */}

                    <div className="
                      mt-6
                      p-4
                      rounded-xl
                      bg-gray-50
                      border
                      border-gray-100
                      flex
                      items-start
                      gap-3
                    ">

                      <ShieldCheck
                        size={18}
                        className="
                          text-emerald-600
                          mt-0.5
                          flex-shrink-0
                        "
                      />

                      <p className="
                        text-xs
                        leading-relaxed
                        text-gray-500
                      ">

                        Your resume is being securely
                        processed. Please keep this
                        window open while Recruit AI
                        completes the analysis.

                      </p>

                    </div>

                  </div>

                )}

              </form>

            </div>

          </motion.div>


          {/* =================================================
              BOTTOM FEATURES
          ================================================= */}

          {!loading && (

            <motion.div

              initial={{
                opacity: 0
              }}

              animate={{
                opacity: 1
              }}

              transition={{
                delay: 0.3
              }}

              className="
                grid
                grid-cols-1
                sm:grid-cols-3
                gap-3
                mt-4
              "
            >

              <Feature
                icon={Brain}
                title="AI analysis"
                text="Understand your resume strength"
              />

              <Feature
                icon={BarChart3}
                title="ATS insights"
                text="Identify areas recruiters notice"
              />

              <Feature
                icon={Sparkles}
                title="Career insights"
                text="Discover improvement opportunities"
              />

            </motion.div>

          )}

        </div>

      </main>

    </div>

  );

}


// =====================================================
// LOADER
// =====================================================

function LoaderSpinner() {

  return (

    <motion.div

      animate={{
        rotate: 360
      }}

      transition={{
        duration: 1,
        repeat: Infinity,
        ease: "linear"
      }}

      className="
        w-5
        h-5
        rounded-full
        border-2
        border-gray-200
        border-t-black
      "
    />

  );

}


// =====================================================
// FEATURE
// =====================================================

function Feature({
  icon: Icon,
  title,
  text
}) {

  return (

    <div className="
      bg-white
      border
      border-black/10
      rounded-xl
      p-4
      flex
      items-start
      gap-3
    ">

      <div className="
        w-9
        h-9
        rounded-lg
        bg-gray-100
        flex
        items-center
        justify-center
        flex-shrink-0
      ">

        <Icon
          size={17}
          className="
            text-gray-700
          "
        />

      </div>


      <div>

        <p className="
          text-sm
          font-semibold
          text-gray-900
        ">

          {title}

        </p>


        <p className="
          text-xs
          text-gray-400
          mt-0.5
          leading-relaxed
        ">

          {text}

        </p>

      </div>

    </div>

  );

}


export default ResumeUpload;