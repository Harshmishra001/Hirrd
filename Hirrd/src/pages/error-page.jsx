import { useRouteError, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

export default function ErrorPage() {
  const error = useRouteError();
  console.error(error);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl mb-6">Oops!</h1>
      <div className="bg-gray-800/50 p-6 rounded-lg border border-blue-500/20 shadow-lg shadow-blue-500/10 max-w-md w-full mb-8">
        <h2 className="text-2xl font-bold mb-4">Something went wrong</h2>
        <p className="text-gray-300 mb-4">
          {error.statusText || error.message || "Sorry, an unexpected error has occurred."}
        </p>
        {error.status === 404 && (
          <p className="text-gray-400 mb-6">
            The page you're looking for doesn't exist or has been moved.
          </p>
        )}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            variant="blue"
            className="bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300"
            asChild
          >
            <Link to="/">Go to Home</Link>
          </Button>
          <Button
            variant="outline"
            onClick={() => window.history.back()}
          >
            Go Back
          </Button>
        </div>
      </div>
    </div>
  );
}
