import React, { useEffect, useState } from "react";
import Navbar from "../shared/Navbar";
import axios from "axios";
import { ADMIN_API_END_POINT } from "../../utils/constant";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Star } from "lucide-react";
import { Badge } from "../ui/badge";

const Panel = ({ title, children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm">
    <h2 className="font-bold text-lg mb-4 text-[#6A38C2] border-b pb-2">{title}</h2>
    {children}
  </div>
);

const StarRating = ({ rating, size = 14 }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map((s) => (
      <Star
        key={s}
        size={size}
        className={s <= Math.round(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}
      />
    ))}
    <span className="text-xs text-gray-500 ml-1">({rating?.toFixed(1) || "0.0"})</span>
  </div>
);

const AdminDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const res = await axios.get(`${ADMIN_API_END_POINT}/dashboard`, {
          withCredentials: true,
        });
        if (res.data.success) setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDashboard();
  }, []);

  if (loading) return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto my-10 text-center text-gray-500">Loading dashboard...</div>
    </div>
  );

  return (
    <div>
      <Navbar />
      <div className="max-w-7xl mx-auto my-8 px-4">
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Panel 1: Recently Registered Workers */}
          <Panel title="🔧 Recently Registered Workers">
            {data?.recentWorkers?.length === 0 ? (
              <p className="text-gray-400 text-sm">No workers yet.</p>
            ) : (
              <div className="space-y-3">
                {data?.recentWorkers?.map((w) => (
                  <div key={w._id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={w.profilePhoto} />
                      <AvatarFallback>{w.fullname?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{w.fullname}</p>
                      <p className="text-xs text-gray-500">{w.skills} · {w.city}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(w.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Panel 2: Recently Registered Clients */}
          <Panel title="👤 Recently Registered Clients">
            {data?.recentClients?.length === 0 ? (
              <p className="text-gray-400 text-sm">No clients yet.</p>
            ) : (
              <div className="space-y-3">
                {data?.recentClients?.map((c) => (
                  <div key={c._id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={c.profilePhoto} />
                      <AvatarFallback>{c.fullname?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <p className="font-medium text-sm">{c.fullname}</p>
                      <p className="text-xs text-gray-500">{c.email} · {c.phoneNumber}</p>
                    </div>
                    <span className="text-xs text-gray-400">{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Panel 3: Hire History */}
          <Panel title="📋 Recent Hire Activity">
            {data?.hireHistory?.length === 0 ? (
              <p className="text-gray-400 text-sm">No hire requests yet.</p>
            ) : (
              <div className="space-y-3">
                {data?.hireHistory?.map((h) => (
                  <div key={h._id} className="flex items-center gap-3">
                    <Avatar className="h-9 w-9">
                      <AvatarImage src={h.client?.profilePhoto} />
                      <AvatarFallback>{h.client?.fullname?.[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-sm">
                      <span className="font-medium">{h.client?.fullname}</span>
                      <span className="text-gray-400 mx-2">→</span>
                      <span className="font-medium">{h.worker?.fullname}</span>
                      <span className="text-xs text-gray-400 ml-1">({h.worker?.skills})</span>
                    </div>
                    <Badge
                      variant="outline"
                      className={`text-xs ${
                        h.status === "Accepted"
                          ? "bg-green-50 text-green-700 border-green-500"
                          : h.status === "Rejected"
                          ? "bg-red-50 text-red-700 border-red-500"
                          : "bg-gray-50 text-gray-600 border-gray-400"
                      }`}
                    >
                      {h.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Panel>

          {/* Panel 4: Least Rated Workers */}
          <Panel title="⚠️ Least Rated Workers">
            {data?.leastRated?.length === 0 ? (
              <p className="text-gray-400 text-sm">No rated workers yet.</p>
            ) : (
              <div className="space-y-4">
                {data?.leastRated?.map((w) => (
                  <div key={w._id} className="border border-gray-100 rounded-xl p-3">
                    <div className="flex items-center gap-3 mb-2">
                      <Avatar className="h-9 w-9">
                        <AvatarImage src={w.profilePhoto} />
                        <AvatarFallback>{w.fullname?.[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-sm">{w.fullname}</p>
                        <StarRating rating={w.avgRating} />
                      </div>
                    </div>
                    <div className="space-y-2 pl-1">
                      {w.reviews?.slice(0, 2).map((r) => (
                        <div key={r._id} className="text-xs bg-gray-50 rounded-lg p-2">
                          <div className="flex items-center gap-2 mb-1">
                            <Avatar className="h-5 w-5">
                              <AvatarImage src={r.client?.profilePhoto} />
                              <AvatarFallback>{r.client?.fullname?.[0]}</AvatarFallback>
                            </Avatar>
                            <span className="font-medium">{r.client?.fullname}</span>
                            <StarRating rating={r.rating} size={11} />
                          </div>
                          {r.comment && <p className="text-gray-500 italic">"{r.comment}"</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
