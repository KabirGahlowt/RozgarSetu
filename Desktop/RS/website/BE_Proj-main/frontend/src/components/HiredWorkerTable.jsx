import React from "react";
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

const HiredWorkerTable = () => {
  return (
    <div>
      <Table>
        <TableCaption>A list of the workers you have hired</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Hired Date</TableHead>
            <TableHead>Worker Name</TableHead>
            <TableHead>Skill</TableHead>
            <TableHead className="text-right">Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {[1, 2, 3, 4].map((item, index) => (
            <TableRow key={index}>
              <TableCell>14-02-2026</TableCell>
              <TableCell>Ramesh Jammna</TableCell>
              <TableCell>Housekeeper</TableCell>
              <TableCell className="text-right">
                <Badge>Completed</Badge>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default HiredWorkerTable;
