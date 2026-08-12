import { NavLink } from "react-router-dom";

import {
  LayoutDashboard,
  Building2,
  Briefcase,
  ClipboardList,
  FileText,
  Trophy,
  Video,
  ShieldCheck,
  BarChart3,
  Bell,
  Settings,
  LogOut,
  Sparkles,
} from "lucide-react";


// ============================================================
// ORGANIZATION SIDEBAR
// ============================================================

function OrganizationSidebar() {

  const menuItems = [
    {
      title: "Dashboard",
      icon: LayoutDashboard,
      path: "/organization/dashboard",
    },
    {
      title: "Company Profile",
      icon: Building2,
      path: "/organization/profile",
    },
    {
      title: "Create Job",
      icon: Briefcase,
      path: "/organization/jobs/create",
    },
    {
      title: "Manage Jobs",
      icon: ClipboardList,
      path: "/organization/jobs",
    },
    {
      title: "Applications",
      icon: FileText,
      path: "/organization/applications",
    },
    {
      title: "Candidate Ranking",
      icon: Trophy,
      path: "/organization/ranking",
    },
    {
      title: "AI Interviews",
      icon: Video,
      path: "/organization/interviews",
    },
   

  ];

  const handleLogout = () => {

    localStorage.removeItem(
      "organization_token"
    );

    localStorage.removeItem(
      "organization_id"
    );

    localStorage.removeItem(
      "organizationId"
    );

    localStorage.removeItem(
      "company_name"
    );

    localStorage.removeItem(
      "organization"
    );

    window.location.href =
      "/organization/login";
  };


  const companyName =
    localStorage.getItem(
      "company_name"
    ) || "Organization";


  return (

    <aside
      className="
        fixed
        inset-y-0
        left-0
        z-50

        hidden
        md:flex

        w-72

        flex-col

        bg-[#172033]
        text-white

        border-r
        border-white/10

        shadow-xl
      "
    >

      {/* ====================================================
          LOGO
      ==================================================== */}

      <div
        className="
          h-[88px]

          px-6

          flex
          items-center

          border-b
          border-white/10

          flex-shrink-0
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
              w-11
              h-11

              rounded-xl

              bg-[#0F766E]

              flex
              items-center
              justify-center

              shadow-lg
              shadow-[#0F766E]/20

              transition
              duration-300

              hover:scale-105
            "
          >

            <Sparkles
              size={22}
              className="text-white"
            />

          </div>


          <div>

            <h1
              className="
                text-xl
                font-bold

                tracking-tight
              "
            >
              Recruit AI
            </h1>


            <p
              className="
                text-[10px]

                uppercase

                tracking-[0.18em]

                text-white/40

                mt-0.5
              "
            >
              Organization Portal
            </p>

          </div>

        </div>

      </div>


      {/* ====================================================
          COMPANY
      ==================================================== */}

      <div
        className="
          px-5
          py-4

          border-b
          border-white/10

          flex-shrink-0
        "
      >

        <div
          className="
            px-4
            py-3

            rounded-xl

            bg-white/[0.05]

            border
            border-white/[0.06]
          "
        >

          <p
            className="
              text-sm

              font-semibold

              truncate
            "
          >
            {companyName}
          </p>


          <p
            className="
              text-xs

              text-white/40

              mt-1
            "
          >
            Recruiter Dashboard
          </p>

        </div>

      </div>


      {/* ====================================================
          MENU
      ==================================================== */}

      <nav
        className="
          flex-1

          overflow-y-auto

          px-3
          py-4
        "
      >

        <p
          className="
            px-3
            mb-3

            text-[10px]

            font-bold

            uppercase

            tracking-[0.18em]

            text-white/30
          "
        >
          Workspace
        </p>


        <div className="space-y-1">

          {menuItems.map(
            (item) => {

              const Icon =
                item.icon;


              return (

                <NavLink
                  key={item.title}
                  to={item.path}

                  className={({
                    isActive,
                  }) => `
                    flex
                    items-center
                    gap-3

                    px-3.5
                    py-3

                    rounded-xl

                    text-sm
                    font-medium

                    transition-all
                    duration-200

                    ${
                      isActive
                        ? `
                          bg-[#0F766E]
                          text-white

                          shadow-lg
                          shadow-[#0F766E]/20
                        `
                        : `
                          text-white/65

                          hover:bg-white/[0.06]
                          hover:text-white
                        `
                    }
                  `}
                >

                  <Icon
                    size={19}
                    strokeWidth={1.8}
                    className="flex-shrink-0"
                  />


                  <span className="truncate">
                    {item.title}
                  </span>

                </NavLink>

              );

            }
          )}

        </div>

      </nav>


      {/* ====================================================
          SECURITY
      ==================================================== */}

      <div
        className="
          px-4
          pb-3

          flex-shrink-0
        "
      >

        <div
          className="
            flex
            items-center
            gap-3

            px-3
            py-3

            rounded-xl

            bg-[#0F766E]/10

            border
            border-[#0F766E]/15
          "
        >

          <div
            className="
              w-8
              h-8

              rounded-lg

              bg-[#0F766E]/20

              flex
              items-center
              justify-center
            "
          >

            <ShieldCheck
              size={17}
              className="text-[#79CEC5]"
            />

          </div>


          <div>

            <p
              className="
                text-xs
                font-semibold
              "
            >
              Secure session
            </p>


            <p
              className="
                text-[10px]

                text-white/40

                mt-0.5
              "
            >
              Your data is protected
            </p>

          </div>

        </div>

      </div>


      {/* ====================================================
          LOGOUT
      ==================================================== */}

      <div
        className="
          px-4
          py-4

          border-t
          border-white/10

          flex-shrink-0
        "
      >

        <button
          type="button"
          onClick={handleLogout}

          className="
            w-full

            flex
            items-center
            justify-center
            gap-2.5

            py-3

            rounded-xl

            bg-[#C53030]

            text-white

            text-sm
            font-semibold

            hover:bg-[#A92323]

            hover:-translate-y-0.5

            transition-all
            duration-200
          "
        >

          <LogOut size={18} />

          Logout

        </button>

      </div>

    </aside>

  );
}


export default OrganizationSidebar;