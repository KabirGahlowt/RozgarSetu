import React, { useEffect } from "react";
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
        const res = await axios.get(`${APPLICATION_API_END_POINT}/worker/requests`, { withCredentials: true });
        dispatch(setAllApplicants(res.data.requests));
      } catch (error) {
        console.log(error);
      }
    };
    fetchAllClients();
  }, [dispatch]);

  return (
    <div className="rs-glass-strong rs-anim rs-anim-d1" style={{ borderRadius: "1.5rem", padding: "1.5rem", marginTop: "1.5rem" }}>
      <h2 style={{ margin: "0 0 1rem", fontFamily: "var(--rs-font)", fontSize: "1.05rem", fontWeight: 600, color: "#fff" }}>
        Clients <span style={{ color: "var(--rs-saffron)" }}>({applicants?.length || 0})</span>
      </h2>
      <ClientsTable />
    </div>
  );
};

export default ClientsWantingToHire;
