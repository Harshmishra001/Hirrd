import { Button } from "@/components/ui/button";
import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { BarLoader } from "react-spinners";
import { useUser } from "../contexts/AuthContext";

const Onboarding = () => {
  const { user, isLoaded } = useUser();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const navigateUser = (currRole) => {
    navigate(currRole === "recruiter" ? "/post-job" : "/jobs");
  };

  const handleRoleSelection = async (role) => {
    await user
      .update({ unsafeMetadata: { role } })
      .then(() => {
        console.log(`Role updated to: ${role}`);
        navigateUser(role);
      })
      .catch((err) => {
        console.error("Error updating role:", err);
      });
  };

  useEffect(() => {
    // Only auto-redirect if the user has a role and we're not forcing role selection
    const forceSelection = searchParams.get("force-selection") === "true";

    if (user?.unsafeMetadata?.role && !forceSelection) {
      navigateUser(user.unsafeMetadata.role);
    }
  }, [user, searchParams]);

  if (!isLoaded) {
    return <BarLoader className="mb-4" width={"100%"} color="#36d7b7" />;
  }

  return (
    <div className="flex flex-col items-center justify-center mt-40">
      <h2 className="gradient-title font-extrabold text-7xl sm:text-8xl tracking-tighter">
        I am a...
      </h2>
      <div className="mt-16 grid grid-cols-2 gap-4 w-full md:px-40">
        <Button
          variant="blue"
          className="h-36 text-2xl"
          onClick={() => handleRoleSelection("candidate")}
        >
          Candidate <span className="text-lg opacity-80">(Guest)</span>
        </Button>
        <Button
          variant="destructive"
          className="h-36 text-2xl"
          onClick={() => handleRoleSelection("recruiter")}
        >
          Recruiter <span className="text-lg opacity-80">(Admin)</span>
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
