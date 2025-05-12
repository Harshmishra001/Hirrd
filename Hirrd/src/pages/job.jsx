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

    // Look for "Company: Company Name" pattern in the description
    const companyMatch = description.match(/Company:\s*(.*?)(\n|$)/);
    if (companyMatch && companyMatch[1]) {
      return companyMatch[1].trim();
    }

    return null;
  };

  // Helper function to extract PIN code from job description
  const extractPinCode = (description) => {
    if (!description) return null;

    // Look for "PIN Code: 123456" pattern in the description
    const pinCodeMatch = description.match(/PIN Code:\s*(.*?)(\n|$)/);
    if (pinCodeMatch && pinCodeMatch[1]) {
      return pinCodeMatch[1].trim();
    }

    return null;
  };

  // Helper function to extract phone number from job description
  const extractPhoneNumber = (description) => {
    if (!description) return null;

    // Look for "Contact Phone: +91 1234567890" pattern in the description
    const phoneMatch = description.match(/Contact Phone:\s*(.*?)(\n|$)/);
    if (phoneMatch && phoneMatch[1]) {
      return phoneMatch[1].trim();
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

        // Make sure PIN code is available - either from direct property or from description
        if (!localJobWithApplications.pin_code && localJobWithApplications.description) {
          const pinCode = extractPinCode(localJobWithApplications.description);
          if (pinCode) {
            localJobWithApplications.pin_code = pinCode;
          }
        }

        // Make sure phone number is available - either from direct property or from description
        if (!localJobWithApplications.phone_number && localJobWithApplications.description) {
          const phoneNumber = extractPhoneNumber(localJobWithApplications.description);
          if (phoneNumber) {
            localJobWithApplications.phone_number = phoneNumber;
          }
        }

        // Force PIN code and phone number to be visible in the UI
        if (localJobWithApplications.pin_code === "") {
          // Try to extract from description again with a more lenient approach
          const pinCodeMatch = localJobWithApplications.description?.match(/PIN Code:?\s*([0-9]+)/i);
          if (pinCodeMatch && pinCodeMatch[1]) {
            localJobWithApplications.pin_code = pinCodeMatch[1].trim();
          }
        }

        if (localJobWithApplications.phone_number === "") {
          // Try to extract from description again with a more lenient approach
          const phoneMatch = localJobWithApplications.description?.match(/Contact Phone:?\s*([+0-9\s-]+)/i);
          if (phoneMatch && phoneMatch[1]) {
            localJobWithApplications.phone_number = phoneMatch[1].trim();
          }
        }

        // Log the PIN code and phone number for debugging
        console.log("Local job PIN code:", localJobWithApplications.pin_code);
        console.log("Local job phone number:", localJobWithApplications.phone_number);

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

      // Make sure PIN code is available - either from direct property or from description
      if (!jobWithApplications.pin_code && jobWithApplications.description) {
        const pinCode = extractPinCode(jobWithApplications.description);
        if (pinCode) {
          jobWithApplications.pin_code = pinCode;
        }
      }

      // Make sure phone number is available - either from direct property or from description
      if (!jobWithApplications.phone_number && jobWithApplications.description) {
        const phoneNumber = extractPhoneNumber(jobWithApplications.description);
        if (phoneNumber) {
          jobWithApplications.phone_number = phoneNumber;
        }
      }

      // Force PIN code and phone number to be visible in the UI
      if (jobWithApplications.pin_code === "") {
        // Try to extract from description again with a more lenient approach
        const pinCodeMatch = jobWithApplications.description?.match(/PIN Code:?\s*([0-9]+)/i);
        if (pinCodeMatch && pinCodeMatch[1]) {
          jobWithApplications.pin_code = pinCodeMatch[1].trim();
        }
      }

      if (jobWithApplications.phone_number === "") {
        // Try to extract from description again with a more lenient approach
        const phoneMatch = jobWithApplications.description?.match(/Contact Phone:?\s*([+0-9\s-]+)/i);
        if (phoneMatch && phoneMatch[1]) {
          jobWithApplications.phone_number = phoneMatch[1].trim();
        }
      }

      // Log the PIN code and phone number for debugging
      console.log("API job PIN code:", jobWithApplications.pin_code);
      console.log("API job phone number:", jobWithApplications.phone_number);

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

        // Make sure PIN code is available - either from direct property or from description
        if (!mockJobWithApplications.pin_code && mockJobWithApplications.description) {
          const pinCode = extractPinCode(mockJobWithApplications.description);
          if (pinCode) {
            mockJobWithApplications.pin_code = pinCode;
          }
        }

        // Make sure phone number is available - either from direct property or from description
        if (!mockJobWithApplications.phone_number && mockJobWithApplications.description) {
          const phoneNumber = extractPhoneNumber(mockJobWithApplications.description);
          if (phoneNumber) {
            mockJobWithApplications.phone_number = phoneNumber;
          }
        }

        // Force PIN code and phone number to be visible in the UI
        if (mockJobWithApplications.pin_code === "") {
          // Try to extract from description again with a more lenient approach
          const pinCodeMatch = mockJobWithApplications.description?.match(/PIN Code:?\s*([0-9]+)/i);
          if (pinCodeMatch && pinCodeMatch[1]) {
            mockJobWithApplications.pin_code = pinCodeMatch[1].trim();
          }
        }

        if (mockJobWithApplications.phone_number === "") {
          // Try to extract from description again with a more lenient approach
          const phoneMatch = mockJobWithApplications.description?.match(/Contact Phone:?\s*([+0-9\s-]+)/i);
          if (phoneMatch && phoneMatch[1]) {
            mockJobWithApplications.phone_number = phoneMatch[1].trim();
          }
        }

        // Log the PIN code and phone number for debugging
        console.log("Mock job PIN code:", mockJobWithApplications.pin_code);
        console.log("Mock job phone number:", mockJobWithApplications.phone_number);

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

      <div className="flex flex-wrap justify-between gap-4">
        <div className="flex gap-2 items-center">
          <MapPinIcon /> {currentJob.location}
        </div>
        <div className="flex gap-2 items-center">
          <Briefcase /> {currentJob.applications?.length || 0} Applicants
        </div>
        <div className="flex gap-2 items-center">
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

      {/* Contact Information Section - Only show if at least one field has a valid value */}
      {((currentJob.pin_code && currentJob.pin_code.trim() !== "") ||
         (currentJob.phone_number && currentJob.phone_number.trim() !== "")) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-2">
          {/* PIN Code - Only show if it has a valid value */}
          {currentJob.pin_code && currentJob.pin_code.trim() !== "" && (
            <div className="flex items-center gap-2 text-gray-300 border border-gray-700 rounded-md p-3 bg-gray-800/30">
              <MapPinIcon className="text-blue-400" size={20} />
              <span>PIN Code: {currentJob.pin_code}</span>
            </div>
          )}

          {/* Phone Number - Only show if it has a valid value */}
          {currentJob.phone_number && currentJob.phone_number.trim() !== "" && (
            <div className="flex items-center gap-2 text-gray-300 border border-gray-700 rounded-md p-3 bg-gray-800/30">
              <svg xmlns="http://www.w3.org/2000/svg" className="text-blue-400" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
              </svg>
              <span>Contact: {currentJob.phone_number}</span>
            </div>
          )}
        </div>
      )}

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
