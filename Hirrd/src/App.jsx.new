import { useEffect } from "react";
import { RouterProvider, createBrowserRouter } from "react-router-dom";

import ProtectedRoute from "./components/protected-route";
import { ThemeProvider } from "./components/theme-provider";
import AppLayout from "./layouts/app-layout";
import ErrorBoundary from "./components/error-boundary";
import NotFound from "./components/not-found";

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

function AppWithReset() {
  // Clear applications on app start
  useEffect(() => {
    console.log("App started - clearing all applications");
    clearAllApplications();
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
