import React from "react";
import TopWorkerCard from "./TopWorkerCard";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const randomWorkers = [1, 2, 3, 4, 5, 6, 7, 8];

const LatestJobs = () => {
  const { allWorkers } = useSelector((store) => store.work);
  const navigate = useNavigate();
  return (
    <div className="max-w-7xl mx-auto my-20">
      <h1 className="text-4xl font-bold text-[#6A38C2]">Top Rated Workers</h1>
      <div className="grid grid-cols-3 gap-4 my-5">
        {allWorkers.length <= 0 ? (
          <span>No workers avaliable</span>
        ) : (
          allWorkers
            ?.slice(0, 6)
            .map((worker) => <TopWorkerCard key={worker._id} worker={worker} />)
        )}
      </div>
    </div>
  );
};

export default LatestJobs;
