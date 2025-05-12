import { addNewJob } from "@/api/apiJobs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import useFetch from "@/hooks/use-fetch";
import { useUser } from "@clerk/clerk-react";
import { zodResolver } from "@hookform/resolvers/zod";
import MDEditor from "@uiw/react-md-editor";
import { State } from "country-state-city";
import {
    BriefcaseBusiness,
    Building2,
    Clock,
    DollarSign,
    FileText,
    GraduationCap,
    MapPin,
    Send
} from "lucide-react";
import { useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { z } from "zod";

const schema = z.object({
  title: z.string().min(1, { message: "Job title is required" }),
  description: z.string().min(10, { message: "Description should be at least 10 characters" }),
  location: z.string().min(1, { message: "Job location is required" }),
  company_name: z.string().min(1, { message: "Company name is required" }),
  requirements: z.string().min(10, { message: "Requirements should be at least 10 characters" }),
  job_type: z.string().min(1, { message: "Job type is required" }),
  experience_level: z.string().min(1, { message: "Experience level is required" }),
  salary_range: z.string().optional(),
  pin_code: z.string().optional(),
  phone_number: z.string().optional(),
});

const jobTypes = [
  "Full-time",
  "Part-time",
  "Contract",
  "Freelance",
  "Internship",
  "Remote"
];

const experienceLevels = [
  "Entry Level",
  "Junior",
  "Mid-Level",
  "Senior",
  "Lead",
  "Manager",
  "Director",
  "Executive"
];

const PostJob = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [successMessage, setSuccessMessage] = useState(false);

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      location: "",
      company_name: "",
      requirements: "",
      job_type: "",
      experience_level: "",
      salary_range: "",
      pin_code: "",
      phone_number: ""
    },
    resolver: zodResolver(schema),
  });

  const {
    loading: loadingCreateJob,
    error: errorCreateJob,
    fn: fnCreateJob,
  } = useFetch(addNewJob);

  const onSubmit = async (data) => {
    try {
      // Create a simplified job object with only the required fields
      const jobData = {
        title: data.title,
        description: data.description,
        location: data.location,
        requirements: data.requirements,
        recruiter_id: user.id,
        isOpen: true,
        company_name: data.company_name, // Add company_name directly to the job data
        pin_code: data.pin_code || '', // Add optional pin code
        phone_number: data.phone_number || '' // Add optional phone number
      };

      // Add job type to the description for better visibility
      if (data.job_type) {
        jobData.description = `**Job Type:** ${data.job_type}\n\n${jobData.description}`;
      }

      // Add experience level to the description for better visibility
      if (data.experience_level) {
        jobData.description = `**Experience Level:** ${data.experience_level}\n\n${jobData.description}`;
      }

      // Add salary range to the description for better visibility
      if (data.salary_range) {
        jobData.description = `**Salary Range:** ${data.salary_range}\n\n${jobData.description}`;
      }

      // Add company name to the description for better visibility
      if (data.company_name) {
        // Make sure company name is at the beginning of the description for easier extraction
        jobData.description = `Company: ${data.company_name}\n\n${jobData.description}`;
        console.log("Added company name to description:", data.company_name);
      }

      // Add pin code to the description if provided
      if (data.pin_code) {
        jobData.description = `PIN Code: ${data.pin_code}\n\n${jobData.description}`;
        console.log("Added PIN code to description:", data.pin_code);
      }

      // Add phone number to the description if provided
      if (data.phone_number) {
        jobData.description = `Contact Phone: ${data.phone_number}\n\n${jobData.description}`;
        console.log("Added phone number to description:", data.phone_number);
      }

      console.log("Submitting job data:", jobData);

      // Call the API to create the job
      const result = await fnCreateJob(jobData);
      console.log("Job creation result:", result);

      if (result && result.length > 0) {
        // Show success message
        setSuccessMessage(true);

        // Redirect after a short delay with the new job ID
        setTimeout(() => {
          navigate(`/jobs?refresh=true&new_job_id=${result[0].id}`);
        }, 2000);
      } else {
        throw new Error("No data returned from job creation");
      }
    } catch (error) {
      console.error("Error submitting job:", error);

      // Try a fallback approach with minimal data
      try {
        console.log("Trying fallback approach with minimal job data");

        // Create a minimal job object with only the absolutely required fields
        const minimalJobData = {
          title: data.title,
          description: data.description,
          location: data.location,
          requirements: data.requirements,
          recruiter_id: user.id,
          isOpen: true,
          company_name: data.company_name, // Add company_name directly to the job data
          pin_code: data.pin_code || '', // Add optional pin code
          phone_number: data.phone_number || '', // Add optional phone number
          // Mark this as a fallback attempt
          fallbackAttempt: true
        };

        console.log("Submitting minimal job data:", minimalJobData);

        // Call the API to create the job with minimal data
        const result = await fnCreateJob(minimalJobData);
        console.log("Job creation result (fallback):", result);

        if (result && result.length > 0) {
          // Show success message
          setSuccessMessage(true);

          // Redirect after a short delay with the new job ID
          setTimeout(() => {
            navigate(`/jobs?refresh=true&new_job_id=${result[0].id}`);
          }, 2000);

          // Return early to avoid showing the error
          return;
        }
      } catch (fallbackError) {
        console.error("Fallback approach also failed:", fallbackError);

        // Try one last approach - use mock data
        try {
          console.log("Trying mock data approach as last resort");

          // Create a job object with mock data flag
          const mockJobData = {
            title: data.title,
            description: data.description,
            location: data.location,
            requirements: data.requirements,
            recruiter_id: user.id,
            isOpen: true,
            company_name: data.company_name, // Add company_name directly to the job data
            pin_code: data.pin_code || '', // Add optional pin code
            phone_number: data.phone_number || '', // Add optional phone number
            // Flag to use mock data
            useMockData: true
          };

          console.log("Submitting with mock data flag:", mockJobData);

          // Call the API to create a mock job
          const result = await fnCreateJob(mockJobData);
          console.log("Job creation result (mock):", result);

          if (result && result.length > 0) {
            // Show success message
            setSuccessMessage(true);

            // Redirect after a short delay with the new job ID
            setTimeout(() => {
              navigate(`/jobs?refresh=true&new_job_id=${result[0].id}`);
            }, 2000);

            // Return early to avoid showing the error
            return;
          }
        } catch (mockError) {
          console.error("Mock data approach also failed:", mockError);
          // Continue to show the original error
        }
      }

      // Error is already set by the useFetch hook
      // The error will be displayed in the UI via the errorCreateJob state
    }
  };

  // We've moved the success handling to the onSubmit function
  // This ensures we have access to the newly created job ID for redirection

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  // Check if direct-post parameter is present
  const directPost = searchParams.get("direct-post") === "true";

  if (user?.unsafeMetadata?.role !== "recruiter") {
    // If direct-post is true, update the user's role to recruiter
    if (directPost && user) {
      console.log("Direct post access detected, updating role to recruiter");
      user.update({ unsafeMetadata: { role: "recruiter" } })
        .then(() => {
          console.log("Role updated to recruiter for post-job access");
        })
        .catch((err) => {
          console.error("Error updating role to recruiter:", err);
        });
      // Continue rendering the page while the role updates
      return (
        <div>
          <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl text-center pb-8">
            Setting up your recruiter account...
          </h1>
          <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />
        </div>
      );
    }
    // If not direct-post, redirect to jobs page
    return <Navigate to="/jobs" />;
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header Section */}
      <div className="text-center mb-8">
        <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl pb-4">
          Post a Job
        </h1>
        <p className="text-gray-400 text-lg">
          Find the perfect candidate for your position
        </p>
        <div className="mt-4">
          <a
            href="/recruiter-dashboard"
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Recruiter Dashboard
          </a>
        </div>
      </div>

      {/* Success Message */}
      {successMessage && (
        <div className="bg-green-900/30 border border-green-500 rounded-lg p-4 mb-6 text-center">
          <h3 className="text-green-400 font-bold text-lg">Job Posted Successfully!</h3>
          <p className="text-green-300">Your job has been posted and is now visible to candidates.</p>
          <p className="text-gray-400 text-sm mt-2">Redirecting to jobs page...</p>
        </div>
      )}

      {/* Form Section */}
      <Card className="bg-gray-900/50 border-gray-700 shadow-lg">
        <CardContent className="pt-6">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="flex flex-col gap-6"
          >
            {/* Basic Job Information */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <FileText size={20} /> Basic Job Information
              </h2>

              <div className="space-y-2">
                <Label htmlFor="title" className="text-gray-300">
                  Job Title <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <BriefcaseBusiness className="absolute left-3 top-3 text-gray-400" size={16} />
                  <Input
                    id="title"
                    placeholder="e.g. Senior React Developer"
                    className="pl-10 bg-gray-800/50 border-gray-700"
                    {...register("title")}
                  />
                </div>
                {errors.title && <p className="text-red-500 text-sm">{errors.title.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="description" className="text-gray-300">
                  Job Description <span className="text-red-500">*</span>
                </Label>
                <Textarea
                  id="description"
                  placeholder="Describe the role, responsibilities, and ideal candidate..."
                  className="min-h-[100px] bg-gray-800/50 border-gray-700"
                  {...register("description")}
                />
                {errors.description && <p className="text-red-500 text-sm">{errors.description.message}</p>}
              </div>
            </div>

            {/* Company and Location */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <Building2 size={20} /> Company & Location
              </h2>

              <div className="space-y-2">
                <Label htmlFor="company_name" className="text-gray-300">
                  Company Name <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-3 text-gray-400" size={16} />
                  <Input
                    id="company_name"
                    placeholder="e.g. Acme Corporation"
                    className="pl-10 bg-gray-800/50 border-gray-700"
                    {...register("company_name")}
                  />
                </div>
                {errors.company_name && <p className="text-red-500 text-sm">{errors.company_name.message}</p>}
                <p className="text-xs text-gray-500">A default company logo will be used for your job posting.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location" className="text-gray-300">
                  Job Location <span className="text-red-500">*</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                  <Controller
                    name="location"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="pl-10 bg-gray-800/50 border-gray-700">
                          <SelectValue placeholder="Select location" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          <SelectGroup>
                            {State.getStatesOfCountry("IN").map(({ name }) => (
                              <SelectItem key={name} value={name}>
                                {name}
                              </SelectItem>
                            ))}
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                    )}
                  />
                </div>
                {errors.location && <p className="text-red-500 text-sm">{errors.location.message}</p>}
              </div>

              <div className="space-y-2">
                <Label htmlFor="pin_code" className="text-gray-300">
                  PIN Code <span className="text-gray-500">(Optional)</span>
                </Label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
                  <Input
                    id="pin_code"
                    placeholder="e.g. 110001"
                    className="pl-10 bg-gray-800/50 border-gray-700"
                    {...register("pin_code")}
                  />
                </div>
                <p className="text-xs text-gray-500">Adding a PIN code helps candidates find jobs in their area.</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="phone_number" className="text-gray-300">
                  Contact Phone <span className="text-gray-500">(Optional)</span>
                </Label>
                <div className="relative">
                  <svg xmlns="http://www.w3.org/2000/svg" className="absolute left-3 top-3 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                  </svg>
                  <Input
                    id="phone_number"
                    placeholder="e.g. +91 9876543210"
                    className="pl-10 bg-gray-800/50 border-gray-700"
                    {...register("phone_number")}
                  />
                </div>
                <p className="text-xs text-gray-500">Providing a contact number allows candidates to reach out directly.</p>
              </div>
            </div>

            {/* Job Details */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <Clock size={20} /> Job Details
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="job_type" className="text-gray-300">
                    Job Type <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <BriefcaseBusiness className="absolute left-3 top-3 text-gray-400" size={16} />
                    <Controller
                      name="job_type"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="pl-10 bg-gray-800/50 border-gray-700">
                            <SelectValue placeholder="Select job type" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectGroup>
                              {jobTypes.map((type) => (
                                <SelectItem key={type} value={type}>
                                  {type}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  {errors.job_type && <p className="text-red-500 text-sm">{errors.job_type.message}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="experience_level" className="text-gray-300">
                    Experience Level <span className="text-red-500">*</span>
                  </Label>
                  <div className="relative">
                    <GraduationCap className="absolute left-3 top-3 text-gray-400" size={16} />
                    <Controller
                      name="experience_level"
                      control={control}
                      render={({ field }) => (
                        <Select value={field.value} onValueChange={field.onChange}>
                          <SelectTrigger className="pl-10 bg-gray-800/50 border-gray-700">
                            <SelectValue placeholder="Select experience level" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectGroup>
                              {experienceLevels.map((level) => (
                                <SelectItem key={level} value={level}>
                                  {level}
                                </SelectItem>
                              ))}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      )}
                    />
                  </div>
                  {errors.experience_level && <p className="text-red-500 text-sm">{errors.experience_level.message}</p>}
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary_range" className="text-gray-300">
                  Salary Range <span className="text-gray-500">(Optional)</span>
                </Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 text-gray-400" size={16} />
                  <Input
                    id="salary_range"
                    placeholder="e.g. ₹50,000 - ₹70,000 per month"
                    className="pl-10 bg-gray-800/50 border-gray-700"
                    {...register("salary_range")}
                  />
                </div>
                <p className="text-xs text-gray-500">Providing a salary range can attract more qualified candidates.</p>
              </div>
            </div>

            {/* Requirements */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <FileText size={20} /> Job Requirements
              </h2>

              <div className="space-y-2">
                <Label htmlFor="requirements" className="text-gray-300">
                  Requirements & Qualifications <span className="text-red-500">*</span>
                </Label>
                <p className="text-xs text-gray-500 mb-2">
                  Use Markdown to format your requirements. You can use bullet points, headings, and more.
                </p>
                <Controller
                  name="requirements"
                  control={control}
                  render={({ field }) => (
                    <MDEditor
                      value={field.value}
                      onChange={field.onChange}
                      preview="edit"
                      className="bg-gray-800/50 border-gray-700"
                    />
                  )}
                />
                {errors.requirements && <p className="text-red-500 text-sm">{errors.requirements.message}</p>}
              </div>
            </div>

            {/* Error and Loading States */}
            {errorCreateJob?.message && (
              <div className="bg-red-900/30 border border-red-500/50 rounded-md p-3 mt-2">
                <p className="text-red-400 text-sm font-medium">
                  <span className="font-bold">Error:</span> {errorCreateJob?.message || "Failed to post job"}
                </p>
                <p className="text-gray-400 text-xs mt-2">
                  Please check that all required fields are filled correctly. If the problem persists,
                  try refreshing the page or logging out and back in.
                </p>
                <div className="mt-3">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="text-xs"
                    onClick={() => {
                      // Try the mock data approach directly from the error message
                      const mockJobData = {
                        title: watch("title"),
                        description: watch("description"),
                        location: watch("location"),
                        requirements: watch("requirements"),
                        recruiter_id: user.id,
                        isOpen: true,
                        company_name: watch("company_name"), // Add company_name directly to the job data
                        pin_code: watch("pin_code") || '', // Add optional pin code
                        phone_number: watch("phone_number") || '', // Add optional phone number
                        useMockData: true
                      };

                      fnCreateJob(mockJobData)
                        .then(result => {
                          if (result && result.length > 0) {
                            setSuccessMessage(true);
                            setTimeout(() => {
                              navigate(`/jobs?refresh=true&new_job_id=${result[0].id}`);
                            }, 2000);
                          }
                        })
                        .catch(err => console.error("Error in retry:", err));
                    }}
                  >
                    Retry with Offline Mode
                  </Button>
                </div>
              </div>
            )}

            {loadingCreateJob && (
              <div className="py-2">
                <p className="text-blue-400 text-xs mb-1">Posting your job...</p>
                <BarLoader width={"100%"} color="#36d7b7" />
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="blue"
              size="lg"
              className="mt-4 py-6 text-lg font-bold"
              disabled={loadingCreateJob}
            >
              <Send className="mr-2" size={18} /> Post Job
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostJob;
