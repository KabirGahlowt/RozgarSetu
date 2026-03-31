import axios from "axios";
import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { APPLICATION_API_END_POINT } from "../utils/constant";
import { setClientHires } from "../redux/applicationSlice";

const useGetClientHires = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    const fetchHires = async () => {
      try {
        const res = await axios.get(
          `${APPLICATION_API_END_POINT}/client/hires`,
          { withCredentials: true },
        );
        if (res.data.success) {
          dispatch(setClientHires(res.data.hires));
        }
      } catch (error) {
        console.log(error);
      }
    };
    fetchHires();
  }, [dispatch]);
};

export default useGetClientHires;
