import React, { useEffect } from "react";
import { WORKER_API_END_POINT } from "../utils/constant";
import { useDispatch } from "react-redux";
import { setAllWorkers } from "../redux/workSlice";
import axios from "axios";

const useGetAllWorkers = () => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchAllWorkers = async () => {
      try {
        const res = await axios.get(`${WORKER_API_END_POINT}/getAllWorkers`, {
          withCredentials: true,
        });
        if (res.data.success) {
          dispatch(setAllWorkers(res.data.workers));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllWorkers();
  }, []);
};

export default useGetAllWorkers;
