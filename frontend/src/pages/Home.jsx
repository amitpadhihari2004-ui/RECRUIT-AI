
import { Link } from "react-router-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import { useState } from "react";

import {
  ArrowRight,
  ArrowUpRight,
  BarChart3,
  Brain,
  BriefcaseBusiness,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileText,
  Globe2,
  Lock,
  Mail,
  Menu,
  Mic2,
  Search,
  ShieldCheck,
  Sparkles,
  Target,
  TrendingUp,
  UserCheck,
  Users,
  X,
  Building2,
  GraduationCap,
  Eye,
  Play,
  Layers3,
  Clock3,
} from "lucide-react";

export default function Home() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState(null);

  const { scrollYProgress } = useScroll();

  const heroImageY = useTransform(scrollYProgress, [0, 0.35], [0, -80]);

  const services = [
    {
      icon: FileText,
      number: "01",
      title: "Resume Intelligence",
      desc: "Turn resumes into structured candidate insights with automated skill and experience analysis.",
    },
    {
      icon: Target,
      number: "02",
      title: "Smart Job Matching",
      desc: "Discover relevant opportunities by comparing candidate capabilities with job requirements.",
    },
    {
      icon: Mic2,
      number: "03",
      title: "AI Interviews",
      desc: "Conduct structured interviews with questions adapted to the candidate and role.",
    },
    {
      icon: BarChart3,
      number: "04",
      title: "Hiring Analytics",
      desc: "Understand your recruitment funnel with clear data, reports and candidate insights.",
    },
  ];

  const stats = [
    {
      number: "15K+",
      label: "Students",
    },
    {
      number: "500+",
      label: "Organizations",
    },
    {
      number: "25K+",
      label: "Resumes Analysed",
    },
    {
      number: "6K+",
      label: "AI Interviews",
    },
  ];

  const process = [
    {
      number: "01",
      title: "Build your profile",
      desc: "Create your candidate or organization profile.",
    },
    {
      number: "02",
      title: "Discover & match",
      desc: "Find opportunities or candidates that fit.",
    },
    {
      number: "03",
      title: "Evaluate",
      desc: "Analyse resumes and conduct structured interviews.",
    },
    {
      number: "04",
      title: "Make decisions",
      desc: "Use recruitment insights to move forward confidently.",
    },
  ];

  const updates = [
    {
      date: "11 AUG",
      tag: "PLATFORM",
      title: "New recruitment opportunities are available",
    },
    {
      date: "08 AUG",
      tag: "INTERVIEWS",
      title: "AI interview experience has been improved",
    },
    {
      date: "05 AUG",
      tag: "ORGANIZATIONS",
      title: "New candidate management features released",
    },
  ];

  const faqs = [
    {
      q: "What is Recruit_Ai?",
      a: "Recruit_Ai is a recruitment technology platform that helps students and organizations manage the hiring journey through resume analysis, job matching, interviews and analytics.",
    },
    {
      q: "Who can use Recruit_Ai?",
      a: "Students can discover opportunities, manage resumes and participate in assessments. Organizations can create jobs, review candidates and manage recruitment.",
    },
    {
      q: "How does resume analysis work?",
      a: "Recruit_Ai analyses resume information and produces structured insights about skills, education, experience and relevance to a job.",
    },
    {
      q: "Can organizations create jobs?",
      a: "Yes. Organizations can create job postings, review applications and evaluate candidates through the organization portal.",
    },
    {
      q: "Are interviews AI assisted?",
      a: "Yes. Recruit_Ai can generate structured interview questions based on candidate and job information.",
    },
  ];

  const reveal = {
    hidden: {
      opacity: 0,
      y: 35,
    },
    show: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        ease: [0.22, 1, 0.36, 1],
      },
    },
  };

  const stagger = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.09,
      },
    },
  };

  return (
    <div className="min-h-screen bg-[#F7F5EF] text-[#101828] overflow-x-hidden">

      {/* =========================================================
          SCROLL PROGRESS
      ========================================================= */}

      <motion.div
        style={{ scaleX: scrollYProgress }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-[#0F766E] origin-left z-[100]"
      />


      {/* =========================================================
          TOP BAR
      ========================================================= */}

      <div className="bg-[#101828] text-white">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 h-9 flex items-center justify-between text-[11px]">

          <div className="flex items-center gap-2 text-[#DDF5EF]">
            <span className="w-1.5 h-1.5 rounded-full bg-[#E87961] animate-pulse" />

            Recruitment & Employment Platform
          </div>

          <div className="hidden sm:flex items-center gap-5 text-white/60">
            <span>Accessibility</span>
            <span>Help</span>
            <span>English</span>
          </div>

        </div>

      </div>


      {/* =========================================================
          NAVBAR
      ========================================================= */}

      <header className="sticky top-0 z-50 bg-[#F7F5EF]/90 backdrop-blur-xl border-b border-[#101828]/10">

        <div className="max-w-7xl mx-auto px-5 lg:px-8">

          <div className="h-[76px] flex items-center justify-between">

            <Link
              to="/"
              className="flex items-center gap-3 group"
            >

              <motion.div
                whileHover={{
                  rotate: -5,
                  scale: 1.05,
                }}
                className="relative w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center overflow-hidden"
              >
                <Brain size={21} />

                <motion.div
                  animate={{
                    x: [-30, 30],
                  }}
                  transition={{
                    duration: 2.5,
                    repeat: Infinity,
                    repeatType: "reverse",
                  }}
                  className="absolute inset-y-0 w-4 bg-white/20 blur-md"
                />

              </motion.div>

              <div>

                <div className="font-bold text-xl tracking-tight">
                  Recruit<span className="text-[#0F766E]">_Ai</span>
                </div>

                <div className="text-[9px] uppercase tracking-[0.2em] text-[#667085]">
                  Recruitment Platform
                </div>

              </div>

            </Link>


            <nav className="hidden lg:flex items-center gap-8">

              {[
                ["Home", "#home"],
                ["Services", "#services"],
                ["Process", "#process"],
                ["Updates", "#updates"],
                ["About", "#about"],
              ].map(([label, href]) => (

                <a
                  key={label}
                  href={href}
                  className="relative text-sm text-[#475467] hover:text-[#0F766E] transition-colors group"
                >

                  {label}

                  <span className="absolute -bottom-2 left-0 w-0 h-[2px] bg-[#0F766E] group-hover:w-full transition-all duration-300" />

                </a>

              ))}

            </nav>


            <div className="hidden lg:flex items-center gap-3">

              <Link
                to="/login"
                className="px-4 py-2 text-sm font-medium text-[#475467] hover:text-[#101828] transition"
              >
                Login
              </Link>

              <Link
                to="/signup"
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#101828] text-white text-sm font-semibold hover:bg-[#0F766E] transition-all duration-300"
              >
                Get Started

                <ArrowRight
                  size={15}
                  className="group-hover:translate-x-1 transition-transform"
                />

              </Link>

            </div>


            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden w-10 h-10 rounded-xl border border-[#101828]/10 flex items-center justify-center"
            >

              {mobileMenuOpen ? (
                <X size={21} />
              ) : (
                <Menu size={21} />
              )}

            </button>

          </div>

        </div>


        {mobileMenuOpen && (

          <motion.div
            initial={{
              opacity: 0,
              height: 0,
            }}
            animate={{
              opacity: 1,
              height: "auto",
            }}
            className="lg:hidden bg-white border-t border-[#101828]/10"
          >

            <div className="p-5 space-y-2">

              {[
                ["Home", "#home"],
                ["Services", "#services"],
                ["Process", "#process"],
                ["Updates", "#updates"],
                ["About", "#about"],
              ].map(([label, href]) => (

                <a
                  key={label}
                  href={href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="block py-3 border-b border-[#101828]/5 text-sm"
                >
                  {label}
                </a>

              ))}

              <div className="flex gap-3 pt-4">

                <Link
                  to="/login"
                  className="flex-1 text-center border border-[#101828]/15 rounded-xl py-3 text-sm"
                >
                  Login
                </Link>

                <Link
                  to="/signup"
                  className="flex-1 text-center bg-[#101828] text-white rounded-xl py-3 text-sm"
                >
                  Get Started
                </Link>

              </div>

            </div>

          </motion.div>

        )}

      </header>


      {/* =========================================================
          HERO
      ========================================================= */}

      <section
        id="home"
        className="relative min-h-[720px] flex items-center overflow-hidden"
      >

        {/* Decorative background */}

        <div className="absolute inset-0 pointer-events-none">

          <div
            className="absolute -top-32 -right-20 w-[500px] h-[500px] rounded-full bg-[#DDF5EF] blur-3xl opacity-70"
          />

          <div
            className="absolute bottom-0 -left-32 w-[400px] h-[400px] rounded-full bg-[#F6D8D0] blur-3xl opacity-40"
          />

          <div
            className="absolute inset-0 opacity-[0.035]"
            style={{
              backgroundImage:
                "linear-gradient(#101828 1px, transparent 1px), linear-gradient(90deg, #101828 1px, transparent 1px)",
              backgroundSize: "45px 45px",
            }}
          />

        </div>


        <div className="max-w-7xl mx-auto px-5 lg:px-8 w-full relative z-10">

          <div className="grid lg:grid-cols-[0.9fr_1.1fr] gap-12 items-center py-20 lg:py-24">


            {/* HERO COPY */}

            <motion.div
              variants={stagger}
              initial="hidden"
              animate="show"
              className="relative z-20"
            >

              <motion.div
                variants={reveal}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-full bg-white border border-[#101828]/10 shadow-sm text-xs font-medium"
              >

                <span className="w-2 h-2 rounded-full bg-[#0F766E] animate-pulse" />

                Intelligent Recruitment Platform

                <Sparkles
                  size={13}
                  className="text-[#E87961]"
                />

              </motion.div>


              <motion.h1
                variants={reveal}
                className="mt-7 text-5xl sm:text-6xl lg:text-[70px] leading-[0.98] tracking-[-0.055em] font-semibold"
              >

                Better hiring
                <br />

                <span className="text-[#0F766E]">
                  starts with
                </span>

                <br />

                better decisions.

              </motion.h1>


              <motion.p
                variants={reveal}
                className="mt-7 max-w-xl text-lg leading-8 text-[#667085]"
              >
                Recruit_Ai connects candidates and organizations through
                intelligent resume analysis, job matching, structured
                interviews and recruitment analytics.
              </motion.p>


              <motion.div
                variants={reveal}
                className="flex flex-wrap gap-3 mt-8"
              >

                <Link
                  to="/signup"
                  className="group relative overflow-hidden flex items-center gap-3 bg-[#101828] text-white px-6 py-3.5 rounded-xl font-semibold text-sm"
                >

                  <span className="relative z-10">
                    Find Opportunities
                  </span>

                  <ArrowRight
                    size={17}
                    className="relative z-10 group-hover:translate-x-1 transition-transform"
                  />

                  <span className="absolute inset-0 bg-[#0F766E] translate-y-full group-hover:translate-y-0 transition-transform duration-300" />

                </Link>


                <Link
                  to="/organization/signup"
                  className="group flex items-center gap-3 bg-white border border-[#101828]/15 px-6 py-3.5 rounded-xl font-semibold text-sm hover:border-[#0F766E] hover:text-[#0F766E] transition-all"
                >

                  Recruit Talent

                  <ArrowUpRight
                    size={17}
                    className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform"
                  />

                </Link>

              </motion.div>


              <motion.div
                variants={reveal}
                className="flex flex-wrap items-center gap-6 mt-8 text-xs text-[#667085]"
              >

                <div className="flex items-center gap-2">
                  <ShieldCheck size={15} className="text-[#0F766E]" />
                  Secure platform
                </div>

                <div className="flex items-center gap-2">
                  <Globe2 size={15} className="text-[#0F766E]" />
                  Accessible anywhere
                </div>

                <div className="flex items-center gap-2">
                  <Lock size={15} className="text-[#0F766E]" />
                  Protected data
                </div>

              </motion.div>

            </motion.div>


            {/* HERO IMAGE */}

            <motion.div
              initial={{
                opacity: 0,
                x: 40,
              }}
              animate={{
                opacity: 1,
                x: 0,
              }}
              transition={{
                duration: 0.9,
                delay: 0.2,
              }}
              className="relative"
            >

              <motion.div
                style={{ y: heroImageY }}
                className="relative"
              >

                <div className="relative rounded-[28px] overflow-hidden shadow-2xl shadow-[#101828]/15">

                  <motion.img
                    initial={{
                      scale: 1.12,
                    }}
                    animate={{
                      scale: 1,
                    }}
                    transition={{
                      duration: 1.5,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    src="https://images.unsplash.com/photo-1551836022-d5d88e9218df?auto=format&fit=crop&w=1500&q=90"
                    alt="Professionals working together"
                    className="w-full h-[500px] lg:h-[610px] object-cover"
                  />

                  <div className="absolute inset-0 bg-gradient-to-t from-[#101828]/40 via-transparent to-transparent" />

                </div>


                {/* Floating status card */}

                <motion.div
                  animate={{
                    y: [0, -9, 0],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -left-6 bottom-10 hidden sm:block"
                >

                  <div className="bg-white rounded-2xl shadow-xl p-4 border border-[#101828]/5">

                    <div className="flex items-center gap-3">

                      <div className="w-11 h-11 rounded-xl bg-[#DDF5EF] flex items-center justify-center">
                        <UserCheck
                          size={21}
                          className="text-[#0F766E]"
                        />
                      </div>

                      <div>

                        <div className="text-xs text-[#667085]">
                          Candidate match
                        </div>

                        <div className="font-bold text-lg">
                          92%
                        </div>

                      </div>

                    </div>

                  </div>

                </motion.div>


                {/* Floating recruitment card */}

                <motion.div
                  animate={{
                    y: [0, 8, 0],
                  }}
                  transition={{
                    duration: 4.5,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute -right-5 top-14 hidden md:block"
                >

                  <div className="bg-[#101828] text-white rounded-2xl shadow-xl px-5 py-4">

                    <div className="flex items-center gap-3">

                      <div className="w-9 h-9 rounded-lg bg-[#0F766E] flex items-center justify-center">
                        <BriefcaseBusiness size={17} />
                      </div>

                      <div>

                        <div className="text-[10px] text-white/50">
                          Active opportunities
                        </div>

                        <div className="font-semibold">
                          1,284+
                        </div>

                      </div>

                    </div>

                  </div>

                </motion.div>


                {/* Small coral accent */}

                <motion.div
                  animate={{
                    rotate: [0, 8, -8, 0],
                  }}
                  transition={{
                    duration: 6,
                    repeat: Infinity,
                  }}
                  className="absolute -top-5 -left-5 w-16 h-16 rounded-2xl bg-[#E87961] hidden sm:block"
                />

              </motion.div>

            </motion.div>

          </div>

        </div>

      </section>


      {/* =========================================================
          TRUST STRIP
      ========================================================= */}

      <section className="border-y border-[#101828]/10 bg-white">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-5">

          <div className="flex flex-wrap items-center justify-between gap-5">

            <div className="text-xs font-semibold uppercase tracking-[0.18em] text-[#98A2B3]">
              Built for modern recruitment
            </div>

            <div className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-[#667085]">

              <span className="flex items-center gap-2">
                <GraduationCap size={16} />
                Students
              </span>

              <span className="flex items-center gap-2">
                <Building2 size={16} />
                Organizations
              </span>

              <span className="flex items-center gap-2">
                <Users size={16} />
                Recruiters
              </span>

              <span className="flex items-center gap-2">
                <Globe2 size={16} />
                Global access
              </span>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          SERVICES
      ========================================================= */}

      <section
        id="services"
        className="py-24 lg:py-32"
      >

        <div className="max-w-7xl mx-auto px-5 lg:px-8">

          <motion.div
            variants={stagger}
            initial="hidden"
            whileInView="show"
            viewport={{
              once: true,
              amount: 0.2,
            }}
            className="max-w-3xl"
          >

            <motion.div
              variants={reveal}
              className="flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-[#0F766E]"
            >

              <span className="w-8 h-[2px] bg-[#0F766E]" />

              Our Services

            </motion.div>


            <motion.h2
              variants={reveal}
              className="mt-5 text-4xl lg:text-6xl tracking-[-0.05em] font-semibold"
            >

              One platform.
              <br />

              <span className="text-[#98A2B3]">
                Complete recruitment workflow.
              </span>

            </motion.h2>

          </motion.div>


          <div className="grid md:grid-cols-2 lg:grid-cols-4 mt-16 gap-4">

            {services.map((service, index) => {

              const Icon = service.icon;

              return (

                <motion.div
                  key={service.number}
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  whileInView={{
                    opacity: 1,
                    y: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.6,
                    delay: index * 0.08,
                  }}
                  whileHover={{
                    y: -8,
                  }}
                  className="group bg-white rounded-2xl border border-[#101828]/10 p-7 shadow-sm hover:shadow-xl hover:shadow-[#101828]/8 transition-shadow duration-500"
                >

                  <div className="flex items-center justify-between">

                    <div className="w-11 h-11 rounded-xl bg-[#DDF5EF] text-[#0F766E] flex items-center justify-center group-hover:bg-[#0F766E] group-hover:text-white transition-colors duration-300">

                      <Icon size={20} />

                    </div>

                    <span className="text-xs font-bold text-[#98A2B3]">
                      {service.number}
                    </span>

                  </div>


                  <h3 className="mt-12 text-xl font-semibold">
                    {service.title}
                  </h3>

                  <p className="mt-3 text-sm leading-6 text-[#667085]">
                    {service.desc}
                  </p>


                  <div className="mt-7 flex items-center gap-2 text-xs font-semibold text-[#0F766E] opacity-0 group-hover:opacity-100 transition-opacity">

                    Explore service
                    <ArrowRight size={14} />

                  </div>

                </motion.div>

              );

            })}

          </div>

        </div>

      </section>


      {/* =========================================================
          STATS
      ========================================================= */}

      <section className="py-20 bg-[#101828] text-white overflow-hidden">

        <div className="max-w-7xl mx-auto px-5 lg:px-8">

          <div className="grid lg:grid-cols-[0.8fr_1.2fr] gap-14 items-center">

            <div>

              <div className="flex items-center gap-3 text-xs uppercase tracking-[0.2em] text-[#DDF5EF]">

                <span className="w-7 h-[2px] bg-[#E87961]" />

                At a glance

              </div>

              <h2 className="mt-5 text-4xl lg:text-5xl font-semibold tracking-[-0.045em]">
                Growing a smarter
                <br />
                recruitment ecosystem.
              </h2>

              <p className="mt-5 text-[#98A2B3] leading-7 max-w-md">
                Recruit_Ai brings candidates and organizations
                together through a connected recruitment workflow.
              </p>

            </div>


            <div className="grid grid-cols-2 gap-3">

              {stats.map((stat, index) => (

                <motion.div
                  key={stat.label}
                  initial={{
                    opacity: 0,
                    scale: 0.95,
                  }}
                  whileInView={{
                    opacity: 1,
                    scale: 1,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.5,
                    delay: index * 0.1,
                  }}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 lg:p-8 hover:bg-[#0F766E]/20 transition-colors duration-500"
                >

                  <div className="text-4xl lg:text-5xl font-semibold">
                    {stat.number}
                  </div>

                  <div className="mt-2 text-sm text-[#98A2B3]">
                    {stat.label}
                  </div>

                </motion.div>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          STUDENT / ORGANIZATION
      ========================================================= */}

      <section
        id="about"
        className="py-24 lg:py-32"
      >

        <div className="max-w-7xl mx-auto px-5 lg:px-8">

          <div className="grid lg:grid-cols-2 gap-6">


            {/* STUDENTS */}

            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.7,
              }}
              className="group relative min-h-[580px] rounded-[28px] overflow-hidden"
            >

              <motion.img
                whileHover={{
                  scale: 1.04,
                }}
                transition={{
                  duration: 0.8,
                }}
                src="https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1300&q=90"
                alt="Students collaborating"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#101828]/90 via-[#101828]/20 to-transparent" />

              <div className="relative h-full min-h-[580px] p-8 lg:p-10 flex flex-col justify-end text-white">

                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-auto">
                  <GraduationCap size={23} />
                </div>

                <div>

                  <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                    For Students
                  </div>

                  <h2 className="text-4xl font-semibold tracking-[-0.04em] mt-3">
                    Turn skills into
                    <br />
                    opportunities.
                  </h2>

                  <p className="mt-4 text-white/70 leading-7 max-w-md">
                    Analyse your resume, discover relevant jobs,
                    prepare for interviews and track applications.
                  </p>

                  <Link
                    to="/signup"
                    className="inline-flex items-center gap-2 mt-7 px-5 py-3 bg-white text-[#101828] rounded-xl text-sm font-semibold group-hover:bg-[#DDF5EF] transition-colors"
                  >
                    Student Portal
                    <ArrowRight size={15} />
                  </Link>

                </div>

              </div>

            </motion.div>


            {/* ORGANIZATIONS */}

            <motion.div
              initial={{
                opacity: 0,
                y: 30,
              }}
              whileInView={{
                opacity: 1,
                y: 0,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.7,
                delay: 0.1,
              }}
              className="group relative min-h-[580px] rounded-[28px] overflow-hidden"
            >

              <motion.img
                whileHover={{
                  scale: 1.04,
                }}
                transition={{
                  duration: 0.8,
                }}
                src="https://images.unsplash.com/photo-1556761175-5973dc0f32e7?auto=format&fit=crop&w=1300&q=90"
                alt="Recruitment professionals"
                className="absolute inset-0 w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-[#101828]/90 via-[#101828]/20 to-transparent" />

              <div className="relative h-full min-h-[580px] p-8 lg:p-10 flex flex-col justify-end text-white">

                <div className="w-12 h-12 rounded-xl bg-white/15 backdrop-blur-md flex items-center justify-center mb-auto">
                  <Building2 size={23} />
                </div>

                <div>

                  <div className="text-xs uppercase tracking-[0.2em] text-white/60">
                    For Organizations
                  </div>

                  <h2 className="text-4xl font-semibold tracking-[-0.04em] mt-3">
                    Build better
                    <br />
                    teams faster.
                  </h2>

                  <p className="mt-4 text-white/70 leading-7 max-w-md">
                    Create jobs, evaluate candidates, manage
                    applications and understand your hiring funnel.
                  </p>

                  <Link
                    to="/organization/signup"
                    className="inline-flex items-center gap-2 mt-7 px-5 py-3 bg-[#0F766E] text-white rounded-xl text-sm font-semibold hover:bg-[#0B625B] transition-colors"
                  >
                    Organization Portal
                    <ArrowRight size={15} />
                  </Link>

                </div>

              </div>

            </motion.div>

          </div>

        </div>

      </section>


      {/* =========================================================
          PROCESS
      ========================================================= */}

      <section
        id="process"
        className="py-24 lg:py-32 bg-[#EAF5F1]"
      >

        <div className="max-w-7xl mx-auto px-5 lg:px-8">

          <div className="grid lg:grid-cols-[0.7fr_1.3fr] gap-14">

            <div>

              <div className="text-xs uppercase tracking-[0.2em] font-semibold text-[#0F766E]">
                How it works
              </div>

              <h2 className="mt-5 text-4xl lg:text-5xl font-semibold tracking-[-0.045em]">
                From profile
                <br />
                to opportunity.
              </h2>

              <p className="mt-5 text-[#667085] leading-7">
                A simple workflow designed to remove friction
                from the recruitment journey.
              </p>


              <div className="mt-8 inline-flex items-center gap-3 text-sm font-semibold text-[#0F766E]">

                <Play size={16} fill="currentColor" />

                Simple. Structured. Intelligent.

              </div>

            </div>


            <div className="space-y-3">

              {process.map((item, index) => (

                <motion.div
                  key={item.number}
                  initial={{
                    opacity: 0,
                    x: 25,
                  }}
                  whileInView={{
                    opacity: 1,
                    x: 0,
                  }}
                  viewport={{
                    once: true,
                  }}
                  transition={{
                    duration: 0.55,
                    delay: index * 0.1,
                  }}
                  whileHover={{
                    x: 6,
                  }}
                  className="bg-white rounded-2xl p-6 lg:p-7 flex gap-6 items-start shadow-sm hover:shadow-md transition-shadow"
                >

                  <div className="w-12 h-12 shrink-0 rounded-xl bg-[#101828] text-white flex items-center justify-center font-semibold text-sm">
                    {item.number}
                  </div>

                  <div>

                    <h3 className="text-lg font-semibold">
                      {item.title}
                    </h3>

                    <p className="mt-2 text-sm text-[#667085] leading-6">
                      {item.desc}
                    </p>

                  </div>

                  <ArrowRight
                    size={17}
                    className="ml-auto shrink-0 text-[#98A2B3]"
                  />

                </motion.div>

              ))}

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          IMAGE STORY
      ========================================================= */}

      <section className="py-24 lg:py-32">

        <div className="max-w-7xl mx-auto px-5 lg:px-8">

          <div className="grid grid-cols-12 gap-4 h-[420px] lg:h-[600px]">

            <motion.div
              initial={{
                opacity: 0,
                scale: 0.97,
              }}
              whileInView={{
                opacity: 1,
                scale: 1,
              }}
              viewport={{
                once: true,
              }}
              transition={{
                duration: 0.8,
              }}
              className="col-span-7 overflow-hidden rounded-[24px]"
            >

              <motion.img
                whileHover={{
                  scale: 1.04,
                }}
                transition={{
                  duration: 1,
                }}
                src="https://images.unsplash.com/photo-1552664730-d307ca884978?auto=format&fit=crop&w=1500&q=90"
                alt="Recruitment team discussion"
                className="w-full h-full object-cover"
              />

            </motion.div>


            <div className="col-span-5 grid grid-rows-2 gap-4">

              <motion.div
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.7,
                }}
                className="overflow-hidden rounded-[24px]"
              >

                <motion.img
                  whileHover={{
                    scale: 1.05,
                  }}
                  src="https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1000&q=90"
                  alt="Professional team"
                  className="w-full h-full object-cover"
                />

              </motion.div>


              <motion.div
                initial={{
                  opacity: 0,
                  y: 25,
                }}
                whileInView={{
                  opacity: 1,
                  y: 0,
                }}
                viewport={{
                  once: true,
                }}
                transition={{
                  duration: 0.7,
                  delay: 0.15,
                }}
                className="overflow-hidden rounded-[24px]"
              >

                <motion.img
                  whileHover={{
                    scale: 1.05,
                  }}
                  src="https://images.unsplash.com/photo-1524758631624-e2822e304c36?auto=format&fit=crop&w=1000&q=90"
                  alt="Modern workplace"
                  className="w-full h-full object-cover"
                />

              </motion.div>

            </div>

          </div>

        </div>

      </section>


      {/* =========================================================
          UPDATES
      ========================================================= */}

      <section
        id="updates"
        className="py-24 lg:py-32 bg-white"
      >

        <div className="max-w-7xl mx-auto px-5 lg:px-8">

          <div className="flex flex-col md:flex-row md:items-end justify-between gap-5 mb-12">

            <div>

              <div className="text-xs uppercase tracking-[0.2em] text-[#0F766E] font-semibold">
                Latest updates
              </div>

              <h2 className="mt-4 text-4xl lg:text-5xl font-semibold tracking-[-0.045em]">
                What's happening.
              </h2>

            </div>

            <button className="flex items-center gap-2 text-sm font-semibold hover:text-[#0F766E] transition">
              View all
              <ArrowRight size={15} />
            </button>

          </div>


          <div className="divide-y divide-[#101828]/10 border-y border-[#101828]/10">

            {updates.map((update, index) => (

              <motion.div
                key={update.title}
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
                transition={{
                  delay: index * 0.08,
                }}
                className="py-7 grid md:grid-cols-[100px_130px_1fr_30px] gap-5 items-center group"
              >

                <div className="text-sm font-semibold">
                  {update.date}
                </div>

                <div className="text-[10px] tracking-[0.18em] font-bold text-[#0F766E]">
                  {update.tag}
                </div>

                <div className="font-medium group-hover:text-[#0F766E] transition-colors">
                  {update.title}
                </div>

                <ArrowUpRight
                  size={17}
                  className="text-[#98A2B3] group-hover:text-[#0F766E] group-hover:translate-x-1 group-hover:-translate-y-1 transition-all"
                />

              </motion.div>

            ))}

          </div>

        </div>

      </section>


      {/* =========================================================
          FAQ
      ========================================================= */}

      <section className="py-24 lg:py-32 bg-[#F7F5EF]">

        <div className="max-w-4xl mx-auto px-5 lg:px-8">

          <div className="text-center mb-14">

            <div className="text-xs uppercase tracking-[0.2em] text-[#0F766E] font-semibold">
              FAQ
            </div>

            <h2 className="mt-4 text-4xl lg:text-5xl font-semibold tracking-[-0.045em]">
              Questions, answered.
            </h2>

          </div>


          <div className="border-t border-[#101828]/10">

            {faqs.map((faq, index) => {

              const open = openFaq === index;

              return (

                <div
                  key={faq.q}
                  className="border-b border-[#101828]/10"
                >

                  <button
                    onClick={() =>
                      setOpenFaq(open ? null : index)
                    }
                    className="w-full py-6 flex items-center justify-between text-left gap-5"
                  >

                    <span className="font-semibold">
                      {faq.q}
                    </span>

                    <motion.div
                      animate={{
                        rotate: open ? 180 : 0,
                      }}
                    >
                      <ChevronDown size={18} />
                    </motion.div>

                  </button>


                  <motion.div
                    initial={false}
                    animate={{
                      height: open ? "auto" : 0,
                      opacity: open ? 1 : 0,
                    }}
                    className="overflow-hidden"
                  >

                    <p className="pb-6 text-sm leading-7 text-[#667085] max-w-3xl">
                      {faq.a}
                    </p>

                  </motion.div>

                </div>

              );

            })}

          </div>

        </div>

      </section>


      {/* =========================================================
          CTA
      ========================================================= */}

      <section className="relative overflow-hidden bg-[#0F766E] text-white py-24 lg:py-32">

        <div className="absolute inset-0 pointer-events-none">

          <motion.div
            animate={{
              x: [0, 60, 0],
              y: [0, -30, 0],
            }}
            transition={{
              duration: 12,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -top-32 -right-20 w-[450px] h-[450px] rounded-full bg-white/10 blur-3xl"
          />

          <motion.div
            animate={{
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{
              duration: 10,
              repeat: Infinity,
              ease: "easeInOut",
            }}
            className="absolute -bottom-40 -left-20 w-[400px] h-[400px] rounded-full bg-[#E87961]/20 blur-3xl"
          />

        </div>


        <div className="relative max-w-5xl mx-auto px-5 lg:px-8 text-center">

          <motion.div
            variants={reveal}
            initial="hidden"
            whileInView="show"
            viewport={{
              once: true,
            }}
          >

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 border border-white/15 text-xs">
              <Sparkles size={13} />
              Start your journey
            </div>


            <h2 className="mt-7 text-4xl sm:text-5xl lg:text-6xl font-semibold tracking-[-0.05em]">
              The next opportunity
              <br />
              could start here.
            </h2>


            <p className="mt-6 max-w-xl mx-auto text-white/70 leading-7">
              Join a modern recruitment ecosystem designed
              to make hiring and job discovery simpler.
            </p>


            <div className="flex flex-wrap justify-center gap-3 mt-9">

              <Link
                to="/signup"
                className="group flex items-center gap-2 bg-white text-[#101828] px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-[#DDF5EF] transition"
              >
                Get Started
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-1 transition-transform"
                />
              </Link>

              <Link
                to="/organization/signup"
                className="flex items-center gap-2 border border-white/30 px-6 py-3.5 rounded-xl font-semibold text-sm hover:bg-white/10 transition"
              >
                For Organizations
                <Building2 size={16} />
              </Link>

            </div>

          </motion.div>

        </div>

      </section>


      {/* =========================================================
          FOOTER
      ========================================================= */}

      <footer className="bg-[#101828] text-white">

        <div className="max-w-7xl mx-auto px-5 lg:px-8 py-16">

          <div className="grid md:grid-cols-4 gap-12">

            <div className="md:col-span-2">

              <Link
                to="/"
                className="inline-flex items-center gap-3"
              >

                <div className="w-10 h-10 rounded-xl bg-[#0F766E] flex items-center justify-center">
                  <Brain size={20} />
                </div>

                <span className="text-xl font-bold">
                  Recruit_Ai
                </span>

              </Link>


              <p className="mt-5 max-w-md text-sm text-white/50 leading-7">
                Intelligent recruitment technology connecting
                candidates and organizations through a simpler,
                more structured hiring journey.
              </p>

            </div>


            <div>

              <h3 className="text-sm font-semibold">
                Platform
              </h3>

              <div className="mt-5 space-y-3 text-sm text-white/50">

                <Link
                  to="/student/dashboard"
                  className="block hover:text-white transition"
                >
                  Student Portal
                </Link>

                <Link
                  to="/organization/dashboard"
                  className="block hover:text-white transition"
                >
                  Organization Portal
                </Link>

                <a
                  href="#services"
                  className="block hover:text-white transition"
                >
                  Services
                </a>

                <a
                  href="#process"
                  className="block hover:text-white transition"
                >
                  How It Works
                </a>

              </div>

            </div>


            <div>

              <h3 className="text-sm font-semibold">
                Company
              </h3>

              <div className="mt-5 space-y-3 text-sm text-white/50">

                <a
                  href="#about"
                  className="block hover:text-white transition"
                >
                  About
                </a>

                <a
                  href="#updates"
                  className="block hover:text-white transition"
                >
                  Updates
                </a>

                <a
                  href="#contact"
                  className="block hover:text-white transition"
                >
                  Contact
                </a>

                <Link
                  to="/privacy"
                  className="block hover:text-white transition"
                >
                  Privacy
                </Link>

              </div>

            </div>

          </div>


          <div className="border-t border-white/10 mt-14 pt-7 flex flex-col sm:flex-row justify-between gap-4 text-xs text-white/40">

            <span>
              © 2026 Recruit_Ai. All rights reserved.
            </span>

            <div className="flex gap-5">

              <span>Secure Platform</span>
              <span>Accessibility</span>
              <span>English</span>

            </div>

          </div>

        </div>

      </footer>


      {/* =========================================================
          GLOBAL MICRO INTERACTION
      ========================================================= */}

      <style>{`

        html {
          scroll-behavior: smooth;
        }

        body {
          background: #F7F5EF;
        }

        ::selection {
          background: #0F766E;
          color: white;
        }

        * {
          scrollbar-width: thin;
          scrollbar-color: #0F766E #F7F5EF;
        }

      `}</style>

    </div>
  );
}
