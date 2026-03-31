import React, { useState } from "react";
import Navbar from "./shared/Navbar";
import { Avatar, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Contact, Locate, Mail, Map, Pen } from "lucide-react";
import { Badge } from "./ui/badge";
import HiredWorkerTable from "./HiredWorkerTable";
import UpdateProfileDialog from "./UpdateProfileDialog";
import { useSelector } from "react-redux";
import store from "../redux/store";
import useGetClientHires from "../hooks/useGetClientHires";

{
  /*Worker skills array*/
}
const skills = ["Housekeeper", "Cook", "Mechanic", "Electrician", "Gardener"];
const Profile = () => {
  const [open, setOpen] = useState(false);
  const { user } = useSelector((store) => store.auth);
  const { clientHires, applicants } = useSelector((store) => store.application);
  useGetClientHires();

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto bg-white border border-gray-200 rounded-2xl my-5 p-8">
        <div className="flex justify-between">
          <div className="flex items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={user?.profilePhoto} />
            </Avatar>
            <div>
              <h1 className="font-medium text-xl">{user?.fullname}</h1>
            </div>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="text-right"
            variant="outline"
          >
            <Pen />
          </Button>
        </div>
        <div className="my-5">
          <div className="flex items-center gap-3 my-2">
            <b>Email:</b>
            <span>{user?.email}</span>
          </div>

          <div className="flex items-center gap-3 my-2">
            <b>Phone Number:</b>
            <span>{user?.phoneNumber}</span>
          </div>

          <div className="flex items-center gap-3 my-2">
            <b>Address:</b>
            <span>{user?.address}</span>
          </div>

          <div className="flex items-center gap-3 my-2">
            <b>Pincode:</b>
            <span>{user?.pincode}</span>
          </div>
        </div>
      </div>
      <div className="max-w-4xl mx-auto bg-white rounded-2xl">
        <h1 className="font-bold text-lg my-5">Workers Hired</h1>
        {/*Application Table*/}
        <HiredWorkerTable />
      </div>
      <UpdateProfileDialog open={open} setOpen={setOpen} />
    </div>
  );
};

export default Profile;
