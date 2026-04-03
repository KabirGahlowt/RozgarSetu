import React from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, User2 } from "lucide-react";
import { useDispatch, useSelector } from "react-redux";
import { toast } from "sonner";
import axios from "axios";
import {
  USER_API_END_POINT,
  ADMIN_API_END_POINT,
  WORKER_API_END_POINT,
} from "../../utils/constant";
import { setUser } from "../../redux/authSlice";
import NotificationBell from "../worker/NotificationBell";

const Navbar = () => {
  //const user = true;
  const { user } = useSelector((store) => store.auth);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandler = async () => {
    try {
      let API = "";
      if (user.role === "admin") {
        API = ADMIN_API_END_POINT;
      } else if (user.role === "Worker") {
        API = WORKER_API_END_POINT;
      } else {
        API = USER_API_END_POINT;
      }
      const res = await axios.get(`${API}/logout`, {
        withCredentials: true,
      });
      if (res.data.success) {
        dispatch(setUser(null));
        navigate("/login");
        toast.success(res.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response?.data?.message);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0,
      zIndex: 50,
      background: 'rgba(2,8,30,0.55)',
      backdropFilter: 'blur(20px)',
      WebkitBackdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,153,51,0.15)',
      boxShadow: '0 2px 32px rgba(0,0,0,0.3)'
    }}>
      <div className="rs-nav-inner flex items-center justify-between mx-auto max-w-7xl h-16 px-4">
        <div className="rs-nav-left">
          <h1 style={{ fontFamily: "'Poppins',sans-serif", fontSize: '1.4rem', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
            <span style={{ color: '#FF9933' }}>Rozgar</span><span style={{ color: '#6ee87b' }}>Setu</span>
          </h1>
        </div>
        <div className="rs-nav-right flex items-center gap-3 md:gap-8 min-w-0">
          <ul className="rs-navbar-links" style={{ display: 'flex', alignItems: 'center', gap: '1.4rem', listStyle: 'none', margin: 0, padding: 0 }}>
              {/* ── Guest (not logged in) ── */}
              {!user && (
                <>
                  <li><Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#FF9933'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.8)'}>Home</Link></li>
                  <li><Link to="/workers" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }} onMouseEnter={e=>e.target.style.color='#FF9933'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.8)'}>Browse Workers</Link></li>
                </>
              )}
              {/* ── Admin ── */}
              {user && user.role === "admin" && (
                <>
                  <li><Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#FF9933'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.8)'}>Home</Link></li>
                  <li><Link to="/admin/dashboard" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }} onMouseEnter={e=>e.target.style.color='#FF9933'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.8)'}>Dashboard</Link></li>
                </>
              )}
              {/* ── Worker ── */}
              {user && user.role === "Worker" && (
                <>
                  <li><Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500, transition: 'color 0.2s' }} onMouseEnter={e=>e.target.style.color='#FF9933'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.8)'}>Home</Link></li>
                  <li>
                    <Link to="/worker/profile" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }} onMouseEnter={e=>e.target.style.color='#FF9933'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.8)'}>Profile</Link>
                  </li>
                </>
              )}
              {/* ── Client ── */}
              {user && user.role === "Client" && (
                <>
                  <li><Link to="/" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }} onMouseEnter={e=>e.target.style.color='#FF9933'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.8)'}>Home</Link></li>
                  <li><Link to="/workers" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }} onMouseEnter={e=>e.target.style.color='#FF9933'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.8)'}>Workers</Link></li>
                  <li><Link to="/history" style={{ color: 'rgba(255,255,255,0.8)', textDecoration: 'none', fontSize: '0.88rem', fontWeight: 500 }} onMouseEnter={e=>e.target.style.color='#FF9933'} onMouseLeave={e=>e.target.style.color='rgba(255,255,255,0.8)'}>History</Link></li>
                </>
              )}
          </ul>

          {!user ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <Link to="/login">
                <button style={{
                  padding: '0.45rem 1.2rem',
                  borderRadius: '999px',
                  background: 'rgba(255,255,255,0.08)',
                  border: '1px solid rgba(255,153,51,0.35)',
                  color: '#fff',
                  fontSize: '0.84rem',
                  fontWeight: 500,
                  cursor: 'pointer',
                  fontFamily: "'Poppins',sans-serif",
                  backdropFilter: 'blur(8px)',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e=>{e.target.style.background='rgba(255,153,51,0.2)'; e.target.style.borderColor='#FF9933';}}
                onMouseLeave={e=>{e.target.style.background='rgba(255,255,255,0.08)'; e.target.style.borderColor='rgba(255,153,51,0.35)';}}>
                  Login
                </button>
              </Link>
              <Link to="/signup">
                <button style={{
                  padding: '0.45rem 1.2rem',
                  borderRadius: '999px',
                  background: 'linear-gradient(135deg,#FF9933,#e8650a)',
                  border: 'none',
                  color: '#fff',
                  fontSize: '0.84rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  fontFamily: "'Poppins',sans-serif",
                  transition: 'all 0.2s'
                }}
                onMouseEnter={e=>e.target.style.opacity='0.9'}
                onMouseLeave={e=>e.target.style.opacity='1'}>
                  Sign Up
                </button>
              </Link>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 ml-auto">
              {user.role === "Worker" && <NotificationBell />}
              <Popover>
              <PopoverTrigger asChild>
                <Avatar className="cursor-pointer ring-2 ring-transparent hover:ring-[rgba(255,153,51,0.45)] transition-[box-shadow]">
                  <AvatarImage src={user?.profilePhoto} alt="@shadcn" />
                  <AvatarFallback className="bg-[rgba(255,153,51,0.2)] text-[#FF9933]">{user?.fullname?.[0] || "U"}</AvatarFallback>
                </Avatar>
              </PopoverTrigger>
              <PopoverContent
                className="w-80 border border-[rgba(255,153,51,0.25)] bg-[rgba(2,8,30,0.92)] backdrop-blur-xl text-white shadow-[0_12px_40px_rgba(0,0,0,0.5)] p-0 overflow-hidden"
                align="end"
              >
                <div className="px-4 pt-4 pb-3 border-b border-[rgba(255,153,51,0.12)] bg-gradient-to-br from-[rgba(255,153,51,0.08)] to-transparent">
                  <div className="flex gap-3 items-start">
                    <Avatar className="h-12 w-12 shrink-0 border-2 border-[rgba(255,153,51,0.35)]">
                      <AvatarImage src={user?.profilePhoto} alt="" />
                      <AvatarFallback className="bg-[rgba(255,153,51,0.15)] text-[#FF9933] font-semibold">{user?.fullname?.[0] || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-semibold text-[0.95rem] text-white truncate" style={{ fontFamily: "'Poppins',sans-serif" }}>{user?.fullname}</h4>
                      <p className="text-xs text-[rgba(255,255,255,0.5)] mt-0.5 line-clamp-2" style={{ fontFamily: "'Poppins',sans-serif" }}>
                        {user?.address || (user?.role === "Worker" ? "Worker account" : user?.role === "admin" ? "Administrator" : "Client account")}
                      </p>
                      {user?.role && (
                        <span className="inline-block mt-1.5 text-[0.65rem] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full bg-[rgba(19,136,8,0.15)] text-[#6ee87b] border border-[rgba(19,136,8,0.25)]">
                          {user.role === "Worker" ? "Worker" : user.role === "admin" ? "Admin" : "Client"}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col py-1 px-2">
                  {user && user.role === "Client" && (
                    <div className="flex items-center rounded-lg hover:bg-[rgba(255,153,51,0.08)] transition-colors">
                      <User2 className="ml-2 h-4 w-4 text-[#FF9933]" />
                      <Button variant="link" className="justify-start text-white hover:text-[#FF9933] hover:no-underline flex-1" asChild>
                        <Link to="/profile">Profile</Link>
                      </Button>
                    </div>
                  )}
                  <div className="flex items-center rounded-lg hover:bg-[rgba(255,153,51,0.08)] transition-colors">
                    <LogOut className="ml-2 h-4 w-4 text-[rgba(255,255,255,0.55)]" />
                    <Button onClick={logoutHandler} variant="link" className="justify-start text-[rgba(255,255,255,0.85)] hover:text-[#FF9933] hover:no-underline flex-1">
                      Logout
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Navbar;
