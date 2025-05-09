import { getApplications } from "@/api/apiApplication";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { getApplicationsForUser } from "../data/mock-applications.js";
import ApplicationCard from "./application-card";

const CreatedApplications = () => {
  const { user } = useUser();
  const [mockApplicationsList, setMockApplicationsList] = useState([]);
  const location = useLocation();
  const [newApplicationId, setNewApplicationId] = useState(null);
  const newApplicationRef = useRef(null);

  const {
    loading: loadingApplications,
    data: applications,
    fn: fnApplications,
  } = useFetch(getApplications, {
    user_id: user.id,
  });

  useEffect(() => {
    fnApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Get applications from mock data
  useEffect(() => {
    if (user) {
      // Function to load applications
      const loadApplications = () => {
        try {
          console.log("Loading applications for user:", user.id);

          // First, try to load directly from localStorage
          let userApplications = [];

          try {
            const stored = localStorage.getItem('mockApplications');
            if (stored) {
              const allApplications = JSON.parse(stored);
              if (Array.isArray(allApplications)) {
                // Filter applications for this user
                userApplications = allApplications.filter(app => app.candidate_id === user.id);
                console.log("Loaded applications directly from localStorage:", userApplications.length);
              }
            }
          } catch (localStorageError) {
            console.error("Error loading from localStorage directly:", localStorageError);
          }

          // If we couldn't get applications from localStorage, use the helper function
          if (userApplications.length === 0) {
            userApplications = getApplicationsForUser(user.id);
            console.log("Loaded applications using helper function:", userApplications.length);
          }

          // Filter out test jobs
          const filteredApplications = userApplications.filter(app =>
            app.job_id !== 999 &&
            app.job?.title !== "Test Job" &&
            app.job?.company?.name !== "Test Company"
          );

          // Update state with the filtered applications
          setMockApplicationsList(filteredApplications);

          // Log application details for debugging
          if (userApplications.length > 0) {
            userApplications.forEach((app, index) => {
              console.log(`Application ${index + 1}:`, {
                id: app.id,
                job_id: app.job_id,
                job_title: app.job?.title || "Unknown Job",
                company: app.job?.company?.name || "Unknown Company"
              });
            });
          } else {
            console.log("No applications found for user:", user.id);
          }
        } catch (error) {
          console.error("Error loading applications:", error);
        }
      };

      // Load applications immediately
      loadApplications();

      // Listen for application updates
      const handleApplicationUpdated = (event) => {
        if (event.detail.userId === user.id) {
          console.log("Application updated event received in CreatedApplications:", event.detail);

          // Set the new application ID if this is a new application
          if (event.detail.action === 'added') {
            setNewApplicationId(event.detail.jobId);
          }

          loadApplications();
        }
      };

      // Listen for applications cleared event
      const handleApplicationsCleared = () => {
        console.log("Applications cleared event received");
        loadApplications();
      };

      // Listen for force reload event
      const handleForceReload = (event) => {
        if (event.detail.userId === user.id) {
          console.log("Force application reload event received");
          loadApplications();
        }
      };

      // Add event listeners
      window.addEventListener('applicationUpdated', handleApplicationUpdated);
      window.addEventListener('applicationsCleared', handleApplicationsCleared);
      window.addEventListener('forceApplicationReload', handleForceReload);

      // Clean up event listeners on unmount
      return () => {
        window.removeEventListener('applicationUpdated', handleApplicationUpdated);
        window.removeEventListener('applicationsCleared', handleApplicationsCleared);
        window.removeEventListener('forceApplicationReload', handleForceReload);
      };
    }
  }, [user]);

  // Check if we just arrived from applying to a job
  useEffect(() => {
    // Check for force refresh flag
    const forceRefresh = localStorage.getItem('forceRefreshApplications');

    // If we have a 'from' state indicating we came from applying to a job
    // or if the force refresh flag is set
    if ((location.state && location.state.fromApply) || forceRefresh === 'true') {
      console.log("Arrived at My Jobs page from applying to a job or force refresh needed");

      if (location.state && location.state.jobId) {
        setNewApplicationId(parseInt(location.state.jobId));
      }

      // Check for most recent application in localStorage
      try {
        const recentAppJson = localStorage.getItem('mostRecentApplication');
        if (recentAppJson) {
          const recentApp = JSON.parse(recentAppJson);
          console.log("Found most recent application in localStorage:", recentApp);

          // Add it to the applications list if it's not already there
          setMockApplicationsList(prevList => {
            // Check if this application is already in the list
            const exists = prevList.some(app => app.id === recentApp.id);
            if (!exists) {
              console.log("Adding most recent application to list");
              return [...prevList, recentApp];
            }
            return prevList;
          });

          // Set the new application ID
          if (recentApp.job_id) {
            setNewApplicationId(parseInt(recentApp.job_id));
          }
        }
      } catch (error) {
        console.error("Error checking for most recent application:", error);
      }

      // Clear the force refresh flag
      if (forceRefresh === 'true') {
        localStorage.removeItem('forceRefreshApplications');
        console.log("Cleared force refresh flag");
      }

      // Clear the state to prevent this from running again on page refresh
      if (location.state && location.state.fromApply) {
        window.history.replaceState({}, document.title);
      }
    }
  }, [location]);

  // Scroll to the new application when it's rendered
  useEffect(() => {
    if (newApplicationRef.current) {
      console.log("Scrolling to new application");

      // Add a small delay to ensure the element is fully rendered
      setTimeout(() => {
        newApplicationRef.current.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }, 500);
    }
  }, [mockApplicationsList, newApplicationId]);

  if (loadingApplications) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  // Combine API and mock data - prefer mock data for this implementation
  let combinedApplications = mockApplicationsList;

  // Check if we have any applications
  if (combinedApplications.length === 0) {
    console.log("No applications found, checking for most recent application");

    // Try to get the most recent application as a fallback
    try {
      const recentAppJson = localStorage.getItem('mostRecentApplication');
      if (recentAppJson) {
        const recentApp = JSON.parse(recentAppJson);

        // Only use the recent application if it's not a test job
        if (recentApp.job_id !== 999 && recentApp.job?.title !== "Test Job" && recentApp.job?.company?.name !== "Test Company") {
          console.log("Using most recent application as fallback:", recentApp);
          combinedApplications = [recentApp];

          // Set the new application ID
          if (recentApp.job_id && !newApplicationId) {
            setNewApplicationId(parseInt(recentApp.job_id));
          }
        } else {
          console.log("Skipping test application:", recentApp);
        }
      }
    } catch (error) {
      console.error("Error using most recent application as fallback:", error);
    }
  }

  // Filter out any test jobs
  combinedApplications = combinedApplications.filter(app =>
    app.job_id !== 999 &&
    app.job?.title !== "Test Job" &&
    app.job?.company?.name !== "Test Company"
  );

  const hasApplications = combinedApplications?.length > 0;

  console.log("Rendering applications page with", combinedApplications?.length || 0, "applications");
  console.log("New application ID:", newApplicationId);

  return (
    <div className="flex flex-col gap-2">
      {hasApplications ? (
        combinedApplications.map((application) => {
          // Check if this is the newly applied job
          const isNewApplication = parseInt(application.job_id) === newApplicationId;

          if (isNewApplication) {
            console.log("Found new application:", application.job_id);
          }

          return (
            <ApplicationCard
              key={application.id}
              application={application}
              isCandidate={true}
              isNew={isNewApplication}
              cardRef={isNewApplication ? newApplicationRef : null}
            />
          );
        })
      ) : (
        <div className="text-center text-xl mt-10">
          You haven't applied to any jobs yet 👀
        </div>
      )}
    </div>
  );
};

export default CreatedApplications;
