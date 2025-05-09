import { getMyJobs } from "@/api/apiJobs";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/clerk-react";
import { useEffect, useState } from "react";
import { BarLoader } from "react-spinners";
import { getLocallyCreatedJobs, removeLocallyCreatedJob } from "../data/mock-created-jobs.js";
import JobCard from "./job-card";

const CreatedJobs = () => {
  const { user } = useUser();
  const [localJobs, setLocalJobs] = useState([]);
  const [combinedJobs, setCombinedJobs] = useState([]);

  const {
    loading: loadingCreatedJobs,
    data: createdJobs,
    fn: fnCreatedJobs,
  } = useFetch(getMyJobs, {
    recruiter_id: user.id,
  });

  // Load locally created jobs
  const loadLocalJobs = () => {
    try {
      const jobs = getLocallyCreatedJobs();
      console.log("Locally created jobs:", jobs);

      // Filter jobs to only show those created by this user
      const userJobs = jobs.filter(job => job.recruiter_id === user.id);
      console.log("User's locally created jobs:", userJobs);

      setLocalJobs(userJobs);
    } catch (error) {
      console.error("Error loading locally created jobs:", error);
    }
  };

  // Handle job deletion
  const handleJobAction = (jobId) => {
    console.log("Job action triggered for job:", jobId);

    // Remove from local storage
    removeLocallyCreatedJob(jobId);

    // Refresh API jobs
    fnCreatedJobs();

    // Refresh local jobs
    loadLocalJobs();
  };

  // Load jobs from API
  useEffect(() => {
    fnCreatedJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Load locally created jobs
  useEffect(() => {
    loadLocalJobs();

    // Listen for updates to locally created jobs
    const handleLocalJobsUpdated = () => {
      console.log("Local jobs updated event received");
      loadLocalJobs();
    };

    window.addEventListener('localJobsUpdated', handleLocalJobsUpdated);

    return () => {
      window.removeEventListener('localJobsUpdated', handleLocalJobsUpdated);
    };
  }, [user.id]);

  // Combine API and local jobs
  useEffect(() => {
    if (createdJobs) {
      // Create a map of job IDs from API to avoid duplicates
      const apiJobIds = new Set(createdJobs.map(job => job.id));

      // Filter local jobs to exclude those already in API
      const uniqueLocalJobs = localJobs.filter(job => !apiJobIds.has(job.id));

      // Combine API and unique local jobs
      let combined = [...(createdJobs || []), ...uniqueLocalJobs];

      // Add all jobs from localStorage to ensure we don't miss any
      try {
        const allJobs = localStorage.getItem('mockCreatedJobs');
        if (allJobs) {
          const parsedJobs = JSON.parse(allJobs);
          // Add any jobs not already in the combined list
          const existingIds = new Set(combined.map(job => job.id));
          const additionalJobs = parsedJobs.filter(job => !existingIds.has(job.id));
          combined = [...combined, ...additionalJobs];
        }
      } catch (error) {
        console.error("Error loading all jobs from localStorage:", error);
      }

      // Ensure all jobs have the correct recruiter_id
      combined = combined.map(job => {
        // If the job doesn't have a recruiter_id, add the current user's ID
        if (!job.recruiter_id) {
          console.log(`Adding recruiter_id ${user.id} to job ${job.id} (${job.title})`);
          return { ...job, recruiter_id: user.id };
        }
        return job;
      });

      console.log("Combined jobs:", combined);

      setCombinedJobs(combined);
    } else {
      // Ensure all local jobs have the correct recruiter_id
      const updatedLocalJobs = localJobs.map(job => {
        if (!job.recruiter_id) {
          console.log(`Adding recruiter_id ${user.id} to local job ${job.id} (${job.title})`);
          return { ...job, recruiter_id: user.id };
        }
        return job;
      });

      setCombinedJobs(updatedLocalJobs);
    }
  }, [createdJobs, localJobs, user.id]);

  // Add a direct delete button for the problematic job
  const handleDirectDelete = () => {
    console.log("Direct delete of problematic job");

    // Try to remove from all localStorage items
    try {
      // Get all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('job') || key.includes('Job'))) {
          try {
            const value = localStorage.getItem(key);
            if (value && value.includes('hgggggggggggghggggggggggg')) {
              console.log(`Found problematic job in localStorage key: ${key}`);
              try {
                const data = JSON.parse(value);
                if (Array.isArray(data)) {
                  const filtered = data.filter(item =>
                    !item.title || item.title !== "hgggggggggggghggggggggggg"
                  );
                  localStorage.setItem(key, JSON.stringify(filtered));
                  console.log(`Removed problematic job from ${key}`);
                }
              } catch (parseError) {
                console.error(`Error parsing ${key}:`, parseError);
              }
            }
          } catch (error) {
            console.error(`Error checking localStorage key ${key}:`, error);
          }
        }
      }

      // Reload the page
      window.location.reload();
    } catch (error) {
      console.error("Error in direct delete:", error);
    }
  };

  return (
    <div>
      {loadingCreatedJobs ? (
        <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
      ) : (
        <div>
          {/* Special button for problematic job */}
          {combinedJobs?.some(job => job.title === "hgggggggggggghggggggggggg") && (
            <div className="mb-4 p-4 border border-red-500 rounded-lg bg-red-900/20">
              <h3 className="text-red-400 font-bold mb-2">Special Action Required</h3>
              <p className="text-gray-300 mb-2">
                We detected a job that may require special handling. Click the button below to remove it.
              </p>
              <Button
                onClick={handleDirectDelete}
                variant="destructive"
              >
                Delete Problematic Job
              </Button>
            </div>
          )}

          <div className="mt-8 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {combinedJobs?.length ? (
              combinedJobs.map((job) => {
                return (
                  <JobCard
                    key={job.id}
                    job={job}
                    onJobAction={() => handleJobAction(job.id)}
                    isMyJob
                    pageType="dashboard"
                  />
                );
              })
            ) : (
              <div>No Jobs Found 😢</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CreatedJobs;
