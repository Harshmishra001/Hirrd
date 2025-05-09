/* eslint-disable react/prop-types */
import { removeSavedJob as apiRemoveSavedJob, deleteJob, saveJob } from "@/api/apiJobs";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/clerk-react";
import { Heart, MapPinIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { addToSavedJobs, isJobSavedByUser, removeSavedJob } from "../data/mock-saved-jobs.js";
import { Button } from "./ui/button";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card";

// Helper function to extract company name from job description
const extractCompanyName = (description) => {
  if (!description) return null;

  // Look for "**Company:** Company Name" pattern in the description
  const companyMatch = description.match(/\*\*Company:\*\*\s*(.*?)(\n|$)/);
  if (companyMatch && companyMatch[1]) {
    return companyMatch[1].trim();
  }

  return null;
};

const JobCard = ({
  job,
  savedInit = false,
  onJobAction = () => {},
  isMyJob = false,
  isNew = false,
  showDeleteButton = false, // New prop to control delete button visibility
  pageType = "jobs", // New prop to indicate which page the card is on: "jobs", "dashboard", "detail"
}) => {
  const [saved, setSaved] = useState(savedInit);
  const { user } = useUser();
  const location = useLocation();

  // Extract company name from description or company_name field
  useEffect(() => {
    if (job) {
      // First check if company_name is directly available in the job object
      if (job.company_name) {
        if (!job.company) {
          job.company = {
            name: job.company_name,
            logo_url: "/companies/default.png"
          };
        } else if (!job.company.name) {
          job.company.name = job.company_name;
        }
      }
      // If still no company name, try to extract from description
      else if ((!job.company || !job.company.name) && job.description) {
        const companyName = extractCompanyName(job.description);
        if (companyName) {
          job.company = {
            ...job.company,
            name: companyName
          };
        }
      }
    }
  }, [job]);

  // Determine if we should show the delete button based on the current page
  const isRecruiterDashboard = pageType === "dashboard";
  const isJobDetailPage = pageType === "detail";
  const isJobsPage = pageType === "jobs";

  // Only show delete button on recruiter dashboard or job detail page (if it's the recruiter's job)
  const shouldShowDeleteButton = (isRecruiterDashboard || (isJobDetailPage && isMyJob)) && !isJobsPage;

  const { loading: loadingDeleteJob, fn: fnDeleteJob } = useFetch(deleteJob, {
    job_id: job.id,
  });

  const {
    loading: loadingSavedJob,
    data: savedJob,
    fn: fnSavedJob,
  } = useFetch(saveJob);

  const {
    loading: loadingRemoveSavedJob,
    fn: fnRemoveSavedJob,
  } = useFetch(apiRemoveSavedJob, {
    job_id: job.id,
    user_id: user?.id,
  });

  const handleSaveJob = async () => {
    // First check the current saved status
    const currentSavedStatus = isJobSavedByUser(job.id, user.id);
    console.log(`Current saved status for job ${job.id}:`, currentSavedStatus);

    if (currentSavedStatus) {
      // If job is already saved, unsave it
      // Set the heart to normal immediately for better user experience
      setSaved(false);
      console.log(`Job ${job.id} heart icon set to NORMAL`);

      try {
        // Use mock data for removing job - this is more reliable for this feature
        console.log("Using mock data for removing job - direct call");

        const result = removeSavedJob(job.id, user.id);

        // Log the action for debugging
        if (result) {
          console.log(`Job ${job.id} removed successfully from Saved Jobs`);

          // Verify localStorage was updated
          const stored = localStorage.getItem('mockSavedJobs');
          if (stored) {
            console.log("Verified localStorage after removing:", stored);
          }
        }

        // Also try the API in the background
        fnRemoveSavedJob().then(() => {
          console.log(`Job ${job.id} also removed via API`);
        }).catch(error => {
          console.log("API remove failed, but mock data already removed:", error);
        });
      } catch (error) {
        console.error("Error removing job:", error);
      }

      // Dispatch event for job removal
      if (typeof window !== 'undefined') {
        // Use setTimeout to avoid potential render issues
        setTimeout(() => {
          const event = new CustomEvent('savedJobsUpdated', {
            detail: { userId: user.id, action: 'removed', jobId: job.id }
          });
          window.dispatchEvent(event);
          console.log("Dispatched savedJobsUpdated event after removing job");
        }, 100);
      }
    } else {
      // If job is not saved, save it
      // Set the heart to red immediately for better user experience
      setSaved(true);
      console.log(`Job ${job.id} heart icon set to RED`);

      try {
        // Use mock data for saving job - this is more reliable for this feature
        console.log("Using mock data for saving job - direct call");
        console.log("Job data being saved:", job);

        // Make a deep copy of the job object to ensure it's properly saved
        const jobCopy = JSON.parse(JSON.stringify(job));
        console.log("Job copy for saving:", jobCopy);

        const result = addToSavedJobs(jobCopy, user.id);

        // Log the action for debugging
        if (result.length > 0) {
          console.log(`Job ${job.id} saved successfully and will appear in Saved Jobs`);

          // Verify localStorage was updated
          const stored = localStorage.getItem('mockSavedJobs');
          if (stored) {
            console.log("Verified localStorage after saving:", stored);

            // Parse the stored data to verify it contains the job
            try {
              const parsedJobs = JSON.parse(stored);
              console.log("Number of saved jobs in localStorage after saving:", parsedJobs.length);

              // Check if the job is in the saved jobs
              const savedJob = parsedJobs.find(saved => saved.job_id === job.id && saved.user_id === user.id);
              if (savedJob) {
                console.log("Job found in localStorage after saving:", savedJob);
              } else {
                console.error("Job not found in localStorage after saving!");
              }
            } catch (e) {
              console.error("Error parsing saved jobs from localStorage after saving:", e);
            }
          }
        }

        // Also try the API in the background
        fnSavedJob(
          {}, // Empty object for alreadySaved parameter (not used anymore)
          {
            user_id: user.id,
            job_id: job.id,
          }
        ).then(() => {
          console.log(`Job ${job.id} also saved via API`);
        }).catch(error => {
          console.log("API save failed, but mock data already saved:", error);
        });
      } catch (error) {
        console.error("Error saving job:", error);
      }

      // Dispatch event for job saving
      if (typeof window !== 'undefined') {
        // Use setTimeout to avoid potential render issues
        setTimeout(() => {
          const event = new CustomEvent('savedJobsUpdated', {
            detail: { userId: user.id, action: 'added', jobId: job.id }
          });
          window.dispatchEvent(event);
          console.log("Dispatched savedJobsUpdated event after saving job");
        }, 100);
      }
    }

    // Call the onJobAction callback to refresh the job list
    onJobAction();
  };

  const handleDeleteJob = async () => {
    try {
      console.log("Deleting job:", job.id, job.title);

      // Special case for the problematic job
      const isProblematicJob = job.title === "hgggggggggggghggggggggggg";
      if (isProblematicJob) {
        console.log("Detected problematic job, using special deletion method");
      }

      // Try to delete from API
      try {
        await fnDeleteJob();
        console.log("Job deleted from API successfully");
      } catch (apiError) {
        console.error("Error deleting job from API:", apiError);
        // Continue with localStorage deletion even if API fails
      }

      // Also remove from localStorage (this will work even if API fails)
      if (typeof window !== 'undefined') {
        try {
          // Import is done dynamically to avoid circular dependencies
          const { removeLocallyCreatedJob } = await import("../data/mock-created-jobs.js");
          removeLocallyCreatedJob(job.id);
          console.log("Job removed from localStorage successfully");

          // Also try to remove directly from mockCreatedJobs
          try {
            const storedJobs = localStorage.getItem('mockCreatedJobs');
            if (storedJobs) {
              const jobs = JSON.parse(storedJobs);
              const updatedJobs = jobs.filter(j => j.id !== job.id);
              localStorage.setItem('mockCreatedJobs', JSON.stringify(updatedJobs));
              console.log("Job removed directly from mockCreatedJobs in localStorage");
            }
          } catch (localStorageError) {
            console.error("Error removing job directly from localStorage:", localStorageError);
          }

          // Special case: Also try to remove from mockJobs
          try {
            const storedJobs = localStorage.getItem('mockJobs');
            if (storedJobs) {
              const jobs = JSON.parse(storedJobs);
              const updatedJobs = jobs.filter(j => j.id !== job.id);
              localStorage.setItem('mockJobs', JSON.stringify(updatedJobs));
              console.log("Job removed directly from mockJobs in localStorage");
            }
          } catch (localStorageError) {
            console.error("Error removing job from mockJobs:", localStorageError);
          }

          // If it's the problematic job, try to remove it from all localStorage items
          if (isProblematicJob) {
            // Get all localStorage keys
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && key.includes('job') || key.includes('Job')) {
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
          }

          // Dispatch an event to notify other components
          const event = new CustomEvent('localJobsUpdated', {
            detail: { action: 'removed', jobId: job.id }
          });
          window.dispatchEvent(event);

          console.log("Job deleted successfully:", job.id);
        } catch (localError) {
          console.error("Error removing job from localStorage:", localError);
        }
      }
    } catch (error) {
      console.error("Error in handleDeleteJob:", error);
    }

    // Call the callback to refresh the job list
    onJobAction();

    // Force reload the page if it's the problematic job
    if (job.title === "hgggggggggggghggggggggggg") {
      console.log("Reloading page after deleting problematic job");
      setTimeout(() => {
        window.location.reload();
      }, 500);
    }
  };

  useEffect(() => {
    // Check if job is saved in API response
    if (savedJob !== undefined) {
      setSaved(savedJob?.length > 0);
    } else if (user) {
      // If API fails, check in mock data
      const isSaved = isJobSavedByUser(job.id, user.id);
      setSaved(isSaved || savedInit);
    }
  }, [savedJob, user, job.id, savedInit]);

  // Initialize saved state from mock data on component mount
  useEffect(() => {
    if (user && job.id) {
      const isSaved = isJobSavedByUser(job.id, user.id);
      console.log(`Job ${job.id} saved status on mount:`, isSaved);
      setSaved(isSaved);
    }
  }, [user, job.id]);

  // Check saved status periodically to ensure heart icon stays in sync
  useEffect(() => {
    if (user && job.id) {
      // Set up an interval to check saved status every 5 seconds
      // Use a longer interval to avoid too many updates
      const intervalId = setInterval(() => {
        const isSaved = isJobSavedByUser(job.id, user.id);
        if (isSaved !== saved) {
          console.log(`Job ${job.id} saved status changed from ${saved} to ${isSaved}`);
          setSaved(isSaved);
        }
      }, 5000);

      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [user, job.id, saved]);

  // Log when saved state changes
  useEffect(() => {
    console.log(`Job ${job.id} heart icon state:`, saved ? 'RED' : 'normal');
  }, [saved, job.id]);

  // Debug job properties on mount
  useEffect(() => {
    console.log(`Job Card mounted for job ${job.id} (${job.title}):`);
    console.log(`- recruiter_id: ${job.recruiter_id}`);
    console.log(`- isMyJob: ${isMyJob}`);
    console.log(`- user.id: ${user?.id}`);
    console.log(`- pageType: ${pageType}`);
    console.log(`- shouldShowDeleteButton: ${shouldShowDeleteButton}`);
    console.log(`- pathname: ${location.pathname}`);
  }, [job, isMyJob, user?.id, pageType, shouldShowDeleteButton, location]);

  return (
    <Card className="flex flex-col">
      {loadingDeleteJob && (
        <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
      )}
      <CardHeader className="flex">
        <CardTitle className="flex justify-between font-bold">
          <div className="flex items-center gap-2">
            {job.title}
            {isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                New
              </span>
            )}
          </div>
          {/* Only show delete icon on Recruiter Dashboard or job detail pages */}
          {shouldShowDeleteButton && (
            <Trash2Icon
              fill="red"
              size={18}
              className="text-red-300 cursor-pointer"
              onClick={handleDeleteJob}
            />
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1">
        <div className="flex justify-between">
          {/* Only show logo if it's not a newly posted job */}
          {job.company && !isNew && job.company.logo_url && (
            <img src={job.company.logo_url} className="h-6" alt={job.company.name || "Company"} />
          )}
          <div className="flex gap-2 items-center">
            <MapPinIcon size={15} /> {job.location}
          </div>
        </div>
        {/* Display company name from either company object or company_name field */}
        {(job.company?.name || job.company_name) && (
          <div className="text-sm text-gray-400">
            Company: {job.company?.name || job.company_name}
          </div>
        )}
        <hr />
        {job.description.substring(0, job.description.indexOf(".") > 0 ? job.description.indexOf(".") : 100)}.
      </CardContent>
      <CardFooter className="flex gap-2">
        <Link to={`/job/${job.id}`} className="flex-1">
          <Button variant="secondary" className="w-full">
            More Details
          </Button>
        </Link>
        {!isMyJob && (
          <Button
            variant="outline"
            className="w-15"
            onClick={handleSaveJob}
            disabled={loadingSavedJob || loadingRemoveSavedJob}
          >
            {saved ? (
              <Heart size={20} fill="red" stroke="red" />
            ) : (
              <Heart size={20} />
            )}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default JobCard;
