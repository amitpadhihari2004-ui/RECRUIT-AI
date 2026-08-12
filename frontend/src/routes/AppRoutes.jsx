import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";

// =====================================================
// STUDENT PAGES
// =====================================================

import Signup from "../pages/Signup";
import Login from "../pages/Login";
import Dashboard from "../pages/Dashboard";

import ResumeUpload from "../pages/ResumeUpload";
import ResumeAnalysis from "../pages/ResumeAnalysis";
import ViewResumeAnalysis from "../pages/ViewResumeAnalysis";

import MyProfile from "../pages/MyProfile";
import EditProfile from "../pages/EditProfile";

import AvailableJobs from "../pages/AvailableJobs";
import JobDetails from "../pages/JobDetails";

import ApplyJob from "../pages/ApplyJob";
import MyApplications from "../pages/MyApplications";
import ApplicationDetails from "../pages/ApplicationDetails";

import ReportsAnalytics from "../pages/ReportsAnalytics";

import RecommendedJobs from "../pages/RecommendedJobs";

// =====================================================
// STUDENT INTERVIEW PAGES
// =====================================================

import InterviewList from "../pages/InterviewList";
import StartInterview from "../pages/StartInterview";
import StudentInterviewResult from "../pages/StudentInterviewResult";

// =====================================================
// JD MATCHING PAGES
// =====================================================

import JDMatch from "../pages/JDMatch";
import JDMatchResult from "../pages/JDMatchResult";

// =====================================================
// ORGANIZATION PAGES
// =====================================================

import OrganizationLogin from "../pages/organization/OrganizationLogin";
import OrganizationSignup from "../pages/organization/OrganizationSignup";

import OrganizationDashboard from "../pages/organization/OrganizationDashboard";
import CompanyProfile from "../pages/organization/CompanyProfile";

import CreateJob from "../pages/organization/CreateJob";
import ManageJobs from "../pages/organization/ManageJobs";
import ViewJob from "../pages/organization/ViewJob";
import EditJob from "../pages/organization/EditJob";

import Applications from "../pages/organization/Applications";
import CandidateDetails from "../pages/organization/CandidateDetails";

import CandidateRanking from "../pages/organization/CandidateRanking";

import InterviewManagement from "../pages/organization/InterviewManagement";

import OrganizationInterviews from "../pages/organization/OrganizationInterviews";
import ViewInterview from "../pages/organization/ViewInterview";

import CreateInterview from "../pages/organization/CreateInterview";

// =====================================================
// PROTECTED ROUTES
// =====================================================

import ProtectedRoute from "./ProtectedRoute";
import ProtectedOrganizationRoute from "./ProtectedOrganizationRoute";

// =====================================================
// APP ROUTES
// =====================================================

function AppRoutes() {
  return (
    <Routes>

      {/* =====================================================
          HOME
      ===================================================== */}

      <Route
        path="/"
        element={<Home />}
      />

      {/* =====================================================
          STUDENT AUTHENTICATION
      ===================================================== */}

      <Route
        path="/signup"
        element={<Signup />}
      />

      <Route
        path="/login"
        element={<Login />}
      />

      {/* =====================================================
          STUDENT DASHBOARD
      ===================================================== */}

      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          STUDENT PROFILE
      ===================================================== */}

      <Route
        path="/profile"
        element={
          <ProtectedRoute>
            <MyProfile />
          </ProtectedRoute>
        }
      />

      <Route
        path="/profile/edit"
        element={
          <ProtectedRoute>
            <EditProfile />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          RESUME
      ===================================================== */}

      <Route
        path="/resume-upload"
        element={
          <ProtectedRoute>
            <ResumeUpload />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resume-analysis"
        element={
          <ProtectedRoute>
            <ResumeAnalysis />
          </ProtectedRoute>
        }
      />

      <Route
        path="/resume-analysis/view/:resume_id"
        element={
          <ProtectedRoute>
            <ViewResumeAnalysis />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          STUDENT JOBS
      ===================================================== */}

      <Route
        path="/jobs"
        element={
          <ProtectedRoute>
            <AvailableJobs />
          </ProtectedRoute>
        }
      />

      <Route
        path="/jobs/:jobId"
        element={
          <ProtectedRoute>
            <JobDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/recommended-jobs"
        element={
          <ProtectedRoute>
            <RecommendedJobs />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          REPORTS & ANALYTICS
          STUDENT SIDE
      ===================================================== */}

      <Route
        path="/reports-analytics"
        element={
          <ProtectedRoute>
            <ReportsAnalytics />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          JD MATCHING
      ===================================================== */}

      <Route
        path="/jd-match/:jobId"
        element={
          <ProtectedRoute>
            <JDMatch />
          </ProtectedRoute>
        }
      />

      <Route
        path="/jd-match/result/:matchId"
        element={
          <ProtectedRoute>
            <JDMatchResult />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          JOB APPLICATION
      ===================================================== */}

      <Route
        path="/apply-job/:jobId"
        element={
          <ProtectedRoute>
            <ApplyJob />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          STUDENT APPLICATIONS
      ===================================================== */}

      <Route
        path="/my-applications"
        element={
          <ProtectedRoute>
            <MyApplications />
          </ProtectedRoute>
        }
      />

      <Route
        path="/applications/:applicationId"
        element={
          <ProtectedRoute>
            <ApplicationDetails />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          STUDENT INTERVIEW LIST
      ===================================================== */}

      <Route
        path="/interviews"
        element={
          <ProtectedRoute>
            <InterviewList />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          STUDENT START INTERVIEW
      ===================================================== */}

      <Route
        path="/interviews/:interviewId/start"
        element={
          <ProtectedRoute>
            <StartInterview />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          STUDENT INTERVIEW VIEW
      ===================================================== */}

      <Route
        path="/interviews/:interviewId"
        element={
          <ProtectedRoute>
            <StartInterview />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          STUDENT INTERVIEW COMPATIBILITY ROUTE
      ===================================================== */}

      <Route
        path="/student/interview/:interviewId"
        element={
          <ProtectedRoute>
            <StartInterview />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          STUDENT INTERVIEW RESULT
      ===================================================== */}

      <Route
        path="/student/interview/:interviewId/result"
        element={
          <ProtectedRoute>
            <StudentInterviewResult />
          </ProtectedRoute>
        }
      />

      {/* =====================================================
          ORGANIZATION AUTHENTICATION
      ===================================================== */}

      <Route
        path="/organization/signup"
        element={<OrganizationSignup />}
      />

      <Route
        path="/organization/login"
        element={<OrganizationLogin />}
      />

      {/* =====================================================
          ORGANIZATION DASHBOARD
      ===================================================== */}

      <Route
        path="/organization/dashboard"
        element={
          <ProtectedOrganizationRoute>
            <OrganizationDashboard />
          </ProtectedOrganizationRoute>
        }
      />

      {/* =====================================================
          ORGANIZATION PROFILE
      ===================================================== */}

      <Route
        path="/organization/profile"
        element={
          <ProtectedOrganizationRoute>
            <CompanyProfile />
          </ProtectedOrganizationRoute>
        }
      />

      {/* =====================================================
          ORGANIZATION JOBS
      ===================================================== */}

      <Route
        path="/organization/jobs/create"
        element={
          <ProtectedOrganizationRoute>
            <CreateJob />
          </ProtectedOrganizationRoute>
        }
      />

      <Route
        path="/organization/jobs"
        element={
          <ProtectedOrganizationRoute>
            <ManageJobs />
          </ProtectedOrganizationRoute>
        }
      />

      <Route
        path="/organization/jobs/view/:id"
        element={
          <ProtectedOrganizationRoute>
            <ViewJob />
          </ProtectedOrganizationRoute>
        }
      />

      <Route
        path="/organization/jobs/edit/:id"
        element={
          <ProtectedOrganizationRoute>
            <EditJob />
          </ProtectedOrganizationRoute>
        }
      />

      {/* =====================================================
          ORGANIZATION APPLICATIONS
      ===================================================== */}

      <Route
        path="/organization/applications"
        element={
          <ProtectedOrganizationRoute>
            <Applications />
          </ProtectedOrganizationRoute>
        }
      />

      <Route
        path="/organization/applications/:applicationId"
        element={
          <ProtectedOrganizationRoute>
            <CandidateDetails />
          </ProtectedOrganizationRoute>
        }
      />

      {/* =====================================================
          CREATE AI INTERVIEW
      ===================================================== */}

      <Route
        path="/organization/interviews/create/:applicationId"
        element={
          <ProtectedOrganizationRoute>
            <CreateInterview />
          </ProtectedOrganizationRoute>
        }
      />

      {/* =====================================================
          ORGANIZATION INTERVIEW LIST
      ===================================================== */}

      <Route
        path="/organization/interviews"
        element={
          <ProtectedOrganizationRoute>
            <OrganizationInterviews />
          </ProtectedOrganizationRoute>
        }
      />

      {/* =====================================================
          ORGANIZATION VIEW INTERVIEW
      ===================================================== */}

      <Route
        path="/organization/interviews/:interviewId"
        element={
          <ProtectedOrganizationRoute>
            <ViewInterview />
          </ProtectedOrganizationRoute>
        }
      />

      {/* =====================================================
          CANDIDATE RANKING
      ===================================================== */}

      <Route
        path="/organization/ranking"
        element={
          <ProtectedOrganizationRoute>
            <CandidateRanking />
          </ProtectedOrganizationRoute>
        }
      />

      <Route
        path="/organization/jobs/:jobId/ranking"
        element={
          <ProtectedOrganizationRoute>
            <CandidateRanking />
          </ProtectedOrganizationRoute>
        }
      />

      {/* =====================================================
          ORGANIZATION INTERVIEW MANAGEMENT
      ===================================================== */}

      <Route
        path="/organization/interview-management"
        element={
          <ProtectedOrganizationRoute>
            <InterviewManagement />
          </ProtectedOrganizationRoute>
        }
      />

      {/* =====================================================
          404
      ===================================================== */}

      <Route
        path="*"
        element={
          <div className="min-h-screen flex items-center justify-center bg-slate-50">

            <div className="text-center">

              <h1 className="text-5xl font-bold text-gray-900">
                404
              </h1>

              <p className="text-xl text-gray-500 mt-2">
                Page Not Found
              </p>

              <a
                href="/"
                className="
                  inline-block
                  mt-6
                  px-6
                  py-3
                  bg-blue-600
                  hover:bg-blue-700
                  text-white
                  rounded-xl
                  font-semibold
                  transition
                "
              >
                Go Home
              </a>

            </div>

          </div>
        }
      />

    </Routes>
  );
}

export default AppRoutes;