import React, { useEffect } from "react";
import { WORKER_API_END_POINT } from "../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setAllWorkers } from "../redux/workSlice";

const useGetAllWorkersForBrowse = () => {
  const dispatch = useDispatch();
  const { searchQuery } = useSelector((store) => store.work);

  useEffect(() => {
    const fetchAllWorkersForBrowse = async () => {
      try {
        const res = await axios.get(
          `${WORKER_API_END_POINT}/getAllWorkersForBrowse?keyword=${searchQuery}`,
          { withCredentials: true },
        );
        if (res.data.success) {
          dispatch(setAllWorkers(res.data.workers));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllWorkersForBrowse();
  }, [searchQuery]);
};

export default useGetAllWorkersForBrowse;
