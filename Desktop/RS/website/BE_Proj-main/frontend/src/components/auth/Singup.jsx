import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import { USER_API_END_POINT } from "../../utils/constant";
import { toast } from "sonner";
import axios from "axios";
import { useDispatch, useSelector } from "react-redux";
import store from "../../redux/store";
import { setLoading } from "../../redux/authSlice";
import { Loader2 } from "lucide-react";

const Singup = () => {
  const [input, setInput] = useState({
    fullname: "",
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
    city: "",
    pincode: "",
    file: "",
  });

  const navigate = useNavigate();
  const { loading, user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value }); //gets all the values entered
  };

  const changeFileHandler = (e) => {
    setInput({ ...input, file: e.target.files?.[0] }); //gets the profile photo uploaded
  };

  const submitHandler = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("fullname", input.fullname);
    if (input.email) {
      formData.append("email", input.email);
    }
    formData.append("phoneNumber", input.phoneNumber);
    formData.append("password", input.password);
    if (input.role) {
      formData.append("role", input.role);
    }
    if (input.file) {
      formData.append("file", input.file);
    }
    formData.append("city", input.city);
    formData.append("pincode", input.pincode);

    try {
      dispatch(setLoading(true));
      const res = await axios.post(`${USER_API_END_POINT}/register`, formData, {
        // Let axios set the correct multipart boundary automatically
        withCredentials: true,
      });

      if (res.data.success) {
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "An error occurred during signup");
    } finally {
      dispatch(setLoading(false));
    }
  };

  //To prevent an already logged in user to go to the signup page through URL and sign in
  useEffect(() => {
    dispatch(setLoading(false)); // Stop LocalStorage persistence bug
    if (user) {
      navigate("/");
    }
  }, []);

  return (
    <div>
      <Navbar />

      <div className="flex items-center justify-center max-w-7xl mx-auto">
        <form
          onSubmit={submitHandler}
          className="w-1/2 border border-gray-200 rounded-md p-4 my-10"
        >
          <h1 className="font-bold text-xl mb-5">Sign Up</h1>
          <div className="my-2">
            <Label>Full Name</Label>
            <Input
              type="text"
              value={input.fullname}
              name="fullname"
              onChange={changeEventHandler}
              placeholder="Enter your full name"
            />
          </div>

          <div className="my-2">
            <Label>Email</Label>
            <Input
              type="email"
              value={input.email}
              name="email"
              onChange={changeEventHandler}
              placeholder="Enter your email"
            />
          </div>

          <div className="my-2">
            <Label>Phone Number</Label>
            <Input
              type="text"
              value={input.phoneNumber}
              name="phoneNumber"
              onChange={changeEventHandler}
              placeholder="Enter your phone number"
            />
          </div>

          <div className="my-2">
            <Label>City</Label>
            <Input
              type="text"
              value={input.city}
              name="city"
              onChange={changeEventHandler}
              placeholder="Enter your city"
            />
          </div>

          <div className="my-2">
            <Label>Pincode</Label>
            <Input
              type="text"
              value={input.pincode}
              name="pincode"
              onChange={changeEventHandler}
              placeholder="Enter your pincode"
            />
          </div>

          <div className="my-2">
            <Label>Password</Label>
            <Input
              type="password"
              value={input.password}
              name="password"
              onChange={changeEventHandler}
              placeholder="Enter your password"
            />
          </div>

          <div className="flex items-center justify-between">
            <RadioGroup
              defaultValue="comfortable"
              className="flex items-center gap-4 my-5"
            >
              <div className="flex items-center gap-3">
                <Input
                  type="radio"
                  name="role"
                  value="Client"
                  checked={input.role === "Client"}
                  onChange={changeEventHandler}
                  className="cursor-pointer"
                />
                <Label htmlFor="r1">Client</Label>
              </div>
              <div className="flex items-center gap-3">
                <Input
                  type="radio"
                  name="role"
                  value="Worker"
                  checked={input.role === "Worker"}
                  onChange={changeEventHandler}
                  className="cursor-pointer"
                />
                <Label htmlFor="r2">Worker</Label>
              </div>
            </RadioGroup>
            <div className="flex items-center gap-2">
              <Label>Profile</Label>
              <Input
                accept="image/*"
                type="file"
                onChange={changeFileHandler}
                className="cursor-pointer"
              />
            </div>
          </div>
          {loading ? (
            <Button className="w-full my-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please Wait
            </Button>
          ) : (
            <Button type="submit" className="w-full my-4">
              Sign In
            </Button>
          )}
          <span className="text-sm">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600">
              Login
            </Link>
          </span>
        </form>
      </div>
    </div>
  );
};

export default Singup;
