import React from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Button } from "../ui/button";
import { Badge } from "../ui/badge";
import { useDispatch, useSelector } from "react-redux";
import { Avatar, AvatarImage } from "../ui/avatar";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "../../utils/constant";
import { toast } from "sonner";
import { setAllApplicants } from "../../redux/applicationSlice";

const readyToTakeWork = [
  { label: "Accept", value: "Accepted" },
  { label: "Reject", value: "Rejected" },
];

const ClientsTable = () => {
  const { applicants } = useSelector((store) => store.application);
  const dispatch = useDispatch();

  const handleStatusUpdate = async (id, status) => {
    try {
      const res = await axios.post(
        `${APPLICATION_API_END_POINT}/hire/status/${id}`,
        { status },
        { withCredentials: true },
      );
      if (res.data.success) {
        toast.success(res.data.message);
        dispatch(
          setAllApplicants(
            applicants.map((application) =>
              application._id === id ? { ...application, status } : application,
            ),
          ),
        );
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div>
      <Table>
        <TableCaption>List of clients who want to hire you</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Profile Photo</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Address</TableHead>
            <TableHead>Date of Hire Request</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Action</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {applicants &&
            applicants.map((application) => (
              <tr key={application._id}>
                <TableHead>
                  <Avatar>
                    <AvatarImage src={application?.client?.profilePhoto} />
                  </Avatar>
                </TableHead>
                <TableCell>{application?.client?.fullname}</TableCell>
                <TableCell>{application?.client?.address}</TableCell>
                <TableCell>{application?.createdAt?.split("T")[0]}</TableCell>
                <TableCell>
                  {application?.status === "Accepted" ? (
                    <div className="flex items-center gap-1 text-sm font-medium">
                      📞 {application?.client?.phoneNumber}
                    </div>
                  ) : (
                    <span className="text-gray-400 italic">Hidden</span>
                  )}
                </TableCell>
                <TableCell>
                  {application?.status === "Pending" ? (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(application._id, "Accepted")}
                        className="bg-green-600 hover:bg-green-700 text-white"
                      >
                        A
                      </Button>
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(application._id, "Rejected")}
                        variant="destructive"
                      >
                        R
                      </Button>
                    </div>
                  ) : application?.status === "Accepted" ? (
                    <Button
                      size="sm"
                      onClick={() => handleStatusUpdate(application._id, "Completed")}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      ✅ Job Done
                    </Button>
                  ) : (
                    <span className="text-sm text-gray-500 italic">Done</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex flex-col gap-1 items-start">
                    <Badge
                      className={`${
                        application?.status === "Accepted"
                          ? "bg-green-100 text-green-700 border-green-700"
                          : application?.status === "Rejected"
                          ? "bg-red-100 text-red-700 border-red-700"
                          : "bg-gray-100 text-gray-700 border-gray-700"
                      }`}
                      variant="outline"
                    >
                      {application?.status}
                    </Badge>
                  </div>
                </TableCell>
              </tr>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientsTable;
