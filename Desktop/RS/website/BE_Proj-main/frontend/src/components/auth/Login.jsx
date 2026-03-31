import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Button } from "../ui/button";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  USER_API_END_POINT,
  ADMIN_API_END_POINT,
  WORKER_API_END_POINT,
} from "../../utils/constant";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "../../redux/authSlice";
import store from "../../redux/store";
import { Loader2 } from "lucide-react";
import Footer from "../shared/Footer";
import { setSingleWorker } from "../../redux/workSlice";

const Login = () => {
  const [input, setInput] = useState({
    email: "",
    phoneNumber: "",
    password: "",
    role: "",
  });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

  const changeEventHandler = (e) => {
    setInput({ ...input, [e.target.name]: e.target.value }); //gets all the values entered
  };

  const submitHandler = async (e) => {
    e.preventDefault();

    try {
      dispatch(setLoading(true));

      let API = "";
      if (input.role === "Client") {
        API = USER_API_END_POINT;
      } else if (input.role === "admin") {
        API = ADMIN_API_END_POINT;
      } else if (input.role === "Worker") {
        API = WORKER_API_END_POINT;
      }

      const res = await axios.post(`${API}/login`, input, {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      });

      if (res.data.success) {
        let loggedInUser;
        if (input.role === "admin") {
          loggedInUser = { ...res.data.admin, role: "admin" };
          navigate("/");
        } else if (input.role === "Worker") {
          loggedInUser = { ...res.data.worker, role: "Worker" };
        } else {
          loggedInUser = { ...res.data.user, role: "Client" };
        }
        dispatch(setUser(loggedInUser));
        dispatch(setSingleWorker(null));

        if (input.role === "Worker") {
          navigate("/worker/profile");
        } else {
          navigate("/");
        }
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      dispatch(setLoading(false));
    }
  };

  //To prevent an already logged in user to go to the login page through URL and login again
  useEffect(() => {
    dispatch(setLoading(false)); // Emergency safety override: Never persist loading screen
    if (user) {
      if (user.role === "Worker") {
        navigate("/worker/profile");
      } else if (user.role === "admin") {
        navigate("/");
      } else {
        navigate("/");
      }
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
          <h1 className="font-bold text-xl mb-5">Log in</h1>

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
              <div className="flex items-center gap-3">
                <Input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={input.role === "admin"}
                  onChange={changeEventHandler}
                  className="cursor-pointer"
                />
                <Label htmlFor="r2">Admin</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="my-2">
            <Label>{input.role === "Worker" ? "Phone Number" : "Email"}</Label>
            <Input
              type="text"
              name={input.role === "Worker" ? "phoneNumber" : "email"}
              value={input.role === "Worker" ? input.phoneNumber : input.email}
              onChange={changeEventHandler}
              placeholder={
                input.role === "Worker"
                  ? "Enter your phone number"
                  : "Enter your Email"
              }
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

          {loading ? (
            <Button className="w-full my-4">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Please Wait
            </Button>
          ) : (
            <Button type="submit" className="w-full my-4">
              Login
            </Button>
          )}

          <span className="text-sm">
            Don't have an account?{" "}
            <Link to="/signup" className="text-blue-600">
              Sign Up
            </Link>
          </span>
        </form>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
