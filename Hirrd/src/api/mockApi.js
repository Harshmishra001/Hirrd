import companies from '../data/companies.json';
import { mockJobs } from '../data/mock-jobs';
import { getStoredToken, verifyToken } from '../utils/auth';

// Helper function to get current user from token
const getCurrentUser = () => {
  const token = getStoredToken();
  if (!token) return null;
  return verifyToken(token);
};

// Helper function to simulate API delay
const delay = (ms = 100) => new Promise(resolve => setTimeout(resolve, ms));

// Jobs API
export const getJobs = async (token, { location, company_id, searchQuery } = {}) => {
  await delay();
  
  let jobs = [...mockJobs];
  
  // Apply filters
  if (location) {
    jobs = jobs.filter(job => job.location.toLowerCase().includes(location.toLowerCase()));
  }
  
  if (company_id) {
    jobs = jobs.filter(job => job.company_id === company_id);
  }
  
  if (searchQuery) {
    jobs = jobs.filter(job => 
      job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }
  
  // Add saved status for current user
  const currentUser = getCurrentUser();
  if (currentUser) {
    const savedJobs = JSON.parse(localStorage.getItem(`savedJobs_${currentUser.id}`) || '[]');
    jobs = jobs.map(job => ({
      ...job,
      saved: savedJobs.includes(job.id) ? [{ id: 1 }] : []
    }));
  }
  
  return jobs;
};

export const getSavedJobs = async (token) => {
  await delay();
  
  const currentUser = getCurrentUser();
  if (!currentUser) return [];
  
  const savedJobIds = JSON.parse(localStorage.getItem(`savedJobs_${currentUser.id}`) || '[]');
  const savedJobs = mockJobs
    .filter(job => savedJobIds.includes(job.id))
    .map(job => ({
      id: `saved_${job.id}`,
      job: job
    }));
  
  return savedJobs;
};

export const getSingleJob = async (token, { job_id }) => {
  await delay();
  
  const job = mockJobs.find(j => j.id === parseInt(job_id));
  if (!job) return null;
  
  // Add applications data
  const currentUser = getCurrentUser();
  const applications = JSON.parse(localStorage.getItem(`applications_${job.id}`) || '[]');
  
  return {
    ...job,
    applications: applications
  };
};

export const saveJob = async (token, { alreadySaved }, saveData) => {
  await delay();
  
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Not authenticated');
  
  const savedJobs = JSON.parse(localStorage.getItem(`savedJobs_${currentUser.id}`) || '[]');
  
  if (!savedJobs.includes(saveData.job_id)) {
    savedJobs.push(saveData.job_id);
    localStorage.setItem(`savedJobs_${currentUser.id}`, JSON.stringify(savedJobs));
  }
  
  return [{ id: 1, job_id: saveData.job_id, user_id: currentUser.id }];
};

export const removeSavedJob = async (token, { job_id, user_id }) => {
  await delay();
  
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Not authenticated');
  
  const savedJobs = JSON.parse(localStorage.getItem(`savedJobs_${currentUser.id}`) || '[]');
  const updatedSavedJobs = savedJobs.filter(id => id !== job_id);
  localStorage.setItem(`savedJobs_${currentUser.id}`, JSON.stringify(updatedSavedJobs));
  
  return [{ id: 1, job_id, user_id }];
};

export const updateHiringStatus = async (token, { job_id }, isOpen) => {
  await delay();
  
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Not authenticated');
  
  // Update in mock jobs (this would be persistent in a real app)
  const jobIndex = mockJobs.findIndex(job => job.id === job_id);
  if (jobIndex !== -1) {
    mockJobs[jobIndex].isOpen = isOpen;
  }
  
  return [{ id: job_id, isOpen }];
};

export const getMyJobs = async (token, { recruiter_id }) => {
  await delay();
  
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Not authenticated');
  
  // Get jobs created by this recruiter
  const myJobs = mockJobs.filter(job => job.recruiter_id === recruiter_id);
  
  // Also get jobs from localStorage (newly created ones)
  const createdJobs = JSON.parse(localStorage.getItem('mockCreatedJobs') || '[]');
  const userCreatedJobs = createdJobs.filter(job => job.recruiter_id === recruiter_id);
  
  return [...myJobs, ...userCreatedJobs];
};

export const deleteJob = async (token, { job_id }) => {
  await delay();
  
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Not authenticated');
  
  // Remove from localStorage created jobs
  const createdJobs = JSON.parse(localStorage.getItem('mockCreatedJobs') || '[]');
  const updatedJobs = createdJobs.filter(job => job.id !== job_id);
  localStorage.setItem('mockCreatedJobs', JSON.stringify(updatedJobs));
  
  return [{ id: job_id }];
};

export const updateJob = async (token, { job_id }, jobData) => {
  await delay();
  
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Not authenticated');
  
  // Update in localStorage created jobs
  const createdJobs = JSON.parse(localStorage.getItem('mockCreatedJobs') || '[]');
  const updatedJobs = createdJobs.map(job => {
    if (job.id === job_id) {
      return { ...job, ...jobData };
    }
    return job;
  });
  localStorage.setItem('mockCreatedJobs', JSON.stringify(updatedJobs));
  
  const updatedJob = updatedJobs.find(job => job.id === job_id);
  return updatedJob ? [updatedJob] : [];
};

export const addNewJob = async (token, _, jobData) => {
  await delay();
  
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Not authenticated');
  
  // Validate required fields
  if (!jobData.title) throw new Error('Job title is required');
  if (!jobData.description) throw new Error('Job description is required');
  if (!jobData.location) throw new Error('Job location is required');
  if (!jobData.requirements) throw new Error('Job requirements are required');
  
  // Create new job
  const newJob = {
    id: Date.now(), // Simple ID generation
    title: jobData.title,
    description: jobData.description,
    location: jobData.location,
    requirements: jobData.requirements,
    recruiter_id: currentUser.id,
    isOpen: true,
    created_at: new Date().toISOString(),
    company: {
      name: jobData.company_name || 'Your Company',
      logo_url: '/companies/default.png'
    },
    saved: [],
    applications: []
  };
  
  // Store in localStorage
  const createdJobs = JSON.parse(localStorage.getItem('mockCreatedJobs') || '[]');
  createdJobs.push(newJob);
  localStorage.setItem('mockCreatedJobs', JSON.stringify(createdJobs));
  
  return [newJob];
};

// Companies API
export const getCompanies = async (token) => {
  await delay();
  return companies.map(company => ({
    id: company.id,
    name: company.name,
    logo_url: company.path
  }));
};

// Applications API
export const applyToJob = async (token, { job_id }, applicationData) => {
  await delay();
  
  const currentUser = getCurrentUser();
  if (!currentUser) throw new Error('Not authenticated');
  
  const application = {
    id: Date.now(),
    job_id: parseInt(job_id),
    candidate_id: currentUser.id,
    status: 'applied',
    created_at: new Date().toISOString(),
    ...applicationData
  };
  
  // Store application
  const applications = JSON.parse(localStorage.getItem(`applications_${job_id}`) || '[]');
  applications.push(application);
  localStorage.setItem(`applications_${job_id}`, JSON.stringify(applications));
  
  // Also store in user's applications
  const userApplications = JSON.parse(localStorage.getItem(`userApplications_${currentUser.id}`) || '[]');
  userApplications.push(application);
  localStorage.setItem(`userApplications_${currentUser.id}`, JSON.stringify(userApplications));
  
  return [application];
};

export const getApplicationsForJob = async (token, { job_id }) => {
  await delay();
  
  const applications = JSON.parse(localStorage.getItem(`applications_${job_id}`) || '[]');
  return applications;
};

export const updateApplicationStatus = async (token, { application_id }, status) => {
  await delay();
  
  // This would need to be implemented based on your needs
  // For now, just return a mock response
  return [{ id: application_id, status }];
};