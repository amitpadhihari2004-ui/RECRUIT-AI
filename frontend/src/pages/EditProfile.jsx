import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import {
  User,
  Phone,
  Building2,
  BookOpen,
  School,
  CalendarDays,
  Image,
  Users,
  Calendar,
  MapPin,
  Wrench,
  Briefcase,
  Code2,
  Link as LinkIcon,
  Globe,
  UserCircle,
  Save,
  X,
  Loader2,
  ShieldCheck,
  CheckCircle,
  GraduationCap,
  Sparkles,
} from "lucide-react";

import toast from "react-hot-toast";

import {
  getProfile,
  updateProfile,
} from "../api/userApi";

import Sidebar from "../components/Sidebar";


function EditProfile() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [formData, setFormData] = useState({
    full_name: "",
    phone: "",
    college_name: "",
    course: "",
    branch: "",
    graduation_year: "",
    profile_photo: "",
    gender: "",
    date_of_birth: "",
    address: "",
    skills: "",
    experience: "",
    linkedin: "",
    github: "",
    portfolio: "",
    about: "",
  });


  // =====================================================
  // FETCH PROFILE
  // =====================================================

  useEffect(() => {
    fetchProfile();
  }, []);


  const fetchProfile = async () => {
    try {
      const userId = localStorage.getItem("user_id");

      if (!userId) {
        toast.error("User not found. Please login again.");
        navigate("/login");
        return;
      }

      const response = await getProfile(userId);

      setFormData({
        full_name: response.full_name || "",
        phone: response.phone || "",
        college_name: response.college_name || "",
        course: response.course || "",
        branch: response.branch || "",
        graduation_year: response.graduation_year || "",
        profile_photo: response.profile_photo || "",
        gender: response.gender || "",
        date_of_birth: response.date_of_birth || "",
        address: response.address || "",
        skills: response.skills
          ? response.skills.join(", ")
          : "",
        experience: response.experience || "",
        linkedin: response.linkedin || "",
        github: response.github || "",
        portfolio: response.portfolio || "",
        about: response.about || "",
      });

    } catch (error) {
      console.error("Profile Load Error:", error);

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load profile"
      );

      navigate("/profile");

    } finally {
      setLoading(false);
    }
  };


  // =====================================================
  // INPUT CHANGE
  // =====================================================

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };


  // =====================================================
  // SUBMIT
  // =====================================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ---------------------------------------------------
    // REQUIRED FIELDS
    // ---------------------------------------------------

    const requiredFields = [
      "full_name",
      "phone",
      "college_name",
      "course",
      "branch",
      "graduation_year",
    ];

    for (const field of requiredFields) {
      const value = formData[field];

      if (field === "graduation_year") {
        const year = Number(value);

        if (
          !value ||
          Number.isNaN(year) ||
          year <= 0
        ) {
          toast.error(
            "Graduation Year is required and must be a valid number."
          );
          return;
        }
      } else {
        if (
          !value ||
          String(value).trim() === ""
        ) {
          const label = field
            .replace(/_/g, " ")
            .replace(/\b\w/g, (char) =>
              char.toUpperCase()
            );

          toast.error(
            `${label} is required.`
          );

          return;
        }
      }
    }


    setSaving(true);


    try {
      const userId =
        localStorage.getItem("user_id");

      if (!userId) {
        toast.error(
          "User not found. Please login again."
        );

        navigate("/login");

        return;
      }


      // -------------------------------------------------
      // PREPARE PAYLOAD
      // -------------------------------------------------

      const payload = {
        full_name: formData.full_name.trim(),

        phone: formData.phone.trim(),

        college_name:
          formData.college_name.trim(),

        course:
          formData.course.trim(),

        branch:
          formData.branch.trim(),

        graduation_year:
          Number(formData.graduation_year),

        profile_photo:
          formData.profile_photo.trim(),

        gender:
          formData.gender.trim(),

        date_of_birth:
          formData.date_of_birth,

        address:
          formData.address.trim(),

        skills: formData.skills
          ? formData.skills
              .split(",")
              .map((skill) =>
                skill.trim()
              )
              .filter(Boolean)
          : [],

        experience:
          formData.experience.trim(),

        linkedin:
          formData.linkedin.trim(),

        github:
          formData.github.trim(),

        portfolio:
          formData.portfolio.trim(),

        about:
          formData.about.trim(),
      };


      console.log(
        "PROFILE UPDATE PAYLOAD:",
        payload
      );


      await updateProfile(
        userId,
        payload
      );


      toast.success(
        "Profile updated successfully!"
      );


      setTimeout(() => {
        navigate("/profile");
      }, 900);

    } catch (error) {
      console.error(
        "Profile Update Error:",
        error
      );

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to update profile."
      );

    } finally {
      setSaving(false);
    }
  };


  // =====================================================
  // INPUT FIELD
  // =====================================================

  const InputField = ({
    label,
    name,
    type = "text",
    icon: Icon,
    required = false,
    placeholder,
  }) => {
    return (
      <div>
        <label className="block text-xs font-semibold text-[#344054] mb-2">
          {label}

          {required && (
            <span className="text-[#E87961] ml-1">
              *
            </span>
          )}
        </label>

        <div className="relative">
          {Icon && (
            <div className="absolute left-0 top-0 h-full w-11 flex items-center justify-center pointer-events-none">
              <Icon
                size={17}
                className="text-[#98A2B3]"
              />
            </div>
          )}

          <input
            type={type}
            name={name}
            value={formData[name] || ""}
            onChange={handleChange}
            required={required}
            placeholder={
              placeholder || label
            }
            className={`
              w-full
              ${
                Icon
                  ? "pl-11"
                  : "pl-3"
              }
              pr-3
              py-3
              bg-[#FCFCFA]
              border
              border-[#D0D5DD]
              rounded-xl
              text-sm
              text-[#344054]
              placeholder:text-[#98A2B3]
              outline-none
              transition-all
              duration-200
              focus:border-[#0F766E]
              focus:ring-2
              focus:ring-[#0F766E]/10
            `}
          />
        </div>
      </div>
    );
  };


  // =====================================================
  // TEXT AREA
  // =====================================================

  const TextAreaField = ({
    label,
    name,
    icon: Icon,
    rows = 4,
    placeholder,
  }) => {
    return (
      <div>
        <label className="block text-xs font-semibold text-[#344054] mb-2">
          {label}
        </label>

        <div className="relative">
          {Icon && (
            <div className="absolute left-0 top-0 pt-3 w-11 flex justify-center pointer-events-none">
              <Icon
                size={17}
                className="text-[#98A2B3]"
              />
            </div>
          )}

          <textarea
            name={name}
            rows={rows}
            value={formData[name] || ""}
            onChange={handleChange}
            placeholder={
              placeholder || label
            }
            className={`
              w-full
              ${
                Icon
                  ? "pl-11"
                  : "pl-3"
              }
              pr-3
              py-3
              bg-[#FCFCFA]
              border
              border-[#D0D5DD]
              rounded-xl
              text-sm
              text-[#344054]
              placeholder:text-[#98A2B3]
              outline-none
              resize-none
              transition-all
              duration-200
              focus:border-[#0F766E]
              focus:ring-2
              focus:ring-[#0F766E]/10
            `}
          />
        </div>
      </div>
    );
  };


  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F7F5EF]">
        <Sidebar />

        <main className="flex-1 flex items-center justify-center p-6">
          <div className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm p-10 text-center">

            <div className="w-14 h-14 rounded-2xl bg-[#EAF5F1] flex items-center justify-center mx-auto">
              <Loader2
                size={28}
                className="text-[#0F766E] animate-spin"
              />
            </div>

            <h2 className="text-lg font-semibold text-[#101828] mt-5">
              Loading your profile
            </h2>

            <p className="text-sm text-[#98A2B3] mt-2">
              Please wait while we fetch your information.
            </p>

          </div>
        </main>
      </div>
    );
  }


  // =====================================================
  // MAIN PAGE
  // =====================================================

  return (
    <div className="flex min-h-screen bg-[#F7F5EF]">

      <Sidebar />


      <main className="flex-1 overflow-y-auto">

        <div className="max-w-6xl mx-auto p-5 md:p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
              y: -10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.5,
            }}
            className="mb-8"
          >

            <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-5">

              <div>

                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">

                  <span className="w-7 h-[2px] bg-[#0F766E]" />

                  My Profile

                </div>


                <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.04em] text-[#101828] mt-3">

                  Edit your profile

                </h1>


                <p className="text-[#667085] mt-2 max-w-2xl">

                  Keep your personal, academic and professional information up to date.

                </p>

              </div>


              <button
                type="button"
                onClick={() =>
                  navigate("/profile")
                }
                className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-white border border-[#101828]/10 text-[#344054] text-sm font-semibold hover:border-[#0F766E]/30 hover:text-[#0F766E] transition-all duration-200"
              >
                <X size={17} />

                Cancel

              </button>

            </div>

          </motion.div>


          {/* =================================================
              PROFILE FORM
          ================================================= */}

          <form onSubmit={handleSubmit}>

            <div className="grid grid-cols-1 xl:grid-cols-[1fr_300px] gap-6">


              {/* =================================================
                  MAIN FORM
              ================================================= */}

              <div className="space-y-6">


                {/* =================================================
                    PERSONAL INFORMATION
                ================================================= */}

                <motion.section
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.1,
                  }}
                  className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm overflow-hidden"
                >

                  <div className="px-6 md:px-8 py-5 border-b border-[#101828]/5">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-[#EAF5F1] flex items-center justify-center">

                        <User
                          size={19}
                          className="text-[#0F766E]"
                        />

                      </div>

                      <div>

                        <h2 className="font-semibold text-[#101828]">
                          Personal information
                        </h2>

                        <p className="text-xs text-[#98A2B3] mt-1">
                          Basic information about you.
                        </p>

                      </div>

                    </div>

                  </div>


                  <div className="p-6 md:p-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <InputField
                        label="Full Name"
                        name="full_name"
                        icon={User}
                        required
                        placeholder="Your full name"
                      />

                      <InputField
                        label="Phone"
                        name="phone"
                        icon={Phone}
                        required
                        placeholder="Your phone number"
                      />

                      <InputField
                        label="Profile Photo URL"
                        name="profile_photo"
                        icon={Image}
                        placeholder="https://example.com/photo.jpg"
                      />

                      <InputField
                        label="Gender"
                        name="gender"
                        icon={Users}
                        placeholder="Male / Female / Other"
                      />

                      <InputField
                        label="Date of Birth"
                        name="date_of_birth"
                        type="date"
                        icon={Calendar}
                      />

                      <div className="md:col-span-2">

                        <InputField
                          label="Address"
                          name="address"
                          icon={MapPin}
                          placeholder="Your full address"
                        />

                      </div>

                    </div>

                  </div>

                </motion.section>


                {/* =================================================
                    ACADEMIC INFORMATION
                ================================================= */}

                <motion.section
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.15,
                  }}
                  className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm overflow-hidden"
                >

                  <div className="px-6 md:px-8 py-5 border-b border-[#101828]/5">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-[#F7F5EF] flex items-center justify-center">

                        <GraduationCap
                          size={19}
                          className="text-[#667085]"
                        />

                      </div>

                      <div>

                        <h2 className="font-semibold text-[#101828]">
                          Academic information
                        </h2>

                        <p className="text-xs text-[#98A2B3] mt-1">
                          Your education and graduation details.
                        </p>

                      </div>

                    </div>

                  </div>


                  <div className="p-6 md:p-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <InputField
                        label="College Name"
                        name="college_name"
                        icon={Building2}
                        required
                        placeholder="Your college name"
                      />

                      <InputField
                        label="Course"
                        name="course"
                        icon={BookOpen}
                        required
                        placeholder="B.Tech / BCA / MCA"
                      />

                      <InputField
                        label="Branch"
                        name="branch"
                        icon={School}
                        required
                        placeholder="Computer Science"
                      />

                      <InputField
                        label="Graduation Year"
                        name="graduation_year"
                        type="number"
                        icon={CalendarDays}
                        required
                        placeholder="2026"
                      />

                    </div>

                  </div>

                </motion.section>


                {/* =================================================
                    PROFESSIONAL INFORMATION
                ================================================= */}

                <motion.section
                  initial={{
                    opacity: 0,
                    y: 15,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2,
                  }}
                  className="bg-white rounded-3xl border border-[#101828]/10 shadow-sm overflow-hidden"
                >

                  <div className="px-6 md:px-8 py-5 border-b border-[#101828]/5">

                    <div className="flex items-center gap-3">

                      <div className="w-10 h-10 rounded-xl bg-[#EAF5F1] flex items-center justify-center">

                        <Briefcase
                          size={19}
                          className="text-[#0F766E]"
                        />

                      </div>

                      <div>

                        <h2 className="font-semibold text-[#101828]">
                          Professional information
                        </h2>

                        <p className="text-xs text-[#98A2B3] mt-1">
                          Help Recruit_Ai understand your career profile.
                        </p>

                      </div>

                    </div>

                  </div>


                  <div className="p-6 md:p-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">

                      <InputField
                        label="Skills"
                        name="skills"
                        icon={Wrench}
                        placeholder="React, Java, Python"
                      />

                      <InputField
                        label="Experience"
                        name="experience"
                        icon={Briefcase}
                        placeholder="Fresher / 2 years"
                      />

                      <InputField
                        label="LinkedIn"
                        name="linkedin"
                        icon={LinkIcon}
                        placeholder="https://linkedin.com/in/username"
                      />

                      <InputField
                        label="GitHub"
                        name="github"
                        icon={Code2}
                        placeholder="https://github.com/username"
                      />

                      <InputField
                        label="Portfolio"
                        name="portfolio"
                        icon={Globe}
                        placeholder="https://yourportfolio.com"
                      />

                      <div className="md:col-span-2">

                        <TextAreaField
                          label="About"
                          name="about"
                          icon={UserCircle}
                          rows={5}
                          placeholder="Tell us about yourself, your strengths and career goals."
                        />

                      </div>

                    </div>

                  </div>

                </motion.section>


                {/* =================================================
                    SAVE BUTTON
                ================================================= */}

                <motion.div
                  initial={{
                    opacity: 0,
                    y: 10,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.25,
                  }}
                  className="bg-white rounded-2xl border border-[#101828]/10 p-5"
                >

                  <div className="flex flex-col sm:flex-row items-center justify-between gap-4">

                    <div className="flex items-start gap-3">

                      <div className="w-9 h-9 rounded-lg bg-[#EAF5F1] flex items-center justify-center shrink-0">

                        <CheckCircle
                          size={17}
                          className="text-[#0F766E]"
                        />

                      </div>

                      <div>

                        <p className="text-sm font-semibold text-[#344054]">
                          Keep your profile updated
                        </p>

                        <p className="text-xs text-[#98A2B3] mt-1">
                          Updated information improves your AI recommendations.
                        </p>

                      </div>

                    </div>


                    <button
                      type="submit"
                      disabled={saving}
                      className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-7 py-3 rounded-xl bg-[#101828] hover:bg-[#0F766E] disabled:bg-[#D0D5DD] disabled:text-[#98A2B3] disabled:cursor-not-allowed text-white text-sm font-semibold transition-all duration-300"
                    >

                      {saving ? (
                        <>
                          <Loader2
                            size={17}
                            className="animate-spin"
                          />

                          Saving...
                        </>
                      ) : (
                        <>
                          <Save size={17} />

                          Save changes
                        </>
                      )}

                    </button>

                  </div>

                </motion.div>

              </div>


              {/* =================================================
                  SIDE INFORMATION
              ================================================= */}

              <div className="space-y-5">


                {/* PROFILE CARD */}

                <motion.div
                  initial={{
                    opacity: 0,
                    x: 15,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.2,
                  }}
                  className="bg-[#101828] rounded-2xl p-6 text-white overflow-hidden relative"
                >

                  <div className="absolute -right-16 -top-16 w-40 h-40 rounded-full bg-[#0F766E]/30 blur-2xl" />

                  <div className="relative">

                    <div className="w-11 h-11 rounded-xl bg-[#0F766E]/20 flex items-center justify-center">

                      <Sparkles
                        size={19}
                        className="text-[#8FE2D1]"
                      />

                    </div>


                    <h3 className="text-lg font-semibold mt-5">
                      Your Recruit_Ai profile
                    </h3>


                    <p className="text-sm text-white/50 leading-6 mt-2">
                      Your profile information helps Recruit_Ai personalize job recommendations and career insights.
                    </p>


                    <div className="mt-5 space-y-3">

                      {[
                        "Personal information",
                        "Academic background",
                        "Technical skills",
                        "Career information",
                      ].map((item) => (

                        <div
                          key={item}
                          className="flex items-center gap-2.5 text-xs text-white/70"
                        >

                          <CheckCircle
                            size={14}
                            className="text-[#8FE2D1]"
                          />

                          {item}

                        </div>

                      ))}

                    </div>

                  </div>

                </motion.div>


                {/* PROFILE TIPS */}

                <motion.div
                  initial={{
                    opacity: 0,
                    x: 15,
                  }}
                  animate={{
                    opacity: 1,
                    x: 0,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: 0.3,
                  }}
                  className="bg-white rounded-2xl border border-[#101828]/10 p-6"
                >

                  <h3 className="font-semibold text-[#101828]">
                    Profile tips
                  </h3>


                  <div className="mt-5 space-y-4">

                    <div className="flex gap-3">

                      <div className="w-8 h-8 rounded-lg bg-[#F7F5EF] flex items-center justify-center shrink-0">

                        <User
                          size={15}
                          className="text-[#667085]"
                        />

                      </div>

                      <div>

                        <p className="text-xs font-semibold text-[#344054]">
                          Complete your details
                        </p>

                        <p className="text-xs text-[#98A2B3] mt-1 leading-5">
                          Keep your personal information accurate.
                        </p>

                      </div>

                    </div>


                    <div className="flex gap-3">

                      <div className="w-8 h-8 rounded-lg bg-[#EAF5F1] flex items-center justify-center shrink-0">

                        <Wrench
                          size={15}
                          className="text-[#0F766E]"
                        />

                      </div>

                      <div>

                        <p className="text-xs font-semibold text-[#344054]">
                          Add your skills
                        </p>

                        <p className="text-xs text-[#98A2B3] mt-1 leading-5">
                          Mention technologies you are comfortable with.
                        </p>

                      </div>

                    </div>


                    <div className="flex gap-3">

                      <div className="w-8 h-8 rounded-lg bg-[#F7F5EF] flex items-center justify-center shrink-0">

                        <Briefcase
                          size={15}
                          className="text-[#667085]"
                        />

                      </div>

                      <div>

                        <p className="text-xs font-semibold text-[#344054]">
                          Add professional links
                        </p>

                        <p className="text-xs text-[#98A2B3] mt-1 leading-5">
                          Connect your GitHub, LinkedIn and portfolio.
                        </p>

                      </div>

                    </div>

                  </div>

                </motion.div>


                {/* SECURITY */}

                <div className="flex items-start gap-3 bg-[#EAF5F1] border border-[#BFE5DB] rounded-2xl p-4">

                  <ShieldCheck
                    size={18}
                    className="text-[#0F766E] shrink-0 mt-0.5"
                  />

                  <div>

                    <p className="text-xs font-semibold text-[#344054]">
                      Secure profile
                    </p>

                    <p className="text-[11px] text-[#667085] mt-1 leading-5">
                      Your profile is protected through your authenticated Recruit_Ai account.
                    </p>

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                FOOTER
            ================================================= */}

            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-7 text-xs text-[#98A2B3]">

              <span>
                Recruit_Ai Student Profile
              </span>

              <span className="flex items-center gap-2">

                <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />

                Personalized career intelligence

              </span>

            </div>

          </form>

        </div>

      </main>

    </div>
  );
}

export default EditProfile;