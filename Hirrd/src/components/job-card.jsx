/* eslint-disable react/prop-types */
import { updateApplicationStatus as apiUpdateApplicationStatus } from "@/api/apiApplication";
import { removeSavedJob as apiRemoveSavedJob, deleteJob, saveJob, updateJob } from "@/api/apiJobs";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/clerk-react";
import { Briefcase, Heart, MapPinIcon, PencilIcon, Trash2Icon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { getApplicationsForJob, updateApplicationStatus } from "../data/mock-applications.js";
import { addToSavedJobs, isJobSavedByUser, removeSavedJob } from "../data/mock-saved-jobs.js";
import EditJobModal from "./EditJobModal";
import { Button } from "./ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "./ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";

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
  isUpdated = false, // New prop to indicate if the job was recently updated
  showDeleteButton = false, // New prop to control delete button visibility
  pageType = "jobs", // New prop to indicate which page the card is on: "jobs", "dashboard", "detail"
}) => {
  const [saved, setSaved] = useState(savedInit);
  const [applications, setApplications] = useState([]);
  const [showApplications, setShowApplications] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
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

  // For updating application status
  const {
    loading: loadingUpdateStatus,
    fn: fnUpdateStatus,
  } = useFetch(apiUpdateApplicationStatus, {
    job_id: job.id,
  });

  const {
    loading: loadingUpdateJob,
    fn: fnUpdateJob,
  } = useFetch(updateJob, {
    job_id: job.id,
  });

  // Function to handle application status updates
  const handleStatusChange = (jobId, value) => {
    // Update application status in mock data
    updateApplicationStatus(jobId, value);

    // Also try to update via API
    fnUpdateStatus(value).catch(error => {
      console.log("API update failed, but mock data already updated:", error);
    });

    // Reload applications
    const updatedApplications = getApplicationsForJob(job.id);
    setApplications(updatedApplications);
  };

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

  const handleEditJob = async (updatedJobData) => {
    try {
      console.log("Updating job:", job.id, updatedJobData);

      // Close the modal
      setShowEditModal(false);

      // Make sure to preserve important fields that shouldn't be lost during update
      const preservedData = {
        ...updatedJobData,
        id: job.id,
        recruiter_id: job.recruiter_id,
        isOpen: job.isOpen !== undefined ? job.isOpen : true,
        applications: job.applications || [],
        saved: job.saved || []
      };

      // Try to update via API
      try {
        await fnUpdateJob(preservedData);
        console.log("Job updated via API successfully");
      } catch (apiError) {
        console.error("Error updating job via API:", apiError);
        // Continue with localStorage update even if API fails
      }

      // Also update in localStorage
      if (typeof window !== 'undefined') {
        try {
          const storedJobs = localStorage.getItem('mockCreatedJobs');
          if (storedJobs) {
            const jobs = JSON.parse(storedJobs);
            const updatedJobs = jobs.map(j => {
              if (j.id === job.id) {
                // Preserve important fields from the original job
                return {
                  ...j,
                  ...preservedData,
                  // Make sure these fields are preserved
                  company: j.company || preservedData.company,
                  company_name: preservedData.company_name || j.company_name,
                  recruiter_id: j.recruiter_id,
                  // Ensure PIN code and phone number are preserved
                  pin_code: preservedData.pin_code || j.pin_code || "",
                  phone_number: preservedData.phone_number || j.phone_number || ""
                };
              }
              return j;
            });
            localStorage.setItem('mockCreatedJobs', JSON.stringify(updatedJobs));
            console.log("Job updated in localStorage");

            // Also update the job in mockJobs if it exists there
            try {
              const mockJobsStr = localStorage.getItem('mockJobs');
              if (mockJobsStr) {
                const mockJobs = JSON.parse(mockJobsStr);
                const updatedMockJobs = mockJobs.map(j => {
                  if (j.id === job.id) {
                    return {
                      ...j,
                      ...preservedData,
                      company: j.company || preservedData.company,
                      company_name: preservedData.company_name || j.company_name,
                      pin_code: preservedData.pin_code || j.pin_code || "",
                      phone_number: preservedData.phone_number || j.phone_number || ""
                    };
                  }
                  return j;
                });
                localStorage.setItem('mockJobs', JSON.stringify(updatedMockJobs));
                console.log("Job also updated in mockJobs if it existed there");
              }
            } catch (mockJobsError) {
              console.error("Error updating job in mockJobs:", mockJobsError);
            }
          }
        } catch (localStorageError) {
          console.error("Error updating job in localStorage:", localStorageError);
        }

        // Dispatch an event to notify other components
        const event = new CustomEvent('localJobsUpdated', {
          detail: { action: 'updated', jobId: job.id }
        });
        window.dispatchEvent(event);

        // Store the updated job ID in localStorage so the jobs page can highlight it
        localStorage.setItem('lastUpdatedJobId', job.id.toString());
        localStorage.setItem('jobUpdatedTimestamp', Date.now().toString());

        console.log("Job updated successfully:", job.id);
      }

      // Call the callback to refresh the job list with "edit" action
      if (typeof onJobAction === 'function') {
        onJobAction("edit");
      }
    } catch (error) {
      console.error("Error in handleEditJob:", error);
    }
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
    } else if (user && job && job.id) {
      // If API fails, check in mock data
      try {
        const isSaved = isJobSavedByUser(job.id, user.id);
        setSaved(isSaved || savedInit);
      } catch (error) {
        console.error("Error checking saved status in API response:", error);
        setSaved(savedInit);
      }
    }
  }, [savedJob, user, job, savedInit]);

  // Initialize saved state from mock data on component mount
  useEffect(() => {
    if (user && job && job.id) {
      try {
        const isSaved = isJobSavedByUser(job.id, user.id);
        console.log(`Job ${job.id} saved status on mount:`, isSaved);
        setSaved(isSaved);
      } catch (error) {
        console.error("Error checking saved status:", error);
        setSaved(savedInit);
      }
    }
  }, [user, job, savedInit]);

  // Check saved status periodically to ensure heart icon stays in sync
  useEffect(() => {
    if (user && job && job.id) {
      // Set up an interval to check saved status every 5 seconds
      // Use a longer interval to avoid too many updates
      const intervalId = setInterval(() => {
        try {
          const isSaved = isJobSavedByUser(job.id, user.id);
          if (isSaved !== saved) {
            console.log(`Job ${job.id} saved status changed from ${saved} to ${isSaved}`);
            setSaved(isSaved);
          }
        } catch (error) {
          console.error("Error checking saved status in interval:", error);
        }
      }, 5000);

      // Clean up interval on unmount
      return () => clearInterval(intervalId);
    }
  }, [user, job, saved]);

  // Log when saved state changes
  useEffect(() => {
    if (job && job.id) {
      console.log(`Job ${job.id} heart icon state:`, saved ? 'RED' : 'normal');
    }
  }, [saved, job]);

  // Load applications for this job if it's in the recruiter dashboard
  useEffect(() => {
    if (isMyJob && pageType === "dashboard" && job && job.id) {
      const loadApplications = () => {
        try {
          const jobApplications = getApplicationsForJob(job.id);
          setApplications(jobApplications || []);
        } catch (error) {
          console.error("Error loading applications:", error);
          setApplications([]);
        }
      };

      // Load applications initially
      loadApplications();

      // Set up event listeners to reload applications when they change
      const handleApplicationUpdated = (event) => {
        if (event.detail && event.detail.jobId === job.id) {
          console.log(`Application updated for job ${job.id}, reloading applications`);
          loadApplications();
        }
      };

      const handleApplicationsCleared = () => {
        console.log("All applications cleared, reloading applications");
        loadApplications();
      };

      // Add event listeners
      window.addEventListener('applicationUpdated', handleApplicationUpdated);
      window.addEventListener('applicationsCleared', handleApplicationsCleared);

      // Clean up event listeners
      return () => {
        window.removeEventListener('applicationUpdated', handleApplicationUpdated);
        window.removeEventListener('applicationsCleared', handleApplicationsCleared);
      };
    }
  }, [isMyJob, pageType, job.id]);

  // Debug job properties on mount
  useEffect(() => {
    if (job) {
      console.log(`Job Card mounted for job ${job.id} (${job.title || 'No Title'}):`);
      console.log(`- recruiter_id: ${job.recruiter_id}`);
      console.log(`- isMyJob: ${isMyJob}`);
      console.log(`- user.id: ${user?.id}`);
      console.log(`- pageType: ${pageType}`);
      console.log(`- shouldShowDeleteButton: ${shouldShowDeleteButton}`);
      console.log(`- pathname: ${location.pathname}`);
      if (isMyJob && pageType === "dashboard") {
        console.log(`- applications: ${applications.length}`);
      }
    }
  }, [job, isMyJob, user?.id, pageType, shouldShowDeleteButton, location, applications.length]);

  // If job is undefined or null, don't render anything
  if (!job) {
    return null;
  }

  return (
    <Card className={`flex flex-col ${isUpdated ? 'border-2 border-blue-500 shadow-lg shadow-blue-500/20' : ''}`}>
      {/* Edit Job Modal */}
      <EditJobModal
        job={job}
        isOpen={showEditModal}
        onSave={handleEditJob}
        onCancel={() => setShowEditModal(false)}
      />

      {(loadingDeleteJob || loadingUpdateJob) && (
        <BarLoader className="mt-4" width={"100%"} color="#36d7b7" />
      )}
      <CardHeader className="flex">
        <CardTitle className="flex justify-between font-bold">
          <div className="flex items-center gap-2">
            {job.title || "Untitled Job"}
            {isNew && (
              <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full">
                New
              </span>
            )}
            {isUpdated && (
              <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                Updated
              </span>
            )}
          </div>
          {/* Only show edit and delete icons on Recruiter Dashboard or job detail pages */}
          {shouldShowDeleteButton && (
            <div className="flex gap-2">
              <PencilIcon
                size={18}
                className="text-blue-300 cursor-pointer"
                onClick={() => setShowEditModal(true)}
              />
              <Trash2Icon
                fill="red"
                size={18}
                className="text-red-300 cursor-pointer"
                onClick={handleDeleteJob}
              />
            </div>
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
            <MapPinIcon size={15} /> {job.location || "Remote"}
            {job.pin_code && job.pin_code.trim() !== "" && <span className="ml-1 text-xs text-gray-400">({job.pin_code})</span>}
          </div>
        </div>
        {/* Display company name from either company object or company_name field */}
        {(job.company?.name || job.company_name) && (
          <div className="text-sm text-gray-400">
            Company: {job.company?.name || job.company_name}
          </div>
        )}

        {/* Display phone number if available and not empty */}
        {job.phone_number && job.phone_number.trim() !== "" && (
          <div className="text-sm text-gray-400 flex items-center gap-1">
            <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
            </svg>
            Contact: {job.phone_number}
          </div>
        )}

        {/* Show applications count for recruiter's own jobs */}
        {isMyJob && pageType === "dashboard" && (
          <div className="flex justify-between items-center">
            <div className="flex gap-2 items-center text-sm">
              <Briefcase size={15} />
              <span>{applications.length} Applicant{applications.length !== 1 ? 's' : ''}</span>
            </div>
            {applications.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowApplications(!showApplications)}
              >
                {showApplications ? 'Hide' : 'View'} Applicants
              </Button>
            )}
          </div>
        )}

        {/* Show applications list if toggled */}
        {isMyJob && pageType === "dashboard" && showApplications && applications.length > 0 && (
          <div className="mt-2 p-2 bg-gray-800 rounded-md">
            <h4 className="font-bold mb-2">Applicants:</h4>
            <ul className="space-y-2">
              {applications.map(app => (
                <li key={app.id} className="text-sm p-2 bg-gray-700 rounded">
                  <div className="flex justify-between items-center mb-1">
                    <div className="font-semibold">{app.name}</div>
                    <Select
                      defaultValue={app.status || 'applied'}
                      onValueChange={(value) => handleStatusChange(app.job_id, value)}
                    >
                      <SelectTrigger className="w-28 h-6 text-xs">
                        <SelectValue placeholder="Status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="applied">Applied</SelectItem>
                        <SelectItem value="interviewing">Interviewing</SelectItem>
                        <SelectItem value="hired">Hired</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="text-xs text-gray-400 mb-2">
                    {app.experience} years • {app.education} • {app.skills}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-400">
                      Applied: {new Date(app.created_at).toLocaleDateString()}
                    </div>
                    {app.resume && (
                      <a
                        href={app.resume}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-blue-400 hover:text-blue-300"
                      >
                        View Resume
                      </a>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}

        <hr />
        {job.description ?
          job.description.substring(0, job.description.indexOf(".") > 0 ? job.description.indexOf(".") : 100) + "."
          : "No description available."}
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
