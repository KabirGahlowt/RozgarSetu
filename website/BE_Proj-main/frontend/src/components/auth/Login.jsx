import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import {
  USER_API_END_POINT, ADMIN_API_END_POINT, WORKER_API_END_POINT,
} from "../../utils/constant";
import { toast } from "sonner";
import { useDispatch, useSelector } from "react-redux";
import { setLoading, setUser } from "../../redux/authSlice";
import { Loader2, LogIn, Mail, Phone, Lock, UserCircle2, Briefcase, Shield } from "lucide-react";
import Footer from "../shared/Footer";
import { setSingleWorker } from "../../redux/workSlice";

const ROLE_OPTIONS = [
  { value: "Client", label: "Client", icon: UserCircle2, desc: "Hire workers" },
  { value: "Worker", label: "Worker", icon: Briefcase, desc: "Find jobs" },
  { value: "admin",  label: "Admin",  icon: Shield,      desc: "Manage platform" },
];

const Login = () => {
  const [input, setInput] = useState({ email: "", phoneNumber: "", password: "", role: "" });
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { loading, user } = useSelector((store) => store.auth);

  const changeEventHandler = (e) =>
    setInput({ ...input, [e.target.name]: e.target.value });

  const submitHandler = async (e) => {
    e.preventDefault();
    if (!input.role) { toast.error("Please select a role"); return; }
    try {
      dispatch(setLoading(true));
      let API = input.role === "Client" ? USER_API_END_POINT
               : input.role === "admin"  ? ADMIN_API_END_POINT
               : WORKER_API_END_POINT;
      const res = await axios.post(`${API}/login`, input, {
        headers: { "Content-Type": "application/json" }, withCredentials: true,
      });
      if (res.data.success) {
        let loggedInUser;
        if (input.role === "admin")  loggedInUser = { ...res.data.admin, role: "admin" };
        else if (input.role === "Worker") loggedInUser = { ...res.data.worker, role: "Worker" };
        else loggedInUser = { ...res.data.user, role: "Client" };
        dispatch(setUser(loggedInUser));
        dispatch(setSingleWorker(null));
        navigate(input.role === "Worker" ? "/worker/profile" : "/");
        toast.success(res.data.message);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Something went wrong!");
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    dispatch(setLoading(false));
    if (user) navigate(user.role === "Worker" ? "/worker/profile" : "/");
  }, []);

  return (
    <div className="rs-page">
      <div className="rs-tricolor" />
      <Navbar />
      <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "2rem 1rem" }}>
        <div className="rs-glass-strong rs-anim" style={{ width: "min(440px, 96vw)", padding: "2.5rem", borderRadius: "1.5rem" }}>

          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "2rem" }}>
            <h1 style={{ fontFamily: "var(--rs-font)", fontSize: "1.75rem", fontWeight: 700, color: "#fff", margin: "0 0 0.4rem" }}>
              Welcome <span style={{ color: "var(--rs-saffron)" }}>Back</span>
            </h1>
            <p style={{ color: "var(--rs-text-muted)", fontSize: "0.85rem", margin: 0 }}>Sign in to continue to RozgarSetu</p>
          </div>

          <form onSubmit={submitHandler}>
            {/* Role selector cards */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label className="rs-label">Sign in as</label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0.5rem" }}>
                {ROLE_OPTIONS.map(({ value, label, icon: Icon, desc }) => (
                  <button
                    key={value} type="button"
                    onClick={() => setInput({ ...input, role: value })}
                    style={{
                      display: "flex", flexDirection: "column", alignItems: "center", gap: "0.3rem",
                      padding: "0.75rem 0.5rem", borderRadius: "0.75rem", cursor: "pointer",
                      border: input.role === value ? "1.5px solid #FF9933" : "1px solid rgba(255,255,255,0.1)",
                      background: input.role === value ? "rgba(255,153,51,0.14)" : "rgba(255,255,255,0.04)",
                      color: input.role === value ? "#FF9933" : "rgba(255,255,255,0.65)",
                      transition: "all 0.18s ease", fontFamily: "var(--rs-font)",
                    }}
                  >
                    <Icon size={18} />
                    <span style={{ fontSize: "0.78rem", fontWeight: 600 }}>{label}</span>
                    <span style={{ fontSize: "0.65rem", opacity: 0.7 }}>{desc}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Email / Phone */}
            <div style={{ marginBottom: "1rem" }}>
              <label className="rs-label">{input.role === "Worker" ? "Phone Number" : "Email"}</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--rs-text-muted)", display: "flex" }}>
                  {input.role === "Worker" ? <Phone size={15} /> : <Mail size={15} />}
                </span>
                <input
                  className="rs-input" style={{ paddingLeft: "2.4rem" }}
                  type="text"
                  name={input.role === "Worker" ? "phoneNumber" : "email"}
                  value={input.role === "Worker" ? input.phoneNumber : input.email}
                  onChange={changeEventHandler}
                  placeholder={input.role === "Worker" ? "Enter phone number" : "Enter your email"}
                />
              </div>
            </div>

            {/* Password */}
            <div style={{ marginBottom: "1.5rem" }}>
              <label className="rs-label">Password</label>
              <div style={{ position: "relative" }}>
                <span style={{ position: "absolute", left: "0.85rem", top: "50%", transform: "translateY(-50%)", color: "var(--rs-text-muted)", display: "flex" }}>
                  <Lock size={15} />
                </span>
                <input
                  className="rs-input" style={{ paddingLeft: "2.4rem" }}
                  type="password" name="password" value={input.password}
                  onChange={changeEventHandler} placeholder="Enter your password"
                />
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit" className="rs-btn-primary"
              style={{ width: "100%", padding: "0.8rem", fontSize: "0.95rem", marginBottom: "1rem", justifyContent: "center" }}
              disabled={loading}
            >
              {loading ? <><Loader2 size={16} style={{ animation: "spin 1s linear infinite" }} /> Please wait…</> : <><LogIn size={16} /> Login</>}
            </button>

            {/* Divider */}
            <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "1rem" }}>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
              <span style={{ fontSize: "0.75rem", color: "var(--rs-text-muted)" }}>or</span>
              <div style={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.1)" }} />
            </div>

            {/* Sign Up CTA */}
            <Link to="/signup" style={{ textDecoration: "none" }}>
              <button
                type="button"
                style={{
                  width: "100%", padding: "0.75rem", borderRadius: "999px",
                  border: "1.5px solid rgba(255,153,51,0.4)", background: "transparent",
                  color: "#FF9933", fontSize: "0.9rem", fontWeight: 600,
                  fontFamily: "var(--rs-font)", cursor: "pointer",
                  transition: "all 0.2s", marginBottom: "0.75rem",
                }}
                onMouseEnter={(e) => { e.target.style.background = "rgba(255,153,51,0.1)"; e.target.style.borderColor = "#FF9933"; }}
                onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.borderColor = "rgba(255,153,51,0.4)"; }}
              >
                Create New Account →
              </button>
            </Link>

            <p style={{ textAlign: "center", fontSize: "0.78rem", color: "var(--rs-text-muted)", margin: 0 }}>
              Don't have an account?{" "}
              <Link to="/signup" style={{ color: "var(--rs-saffron)", fontWeight: 600, textDecoration: "none" }}>Sign Up</Link>
            </p>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default Login;
