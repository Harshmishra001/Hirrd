/* eslint-disable react/prop-types */
import { applyToJob } from "@/api/apiApplication";
import { Button } from "@/components/ui/button";
import {
    Drawer,
    DrawerClose,
    DrawerContent,
    DrawerDescription,
    DrawerFooter,
    DrawerHeader,
    DrawerTitle,
    DrawerTrigger,
} from "@/components/ui/drawer";
import useFetch from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { Controller, useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { BarLoader } from "react-spinners";
import * as z from "zod";
import { addApplication, storeAppliedJob } from "../data/mock-applications.js";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";

const schema = z.object({
  experience: z
    .number()
    .min(0, { message: "Experience must be at least 0" })
    .int(),
  skills: z.string().min(1, { message: "Skills are required" }),
  education: z.enum(["Intermediate", "Graduate", "Post Graduate"], {
    message: "Education is required",
  }),
  // Make resume optional to avoid validation errors
  resume: z.any().optional(),
});

export function ApplyJobDrawer({ user, job, fetchJob, applied = false }) {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    reset,
  } = useForm({
    resolver: zodResolver(schema),
  });

  const {
    loading: loadingApply,
    error: errorApply,
    fn: fnApply,
  } = useFetch(applyToJob);

  const onSubmit = (data) => {
    // Skip API call and use mock data directly
    console.log("Using mock data for job application");

    // Create a resume URL - either from the uploaded file or use a placeholder
    let resumeUrl = "https://example.com/mock-resume.pdf";

    // If user uploaded a file, create a local URL for it
    if (data.resume && data.resume[0]) {
      try {
        // Create a blob URL for the uploaded file
        resumeUrl = URL.createObjectURL(data.resume[0]);
        console.log("Created URL for uploaded resume:", resumeUrl);
      } catch (error) {
        console.error("Error creating URL for resume:", error);
      }
    }

    // Create application data for mock system
    const applicationData = {
      experience: data.experience || 0,
      skills: data.skills || "",
      education: data.education || "Graduate",
      job_id: job.id,
      candidate_id: user.id,
      name: user.fullName || "User",
      status: "applied",
      resume: resumeUrl,
      resumeFileName: data.resume && data.resume[0] ? data.resume[0].name : "mock-resume.pdf",
      job: {
        id: job.id,
        title: job.title || "Job Position",
        company: {
          name: job.company?.name || "Company",
          logo_url: job.company?.logo_url || "/companies/default.png"
        },
        location: job.location || "Remote",
        description: job.description || "Job description",
        requirements: job.requirements || "Job requirements",
        isOpen: job.isOpen !== undefined ? job.isOpen : true
      } // Include the job data for display in applied jobs
    };

    console.log("Submitting application for job:", job.title);

    // Store in permanent record first
    storeAppliedJob(job.id, user.id);

    // Create a new application with a unique ID
    const directApplication = {
      ...applicationData,
      id: Date.now() // Ensure unique ID
    };

    // Store application in localStorage directly
    try {
      if (typeof window !== 'undefined') {
        // Get existing applications
        const stored = localStorage.getItem('mockApplications');
        let existingApplications = [];

        if (stored) {
          try {
            existingApplications = JSON.parse(stored);
            if (!Array.isArray(existingApplications)) {
              existingApplications = [];
            }
          } catch (parseError) {
            console.error("Error parsing applications from localStorage:", parseError);
            existingApplications = [];
          }
        }

        // Add to the array
        existingApplications.push(directApplication);

        // Save back to localStorage
        localStorage.setItem('mockApplications', JSON.stringify(existingApplications));
        console.log("Saved application to localStorage:", directApplication);

        // Also store the most recent application separately for immediate access
        localStorage.setItem('mostRecentApplication', JSON.stringify(directApplication));
        console.log("Saved most recent application separately");

        // Force a refresh of the applications list
        localStorage.setItem('forceRefreshApplications', 'true');
      }
    } catch (error) {
      console.error("Error saving application to localStorage:", error);
    }

    // Also use the addApplication function as a backup
    addApplication(applicationData);

    console.log("Application submitted successfully");

    // Redirect to My Jobs page immediately
    navigate("/my-jobs?view=applications", {
      state: { fromApply: true, jobId: job.id },
      replace: true // Replace the current entry in the history stack
    });

    fetchJob();
    reset();
  };

  // Check if this is the user's own job
  const isOwnJob = job?.recruiter_id === user?.id;

  return (
    <Drawer open={applied ? false : undefined}>
      <DrawerTrigger asChild>
        <Button
          size="lg"
          variant={job?.isOpen && !applied ? "blue" : "destructive"}
          disabled={!job?.isOpen || applied || isOwnJob}
        >
          {isOwnJob ? "Your Job" : (job?.isOpen ? (applied ? "Applied" : "Apply") : "Hiring Closed")}
        </Button>
      </DrawerTrigger>
      <DrawerContent>
        <DrawerHeader>
          <DrawerTitle>
            Apply for {job?.title} at {job?.company?.name}
          </DrawerTitle>
          <DrawerDescription>Please Fill the form below</DrawerDescription>
        </DrawerHeader>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-4 p-4 pb-0"
        >
          <Input
            type="number"
            placeholder="Years of Experience"
            className="flex-1"
            {...register("experience", {
              valueAsNumber: true,
            })}
          />
          {errors.experience && (
            <p className="text-red-500">{errors.experience.message}</p>
          )}
          <Input
            type="text"
            placeholder="Skills (Comma Separated)"
            className="flex-1"
            {...register("skills")}
          />
          {errors.skills && (
            <p className="text-red-500">{errors.skills.message}</p>
          )}
          <Controller
            name="education"
            control={control}
            render={({ field }) => (
              <RadioGroup onValueChange={field.onChange} {...field}>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Intermediate" id="intermediate" />
                  <Label htmlFor="intermediate">Intermediate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Graduate" id="graduate" />
                  <Label htmlFor="graduate">Graduate</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="Post Graduate" id="post-graduate" />
                  <Label htmlFor="post-graduate">Post Graduate</Label>
                </div>
              </RadioGroup>
            )}
          />
          {errors.education && (
            <p className="text-red-500">{errors.education.message}</p>
          )}
          <div className="flex flex-col gap-2">
            <Label htmlFor="resume">Resume (Optional)</Label>
            <Input
              id="resume"
              type="file"
              accept=".pdf, .doc, .docx"
              className="flex-1 file:text-gray-500"
              {...register("resume")}
            />
            <p className="text-xs text-gray-500">
              For demo purposes, a mock resume will be used
            </p>
          </div>
          {errorApply?.message && (
            <p className="text-red-500">{errorApply?.message}</p>
          )}
          {loadingApply && <BarLoader width={"100%"} color="#36d7b7" />}
          <Button type="submit" variant="blue" size="lg">
            Apply
          </Button>
        </form>

        <DrawerFooter>
          <DrawerClose asChild>
            <Button variant="outline">Cancel</Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  );
}
