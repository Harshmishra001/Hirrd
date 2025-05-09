import { useSession } from "@clerk/clerk-react";
import { useState } from "react";

const useFetch = (cb, options = {}) => {
  const [data, setData] = useState(undefined);
  const [loading, setLoading] = useState(null);
  const [error, setError] = useState(null);

  const { session } = useSession();

  const fn = async (...args) => {
    setLoading(true);
    setError(null);

    try {
      // Get the Supabase token from Clerk
      let supabaseAccessToken;
      try {
        supabaseAccessToken = await session.getToken({
          template: "supabase",
        });

        if (!supabaseAccessToken) {
          throw new Error("Failed to get authentication token. Please try logging out and back in.");
        }
      } catch (tokenError) {
        console.error("Error getting token:", tokenError);
        throw new Error("Authentication error: " + (tokenError.message || "Please try logging out and back in."));
      }

      // Call the API function with the token
      const response = await cb(supabaseAccessToken, options, ...args);
      setData(response);
      setError(null);
      return response;
    } catch (error) {
      console.error("Error in useFetch:", error);

      // Create a more user-friendly error object
      let errorObj;
      if (typeof error === 'string') {
        errorObj = new Error(error);
      } else if (error instanceof Error) {
        errorObj = error;
      } else {
        const message = error?.message || error?.details || error?.hint ||
                       (typeof error === 'object' ? JSON.stringify(error) : 'Unknown error');
        errorObj = new Error(message);
      }

      setError(errorObj);
      throw errorObj; // Re-throw to allow component-level handling
    } finally {
      setLoading(false);
    }
  };

  return { data, loading, error, fn };
};

export default useFetch;
