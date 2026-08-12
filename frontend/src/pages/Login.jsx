
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  ArrowLeft,
  ArrowRight,
  Brain,
  CheckCircle2,
  Eye,
  EyeOff,
  GraduationCap,
  Lock,
  ShieldCheck,
  Sparkles,
  UserPlus,
} from "lucide-react";

import { loginUser } from "../api/userApi";

function Login() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // =====================================================
  // HANDLE INPUT
  // =====================================================

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  // =====================================================
  // LOGIN
  // =====================================================

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      setLoading(true);

      // -------------------------------------------------
      // LOGIN API
      // -------------------------------------------------

      const response = await loginUser(formData);

      console.log("LOGIN RESPONSE:", response);

      // -------------------------------------------------
      // GET USER / STUDENT ID
      // -------------------------------------------------

      const userId =
        response?.user_id ||
        response?.student_id ||
        response?.studentId ||
        response?.user?.id ||
        response?.user?._id;

      // -------------------------------------------------
      // VALIDATE TOKEN
      // -------------------------------------------------

      if (!response?.access_token) {
        throw new Error(
          "Login successful but access token was not received."
        );
      }

      // -------------------------------------------------
      // VALIDATE USER ID
      // -------------------------------------------------

      if (!userId) {
        console.error(
          "Student/User ID missing from login response:",
          response
        );

        throw new Error(
          "Student ID not received from server. Please check the login API response."
        );
      }

      // =================================================
      // STORE LOGIN DETAILS
      // =================================================

      localStorage.setItem(
        "token",
        response.access_token
      );

      localStorage.setItem(
        "user_id",
        String(userId)
      );

      localStorage.setItem(
        "studentId",
        String(userId)
      );

      localStorage.setItem(
        "student_id",
        String(userId)
      );

      localStorage.setItem(
        "full_name",
        response?.full_name ||
          response?.name ||
          response?.user?.full_name ||
          response?.user?.name ||
          "Student"
      );

      localStorage.setItem(
        "email",
        response?.email ||
          formData.email
      );

      // =================================================
      // DEBUG
      // =================================================

      console.log("Login successful");

      console.log(
        "Stored user_id:",
        localStorage.getItem("user_id")
      );

      console.log(
        "Stored studentId:",
        localStorage.getItem("studentId")
      );

      console.log(
        "Stored student_id:",
        localStorage.getItem("student_id")
      );

      console.log(
        "Stored full_name:",
        localStorage.getItem("full_name")
      );

      // =================================================
      // SUCCESS
      // =================================================

      alert(
        response?.message ||
          "Login successful!"
      );

      // =================================================
      // DASHBOARD
      // =================================================

      navigate("/dashboard");

    } catch (error) {

      console.error(
        "Login Error:",
        error
      );

      alert(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          error?.message ||
          "Login Failed"
      );

    } finally {

      setLoading(false);

    }
  };

  // =====================================================
  // INPUT STYLE
  // =====================================================

  const inputClass =
    "w-full h-12 px-4 rounded-xl border border-[#101828]/10 bg-white text-[#101828] placeholder:text-[#98A2B3] outline-none transition-all duration-300 focus:border-[#0F766E] focus:ring-4 focus:ring-[#0F766E]/10";

  const labelClass =
    "block text-xs font-semibold text-[#344054] mb-2";

  // =====================================================
  // UI
  // =====================================================

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#101828] overflow-hidden">

      {/* =================================================
          TOP BRAND BAR
      ================================================= */}

      <header className="h-[72px] bg-white/90 backdrop-blur-xl border-b border-[#101828]/10">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-full flex items-center justify-between">

          {/* Logo */}

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-3 group"
          >

            <motion.div
              whileHover={{
                rotate: -5,
                scale: 1.05,
              }}
              className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center"
            >
              <Brain size={21} />
            </motion.div>

            <div className="text-left">

              <div className="text-xl font-bold tracking-tight">
                Recruit<span className="text-[#0F766E]">_Ai</span>
              </div>

              <div className="hidden sm:block text-[9px] uppercase tracking-[0.2em] text-[#667085]">
                Recruitment Platform
              </div>

            </div>

          </button>


          {/* Back */}

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-sm font-medium text-[#475467] hover:text-[#0F766E] transition"
          >

            <ArrowLeft size={15} />

            Back to Home

          </button>

        </div>

      </header>


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="relative">

        {/* Background decoration */}

        <div className="absolute inset-0 pointer-events-none overflow-hidden">

          <div className="absolute -top-40 -right-40 w-[500px] h-[500px] rounded-full bg-[#DDF5EF] blur-3xl opacity-70" />

          <div className="absolute bottom-0 -left-40 w-[450px] h-[450px] rounded-full bg-[#F6D8D0] blur-3xl opacity-40" />

          <div
            className="absolute inset-0 opacity-[0.025]"
            style={{
              backgroundImage:
                "linear-gradient(#101828 1px, transparent 1px), linear-gradient(90deg, #101828 1px, transparent 1px)",
              backgroundSize: "45px 45px",
            }}
          />

        </div>


        <div className="relative z-10 max-w-7xl mx-auto px-5 lg:px-8 py-10 lg:py-14">

          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-8 lg:gap-12 items-stretch">


            {/* =================================================
                LOGIN FORM
            ================================================= */}

            <motion.section
              initial={{
                opacity: 0,
                x: -25,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="bg-white rounded-[28px] border border-[#101828]/10 shadow-xl shadow-[#101828]/5 p-6 sm:p-8 lg:p-10 flex flex-col justify-center"
            >

              {/* Heading */}

              <div className="max-w-md mx-auto w-full">

                <div className="w-11 h-11 rounded-xl bg-[#DDF5EF] text-[#0F766E] flex items-center justify-center mb-5">
                  <Lock size={21} />
                </div>


                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">

                  <span className="w-7 h-[2px] bg-[#0F766E]" />

                  Student Portal

                </div>


                <h1 className="text-4xl sm:text-5xl font-semibold tracking-[-0.045em] mt-4">
                  Welcome
                  <br />
                  back.
                </h1>


                <p className="text-[#667085] leading-7 mt-4">
                  Sign in to continue your recruitment journey
                  with Recruit_Ai.
                </p>


                {/* Form */}

                <form
                  onSubmit={handleLogin}
                  className="mt-8 space-y-5"
                >

                  {/* Email */}

                  <div>

                    <label className={labelClass}>
                      Email Address
                    </label>

                    <input
                      type="email"
                      name="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      required
                      autoComplete="email"
                      className={inputClass}
                    />

                  </div>


                  {/* Password */}

                  <div>

                    <div className="flex items-center justify-between mb-2">

                      <label className="block text-xs font-semibold text-[#344054]">
                        Password
                      </label>

                      <button
                        type="button"
                        className="text-xs font-medium text-[#0F766E] hover:underline"
                      >
                        Forgot password?
                      </button>

                    </div>


                    <div className="relative">

                      <input
                        type={
                          showPassword
                            ? "text"
                            : "password"
                        }
                        name="password"
                        placeholder="Enter your password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                        autoComplete="current-password"
                        className={`${inputClass} pr-12`}
                      />


                      <button
                        type="button"
                        onClick={() =>
                          setShowPassword(!showPassword)
                        }
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#0F766E] transition"
                      >

                        {showPassword ? (
                          <EyeOff size={18} />
                        ) : (
                          <Eye size={18} />
                        )}

                      </button>

                    </div>

                  </div>


                  {/* Remember */}

                  <label className="flex items-center gap-3 cursor-pointer">

                    <input
                      type="checkbox"
                      className="w-4 h-4 accent-[#0F766E]"
                    />

                    <span className="text-xs text-[#667085]">
                      Keep me signed in
                    </span>

                  </label>


                  {/* Login button */}

                  <motion.button
                    whileHover={{
                      y: -2,
                    }}
                    whileTap={{
                      scale: 0.98,
                    }}
                    disabled={loading}
                    type="submit"
                    className="w-full h-13 rounded-xl bg-[#101828] text-white font-semibold flex items-center justify-center gap-3 hover:bg-[#0F766E] disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-300"
                  >

                    {loading ? (
                      <>
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />

                        Signing in...
                      </>
                    ) : (
                      <>
                        Sign In

                        <ArrowRight
                          size={17}
                        />
                      </>
                    )}

                  </motion.button>

                </form>


                {/* Signup */}

                <div className="mt-7 pt-6 border-t border-[#101828]/10 text-center text-sm text-[#667085]">

                  Don't have an account?

                  <button
                    type="button"
                    onClick={() =>
                      navigate("/signup")
                    }
                    className="ml-1.5 font-semibold text-[#0F766E] hover:underline"
                  >
                    Create Account
                  </button>

                </div>


                {/* Security */}

                <div className="mt-6 flex items-center justify-center gap-2 text-xs text-[#98A2B3]">

                  <ShieldCheck
                    size={14}
                    className="text-[#0F766E]"
                  />

                  Secure authentication

                </div>

              </div>

            </motion.section>


            {/* =================================================
                RIGHT INFORMATION PANEL
            ================================================= */}

            <motion.section
              initial={{
                opacity: 0,
                x: 30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.8,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="relative overflow-hidden rounded-[28px] min-h-[600px] lg:min-h-[720px]"
            >

              <motion.img
                initial={{
                  scale: 1.08,
                }}
                animate={{
                  scale: 1,
                }}
                transition={{
                  duration: 1.5,
                  ease: [0.22, 1, 0.36, 1],
                }}
                src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1400&q=90"
                alt="Professional team collaborating"
                className="absolute inset-0 w-full h-full object-cover"
              />


              <div className="absolute inset-0 bg-gradient-to-t from-[#101828]/95 via-[#101828]/45 to-[#101828]/10" />


              <div className="relative h-full min-h-[600px] lg:min-h-[720px] p-7 lg:p-10 flex flex-col justify-between text-white">

                {/* Top */}

                <div className="flex items-start justify-between">

                  <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs">

                    <span className="w-2 h-2 rounded-full bg-[#8FE2D1] animate-pulse" />

                    Welcome back

                  </div>


                  <motion.div
                    animate={{
                      rotate: [0, 5, -5, 0],
                    }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                    }}
                    className="w-11 h-11 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center"
                  >

                    <GraduationCap size={21} />

                  </motion.div>

                </div>


                {/* Bottom */}

                <div>

                  <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                    Your career workspace
                  </div>


                  <h2 className="text-4xl lg:text-5xl font-semibold tracking-[-0.045em] mt-4 leading-[1.05]">

                    Your next
                    <br />

                    opportunity is
                    <br />

                    <span className="text-[#8FE2D1]">
                      closer than you think.
                    </span>

                  </h2>


                  <p className="mt-5 text-sm leading-7 text-white/65 max-w-md">
                    Sign in to discover jobs, manage your
                    applications, analyse your profile and
                    prepare for interviews.
                  </p>


                  {/* Feature cards */}

                  <div className="grid grid-cols-2 gap-3 mt-7">

                    <motion.div
                      whileHover={{
                        y: -4,
                      }}
                      className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4"
                    >

                      <CheckCircle2
                        size={18}
                        className="text-[#8FE2D1]"
                      />

                      <div className="text-sm font-semibold mt-3">
                        Smart Matching
                      </div>

                      <div className="text-[11px] text-white/50 mt-1">
                        Find relevant roles
                      </div>

                    </motion.div>


                    <motion.div
                      whileHover={{
                        y: -4,
                      }}
                      className="bg-white/10 backdrop-blur-md border border-white/10 rounded-xl p-4"
                    >

                      <Sparkles
                        size={18}
                        className="text-[#E87961]"
                      />

                      <div className="text-sm font-semibold mt-3">
                        AI Interviews
                      </div>

                      <div className="text-[11px] text-white/50 mt-1">
                        Prepare smarter
                      </div>

                    </motion.div>

                  </div>

                </div>

              </div>


              {/* Floating notification */}

              <motion.div
                animate={{
                  y: [0, -8, 0],
                }}
                transition={{
                  duration: 4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute right-6 top-28 hidden sm:block"
              >

                <div className="bg-white text-[#101828] rounded-2xl shadow-2xl p-4">

                  <div className="flex items-center gap-3">

                    <div className="w-10 h-10 rounded-xl bg-[#DDF5EF] text-[#0F766E] flex items-center justify-center">
                      <UserPlus size={18} />
                    </div>

                    <div>

                      <div className="text-[10px] text-[#98A2B3]">
                        New opportunity
                      </div>

                      <div className="text-sm font-semibold">
                        12 jobs matched
                      </div>

                    </div>

                  </div>

                </div>

              </motion.div>

            </motion.section>

          </div>

        </div>

      </main>


      {/* =================================================
          FOOTER
      ================================================= */}

      <footer className="border-t border-[#101828]/10 bg-white">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-6">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#98A2B3]">

            <div>
              © 2026 Recruit_Ai. All rights reserved.
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck
                size={14}
                className="text-[#0F766E]"
              />

              Secure Recruitment Platform
            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default Login;

