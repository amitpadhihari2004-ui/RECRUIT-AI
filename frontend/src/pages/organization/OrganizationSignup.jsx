import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import {
  Building2,
  Mail,
  Lock,
  Phone,
  Globe,
  MapPin,
  Briefcase,
  Calendar,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  Loader2,
} from "lucide-react";

import toast from "react-hot-toast";

import { organizationSignup } from "../../api/organizationApi";


// =========================================================
// ORGANIZATION SIGNUP
// =========================================================

function OrganizationSignup() {

  const navigate = useNavigate();

  const [showPassword, setShowPassword] =
    useState(false);

  const [loading, setLoading] =
    useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    password: "",
    phone: "",
    website: "",
    industry: "",
    address: "",
    company_size: "",
    founded_year: "",
  });


  // =======================================================
  // HANDLE CHANGE
  // =======================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

  };


  // =======================================================
  // HANDLE SIGNUP
  // =======================================================

  const handleSignup = async (e) => {

    e.preventDefault();


    if (!formData.company_name.trim()) {

      toast.error(
        "Company name is required."
      );

      return;

    }


    if (!formData.email.trim()) {

      toast.error(
        "Email is required."
      );

      return;

    }


    if (!formData.password) {

      toast.error(
        "Password is required."
      );

      return;

    }


    if (!formData.phone.trim()) {

      toast.error(
        "Phone number is required."
      );

      return;

    }


    if (!formData.industry.trim()) {

      toast.error(
        "Industry is required."
      );

      return;

    }


    if (!formData.address.trim()) {

      toast.error(
        "Address is required."
      );

      return;

    }


    try {

      setLoading(true);


      const response =
        await organizationSignup(
          formData
        );


      toast.success(
        response?.message ||
        "Organization registered successfully."
      );


      navigate(
        "/organization/login"
      );

    } catch (error) {

      console.error(
        "Organization signup error:",
        error
      );


      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Registration failed. Please try again."
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
          -top-40
          -right-40
          w-[500px]
          h-[500px]
          rounded-full
          bg-[#0F766E]/10
          blur-3xl
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          -bottom-48
          -left-40
          w-[520px]
          h-[520px]
          rounded-full
          bg-[#172033]/10
          blur-3xl
          pointer-events-none
        "
      />

      <div
        className="
          absolute
          top-1/3
          left-1/2
          w-72
          h-72
          rounded-full
          bg-[#0F766E]/5
          blur-3xl
          pointer-events-none
        "
      />


      {/* =================================================
          MAIN CONTAINER
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
          lg:px-8
        "
      >

        <div
          className="
            w-full
            max-w-5xl
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
                flex
                items-center
                justify-center
                w-16
                h-16
                rounded-2xl
                bg-[#172033]
                shadow-[0_14px_35px_rgba(23,32,51,0.18)]
              "
            >

              <Building2
                size={30}
                strokeWidth={1.8}
                className="text-white"
              />


              <div
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
              Create your organization
            </h1>


            <p
              className="
                mt-2
                max-w-xl
                text-sm
                sm:text-base
                leading-6
                text-[#64748B]
              "
            >
              Build your recruitment workspace and
              manage jobs, candidates, interviews and
              hiring from one place.
            </p>

          </div>


          {/* =================================================
              CARD
          ================================================= */}

          <section
            className="
              overflow-hidden
              rounded-[28px]
              border
              border-[#E5E7EB]
              bg-white
              shadow-[0_24px_70px_rgba(23,32,51,0.10)]
            "
          >

            {/* =================================================
                CARD HEADER
            ================================================= */}

            <div
              className="
                relative
                overflow-hidden
                border-b
                border-[#E5E7EB]
                px-6
                py-6
                sm:px-8
                lg:px-10
              "
            >

              <div
                className="
                  absolute
                  inset-0
                  bg-gradient-to-r
                  from-[#172033]
                  via-[#1E3545]
                  to-[#0F766E]
                  opacity-[0.035]
                  pointer-events-none
                "
              />


              <div
                className="
                  relative
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-4
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
                    Organization profile
                  </p>


                  <h2
                    className="
                      mt-1
                      text-xl
                      font-bold
                      text-[#172033]
                    "
                  >
                    Company information
                  </h2>


                  <p
                    className="
                      mt-1
                      text-sm
                      text-[#64748B]
                    "
                  >
                    Enter your organization details
                    to get started.
                  </p>

                </div>


                <div
                  className="
                    inline-flex
                    items-center
                    gap-2
                    self-start
                    sm:self-auto
                    rounded-full
                    border
                    border-[#D7EDE9]
                    bg-[#E6F4F1]
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    text-[#0F766E]
                  "
                >

                  <span
                    className="
                      w-1.5
                      h-1.5
                      rounded-full
                      bg-[#0F766E]
                    "
                  />

                  Secure registration

                </div>

              </div>

            </div>


            {/* =================================================
                FORM
            ================================================= */}

            <form
              onSubmit={handleSignup}
              className="
                px-6
                py-7
                sm:px-8
                lg:px-10
                lg:py-9
              "
            >

              <div
                className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-x-6
                  gap-y-5
                "
              >

                {/* =================================================
                    COMPANY NAME
                ================================================= */}

                <Input
                  icon={<Building2 size={18} />}
                  label="Company Name"
                  required
                  placeholder="Enter company name"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                />


                {/* =================================================
                    EMAIL
                ================================================= */}

                <Input
                  icon={<Mail size={18} />}
                  label="Company Email"
                  required
                  placeholder="company@example.com"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                />


                {/* =================================================
                    PASSWORD
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

                    Password

                    <span className="ml-1 text-[#C53030]">
                      *
                    </span>

                  </label>


                  <div
                    className="
                      group
                      relative
                    "
                  >

                    <Lock
                      size={18}
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
                      placeholder="Create a secure password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
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
                        flex
                        items-center
                        justify-center
                        w-9
                        h-9
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
                    PHONE
                ================================================= */}

                <Input
                  icon={<Phone size={18} />}
                  label="Phone Number"
                  required
                  placeholder="+91 XXXXX XXXXX"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                />


                {/* =================================================
                    WEBSITE
                ================================================= */}

                <Input
                  icon={<Globe size={18} />}
                  label="Website"
                  placeholder="https://yourcompany.com"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                />


                {/* =================================================
                    INDUSTRY
                ================================================= */}

                <Input
                  icon={<Briefcase size={18} />}
                  label="Industry"
                  required
                  placeholder="e.g. Information Technology"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                />


                {/* =================================================
                    COMPANY SIZE
                ================================================= */}

                <Input
                  icon={<Building2 size={18} />}
                  label="Company Size"
                  placeholder="e.g. 51-200 employees"
                  name="company_size"
                  value={formData.company_size}
                  onChange={handleChange}
                />


                {/* =================================================
                    FOUNDED YEAR
                ================================================= */}

                <Input
                  icon={<Calendar size={18} />}
                  label="Founded Year"
                  placeholder="e.g. 2018"
                  name="founded_year"
                  value={formData.founded_year}
                  onChange={handleChange}
                  type="number"
                  min="1800"
                  max="2100"
                />


                {/* =================================================
                    ADDRESS
                ================================================= */}

                <div className="md:col-span-2">

                  <label
                    className="
                      block
                      mb-2
                      text-sm
                      font-semibold
                      text-[#172033]
                    "
                  >

                    Company Address

                    <span className="ml-1 text-[#C53030]">
                      *
                    </span>

                  </label>


                  <div className="relative group">

                    <MapPin
                      size={18}
                      className="
                        absolute
                        left-4
                        top-4
                        text-[#94A3B8]
                        transition
                        group-focus-within:text-[#0F766E]
                      "
                    />


                    <textarea
                      rows="3"
                      name="address"
                      placeholder="Enter your complete company address"
                      value={formData.address}
                      onChange={handleChange}
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
                        leading-6
                        text-[#172033]
                        placeholder:text-[#94A3B8]
                        outline-none
                        resize-none
                        transition-all
                        focus:border-[#0F766E]
                        focus:ring-4
                        focus:ring-[#0F766E]/10
                        hover:border-[#B9C2CC]
                      "
                    />

                  </div>

                </div>

              </div>


              {/* =================================================
                  FORM NOTE
              ================================================= */}

              <div
                className="
                  mt-7
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
                  size={18}
                  className="
                    mt-0.5
                    flex-shrink-0
                    text-[#0F766E]
                  "
                />


                <p
                  className="
                    text-xs
                    sm:text-sm
                    leading-5
                    text-[#526273]
                  "
                >
                  Your organization profile will be used
                  to create your Recruit AI hiring workspace.
                  You can update additional company details
                  after registration.
                </p>

              </div>


              {/* =================================================
                  SUBMIT
              ================================================= */}

              <button
                type="submit"
                disabled={loading}
                className="
                  relative
                  group
                  w-full
                  mt-7
                  overflow-hidden
                  rounded-xl
                  bg-[#172033]
                  px-6
                  py-4
                  text-sm
                  sm:text-base
                  font-bold
                  text-white
                  shadow-[0_10px_25px_rgba(23,32,51,0.16)]
                  transition-all
                  hover:-translate-y-0.5
                  hover:bg-[#0F172A]
                  hover:shadow-[0_14px_30px_rgba(23,32,51,0.20)]
                  disabled:cursor-not-allowed
                  disabled:opacity-70
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

                      Creating organization...

                    </>

                  ) : (

                    <>
                      Register Organization

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


              {/* =================================================
                  LOGIN
              ================================================= */}

              <p
                className="
                  mt-6
                  text-center
                  text-sm
                  text-[#64748B]
                "
              >

                Already have an account?

                <Link
                  to="/organization/login"
                  className="
                    ml-1.5
                    font-bold
                    text-[#0F766E]
                    hover:text-[#095E58]
                    transition
                  "
                >
                  Sign in
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
          ANIMATION
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
        `}
      </style>

    </div>

  );

}


// =========================================================
// REUSABLE INPUT
// =========================================================

function Input({
  icon,
  label,
  required = false,
  ...props
}) {

  return (

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

        {label}

        {required && (
          <span className="ml-1 text-[#C53030]">
            *
          </span>
        )}

      </label>


      <div className="relative group">

        <div
          className="
            absolute
            left-4
            top-1/2
            -translate-y-1/2
            text-[#94A3B8]
            transition
            group-focus-within:text-[#0F766E]
          "
        >
          {icon}
        </div>


        <input
          {...props}
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

  );

}


export default OrganizationSignup;