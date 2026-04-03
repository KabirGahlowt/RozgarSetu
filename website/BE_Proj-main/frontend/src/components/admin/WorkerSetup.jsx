import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Button } from "../ui/button";
import { ArrowLeft } from "lucide-react";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import axios from "axios";
import { WORKER_API_END_POINT } from "../../utils/constant";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useSelector } from "react-redux";
import useGetWorkerById from "../../hooks/useGetWorkerById";

const WorkerSetup = () => {
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

  const { singleWorker } = useSelector((store) => store.work);
  const navigate = useNavigate();

  const params = useParams();
  useGetWorkerById(params.id);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const changeFileHandler = (e) => {
    const file = e.target.files?.[0];
    setInput({ ...input, file });
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    //console.log(input);
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

    try {
      const res = await axios.put(
        `${WORKER_API_END_POINT}/profile/update/${params.id}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          withCredentials: true,
        },
      );
      if (res.data.success) {
        toast.success(res.data.message);
        navigate("/admin/workers");
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.message);
    }
  };

  useEffect(() => {
    if (singleWorker) {
      setInput({
        fullname: singleWorker.fullname || "",
        phoneNumber: singleWorker.phoneNumber || "",
        address: singleWorker.address || "",
        city: singleWorker.city || "",
        pincode: singleWorker.pincode || "",
        skills: singleWorker.skills || "",
        avaliability: singleWorker.avaliability || "",
        experienceYears: singleWorker.experienceYears || "",
        file: singleWorker.file || null,
      });
    }
  }, [singleWorker]);

  return (
    <div>
      <Navbar />
      <div className="max-w-xl mx-auto my-10">
        <form onSubmit={submitHandler}>
          <div className="flex items-center gap-5 p-8">
            <Button
              variant="outline"
              className="flex items-center gap-2 text-gray-500 font-semibold"
              onClick={() => navigate("/admin/workers")}
            >
              <ArrowLeft />
              <span>Back</span>
            </Button>
            <h1 className="font-bold text-xl">Edit Worker Details</h1>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Full name</Label>
              <Input
                type="text"
                name="fullname"
                value={input.fullname}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input
                name="phoneNumber"
                value={input.phoneNumber}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Password</Label>
              <Input
                type="password"
                name="password"
                value={input.password}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Address</Label>
              <Input
                type="text"
                name="address"
                value={input.address}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>City</Label>
              <Input
                type="text"
                name="city"
                value={input.city}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Pincode</Label>
              <Input
                name="pincode"
                value={input.pincode}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Skill</Label>
              <Input
                type="text"
                name="skills"
                value={input.skills}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Avaliability</Label>
              <Input
                type="text"
                name="avaliability"
                value={input.avaliability}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Years of Experience</Label>
              <Input
                type="text"
                name="experienceYears"
                value={input.experienceYears}
                onChange={changeEventHandler}
              />
            </div>
            <div>
              <Label>Profile Photo</Label>
              <Input
                type="file"
                accept="image/*"
                //name="profilePhoto"
                onChange={changeFileHandler}
              />
            </div>
          </div>
          <Button type="submit" className="w-full mt-8">
            Update Details
          </Button>
        </form>
      </div>
    </div>
  );
};

export default WorkerSetup;
