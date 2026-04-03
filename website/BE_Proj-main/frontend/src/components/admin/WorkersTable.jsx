import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Avatar, AvatarImage } from "../ui/avatar";
import { Popover, PopoverTrigger } from "../ui/popover";
import { PopoverContent } from "@radix-ui/react-popover";
import { Edit2, MoreHorizontal } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const WorkersTable = () => {
  const { allWorkers, searchWorkerByText } = useSelector((store) => store.work);
  const [filterWorker, setFilterWorker] = useState(allWorkers);
  const navigate = useNavigate();

  useEffect(() => {
    const filteredWorker =
      allWorkers.length >= 0 &&
      allWorkers.filter((worker) => {
        if (!searchWorkerByText) {
          return true;
        }
        return worker?.fullname
          ?.toLowerCase()
          .includes(searchWorkerByText.toLowerCase());
      });
    setFilterWorker(filteredWorker);
  }, [allWorkers, searchWorkerByText]);
  return (
    <div>
      <Table>
        <TableCaption>List of registered workers</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Profile</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Occupation/Skill</TableHead>
            <TableHead className="text-right">Action</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {!allWorkers || allWorkers.length === 0 ? (
            <span>No Workers have been registered</span>
          ) : (
            <>
              {filterWorker?.map((worker) => {
                return (
                  <TableRow key={worker._id}>
                    <TableCell>
                      <Avatar>
                        <AvatarImage src={worker.profilePhoto} />
                      </Avatar>
                    </TableCell>
                    <TableCell>{worker.fullname}</TableCell>
                    <TableCell>{worker.createdAt.split("T")[0]}</TableCell>
                    <TableCell>{worker.skills}</TableCell>
                    <TableCell className="text-right cursor-pointer">
                      <Popover>
                        <PopoverTrigger>
                          <MoreHorizontal />
                        </PopoverTrigger>
                        <PopoverContent className="w-32">
                          <div
                            onClick={() =>
                              navigate(`/admin/workers/${worker._id}`)
                            }
                            className="flex items-center gap-2 w-fit cursor-pointer"
                          >
                            <Edit2 className="w-4" />
                            <span>Edit</span>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                  </TableRow>
                );
              })}
            </>
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default WorkersTable;
