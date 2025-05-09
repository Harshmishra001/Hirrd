import { Link } from "react-router-dom";
import { Button } from "./ui/button";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <div className="max-w-md w-full bg-gray-800 p-8 rounded-lg shadow-lg">
        <h1 className="text-4xl font-bold text-red-500 mb-2">404: Not Found</h1>
        <p className="text-xl text-gray-300 mb-6">
          The page you're looking for doesn't exist or has been moved.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button 
            variant="outline" 
            className="flex items-center gap-2"
            onClick={() => window.history.back()}
          >
            <ArrowLeft size={16} />
            Go Back
          </Button>
          
          <Link to="/">
            <Button 
              variant="blue" 
              className="flex items-center gap-2 w-full"
            >
              <Home size={16} />
              Home
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
