import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

import { getProfile } from "../api/userApi";

import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  Building2,
  BookOpen,
  School,
  CalendarDays,
  Wrench,
  Briefcase,
  Code2,
  Globe,
  UserCircle,
  Pencil,
  UserCircle2,
  Award,
  ArrowLeft,
  ExternalLink,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

import toast from "react-hot-toast";

import Sidebar from "../components/Sidebar";


function MyProfile() {

  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [profile, setProfile] = useState(null);

  const [loading, setLoading] =
    useState(true);

  const [imageError, setImageError] =
    useState(false);


  // =====================================================
  // FETCH PROFILE
  // =====================================================

  useEffect(() => {
    fetchProfile();
  }, []);


  const fetchProfile = async () => {

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


      const response =
        await getProfile(userId);


      console.log(
        "PROFILE RESPONSE:",
        response
      );


      setProfile(response);

    } catch (error) {

      console.error(
        "Profile loading error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Failed to load profile"
      );

    } finally {

      setLoading(false);

    }

  };


  // =====================================================
  // LOADING SCREEN
  // =====================================================

  if (loading) {

    return (

      <div className="flex min-h-screen bg-[#F7F5EF]">

        <Sidebar />

        <main className="flex-1 p-5 md:p-8">

          <div className="max-w-7xl mx-auto animate-pulse">

            {/* Header skeleton */}

            <div className="h-4 w-28 bg-white rounded" />

            <div className="h-10 w-72 bg-white rounded-lg mt-4" />

            <div className="h-5 w-96 bg-white rounded mt-3" />


            {/* Profile skeleton */}

            <div className="bg-white rounded-2xl h-48 mt-8" />


            {/* Cards */}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">

              <div className="bg-white rounded-2xl h-80" />

              <div className="bg-white rounded-2xl h-80" />

            </div>


            <div className="bg-white rounded-2xl h-96 mt-5" />

          </div>

        </main>

      </div>

    );

  }


  // =====================================================
  // NO PROFILE
  // =====================================================

  if (!profile) {

    return (

      <div className="flex min-h-screen bg-[#F7F5EF]">

        <Sidebar />

        <main className="flex-1 flex items-center justify-center p-6">

          <div className="bg-white border border-[#101828]/10 rounded-2xl p-10 text-center max-w-md w-full shadow-sm">

            <div className="w-14 h-14 mx-auto rounded-2xl bg-[#F7F5EF] flex items-center justify-center">

              <UserCircle2
                size={30}
                className="text-[#98A2B3]"
              />

            </div>


            <h2 className="text-xl font-semibold text-[#101828] mt-5">

              No profile data available

            </h2>


            <p className="text-sm text-[#667085] mt-2">

              We couldn't find your profile information.

            </p>


            <button
              onClick={() =>
                navigate("/profile/edit")
              }
              className="mt-6 inline-flex items-center gap-2 bg-[#101828] hover:bg-[#0F766E] text-white px-5 py-3 rounded-xl font-semibold text-sm transition"
            >

              Complete Profile

              <Pencil size={16} />

            </button>

          </div>

        </main>

      </div>

    );

  }


  // =====================================================
  // INFO CARD
  // =====================================================

  const InfoCard = ({
    title,
    icon: Icon,
    children,
    className = "",
  }) => (

    <motion.div
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
      }}
      className={`
        bg-white
        rounded-2xl
        border
        border-[#101828]/10
        p-6
        hover:shadow-lg
        hover:shadow-[#101828]/5
        transition-all
        duration-300
        ${className}
      `}
    >

      <div className="flex items-center gap-3 mb-6">

        <div className="w-10 h-10 rounded-xl bg-[#EAF5F1] text-[#0F766E] flex items-center justify-center">

          <Icon size={19} />

        </div>


        <div>

          <h2 className="text-base font-semibold text-[#101828]">

            {title}

          </h2>


          <div className="text-[10px] uppercase tracking-[0.14em] text-[#98A2B3] mt-0.5">

            Profile details

          </div>

        </div>

      </div>


      <div className="space-y-1">

        {children}

      </div>

    </motion.div>

  );


  // =====================================================
  // INFO ITEM
  // =====================================================

  const InfoItem = ({
    label,
    value,
    icon: Icon,
    isLink = false,
  }) => (

    <div className="flex items-start gap-3 py-3 border-b border-[#101828]/5 last:border-0">

      <div className="w-8 h-8 rounded-lg bg-[#F7F5EF] flex items-center justify-center shrink-0">

        {Icon && (
          <Icon
            size={15}
            className="text-[#667085]"
          />
        )}

      </div>


      <div className="min-w-0 flex-1">

        <p className="text-[11px] uppercase tracking-wide text-[#98A2B3] font-medium">

          {label}

        </p>


        {isLink && value ? (

          <a
            href={
              value.startsWith("http")
                ? value
                : `https://${value}`
            }
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#0F766E] hover:underline mt-1 break-all"
          >

            {value}

            <ExternalLink size={13} />

          </a>

        ) : (

          <p className="text-sm font-medium text-[#344054] mt-1 break-words">

            {value || "Not Available"}

          </p>

        )}

      </div>

    </div>

  );


  // =====================================================
  // SKILL COUNT
  // =====================================================

  const skillCount =
    Array.isArray(profile.skills)
      ? profile.skills.length
      : 0;


  // =====================================================
  // USER INITIAL
  // =====================================================

  const initial =
    profile.full_name
      ?.trim()
      ?.charAt(0)
      ?.toUpperCase() || "S";


  // =====================================================
  // MAIN UI
  // =====================================================

  return (

    <div className="flex min-h-screen bg-[#F7F5EF]">


      {/* =================================================
          SIDEBAR
      ================================================= */}

      <Sidebar />


      {/* =================================================
          MAIN
      ================================================= */}

      <main className="flex-1 overflow-y-auto">

        <div className="max-w-7xl mx-auto p-5 md:p-8">


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
            className="mb-7"
          >

            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-5">


              {/* LEFT */}

              <div>

                <button
                  onClick={() =>
                    navigate("/dashboard")
                  }
                  className="flex items-center gap-2 text-xs font-semibold text-[#667085] hover:text-[#0F766E] transition"
                >

                  <ArrowLeft size={14} />

                  Back to Dashboard

                </button>


                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E] mt-5">

                  <span className="w-7 h-[2px] bg-[#0F766E]" />

                  Student Profile

                </div>


                <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.04em] text-[#101828] mt-3">

                  My Profile

                </h1>


                <p className="text-[#667085] mt-2">

                  Manage your personal, academic and professional information.

                </p>

              </div>


              {/* EDIT BUTTON */}

              <button
                onClick={() =>
                  navigate("/profile/edit")
                }
                className="inline-flex items-center justify-center gap-2 bg-[#101828] hover:bg-[#0F766E] text-white px-5 py-3 rounded-xl font-semibold text-sm transition shadow-sm"
              >

                <Pencil size={16} />

                Edit Profile

              </button>

            </div>

          </motion.div>


          {/* =================================================
              PROFILE HERO
          ================================================= */}

          <motion.section
            initial={{
              opacity: 0,
              y: 20,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.6,
              delay: 0.1,
            }}
            className="relative overflow-hidden bg-[#101828] rounded-2xl p-6 md:p-8 mb-6"
          >

            {/* Decorative circle */}

            <div className="absolute -right-28 -top-32 w-80 h-80 rounded-full bg-[#0F766E]/30 blur-3xl" />


            <div className="absolute -left-20 -bottom-32 w-64 h-64 rounded-full bg-[#E87961]/10 blur-3xl" />


            <div className="relative flex flex-col md:flex-row md:items-center gap-6">


              {/* =================================================
                  PROFILE PHOTO
              ================================================= */}

              <div className="shrink-0">

                {profile.profile_photo && !imageError ? (

                  <img
                    src={profile.profile_photo}
                    alt={
                      profile.full_name ||
                      "Profile"
                    }
                    className="w-28 h-28 rounded-2xl object-cover border border-white/20 shadow-xl"
                    onError={() =>
                      setImageError(true)
                    }
                  />

                ) : (

                  <div className="w-28 h-28 rounded-2xl bg-[#DDF5EF] text-[#0F766E] flex items-center justify-center border border-white/10 shadow-xl">

                    <span className="text-4xl font-semibold">

                      {initial}

                    </span>

                  </div>

                )}

              </div>


              {/* =================================================
                  USER INFORMATION
              ================================================= */}

              <div className="flex-1">

                <div className="flex flex-wrap items-center gap-3">

                  <h2 className="text-2xl md:text-3xl font-semibold text-white tracking-tight">

                    {profile.full_name ||
                      "Not Available"}

                  </h2>


                  <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0F766E]/20 border border-[#0F766E]/30 text-[#8FE2D1] text-[10px] font-semibold uppercase tracking-wide">

                    <span className="w-1.5 h-1.5 rounded-full bg-[#8FE2D1]" />

                    Active Profile

                  </span>

                </div>


                <div className="flex flex-wrap gap-x-5 gap-y-2 mt-3 text-sm text-white/55">

                  <span className="flex items-center gap-2">

                    <Mail size={14} />

                    {profile.email ||
                      "Not Available"}

                  </span>


                  {profile.phone && (

                    <span className="flex items-center gap-2">

                      <Phone size={14} />

                      {profile.phone}

                    </span>

                  )}

                </div>


                {profile.college_name && (

                  <div className="flex items-center gap-2 mt-3 text-sm text-white/55">

                    <GraduationCap size={15} />

                    {profile.college_name}

                  </div>

                )}

              </div>


              {/* =================================================
                  PROFILE SUMMARY
              ================================================= */}

              <div className="hidden lg:flex flex-col items-end shrink-0">

                <div className="flex items-center gap-2 text-[#8FE2D1] text-xs font-semibold">

                  <Sparkles size={14} />

                  Profile Intelligence

                </div>


                <div className="text-white text-2xl font-semibold mt-2">

                  {skillCount}

                  <span className="text-sm font-normal text-white/40 ml-1">

                    skills

                  </span>

                </div>

              </div>

            </div>

          </motion.section>


          {/* =================================================
              INFORMATION GRID
          ================================================= */}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">


            {/* =================================================
                PERSONAL INFORMATION
            ================================================= */}

            <InfoCard
              title="Personal Information"
              icon={User}
            >

              <InfoItem
                label="Full Name"
                value={profile.full_name}
                icon={User}
              />

              <InfoItem
                label="Email"
                value={profile.email}
                icon={Mail}
              />

              <InfoItem
                label="Phone"
                value={profile.phone}
                icon={Phone}
              />

              <InfoItem
                label="Gender"
                value={profile.gender}
                icon={UserCircle}
              />

              <InfoItem
                label="Date of Birth"
                value={profile.date_of_birth}
                icon={Calendar}
              />

              <InfoItem
                label="Address"
                value={profile.address}
                icon={MapPin}
              />

            </InfoCard>


            {/* =================================================
                ACADEMIC INFORMATION
            ================================================= */}

            <InfoCard
              title="Academic Information"
              icon={GraduationCap}
            >

              <InfoItem
                label="College Name"
                value={profile.college_name}
                icon={Building2}
              />

              <InfoItem
                label="Course"
                value={profile.course}
                icon={BookOpen}
              />

              <InfoItem
                label="Branch"
                value={profile.branch}
                icon={School}
              />

              <InfoItem
                label="Graduation Year"
                value={profile.graduation_year}
                icon={CalendarDays}
              />

            </InfoCard>


            {/* =================================================
                PROFESSIONAL INFORMATION
            ================================================= */}

            <InfoCard
              title="Professional Information"
              icon={Briefcase}
              className="lg:col-span-2"
            >


              {/* =================================================
                  SKILLS
              ================================================= */}

              <div className="pb-5 mb-4 border-b border-[#101828]/5">

                <div className="flex items-center gap-3 mb-3">

                  <div className="w-8 h-8 rounded-lg bg-[#F7F5EF] flex items-center justify-center">

                    <Wrench
                      size={15}
                      className="text-[#667085]"
                    />

                  </div>


                  <div>

                    <p className="text-[11px] uppercase tracking-wide text-[#98A2B3] font-medium">

                      Skills

                    </p>


                    <p className="text-sm font-medium text-[#344054]">

                      {skillCount} skills added

                    </p>

                  </div>

                </div>


                <div className="flex flex-wrap gap-2 pl-11">

                  {profile.skills &&
                  profile.skills.length > 0 ? (

                    profile.skills.map(
                      (skill, index) => (

                        <motion.span
                          key={index}
                          initial={{
                            opacity: 0,
                            scale: 0.9,
                          }}
                          animate={{
                            opacity: 1,
                            scale: 1,
                          }}
                          transition={{
                            delay:
                              index * 0.04,
                          }}
                          className="px-3 py-1.5 bg-[#EAF5F1] text-[#0F766E] text-xs font-semibold rounded-lg border border-[#BFE5DB] hover:bg-[#DDF5EF] transition"
                        >

                          {skill}

                        </motion.span>

                      )

                    )

                  ) : (

                    <span className="text-sm text-[#98A2B3]">

                      No skills added yet.

                    </span>

                  )}

                </div>

              </div>


              {/* EXPERIENCE */}

              <InfoItem
                label="Experience"
                value={profile.experience}
                icon={Award}
              />


              {/* GITHUB */}

              <InfoItem
                label="GitHub"
                value={profile.github}
                icon={Code2}
                isLink={true}
              />


              {/* PORTFOLIO */}

              <InfoItem
                label="Portfolio"
                value={profile.portfolio}
                icon={Globe}
                isLink={true}
              />


              {/* =================================================
                  ABOUT
              ================================================= */}

              <div className="pt-4">

                <div className="flex items-center gap-3 mb-3">

                  <div className="w-8 h-8 rounded-lg bg-[#F7F5EF] flex items-center justify-center">

                    <UserCircle
                      size={15}
                      className="text-[#667085]"
                    />

                  </div>


                  <p className="text-[11px] uppercase tracking-wide text-[#98A2B3] font-medium">

                    About

                  </p>

                </div>


                <div className="ml-11 bg-[#F7F5EF] rounded-xl p-4">

                  <p className="text-sm text-[#475467] leading-7">

                    {profile.about ||
                      "No information added yet."}

                  </p>

                </div>

              </div>

            </InfoCard>

          </div>


          {/* =================================================
              SECURITY / PROFILE STATUS
          ================================================= */}

          <motion.div
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            transition={{
              delay: 0.5,
            }}
            className="mt-5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 px-5 py-4 rounded-2xl bg-white border border-[#101828]/10"
          >

            <div className="flex items-center gap-3">

              <div className="w-9 h-9 rounded-lg bg-[#EAF5F1] flex items-center justify-center">

                <ShieldCheck
                  size={17}
                  className="text-[#0F766E]"
                />

              </div>


              <div>

                <p className="text-sm font-semibold text-[#344054]">

                  Profile information is secure

                </p>


                <p className="text-xs text-[#98A2B3] mt-0.5">

                  Your information is used to improve your recruitment experience.

                </p>

              </div>

            </div>


            <button
              onClick={() =>
                navigate("/profile/edit")
              }
              className="inline-flex items-center gap-2 text-sm font-semibold text-[#0F766E] hover:gap-3 transition-all"
            >

              Update Profile

              <ArrowLeft
                size={15}
                className="rotate-180"
              />

            </button>

          </motion.div>


          {/* =================================================
              FOOTER
          ================================================= */}

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 py-7 text-xs text-[#98A2B3]">

            <span>

              Recruit_Ai Student Portal

            </span>


            <span className="flex items-center gap-2">

              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />

              Profile synchronized

            </span>

          </div>

        </div>

      </main>

    </div>

  );

}


export default MyProfile;