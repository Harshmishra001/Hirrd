import { useUser } from "@clerk/clerk-react";
import MDEditor from "@uiw/react-md-editor";
import { Briefcase, DoorClosed, DoorOpen, MapPinIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BarLoader } from "react-spinners";

import ApplicationCard from "@/components/application-card";
import { ApplyJobDrawer } from "@/components/apply-job";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { getSingleJob, updateHiringStatus } from "@/api/apiJobs";
import useFetch from "@/hooks/use-fetch";
import { getApplicationsForUser, hasUserAppliedToJob, storeAppliedJob } from "../data/mock-applications.js";
import { getLocallyCreatedJob } from "../data/mock-created-jobs.js";
import { mockJobs } from "../data/mock-jobs.js";

const JobPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoaded, user } = useUser();
  const [hasApplied, setHasApplied] = useState(false);
  const [userApplications, setUserApplications] = useState([]);
  const [currentJob, setCurrentJob] = useState(null);
  const [isLocalJob, setIsLocalJob] = useState(false);

  const {
    loading: loadingJob,
    data: job,
    fn: fnJob,
  } = useFetch(getSingleJob, {
    job_id: id,
  });

  useEffect(() => {
    if (isLoaded) fnJob();
  }, [isLoaded]);

  // Check if user has applied to this job using mock data
  useEffect(() => {
    if (user && id) {
      // Check if user has applied to this job
      const applied = hasUserAppliedToJob(parseInt(id), user.id);
      console.log(`User ${user.id} has${applied ? '' : ' not'} applied to job ${id}`);
      setHasApplied(applied);

      // Get all user applications
      const applications = getApplicationsForUser(user.id);
      setUserApplications(applications);

      // Force refresh the application status when the component mounts
      // This ensures the Apply button shows the correct state
      if (applied) {
        console.log("User has already applied to this job - ensuring it's stored in permanent record");
        // Make sure it's in the permanent record
        storeAppliedJob(parseInt(id), user.id);
      }
    }
  }, [user, id]);

  const { loading: loadingHiringStatus, fn: fnHiringStatus } = useFetch(
    updateHiringStatus,
    {
      job_id: id,
    }
  );

  const handleStatusChange = (value) => {
    const isOpen = value === "open";
    fnHiringStatus(isOpen).then(() => fnJob());
  };

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

  // First check if this is a locally created job
  useEffect(() => {
    if (id) {
      const localJob = getLocallyCreatedJob(parseInt(id));
      if (localJob) {
        console.log("Found locally created job:", localJob);
        setIsLocalJob(true);

        // Add applications from mock data
        const localJobWithApplications = {...localJob};
        localJobWithApplications.applications = userApplications.filter(app => app.job_id === parseInt(id));

        // First check if company_name is directly available in the job object
        if (localJobWithApplications.company_name) {
          if (!localJobWithApplications.company) {
            localJobWithApplications.company = {
              name: localJobWithApplications.company_name,
              logo_url: "/companies/default.png"
            };
          } else if (!localJobWithApplications.company.name) {
            localJobWithApplications.company.name = localJobWithApplications.company_name;
          }
        }
        // If still no company name, try to extract from description
        else if ((!localJobWithApplications.company || !localJobWithApplications.company.name) && localJobWithApplications.description) {
          const companyName = extractCompanyName(localJobWithApplications.description);
          if (companyName) {
            localJobWithApplications.company = {
              ...localJobWithApplications.company,
              name: companyName
            };
          }
        }

        setCurrentJob(localJobWithApplications);
      }
    }
  }, [id, userApplications, extractCompanyName]);

  // Update currentJob when job data changes (only if not a local job)
  useEffect(() => {
    if (isLocalJob) {
      // If it's a local job, we already set it in the previous useEffect
      return;
    }

    if (job) {
      // If we have job data from API, use it
      const jobWithApplications = {...job};

      // Add applications from mock data if needed
      if (!jobWithApplications.applications) {
        jobWithApplications.applications = userApplications.filter(app => app.job_id === parseInt(id));
      }

      // First check if company_name is directly available in the job object
      if (jobWithApplications.company_name) {
        if (!jobWithApplications.company) {
          jobWithApplications.company = {
            name: jobWithApplications.company_name,
            logo_url: "/companies/default.png"
          };
        } else if (!jobWithApplications.company.name) {
          jobWithApplications.company.name = jobWithApplications.company_name;
        }
      }
      // If still no company name, try to extract from description
      else if ((!jobWithApplications.company || !jobWithApplications.company.name) && jobWithApplications.description) {
        const companyName = extractCompanyName(jobWithApplications.description);
        if (companyName) {
          jobWithApplications.company = {
            ...jobWithApplications.company,
            name: companyName
          };
        }
      }

      setCurrentJob(jobWithApplications);
    } else if (loadingJob === false) {
      // If API call is done but no job data, use mock data
      const mockJob = mockJobs.find(j => j.id === parseInt(id));

      if (mockJob) {
        // Add applications from mock data
        const mockJobWithApplications = {...mockJob};
        mockJobWithApplications.applications = userApplications.filter(app => app.job_id === parseInt(id));

        // First check if company_name is directly available in the job object
        if (mockJobWithApplications.company_name) {
          if (!mockJobWithApplications.company) {
            mockJobWithApplications.company = {
              name: mockJobWithApplications.company_name,
              logo_url: "/companies/default.png"
            };
          } else if (!mockJobWithApplications.company.name) {
            mockJobWithApplications.company.name = mockJobWithApplications.company_name;
          }
        }
        // If still no company name, try to extract from description
        else if ((!mockJobWithApplications.company || !mockJobWithApplications.company.name) && mockJobWithApplications.description) {
          const companyName = extractCompanyName(mockJobWithApplications.description);
          if (companyName) {
            mockJobWithApplications.company = {
              ...mockJobWithApplications.company,
              name: companyName
            };
          }
        }

        setCurrentJob(mockJobWithApplications);
      }
    }
  }, [job, loadingJob, userApplications, id, isLocalJob, extractCompanyName]);

  // If data is not loaded, show loading spinner
  if (!isLoaded || (loadingJob && !currentJob && !isLocalJob)) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  // If no job data is available yet, don't render the page
  if (!currentJob) {
    return <div className="text-center mt-10">No job found</div>;
  }

  return (
    <div className="flex flex-col gap-8 mt-5">
      <div className="flex flex-col-reverse gap-6 md:flex-row justify-between items-center">
        <div>
          <h1 className="gradient-title font-extrabold pb-3 text-4xl sm:text-6xl">
            {currentJob.title}
          </h1>
          {/* Display company name from either company object or company_name field */}
          {(currentJob.company?.name || currentJob.company_name) && (
            <h2 className="text-xl text-gray-300 mt-2">
              at {currentJob.company?.name || currentJob.company_name}
            </h2>
          )}
        </div>
        {/* Only show logo if it's not a locally created job */}
        {currentJob.company?.logo_url && !isLocalJob && (
          <img src={currentJob.company.logo_url} className="h-12" alt={currentJob.title} />
        )}
      </div>

      <div className="flex justify-between ">
        <div className="flex gap-2">
          <MapPinIcon /> {currentJob.location}
        </div>
        <div className="flex gap-2">
          <Briefcase /> {currentJob.applications?.length || 0} Applicants
        </div>
        <div className="flex gap-2">
          {currentJob.isOpen ? (
            <>
              <DoorOpen /> Open
            </>
          ) : (
            <>
              <DoorClosed /> Closed
            </>
          )}
        </div>
      </div>

      {currentJob.recruiter_id === user?.id && (
        <Select onValueChange={handleStatusChange}>
          <SelectTrigger
            className={`w-full ${currentJob.isOpen ? "bg-green-950" : "bg-red-950"}`}
          >
            <SelectValue
              placeholder={
                "Hiring Status " + (currentJob.isOpen ? "( Open )" : "( Closed )")
              }
            />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="open">Open</SelectItem>
            <SelectItem value="closed">Closed</SelectItem>
          </SelectContent>
        </Select>
      )}

      <h2 className="text-2xl sm:text-3xl font-bold">About the job</h2>
      <p className="sm:text-lg">{currentJob.description}</p>

      <h2 className="text-2xl sm:text-3xl font-bold">
        What we are looking for
      </h2>
      <MDEditor.Markdown
        source={currentJob.requirements}
        className="bg-transparent sm:text-lg" // add global ul styles - tutorial
      />
      {/* Show apply button for all jobs, regardless of who posted them */}
      {user && (
        <ApplyJobDrawer
          job={currentJob}
          user={user}
          fetchJob={() => {
            fnJob();
            // Also update the hasApplied state
            if (user && id) {
              const applied = hasUserAppliedToJob(parseInt(id), user.id);
              setHasApplied(applied);

              // Get all user applications
              const applications = getApplicationsForUser(user.id);
              setUserApplications(applications);
            }
          }}
          applied={hasApplied || currentJob.applications?.find((ap) => ap.candidate_id === user.id)}
        />
      )}
      {loadingHiringStatus && <BarLoader width={"100%"} color="#36d7b7" />}
      {currentJob.applications?.length > 0 && currentJob.recruiter_id === user?.id && (
        <div className="flex flex-col gap-2">
          <h2 className="font-bold mb-4 text-xl ml-1">Applications</h2>
          {currentJob.applications.map((application) => {
            return (
              <ApplicationCard key={application.id} application={application} />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JobPage;
