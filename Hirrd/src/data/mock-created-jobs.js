// Functions to manage locally created jobs

// Get all locally created jobs
export const getLocallyCreatedJobs = () => {
  try {
    const storedJobs = localStorage.getItem('mockCreatedJobs');
    if (storedJobs) {
      return JSON.parse(storedJobs);
    }
    return [];
  } catch (error) {
    console.error('Error getting locally created jobs:', error);
    return [];
  }
};

// Get a single locally created job by ID
export const getLocallyCreatedJob = (jobId) => {
  try {
    const storedJobs = localStorage.getItem('mockCreatedJobs');
    if (storedJobs) {
      const jobs = JSON.parse(storedJobs);
      return jobs.find(job => job.id === parseInt(jobId));
    }
    return null;
  } catch (error) {
    console.error('Error getting locally created job:', error);
    return null;
  }
};

// Add a new locally created job
export const addLocallyCreatedJob = (job) => {
  try {
    // Make sure the job has all required fields for display
    const completeJob = {
      ...job,
      // Store company_name directly in the job object
      company_name: job.company_name || (job.company ? job.company.name : ""),
      // Use the company name from job data or job.company
      company: job.company || {
        name: job.company_name || "",
        logo_url: "/companies/default.png"
      },
      // Add empty arrays for saved and applications if missing
      saved: job.saved || [],
      applications: job.applications || []
    };

    // Get existing jobs
    const existingJobs = getLocallyCreatedJobs();

    // Check if job already exists (by ID)
    const jobExists = existingJobs.some(existingJob => existingJob.id === completeJob.id);

    // If job doesn't exist, add it
    if (!jobExists) {
      const updatedJobs = [completeJob, ...existingJobs];
      localStorage.setItem('mockCreatedJobs', JSON.stringify(updatedJobs));
      console.log('Job added to locally created jobs:', completeJob);

      // Dispatch an event to notify other components
      if (typeof window !== 'undefined') {
        const event = new CustomEvent('localJobsUpdated', {
          detail: { action: 'added', job: completeJob }
        });
        window.dispatchEvent(event);
      }

      return updatedJobs;
    }

    return existingJobs;
  } catch (error) {
    console.error('Error adding locally created job:', error);
    return [];
  }
};

// Remove a locally created job
export const removeLocallyCreatedJob = (jobId) => {
  try {
    const existingJobs = getLocallyCreatedJobs();
    const updatedJobs = existingJobs.filter(job => job.id !== jobId);
    localStorage.setItem('mockCreatedJobs', JSON.stringify(updatedJobs));

    // Dispatch an event to notify other components
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('localJobsUpdated', {
        detail: { action: 'removed', jobId }
      });
      window.dispatchEvent(event);
    }

    return updatedJobs;
  } catch (error) {
    console.error('Error removing locally created job:', error);
    return [];
  }
};

// Clear all locally created jobs
export const clearLocallyCreatedJobs = () => {
  try {
    localStorage.removeItem('mockCreatedJobs');

    // Dispatch an event to notify other components
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('localJobsUpdated', {
        detail: { action: 'cleared' }
      });
      window.dispatchEvent(event);
    }

    return [];
  } catch (error) {
    console.error('Error clearing locally created jobs:', error);
    return [];
  }
};
