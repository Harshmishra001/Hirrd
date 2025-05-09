// Mock applications data for testing
// Initialize empty applications array
export const mockApplications = [];

// Function to clear all applications
export function clearAllApplications() {
  try {
    // Clear the mockApplications array
    mockApplications.length = 0;

    // Clear localStorage
    if (typeof window !== 'undefined') {
      // Clear applications from localStorage
      localStorage.removeItem('mockApplications');
      console.log("Cleared all applications from localStorage");

      // Also clear the permanent record of applied jobs
      localStorage.removeItem('permanentAppliedJobs');
      console.log("Cleared permanent record of applied jobs");

      // Clear most recent application
      localStorage.removeItem('mostRecentApplication');
      console.log("Cleared most recent application");

      // Dispatch event to notify other components
      const event = new CustomEvent('applicationsCleared', {
        detail: { action: 'cleared' }
      });
      window.dispatchEvent(event);
    }

    return true;
  } catch (error) {
    console.error("Error clearing applications:", error);
    return false;
  }
}

// Load existing applications from localStorage on startup
try {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mockApplications');
    if (stored) {
      try {
        const parsedApplications = JSON.parse(stored);
        // Update the mockApplications array with the data from localStorage
        mockApplications.length = 0; // Clear the array
        mockApplications.push(...parsedApplications); // Add all items from localStorage
        console.log("Loaded applications from localStorage on startup:", parsedApplications.length);
      } catch (parseError) {
        console.error("Error parsing applications from localStorage:", parseError);
        // If there's an error parsing, reset the localStorage
        localStorage.setItem('mockApplications', JSON.stringify([]));
      }
    } else {
      console.log("No applications found in localStorage on startup");
    }

    // Update the session time without clearing applications
    localStorage.setItem('lastSessionTime', Date.now().toString());
  }
} catch (error) {
  console.error("Error loading applications on startup:", error);
}

// Function to add an application
export function addApplication(applicationData) {
  try {
    console.log(`Attempting to add application for job ${applicationData.job_id} by user ${applicationData.candidate_id}`);

    // Force reload from localStorage first to ensure we have the latest data
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mockApplications');
        if (stored) {
          try {
            const parsedApplications = JSON.parse(stored);
            // Update the mockApplications array with the latest data
            mockApplications.length = 0; // Clear the array
            mockApplications.push(...parsedApplications); // Add all items from localStorage
            console.log("Reloaded applications from localStorage before adding:", parsedApplications.length);
          } catch (parseError) {
            console.error("Error parsing applications from localStorage:", parseError);
            // If there's an error parsing, reset the localStorage
            localStorage.setItem('mockApplications', JSON.stringify([]));
          }
        } else {
          console.log("No applications found in localStorage");
        }
      }
    } catch (error) {
      console.error("Error reloading applications from localStorage:", error);
    }

    // Validate required fields
    if (!applicationData.job_id || !applicationData.candidate_id) {
      console.error("Missing required fields for application");
      return null;
    }

    // Check if user has already applied to this job
    const existingIndex = mockApplications.findIndex(
      (app) => app.job_id === applicationData.job_id && app.candidate_id === applicationData.candidate_id
    );

    if (existingIndex !== -1) {
      // User has already applied to this job
      console.log("User has already applied to this job");

      // Dispatch event to notify other components
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('applicationUpdated', {
          detail: {
            userId: applicationData.candidate_id,
            action: 'already-exists',
            jobId: applicationData.job_id
          }
        });
        window.dispatchEvent(event);
      }

      return null;
    } else {
      // Create new application with defaults for missing fields
      const newApplication = {
        id: Date.now(),
        experience: applicationData.experience || 0,
        skills: applicationData.skills || "",
        education: applicationData.education || "Graduate",
        job_id: applicationData.job_id,
        candidate_id: applicationData.candidate_id,
        name: applicationData.name || "User",
        created_at: new Date().toISOString(),
        resume: applicationData.resume || "https://example.com/resume.pdf", // Use provided resume URL or default
        resumeFileName: applicationData.resumeFileName || "resume.pdf",
        status: applicationData.status || "applied",
        job: applicationData.job // Store the job data for reference
      };

      mockApplications.push(newApplication);

      // Save to localStorage immediately
      try {
        if (typeof window !== 'undefined') {
          // Make sure we're saving a valid array
          if (Array.isArray(mockApplications)) {
            localStorage.setItem('mockApplications', JSON.stringify(mockApplications));
            console.log("Saved applications to localStorage:", mockApplications.length);
          } else {
            console.error("mockApplications is not an array:", mockApplications);
            // Create a new array with just this application
            const fixedArray = [newApplication];
            localStorage.setItem('mockApplications', JSON.stringify(fixedArray));
            console.log("Created new applications array in localStorage");

            // Update the mockApplications reference
            mockApplications.length = 0;
            mockApplications.push(...fixedArray);
          }

          // Dispatch event to notify other components
          const event = new CustomEvent('applicationUpdated', {
            detail: {
              userId: applicationData.candidate_id,
              action: 'added',
              jobId: applicationData.job_id
            }
          });
          window.dispatchEvent(event);

          // Force a reload of the applications in other components
          setTimeout(() => {
            const reloadEvent = new CustomEvent('forceApplicationReload', {
              detail: {
                userId: applicationData.candidate_id
              }
            });
            window.dispatchEvent(reloadEvent);
          }, 500);
        }
      } catch (error) {
        console.error("Error saving applications to localStorage:", error);
      }

      // Also store in permanent record
      storeAppliedJob(applicationData.job_id, applicationData.candidate_id);

      console.log("Application added successfully:", newApplication);
      return [newApplication];
    }
  } catch (error) {
    console.error("Error adding application:", error);
    return null;
  }
}

// Function to get applications for a user
export function getApplicationsForUser(userId) {
  try {
    console.log(`Getting applications for user ${userId}`);

    if (!userId) {
      console.log("Missing userId in getApplicationsForUser");
      return [];
    }

    // Force reload from localStorage to ensure we have the latest data
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mockApplications');
        if (stored) {
          try {
            const parsedApplications = JSON.parse(stored);
            // Update the mockApplications array with the latest data
            mockApplications.length = 0; // Clear the array
            mockApplications.push(...parsedApplications); // Add all items from localStorage
            console.log("Reloaded applications from localStorage:", parsedApplications.length);
          } catch (parseError) {
            console.error("Error parsing applications from localStorage:", parseError);
            // If there's an error parsing, reset the localStorage
            localStorage.setItem('mockApplications', JSON.stringify([]));
          }
        } else {
          console.log("No applications found in localStorage");
        }
      }
    } catch (error) {
      console.error("Error reloading applications from localStorage:", error);
    }

    const userApplications = mockApplications.filter(app => app.candidate_id === userId);
    console.log(`Found ${userApplications.length} applications for user ${userId}`);

    // Ensure each application has job information
    userApplications.forEach((app, index) => {
      if (!app.job) {
        // If job information is missing, try to find it from mockJobs
        try {
          const { mockJobs } = require('./mock-jobs.js');
          const job = mockJobs.find(j => j.id === app.job_id);
          if (job) {
            app.job = job;
          }
        } catch (error) {
          console.error("Error loading mock jobs:", error);
        }
      }

      // Log application details for debugging
      console.log(`User application ${index + 1}:`, {
        id: app.id,
        job_id: app.job_id,
        job_title: app.job?.title || "Unknown Job",
        company: app.job?.company?.name || "Unknown Company"
      });
    });

    return userApplications;
  } catch (error) {
    console.error("Error getting applications for user:", error);
    return [];
  }
}

// Function to store permanent record of applied jobs
export function storeAppliedJob(jobId, userId) {
  try {
    if (!jobId || !userId) {
      console.log("Missing jobId or userId in storeAppliedJob");
      return false;
    }

    // Get existing applied jobs
    let appliedJobs = [];
    try {
      const stored = localStorage.getItem('permanentAppliedJobs');
      if (stored) {
        appliedJobs = JSON.parse(stored);
        if (!Array.isArray(appliedJobs)) {
          appliedJobs = [];
        }
      }
    } catch (error) {
      console.error("Error getting permanent applied jobs:", error);
    }

    // Check if this job is already in the list
    const numericJobId = typeof jobId === 'string' ? parseInt(jobId, 10) : jobId;
    const exists = appliedJobs.some(item =>
      item.jobId === numericJobId && item.userId === userId
    );

    if (!exists) {
      // Add the job to the list
      appliedJobs.push({
        jobId: numericJobId,
        userId: userId,
        timestamp: Date.now()
      });

      // Save back to localStorage
      localStorage.setItem('permanentAppliedJobs', JSON.stringify(appliedJobs));
      console.log(`Job ${jobId} permanently marked as applied for user ${userId}`);
    }

    return true;
  } catch (error) {
    console.error("Error storing permanent applied job:", error);
    return false;
  }
}

// Function to check if a user has applied to a job
export function hasUserAppliedToJob(jobId, userId) {
  try {
    if (!jobId || !userId) {
      console.log("Missing jobId or userId in hasUserAppliedToJob");
      return false;
    }

    // Convert jobId to number if it's a string
    const numericJobId = typeof jobId === 'string' ? parseInt(jobId, 10) : jobId;

    // Check method 1: Check in mockApplications array
    const hasAppliedInMockArray = mockApplications.some(
      app => {
        const appJobId = typeof app.job_id === 'string' ? parseInt(app.job_id, 10) : app.job_id;
        return appJobId === numericJobId && app.candidate_id === userId;
      }
    );

    // Check method 2: Check in localStorage mockApplications
    let hasAppliedInLocalStorage = false;
    try {
      const stored = localStorage.getItem('mockApplications');
      if (stored) {
        const storedApps = JSON.parse(stored);
        if (Array.isArray(storedApps)) {
          hasAppliedInLocalStorage = storedApps.some(app => {
            const appJobId = typeof app.job_id === 'string' ? parseInt(app.job_id, 10) : app.job_id;
            return appJobId === numericJobId && app.candidate_id === userId;
          });
        }
      }
    } catch (error) {
      console.error("Error checking localStorage for applications:", error);
    }

    // Check method 3: Check in permanent applied jobs record
    let hasAppliedPermanently = false;
    try {
      const stored = localStorage.getItem('permanentAppliedJobs');
      if (stored) {
        const storedJobs = JSON.parse(stored);
        if (Array.isArray(storedJobs)) {
          hasAppliedPermanently = storedJobs.some(item =>
            item.jobId === numericJobId && item.userId === userId
          );
        }
      }
    } catch (error) {
      console.error("Error checking permanent applied jobs:", error);
    }

    // Check method 4: Check in mostRecentApplication
    let hasAppliedRecently = false;
    try {
      const recentAppJson = localStorage.getItem('mostRecentApplication');
      if (recentAppJson) {
        const recentApp = JSON.parse(recentAppJson);
        const recentJobId = typeof recentApp.job_id === 'string' ?
          parseInt(recentApp.job_id, 10) : recentApp.job_id;
        hasAppliedRecently = recentJobId === numericJobId && recentApp.candidate_id === userId;
      }
    } catch (error) {
      console.error("Error checking most recent application:", error);
    }

    // Combine all checks
    const hasApplied = hasAppliedInMockArray || hasAppliedInLocalStorage ||
                       hasAppliedPermanently || hasAppliedRecently;

    console.log(`User ${userId} has${hasApplied ? '' : ' not'} applied to job ${jobId} (Combined check)`);
    console.log(`- Mock array: ${hasAppliedInMockArray}`);
    console.log(`- localStorage: ${hasAppliedInLocalStorage}`);
    console.log(`- Permanent record: ${hasAppliedPermanently}`);
    console.log(`- Recent application: ${hasAppliedRecently}`);

    return hasApplied;
  } catch (error) {
    console.error("Error checking if user has applied:", error);
    return false;
  }
}

// Function to update application status
export function updateApplicationStatus(jobId, status) {
  try {
    console.log(`Updating status for job ${jobId} to ${status}`);

    // Convert jobId to number if it's a string
    const numericJobId = typeof jobId === 'string' ? parseInt(jobId, 10) : jobId;

    // Find applications for this job
    const applications = mockApplications.filter(app => {
      const appJobId = typeof app.job_id === 'string' ? parseInt(app.job_id, 10) : app.job_id;
      return appJobId === numericJobId;
    });

    // Update status for all applications for this job
    applications.forEach(app => {
      app.status = status;
    });

    // Save updated applications to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('mockApplications', JSON.stringify(mockApplications));
      console.log(`Updated status for ${applications.length} applications to ${status}`);

      // Dispatch event to notify other components
      const event = new CustomEvent('applicationUpdated', {
        detail: { jobId: numericJobId, status, action: 'statusUpdated' }
      });
      window.dispatchEvent(event);
    }

    return applications;
  } catch (error) {
    console.error("Error updating application status:", error);
    return [];
  }
}

// Function to get applications for a specific job
export function getApplicationsForJob(jobId) {
  try {
    console.log(`Getting applications for job ${jobId}`);

    if (!jobId) {
      console.log("Missing jobId in getApplicationsForJob");
      return [];
    }

    // Convert jobId to number if it's a string
    const numericJobId = typeof jobId === 'string' ? parseInt(jobId, 10) : jobId;

    // Force reload from localStorage to ensure we have the latest data
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem('mockApplications');
        if (stored) {
          try {
            const parsedApplications = JSON.parse(stored);
            // Update the mockApplications array with the latest data
            mockApplications.length = 0; // Clear the array
            mockApplications.push(...parsedApplications); // Add all items from localStorage
            console.log("Reloaded applications from localStorage:", parsedApplications.length);
          } catch (parseError) {
            console.error("Error parsing applications from localStorage:", parseError);
            // If there's an error parsing, reset the localStorage
            localStorage.setItem('mockApplications', JSON.stringify([]));
          }
        } else {
          console.log("No applications found in localStorage");
        }
      }
    } catch (error) {
      console.error("Error reloading applications from localStorage:", error);
    }

    // Filter applications for this job
    const jobApplications = mockApplications.filter(app => {
      const appJobId = typeof app.job_id === 'string' ? parseInt(app.job_id, 10) : app.job_id;
      return appJobId === numericJobId;
    });

    console.log(`Found ${jobApplications.length} applications for job ${jobId}`);

    return jobApplications;
  } catch (error) {
    console.error("Error getting applications for job:", error);
    return [];
  }
}
