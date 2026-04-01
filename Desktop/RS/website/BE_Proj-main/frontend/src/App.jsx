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
import WorkerProfile from "./components/worker/WorkerProfile";
import ProtectedRoute from "./components/admin/ProtectedRoute";
import AssistantPage from "./components/AssistantPage";
import ChatBot from "./components/ChatBot";

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

  // Worker paths start from here

  {
    path: "/worker/profile",
    element: <WorkerProfile />,
  },
]);

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <RouterProvider router={appRouter} />
      <ChatBot />
    </>
  );
}

export default App;
