import supabaseClient, { supabaseUrl } from "@/utils/supabase";

// Fetch Companies
export async function getCompanies(token) {
  const supabase = await supabaseClient(token);
  const { data, error } = await supabase.from("companies").select("*");

  if (error) {
    console.error("Error fetching Companies:", error);
    return null;
  }

  return data;
}

// Add Company
export async function addNewCompany(token, _, companyData) {
  try {
    if (!token) {
      throw new Error("Authentication token is missing. Please log in again.");
    }

    const supabase = await supabaseClient(token);

    // Use default logo path if not provided
    let logo_url = companyData.logo_url || "/companies/default.png";

    // Only upload a logo if one was provided
    if (companyData.logo) {
      try {
        const random = Math.floor(Math.random() * 90000);
        // Sanitize the company name for use in the filename
        const sanitizedName = companyData.name
          .replace(/\s+/g, '-')
          .replace(/[^a-zA-Z0-9-]/g, '')
          .toLowerCase();
        const fileName = `logo-${random}-${sanitizedName}`;

        const { error: storageError } = await supabase.storage
          .from("company-logo")
          .upload(fileName, companyData.logo);

        if (storageError) {
          console.error("Error uploading logo:", storageError);
          // Continue with default logo
        } else {
          // Use the uploaded logo
          logo_url = `${supabaseUrl}/storage/v1/object/public/company-logo/${fileName}`;
        }
      } catch (err) {
        console.error("Error in logo upload process:", err);
        // Continue with default logo
      }
    }

    // Create the company record
    const { data, error } = await supabase
      .from("companies")
      .insert([
        {
          name: companyData.name,
          logo_url: logo_url,
        },
      ])
      .select();

    if (error) {
      console.error("Supabase error:", error);
      // Handle case where error.message might be undefined
      const errorMessage = error.message || error.details || error.hint || JSON.stringify(error);
      throw new Error("Error adding company: " + errorMessage);
    }

    return data;
  } catch (error) {
    console.error("Error in addNewCompany:", error);

    // Create a more descriptive error message
    let errorMessage = "Failed to add company. Please try again.";

    if (error) {
      if (typeof error === 'string') {
        errorMessage = error;
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.details || error.hint) {
        errorMessage = error.details || error.hint;
      } else if (typeof error === 'object') {
        try {
          errorMessage = JSON.stringify(error);
        } catch (e) {
          // Keep default message if JSON stringify fails
        }
      }
    }

    throw new Error(errorMessage);
  }
}
