import { useUser } from "@clerk/clerk-react";
import { Building2, MapPin, Search } from "lucide-react";
import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { BarLoader } from "react-spinners";

import JobCard from "@/components/job-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

import { getCompanies } from "@/api/apiCompanies";
import { getJobs } from "@/api/apiJobs";
import { getLocallyCreatedJobs } from "../data/mock-created-jobs.js";
import { mockJobs } from "../data/mock-jobs.js";

const JobListing = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [location, setLocation] = useState("");
  const [company, setCompany] = useState("");
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [companies, setCompanies] = useState([]);
  const [searchParams] = useSearchParams();
  const [newJobId, setNewJobId] = useState(null);
  const [localJobs, setLocalJobs] = useState([]);

  const { user } = useUser();

  // Function to fetch jobs
  const fetchJobs = async () => {
    setLoading(true);
    try {
      console.log("Fetching jobs with filters:", {
        searchQuery: searchQuery || "none",
        location: location || "none",
        company: company || "none"
      });

      // Get locally created jobs first
      const locallyCreatedJobs = getLocallyCreatedJobs();
      setLocalJobs(locallyCreatedJobs);

      // Try to get jobs from API without filters first
      // We'll apply filters client-side for better results
      const jobsData = await getJobs(user?.getToken(), {});

      // If we have jobs from API, combine them with local jobs
      if (jobsData && jobsData.length > 0) {
        // Combine API jobs with locally created jobs, avoiding duplicates
        const combinedJobs = [...locallyCreatedJobs];

        // Add API jobs that don't exist in local jobs
        jobsData.forEach(apiJob => {
          if (!combinedJobs.some(job => job.id === apiJob.id)) {
            combinedJobs.push(apiJob);
          }
        });

        setJobs(combinedJobs);
      } else {
        // Otherwise, use mock jobs + locally created jobs
        setJobs([...locallyCreatedJobs, ...mockJobs]);
      }
    } catch (error) {
      console.error("Error fetching jobs:", error);
      // Use mock jobs + locally created jobs as fallback
      const locallyCreatedJobs = getLocallyCreatedJobs();
      setLocalJobs(locallyCreatedJobs);
      setJobs([...locallyCreatedJobs, ...mockJobs]);
    } finally {
      setLoading(false);
    }
  };

  // Function to fetch companies
  const fetchCompanies = async () => {
    try {
      const companiesData = await getCompanies(user?.getToken());
      if (companiesData) {
        setCompanies(companiesData);
      }
    } catch (error) {
      console.error("Error fetching companies:", error);
    }
  };

  // Initial data fetch
  useEffect(() => {
    if (user) {
      fetchJobs();
      fetchCompanies();
    }
  }, [user]);

  // Listen for local jobs updates
  useEffect(() => {
    const handleLocalJobsUpdated = () => {
      console.log("Local jobs updated event received");
      const locallyCreatedJobs = getLocallyCreatedJobs();
      setLocalJobs(locallyCreatedJobs);

      // Update jobs list with new local jobs
      setJobs(prevJobs => {
        // Filter out any local jobs that might already be in the list
        const filteredJobs = prevJobs.filter(job =>
          !locallyCreatedJobs.some(localJob => localJob.id === job.id)
        );
        // Add local jobs at the beginning
        return [...locallyCreatedJobs, ...filteredJobs];
      });
    };

    window.addEventListener('localJobsUpdated', handleLocalJobsUpdated);

    return () => {
      window.removeEventListener('localJobsUpdated', handleLocalJobsUpdated);
    };
  }, []);

  // Check for new job ID in URL
  useEffect(() => {
    const newJobIdParam = searchParams.get("new_job_id");
    if (newJobIdParam) {
      setNewJobId(parseInt(newJobIdParam));

      // Clear search params after a delay
      setTimeout(() => {
        setNewJobId(null);
      }, 5000);
    }

    // Check for refresh parameter
    const shouldRefresh = searchParams.get("refresh") === "true";
    if (shouldRefresh) {
      // Clear all filters
      setSearchQuery("");
      setLocation("");
      setCompany("");

      // Fetch jobs again
      fetchJobs();
    }
  }, [searchParams]);

  // Filter jobs based on search criteria
  useEffect(() => {
    console.log("Filtering jobs with criteria:", {
      searchQuery: searchQuery || "none",
      location: location || "none",
      company: company || "none"
    });

    if (jobs.length > 0) {
      let filtered = [...jobs];
      console.log("Starting with", filtered.length, "jobs");

      // Filter by search query (title)
      if (searchQuery && searchQuery.trim() !== '') {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter((job) => {
          // Make sure job.title exists and is a string
          if (!job.title || typeof job.title !== 'string') return false;
          return job.title.toLowerCase().includes(query);
        });
        console.log("After title filter:", filtered.length, "jobs remaining");
      }

      // Filter by location
      if (location && location.trim() !== '') {
        filtered = filtered.filter((job) => {
          // Make sure job.location exists and is a string
          if (!job.location || typeof job.location !== 'string') return false;
          return job.location.toLowerCase() === location.toLowerCase();
        });
        console.log("After location filter:", filtered.length, "jobs remaining");
      }

      // Filter by company
      if (company && company.trim() !== '') {
        filtered = filtered.filter((job) => {
          // Try to match by company_id first
          if (job.company_id && job.company_id.toString() === company) {
            return true;
          }

          // Then try to match by company name
          if (job.company && job.company.name) {
            const companyName = job.company.name.toLowerCase();
            const searchCompany = company.toLowerCase();
            return companyName === searchCompany || companyName.includes(searchCompany);
          }

          // For locally created jobs that might store company name differently
          if (job.company_name) {
            return job.company_name.toLowerCase() === company.toLowerCase();
          }

          return false;
        });
        console.log("After company filter:", filtered.length, "jobs remaining");
      }

      setFilteredJobs(filtered);
    } else {
      setFilteredJobs([]);
    }
  }, [jobs, searchQuery, location, company]);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Search form submitted with:", { searchQuery, location, company });

    // Trim all search inputs
    if (searchQuery) setSearchQuery(searchQuery.trim());
    if (location) setLocation(location.trim());
    if (company) setCompany(company.trim());

    // Fetch jobs (which will trigger the filtering useEffect)
    fetchJobs();
  };

  const handleClearFilters = () => {
    console.log("Clearing all filters");
    setSearchQuery("");
    setLocation("");
    setCompany("");

    // Fetch jobs without filters
    fetchJobs();
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="gradient-title font-extrabold text-5xl sm:text-7xl text-center pb-8">
        Find Your Dream Job
      </h1>

      <div className="bg-gray-900/50 rounded-lg p-4 mb-8">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 text-gray-400" size={16} />
            <Input
              placeholder="Search by job title"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-800/50 border-gray-700"
            />
          </div>

          <div className="w-full md:w-64 relative">
            <MapPin className="absolute left-3 top-3 text-gray-400" size={16} />
            <Select value={location} onValueChange={setLocation}>
              <SelectTrigger className="pl-10 bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Location" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectGroup>
                  {/* Get unique locations from all jobs */}
                  {[
                    // Get locations from API jobs
                    ...jobs.map(job => job.location),
                    // Get locations from mock jobs
                    ...mockJobs.map(job => job.location),
                    // Get locations from local jobs
                    ...localJobs.map(job => job.location)
                  ]
                    .filter(Boolean) // Remove undefined/null values
                    .filter((location, index, self) => self.indexOf(location) === index) // Remove duplicates
                    .sort() // Sort alphabetically
                    .map(location => (
                      <SelectItem key={location} value={location}>
                        {location}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="w-full md:w-64 relative">
            <Building2 className="absolute left-3 top-3 text-gray-400" size={16} />
            <Select value={company} onValueChange={setCompany}>
              <SelectTrigger className="pl-10 bg-gray-800/50 border-gray-700">
                <SelectValue placeholder="Company" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectGroup>
                  {/* First show companies from API */}
                  {companies.map(({ id, name }) => (
                    <SelectItem key={`api-${id}`} value={name}>
                      {name}
                    </SelectItem>
                  ))}

                  {/* Then show companies from locally created jobs */}
                  {localJobs
                    .filter(job => job.company && job.company.name)
                    .map(job => job.company.name)
                    .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
                    .map(name => (
                      <SelectItem key={`local-${name}`} value={name}>
                        {name}
                      </SelectItem>
                    ))}

                  {/* Finally show companies from mock jobs */}
                  {mockJobs
                    .filter(job => job.company && job.company.name)
                    .map(job => job.company.name)
                    .filter((name, index, self) => self.indexOf(name) === index) // Remove duplicates
                    .filter(name =>
                      // Only add if not already in API companies or local jobs
                      !companies.some(c => c.name === name) &&
                      !localJobs.some(j => j.company && j.company.name === name)
                    )
                    .map(name => (
                      <SelectItem key={`mock-${name}`} value={name}>
                        {name}
                      </SelectItem>
                    ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="submit" className="flex-1">
              Search
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={handleClearFilters}
              className="flex-1"
            >
              Clear
            </Button>
          </div>
        </form>
      </div>

      {loading ? (
        <div className="flex justify-center my-8">
          <BarLoader color="#36d7b7" />
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              isNew={job.id === newJobId || localJobs.some(localJob => localJob.id === job.id)}
              onJobAction={fetchJobs}
              pageType="jobs" // Explicitly set to "jobs" to hide delete button
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-300 mb-2">No jobs found</h2>
          <p className="text-gray-400">
            Try adjusting your search filters or check back later for new opportunities.
          </p>
        </div>
      )}
    </div>
  );
};

export default JobListing;
