import React, { useEffect } from "react";
import Navbar from "./shared/Navbar";
import Worker from "./Worker";
import Footer from "./shared/Footer";
import { useDispatch, useSelector } from "react-redux";
import { setSearchQuery } from "../redux/workSlice";
import useGetAllWorkersForBrowse from "../hooks/useGetAllWorkersForBrowse";

const Browse = () => {
  const { allWorkers } = useSelector((store) => store.work);
  const dispatch = useDispatch();
  useGetAllWorkersForBrowse();

  /*useEffect(() => {
    dispatch(setSearchQuery(""));
  }, []);*/

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto my-10">
        <h1 className="font-bold text-xl my-10">
          Search Results ({allWorkers.length})
        </h1>
        <div className="grid grid-cols-3 gap-4">
          {allWorkers.map((worker) => {
            return <Worker key={worker._id} worker={worker} />;
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Browse;
