import { Search, MapPin } from "lucide-react";
import React, { useState } from "react";
import { Button } from "./ui/button";
import { useDispatch } from "react-redux";
import { setSearchQuery } from "../redux/workSlice";
import { useNavigate } from "react-router-dom";

const HeroSection = () => {
  const [skill, setSkill] = useState("");
  const [location, setLocation] = useState("");
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const searchWorkerHandler = () => {
    const combined = [skill, location].filter(Boolean).join(" ");
    dispatch(setSearchQuery(combined));
    navigate("/workers");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") searchWorkerHandler();
  };

  return (
    <div className="text-center">
      <div className="flex flex-col gap-5 my-10">
        <h1 className="text-5xl font-bold">
          Connecting hands to opportunities
        </h1>
        <span className="mx-auto px-4 py-2 rounded-full bg-gray-100 text-[#6A38C2] font-medium">
          Find skilled workers near you for all your needs. A modern, inclusive,
          and multilingual gig portal
        </span>
        <p>
          Search by skill or location to find the right worker for you.
        </p>
        <div className="flex w-[60%] shadow-lg border border-gray-200 rounded-full items-center gap-0 mx-auto overflow-hidden">
          <div className="flex items-center gap-2 flex-1 pl-4 border-r border-gray-200">
            <Search className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Skill (e.g. Cook, Electrician)"
              value={skill}
              onChange={(e) => setSkill(e.target.value)}
              onKeyDown={handleKeyDown}
              className="outline-none border-none w-full py-3 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 flex-1 pl-4">
            <MapPin className="h-4 w-4 text-gray-400 shrink-0" />
            <input
              type="text"
              placeholder="Location (e.g. Hinjewadi, Pune)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onKeyDown={handleKeyDown}
              className="outline-none border-none w-full py-3 text-sm"
            />
          </div>
          <Button
            onClick={searchWorkerHandler}
            className="rounded-r-full rounded-l-none bg-[#6A38C2] px-6 h-full py-3"
          >
            <Search className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default HeroSection;
