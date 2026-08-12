
import {
  LayoutDashboard,
  User,
  Upload,
  Brain,
  Briefcase,
  Sparkles,
  Mic,
  ClipboardCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronRight,
  GraduationCap,
  ShieldCheck,
} from "lucide-react";

import {
  Link,
  useLocation,
  useNavigate,
} from "react-router-dom";

import { motion } from "framer-motion";

function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();

  // =====================================================
  // MENU ITEMS
  // =====================================================

  const menuItems = [
    {
      title: "Dashboard",
      icon: <LayoutDashboard size={18} />,
      path: "/dashboard",
    },

    {
      title: "My Profile",
      icon: <User size={18} />,
      path: "/profile",
    },

    {
      title: "Resume Upload",
      icon: <Upload size={18} />,
      path: "/resume-upload",
    },

    {
      title: "Resume Intelligence",
      icon: <Brain size={18} />,
      path: "/resume-analysis",
    },

    {
      title: "AI Job Recommendation",
      icon: <Sparkles size={18} />,
      path: "/recommended-jobs",
    },

    {
      title: "Available Jobs",
      icon: <Briefcase size={18} />,
      path: "/jobs",
    },

    {
      title: "My Applications",
      icon: <ClipboardCheck size={18} />,
      path: "/my-applications",
    },

    {
      title: "AI Interview",
      icon: <Mic size={18} />,
      path: "/interviews",
    },

    {
      title: "Reports & Analytics",
      icon: <BarChart3 size={18} />,
      path: "/reports-analytics",
    },

  
  ];


  // =====================================================
  // USER DATA
  // =====================================================

  const fullName =
    localStorage.getItem("full_name") ||
    "Student";

  const email =
    localStorage.getItem("email") ||
    "";


  // =====================================================
  // AVATAR INITIAL
  // =====================================================

  const initial =
    fullName
      .trim()
      .charAt(0)
      .toUpperCase() || "S";


  // =====================================================
  // LOGOUT
  // =====================================================

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user_id");
    localStorage.removeItem("studentId");
    localStorage.removeItem("student_id");
    localStorage.removeItem("full_name");
    localStorage.removeItem("email");

    window.location.href = "/login";
  };


  // =====================================================
  // ACTIVE ROUTE
  // =====================================================

  const isActiveRoute = (path) => {
    return (
      location.pathname === path ||
      location.pathname.startsWith(`${path}/`)
    );
  };


  // =====================================================
  // UI
  // =====================================================

  return (
    <aside
      className="
        sticky
        top-0
        h-screen
        w-[270px]
        shrink-0
        bg-[#101828]
        text-white
        flex
        flex-col
        border-r
        border-white/5
        overflow-hidden
      "
    >

      {/* =================================================
          BRAND
      ================================================= */}

      <div className="px-5 py-5 border-b border-white/10">

        <Link
          to="/dashboard"
          className="flex items-center gap-3 group"
        >

          <motion.div
            whileHover={{
              rotate: -5,
              scale: 1.05,
            }}
            className="
              relative
              w-10
              h-10
              rounded-xl
              bg-[#0F766E]
              flex
              items-center
              justify-center
              overflow-hidden
              shrink-0
            "
          >

            <Brain size={20} />

            <motion.div
              animate={{
                x: [-35, 35],
              }}
              transition={{
                duration: 2.8,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="
                absolute
                inset-y-0
                w-5
                bg-white/20
                blur-md
              "
            />

          </motion.div>


          <div>

            <div className="text-lg font-bold tracking-tight">

              Recruit<span className="text-[#8FE2D1]">
                _Ai
              </span>

            </div>

            <div className="
              text-[9px]
              uppercase
              tracking-[0.18em]
              text-white/40
              mt-0.5
            ">
              Student Portal
            </div>

          </div>

        </Link>

      </div>


      {/* =================================================
          USER PROFILE MINI CARD
      ================================================= */}

      <div className="px-4 pt-4">

        <button
          onClick={() => navigate("/profile")}
          className="
            w-full
            flex
            items-center
            gap-3
            p-3
            rounded-xl
            bg-white/[0.045]
            border
            border-white/[0.07]
            hover:bg-white/[0.08]
            transition
            text-left
            group
          "
        >

          <div className="
            w-10
            h-10
            shrink-0
            rounded-xl
            bg-[#DDF5EF]
            text-[#0F766E]
            flex
            items-center
            justify-center
            font-bold
          ">

            {initial}

          </div>


          <div className="min-w-0 flex-1">

            <div className="
              text-sm
              font-semibold
              text-white
              truncate
            ">

              {fullName}

            </div>


            <div className="
              text-[11px]
              text-white/40
              truncate
              mt-0.5
            ">

              {email || "Student Account"}

            </div>

          </div>


          <ChevronRight
            size={15}
            className="
              text-white/20
              group-hover:text-[#8FE2D1]
              group-hover:translate-x-0.5
              transition-all
            "
          />

        </button>

      </div>


      {/* =================================================
          NAVIGATION LABEL
      ================================================= */}

      <div className="
        px-5
        pt-6
        pb-2
        text-[9px]
        uppercase
        tracking-[0.2em]
        font-semibold
        text-white/30
      ">

        Workspace

      </div>


      {/* =================================================
          MENU
      ================================================= */}

      <nav className="
        flex-1
        px-3
        pb-4
        overflow-y-auto
        sidebar-scroll
      ">

        <div className="space-y-1">

          {menuItems.map((item) => {

            const isActive =
              isActiveRoute(item.path);

            return (

              <Link
                key={item.title}
                to={item.path}
                className="relative block"
              >

                {/* Active background */}

                {isActive && (

                  <motion.div
                    layoutId="sidebar-active"
                    className="
                      absolute
                      inset-0
                      rounded-xl
                      bg-[#0F766E]
                    "
                    transition={{
                      type: "spring",
                      stiffness: 350,
                      damping: 30,
                    }}
                  />

                )}


                <div
                  className={`
                    relative
                    z-10
                    flex
                    items-center
                    gap-3
                    px-3
                    py-3
                    rounded-xl
                    transition-all
                    duration-200
                    group
                    ${
                      isActive
                        ? "text-white"
                        : "text-white/55 hover:text-white hover:bg-white/[0.05]"
                    }
                  `}
                >

                  <span
                    className={`
                      shrink-0
                      transition-transform
                      duration-200
                      ${
                        isActive
                          ? "text-white"
                          : "text-white/45 group-hover:text-[#8FE2D1] group-hover:scale-105"
                      }
                    `}
                  >

                    {item.icon}

                  </span>


                  <span className="
                    text-[13px]
                    font-medium
                    flex-1
                  ">

                    {item.title}

                  </span>


                  {isActive && (

                    <ChevronRight
                      size={14}
                      className="text-white/70"
                    />

                  )}

                </div>

              </Link>

            );

          })}

        </div>

      </nav>


      {/* =================================================
          SECURITY STATUS
      ================================================= */}

      <div className="px-4 pb-3">

        <div className="
          flex
          items-center
          gap-3
          px-3
          py-3
          rounded-xl
          bg-[#0F766E]/10
          border
          border-[#0F766E]/20
        ">

          <div className="
            w-8
            h-8
            rounded-lg
            bg-[#0F766E]/20
            flex
            items-center
            justify-center
          ">

            <ShieldCheck
              size={16}
              className="text-[#8FE2D1]"
            />

          </div>


          <div>

            <div className="
              text-[11px]
              font-semibold
              text-white/80
            ">

              Secure session

            </div>

            <div className="
              text-[9px]
              text-white/35
              mt-0.5
            ">

              Your data is protected

            </div>

          </div>

        </div>

      </div>


      {/* =================================================
          LOGOUT
      ================================================= */}

      <div className="
        p-4
        border-t
        border-white/10
      ">

        <button
          onClick={handleLogout}
          className="
            group
            w-full
            flex
            items-center
            gap-3
            px-3
            py-3
            rounded-xl
            text-white/50
            hover:text-[#FFB4A6]
            hover:bg-[#E87961]/10
            transition-all
          "
        >

          <div className="
            w-9
            h-9
            rounded-lg
            bg-white/[0.04]
            flex
            items-center
            justify-center
            group-hover:bg-[#E87961]/10
            transition
          ">

            <LogOut size={17} />

          </div>


          <div className="text-left">

            <div className="text-sm font-medium">
              Logout
            </div>

            <div className="text-[10px] text-white/25">
              Sign out of your account
            </div>

          </div>

        </button>

      </div>


      {/* =================================================
          CUSTOM SCROLLBAR
      ================================================= */}

      <style>{`

        .sidebar-scroll::-webkit-scrollbar {
          width: 4px;
        }

        .sidebar-scroll::-webkit-scrollbar-track {
          background: transparent;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: rgba(255,255,255,0.12);
          border-radius: 10px;
        }

        .sidebar-scroll::-webkit-scrollbar-thumb:hover {
          background: rgba(143,226,209,0.35);
        }

      `}</style>

    </aside>
  );
}

export default Sidebar;

