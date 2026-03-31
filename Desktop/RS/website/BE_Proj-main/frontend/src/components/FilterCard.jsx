import React, { useEffect, useState } from "react";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Label } from "./ui/label";
import { useDispatch } from "react-redux";
import { setSearchQuery } from "../redux/workSlice";

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
  const [selectedValue, setSelectedValue] = useState("");
  const dispatch = useDispatch();

  const changeHandler = (value) => {
    setSelectedValue(value);
  };

  useEffect(() => {
    dispatch(setSearchQuery(selectedValue));
  }, [selectedValue]);

  return (
    <div className="w-full bg-white p-3 rounded-md">
      <h1 className="font-bold text-lg">Filter Workers</h1>
      <hr className="mt-3" />
      <RadioGroup value={selectedValue} onValueChange={changeHandler}>
        {filterData.map((data, index) => (
          <div>
            <h1 className="font-bold text-lg">{data.filterType}</h1>
            {data.array.map((item, idx) => {
              const itemId = `id${index} - ${idx}`;
              return (
                <div className="flex item-center space-x-2 my-2">
                  <RadioGroupItem value={item} id={itemId} />
                  <Label htmlFor={itemId}>{item}</Label>
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
