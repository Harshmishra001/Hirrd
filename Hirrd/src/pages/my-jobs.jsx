import CreatedApplications from "@/components/created-applications";
import CreatedJobs from "@/components/created-jobs";
import { useUser } from "@clerk/clerk-react";
import { BarLoader } from "react-spinners";

const MyJobs = () => {
  const { user, isLoaded } = useUser();

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  // Get the role from URL search params to force a specific view
  const urlParams = new URLSearchParams(window.location.search);
  const forceView = urlParams.get('view');

  // Check if we need to force refresh applications
  const forceRefresh = localStorage.getItem('forceRefreshApplications');
  if (forceRefresh === 'true') {
    console.log("Force refresh applications flag detected in My Jobs page");
  }

  // Always show applications when coming from apply page
  const showApplications = true;

  // No debug function needed

  return (
    <div>
      <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl text-center pb-8">
        {showApplications ? "My Applications" : "My Jobs"}
      </h1>

      {/* Always render CreatedApplications but hide it if not showing applications */}
      <div style={{ display: showApplications ? 'block' : 'none' }}>
        <CreatedApplications />
      </div>

      {/* Show CreatedJobs if not showing applications */}
      {!showApplications && <CreatedJobs />}
    </div>
  );
};

export default MyJobs;
