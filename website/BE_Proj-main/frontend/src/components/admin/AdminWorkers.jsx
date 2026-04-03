import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import WorkersTable from "./WorkersTable";
import { useNavigate } from "react-router-dom";
import useGetAllWorkers from "../../hooks/useGetAllWorkers";
import { useDispatch } from "react-redux";
import { setSearchWorkerByText } from "../../redux/workSlice";

const AdminWorkers = () => {
  useGetAllWorkers();
  const [input, setInput] = useState("");
  const navigate = useNavigate();
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(setSearchWorkerByText(input));
  }, [input]);

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto my-10">
        <div className="flex items-center justify-between">
          <Input
            className="w-fit"
            placeholder="Filter by name"
            onChange={(e) => setInput(e.target.value)}
          />
          <Button onClick={() => navigate("/admin/workers/create")}>
            New Worker
          </Button>
        </div>
        <WorkersTable />
      </div>
    </div>
  );
};

export default AdminWorkers;
