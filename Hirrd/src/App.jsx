import { useAuth } from "@clerk/clerk-react";
import { useEffect, useRef } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import ErrorBoundary from "./components/error-boundary";
import NotFound from "./components/not-found";
import ProtectedRoute from "./components/protected-route";
import { ThemeProvider } from "./components/theme-provider";
import AppLayout from "./layouts/app-layout";

import JobPage from "./pages/job";
import JobListing from "./pages/jobListing";
import LandingPage from "./pages/landing";
import MyJobs from "./pages/my-jobs";
import Onboarding from "./pages/onboarding";
import PostJob from "./pages/post-job";
import RecruiterDashboard from "./pages/recruiter-dashboard";
import SavedJobs from "./pages/saved-jobs";

// Import the clearAllApplications function
import { clearAllApplications } from "./data/mock-applications.js";

import "./App.css";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        element: <LandingPage />,
      },
      {
        path: "onboarding",
        element: (
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        ),
      },
      {
        path: "jobs",
        element: (
          <ProtectedRoute>
            <JobListing />
          </ProtectedRoute>
        ),
      },
      {
        path: "post-job",
        element: (
          <ProtectedRoute>
            <PostJob />
          </ProtectedRoute>
        ),
      },
      {
        path: "my-jobs",
        element: (
          <ProtectedRoute>
            <MyJobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "saved-jobs",
        element: (
          <ProtectedRoute>
            <SavedJobs />
          </ProtectedRoute>
        ),
      },
      {
        path: "job/:id",
        element: (
          <ProtectedRoute>
            <JobPage />
          </ProtectedRoute>
        ),
      },
      {
        path: "recruiter-dashboard",
        element: (
          <ProtectedRoute>
            <RecruiterDashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "*",
        element: <NotFound />,
      },
    ],
  },
]);

// Custom hook to handle sign-out events
function useSignOutHandler() {
  const { isSignedIn } = useAuth();
  const previousSignInState = useRef(isSignedIn);

  useEffect(() => {
    // If the user was signed in before and now is not, they've signed out
    if (previousSignInState.current === true && isSignedIn === false) {
      console.log("User signed out - clearing all applications");
      // This is the only place where applications should be cleared
      clearAllApplications();
    }

    // Update the previous state
    previousSignInState.current = isSignedIn;
  }, [isSignedIn]);
}

function AppWithReset() {
  // Use our custom hook to handle sign-out events
  useSignOutHandler();

  // Don't clear applications on app start anymore
  // This allows applications to persist until the user signs out
  useEffect(() => {
    console.log("App started - applications will persist until sign out");
  }, []);

  return <RouterProvider router={router} />;
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <AppWithReset />
    </ThemeProvider>
  );
}

export default App;
