import CreatedJobs from "@/components/created-jobs";
import { Button } from "@/components/ui/button";
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";
import { Navigate } from "react-router-dom";
import { BarLoader } from "react-spinners";

const RecruiterDashboard = () => {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    // Set page title
    document.title = "Recruiter Dashboard | Job Portal";
  }, []);

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  // Check if user is a recruiter
  if (user?.unsafeMetadata?.role !== "recruiter") {
    return <Navigate to="/jobs" />;
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-8">
        <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl pb-4">
          Recruiter Dashboard
        </h1>
        <p className="text-gray-400 text-lg">
          Manage your job postings and applications
        </p>
      </div>

      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Posted Jobs</h2>
        <Button
          variant="blue"
          asChild
        >
          <a href="/post-job">Post New Job</a>
        </Button>
      </div>

      <CreatedJobs />
    </div>
  );
};

export default RecruiterDashboard;
