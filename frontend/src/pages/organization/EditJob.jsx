import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

import {
  Briefcase,
  Building2,
  MapPin,
  User,
  Calendar,
  IndianRupee,
  FileText,
  Tag,
  List,
  Save,
  RotateCcw,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

import OrganizationSidebar from "../../components/organization/OrganizationSidebar";
import OrganizationNavbar from "../../components/organization/OrganizationNavbar";

import { getJob, updateJob } from "../../api/jobApi";


// =========================================================
// EDIT JOB
// =========================================================

function EditJob() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
  // LOAD JOB
  // =========================================================

  useEffect(() => {
    loadJob();
  }, [id]);


  const loadJob = async () => {
    try {
      setLoading(true);

      const data = await getJob(id);

      console.log("Edit Job Data:", data);

      setFormData({
        title: data?.title || "",
        department: data?.department || "",
        location: data?.location || "",
        employment_type:
          data?.employment_type || "",
        experience_required:
          data?.experience_required || "",
        salary: data?.salary || "",
        description: data?.description || "",

        skills: Array.isArray(data?.skills)
          ? data.skills.join(", ")
          : data?.skills || "",

        requirements: Array.isArray(
          data?.requirements
        )
          ? data.requirements.join(", ")
          : data?.requirements || "",
      });

    } catch (error) {
      console.error(
        "Load Job Error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
          "Failed to load job."
      );

      navigate("/organization/jobs");

    } finally {
      setLoading(false);
    }
  };


  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // =========================================================
  // VALIDATION
  // =========================================================

  const validateForm = () => {
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
        toast.error(
          `${field
            .replaceAll("_", " ")
            .replace(/\b\w/g, (char) =>
              char.toUpperCase()
            )} is required`
        );

        return false;
      }
    }

    return true;
  };


  // =========================================================
  // SUBMIT
  // =========================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setSubmitting(true);

    try {

      // -----------------------------------------------------
      // SKILLS
      // -----------------------------------------------------

      const skillsArray = formData.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean);


      // -----------------------------------------------------
      // REQUIREMENTS
      // -----------------------------------------------------

      const requirementsArray =
        formData.requirements
          .split(",")
          .map((requirement) =>
            requirement.trim()
          )
          .filter(Boolean);


      // -----------------------------------------------------
      // JOB DATA
      // -----------------------------------------------------

      const jobData = {
        title: formData.title.trim(),

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

        skills: skillsArray,

        requirements:
          requirementsArray,
      };


      console.log(
        "Updating Job:",
        jobData
      );


      await updateJob(
        id,
        jobData
      );


      toast.success(
        "Job Updated Successfully"
      );


      navigate(
        "/organization/jobs"
      );

    } catch (error) {

      console.error(
        "Update Job Error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
          error?.response?.data?.message ||
          "Failed to update job."
      );

    } finally {

      setSubmitting(false);

    }
  };


  // =========================================================
  // RESET
  // =========================================================

  const handleReset = async () => {
    await loadJob();

    toast.success(
      "Changes reset"
    );
  };


  // =========================================================
  // LOADING UI
  // =========================================================

  if (loading) {
    return (
      <PortalLayout>

        <div className="min-h-full px-4 py-6 md:px-6 lg:px-8">

          <div className="w-full max-w-[1400px] mx-auto">

            <div className="animate-pulse">

              {/* BACK */}

              <div className="h-5 w-32 bg-gray-200 rounded mb-7" />


              {/* HEADER */}

              <div className="
                bg-white
                rounded-3xl
                border
                border-gray-200
                p-6
                mb-6
              ">

                <div className="h-8 w-64 bg-gray-200 rounded" />

                <div className="h-4 w-80 bg-gray-200 rounded mt-3" />

              </div>


              {/* FORM */}

              <div className="
                bg-white
                rounded-3xl
                border
                border-gray-200
                p-6
                md:p-8
              ">

                <div className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-6
                ">

                  {[1, 2, 3, 4, 5, 6].map(
                    (item) => (
                      <div key={item}>

                        <div className="
                          h-4
                          w-32
                          bg-gray-200
                          rounded
                          mb-3
                        />

                        <div className="
                          h-12
                          w-full
                          bg-gray-200
                          rounded-xl
                        />

                      </div>
                    )
                  )}

                </div>

              </div>

            </div>

          </div>

        </div>

      </PortalLayout>
    );
  }


  // =========================================================
  // MAIN
  // =========================================================

  return (
    <PortalLayout>

      <div className="
        min-h-full
        px-4
        py-6
        md:px-6
        lg:px-8
      ">

        <div className="
          w-full
          max-w-[1400px]
          mx-auto
        ">


          {/* =================================================
              TOP NAVIGATION
          ================================================= */}

          <div className="
            flex
            flex-col
            sm:flex-row
            sm:items-center
            sm:justify-between
            gap-4
            mb-6
          ">

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
                font-semibold
                text-gray-600
                hover:text-[#0F766E]
                transition
                w-fit
              "
            >

              <ArrowLeft size={18} />

              Back to Jobs

            </button>


            <div className="
              flex
              items-center
              gap-2
              text-xs
              text-gray-400
            ">

              <Sparkles
                size={14}
                className="text-[#0F766E]"
              />

              Recruit AI Job Editor

            </div>

          </div>


          {/* =================================================
              PAGE HEADER
          ================================================= */}

          <section className="
            bg-white
            rounded-3xl
            border
            border-gray-200
            shadow-sm
            overflow-hidden
            mb-6
          ">

            {/* TOP ACCENT */}

            <div className="
              h-1.5
              bg-[#0F766E]
            " />


            <div className="
              p-6
              md:p-8
            ">

              <div className="
                flex
                flex-col
                md:flex-row
                md:items-center
                md:justify-between
                gap-5
              ">

                {/* TITLE */}

                <div className="
                  flex
                  items-center
                  gap-4
                ">

                  <div className="
                    w-14
                    h-14
                    rounded-2xl
                    bg-[#E7F4F1]
                    flex
                    items-center
                    justify-center
                    flex-shrink-0
                  ">

                    <Briefcase
                      size={27}
                      className="text-[#0F766E]"
                    />

                  </div>


                  <div>

                    <h1 className="
                      text-2xl
                      md:text-3xl
                      font-bold
                      text-[#172033]
                    ">

                      Edit Job

                    </h1>


                    <p className="
                      text-gray-500
                      mt-1
                    ">

                      Update the details of
                      this job opening.

                    </p>

                  </div>

                </div>


                {/* JOB NAME */}

                <div className="
                  px-4
                  py-3
                  rounded-xl
                  bg-gray-50
                  border
                  border-gray-100
                  max-w-full
                  md:max-w-sm
                ">

                  <p className="
                    text-xs
                    text-gray-400
                    uppercase
                    tracking-wide
                  ">

                    Editing

                  </p>

                  <p className="
                    font-semibold
                    text-[#172033]
                    truncate
                    mt-1
                  ">

                    {formData.title ||
                      "Untitled Job"}

                  </p>

                </div>

              </div>

            </div>

          </section>


          {/* =================================================
              FORM
          ================================================= */}

          <section className="
            bg-white
            rounded-3xl
            border
            border-gray-200
            shadow-sm
            overflow-hidden
          ">

            <form
              onSubmit={handleSubmit}
            >

              {/* =================================================
                  FORM BODY
              ================================================= */}

              <div className="
                p-5
                md:p-8
              ">

                <div className="
                  grid
                  grid-cols-1
                  md:grid-cols-2
                  gap-6
                ">


                  {/* =================================================
                      JOB TITLE
                  ================================================= */}

                  <FormInput
                    icon={Briefcase}
                    label="Job Title"
                    name="title"
                    value={formData.title}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Developer"
                  />


                  {/* =================================================
                      DEPARTMENT
                  ================================================= */}

                  <FormInput
                    icon={Building2}
                    label="Department"
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    placeholder="e.g. Engineering"
                  />


                  {/* =================================================
                      LOCATION
                  ================================================= */}

                  <FormInput
                    icon={MapPin}
                    label="Location"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    placeholder="e.g. Bangalore"
                  />


                  {/* =================================================
                      EMPLOYMENT TYPE
                  ================================================= */}

                  <FormSelect
                    icon={User}
                    label="Employment Type"
                    name="employment_type"
                    value={
                      formData.employment_type
                    }
                    onChange={handleChange}
                  >

                    <option value="">
                      Select employment type
                    </option>

                    <option value="Full Time">
                      Full Time
                    </option>

                    <option value="Part Time">
                      Part Time
                    </option>

                    <option value="Internship">
                      Internship
                    </option>

                    <option value="Contract">
                      Contract
                    </option>

                    <option value="Remote">
                      Remote
                    </option>

                    <option value="Hybrid">
                      Hybrid
                    </option>

                  </FormSelect>


                  {/* =================================================
                      EXPERIENCE
                  ================================================= */}

                  <FormInput
                    icon={Calendar}
                    label="Experience Required"
                    name="experience_required"
                    value={
                      formData.experience_required
                    }
                    onChange={handleChange}
                    placeholder="e.g. 2+ Years"
                  />


                  {/* =================================================
                      SALARY
                  ================================================= */}

                  <FormInput
                    icon={IndianRupee}
                    label="Salary"
                    name="salary"
                    value={formData.salary}
                    onChange={handleChange}
                    placeholder="e.g. 8 LPA"
                  />


                  {/* =================================================
                      DESCRIPTION
                  ================================================= */}

                  <FormTextarea
                    icon={FileText}
                    label="Job Description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="
Describe the role, responsibilities, expectations and day-to-day work...
"
                    rows={6}
                    fullWidth
                  />


                  {/* =================================================
                      SKILLS
                  ================================================= */}

                  <FormInput
                    icon={Tag}
                    label="Skills"
                    name="skills"
                    value={formData.skills}
                    onChange={handleChange}
                    placeholder="React, JavaScript, HTML, CSS"
                    helper="Separate skills with commas."
                    fullWidth
                  />


                  {/* =================================================
                      REQUIREMENTS
                  ================================================= */}

                  <FormTextarea
                    icon={List}
                    label="Requirements"
                    name="requirements"
                    value={formData.requirements}
                    onChange={handleChange}
                    placeholder="
Good communication, problem solving, teamwork...
"
                    helper="Separate requirements with commas."
                    rows={5}
                    fullWidth
                  />

                </div>

              </div>


              {/* =================================================
                  FOOTER ACTIONS
              ================================================= */}

              <div className="
                px-5
                md:px-8
                py-5
                bg-[#FCFCFA]
                border-t
                border-gray-200
              ">

                <div className="
                  flex
                  flex-col-reverse
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-3
                ">

                  {/* CANCEL */}

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
                    "
                  >

                    Cancel

                  </button>


                  {/* RIGHT BUTTONS */}

                  <div className="
                    flex
                    flex-col
                    sm:flex-row
                    gap-3
                  ">

                    <button
                      type="button"
                      onClick={handleReset}
                      disabled={submitting}
                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2
                        px-6
                        py-3
                        rounded-xl
                        border
                        border-gray-200
                        bg-white
                        hover:bg-gray-50
                        text-gray-700
                        font-semibold
                        transition
                        disabled:opacity-50
                      "
                    >

                      <RotateCcw
                        size={17}
                      />

                      Reset

                    </button>


                    <button
                      type="submit"
                      disabled={submitting}
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

                      <Save size={18} />

                      {submitting
                        ? "Saving..."
                        : "Save Changes"}

                    </button>

                  </div>

                </div>

              </div>

            </form>

          </section>


          {/* =================================================
              BOTTOM NOTE
          ================================================= */}

          <div className="
            flex
            items-center
            justify-center
            gap-2
            text-xs
            text-gray-400
            py-5
          ">

            <Sparkles
              size={13}
              className="text-[#0F766E]"
            />

            Changes will be saved to your
            organization job posting.

          </div>

        </div>

      </div>

    </PortalLayout>
  );
}


// =========================================================
// PORTAL LAYOUT
// =========================================================

function PortalLayout({ children }) {
  return (
    <div className="
      flex
      h-screen
      w-full
      overflow-hidden
      bg-[#F7F6F2]
    ">

      {/* =================================================
          FIXED SIDEBAR AREA
      ================================================= */}

      <aside className="
        w-72
        min-w-72
        shrink-0
        h-screen
      ">

        <OrganizationSidebar />

      </aside>


      {/* =================================================
          RIGHT APPLICATION AREA
      ================================================= */}

      <div className="
        flex
        min-w-0
        flex-1
        flex-col
        overflow-hidden
      ">

        {/* NAVBAR */}

        <div className="
          shrink-0
          z-30
        ">

          <OrganizationNavbar />

        </div>


        {/* PAGE */}

        <main className="
          min-w-0
          flex-1
          overflow-y-auto
          overflow-x-hidden
        ">

          {children}

        </main>

      </div>

    </div>
  );
}


// =========================================================
// FORM INPUT
// =========================================================

function FormInput({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  helper,
  fullWidth = false,
}) {
  return (
    <div
      className={
        fullWidth
          ? "md:col-span-2 space-y-2"
          : "space-y-2"
      }
    >

      <label className="
        flex
        items-center
        gap-2
        text-sm
        font-semibold
        text-[#172033]
      ">

        <Icon
          size={16}
          className="text-[#0F766E]"
        />

        {label}

      </label>


      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full
          px-4
          py-3
          rounded-xl
          border
          border-gray-200
          bg-white
          text-[#172033]
          placeholder:text-gray-400
          outline-none
          focus:border-[#0F766E]
          focus:ring-4
          focus:ring-[#0F766E]/10
          transition-all
          duration-200
        "
      />


      {helper && (
        <p className="text-xs text-gray-400">
          {helper}
        </p>
      )}

    </div>
  );
}


// =========================================================
// FORM SELECT
// =========================================================

function FormSelect({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  children,
}) {
  return (
    <div className="space-y-2">

      <label className="
        flex
        items-center
        gap-2
        text-sm
        font-semibold
        text-[#172033]
      ">

        <Icon
          size={16}
          className="text-[#0F766E]"
        />

        {label}

      </label>


      <select
        name={name}
        value={value}
        onChange={onChange}
        className="
          w-full
          px-4
          py-3
          rounded-xl
          border
          border-gray-200
          bg-white
          text-[#172033]
          outline-none
          focus:border-[#0F766E]
          focus:ring-4
          focus:ring-[#0F766E]/10
          transition-all
          duration-200
        "
      >

        {children}

      </select>

    </div>
  );
}


// =========================================================
// FORM TEXTAREA
// =========================================================

function FormTextarea({
  icon: Icon,
  label,
  name,
  value,
  onChange,
  placeholder,
  helper,
  rows = 5,
  fullWidth = false,
}) {
  return (
    <div
      className={
        fullWidth
          ? "md:col-span-2 space-y-2"
          : "space-y-2"
      }
    >

      <label className="
        flex
        items-center
        gap-2
        text-sm
        font-semibold
        text-[#172033]
      ">

        <Icon
          size={16}
          className="text-[#0F766E]"
        />

        {label}

      </label>


      <textarea
        rows={rows}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="
          w-full
          px-4
          py-3
          rounded-xl
          border
          border-gray-200
          bg-white
          text-[#172033]
          placeholder:text-gray-400
          outline-none
          focus:border-[#0F766E]
          focus:ring-4
          focus:ring-[#0F766E]/10
          transition-all
          duration-200
          resize-y
        "
      />


      {helper && (
        <p className="text-xs text-gray-400">
          {helper}
        </p>
      )}

    </div>
  );
}


export default EditJob;