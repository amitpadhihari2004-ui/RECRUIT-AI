import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

import {
  Building2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  Loader2,
  CheckCircle2,
} from "lucide-react";

import toast from "react-hot-toast";

import { organizationLogin } from "../../api/organizationApi";


function OrganizationLogin() {

  const navigate = useNavigate();


  // =======================================================
  // STATE
  // =======================================================

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });


  // =======================================================
  // HANDLE CHANGE
  // =======================================================

  const handleChange = (e) => {

    setFormData((previous) => ({
      ...previous,
      [e.target.name]: e.target.value,
    }));

  };


  // =======================================================
  // HANDLE LOGIN
  // =======================================================

  const handleLogin = async (e) => {

    e.preventDefault();


    if (!formData.email.trim()) {

      toast.error(
        "Company email is required."
      );

      return;

    }


    if (!formData.password.trim()) {

      toast.error(
        "Password is required."
      );

      return;

    }


    try {

      setLoading(true);


      const response =
        await organizationLogin(
          formData
        );


      console.log(
        "LOGIN RESPONSE:",
        response
      );


      // ===================================================
      // GET ORGANIZATION DATA
      // ===================================================

      const organizationId =
        response?.organization_id;

      const companyName =
        response?.company_name;


      // ===================================================
      // VALIDATE ORGANIZATION ID
      // ===================================================

      if (!organizationId) {

        console.error(
          "Organization ID missing:",
          response
        );


        throw new Error(
          "Organization ID was not returned by the server."
        );

      }


      // ===================================================
      // STORE ORGANIZATION ID
      // ===================================================

      localStorage.setItem(
        "organizationId",
        String(organizationId)
      );


      // ===================================================
      // STORE COMPANY NAME
      // ===================================================

      if (companyName) {

        localStorage.setItem(
          "company_name",
          companyName
        );

      }


      // ===================================================
      // STORE ORGANIZATION OBJECT
      // ===================================================

      localStorage.setItem(
        "organization",
        JSON.stringify({
          id: organizationId,
          organization_id: organizationId,
          company_name:
            companyName || "",
        })
      );


      // ===================================================
      // VERIFY
      // ===================================================

      console.log(
        "Stored organizationId:",
        localStorage.getItem(
          "organizationId"
        )
      );


      console.log(
        "Stored organization:",
        localStorage.getItem(
          "organization"
        )
      );


      // ===================================================
      // SUCCESS
      // ===================================================

      toast.success(
        response?.message ||
        "Login Successful"
      );


      navigate(
        "/organization/dashboard"
      );


    } catch (error) {

      console.error(
        "Organization Login Error:",
        error
      );


      console.error(
        "Backend Response:",
        error?.response?.data
      );


      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        error?.message ||
        "Login Failed"
      );


    } finally {

      setLoading(false);

    }

  };


  // =======================================================
  // PAGE
  // =======================================================

  return (

    <div
      className="
        min-h-screen
        relative
        overflow-hidden
        bg-[#F7F6F2]
        text-[#172033]
      "
    >

      {/* =================================================
          DECORATIVE BACKGROUND
      ================================================= */}

      <div
        className="
          absolute
          -top-44
          -right-44
          w-[520px]
          h-[520px]
          rounded-full
          bg-[#0F766E]/10
          blur-3xl
          pointer-events-none
          animate-[float_8s_ease-in-out_infinite]
        "
      />

      <div
        className="
          absolute
          -bottom-48
          -left-44
          w-[520px]
          h-[520px]
          rounded-full
          bg-[#172033]/10
          blur-3xl
          pointer-events-none
          animate-[floatReverse_10s_ease-in-out_infinite]
        "
      />

      <div
        className="
          absolute
          top-1/3
          right-1/3
          w-64
          h-64
          rounded-full
          bg-[#0F766E]/5
          blur-3xl
          pointer-events-none
        "
      />


      {/* =================================================
          MAIN
      ================================================= */}

      <main
        className="
          relative
          z-10
          min-h-screen
          flex
          items-center
          justify-center
          px-4
          py-8
          sm:px-6
        "
      >

        <div
          className="
            w-full
            max-w-md
            animate-[fadeIn_.5s_ease-out]
          "
        >

          {/* =================================================
              BRAND
          ================================================= */}

          <div
            className="
              flex
              flex-col
              items-center
              text-center
              mb-7
            "
          >

            <div
              className="
                relative
                w-16
                h-16
                rounded-2xl
                bg-[#172033]
                flex
                items-center
                justify-center
                shadow-[0_14px_35px_rgba(23,32,51,0.18)]
              "
            >

              <Building2
                size={31}
                strokeWidth={1.8}
                className="text-white"
              />


              <span
                className="
                  absolute
                  -right-1
                  -bottom-1
                  w-5
                  h-5
                  rounded-full
                  bg-[#0F766E]
                  border-4
                  border-[#F7F6F2]
                "
              />

            </div>


            <p
              className="
                mt-4
                text-xs
                font-bold
                uppercase
                tracking-[0.22em]
                text-[#0F766E]
              "
            >
              Recruit AI
            </p>


            <h1
              className="
                mt-2
                text-3xl
                sm:text-4xl
                font-bold
                tracking-tight
                text-[#172033]
              "
            >
              Welcome back
            </h1>


            <p
              className="
                mt-2
                text-sm
                sm:text-base
                text-[#64748B]
              "
            >
              Sign in to manage your hiring workspace.
            </p>

          </div>


          {/* =================================================
              LOGIN CARD
          ================================================= */}

          <section
            className="
              bg-white
              border
              border-[#E5E7EB]
              rounded-[26px]
              shadow-[0_24px_70px_rgba(23,32,51,0.10)]
              overflow-hidden
            "
          >

            {/* =================================================
                CARD TOP
            ================================================= */}

            <div
              className="
                px-6
                sm:px-8
                pt-7
                pb-6
                border-b
                border-[#E5E7EB]
              "
            >

              <div
                className="
                  flex
                  items-center
                  justify-between
                  gap-3
                "
              >

                <div>

                  <p
                    className="
                      text-xs
                      font-bold
                      uppercase
                      tracking-wider
                      text-[#0F766E]
                    "
                  >
                    Organization Portal
                  </p>


                  <h2
                    className="
                      mt-1
                      text-xl
                      font-bold
                      text-[#172033]
                    "
                  >
                    Organization Login
                  </h2>

                </div>


                <div
                  className="
                    flex
                    items-center
                    justify-center
                    w-11
                    h-11
                    rounded-xl
                    bg-[#E6F4F1]
                    text-[#0F766E]
                  "
                >

                  <ShieldCheck
                    size={22}
                  />

                </div>

              </div>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleLogin}
              className="
                px-6
                sm:px-8
                py-7
              "
            >

              <div className="space-y-5">


                {/* =================================================
                    EMAIL
                ================================================= */}

                <div>

                  <label
                    className="
                      block
                      mb-2
                      text-sm
                      font-semibold
                      text-[#172033]
                    "
                  >
                    Company Email
                  </label>


                  <div className="relative group">

                    <Mail
                      size={19}
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-[#94A3B8]
                        transition
                        group-focus-within:text-[#0F766E]
                      "
                    />


                    <input
                      type="email"
                      name="email"
                      placeholder="company@example.com"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-[#DDE2E8]
                        bg-white
                        py-3.5
                        pl-11
                        pr-4
                        text-sm
                        text-[#172033]
                        placeholder:text-[#94A3B8]
                        outline-none
                        transition-all
                        focus:border-[#0F766E]
                        focus:ring-4
                        focus:ring-[#0F766E]/10
                        hover:border-[#B9C2CC]
                      "
                    />

                  </div>

                </div>


                {/* =================================================
                    PASSWORD
                ================================================= */}

                <div>

                  <div
                    className="
                      flex
                      items-center
                      justify-between
                      mb-2
                    "
                  >

                    <label
                      className="
                        text-sm
                        font-semibold
                        text-[#172033]
                      "
                    >
                      Password
                    </label>

                  </div>


                  <div className="relative group">

                    <Lock
                      size={19}
                      className="
                        absolute
                        left-4
                        top-1/2
                        -translate-y-1/2
                        text-[#94A3B8]
                        transition
                        group-focus-within:text-[#0F766E]
                      "
                    />


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
                      autoComplete="current-password"
                      className="
                        w-full
                        rounded-xl
                        border
                        border-[#DDE2E8]
                        bg-white
                        py-3.5
                        pl-11
                        pr-12
                        text-sm
                        text-[#172033]
                        placeholder:text-[#94A3B8]
                        outline-none
                        transition-all
                        focus:border-[#0F766E]
                        focus:ring-4
                        focus:ring-[#0F766E]/10
                        hover:border-[#B9C2CC]
                      "
                    />


                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (previous) =>
                            !previous
                        )
                      }
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="
                        absolute
                        right-3
                        top-1/2
                        -translate-y-1/2
                        w-9
                        h-9
                        flex
                        items-center
                        justify-center
                        rounded-lg
                        text-[#64748B]
                        hover:bg-[#F1F5F4]
                        hover:text-[#0F766E]
                        transition
                      "
                    >

                      {showPassword ? (
                        <EyeOff size={18} />
                      ) : (
                        <Eye size={18} />
                      )}

                    </button>

                  </div>

                </div>


                {/* =================================================
                    OPTIONS
                ================================================= */}

                <div
                  className="
                    flex
                    items-center
                    justify-between
                    gap-4
                    text-xs
                    sm:text-sm
                  "
                >

                  <label
                    className="
                      flex
                      items-center
                      gap-2
                      text-[#64748B]
                      cursor-pointer
                    "
                  >

                    <input
                      type="checkbox"
                      className="
                        w-4
                        h-4
                        rounded
                        border-[#CBD5E1]
                        accent-[#0F766E]
                        cursor-pointer
                      "
                    />

                    Remember Me

                  </label>


                  <Link
                    to="/organization/forgot-password"
                    className="
                      font-semibold
                      text-[#0F766E]
                      hover:text-[#095E58]
                      transition
                    "
                  >
                    Forgot Password?
                  </Link>

                </div>


                {/* =================================================
                    LOGIN BUTTON
                ================================================= */}

                <button
                  type="submit"
                  disabled={loading}
                  className="
                    relative
                    group
                    w-full
                    overflow-hidden
                    rounded-xl
                    bg-[#172033]
                    py-3.5
                    px-5
                    text-white
                    font-bold
                    text-base
                    shadow-[0_10px_25px_rgba(23,32,51,0.16)]
                    transition-all
                    hover:-translate-y-0.5
                    hover:bg-[#0F172A]
                    hover:shadow-[0_14px_30px_rgba(23,32,51,0.20)]
                    disabled:opacity-70
                    disabled:cursor-not-allowed
                    disabled:hover:translate-y-0
                  "
                >

                  <span
                    className="
                      absolute
                      inset-y-0
                      -left-20
                      w-16
                      rotate-12
                      bg-white/10
                      transition-all
                      duration-700
                      group-hover:left-[110%]
                    "
                  />


                  <span
                    className="
                      relative
                      flex
                      items-center
                      justify-center
                      gap-2
                    "
                  >

                    {loading ? (

                      <>
                        <Loader2
                          size={19}
                          className="animate-spin"
                        />

                        Signing in...

                      </>

                    ) : (

                      <>
                        Login

                        <ArrowRight
                          size={18}
                          className="
                            transition-transform
                            group-hover:translate-x-1
                          "
                        />

                      </>

                    )}

                  </span>

                </button>

              </div>


              {/* =================================================
                  SECURITY NOTE
              ================================================= */}

              <div
                className="
                  mt-6
                  flex
                  items-start
                  gap-3
                  rounded-xl
                  border
                  border-[#E2EEEC]
                  bg-[#F4FAF8]
                  px-4
                  py-3.5
                "
              >

                <CheckCircle2
                  size={17}
                  className="
                    mt-0.5
                    flex-shrink-0
                    text-[#16803C]
                  "
                />


                <p
                  className="
                    text-xs
                    leading-5
                    text-[#64748B]
                  "
                >
                  Your organization workspace is protected.
                  Use your registered company credentials to
                  access your recruitment dashboard.
                </p>

              </div>


              {/* =================================================
                  SIGNUP
              ================================================= */}

              <p
                className="
                  text-center
                  text-sm
                  text-[#64748B]
                  mt-7
                "
              >

                Don't have an account?

                <Link
                  to="/organization/signup"
                  className="
                    ml-1.5
                    font-bold
                    text-[#0F766E]
                    hover:text-[#095E58]
                    transition
                  "
                >
                  Create Organization
                </Link>

              </p>

            </form>

          </section>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div
            className="
              flex
              items-center
              justify-center
              gap-2
              mt-5
              text-xs
              text-[#94A3B8]
            "
          >

            <span
              className="
                w-1.5
                h-1.5
                rounded-full
                bg-[#16803C]
              "
            />

            Recruit AI • Professional hiring platform

          </div>

        </div>

      </main>


      {/* =================================================
          ANIMATIONS
      ================================================= */}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(12px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes float {
            0%, 100% {
              transform: translate(0, 0);
            }

            50% {
              transform: translate(-20px, 20px);
            }
          }

          @keyframes floatReverse {
            0%, 100% {
              transform: translate(0, 0);
            }

            50% {
              transform: translate(20px, -20px);
            }
          }
        `}
      </style>

    </div>

  );

}


export default OrganizationLogin;