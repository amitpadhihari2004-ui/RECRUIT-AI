import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Loader2,
  ArrowLeft,
  FileText,
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  Briefcase,
  Code2,
  Award,
  Globe,
  TrendingUp,
  AlertCircle,
  XCircle,
  Lightbulb,
  BarChart3,
  Download,
  Printer,
  Share2,
  Bookmark,
  CheckCircle2,
  Sparkles,
  Target,
  FileCheck,
  FileX,
  Calendar,
  Building2,
  School,
  Wrench,
  ExternalLink,
  Layers,
  Zap,
  MessageCircle
} from "lucide-react";
import toast from "react-hot-toast";
import { getResumeAnalysis } from "../api/resumeApi";

function ViewResumeAnalysis() {
  const { resume_id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [analysis, setAnalysis] = useState(null);

  useEffect(() => {
    loadAnalysis();
  }, [resume_id]);

  const loadAnalysis = async () => {
    try {
      const response = await getResumeAnalysis(resume_id);

      if (response.success && response.analysis) {
        setAnalysis(response.analysis);
      } else {
        setAnalysis(null);
        toast.error("No analysis found for this resume.");
      }
    } catch (error) {
      console.error(error);
      toast.error(
        error.response?.data?.detail ||
          error.response?.data?.message ||
          "Failed to load analysis."
      );
      setAnalysis(null);
    } finally {
      setLoading(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getScoreBg = (score) => {
    if (score >= 80) return "bg-green-50 border-green-200";
    if (score >= 60) return "bg-blue-50 border-blue-200";
    if (score >= 40) return "bg-yellow-50 border-yellow-200";
    return "bg-red-50 border-red-200";
  };

  const getScoreLabel = (score) => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Good";
    if (score >= 40) return "Average";
    return "Needs Improvement";
  };

  const getScoreEmoji = (score) => {
    if (score >= 80) return "🌟";
    if (score >= 60) return "👍";
    if (score >= 40) return "📈";
    return "💪";
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4 md:p-6 lg:p-10">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-8">
            <div className="h-10 w-10 bg-gray-200 rounded-lg animate-pulse"></div>
            <div>
              <div className="h-10 w-64 bg-gray-200 rounded-lg animate-pulse"></div>
              <div className="h-5 w-80 bg-gray-200 rounded-lg animate-pulse mt-2"></div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2">
              <div className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
            <div>
              <div className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
            </div>
          </div>
          
          <div className="h-32 bg-gray-200 rounded-2xl animate-pulse mb-8"></div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-48 bg-gray-200 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!analysis) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="text-center"
        >
          <div className="w-32 h-32 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <FileX className="w-16 h-16 text-red-500" />
          </div>
          <h2 className="text-3xl font-bold text-gray-700 mb-4">Analysis Not Found</h2>
          <p className="text-gray-500 text-lg mb-8 max-w-md">
            This resume hasn't been analyzed yet. Upload a resume and analyze it first.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => navigate("/resume-analysis")}
              className="px-6 py-3 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold rounded-xl transition"
            >
              Go Back
            </button>
            <button
              onClick={() => navigate("/resume-upload")}
              className="px-6 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition"
            >
              Upload Resume
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50 p-4 md:p-6 lg:p-10"
    >
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8"
        >
          <div className="flex items-center gap-4">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => navigate("/resume-analysis")}
              className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:bg-blue-50 group"
            >
              <ArrowLeft className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
            </motion.button>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent flex items-center gap-3">
                <Sparkles className="w-8 h-8 text-blue-600" />
                AI Resume Analysis Report
              </h1>
              <p className="text-gray-600 mt-1">
                Professional AI-powered ATS analysis of your uploaded resume.
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {[Download, Printer, Share2, Bookmark].map((Icon, index) => (
              <motion.button
                key={index}
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="p-2.5 bg-white rounded-xl shadow-md hover:shadow-lg transition-all duration-200 hover:bg-blue-50 group"
                onClick={() => toast.info("Feature coming soon!")}
              >
                <Icon className="w-5 h-5 text-gray-600 group-hover:text-blue-600" />
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Score Section */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className={`rounded-3xl shadow-xl p-8 mb-8 border-2 ${getScoreBg(analysis.resume_score ?? 0)} bg-white/80 backdrop-blur-sm`}
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <h2 className="text-2xl font-semibold text-gray-800 mb-2 flex items-center gap-2">
                <BarChart3 className="w-6 h-6 text-blue-600" />
                Resume Score
              </h2>
              <div className="flex items-end gap-4 flex-wrap">
                <motion.span
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3, duration: 0.5, type: "spring", stiffness: 200 }}
                  className={`text-7xl md:text-8xl font-bold ${getScoreColor(analysis.resume_score ?? 0)}`}
                >
                  {analysis.resume_score ?? 0}
                </motion.span>
                <span className="text-3xl text-gray-400">/ 100</span>
                <span className={`px-4 py-2 rounded-full text-sm font-semibold ${getScoreBg(analysis.resume_score ?? 0)} border`}>
                  {getScoreLabel(analysis.resume_score ?? 0)} {getScoreEmoji(analysis.resume_score ?? 0)}
                </span>
              </div>
              <p className="text-gray-600 mt-4 text-sm">
                This score is based on ATS compatibility, keyword optimization, and overall resume quality.
              </p>
            </div>
            <div className="flex items-center justify-center">
              <motion.div
                initial={{ scale: 0, rotate: -180 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ delay: 0.2, duration: 0.6, type: "spring", stiffness: 150 }}
                className="w-40 h-40 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-2xl"
              >
                <div className="w-36 h-36 rounded-full bg-white flex items-center justify-center flex-col">
                  <motion.span
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.4, type: "spring", stiffness: 200 }}
                    className={`text-5xl font-bold ${getScoreColor(analysis.resume_score ?? 0)}`}
                  >
                    {analysis.resume_score ?? 0}
                  </motion.span>
                  <span className="text-xs text-gray-500 font-medium">/ 100</span>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Score Breakdown */}
        {analysis.score_breakdown && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15, duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 mb-8"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-600" />
              Score Breakdown
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analysis.score_breakdown).map(([key, value], index) => {
                const score = typeof value === 'number' ? value : parseInt(value) || 0;
                const color = score >= 80 ? "bg-green-500" : score >= 60 ? "bg-blue-500" : score >= 40 ? "bg-yellow-500" : "bg-red-500";
                const iconMap = {
                  skills: Code2,
                  education: GraduationCap,
                  experience: Briefcase,
                  projects: Target,
                  certifications: Award,
                  formatting: FileCheck,
                  communication: MessageCircle,
                  ats_compatibility: Sparkles
                };
                const Icon = iconMap[key] || BarChart3;
                
                return (
                  <motion.div
                    key={key}
                    initial={{ x: -20, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    transition={{ delay: 0.1 * (index + 1), duration: 0.3 }}
                    className="bg-gray-50 rounded-xl p-4"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Icon className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-medium text-gray-700 capitalize">
                          {key.replace(/_/g, " ")}
                        </span>
                      </div>
                      <span className={`text-sm font-bold ${getScoreColor(score)}`}>
                        {score}/100
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${score}%` }}
                        transition={{ delay: 0.3 + (index * 0.05), duration: 0.8, ease: "easeOut" }}
                        className={`h-2 rounded-full ${color}`}
                      />
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Summary */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2, duration: 0.5 }}
          className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 mb-8 hover:shadow-xl transition-shadow duration-300 border border-blue-100"
        >
          <h2 className="text-2xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-yellow-500" />
            Resume Summary
          </h2>
          <p className="text-gray-700 leading-8 text-lg">
            {analysis.resume_summary || "Not Available"}
          </p>
        </motion.div>

        {/* Personal Information */}
        {analysis.personal_information && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.5 }}
            className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 mb-8 hover:shadow-xl transition-shadow duration-300"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-blue-600" />
              Personal Information
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(analysis.personal_information).map(([key, value], index) => {
                const iconMap = {
                  full_name: User,
                  email: Mail,
                  phone: Phone,
                  address: MapPin,
                  location: MapPin,
                  name: User,
                };
                const Icon = iconMap[key] || User;
                return (
                  <motion.div
                    key={key}
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.05 * (index + 1), duration: 0.3 }}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl hover:bg-blue-50 transition-colors"
                  >
                    <Icon className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <p className="text-sm text-gray-500 font-medium capitalize">
                        {key.replace(/_/g, " ")}
                      </p>
                      <p className="text-gray-800 font-medium">{value || "Not Available"}</p>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </motion.div>
        )}

        {/* Main Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <DetailCard 
            title="Skills" 
            icon={Code2} 
            data={analysis.skills}
            type="skills"
          />
          <DetailCard 
            title="Education" 
            icon={GraduationCap} 
            data={analysis.education}
            type="education"
          />
          <DetailCard 
            title="Experience" 
            icon={Briefcase} 
            data={analysis.experience}
            type="experience"
          />
          <DetailCard 
            title="Projects" 
            icon={CheckCircle2} 
            data={analysis.projects}
            type="projects"
          />
          <DetailCard 
            title="Certifications" 
            icon={Award} 
            data={analysis.certifications}
            type="certifications"
          />
          <DetailCard 
            title="Languages" 
            icon={Globe} 
            data={analysis.languages}
            type="languages"
          />
          <DetailCard 
            title="Strengths" 
            icon={TrendingUp} 
            data={analysis.strengths}
            type="strengths"
          />
          <DetailCard 
            title="Weaknesses" 
            icon={AlertCircle} 
            data={analysis.weaknesses}
            type="weaknesses"
          />
          <DetailCard 
            title="Missing Skills" 
            icon={XCircle} 
            data={analysis.missing_skills}
            type="missing"
          />
          <DetailCard 
            title="Career Recommendations" 
            icon={Lightbulb} 
            data={analysis.career_recommendations}
            type="recommendations"
          />
        </div>

        {/* ATS Insights */}
        {analysis.ats_insights && (
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3, duration: 0.5 }}
            className="mt-8 bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg p-8 border border-blue-100"
          >
            <h2 className="text-2xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
              <Zap className="w-6 h-6 text-yellow-500" />
              ATS Insights
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(analysis.ats_insights).map(([key, value], index) => (
                <motion.div
                  key={key}
                  initial={{ x: -20, opacity: 0 }}
                  animate={{ x: 0, opacity: 1 }}
                  transition={{ delay: 0.05 * (index + 1), duration: 0.3 }}
                  className="bg-gray-50 rounded-xl p-4 flex items-start gap-3"
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileCheck className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-700 capitalize">
                      {key.replace(/_/g, " ")}
                    </p>
                    <p className="text-gray-600">{String(value)}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}

function DetailCard({ title, icon: Icon, data, type = "" }) {
  const renderValue = (value) => {
    if (value === null || value === undefined || value === "")
      return <span className="text-gray-500 italic">Not Available</span>;

    if (typeof value === "string" || typeof value === "number")
      return <span className="text-gray-800">{value}</span>;

    if (Array.isArray(value)) {
      if (value.length === 0)
        return <span className="text-gray-500 italic">Not Available</span>;

      if (type === "skills" || type === "languages" || type === "strengths" || type === "weaknesses" || type === "missing") {
        return (
          <div className="flex flex-wrap gap-2">
            {value.map((item, index) => {
              let displayValue = item;
              if (typeof item === "object") {
                displayValue = item.name || item.skill || Object.values(item)[0] || JSON.stringify(item);
              }
              const colors = ["bg-blue-50 text-blue-700 border-blue-200", "bg-purple-50 text-purple-700 border-purple-200", "bg-green-50 text-green-700 border-green-200", "bg-yellow-50 text-yellow-700 border-yellow-200", "bg-pink-50 text-pink-700 border-pink-200"];
              const color = colors[index % colors.length];
              return (
                <motion.span
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.05 * index, duration: 0.2, type: "spring", stiffness: 200 }}
                  className={`px-3 py-1.5 text-sm font-medium rounded-full border ${color}`}
                >
                  {displayValue}
                </motion.span>
              );
            })}
          </div>
        );
      }

      if (type === "education" || type === "experience") {
        return (
          <div className="space-y-4 relative pl-6 before:absolute before:left-0 before:top-0 before:bottom-0 before:w-0.5 before:bg-blue-200">
            {value.map((item, index) => (
              <motion.div
                key={index}
                initial={{ x: -20, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.05 * index, duration: 0.3 }}
                className="relative pl-4 before:absolute before:left-0 before:top-1 before:w-2 before:h-2 before:bg-blue-600 before:rounded-full"
              >
                {typeof item === "object" ? (
                  Object.entries(item).map(([key, val]) => (
                    <p key={key} className="text-gray-800">
                      <span className="font-semibold capitalize text-blue-700">
                        {key.replace(/_/g, " ")}:
                      </span>{" "}
                      <span className="text-gray-700">{String(val)}</span>
                    </p>
                  ))
                ) : (
                  <span className="text-gray-800">{String(item)}</span>
                )}
              </motion.div>
            ))}
          </div>
        );
      }

      return (
        <ul className="space-y-3">
          {value.map((item, index) => (
            <motion.li
              key={index}
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ delay: 0.05 * index, duration: 0.3 }}
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 hover:shadow-md transition-shadow"
            >
              {typeof item === "object" ? (
                Object.entries(item).map(([key, val]) => (
                  <p key={key} className="text-gray-800">
                    <span className="font-semibold capitalize text-blue-700">
                      {key.replace(/_/g, " ")}:
                    </span>{" "}
                    <span className="text-gray-700">{String(val)}</span>
                  </p>
                ))
              ) : (
                <span className="text-gray-800">{String(item)}</span>
              )}
            </motion.li>
          ))}
        </ul>
      );
    }

    if (typeof value === "object") {
      const entries = Object.entries(value);
      if (entries.length === 0)
        return <span className="text-gray-500 italic">Not Available</span>;

      return (
        <div className="space-y-2">
          {entries.map(([key, val]) => (
            <p key={key} className="text-gray-800">
              <span className="font-semibold capitalize text-blue-700">
                {key.replace(/_/g, " ")}:
              </span>{" "}
              <span className="text-gray-700">{String(val)}</span>
            </p>
          ))}
        </div>
      );
    }

    return <span className="text-gray-800">{String(value)}</span>;
  };

  const getIconBg = () => {
    const bgMap = {
      skills: "bg-purple-50",
      education: "bg-blue-50",
      experience: "bg-indigo-50",
      projects: "bg-green-50",
      certifications: "bg-yellow-50",
      languages: "bg-cyan-50",
      strengths: "bg-emerald-50",
      weaknesses: "bg-red-50",
      missing: "bg-orange-50",
      recommendations: "bg-violet-50",
    };
    return bgMap[type] || "bg-gray-50";
  };

  const getIconColor = () => {
    const colorMap = {
      skills: "text-blue",
      education: "text-blue-600",
      experience: "text-indigo-600",
      projects: "text-green-600",
      certifications: "text-yellow-600",
      languages: "text-cyan-600",
      strengths: "text-emerald-600",
      weaknesses: "text-red-600",
      missing: "text-orange-600",
      recommendations: "text-violet-600",
    };
    return colorMap[type] || "text-blue-600";
  };

  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden"
    >
      <div className={`p-4 ${getIconBg()} border-b border-gray-100`}>
        <h2 className="text-xl font-bold text-gray-800 flex items-center gap-3">
          <div className={`p-2 rounded-lg ${getIconBg()}`}>
            <Icon className={`w-5 h-5 ${getIconColor()}`} />
          </div>
          {title}
        </h2>
      </div>
      <div className="p-6">
        {renderValue(data)}
      </div>
    </motion.div>
  );
}

export default ViewResumeAnalysis;