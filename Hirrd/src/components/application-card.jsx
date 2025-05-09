/* eslint-disable react/prop-types */
import { updateApplicationStatus } from "@/api/apiApplication";
import useFetch from "@/hooks/use-fetch";
import { Boxes, BriefcaseBusiness, School } from "lucide-react";
import { BarLoader } from "react-spinners";
import {
    Card,
    CardContent,
    CardFooter,
    CardHeader,
    CardTitle,
} from "./ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "./ui/select";

const ApplicationCard = ({ application, isCandidate = false, isNew = false, cardRef = null }) => {
  const { loading: loadingHiringStatus, fn: fnHiringStatus } = useFetch(
    updateApplicationStatus,
    {
      job_id: application.job_id,
    }
  );

  const handleStatusChange = (status) => {
    fnHiringStatus(status).then(() => fnHiringStatus());
  };

  return (
    <Card
      ref={cardRef}
      className={isNew ? "border-2 border-blue-500 shadow-lg shadow-blue-500/20 animate-pulse" : ""}
    >
      {loadingHiringStatus && <BarLoader width={"100%"} color="#36d7b7" />}
      {isNew && (
        <div className="bg-blue-500 text-white text-center py-1 px-2 text-sm font-bold">
          New Application
        </div>
      )}
      <CardHeader>
        <CardTitle className="font-bold">
          {isCandidate
            ? (application?.job?.title
               ? `${application?.job?.title} at ${application?.job?.company?.name || 'Company'}`
               : `Job Application at ${application?.job?.company?.name || 'Company'}`)
            : application?.name}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 flex-1">
        <div className="flex flex-col md:flex-row justify-between">
          <div className="flex gap-2 items-center">
            <BriefcaseBusiness size={15} /> {application?.experience} years of
            experience
          </div>
          <div className="flex gap-2 items-center">
            <School size={15} />
            {application?.education}
          </div>
          <div className="flex gap-2 items-center">
            <Boxes size={15} /> Skills: {application?.skills}
          </div>
        </div>
        <hr />
      </CardContent>
      <CardFooter className="flex justify-between">
        <span>{new Date(application?.created_at).toLocaleString()}</span>
        {isCandidate ? (
          <span className="capitalize font-bold">
            Status: {application.status}
          </span>
        ) : (
          <Select
            onValueChange={handleStatusChange}
            defaultValue={application.status}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Application Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="applied">Applied</SelectItem>
              <SelectItem value="interviewing">Interviewing</SelectItem>
              <SelectItem value="hired">Hired</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        )}
      </CardFooter>
    </Card>
  );
};

export default ApplicationCard;
