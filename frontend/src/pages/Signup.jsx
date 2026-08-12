
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Brain,
  CheckCircle2,
  Eye,
  EyeOff,
  ShieldCheck,
  UserPlus,
  GraduationCap,
  Lock,
} from "lucide-react";

import { signupUser } from "../api/userApi";

function Signup() {
  const navigate = useNavigate();

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    phone: "",
    college_name: "",
    course: "",
    branch: "",
    graduation_year: "",
  });

  const handleChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const resetForm = () => {
    setFormData({
      full_name: "",
      email: "",
      password: "",
      confirm_password: "",
      phone: "",
      college_name: "",
      course: "",
      branch: "",
      graduation_year: "",
    });
  };

  const handleSignup = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirm_password) {
      alert("Passwords do not match");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must contain at least 6 characters");
      return;
    }

    try {
      setLoading(true);

      const response = await signupUser(formData);

      alert(response.message || "Account created successfully");

      resetForm();

      navigate("/login");
    } catch (error) {
      alert(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Signup Failed"
      );
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full h-12 px-4 rounded-xl border border-[#101828]/10 bg-white text-[#101828] placeholder:text-[#98A2B3] outline-none transition-all duration-300 focus:border-[#0F766E] focus:ring-4 focus:ring-[#0F766E]/10";

  const labelClass =
    "block text-xs font-semibold text-[#344054] mb-2";

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#101828] overflow-hidden">

      {/* =========================================================
          TOP BRAND BAR
      ========================================================= */}

      <header className="h-[72px] bg-white/90 backdrop-blur-xl border-b border-[#101828]/10">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-full flex items-center justify-between">

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


          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 text-sm font-medium text-[#475467] hover:text-[#0F766E] transition"
          >
            Already registered?
            <span className="font-semibold">
              Login
            </span>
            <ArrowRight size={15} />
          </button>

        </div>

      </header>


      {/* =========================================================
          MAIN
      ========================================================= */}

      <main className="relative">

        {/* Decorative background */}

        <div className="absolute inset-0 pointer-events-none overflow-hidden">

          <div className="absolute -top-40 -left-40 w-[450px] h-[450px] rounded-full bg-[#DDF5EF] blur-3xl opacity-70" />

          <div className="absolute top-[35%] -right-40 w-[450px] h-[450px] rounded-full bg-[#F6D8D0] blur-3xl opacity-40" />

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

          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-8 lg:gap-12 items-start">


            {/* =====================================================
                LEFT INFORMATION PANEL
            ===================================================== */}

            <motion.section
              initial={{
                opacity: 0,
                x: -30,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.7,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="lg:sticky lg:top-28"
            >

              <div className="relative overflow-hidden rounded-[28px] min-h-[620px]">

                <motion.img
                  initial={{
                    scale: 1.08,
                  }}
                  animate={{
                    scale: 1,
                  }}
                  transition={{
                    duration: 1.4,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=90"
                  alt="Students collaborating"
                  className="absolute inset-0 w-full h-full object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#101828]/95 via-[#101828]/45 to-[#101828]/5" />


                <div className="relative min-h-[620px] p-7 lg:p-9 flex flex-col justify-between text-white">

                  {/* Top */}

                  <div className="flex items-center justify-between">

                    <div className="inline-flex items-center gap-2 px-3 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/15 text-xs">

                      <span className="w-2 h-2 rounded-full bg-[#E87961] animate-pulse" />

                      Student Registration

                    </div>

                    <GraduationCap size={22} className="text-white/70" />

                  </div>


                  {/* Bottom */}

                  <div>

                    <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                      Your career journey
                    </div>

                    <h1 className="text-4xl lg:text-5xl font-semibold tracking-[-0.045em] mt-4 leading-[1.05]">

                      Create your
                      <br />

                      <span className="text-[#8FE2D1]">
                        Recruit_Ai
                      </span>

                      <br />

                      account.

                    </h1>

                    <p className="mt-5 text-sm leading-7 text-white/65 max-w-md">
                      Build your profile, analyse your resume,
                      discover opportunities and prepare for your
                      next interview.
                    </p>


                    <div className="mt-7 space-y-3">

                      {[
                        "Personalised job opportunities",
                        "AI-powered resume analysis",
                        "Structured interview preparation",
                        "Track your applications",
                      ].map((item) => (

                        <div
                          key={item}
                          className="flex items-center gap-3 text-sm text-white/85"
                        >

                          <CheckCircle2
                            size={17}
                            className="text-[#8FE2D1]"
                          />

                          {item}

                        </div>

                      ))}

                    </div>

                  </div>

                </div>

              </div>

            </motion.section>


            {/* =====================================================
                SIGNUP FORM
            ===================================================== */}

            <motion.section
              initial={{
                opacity: 0,
                y: 25,
              }}
              animate={{
                opacity: 1,
                y: 0,
              }}
              transition={{
                duration: 0.7,
                delay: 0.1,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="bg-white rounded-[28px] border border-[#101828]/10 shadow-xl shadow-[#101828]/5 p-6 sm:p-8 lg:p-10"
            >

              {/* Form heading */}

              <div className="mb-8">

                <div className="w-11 h-11 rounded-xl bg-[#DDF5EF] text-[#0F766E] flex items-center justify-center mb-5">
                  <UserPlus size={21} />
                </div>

                <h2 className="text-3xl font-semibold tracking-[-0.04em]">
                  Create your account
                </h2>

                <p className="text-sm text-[#667085] mt-2">
                  Enter your details to get started with Recruit_Ai.
                </p>

              </div>


              <form
                onSubmit={handleSignup}
                className="space-y-7"
              >

                {/* =================================================
                    PERSONAL INFORMATION
                ================================================= */}

                <div>

                  <div className="flex items-center gap-3 mb-5">

                    <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center text-xs font-semibold">
                      01
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm">
                        Personal information
                      </h3>

                      <p className="text-xs text-[#98A2B3] mt-0.5">
                        Basic information about you
                      </p>
                    </div>

                  </div>


                  <div className="grid md:grid-cols-2 gap-5">

                    {/* Full name */}

                    <div className="md:col-span-2">

                      <label className={labelClass}>
                        Full Name
                      </label>

                      <input
                        type="text"
                        name="full_name"
                        placeholder="Enter your full name"
                        value={formData.full_name}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      />

                    </div>


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
                        className={inputClass}
                      />

                    </div>


                    {/* Phone */}

                    <div>

                      <label className={labelClass}>
                        Phone Number
                      </label>

                      <input
                        type="tel"
                        name="phone"
                        placeholder="Enter phone number"
                        value={formData.phone}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      />

                    </div>


                    {/* Password */}

                    <div>

                      <label className={labelClass}>
                        Password
                      </label>

                      <div className="relative">

                        <input
                          type={showPassword ? "text" : "password"}
                          name="password"
                          placeholder="Create a password"
                          value={formData.password}
                          onChange={handleChange}
                          required
                          className={`${inputClass} pr-12`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPassword(!showPassword)
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#0F766E]"
                        >

                          {showPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}

                        </button>

                      </div>

                    </div>


                    {/* Confirm password */}

                    <div>

                      <label className={labelClass}>
                        Confirm Password
                      </label>

                      <div className="relative">

                        <input
                          type={
                            showConfirmPassword
                              ? "text"
                              : "password"
                          }
                          name="confirm_password"
                          placeholder="Confirm password"
                          value={formData.confirm_password}
                          onChange={handleChange}
                          required
                          className={`${inputClass} pr-12`}
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(
                              !showConfirmPassword
                            )
                          }
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#0F766E]"
                        >

                          {showConfirmPassword ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}

                        </button>

                      </div>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    EDUCATION
                ================================================= */}

                <div className="border-t border-[#101828]/10 pt-7">

                  <div className="flex items-center gap-3 mb-5">

                    <div className="w-7 h-7 rounded-lg bg-[#101828] text-white flex items-center justify-center text-xs font-semibold">
                      02
                    </div>

                    <div>
                      <h3 className="font-semibold text-sm">
                        Education
                      </h3>

                      <p className="text-xs text-[#98A2B3] mt-0.5">
                        Tell us about your academic background
                      </p>
                    </div>

                  </div>


                  <div className="grid md:grid-cols-2 gap-5">

                    {/* College */}

                    <div className="md:col-span-2">

                      <label className={labelClass}>
                        College / University
                      </label>

                      <input
                        type="text"
                        name="college_name"
                        placeholder="Enter college or university"
                        value={formData.college_name}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      />

                    </div>


                    {/* Course */}

                    <div>

                      <label className={labelClass}>
                        Course
                      </label>

                      <input
                        type="text"
                        name="course"
                        placeholder="e.g. B.Tech"
                        value={formData.course}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      />

                    </div>


                    {/* Branch */}

                    <div>

                      <label className={labelClass}>
                        Branch / Specialization
                      </label>

                      <input
                        type="text"
                        name="branch"
                        placeholder="e.g. Computer Science"
                        value={formData.branch}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      />

                    </div>


                    {/* Graduation */}

                    <div className="md:col-span-2">

                      <label className={labelClass}>
                        Graduation Year
                      </label>

                      <input
                        type="number"
                        name="graduation_year"
                        placeholder="e.g. 2027"
                        min="2000"
                        max="2100"
                        value={formData.graduation_year}
                        onChange={handleChange}
                        required
                        className={inputClass}
                      />

                    </div>

                  </div>

                </div>


                {/* =================================================
                    SECURITY MESSAGE
                ================================================= */}

                <div className="rounded-xl bg-[#F7F5EF] border border-[#101828]/8 p-4">

                  <div className="flex gap-3">

                    <div className="w-9 h-9 shrink-0 rounded-lg bg-white flex items-center justify-center">
                      <Lock
                        size={16}
                        className="text-[#0F766E]"
                      />
                    </div>

                    <div>

                      <div className="text-sm font-semibold">
                        Your information is protected
                      </div>

                      <p className="text-xs text-[#667085] leading-5 mt-1">
                        Your account information is securely
                        submitted and used to provide your
                        recruitment experience.
                      </p>

                    </div>

                  </div>

                </div>


                {/* =================================================
                    SUBMIT
                ================================================= */}

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
                      Creating Account...
                    </>
                  ) : (
                    <>
                      Create Student Account
                      <ArrowRight size={17} />
                    </>
                  )}

                </motion.button>


                {/* Login */}

                <div className="text-center text-sm text-[#667085]">

                  Already have an account?

                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="ml-1.5 font-semibold text-[#0F766E] hover:underline"
                  >
                    Login
                  </button>

                </div>

              </form>

            </motion.section>

          </div>

        </div>

      </main>


      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="border-t border-[#101828]/10 bg-white">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-6">

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#98A2B3]">

            <div>
              © 2026 Recruit_Ai. All rights reserved.
            </div>

            <div className="flex items-center gap-2">
              <ShieldCheck size={14} className="text-[#0F766E]" />
              Secure Recruitment Platform
            </div>

          </div>

        </div>

      </footer>

    </div>
  );
}

export default Signup;
