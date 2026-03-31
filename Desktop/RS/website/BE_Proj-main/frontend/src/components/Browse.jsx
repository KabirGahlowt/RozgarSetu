import React from "react";
import Navbar from "./shared/navbar";
import Worker from "./Worker";
import Footer from "./shared/Footer";

const randomWorkers = [1, 2, 3, 4, 5, 6];

const Browse = () => {
  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto my-10">
        <h1 className="font-bold text-xl my-10">
          Search Results ({randomWorkers.length})
        </h1>
        <div className="grid grid-cols-3 gap-4">
          {randomWorkers.map((items, index) => {
            return <Worker />;
          })}
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Browse;
