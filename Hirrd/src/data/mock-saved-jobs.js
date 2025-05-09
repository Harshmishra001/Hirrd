// Mock saved jobs data for testing
// Load saved jobs from localStorage if available
let storedSavedJobs = [];
try {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('mockSavedJobs');
    if (stored) {
      storedSavedJobs = JSON.parse(stored);
      console.log("Loaded saved jobs from localStorage:", storedSavedJobs.length);
    }
  }
} catch (error) {
  console.error("Error loading saved jobs from localStorage:", error);
}

export const mockSavedJobs = storedSavedJobs || [];

// Function to add a job to saved jobs
export function addToSavedJobs(job, userId) {
  console.log(`Attempting to save job ${job.id} for user ${userId}`);
  console.log("Job data being saved:", job);

  // Force reload from localStorage first to ensure we have the latest data
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mockSavedJobs');
      if (stored) {
        try {
          const parsedSavedJobs = JSON.parse(stored);
          // Update the mockSavedJobs array with the latest data
          mockSavedJobs.length = 0; // Clear the array
          mockSavedJobs.push(...parsedSavedJobs); // Add all items from localStorage
          console.log("Reloaded saved jobs from localStorage before adding:", parsedSavedJobs.length);
        } catch (parseError) {
          console.error("Error parsing saved jobs from localStorage:", parseError);
          // If there's an error parsing, reset the localStorage
          localStorage.setItem('mockSavedJobs', JSON.stringify([]));
        }
      } else {
        console.log("No saved jobs found in localStorage, initializing empty array");
        localStorage.setItem('mockSavedJobs', JSON.stringify([]));
      }
    }
  } catch (error) {
    console.error("Error reloading saved jobs from localStorage:", error);
  }

  // Check if job is already saved
  const existingIndex = mockSavedJobs.findIndex(
    (saved) => saved.job_id === job.id && saved.user_id === userId
  );

  console.log(`Job ${job.id} already saved:`, existingIndex !== -1);

  // If job is already saved, just return it without making changes
  if (existingIndex !== -1) {
    console.log(`Job ${job.id} is already saved, keeping it saved`);
    return [mockSavedJobs[existingIndex]];
  } else {
    // If job is not saved, add it
    const newSavedJob = {
      id: Date.now(),
      job_id: job.id,
      user_id: userId,
      created_at: new Date().toISOString(),
      job: job
    };

    console.log("New saved job object:", newSavedJob);

    // Make sure the job object is properly serializable
    try {
      JSON.stringify(newSavedJob);
      console.log("New saved job is serializable");
    } catch (error) {
      console.error("New saved job is not serializable:", error);
      // Create a simplified version of the job
      newSavedJob.job = {
        id: job.id,
        title: job.title || "Unknown Job",
        description: job.description || "",
        location: job.location || "",
        company: job.company ? {
          name: job.company.name || "Unknown Company",
          logo_url: job.company.logo_url || ""
        } : { name: "Unknown Company", logo_url: "" }
      };
      console.log("Created simplified job object:", newSavedJob.job);
    }

    // Add to the array
    mockSavedJobs.push(newSavedJob);
    console.log(`Added job ${job.id} to saved jobs, total:`, mockSavedJobs.length);
    console.log("Current mockSavedJobs array:", mockSavedJobs);

    // Save to localStorage immediately
    try {
      if (typeof window !== 'undefined') {
        const jsonString = JSON.stringify(mockSavedJobs);
        console.log("Saving to localStorage, JSON string length:", jsonString.length);
        localStorage.setItem('mockSavedJobs', jsonString);
        console.log("Saved jobs updated in localStorage after addition");

        // Verify the data was saved correctly
        const verifyStored = localStorage.getItem('mockSavedJobs');
        if (verifyStored) {
          const verifyParsed = JSON.parse(verifyStored);
          console.log("Verified saved jobs in localStorage:", verifyParsed.length);
          console.log("Verified saved jobs data:", verifyParsed);

          // Dispatch a custom event to notify other components
          const event = new CustomEvent('savedJobsUpdated', {
            detail: { userId, action: 'added', jobId: job.id }
          });
          window.dispatchEvent(event);
          console.log("Dispatched savedJobsUpdated event");
        } else {
          console.error("Failed to verify saved jobs in localStorage");
        }
      }
    } catch (error) {
      console.error("Error saving jobs to localStorage:", error);
      console.error(error);
    }

    return [newSavedJob];
  }
}

// Function to remove a saved job
export function removeSavedJob(jobId, userId) {
  console.log(`Attempting to remove saved job ${jobId} for user ${userId}`);

  // Force reload from localStorage first to ensure we have the latest data
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mockSavedJobs');
      if (stored) {
        try {
          const parsedSavedJobs = JSON.parse(stored);
          // Update the mockSavedJobs array with the latest data
          mockSavedJobs.length = 0; // Clear the array
          mockSavedJobs.push(...parsedSavedJobs); // Add all items from localStorage
          console.log("Reloaded saved jobs from localStorage before removing:", parsedSavedJobs.length);
        } catch (parseError) {
          console.error("Error parsing saved jobs from localStorage:", parseError);
          // If there's an error parsing, reset the localStorage
          localStorage.setItem('mockSavedJobs', JSON.stringify([]));
        }
      } else {
        console.log("No saved jobs found in localStorage");
      }
    }
  } catch (error) {
    console.error("Error reloading saved jobs from localStorage:", error);
  }

  // Check if job is already saved
  const existingIndex = mockSavedJobs.findIndex(
    (saved) => saved.job_id === jobId && saved.user_id === userId
  );

  if (existingIndex !== -1) {
    // If job is saved, remove it
    mockSavedJobs.splice(existingIndex, 1);
    console.log(`Removed job ${jobId} from saved jobs`);

    // Save to localStorage immediately
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem('mockSavedJobs', JSON.stringify(mockSavedJobs));
        console.log("Saved jobs updated in localStorage after removal, remaining:", mockSavedJobs.length);

        // Dispatch a custom event to notify other components
        const event = new CustomEvent('savedJobsUpdated', {
          detail: { userId, action: 'removed', jobId: jobId }
        });
        window.dispatchEvent(event);
      }
    } catch (error) {
      console.error("Error saving jobs to localStorage:", error);
    }

    return true;
  }

  return false;
}

// Function to get saved jobs for a user
export function getSavedJobsForUser(userId) {
  console.log(`Getting saved jobs for user ${userId}`);

  // Force reload from localStorage to ensure we have the latest data
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mockSavedJobs');
      console.log("Raw localStorage data for saved jobs:", stored);

      if (stored) {
        try {
          const parsedSavedJobs = JSON.parse(stored);
          console.log("Parsed saved jobs from localStorage:", parsedSavedJobs);

          // Update the mockSavedJobs array with the latest data
          mockSavedJobs.length = 0; // Clear the array
          mockSavedJobs.push(...parsedSavedJobs); // Add all items from localStorage
          console.log("Reloaded saved jobs from localStorage:", parsedSavedJobs.length);
        } catch (parseError) {
          console.error("Error parsing saved jobs from localStorage:", parseError);
          // If there's an error parsing, reset the localStorage
          localStorage.setItem('mockSavedJobs', JSON.stringify([]));
        }
      } else {
        console.log("No saved jobs found in localStorage, initializing empty array");
        localStorage.setItem('mockSavedJobs', JSON.stringify([]));
      }
    }
  } catch (error) {
    console.error("Error reloading saved jobs from localStorage:", error);
  }

  console.log("Current mockSavedJobs array:", mockSavedJobs);
  console.log("Looking for user ID:", userId);

  const userSavedJobs = mockSavedJobs.filter(saved => saved.user_id === userId);
  console.log(`Found ${userSavedJobs.length} saved jobs for user ${userId}`);
  console.log("User saved jobs:", userSavedJobs);

  // Log each saved job for debugging
  if (userSavedJobs.length > 0) {
    userSavedJobs.forEach((saved, index) => {
      console.log(`User saved job ${index + 1}:`, {
        id: saved.id,
        job_id: saved.job_id,
        job_title: saved.job?.title || "Unknown Job",
        company: saved.job?.company?.name || "Unknown Company"
      });
    });
  } else {
    console.log("No saved jobs found for user", userId);
  }

  return userSavedJobs;
}

// Function to check if a job is saved by a user
export function isJobSavedByUser(jobId, userId) {
  console.log(`Checking if job ${jobId} is saved by user ${userId}`);

  // Force reload from localStorage to ensure we have the latest data
  try {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('mockSavedJobs');
      console.log("Raw localStorage data for checking saved job:", stored);

      if (stored) {
        try {
          const parsedSavedJobs = JSON.parse(stored);
          console.log("Parsed saved jobs from localStorage for checking:", parsedSavedJobs);

          // Update the mockSavedJobs array with the latest data
          mockSavedJobs.length = 0; // Clear the array
          mockSavedJobs.push(...parsedSavedJobs); // Add all items from localStorage
          console.log("Reloaded saved jobs from localStorage for checking:", parsedSavedJobs.length);
        } catch (parseError) {
          console.error("Error parsing saved jobs from localStorage:", parseError);
          // If there's an error parsing, reset the localStorage
          localStorage.setItem('mockSavedJobs', JSON.stringify([]));
        }
      } else {
        console.log("No saved jobs found in localStorage, initializing empty array");
        localStorage.setItem('mockSavedJobs', JSON.stringify([]));
      }
    }
  } catch (error) {
    console.error("Error reloading saved jobs from localStorage:", error);
  }

  console.log("Current mockSavedJobs array for checking:", mockSavedJobs);
  console.log("Looking for job ID:", jobId, "and user ID:", userId);

  const isSaved = mockSavedJobs.some(
    saved => saved.job_id === jobId && saved.user_id === userId
  );

  console.log(`Job ${jobId} is${isSaved ? '' : ' not'} saved by user ${userId}`);
  return isSaved;
}
