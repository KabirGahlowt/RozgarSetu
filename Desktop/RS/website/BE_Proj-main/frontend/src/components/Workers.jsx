import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import FilterCard from "./FilterCard";
import Worker from "./Worker";
import Footer from "./shared/Footer";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import useGetAllWorkersForBrowse from "../hooks/useGetAllWorkersForBrowse";

//const workersArray = [1, 2, 3, 4, 5, 6, 7, 8];

const Workers = () => {
  const { allWorkers, searchQuery } = useSelector((store) => store.work);
  useGetAllWorkersForBrowse();
  const [filterWorker, setFilterWorker] = useState(allWorkers);

  useEffect(() => {
    if (searchQuery) {
      const filteredWorkers = allWorkers.filter((worker) => {
        return (
          worker.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
          worker.skills.toLowerCase().includes(searchQuery.toLowerCase()) ||
          worker.avaliability.toLowerCase().includes(searchQuery.toLowerCase())
        );
      });
      setFilterWorker(filteredWorkers);
    } else {
      setFilterWorker(allWorkers);
    }
  }, [allWorkers, searchQuery]);

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto mt-5">
        <div className="flex gap-5">
          <div className="w-20%">
            <FilterCard />
          </div>
          {filterWorker.length <= 0 ? (
            <span>Workers not found</span>
          ) : (
            <div className="flex-1 h-[88vh] overflow-y-auto pb-5">
              <div className="grid grid-cols-3 gap-4">
                {filterWorker.map((worker) => (
                  <motion.div
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ duration: 0.3 }}
                    key={worker?._id}
                  >
                    <Worker worker={worker} />
                  </motion.div>
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
