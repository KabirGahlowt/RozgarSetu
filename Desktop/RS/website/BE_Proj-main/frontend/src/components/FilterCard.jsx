import React from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";

const filterData = [
  {
    filterType: "Location",
    array: [
      "Bopodi",
      "Baner Road",
      "Aundh Gaon",
      "Wakad Hinjewadi Road",
      "Kothrud Depot",
    ],
  },
  {
    filterType: "Skill",
    array: ["Cook", "Housekeeping", "Gardener", "Electrician", "Mechanic"],
  },
  {
    filterType: "Avaliability",
    array: ["Full-time", "Part-time", "On-demand"],
  },
];

const FilterCard = () => {
  return (
    <div className="w-full bg-white p-3 rounded-md">
      <h1 className="font-bold text-lg">Filter Workers</h1>
      <hr className="mt-3" />
      <RadioGroup>
        {filterData.map((data, index) => (
          <div>
            <h1 className="font-bold text-lg">{data.filterType}</h1>
            {data.array.map((item, index) => {
              return (
                <div className="flex item-center space-x-2 my-2">
                  <RadioGroupItem value={item} />
                  <Label>{item}</Label>
                </div>
              );
            })}
          </div>
        ))}
      </RadioGroup>
    </div>
  );
};

export default FilterCard;
