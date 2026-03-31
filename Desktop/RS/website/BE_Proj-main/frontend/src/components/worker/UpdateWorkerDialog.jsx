import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { toast } from "sonner";
import { WORKER_API_END_POINT } from "../../utils/constant";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { setSingleWorker } from "../../redux/workSlice";

const UpdateWorkerDialog = ({ open, setOpen }) => {
  const [loading, setLoading] = useState(false);
  const { singleWorker } = useSelector((store) => store.work);

  const [input, setInput] = useState({
    fullname: singleWorker?.fullname || "",
    address: singleWorker?.address || "",
    pincode: singleWorker?.pincode || "",
    phoneNumber: singleWorker?.phoneNumber || "",
    avaliability: singleWorker?.avaliability || "",
    skills: singleWorker?.skills || "",
    experienceYears: singleWorker?.experienceYears || "",
    file: null, //user?.profile?.profilePhoto, gpt says keep it null
  });

  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const fileChangeHandler = async (e) => {
    const file = e.target.files?.[0];
    setInput({ ...input, file });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullname", input.fullname);
    formData.append("address", input.address);
    formData.append("pincode", input.pincode);
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("avaliability", input.avaliability);
    formData.append("skills", input.skills);
    formData.append("experienceYears", input.experienceYears);

    if (input.file) {
      formData.append("file", input.file);
    }

    try {
      setLoading(true);
      const res = await axios.post(
        `${WORKER_API_END_POINT}/profile/update`,
        formData,
        {
          /*headers: {
            "Content-Type": "multipart/form-data",
          },*/
          withCredentials: true,
        },
      );
      if (res.data.success) {
        dispatch(setSingleWorker(res.data.worker));
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    } finally {
      setLoading(false);
    }
    setOpen(false);
    console.log(input);
  };

  return (
    <div>
      <Dialog open={open}>
        <DialogContent
          className="sm: max-w-[425px]"
          onInteractOutside={() => setOpen(false)}
        >
          <DialogHeader>
            <DialogTitle>Update Worker Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={submitHandler}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  className="col-span-3"
                  name="fullname"
                  value={input.fullname}
                  onChange={changeEventHandler}
                />
              </div>
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="number" className="text-right">
                  Number
                </Label>
                <Input
                  id="number"
                  className="col-span-3"
                  name="phoneNumber"
                  value={input.phoneNumber}
                  onChange={changeEventHandler}
                />
              </div>
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="address" className="text-right">
                  Address
                </Label>
                <Input
                  id="address"
                  className="col-span-3"
                  name="address"
                  value={input.address}
                  onChange={changeEventHandler}
                />
              </div>
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="pincode" className="text-right">
                  Pincode
                </Label>
                <Input
                  id="pincode"
                  className="col-span-3"
                  name="pincode"
                  value={input.pincode}
                  onChange={changeEventHandler}
                />
              </div>
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="avaliability" className="text-right">
                  Avaliability
                </Label>
                <Input
                  id="avaliability"
                  className="col-span-3"
                  name="avaliability"
                  value={input.avaliability}
                  placeholder="Full-time / Half-time"
                  onChange={changeEventHandler}
                />
              </div>
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="experienceYears" className="text-right">
                  Years of Experience
                </Label>
                <Input
                  id="experienceYears"
                  className="col-span-3"
                  name="experienceYears"
                  value={input.experienceYears}
                  onChange={changeEventHandler}
                />
              </div>
            </div>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="file" className="text-right">
                  Profile photo
                </Label>
                <Input
                  id="file"
                  className="col-span-3"
                  name="file"
                  type="file"
                  accept="image/*"
                  onChange={fileChangeHandler}
                />
              </div>
            </div>
            <DialogFooter>
              {loading ? (
                <Button className="w-full my-4">
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please Wait
                </Button>
              ) : (
                <Button type="submit" className="w-full my-4">
                  Update
                </Button>
              )}
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UpdateWorkerDialog;
