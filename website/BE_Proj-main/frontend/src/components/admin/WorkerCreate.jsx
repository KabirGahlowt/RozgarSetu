import React, { useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { WORKER_API_END_POINT } from "../../utils/constant";
import { useDispatch } from "react-redux";
import { setSingleWorker } from "../../redux/workSlice";
import { toast } from "sonner";

const WorkerCreate = () => {
  const navigate = useNavigate();
  const [input, setInput] = useState({
    fullname: "",
    phoneNumber: "",
    password: "",
    address: "",
    city: "",
    pincode: "",
    skills: "",
    avaliability: "",
    experienceYears: "",
    file: null,
  });

  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const changeFileHandler = (e) => {
    const file = e.target.files?.[0];
    setInput({ ...input, file });
  };

  /*
  const registerNewWorker = async () => {
    try {
      const res = await axios.post(
        `${WORKER_API_END_POINT}/register`,
        { workerName },
        {
          headers: {
            "Content-Type": "application/json",
          },
          withCredentials: true,
        },
      );
      if (res?.data?.success) {
        dispatch(setSingleWorker(res.data.worker));
        toast.success(res.data.message);
        const workerId = res?.data?.worker?._id;
        navigate(`/admin/workers/${workerId}`);
      }
    } catch (error) {}
  };*/

  const registerNewWorker = async () => {
    try {
      const formData = new FormData();

      formData.append("fullname", input.fullname);
      formData.append("phoneNumber", input.phoneNumber);
      formData.append("password", input.password);
      formData.append("address", input.address);
      formData.append("city", input.city);
      formData.append("pincode", input.pincode);
      formData.append("skills", input.skills);
      formData.append("avaliability", input.avaliability);
      formData.append("experienceYears", input.experienceYears);

      if (input.file) {
        formData.append("file", input.file);
      }

      const res = await axios.post(
        `${WORKER_API_END_POINT}/register`,
        formData,
        {
          withCredentials: true,
        },
      );

      if (res?.data?.success) {
        dispatch(setSingleWorker(res.data.worker));
        toast.success(res.data.message);
        navigate("/admin/workers");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div>
      <Navbar />
      <div className="max-w-4xl mx-auto">
        <div className="my-2">
          <Label>Full Name</Label>
          <Input name="fullname" onChange={changeEventHandler} />
        </div>
        <div className="my-2">
          <Label>Phone Number</Label>
          <Input name="phoneNumber" onChange={changeEventHandler} />
        </div>
        <div className="my-2">
          <Label>Password</Label>
          <Input
            type="password"
            name="password"
            onChange={changeEventHandler}
          />
        </div>
        <div className="my-2">
          <Label>Address</Label>
          <Input name="address" onChange={changeEventHandler} />
        </div>
        <div className="my-2">
          <Label>City</Label>
          <Input name="city" onChange={changeEventHandler} />
        </div>
        <div className="my-2">
          <Label>Pincode</Label>
          <Input name="pincode" onChange={changeEventHandler} />
        </div>
        <div className="my-2">
          <Label>Skills</Label>
          <Input
            name="skills"
            placeholder="e.g. Cooking, Plumbing"
            onChange={changeEventHandler}
          />
        </div>
        <div className="my-2">
          <Label>Availability</Label>
          <Input
            name="avaliability"
            placeholder="Full-time / Part-time"
            onChange={changeEventHandler}
          />
        </div>
        <div className="my-2">
          <Label>Experience (Years)</Label>
          <Input
            type="number"
            name="experienceYears"
            onChange={changeEventHandler}
          />
        </div>
        <div className="my-2">
          <Label>Profile Photo</Label>
          <Input
            type="file"
            accept="image/*"
            //name="profilePhoto"
            onChange={changeFileHandler}
          />
        </div>
        <div className="flex items-center gap-2 my-10">
          <Button variant="outline" onClick={() => navigate("/admin/workers")}>
            Cancel
          </Button>
          <Button onClick={registerNewWorker}>Continue</Button>
        </div>
      </div>
    </div>
  );
};

export default WorkerCreate;
