/* eslint-disable react/prop-types */
import { Navigate, useLocation, useSearchParams } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useAuth();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const directPost = searchParams.get("direct-post") === "true";

  // Show loading state while checking authentication
  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  // Check if user is signed in
  if (!isSignedIn) {
    // Build the redirect URL to show sign-in modal
    return <Navigate to="/?sign-in=true" />;
  }

  // Special case for post-job page with direct-post parameter
  // Allow candidates to access post-job page if they have the direct-post parameter
  if (pathname === "/post-job" && directPost) {
    // Allow access regardless of role when direct-post is true
    return children;
  }

  // For all other protected routes, just ensure user is signed in
  // Our custom auth system already has users with proper roles assigned
  return children;
};

export default ProtectedRoute;
