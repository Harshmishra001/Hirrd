import {
    SignedIn,
    SignedOut,
    SignIn,
    UserButton,
    useUser,
} from "@clerk/clerk-react";
import { BriefcaseBusiness, Heart } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { getApplicationsForUser } from "../data/mock-applications.js";
import { getSavedJobsForUser } from "../data/mock-saved-jobs.js";
import { Button } from "./ui/button";

const Header = () => {
  const [showSignIn, setShowSignIn] = useState(false);
  const [savedJobsCount, setSavedJobsCount] = useState(0);
  const [appliedJobsCount, setAppliedJobsCount] = useState(0);

  const [search, setSearch] = useSearchParams();
  const { user } = useUser();

  // Store the parameters
  const [skipOnboarding, setSkipOnboarding] = useState(false);
  const [directAccess, setDirectAccess] = useState(false);
  const [directPost, setDirectPost] = useState(false);

  // Update saved jobs count
  useEffect(() => {
    if (user) {
      // Function to update saved jobs count
      const updateSavedJobsCount = () => {
        try {
          const userSavedJobs = getSavedJobsForUser(user.id);
          setSavedJobsCount(userSavedJobs.length);
        } catch (error) {
          console.error("Error getting saved jobs count:", error);
        }
      };

      // Update count immediately
      updateSavedJobsCount();

      // Listen for saved jobs updates
      const handleSavedJobsUpdated = (event) => {
        if (event.detail.userId === user.id) {
          console.log("Saved jobs updated event received in header:", event.detail);
          updateSavedJobsCount();
        }
      };

      // Add event listener
      window.addEventListener('savedJobsUpdated', handleSavedJobsUpdated);

      // Set up interval to update count every second as a fallback
      const intervalId = setInterval(updateSavedJobsCount, 1000);

      // Clean up interval and event listener on unmount
      return () => {
        clearInterval(intervalId);
        window.removeEventListener('savedJobsUpdated', handleSavedJobsUpdated);
      };
    }
  }, [user]);

  // Update applied jobs count
  useEffect(() => {
    if (user) {
      // Function to update applied jobs count
      const updateAppliedJobsCount = () => {
        try {
          const userApplications = getApplicationsForUser(user.id);
          setAppliedJobsCount(userApplications.length);
        } catch (error) {
          console.error("Error getting applied jobs count:", error);
        }
      };

      // Update count immediately
      updateAppliedJobsCount();

      // Listen for application updates
      const handleApplicationUpdated = (event) => {
        if (event.detail.userId === user.id) {
          console.log("Application updated event received in header:", event.detail);
          updateAppliedJobsCount();
        }
      };

      // Add event listener
      window.addEventListener('applicationUpdated', handleApplicationUpdated);

      // Set up interval to update count every second as a fallback
      const intervalId = setInterval(updateAppliedJobsCount, 1000);

      // Clean up interval and event listener on unmount
      return () => {
        clearInterval(intervalId);
        window.removeEventListener('applicationUpdated', handleApplicationUpdated);
      };
    }
  }, [user]);

  useEffect(() => {
    if (search.get("sign-in")) {
      setShowSignIn(true);

      // Store these parameters to use after sign-in
      if (search.get("skip-onboarding") === "true") {
        setSkipOnboarding(true);
      }

      if (search.get("direct-access") === "true") {
        setDirectAccess(true);
      }

      if (search.get("direct-post") === "true") {
        setDirectPost(true);
      }
    }
  }, [search]);

  // Handle login button click from navbar
  const handleLoginClick = () => {
    // Clear any existing search params to ensure we go to onboarding after login
    setSearch({});
    setShowSignIn(true);
  };

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowSignIn(false);

      // Clear the search params but preserve the original URL
      const newParams = {};
      setSearch(newParams);

      // Reset the stored parameters
      setSkipOnboarding(false);
      setDirectAccess(false);
      setDirectPost(false);
    }
  };

  return (
    <>
      <nav className="py-4 flex justify-between items-center">
        <Link to="/">
          <img src="/logo.png" className="h-20" alt="Hirrd Logo" />
        </Link>

        <div className="flex gap-8">
          <SignedOut>
            <Button variant="blue" onClick={handleLoginClick}>
              Login
            </Button>
          </SignedOut>
          <SignedIn>
            <UserButton
              appearance={{
                elements: {
                  avatarBox: "w-10 h-10",
                },
              }}
            >
              <UserButton.MenuItems>
                <UserButton.Link
                  label={`My Jobs ${appliedJobsCount > 0 ? `(${appliedJobsCount})` : ''}`}
                  labelIcon={<BriefcaseBusiness size={15} fill={appliedJobsCount > 0 ? "#3b82f6" : "none"} />}
                  href="/my-jobs"
                />
                <UserButton.Link
                  label={`Saved Jobs ${savedJobsCount > 0 ? `(${savedJobsCount})` : ''}`}
                  labelIcon={<Heart size={15} fill={savedJobsCount > 0 ? "red" : "none"} />}
                  href="/saved-jobs"
                />
                <UserButton.Action label="manageAccount" />
              </UserButton.MenuItems>
            </UserButton>
          </SignedIn>
        </div>
      </nav>

      {showSignIn && (
        <div
          className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50"
          onClick={handleOverlayClick}
        >
          <SignIn
            signUpForceRedirectUrl={
              directPost
                ? "/post-job?skip-onboarding=true&direct-post=true"
                : skipOnboarding || directAccess
                  ? "/jobs?skip-onboarding=true"
                  : "/onboarding?force-selection=true"
            }
            fallbackRedirectUrl={
              directPost
                ? "/post-job?skip-onboarding=true&direct-post=true"
                : skipOnboarding || directAccess
                  ? "/jobs?skip-onboarding=true"
                  : "/onboarding?force-selection=true"
            }
            allowSignUp={true}
          />
        </div>
      )}
    </>
  );
};

export default Header;
