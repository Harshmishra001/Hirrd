import { getSavedJobs } from "@/api/mockApi";
import JobCard from "@/components/job-card";
import useFetch from "@/hooks/use-fetch";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { useUser } from "../contexts/AuthContext";
import { getSavedJobsForUser } from "../data/mock-saved-jobs.js";

const SavedJobs = () => {
  const { isLoaded, user } = useUser();
  const [mockSavedJobsList, setMockSavedJobsList] = useState([]);

  const {
    fn: fnSavedJobs,
  } = useFetch(getSavedJobs, {
    user_id: user?.id // Pass user ID to filter saved jobs
  });

  useEffect(() => {
    if (isLoaded && user) {
      fnSavedJobs();
      console.log("Fetching saved jobs for user:", user.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, user]);

  // Get saved jobs from mock data
  useEffect(() => {
    if (user) {
      console.log("User is loaded, user ID:", user.id);

      // Function to load saved jobs
      const loadSavedJobs = () => {
        try {
          console.log("Loading saved jobs for user:", user.id);

          // Check localStorage directly
          if (typeof window !== 'undefined') {
            // Get the current saved jobs
            const stored = localStorage.getItem('mockSavedJobs');
            console.log("Raw localStorage data for saved jobs:", stored);

            if (stored) {
              try {
                const parsedJobs = JSON.parse(stored);
                console.log("Parsed saved jobs from localStorage:", parsedJobs);
                console.log("Number of saved jobs in localStorage:", parsedJobs.length);

                // Filter for this user
                const userJobs = parsedJobs.filter(job => job.user_id === user.id);
                console.log("Filtered jobs for user:", userJobs.length);

                if (userJobs.length > 0) {
                  // Update the state with the saved jobs
                  setMockSavedJobsList([...userJobs]);
                  console.log("Updated state with saved jobs from localStorage");

                  // Log each saved job for debugging
                  userJobs.forEach((saved, index) => {
                    console.log(`Saved job ${index + 1}:`, {
                      id: saved.id,
                      job_id: saved.job_id,
                      job_title: saved.job?.title || "Unknown Job",
                      company: saved.job?.company?.name || "Unknown Company"
                    });
                  });
                } else {
                  console.log("No saved jobs found for user in localStorage");
                  setMockSavedJobsList([]);
                }
              } catch (e) {
                console.error("Error parsing saved jobs from localStorage:", e);
                setMockSavedJobsList([]);
              }
            } else {
              console.log("No saved jobs found in localStorage, initializing empty array");
              localStorage.setItem('mockSavedJobs', JSON.stringify([]));
              setMockSavedJobsList([]);
            }
          }
        } catch (error) {
          console.error("Error loading saved jobs:", error);
          // If error, set empty array
          setMockSavedJobsList([]);
        }
      };

      // Load saved jobs immediately
      loadSavedJobs();

      // Set up an event listener for the custom event
      const handleSavedJobsUpdated = (event) => {
        console.log("Saved jobs updated event received:", event.detail);
        if (event.detail.userId === user.id) {
          console.log("Updating saved jobs list due to event");

          // Use setTimeout to avoid potential render issues
          setTimeout(() => {
            // Force reload from localStorage
            if (typeof window !== 'undefined') {
              const stored = localStorage.getItem('mockSavedJobs');
              if (stored) {
                try {
                  const parsedJobs = JSON.parse(stored);
                  console.log("Parsed saved jobs from localStorage after event:", parsedJobs);

                  // Filter for this user
                  const userJobs = parsedJobs.filter(job => job.user_id === user.id);
                  console.log("Filtered jobs for user after event:", userJobs.length);

                  if (userJobs.length > 0) {
                    // Update the state with the saved jobs
                    setMockSavedJobsList([...userJobs]);
                    console.log("Updated state with saved jobs from localStorage after event");
                  }
                } catch (e) {
                  console.error("Error parsing saved jobs from localStorage after event:", e);
                }
              }
            }
          }, 200);
        }
      };

      // Add event listener
      window.addEventListener('savedJobsUpdated', handleSavedJobsUpdated);

      // Set up an interval to refresh saved jobs every 3 seconds
      // This ensures we catch any new saved jobs that might be added
      // Use a longer interval to avoid too many updates
      const intervalId = setInterval(loadSavedJobs, 3000);

      // Clean up interval and event listener on unmount
      return () => {
        clearInterval(intervalId);
        window.removeEventListener('savedJobsUpdated', handleSavedJobsUpdated);
      };
    }
  }, [user]);

  // Add a useEffect to check localStorage directly
  useEffect(() => {
    if (user && typeof window !== 'undefined') {
      const checkLocalStorage = () => {
        const stored = localStorage.getItem('mockSavedJobs');
        console.log("Direct check of localStorage raw data:", stored);

        if (stored) {
          try {
            const parsedJobs = JSON.parse(stored);
            console.log("Direct check of localStorage saved jobs:", parsedJobs);

            // Filter for this user
            const directSavedJobs = parsedJobs.filter(job => job.user_id === user.id);
            console.log("Direct saved jobs for this user:", directSavedJobs);
            console.log("Number of direct saved jobs:", directSavedJobs.length);

            // Always update the state with the latest data from localStorage
            // This ensures we always show all saved jobs
            if (directSavedJobs.length > 0) {
              console.log("Found jobs directly in localStorage, updating state");
              setMockSavedJobsList(directSavedJobs);
            }
          } catch (e) {
            console.error("Error parsing saved jobs directly from localStorage:", e);
          }
        } else {
          console.log("No saved jobs found in localStorage");
          localStorage.setItem('mockSavedJobs', JSON.stringify([]));
        }
      };

      // Check localStorage immediately
      checkLocalStorage();

      // Set up an interval to check localStorage every 5 seconds
      // Use a longer interval to avoid too many updates
      const checkInterval = setInterval(checkLocalStorage, 5000);

      // Clean up interval on unmount
      return () => clearInterval(checkInterval);
    }
  }, [user]); // Only run when user changes

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  // Use the mockSavedJobsList state which is updated from localStorage
  // This ensures we always have the most up-to-date list
  const combinedSavedJobs = mockSavedJobsList;
  const hasSavedJobs = combinedSavedJobs?.length > 0;

  console.log("Rendering saved jobs page with", combinedSavedJobs?.length || 0, "jobs");
  console.log("Full saved jobs list:", combinedSavedJobs);

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-6xl sm:text-7xl text-center pb-8">
        Saved Jobs
      </h1>

      <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {hasSavedJobs ? (
          combinedSavedJobs.map((saved) => {
            return (
              <JobCard
                key={saved.id}
                job={saved?.job || saved}
                onJobAction={() => {
                  // Refresh both API and mock data
                  fnSavedJobs();

                  // Update mock data immediately
                  if (user) {
                    const userSavedJobs = getSavedJobsForUser(user.id);
                    setMockSavedJobsList(userSavedJobs);
                    console.log("Refreshed saved jobs list after action");
                  }
                }}
                savedInit={true} // Always show heart as red in saved jobs page
              />
            );
          })
        ) : (
          <div className="col-span-3 text-center text-xl mt-10">
            No Saved Jobs 👀
          </div>
        )}
      </div>
    </div>
  );
};

export default SavedJobs;
