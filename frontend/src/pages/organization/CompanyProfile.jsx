import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import {
  getOrganizationProfile,
  updateOrganizationProfile,
} from "../../api/organizationApi";

import OrganizationSidebar from "../../components/organization/OrganizationSidebar";
import OrganizationNavbar from "../../components/organization/OrganizationNavbar";

import {
  Building2,
  Mail,
  Phone,
  Globe,
  MapPin,
  Factory,
  Calendar,
  Image,
  Save,
  RotateCcw,
  BadgeCheck,
  Edit,
  BriefcaseBusiness,
  Users,
  CheckCircle2,
  ArrowLeft,
} from "lucide-react";


function CompanyProfile() {

  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    company_name: "",
    email: "",
    phone: "",
    website: "",
    industry: "",
    address: "",
    company_logo: "",
    company_size: "",
    founded_year: "",
  });

  const [originalData, setOriginalData] = useState({});


  // =========================================================
  // LOAD PROFILE
  // =========================================================

  useEffect(() => {
    loadProfile();
  }, []);


  const loadProfile = async () => {

    try {

      const organizationId =
        localStorage.getItem(
          "organizationId"
        ) ||
        localStorage.getItem(
          "organization_id"
        );


      if (!organizationId) {

        toast.error(
          "Organization ID not found."
        );

        return;
      }


      const data =
        await getOrganizationProfile(
          organizationId
        );


      const profileData = {
        company_name:
          data.company_name || "",

        email:
          data.email || "",

        phone:
          data.phone || "",

        website:
          data.website || "",

        industry:
          data.industry || "",

        address:
          data.address || "",

        company_logo:
          data.company_logo || "",

        company_size:
          data.company_size || "",

        founded_year:
          data.founded_year || "",
      };


      setFormData(
        profileData
      );

      setOriginalData(
        profileData
      );

    } catch (error) {

      console.error(
        "Profile Load Error:",
        error
      );

      toast.error(
        error?.response?.data?.detail ||
        "Failed to load company profile."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // HANDLE CHANGE
  // =========================================================

  const handleChange = (e) => {

    const {
      name,
      value,
    } = e.target;


    setFormData(
      (previous) => ({
        ...previous,
        [name]: value,
      })
    );

  };


  // =========================================================
  // UPDATE PROFILE
  // =========================================================

  const handleUpdate = async (e) => {

    e.preventDefault();


    const organizationId =
      localStorage.getItem(
        "organizationId"
      ) ||
      localStorage.getItem(
        "organization_id"
      );


    if (!organizationId) {

      toast.error(
        "Organization ID not found."
      );

      return;
    }


    try {

      setLoading(true);


      await updateOrganizationProfile(
        organizationId,
        formData
      );


      setOriginalData(
        formData
      );


      if (formData.company_name) {

        localStorage.setItem(
          "company_name",
          formData.company_name
        );

      }


      setIsEditing(false);


      toast.success(
        "Profile updated successfully."
      );

    } catch (error) {

      console.error(
        "Profile Update Error:",
        error
      );


      toast.error(
        error?.response?.data?.detail ||
        error?.response?.data?.message ||
        "Update failed."
      );

    } finally {

      setLoading(false);

    }

  };


  // =========================================================
  // RESET
  // =========================================================

  const handleReset = () => {

    setFormData(
      originalData
    );

    setIsEditing(false);

    toast.success(
      "Changes reset."
    );

  };


  // =========================================================
  // LOADING UI
  // =========================================================

  if (loading) {

    return (

      <div
        className="
          flex
          h-screen
          bg-[#F7F6F2]
        "
      >

        <OrganizationSidebar />


        <div
          className="
            flex-1
            flex
            flex-col
            overflow-hidden
          "
        >

          <OrganizationNavbar />


          <main
            className="
              flex-1
              overflow-y-auto
              p-5
              md:p-7
            "
          >

            <div
              className="
                max-w-6xl
                mx-auto
                space-y-6
              "
            >

              <div
                className="
                  h-8
                  w-64
                  bg-gray-200
                  rounded-lg
                  animate-pulse
                "
              />


              <div
                className="
                  h-4
                  w-80
                  bg-gray-200
                  rounded
                  animate-pulse
                "
              />


              <div
                className="
                  bg-white
                  rounded-3xl
                  border
                  border-[#E5E7EB]
                  p-7
                  animate-pulse
                "
              >

                <div
                  className="
                    flex
                    items-center
                    gap-6
                  "
                >

                  <div
                    className="
                      w-28
                      h-28
                      rounded-3xl
                      bg-gray-200
                    "
                  />


                  <div
                    className="
                      flex-1
                      space-y-3
                    "
                  >

                    <div
                      className="
                        h-7
                        w-64
                        bg-gray-200
                        rounded
                      "
                    />

                    <div
                      className="
                        h-4
                        w-40
                        bg-gray-200
                        rounded
                      "
                    />

                    <div
                      className="
                        h-4
                        w-52
                        bg-gray-200
                        rounded
                      "
                    />

                  </div>

                </div>

              </div>


              <div
                className="
                  bg-white
                  rounded-3xl
                  border
                  border-[#E5E7EB]
                  p-7
                  animate-pulse
                "
              >

                <div
                  className="
                    grid
                    grid-cols-1
                    md:grid-cols-2
                    gap-6
                  "
                >

                  {[1, 2, 3, 4, 5, 6, 7, 8].map(
                    (item) => (

                      <div
                        key={item}
                        className="space-y-2"
                      >

                        <div
                          className="
                            h-4
                            w-28
                            bg-gray-200
                            rounded
                          "
                        />

                        <div
                          className="
                            h-12
                            bg-gray-200
                            rounded-xl
                          "
                        />

                      </div>

                    )
                  )}

                </div>

              </div>

            </div>

          </main>

        </div>

      </div>

    );

  }


  // =========================================================
  // MAIN UI
  // =========================================================

  return (

    <div
      className="
        flex
        h-screen

        bg-[#F7F6F2]

        text-[#172033]

        overflow-hidden
      "
    >

      {/* =====================================================
          SIDEBAR
      ===================================================== */}

      <OrganizationSidebar />


      {/* =====================================================
          MAIN
      ===================================================== */}

      <div
        className="
          flex-1
          flex
          flex-col

          min-w-0

          overflow-hidden
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
            flex-1
            overflow-y-auto
          "
        >

          <div
            className="
              max-w-6xl
              mx-auto

              px-4
              sm:px-6
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

                animate-[fadeUp_.5s_ease-out]
              "
            >

              <div>

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
                    "
                  >

                    <Building2
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
                      Company Profile
                    </h1>


                    <p
                      className="
                        text-sm

                        text-[#64748B]

                        mt-1
                      "
                    >
                      Manage your organization's
                      information and profile.
                    </p>

                  </div>

                </div>

              </div>


              {!isEditing && (

                <button
                  onClick={() =>
                    setIsEditing(true)
                  }

                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2

                    px-5
                    py-3

                    rounded-xl

                    bg-[#172033]

                    text-white

                    text-sm
                    font-semibold

                    shadow-sm

                    hover:bg-[#0F766E]

                    hover:-translate-y-0.5

                    hover:shadow-md

                    transition-all
                    duration-200
                  "
                >

                  <Edit
                    size={17}
                  />

                  Edit Profile

                </button>

              )}

            </div>


            {/* =================================================
                PROFILE HERO
            ================================================= */}

            <div
              className="
                bg-white

                rounded-3xl

                border
                border-[#E5E7EB]

                shadow-sm

                overflow-hidden

                mb-6

                animate-[fadeUp_.6s_ease-out]
              "
            >

              {/* TOP ACCENT */}

              <div
                className="
                  h-1.5

                  bg-gradient-to-r
                  from-[#172033]
                  via-[#0F766E]
                  to-[#16803C]
                "
              />


              <div
                className="
                  p-5
                  sm:p-7
                  lg:p-8
                "
              >

                <div
                  className="
                    flex
                    flex-col
                    md:flex-row

                    md:items-center

                    gap-6
                  "
                >

                  {/* =================================================
                      LOGO
                  ================================================= */}

                  <div
                    className="
                      relative
                      flex-shrink-0
                    "
                  >

                    <div
                      className="
                        w-24
                        h-24
                        md:w-28
                        md:h-28

                        rounded-3xl

                        bg-[#E8F3F2]

                        border
                        border-[#D6EAE7]

                        flex
                        items-center
                        justify-center

                        overflow-hidden

                        shadow-sm
                      "
                    >

                      {formData.company_logo ? (

                        <img
                          src={
                            formData.company_logo
                          }

                          alt={
                            formData.company_name ||
                            "Company"
                          }

                          className="
                            w-full
                            h-full

                            object-cover
                          "
                        />

                      ) : (

                        <Building2
                          size={46}
                          className="
                            text-[#0F766E]
                          "
                        />

                      )}

                    </div>


                    {/* VERIFIED DOT */}

                    <div
                      className="
                        absolute
                        -bottom-1
                        -right-1

                        w-8
                        h-8

                        rounded-full

                        bg-white

                        border
                        border-[#E5E7EB]

                        flex
                        items-center
                        justify-center

                        shadow-sm
                      "
                    >

                      <CheckCircle2
                        size={17}
                        className="
                          text-[#16803C]
                        "
                      />

                    </div>

                  </div>


                  {/* =================================================
                      COMPANY INFO
                  ================================================= */}

                  <div
                    className="
                      flex-1
                      min-w-0
                    "
                  >

                    <div
                      className="
                        flex
                        flex-wrap

                        items-center

                        gap-2
                      "
                    >

                      <h2
                        className="
                          text-2xl
                          md:text-3xl

                          font-bold

                          text-[#172033]

                          truncate
                        "
                      >
                        {formData.company_name ||
                          "Company Name"}
                      </h2>


                      <span
                        className="
                          inline-flex
                          items-center
                          gap-1

                          px-2.5
                          py-1

                          rounded-full

                          bg-[#EAF6EE]

                          text-[#16803C]

                          text-xs

                          font-semibold
                        "
                      >

                        <BadgeCheck
                          size={13}
                        />

                        Verified

                      </span>

                    </div>


                    {formData.industry && (

                      <p
                        className="
                          text-[#64748B]

                          mt-1

                          font-medium
                        "
                      >
                        {formData.industry}
                      </p>

                    )}


                    <div
                      className="
                        flex
                        flex-wrap

                        gap-x-5
                        gap-y-2

                        mt-3
                      "
                    >

                      {formData.email && (

                        <div
                          className="
                            flex
                            items-center
                            gap-2

                            text-sm
                            text-[#64748B]
                          "
                        >

                          <Mail
                            size={15}
                            className="
                              text-[#0F766E]
                            "
                          />

                          <span>
                            {formData.email}
                          </span>

                        </div>

                      )}


                      {formData.phone && (

                        <div
                          className="
                            flex
                            items-center
                            gap-2

                            text-sm
                            text-[#64748B]
                          "
                        >

                          <Phone
                            size={15}
                            className="
                              text-[#0F766E]
                            "
                          />

                          <span>
                            {formData.phone}
                          </span>

                        </div>

                      )}

                    </div>

                  </div>


                  {/* =================================================
                      QUICK INFO
                  ================================================= */}

                  <div
                    className="
                      grid
                      grid-cols-2

                      gap-3

                      md:w-64
                    "
                  >

                    <MiniInfo
                      icon={
                        <Users size={17} />
                      }
                      label="Company Size"
                      value={
                        formData.company_size ||
                        "Not added"
                      }
                    />


                    <MiniInfo
                      icon={
                        <Calendar
                          size={17}
                        />
                      }
                      label="Founded"
                      value={
                        formData.founded_year ||
                        "Not added"
                      }
                    />

                  </div>

                </div>

              </div>

            </div>


            {/* =================================================
                PROFILE FORM
            ================================================= */}

            <div
              className="
                bg-white

                rounded-3xl

                border
                border-[#E5E7EB]

                shadow-sm

                overflow-hidden

                animate-[fadeUp_.7s_ease-out]
              "
            >

              {/* FORM HEADER */}

              <div
                className="
                  px-5
                  sm:px-7
                  lg:px-8

                  py-5

                  border-b
                  border-[#E5E7EB]

                  bg-[#FAFAF8]
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

                    <BriefcaseBusiness
                      size={18}
                      className="
                        text-white
                      "
                    />

                  </div>


                  <div>

                    <h3
                      className="
                        font-bold

                        text-[#172033]
                      "
                    >
                      Organization Details
                    </h3>


                    <p
                      className="
                        text-xs

                        text-[#94A3B8]

                        mt-0.5
                      "
                    >
                      Keep your company information
                      accurate and up to date.
                    </p>

                  </div>

                </div>

              </div>


              {/* FORM BODY */}

              <form
                onSubmit={
                  handleUpdate
                }

                className="
                  p-5
                  sm:p-7
                  lg:p-8
                "
              >

                <div
                  className="
                    grid

                    grid-cols-1
                    md:grid-cols-2

                    gap-5
                  "
                >

                  <ProfileField
                    label="Company Name"
                    name="company_name"
                    value={
                      formData.company_name
                    }
                    onChange={
                      handleChange
                    }
                    icon={
                      <Building2
                        size={17}
                      />
                    }
                    disabled={
                      !isEditing
                    }
                    placeholder="Enter company name"
                  />


                  <ProfileField
                    label="Email"
                    name="email"
                    value={
                      formData.email
                    }
                    icon={
                      <Mail
                        size={17}
                      />
                    }
                    disabled={true}
                    placeholder="Company email"
                  />


                  <ProfileField
                    label="Phone"
                    name="phone"
                    value={
                      formData.phone
                    }
                    onChange={
                      handleChange
                    }
                    icon={
                      <Phone
                        size={17}
                      />
                    }
                    disabled={
                      !isEditing
                    }
                    placeholder="Enter phone number"
                  />


                  <ProfileField
                    label="Website"
                    name="website"
                    value={
                      formData.website
                    }
                    onChange={
                      handleChange
                    }
                    icon={
                      <Globe
                        size={17}
                      />
                    }
                    disabled={
                      !isEditing
                    }
                    placeholder="https://company.com"
                  />


                  <ProfileField
                    label="Industry"
                    name="industry"
                    value={
                      formData.industry
                    }
                    onChange={
                      handleChange
                    }
                    icon={
                      <Factory
                        size={17}
                      />
                    }
                    disabled={
                      !isEditing
                    }
                    placeholder="e.g. Information Technology"
                  />


                  <ProfileField
                    label="Company Size"
                    name="company_size"
                    value={
                      formData.company_size
                    }
                    onChange={
                      handleChange
                    }
                    icon={
                      <Users
                        size={17}
                      />
                    }
                    disabled={
                      !isEditing
                    }
                    placeholder="e.g. 50-100 employees"
                  />


                  <ProfileField
                    label="Founded Year"
                    name="founded_year"
                    value={
                      formData.founded_year
                    }
                    onChange={
                      handleChange
                    }
                    icon={
                      <Calendar
                        size={17}
                      />
                    }
                    disabled={
                      !isEditing
                    }
                    type="number"
                    placeholder="e.g. 2018"
                  />


                  <ProfileField
                    label="Company Logo URL"
                    name="company_logo"
                    value={
                      formData.company_logo
                    }
                    onChange={
                      handleChange
                    }
                    icon={
                      <Image
                        size={17}
                      />
                    }
                    disabled={
                      !isEditing
                    }
                    placeholder="Enter logo URL"
                  />


                  {/* WEBSITE PREVIEW */}

                  {formData.website && (

                    <div
                      className="
                        md:col-span-2

                        flex
                        items-center
                        gap-3

                        px-4
                        py-3

                        rounded-xl

                        bg-[#F8FAF9]

                        border
                        border-[#E5E7EB]
                      "
                    >

                      <Globe
                        size={17}
                        className="
                          text-[#0F766E]
                        "
                      />

                      <span
                        className="
                          text-sm

                          text-[#64748B]
                        "
                      >
                        Website:
                      </span>

                      <a
                        href={
                          formData.website.startsWith(
                            "http"
                          )
                            ? formData.website
                            : `https://${formData.website}`
                        }

                        target="_blank"

                        rel="noreferrer"

                        className="
                          text-sm

                          font-semibold

                          text-[#0F766E]

                          hover:underline

                          truncate
                        "
                      >
                        {formData.website}
                      </a>

                    </div>

                  )}


                  {/* ADDRESS */}

                  <div
                    className="
                      md:col-span-2
                    "
                  >

                    <ProfileTextarea
                      label="Company Address"
                      name="address"
                      value={
                        formData.address
                      }
                      onChange={
                        handleChange
                      }
                      icon={
                        <MapPin
                          size={17}
                        />
                      }
                      disabled={
                        !isEditing
                      }
                      placeholder="Enter complete company address"
                    />

                  </div>

                </div>


                {/* =================================================
                    ACTIONS
                ================================================= */}

                {isEditing ? (

                  <div
                    className="
                      mt-8
                      pt-6

                      border-t
                      border-[#E5E7EB]

                      flex

                      flex-col-reverse
                      sm:flex-row

                      sm:justify-end

                      gap-3
                    "
                  >

                    <button
                      type="button"

                      onClick={
                        handleReset
                      }

                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2

                        px-6
                        py-3

                        rounded-xl

                        bg-[#F1F3F2]

                        text-[#475569]

                        text-sm
                        font-semibold

                        hover:bg-[#E5E7EB]

                        transition
                      "
                    >

                      <RotateCcw
                        size={17}
                      />

                      Cancel / Reset

                    </button>


                    <button
                      type="submit"

                      disabled={loading}

                      className="
                        inline-flex
                        items-center
                        justify-center
                        gap-2

                        px-7
                        py-3

                        rounded-xl

                        bg-[#172033]

                        text-white

                        text-sm
                        font-semibold

                        shadow-sm

                        hover:bg-[#0F766E]

                        hover:-translate-y-0.5

                        hover:shadow-md

                        transition-all

                        disabled:opacity-60
                        disabled:cursor-not-allowed
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

                          Saving...

                        </>

                      ) : (

                        <>
                          <Save
                            size={17}
                          />

                          Save Changes

                        </>

                      )}

                    </button>

                  </div>

                ) : (

                  <div
                    className="
                      mt-8
                      pt-6

                      border-t
                      border-[#E5E7EB]

                      flex
                      justify-end
                    "
                  >

                    <button
                      type="button"

                      onClick={() =>
                        setIsEditing(true)
                      }

                      className="
                        inline-flex
                        items-center
                        gap-2

                        px-6
                        py-3

                        rounded-xl

                        bg-[#172033]

                        text-white

                        text-sm
                        font-semibold

                        hover:bg-[#0F766E]

                        transition
                      "
                    >

                      <Edit
                        size={17}
                      />

                      Edit Profile

                    </button>

                  </div>

                )}

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

        `}
      </style>

    </div>

  );
}


// =============================================================
// PROFILE FIELD
// =============================================================

function ProfileField({
  label,
  name,
  value,
  onChange,
  icon,
  disabled,
  placeholder,
  type = "text",
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

      </label>


      <input
        type={type}

        name={name}

        value={value}

        onChange={onChange}

        disabled={disabled}

        placeholder={placeholder}

        className={`
          w-full

          h-12

          px-4

          rounded-xl

          border

          text-sm

          outline-none

          transition-all
          duration-200

          ${
            disabled
              ? `
                bg-[#F6F7F6]
                border-[#E5E7EB]
                text-[#64748B]
                cursor-not-allowed
              `
              : `
                bg-white
                border-[#DDE3E5]
                text-[#172033]

                placeholder:text-[#A0AAB5]

                hover:border-[#B8C4C4]

                focus:border-[#0F766E]

                focus:ring-4
                focus:ring-[#0F766E]/10
              `
          }
        `}
      />

    </div>

  );

}


// =============================================================
// TEXTAREA
// =============================================================

function ProfileTextarea({
  label,
  name,
  value,
  onChange,
  icon,
  disabled,
  placeholder,
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

      </label>


      <textarea
        name={name}

        value={value}

        onChange={onChange}

        disabled={disabled}

        rows={4}

        placeholder={placeholder}

        className={`
          w-full

          px-4
          py-3

          rounded-xl

          border

          text-sm

          outline-none

          resize-none

          transition-all
          duration-200

          ${
            disabled
              ? `
                bg-[#F6F7F6]
                border-[#E5E7EB]
                text-[#64748B]
                cursor-not-allowed
              `
              : `
                bg-white
                border-[#DDE3E5]
                text-[#172033]

                placeholder:text-[#A0AAB5]

                hover:border-[#B8C4C4]

                focus:border-[#0F766E]

                focus:ring-4
                focus:ring-[#0F766E]/10
              `
          }
        `}
      />

    </div>

  );

}


// =============================================================
// MINI INFO
// =============================================================

function MiniInfo({
  icon,
  label,
  value,
}) {

  return (

    <div
      className="
        p-3

        rounded-xl

        bg-[#F8FAF9]

        border
        border-[#E5E7EB]
      "
    >

      <div
        className="
          flex
          items-center
          gap-2

          text-[#0F766E]

          mb-1
        "
      >

        {icon}

        <span
          className="
            text-[11px]

            font-semibold

            text-[#64748B]
          "
        >
          {label}
        </span>

      </div>


      <p
        className="
          text-sm

          font-bold

          text-[#172033]

          truncate
        "
      >
        {value}
      </p>

    </div>

  );

}


export default CompanyProfile;