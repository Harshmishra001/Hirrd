/* eslint-disable react/prop-types */
import { addNewCompany } from "@/api/apiCompanies";
import useFetch from "@/hooks/use-fetch";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { BarLoader } from "react-spinners";
import { z } from "zod";
import { Button } from "./ui/button";
import { Input } from "./ui/input";

const schema = z.object({
  name: z.string().min(1, { message: "Company name is required" }),
  logo: z
    .any()
    .optional()
    .refine(
      (file) => {
        // If no file is provided, that's okay
        if (!file || !file[0]) return true;
        // Otherwise check if it's an image
        return file[0].type === "image/png" || file[0].type === "image/jpeg";
      },
      {
        message: "Only Images are allowed",
      }
    ),
});

const AddCompanyDrawer = ({ fetchCompanies, onSuccess }) => {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
  });

  const {
    loading: loadingAddCompany,
    error: errorAddCompany,
    data: dataAddCompany,
    fn: fnAddCompany,
  } = useFetch(addNewCompany);

  const onSubmit = async (data) => {
    try {
      // Validate company name
      if (!data.name || data.name.trim() === '') {
        setError('name', {
          type: 'manual',
          message: 'Company name is required'
        });
        return;
      }

      // Create a payload with the company name
      const payload = {
        name: data.name.trim(),
      };

      // Add logo to payload only if it exists
      if (data.logo && data.logo[0]) {
        payload.logo = data.logo[0];
      } else {
        // Use a default logo or placeholder
        payload.logo_url = "/companies/default.png";
      }

      // Call the API function
      await fnAddCompany(payload);
    } catch (err) {
      console.error("Error submitting company:", err);

      // Set a manual error to display to the user
      setError('apiError', {
        type: 'manual',
        message: err.message || 'Failed to add company. Please try again.'
      });
    }
  };

  useEffect(() => {
    if (dataAddCompany?.length > 0) {
      fetchCompanies();
      // Call onSuccess callback if provided
      if (onSuccess && typeof onSuccess === 'function') {
        onSuccess(dataAddCompany[0]);
      }
    }
  }, [loadingAddCompany, fetchCompanies, onSuccess, dataAddCompany]);

  return (
    <div>
      <form className="flex flex-col gap-4">
        {/* Company Name */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">Company Name</label>
          <Input
            placeholder="Enter company name"
            className="bg-gray-800/50"
            {...register("name")}
            autoFocus
          />
          {errors.name && <p className="text-red-500 text-sm">{errors.name.message}</p>}
          {errors.apiError && (
            <div className="bg-red-900/30 border border-red-500/50 rounded-md p-2 mt-2">
              <p className="text-red-400 text-sm">{errors.apiError.message}</p>
            </div>
          )}
        </div>

        {/* Company Logo (Optional) */}
        <div className="space-y-2">
          <label className="text-sm font-medium text-gray-300">
            Company Logo <span className="text-gray-400 text-xs">(Optional)</span>
          </label>
          <Input
            type="file"
            accept="image/*"
            className="bg-gray-800/50 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-500 file:text-white hover:file:bg-blue-600"
            {...register("logo")}
          />
          <p className="text-xs text-gray-400">A default logo will be used if none is provided</p>
          {errors.logo && <p className="text-red-500 text-sm">{errors.logo.message}</p>}
        </div>

        {/* Error and Loading States */}
        {errorAddCompany?.message && (
          <div className="bg-red-900/30 border border-red-500/50 rounded-md p-3 mt-2">
            <p className="text-red-400 text-sm font-medium">
              <span className="font-bold">Error:</span> {errorAddCompany?.message || "Failed to add company"}
            </p>
            <p className="text-xs text-red-300 mt-1">
              Try using a different company name or contact support if the issue persists.
            </p>
          </div>
        )}
        {loadingAddCompany && (
          <div className="py-2">
            <p className="text-blue-400 text-xs mb-1">Adding company...</p>
            <BarLoader width={"100%"} color="#36d7b7" />
          </div>
        )}

        {/* Add Button */}
        <Button
          type="button"
          onClick={handleSubmit(onSubmit)}
          variant="blue"
          className="w-full mt-4 py-5 text-lg font-bold bg-gradient-to-r from-blue-600 to-blue-400 hover:from-blue-500 hover:to-blue-300"
        >
          Add Company
        </Button>
      </form>
    </div>
  );
};

export default AddCompanyDrawer;
