import React, { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { APPLICATION_API_END_POINT } from "../../utils/constant";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";

const NotificationBell = () => {
  const [requests, setRequests] = useState([]);
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const prevIdsRef = useRef(new Set());
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  const fetchRequests = async () => {
    try {
      const res = await axios.get(`${APPLICATION_API_END_POINT}/worker/requests`, {
        withCredentials: true,
      });
      if (res.data.success) {
        const incoming = res.data.requests;
        const incomingIds = new Set(incoming.map((r) => r._id));

        // Detect new requests since last poll
        const newOnes = incoming.filter((r) => !prevIdsRef.current.has(r._id));
        if (newOnes.length > 0 && prevIdsRef.current.size > 0) {
          // Audio ping
          try {
            const ctx = new (window.AudioContext || window.webkitAudioContext)();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.frequency.value = 880;
            gain.gain.setValueAtTime(0.3, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
            osc.start(ctx.currentTime);
            osc.stop(ctx.currentTime + 0.45);
          } catch (_) {}

          // Browser notification
          if (Notification.permission === "granted") {
            const n = new Notification("New Hire Request! 🔔", {
              body: `${newOnes[0]?.client?.fullname || "A client"} wants to hire you!`,
              icon: "/favicon.ico",
            });
            // Clicking the browser notification goes straight to profile
            n.onclick = () => {
              window.focus();
              navigate("/worker/profile");
            };
          }

          setUnreadCount((prev) => prev + newOnes.length);
        }

        prevIdsRef.current = incomingIds;
        setRequests(incoming);
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (Notification.permission === "default") {
      Notification.requestPermission();
    }
    fetchRequests();
    const interval = setInterval(fetchRequests, 15000);
    return () => clearInterval(interval);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleBellClick = () => {
    setOpen((prev) => !prev);
    setUnreadCount(0);
  };

  // Clicking a notification row → go to worker profile (ClientsTable is there)
  const handleNotificationClick = () => {
    setOpen(false);
    navigate("/worker/profile");
  };

  const pendingRequests = requests.filter((r) => r.status === "Pending");

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={handleBellClick}
        className="relative p-2 rounded-full hover:bg-gray-100 transition-colors"
        aria-label="Notifications"
      >
        <Bell size={22} className="text-gray-700" />

        {/* Red pulsing badge for new unseen requests */}
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}

        {/* Purple badge showing pending count when no unread */}
        {unreadCount === 0 && pendingRequests.length > 0 && (
          <span className="absolute -top-1 -right-1 bg-[#6A38C2] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-bold">
            {pendingRequests.length > 9 ? "9+" : pendingRequests.length}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b bg-gray-50 flex items-center justify-between">
            <div>
              <h3 className="font-bold text-sm">Hire Requests</h3>
              <p className="text-xs text-gray-500">
                {requests.length} total · {pendingRequests.length} pending
              </p>
            </div>
            <button
              onClick={handleNotificationClick}
              className="text-xs text-[#6A38C2] font-semibold hover:underline"
            >
              View All →
            </button>
          </div>

          {/* Request List */}
          <div className="max-h-80 overflow-y-auto divide-y">
            {requests.length === 0 ? (
              <p className="text-center text-gray-400 text-sm py-6">No requests yet</p>
            ) : (
              requests.slice(0, 15).map((req) => (
                <div
                  key={req._id}
                  onClick={req.status === "Pending" ? handleNotificationClick : undefined}
                  className={`flex items-center gap-3 px-4 py-3 transition-colors ${
                    req.status === "Pending"
                      ? "cursor-pointer hover:bg-purple-50"
                      : "hover:bg-gray-50"
                  }`}
                >
                  <Avatar className="h-9 w-9 shrink-0">
                    <AvatarImage src={req.client?.profilePhoto} />
                    <AvatarFallback>{req.client?.fullname?.[0] || "?"}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{req.client?.fullname}</p>
                    <p className="text-xs text-gray-400">{req.createdAt?.split("T")[0]}</p>
                    {req.status === "Pending" && (
                      <p className="text-xs text-[#6A38C2] font-medium">Tap to Accept/Reject →</p>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                      req.status === "Accepted"
                        ? "bg-green-100 text-green-700"
                        : req.status === "Rejected"
                        ? "bg-red-100 text-red-700"
                        : req.status === "Completed"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                    }`}
                  >
                    {req.status}
                  </span>
                </div>
              ))
            )}
          </div>

          <div className="px-4 py-2 bg-gray-50 border-t text-center">
            <p className="text-xs text-gray-400">Refreshes every 15s</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationBell;
