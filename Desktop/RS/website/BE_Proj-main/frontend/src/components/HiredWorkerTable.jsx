import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "./ui/table";
import { Badge } from "./ui/badge";
import { useSelector } from "react-redux";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Eye, Phone } from "lucide-react";
import Footer from "./shared/Footer";
import { Button } from "./ui/button";
import ReviewDialog from "./ReviewDialog";

const HiredWorkerTable = () => {
  const { clientHires } = useSelector((store) => store.application);
  const [open, setOpen] = useState(false);
  const [selectedWorkerId, setSelectedWorkerId] = useState(null);

  const handleOpenReview = (workerId) => {
    setSelectedWorkerId(workerId);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setSelectedWorkerId(null);
  };

  return (
    <div>
      <Table>
        <TableCaption>A list of the workers you have hired</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Hired Request Date</TableHead>
            <TableHead>Profile</TableHead>
            <TableHead>Worker Name</TableHead>
            <TableHead>Skill</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead className="text-center">Status</TableHead>
            <TableHead className="text-center">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clientHires.map((item) => (
            <TableRow key={item._id}>
              <TableCell>{item?.createdAt?.split("T")[0]}</TableCell>
              <TableCell>
                <Avatar>
                  <AvatarImage src={item?.worker?.profilePhoto} />
                </Avatar>
              </TableCell>
              <TableCell>{item?.worker?.fullname}</TableCell>
              <TableCell>{item?.worker?.skills}</TableCell>
              <TableCell>
                {item?.status === "Accepted" ? (
                  <div className="flex items-center gap-1 font-medium">
                    <Phone className="cursor-pointer" size={16} />
                    <span>{item?.worker?.phoneNumber}</span>
                  </div>
                ) : (
                  <span className="text-gray-400 italic">Hidden</span>
                )}
              </TableCell>
              <TableCell className="text-center">
                <Badge
                  className={`${
                    item?.status === "Accepted"
                      ? "bg-green-100 text-green-700 border-green-700"
                      : item?.status === "Rejected"
                      ? "bg-red-100 text-red-700 border-red-700"
                      : "bg-gray-100 text-gray-700 border-gray-700"
                  }`}
                  variant="outline"
                >
                  {item?.status}
                </Badge>
              </TableCell>
              <TableCell className="text-center">
                {item?.status === "Accepted" && (
                  <Button
                    size="sm"
                    onClick={() =>
                      item?.worker?._id && handleOpenReview(item?.worker?._id)
                    }
                  >
                    Give Review
                  </Button>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <ReviewDialog
        open={open}
        setOpen={handleClose}
        workerId={selectedWorkerId}
      />
      <Footer />
    </div>
  );
};

export default HiredWorkerTable;
