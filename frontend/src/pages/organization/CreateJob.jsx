import { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Briefcase,
  Building2,
  MapPin,
  IndianRupee,
  FileText,
  User,
  Calendar,
  Tag,
  List,
  Send,
  ArrowLeft,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

import { createJob } from "../../api/jobApi";

import OrganizationSidebar from "../../components/organization/OrganizationSidebar";
import OrganizationNavbar from "../../components/organization/OrganizationNavbar";


function CreateJob() {

  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    department: "",
    location: "",
    employment_type: "",
    experience_required: "",
    salary: "",
    description: "",
    skills: "",
    requirements: "",
  });


  // =========================================================
  // HANDLE CHANGE
  // =========================================================

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


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {

    e.preventDefault();


    const requiredFields = [
      "title",
      "department",
      "location",
      "employment_type",
      "experience_required",
      "salary",
      "description",
      "skills",
      "requirements",
    ];


    for (const field of requiredFields) {

      if (
        !formData[field] ||
        formData[field].trim() === ""
      ) {

        const fieldName =
          field
            .replaceAll("_", " ")
            .replace(
              /\b\w/g,
              (char) =>
                char.toUpperCase()
            );

        toast.error(
          `${fieldName} is required.`
        );

        return;
      }

    }


    const organizationId =
      localStorage.getItem(
        "organizationId"
      ) ||
      localStorage.getItem(
        "organization_id"
      );


    if (!organizationId) {

      toast.error(
        "Organization ID not found. Please login again."
      );

      navigate(
        "/organization/login"
      );

      return;
    }


    try {

      setLoading(true);


      // =====================================================
      // SKILLS
      // =====================================================

      const skillsArray =
        formData.skills
          .split(",")
          .map(
            (skill) =>
              skill.trim()
          )
          .filter(
            (skill) =>
              skill !== ""
          );


      // =====================================================
      // REQUIREMENTS
      // =====================================================

      const requirementsArray =
        formData.requirements
          .split("\n")
          .map(
            (req) =>
              req.trim()
          )
          .filter(
            (req) =>
              req !== ""
          );


      // =====================================================
      // JOB DATA
      // =====================================================

      const jobData = {

        title:
          formData.title.trim(),

        department:
          formData.department.trim(),

        location:
          formData.location.trim(),

        employment_type:
          formData.employment_type,

        experience_required:
          formData.experience_required.trim(),

        salary:
          formData.salary.trim(),

        description:
          formData.description.trim(),

        skills:
          skillsArray,

        requirements:
          requirementsArray,

      };


      console.log(
        "Creating Job:",
        jobData
      );


      await createJob(
        organizationId,
        jobData
      );


      toast.success(
        "Job created successfully!"
      );


      navigate(
        "/organization/jobs"
      );

    } catch (error) {

      console.error(
        "Create Job Error:",
        error
      );


      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to create job."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // SKILL PREVIEW
  // =========================================================

  const skillPreview =
    formData.skills
      .split(",")
      .map(
        (skill) =>
          skill.trim()
      )
      .filter(
        (skill) =>
          skill !== ""
      );


  // =========================================================
  // REQUIREMENT COUNT
  // =========================================================

  const requirementCount =
    formData.requirements
      .split("\n")
      .map(
        (req) =>
          req.trim()
      )
      .filter(
        (req) =>
          req !== ""
      ).length;


  // =========================================================
  // UI
  // =========================================================

  return (

    <div
      className="
        min-h-screen
        bg-[#F7F6F2]
        text-[#172033]
      "
    >

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <OrganizationSidebar />


      {/* =====================================================
          MAIN AREA
      ===================================================== */}

      <div
        className="
          min-h-screen

          ml-0
          md:ml-72
        "
      >

        {/* ===================================================
            NAVBAR
        =================================================== */}

        <OrganizationNavbar />


        {/* ===================================================
            CONTENT
        =================================================== */}

        <main
          className="
            pt-[88px]

            min-h-screen
          "
        >

          <div
            className="
              max-w-[1250px]

              mx-auto

              px-4
              sm:px-5
              lg:px-8

              py-6
              lg:py-8
            "
          >

            {/* =================================================
                HEADER
            ================================================= */}

            <div
              className="
                flex
                flex-col
                sm:flex-row

                sm:items-center
                sm:justify-between

                gap-5

                mb-7

                animate-[fadeUp_0.5s_ease-out]
              "
            >

              <div>

                <button
                  type="button"

                  onClick={() =>
                    navigate(
                      "/organization/jobs"
                    )
                  }

                  className="
                    inline-flex

                    items-center
                    gap-2

                    text-sm

                    font-medium

                    text-[#64748B]

                    hover:text-[#0F766E]

                    mb-4

                    transition
                  "
                >

                  <ArrowLeft
                    size={17}
                  />

                  Back to Jobs

                </button>


                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      w-12
                      h-12

                      rounded-2xl

                      bg-[#E8F3F2]

                      flex
                      items-center
                      justify-center

                      shadow-sm

                      animate-[floatIcon_3s_ease-in-out_infinite]
                    "
                  >

                    <Briefcase
                      size={24}

                      className="
                        text-[#0F766E]
                      "
                    />

                  </div>


                  <div>

                    <h1
                      className="
                        text-2xl
                        md:text-3xl

                        font-bold

                        tracking-tight

                        text-[#172033]
                      "
                    >
                      Create New Job
                    </h1>


                    <p
                      className="
                        text-sm

                        text-[#64748B]

                        mt-1
                      "
                    >
                      Create a clear job posting
                      and find the right candidates.
                    </p>

                  </div>

                </div>

              </div>


              {/* AI BADGE */}

              <div
                className="
                  hidden
                  sm:flex

                  items-center
                  gap-2

                  px-4
                  py-2.5

                  rounded-xl

                  bg-white

                  border
                  border-[#E5E7EB]

                  shadow-sm

                  text-sm
                  font-medium

                  text-[#475569]
                "
              >

                <Sparkles
                  size={17}

                  className="
                    text-[#0F766E]
                  "
                />

                AI-powered recruitment

              </div>

            </div>


            {/* =================================================
                FORM CARD
            ================================================= */}

            <div
              className="
                bg-white

                rounded-3xl

                border
                border-[#E5E7EB]

                shadow-sm

                overflow-hidden

                animate-[fadeUp_0.6s_ease-out]
              "
            >

              {/* =================================================
                  CARD HEADER
              ================================================= */}

              <div
                className="
                  px-5
                  sm:px-7
                  lg:px-8

                  py-5

                  border-b
                  border-[#E5E7EB]

                  bg-gradient-to-r
                  from-white
                  to-[#F8FAF9]
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-3
                  "
                >

                  <div
                    className="
                      w-10
                      h-10

                      rounded-xl

                      bg-[#172033]

                      flex
                      items-center
                      justify-center
                    "
                  >

                    <FileText
                      size={19}

                      className="
                        text-white
                      "
                    />

                  </div>


                  <div>

                    <h2
                      className="
                        font-bold

                        text-[#172033]
                      "
                    >
                      Job Information
                    </h2>


                    <p
                      className="
                        text-xs

                        text-[#94A3B8]

                        mt-0.5
                      "
                    >
                      Add the details candidates
                      need to know.
                    </p>

                  </div>

                </div>

              </div>


              {/* =================================================
                  FORM
              ================================================= */}

              <form
                onSubmit={
                  handleSubmit
                }

                className="
                  p-5
                  sm:p-7
                  lg:p-8
                "
              >

                {/* =================================================
                    BASIC INFORMATION
                ================================================= */}

                <FormSection
                  number="01"
                  title="Basic Information"
                  description="Start with the core details of the position."
                >

                  <div
                    className="
                      grid

                      grid-cols-1
                      md:grid-cols-2

                      gap-5
                    "
                  >

                    <InputField
                      label="Job Title"
                      name="title"
                      value={
                        formData.title
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Frontend Developer"
                      icon={
                        <Briefcase
                          size={17}
                        />
                      }
                      required
                    />


                    <InputField
                      label="Department"
                      name="department"
                      value={
                        formData.department
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Engineering"
                      icon={
                        <Building2
                          size={17}
                        />
                      }
                      required
                    />


                    <InputField
                      label="Location"
                      name="location"
                      value={
                        formData.location
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. Bangalore"
                      icon={
                        <MapPin
                          size={17}
                        />
                      }
                      required
                    />


                    <SelectField
                      label="Employment Type"
                      name="employment_type"
                      value={
                        formData.employment_type
                      }
                      onChange={
                        handleChange
                      }
                      icon={
                        <User
                          size={17}
                        />
                      }
                      required
                      options={[
                        "Full Time",
                        "Part Time",
                        "Internship",
                        "Contract",
                        "Remote",
                        "Hybrid",
                      ]}
                    />


                    <InputField
                      label="Experience Required"
                      name="experience_required"
                      value={
                        formData.experience_required
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. 2+ Years"
                      icon={
                        <Calendar
                          size={17}
                        />
                      }
                      required
                    />


                    <InputField
                      label="Salary"
                      name="salary"
                      value={
                        formData.salary
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="e.g. ₹8 LPA"
                      icon={
                        <IndianRupee
                          size={17}
                        />
                      }
                      required
                    />

                  </div>

                </FormSection>


                {/* =================================================
                    JOB DESCRIPTION
                ================================================= */}

                <div
                  className="
                    mt-8
                    pt-8

                    border-t
                    border-[#EEF0EF]
                  "
                >

                  <FormSection
                    number="02"
                    title="Job Description"
                    description="Explain what the candidate will do in this role."
                  >

                    <TextareaField
                      label="Job Description"
                      name="description"
                      value={
                        formData.description
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="
                        Describe the role, responsibilities,
                        day-to-day work and expectations...
                      "
                      icon={
                        <FileText
                          size={17}
                        />
                      }
                      rows={6}
                      required
                    />

                  </FormSection>

                </div>


                {/* =================================================
                    SKILLS
                ================================================= */}

                <div
                  className="
                    mt-8
                    pt-8

                    border-t
                    border-[#EEF0EF]
                  "
                >

                  <FormSection
                    number="03"
                    title="Required Skills"
                    description="Add the technical and professional skills required."
                  >

                    <InputField
                      label="Skills"
                      name="skills"
                      value={
                        formData.skills
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="
                        e.g. React, JavaScript,
                        HTML, CSS, Git
                      "
                      icon={
                        <Tag
                          size={17}
                        />
                      }
                      required
                    />


                    <p
                      className="
                        text-xs

                        text-[#94A3B8]

                        mt-2
                      "
                    >
                      Separate each skill with a comma.
                    </p>


                    {/* SKILL PREVIEW */}

                    {skillPreview.length >
                      0 && (

                      <div
                        className="
                          flex
                          flex-wrap

                          gap-2

                          mt-4

                          p-4

                          rounded-xl

                          bg-[#F8FAF9]

                          border
                          border-[#E5E7EB]
                        "
                      >

                        <div
                          className="
                            w-full

                            flex
                            items-center
                            gap-2

                            text-xs

                            font-semibold

                            text-[#64748B]

                            mb-1
                          "
                        >

                          <CheckCircle2
                            size={14}

                            className="
                              text-[#0F766E]
                            "
                          />

                          Skill Preview

                        </div>


                        {skillPreview.map(
                          (
                            skill,
                            index
                          ) => (

                            <span
                              key={`${skill}-${index}`}

                              className="
                                inline-flex

                                items-center

                                px-3
                                py-1.5

                                rounded-lg

                                bg-[#E8F3F2]

                                text-[#0F766E]

                                text-xs

                                font-semibold

                                animate-[chipIn_0.25s_ease-out]
                              "
                            >
                              {skill}
                            </span>

                          )
                        )}

                      </div>

                    )}

                  </FormSection>

                </div>


                {/* =================================================
                    REQUIREMENTS
                ================================================= */}

                <div
                  className="
                    mt-8
                    pt-8

                    border-t
                    border-[#EEF0EF]
                  "
                >

                  <FormSection
                    number="04"
                    title="Candidate Requirements"
                    description="Define the qualifications and conditions candidates should meet."
                  >

                    <TextareaField
                      label="Requirements"
                      name="requirements"
                      value={
                        formData.requirements
                      }
                      onChange={
                        handleChange
                      }
                      placeholder="
                        Bachelor's degree in Computer Science
                        2+ years of development experience
                        Strong communication skills
                        Experience with React
                      "
                      icon={
                        <List
                          size={17}
                        />
                      }
                      rows={7}
                      required
                    />


                    <div
                      className="
                        flex

                        items-center
                        justify-between

                        mt-2
                      "
                    >

                      <p
                        className="
                          text-xs

                          text-[#94A3B8]
                        "
                      >
                        Enter each requirement
                        on a new line.
                      </p>


                      <span
                        className="
                          text-xs

                          font-semibold

                          text-[#0F766E]
                        "
                      >
                        {requirementCount}{" "}
                        requirement
                        {requirementCount !==
                        1
                          ? "s"
                          : ""}
                      </span>

                    </div>

                  </FormSection>

                </div>


                {/* =================================================
                    FORM FOOTER
                ================================================= */}

                <div
                  className="
                    mt-8
                    pt-6

                    border-t
                    border-[#E5E7EB]

                    flex

                    flex-col-reverse
                    sm:flex-row

                    sm:items-center
                    sm:justify-between

                    gap-4
                  "
                >

                  <div>

                    <p
                      className="
                        text-sm

                        font-medium

                        text-[#475569]
                      "
                    >
                      Ready to create this job?
                    </p>


                    <p
                      className="
                        text-xs

                        text-[#94A3B8]

                        mt-1
                      "
                    >
                      You can manage or publish it
                      from Manage Jobs.
                    </p>

                  </div>


                  <div
                    className="
                      flex
                      items-center

                      gap-3
                    "
                  >

                    <button
                      type="button"

                      onClick={() =>
                        navigate(
                          "/organization/jobs"
                        )
                      }

                      disabled={
                        loading
                      }

                      className="
                        px-5
                        py-3

                        rounded-xl

                        border
                        border-[#DDE3E5]

                        bg-white

                        text-[#475569]

                        text-sm
                        font-semibold

                        hover:bg-[#F8FAF9]

                        transition
                      "
                    >
                      Cancel
                    </button>


                    <button
                      type="submit"

                      disabled={
                        loading
                      }

                      className="
                        inline-flex

                        items-center
                        justify-center

                        gap-2

                        px-6
                        py-3

                        rounded-xl

                        bg-[#172033]

                        text-white

                        text-sm
                        font-semibold

                        shadow-sm

                        hover:bg-[#0F766E]

                        hover:-translate-y-0.5

                        hover:shadow-lg

                        transition-all
                        duration-200

                        disabled:opacity-60
                        disabled:cursor-not-allowed

                        disabled:hover:translate-y-0
                      "
                    >

                      {loading ? (

                        <>
                          <span
                            className="
                              w-4
                              h-4

                              rounded-full

                              border-2
                              border-white/30
                              border-t-white

                              animate-spin
                            "
                          />

                          Creating...

                        </>

                      ) : (

                        <>
                          <Send
                            size={17}
                          />

                          Create Job

                        </>

                      )}

                    </button>

                  </div>

                </div>

              </form>

            </div>

          </div>

        </main>

      </div>


      {/* =====================================================
          ANIMATIONS
      ===================================================== */}

      <style>
        {`

          @keyframes fadeUp {

            from {
              opacity: 0;
              transform: translateY(12px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }

          }


          @keyframes floatIcon {

            0%,
            100% {
              transform: translateY(0);
            }

            50% {
              transform: translateY(-3px);
            }

          }


          @keyframes chipIn {

            from {
              opacity: 0;
              transform: scale(0.92);
            }

            to {
              opacity: 1;
              transform: scale(1);
            }

          }

        `}
      </style>

    </div>

  );
}


// =============================================================
// FORM SECTION
// =============================================================

function FormSection({
  number,
  title,
  description,
  children,
}) {

  return (

    <section>

      <div
        className="
          mb-5
        "
      >

        <div
          className="
            flex
            items-center
            gap-3
          "
        >

          <span
            className="
              w-8
              h-8

              rounded-lg

              bg-[#E8F3F2]

              text-[#0F766E]

              flex
              items-center
              justify-center

              text-xs

              font-bold
            "
          >
            {number}
          </span>


          <div>

            <h3
              className="
                text-base

                font-bold

                text-[#172033]
              "
            >
              {title}
            </h3>


            <p
              className="
                text-xs

                text-[#94A3B8]

                mt-0.5
              "
            >
              {description}
            </p>

          </div>

        </div>

      </div>


      {children}

    </section>

  );

}


// =============================================================
// INPUT
// =============================================================

function InputField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  required,
}) {

  return (

    <div>

      <label
        className="
          flex

          items-center
          gap-2

          text-sm

          font-semibold

          text-[#172033]

          mb-2
        "
      >

        <span
          className="
            text-[#0F766E]
          "
        >
          {icon}
        </span>

        {label}

        {required && (
          <span
            className="
              text-[#C53030]
            "
          >
            *
          </span>
        )}

      </label>


      <div
        className="
          relative
        "
      >

        <input
          type="text"

          name={name}

          value={value}

          onChange={onChange}

          placeholder={placeholder}

          required={required}

          className="
            w-full

            h-12

            px-4

            rounded-xl

            border
            border-[#DDE3E5]

            bg-white

            text-sm

            text-[#172033]

            outline-none

            placeholder:text-[#A0AAB5]

            hover:border-[#B8C4C4]

            focus:border-[#0F766E]

            focus:ring-4

            focus:ring-[#0F766E]/10

            transition-all
            duration-200
          "
        />

      </div>

    </div>

  );

}


// =============================================================
// SELECT
// =============================================================

function SelectField({
  label,
  name,
  value,
  onChange,
  icon,
  options,
  required,
}) {

  return (

    <div>

      <label
        className="
          flex

          items-center
          gap-2

          text-sm

          font-semibold

          text-[#172033]

          mb-2
        "
      >

        <span
          className="
            text-[#0F766E]
          "
        >
          {icon}
        </span>

        {label}

        {required && (
          <span
            className="
              text-[#C53030]
            "
          >
            *
          </span>
        )}

      </label>


      <select
        name={name}

        value={value}

        onChange={onChange}

        required={required}

        className="
          w-full

          h-12

          px-4

          rounded-xl

          border
          border-[#DDE3E5]

          bg-white

          text-sm

          text-[#172033]

          outline-none

          hover:border-[#B8C4C4]

          focus:border-[#0F766E]

          focus:ring-4

          focus:ring-[#0F766E]/10

          transition-all
          duration-200
        "
      >

        <option value="">
          Select employment type
        </option>

        {options.map(
          (option) => (

            <option
              key={option}
              value={option}
            >
              {option}
            </option>

          )
        )}

      </select>

    </div>

  );

}


// =============================================================
// TEXTAREA
// =============================================================

function TextareaField({
  label,
  name,
  value,
  onChange,
  placeholder,
  icon,
  rows,
  required,
}) {

  return (

    <div>

      <label
        className="
          flex

          items-center
          gap-2

          text-sm

          font-semibold

          text-[#172033]

          mb-2
        "
      >

        <span
          className="
            text-[#0F766E]
          "
        >
          {icon}
        </span>

        {label}

        {required && (
          <span
            className="
              text-[#C53030]
            "
          >
            *
          </span>
        )}

      </label>


      <textarea
        name={name}

        value={value}

        onChange={onChange}

        placeholder={placeholder}

        rows={rows}

        required={required}

        className="
          w-full

          px-4
          py-3

          rounded-xl

          border
          border-[#DDE3E5]

          bg-white

          text-sm

          text-[#172033]

          outline-none

          resize-y

          placeholder:text-[#A0AAB5]

          hover:border-[#B8C4C4]

          focus:border-[#0F766E]

          focus:ring-4

          focus:ring-[#0F766E]/10

          transition-all
          duration-200
        "
      />

    </div>

  );

}


export default CreateJob;