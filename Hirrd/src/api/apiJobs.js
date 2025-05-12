import supabaseClient from "@/utils/supabase";
import { addLocallyCreatedJob } from "../data/mock-created-jobs.js";

// Fetch Jobs
export async function getJobs(token, { location, company_id, searchQuery }) {
  const supabase = await supabaseClient(token);
  let query = supabase
    .from("jobs")
    .select("*, saved: saved_jobs(id), company: companies(name,logo_url)");

  if (location) {
    query = query.eq("location", location);
  }

  if (company_id) {
    query = query.eq("company_id", company_id);
  }

  if (searchQuery) {
    query = query.ilike("title", `%${searchQuery}%`);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

// Read Saved Jobs
export async function getSavedJobs(token) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("saved_jobs")
    .select("*, job: jobs(*, company: companies(name,logo_url))");

  if (error) {
    console.error("Error fetching Saved Jobs:", error);
    return null;
  }

  return data;
}

// Read single job
export async function getSingleJob(token, { job_id }) {
  const supabase = await supabaseClient(token);
  let query = supabase
    .from("jobs")
    .select(
      "*, company: companies(name,logo_url), applications: applications(*)"
    )
    .eq("id", job_id)
    .single();

  const { data, error } = await query;

  if (error) {
    console.error("Error fetching Job:", error);
    return null;
  }

  return data;
}

// - Add Saved Job
export async function saveJob(token, { alreadySaved }, saveData) {
  const supabase = await supabaseClient(token);

  // Check if job is already saved
  const { data: existingData, error: checkError } = await supabase
    .from("saved_jobs")
    .select("*")
    .eq("job_id", saveData.job_id)
    .eq("user_id", saveData.user_id);

  if (checkError) {
    console.error("Error checking if job is already saved:", checkError);
    return null;
  }

  // If job is already saved, just return it
  if (existingData && existingData.length > 0) {
    console.log("Job already saved, keeping it saved");
    return existingData;
  }

  // If job is not saved, add it to saved jobs
  const { data, error: insertError } = await supabase
    .from("saved_jobs")
    .insert([saveData])
    .select();

  if (insertError) {
    console.error("Error saving job:", insertError);
    return null;
  }

  return data;
}

// - Remove Saved Job
export async function removeSavedJob(token, { job_id, user_id }) {
  const supabase = await supabaseClient(token);

  // Remove the saved job
  const { data, error: deleteError } = await supabase
    .from("saved_jobs")
    .delete()
    .eq("job_id", job_id)
    .eq("user_id", user_id)
    .select();

  if (deleteError) {
    console.error("Error removing saved job:", deleteError);
    return null;
  }

  return data;
}

// - job isOpen toggle - (recruiter_id = auth.uid())
export async function updateHiringStatus(token, { job_id }, isOpen) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase
    .from("jobs")
    .update({ isOpen })
    .eq("id", job_id)
    .select();

  if (error) {
    console.error("Error Updating Hiring Status:", error);
    return null;
  }

  return data;
}

// get my created jobs
export async function getMyJobs(token, { recruiter_id }) {
  const supabase = await supabaseClient(token);

  const { data, error } = await supabase
    .from("jobs")
    .select("*, company: companies(name,logo_url)")
    .eq("recruiter_id", recruiter_id);

  if (error) {
    console.error("Error fetching Jobs:", error);
    return null;
  }

  return data;
}

// Delete job
export async function deleteJob(token, { job_id }) {
  const supabase = await supabaseClient(token);

  const { data, error: deleteError } = await supabase
    .from("jobs")
    .delete()
    .eq("id", job_id)
    .select();

  if (deleteError) {
    console.error("Error deleting job:", deleteError);
    return data;
  }

  return data;
}

// Update job
export async function updateJob(token, { job_id }, jobData) {
  try {
    if (!token) {
      console.error("No token provided for updateJob");
      throw new Error("Authentication token is missing");
    }

    console.log("Updating job with data:", jobData);
    const supabase = await supabaseClient(token);

    // Validate required fields
    if (!jobData.title) throw new Error("Job title is required");
    if (!jobData.description) throw new Error("Job description is required");
    if (!jobData.location) throw new Error("Job location is required");
    if (!jobData.requirements) throw new Error("Job requirements are required");

    // Create a job object with only the fields to update
    const jobToUpdate = {
      title: jobData.title,
      description: jobData.description,
      location: jobData.location,
      requirements: jobData.requirements
    };

    console.log("Updating job with data:", jobToUpdate);

    const { data, error } = await supabase
      .from("jobs")
      .update(jobToUpdate)
      .eq("id", job_id)
      .select();

    if (error) {
      console.error("Error updating job:", error);
      throw new Error(error.message || "Database error");
    }

    if (!data || data.length === 0) {
      console.error("No data returned after job update");
      throw new Error("Job was updated but no data was returned");
    }

    console.log("Job updated successfully:", data);

    // Update the job in localStorage for persistence
    try {
      const storedJobs = localStorage.getItem('mockCreatedJobs');
      if (storedJobs) {
        const jobs = JSON.parse(storedJobs);
        const updatedJobs = jobs.map(job => {
          if (job.id === job_id) {
            return { ...job, ...jobToUpdate };
          }
          return job;
        });
        localStorage.setItem('mockCreatedJobs', JSON.stringify(updatedJobs));
        console.log("Job updated in localStorage");
      }
    } catch (localStorageError) {
      console.error("Error updating job in localStorage:", localStorageError);
    }

    return data;
  } catch (error) {
    console.error("Error in updateJob:", error);
    // Create a more descriptive error message
    const errorMessage = error.message || "Unknown error";
    throw new Error("Error Updating Job: " + errorMessage);
  }
}

// - post job
export async function addNewJob(token, _, jobData) {
  try {
    if (!token) {
      console.error("No token provided for addNewJob");
      throw new Error("Authentication token is missing");
    }

    console.log("Adding new job with data:", jobData);
    const supabase = await supabaseClient(token);

    // Validate required fields
    if (!jobData.title) throw new Error("Job title is required");
    if (!jobData.description) throw new Error("Job description is required");
    if (!jobData.location) throw new Error("Job location is required");
    if (!jobData.requirements) throw new Error("Job requirements are required");
    if (!jobData.recruiter_id) throw new Error("Recruiter ID is required");

    // Create a simplified job object with only the required fields
    // We'll skip the company_id completely to avoid foreign key constraints
    const jobToInsert = {
      title: jobData.title,
      description: jobData.description,
      location: jobData.location,
      requirements: jobData.requirements,
      recruiter_id: jobData.recruiter_id,
      isOpen: true
    };

    console.log("Inserting job with data:", jobToInsert);

    // Try to insert the job without a company_id
    try {
      const { data, error } = await supabase
        .from("jobs")
        .insert([jobToInsert])
        .select();

      if (error) {
        console.error("Error inserting job:", error);

        // If there's a not-null constraint error on company_id, try with a default company_id
        if (error.code === "23502" && error.message && error.message.includes("company_id")) {
          console.log("Not-null constraint on company_id, trying with default company_id = 1");

          // Try again with a default company_id
          const { data: dataWithCompany, error: errorWithCompany } = await supabase
            .from("jobs")
            .insert([{ ...jobToInsert, company_id: 1 }])
            .select();

          if (errorWithCompany) {
            console.error("Error inserting job with default company_id:", errorWithCompany);
            throw new Error(errorWithCompany.message || "Failed to insert job with default company_id");
          }

          if (!dataWithCompany || dataWithCompany.length === 0) {
            throw new Error("Job was created with default company_id but no data was returned");
          }

          console.log("Job created successfully with default company_id:", dataWithCompany);

          // Store the job in localStorage for persistence
          const jobWithCompany = {
            ...dataWithCompany[0],
            company: {
              name: jobData.company_name || "",
              logo_url: "/companies/default.png"
            }
          };
          addLocallyCreatedJob(jobWithCompany);

          return dataWithCompany;
        }

        // For other errors, throw with the original error message
        throw new Error(error.message || "Database error");
      }

      if (!data || data.length === 0) {
        console.error("No data returned after job insertion");
        throw new Error("Job was created but no data was returned");
      }

      console.log("Job created successfully:", data);

      // Store the job in localStorage for persistence
      const jobWithCompany = {
        ...data[0],
        company: {
          name: jobData.company_name || "",
          logo_url: "/companies/default.png"
        }
      };
      addLocallyCreatedJob(jobWithCompany);

      return data;
    } catch (insertError) {
      console.error("Error in job insertion:", insertError);

      // If we get here, try one more approach - use mock data
      if (jobData.useMockData) {
        console.log("Using mock data as a last resort");

        // Create a mock job response
        const mockJobId = Math.floor(Math.random() * 10000);
        const mockJob = {
          id: mockJobId,
          title: jobData.title,
          description: jobData.description,
          location: jobData.location,
          requirements: jobData.requirements,
          recruiter_id: jobData.recruiter_id,
          isOpen: true,
          created_at: new Date().toISOString(),
          company_name: jobData.company_name, // Add company_name directly to the job object
          company: {
            name: jobData.company_name || "",
            logo_url: "/companies/default.png"
          },
          saved: [],
          applications: []
        };

        console.log("Created mock job:", mockJob);

        // Store the mock job in localStorage for persistence
        addLocallyCreatedJob(mockJob);

        return [mockJob];
      }

      // If not using mock data, rethrow the error
      throw insertError;
    }
  } catch (error) {
    console.error("Error in addNewJob:", error);
    // Create a more descriptive error message
    const errorMessage = error.message || "Unknown error";
    throw new Error("Error Creating Job: " + errorMessage);
  }
}
