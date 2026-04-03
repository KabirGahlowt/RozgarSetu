import React, { useEffect } from "react";
import { WORKER_API_END_POINT } from "../utils/constant";
import { useDispatch } from "react-redux";
import { setAllWorkers, setSingleWorker } from "../redux/workSlice";
import axios from "axios";

const useGetWorkerById = (workerId) => {
  const dispatch = useDispatch();
  useEffect(() => {
    const fetchSingleWorker = async () => {
      try {
        const res = await axios.get(
          `${WORKER_API_END_POINT}/getWorkerById/${workerId}`,
          {
            withCredentials: true,
          },
        );
        if (res.data.success) {
          dispatch(setSingleWorker(res.data.worker));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchSingleWorker();
  }, [workerId, dispatch]);
};

export default useGetWorkerById;
