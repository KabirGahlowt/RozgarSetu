import { useState } from "react";
import "./App.css";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Singup";
import Home from "./components/Home";
import Workers from "./components/Workers";
import History from "./components/History";
import Profile from "./components/Profile";
import WorkerDescription from "./components/WorkerDescription";
import AdminDashboard from "./components/admin/AdminDashboard";
import AdminClientProfile from "./components/admin/AdminClientProfile";
import WorkerProfile from "./components/worker/WorkerProfile";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AssistantPage from "./components/AssistantPage";
import ChatBot from "./components/ChatBot";
import { useSelector } from "react-redux";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/signup",
    element: <Signup />,
  },
  {
    path: "/assistant",
    element: <AssistantPage />,
  },
  {
    path: "/workers",
    element: <Workers />,
  },
  {
    path: "/description/:id",
    element: <WorkerDescription />,
  },
  {
    path: "/history",
    element: <History />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },

  // Admin paths
  {
    path: "/admin/dashboard",
    element: (
      <ProtectedRoute>
        <AdminDashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/client/:id",
    element: (
      <ProtectedRoute>
        <AdminClientProfile />
      </ProtectedRoute>
    ),
  },

  // Worker paths start from here

  {
    path: "/worker/profile",
    element: <WorkerProfile />,
  },
]);

function App() {
  const [count, setCount] = useState(0);
  const pathname = typeof window !== "undefined" ? window.location.pathname : "/";
  const { user } = useSelector((store) => store.auth);

  const isGuest = !user;
  const hideChatBot =
    isGuest ||
    pathname === "/assistant" ||
    pathname === "/login" ||
    pathname === "/signup";

  return (
    <>
      <RouterProvider router={appRouter} />
      {!hideChatBot && <ChatBot />}
    </>
  );
}

export default App;
