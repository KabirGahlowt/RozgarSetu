import React from "react";
import Navbar from "./shared/navbar";
import FilterCard from "./FilterCard";
import Worker from "./Worker";
import Footer from "./shared/Footer";
import { useSelector } from "react-redux";

const workersArray = [1, 2, 3, 4, 5, 6, 7, 8];

const Workers = () => {
  const { allWorkers } = useSelector((store) => store.work);
  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto mt-5">
        <div className="flex gap-5">
          <div className="w-20%">
            <FilterCard />
          </div>
          {allWorkers.length <= 0 ? (
            <span>Workers not found</span>
          ) : (
            <div className="flex-1 h-[88vh] overflow-y-auto pb-5">
              <div className="grid grid-cols-3 gap-4">
                {allWorkers.map((worker) => (
                  <div key={worker?._id}>
                    <Worker worker={worker} />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Workers;
