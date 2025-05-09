/* eslint-disable react/prop-types */
import { useUser } from "@clerk/clerk-react";
import { Navigate, useLocation, useSearchParams } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const { isSignedIn, isLoaded, user } = useUser();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const skipOnboarding = searchParams.get("skip-onboarding") === "true";
  const directAccess = searchParams.get("direct-access") === "true";
  const directPost = searchParams.get("direct-post") === "true";

  // We've removed the direct access bypass - users must sign in

  // Check if user is signed in
  if (isLoaded && !isSignedIn && isSignedIn !== undefined) {
    // Build the redirect URL based on the parameters
    let redirectParams = "sign-in=true";

    if (skipOnboarding) {
      redirectParams += "&skip-onboarding=true";
    }

    if (directAccess) {
      redirectParams += "&direct-access=true";
    }

    if (directPost) {
      redirectParams += "&direct-post=true";
    }

    return <Navigate to={`/?${redirectParams}`} />;
  }

  // Check if we need to skip onboarding
  if (
    user !== undefined &&
    !user?.unsafeMetadata?.role &&
    (skipOnboarding || pathname !== "/onboarding")
  ) {
    // Determine which role to assign based on the parameters
    let role = "candidate"; // Default role
    let redirectTo = "/jobs"; // Default redirect

    // If direct-post is true, assign as recruiter and redirect to post-job
    if (directPost) {
      role = "recruiter";
      redirectTo = "/post-job";
      console.log("Direct post detected, setting role to recruiter and redirecting to post-job");
    }

    // Auto-assign the appropriate role
    user.update({ unsafeMetadata: { role: role } })
      .then(() => {
        console.log(`Role auto-updated to: ${role}`);
      })
      .catch((err) => {
        console.error("Error auto-updating role:", err);
      });

    return <Navigate to={redirectTo} />;
  }

  // Special case for post-job page with direct-post parameter
  if (
    user !== undefined &&
    user?.unsafeMetadata?.role !== "recruiter" &&
    pathname === "/post-job" &&
    directPost
  ) {
    // Update user role to recruiter
    user.update({ unsafeMetadata: { role: "recruiter" } })
      .then(() => {
        console.log("Role updated to recruiter for post-job access");
      })
      .catch((err) => {
        console.error("Error updating role to recruiter:", err);
      });
  }

  return children;
};

export default ProtectedRoute;
