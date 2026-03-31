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
import { Popover, PopoverContent, PopoverTrigger } from "../ui/popover";
import { MoreHorizontal } from "lucide-react";
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
                <TableCell className="cursor-pointer">
                  <Popover>
                    <PopoverTrigger>
                      <MoreHorizontal />
                    </PopoverTrigger>
                    <PopoverContent className="w-32">
                      {readyToTakeWork.map((action, index) => {
                        return (
                          <div
                            key={index}
                            onClick={() =>
                              handleStatusUpdate(application._id, action.value)
                            }
                            className="flex w-fit items-center my-2 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                          >
                            <span>{action?.label}</span>
                          </div>
                        );
                      })}
                    </PopoverContent>
                  </Popover>
                </TableCell>
                <TableCell>
                  {application?.status === "Accepted" && (
                    <div className="text-sm mt-1">
                      📞 {application?.client?.phoneNumber}
                    </div>
                  )}
                </TableCell>
              </tr>
            ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientsTable;
