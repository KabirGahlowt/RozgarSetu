import { useState } from "react";
import "./App.css";
import Navbar from "./components/shared/Navbar";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Singup";
import Home from "./components/Home";
import Workers from "./components/Workers";
import Browse from "./components/Browse";
import Profile from "./components/Profile";
import WorkerDescription from "./components/WorkerDescription";
import AdminWorkers from "./components/admin/AdminWorkers";
import WorkerCreate from "./components/admin/WorkerCreate";
import WorkerSetup from "./components/admin/WorkerSetup";
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
    path: "/browse",
    element: <Browse />,
  },
  {
    path: "/profile",
    element: <Profile />,
  },

  // Admin paths start from here

  {
    path: "/admin/workers",
    element: (
      <ProtectedRoute>
        <AdminWorkers />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/workers/create",
    element: (
      <ProtectedRoute>
        <WorkerCreate />
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin/workers/:id",
    element: (
      <ProtectedRoute>
        <WorkerSetup />
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
