import { useState } from "react";

import {
  Search,
  Bell,
  Moon,
  Sun,
  UserCircle,
  ChevronDown,
} from "lucide-react";


// ============================================================
// ORGANIZATION NAVBAR
// ============================================================

function OrganizationNavbar() {

  const [darkMode, setDarkMode] =
    useState(false);

  const [showProfile, setShowProfile] =
    useState(false);


  // ==========================================================
  // ORGANIZATION DATA
  // ==========================================================

  const companyName =
    localStorage.getItem("company_name") ||
    "Organization";


  // ==========================================================
  // DATE
  // ==========================================================

  const today =
    new Date().toLocaleDateString(
      "en-IN",
      {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }
    );


  // ==========================================================
  // TOGGLE DARK MODE
  // ==========================================================

  const toggleDarkMode = () => {

    setDarkMode(
      (previous) => !previous
    );

  };


  // ==========================================================
  // CLOSE PROFILE
  // ==========================================================

  const toggleProfile = () => {

    setShowProfile(
      (previous) => !previous
    );

  };


  return (

    <header
      className="
        fixed
        top-0
        left-[282px]
        right-0

        z-40

        h-[88px]

        w-[calc(100%-282px)]

        bg-[#F7F6F2]/95
        backdrop-blur-xl

        border-b
        border-[#E5E7EB]

        shadow-[0_4px_20px_rgba(23,32,51,0.05)]

        transition-all
        duration-300
      "
    >

      {/* ======================================================
          NAVBAR INNER
      ====================================================== */}

      <div
        className="
          w-full
          h-full

          px-5
          lg:px-6
          xl:px-8

          flex
          items-center
          gap-5
        "
      >

        {/* ====================================================
            LEFT - WELCOME
        ==================================================== */}

        <div
          className="
            flex-shrink-0
            w-[220px]
            xl:w-[245px]
          "
        >

          <div
            className="
              flex
              items-center
              gap-2
            "
          >

            <h1
              className="
                text-xl
                xl:text-2xl

                font-bold

                tracking-tight

                text-[#172033]

                whitespace-nowrap
              "
            >
              Welcome
            </h1>


            <span
              className="
                text-xl

                animate-[wave_2s_ease-in-out_infinite]
              "
            >
              👋
            </span>

          </div>


          <div
            className="
              flex
              items-center
              gap-2

              mt-0.5
            "
          >

            <span
              className="
                text-sm
                font-medium

                text-[#64748B]

                max-w-[240px]

                truncate
              "
            >
              {companyName}
            </span>

          </div>


          <p
            className="
              hidden
              xl:block

              text-[11px]

              text-[#94A3B8]

              mt-0.5
            "
          >
            {today}
          </p>

        </div>


        {/* ====================================================
            CENTER - SEARCH
        ==================================================== */}

        <div
          className="
            hidden
            md:flex

            flex-1

            min-w-0

            max-w-[560px]

            mx-auto

            relative
          "
        >

          <Search
            size={19}
            strokeWidth={1.8}

            className="
              absolute

              left-4
              top-1/2

              -translate-y-1/2

              text-[#94A3B8]

              pointer-events-none
            "
          />


          <input
            type="text"

            placeholder="Search jobs, candidates..."

            className="
              w-full

              h-11

              pl-11
              pr-12

              rounded-xl

              border
              border-[#DDE3E5]

              bg-white

              text-sm

              text-[#172033]

              placeholder:text-[#94A3B8]

              outline-none

              shadow-sm

              transition-all
              duration-200

              hover:border-[#B8C7C7]

              focus:border-[#0F766E]

              focus:ring-4
              focus:ring-[#0F766E]/10
            "
          />


          {/* SEARCH SHORTCUT */}

          <span
            className="
              absolute

              right-3
              top-1/2

              -translate-y-1/2

              hidden
              lg:flex

              items-center
              justify-center

              min-w-[30px]
              h-7

              px-2

              rounded-lg

              bg-[#F3F5F5]

              border
              border-[#E2E6E6]

              text-[10px]
              font-semibold

              text-[#94A3B8]
            "
          >
            ⌘ K
          </span>

        </div>


        {/* ====================================================
            RIGHT ACTIONS
        ==================================================== */}

        <div
          className="
            ml-auto

            flex
            items-center

            gap-2
            xl:gap-3

            flex-shrink-0
          "
        >

          {/* ==================================================
              DARK MODE
          ================================================== */}

          <button
            type="button"

            onClick={toggleDarkMode}

            aria-label="Toggle theme"

            className="
              w-10
              h-10

              xl:w-11
              xl:h-11

              rounded-full

              bg-white

              border
              border-[#E1E6E7]

              text-[#172033]

              flex
              items-center
              justify-center

              shadow-sm

              hover:bg-[#EEF4F3]

              hover:border-[#B9D5D2]

              hover:text-[#0F766E]

              hover:-translate-y-0.5

              transition-all
              duration-200
            "
          >

            {darkMode ? (

              <Sun
                size={19}
                strokeWidth={1.8}
              />

            ) : (

              <Moon
                size={19}
                strokeWidth={1.8}
              />

            )}

          </button>


          {/* ==================================================
              NOTIFICATIONS
          ================================================== */}

          <button
            type="button"

            aria-label="Notifications"

            className="
              relative

              w-10
              h-10

              xl:w-11
              xl:h-11

              rounded-full

              bg-white

              border
              border-[#E1E6E7]

              text-[#172033]

              flex
              items-center
              justify-center

              shadow-sm

              hover:bg-[#EEF4F3]

              hover:border-[#B9D5D2]

              hover:text-[#0F766E]

              hover:-translate-y-0.5

              transition-all
              duration-200
            "
          >

            <Bell
              size={19}
              strokeWidth={1.8}
            />


            <span
              className="
                absolute

                top-[7px]
                right-[7px]

                w-2
                h-2

                rounded-full

                bg-[#C53030]

                border-2
                border-white

                animate-pulse
              "
            />

          </button>


          {/* ==================================================
              PROFILE
          ================================================== */}

          <div
            className="
              relative
              flex-shrink-0
            "
          >

            <button
              type="button"

              onClick={toggleProfile}

              className="
                flex
                items-center

                gap-2
                xl:gap-3

                rounded-xl

                px-2
                py-1.5

                hover:bg-white

                transition-all
                duration-200
              "
            >

              {/* AVATAR */}

              <div
                className="
                  relative

                  w-10
                  h-10

                  xl:w-11
                  xl:h-11

                  rounded-full

                  bg-gradient-to-br
                  from-[#0F766E]
                  to-[#145B56]

                  text-white

                  flex
                  items-center
                  justify-center

                  shadow-md
                  shadow-[#0F766E]/20

                  transition-transform
                  duration-200

                  hover:scale-105
                "
              >

                <UserCircle
                  size={23}
                  strokeWidth={1.7}
                />


                {/* ONLINE */}

                <span
                  className="
                    absolute

                    right-0
                    bottom-0

                    w-3
                    h-3

                    rounded-full

                    bg-[#16803C]

                    border-2
                    border-white
                  "
                />

              </div>


              {/* COMPANY */}

              <div
                className="
                  hidden
                  lg:block

                  text-left

                  max-w-[180px]
                  xl:max-w-[230px]
                "
              >

                <p
                  className="
                    text-sm

                    font-semibold

                    text-[#172033]

                    truncate
                  "
                >
                  {companyName}
                </p>


                <p
                  className="
                    text-xs

                    text-[#64748B]

                    mt-0.5
                  "
                >
                  Recruiter
                </p>

              </div>


              <ChevronDown
                size={17}

                className={`
                  hidden
                  lg:block

                  text-[#94A3B8]

                  transition-transform
                  duration-200

                  ${
                    showProfile
                      ? "rotate-180"
                      : ""
                  }
                `}
              />

            </button>


            {/* ==================================================
                PROFILE DROPDOWN
            ================================================== */}

            {showProfile && (

              <div
                className="
                  absolute

                  right-0
                  top-[58px]

                  w-64

                  bg-white

                  border
                  border-[#E5E7EB]

                  rounded-2xl

                  shadow-xl
                  shadow-[#172033]/10

                  p-2

                  animate-[fadeIn_0.2s_ease-out]
                "
              >

                <div
                  className="
                    px-3
                    py-3

                    border-b
                    border-[#EEF0F1]
                  "
                >

                  <p
                    className="
                      text-sm
                      font-semibold

                      text-[#172033]

                      truncate
                    "
                  >
                    {companyName}
                  </p>


                  <p
                    className="
                      text-xs

                      text-[#94A3B8]

                      mt-1
                    "
                  >
                    Organization account
                  </p>

                </div>


                <button
                  type="button"

                  className="
                    w-full

                    text-left

                    px-3
                    py-2.5

                    mt-1

                    rounded-xl

                    text-sm

                    text-[#172033]

                    hover:bg-[#F3F7F6]

                    hover:text-[#0F766E]

                    transition
                  "
                >
                  My Profile
                </button>


                <button
                  type="button"

                  className="
                    w-full

                    text-left

                    px-3
                    py-2.5

                    rounded-xl

                    text-sm

                    text-[#172033]

                    hover:bg-[#F3F7F6]

                    hover:text-[#0F766E]

                    transition
                  "
                >
                  Account Settings
                </button>

              </div>

            )}

          </div>

        </div>

      </div>


      {/* ======================================================
          ANIMATIONS
      ====================================================== */}

      <style>
        {`

          @keyframes wave {

            0%, 100% {
              transform: rotate(0deg);
            }

            25% {
              transform: rotate(12deg);
            }

            75% {
              transform: rotate(-8deg);
            }

          }


          @keyframes fadeIn {

            from {
              opacity: 0;
              transform: translateY(-5px);
            }

            to {
              opacity: 1;
              transform: translateY(0);
            }

          }

        `}
      </style>

    </header>

  );

}


export default OrganizationNavbar;