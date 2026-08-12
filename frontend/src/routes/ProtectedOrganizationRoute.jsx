import { Navigate } from "react-router-dom";

function ProtectedOrganizationRoute({ children }) {

  const organizationId = localStorage.getItem("organizationId");

  if (!organizationId) {
    return <Navigate to="/organization/login" replace />;
  }

  return children;
}

export default ProtectedOrganizationRoute;