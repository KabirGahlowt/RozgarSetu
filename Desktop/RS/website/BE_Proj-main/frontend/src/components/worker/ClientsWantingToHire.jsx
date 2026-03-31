import React, { useEffect } from "react";
import Navbar from "../shared/Navbar";
import ClientsTable from "./ClientsTable";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "../../utils/constant";
import { useDispatch, useSelector } from "react-redux";
import { setAllApplicants } from "../../redux/applicationSlice";

const ClientsWantingToHire = () => {
  const dispatch = useDispatch();
  const { applicants } = useSelector((store) => store.application);

  useEffect(() => {
    const fetchAllClients = async () => {
      try {
        const res = await axios.get(
          `${APPLICATION_API_END_POINT}/worker/requests`,
          { withCredentials: true },
        );
        dispatch(setAllApplicants(res.data.requests));
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllClients();
  }, []);
  return (
    <div>
      <div className="max-w-7xl mx-auto">
        <h1 className="font-bold text-xl my-5">
          Clients: {applicants?.length || 0}
        </h1>
        <ClientsTable />
      </div>
    </div>
  );
};

export default ClientsWantingToHire;
