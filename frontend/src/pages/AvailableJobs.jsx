import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Briefcase,
  Building2,
  MapPin,
  IndianRupee,
  Clock3,
  Search,
  Loader2,
  Eye,
  GraduationCap,
  SlidersHorizontal,
  X,
  ChevronRight,
  Sparkles,
  Users,
  Layers3,
  CalendarDays,
  Bookmark,
  ArrowRight,
  CheckCircle2,
  Globe2,
  Code2,
  TrendingUp,
  Filter,
  RefreshCw,
} from "lucide-react";
import toast from "react-hot-toast";

import { getPublishedJobs } from "../api/jobApi";
import Sidebar from "../components/Sidebar";

function AvailableJobs() {
  const navigate = useNavigate();

  // =====================================================
  // STATE
  // =====================================================

  const [loading, setLoading] = useState(true);

  const [refreshing, setRefreshing] = useState(false);

  const [jobs, setJobs] = useState([]);

  const [search, setSearch] = useState("");

  const [locationFilter, setLocationFilter] =
    useState("All");

  const [employmentFilter, setEmploymentFilter] =
    useState("All");

  const [sortBy, setSortBy] =
    useState("Latest");

  const [showFilters, setShowFilters] =
    useState(false);

  const [savedJobs, setSavedJobs] =
    useState([]);

  // =====================================================
  // FETCH JOBS
  // =====================================================

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);

      const response = await getPublishedJobs();

      console.log(
        "Published Jobs Response:",
        response
      );

      if (
        response?.success &&
        Array.isArray(response.jobs)
      ) {
        setJobs(response.jobs);
      } else {
        setJobs([]);
      }
    } catch (error) {
      console.error(
        "Available Jobs Error:",
        error
      );

      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Unable to load jobs."
      );

      setJobs([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  // =====================================================
  // REFRESH
  // =====================================================

  const handleRefresh = async () => {
    setRefreshing(true);

    await fetchJobs();
  };

  // =====================================================
  // SAFE VALUES
  // =====================================================

  const safeJobs = Array.isArray(jobs)
    ? jobs
    : [];

  // =====================================================
  // UNIQUE LOCATIONS
  // =====================================================

  const locations = useMemo(() => {
    const values = safeJobs
      .map((job) => job.location)
      .filter(Boolean);

    return [
      "All",
      ...new Set(values),
    ];
  }, [safeJobs]);

  // =====================================================
  // UNIQUE EMPLOYMENT TYPES
  // =====================================================

  const employmentTypes = useMemo(() => {
    const values = safeJobs
      .map((job) => job.employment_type)
      .filter(Boolean);

    return [
      "All",
      ...new Set(values),
    ];
  }, [safeJobs]);

  // =====================================================
  // FILTER + SORT
  // =====================================================

  const filteredJobs = useMemo(() => {
    const searchValue =
      search.trim().toLowerCase();

    let result = safeJobs.filter((job) => {
      const title =
        job.title?.toLowerCase() || "";

      const company =
        job.company_name?.toLowerCase() || "";

      const location =
        job.location?.toLowerCase() || "";

      const department =
        job.department?.toLowerCase() || "";

      const skills = Array.isArray(
        job.skills
      )
        ? job.skills.join(" ").toLowerCase()
        : "";

      const matchesSearch =
        !searchValue ||
        title.includes(searchValue) ||
        company.includes(searchValue) ||
        location.includes(searchValue) ||
        department.includes(searchValue) ||
        skills.includes(searchValue);

      const matchesLocation =
        locationFilter === "All" ||
        job.location === locationFilter;

      const matchesEmployment =
        employmentFilter === "All" ||
        job.employment_type ===
          employmentFilter;

      return (
        matchesSearch &&
        matchesLocation &&
        matchesEmployment
      );
    });

    result.sort((a, b) => {
      if (sortBy === "Latest") {
        return (
          new Date(b.created_at || 0) -
          new Date(a.created_at || 0)
        );
      }

      if (sortBy === "Company") {
        return (
          a.company_name || ""
        ).localeCompare(
          b.company_name || ""
        );
      }

      if (sortBy === "Title") {
        return (
          a.title || ""
        ).localeCompare(
          b.title || ""
        );
      }

      return 0;
    });

    return result;
  }, [
    safeJobs,
    search,
    locationFilter,
    employmentFilter,
    sortBy,
  ]);

  // =====================================================
  // STATISTICS
  // =====================================================

  const statistics = useMemo(() => {
    const companies = new Set(
      safeJobs
        .map(
          (job) => job.company_name
        )
        .filter(Boolean)
    );

    const locations = new Set(
      safeJobs
        .map((job) => job.location)
        .filter(Boolean)
    );

    const skills = safeJobs.flatMap(
      (job) =>
        Array.isArray(job.skills)
          ? job.skills
          : []
    );

    return {
      jobs: safeJobs.length,
      companies: companies.size,
      locations: locations.size,
      skills: new Set(skills).size,
    };
  }, [safeJobs]);

  // =====================================================
  // SAVE JOB
  // =====================================================

  const toggleSaveJob = (
    event,
    jobId
  ) => {
    event.stopPropagation();

    setSavedJobs((previous) => {
      if (previous.includes(jobId)) {
        toast.success(
          "Job removed from saved jobs."
        );

        return previous.filter(
          (id) => id !== jobId
        );
      }

      toast.success("Job saved.");

      return [
        ...previous,
        jobId,
      ];
    });
  };

  // =====================================================
  // CLEAR FILTERS
  // =====================================================

  const clearFilters = () => {
    setSearch("");
    setLocationFilter("All");
    setEmploymentFilter("All");
    setSortBy("Latest");
  };

  const hasActiveFilters =
    search ||
    locationFilter !== "All" ||
    employmentFilter !== "All";

  // =====================================================
  // DATE FORMAT
  // =====================================================

  const formatDate = (date) => {
    if (!date) {
      return "Recently posted";
    }

    return new Date(
      date
    ).toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }
    );
  };

  // =====================================================
  // LOADING
  // =====================================================

  if (loading) {
    return (
      <div className="flex min-h-screen bg-[#F7F5EF]">

        <Sidebar />

        <main className="flex-1">

          <div className="max-w-7xl mx-auto p-5 md:p-8">

            {/* Header Skeleton */}

            <div className="animate-pulse">

              <div className="h-3 w-32 bg-gray-200 rounded mb-4" />

              <div className="h-10 w-72 bg-gray-200 rounded-lg" />

              <div className="h-5 w-[500px] max-w-full bg-gray-200 rounded mt-3" />

              {/* Stats */}

              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-8">

                {[1, 2, 3, 4].map(
                  (item) => (
                    <div
                      key={item}
                      className="bg-white rounded-2xl p-5 border border-gray-100"
                    >

                      <div className="h-4 w-24 bg-gray-200 rounded" />

                      <div className="h-8 w-16 bg-gray-200 rounded mt-3" />

                    </div>
                  )
                )}

              </div>

              {/* Search */}

              <div className="h-14 w-full bg-white rounded-2xl mt-6" />

              {/* Cards */}

              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5 mt-6">

                {[1, 2, 3, 4, 5, 6].map(
                  (item) => (
                    <div
                      key={item}
                      className="bg-white rounded-2xl p-6 border border-gray-100"
                    >

                      <div className="flex gap-3">

                        <div className="w-12 h-12 bg-gray-200 rounded-xl" />

                        <div className="flex-1">

                          <div className="h-4 w-3/4 bg-gray-200 rounded" />

                          <div className="h-3 w-1/2 bg-gray-200 rounded mt-2" />

                        </div>

                      </div>

                      <div className="h-3 w-full bg-gray-200 rounded mt-6" />

                      <div className="h-3 w-2/3 bg-gray-200 rounded mt-2" />

                      <div className="h-10 w-full bg-gray-200 rounded-xl mt-6" />

                    </div>
                  )
                )}

              </div>

            </div>

          </div>

        </main>
      </div>
    );
  }

  // =====================================================
  // MAIN
  // =====================================================

  return (
    <div className="flex min-h-screen bg-[#F7F5EF] text-[#101828]">

      <Sidebar />

      <main className="flex-1 min-w-0 overflow-hidden">

        {/* =================================================
            BACKGROUND
        ================================================= */}

        <div className="fixed inset-0 pointer-events-none overflow-hidden">

          <div className="absolute -top-60 right-0 w-[550px] h-[550px] rounded-full bg-[#DDF5EF]/50 blur-3xl" />

          <div className="absolute bottom-0 -left-60 w-[500px] h-[500px] rounded-full bg-blue-100/30 blur-3xl" />

        </div>

        <div className="relative max-w-7xl mx-auto p-5 md:p-8">

          {/* =================================================
              HEADER
          ================================================= */}

          <motion.header
            initial={{
              opacity: 0,
              y: -12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              duration: 0.45,
            }}
            className="mb-7"
          >

            <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-5">

              <div>

                <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-[#0F766E]">

                  <span className="w-7 h-[2px] bg-[#0F766E]" />

                  Job Marketplace

                </div>

                <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.04em] mt-3">

                  Discover your next opportunity

                </h1>

                <p className="text-[#667085] mt-2 max-w-2xl">

                  Explore verified opportunities from companies
                  hiring through Recruit_Ai.

                </p>

              </div>

              <div className="flex items-center gap-3">

                <button
                  onClick={() =>
                    navigate(
                      "/recommended-jobs"
                    )
                  }
                  className="hidden sm:inline-flex items-center gap-2 px-4 py-2.5 bg-white border border-[#101828]/10 rounded-xl text-sm font-semibold text-[#344054] hover:bg-[#FCFCFA] transition"
                >

                  <Sparkles
                    size={16}
                    className="text-[#0F766E]"
                  />

                  AI Recommendations

                </button>

                <button
                  onClick={handleRefresh}
                  disabled={refreshing}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-[#101828] text-white rounded-xl text-sm font-semibold hover:bg-[#0F766E] transition disabled:opacity-60"
                >

                  <RefreshCw
                    size={16}
                    className={
                      refreshing
                        ? "animate-spin"
                        : ""
                    }
                  />

                  Refresh

                </button>

              </div>

            </div>

          </motion.header>

          {/* =================================================
              MARKETPLACE HERO
          ================================================= */}

          <motion.section
            initial={{
              opacity: 0,
              y: 12,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.08,
            }}
            className="relative overflow-hidden bg-[#101828] rounded-3xl mb-6"
          >

            <div className="absolute -right-24 -top-28 w-96 h-96 rounded-full bg-[#0F766E]/20 blur-3xl" />

            <div className="absolute right-32 bottom-[-100px] w-72 h-72 rounded-full bg-blue-500/10 blur-3xl" />

            <div className="relative p-6 md:p-8">

              <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto] gap-8 items-center">

                <div>

                  <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-white/10 border border-white/10 rounded-full text-xs text-white/70">

                    <Globe2
                      size={13}
                      className="text-[#8FE2D1]"
                    />

                    Live job marketplace

                  </div>

                  <h2 className="text-2xl md:text-3xl font-semibold text-white mt-5 tracking-[-0.03em]">

                    Find roles that move
                    your career forward.

                  </h2>

                  <p className="text-white/50 text-sm leading-6 mt-3 max-w-xl">

                    Search across roles, companies, locations and
                    technologies. When you're ready, switch to
                    AI Recommendations for personalized matching.

                  </p>

                </div>

                <div className="grid grid-cols-2 gap-3 min-w-[280px]">

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">

                    <Briefcase
                      size={18}
                      className="text-[#8FE2D1]"
                    />

                    <p className="text-2xl font-semibold text-white mt-3">

                      {statistics.jobs}

                    </p>

                    <p className="text-[11px] text-white/40 mt-1">

                      Open positions

                    </p>

                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-2xl p-4">

                    <Building2
                      size={18}
                      className="text-[#8FE2D1]"
                    />

                    <p className="text-2xl font-semibold text-white mt-3">

                      {statistics.companies}

                    </p>

                    <p className="text-[11px] text-white/40 mt-1">

                      Hiring companies

                    </p>

                  </div>

                </div>

              </div>

            </div>

          </motion.section>

          {/* =================================================
              STATISTICS
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
              delay: 0.12,
            }}
            className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6"
          >

            {[
              {
                label: "Open Jobs",
                value: statistics.jobs,
                icon: Briefcase,
                color: "text-[#101828]",
                bg: "bg-[#F2F4F7]",
              },
              {
                label: "Companies",
                value: statistics.companies,
                icon: Building2,
                color: "text-[#0F766E]",
                bg: "bg-[#EAF5F1]",
              },
              {
                label: "Locations",
                value: statistics.locations,
                icon: MapPin,
                color: "text-blue-600",
                bg: "bg-blue-50",
              },
              {
                label: "Skills in Demand",
                value: statistics.skills,
                icon: Code2,
                color: "text-amber-600",
                bg: "bg-amber-50",
              },
            ].map(
              (stat, index) => {
                const Icon = stat.icon;

                return (
                  <motion.div
                    key={stat.label}
                    initial={{
                      opacity: 0,
                      y: 10,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    transition={{
                      delay:
                        0.15 +
                        index * 0.05,
                    }}
                    className="bg-white rounded-2xl border border-[#101828]/10 p-5 shadow-sm"
                  >

                    <div className="flex items-start justify-between">

                      <div>

                        <p className="text-xs font-medium text-[#667085]">

                          {stat.label}

                        </p>

                        <p
                          className={`text-2xl font-bold mt-2 ${stat.color}`}
                        >
                          {stat.value}
                        </p>

                      </div>

                      <div
                        className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center`}
                      >

                        <Icon
                          size={18}
                          className={stat.color}
                        />

                      </div>

                    </div>

                  </motion.div>
                );
              }
            )}

          </motion.div>

          {/* =================================================
              SEARCH BAR
          ================================================= */}

          <motion.section
            initial={{
              opacity: 0,
              y: 10,
            }}
            animate={{
              opacity: 1,
              y: 0,
            }}
            transition={{
              delay: 0.18,
            }}
            className="bg-white rounded-2xl border border-[#101828]/10 p-3 mb-6 shadow-sm"
          >

            <div className="flex flex-col lg:flex-row gap-3">

              {/* Search */}

              <div className="relative flex-1">

                <Search
                  size={18}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#98A2B3]"
                />

                <input
                  type="text"
                  placeholder="Search jobs, companies, skills or locations..."
                  value={search}
                  onChange={(e) =>
                    setSearch(
                      e.target.value
                    )
                  }
                  className="w-full pl-11 pr-4 py-3 bg-[#FCFCFA] border border-[#EAECF0] rounded-xl text-sm text-[#101828] outline-none focus:border-[#0F766E] focus:ring-4 focus:ring-[#0F766E]/5 transition"
                />

                {search && (
                  <button
                    onClick={() =>
                      setSearch("")
                    }
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#98A2B3] hover:text-[#101828]"
                  >

                    <X size={16} />

                  </button>
                )}

              </div>

              {/* Filter */}

              <button
                onClick={() =>
                  setShowFilters(
                    (previous) =>
                      !previous
                  )
                }
                className={`inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl border text-sm font-semibold transition ${
                  showFilters
                    ? "bg-[#101828] text-white border-[#101828]"
                    : "bg-white text-[#344054] border-[#EAECF0] hover:bg-[#FCFCFA]"
                }`}
              >

                <SlidersHorizontal
                  size={16}
                />

                Filters

              </button>

              {/* Sort */}

              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(
                    e.target.value
                  )
                }
                className="px-4 py-3 bg-white border border-[#EAECF0] rounded-xl text-sm font-medium text-[#344054] outline-none focus:border-[#0F766E]"
              >

                <option value="Latest">
                  Latest
                </option>

                <option value="Company">
                  Company
                </option>

                <option value="Title">
                  Job Title
                </option>

              </select>

            </div>

            {/* FILTER PANEL */}

            <AnimatePresence>

              {showFilters && (
                <motion.div
                  initial={{
                    opacity: 0,
                    height: 0,
                  }}
                  animate={{
                    opacity: 1,
                    height: "auto",
                  }}
                  exit={{
                    opacity: 0,
                    height: 0,
                  }}
                  className="overflow-hidden"
                >

                  <div className="border-t border-[#EAECF0] mt-3 pt-4">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                      {/* Location */}

                      <div>

                        <label className="text-xs font-semibold text-[#667085] block mb-2">

                          Location

                        </label>

                        <select
                          value={
                            locationFilter
                          }
                          onChange={(e) =>
                            setLocationFilter(
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2.5 bg-[#FCFCFA] border border-[#EAECF0] rounded-xl text-sm outline-none focus:border-[#0F766E]"
                        >

                          {locations.map(
                            (
                              location
                            ) => (
                              <option
                                key={
                                  location
                                }
                                value={
                                  location
                                }
                              >
                                {location}
                              </option>
                            )
                          )}

                        </select>

                      </div>

                      {/* Employment */}

                      <div>

                        <label className="text-xs font-semibold text-[#667085] block mb-2">

                          Employment Type

                        </label>

                        <select
                          value={
                            employmentFilter
                          }
                          onChange={(e) =>
                            setEmploymentFilter(
                              e.target.value
                            )
                          }
                          className="w-full px-3 py-2.5 bg-[#FCFCFA] border border-[#EAECF0] rounded-xl text-sm outline-none focus:border-[#0F766E]"
                        >

                          {employmentTypes.map(
                            (
                              type
                            ) => (
                              <option
                                key={
                                  type
                                }
                                value={
                                  type
                                }
                              >
                                {type}
                              </option>
                            )
                          )}

                        </select>

                      </div>

                    </div>

                    {hasActiveFilters && (
                      <button
                        onClick={
                          clearFilters
                        }
                        className="mt-4 text-xs font-semibold text-[#0F766E] hover:underline"
                      >
                        Clear all filters
                      </button>
                    )}

                  </div>

                </motion.div>
              )}

            </AnimatePresence>

          </motion.section>

          {/* =================================================
              RESULT HEADER
          ================================================= */}

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">

            <div>

              <h2 className="text-sm font-semibold text-[#101828]">

                Available opportunities

              </h2>

              <p className="text-xs text-[#98A2B3] mt-1">

                Showing{" "}
                <span className="font-semibold text-[#667085]">
                  {filteredJobs.length}
                </span>{" "}
                of{" "}
                <span className="font-semibold text-[#667085]">
                  {safeJobs.length}
                </span>{" "}
                jobs

              </p>

            </div>

            <div className="flex items-center gap-2 text-xs text-[#667085]">

              <Filter size={13} />

              {hasActiveFilters
                ? "Filters active"
                : "All opportunities"}

            </div>

          </div>

          {/* =================================================
              JOB GRID
          ================================================= */}

          {filteredJobs.length === 0 ? (

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              className="bg-white rounded-3xl border border-[#101828]/10 p-14 md:p-20 text-center"
            >

              <div className="w-20 h-20 mx-auto rounded-3xl bg-[#F2F4F7] flex items-center justify-center">

                <Search
                  size={34}
                  className="text-[#98A2B3]"
                />

              </div>

              <h3 className="text-2xl font-semibold mt-6">

                No jobs found

              </h3>

              <p className="text-[#667085] mt-2 max-w-md mx-auto">

                Try changing your search terms
                or removing some filters.

              </p>

              <button
                onClick={clearFilters}
                className="mt-6 inline-flex items-center gap-2 px-5 py-3 bg-[#101828] text-white rounded-xl font-semibold text-sm hover:bg-[#0F766E] transition"
              >

                Clear Filters

                <RefreshCw size={15} />

              </button>

            </motion.div>

          ) : (

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

              {filteredJobs.map(
                (job, index) => {

                  const jobId =
                    job._id ||
                    job.job_id ||
                    job.id;

                  const isSaved =
                    savedJobs.includes(
                      jobId
                    );

                  const skills =
                    Array.isArray(
                      job.skills
                    )
                      ? job.skills
                      : [];

                  return (
                    <motion.article
                      key={
                        jobId ||
                        index
                      }
                      initial={{
                        opacity: 0,
                        y: 15,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay:
                          index * 0.04,
                        duration: 0.35,
                      }}
                      whileHover={{
                        y: -5,
                      }}
                      className="group bg-white rounded-2xl border border-[#101828]/10 shadow-sm hover:shadow-xl hover:border-[#BFE5DB] transition-all duration-300 overflow-hidden"
                    >

                      {/* TOP ACCENT */}

                      <div className="h-1 bg-gradient-to-r from-[#0F766E] via-[#3B82F6] to-transparent" />

                      <div className="p-5">

                        {/* COMPANY */}

                        <div className="flex items-start justify-between gap-3">

                          <div className="flex items-center gap-3 min-w-0">

                            <div className="w-12 h-12 rounded-xl bg-[#F2F4F7] flex items-center justify-center overflow-hidden shrink-0">

                              {job.company_logo ? (

                                <img
                                  src={
                                    job.company_logo
                                  }
                                  alt={
                                    job.company_name ||
                                    "Company"
                                  }
                                  className="w-full h-full object-cover"
                                />

                              ) : (

                                <Building2
                                  size={22}
                                  className="text-[#667085]"
                                />

                              )}

                            </div>

                            <div className="min-w-0">

                              <p className="text-xs font-medium text-[#667085] truncate">

                                {job.company_name ||
                                  "Company"}

                              </p>

                              <h3 className="font-semibold text-[#101828] mt-0.5 truncate">

                                {job.title ||
                                  "Untitled Position"}

                              </h3>

                            </div>

                          </div>

                          <button
                            onClick={(
                              event
                            ) =>
                              toggleSaveJob(
                                event,
                                jobId
                              )
                            }
                            className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition ${
                              isSaved
                                ? "bg-[#EAF5F1] text-[#0F766E]"
                                : "bg-[#F7F5EF] text-[#98A2B3] hover:text-[#0F766E]"
                            }`}
                          >

                            <Bookmark
                              size={16}
                              fill={
                                isSaved
                                  ? "currentColor"
                                  : "none"
                              }
                            />

                          </button>

                        </div>

                        {/* META */}

                        <div className="grid grid-cols-2 gap-2 mt-5">

                          <div className="flex items-center gap-2 text-xs text-[#667085]">

                            <MapPin
                              size={14}
                              className="text-[#0F766E]"
                            />

                            <span className="truncate">

                              {job.location ||
                                "Location not specified"}

                            </span>

                          </div>

                          <div className="flex items-center gap-2 text-xs text-[#667085]">

                            <Briefcase
                              size={14}
                              className="text-[#0F766E]"
                            />

                            <span className="truncate">

                              {job.employment_type ||
                                "Full Time"}

                            </span>

                          </div>

                          <div className="flex items-center gap-2 text-xs text-[#667085]">

                            <GraduationCap
                              size={14}
                              className="text-[#0F766E]"
                            />

                            <span className="truncate">

                              {job.experience_required ||
                                "Experience not specified"}

                            </span>

                          </div>

                          <div className="flex items-center gap-2 text-xs text-[#667085]">

                            <IndianRupee
                              size={14}
                              className="text-[#0F766E]"
                            />

                            <span className="truncate">

                              {job.salary ||
                                "Not disclosed"}

                            </span>

                          </div>

                        </div>

                        {/* DEPARTMENT */}

                        {job.department && (
                          <div className="flex items-center gap-2 mt-4 text-xs text-[#667085]">

                            <Layers3
                              size={14}
                              className="text-[#98A2B3]"
                            />

                            {job.department}

                          </div>
                        )}

                        {/* SKILLS */}

                        <div className="mt-5">

                          <div className="flex items-center justify-between mb-2">

                            <span className="text-[10px] uppercase tracking-wider font-semibold text-[#98A2B3]">

                              Skills

                            </span>

                            {skills.length >
                              4 && (
                              <span className="text-[10px] text-[#98A2B3]">

                                +
                                {skills.length -
                                  4}{" "}
                                more

                              </span>
                            )}

                          </div>

                          <div className="flex flex-wrap gap-1.5">

                            {skills
                              .slice(
                                0,
                                4
                              )
                              .map(
                                (
                                  skill,
                                  skillIndex
                                ) => (
                                  <span
                                    key={
                                      skillIndex
                                    }
                                    className="px-2.5 py-1.5 bg-[#F7F5EF] border border-[#EAECF0] rounded-lg text-[11px] font-medium text-[#667085]"
                                  >
                                    {skill}
                                  </span>
                                )
                              )}

                            {skills.length ===
                              0 && (
                              <span className="text-xs text-[#98A2B3]">

                                Skills not specified

                              </span>
                            )}

                          </div>

                        </div>

                        {/* FOOTER */}

                        <div className="flex items-center justify-between mt-5 pt-4 border-t border-[#EAECF0]">

                          <div className="flex items-center gap-1.5 text-[11px] text-[#98A2B3]">

                            <CalendarDays
                              size={13}
                            />

                            {formatDate(
                              job.created_at
                            )}

                          </div>

                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F766E]">

                            <CheckCircle2
                              size={13}
                            />

                            Open position

                          </span>

                        </div>

                        {/* ACTION */}

                        <button
                          onClick={() =>
                            navigate(
                              `/jobs/${jobId}`
                            )
                          }
                          className="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-xl text-sm font-semibold transition-all duration-300"
                        >

                          <Eye
                            size={16}
                          />

                          View Job Details

                          <ArrowRight
                            size={15}
                            className="group-hover:translate-x-1 transition-transform"
                          />

                        </button>

                      </div>

                    </motion.article>
                  );
                }
              )}

            </div>
          )}

          {/* =================================================
              AI CTA
          ================================================= */}

          {safeJobs.length > 0 && (
            <motion.section
              initial={{
                opacity: 0,
                y: 15,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              className="relative overflow-hidden bg-[#EAF5F1] border border-[#BFE5DB] rounded-3xl mt-8 p-6 md:p-8"
            >

              <div className="absolute right-[-60px] top-[-80px] w-60 h-60 rounded-full bg-[#0F766E]/10 blur-3xl" />

              <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">

                <div className="flex items-start gap-4">

                  <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0">

                    <Sparkles
                      size={19}
                      className="text-[#0F766E]"
                    />

                  </div>

                  <div>

                    <h3 className="font-semibold text-[#101828]">

                      Want jobs matched specifically to you?

                    </h3>

                    <p className="text-sm text-[#667085] mt-1 max-w-xl">

                      Let Recruit_Ai compare your resume and
                      profile against available roles to find
                      your strongest opportunities.

                    </p>

                  </div>

                </div>

                <button
                  onClick={() =>
                    navigate(
                      "/recommended-jobs"
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 px-5 py-3 bg-[#101828] hover:bg-[#0F766E] text-white rounded-xl text-sm font-semibold transition shrink-0"
                >

                  <Sparkles size={15} />

                  Get AI Recommendations

                  <ArrowRight
                    size={15}
                  />

                </button>

              </div>

            </motion.section>
          )}

          {/* =================================================
              FOOTER
          ================================================= */}

          <footer className="flex flex-col sm:flex-row items-center justify-between gap-3 py-8 text-xs text-[#98A2B3]">

            <span>

              Recruit_Ai Job Marketplace

            </span>

            <span className="flex items-center gap-2">

              <span className="w-1.5 h-1.5 rounded-full bg-[#0F766E]" />

              Discover • Apply • Grow

            </span>

          </footer>

        </div>
      </main>
    </div>
  );
}

export default AvailableJobs;